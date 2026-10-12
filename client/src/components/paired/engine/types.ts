import { SelectedEmotion } from '../types';
import { Sample } from '../../../types';

export interface FailedBatchTask {
  id: string;
  mode: 'sliced' | 'individual';
  sentences: string[];
  startIdx: number;
  sentenceIndex?: number;
  emotion: string;
  intensity: number;
  speakerId: string;
  voiceName: string;
  familyId: string;
  error: string;
}

export interface BatchEngineParams {
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  startIdx: number;
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  mode: 'sliced' | 'individual';
  model?: string;
  chunkSize?: number;
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  randomizeVoices: boolean;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}
