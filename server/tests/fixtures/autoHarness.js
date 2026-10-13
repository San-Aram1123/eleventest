import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createAutoJobManager } from '../../contextAuto/jobManager.js';
import { createJobStore } from '../../contextAuto/jobStore.js';
import { createAutoClipSaver } from '../../contextAuto/saveClips.js';
import { saveSample } from '../../dataset/datasetMutations.js';
import { createTestWav, wavDataUrl } from './wavFixture.js';

export const MASTER = createTestWav({ durationSeconds: 12, metadata: true });
export function acceptedAnalysis(paragraphs, engines = ['speaker_embedding', 'speaker_consensus']) {
  const segments = paragraphs.map((_, i) => ({ start: i * 12 / paragraphs.length,
    end: (i + 1) * 12 / paragraphs.length, duration: 12 / paragraphs.length }));
  return { success: true, durationSeconds: 12, engineResults: Object.fromEntries(engines.map(engine => [engine,
    { success: true, segments, diagnostics: { minConfidence: .9 },
      clips: paragraphs.map((text, i) => ({ ...segments[i], text, audioUrl: wavDataUrl(MASTER) })) }
  ])) };
}
export function autoRequest(count = 12, more = {}) {
  return { id: randomUUID(), model: 'gemini-3.8-flash-tts', speaker1Voice: 'Puck', speaker2Voice: 'Aoede',
    paragraphs: Array.from({ length: count }, (_, i) => `سڵاو ئەمە turn ${i + 1} — مرحبا.`), ...more };
}
export function harness(t, overrides = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'context-auto-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const store = createJobStore(path.join(directory, '.context-auto'), directory);
  const calls = [], analyses = [], writes = [];
  const saver = createAutoClipSaver({
    get: async id => {
      const filename = path.join(directory, `${id}.json`);
      return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : null;
    },
    getAudio: id => fs.readFileSync(path.join(directory, `${id}.wav`)),
    save: async params => {
      writes.push(params.id);
      return saveSample(params, { datasetDir: directory, invalidateCacheFn: () => {} });
    },
  });
  const dependencies = { store, autoStart: false, preflight: async () => {},
    generate: async params => {
      calls.push(params);
      await params.onMasterReady({ audioBuffer: MASTER });
      return { audioBuffer: MASTER };
    },
    analyze: async params => { analyses.push(params); return acceptedAnalysis(params.paragraphs); },
    saveClips: saver, ...overrides };
  const manager = createAutoJobManager(dependencies);
  return { directory, store, manager, calls, analyses, writes, saver, dependencies };
}
