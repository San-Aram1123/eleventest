/**
 * Paired Emotion Dataset Configuration & Voice Presets
 * Standards compliant with Kurdish TTS training (F5-TTS, StyleTTS2)
 */

export const REQUIRED_EMOTIONS = [
  { id: 'neutral', name: 'Neutral', kurdish: 'ئاسایی', defaultIntensity: 0.0, description: 'Natural, steady, conversational tone' },
  { id: 'happy', name: 'Happy', kurdish: 'دڵخۆش', defaultIntensity: 0.8, description: 'Warm, cheerful, upbeat intonation' },
  { id: 'cackle', name: 'Cackle', kurdish: 'قاقا / پێکەنین', defaultIntensity: 0.8, description: 'Playful, smiling, amused cackle-infused delivery' },
  { id: 'sad', name: 'Sad', kurdish: 'خەمبار', defaultIntensity: 0.8, description: 'Subdued, sorrowful, melancholic tone' },
  { id: 'angry', name: 'Angry', kurdish: 'تووڕە', defaultIntensity: 0.9, description: 'Sharp, forceful, agitated expression' },
  { id: 'whisper', name: 'Whisper', kurdish: 'چرپە', defaultIntensity: 0.7, description: 'Soft, quiet, breathy confidential whisper' }
];

export const OPTIONAL_EMOTIONS = [
  { id: 'laugh', name: 'Laugh', kurdish: 'پێکەنین', defaultIntensity: 0.8, description: 'Chuckling or smiling laughter' },
  { id: 'excited', name: 'Excited', kurdish: 'حەماسی', defaultIntensity: 0.8, description: 'High energy, enthusiastic expression' },
  { id: 'sigh', name: 'Sigh', kurdish: 'ئاخ / ئاهـ', defaultIntensity: 0.7, description: 'Weary, relieved or heavy breathy sigh' },
  { id: 'tender', name: 'Tender', kurdish: 'نەرم و میهرەبان', defaultIntensity: 0.7, description: 'Gentle, affectionate, soothing tone' },
  { id: 'fearful', name: 'Fearful', kurdish: 'ترساو', defaultIntensity: 0.8, description: 'Trembling, urgent, anxious tone' },
  { id: 'curious', name: 'Curious', kurdish: 'سەرسام / پرسیارکەر', defaultIntensity: 0.7, description: 'Inquisitive, questioning intonation' }
];

export const ALL_EMOTIONS = [...REQUIRED_EMOTIONS, ...OPTIONAL_EMOTIONS];

