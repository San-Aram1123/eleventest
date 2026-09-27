import { SelectedEmotion } from './types';
import { Sample } from '../../types';

export interface RunSlicedParams {
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  sentence: string;
  sentenceIndex: number;
  familyId: string;
  emotions: SelectedEmotion[];
  model?: string;
  signal: AbortSignal;
}

export interface SlicedApiResponse {
  success: boolean;
  familyId: string;
  samples: Sample[];
  usedFallback?: boolean;
  errors?: Array<{ familyId: string; emotion: string; error: string }>;
}

export async function runFamilySlicedApi(params: RunSlicedParams): Promise<SlicedApiResponse> {
  const timeoutId = setTimeout(() => {
    // Timeout guard after 60s
  }, 60000);

  try {
    const res = await fetch('/api/paired/generate-family-sliced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speakerId: params.speakerId,
        voiceName: params.voiceName,
        dialect: params.language === 'kmr' ? 'badini' : 'sorani',
        language: params.language,
        sentence: params.sentence,
        sentenceIndex: params.sentenceIndex,
        familyId: params.familyId,
        emotions: params.emotions.map(e => ({ emotion: e.emotion, intensity: e.intensity })),
        ...(params.model ? { model: params.model } : {})
      }),
      signal: params.signal
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return {
      success: !!data.success,
      familyId: data.familyId || params.familyId,
      samples: Array.isArray(data.samples) ? data.samples : [],
      usedFallback: !!data.usedFallback,
      errors: Array.isArray(data.errors) ? data.errors : []
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface RunIndividualParams {
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

function withTimeoutSignal(parentSignal: AbortSignal, timeoutMs: number, timeoutMsg: string) {
  const ctrl = new AbortController();
  const onParentAbort = () => ctrl.abort(parentSignal.reason || new Error('Aborted by user'));
  if (parentSignal.aborted) {
    ctrl.abort(parentSignal.reason);
  } else {
    parentSignal.addEventListener('abort', onParentAbort, { once: true });
  }
  const timer = setTimeout(() => {
    ctrl.abort(new Error(timeoutMsg));
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timer);
    parentSignal.removeEventListener('abort', onParentAbort);
  };

  return { signal: ctrl.signal, cleanup };
}

export async function runSingleEmotionApi(params: RunIndividualParams): Promise<Sample | null> {
  const { signal, cleanup } = withTimeoutSignal(
    params.signal,
    60000,
    'Individual take request timed out on client after 60s'
  );
  try {
    const res = await fetch('/api/paired/generate-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speakerId: params.speakerId,
        voiceName: params.voiceName,
        dialect: params.language === 'kmr' ? 'badini' : 'sorani',
        language: params.language,
        sentence: params.sentence,
        sentenceIndex: params.sentenceIndex,
        familyId: params.familyId,
        emotion: params.emotion,
        intensity: params.intensity,
        ...(params.model ? { model: params.model } : {})
      }),
      signal
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return data.sample || null;
  } finally {
    cleanup();
  }
}

export interface RunTransposedParams {
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

export interface TransposedApiResponse {
  success: boolean;
  emotion: string;
  sentenceCount: number;
  samples: Sample[];
  markerCount?: number;
  quotaSavings?: string;
}

export async function runTransposedBatchApi(params: RunTransposedParams): Promise<TransposedApiResponse> {
  const { signal, cleanup } = withTimeoutSignal(
    params.signal,
    150000,
    'Batch request timed out on client after 150s (network/server stall)'
  );
  try {
    const res = await fetch('/api/paired/generate-transposed-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speakerId: params.speakerId,
        voiceName: params.voiceName,
        dialect: params.language === 'kmr' ? 'badini' : 'sorani',
        language: params.language,
        sentences: params.sentences,
        startIdx: params.startIdx,
        emotion: params.emotion,
        intensity: params.intensity,
        slicingStrategy: params.slicingStrategy || 'kurdish_align',
        ...(params.model ? { model: params.model } : {})
      }),
      signal
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return {
      success: !!data.success,
      emotion: data.emotion || params.emotion,
      sentenceCount: data.sentenceCount || params.sentences.length,
      samples: Array.isArray(data.samples) ? data.samples : [],
      markerCount: data.markerCount,
      quotaSavings: data.quotaSavings
    };
  } finally {
    cleanup();
  }
}

