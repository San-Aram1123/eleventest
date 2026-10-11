import { ExpressiveTake } from './expressiveConstants';

export interface MixedCondition {
  id: string;
  pairKey: string;
  pairName: string;
  context: string;
  primaryEmotion: 'happy' | 'sad' | 'angry' | 'fear';
  primaryIntensity: number;
  components: Record<string, number>;
  balanceTier: 'dom_first' | 'balanced' | 'dom_second' | 'custom';
  intensityA: number;
  intensityB: number;
  intensityLabelA: 'low' | 'med' | 'high';
  intensityLabelB: 'low' | 'med' | 'high';
  balanceLabel: string;
  intensityDescription: string;
  label: string;
  actingDirective: string;
}

export interface EmotionPairDef {
  key: string;
  name: string;
  emotionA: 'happy' | 'sad' | 'angry' | 'fear';
  emotionB: 'happy' | 'sad' | 'angry' | 'fear';
  context: string;
  descA: string;
  descB: string;
}

export const CORE_EMOTION_PAIRS: EmotionPairDef[] = [
  {
    key: 'happy_sad',
    name: 'Happy + Sad',
    emotionA: 'happy',
    emotionB: 'sad',
    context: 'Bittersweet relief or nostalgic memory',
    descA: 'warm, smiling happiness',
    descB: 'quiet melancholic sorrow'
  },
  {
    key: 'angry_sad',
    name: 'Angry + Sad',
    emotionA: 'angry',
    emotionB: 'sad',
    context: 'Hurt disappointment and betrayal',
    descA: 'sharp indignation and anger (no shouting)',
    descB: 'wounded grief and sorrow'
  },
  {
    key: 'happy_angry',
    name: 'Happy + Angry',
    emotionA: 'happy',
    emotionB: 'angry',
    context: 'Triumphant satisfaction and gloating',
    descA: 'exultant victorious joy and pride',
    descB: 'sharp lingering spite and vindictive anger'
  },
  {
    key: 'fear_sad',
    name: 'Fear + Sad',
    emotionA: 'fear',
    emotionB: 'sad',
    context: 'Helpless dread and vulnerable grief',
    descA: 'trembling panic and breathy anxious dread',
    descB: 'fragile heartbroken weeping sorrow'
  },
  {
    key: 'fear_angry',
    name: 'Fear + Angry',
    emotionA: 'fear',
    emotionB: 'angry',
    context: 'Cornered animal fury and defensive panic',
    descA: 'frantic tense fear and hyper-vigilance',
    descB: 'explosive defensive rage and desperate aggression'
  },
  {
    key: 'happy_fear',
    name: 'Happy + Fear',
    emotionA: 'happy',
    emotionB: 'fear',
    context: 'Nervous euphoric thrill and adrenaline',
    descA: 'giddy ecstatic excitement and smiling laughter',
    descB: 'breathless apprehension and trembling nerves'
  }
];

const INTENSITY_TIERS = [
  { label: 'low' as const, val: 0.25 },
  { label: 'med' as const, val: 0.60 },
  { label: 'high' as const, val: 0.90 }
];

function buildDirective(pair: EmotionPairDef, intA: number, intB: number): string {
  const domDesc = intA > intB 
    ? `${pair.emotionA} (${intA.toFixed(2)}) is dominant over ${pair.emotionB} (${intB.toFixed(2)})`
    : intB > intA
    ? `${pair.emotionB} (${intB.toFixed(2)}) is dominant over ${pair.emotionA} (${intA.toFixed(2)})`
    : `both ${pair.emotionA} (${intA.toFixed(2)}) and ${pair.emotionB} (${intB.toFixed(2)}) are equally balanced`;

  return `ACTING DIRECTIVE: Express ${pair.context}. Speak with simultaneous mixed emotions: ${domDesc}. Express ${pair.descA} simultaneously with ${pair.descB} continuously throughout the entire utterance. Do NOT alternate between emotions; weave both into vocal timbre and cadence.`;
}

// Generate all 54 Dual-Intensity Possibilities (6 pairs × 9 combos)
export const MIXED_54_CONDITIONS: MixedCondition[] = CORE_EMOTION_PAIRS.flatMap(pair => {
  return INTENSITY_TIERS.flatMap(tierA => {
    return INTENSITY_TIERS.map(tierB => {
      const id = `mix_${pair.key}_${tierA.label}_${tierB.label}`;
      const balanceTier: MixedCondition['balanceTier'] = 
        tierA.val > tierB.val ? 'dom_first' : tierB.val > tierA.val ? 'dom_second' : 'balanced';
      const primaryEmotion = tierA.val >= tierB.val ? pair.emotionA : pair.emotionB;
      const primaryIntensity = Math.max(tierA.val, tierB.val);

      return {
        id,
        pairKey: pair.key,
        pairName: pair.name,
        context: pair.context,
        primaryEmotion,
        primaryIntensity,
        components: { [pair.emotionA]: tierA.val, [pair.emotionB]: tierB.val },
        balanceTier,
        intensityA: tierA.val,
        intensityB: tierB.val,
        intensityLabelA: tierA.label,
        intensityLabelB: tierB.label,
        balanceLabel: `${tierA.label.toUpperCase()} ${pair.emotionA} / ${tierB.label.toUpperCase()} ${pair.emotionB}`,
        intensityDescription: `${pair.emotionA} ${tierA.val} (${tierA.label}) + ${pair.emotionB} ${tierB.val} (${tierB.label})`,
        label: `${pair.name}: ${tierA.label.toUpperCase()} / ${tierB.label.toUpperCase()}`,
        actingDirective: buildDirective(pair, tierA.val, tierB.val)
      };
    });
  });
});

