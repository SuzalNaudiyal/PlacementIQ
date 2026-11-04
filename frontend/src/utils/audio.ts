/**
 * Audio normalization utility for cross-browser playback.
 * Safari on macOS/iOS records audio as MP4/AAC. If the MIME type is improperly set
 * to audio/webm, Safari's native <audio> element fails with an "Error".
 * This utility detects the underlying container bytes and fixes the MIME prefix.
 */
export function normalizeAudioSource(rawAudio: string | null | undefined): string {
  if (!rawAudio || typeof rawAudio !== 'string') return '';
  const trimmed = rawAudio.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith('data:')) {
    // Pure base64
    if (trimmed.startsWith('AAAAIGZ0eX') || trimmed.slice(0, 50).includes('Z0eX')) {
      return `data:audio/mp4;base64,${trimmed}`;
    }
    if (trimmed.startsWith('GkXf')) {
      return `data:audio/webm;base64,${trimmed}`;
    }
    if (trimmed.startsWith('UklGR')) {
      return `data:audio/wav;base64,${trimmed}`;
    }
    return `data:audio/mp4;base64,${trimmed}`;
  }

  const commaIdx = trimmed.indexOf(',');
  if (commaIdx === -1) return trimmed;

  const b64 = trimmed.substring(commaIdx + 1);
  const sample = b64.slice(0, 50);

  // 'AAAAIGZ0eX' or 'Z0eX' indicates ISO base media file format (MP4 / AAC container)
  if (sample.startsWith('AAAAIGZ0eX') || sample.includes('Z0eX')) {
    return `data:audio/mp4;base64,${b64}`;
  }
  // 'GkXf' indicates WebM EBML header
  if (sample.startsWith('GkXf')) {
    return `data:audio/webm;base64,${b64}`;
  }
  // 'UklGR' indicates WAV RIFF header
  if (sample.startsWith('UklGR')) {
    return `data:audio/wav;base64,${b64}`;
  }

  return trimmed;
}

/**
 * Returns the best supported audio MIME type for recording on the user's browser.
 * Safari prefers audio/mp4; Chrome/Firefox prefer audio/webm.
 */
export function getBestRecordingMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }
  const candidateTypes = [
    'audio/mp4',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/aac',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

/**
 * Known robotic, novelty, or low-quality meme synthesized voices on macOS, Windows, and Linux.
 * These must be strictly blacklisted to ensure professional, natural-sounding audio.
 */
const ROBOTIC_VOICE_BLACKLIST = new Set([
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'fred',
  'good news',
  'hysterical',
  'jester',
  'junior',
  'organ',
  'princess',
  'ralph',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
]);

export function isBlacklistedVoice(voiceName: string): boolean {
  const lower = voiceName.toLowerCase().trim();
  for (const blocked of ROBOTIC_VOICE_BLACKLIST) {
    if (lower === blocked || lower.startsWith(blocked + ' ') || lower.includes(`(${blocked})`)) {
      return true;
    }
  }
  return false;
}

export interface NaturalVoiceOption {
  id: string;
  name: string;
  label: string;
  lang: string;
  accent: string;
}

/**
 * Returns available natural human voices, filtering out all robotic novelty voices.
 */
export function getAvailableNaturalVoices(): NaturalVoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const cleanVoices = voices.filter((v) => v.lang.startsWith('en') && !isBlacklistedVoice(v.name));

  return cleanVoices.map((v) => {
    let accent = 'US English';
    if (v.lang.includes('GB') || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('daniel')) {
      accent = 'UK English';
    } else if (v.lang.includes('IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('rishi')) {
      accent = 'Indian English';
    } else if (v.lang.includes('AU') || v.name.toLowerCase().includes('karen')) {
      accent = 'Australian English';
    }

    return {
      id: v.name,
      name: v.name,
      label: `${v.name.replace(/\(.*?\)/g, '').trim()} (${accent})`,
      lang: v.lang,
      accent,
    };
  });
}

/**
 * Selects the absolute best studio-quality natural voice available.
 * Prioritizes Apple Enhanced (Samantha, Daniel), Google Neural, and Microsoft Natural.
 */
export function getBestNaturalVoice(preferredName?: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter out all robotic novelty voices
  const cleanVoices = voices.filter((v) => !isBlacklistedVoice(v.name));

  // If user has a selected voice preference
  if (preferredName) {
    const match = cleanVoices.find((v) => v.name.toLowerCase().includes(preferredName.toLowerCase()));
    if (match) return match;
  }

  // Tier 1 Priority: Crystal-clear, studio-grade voices
  const tier1Priority = [
    'Samantha (Enhanced)',
    'Samantha',
    'Ava (Enhanced)',
    'Ava',
    'Daniel (Enhanced)',
    'Daniel (English (UK))',
    'Daniel',
    'Google US English',
    'Google UK English Female',
    'Google UK English Male',
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Rishi (English (India))',
    'Rishi',
    'Karen (Enhanced)',
    'Karen',
    'Flo (English (US))',
    'Eddy (English (US))',
    'Shelley (English (UK))',
    'Reed (English (US))',
    'Moira',
    'Tessa',
  ];

  for (const name of tier1Priority) {
    const match = cleanVoices.find(
      (v) => v.name.toLowerCase().includes(name.toLowerCase()) && v.lang.startsWith('en')
    );
    if (match) return match;
  }

  // Tier 2 Priority: Any Enhanced / Natural / Neural labeled voice
  const enhanced = cleanVoices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('neural') ||
        v.name.toLowerCase().includes('premium'))
  );
  if (enhanced) return enhanced;

  // Tier 3 Priority: First clean English voice
  const englishVoice = cleanVoices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) return englishVoice;

  return cleanVoices[0] || voices[0] || null;
}

/**
 * Speaks text with natural human cadence, pitch, and high-fidelity pronunciation.
 */
export function speakNaturalText(
  text: string,
  options?: {
    preferredVoiceName?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const bestVoice = getBestNaturalVoice(options?.preferredVoiceName);

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  } else {
    utterance.lang = 'en-US';
  }

  // Professional, natural conversational cadence (0.92 feels calm and human, avoiding rush)
  utterance.rate = options?.rate ?? 0.92;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
