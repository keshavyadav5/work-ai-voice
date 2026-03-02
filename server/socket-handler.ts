import { Socket } from 'socket.io';
import { getScenario, isValidScenario } from '../src/lib/scenarios';
import { sessionManager } from '../src/lib/session';
import { streamLLMResponse } from '../src/lib/voice/llm';
import { transcribeAudioStream, DeepgramConnection } from './stt';

/**
 * Handle a new socket connection.
 * Manages the full voice pipeline: audio → STT → LLM → response text
 * (TTS happens client-side via Web Speech API for lowest latency)
 */
export function handleSocketConnection(socket: Socket): void {
    let currentSessionId: string | null = null;
    let deepgramConnection: DeepgramConnection | null = null;
    let currentAbortController: AbortController | null = null;
    let responseStartTime: number | null = null;
    let isAgentSpeaking = false;

    // ─── Session Start ───────────────────────────────────────
    socket.on('session:start', ({ scenarioId }: { scenarioId: string }) => {
        if (!isValidScenario(scenarioId)) {
            socket.emit('error', { message: `Invalid scenario: ${scenarioId}` });
            return;
        }

        // Create new session
        const sessionId = `session-${socket.id}-${Date.now()}`;
        currentSessionId = sessionId;
        sessionManager.createSession(sessionId, scenarioId);

        // Send greeting
        const scenario = getScenario(scenarioId)!;
        sessionManager.addMessage(sessionId, 'assistant', scenario.greeting);

        socket.emit('session:created', { sessionId });
        socket.emit('response:start');
        socket.emit('response:chunk', { text: scenario.greeting });
        socket.emit('tts:sentence', { text: scenario.greeting });
        socket.emit('response:end', { fullText: scenario.greeting, latencyMs: 0 });

        console.log(`[Session] Created: ${sessionId} | Scenario: ${scenarioId}`);
    });

    // ─── Agent Speaking State ────────────────────────────────
    socket.on('agent:speaking', ({ speaking }: { speaking: boolean }) => {
        isAgentSpeaking = speaking;
        console.log(`[Agent] Speaking: ${speaking}`);
    });

    // ─── Audio Streaming Start ───────────────────────────────
    socket.on('audio:start', ({ scenarioId }: { scenarioId: string; sessionId: string }) => {
        if (!currentSessionId) {
            socket.emit('error', { message: 'No active session. Start a session first.' });
            return;
        }

        socket.emit('state:change', { state: 'listening' });
        responseStartTime = Date.now();

        // Initialize Deepgram streaming connection
        deepgramConnection = transcribeAudioStream({
            onTranscriptPartial: (text: string) => {
                socket.emit('transcript:partial', { text });
            },
            onTranscriptFinal: (text: string) => {
                if (!text.trim() || !currentSessionId) return;

                // Ignore transcripts while agent is speaking (echo prevention)
                if (isAgentSpeaking) {
                    console.log(`[STT] Ignoring transcript during agent speech: "${text}"`);
                    return;
                }

                console.log(`[STT] Final transcript: "${text}"`);
                socket.emit('transcript:final', { text });

                // Add user message to session
                sessionManager.addMessage(currentSessionId, 'user', text);

                // Get scenario for system prompt
                const session = sessionManager.getSession(currentSessionId);
                if (!session) return;

                const scenario = getScenario(session.scenarioId);
                if (!scenario) return;

                // Switch to processing state
                socket.emit('state:change', { state: 'processing' });

                // Cancel any previous response in flight
                if (currentAbortController) {
                    currentAbortController.abort();
                }
                currentAbortController = new AbortController();

                // Get conversation history and stream LLM response
                const messages = sessionManager.getGroqMessages(currentSessionId, scenario.systemPrompt);

                socket.emit('response:start');

                const sid = currentSessionId; // Capture for closure

                streamLLMResponse(
                    messages,
                    // onChunk
                    (chunk: string) => {
                        socket.emit('response:chunk', { text: chunk });
                    },
                    // onSentence
                    (sentence: string) => {
                        // Emit complete sentences for client-side TTS
                        socket.emit('tts:sentence', { text: sentence });
                    },
                    // onComplete
                    (fullText: string) => {
                        let cleanText = fullText;

                        // Parse hidden DATA tags: [DATA:{"key": "value"}]
                        const dataRegex = /\[DATA:(.*?)\]/g;
                        let match;
                        const extractedData: Record<string, string> = {};

                        while ((match = dataRegex.exec(fullText)) !== null) {
                            try {
                                const data = JSON.parse(match[1]);
                                Object.assign(extractedData, data);
                            } catch (e) {
                                console.error('[LLM] Failed to parse data tag:', match[1]);
                            }
                        }

                        // Update session data if any found
                        if (Object.keys(extractedData).length > 0) {
                            console.log('[Session] Extracted Data:', extractedData);
                            sessionManager.updateData(sid, extractedData);
                            // Emit update to client if they want to update UI real-time
                            socket.emit('session:update', { capturedData: sessionManager.getSession(sid)?.capturedData });
                        }

                        // Clean the text for history (remove the data tags)
                        cleanText = fullText.replace(dataRegex, '').trim();

                        sessionManager.addMessage(sid, 'assistant', cleanText);
                        const latencyMs = responseStartTime ? Date.now() - responseStartTime : 0;

                        // Record latency for summary page analytics
                        sessionManager.addLatencyRecord(sid, latencyMs);

                        socket.emit('response:end', { fullText: cleanText, latencyMs });
                        socket.emit('state:change', { state: 'listening' });
                        console.log(`[LLM] Response complete (${latencyMs}ms): "${cleanText.substring(0, 80)}..."`);
                    },
                    currentAbortController.signal
                ).catch((error: Error) => {
                    console.error('[LLM] Error:', error.message);
                    socket.emit('error', { message: 'Failed to generate response. Please try again.' });
                    socket.emit('response:end', { fullText: '', latencyMs: 0 });
                    socket.emit('state:change', { state: 'listening' });
                });
            },
            onError: (error: string) => {
                console.error('[STT] Error:', error);
                socket.emit('error', { message: 'Speech recognition error. Please try again.' });
            },
        });
    });

    // ─── Audio Chunks ────────────────────────────────────────
    socket.on('audio:chunk', ({ audio }: { audio: ArrayBuffer }) => {
        if (deepgramConnection) {
            deepgramConnection.send(audio);
        }
    });

    // ─── Audio Stop ──────────────────────────────────────────
    socket.on('audio:stop', () => {
        if (deepgramConnection) {
            deepgramConnection.close();
            deepgramConnection = null;
        }
        socket.emit('state:change', { state: 'idle' });
    });

    // ─── Interruption (Barge-in) ─────────────────────────────
    socket.on('interrupt', () => {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        socket.emit('state:change', { state: 'listening' });
        console.log(`[Interrupt] User interrupted response`);
    });

    // ─── Session End ─────────────────────────────────────────
    socket.on('session:end', () => {
        cleanup();
        console.log(`[Session] Ended: ${currentSessionId}`);
    });

    // ─── Disconnect ──────────────────────────────────────────
    socket.on('disconnect', () => {
        cleanup();
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    function cleanup() {
        if (deepgramConnection) {
            deepgramConnection.close();
            deepgramConnection = null;
        }
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        if (currentSessionId) {
            sessionManager.endSession(currentSessionId);
            currentSessionId = null;
        }
    }
}
