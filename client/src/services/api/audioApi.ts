import {
  Sample,
  Voice,
  Model,
  PendingSample,
  EmotionType,
  KurdishDialect
} from '../../types';
import { API_BASE, parseResponse } from './apiClient';

export async function fetchVoices(): Promise<Voice[]> {
  const res = await fetch(`${API_BASE}/voices`);
  const data = await parseResponse<{ voices: Voice[] }>(res, 'Failed to fetch voices');
  return data.voices || [];
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`);
  const data = await parseResponse<{ models: Model[] }>(res, 'Failed to fetch models');
  return data.models || [];
}

export interface GenerateSpeechPayload {
  text: string;
  dialect?: KurdishDialect;
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
  return await parseResponse(res, 'Failed to generate speech');
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
  return await parseResponse(res, 'Failed to prepare sample');
}

export async function fetchNormalPending(): Promise<PendingSample[]> {
  const res = await fetch(`${API_BASE}/normal/pending`);
  const data = await parseResponse<{ pending: PendingSample[] }>(res, 'Failed to fetch pending items');
  return data.pending || [];
}

export async function deleteNormalPending(pendingId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/normal/pending/${encodeURIComponent(pendingId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    await parseResponse(res, 'Failed to delete pending item');
  }
}

export async function uploadNormalWav(formData: FormData): Promise<{ success: boolean; message: string; sample: Sample; remainingPending?: PendingSample[] }> {
  const res = await fetch(`${API_BASE}/normal/upload`, {
    method: 'POST',
    body: formData
  });
  return await parseResponse(res, 'Failed to upload WAV and match sample');
}
