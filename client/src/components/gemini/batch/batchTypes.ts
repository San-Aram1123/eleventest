import { GeminiBatchItem, BatchFileQueueItem, GeminiVoice, KurdishDialect, Sample } from '../../../types';

export interface UseGeminiBatchRunnerOptions {
  dialect: KurdishDialect;
  selectedVoice: string;
  selectedModel: string;
  customInstruction: string;
  voices: GeminiVoice[];
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  loadConfigAndPool: () => Promise<void>;
  uploadedFileName: string;
  rawBatchInput: string;
  fileQueue: BatchFileQueueItem[];
  setFileQueue: React.Dispatch<React.SetStateAction<BatchFileQueueItem[]>>;
  activeFileId: string | null;
  autoAdvanceNextFile: boolean;
  fileQueueRef: React.MutableRefObject<BatchFileQueueItem[]>;
  activeFileIdRef: React.MutableRefObject<string | null>;
  autoAdvanceNextFileRef: React.MutableRefObject<boolean>;
  advanceToNextQueuedFile: (finishedFileId?: string | null, forceStart?: boolean) => Promise<void>;
  initialItems?: GeminiBatchItem[];
  initialBatchState?: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  initialDelayMs?: number;
  initialFilter?: 'all' | 'completed' | 'failed' | 'pending';
  initialVoiceMode?: 'fixed' | 'random_female' | 'random_male' | 'mix_gender';
  activeTab: 'single' | 'bulk' | 'paired';
}
