import { ensureWavBuffer } from './wavUtils.js';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Helper to get the active ElevenLabs API key.
 * Can be passed directly or read from process.env.ELEVENLABS_API_KEY.
 */
export function getApiKey(overrideKey) {
  const key = (overrideKey || process.env.ELEVENLABS_API_KEY || '').trim();
  return key;
}

/**
 * Validates the API key and fetches user subscription info.
 */
export async function validateApiKey(apiKey) {
  const key = getApiKey(apiKey);
  if (!key) {
    throw new Error('ElevenLabs API Key is not configured. Please set it in .env or Settings.');
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
    headers: {
      'xi-api-key': key
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `ElevenLabs API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      message = errJson.detail?.message || errJson.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Fetch available voices from ElevenLabs.
 */
export async function getVoices(apiKey) {
  const key = getApiKey(apiKey);
  if (!key) {
    throw new Error('ElevenLabs API Key is required to fetch voices');
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      'xi-api-key': key
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch voices: ${errorText}`);
  }

  const data = await response.json();
  return (data.voices || []).map(voice => ({
    voice_id: voice.voice_id,
    name: voice.name,
    category: voice.category,
    preview_url: voice.preview_url,
    labels: voice.labels || {},
    description: voice.description || ''
  }));
}

/**
 * Fetch available models from ElevenLabs.
 */
