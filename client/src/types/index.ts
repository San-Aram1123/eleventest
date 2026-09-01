export type EmotionType = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'whisper'
  | 'laughing'
  | 'custom';

export type GenerationMethod = 'elevenlabs_api' | 'elevenlabs_web';

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
  id: string;
  text: string;
  emotion: EmotionType | string;
  emotion_tag?: string;
  voice_id?: string;
  voice_name?: string;
  model_id?: string;
  generation_id?: string;
  method: GenerationMethod;
  language: string;
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

export interface SystemConfig {
  status: string;
  isKeyConfigured: boolean;
  keyValid: boolean;
  validationError?: string | null;
  maskedKey?: string | null;
  userInfo?: UserInfo | null;
}
