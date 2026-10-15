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
  outputFormat
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

  const response = await fetch(urlWithTimestamps, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
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
  let isQuotaError = response.status === 401 || response.status === 402 || response.status === 429;
  let parsedMsg = errorText;
  try {
    const errJson = JSON.parse(errorText);
    parsedMsg = errJson.detail?.message || errJson.message || errorText;
    if (errJson.detail?.status === 'quota_exceeded' || parsedMsg.toLowerCase().includes('quota') || parsedMsg.toLowerCase().includes('credit') || parsedMsg.toLowerCase().includes('character limit')) {
      isQuotaError = true;
    }
  } catch {}

  // If quota / auth error, throw immediately with quota flag
  if (isQuotaError) {
    const quotaErr = new Error(`Key quota exhausted / auth error (${response.status}): ${parsedMsg}`);
    quotaErr.isQuotaError = true;
    quotaErr.statusCode = response.status;
    throw quotaErr;
  }

  // Try standard endpoint fallback
  const fallbackUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`;
  const fallbackResponse = await fetch(fallbackUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/*'
    },
    body: JSON.stringify(requestBody)
  });

  if (!fallbackResponse.ok) {
    const fallbackErr = await fallbackResponse.text();
    let fbMsg = fallbackErr;
    let fbIsQuota = fallbackResponse.status === 401 || fallbackResponse.status === 402 || fallbackResponse.status === 429;
    try {
      const errJson = JSON.parse(fallbackErr);
      fbMsg = errJson.detail?.message || errJson.message || fallbackErr;
      if (errJson.detail?.status === 'quota_exceeded' || fbMsg.toLowerCase().includes('quota')) {
        fbIsQuota = true;
      }
    } catch {}
    const err = new Error(`ElevenLabs API generation failed (${fallbackResponse.status}): ${fbMsg}`);
    err.isQuotaError = fbIsQuota;
    err.statusCode = fallbackResponse.status;
    throw err;
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
