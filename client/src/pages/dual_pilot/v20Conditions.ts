export interface V20BatchCondition {
  id: string;
  name: string;
  soraniName: string;
  emotion: string;
  intensity: number;
  delivery: 'normal' | 'whisper' | 'laughing_speech' | 'shouting' | 'trembling';
  isBlend?: boolean;
  blendDescription?: string;
}

export interface V20PresetTier {
  id: string;
  name: string;
  description: string;
  conditionCount: number;
  badgeColor: string;
  conditions: V20BatchCondition[];
}

export const V20_ALL_50_EMOTIONS: Array<{ key: string; name: string; sorani: string; defaultIntensity: number }> = [
  { key: 'neutral', name: 'Neutral', sorani: 'ئاسایی', defaultIntensity: 0.0 },
  { key: 'happy', name: 'Happy', sorani: 'دڵخۆش', defaultIntensity: 0.8 },
  { key: 'sad', name: 'Sad', sorani: 'خەمبار', defaultIntensity: 0.8 },
  { key: 'angry', name: 'Angry', sorani: 'تووڕە', defaultIntensity: 0.9 },
  { key: 'excited', name: 'Excited', sorani: 'پڕ جۆش', defaultIntensity: 0.85 },
  { key: 'tender', name: 'Tender', sorani: 'دڵسۆز', defaultIntensity: 0.75 },
  { key: 'curious', name: 'Curious', sorani: 'کنجکاو', defaultIntensity: 0.7 },
  { key: 'sarcastic', name: 'Sarcastic', sorani: 'تانەئامێز', defaultIntensity: 0.8 },
  { key: 'fearful', name: 'Fearful', sorani: 'ترساو', defaultIntensity: 0.85 },
  { key: 'disgusted', name: 'Disgusted', sorani: 'بێزار', defaultIntensity: 0.8 },
  { key: 'surprised', name: 'Surprised', sorani: 'سەرسام', defaultIntensity: 0.8 },
  { key: 'confused', name: 'Confused', sorani: 'سەری لێ شێواو', defaultIntensity: 0.7 },
  { key: 'frustrated', name: 'Frustrated', sorani: 'بێتاقەت', defaultIntensity: 0.85 },
  { key: 'disappointed', name: 'Disappointed', sorani: 'دڵشکاو', defaultIntensity: 0.8 },
  { key: 'anxious', name: 'Anxious', sorani: 'دڵەڕاوکێ', defaultIntensity: 0.85 },
  { key: 'nervous', name: 'Nervous', sorani: 'شڵەژاو', defaultIntensity: 0.75 },
  { key: 'relieved', name: 'Relieved', sorani: 'ئاسوودە', defaultIntensity: 0.7 },
  { key: 'hopeful', name: 'Hopeful', sorani: 'بەهیوا', defaultIntensity: 0.75 },
  { key: 'proud', name: 'Proud', sorani: 'شانازی', defaultIntensity: 0.8 },
  { key: 'ashamed', name: 'Ashamed', sorani: 'شەرمەزار', defaultIntensity: 0.8 },
  { key: 'guilty', name: 'Guilty', sorani: 'هەست بە گوناهـ', defaultIntensity: 0.8 },
  { key: 'jealous', name: 'Jealous', sorani: 'بەحەسوودی', defaultIntensity: 0.8 },
  { key: 'envious', name: 'Envious', sorani: 'چاوپێهەڵنەهاتوو', defaultIntensity: 0.8 },
  { key: 'contemptuous', name: 'Contemptuous', sorani: 'سووکڕوانین', defaultIntensity: 0.85 },
  { key: 'resentful', name: 'Resentful', sorani: 'بوغزدار', defaultIntensity: 0.85 },
  { key: 'despairing', name: 'Despairing', sorani: 'بێ هیوا', defaultIntensity: 0.9 },
  { key: 'grieving', name: 'Grieving', sorani: 'ماتەمبار', defaultIntensity: 0.9 },
  { key: 'lonely', name: 'Lonely', sorani: 'تەنیایی', defaultIntensity: 0.75 },
  { key: 'nostalgic', name: 'Nostalgic', sorani: 'تامەزرۆی ڕابردوو', defaultIntensity: 0.7 },
  { key: 'affectionate', name: 'Affectionate', sorani: 'خۆشەویستانە', defaultIntensity: 0.75 },
  { key: 'loving', name: 'Loving', sorani: 'دڵدارانە', defaultIntensity: 0.8 },
  { key: 'grateful', name: 'Grateful', sorani: 'سوپاسگوزار', defaultIntensity: 0.75 },
  { key: 'admiring', name: 'Admiring', sorani: 'سەرسام بە باشی', defaultIntensity: 0.8 },
  { key: 'awed', name: 'Awed', sorani: 'حەپەساو', defaultIntensity: 0.85 },
  { key: 'amazed', name: 'Amazed', sorani: 'شۆکبووی چاکە', defaultIntensity: 0.85 },
  { key: 'joyful', name: 'Joyful', sorani: 'شادیبەخش', defaultIntensity: 0.9 },
  { key: 'amused', name: 'Amused', sorani: 'بەپێکەنینەوە', defaultIntensity: 0.75 },
  { key: 'embarrassed', name: 'Embarrassed', sorani: 'شەرم', defaultIntensity: 0.75 },
  { key: 'bored', name: 'Bored', sorani: 'بێزار لە کات', defaultIntensity: 0.65 },
  { key: 'exhausted', name: 'Exhausted', sorani: 'ماندوو', defaultIntensity: 0.85 },
  { key: 'determined', name: 'Determined', sorani: 'سوور', defaultIntensity: 0.85 },
  { key: 'confident', name: 'Confident', sorani: 'بڕوابەخۆ', defaultIntensity: 0.8 },
  { key: 'suspicious', name: 'Suspicious', sorani: 'گوماناوی', defaultIntensity: 0.8 },
  { key: 'skeptical', name: 'Skeptical', sorani: 'بەگومان', defaultIntensity: 0.75 },
  { key: 'anticipating', name: 'Anticipating', sorani: 'چاوەڕوانکار', defaultIntensity: 0.8 },
  { key: 'panicked', name: 'Panicked', sorani: 'تۆقیو', defaultIntensity: 0.95 },
  { key: 'terrified', name: 'Terrified', sorani: 'زەندەقچوو', defaultIntensity: 0.95 },
  { key: 'defiant', name: 'Defiant', sorani: 'یاخی', defaultIntensity: 0.9 },
  { key: 'bitter', name: 'Bitter', sorani: 'تاڵ', defaultIntensity: 0.85 },
  { key: 'serene', name: 'Serene', sorani: 'هێمن', defaultIntensity: 0.7 }
];

