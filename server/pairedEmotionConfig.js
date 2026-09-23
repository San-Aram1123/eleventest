/**
 * Paired Emotion Dataset Configuration & Voice Presets
 * Standards compliant with Kurdish TTS training (F5-TTS, StyleTTS2)
 */

export const REQUIRED_EMOTIONS = [
  { id: 'neutral', name: 'Neutral', kurdish: 'ئاسایی', defaultIntensity: 0.0, description: 'Natural, steady, conversational tone' },
  { id: 'happy', name: 'Happy', kurdish: 'دڵخۆش', defaultIntensity: 0.8, description: 'Warm, cheerful, upbeat intonation' },
  { id: 'laugh', name: 'Laugh', kurdish: 'پێکەنین', defaultIntensity: 0.8, description: 'Playful, smiling, chuckle-infused tone' },
  { id: 'sad', name: 'Sad', kurdish: 'خەمبار', defaultIntensity: 0.8, description: 'Subdued, sorrowful, melancholic tone' },
  { id: 'angry', name: 'Angry', kurdish: 'تووڕە', defaultIntensity: 0.9, description: 'Sharp, forceful, agitated expression' },
  { id: 'whisper', name: 'Whisper', kurdish: 'چرپە', defaultIntensity: 0.7, description: 'Soft, quiet, breathy confidential whisper' }
];

export const OPTIONAL_EMOTIONS = [
  { id: 'excited', name: 'Excited', kurdish: 'حەماسی', defaultIntensity: 0.8, description: 'High energy, enthusiastic expression' },
  { id: 'sigh', name: 'Sigh', kurdish: 'ئاخ / ئاهـ', defaultIntensity: 0.7, description: 'Weary, relieved or heavy breathy sigh' },
  { id: 'tender', name: 'Tender', kurdish: 'نەرم و میهرەبان', defaultIntensity: 0.7, description: 'Gentle, affectionate, soothing tone' },
  { id: 'fearful', name: 'Fearful', kurdish: 'ترساو', defaultIntensity: 0.8, description: 'Trembling, urgent, anxious tone' },
  { id: 'curious', name: 'Curious', kurdish: 'سەرسام / پرسیارکەر', defaultIntensity: 0.7, description: 'Inquisitive, questioning intonation' }
];

export const ALL_EMOTIONS = [...REQUIRED_EMOTIONS, ...OPTIONAL_EMOTIONS];

// Map 20 diverse speakers to Google Gemini HD voices (10 Male, 10 Female)
export const SPEAKER_PRESETS = [
  { id: 'spk01', name: 'Speaker 01 (Puck)', voice: 'Puck', gender: 'male', description: 'Upbeat and lively' },
  { id: 'spk02', name: 'Speaker 02 (Aoede)', voice: 'Aoede', gender: 'female', description: 'Warm and natural' },
  { id: 'spk03', name: 'Speaker 03 (Fenrir)', voice: 'Fenrir', gender: 'male', description: 'Passionate and strong' },
  { id: 'spk04', name: 'Speaker 04 (Zephyr)', voice: 'Zephyr', gender: 'female', description: 'Bright and clear' },
  { id: 'spk05', name: 'Speaker 05 (Orus)', voice: 'Orus', gender: 'male', description: 'Calm and steady' },
  { id: 'spk06', name: 'Speaker 06 (Leda)', voice: 'Leda', gender: 'female', description: 'Youthful and energetic' },
  { id: 'spk07', name: 'Speaker 07 (Enceladus)', voice: 'Enceladus', gender: 'male', description: 'Soft and gentle' },
  { id: 'spk08', name: 'Speaker 08 (Kore)', voice: 'Kore', gender: 'female', description: 'Relaxed and pleasant' },
  { id: 'spk09', name: 'Speaker 09 (Iapetus)', voice: 'Iapetus', gender: 'male', description: 'Crisp and articulate' },
  { id: 'spk10', name: 'Speaker 10 (Callirrhoe)', voice: 'Callirrhoe', gender: 'female', description: 'Smooth and refined' },
  { id: 'spk11', name: 'Speaker 11 (Umbriel)', voice: 'Umbriel', gender: 'male', description: 'Easy-going and calm' },
  { id: 'spk12', name: 'Speaker 12 (Autonoe)', voice: 'Autonoe', gender: 'female', description: 'Engaging narrator' },
  { id: 'spk13', name: 'Speaker 13 (Algieba)', voice: 'Algieba', gender: 'male', description: 'Smooth and melodic' },
  { id: 'spk14', name: 'Speaker 14 (Despina)', voice: 'Despina', gender: 'female', description: 'Warm and expressive' },
  { id: 'spk15', name: 'Speaker 15 (Rasalgethi)', voice: 'Rasalgethi', gender: 'male', description: 'Professional narrator' },
  { id: 'spk16', name: 'Speaker 16 (Erinome)', voice: 'Erinome', gender: 'female', description: 'Clear and soothing' },
  { id: 'spk17', name: 'Speaker 17 (Schedar)', voice: 'Schedar', gender: 'male', description: 'Balanced and firm' },
  { id: 'spk18', name: 'Speaker 18 (Laomedeia)', voice: 'Laomedeia', gender: 'female', description: 'Articulate and crisp' },
  { id: 'spk19', name: 'Speaker 19 (Pulcherrima)', voice: 'Pulcherrima', gender: 'male', description: 'Dynamic and forward' },
  { id: 'spk20', name: 'Speaker 20 (Achernar)', voice: 'Achernar', gender: 'female', description: 'Gentle and expressive' }
];

