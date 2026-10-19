import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
const defaultRoot = fileURLToPath(new URL('../../dataset/.request-statistics/', import.meta.url));
const memory = new Map();
function state() {
  const root = process.env.REQUEST_STATS_DIR || defaultRoot;
  if (memory.has(root)) return memory.get(root);
  const value = { root, since: null, rows: new Map() };
  const file = path.join(root, 'requests.jsonl');
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    try { apply(value, JSON.parse(line)); } catch { /* Ignore an incomplete final event after a crash. */ }
  }
  memory.set(root, value); return value;
}
function apply(value, event) {
  value.since ||= event.at;
  const row = value.rows.get(event.keyId) || { keyId: event.keyId, provider: event.provider,
    maskedKey: event.maskedKey, requests: 0, succeeded: 0, failed: 0, rateLimited: 0,
    inputCharacters: 0, durationMs: 0, models: {}, lastUsed: null };
  if (event.kind === 'start') {
    row.requests++; row.inputCharacters += event.characters;
    row.models[event.model] = (row.models[event.model] || 0) + 1;
    row.lastUsed = event.at;
  } else {
    if (event.ok) row.succeeded++; else row.failed++;
    if (event.status === 429) row.rateLimited++;
    row.durationMs += event.durationMs;
  }
  value.rows.set(event.keyId, row);
}
function record(event) {
  if (process.env.NODE_TEST_CONTEXT && !process.env.REQUEST_STATS_DIR) return;
  try {
    const value = state(); fs.mkdirSync(value.root, { recursive: true });
    fs.appendFileSync(path.join(value.root, 'requests.jsonl'), JSON.stringify(event) + '\n');
    apply(value, event);
  } catch (error) { console.warn('[Request statistics] Could not persist counters:', error.code || 'storage error'); }
}
export async function trackedSpeechFetch(provider, key, model, url, options) {
  const requestId = randomUUID(), start = Date.now();
  const base = { requestId, provider, model, keyId: createHash('sha256').update(provider + key).digest('hex').slice(0, 16),
    maskedKey: `${key.slice(0, 4)}...${key.slice(-4)}` };
  let characters = 0;
  try {
    const body = JSON.parse(options.body || '{}');
    characters = body.text?.length || body.contents?.flatMap(content => content.parts || []).reduce((sum, part) => sum + (part.text?.length || 0), 0) || 0;
  } catch { /* Counting is optional; never impede synthesis. */ }
  record({ ...base, kind: 'start', at: new Date().toISOString(), characters });
  try {
    const response = await fetch(url, options);
    record({ ...base, kind: 'end', at: new Date().toISOString(), ok: response.ok,
      status: response.status || (response.ok ? 200 : 0), durationMs: Date.now() - start });
    return response;
  } catch (error) {
    record({ ...base, kind: 'end', at: new Date().toISOString(), ok: false, status: 0, durationMs: Date.now() - start });
    throw error;
  }
}
export function getRequestStatistics() {
  const value = state();
  const rows = [...value.rows.values()].map(row => ({ ...row,
    unfinished: Math.max(0, row.requests - row.succeeded - row.failed) }));
  return { since: value.since, rows, note: 'Speech HTTP attempts tracked since instrumentation was installed. Cached audio and configuration calls are excluded; earlier requests cannot be reconstructed accurately.' };
}
