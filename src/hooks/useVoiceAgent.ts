'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { VoiceState, Message } from '@/types';
import { speakSentence, stopSpeaking } from '@/lib/tts';

interface UseVoiceAgentOptions {
    scenarioId: string;
    onSentence?: (sentence: string) => void;
}

interface UseVoiceAgentReturn {
    voiceState: VoiceState;
    isConnected: boolean;
    messages: Message[];
    currentTranscript: string;
    agentResponse: string;
    latency: number | null;
    error: string | null;
    isMuted: boolean;
    startConversation: () => void;
    stopConversation: () => void;
    toggleMute: () => void;
    interrupt: () => void;
}

/**
 * Custom hook for managing the voice agent connection and state.
 * Handles Socket.io connection, audio recording, and voice pipeline coordination.
 */
export function useVoiceAgent({ scenarioId, onSentence }: UseVoiceAgentOptions): UseVoiceAgentReturn {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [agentResponse, setAgentResponse] = useState('');
    const [latency, setLatency] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const isRecordingRef = useRef(false);
    const isMutedRef = useRef(false);
    const sessionIdRef = useRef<string | null>(null);
    const agentResponseRef = useRef('');
    const onSentenceRef = useRef(onSentence);

    // Keep ref updated
    onSentenceRef.current = onSentence;

    // ─── Socket Connection ────────────────────────────────
    useEffect(() => {
        const socket = io({
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
            setError('Unable to connect to server. Please try again.');
        });

        // Session events
        socket.on('session:created', ({ sessionId }: { sessionId: string }) => {
            sessionIdRef.current = sessionId;
            console.log('[Session] Created:', sessionId);
        });

        // Voice state changes
        socket.on('state:change', ({ state }: { state: VoiceState }) => {
            setVoiceState(state);
        });

        // Transcript events
        socket.on('transcript:partial', ({ text }: { text: string }) => {
            setCurrentTranscript(text);
        });

        socket.on('transcript:final', ({ text }: { text: string }) => {
            setCurrentTranscript('');
            const msg: Message = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: text,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('response:start', () => {
            agentResponseRef.current = '';
            setAgentResponse('');
            // Clear partial transcripts so they don't flicker during speech
            setCurrentTranscript('');
            // Tell server to ignore transcripts during agent speech (prevents echo)
            socket.emit('agent:speaking', { speaking: true });
            setVoiceState('speaking');
        });

        socket.on('response:chunk', ({ text }: { text: string }) => {
            agentResponseRef.current += text;
            setAgentResponse(agentResponseRef.current);
        });

        socket.on('response:end', ({ fullText, latencyMs: lms }: { fullText: string; latencyMs: number }) => {
            const msg: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: fullText,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, msg]);
            setAgentResponse('');
            agentResponseRef.current = '';
            setLatency(lms);
            // Wait for TTS to finish speaking before switching back to listening
            const waitForTTS = () => {
                if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
                    setTimeout(waitForTTS, 200);
                } else {
                    // Add a 2s echo buffer - the mic picks up residual speaker audio
                    // even after speechSynthesis reports done
                    setTimeout(() => {
                        socketRef.current?.emit('agent:speaking', { speaking: false });
                        setVoiceState('listening');
                    }, 2000);
                }
            };
            // Small delay to let the last sentence start playing
            setTimeout(waitForTTS, 500);
        });

        // TTS sentence events
        socket.on('tts:sentence', ({ text }: { text: string }) => {
            // Speak the sentence aloud using Web Speech API
            speakSentence(text);
            if (onSentenceRef.current) {
                onSentenceRef.current(text);
            }
        });

        // Error events
        socket.on('error', ({ message }: { message: string }) => {
            console.error('[Socket] Error:', message);
            setError(message);
            // Reset mute state so user can speak again after an error
            isMutedRef.current = false;
            setIsMuted(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // ─── Start Conversation ───────────────────────────────
    const startConversation = useCallback(async () => {
        if (!socketRef.current?.connected) {
            setError('Not connected to server.');
            return;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            mediaStreamRef.current = stream;

            // Create audio context for processing
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            // Using ScriptProcessor (deprecated but widely supported)
            // Buffer size 4096 gives us ~256ms chunks at 16kHz
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            // Start session first (sends greeting)
            socketRef.current.emit('session:start', { scenarioId });



            // Wait for greeting to be spoken via TTS, then start audio stream
            setTimeout(() => {
                if (!socketRef.current) return;

                // Tell server to ignore transcripts during greeting TTS
                socketRef.current.emit('agent:speaking', { speaking: true });

                socketRef.current.emit('audio:start', {
                    scenarioId,
                    sessionId: sessionIdRef.current || '',
                });

                processor.onaudioprocess = (e) => {
                    if (!isRecordingRef.current) return;
                    // Always send audio to keep Deepgram connection alive
                    // User mute only prevents local processing, not the stream

                    const inputData = e.inputBuffer.getChannelData(0);
                    // Convert float32 to int16 (Linear16 PCM)
                    const int16Data = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                    }

                    socketRef.current?.emit('audio:chunk', {
                        audio: int16Data.buffer,
                    });
                };

                source.connect(processor);
                processor.connect(audioContext.destination);
                isRecordingRef.current = true;
            }, 500);

            setVoiceState('listening');
            setError(null);
        } catch (err) {
            console.error('[Audio] Microphone error:', err);
            setError('Microphone access denied. Please allow microphone permissions.');
            setVoiceState('error');
        }
    }, [scenarioId]);

    // ─── Stop Conversation ────────────────────────────────
    const stopConversation = useCallback(() => {
        isRecordingRef.current = false;

        // Stop audio processing
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        // Stop any ongoing speech
        stopSpeaking();

        // Notify server
        socketRef.current?.emit('audio:stop');
        socketRef.current?.emit('session:end');

        setVoiceState('idle');
        setCurrentTranscript('');
        setAgentResponse('');
        sessionIdRef.current = null;
    }, []);

    // ─── Interrupt ────────────────────────────────────────
    const interrupt = useCallback(() => {
        socketRef.current?.emit('interrupt');
        // Stop TTS playback
        stopSpeaking();
        setCurrentTranscript('');
        isMutedRef.current = false;
        setIsMuted(false);
        setVoiceState('listening');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return {
        voiceState,
        isConnected,
        messages,
        currentTranscript,
        agentResponse,
        latency,
        error,
        isMuted,
        startConversation,
        stopConversation,
        toggleMute: () => setIsMuted((prev) => !prev),
        interrupt,
    };
}
