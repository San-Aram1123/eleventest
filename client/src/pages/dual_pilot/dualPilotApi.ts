const API_BASE = '/api';

export const FALLBACK_ELEVEN_VOICES = [
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female - Reassuring/Mature)', category: 'female' },
  { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (Female - Enthusiastic/Warm)', category: 'female' },
  { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (Female - Clear/Expressive)', category: 'female' },
  { voice_id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Male - Resonant/Laid-Back)', category: 'male' },
  { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (Male - Natural/Conversational)', category: 'male' },
  { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Male - Warm/Storyteller)', category: 'male' }
];

export interface GeminiVoiceInfo {
  id: string;
  name: string;
  gender?: string;
  description?: string;
}

export interface DualPilotConfigResponse {
  gemini: {
    model: string;
    voices: Array<string | GeminiVoiceInfo>;
    defaultFemaleVoice: string;
    defaultMaleVoice: string;
    keys: Array<{ index: number; maskedKey: string; status: string }>;
  };
  elevenlabs: {
    defaultModel: string;
    models: Array<{ model_id: string; name: string }>;
    voices: Array<{ voice_id: string; name: string; category?: string }>;
    keys: Array<{ index: number; maskedKey: string; status: string; remainingCharacters?: number }>;
  };
}

export async function fetchDualPilotConfig(): Promise<DualPilotConfigResponse> {
  const res = await fetch(`${API_BASE}/dual-pilot/config`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load dual pilot configuration.`);
  const data: DualPilotConfigResponse = await res.json();
  if (!data.elevenlabs.voices || data.elevenlabs.voices.length === 0) {
    data.elevenlabs.voices = FALLBACK_ELEVEN_VOICES;
  }
  return data;
}

export async function generateGeminiDualPilotChunk(payload: {
  paragraphs: string[];
  runId?: string;
  startIndex?: number;
  voices?: string[];
  femaleVoice: string;
  maleVoice: string;
  emotion: string;
  intensity: number;
  deliveryStyle: string;
  language?: string;
  dialect: string;
  saveToDataset?: boolean;
  signal?: AbortSignal;
}): Promise<{
  success: boolean;
  selectedEngine: string;
  selectionScore: number;
  clips: Array<{
    index: number;
    text: string;
    rawText?: string;
    emotion?: string;
    emotionTag?: string;
    hasInlineTag?: boolean;
    speakerName: string;
    gender: 'Female' | 'Male';
    duration: number;
    audioUrl: string;
    rejected?: boolean;
    rejectionReason?: string;
  }>;
  masterAudioUrl: string;
}> {
  const res = await fetch(`${API_BASE}/dual-pilot/gemini-chunk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: payload.signal
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status} Gemini generation error`);
  }
  return res.json();
}

export async function generateElevenLabsDualPilotTake(payload: {
  text: string;
  runId?: string;
  startIndex?: number;
  gender?: string;
  voiceId: string;
  voiceName: string;
  modelId: string;
  emotion: string;
  intensity?: number;
  deliveryStyle: string;
  language?: string;
  dialect?: string;
  saveToDataset?: boolean;
  signal?: AbortSignal;
}): Promise<{
  success: boolean;
  text: string;
  rawText?: string;
  emotion?: string;
  emotionTag?: string;
  hasInlineTag?: boolean;
  voiceId: string;
  voiceName: string;
  duration: number;
  keyUsedMasked: string;
  audioUrl: string;
}> {
  const res = await fetch(`${API_BASE}/dual-pilot/elevenlabs-take`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: payload.signal
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status} ElevenLabs generation error`);
  }
  return res.json();
}

export async function abortDualPilotBatch(): Promise<void> {
  await fetch(`${API_BASE}/dual-pilot/abort`, { method: 'POST' }).catch(() => {});
}

export async function addElevenLabsKey(apiKey: string): Promise<any> {
  const res = await fetch(`${API_BASE}/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add ElevenLabs key');
  }
  return res.json();
}

export async function deleteElevenLabsKey(index: number): Promise<any> {
  const res = await fetch(`${API_BASE}/config/keys/${index}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete ElevenLabs key');
  }
  return res.json();
}

export async function reserveDualPilotRun(): Promise<{ runId: string }> {
  const response = await fetch(`${API_BASE}/dual-pilot/runs`, { method: 'POST' });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(response.status === 404
      ? 'The backend has not loaded the batch reservation endpoint. Restart the backend server and try again.'
      : details.error || `Could not reserve unique batch indexes (HTTP ${response.status}).`);
  }
  return response.json();
}
