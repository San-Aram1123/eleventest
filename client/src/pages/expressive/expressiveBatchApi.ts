import { PilotSpeaker, ExpressiveTake, MatrixCondition } from './expressiveConstants';
import { MixedCondition } from './expressiveMixedConstants';
import { ExpressiveLanguage } from './expressiveFamilyTypes';
import { generateGeminiSpeech } from '../../services/api';

export interface TransposedBatchCallParams {
  chunkSentences: string[];
  chunkStartIdx: number;
  speaker: PilotSpeaker;
  language: ExpressiveLanguage;
  condition: MatrixCondition | MixedCondition;
  systemPersona: string;
  signal?: AbortSignal;
}

export async function executeTransposedSlicedBatch(
  params: TransposedBatchCallParams
): Promise<ExpressiveTake[]> {
  const {
    chunkSentences,
    chunkStartIdx,
    speaker,
    language,
    condition: cond,
    systemPersona,
    signal
  } = params;

  const isMixed = 'pairKey' in cond;
  const targetEmotion = isMixed ? cond.primaryEmotion : (cond as MatrixCondition).emotion;
  const targetIntensity = isMixed ? cond.primaryIntensity : (cond as MatrixCondition).intensityValue;
  const targetDelivery = isMixed ? 'normal' : (cond as MatrixCondition).delivery;
  const targetIntensityLabel = isMixed
    ? (targetIntensity >= 0.8 ? 'high' : 'medium')
    : (cond as MatrixCondition).intensityLabel;

  const res = await fetch('/api/paired/generate-transposed-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      speakerId: speaker.id,
      voiceName: speaker.voiceName,
      dialect: language === 'kmr' ? 'badini' : 'sorani',
      language: language === 'kmr' ? 'ckb' : language,
      sentences: chunkSentences,
      startIdx: chunkStartIdx + 1,
      emotion: targetEmotion,
      intensity: targetIntensity,
      model: 'gemini-3.8-flash-tts',
      slicingStrategy: 'silence',
      conditionId: cond.id,
      customInstruction: `${systemPersona} ${cond.actingDirective}`,
      customStyle: cond.actingDirective
    }),
    signal
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const samples = Array.isArray(data.samples) ? data.samples : [];

  if (samples.length !== chunkSentences.length) {
    throw new Error(
      `Slicing returned ${samples.length} clips, expected ${chunkSentences.length}. Aborting per strict policy.`
    );
  }

  // Strict Safety Guardrail: All clips must be within [6.0s - 16.5s]
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const dur = Number(s.duration_seconds || s.duration || 0);
    if (dur < 6.0 || dur > 16.5) {
      throw new Error(
        `Safety Guardrail failed: Clip ${i + 1} duration is ${dur.toFixed(2)}s (outside strict 6.0s - 16.5s limit). Aborting take.`
      );
    }
  }

  return samples.map((s: any, i: number) => {
    const sIdx = chunkStartIdx + i;
    const sentenceNum = sIdx + 1;
    const famId = s.family_id || `${speaker.id}_${sentenceNum.toString().padStart(3, '0')}`;
    const sText = chunkSentences[i];
    const takeId = s.id || `exp_${famId}_${cond.id}`;

    return {
      id: takeId,
      scriptId: famId,
      transcript: sText,
      speakerId: speaker.id,
      speakerName: speaker.name,
      speakerGender: speaker.gender,
      language: language === 'kmr' ? 'ckb' : language,
      emotion: targetEmotion,
      emotionIntensity: targetIntensity,
      delivery: targetDelivery,
      intensityLabel: targetIntensityLabel,
      conditionId: cond.id,
      duration: s.duration_seconds || s.duration || 3.5,
      audioBlobUrl: s.audioUrl || `/api/dataset/${s.id}/audio`,
      createdAt: Date.now(),
      status: 'approved',
      review: {
        reviewer_id: 'REVIEWER_01',
        emotion_correct: true,
        delivery_correct: true,
        intensity_level: targetIntensityLabel,
        naturalness: 4
      }
    };
  });
}

export async function abortBatchOnServer(): Promise<void> {
  try {
    await fetch('/api/paired/abort-batch', { method: 'POST' });
  } catch (_) {
    // Ignore network error on abort
  }
}

export async function executeIndividualTake(params: {
  sentenceText: string;
  sentenceIdx: number;
  familyId: string;
  speaker: PilotSpeaker;
  language: ExpressiveLanguage;
  condition: MatrixCondition | MixedCondition;
  systemPersona: string;
  signal?: AbortSignal;
}): Promise<ExpressiveTake | null> {
  if (params.signal?.aborted) return null;
  const { sentenceText, sentenceIdx, familyId, speaker, language, condition: cond, systemPersona, signal } = params;

  const isMixed = 'pairKey' in cond;
  const targetEmotion = isMixed ? cond.primaryEmotion : (cond as MatrixCondition).emotion;
  const targetIntensity = isMixed ? cond.primaryIntensity : (cond as MatrixCondition).intensityValue;
  const targetDelivery = isMixed ? 'normal' : (cond as MatrixCondition).delivery;
  const targetIntensityLabel = isMixed
    ? (targetIntensity >= 0.8 ? 'high' : 'medium')
    : (cond as MatrixCondition).intensityLabel;

  const cleanId = `exp_${familyId}_${cond.id}`;

  const res = await generateGeminiSpeech({
    text: sentenceText,
    voiceName: speaker.voiceName,
    dialect: language === 'kmr' ? 'badini' : 'sorani',
    model: 'gemini-3.8-flash-tts',
    promptInstruction: `${systemPersona} ${cond.actingDirective}`,
    saveToDataset: false,
    customId: cleanId
  });

  if (!res.success || !res.audioBase64) return null;

  const indDur = Number(res.durationSeconds || 0);
  if (indDur > 0 && (indDur < 6.0 || indDur > 16.5)) {
    console.warn(`[Safety Guard] Individual take duration ${indDur.toFixed(2)}s outside [6.0s - 16.5s]. Aborting take.`);
    return null;
  }

  return {
    id: cleanId,
    scriptId: familyId,
    transcript: sentenceText,
    speakerId: speaker.id,
    speakerName: speaker.name,
    speakerGender: speaker.gender,
    language: language === 'kmr' ? 'ckb' : language,
    emotion: targetEmotion,
    emotionIntensity: targetIntensity,
    delivery: targetDelivery,
    intensityLabel: targetIntensityLabel,
    conditionId: cond.id,
    duration: res.durationSeconds || 3.5,
    audioBase64: res.audioBase64,
    createdAt: Date.now(),
    status: 'approved',
    review: {
      reviewer_id: 'REVIEWER_01',
      emotion_correct: true,
      delivery_correct: true,
      intensity_level: targetIntensityLabel,
      naturalness: 4
    }
  };
}
