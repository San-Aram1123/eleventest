export interface ExtendedEmotion {
  id: string;
  name: string;
  kurdishName: string;
  color: string;
  description: string;
  actingKeywords: string;
}

export const EXTENDED_EMOTIONS: ExtendedEmotion[] = [
  { id: 'neutral', name: 'Neutral', kurdishName: 'ئاسایی', color: '#94A3B8', description: 'Baseline conversational speech', actingKeywords: 'natural, steady, conversational pacing' },
  { id: 'happy', name: 'Happy', kurdishName: 'دڵخۆش', color: '#10B981', description: 'Warm joyful energy & smiling cadence', actingKeywords: 'bright, cheerful, melodic warmth' },
  { id: 'sad', name: 'Sad', kurdishName: 'خەمبار', color: '#38BDF8', description: 'Melancholic sorrow & heavy phrasing', actingKeywords: 'subdued, sorrowful, emotionally vulnerable' },
  { id: 'angry', name: 'Angry', kurdishName: 'تووڕە', color: '#EF4444', description: 'Sharp forceful indignation & tension', actingKeywords: 'sharp consonants, agitated, tense, no shouting' },
  { id: 'fearful', name: 'Fearful / Anxious', kurdishName: 'ترساو', color: '#A855F7', description: 'Trembling voice & breathless hesitation', actingKeywords: 'shallow rapid breathing, trembling vocal onset, high nervous tension' },
  { id: 'tender', name: 'Tender / Gentle', kurdishName: 'نەرم و میهرەبان', color: '#EC4899', description: 'Soft affectionate warmth & soothing cadence', actingKeywords: 'gentle vocal onset, warm breathy closeness, affectionate melody' },
  { id: 'exhausted', name: 'Weary / Exhausted', kurdishName: 'شەکەت', color: '#64748B', description: 'Heavy sighing & depleted vocal energy', actingKeywords: 'low vocal energy, heavy sighing, drawn-out syllables, fatigued cadence' },
  { id: 'excited', name: 'Excited / Hyped', kurdishName: 'حەماسی', color: '#F59E0B', description: 'Dynamic tempo & sudden pitch peaks', actingKeywords: 'fast tempo, vibrant pitch movement, exuberant positive adrenaline' },
  { id: 'sarcastic', name: 'Sarcastic / Mocking', kurdishName: 'تەشەردان', color: '#06B6D4', description: 'Cynical drawl & disdainful cadence', actingKeywords: 'cynical elongated vowels, mocking smirk, dismissive inflection' },
  { id: 'disgusted', name: 'Disgusted / Loathing', kurdishName: 'قێز', color: '#84CC16', description: 'Glottal constriction & repulsive sneer', actingKeywords: 'glottal tension, repulsive sneer, repelled nasal disdain' }
];

export interface CustomMixPreset {
  id: string;
  name: string;
  kurdishName: string;
  emotionA: string;
  intensityA: number;
  emotionB: string;
  intensityB: number;
  delivery: 'normal' | 'whisper' | 'laughing_speech';
  context: string;
}

export const DRAMATIC_MIX_PRESETS: CustomMixPreset[] = [
  {
    id: 'defensive_rage',
    name: 'Defensive Rage',
    kurdishName: 'تووڕەیی لە ترسا',
    emotionA: 'fearful',
    intensityA: 0.85,
    emotionB: 'angry',
    intensityB: 0.85,
    delivery: 'normal',
    context: 'Cornered and terrified, but lashing out with desperate, violent anger.'
  },
  {
    id: 'grief_farewell',
    name: 'Grief Farewell',
    kurdishName: 'ماڵئاوایی بە سۆز و خەم',
    emotionA: 'sad',
    intensityA: 0.90,
    emotionB: 'tender',
    intensityB: 0.75,
    delivery: 'normal',
    context: 'Saying a loving, affectionate goodbye to someone lost through heavy tears.'
  },
  {
    id: 'helpless_despair',
    name: 'Helpless Despair',
    kurdishName: 'بێئومێدی و دڵلەرزین',
    emotionA: 'sad',
    intensityA: 0.90,
    emotionB: 'fearful',
    intensityB: 0.80,
    delivery: 'normal',
    context: 'Trembling with anxiety and completely crushed by grief and dread.'
  },
  {
    id: 'nervous_anticipation',
    name: 'Nervous Anticipation',
    kurdishName: 'حەماسەت لەگەڵ ترس',
    emotionA: 'excited',
    intensityA: 0.85,
    emotionB: 'fearful',
    intensityB: 0.60,
    delivery: 'normal',
    context: 'Thrilled with excitement right before high-stakes event, jittery and breathless.'
  },
  {
    id: 'venomous_loathing',
    name: 'Venomous Loathing',
    kurdishName: 'بێزاری و ڕق',
    emotionA: 'angry',
    intensityA: 0.90,
    emotionB: 'disgusted',
    intensityB: 0.80,
    delivery: 'normal',
    context: 'Looking at someone who betrayed your trust with a disgusted sneer and intense fury.'
  },
  {
    id: 'exhausted_sarcasm',
    name: 'Exhausted Sarcasm',
    kurdishName: 'شەکەتی لەگەڵ تەشەر',
    emotionA: 'exhausted',
    intensityA: 0.80,
    emotionB: 'sarcastic',
    intensityB: 0.70,
    delivery: 'normal',
    context: 'Too emotionally drained to care, scoffing cynically with heavy weary sighs.'
  }
];

export function buildCustomMixDirective(
  emA: string,
  intA: number,
  emB: string,
  intB: number,
  delivery: 'normal' | 'whisper' | 'laughing_speech',
  customContext = ''
): string {
  const metaA = EXTENDED_EMOTIONS.find(e => e.id === emA) || EXTENDED_EMOTIONS[0];
  const metaB = EXTENDED_EMOTIONS.find(e => e.id === emB) || EXTENDED_EMOTIONS[1];

  const deliveryDirective = delivery === 'whisper'
    ? 'CRITICAL: Delivery must be completely whispered from start to finish. Breathy turbulence without switching to normal voiced speech.'
    : delivery === 'laughing_speech'
      ? 'CRITICAL: Speak clearly and intelligibly WHILE chuckling or laughing. Do not emit just a standalone laugh sound.'
      : 'Normal clear voiced speech.';

  const contextStr = customContext ? `Acting Context: ${customContext}.` : '';

  return `ACTING DIRECTIVE: Express a simultaneous dual-emotional mixture throughout the utterance in Kurdish.
- Primary Emotion: ${metaA.name} at ${intA.toFixed(2)} intensity (${metaA.actingKeywords}).
- Secondary Emotion: ${metaB.name} at ${intB.toFixed(2)} intensity (${metaB.actingKeywords}).
${contextStr}
Both emotional expressions must be sustained simultaneously in your vocal timbre, pitch inflection, and pacing. Do NOT alternate or transition sequentially. ${deliveryDirective}`;
}