// Map 52 diverse speakers to Google Gemini 3.8 voices (26 Male, 26 Female balanced)
export const SPEAKER_PRESETS = [
  // Gemini 3.8 Studio Headline Voices (Pairs 1-12)
  { id: 'spk01', name: 'Speaker 01 (Arlo)', voice: 'Arlo', gender: 'male', description: 'Approachable, warm 3.8 studio' },
  { id: 'spk02', name: 'Speaker 02 (Lora)', voice: 'Lora', gender: 'female', description: 'Clear, friendly 3.8 studio' },
  { id: 'spk03', name: 'Speaker 03 (Knox)', voice: 'Knox', gender: 'male', description: 'Crisp, confident 3.8 studio' },
  { id: 'spk04', name: 'Speaker 04 (Nyla)', voice: 'Nyla', gender: 'female', description: 'Modern, confident 3.8 studio' },
  { id: 'spk05', name: 'Speaker 05 (Rami)', voice: 'Rami', gender: 'male', description: 'Conversational 3.8 studio' },
  { id: 'spk06', name: 'Speaker 06 (Sola)', voice: 'Sola', gender: 'female', description: 'Relaxed, pleasant 3.8 studio' },
  { id: 'spk07', name: 'Speaker 07 (Mako)', voice: 'Mako', gender: 'male', description: 'Energetic, dynamic 3.8 studio' },
  { id: 'spk08', name: 'Speaker 08 (Tari)', voice: 'Tari', gender: 'female', description: 'Cinematic, expressive 3.8 studio' },
  { id: 'spk09', name: 'Speaker 09 (Milo)', voice: 'Milo', gender: 'male', description: 'Narrative, clear 3.8 studio' },
  { id: 'spk10', name: 'Speaker 10 (Lumi)', voice: 'Lumi', gender: 'female', description: 'Warm instructional 3.8 studio' },
  { id: 'spk11', name: 'Speaker 11 (Koda)', voice: 'Koda', gender: 'male', description: 'Strong, textured 3.8 studio' },
  { id: 'spk12', name: 'Speaker 12 (Nika)', voice: 'Nika', gender: 'female', description: 'Bright, fresh 3.8 studio' },
  { id: 'spk13', name: 'Speaker 13 (Ludo)', voice: 'Ludo', gender: 'male', description: 'Friendly, expressive 3.8 studio' },
  { id: 'spk14', name: 'Speaker 14 (Riko)', voice: 'Riko', gender: 'female', description: 'Crisp, articulate 3.8 studio' },
  { id: 'spk15', name: 'Speaker 15 (Neno)', voice: 'Neno', gender: 'male', description: 'Smooth, modern 3.8 studio' },
  { id: 'spk16', name: 'Speaker 16 (Rina)', voice: 'Rina', gender: 'female', description: 'Gentle, balanced 3.8 studio' },
  { id: 'spk17', name: 'Speaker 17 (Olin)', voice: 'Olin', gender: 'male', description: 'Steady, thoughtful 3.8 studio' },
  { id: 'spk18', name: 'Speaker 18 (Tavi)', voice: 'Tavi', gender: 'female', description: 'Youthful, lively 3.8 studio' },
  { id: 'spk19', name: 'Speaker 19 (Sami)', voice: 'Sami', gender: 'male', description: 'Bright, authentic 3.8 studio' },
  { id: 'spk20', name: 'Speaker 20 (Tova)', voice: 'Tova', gender: 'female', description: 'Smooth, engaging 3.8 studio' },
  { id: 'spk21', name: 'Speaker 21 (Varo)', voice: 'Varo', gender: 'male', description: 'Deep, resonant 3.8 studio' },
  { id: 'spk22', name: 'Speaker 22 (Veda)', voice: 'Veda', gender: 'female', description: 'Thoughtful, velvety 3.8 studio' },
  { id: 'spk23', name: 'Speaker 23 (Zeno)', voice: 'Zeno', gender: 'male', description: 'Dynamic, crisp 3.8 studio' },
  { id: 'spk24', name: 'Speaker 24 (Zali)', voice: 'Zali', gender: 'female', description: 'Melodic, bright 3.8 studio' },
  // Gemini 3.8 Core & Expressive Voices (Pairs 25-26)
  { id: 'spk25', name: 'Speaker 25 (Charon)', voice: 'Charon', gender: 'male', description: 'Authoritative, deep 3.8 voice' },
  { id: 'spk26', name: 'Speaker 26 (Kore)', voice: 'Kore', gender: 'female', description: 'Firm, polished 3.8 voice' },
  // Verified Versatile Pairs in Gemini 3.8 (Pairs 27-52)
  { id: 'spk27', name: 'Speaker 27 (Puck)', voice: 'Puck', gender: 'male', description: 'Upbeat, animated tone' },
  { id: 'spk28', name: 'Speaker 28 (Aoede)', voice: 'Aoede', gender: 'female', description: 'Warm, natural tone' },
  { id: 'spk29', name: 'Speaker 29 (Fenrir)', voice: 'Fenrir', gender: 'male', description: 'Passionate, strong tone' },
  { id: 'spk30', name: 'Speaker 30 (Zephyr)', voice: 'Zephyr', gender: 'female', description: 'Bright, clear tone' },
  { id: 'spk31', name: 'Speaker 31 (Orus)', voice: 'Orus', gender: 'male', description: 'Calm, steady tone' },
  { id: 'spk32', name: 'Speaker 32 (Leda)', voice: 'Leda', gender: 'female', description: 'Youthful, energetic tone' },
  { id: 'spk33', name: 'Speaker 33 (Enceladus)', voice: 'Enceladus', gender: 'male', description: 'Soft, gentle tone' },
  { id: 'spk34', name: 'Speaker 34 (Callirrhoe)', voice: 'Callirrhoe', gender: 'female', description: 'Smooth, refined tone' },
  { id: 'spk35', name: 'Speaker 35 (Iapetus)', voice: 'Iapetus', gender: 'male', description: 'Crisp, articulate tone' },
  { id: 'spk36', name: 'Speaker 36 (Autonoe)', voice: 'Autonoe', gender: 'female', description: 'Engaging, narrative tone' },
  { id: 'spk37', name: 'Speaker 37 (Algieba)', voice: 'Algieba', gender: 'male', description: 'Smooth, melodic tone' },
  { id: 'spk38', name: 'Speaker 38 (Despina)', voice: 'Despina', gender: 'female', description: 'Warm, expressive tone' },
  { id: 'spk39', name: 'Speaker 39 (Rasalgethi)', voice: 'Rasalgethi', gender: 'male', description: 'Professional narrator' },
  { id: 'spk40', name: 'Speaker 40 (Erinome)', voice: 'Erinome', gender: 'female', description: 'Clear, soothing tone' },
  { id: 'spk41', name: 'Speaker 41 (Schedar)', voice: 'Schedar', gender: 'male', description: 'Balanced, firm tone' },
  { id: 'spk42', name: 'Speaker 42 (Laomedeia)', voice: 'Laomedeia', gender: 'female', description: 'Articulate, crisp tone' },
  { id: 'spk43', name: 'Speaker 43 (Pulcherrima)', voice: 'Pulcherrima', gender: 'male', description: 'Dynamic, forward tone' },
  { id: 'spk44', name: 'Speaker 44 (Achernar)', voice: 'Achernar', gender: 'female', description: 'Gentle, expressive tone' },
  { id: 'spk45', name: 'Speaker 45 (Algenib)', voice: 'Algenib', gender: 'male', description: 'Hearty, gravelly tone' },
  { id: 'spk46', name: 'Speaker 46 (Sulafat)', voice: 'Sulafat', gender: 'female', description: 'Warm, comforting tone' },
  { id: 'spk47', name: 'Speaker 47 (Alnilam)', voice: 'Alnilam', gender: 'male', description: 'Commanding, firm tone' },
  { id: 'spk48', name: 'Speaker 48 (Gacrux)', voice: 'Gacrux', gender: 'female', description: 'Mature, professional tone' },
  { id: 'spk49', name: 'Speaker 49 (Sadachbia)', voice: 'Sadachbia', gender: 'male', description: 'Lively, animated tone' },
  { id: 'spk50', name: 'Speaker 50 (Vindemiatrix)', voice: 'Vindemiatrix', gender: 'female', description: 'Delicate, calming tone' },
  { id: 'spk51', name: 'Speaker 51 (Sadaltager)', voice: 'Sadaltager', gender: 'male', description: 'Knowledgeable, steady tone' },
  { id: 'spk52', name: 'Speaker 52 (Zuri)', voice: 'Zuri', gender: 'female', description: 'Storytelling, warm tone' }
];

