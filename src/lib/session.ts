import { ConversationSession, Message, GroqMessage } from '../types';

/**
 * In-memory session manager for conversation history.
 * Each session tracks messages for a specific scenario conversation.
 */
class SessionManager {
    private sessions: Map<string, ConversationSession> = new Map();

    /**
     * Create a new conversation session
     */
    createSession(sessionId: string, scenarioId: string): ConversationSession {
        const session: ConversationSession = {
            id: sessionId,
            scenarioId,
            messages: [],
            capturedData: {},
            latencyRecords: [],
            createdAt: Date.now(),
            isActive: true,
        };
        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * Get an existing session
     */
    getSession(sessionId: string): ConversationSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Add a message to a session
     */
    addMessage(sessionId: string, role: Message['role'], content: string): Message | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        const message: Message = {
            id: `${sessionId}-${session.messages.length}`,
            role,
            content,
            timestamp: Date.now(),
        };

        session.messages.push(message);
        return message;
    }

    /**
     * Get conversation history formatted for Groq LLM
     */
    getGroqMessages(sessionId: string, systemPrompt: string): GroqMessage[] {
        const session = this.sessions.get(sessionId);
        if (!session) return [{ role: 'system', content: systemPrompt }];

        const messages: GroqMessage[] = [
            { role: 'system', content: systemPrompt },
            ...session.messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        // Keep context window manageable (last 20 messages + system prompt)
        if (messages.length > 21) {
            return [messages[0], ...messages.slice(-20)];
        }

        return messages;
    }

    /**
     * Add a latency record to a session
     */
    addLatencyRecord(sessionId: string, latencyMs: number): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.latencyRecords.push(latencyMs);
        }
    }

    /**
     * Update captured data for a session
     */
    updateData(sessionId: string, data: Record<string, string>): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.capturedData = { ...session.capturedData, ...data };
        }
    }

    /**
     * End a session
     */
    endSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
        }
    }

    /**
     * Delete a session and free memory
     */
    deleteSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    /**
     * Clean up stale sessions (older than 1 hour)
     */
    cleanup(): void {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const [id, session] of this.sessions) {
            if (session.createdAt < oneHourAgo) {
                this.sessions.delete(id);
            }
        }
    }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Run cleanup every 30 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => sessionManager.cleanup(), 30 * 60 * 1000);
}
