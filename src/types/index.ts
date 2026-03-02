// Type definitions for the Voice Agent application

// ─── Scenario Types ─────────────────────────────────────────────
export interface Scenario {
  id: string;
  name: string;
  description: string;
  companyName: string;
  companyBrand: string;
  requiredFields: string[]; // Fields to gather (e.g., ['name', 'date', 'time'])
  icon: string; // Lucide icon name
  color: string; // Gradient/accent color
  systemPrompt: string;
  greeting: string;
  examples: string[];
}

// ─── Conversation Types ─────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ConversationSession {
  id: string;
  scenarioId: string;
  messages: Message[];
  capturedData: Record<string, string>; // Extracted data from the conversation
  latencyRecords: number[];           // Array of response latencies in ms
  createdAt: number;
  isActive: boolean;
}

// ─── Voice State Types ──────────────────────────────────────────
export type VoiceState =
  | 'idle'        // Not in conversation
  | 'listening'   // Mic active, waiting for user
  | 'processing'  // STT received, sending to LLM
  | 'speaking'    // TTS playing response
  | 'error';      // Something went wrong

export interface VoiceAgentState {
  voiceState: VoiceState;
  isConnected: boolean;
  currentTranscript: string;     // Live user transcript
  agentResponse: string;         // Current agent response text
  error: string | null;
  latencyMs: number | null;      // Last measured latency
}

// ─── Socket Event Types ─────────────────────────────────────────
export interface ClientToServerEvents {
  'audio:chunk': (data: { audio: ArrayBuffer; sampleRate: number }) => void;
  'audio:start': (data: { scenarioId: string; sessionId: string }) => void;
  'audio:stop': () => void;
  'session:start': (data: { scenarioId: string }) => void;
  'session:end': () => void;
  'interrupt': () => void;
}

export interface ServerToClientEvents {
  'transcript:partial': (data: { text: string }) => void;
  'transcript:final': (data: { text: string }) => void;
  'response:start': () => void;
  'response:chunk': (data: { text: string; audio?: string }) => void;
  'response:end': (data: { fullText: string; latencyMs: number }) => void;
  'state:change': (data: { state: VoiceState }) => void;
  'error': (data: { message: string; code?: string }) => void;
  'session:created': (data: { sessionId: string }) => void;
}

// ─── API Types ──────────────────────────────────────────────────
export interface DeepgramConfig {
  model: string;
  language: string;
  smart_format: boolean;
  interim_results: boolean;
  utterance_end_ms: number;
  vad_events: boolean;
  encoding: string;
  sample_rate: number;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
