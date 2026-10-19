/**
 * Audar V20 Complete 50-Emotion Catalog & Expressive Prompt Guidance
 * Standards compliant with Kurdish Sorani, Arabic, and English TTS.
 */

export const V20_EMOTION_PROFILES = {
  neutral: {
    name: 'Neutral',
    sorani: 'ئاسایی / بێلایەن',
    family: 'Composure',
    style: 'Natural conversational cadence, relaxed articulation, moderate pitch variation, and emotionally balanced energy without artificial dramatic flair.'
  },
  happy: {
    name: 'Happy',
    sorani: 'دڵخۆش',
    family: 'Joy',
    style: 'Warm vocal tone, smiling articulation, lively controlled prosody, bright natural intonation, and increased positive energy.'
  },
  sad: {
    name: 'Sad',
    sorani: 'خەمبار',
    family: 'Sorrow',
    style: 'Subdued emotional energy, melancholic phrasing, softer restrained expression, and naturally softened phrase endings.'
  },
  angry: {
    name: 'Angry',
    sorani: 'تووڕە',
    family: 'Anger',
    style: 'Tense articulation, forceful emphasis, sharp consonants, firm stress on key words, and emotionally charged controlled prosody.'
  },
  excited: {
    name: 'Excited',
    sorani: 'پڕ جۆش',
    family: 'Joy',
    style: 'Energetic bouncy rhythm, wide pitch excursion, heightened tempo, vivid enthusiasm, and dynamic animated inflection.'
  },
  tender: {
    name: 'Tender',
    sorani: 'دڵسۆز / نەرم',
    family: 'Tenderness',
    style: 'Gentle warmth, relaxed articulation, soft emotional emphasis, soothing intonation, and delicate melodic onset (distinct from whisper).'
  },
  curious: {
    name: 'Curious',
    sorani: 'کنجکاو',
    family: 'Wonder',
    style: 'Exploratory intonation, genuine inquisitive questioning contour, attentive rhythm, and heightened engagement.'
  },
  sarcastic: {
    name: 'Sarcastic',
    sorani: 'تانەئامێز',
    family: 'Contempt',
    style: 'Deliberate vowel elongation, ironic pitch contours, cynical stress patterns, dry caustic emphasis, and skeptical timing.'
  },
  fearful: {
    name: 'Fearful',
    sorani: 'ترساو',
    family: 'Fear',
    style: 'Vocal tension, irregular breath support, hesitant anxious pacing, urgent cadence, and slight tremor.'
  },
  disgusted: {
    name: 'Disgusted',
    sorani: 'بێزار / قێزەوەن',
    family: 'Contempt',
    style: 'Dismissive tone, nasal tense articulation, abrupt rejection emphasis, curled lip resonance, and revulsion.'
  },
  surprised: {
    name: 'Surprised',
    sorani: 'سەرسام',
    family: 'Wonder',
    style: 'Sudden onset, abrupt sharp pitch inflection, wide eye acoustic brightness, and astonished delivery.'
  },
  confused: {
    name: 'Confused',
    sorani: 'سەری لێ شێواو',
    family: 'Wonder',
    style: 'Thoughtful hesitation, rising uncertain inflections, puzzled pauses, uneven rhythm, and genuine questioning perplexity.'
  },
  frustrated: {
    name: 'Frustrated',
    sorani: 'بێتاقەت / پەست',
    family: 'Anger',
    style: 'Impatient cadence, clipped words, sustained underlying annoyance, exasperated emphasis, and controlled tension.'
  },
  disappointed: {
    name: 'Disappointed',
    sorani: 'دڵشکاو',
    family: 'Sorrow',
    style: 'Dropping pitch at line ends, heavy deflated exhalations, subdued energy, and resigned sadness.'
  },
  anxious: {
    name: 'Anxious',
    sorani: 'دڵەڕاوکێ',
    family: 'Fear',
    style: 'Restless pacing, breath instability, uneven phrase stresses, rapid worried intonation, and nervous pressure.'
  },
  nervous: {
    name: 'Nervous',
    sorani: 'شڵەژاو',
    family: 'Fear',
    style: 'Mild hesitation, self-conscious intonation, slightly rapid uneven pace, and tentative vocal onset.'
  },
  relieved: {
    name: 'Relieved',
    sorani: 'ئاسوودە',
    family: 'Composure',
    style: 'Released vocal tension, relaxed unburdened exhalations, softening terminal vowels, and soothing peaceful cadence.'
  },
  hopeful: {
    name: 'Hopeful',
    sorani: 'بەهیوا',
    family: 'Joy',
    style: 'Measured positive uplift, gentle rising cadence, bright open timbre, and sincere warm optimism.'
  },
  proud: {
    name: 'Proud',
    sorani: 'شانازی',
    family: 'Joy',
    style: 'Resonant projection, deliberate and authoritative tempo, confident posture, and grounded noble enthusiasm.'
  },
  ashamed: {
    name: 'Ashamed',
    sorani: 'شەرمەزار',
    family: 'Sorrow',
    style: 'Low amplitude, restrained vocal tract, hesitant muffled delivery, downcast energy, and reluctant confession.'
  },
  guilty: {
    name: 'Guilty',
    sorani: 'هەست بە گوناهـ',
    family: 'Sorrow',
    style: 'Apologetic remorseful tone, careful hesitant phrasing, restrained breath, and deep personal regret.'
  },
  jealous: {
    name: 'Jealous',
    sorani: 'بەحەسوودی',
    family: 'Anger',
    style: 'Guarded vocal tension, sharp questioning stresses, bitter envious undertones, and possessive edge.'
  },
  envious: {
    name: 'Envious',
    sorani: 'چاوپێهەڵنەهاتوو',
    family: 'Contempt',
    style: 'Longing mixed with resentful restraint, bittersweet admiration, and yearning wistful intonation.'
  },
  contemptuous: {
    name: 'Contemptuous',
    sorani: 'سووکڕوانین',
    family: 'Contempt',
    style: 'Scornful downward inflection, dismissive deliberate pauses, sneering undertone, and haughty superiority.'
  },
  resentful: {
    name: 'Resentful',
    sorani: 'بوغزدار',
    family: 'Anger',
    style: 'Cold hostile constraint, restrained explosive words, brooding smoldering bitterness, and grudging cadence.'
  },
  despairing: {
    name: 'Despairing',
    sorani: 'بێ هیوا',
    family: 'Sorrow',
    style: 'Emotionally depleted, flat heavy melancholic prosody, hollow timbre, and profound grief-stricken resignation.'
  },
  grieving: {
    name: 'Grieving',
    sorani: 'ماتەمبار',
    family: 'Sorrow',
    style: 'Trembling phrase endings, fragile register, audible breath breaks, heavy sorrow, and tender heartbreak.'
  },
  lonely: {
    name: 'Lonely',
    sorani: 'تەنیایی',
    family: 'Sorrow',
    style: 'Quiet subdued resonance, slow introspective pacing, isolated reflective tone, and soft hollow cadence.'
  },
  nostalgic: {
    name: 'Nostalgic',
    sorani: 'تامەزرۆی ڕابردوو',
    family: 'Tenderness',
    style: 'Warm bittersweet pacing, gentle reflective cadences, fond remembrance, and soft wistful smile.'
  },
  affectionate: {
    name: 'Affectionate',
    sorani: 'خۆشەویستانە',
    family: 'Tenderness',
    style: 'Intimate friendly warmth, melodious soft inflections, close personal tone, and caring sincerity.'
  },
  loving: {
    name: 'Loving',
    sorani: 'دڵدارانە',
    family: 'Tenderness',
    style: 'Deep heartfelt sincerity, sustained warm vocal weight, velvety resonant timbre, and unconditional warmth.'
  },
  grateful: {
    name: 'Grateful',
    sorani: 'سوپاسگوزار',
    family: 'Joy',
    style: 'Earnest appreciative stress, open heartfelt resonance, humble thankfulness, and emotional sincerity.'
  },
  admiring: {
    name: 'Admiring',
    sorani: 'سەرسام بە باشی',
    family: 'Wonder',
    style: 'Focused reverent praise, enthusiastic rising inflection, appreciative respect, and joyful validation.'
  },
  awed: {
    name: 'Awed',
    sorani: 'حەپەساو',
    family: 'Wonder',
    style: 'Hushed breath, low-paced reverent delivery, suspended pauses, astonishment, and breathtaking wonder.'
  },
  amazed: {
    name: 'Amazed',
    sorani: 'شۆکبووی چاکە',
    family: 'Wonder',
    style: 'High pitch shifts, energetic bursts of astonished stress, wide eyes delivery, and incredulous delight.'
  },
  joyful: {
    name: 'Joyful',
    sorani: 'شادیبەخش',
    family: 'Joy',
    style: 'Brightest acoustic timbre, smiling formant shifts, bouncy celebratory tempo, and radiant elation.'
  },
  amused: {
    name: 'Amused',
    sorani: 'بەپێکەنینەوە',
    family: 'Joy',
    style: 'Playful buoyancy, speech infused with bubbling laughter, smiling articulation, and light-hearted chuckle.'
  },
  embarrassed: {
    name: 'Embarrassed',
    sorani: 'شەرم',
    family: 'Fear',
    style: 'Self-conscious hesitation, awkward rhythm, softened volume, flustered pauses, and apologetic tone.'
  },
  bored: {
    name: 'Bored',
    sorani: 'بێزار لە چاوەڕوانی',
    family: 'Composure',
    style: 'Flat intonation, elongated vowels, low dynamic range, languid sluggish tempo, and uninterested decay.'
  },
  exhausted: {
    name: 'Exhausted',
    sorani: 'ماندوو',
    family: 'Composure',
    style: 'Breath fatigue, trailing phrase decay, slow dragging tempo, heavy weary sighs, and depleted physical energy.'
  },
  determined: {
    name: 'Determined',
    sorani: 'سوور',
    family: 'Anger',
    style: 'Punchy articulation, steady forceful cadence, firm unyielding stops, resolved eye-contact energy, and unwavering grit.'
  },
  confident: {
    name: 'Confident',
    sorani: 'بڕوابەخۆ',
    family: 'Composure',
    style: 'Stable fundamental frequency, assertive projection, clear crisp articulation, grounded authority, and certainty.'
  },
  suspicious: {
    name: 'Suspicious',
    sorani: 'گوماناوی',
    family: 'Contempt',
    style: 'Probing rhythm, tight guarded tone, searching pauses, narrowed eyes inflection, and wary distrust.'
  },
  skeptical: {
    name: 'Skeptical',
    sorani: 'بەگومان',
    family: 'Contempt',
    style: 'Incredulous pitch excursions, restrained disbelief, questioning dubiousness, and critical dry cadence.'
  },
  anticipating: {
    name: 'Anticipating',
    sorani: 'چاوەڕوانکار',
    family: 'Wonder',
    style: 'Building forward momentum, accelerated phrasing, heightened alert tension, and eager breath.'
  },
  panicked: {
    name: 'Panicked',
    sorani: 'تۆقیو',
    family: 'Fear',
    style: 'Erratic fast cadence, sharp gasps, uncontrolled pitch spikes, breathless terror, and rapid frantic urgency.'
  },
  terrified: {
    name: 'Terrified',
    sorani: 'زەندەقچوو',
    family: 'Fear',
    style: 'High tension, voice tremor, choked or breathy urgency, petrified paralysis, and hushed adrenaline.'
  },
  defiant: {
    name: 'Defiant',
    sorani: 'یاخی',
    family: 'Anger',
    style: 'Defiant vocal projection, unyielding emphatic stress, rebellious resonance, and uncompromising challenge.'
  },
  bitter: {
    name: 'Bitter',
    sorani: 'تاڵ',
    family: 'Contempt',
    style: 'Dry acerbic tone, harsh trailing consonants, acrid lingering resentment, and cold caustic bite.'
  },
  serene: {
    name: 'Serene',
    sorani: 'هێمن',
    family: 'Composure',
    style: 'Slow balanced breathing, smooth melodic contours, deep soothing tranquility, and gentle flowing peace.'
  },
  // Legacy aliases
  whisper: {
    name: 'Whisper',
    sorani: 'چرپە',
    family: 'Phonation',
    style: 'Continuous unvoiced whispering from beginning to end. Soft, breathy, quiet and confidential delivery.'
  },
  cackle: {
    name: 'Cackle',
    sorani: 'قاقا',
    family: 'Joy',
    style: 'Playful, smiling, amused cackle-infused delivery with cheerful energy while speaking.'
  },
  laugh: {
    name: 'Laugh',
    sorani: 'پێکەنین',
    family: 'Joy',
    style: 'Strongly amused, cheerful and smiling chuckle-infused delivery with playful positive energy.'
  },
  sigh: {
    name: 'Sigh',
    sorani: 'ئاخ / ئاهـ',
    family: 'Composure',
    style: 'Slight weary breath or heavy breath of relief/exhaustion accompanying speech.'
  }
};