export const V20_PRESET_TIERS: V20PresetTier[] = [
  {
    id: 'quick_smoke1',
    name: '⚡ Quick Test (1 Emotion)',
    description: 'Minimal smoke test (Neutral): 1 Gemini call + 1 ElevenLabs call to safely verify synthesis & slicing without wasting quota.',
    conditionCount: 1,
    badgeColor: '#10B981',
    conditions: [
      { id: 'neutral', name: 'Neutral', soraniName: 'ئاسایی', emotion: 'neutral', intensity: 0.0, delivery: 'normal' }
    ]
  },
  {
    id: 'pilot_core9',
    name: 'Core 9 (V19 Baseline)',
    description: 'The 9 original V19 emotional anchors in standard delivery.',
    conditionCount: 9,
    badgeColor: '#6366F1',
    conditions: [
      { id: 'neutral', name: 'Neutral', soraniName: 'ئاسایی', emotion: 'neutral', intensity: 0.0, delivery: 'normal' },
      { id: 'happy', name: 'Happy', soraniName: 'دڵخۆش', emotion: 'happy', intensity: 0.8, delivery: 'normal' },
      { id: 'sad', name: 'Sad', soraniName: 'خەمبار', emotion: 'sad', intensity: 0.8, delivery: 'normal' },
      { id: 'angry', name: 'Angry', soraniName: 'تووڕە', emotion: 'angry', intensity: 0.9, delivery: 'normal' },
      { id: 'excited', name: 'Excited', soraniName: 'پڕ جۆش', emotion: 'excited', intensity: 0.85, delivery: 'normal' },
      { id: 'tender', name: 'Tender', soraniName: 'دڵسۆز', emotion: 'tender', intensity: 0.75, delivery: 'normal' },
      { id: 'curious', name: 'Curious', soraniName: 'کنجکاو', emotion: 'curious', intensity: 0.7, delivery: 'normal' },
      { id: 'sarcastic', name: 'Sarcastic', soraniName: 'تانەئامێز', emotion: 'sarcastic', intensity: 0.8, delivery: 'normal' },
      { id: 'fearful', name: 'Fearful', soraniName: 'ترساو', emotion: 'fearful', intensity: 0.85, delivery: 'normal' }
    ]
  },
  {
    id: 'new_v20_high12',
    name: 'Top 12 New V20 Emotions',
    description: 'High-priority distinct emotional additions from V20 specification.',
    conditionCount: 12,
    badgeColor: '#EC4899',
    conditions: [
      { id: 'bitter', name: 'Bitter', soraniName: 'تاڵ', emotion: 'bitter', intensity: 0.85, delivery: 'normal' },
      { id: 'serene', name: 'Serene', soraniName: 'هێمن', emotion: 'serene', intensity: 0.7, delivery: 'normal' },
      { id: 'panicked', name: 'Panicked', soraniName: 'تۆقیو', emotion: 'panicked', intensity: 0.95, delivery: 'normal' },
      { id: 'terrified', name: 'Terrified', soraniName: 'زەندەقچوو', emotion: 'terrified', intensity: 0.95, delivery: 'normal' },
      { id: 'defiant', name: 'Defiant', soraniName: 'یاخی', emotion: 'defiant', intensity: 0.9, delivery: 'normal' },
      { id: 'hopeful', name: 'Hopeful', soraniName: 'بەهیوا', emotion: 'hopeful', intensity: 0.75, delivery: 'normal' },
      { id: 'proud', name: 'Proud', soraniName: 'شانازی', emotion: 'proud', intensity: 0.8, delivery: 'normal' },
      { id: 'anxious', name: 'Anxious', soraniName: 'دڵەڕاوکێ', emotion: 'anxious', intensity: 0.85, delivery: 'normal' },
      { id: 'disappointed', name: 'Disappointed', soraniName: 'دڵشکاو', emotion: 'disappointed', intensity: 0.8, delivery: 'normal' },
      { id: 'relieved', name: 'Relieved', soraniName: 'ئاسوودە', emotion: 'relieved', intensity: 0.75, delivery: 'normal' },
      { id: 'affectionate', name: 'Affectionate', soraniName: 'خۆشەویستانە', emotion: 'affectionate', intensity: 0.75, delivery: 'normal' },
      { id: 'confident', name: 'Confident', soraniName: 'بڕوابەخۆ', emotion: 'confident', intensity: 0.8, delivery: 'normal' }
    ]
  },
  {
    id: 'hardest_shifts8',
    name: 'Hardest 8 Delivery Shifts',
    description: 'Whispering, laughing speech, high-intensity anger, and panic.',
    conditionCount: 8,
    badgeColor: '#F59E0B',
    conditions: [
      { id: 'angry_whisp', name: 'Angry Whisper', soraniName: 'تووڕە بە چرپە', emotion: 'angry', intensity: 0.9, delivery: 'whisper' },
      { id: 'fear_whisp', name: 'Terrified Whisper', soraniName: 'ترساو بە چرپە', emotion: 'fearful', intensity: 0.95, delivery: 'whisper' },
      { id: 'happy_laugh', name: 'Laughing Speech', soraniName: 'بەپێکەنینەوە', emotion: 'happy', intensity: 0.85, delivery: 'laughing_speech' },
      { id: 'sarcastic_laugh', name: 'Mocking Laughter', soraniName: 'تانەئامێز بە پێکەنین', emotion: 'sarcastic', intensity: 0.85, delivery: 'laughing_speech' },
      { id: 'sad_whisp', name: 'Sad Whisper', soraniName: 'خەمبار بە چرپە', emotion: 'sad', intensity: 0.8, delivery: 'whisper' },
      { id: 'tender_whisp', name: 'Tender Whisper', soraniName: 'نەرم بە چرپە', emotion: 'tender', intensity: 0.75, delivery: 'whisper' },
      { id: 'panicked_shout', name: 'Panicked Urgency', soraniName: 'تۆقیوی توند', emotion: 'panicked', intensity: 0.95, delivery: 'normal' },
      { id: 'bitter_sarcasm', name: 'Bitter Sarcasm', soraniName: 'تاڵی تانەئامێز', emotion: 'bitter', intensity: 0.9, delivery: 'normal' }
    ]
  },
  {
    id: 'all50_taxonomy',
    name: 'Full 50-Emotion Taxonomy',
    description: 'Complete 50-emotion catalog E01–E50 defined in Audar V20 specification.',
    conditionCount: 50,
    badgeColor: '#10B981',
    conditions: V20_ALL_50_EMOTIONS.map(e => ({
      id: e.key,
      name: e.name,
      soraniName: e.sorani,
      emotion: e.key,
      intensity: e.defaultIntensity,
      delivery: 'normal'
    }))
  }
];

