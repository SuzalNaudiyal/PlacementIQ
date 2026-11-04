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
