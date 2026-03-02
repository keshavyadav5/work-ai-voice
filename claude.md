# 🎙️ Context-Aware Voice Agent – Development Log

## Project Info
- **Assignment**: SDE Intern – Drcode.ai
- **Objective**: Real-time, context-driven voice agent via web portal
- **Deadline**: 2nd March, 11:59 PM IST
- **Framework**: Next.js 16.1.6 + TypeScript + Tailwind CSS

---

## Iteration 1 – Planning & Research (March 1, 2025)

### What was done
1. Read & analyzed full assignment requirements
2. Researched technology stack for optimal latency
3. Designed streaming pipeline architecture
4. Created implementation plan and got approval

### Decisions
| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR, API routes, easy Vercel deploy |
| Real-time | Socket.io WebSockets | Full-duplex, auto-reconnect |
| STT | Deepgram Nova-2 streaming | Sub-300ms, WebSocket native |
| LLM | Groq (Llama 3.3 70B) | ~100ms TTFT, free tier |
| TTS | Web Speech API | Zero latency, browser-native |
| VAD | Client-side | Reduces server load, enables barge-in |

---

## Iteration 2 – Full Build (March 1, 2025)

### What was built

#### Backend (server/)
- `server/index.ts` – Custom HTTP + Socket.io server
- `server/socket-handler.ts` – Full pipeline orchestrator (audio → STT → LLM → TTS)
- `server/stt.ts` – Deepgram Nova-2 streaming STT via WebSocket

#### Core Libraries (src/lib/)
- `src/lib/voice/llm.ts` – Groq streaming with sentence-boundary detection
- `src/lib/tts.ts` – Web Speech API TTS with sentence queuing
- `src/lib/session.ts` – In-memory session manager with auto-cleanup
- `src/lib/scenarios/` – 3 scenario configs (Calling, Support, Technical)

#### Frontend (src/app/, src/components/)
- Landing page with animated glassmorphism scenario cards
- Conversation page with voice orb, controls, transcript panel
- `VoiceOrb.tsx` – 4-state animated indicator (idle/listening/processing/speaking)
- `TranscriptPanel.tsx` – Live streaming transcript with typing indicators
- `useVoiceAgent.ts` – Core hook (Socket.io + mic + PCM encoding + state management)

#### APIs
- `/api/scenarios` – List scenarios
- `/api/health` – Health check

### Build Status
✅ **Build passes successfully** – Next.js 16.1.6 (Turbopack), all TypeScript compiles

### Files Created (18 files)
```
server/index.ts
server/socket-handler.ts
server/stt.ts
src/types/index.ts
src/lib/scenarios/index.ts
src/lib/scenarios/calling.ts
src/lib/scenarios/support.ts
src/lib/scenarios/technical.ts
src/lib/voice/llm.ts
src/lib/tts.ts
src/lib/session.ts
src/hooks/useVoiceAgent.ts
src/components/VoiceOrb.tsx
src/components/TranscriptPanel.tsx
src/app/layout.tsx
src/app/page.tsx
src/app/conversation/[scenarioId]/page.tsx
src/app/api/scenarios/route.ts
src/app/api/health/route.ts
```

---

## API Keys Required
| Service | Status | Free Tier |
|---------|--------|-----------|
| Deepgram | ⬜ Need to add to .env.local | $200 credit on signup |
| Groq | ⬜ Need to add to .env.local | Free tier available |

---

## Next Steps
- [ ] Add API keys to `.env.local`
- [ ] Test end-to-end voice conversation
- [ ] Deploy to Vercel
- [ ] Record demo video
