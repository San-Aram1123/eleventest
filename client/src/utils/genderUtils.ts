// All 13 Google Gemini Female HD Voices
export const GEMINI_FEMALE_VOICES = new Set([
  'aoede', 'kore', 'zephyr', 'leda', 'callirrhoe', 'autonoe', 'despina',
  'erinome', 'laomedeia', 'achernar', 'gacrux', 'vindemiatrix', 'sulafat'
]);

// All 17 Google Gemini Male HD Voices
export const GEMINI_MALE_VOICES = new Set([
  'puck', 'charon', 'fenrir', 'orus', 'enceladus', 'iapetus', 'umbriel',
  'algieba', 'algenib', 'rasalgethi', 'alnilam', 'schedar', 'pulcherrima',
  'achird', 'zubenelgenubi', 'sadachbia', 'sadaltager'
]);

/**
 * Determines voice gender of any sample record.
 */
export function getSampleGender(s: any): 'male' | 'female' {
  if (!s) return 'male';

  const g = String(
    s.voice_gender ||
    s.gender ||
    s.customMetadata?.voice_gender ||
    s.metadata_extra?.voice_gender ||
    ''
  ).toLowerCase().trim();

  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';

  const v = String(s.voice_name || s.voice_id || s.voiceName || s.voiceId || '').toLowerCase();
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
  if (
    v.includes('rachel') || v.includes('sarah') || v.includes('charlotte') ||
    v.includes('alice') || v.includes('lily') || v.includes('nicole') ||
    v.includes('glinda') || v.includes('mimi') || v.includes('freya') ||
    v.includes('dorothy') || v.includes('serena')
  ) {
    return 'female';
  }

  return 'male';
}
