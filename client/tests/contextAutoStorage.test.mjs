import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/contextAutoStorage.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const storage = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const values = new Map();

test('job IDs work without randomUUID on HTTP LAN origins', () => {
  let calls = 0;
  const provider = { getRandomValues: bytes => { bytes.fill(++calls); return bytes; } };
  const first = storage.createAutoJobId(provider);
  const second = storage.createAutoJobId(provider);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(first, second);
  storage.writeAutoStorage('submission', { id: first });
  assert.equal(storage.readPendingAutoRequest().id, first);
});
globalThis.localStorage = { getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };

test('pasted Unicode and settings survive restoring a draft', () => {
  const draft = { ...storage.AUTO_DEFAULT_DRAFT, text: 'سڵاو — ئەمە تاقیکردنەوەیە.\nمرحبا English.', model: 'gemini-3.1-flash-tts-preview' };
  storage.writeAutoStorage('draft', draft);
  assert.deepEqual(storage.readAutoDraft(), draft);
});

test('a pending submission restores the same request ID and exact text until acknowledged', () => {
  const request = { id: 'persisted-id', paragraphs: ['سڵاو', 'مرحبا'], model: 'gemini-3.8-flash-tts' };
  storage.writeAutoStorage('submission', request);
  assert.deepEqual(storage.readPendingAutoRequest(), request);
  storage.writeAutoStorage('submission', null);
  assert.equal(storage.readPendingAutoRequest(), null);
});

test('malformed browser storage falls back safely', () => {
  values.set('context-auto-draft', '{broken JSON');
  assert.deepEqual(storage.readAutoDraft(), storage.AUTO_DEFAULT_DRAFT);
});

test('clearing a completed view removes its saved selection and matching stale submission', () => {
  storage.writeAutoStorage('job-id', 'finished');
  storage.writeAutoStorage('submission', { id: 'finished' });
  storage.clearAutoJobView('finished');
  assert.equal(storage.readAutoStorage('job-id', null), null);
  assert.equal(storage.readPendingAutoRequest(), null);
  assert.equal(storage.isAutoJobFinished('completed'), true);
  assert.equal(storage.isAutoJobFinished('completed_with_errors'), true);
  assert.equal(storage.isAutoJobFinished('running'), false);
  storage.writeAutoStorage('submission', { id: 'different-unsubmitted-job' });
  storage.clearAutoJobView('finished');
  assert.equal(storage.readPendingAutoRequest().id, 'different-unsubmitted-job');
});