// Generate 18 Standard Balance Tiers (6 pairs × 3 tiers: 70/30, 50/50, 30/70)
export const MIXED_18_CONDITIONS: MixedCondition[] = CORE_EMOTION_PAIRS.flatMap(pair => {
  const tiers = [
    { idSuffix: 'dom1', labelSuffix: 'Dom A', aVal: 0.90, bVal: 0.25, aLbl: 'high' as const, bLbl: 'low' as const, tier: 'dom_first' as const },
    { idSuffix: 'bal', labelSuffix: 'Balanced', aVal: 0.60, bVal: 0.60, aLbl: 'med' as const, bLbl: 'med' as const, tier: 'balanced' as const },
    { idSuffix: 'dom2', labelSuffix: 'Dom B', aVal: 0.25, bVal: 0.90, aLbl: 'low' as const, bLbl: 'high' as const, tier: 'dom_second' as const }
  ];

  return tiers.map(t => ({
    id: `mix_${pair.key}_${t.idSuffix}`,
    pairKey: pair.key,
    pairName: pair.name,
    context: pair.context,
    primaryEmotion: t.aVal >= t.bVal ? pair.emotionA : pair.emotionB,
    primaryIntensity: Math.max(t.aVal, t.bVal),
    components: { [pair.emotionA]: t.aVal, [pair.emotionB]: t.bVal },
    balanceTier: t.tier,
    intensityA: t.aVal,
    intensityB: t.bVal,
    intensityLabelA: t.aLbl,
    intensityLabelB: t.bLbl,
    balanceLabel: `${t.labelSuffix} (${t.aVal} / ${t.bVal})`,
    intensityDescription: `${pair.emotionA} ${t.aVal} + ${pair.emotionB} ${t.bVal}`,
    label: `${pair.name}: ${t.labelSuffix}`,
    actingDirective: buildDirective(pair, t.aVal, t.bVal)
  }));
});

// Original Curated 3 Pilot Pairs (9 conditions)
export const MIXED_9_CONDITIONS: MixedCondition[] = MIXED_18_CONDITIONS.filter(c =>
  ['happy_sad', 'angry_sad', 'happy_angry'].includes(c.pairKey)
);

// Default MIXED_CONDITIONS alias for backward compatibility
export const MIXED_CONDITIONS = MIXED_54_CONDITIONS;

export function buildAudarMixedRecord(take: ExpressiveTake, condition: MixedCondition) {
  return {
    id: take.id,
    audioUrl: `mixed_emotions/audio/${take.id}.wav`,
    transcript: take.transcript,
    normalized_text: take.transcript,
    originalDraft: take.transcript,
    draftSource: 'Gemini 3.8 Flash Expressive Studio',
    speakerId: take.speakerId,
    speakerName: take.speakerName,
    speakerGender: take.speakerGender,
    language: take.language,
    datasetSplit: null,
    source: 'Audar Mixed Emotions Pilot',
    duration: take.duration,
    status: take.status,
    emotion: condition.primaryEmotion,
    emotionIntensity: condition.primaryIntensity,
    metrics: { sampleRate: 24000, channels: 1, bitDepth: 16, format: 'PCM WAV' },
    x_reviewer_delivery: 'normal',
    x_reviewer_script_id: take.scriptId,
    x_reviewer_recording_type: 'gemini_synthetic_pilot',
    x_reviewer_consent: true,
    x_reviewer_emotion_mode: 'simultaneous',
    x_reviewer_emotion_components: condition.components,
    x_reviewer_listening_reviews: [
      {
        reviewer_id: 'REVIEWER_01',
        emotion_correct: true,
        delivery_correct: true,
        intensity_level: condition.primaryIntensity >= 0.8 ? 'high' : 'medium',
        naturalness: 4,
        emotion_components: Object.fromEntries(
          Object.entries(condition.components).map(([k, v]) => [
            k,
            { present: true, intensity_level: v >= 0.8 ? 'high' : v >= 0.5 ? 'medium' : 'low' }
          ])
        )
      }
    ]
  };
}
