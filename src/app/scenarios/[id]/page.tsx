'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const scenarioData: Record<string, {
    name: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    responseTime: string;
    contextSize: string;
    model: string;
    capabilities: { icon: string; label: string; color: string }[];
    examples: { emoji: string; text: string }[];
}> = {
    'calling-agent': {
        name: 'Calling Agent',
        description: 'A high-performance voice agent geared for real-time scheduling and coordination with zero latency.',
        icon: 'call',
        color: 'accent-blue',
        gradient: 'from-accent-blue to-blue-700',
        responseTime: '~200ms',
        contextSize: '20msgs',
        model: 'Groq Llama 3.3 70B',
        capabilities: [
            { icon: 'calendar_month', label: 'Scheduling', color: '#3b82f6' },
            { icon: 'check_circle', label: 'Confirming', color: '#22c55e' },
            { icon: 'update', label: 'Rescheduling', color: '#f97316' },
            { icon: 'replay', label: 'Follow-ups', color: '#a855f7' },
        ],
        examples: [
            { emoji: '🦷', text: 'Book a dentist appointment for next Tuesday morning.' },
            { emoji: '🤝', text: 'Schedule a sync meeting with the design team.' },
            { emoji: '📅', text: 'I need to reschedule my 3 PM call to tomorrow.' },
        ],
    },
    'customer-support': {
        name: 'Support Pro',
        description: 'Empathetic and efficient customer support agent specialized in resolution and high-volume inquiry handling.',
        icon: 'support_agent',
        color: 'accent-violet',
        gradient: 'from-accent-violet to-indigo-700',
        responseTime: '~350ms',
        contextSize: '50msgs',
        model: 'Groq Llama 3.3 70B',
        capabilities: [
            { icon: 'help', label: 'Inquiries', color: '#6366f1' },
            { icon: 'verified', label: 'Verification', color: '#3b82f6' },
            { icon: 'troubleshoot', label: 'Fixing', color: '#ef4444' },
            { icon: 'sentiment_satisfied', label: 'Resolution', color: '#22c55e' },
        ],
        examples: [
            { emoji: '📦', text: 'Where is my order #12345 located right now?' },
            { emoji: '💳', text: 'I need to update my billing information.' },
            { emoji: '❓', text: 'How do I reset my password on the mobile app?' },
        ],
    },
    'tech-assistant': {
        name: 'Tech Assistant',
        description: 'Specialized voice-enabled terminal for database queries, DevOps status checks, and complex technical logic.',
        icon: 'terminal',
        color: 'accent-emerald',
        gradient: 'from-accent-emerald to-emerald-800',
        responseTime: '~150ms',
        contextSize: '15msgs',
        model: 'Groq Llama 3.3 70B',
        capabilities: [
            { icon: 'database', label: 'Queries', color: '#10b981' },
            { icon: 'monitoring', label: 'Status', color: '#3b82f6' },
            { icon: 'code', label: 'Logic', color: '#64748b' },
            { icon: 'rocket_launch', label: 'Deploy', color: '#f97316' },
        ],
        examples: [
            { emoji: '📊', text: 'What was the peak RPS on the main DB yesterday?' },
            { emoji: '🔍', text: 'Find all users with subscription status "expired".' },
            { emoji: '🏗️', text: 'What is the current health of the staging cluster?' },
        ],
    }
};

export default function ScenarioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const data = scenarioData[id] || scenarioData['calling-agent'];

    return (
        <div className="bg-background-dark min-h-screen text-slate-100 font-display selection:bg-primary selection:text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen flex flex-col">
                {/* Top Nav */}
                <header className="flex items-center justify-between py-6 mb-8">
                    <Link href="/" className="group flex items-center gap-2 text-primary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg font-bold group-hover:-translate-x-1 transition-transform tracking-normal">arrow_back</span>
                        <span className="text-sm font-black tracking-widest uppercase">Scenarios</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black tracking-tight uppercase text-white">Voice Agent</h1>
                    </div>
                </header>

                {/* Bento Grid layout */}
                <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] grow">
                    


                    {/* Capabilities Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bento-card bg-surface-dark border border-white/5 rounded-2xl p-6 md:col-span-1 lg:col-span-1 row-span-2 shadow-brutal-white"
                    >
                        <h3 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-6">Capabilities</h3>
                        <div className="flex flex-col gap-3">
                            {data.capabilities.map((cap, i) => (
                                <div key={i} className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl flex items-center gap-3 group cursor-default">
                                    <div className="text-white p-2 rounded-lg transition-colors" style={{ backgroundColor: `${cap.color}33` }}>
                                        <span className="material-symbols-outlined text-xl" style={{ color: cap.color }}>{cap.icon}</span>
                                    </div>
                                    <span className="font-bold text-slate-200">{cap.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Example Prompts Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bento-card bg-surface-dark border border-white/5 rounded-2xl p-6 md:col-span-2 lg:col-span-3 shadow-brutal-white"
                    >
                        <h3 className="text-slate-400 font-black text-xs tracking-widest uppercase mb-4">Try Saying...</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.examples.map((ex, i) => (
                                <div key={i} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl cursor-pointer border border-white/5 transition-all hover:border-primary/50 group">
                                    <span className="text-2xl mb-2 block">{ex.emoji}</span>
                                    <p className="text-sm font-medium text-slate-300 group-hover:text-white leading-snug">"{ex.text}"</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Start Action Block */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => router.push(`/conversation/${id}`)}
                        className="bento-card col-span-1 md:col-span-3 lg:col-span-4 bg-primary rounded-2xl p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-white transition-colors group shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] mb-12 translate-y-0 active:translate-y-1 active:shadow-none"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-primary text-3xl">mic</span>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tighter">Start Conversation</h2>
                                <p className="text-black/70 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                                    Microphone access required
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                            <span className="material-symbols-outlined text-black text-5xl group-hover:translate-x-2 transition-transform tracking-normal">arrow_forward</span>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
