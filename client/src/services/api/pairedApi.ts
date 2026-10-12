import { API_BASE, parseResponse } from './apiClient';

export async function fetchNextFamilyIndex(speakerId?: string): Promise<{ speakerId: string; nextIndex: number }> {
  const query = speakerId ? `?speakerId=${encodeURIComponent(speakerId)}` : '';
  const res = await fetch(`${API_BASE}/paired/next-index${query}`);
  return await parseResponse(res, 'Failed to fetch next family index');
}

export async function fetchPairedConfig(): Promise<any> {
  const res = await fetch(`${API_BASE}/paired/config`);
  return await parseResponse(res, 'Failed to fetch paired config');
}

export async function validatePairedDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/paired/validate`);
  return await parseResponse(res, 'Failed to validate paired dataset');
}

export function getPairedZipExportUrl(): string {
  return `${API_BASE}/paired/export-zip`;
}

export function getPairedCsvExportUrl(): string {
  return `${API_BASE}/paired/export-csv`;
}
