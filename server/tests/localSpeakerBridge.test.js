import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { detectLocalSpeakerSegments, validateEngineResult } from '../alignment/localSpeakerBridge.js';
import { createTestWav } from './fixtures/wavFixture.js';

function safeEngine() {
  return {
    success: true,
    totalDuration: 4,
    diagnostics: { confidence: 0.9, warning: 'Keep this diagnostic' },
    segments: [{ start: 0, end: 2, duration: 2 }, { start: 2, end: 4, duration: 2 }],
  };
}

function assertRejected(result, pattern) {
  assert.equal(result.success, false);
  assert.deepEqual(result.segments, [], 'Rejected boundaries must never remain available for slicing');
  assert.match(result.error, pattern);
}

test('accepts exact contiguous segment coverage and retains detector diagnostics', () => {
  const result = validateEngineResult(safeEngine(), 2);
  assert.equal(result.success, true);
  assert.equal(result.segments.length, 2);
  assert.equal(result.diagnostics.warning, 'Keep this diagnostic');
});

test('explicit detector failure cannot become a successful guessed segmentation', () => {
  const result = validateEngineResult({ ...safeEngine(), success: false, error: 'Only one real speaker turn found' }, 2);
  assertRejected(result, /one real speaker turn/);
  assert.equal(result.diagnostics.confidence, 0.9);
});

test('rejects missing, malformed and nonboolean engine success results', () => {
  for (const input of [null, [], 'success', { ...safeEngine(), success: 'true' }]) {
    assert.equal(validateEngineResult(input, 2).success, false);
  }
});

test('rejects dropped or fabricated additional takes', () => {
  assertRejected(validateEngineResult(safeEngine(), 3), /expected 3 segments/);
  assertRejected(validateEngineResult(safeEngine(), 1), /expected 1 segments/);
});

test('rejects gaps, overlaps, reversed order, and missing start coverage', () => {
  for (const [start, end] of [[2.2, 4], [1.8, 4], [2.002, 4], [1.998, 4], [3, 2], [0, 4]]) {
    const input = safeEngine();
    input.segments[1] = { start, end };
    assert.equal(validateEngineResult(input, 2).success, false, `${start}..${end} must be rejected`);
  }
  const leadingGap = safeEngine();
  leadingGap.segments[0] = { start: 0.1, end: 2 };
  assertRejected(validateEngineResult(leadingGap, 2), /gap or overlaps/);
});

test('rejects nonfinite, string, negative, zero, and out-of-audio timestamps', () => {
  for (const value of [NaN, Infinity, -Infinity, '2', null, -0.1, 0, 4.5]) {
    const input = safeEngine();
    input.segments[0] = { start: 0, end: value };
    assert.equal(validateEngineResult(input, 2).success, false, `Invalid timestamp ${value}`);
  }
});

test('rejects too-short or too-long takes and inconsistent duration metadata', () => {
  assertRejected(validateEngineResult(safeEngine(), 2, { minSegmentSeconds: 2.1 }), /duration limits/);
  assertRejected(validateEngineResult(safeEngine(), 2, { maxSegmentSeconds: 1.9 }), /duration limits/);
  const input = safeEngine();
  input.segments[1].duration = 3;
  assertRejected(validateEngineResult(input, 2), /inconsistent duration/);
});

test('rejects truncated final audio coverage', () => {
  const input = safeEngine();
  input.segments[1] = { start: 2, end: 3.7 };
  assertRejected(validateEngineResult(input, 2), /complete master audio/);
});

test('validates expected count, total duration and safety options', () => {
  for (const count of [0, -1, 1.5, Infinity, '2']) {
    assertRejected(validateEngineResult(safeEngine(), count), /positive integer/);
  }
  for (const totalDuration of [0, -1, NaN, Infinity, '4']) {
    assertRejected(validateEngineResult(safeEngine(), 2, {}, totalDuration), /invalid audio duration/);
  }
  for (const options of [{ minSegmentSeconds: 0 }, { minSegmentSeconds: NaN }, { maxSegmentSeconds: 0.1 }, { maxSegmentSeconds: Infinity }]) {
    assertRejected(validateEngineResult(safeEngine(), 2, options), /duration limits/);
  }
  assertRejected(validateEngineResult(safeEngine(), 2, null), /detector options/);
});

test('bridge rejects unknown modes and invalid counts without invoking Python', async () => {
  assertRejected(await detectLocalSpeakerSegments('absent.wav', 2, 'equal_split'), /Unknown local speaker mode/);
  assertRejected(await detectLocalSpeakerSegments('absent.wav', 2.5), /positive integer/);
});

test('pre-cancelled analysis rejects with AbortError before filesystem or subprocess work', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(detectLocalSpeakerSegments('absent.wav', 2, 'all', {}, controller.signal), { name: 'AbortError' });
});

test('missing input fails explicitly without generating replacement requests', async () => {
  const result = await detectLocalSpeakerSegments(path.join(os.tmpdir(), 'nonexistent-speaker-fixture.wav'), 2);
  assertRejected(result, /ENOENT/);
});

test('active subprocess cancellation cleans its temporary option directory', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'speaker-bridge-test-'));
  const controller = new AbortController();
  const testRun = randomUUID();
  let optionsDirectory;
  try {
    const audioPath = path.join(directory, 'long.wav');
    await fs.writeFile(audioPath, createTestWav({ durationSeconds: 30 }));
    const pending = detectLocalSpeakerSegments(audioPath, 2, 'timbre_dp', { testRun }, controller.signal);
    // Observe this invocation's options, without assuming other test workers are idle.
    for (let attempt = 0; attempt < 200 && !optionsDirectory; attempt++) {
      const candidates = (await fs.readdir(os.tmpdir())).filter(name => name.startsWith('local-speaker-'));
      for (const name of candidates) {
        const candidate = path.join(os.tmpdir(), name);
        try {
          const options = JSON.parse(await fs.readFile(path.join(candidate, 'options.json'), 'utf8'));
          if (options.testRun === testRun) optionsDirectory = candidate;
        } catch { /* A different analysis may finish while its directory is inspected. */ }
      }
      if (!optionsDirectory) await delay(5);
    }
    assert.ok(optionsDirectory, 'The analysis must start before testing active cancellation');
    await delay(20);
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    await assert.rejects(fs.access(optionsDirectory), /ENOENT/);
  } finally {
    controller.abort();
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('Python configuration errors preserve the original reason instead of inventing segments', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'speaker-bridge-test-'));
  try {
    const audioPath = path.join(directory, 'master.wav');
    await fs.writeFile(audioPath, createTestWav());
    const result = await detectLocalSpeakerSegments(audioPath, 2, 'timbre_dp', { confidenceThreshold: -1 });
    assertRejected(result, /confidenceThreshold/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
