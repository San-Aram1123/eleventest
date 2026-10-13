import { AutoCreateRequest, AutoDraft } from './contextAutoApi';

export const AUTO_DEFAULT_DRAFT: AutoDraft = { text: '', speaker1Voice: 'Puck', speaker2Voice: 'Aoede',
  model: 'gemini-3.8-flash-tts', dialect: 'sorani', options: { confidenceThreshold: .6 } };

export function readAutoStorage<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(`context-auto-${key}`); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

export function writeAutoStorage(key: string, value: unknown): void {
  if (value === null) localStorage.removeItem(`context-auto-${key}`);
  else localStorage.setItem(`context-auto-${key}`, JSON.stringify(value));
}

export const readAutoDraft = () => ({ ...AUTO_DEFAULT_DRAFT, ...readAutoStorage<Partial<AutoDraft>>('draft', {}) });
export const readPendingAutoRequest = () => readAutoStorage<AutoCreateRequest | null>('submission', null);

export const isAutoJobFinished = (status?: string) => status === 'completed' || status === 'completed_with_errors';

export function clearAutoJobView(id?: string): void {
  writeAutoStorage('job-id', null);
  if (id && readPendingAutoRequest()?.id === id) writeAutoStorage('submission', null);
}

export function createAutoJobId(provider: Pick<Crypto, 'getRandomValues'> & Partial<Pick<Crypto, 'randomUUID'>> = globalThis.crypto): string {
  if (typeof provider?.randomUUID === 'function') return provider.randomUUID();
  // getRandomValues also works on HTTP LAN origins where randomUUID is unavailable.
  if (typeof provider?.getRandomValues !== 'function') throw new Error('Browser randomness is unavailable. Open the app on localhost or HTTPS.');
  const bytes = provider.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
