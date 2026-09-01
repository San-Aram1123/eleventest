/**
 * Audio / WAV utility functions.
 * Handles PCM 16-bit to standard RIFF WAV header wrapping and audio verification.
 */

/**
 * Creates a standard 44-byte RIFF WAV header for 16-bit PCM audio.
 * @param {number} pcmDataLength - Length of the PCM data in bytes.
 * @param {number} sampleRate - Sample rate (e.g. 44100 or 24000).
 * @param {number} numChannels - Number of audio channels (1 for mono, 2 for stereo).
 * @param {number} bitsPerSample - Bits per sample (usually 16).
 * @returns {Buffer} 44-byte WAV header Buffer.
 */
export function createWavHeader(pcmDataLength, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  // RIFF chunk descriptor
  header.write('RIFF', 0); // ChunkID
  header.writeUInt32LE(36 + pcmDataLength, 4); // ChunkSize = 36 + SubChunk2Size
  header.write('WAVE', 8); // Format

  // "fmt " sub-chunk
  header.write('fmt ', 12); // Subchunk1ID
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(byteRate, 28); // ByteRate
  header.writeUInt16LE(blockAlign, 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34); // BitsPerSample

  // "data" sub-chunk
  header.write('data', 36); // Subchunk2ID
  header.writeUInt32LE(pcmDataLength, 40); // Subchunk2Size

  return header;
}

/**
 * Ensures the given buffer is a valid WAV file.
 * If it's already a valid RIFF WAV, returns as-is.
 * If it's raw PCM, wraps it in a standard WAV header.
 * @param {Buffer} buffer 
 * @param {number} sampleRate 
 * @returns {Buffer}
 */
export function ensureWavBuffer(buffer, sampleRate = 44100) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Audio buffer is empty');
  }

  // Check if buffer already starts with "RIFF" and "WAVE"
  if (buffer.length >= 12 && 
      buffer.toString('ascii', 0, 4) === 'RIFF' && 
      buffer.toString('ascii', 8, 12) === 'WAVE') {
    return buffer;
  }

  // Check if buffer is already a valid MP3 stream (ID3 or MPEG sync 0xFF)
  if ((buffer.length >= 3 && buffer.toString('ascii', 0, 3) === 'ID3') ||
      (buffer.length >= 2 && buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
    return buffer;
  }

  // If raw PCM data, wrap it in a standard WAV header
  const header = createWavHeader(buffer.length, sampleRate, 1, 16);
  return Buffer.concat([header, buffer]);
}
