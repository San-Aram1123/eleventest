import { LabAnalysisOptions } from './contextSwitchingApi';

export interface AutoDraft {
  text: string;
  speaker1Voice: string;
  speaker2Voice: string;
  model: string;
  dialect: string;
  options: LabAnalysisOptions;
}

export interface AutoBatch {
  number: number;
  offset: number;
  startIndex: number;
  paragraphs: string[];
  status: string;
  error?: string | null;
  selectedEngine?: string;
  selectionReason?: string;
  pendingReview?: boolean;
  reviewWarnings?: string[];
  saved: Array<{ id: string; index: number; voice: string; audioUrl: string }>;
  methods?: Array<{ engine: string; success: boolean; score?: number; error?: string; elapsedMs?: number }>;
  masterUrl?: string | null;
  diagnosticsUrl?: string | null;
}

export interface AutoJob {
  id: string;
  status: string;
  message: string;
  config: Omit<AutoDraft, 'text'>;
  paragraphs: string[];
  firstIndex: number;
  batches: AutoBatch[];
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  savedCount: number;
  totalParagraphs: number;
  completedGroups: number;
  generatedGroups?: number;
  pipeline?: { backlogLimit: number; waitingMasters: number; generationState: string; analysisState: string;
    generatingGroup: number | null; analyzingGroup: number | null };
  pauseRequested: boolean;
}

export interface AutoCreateRequest extends Omit<AutoDraft, 'text'> {
  id: string;
  paragraphs: string[];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/context-auto${url}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

export const listAutoJobs = (signal?: AbortSignal) => request<{ jobs: AutoJob[] }>('/jobs', { signal });
export const getAutoJob = (id: string, signal?: AbortSignal) => request<AutoJob>(`/jobs/${encodeURIComponent(id)}`, { signal });
export const createAutoJob = (params: AutoCreateRequest) => request<AutoJob>('/jobs', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params)
});
export const controlAutoJob = (id: string, command: 'pause' | 'resume' | 'retry-analysis') => request<AutoJob>(
  `/jobs/${encodeURIComponent(id)}/${command}`, { method: 'POST' });
