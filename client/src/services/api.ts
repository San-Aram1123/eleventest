import { 
  Sample, 
  Voice, 
  Model, 
  SystemConfig, 
  PendingSample, 
  EmotionType,
  KeyPoolResponse,
  KeyPoolItem,
  DatabaseStatus,
  GeminiConfig,
  GeminiVoice,
  GeminiKeyPoolResponse,
  GeminiKeyPoolItem,
  KurdishDialect,
  DatasetExportFilters,
  LongSplitChunk,
  LongSplitResponse
} from '../types';

const API_BASE = '/api';

/**
 * Safely parses response body as JSON.
 * Avoids crashing with "Unexpected end of JSON input" on empty or non-JSON error pages.
 */
async function parseResponse<T = any>(res: Response, fallbackError = 'Request failed'): Promise<T> {
  const text = await res.text();
  let data: any = null;

  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || (text && text.length < 200 ? text : `${fallbackError} (Status: ${res.status})`);
    throw new Error(errorMsg);
  }

  return (data !== null ? data : {}) as T;
}

export async function fetchConfig(): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/config`);
  return await parseResponse<SystemConfig>(res, 'Failed to fetch system configuration');
}

export async function fetchDbStatus(): Promise<DatabaseStatus> {
  const res = await fetch(`${API_BASE}/config/db`);
  return await parseResponse<DatabaseStatus>(res, 'Failed to fetch database status');
}

export async function testDbConnection(data: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/config/db/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await parseResponse(res, 'Database connection test failed');
}

export async function fetchKeyPool(): Promise<KeyPoolResponse> {
  const res = await fetch(`${API_BASE}/config/keys`);
  return await parseResponse<KeyPoolResponse>(res, 'Failed to fetch key pool');
}

export async function addKeyToPool(apiKey: string): Promise<{ success: boolean; message: string; pool: KeyPoolItem[] }> {
  const res = await fetch(`${API_BASE}/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to add key to pool');
}

export async function deleteKeyFromPool(index: number): Promise<{ success: boolean; message: string; pool: KeyPoolItem[] }> {
  const res = await fetch(`${API_BASE}/config/keys/${index}`, {
    method: 'DELETE'
  });
  return await parseResponse(res, 'Failed to delete key');
}

export async function updateApiKey(apiKey: string): Promise<{ success: boolean; message: string; userInfo?: any }> {
  const res = await fetch(`${API_BASE}/config/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to update API key');
}

export async function fetchGeminiConfig(): Promise<GeminiConfig> {
  const res = await fetch(`${API_BASE}/gemini/config`);
  return await parseResponse<GeminiConfig>(res, 'Failed to fetch Gemini configuration');
}

export async function fetchGeminiKeyPool(): Promise<GeminiKeyPoolResponse> {
  const res = await fetch(`${API_BASE}/gemini/config/keys`);
  return await parseResponse<GeminiKeyPoolResponse>(res, 'Failed to fetch Gemini key pool');
}

export async function reloadGeminiKeyPool(): Promise<{ success: boolean; message: string; pool: GeminiKeyPoolItem[]; poolSize: number; readyCount: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/reload`, {
    method: 'POST'
  });
  return await parseResponse(res, 'Failed to reload Gemini key pool');
}

export async function resetGeminiCooldowns(): Promise<{ success: boolean; message: string; pool: GeminiKeyPoolItem[]; poolSize: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/reset-cooldowns`, {
    method: 'POST'
  });
  return await parseResponse(res, 'Failed to reset Gemini key cooldowns');
}

export async function probeGeminiKeys(index?: number): Promise<{ success: boolean; pool: GeminiKeyPoolItem[]; probe?: any; maskedKey?: string }> {
  const url = typeof index === 'number' 
    ? `${API_BASE}/gemini/config/keys/${index}/probe`
    : `${API_BASE}/gemini/config/keys/probe`;
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
  success: boolean;
  message: string;
  addedCount: number;
  poolSize: number;
  pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof keys === 'string' ? { text: keys } : { keys })
  });
  return await parseResponse(res, 'Failed to bulk-add Gemini keys');
}

export async function deleteGeminiKeyFromPool(index: number): Promise<{ success: boolean; message: string; poolSize: number }> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/${index}`, {
    method: 'DELETE'
  });
  return await parseResponse(res, 'Failed to delete Gemini key');
}

export async function toggleGeminiKey(index: number, enabled?: boolean): Promise<{
  success: boolean;
  message: string;
  isEnabled: boolean;
  activeCount: number;
  totalCount: number;
  pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/${index}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof enabled === 'boolean' ? { enabled } : {})
  });
  return await parseResponse(res, 'Failed to toggle Gemini key state');
}

