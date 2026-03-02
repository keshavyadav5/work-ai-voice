'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import VoiceOrb from '@/components/VoiceOrb';
import TranscriptPanel from '@/components/TranscriptPanel';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { VoiceState, Message } from '@/types';

const scenarioConfig: Record<string, { name: string; systemPrompt: string }> = {
    'calling-agent': {
        name: 'CALLING AGENT',
        systemPrompt:
            'You are a professional calling agent for a business. You handle outbound calls for appointment scheduling, follow-ups, and confirmations. Be polite, efficient, and conversational.',
    },
    'customer-support': {
        name: 'CUSTOMER SUPPORT',
        systemPrompt:
            'You are a customer support agent. Provide empathetic, helpful support for customer inquiries. Be patient, understanding, and solution-oriented.',
    },
    'technical-assistant': {
        name: 'TECH ASSISTANT',
        systemPrompt:
            'You are a technical assistant specializing in database queries and DevOps operations. Provide clear, accurate technical guidance.',
    },
};

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const scenarioId = params.scenarioId as string;
    const scenario = scenarioConfig[scenarioId] || scenarioConfig['calling-agent'];

    const {
        voiceState,
        messages,
        currentTranscript,
        agentResponse,
        startConversation,
        stopConversation: stop,
        isMuted,
        toggleMute,
        latency,
    } = useVoiceAgent({ scenarioId });

    const handleStop = async () => {
        await stop();
        setTimeout(() => {
            router.push(`/summary/${scenarioId}`);
        }, 1500);
    };

    const isActive = voiceState !== 'idle' && voiceState !== 'error';

    const handleOrbClick = useCallback(() => {
        if (voiceState === 'idle' || voiceState === 'error') {
            startConversation();
        }
    }, [voiceState, startConversation]);

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-black">
            <div className="layout-container flex h-full grow flex-col max-w-[1440px] mx-auto w-full p-4 md:p-8 gap-6">
                {/* ─── TOP NAV BLOCK ────────────────────────── */}
                <header className="bento-card w-full rounded-full bg-surface-glass h-20 flex items-center justify-between px-6 shadow-brutal z-20 sticky top-4">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="group flex items-center gap-2 bg-transparent hover:bg-white/5 rounded-full pr-6 pl-2 py-2 transition-all"
                    >
                        <div className="bg-primary text-black rounded-full p-2 flex items-center justify-center shadow-glow-green group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-xl font-black">arrow_back</span>
                        </div>
                        <span className="text-white font-black tracking-widest text-sm hidden sm:block">BACK</span>
                    </button>

                    {/* Center Status Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 px-6 py-2 rounded-full backdrop-blur-md">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-blue-400/50'}`} />
                        <span className="text-blue-100 font-bold tracking-widest text-xs uppercase">{scenario.name}</span>
                    </div>

                    {/* Right Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-surface-dark/80 px-4 py-2 rounded-full border border-white/5">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse shadow-[0_0_10px_#39FF14]' : 'bg-red-500'}`} />
                            <span className="text-white font-bold tracking-wider text-xs whitespace-nowrap">
                                {isActive ? 'CONNECTED' : 'OFFLINE'}
                            </span>
                            {isActive && latency !== null && latency > 0 && (
                                <>
                                    <span className="text-white/40 text-[10px] font-mono mx-1">●</span>
                                    <span className="text-primary font-mono text-xs font-bold">{(latency ?? 0)}ms</span>
                                </>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center" title="Network Strength">
                            <span className={`material-symbols-outlined text-sm ${isActive ? 'text-primary' : 'text-red-500'}`}>
                                {isActive ? 'wifi' : 'wifi_off'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* ─── MAIN BENTO GRID ──────────────────────── */}
                <main className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 flex-1 h-full min-h-[600px]">
                    {/* ─── LEFT COLUMN ────────────────────────── */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        {/* Scenario Block */}
                        <div className="bento-card bg-accent-blue/20 hover:bg-accent-blue/30 rounded-lg p-6 flex flex-col justify-between h-48 border border-accent-blue/20 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-blue/40 rounded-full blur-2xl group-hover:bg-accent-blue/60 transition-all" />
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-blue-200 text-3xl mb-4">support_agent</span>
                                <h3 className="text-blue-300 text-xs font-black tracking-widest mb-1">SCENARIO</h3>
                                <p className="text-white text-xl font-bold leading-tight">
                                    {scenario.name.split(' ').map((w, i) => (
                                        <span key={i}>{w}<br /></span>
                                    ))}
                                </p>
                            </div>
                            <div className="relative z-10 w-full bg-accent-blue/20 h-1 mt-4 rounded-full overflow-hidden">
                                <div className={`h-full bg-blue-400 transition-all duration-1000 ${isActive ? 'w-2/3' : 'w-0'}`} />
                            </div>
                        </div>

                        {/* Latency Block */}
                        <div className="bento-card bg-primary/10 hover:bg-primary/20 rounded-lg p-6 flex flex-col justify-center items-center h-40 border border-primary/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-primary/60 text-xs font-black tracking-widest mb-2 relative z-10">LATENCY</h3>
                            <p className="text-primary text-4xl font-black tracking-tighter relative z-10 drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                                {latency !== null ? latency : '—'}
                                <span className="text-xl align-top ml-1">ms</span>
                            </p>
                            <div className="flex gap-1 mt-3 h-3 items-end">
                                <div className="w-1 bg-primary/30 h-1 rounded-sm" />
                                <div className="w-1 bg-primary/50 h-2 rounded-sm" />
                                <div className="w-1 bg-primary h-3 rounded-sm" />
                                <div className="w-1 bg-primary/50 h-2 rounded-sm" />
                                <div className="w-1 bg-primary/30 h-1 rounded-sm" />
                            </div>
                        </div>

                        {/* Session Block */}
                        <div className="bento-card bg-surface-dark rounded-lg p-6 flex-1 min-h-[140px] border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-gray-500 text-xs font-black tracking-widest mb-1">SESSION ID</h3>
                                    <p className="text-white font-mono text-sm opacity-80">#{scenarioId.slice(0, 6).toUpperCase()}</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-600">info</span>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-gray-300">ENCRYPTED</div>
                                <div className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-gray-300">HD VOICE</div>
                            </div>
                        </div>
                    </div>

                    {/* ─── CENTER COLUMN (Spans 2 cols) ────────── */}
                    <div className="md:col-span-2 flex flex-col gap-6 h-full">
                        {/* Orb Area */}
                        <div className="bento-card bg-surface-dark/90 rounded-lg flex flex-col items-center justify-center relative overflow-hidden flex-1 min-h-[400px] shadow-2xl border border-white/5">
                            {/* Background Grid */}
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }}
                            />

                            <VoiceOrb state={voiceState} onClick={handleOrbClick} />
                        </div>

                        {/* Transcript Block */}
                        <div className="bento-card bg-surface-dark/60 rounded-lg p-4 flex-1 overflow-y-auto max-h-[300px] border border-white/5 shadow-inner">
                            <TranscriptPanel
                                messages={messages}
                                currentTranscript={currentTranscript}
                                agentResponse={agentResponse}
                                isProcessing={voiceState === 'processing'}
                            />
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN ───────────────────────── */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        {/* End/Start Call Block */}
                        {isActive ? (
                            <button
                                onClick={handleStop}
                                className="bento-card w-full bg-danger hover:bg-red-600 rounded-lg p-6 flex flex-col items-center justify-center h-40 border border-red-400/30 group transition-all shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)]"
                            >
                                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-3xl">call_end</span>
                                </div>
                                <span className="text-white font-black tracking-widest text-sm">END CALL</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleOrbClick}
                                className="bento-card w-full bg-primary hover:bg-primary/80 rounded-lg p-6 flex flex-col items-center justify-center h-40 border border-primary/30 group transition-all shadow-[0_10px_30px_-10px_rgba(57,255,20,0.5)]"
                            >
                                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-3xl">call</span>
                                </div>
                                <span className="text-black font-black tracking-widest text-sm">START CALL</span>
                            </button>
                        )}

                        {/* Mute Block */}
                        <button
                            onClick={toggleMute}
                            className="bento-card w-full bg-surface-dark hover:bg-white/5 rounded-lg p-6 flex items-center justify-between h-24 border border-white/5 group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-gray-400 text-xs font-black tracking-widest mb-1 group-hover:text-white">MICROPHONE</span>
                                <span className="text-white font-bold text-lg">{isMuted ? 'OFF' : 'ON'}</span>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-primary group-hover:text-black'}`}>
                                <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                            </div>
                        </button>

                        {/* Settings Block */}
                        <button className="bento-card w-full bg-surface-dark hover:bg-white/5 rounded-lg p-6 flex items-center justify-between h-24 border border-white/5 group">
                            <div className="flex flex-col items-start">
                                <span className="text-gray-400 text-xs font-black tracking-widest mb-1 group-hover:text-white">SETTINGS</span>
                                <span className="text-white font-bold text-lg">AUDIO</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                                <span className="material-symbols-outlined text-xl">settings</span>
                            </div>
                        </button>

                        {/* Keypad Block */}
                        <button className="bento-card w-full bg-surface-dark hover:bg-white/5 rounded-lg p-6 flex items-center justify-between h-24 border border-white/5 group">
                            <div className="flex flex-col items-start">
                                <span className="text-gray-400 text-xs font-black tracking-widest mb-1 group-hover:text-white">KEYPAD</span>
                                <span className="text-white font-bold text-lg">DTMF</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">dialpad</span>
                            </div>
                        </button>

                        {/* Agent Persona Block */}
                        <div className="bento-card w-full bg-surface-dark rounded-lg p-5 flex flex-col gap-3 border border-white/5 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-accent-blue text-xl">support_agent</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Persona</p>
                                    <p className="text-sm font-bold text-white">Professional / Calm</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Sentiment Analysis</span>
                                <span className="text-primary">85% Positive</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="material-symbols-outlined text-gray-500 text-sm">memory</span>
                                <span className="text-gray-500 font-bold text-xs tracking-widest uppercase">GROQ · LLAMA 3</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
