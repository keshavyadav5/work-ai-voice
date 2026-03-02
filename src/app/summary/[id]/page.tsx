'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ConversationSession } from '@/types';

interface ExtendedSession extends ConversationSession {
    scenarioName: string;
    companyName: string;
    companyBrand: string;
    requiredFields: string[];
}

export default function CallSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [session, setSession] = useState<ExtendedSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/session/${id}`);
                if (!response.ok) throw new Error('Session not found');
                const data = await response.json();
                setSession(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSession();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Session...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Oops!</h1>
                    <p className="text-slate-400 mb-8">{error || 'Session not found. It might have expired.'}</p>
                    <Link href="/" className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-full shadow-glow-green">Back Home</Link>
                </div>
            </div>
        );
    }

    // Calculate metadata
    const messageCount = session.messages.length;
    const durationSec = session.messages.length > 0
        ? Math.floor((session.messages[messageCount - 1].timestamp - session.createdAt) / 1000)
        : 0;

    // Performance Metrics
    const avgLatency = session.latencyRecords && session.latencyRecords.length > 0
        ? Math.round(session.latencyRecords.reduce((a, b) => a + b, 0) / session.latencyRecords.length)
        : 0;

    const dataCapturedCount = Object.keys(session.capturedData).length;
    const totalRequiredCount = session.requiredFields?.length || 0;
    const accuracy = totalRequiredCount > 0
        ? Math.round((dataCapturedCount / totalRequiredCount) * 100)
        : (dataCapturedCount > 0 ? 100 : 0);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="bg-background-dark min-h-screen text-slate-100 font-display selection:bg-primary selection:text-black antialiased">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full bg-surface-glass border-b border-white/5 px-6 py-4 mb-6 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 group"
                    >
                        <span className="material-symbols-outlined text-sm font-bold group-hover:-translate-x-1 transition-transform tracking-normal">arrow_back</span>
                        <span className="text-xs font-black tracking-widest uppercase">Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black shadow-glow-green">
                            <span className="material-symbols-outlined text-xl">graphic_eq</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-white uppercase">{session.scenarioName} Report</h1>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-slate-300 text-xs font-bold uppercase tracking-wider">
                        Export
                        <span className="material-symbols-outlined text-sm tracking-normal">north_east</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 pb-12">
                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {/* Stat Block: Duration */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-card-dark border border-white/5 p-6 shadow-brutal hover:-translate-y-1 transition-transform duration-300 group"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Duration</h3>
                                <span className="material-symbols-outlined text-primary">schedule</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white tracking-tighter">{formatDuration(durationSec)}</p>
                                <p className="text-xs text-primary mt-1 font-bold">Total session time</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat Block: Messages */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-2xl bg-card-dark border border-white/5 p-6 shadow-brutal-blue hover:-translate-y-1 transition-transform duration-300 group"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-blue/20 rounded-full blur-2xl group-hover:bg-accent-blue/30 transition-colors"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Messages</h3>
                                <span className="material-symbols-outlined text-accent-blue">chat_bubble</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white tracking-tighter">{messageCount}</p>
                                <p className="text-xs text-accent-blue mt-1 font-bold">Total turns</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat Block: Avg Latency */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-2xl bg-card-dark border border-white/5 p-6 shadow-brutal-violet hover:-translate-y-1 transition-transform duration-300 group"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-violet/20 rounded-full blur-2xl group-hover:bg-accent-violet/30 transition-colors"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Latency</h3>
                                <span className="material-symbols-outlined text-accent-violet">speed</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white tracking-tighter">{avgLatency}ms</p>
                                <p className="text-xs text-accent-violet mt-1 font-bold">Response speed</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat Block: Accuracy */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-2xl bg-card-dark border border-white/5 p-6 shadow-brutal-coral hover:-translate-y-1 transition-transform duration-300 group"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-coral/20 rounded-full blur-2xl group-hover:bg-accent-coral/30 transition-colors"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Intent Match</h3>
                                <span className="material-symbols-outlined text-accent-coral">check_circle</span>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white tracking-tighter">{accuracy}%</p>
                                <p className="text-xs text-accent-coral mt-1 font-bold">Data Capture Rate</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Transcript Block */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 lg:row-span-2 rounded-2xl bg-surface-glass border border-white/5 p-0 flex flex-col shadow-brutal-white overflow-hidden h-[600px] lg:h-auto"
                    >
                        <div className="px-6 py-5 border-b border-white/5 bg-card-dark/50 flex justify-between items-center backdrop-blur-sm sticky top-0 z-20">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg tracking-normal">description</span>
                                Transcript
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {session.messages.length > 0 ? (
                                session.messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 px-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-primary' : 'text-slate-500'}`}>
                                                {msg.role === 'user' ? 'User' : 'Assistant'}
                                            </span>
                                            <span className="text-[10px] text-slate-600">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'rounded-tr-none bg-primary text-background-dark font-medium shadow-glow-green'
                                            : 'rounded-tl-none bg-card-dark border border-slate-700 text-slate-300'
                                            }`}>
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest italic">
                                    No transcript available
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Insights Block - Display Captured Data */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 rounded-2xl bg-card-dark border border-white/5 p-6 flex flex-col gap-4 shadow-brutal-white h-auto min-h-[200px]"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Extracted Information</h3>
                            <span className="material-symbols-outlined text-slate-500">memory</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(session.capturedData).length > 0 ? (
                                Object.entries(session.capturedData).map(([key, value]) => (
                                    <div key={key} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary uppercase font-black text-[10px]">
                                            {key.substring(0, 2)}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="text-sm font-bold text-white truncate">{value}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No data captured yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Performance Block - Turn Latency Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-1 rounded-2xl bg-card-dark border border-white/5 p-6 flex flex-col justify-between shadow-brutal-white h-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Turn Latency</h3>
                            <span className="material-symbols-outlined text-slate-500">bar_chart</span>
                        </div>
                        <div className="flex items-end justify-between gap-1.5 h-32 w-full mt-auto">
                            {session.latencyRecords && session.latencyRecords.length > 0 ? (
                                session.latencyRecords.slice(-8).map((lat, i) => {
                                    const height = Math.min(Math.max((lat / 1500) * 100, 5), 100);
                                    return (
                                        <div key={i} className="flex-1 bg-slate-800/50 rounded-sm relative group h-full flex flex-col justify-end overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                className={`w-full group-hover:brightness-125 transition-all ${lat > 1000 ? 'bg-accent-coral' : 'bg-primary'}`}
                                            ></motion.div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <span className="text-[8px] font-black text-white bg-black/80 px-1 rounded shadow-xl">{lat}ms</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-black uppercase tracking-tighter">No Turn Data</div>
                            )}
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Start</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Recent</span>
                        </div>
                    </motion.div>

                    {/* Action Block: New Call */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        onClick={() => router.push('/')}
                        className="relative overflow-hidden rounded-2xl bg-primary text-background-dark p-6 flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all duration-200 group lg:col-span-1 shadow-brutal"
                    >
                        <span className="material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform duration-300">add_call</span>
                        <span className="text-sm font-black uppercase tracking-wider">New Call</span>
                    </motion.button>

                    {/* Footer Block */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 }}
                        className="lg:col-span-2 rounded-2xl bg-black/40 border border-white/5 p-6 flex flex-col justify-center gap-3"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">Session ID</span>
                            <span className="text-xs font-mono text-slate-300">#{session.id.split('-').pop()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">Company</span>
                            <span className="text-xs font-bold text-primary uppercase">{session.companyBrand}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-primary shadow-glow-green" style={{ width: '100%' }}></div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
