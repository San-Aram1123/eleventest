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
        emotions: params.emotions.map(e => ({ emotion: e.emotion, intensity: e.intensity }))
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
  signal: AbortSignal;
}

export async function runSingleEmotionApi(params: RunIndividualParams): Promise<Sample | null> {
  const timeoutId = setTimeout(() => {}, 45000);
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
        intensity: params.intensity
      }),
      signal: params.signal
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return data.sample || null;
  } finally {
    clearTimeout(timeoutId);
  }
}
