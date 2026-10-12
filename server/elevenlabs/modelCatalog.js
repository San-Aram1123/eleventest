import { getKeyPool, ELEVENLABS_BASE_URL } from './keyPoolManager.js';

export function getDefaultModels() {
  return [
    {
      model_id: 'eleven_v3',
      name: 'ElevenLabs v3',
      description: 'Latest flagship model with emotional audio tags support ([laugh], [whisper], [sigh], [angry]).'
    },
    {
      model_id: 'eleven_multilingual_v3',
      name: 'Eleven Multilingual v3',
      description: 'Multilingual v3 synthesis with rich expressive control.'
    },
    {
      model_id: 'eleven_turbo_v3',
      name: 'Eleven Turbo v3',
      description: 'Ultra-fast low latency v3 synthesis.'
    },
    {
      model_id: 'eleven_multilingual_v2',
      name: 'Eleven Multilingual v2',
      description: 'Stable multilingual synthesis across 29 languages including Arabic & Kurdish script.'
    },
    {
      model_id: 'eleven_turbo_v2_5',
      name: 'Eleven Turbo v2.5',
      description: 'Fast multilingual generation.'
    },
    {
      model_id: 'eleven_flash_v2_5',
      name: 'Eleven Flash v2.5',
      description: 'Ultra low latency 75ms response time.'
    }
  ];
}

/**
 * Fetch available voices from ElevenLabs using the first working key.
 */
export async function getVoices(overrideKey) {
  const pool = overrideKey ? [overrideKey] : getKeyPool();
  if (pool.length === 0) {
    throw new Error('ElevenLabs API Key is required to fetch voices');
  }

  let lastError = null;
  for (const key of pool) {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: { 'xi-api-key': key }
      });

      if (response.ok) {
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
      lastError = new Error(await response.text());
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Failed to fetch voices with key pool: ${lastError?.message}`);
}

/**
 * Fetch available models from ElevenLabs.
 */
export async function getModels(overrideKey) {
  const pool = overrideKey ? [overrideKey] : getKeyPool();
  if (pool.length === 0) {
    return getDefaultModels();
  }

  for (const key of pool) {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
        headers: { 'xi-api-key': key }
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
    } catch (e) {
      // Continue to next key
    }
  }

  return getDefaultModels();
}
