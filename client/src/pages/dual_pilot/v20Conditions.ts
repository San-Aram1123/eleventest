import emotions from '../../../../shared/v20Emotions.json';
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

export const V20_ALL_50_EMOTIONS = emotions;

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

