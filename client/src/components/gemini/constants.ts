import { GeminiVoice, GeminiModel } from '../../types';

export const FALLBACK_GEMINI_VOICES: GeminiVoice[] = [
  // --- Male Voices (29) ---
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Upbeat and lively tone (Recommended Default)' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Informative, authoritative, and measured narrator tone' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Passionate, strong, energetic tone' },
  { id: 'Orus', name: 'Orus', gender: 'Male', description: 'Calm, steady, firm tone' },
  { id: 'Enceladus', name: 'Enceladus', gender: 'Male', description: 'Soft, breathy, gentle tone' },
  { id: 'Iapetus', name: 'Iapetus', gender: 'Male', description: 'Clear, crisp, clean tone' },
  { id: 'Umbriel', name: 'Umbriel', gender: 'Male', description: 'Relaxed, easy-going, smooth tone' },
  { id: 'Algieba', name: 'Algieba', gender: 'Male', description: 'Smooth, flowing, melodic tone' },
  { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', description: 'Professional, articulate narrator tone' },
  { id: 'Schedar', name: 'Schedar', gender: 'Male', description: 'Even, balanced, steady tone' },
  { id: 'Pulcherrima', name: 'Pulcherrima', gender: 'Male', description: 'Forward, enterprising, dynamic tone' },
  { id: 'Achird', name: 'Achird', gender: 'Male', description: 'Friendly, warm, kind tone' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', gender: 'Male', description: 'Casual, relaxed, conversational tone' },
  { id: 'Algenib', name: 'Algenib', gender: 'Male', description: 'Gravelly, textured, hearty tone' },
  { id: 'Alnilam', name: 'Alnilam', gender: 'Male', description: 'Firm, confident, commanding tone' },
  { id: 'Sadachbia', name: 'Sadachbia', gender: 'Male', description: 'Lively, animated, engaging tone' },
  { id: 'Sadaltager', name: 'Sadaltager', gender: 'Male', description: 'Knowledgeable, wise, steady tone' },
  { id: 'Arlo', name: 'Arlo', gender: 'Male', description: 'Warm, approachable, natural tone' },
  { id: 'Knox', name: 'Knox', gender: 'Male', description: 'Conversational, dry humor, warm tone' },
  { id: 'Koda', name: 'Koda', gender: 'Male', description: 'Objective, direct, helpful tone' },
  { id: 'Ludo', name: 'Ludo', gender: 'Male', description: 'Confident, clear, instructional tone' },
  { id: 'Mako', name: 'Mako', gender: 'Male', description: 'Energetic, colorful, fast-paced tone' },
  { id: 'Milo', name: 'Milo', gender: 'Male', description: 'Intimate, conversational talkshow tone' },
  { id: 'Neno', name: 'Neno', gender: 'Male', description: 'Deep, velvety, unhurried tone' },
  { id: 'Olin', name: 'Olin', gender: 'Male', description: 'Light, airy, precise tone' },
  { id: 'Rami', name: 'Rami', gender: 'Male', description: 'Professional, modern interviewer tone' },
  { id: 'Riko', name: 'Riko', gender: 'Male', description: 'Clear, confident documentary narrator tone' },
  { id: 'Varo', name: 'Varo', gender: 'Male', description: 'Laid-back, encouraging, chill tone' },
  { id: 'Zeno', name: 'Zeno', gender: 'Male', description: 'Cool, confident, collaborative tone' },

  // --- Female Voices (26) ---
  { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Relaxed, natural, gentle tone (Recommended Default)' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Bright, clear, vibrant tone' },
  { id: 'Leda', name: 'Leda', gender: 'Female', description: 'Youthful, energetic, cheerful tone' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'Female', description: 'Friendly, warm, easy-going tone' },
  { id: 'Autonoe', name: 'Autonoe', gender: 'Female', description: 'Bright, cheerful, lively tone' },
  { id: 'Despina', name: 'Despina', gender: 'Female', description: 'Smooth, gentle, velvety tone' },
  { id: 'Erinome', name: 'Erinome', gender: 'Female', description: 'Clear, articulate, refined tone' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'Female', description: 'Positive, upbeat, sunny tone' },
  { id: 'Achernar', name: 'Achernar', gender: 'Female', description: 'Soft, warm, delicate tone' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', gender: 'Female', description: 'Gentle, delicate, intimate tone' },
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Firm, direct, authoritative tone' },
  { id: 'Sulafat', name: 'Sulafat', gender: 'Female', description: 'Warm, inviting, comforting tone' },
  { id: 'Gacrux', name: 'Gacrux', gender: 'Female', description: 'Mature, authoritative, professional tone' },
  { id: 'Lora', name: 'Lora', gender: 'Female', description: 'Clear, friendly, medium-pitch tone' },
  { id: 'Lumi', name: 'Lumi', gender: 'Female', description: 'Professional, approachable teacher tone' },
  { id: 'Nika', name: 'Nika', gender: 'Female', description: 'Professional, creative, approachable tone' },
  { id: 'Nyla', name: 'Nyla', gender: 'Female', description: 'Confident, clear, modern tone' },
  { id: 'Rina', name: 'Rina', gender: 'Female', description: 'Relaxed, friendly host tone' },
  { id: 'Sami', name: 'Sami', gender: 'Female', description: 'Cool, confident, collaborative narrator tone' },
  { id: 'Sola', name: 'Sola', gender: 'Female', description: 'Relaxed, pleasant, clear tone' },
  { id: 'Tari', name: 'Tari', gender: 'Female', description: 'Confident, expressive, cinematic tone' },
  { id: 'Tavi', name: 'Tavi', gender: 'Female', description: 'Intimate, stylish talkshow tone' },
  { id: 'Tova', name: 'Tova', gender: 'Female', description: 'Textured, resonant, soothing tone' },
  { id: 'Veda', name: 'Veda', gender: 'Female', description: 'Highly approachable, warm radio host tone' },
  { id: 'Zali', name: 'Zali', gender: 'Female', description: 'Engaging, empathic, lively tone' },
  { id: 'Zuri', name: 'Zuri', gender: 'Female', description: 'Natural, clear, articulate advisor tone' }
];

export const GEMINI_EMOTION_TAGS = [
  { tag: '[laugh]', label: 'Laugh', desc: 'Natural Kurdish laughter inflection', color: '#10B981' },
  { tag: '[whisper]', label: 'Whisper', desc: 'Soft breathy whisper', color: '#A78BFA' },
  { tag: '[happy]', label: 'Happy', desc: 'Joyful & cheerful delivery', color: '#F59E0B' },
  { tag: '[sad]', label: 'Sad', desc: 'Melancholic & slow cadence', color: '#60A5FA' },
  { tag: '[angry]', label: 'Angry', desc: 'Sharp intense emphasis', color: '#EF4444' },
  { tag: '[sigh]', label: 'Sigh', desc: 'Expressive sigh / breath', color: '#38BDF8' },
  { tag: '[shouting]', label: 'Shout', desc: 'Loud energetic exclamation', color: '#EC4899' },
  { tag: '[giggle]', label: 'Giggle', desc: 'Light cheerful giggle', color: '#34D399' },
  { tag: '[crying]', label: 'Crying', desc: 'Emotional tearful tone', color: '#818CF8' }
];

/**
 * Strict Model Policy: Gemini 2.5 is completely excluded.
 * Only Gemini 3.8 and 3.1 models are permitted.
 */
export const DEFAULT_GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-3.8-flash-tts', name: 'Gemini 3.8 Flash TTS (Default / Recommended)', isDefault: true },
  { id: 'gemini-3.8-flash-lite-tts', name: 'Gemini 3.8 Flash-Lite TTS' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS' }
];
