import { ExpressiveFamily, ExpressiveLanguage } from './expressiveFamilyTypes';
import { BatchExecutionMode } from './useExpressiveBatchRunner';

export const EXPRESSIVE_BATCH_STORAGE_KEY = 'audar_expressive_batch_state_v1';

export interface StoredExpressiveBatch {
  isActive: boolean;
  isPaused: boolean;
  sentences: string[];
  conditionIds: string[];
  language: ExpressiveLanguage;
  selectedSpeakerId: string;
  autoRotateSpeakers: boolean;
  startIdx: number;
  batchMode: BatchExecutionMode;
  chunkSize: number;
  presetTier?: string;
  completedTaskKeys: string[];
  families: ExpressiveFamily[];
  completedClips: number;
  totalClips: number;
  startTime: number | null;
  savedAt: string;
}

export function sanitizeFamiliesForStorage(families: ExpressiveFamily[]): ExpressiveFamily[] {
  return families.map(f => ({
    ...f,
    takes: f.takes.map(t => ({
      ...t,
      audioBase64: undefined,
      audioBlobUrl: t.audioBlobUrl?.startsWith('blob:') 
        ? `/api/dataset/${t.id}/audio` 
        : (t.audioBlobUrl || `/api/dataset/${t.id}/audio`)
    }))
  }));
}

export function loadStoredExpressiveBatch(): StoredExpressiveBatch | null {
  try {
    const raw = localStorage.getItem(EXPRESSIVE_BATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sentences) && parsed.sentences.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[Expressive Storage] Failed to load stored batch:', e);
  }
  return null;
}

export function saveStoredExpressiveBatch(data: Omit<StoredExpressiveBatch, 'savedAt'>): void {
  try {
    const toSave: StoredExpressiveBatch = {
      ...data,
      families: sanitizeFamiliesForStorage(data.families),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(EXPRESSIVE_BATCH_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[Expressive Storage] Failed to save batch state:', e);
  }
}

export function clearStoredExpressiveBatch(): void {
  try {
    localStorage.removeItem(EXPRESSIVE_BATCH_STORAGE_KEY);
  } catch {}
}

export function hasActiveStoredBatch(): boolean {
  const stored = loadStoredExpressiveBatch();
  return !!(stored && stored.isActive && stored.sentences.length > 0);
}

