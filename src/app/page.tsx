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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] as const } },
};

export default function Home() {
  return (
    <main className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-black">
      {/* ─── Sticky Header ──────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-white/10 bg-background-dark/80 backdrop-blur-md"
      >
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary flex items-center justify-center rounded-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <span className="material-symbols-outlined text-black text-2xl font-black">graphic_eq</span>
            </div>
            <h1 className="text-white text-xl font-black tracking-tight uppercase italic">Voice Agent</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a className="text-sm font-bold uppercase hover:text-primary transition-colors" href="#features">Features</a>
            <a className="text-sm font-bold uppercase hover:text-primary transition-colors" href="#pricing">Pricing</a>
            <a className="text-sm font-bold uppercase hover:text-primary transition-colors" href="#">Docs</a>
          </nav>
          <Link
            href="/conversation/calling-agent"
            className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-wide hover:bg-primary transition-colors shadow-[4px_4px_0px_0px_rgba(57,255,20,0.4)] active:shadow-none active:translate-x-1 active:translate-y-1"
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
        className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* ─── Hero Block (4 cols, 2 rows) ──────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-4 lg:col-span-4 row-span-2 bg-gradient-to-br from-card-dark to-[#0f120e] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden group shadow-brutal flex flex-col justify-between"
          >
            {/* Hero Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary tracking-wider uppercase">v2.0 Live Now</span>
              </div>

              {/* Watermark */}
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-outline uppercase absolute right-8 top-8 hidden lg:block select-none pointer-events-none opacity-50">
                Voice<br />Agent
              </h2>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                Talk to AI <br />
                <span className="text-primary italic relative inline-block">
                  Naturally.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-white/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-lg font-medium">
                Experience sub-second latency and human-like understanding. The new standard for voice interfaces.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative z-10 mt-10 flex flex-wrap gap-4">
              <Link
                href="/conversation/calling-agent"
                className="bg-primary text-black px-8 py-4 rounded-xl font-black text-base uppercase tracking-wide hover:bg-white transition-colors shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-2"
              >
                <span>Try Demo</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
              <button className="bg-transparent border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base uppercase tracking-wide hover:bg-white/10 transition-colors">
                View Docs
              </button>
            </div>

            {/* Equalizer bars */}
            <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-32 flex items-end justify-end gap-1 p-8 opacity-40">
              <div className="w-4 bg-primary/40 h-[40%] rounded-t-sm animate-[bounce_1s_infinite]" />
              <div className="w-4 bg-primary/60 h-[70%] rounded-t-sm animate-[bounce_1.2s_infinite]" />
              <div className="w-4 bg-primary/80 h-[50%] rounded-t-sm animate-[bounce_0.8s_infinite]" />
              <div className="w-4 bg-primary h-[90%] rounded-t-sm animate-[bounce_1.1s_infinite]" />
              <div className="w-4 bg-primary/80 h-[60%] rounded-t-sm animate-[bounce_0.9s_infinite]" />
              <div className="w-4 bg-primary/40 h-[30%] rounded-t-sm animate-[bounce_1.3s_infinite]" />
            </div>
          </motion.div>

          {/* ─── Latency Stat Block ───────────────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-2 lg:col-span-2 bg-card-dark border border-white/10 rounded-2xl p-6 shadow-brutal flex flex-col justify-center items-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-coral/10 via-transparent to-transparent" />
            <h3 className="text-accent-coral font-bold text-sm tracking-widest uppercase mb-2">Latency</h3>
            <div className="text-6xl font-black text-white tracking-tighter">142<span className="text-3xl text-slate-500 ml-1">ms</span></div>
            <div className="flex items-center gap-1 text-accent-emerald text-sm font-bold mt-2 bg-accent-emerald/10 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              -40% Faster
            </div>
          </motion.div>

          {/* ─── Feature: Sub-second ─────────────────── */}
          <motion.div
            variants={item}
            id="features"
            className="bento-card col-span-1 md:col-span-2 lg:col-span-2 bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-6 shadow-brutal group hover:bg-accent-blue/20 transition-all"
          >
            <div className="size-12 rounded-full bg-accent-blue text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <h3 className="text-white text-xl font-black uppercase mb-1">Sub-Second</h3>
            <p className="text-accent-blue/80 text-sm font-semibold leading-relaxed">Lightning fast responses under 500ms. Feels like a real conversation.</p>
          </motion.div>

          {/* ─── Feature: Context-Aware ──────────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-2 lg:col-span-2 bg-accent-violet/10 border border-accent-violet/30 rounded-2xl p-6 shadow-brutal group hover:bg-accent-violet/20 transition-all"
          >
            <div className="size-12 rounded-full bg-accent-violet text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-white text-xl font-black uppercase mb-1">Context-Aware</h3>
            <p className="text-accent-violet/80 text-sm font-semibold leading-relaxed">Remembers previous turns. Maintains context throughout the session.</p>
          </motion.div>

          {/* ─── Feature: Natural Voice ──────────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-2 lg:col-span-2 bg-accent-coral/10 border border-accent-coral/30 rounded-2xl p-6 shadow-brutal group hover:bg-accent-coral/20 transition-all"
          >
            <div className="size-12 rounded-full bg-accent-coral text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">mic</span>
            </div>
            <h3 className="text-white text-xl font-black uppercase mb-1">Natural Voice</h3>
            <p className="text-accent-coral/80 text-sm font-semibold leading-relaxed">Human-like intonation, pauses, and interruptions handling.</p>
          </motion.div>

          {/* ─── Globe / Network Block ───────────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-black border border-white/10 rounded-2xl relative overflow-hidden shadow-brutal flex items-center justify-center group"
          >
            <div className="size-32 rounded-full bg-gradient-to-tr from-primary via-accent-emerald to-accent-blue blur-xl opacity-60 group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10 text-center">
              <span className="material-symbols-outlined text-white text-5xl">public</span>
              <p className="text-white font-bold text-xs uppercase tracking-widest mt-2">Global Edge Network</p>
            </div>
          </motion.div>

          {/* ─── Scenario Cards ──────────────────────── */}
          <div id="scenarios" />
          {scenarios.map((s) => (
            <motion.div
              key={s.id}
              variants={item}
              className={`bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-gradient-to-br ${s.gradient} ${s.border} rounded-2xl p-6 shadow-brutal flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`material-symbols-outlined text-4xl ${s.iconColor}`}>{s.icon}</span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${s.tagCls}`}>
                    {s.tag}
                  </div>
                </div>
                <h3 className="text-white text-lg font-black uppercase">{s.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{s.description}</p>
              </div>
              <Link
                href={`/scenarios/${s.id}`}
                className={`mt-4 w-full py-2 ${s.btnCls} text-white font-bold text-sm rounded-lg uppercase transition-colors flex justify-between px-4 items-center group/btn text-center`}
              >
                {s.btnLabel}
                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          ))}

          {/* ─── Animated Sound Wave Block ────────────── */}
          <motion.div
            variants={item}
            className="bento-card col-span-1 md:col-span-4 lg:col-span-6 h-32 bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-brutal"
          >
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[8, 12, 16, 10, 20, 14, 8, 12, 6, 10, 16, 24, 14, 8, 8, 12, 16, 10, 20, 14, 8, 12, 6].map((h, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full"
                  style={{
                    height: `${h * 4}px`,
                    animation: `pulse ${[1, 1.2, 0.8, 1.1, 1.5, 0.9, 1.3, 1, 1.4, 0.8, 1.2, 1.6, 1, 1.3, 1, 1.2, 0.8, 1.1, 1.5, 0.9, 1.3, 1, 1.4][i % 23]}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 bg-black/80 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
              <p className="text-white font-mono text-sm tracking-widest">AUDIO VISUALIZATION ACTIVE</p>
            </div>
          </motion.div>

          {/* ─── Footer Block ────────────────────────── */}
          <div className="col-span-1 md:col-span-4 lg:col-span-6 bg-card-dark border-t border-white/10 rounded-2xl mt-8 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">code</span>
              <p className="text-slate-400 text-sm font-medium">Built with Next.js · Deepgram · Groq</p>
            </div>
            <div className="flex gap-6">
              <a className="text-slate-500 hover:text-white transition-colors" href="#" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a className="text-slate-500 hover:text-white transition-colors" href="#" aria-label="GitHub">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
