import { Sample } from '../../types';

export interface EmotionItem {
  id: string;
  name: string;
  kurdish: string;
  defaultIntensity: number;
  description: string;
}

export interface SpeakerPreset {
  id: string;
  name: string;
  voice: string;
  gender: 'male' | 'female';
  description: string;
}

export interface SelectedEmotion {
  emotion: string;
  intensity: number;
  enabled: boolean;
}

export interface PairedClipReport {
  id: string;
  intensity: number;
  audioUrl: string;
}

export interface PairedFamilyReport {
  familyId: string;
  speaker: string;
  text: string;
  status: 'valid' | 'incomplete' | 'invalid';
  presentCount: number;
  requiredCount: number;
  presentEmotions: string[];
  missingEmotions: string[];
  emotionClipMap: Record<string, PairedClipReport>;
  issues: string[];
}

export interface PairedValidationReport {
  timestamp: string;
  totalFamilies: number;
  validFamiliesCount: number;
  incompleteFamiliesCount: number;
  errorCount: number;
  totalPairedClips: number;
  requiredEmotions: string[];
  isCompliant: boolean;
  completionPercentage: number;
  families: PairedFamilyReport[];
}

export interface PairedBatchState {
  isActive: boolean;
  isPaused: boolean;
  currentSentenceIdx: number;
  totalSentences: number;
  currentEmotionIdx: number;
  totalEmotionsPerSentence: number;
  currentFamilyId: string;
  currentEmotion: string;
  completedClips: number;
  totalClipsToGenerate: number;
  mode?: 'sliced' | 'individual';
  errors: Array<{ familyId: string; emotion: string; error: string }>;
}
