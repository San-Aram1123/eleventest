import { GeminiBatchItem, BatchFileQueueItem, KurdishDialect } from '../../types';

export const BATCH_STORAGE_KEY = 'kurdish_tts_gemini_batch_v2';

export interface StoredGeminiBatchState {
  version: number;
  savedAt: string;
  activeTab?: 'single' | 'bulk' | 'paired';
  uploadedFileName?: string;
  rawBatchInput?: string;
  batchItems: GeminiBatchItem[];
  fileQueue?: BatchFileQueueItem[];
  activeFileId?: string | null;
  autoAdvanceNextFile?: boolean;
  batchState?: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  batchDelayMs?: number;
  batchFilter?: 'all' | 'completed' | 'failed' | 'pending';
  batchVoiceMode?: 'fixed' | 'random_female' | 'random_male' | 'mix_gender';
  dialect?: KurdishDialect;
  selectedVoice?: string;
  selectedModel?: string;
  customInstruction?: string;
}

export function getStoredBatchState(): StoredGeminiBatchState | null {
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.batchItems)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved batch state:', e);
  }
  return null;
}

export function saveStoredBatchState(state: StoredGeminiBatchState): void {
  try {
    localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save batch state to storage:', e);
  }
}

export function clearStoredBatchState(): void {
  try {
    localStorage.removeItem(BATCH_STORAGE_KEY);
  } catch (e) {}
}
