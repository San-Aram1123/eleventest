export interface MatrixCondition {
  id: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry';
  delivery: 'normal' | 'whisper' | 'laughing_speech';
  deliveryLabel: string;
  intensityLabel: 'none' | 'low' | 'medium' | 'high';
  intensityValue: number;
  label: string;
  description: string;
  actingDirective: string;
}

export interface PilotSpeaker {
  id: string;
  name: string;
  voiceName: string;
  gender: 'male' | 'female';
  vocalRange: string;
  referenceAudioId?: string;
}

export interface ExpressiveTake {
  id: string;
  scriptId: string;
  transcript: string;
  speakerId: string;
  speakerName: string;
  speakerGender: 'male' | 'female';
  language: 'ckb' | 'ar' | 'en';
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'fear';
  emotionIntensity: number;
  delivery: 'normal' | 'whisper' | 'laughing_speech';
  intensityLabel: 'none' | 'low' | 'medium' | 'high';
  conditionId: string;
  duration: number;
  audioBase64?: string;
  audioBlobUrl?: string;
  createdAt: number;
  status: 'approved' | 'rejected' | 'pending';
  review: {
    reviewer_id: string;
    emotion_correct: boolean;
    delivery_correct: boolean;
    intensity_level: string;
    naturalness: number;
  };
}

export const PILOT_SPEAKERS: PilotSpeaker[] = [
  { id: 'expressive_pilot__ACTOR_001', name: 'ئاراس (Arlo)', voiceName: 'Arlo', gender: 'male', vocalRange: 'Baritone / Warm Studio' },
  { id: 'expressive_pilot__ACTOR_002', name: 'لارا (Lora)', voiceName: 'Lora', gender: 'female', vocalRange: 'Mezzo / Clear Studio' },
  { id: 'expressive_pilot__ACTOR_003', name: 'سەردار (Knox)', voiceName: 'Knox', gender: 'male', vocalRange: 'Tenor / Crisp Confident' },
  { id: 'expressive_pilot__ACTOR_004', name: 'نیلا (Nyla)', voiceName: 'Nyla', gender: 'female', vocalRange: 'Alto / Modern Expressive' }
];

export const PILOT_DEFAULT_SENTENCES = [
  { id: 'script_001', text: 'ئەمڕۆ زۆر ماندووم و کاتێکی زۆرم لە دەستدا.' },
  { id: 'script_002', text: 'بڕوا ناکەم ئەم شتە بەڕاستی ڕوویدابێت!' },
  { id: 'script_003', text: 'هەموو شتێک بە تەواوی ئامادەیە بۆ سبەی بەیانی.' },
  { id: 'script_004', text: 'کەی دەگەینە ئەوێ؟ چاوەڕوانییەکان زۆر درێژەیان کێشا.' },
  { id: 'script_005', text: 'ئەوە چی بوو ڕوویدا؟ بۆچی پێتان نەوتم لە کاتی خۆیدا؟' },
  { id: 'script_006', text: 'چاوەڕێی هەواڵێکی باشم لە تۆ، هیوا دەخوازم سەرکەوتووبین.' }
];

// Helper to build style directives strictly adhering to TTS_EXPRESSIVE_DATASET_PROMPT.md
function buildDirective(emotion: string, delivery: string, intensity: string): string {
  const deliveryRules: Record<string, string> = {
    normal: 'Normal clear voiced speech with natural phrasing and timing.',
    whisper: 'Fully whispered continuously from start to finish. Soft, quiet, breathy turbulence without switching into normal voiced phonation.',
    laughing_speech: 'Speak words clearly and intelligibly WHILE chuckling or laughing. Do not emit just a standalone laugh sound; maintain clear articulation through the laughter.'
  };

  if (emotion === 'neutral') {
    return `Emotion: Neutral (intensity 0.0). Conversational baseline delivery. ${deliveryRules[delivery]}`;
  }

  if (emotion === 'angry') {
    const intRules: Record<string, string> = {
      low: 'Mild irritation and controlled sharp annoyance. Do NOT shout.',
      medium: 'Pronounced anger, sharp consonants, tense forceful delivery. Do NOT shout.',
      high: 'Intense boiling fury and acute rage. Controlled and menacing. Do NOT shout or clip volume.'
    };
    const deliverySpec = delivery === 'whisper'
      ? 'CRITICAL: Stay strictly whispered and breathy even at high intensity; convey intense rage through harsh quiet aspiration, NEVER raise volume or shout.'
      : delivery === 'laughing_speech'
        ? 'CRITICAL: Perform a believable bitter, sarcastic, or restrained sinister laugh while articulating words. NOT cheerful or joyful laughter.'
        : deliveryRules[delivery];
    return `Emotion: Angry (${intensity} intensity). ${intRules[intensity]} ${deliverySpec}`;
  }

  if (emotion === 'sad') {
    const intRules: Record<string, string> = {
      low: 'Gentle sorrow, slightly subdued and quiet phrasing.',
      medium: 'Heartfelt sadness, melancholic cadence and heavy emotional weight. Do not just speak slow.',
      high: 'Deep genuine grief and emotional vulnerability in phrasing, timing, and voice quality. Believable sorrow without unintelligible sobbing.'
    };
    return `Emotion: Sad (${intensity} intensity). ${intRules[intensity]} ${deliveryRules[delivery]}`;
  }

  // Happy
  const intRules: Record<string, string> = {
    low: 'Light pleasant warmth and smiling tone.',
    medium: 'Warm cheerful joy with bright melodic intonation.',
    high: 'High cheerful exuberance, beaming happiness and vivid positive energy.'
  };
  return `Emotion: Happy (${intensity} intensity). ${intRules[intensity]} ${deliveryRules[delivery]}`;
}

