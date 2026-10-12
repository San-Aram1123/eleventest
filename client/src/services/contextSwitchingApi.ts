import { Sample } from '../types';

const API_BASE = '/api';

export interface SlicedBatchResult {
  success: boolean;
  samples: Sample[];
  durationSeconds: number;
  batchSize?: number;
  masterAudioUrl?: string;
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
    batchSize: paragraphs.length,
    masterAudioUrl: data.masterAudioUrl || undefined
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

export type DetectionEngineType = 'timbre_dp' | 'spectral_change' | 'speaker_embedding' | 'speaker_resnet' | 'speaker_eres2net' | 'speaker_strict' | 'speaker_consensus' |
  'pyannote' | 'pitch_f0' | 'neural_crossover' | 'tri_hybrid' | 'iterative_dp' | 'all';

export interface LabAnalysisOptions {
  expectedBoundaries?: number[];
  minSegmentSeconds?: number;
  maxSegmentSeconds?: number;
  confidenceThreshold?: number;
}

export interface IterativeAttemptLog {
  attemptNumber: number;
  strategy: string;
  status: 'success' | 'adjusted' | 'rejected';
  score: number;
  reason: string;
  segments?: Array<{ index: number; start: number; end: number; duration: number }>;
  boundaries?: Array<{ midpoint: number; duration: number; start: number; end: number }>;
}

export interface LabClip {
  index: number;
  engine: string;
  speakerName: string;
  speakerTurn: string;
  text: string;
  start: number;
  end: number;
  duration: number;
  audioUrl: string;
  confidence?: number;
  boundaryInfo?: Record<string, unknown>;
}

export interface LabEngineResult {
  success: boolean;
  error?: string;
  clips: LabClip[];
  diagnostics?: Record<string, unknown>;
}

export interface BoundaryComparison {
  boundary: number;
  cuts?: Record<string, number>;
  pyannote_cut_s?: number;
  pitch_f0_cut_s?: number;
  crossover_cut_s?: number;
  tri_hybrid_cut_s?: number;
  iterative_cut_s?: number;
  max_spread_ms: number;
  agreement: string;
}

export interface LabBatchResponse {
  success: boolean;
  error?: string;
  mode: DetectionEngineType;
  masterAudioUrl?: string;
  pyannoteClips?: LabClip[];
  pitchClips?: LabClip[];
  crossoverClips?: LabClip[];
  triHybridClips?: LabClip[];
  iterativeClips?: LabClip[];
  clips?: LabClip[];
  comparisonTable?: BoundaryComparison[];
  durationSeconds: number;
  speaker1Voice?: string;
  speaker2Voice?: string;
  iterativeAttempts?: IterativeAttemptLog[];
  engineResults?: Record<string, LabEngineResult>;
  reusedMaster?: boolean;
  warnings?: string[];
}

export interface ContextLabBatchParams {
  paragraphs: string[];
  startIdx: number;
  dialect?: string;
  apiKey?: string;
  speaker1Voice: string;
  speaker2Voice: string;
  detectionEngine: DetectionEngineType;
  options?: LabAnalysisOptions;
  reference1Audio?: string;
  reference2Audio?: string;
  signal?: AbortSignal;
}

export async function executeContextLabBatch(params: ContextLabBatchParams): Promise<LabBatchResponse> {
  const {
    paragraphs,
    startIdx,
    dialect = 'sorani',
    apiKey = '',
    speaker1Voice,
    speaker2Voice,
    detectionEngine,
    signal,
    options,
    reference1Audio,
    reference2Audio
  } = params;

  const res = await fetch(`${API_BASE}/context-switching/generate-lab-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paragraphs,
      startIdx,
      dialect,
      apiKey,
      speaker1Voice,
      speaker2Voice,
      detectionEngine,
      options,
      reference1Audio,
      reference2Audio,
      model: 'gemini-3.8-flash-tts'
    }),
    signal
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status} Lab Slicing Error`);
  }

  const data: LabBatchResponse = await res.json();
  return data;
}

export async function analyzeContextLabMaster(params: {
  masterAudio: Blob;
  paragraphs: string[];
  startIdx: number;
  speaker1Voice: string;
  speaker2Voice: string;
  detectionEngine: DetectionEngineType;
  reference1?: File | null;
  reference2?: File | null;
  options?: LabAnalysisOptions;
  signal?: AbortSignal;
}): Promise<LabBatchResponse> {
  const body = new FormData();
  body.append('masterAudio', params.masterAudio, 'master.wav');
  if (params.reference1) body.append('reference1', params.reference1);
  if (params.reference2) body.append('reference2', params.reference2);
  body.append('paragraphs', JSON.stringify(params.paragraphs));
  body.append('startIdx', String(params.startIdx));
  body.append('speaker1Voice', params.speaker1Voice);
  body.append('speaker2Voice', params.speaker2Voice);
  body.append('detectionEngine', params.detectionEngine);
  body.append('options', JSON.stringify(params.options || {}));
  const res = await fetch(`${API_BASE}/context-switching/analyze-lab-master`, {
    method: 'POST', body, signal: params.signal
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status} Audio Analysis Error`);
  return data;
}

export async function saveLabClipsToDataset(params: {
  clips: LabClip[];
  startIdx: number;
  dialect?: string;
}): Promise<{ success: boolean; count: number; samples: Sample[] }> {
  const res = await fetch(`${API_BASE}/context-switching/save-lab-clips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status} Save Error`);
  }

  return await res.json();
}


