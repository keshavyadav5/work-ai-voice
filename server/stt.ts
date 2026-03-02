import WebSocket from 'ws';

export interface DeepgramCallbacks {
    onTranscriptPartial: (text: string) => void;
    onTranscriptFinal: (text: string) => void;
    onError: (error: string) => void;
}

export interface DeepgramConnection {
    send: (audio: ArrayBuffer) => void;
    close: () => void;
}

/**
 * Create a streaming connection to Deepgram for real-time STT.
 * Uses WebSocket for lowest latency.
 */
export function transcribeAudioStream(callbacks: DeepgramCallbacks): DeepgramConnection {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
        callbacks.onError('DEEPGRAM_API_KEY not configured');
        return { send: () => { }, close: () => { } };
    }

    const dgUrl = new URL('wss://api.deepgram.com/v1/listen');
    dgUrl.searchParams.set('model', 'nova-2');
    dgUrl.searchParams.set('language', 'en');
    dgUrl.searchParams.set('smart_format', 'true');
    dgUrl.searchParams.set('interim_results', 'true');
    dgUrl.searchParams.set('utterance_end_ms', '1500');
    dgUrl.searchParams.set('vad_events', 'true');
    dgUrl.searchParams.set('encoding', 'linear16');
    dgUrl.searchParams.set('sample_rate', '16000');
    dgUrl.searchParams.set('channels', '1');
    dgUrl.searchParams.set('punctuate', 'true');
    dgUrl.searchParams.set('endpointing', '300');

    const ws = new WebSocket(dgUrl.toString(), {
        headers: {
            Authorization: `Token ${apiKey}`,
        },
    });

    let isOpen = false;
    let pendingChunks: ArrayBuffer[] = [];

    ws.on('open', () => {
        isOpen = true;
        console.log('[Deepgram] WebSocket connected');

        // Send any buffered audio chunks
        for (const chunk of pendingChunks) {
            ws.send(chunk);
        }
        pendingChunks = [];
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const response = JSON.parse(data.toString());

            if (response.type === 'Results') {
                const transcript = response.channel?.alternatives?.[0]?.transcript || '';
                if (!transcript) return;

                if (response.is_final) {
                    callbacks.onTranscriptFinal(transcript);
                } else {
                    callbacks.onTranscriptPartial(transcript);
                }
            } else if (response.type === 'UtteranceEnd') {
                // Utterance boundary detected by VAD
                console.log('[Deepgram] Utterance end detected');
            }
        } catch (error) {
            console.error('[Deepgram] Parse error:', error);
        }
    });

    ws.on('error', (error: Error) => {
        console.error('[Deepgram] WebSocket error:', error.message);
        callbacks.onError(`Deepgram connection error: ${error.message}`);
    });

    ws.on('close', (code: number, reason: Buffer) => {
        isOpen = false;
        console.log(`[Deepgram] WebSocket closed: ${code} - ${reason.toString()}`);
    });

    return {
        send: (audio: ArrayBuffer) => {
            if (isOpen && ws.readyState === WebSocket.OPEN) {
                ws.send(audio);
            } else {
                // Buffer chunks until connection is ready
                pendingChunks.push(audio);
            }
        },
        close: () => {
            if (ws.readyState === WebSocket.OPEN) {
                // Send close signal to Deepgram
                ws.send(JSON.stringify({ type: 'CloseStream' }));
                ws.close();
            }
            isOpen = false;
            pendingChunks = [];
        },
    };
}
