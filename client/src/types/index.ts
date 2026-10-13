export type EmotionType = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'whisper'
  | 'laughing'
  | 'custom';

export type KurdishDialect = 'sorani' | 'badini';

export type GenerationMethod = 'elevenlabs_api' | 'elevenlabs_web' | 'gemini_api';

export interface GeminiVoice {
  id: string;
  name: string;
  gender: string;
  description: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface GeminiKeyPoolItem {
  id: string;
  index: number;
  maskedKey: string;
  status: 'ready' | 'exhausted' | 'daily_exhausted' | 'invalid' | 'disabled';
  isEnabled: boolean;
  quotaType?: 'daily' | 'minute';
  quotaLimit?: string;
  dailyResetInfo?: string | null;
  isValid: boolean;
  hasQuota?: boolean;
  error: string | null;
  totalRequests?: number;
  successCount?: number;
  failureCount?: number;
  lastUsedAt?: string | null;
  retryAvailableAt?: number | null;
  remainingSeconds?: number;
  cooldownDurationSeconds?: number;
}

export interface GeminiKeyPoolResponse {
  pool: GeminiKeyPoolItem[];
  poolSize: number;
  activeCount?: number;
  disabledCount?: number;
  activeKeyIndex: number;
  readyCount?: number;
}

export interface GeminiBatchItem {
  id: number;
  lineNumber: number;
  text: string;
  cleanText: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  sample?: Sample;
  error?: string;
  duration?: number;
  keyUsed?: string;
  tags?: string[];
  voiceName?: string;
  voiceGender?: 'Male' | 'Female';
}
export interface BatchFileQueueItem {
  id: string;
  fileName: string;
  content: string;
  lineCount: number;
  status: 'queued' | 'active' | 'completed' | 'failed';
  addedAt: string;
  completedLines?: number;
  failedLines?: number;
}

export interface LongSplitChunk {
  id: number;
  chunkIndex: number;
  text: string;
  cleanText: string;
  startTime: number;
  endTime: number;
  duration: number;
  audioBase64: string;
  voiceName?: string;
  dialect?: KurdishDialect;
  emotion?: string;
  status: 'ready' | 'saving' | 'saved' | 'error';
  savedSample?: Sample;
  error?: string;
}

export interface LongSplitResponse {
  success: boolean;
  masterDuration: number;
  voiceName: string;
  model: string;
  usedKeyMasked: string;
  detectedTags?: string[];
  chunks: LongSplitChunk[];
  masterAudioBase64?: string;
}

export interface GeminiConfig {
  isKeyConfigured: boolean;
  poolSize?: number;
  maskedKey: string | null;
  voices: GeminiVoice[];
  models?: GeminiModel[];
  defaultModel?: string;
  defaultVoice?: string;
  model: string;
}

export interface AlignmentData {
  characters?: string[];
  character_start_times_seconds?: number[];
  character_end_times_seconds?: number[];
  [key: string]: any;
}

export interface SampleRatings {
  naturalness: number;   // 1 - 5
  emotion: number;       // 1 - 5
  pronunciation: number; // 1 - 5
  overall: number;       // 1 - 5
  notes?: string;
}

export interface Sample {
  review_status?: 'pending' | 'reviewed';
  review_warnings?: string[];
  id: string;
  family_id?: string;
  emotion_intensity?: number;
  speaker_name?: string;
  text: string;
  cleanText?: string;
  durationSeconds?: number;
  duration_seconds?: number;
  audio_size?: number;
  emotion: EmotionType | string;
  emotion_tag?: string;
  voice_id?: string;
  voice_name?: string;
  model_id?: string;
  generation_id?: string;
  method: GenerationMethod;
  language: string;
  dialect?: KurdishDialect;
  script: string;
  characters?: string[];
  alignment?: AlignmentData | null;
  ratings?: SampleRatings;
  notes?: string;
  created_at: string;
  updated_at?: string;
  audio_filename: string;
  json_filename: string;
  hasAudio?: boolean;
  audioUrl?: string;
  voice_gender?: string;
  gender?: string;
  used_key?: string;
  metadata_extra?: any;
  customMetadata?: any;
}

export interface DatasetExportFilters {
  gender?: 'all' | 'male' | 'female' | string;
  voice?: string;
  dialect?: 'all' | 'sorani' | 'badini' | string;
  language?: string;
  emotion?: string;
  method?: string;
  ids?: string[] | string;
  search?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  description?: string;
}

export interface Model {
  model_id: string;
  name: string;
  description?: string;
  languages?: string[];
}

export interface UserInfo {
  tier?: string;
  character_count?: number;
  character_limit?: number;
  status?: string;
}

export interface PendingSample {
  pendingId: string;
  text: string;
  emotion: string;
  emotionTag?: string;
  notes?: string;
  voiceName?: string;
  createdAt: string;
}

export interface KeyPoolItem {
  id: string;
  index: number;
  maskedKey: string;
  tier: string;
  characterCount: number;
  characterLimit: number;
  remainingCharacters: number;
  status: 'ready' | 'exhausted' | 'invalid' | string;
  isValid: boolean;
  error?: string | null;
}

export interface KeyPoolResponse {
  keys: KeyPoolItem[];
  totalKeys: number;
  readyKeys: number;
  totalRemainingCharacters: number;
}

export interface DatabaseStatus {
  configured: boolean;
  connected: boolean;
  error?: string | null;
  database?: string;
  host?: string;
  port?: number;
  sampleCount?: number;
}

export interface SystemConfig {
  status: string;
  isKeyConfigured: boolean;
  keyValid: boolean;
  poolSize?: number;
  validationError?: string | null;
  maskedKey?: string | null;
  userInfo?: UserInfo | null;
  database?: DatabaseStatus;
}
