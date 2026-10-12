import { ensureWavBuffer } from '../wavUtils.js';

export function extractAudioDataFromCandidate(candidate, candidateModel) {
  if (!candidate || !candidate.content?.parts) return null;

  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
  }

  const textPart = candidate.content.parts.find(p => p.text)?.text;
  if (textPart) {
    console.warn(`[Gemini] Model ${candidateModel} returned text instead of audio: "${textPart.slice(0, 60)}..."`);
  }
  return null;
}

export function processRawAudioToWav(base64Data, sampleRate = 24000) {
  const rawAudioBuffer = Buffer.from(base64Data, 'base64');
  return ensureWavBuffer(rawAudioBuffer, sampleRate);
}

export function estimateWavDuration(audioBuffer, sampleRate = 24000) {
  const pcmLength = Math.max(0, audioBuffer.length - 44);
  return Math.round(((pcmLength / (sampleRate * 2)) + Number.EPSILON) * 100) / 100;
}

export function cleanTranscriptText(text) {
  return (text || '').replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();
}

export function packageSpeechResult({
  audioBuffer,
  text,
  cleanVoice,
  successfulModel,
  successfulKeyMasked,
  uniqueTags,
  langAnalysis
}) {
  const durationSeconds = estimateWavDuration(audioBuffer, 24000);
  const cleanText = cleanTranscriptText(text) || text.trim();

  return {
    audioBuffer,
    cleanText,
    detectedTags: uniqueTags,
    mimeType: 'audio/wav',
    durationSeconds,
    sampleRate: 24000,
    voiceName: cleanVoice || 'Puck',
    modelId: successfulModel,
    usedKeyMasked: successfulKeyMasked,
    isMultilingual: langAnalysis.isMultilingual,
    characters: Array.from(cleanText)
  };
}