export const EMOTION_PROFILE_VERSION = 'gemini38-v1';
export const SLICER_VERSION = 'gemini38-longpause-v1';
export const DEFAULT_LAUGH_VOCAL_EVENT_MODE = 'style_only';

/**
 * Gemini 3.8 Centralized Emotion Style Profiles.
 * Emphasizes natural prosody, pitch contour, pacing, and emotional expression
 * without caricaturing or altering the underlying speaker identity.
 */
export const EMOTION_STYLE_PROFILES = {
  neutral: {
    name: 'Neutral',
    style: 'Natural conversational speech with emotionally neutral delivery. Steady comfortable pace, ordinary pitch variation, clear articulation, relaxed energy, no exaggerated emotion, and no announcer-style performance.'
  },
  happy: {
    name: 'Happy',
    style: 'Genuinely happy, warm, upbeat and smiling delivery. Bright natural intonation with increased positive energy and expressive pitch movement. Conversational and believable rather than cartoonish or exaggerated.'
  },
  cackle: {
    name: 'Cackle',
    style: 'Playful, smiling, amused cackle-infused delivery with cheerful energy while speaking each sentence. During pauses between sentences, remain completely quiet so each sentence is clearly articulated and distinctly separated.'
  },
  laugh: {
    name: 'Laugh',
    style: 'Strongly amused, cheerful and smiling chuckle-infused delivery with playful positive energy while speaking each sentence. During pauses between sentences, remain quiet so each sentence is clearly articulated and distinctly separated.'
  },
  sad: {
    name: 'Sad',
    style: 'Genuinely sad, subdued and melancholic delivery. Lower emotional energy, softer restrained expression and slightly slower natural pacing. Emotionally affected without crying, sobbing, or becoming unintelligible.'
  },
  angry: {
    name: 'Angry',
    style: 'Strongly angry, tense, forceful and agitated delivery. Sharper consonants, increased vocal energy, firm emphasis and emotionally charged prosody. Intelligible and controlled rather than shouting.'
  },
  whisper: {
    name: 'Whisper',
    style: 'Whisper continuously from beginning to end. Soft, breathy, quiet and confidential delivery with clear intelligible articulation. Remain fully whispered for the entire sentence and do not transition back into normal voiced speech.'
  },
  excited: {
    name: 'Excited',
    style: 'High positive energy, vivid enthusiasm, energetic inflection and dynamic pacing with natural breathing.'
  },
  sigh: {
    name: 'Sigh',
    style: 'Slight weary breath or heavy breath of relief/exhaustion accompanying speech, unhurried and emotionally grounded.'
  },
  tender: {
    name: 'Tender',
    style: 'Gentle, warm, loving and affectionate delivery with soft melodic intonation and gentle vocal onset.'
  },
  fearful: {
    name: 'Fearful',
    style: 'Nervous, trembling, urgent and anxious delivery with heightened tension and breathless pacing.'
  },
  curious: {
    name: 'Curious',
    style: 'Genuine curiosity, inquisitive questioning inflection, attentive and engaging prosody.'
  }
};