/**
 * Returns the resolved emotion profile for any of the 50 V20 emotions.
 */
export function getV20EmotionProfile(emotionKey) {
  if (!emotionKey) return V20_EMOTION_PROFILES.neutral;
  const key = String(emotionKey).toLowerCase().trim().replace(/^\[|\]$/g, '');
  return V20_EMOTION_PROFILES[key] || V20_EMOTION_PROFILES.neutral;
}

/**
 * Calibrates ElevenLabs voice settings dynamically based on emotion and intensity.
 */
export function getElevenLabsEmotionSettings(emotionKey, intensity = 0.8) {
  const profile = getV20EmotionProfile(emotionKey);
  const numIntensity = normalizeEmotionIntensity(intensity);

  switch (profile.family) {
    case 'Joy':
    case 'Anger':
    case 'Fear':
      return {
        stability: Math.max(0.20, Number((0.40 - numIntensity * 0.15).toFixed(2))),
        similarity_boost: 0.75,
        style: Math.min(0.85, Number((0.45 + numIntensity * 0.35).toFixed(2))),
        use_speaker_boost: true
      };
    case 'Wonder':
    case 'Contempt':
      return {
        stability: Math.max(0.25, Number((0.45 - numIntensity * 0.15).toFixed(2))),
        similarity_boost: 0.75,
        style: Math.min(0.80, Number((0.35 + numIntensity * 0.35).toFixed(2))),
        use_speaker_boost: true
      };
    case 'Sorrow':
    case 'Tenderness':
      return {
        stability: Math.max(0.30, Number((0.48 - numIntensity * 0.12).toFixed(2))),
        similarity_boost: 0.75,
        style: Math.min(0.75, Number((0.30 + numIntensity * 0.35).toFixed(2))),
        use_speaker_boost: true
      };
    case 'Composure':
    default:
      return {
        stability: 0.50,
        similarity_boost: 0.75,
        style: numIntensity > 0 ? Number((numIntensity * 0.25).toFixed(2)) : 0.0,
        use_speaker_boost: true
      };
  }
}


export function normalizeEmotionIntensity(value, fallback = 0.8) {
  const number = Number.parseFloat(value);
  return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
}
