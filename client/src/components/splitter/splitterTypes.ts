import React from 'react';
import { GeminiVoice, KurdishDialect, Sample } from '../../types';

export interface SplitterFileQueueItem {
  id: string;
  fileName: string;
  content: string;
  paragraphs: string[];
  status: 'queued' | 'active' | 'completed' | 'failed';
  totalPackets: number;
  completedPackets?: number;
  savedSamplesCount?: number;
}

export type SplitterVoiceStrategy = 'fixed' | 'random_female' | 'random_male' | 'mix_gender';

export type SplitterWorkflowMode = 'automated_batch' | 'manual_review';

export type SplitterBatchStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

export interface EmotionBadgeInfo {
  tag: string;
  color: string;
  bg: string;
  hasTag: boolean;
}

export interface PresetStory {
  title: string;
  dialect: KurdishDialect;
  paragraphs: string[];
}

export interface DuplicateParagraphStats {
  duplicateCount: number;
  uniqueCount: number;
}

export interface LongParagraphSplitterProps {
  voices: GeminiVoice[];
  models: { id: string; name: string }[];
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  dialect: KurdishDialect;
  setDialect: (d: KurdishDialect) => void;
  customInstruction: string;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export interface SplitterConfigPanelProps {
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  isResettingCooldowns: boolean;
  handleResetCooldowns: () => void;
  dialect: KurdishDialect;
  handleDialectSelect: (d: KurdishDialect) => void;
  defaultEmotion: string;
  setDefaultEmotion: (e: string) => void;
  showPromptSettings: boolean;
  setShowPromptSettings: React.Dispatch<React.SetStateAction<boolean>>;
  splitterPromptInstruction: string;
  setSplitterPromptInstruction: (inst: string | ((prev: string) => string)) => void;
  voiceStrategy: SplitterVoiceStrategy;
  setVoiceStrategy: (s: SplitterVoiceStrategy) => void;
  voices: GeminiVoice[];
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  packetSize: number;
  handlePacketSizeChange: (size: number) => void;
  packetsCount: number;
  allParagraphsCount: number;
  workflowMode: SplitterWorkflowMode;
  setWorkflowMode: (m: SplitterWorkflowMode) => void;
  children?: React.ReactNode;
}