/**
 * Standard Slicing Configuration for Gemini 3.8 <long pause> boundaries.
 */
export const SLICING_CONFIG = {
  boundaryStrategy: 'gemini38_long_pause',
  silenceThresholdDb: '-28dB',
  minimumBoundaryDurationMs: 500, // 0.50s minimum to qualify as a <long pause>
  minimumClipDurationMs: 650,     // 0.65s minimum acceptable single clip duration
  maxClipDurationMs: 35000,       // 35s maximum sane clip duration
  acousticPaddingMs: 80,          // 80ms breathing room padding at midpoint cuts
  confidenceThreshold: 0.70       // Minimum acceptable QC confidence score
};

/**
 * Audio boundary refinement configuration.
 * Gating thresholds for training-ready speech clips.
 */
export const AUDIO_BOUNDARY_CONFIG = {
  preRollMs: 80,                 // 80 ms safe pre-roll before detected speech onset
  postRollMs: 120,               // 120 ms safe post-roll after detected speech ending
  idealLeadingSilenceMs: 80,     // Target 40-120 ms
  maxLeadingSilenceMs: 250,      // Anything > 250 ms is strictly NOT training-ready
  idealTrailingSilenceMs: 140,   // Target 80-200 ms
  maxTrailingSilenceMs: 300,     // Anything > 300 ms is strictly NOT training-ready
  frameDurationMs: 10,           // 10 ms analysis window
  hopDurationMs: 5,              // 5 ms hop size for fine resolution
  minimumActivityDurationMs: 50, // 50 ms sustained activity to reject transient clicks
  microFadeDurationMs: 3,        // 3 ms micro-fade at cut boundaries
  whisperSensitivityBoost: 1.5,  // Multiplier for high-frequency/ZCR weight in whisper mode
  clippingThreshold: 0.98        // Peak amplitude indicating digital clipping
};

/**
 * Three-tier QC Confidence & Boundary Evaluation:
 * >= 0.85        PASS
 * 0.70 - 0.849   WARNING / review
 * < 0.70         FAIL — do not mark training-ready
 * AND boundary_qc_pass MUST be true (leading <= 250ms, trailing <= 300ms, not clipped).
 */
export const QC_CONFIDENCE_TIERS = {
  PASS_MIN: 0.85,
  WARNING_MIN: 0.70
};

export function evaluateQcConfidence(confidence, boundaryMetrics = null) {
  const score = Math.round(Number(confidence || 0) * 1000) / 1000;
  let status = 'PASS';
  let grade = 'PASS';
  let training_ready = true;
  let review_required = false;
  let label = 'PASS';

  if (score >= QC_CONFIDENCE_TIERS.PASS_MIN) {
    status = 'PASS';
    grade = 'PASS';
  } else if (score >= QC_CONFIDENCE_TIERS.WARNING_MIN) {
    status = 'WARNING';
    grade = 'WARNING';
    review_required = true;
    label = 'WARNING / review';
  } else {
    status = 'FAIL';
    grade = 'FAIL';
    training_ready = false;
    review_required = true;
    label = 'FAIL — do not mark training-ready';
  }

  // Combined Boundary QC Check:
  // A clip is NOT training-ready if its boundaries fail acoustic inspection:
  let boundaryPass = true;
  const boundaryIssues = [];

  if (boundaryMetrics) {
    if (boundaryMetrics.leading_silence_ms > AUDIO_BOUNDARY_CONFIG.maxLeadingSilenceMs) {
      boundaryPass = false;
      boundaryIssues.push(`Excessive leading silence (${boundaryMetrics.leading_silence_ms}ms > ${AUDIO_BOUNDARY_CONFIG.maxLeadingSilenceMs}ms)`);
    }
    if (boundaryMetrics.trailing_silence_ms > AUDIO_BOUNDARY_CONFIG.maxTrailingSilenceMs) {
      boundaryPass = false;
      boundaryIssues.push(`Excessive trailing silence (${boundaryMetrics.trailing_silence_ms}ms > ${AUDIO_BOUNDARY_CONFIG.maxTrailingSilenceMs}ms)`);
    }
    if (boundaryMetrics.speech_start_clipped) {
      boundaryPass = false;
      boundaryIssues.push('Speech onset appears clipped at start boundary');
    }
    if (boundaryMetrics.speech_end_clipped) {
      boundaryPass = false;
      boundaryIssues.push('Speech ending appears clipped at end boundary');
    }

    if (!boundaryPass) {
      status = 'FAIL';
      grade = 'FAIL';
      training_ready = false;
      review_required = true;
      label = `FAIL (${boundaryIssues.join('; ')}) — not training-ready`;
    }
  }

  return {
    status,
    grade,
    training_ready,
    review_required,
    label,
    boundaryPass,
    boundaryIssues
  };
}