export const MATRIX_CONDITIONS: MatrixCondition[] = [
  // Neutral (3)
  { id: 'neu_norm', emotion: 'neutral', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'none', intensityValue: 0.0, label: 'Neutral / Normal', description: 'Neutral conversational baseline', actingDirective: buildDirective('neutral', 'normal', 'none') },
  { id: 'neu_whisp', emotion: 'neutral', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'none', intensityValue: 0.0, label: 'Neutral / Whisper', description: 'Calm confidential whisper', actingDirective: buildDirective('neutral', 'whisper', 'none') },
  { id: 'neu_laugh', emotion: 'neutral', delivery: 'laughing_speech', deliveryLabel: 'Laughing Speech', intensityLabel: 'none', intensityValue: 0.0, label: 'Neutral / Laughing', description: 'Casual amused speaking through chuckling', actingDirective: buildDirective('neutral', 'laughing_speech', 'none') },

  // Happy (9)
  { id: 'hap_norm_low', emotion: 'happy', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'low', intensityValue: 0.25, label: 'Happy / Normal (Low)', description: 'Subtle smiling tone', actingDirective: buildDirective('happy', 'normal', 'low') },
  { id: 'hap_norm_med', emotion: 'happy', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'medium', intensityValue: 0.60, label: 'Happy / Normal (Med)', description: 'Warm joyful speech', actingDirective: buildDirective('happy', 'normal', 'medium') },
  { id: 'hap_norm_high', emotion: 'happy', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'high', intensityValue: 0.90, label: 'Happy / Normal (High)', description: 'Exuberant joyful speech', actingDirective: buildDirective('happy', 'normal', 'high') },
  { id: 'hap_whisp_low', emotion: 'happy', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'low', intensityValue: 0.25, label: 'Happy / Whisper (Low)', description: 'Gentle smiling whisper', actingDirective: buildDirective('happy', 'whisper', 'low') },
  { id: 'hap_whisp_med', emotion: 'happy', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'medium', intensityValue: 0.60, label: 'Happy / Whisper (Med)', description: 'Warm cheerful whisper', actingDirective: buildDirective('happy', 'whisper', 'medium') },
  { id: 'hap_whisp_high', emotion: 'happy', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'high', intensityValue: 0.90, label: 'Happy / Whisper (High)', description: 'Excited joyful whisper', actingDirective: buildDirective('happy', 'whisper', 'high') },
  { id: 'hap_laugh_low', emotion: 'happy', delivery: 'laughing_speech', deliveryLabel: 'Laughing Speech', intensityLabel: 'low', intensityValue: 0.25, label: 'Happy / Laughing (Low)', description: 'Speaking with light chuckling', actingDirective: buildDirective('happy', 'laughing_speech', 'low') },
  { id: 'hap_laugh_med', emotion: 'happy', delivery: 'laughing_speech', deliveryLabel: 'Laughing Speech', intensityLabel: 'medium', intensityValue: 0.60, label: 'Happy / Laughing (Med)', description: 'Speaking through cheerful laughter', actingDirective: buildDirective('happy', 'laughing_speech', 'medium') },
  { id: 'hap_laugh_high', emotion: 'happy', delivery: 'laughing_speech', deliveryLabel: 'Laughing Speech', intensityLabel: 'high', intensityValue: 0.90, label: 'Happy / Laughing (High)', description: 'Intense joyful laughing while speaking', actingDirective: buildDirective('happy', 'laughing_speech', 'high') },

  // Sad (6)
  { id: 'sad_norm_low', emotion: 'sad', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'low', intensityValue: 0.25, label: 'Sad / Normal (Low)', description: 'Subtle sorrowful tone', actingDirective: buildDirective('sad', 'normal', 'low') },
  { id: 'sad_norm_med', emotion: 'sad', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'medium', intensityValue: 0.60, label: 'Sad / Normal (Med)', description: 'Heartfelt melancholic sadness', actingDirective: buildDirective('sad', 'normal', 'medium') },
  { id: 'sad_norm_high', emotion: 'sad', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'high', intensityValue: 0.90, label: 'Sad / Normal (High)', description: 'Deep grief and sorrowful phrasing', actingDirective: buildDirective('sad', 'normal', 'high') },
  { id: 'sad_whisp_low', emotion: 'sad', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'low', intensityValue: 0.25, label: 'Sad / Whisper (Low)', description: 'Quiet fragile sorrow whisper', actingDirective: buildDirective('sad', 'whisper', 'low') },
  { id: 'sad_whisp_med', emotion: 'sad', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'medium', intensityValue: 0.60, label: 'Sad / Whisper (Med)', description: 'Melancholic breathy whisper', actingDirective: buildDirective('sad', 'whisper', 'medium') },
  { id: 'sad_whisp_high', emotion: 'sad', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'high', intensityValue: 0.90, label: 'Sad / Whisper (High)', description: 'Grief-stricken vulnerable whisper', actingDirective: buildDirective('sad', 'whisper', 'high') },

  // Angry (9)
  { id: 'ang_norm_low', emotion: 'angry', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'low', intensityValue: 0.25, label: 'Angry / Normal (Low)', description: 'Restrained irritation, sharp diction', actingDirective: buildDirective('angry', 'normal', 'low') },
  { id: 'ang_norm_med', emotion: 'angry', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'medium', intensityValue: 0.60, label: 'Angry / Normal (Med)', description: 'Forceful agitated anger (no shouting)', actingDirective: buildDirective('angry', 'normal', 'medium') },
  { id: 'ang_norm_high', emotion: 'angry', delivery: 'normal', deliveryLabel: 'Normal', intensityLabel: 'high', intensityValue: 0.90, label: 'Angry / Normal (High)', description: 'Severe boiling rage (intense, no shouting)', actingDirective: buildDirective('angry', 'normal', 'high') },
  { id: 'ang_whisp_low', emotion: 'angry', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'low', intensityValue: 0.25, label: 'Angry / Whisper (Low)', description: 'Tense irritable whisper', actingDirective: buildDirective('angry', 'whisper', 'low') },
  { id: 'ang_whisp_med', emotion: 'angry', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'medium', intensityValue: 0.60, label: 'Angry / Whisper (Med)', description: 'Angry menacing whisper (no volume raise)', actingDirective: buildDirective('angry', 'whisper', 'medium') },
  { id: 'ang_whisp_high', emotion: 'angry', delivery: 'whisper', deliveryLabel: 'Whisper', intensityLabel: 'high', intensityValue: 0.90, label: 'Angry / Whisper (High)', description: 'Furious sinister whisper (stays whispered)', actingDirective: buildDirective('angry', 'whisper', 'high') },
  { id: 'ang_laugh_low', emotion: 'angry', delivery: 'laughing_speech', deliveryLabel: 'Bitter Laughing', intensityLabel: 'low', intensityValue: 0.25, label: 'Angry / Bitter Laugh (Low)', description: 'Sarcastic wry chuckle while speaking', actingDirective: buildDirective('angry', 'laughing_speech', 'low') },
  { id: 'ang_laugh_med', emotion: 'angry', delivery: 'laughing_speech', deliveryLabel: 'Bitter Laughing', intensityLabel: 'medium', intensityValue: 0.60, label: 'Angry / Bitter Laugh (Med)', description: 'Bitter derisive laugh while speaking', actingDirective: buildDirective('angry', 'laughing_speech', 'medium') },
  { id: 'ang_laugh_high', emotion: 'angry', delivery: 'laughing_speech', deliveryLabel: 'Bitter Laughing', intensityLabel: 'high', intensityValue: 0.90, label: 'Angry / Bitter Laugh (High)', description: 'Scathing sinister laugh while speaking', actingDirective: buildDirective('angry', 'laughing_speech', 'high') }
];

export function buildAudarRecord(take: ExpressiveTake) {
  return {
    id: take.id,
    audioUrl: `audio/${take.id}.wav`,
    transcript: take.transcript,
    normalized_text: take.transcript,
    originalDraft: take.transcript,
    draftSource: 'Gemini 3.8 Flash Expressive Studio',
    speakerId: take.speakerId,
    speakerName: take.speakerName,
    speakerGender: take.speakerGender,
    language: take.language,
    datasetSplit: null,
    source: 'Audar Expressive Speech Pilot',
    duration: take.duration,
    status: take.status,
    emotion: take.emotion,
    emotionIntensity: take.emotionIntensity,
    metrics: {
      sampleRate: 24000,
      channels: 1,
      bitDepth: 16,
      format: 'PCM WAV'
    },
    x_reviewer_delivery: take.delivery,
    x_reviewer_script_id: take.scriptId,
    x_reviewer_recording_type: 'gemini_synthetic_pilot',
    x_reviewer_consent: true,
    x_reviewer_listening_reviews: [take.review]
  };
}

