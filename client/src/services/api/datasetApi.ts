import { Sample, DatasetExportFilters } from '../../types';
import { API_BASE, parseResponse } from './apiClient';

export async function fetchDataset(): Promise<Sample[]> {
  const res = await fetch(`${API_BASE}/dataset`);
  const data = await parseResponse<{ samples: Sample[] }>(res, 'Failed to fetch dataset');
  return data.samples || [];
}

export async function fetchSample(id: string): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`);
  const data = await parseResponse<{ sample: Sample }>(res, 'Failed to fetch sample');
  return data.sample;
}

export async function updateSample(id: string, updates: Partial<Sample>): Promise<Sample> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await parseResponse<{ sample: Sample }>(res, 'Failed to update sample');
  return data.sample;
}

export async function deleteSample(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/dataset/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    await parseResponse(res, 'Failed to delete sample');
  }
}

export async function batchDeleteSamples(ids: string[]): Promise<{ success: boolean; count: number; deletedIds: string[] }> {
  const res = await fetch(`${API_BASE}/dataset/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  return await parseResponse(res, 'Failed to batch delete samples');
}

export async function deleteDurationOutliers(minSeconds = 6.0, maxSeconds = 16.5): Promise<{
  success: boolean;
  count: number;
  deletedIds: string[];
  underCount: number;
  overCount: number;
  minSeconds: number;
  maxSeconds: number;
}> {
  const res = await fetch(`${API_BASE}/dataset/delete-outliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minSeconds, maxSeconds })
  });
  return await parseResponse(res, 'Failed to delete duration outliers');
}

export function buildExportQuery(filters?: DatasetExportFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);
  if (filters.voice && filters.voice !== 'all') params.append('voice', filters.voice);
  if (filters.dialect && filters.dialect !== 'all') params.append('dialect', filters.dialect);
  if (filters.language && filters.language !== 'all') params.append('language', filters.language);
  if (filters.emotion && filters.emotion !== 'all') params.append('emotion', filters.emotion);
  if (filters.method && filters.method !== 'all') params.append('method', filters.method);
  if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
  if (filters.ids) {
    const idStr = Array.isArray(filters.ids) ? filters.ids.join(',') : filters.ids;
    if (idStr.trim()) params.append('ids', idStr.trim());
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

export function getZipExportUrl(filters?: DatasetExportFilters): string {
  return `${API_BASE}/dataset/export/zip${buildExportQuery(filters)}`;
}

export function getAudarZipExportUrl(filters?: DatasetExportFilters): string {
  return `${API_BASE}/dataset/export/audar-zip${buildExportQuery(filters)}`;
}

export function getV20ZipExportUrl(filters?: DatasetExportFilters): string {
  return `${API_BASE}/dataset/export/v20-zip${buildExportQuery(filters)}`;
}

export async function fetchExportPreview(filters?: DatasetExportFilters): Promise<{
  count: number;
  totalSamples: number;
  maleCount: number;
  femaleCount: number;
  totalDurationSeconds: number;
  totalAudioSizeBytes: number;
}> {
  const res = await fetch(`${API_BASE}/dataset/export/preview${buildExportQuery(filters)}`);
  return await parseResponse(res, 'Failed to fetch export preview');
}

export async function fetchAudarSummary(filters?: DatasetExportFilters): Promise<any> {
  const res = await fetch(`${API_BASE}/dataset/export/audar-summary${buildExportQuery(filters)}`);
  return await parseResponse(res, 'Failed to fetch Audar dataset summary');
}

export function getAudioDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/wav`;
}

export function getJsonDownloadUrl(id: string): string {
  return `${API_BASE}/dataset/${encodeURIComponent(id)}/download/json`;
}
