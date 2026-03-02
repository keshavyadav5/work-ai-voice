'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Message } from '@/types';

interface TranscriptPanelProps {
    messages: Message[];
    currentTranscript: string;
    agentResponse: string;
    isProcessing: boolean;
}

export default function TranscriptPanel({
    messages,
    currentTranscript,
    agentResponse,
    isProcessing,
}: TranscriptPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentTranscript, agentResponse]);

    const hasContent = messages.length > 0 || currentTranscript || agentResponse;

    return (
        <div className="w-full">
            <div
                ref={scrollRef}
                className="flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-1"
                style={{ scrollBehavior: 'smooth' }}
            >
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'max-w-[85%] self-end flex-row-reverse' : 'max-w-[85%]'}`}
                        >
                            {/* Avatar */}
                            {msg.role === 'user' ? (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-glow-green text-black font-bold text-sm">
                                    U
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 border border-white/10">
                                    <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
                                </div>
                            )}

                            {/* Bubble */}
                            <div
                                className={
                                    msg.role === 'user'
                                        ? 'bg-primary p-4 rounded-2xl rounded-tr-none shadow-lg text-black'
                                        : 'bg-surface-dark border border-blue-500/20 p-4 rounded-2xl rounded-tl-none shadow-lg'
                                }
                            >
                                <p className={`text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'text-black font-bold' : 'text-gray-200'}`}>
                                    {msg.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Live user transcript - hide during agent speech to prevent echo flicker */}
                    {currentTranscript && !agentResponse && !isProcessing && (
                        <motion.div
                            key="live-transcript"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 max-w-[85%] self-end flex-row-reverse"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center shrink-0 text-black font-bold text-sm">
                                U
                            </div>
                            <div className="bg-primary/30 p-4 rounded-2xl rounded-tr-none shadow-lg border border-primary/20">
                                <p className="text-sm font-medium leading-relaxed text-primary/80 italic">
                                    {currentTranscript}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Agent response */}
                    {agentResponse && (
                        <motion.div
                            key="agent-response"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 max-w-[85%]"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 border border-white/10">
                                <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
                            </div>
                            <div className="bg-surface-dark border border-accent-blue/20 p-4 rounded-2xl rounded-tl-none shadow-lg">
                                <p className="text-sm font-medium leading-relaxed text-gray-200">
                                    {agentResponse}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Processing indicator */}
                    {isProcessing && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            className="flex gap-3 items-center mt-2"
                        >
                            <div className="w-8 h-8" /> {/* Spacer */}
                            <div className="flex gap-1 items-center bg-white/5 px-3 py-2 rounded-full">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!hasContent && (
                    <div className="text-center text-gray-600 text-sm font-medium py-8">
                        Conversation transcript will appear here
                    </div>
                )}
            </div>
        </div>
    );
}
