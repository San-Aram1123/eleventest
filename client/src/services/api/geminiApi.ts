import {
  Sample, GeminiConfig, GeminiKeyPoolResponse, GeminiKeyPoolItem,
  KurdishDialect, LongSplitChunk, LongSplitResponse
} from '../../types';
import { API_BASE, parseResponse } from './apiClient';

export async function fetchGeminiConfig(): Promise<GeminiConfig> {
  const res = await fetch(`${API_BASE}/gemini/config`);
  return await parseResponse<GeminiConfig>(res, 'Failed to fetch Gemini configuration');
}

export async function fetchGeminiKeyPool(): Promise<GeminiKeyPoolResponse> {
  const res = await fetch(`${API_BASE}/gemini/config/keys`);
  return await parseResponse<GeminiKeyPoolResponse>(res, 'Failed to fetch Gemini key pool');
}

export async function reloadGeminiKeyPool(): Promise<{ success: boolean; message: string; pool: GeminiKeyPoolItem[]; poolSize: number; readyCount: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/reload`, { method: 'POST' });
  return await parseResponse(res, 'Failed to reload Gemini key pool');
}

export async function resetGeminiCooldowns(): Promise<{ success: boolean; message: string; pool: GeminiKeyPoolItem[]; poolSize: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/reset-cooldowns`, { method: 'POST' });
  return await parseResponse(res, 'Failed to reset Gemini key cooldowns');
}

export async function probeGeminiKeys(index?: number): Promise<{ success: boolean; pool: GeminiKeyPoolItem[]; probe?: any; maskedKey?: string }> {
  const url = typeof index === 'number' ? `${API_BASE}/gemini/config/keys/${index}/probe` : `${API_BASE}/gemini/config/keys/probe`;
  const res = await fetch(url, { method: 'POST' });
  return await parseResponse(res, 'Failed to live-probe Gemini key');
}

export async function addGeminiKeyToPool(apiKey: string): Promise<{ success: boolean; message: string; pool: GeminiKeyPoolItem[] }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to add Gemini key to pool');
}

export async function addBulkGeminiKeysToPool(keys: string | string[]): Promise<{
  success: boolean; message: string; addedCount: number; poolSize: number; pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof keys === 'string' ? { text: keys } : { keys })
  });
  return await parseResponse(res, 'Failed to bulk-add Gemini keys');
}

export async function deleteGeminiKeyFromPool(index: number): Promise<{ success: boolean; message: string; poolSize: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/${index}`, { method: 'DELETE' });
  return await parseResponse(res, 'Failed to delete Gemini key');
}

export async function toggleGeminiKey(index: number, enabled?: boolean): Promise<{
  success: boolean; message: string; isEnabled: boolean; activeCount: number; totalCount: number; pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/${index}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof enabled === 'boolean' ? { enabled } : {})
  });
  return await parseResponse(res, 'Failed to toggle Gemini key state');
}

export async function toggleAllGeminiKeys(enabled: boolean): Promise<{
  success: boolean; message: string; enabled: boolean; activeCount: number; totalCount: number; pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/toggle-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
  return await parseResponse(res, 'Failed to toggle all Gemini keys');
}

export async function toggleBulkGeminiKeys(indices: number[], enabled: boolean): Promise<{
  success: boolean; message: string; enabled: boolean; activeCount: number; totalCount: number; pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/toggle-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indices, enabled })
  });
  return await parseResponse(res, 'Failed to toggle selected Gemini keys');
}

export async function saveGeminiKey(apiKey: string): Promise<{ success: boolean; message: string; maskedKey: string }> {
  const res = await fetch(`${API_BASE}/gemini/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to configure Gemini API Key');
}

export interface GenerateGeminiSpeechPayload {
  text: string;
  voiceName?: string;
  dialect?: KurdishDialect;
  model?: string;
  emotion?: string;
  promptInstruction?: string;
  apiKey?: string;
  saveToDataset?: boolean;
  customId?: string;
  forceRegenerate?: boolean;
}

export async function generateGeminiSpeech(payload: GenerateGeminiSpeechPayload): Promise<{
  success: boolean; sample?: Sample; audioBase64?: string; durationSeconds: number;
  voiceName: string; model: string; usedKeyMasked?: string; detectedTags?: string[];
  alreadyExists?: boolean; isMultilingual?: boolean;
}> {
  const res = await fetch(`${API_BASE}/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await parseResponse(res, 'Failed to generate speech with Gemini');
}

export interface LongSplitPayload {
  text?: string;
  paragraphs?: string[];
  voiceName?: string;
  dialect?: KurdishDialect;
  model?: string;
  emotion?: string;
  promptInstruction?: string;
  apiKey?: string;
}

export async function generateLongSplitSpeech(payload: LongSplitPayload): Promise<LongSplitResponse> {
  const res = await fetch(`${API_BASE}/gemini/generate-long-split`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await parseResponse<LongSplitResponse>(res, 'Failed to generate and split long audio');
}

export async function saveSplitChunksToDataset(payload: {
  chunks: LongSplitChunk[];
  voiceName?: string;
  dialect?: KurdishDialect;
  model?: string;
}): Promise<{ success: boolean; savedCount: number; savedSamples: Sample[]; errors?: any[] }> {
  const res = await fetch(`${API_BASE}/gemini/save-split-chunks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await parseResponse(res, 'Failed to save split chunks to dataset');
}
