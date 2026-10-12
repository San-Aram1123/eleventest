// All 26 Google Gemini Female HD Voices (Gemini 3.8 + Gemini 3.1)
export const GEMINI_FEMALE_VOICES = new Set([
  // Gemini 3.8 Headline Female Voices
  'lora', 'nyla', 'sola', 'tari', 'lumi', 'nika', 'riko', 'rina', 'tavi', 'tova', 'veda', 'zali', 'zuri',
  // Gemini 3.1 & Classic HD Female Voices
  'aoede', 'kore', 'zephyr', 'leda', 'callirrhoe', 'autonoe', 'despina', 
  'erinome', 'laomedeia', 'achernar', 'gacrux', 'vindemiatrix', 'sulafat'
]);

// All 26 Google Gemini Male HD Voices (Gemini 3.8 + Gemini 3.1)
export const GEMINI_MALE_VOICES = new Set([
  // Gemini 3.8 Headline Male Voices
  'arlo', 'knox', 'rami', 'mako', 'milo', 'koda', 'ludo', 'neno', 'olin', 'sami', 'varo', 'zeno',
  // Gemini 3.1 & Classic HD Male Voices
  'puck', 'charon', 'fenrir', 'orus', 'enceladus', 'iapetus', 'umbriel', 
  'algieba', 'algenib', 'rasalgethi', 'alnilam', 'schedar', 'pulcherrima', 
  'achird', 'zubenelgenubi', 'sadachbia', 'sadaltager'
]);

/**
 * Resolves the gender of a sample accurately.
 * Checks voice_gender, gender, customMetadata, and known voice names.
 */
export function resolveSampleGender(sample) {
  if (!sample) return 'male';
  const g = String(
    sample.voice_gender ||
    sample.gender ||
    sample.customMetadata?.voice_gender ||
    sample.customMetadata?.gender ||
    sample.metadata_extra?.voice_gender ||
    sample.metadata_extra?.gender ||
    ''
  ).toLowerCase().trim();

  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';

  // Check speaker id: e.g. spk01 (male), spk02 (female)
  const spkMatch = String(sample.speaker_name || sample.id || sample.customMetadata?.speaker_name || '').match(/spk(\d+)/i);
  if (spkMatch) {
    const spkNum = parseInt(spkMatch[1], 10);
    if (!isNaN(spkNum)) {
      return spkNum % 2 === 0 ? 'female' : 'male';
    }
  }

  const v = String(sample.voice_name || sample.voice_id || sample.voiceName || sample.voiceId || '').toLowerCase();
  const clean = v.replace(/^gemini[\s_]*\(?|\)$/gi, '').trim();

  if (GEMINI_FEMALE_VOICES.has(clean)) return 'female';
  if (GEMINI_MALE_VOICES.has(clean)) return 'male';

  for (const name of GEMINI_FEMALE_VOICES) {
    if (v.includes(name)) return 'female';
  }
  for (const name of GEMINI_MALE_VOICES) {
    if (v.includes(name)) return 'male';
  }

  // Common ElevenLabs female voices fallback
  if (v.includes('rachel') || v.includes('sarah') || v.includes('charlotte') || v.includes('alice') || v.includes('lily') || v.includes('nicole') || v.includes('glinda') || v.includes('mimi') || v.includes('freya') || v.includes('dorothy') || v.includes('serena')) {
    return 'female';
  }

  return 'male';
}