/**
 * Builds tailored prompt instructions for Gemini TTS for each emotion.
 * Cleanly separates Voice Direction from spoken transcript.
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

  const emoKey = String(emotion || 'neutral').toLowerCase();
  const profile = EMOTION_STYLE_PROFILES[emoKey] || EMOTION_STYLE_PROFILES.neutral;
  const numIntensity = Math.max(0.0, Math.min(1.0, parseFloat(intensity) || 0.8));

  return `You are an expert voice actor synthesizing a high-fidelity ${langLabel} speech training clip.
- Language / Dialect: ${languageDirective}
- Emotion Delivery: ${profile.style} (Target Intensity: ${numIntensity})
- Strict Rules: Speak ONLY the exact transcript text provided. Do NOT add preamble, metadata, emotion words, or conversational filler.`;
}

/**
 * Returns concise, focused sustained acting and prosody style description
 * for Gemini 3.8 speech_metadata.style.
 */
export function getEmotionSpeechStyle(emotion, intensity = 0.8, languageOrDialect = 'ckb') {
  const emoKey = String(emotion || 'neutral').toLowerCase();
  const profile = EMOTION_STYLE_PROFILES[emoKey] || EMOTION_STYLE_PROFILES.neutral;
  const numIntensity = Math.max(0.0, Math.min(1.0, parseFloat(intensity) || 0.8));

  const langKey = String(languageOrDialect || 'ckb').toLowerCase();
  let langHint = '';
  if (langKey === 'kmr' || langKey === 'badini') {
    langHint = 'Northern Kurdish Badini (Kurmanji) Duhok/Badinan dialect with authentic Kurmanji vowels (ڤ, خ, ح, غ, ۆ, ێ, ە).';
  } else if (langKey === 'ar' || langKey === 'arabic') {
    langHint = 'Authentic Modern Standard Arabic speech with clear Arabic phonetics.';
  } else if (langKey === 'en' || langKey === 'english') {
    langHint = 'Clear, fluent English speech with natural native articulation.';
  } else {
    langHint = 'Central Kurdish (Sorani / سۆرانی) Erbil/Sulaymaniyah dialect with authentic Kurdish vowels (ۆ, ێ, ە).';
  }

  return `${profile.style} Dialect: ${langHint} (Intensity: ${numIntensity}).`;
}

/**
 * Automatically injects a natural [laugh] vocal cue in the middle of a sentence
 * if one does not already exist, allowing Gemini to chuckle/laugh mid-sentence while cackling.
 */
export function injectMidSentenceLaugh(sentence) {
  if (!sentence) return '';
  const s = String(sentence).trim();
  if (/\[(?:laugh|chuckle|giggle|cackle)\]/i.test(s)) {
    return s;
  }

  // Look for a natural punctuation break (، or , or ؛ or ;) in the middle 25%-75% of the sentence
  const midStart = Math.floor(s.length * 0.25);
  const midEnd = Math.ceil(s.length * 0.75);
  const sub = s.slice(midStart, midEnd);

  const punctMatch = sub.search(/[،,؛;\-]/);
  if (punctMatch !== -1) {
    const cutPos = midStart + punctMatch + 1;
    return `${s.slice(0, cutPos)} [laugh] ${s.slice(cutPos).trim()}`.replace(/\s+/g, ' ');
  }

  // Fallback: split by words and insert after the middle word
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 4) {
    const midIdx = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, midIdx).join(' ');
    const secondHalf = words.slice(midIdx).join(' ');
    return `${firstHalf}، [laugh] ${secondHalf}`.replace(/\s+/g, ' ');
  }

  if (words.length >= 2) {
    return `${words[0]}، [laugh] ${words.slice(1).join(' ')}`.replace(/\s+/g, ' ');
  }

  return `${s} [laugh]`;
}
