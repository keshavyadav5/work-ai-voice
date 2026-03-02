'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const scenarios = [
  {
    id: 'calling-agent',
    name: 'Calling Agent',
    description: 'Automate appointment scheduling and follow-ups.',
    icon: 'call',
    tag: 'Outbound',
    gradient: 'from-[#1e293b] to-[#0f172a]',
    border: 'border-slate-700',
    iconColor: 'text-sky-400',
    tagCls: 'bg-sky-900 text-sky-300 border-sky-700',
    btnCls: 'bg-sky-500 hover:bg-sky-400',
    btnLabel: 'Start',
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: '24/7 Tier 1 support handling with empathy.',
    icon: 'support_agent',
    tag: 'Inbound',
    gradient: 'from-[#2e1065] to-[#1e1b4b]',
    border: 'border-indigo-900',
    iconColor: 'text-indigo-400',
    tagCls: 'bg-indigo-900 text-indigo-300 border-indigo-700',
    btnCls: 'bg-indigo-500 hover:bg-indigo-400',
    btnLabel: 'Deploy',
  },
  {
    id: 'technical-assistant',
    name: 'Tech Assistant',
    description: 'Voice-enabled database queries and ops.',
    icon: 'terminal',
    tag: 'Internal',
    gradient: 'from-[#064e3b] to-[#022c22]',
    border: 'border-emerald-900',
    iconColor: 'text-emerald-400',
    tagCls: 'bg-emerald-900 text-emerald-300 border-emerald-700',
    btnCls: 'bg-emerald-500 hover:bg-emerald-400',
    btnLabel: 'Configure',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] } },
};

export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-green-400 selection:text-black">

      {/* ─── Sticky Header ──────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx- px-6 mx-20 h-20 flex items-center justify-between">
          <h1 className="text-white text-xl font-black tracking-tight uppercase italic">
            Voice Agent
          </h1>
          <Link
            href="/conversation/calling-agent"
            className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wide hover:bg-green-400 transition-colors shadow-[4px_4px_0px_0px_rgba(57,255,20,0.4)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            Get Access
          </Link>
        </div>
      </motion.header>

      {/* ─── Main Bento Grid ────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">

          {/* ─── Scenario Cards ──────────────────────── */}
          {scenarios.map((s) => (
            <motion.div
              key={s.id}
              // variants={item}
              className={`col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col justify-between mt-10`}
            >
              <div>
                <div className="flex justify-between items-start mb-4 h-10">
                  <span className={`material-symbols-outlined text-4xl ${s.iconColor}`}>
                    {s.icon}
                  </span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${s.tagCls}`}>
                    {s.tag}
                  </div>
                </div>
                <h3 className="text-white text-lg font-black uppercase">{s.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{s.description}</p>
              </div>
              <Link
                href={`/scenarios/${s.id}`}
                className={`mt-4 w-full py-2 ${s.btnCls} text-white font-bold text-sm rounded-lg uppercase transition-colors flex justify-between px-4 items-center group/btn`}
              >
                {s.btnLabel}
                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          ))}

        </div>
      </motion.div>
    </main>
  );
}