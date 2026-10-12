import { createWavHeader } from '../../wavUtils.js';

/** Deterministic integer PCM, optionally with an odd-sized RIFF metadata chunk. */
export function createTestWav({ durationSeconds = 4, sampleRate = 16000, channels = 1, bitsPerSample = 16, metadata = false } = {}) {
  const frames = Math.round(durationSeconds * sampleRate);
  const pcm = Buffer.alloc(frames * channels * bitsPerSample / 8);
  for (let i = 0; i < pcm.length; i++) pcm[i] = (i * 37 + Math.floor(i / 7)) % 256;
  const header = createWavHeader(pcm.length, sampleRate, channels, bitsPerSample);
  if (!metadata) return Buffer.concat([header, pcm]);
  const junk = Buffer.alloc(12);
  junk.write('JUNK');
  junk.writeUInt32LE(3, 4);
  junk.write('abc', 8);
  const wav = Buffer.concat([header.subarray(0, 12), junk, header.subarray(12), pcm]);
  wav.writeUInt32LE(wav.length - 8, 4);
  return wav;
}

export function wavDataUrl(buffer) {
  return `data:audio/wav;base64,${buffer.toString('base64')}`;
}
