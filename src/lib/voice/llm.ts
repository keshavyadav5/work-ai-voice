import Groq from 'groq-sdk';

// Inline type to avoid @/ path alias dependency (this file runs under tsx too)
interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY || '';
    // Always recreate if key might have changed, or create on first use
    if (!groqInstance) {
        console.log(`[LLM] Initializing Groq client (key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING'})`);
        groqInstance = new Groq({ apiKey });
    }
    return groqInstance;
}

/**
 * Stream a response from Groq LLM.
 * Uses Llama 3.3 70B for high-quality, fast inference.
 * 
 * @param messages - Conversation history including system prompt
 * @param onChunk - Callback for each text chunk received
 * @param onSentence - Callback when a complete sentence is detected (for TTS)
 * @param onComplete - Callback when full response is generated
 * @param signal - AbortSignal for cancellation (barge-in support)
 */
export async function streamLLMResponse(
    messages: GroqMessage[],
    onChunk: (text: string) => void,
    onSentence: (sentence: string) => void,
    onComplete: (fullText: string) => void,
    signal?: AbortSignal
): Promise<void> {
    let fullText = '';
    let sentenceBuffer = '';
    const sentenceEnders = /[.!?。！？]/;

    try {
        const stream = await getGroqClient().chat.completions.create(
            {
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 256, // Keep responses concise for voice
                top_p: 0.9,
                stream: true,
            },
        );

        for await (const chunk of stream) {
            // Check for cancellation (barge-in)
            if (signal?.aborted) {
                break;
            }

            const content = chunk.choices[0]?.delta?.content || '';
            if (!content) continue;

            fullText += content;
            sentenceBuffer += content;
            onChunk(content);

            // Detect sentence boundaries for TTS chunking
            if (sentenceEnders.test(sentenceBuffer)) {
                const sentences = sentenceBuffer.split(sentenceEnders);
                // Process all complete sentences
                for (let i = 0; i < sentences.length - 1; i++) {
                    const sentence = sentences[i].trim();
                    if (sentence.length > 0) {
                        // Re-add the punctuation
                        const puncIndex = sentenceBuffer.indexOf(sentence) + sentence.length;
                        const punc = sentenceBuffer[puncIndex] || '.';
                        onSentence(sentence + punc);
                    }
                }
                // Keep the incomplete last part in the buffer
                sentenceBuffer = sentences[sentences.length - 1] || '';
            }
        }

        // Flush remaining buffer
        if (sentenceBuffer.trim().length > 0) {
            onSentence(sentenceBuffer.trim());
        }

        onComplete(fullText);
    } catch (error: unknown) {
        if (signal?.aborted) {
            // Interrupted by user, not an error
            onComplete(fullText);
            return;
        }
        const message = error instanceof Error ? error.message : 'Unknown LLM error';
        throw new Error(`LLM streaming failed: ${message}`);
    }
}
