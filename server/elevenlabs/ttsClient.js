import { elevenLabsFailure } from './quotaError.js';
import { trackedSpeechFetch } from '../shared/requestStatistics.js';
import { ensureWavBuffer } from '../wavUtils.js';
import { ELEVENLABS_BASE_URL } from './keyPoolManager.js';

/**
 * Performs a single TTS request with a specific key.
 */
export async function callElevenLabsTTS({
  apiKey,
  text,
  voiceId,
  modelId,
  voiceSettings,
  outputFormat,
  signal
}) {
  const urlWithTimestamps = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${encodeURIComponent(outputFormat)}`;

  const requestBody = {
    text,
    model_id: modelId,
    voice_settings: {
      stability: voiceSettings.stability ?? 0.5,
      similarity_boost: voiceSettings.similarity_boost ?? 0.75,
      style: voiceSettings.style ?? 0.0,
      use_speaker_boost: voiceSettings.use_speaker_boost ?? true
    }
  };

  const response = await trackedSpeechFetch('elevenlabs', apiKey, modelId, urlWithTimestamps, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  const generationId = response.headers.get('history-item-id') || 
                       response.headers.get('request-id') || 
                       'gen_' + Date.now();

  const sampleRateMatch = String(outputFormat || '').match(/(\d{4,5})/);
  const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 44100;

  if (response.ok) {
    const data = await response.json();
    const rawAudioBase64 = data.audio_base64;
    if (!rawAudioBase64) {
      throw new Error('ElevenLabs API returned response without audio data');
    }

    const rawBuffer = Buffer.from(rawAudioBase64, 'base64');
    const audioBuffer = ensureWavBuffer(rawBuffer, sampleRate);

    return {
      audioBuffer,
      alignment: data.alignment || null,
      characters: data.alignment?.characters || [],
      generationId
    };
  }

  // Handle fallback to binary stream
  const errorText = await response.text();
  const firstError = elevenLabsFailure(response.status, errorText, apiKey);
  if (firstError.isQuotaError) throw firstError;

  // Try standard endpoint fallback
  const fallbackUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`;
  const fallbackResponse = await trackedSpeechFetch('elevenlabs', apiKey, modelId, fallbackUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/*'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!fallbackResponse.ok) {
    const fallbackErr = await fallbackResponse.text();
    throw elevenLabsFailure(fallbackResponse.status, fallbackErr, apiKey);
  }

  const rawArrayBuffer = await fallbackResponse.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);
  const audioBuffer = ensureWavBuffer(rawBuffer, sampleRate);

  return {
    audioBuffer,
    alignment: null,
    characters: [],
    generationId: fallbackResponse.headers.get('history-item-id') || 'gen_' + Date.now()
  };
}
