import { SystemConfig, DatabaseStatus, KeyPoolResponse, KeyPoolItem } from '../../types';
import { API_BASE, parseResponse } from './apiClient';

export async function fetchConfig(): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/config`);
  return await parseResponse<SystemConfig>(res, 'Failed to fetch system configuration');
}

export async function fetchDbStatus(): Promise<DatabaseStatus> {
  const res = await fetch(`${API_BASE}/config/db`);
  return await parseResponse<DatabaseStatus>(res, 'Failed to fetch database status');
}

export async function testDbConnection(data: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/config/db/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await parseResponse(res, 'Database connection test failed');
}

export async function fetchKeyPool(): Promise<KeyPoolResponse> {
  const res = await fetch(`${API_BASE}/config/keys`);
  return await parseResponse<KeyPoolResponse>(res, 'Failed to fetch key pool');
}

export async function addKeyToPool(apiKey: string): Promise<{ success: boolean; message: string; pool: KeyPoolItem[] }> {
  const res = await fetch(`${API_BASE}/config/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to add key to pool');
}

export async function deleteKeyFromPool(index: number): Promise<{ success: boolean; message: string; pool: KeyPoolItem[] }> {
  const res = await fetch(`${API_BASE}/config/keys/${index}`, {
    method: 'DELETE'
  });
  return await parseResponse(res, 'Failed to delete key');
}

export async function updateApiKey(apiKey: string): Promise<{ success: boolean; message: string; userInfo?: any }> {
  const res = await fetch(`${API_BASE}/config/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return await parseResponse(res, 'Failed to update API key');
}
