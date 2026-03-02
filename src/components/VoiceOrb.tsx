'use client';

import { motion } from 'framer-motion';
import { VoiceState } from '@/types';

interface VoiceOrbProps {
    state: VoiceState;
    onClick?: () => void;
    size?: number;
}

const stateConfig: Record<VoiceState, { label: string; sublabel: string; color: string; ringColor: string; glowColor: string }> = {
    idle: {
        label: 'Ready',
        sublabel: 'Click Orb to Start',
        color: 'text-blue-400',
        ringColor: 'border-accent-blue/60',
        glowColor: 'rgba(37, 99, 235, 0.3)',
    },
    listening: {
        label: 'Listening',
        sublabel: 'Tap Orb to Interrupt',
        color: 'text-primary',
        ringColor: 'border-primary/60',
        glowColor: 'rgba(57, 255, 20, 0.4)',
    },
    processing: {
        label: 'Processing',
        sublabel: 'Thinking...',
        color: 'text-amber-400',
        ringColor: 'border-amber-400/60',
        glowColor: 'rgba(245, 158, 11, 0.3)',
    },
    speaking: {
        label: 'Speaking',
        sublabel: 'Listening for you',
        color: 'text-accent-violet',
        ringColor: 'border-accent-violet/60',
        glowColor: 'rgba(124, 58, 237, 0.4)',
    },
    error: {
        label: 'Error',
        sublabel: 'Click to retry',
        color: 'text-red-500',
        ringColor: 'border-red-500/60',
        glowColor: 'rgba(239, 68, 68, 0.3)',
    },
};

export default function VoiceOrb({ state, onClick, size = 256 }: VoiceOrbProps) {
    const config = stateConfig[state];

    return (
        <div className="flex flex-col items-center gap-2 z-20">
            {/* Orb Container */}
            <div
                className="relative flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95"
                style={{ width: size, height: size }}
                onClick={onClick}
            >
                {/* Glows */}
                <div
                    className="absolute inset-0 rounded-full blur-3xl animate-pulse"
                    style={{ background: config.glowColor, opacity: 0.3 }}
                />
                <div
                    className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                    style={{ background: config.glowColor, opacity: 0.15, animationDelay: '75ms' }}
                />

                {/* Core */}
                <div
                    className={`w-32 h-32 bg-black rounded-full relative z-20 flex items-center justify-center border border-white/10 ${state === 'listening' ? 'orb-listening' : state === 'speaking' ? 'orb-speaking' : 'orb-idle'}`}
                    style={{ boxShadow: `0 0 60px 20px ${config.glowColor}` }}
                >
                    <span className="material-symbols-outlined text-white text-5xl">mic</span>
                </div>

                {/* Spinning Rings */}
                <div
                    className={`orb-ring w-40 h-40 z-10 animate-spin ${config.ringColor}`}
                />
                <div
                    className="orb-ring w-48 h-48 border-secondary/50 z-10 animate-spin-reverse"
                />
                <div
                    className={`orb-ring w-60 h-60 z-10 animate-spin-slow ${config.ringColor}`}
                    style={{ opacity: 0.3 }}
                />
            </div>

            {/* Status Text */}
            <div className="flex flex-col items-center gap-2 mt-8 z-20">
                <div className="flex items-center gap-2">
                    <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`w-3 h-3 rounded-full ${state === 'idle' ? 'bg-blue-400' : state === 'listening' ? 'bg-primary' : state === 'processing' ? 'bg-amber-400' : state === 'speaking' ? 'bg-accent-violet' : 'bg-red-500'}`}
                    />
                    <h2 className={`text-2xl font-black tracking-widest uppercase ${config.color}`}>
                        {config.label}
                    </h2>
                </div>
                <p className="text-gray-500 text-xs font-bold tracking-wider uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">
                    {config.sublabel}
                </p>
            </div>
        </div>
    );
}
