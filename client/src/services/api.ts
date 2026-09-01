import { 
  Sample, 
  Voice, 
  Model, 
  SystemConfig, 
  PendingSample, 
  EmotionType 
} from '../types';

const API_BASE = '/api';

export async function fetchConfig(): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch system configuration');
  return await res.json();
}

export async function updateApiKey(apiKey: string): Promise<{ success: boolean; message: string; userInfo?: any }> {
  const res = await fetch(`${API_BASE}/config/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update API key');
  return data;
}

export async function fetchVoices(): Promise<Voice[]> {
  const res = await fetch(`${API_BASE}/voices`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch voices');
  return data.voices || [];
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch models');
  return data.models || [];
}

export interface GenerateSpeechPayload {
  text: string;
  emotion: EmotionType | string;
  emotions?: string[];
  emotionTag?: string;
  includeTagInPrompt?: boolean;
  whisperEntire?: boolean;
  voiceId: string;
  voiceName?: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  customId?: string;
}

export async function generateApiSpeech(payload: GenerateSpeechPayload): Promise<{ success: boolean; sample: Sample }> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate speech');
  return data;
}

export async function prepareNormalSample(payload: {
  text: string;
  emotion?: string;
  emotionTag?: string;
  notes?: string;
  voiceName?: string;
}): Promise<{ success: boolean; pendingItem: PendingSample; allPending: PendingSample[] }> {
  const res = await fetch(`${API_BASE}/normal/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to prepare sample');
  return data;
}

export async function fetchNormalPending(): Promise<PendingSample[]> {
  const res = await fetch(`${API_BASE}/normal/pending`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch pending items');
  return data.pending || [];
}

export async function deleteNormalPending(pendingId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/normal/pending/${encodeURIComponent(pendingId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete pending item');
}

export async function uploadNormalWav(formData: FormData): Promise<{ success: boolean; message: string; sample: Sample; remainingPending?: PendingSample[] }> {
  const res = await fetch(`${API_BASE}/normal/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload WAV and match sample');
  return data;
}

export async function fetchDataset(): Promise<Sample[]> {
  const res = await fetch(`${API_BASE}/dataset`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch dataset');
  return data.samples || [];
}

export async function fetchSample(id: string): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch sample');
  return data.sample;
}

export async function updateSample(id: string, updates: Partial<Sample>): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update sample');
  return data.sample;
}

export async function deleteSample(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete sample');
}

export function getZipExportUrl(): string {
  return `${API_BASE}/dataset/export/zip`;
}

export function getAudioDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/wav`;
}

export function getJsonDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/json`;
}