export async function getModels(apiKey) {
  const key = getApiKey(apiKey);
  if (!key) {
    return getDefaultModels();
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
      headers: {
        'xi-api-key': key
      }
    });

    if (response.ok) {
      const data = await response.json();
      return (data || []).map(m => ({
        model_id: m.model_id,
        name: m.name,
        description: m.description,
        can_do_text_to_speech: m.can_do_text_to_speech,
        can_do_voice_conversion: m.can_do_voice_conversion,
        languages: m.languages || []
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch remote models, using defaults:', err.message);
  }

  return getDefaultModels();
}

/**
 * Default fallback models.
 */
export function getDefaultModels() {
  return [
    {
      model_id: 'eleven_v3',
      name: 'ElevenLabs v3 (Audio Tags & Expressive)',
      description: 'Latest v3 model with native emotional tag support like [laugh], [whisper], [sigh], [gasp], [crying].'
    },
    {
      model_id: 'eleven_multilingual_v3',
      name: 'Eleven Multilingual v3',
      description: 'Advanced multilingual v3 speech synthesis.'
    },
    {
      model_id: 'eleven_turbo_v3',
      name: 'Eleven Turbo v3',
      description: 'Ultra fast v3 conversational and emotional model.'
    },
    {
      model_id: 'eleven_multilingual_v2',
      name: 'Eleven Multilingual v2',
      description: 'Multilingual model with emotional expression.'
    },
    {
      model_id: 'eleven_turbo_v2_5',
      name: 'Eleven Turbo v2.5',
      description: 'Ultra-low latency model supporting 32 languages.'
    },
    {
      model_id: 'eleven_flash_v2_5',
      name: 'Eleven Flash v2.5',
      description: 'Super fast multilingual model for interactive workflows.'
    },
    {
      model_id: 'eleven_flash_v2',
      name: 'Eleven Flash v2',
      description: 'Fast, lightweight speech model.'
    },
    {
      model_id: 'eleven_monolingual_v1',
      name: 'Eleven English v1',
      description: 'Standard English model.'
    }
  ];
}

/**
 * Generates speech with timestamps and alignment using ElevenLabs API.
 * 
 * @param {object} params
 * @param {string} params.text - The clean spoken Kurdish text.
 * @param {string} [params.emotionTag] - Audio tag or prompt to send to ElevenLabs (e.g. "[angry]").
 * @param {boolean} [params.includeTagInPrompt=true] - Whether to prepend the emotion tag to the API prompt.
 * @param {string} params.voiceId - ElevenLabs voice ID.
 * @param {string} [params.modelId='eleven_multilingual_v2'] - ElevenLabs model ID.
 * @param {object} [params.voiceSettings] - Stability, similarity_boost, style, speaker_boost.
 * @param {string} [params.apiKey] - Optional override API key.
 * @returns {Promise<{ audioBuffer: Buffer, alignment: object|null, characters: string[], generationId: string }>}
 */
export async function generateSpeech({
  text,
  emotionTag = '',
  includeTagInPrompt = true,
  voiceId,
  modelId = 'eleven_v3',
  voiceSettings = {},
  outputFormat = 'mp3_44100_128',
  apiKey
}) {
  const key = getApiKey(apiKey);
  if (!key) {
    throw new Error('ElevenLabs API Key is required for speech generation');
  }

  if (!text || !text.trim()) {
    throw new Error('Kurdish text input cannot be empty');
  }

  if (!voiceId) {
    throw new Error('Voice ID is required for speech generation');
  }

  // Construct prompt sent to ElevenLabs:
  // If an emotion tag like "[angry]" or "[laugh]" is provided and requested, prepend it to prompt text.
  // The original spoken transcript text is kept completely separate and clean in metadata.
  let promptText = text.trim();
  if (emotionTag && emotionTag.trim() && includeTagInPrompt) {
    const cleanTag = emotionTag.trim();
    promptText = `${cleanTag} ${promptText}`;
  }

  // First try: with-timestamps endpoint (which returns alignment metadata)
  // Requesting output_format=mp3_44100_128 (available on all ElevenLabs tiers: Free, Starter, Creator, Pro)
  const urlWithTimestamps = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${encodeURIComponent(outputFormat)}`;

  const requestBody = {
    text: promptText,
    model_id: modelId,
    voice_settings: {
      stability: voiceSettings.stability ?? 0.5,
      similarity_boost: voiceSettings.similarity_boost ?? 0.75,
      style: voiceSettings.style ?? 0.0,
      use_speaker_boost: voiceSettings.use_speaker_boost ?? true
    }
  };

  let response;
  try {
    response = await fetch(urlWithTimestamps, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  } catch (netErr) {
    throw new Error(`Network error contacting ElevenLabs API: ${netErr.message}`);
  }

  const generationId = response.headers.get('history-item-id') || 
                       response.headers.get('request-id') || 
                       'gen_' + Date.now();

  if (response.ok) {
    const data = await response.json();
    const rawAudioBase64 = data.audio_base64;
    if (!rawAudioBase64) {
      throw new Error('ElevenLabs API returned response without audio data');
    }

    const rawBuffer = Buffer.from(rawAudioBase64, 'base64');
    const audioBuffer = ensureWavBuffer(rawBuffer, 44100);

    const alignment = data.alignment || null;
    const characters = alignment?.characters || [];

    return {
      audioBuffer,
      alignment,
      characters,
      generationId
    };
  }

  // If with-timestamps returned an error (for example, if a model or tier does not support with-timestamps),
  // fallback to standard stream/binary endpoint
  const errorText = await response.text();
  console.warn(`with-timestamps endpoint returned status ${response.status}: ${errorText}. Attempting fallback to standard TTS endpoint...`);

  const fallbackUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`;
  const fallbackResponse = await fetch(fallbackUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      'Accept': 'audio/*'
    },
    body: JSON.stringify(requestBody)
  });

  if (!fallbackResponse.ok) {
    const fallbackErr = await fallbackResponse.text();
    let parsedMsg = fallbackErr;
    try {
      const errJson = JSON.parse(fallbackErr);
      parsedMsg = errJson.detail?.message || errJson.message || fallbackErr;
    } catch {}
    throw new Error(`ElevenLabs API generation failed (${fallbackResponse.status}): ${parsedMsg}`);
  }

  const rawArrayBuffer = await fallbackResponse.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);
  const wavBuffer = ensureWavBuffer(rawBuffer, 44100);

  return {
    audioBuffer: wavBuffer,
    alignment: null,
    characters: [],
    generationId: fallbackResponse.headers.get('history-item-id') || 'gen_' + Date.now()
  };
}