/**
 * Builds tailored prompt instructions for Gemini TTS for each emotion.
 */
export function getEmotionPromptDirective(emotion, intensity = 0.8, languageOrDialect = 'ckb') {
  const langKey = String(languageOrDialect || 'ckb').toLowerCase();
  
  let languageDirective = '';
  let langLabel = 'Kurdish Sorani';

  if (langKey === 'kmr' || langKey === 'badini') {
    langLabel = 'Northern Kurdish Badini (Kurmanji)';
    languageDirective = 'Authentic Kurdish Badini (Kurmanji) Duhok/Zakho dialect with precise vowels (ڤ, خ, ح, غ, ۆ, ێ, ە), never Sorani intonation.';
  } else if (langKey === 'ar' || langKey === 'arabic') {
    langLabel = 'Arabic (العربية)';
    languageDirective = 'Authentic, natural Arabic speech with clear Arabic phonetics and articulation (ع, ح, ص, ض, ط, ظ, ق).';
  } else if (langKey === 'en' || langKey === 'english') {
    langLabel = 'English';
    languageDirective = 'Clear, fluent English speech with natural native articulation and pronunciation.';
  } else {
    langLabel = 'Central Kurdish (Sorani / سۆرانی)';
    languageDirective = 'Authentic Central Kurdish (Sorani / سۆرانی) Erbil/Sulaymaniyah dialect with precise Kurdish vowels (ۆ, ێ, ە).';
  }

  const emotionMap = {
    neutral: 'Read in a neutral, clean, balanced conversational voice with no exaggerated emotion.',
    happy: `Read in a genuinely happy, smiling, and warm tone (intensity: ${intensity}). Express joy in the voice.`,
    sad: `Read in a sad, sorrowful, emotionally heavy tone (intensity: ${intensity}). Reflect genuine melancholy.`,
    angry: `Read in an irritated, angry, firm and intense tone (intensity: ${intensity}). Sound visibly frustrated.`,
    whisper: `Speak in a true whisper (intensity: ${intensity}). Use soft breathy vocalization without shouting.`,
    laugh: `Read in a cheerful, fully voiced smiling tone with audible laughter and amusement (intensity: ${intensity}). Must be fully voiced, never whisper.`,
    excited: `Read with high energy, vivid enthusiasm, and excitement (intensity: ${intensity}).`,
    sigh: `Read with a slight weary sigh or audible breath of exhaustion (intensity: ${intensity}).`,
    tender: `Read in a gentle, warm, loving, and tender tone (intensity: ${intensity}).`,
    fearful: `Read in a nervous, trembling, frightened tone (intensity: ${intensity}).`,
    curious: `Read with genuine curiosity and questioning inflection (intensity: ${intensity}).`
  };

  const directive = emotionMap[emotion] || emotionMap.neutral;

  return `You are an expert voice actor synthesizing a high-fidelity ${langLabel} speech training clip.
- Language / Dialect: ${languageDirective}
- Emotion Delivery: ${directive}
- Strict Rules: Speak ONLY the exact sentence provided. Do NOT add preamble, metadata, emotion words, or conversational filler.`;
}
