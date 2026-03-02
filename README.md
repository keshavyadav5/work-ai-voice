# 🎙️ VoiceFlow AI — Context-Aware Voice Agent

A real-time, context-driven voice agent accessible via a public web portal. Select a scenario and have a natural two-way voice conversation with an AI agent.

> Built for the **SDE Intern Assignment — Drcode.ai**

---

## ✨ Features

- **🎯 Three Distinct Scenarios**: Calling Agent, Customer Support, and Technical Assistant
- **⚡ Real-time Voice Pipeline**: STT → LLM → TTS streaming architecture (~1s latency)
- **🧠 Contextual Memory**: Session-level conversation history for coherent multi-turn dialogue
- **🎤 Two-way Voice**: Speak naturally and hear AI responses via browser TTS
- **🔊 Barge-in Support**: Interrupt the agent mid-response by clicking the orb
- **📝 Live Transcript**: Real-time display of both sides of the conversation
- **🌊 Visual Feedback**: Animated voice orb with 4 states (Idle, Listening, Thinking, Speaking)
- **📱 Mobile Responsive**: Works on desktop and mobile browsers
- **🔓 No Login Required**: Guest access — just visit and start talking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Web Browser                       │
│                                                     │
│  ┌─────────┐   ┌──────────┐   ┌────────────────┐  │
│  │   Mic   │──▶│   VAD    │──▶│  Audio Chunks  │  │
│  └─────────┘   │(client)  │   │  (PCM 16-bit)  │  │
│                └──────────┘   └───────┬────────┘  │
│                                       │            │
│  ┌─────────┐   ┌──────────┐          │            │
│  │ Speaker │◀──│ Web TTS  │          │            │
│  └─────────┘   │(browser) │          │            │
│                └────▲─────┘          │            │
│                     │                │ WebSocket  │
└─────────────────────┼────────────────┼────────────┘
                      │                │
              ┌───────┴────────────────▼────────────┐
              │          Socket.io Server            │
              │                                      │
              │  Audio ──▶ Deepgram STT (streaming) │
              │              │                       │
              │         Transcript                   │
              │              │                       │
              │  Session ──▶ Groq LLM (streaming)   │
              │  Memory      │                       │
              │         Response Text                │
              │              │                       │
              │  Sentence ──▶ Client (for TTS)      │
              │  Chunks                              │
              └──────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 14 (App Router) | SSR + API routes + easy Vercel deploy |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Rapid, mobile-first |
| Real-time | Socket.io (WebSocket) | Full-duplex, auto-reconnect |
| STT | Deepgram Nova-2 | Sub-300ms streaming transcription |
| LLM | Groq (Llama 3.3 70B) | ~100ms time-to-first-token |
| TTS | Web Speech API | Zero-latency, browser-native |
| Animations | Framer Motion | Smooth UI transitions |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- API Keys (free tiers available):
  - [Deepgram](https://console.deepgram.com/signup) ($200 free credit)
  - [Groq](https://console.groq.com) (free tier)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/voice-agent.git
cd voice-agent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your Deepgram + Groq API keys

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

```env
DEEPGRAM_API_KEY=your_deepgram_key_here
GROQ_API_KEY=your_groq_key_here
```

---

## 📁 Project Structure

```
voice-agent/
├── server/                     # Custom Node.js server
│   ├── index.ts               # HTTP + Socket.io setup
│   ├── socket-handler.ts      # Voice pipeline orchestrator
│   └── stt.ts                 # Deepgram streaming STT
├── src/
│   ├── app/                   # Next.js pages
│   │   ├── page.tsx           # Landing / scenario selection
│   │   ├── conversation/      # Voice conversation UI
│   │   └── api/               # REST endpoints
│   ├── components/            # React components
│   │   ├── VoiceOrb.tsx       # Animated voice indicator
│   │   └── TranscriptPanel.tsx # Live transcript
│   ├── hooks/
│   │   └── useVoiceAgent.ts   # Core voice agent hook
│   ├── lib/
│   │   ├── scenarios/         # Scenario configurations
│   │   ├── voice/llm.ts       # Groq streaming client
│   │   ├── tts.ts             # Browser TTS wrapper
│   │   └── session.ts         # In-memory session manager
│   └── types/index.ts         # TypeScript definitions
├── .env.example
└── README.md
```

---

## 🎭 Scenarios

### 1. Calling Agent 📞
Handles appointment scheduling, confirmations, and follow-ups with structured information gathering.

### 2. Customer Support 🎧
Handles product complaints, service queries, returns, and provides empathetic resolution steps.

### 3. Technical Assistant 🔧
Guides users through debugging and troubleshooting with step-by-step conversational instructions.

Each scenario uses:
- **Custom system prompts** with personality, capabilities, and conversation rules
- **Session memory** for contextual multi-turn conversations
- **Greeting messages** to establish context from the start

---

## ⚡ Latency Optimization

| Stage | Technique | Latency |
|-------|----------|---------|
| VAD | Client-side detection | ~100ms |
| STT | Deepgram streaming WebSocket | ~200ms |
| LLM | Groq fast inference, streaming | ~100ms TTFT |
| TTS | Browser-native Web Speech API | ~50ms |
| **Total** | **End-to-end** | **~450ms–1s** |

Key optimizations:
- **Streaming everything**: No component waits for the previous to fully complete
- **Client-side VAD**: Reduces unnecessary audio transmission
- **Sentence chunking**: TTS starts on first sentence, not full response
- **Linear16 PCM**: Minimal encoding overhead

---

## 📈 Scalability Design

For 1000+ concurrent users:

1. **Horizontal Scaling**: Socket.io Redis adapter for distributing connections across multiple server instances
2. **Sticky Sessions**: WebSocket connections pinned to specific servers via load balancer
3. **Stateless API**: Next.js API routes auto-scale on Vercel/serverless
4. **External APIs**: STT/TTS/LLM calls are API-bound and scale independently
5. **Session Store**: Move from in-memory to Redis for distributed session management
6. **CDN**: Static assets served via edge CDN (built into Vercel)

---

## 🎁 Bonus Features

- [x] Streaming architecture (not sequential request-response)
- [x] Barge-in / interruption support
- [x] Extensible scenario configuration engine
- [x] Clean, intuitive UI/UX with glassmorphism design
- [x] Basic latency tracking (displayed in UI)
- [ ] Live deployment (ready for Vercel)
- [ ] Observability dashboard

---

## 🛠️ Trade-offs & Future Improvements

### Current Trade-offs
- **Web Speech API TTS**: Free and zero-latency but voice quality varies by browser. Could upgrade to ElevenLabs for production.
- **In-memory sessions**: Simple but doesn't persist across restarts. Would use Redis for production.
- **ScriptProcessorNode**: Deprecated but widely supported. Would migrate to AudioWorklet for production.

### With More Time
- [ ] ElevenLabs premium TTS integration
- [ ] AudioWorklet for better audio processing
- [ ] Redis session store for persistence
- [ ] Observability dashboard with latency metrics
- [ ] Multi-language support
- [ ] Voice cloning for consistent agent voice
- [ ] WebRTC for improved audio quality

---

## 📄 License

MIT

---

Built with ❤️ for **Drcode.ai** SDE Intern Assignment