export async function toggleAllGeminiKeys(enabled: boolean): Promise<{
  success: boolean;
  message: string;
  enabled: boolean;
  activeCount: number;
  totalCount: number;
  pool: GeminiKeyPoolItem[];
}> {
  const res = await fetch(`${API_BASE}/gemini/config/keys/toggle-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
  return await parseResponse(res, 'Failed to toggle all Gemini keys');
}

export async function toggleBulkGeminiKeys(indices: number[], enabled: boolean): Promise<{
  success: boolean;
  message: string;
  enabled: boolean;
  activeCount: number;
  totalCount: number;
  pool: GeminiKeyPoolItem[];
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

export async function generateGeminiSpeech(payload: {
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
}): Promise<{
  success: boolean;
  sample?: Sample;
  audioBase64?: string;
  durationSeconds: number;
  voiceName: string;
  model: string;
  usedKeyMasked?: string;
  detectedTags?: string[];
  alreadyExists?: boolean;
  isMultilingual?: boolean;
}> {
  const res = await fetch(`${API_BASE}/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await parseResponse(res, 'Failed to generate speech with Gemini');
}

export async function generateLongSplitSpeech(payload: {
  text?: string;
  paragraphs?: string[];
  voiceName?: string;
  dialect?: KurdishDialect;
  model?: string;
  emotion?: string;
  promptInstruction?: string;
  apiKey?: string;
}): Promise<LongSplitResponse> {
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

export async function fetchDataset(): Promise<Sample[]> {
  const res = await fetch(`${API_BASE}/dataset`);
  const data = await parseResponse<{ samples: Sample[] }>(res, 'Failed to fetch dataset');
  return data.samples || [];
}

export async function fetchSample(id: string): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`);
  const data = await parseResponse<{ sample: Sample }>(res, 'Failed to fetch sample');
  return data.sample;
}

export async function updateSample(id: string, updates: Partial<Sample>): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await parseResponse<{ sample: Sample }>(res, 'Failed to update sample');
  return data.sample;
}

export async function deleteSample(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    await parseResponse(res, 'Failed to delete sample');
  }
}

export async function batchDeleteSamples(ids: string[]): Promise<{ success: boolean; count: number; deletedIds: string[] }> {
  const res = await fetch(`${API_BASE}/dataset/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  return await parseResponse(res, 'Failed to batch delete samples');
}

function buildExportQuery(filters?: DatasetExportFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);
  if (filters.voice && filters.voice !== 'all') params.append('voice', filters.voice);
  if (filters.dialect && filters.dialect !== 'all') params.append('dialect', filters.dialect);
  if (filters.language && filters.language !== 'all') params.append('language', filters.language);
  if (filters.emotion && filters.emotion !== 'all') params.append('emotion', filters.emotion);
  if (filters.method && filters.method !== 'all') params.append('method', filters.method);
  if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
  if (filters.ids) {
    const idStr = Array.isArray(filters.ids) ? filters.ids.join(',') : filters.ids;
    if (idStr.trim()) params.append('ids', idStr.trim());
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

export function getZipExportUrl(filters?: DatasetExportFilters): string {
  return `${API_BASE}/dataset/export/zip${buildExportQuery(filters)}`;
}

export function getAudarZipExportUrl(filters?: DatasetExportFilters): string {
  return `${API_BASE}/dataset/export/audar-zip${buildExportQuery(filters)}`;
}

export async function fetchExportPreview(filters?: DatasetExportFilters): Promise<{
  count: number;
  totalSamples: number;
  maleCount: number;
  femaleCount: number;
  totalDurationSeconds: number;
  totalAudioSizeBytes: number;
}> {
  const res = await fetch(`${API_BASE}/dataset/export/preview${buildExportQuery(filters)}`);
  return await parseResponse(res, 'Failed to fetch export preview');
}

export async function fetchAudarSummary(filters?: DatasetExportFilters): Promise<any> {
  const res = await fetch(`${API_BASE}/dataset/export/audar-summary${buildExportQuery(filters)}`);
  return await parseResponse(res, 'Failed to fetch Audar dataset summary');
}

export function getAudioDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/wav`;
}

export function getJsonDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/json`;
}

export async function fetchPairedConfig(): Promise<any> {
  const res = await fetch(`${API_BASE}/paired/config`);
  return await parseResponse(res, 'Failed to fetch paired config');
}

export async function validatePairedDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/paired/validate`);
  return await parseResponse(res, 'Failed to validate paired dataset');
}

export function getPairedZipExportUrl(): string {
  return `${API_BASE}/paired/export-zip`;
}

export function getPairedCsvExportUrl(): string {
  return `${API_BASE}/paired/export-csv`;
}

