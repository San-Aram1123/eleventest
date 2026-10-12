import { createWavHeader } from '../wavUtils.js';

export const MAX_LAB_AUDIO_BYTES = 50 * 1024 * 1024;

// Read RIFF chunks instead of assuming every WAV has a 44-byte header.
export function readPcmWav(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 44 || buffer.length > MAX_LAB_AUDIO_BYTES) {
    throw new Error('Provide a nonempty PCM WAV smaller than 50 MB.');
  }
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Audio must be a RIFF PCM WAV file.');
  }
  let format, data;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const name = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > buffer.length) throw new Error('WAV contains a truncated chunk.');
    if (name === 'fmt ' && size >= 16) {
      format = {
        encoding: buffer.readUInt16LE(start), channels: buffer.readUInt16LE(start + 2),
        sampleRate: buffer.readUInt32LE(start + 4), blockAlign: buffer.readUInt16LE(start + 12),
        bitsPerSample: buffer.readUInt16LE(start + 14)
      };
    }
    if (name === 'data' && !data) data = buffer.subarray(start, start + size);
    offset = start + size + (size % 2);
  }
  if (!format || !data?.length || format.encoding !== 1 || ![16, 32].includes(format.bitsPerSample)
    || ![1, 2].includes(format.channels) || format.sampleRate < 8000 || format.sampleRate > 96000
    || format.blockAlign !== format.channels * format.bitsPerSample / 8 || data.length % format.blockAlign) {
    throw new Error('Use mono/stereo 16-bit or 32-bit integer PCM WAV at 8–96 kHz.');
  }
  const frames = data.length / format.blockAlign;
  const duration = frames / format.sampleRate;
  if (duration > 600) throw new Error('Lab masters must be at most 10 minutes long.');
  return { ...format, frames, duration, data };
}

export function decodeWavDataUrl(value) {
  if (typeof value !== 'string' || !/^data:audio\/(?:wav|wave|x-wav);base64,[A-Za-z0-9+/=\r\n]+$/.test(value)) {
    throw new Error('Reference audio must be a base64 PCM WAV.');
  }
  const buffer = Buffer.from(value.slice(value.indexOf(',') + 1), 'base64');
  readPcmWav(buffer);
  return buffer;
}

// A single shared sample index defines each handoff. No trimming, ASR, or fades:
// concatenating these clips reconstructs the master's PCM exactly.
export function slicePcmWav(buffer, segments) {
  const wav = readPcmWav(buffer);
  let previousFrame = 0;
  return segments.map((segment, index) => {
    const start = Math.round(segment.start * wav.sampleRate);
    const end = Math.round(segment.end * wav.sampleRate);
    if (start !== previousFrame || end <= start || end > wav.frames
      || (index === segments.length - 1 && end !== wav.frames)) {
      throw new Error('Unsafe PCM slice boundaries: clips must cover the master exactly once.');
    }
    previousFrame = end;
    const pcm = wav.data.subarray(start * wav.blockAlign, end * wav.blockAlign);
    return Buffer.concat([createWavHeader(pcm.length, wav.sampleRate, wav.channels, wav.bitsPerSample), pcm]);
  });
}
