import { runTransposedBatchApi, runSingleEmotionApi } from '../pairedBatchRunner';
import { Sample } from '../../../types';
import { FailedBatchTask } from './types';

export interface ExecuteSlicedParams {
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  sentences: string[];
  startIdx: number;
  emotion: string;
  intensity: number;
  model?: string;
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  signal: AbortSignal;
}

export interface ExecuteIndividualParams {
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  sentence: string;
  sentenceIndex: number;
  familyId: string;
  emotion: string;
  intensity: number;
  model?: string;
  signal: AbortSignal;
}

/**
 * Executes a sliced sub-chunk with up to 3 retries and 429 quota backoff.
 * STRICT POLICY: NEVER fallback to individual 1:1 mode. NEVER fallback to Gemini 2.5.
 */
export async function executeSlicedSubChunk(params: ExecuteSlicedParams): Promise<{
  success: boolean;
  samples: Sample[];
  error?: string;
}> {
  const {
    speakerId, voiceName, language, sentences, startIdx,
    emotion, intensity, model, slicingStrategy, signal
  } = params;

  let lastErr = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (signal.aborted) break;
    try {
      const resData = await runTransposedBatchApi({
        speakerId, voiceName, language, sentences, startIdx,
        emotion, intensity,
        model: model || 'gemini-3.8-flash-tts',
        slicingStrategy,
        signal
      });

      const samples = resData.samples || [];
      if (!samples || samples.length === 0) {
        throw new Error('Server returned 0 audio samples.');
      }

      return { success: true, samples };
    } catch (err: any) {
      if (err.name === 'AbortError') break;
      lastErr = err.message || 'Network error';
      if (attempt < 3 && !signal.aborted) {
        const isRateLimit = lastErr.toLowerCase().includes('cooldown') ||
                            lastErr.toLowerCase().includes('rate') ||
                            lastErr.toLowerCase().includes('quota') ||
                            lastErr.includes('429');
        const backoffMs = isRateLimit ? (35000 + attempt * 10000) : 4000;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  return { success: false, samples: [], error: lastErr || 'Failed after 3 attempts' };
}

/**
 * Executes an individual take with up to 3 retries.
 * STRICT POLICY: NEVER fallback to Gemini 2.5.
 */
export async function executeIndividualTake(params: ExecuteIndividualParams): Promise<{
  success: boolean;
  sample: Sample | null;
  error?: string;
}> {
  const {
    speakerId, voiceName, language, sentence, sentenceIndex,
    familyId, emotion, intensity, model, signal
  } = params;

  let lastTakeError = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (signal.aborted) break;
    try {
      const sample = await runSingleEmotionApi({
        speakerId, voiceName, language, sentence, sentenceIndex,
        familyId, emotion, intensity,
        model: model || 'gemini-3.8-flash-tts',
        signal
      });
      if (sample) {
        return { success: true, sample };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') break;
      lastTakeError = err.message || 'Unknown error';
      if (attempt < 3 && !signal.aborted) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  return { success: false, sample: null, error: lastTakeError || 'Failed after 3 attempts' };
}

/**
 * Re-executes a previously failed task in its original mode.
 */
export async function executeRetryTask(params: {
  task: FailedBatchTask;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  model?: string;
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  signal: AbortSignal;
}): Promise<{ success: boolean; samples: Sample[]; error?: string }> {
  const { task, language, model, slicingStrategy, signal } = params;
  if (task.mode === 'sliced') {
    return await executeSlicedSubChunk({
      speakerId: task.speakerId, voiceName: task.voiceName, language,
      sentences: task.sentences, startIdx: task.startIdx,
      emotion: task.emotion, intensity: task.intensity,
      model, slicingStrategy, signal
    });
  }
  const res = await executeIndividualTake({
    speakerId: task.speakerId, voiceName: task.voiceName, language,
    sentence: task.sentences[0] || '',
    sentenceIndex: task.sentenceIndex || task.startIdx,
    familyId: task.familyId, emotion: task.emotion, intensity: task.intensity,
    model, signal
  });
  return {
    success: res.success,
    samples: res.sample ? [res.sample] : [],
    error: res.error
  };
}
