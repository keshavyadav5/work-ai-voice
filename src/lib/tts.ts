'use client';

/**
 * Browser-native TTS using the Web Speech API.
 * This provides zero-latency speech synthesis.
 */

let isSpeaking = false;
const speechQueue: string[] = [];

/**
 * Speak a sentence using the browser's native TTS engine.
 * Queues sentences and speaks them in order.
 */
export function speakSentence(text: string): void {
    if (!('speechSynthesis' in window)) {
        console.warn('[TTS] Web Speech API not supported');
        return;
    }

    speechQueue.push(text);

    if (!isSpeaking) {
        processQueue();
    }
}

function processQueue(): void {
    if (speechQueue.length === 0) {
        isSpeaking = false;
        return;
    }

    isSpeaking = true;
    const text = speechQueue.shift()!;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal rate for better quality
    utterance.pitch = 1.05; // Slightly higher pitch for female-sounding quality
    utterance.volume = 1.0;

    // Try to find a high-quality female English voice
    const voices = window.speechSynthesis.getVoices();

    // Priority list for female voices
    const preferredVoices = [
        'Samantha',
        'Google US English',
        'Microsoft Zira',
        'Natural',
        'Enhanced',
        'Victoria'
    ];

    let voice = voices.find(v =>
        v.lang.startsWith('en') &&
        preferredVoices.some(name => v.name.includes(name))
    );

    // Fallback to any English female-sounding voice (usually named with female names)
    if (!voice) {
        voice = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Female') || v.name.includes('Girl') || v.name.includes('Lady'))
        );
    }

    // Last resort fallback
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en'));
    }

    if (voice) {
        utterance.voice = voice;
    }

    utterance.onend = () => {
        processQueue();
    };

    utterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
            console.error('[TTS] Error:', event.error);
        }
        processQueue();
    };

    window.speechSynthesis.speak(utterance);
}

/**
 * Stop all speech and clear the queue
 */
export function stopSpeaking(): void {
    speechQueue.length = 0;
    isSpeaking = false;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Check if TTS is currently speaking
 */
export function isCurrentlySpeaking(): boolean {
    return isSpeaking || (typeof window !== 'undefined' && window.speechSynthesis?.speaking);
}
