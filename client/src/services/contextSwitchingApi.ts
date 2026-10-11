import { Sample } from '../types';

const API_BASE = '/api';

export interface SlicedBatchResult {
  success: boolean;
  samples: Sample[];
  durationSeconds: number;
  batchSize?: number;
}

export async function fetchNextContextIndex(voiceName?: string): Promise<number> {
  try {
    const q = voiceName ? `?voiceName=${encodeURIComponent(voiceName)}` : '';
    const res = await fetch(`${API_BASE}/context-switching/next-index${q}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return typeof data.nextIndex === 'number' ? data.nextIndex : 1;
  } catch (err) {
    console.warn('[Context Switching API] Failed to fetch next index:', err);
    return 1;
  }
}

export async function executeContextSwitchingSlicedBatch(params: {
  paragraphs: string[];
  startIdx: number;
  voiceName: string;
  dialect?: string;
  apiKey?: string;
  signal?: AbortSignal;
}): Promise<SlicedBatchResult> {
  const { paragraphs, startIdx, voiceName, dialect = 'sorani', apiKey = '', signal } = params;

  const res = await fetch(`${API_BASE}/context-switching/generate-sliced-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paragraphs,
      startIdx,
      voiceName,
      dialect,
      apiKey,
      model: 'gemini-3.8-flash-tts'
    }),
    signal
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status} Slicing Error`);
  }

  const data = await res.json();
  const samples = Array.isArray(data.samples) ? data.samples : [];

  if (samples.length !== paragraphs.length) {
    throw new Error(
      `Slicing mismatch: Expected ${paragraphs.length} clips, but server returned ${samples.length}. Strictly aborted per policy.`
    );
  }

  return {
    success: true,
    samples,
    durationSeconds: data.durationSeconds || 0,
    batchSize: paragraphs.length
  };
}

export async function executeContextSwitchingSingleParagraph(params: {
  paragraph: string;
  itemIndex: number;
  voiceName: string;
  dialect?: string;
  apiKey?: string;
  signal?: AbortSignal;
}): Promise<Sample> {
  const { paragraph, itemIndex, voiceName, dialect = 'sorani', apiKey = '', signal } = params;

  const res = await fetch(`${API_BASE}/context-switching/generate-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paragraph,
      itemIndex,
      voiceName,
      dialect,
      apiKey,
      model: 'gemini-3.8-flash-tts'
    }),
    signal
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status} Generation Error`);
  }

  const data = await res.json();
  if (!data.sample) {
    throw new Error('Server returned empty sample response.');
  }

  return data.sample;
}

export async function abortContextSwitchingBatchOnServer(): Promise<void> {
  try {
    await fetch(`${API_BASE}/context-switching/abort-batch`, { method: 'POST' });
  } catch (err) {
    console.warn('[Context Switching API] Failed to notify server of abort:', err);
  }
}


