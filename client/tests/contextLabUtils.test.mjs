import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Exercise the actual client safety helpers without a browser or synthesis call.
const source = readFileSync(new URL('../src/services/contextLabUtils.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getLabEngineResults, parseLabOptions } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('evaluation labels are optional and never replace automatic options', () => {
  assert.deepEqual(parseLabOptions('', { confidenceThreshold: .6 }, 4), { confidenceThreshold: .6 });
  assert.deepEqual(parseLabOptions('2.25, 4.75; 8.5', { confidenceThreshold: .6 }, 4), {
    confidenceThreshold: .6, expectedBoundaries: [2.25, 4.75, 8.5]
  });
});

test('reject incomplete, reversed, duplicate, nonnumeric or nonpositive labels', () => {
  for (const labels of ['2, 4', '4, 2, 8', '2, 2, 8', '2, bad, 8', '0, 2, 8']) {
    assert.throws(() => parseLabOptions(labels, {}, 4), /strictly increasing/);
  }
});

test('reject duration and confidence settings outside safe supported ranges', () => {
  for (const options of [
    { minSegmentSeconds: .35 }, { minSegmentSeconds: Infinity }, { minSegmentSeconds: 61 },
    { minSegmentSeconds: 2, maxSegmentSeconds: 1 }, { maxSegmentSeconds: 601 },
    { confidenceThreshold: .4 }, { confidenceThreshold: 1.01 }, { confidenceThreshold: NaN }
  ]) assert.throws(() => parseLabOptions('', options, 4));
  assert.deepEqual(parseLabOptions('', { minSegmentSeconds: .8, maxSegmentSeconds: 8 }, 4), {
    minSegmentSeconds: .8, maxSegmentSeconds: 8
  });
});

test('retain rejected engine diagnostics instead of replacing them with legacy slices', () => {
  const engineResults = { timbre_dp: { success: false, clips: [], error: 'Ambiguous speaker identity', diagnostics: { minConfidence: .52 } } };
  assert.equal(getLabEngineResults({ success: false, mode: 'all', engineResults, pitchClips: [{ index: 1 }] }), engineResults);
});

test('normalize old explicit engine responses for their existing review UI', () => {
  const clips = [{ index: 1, audioUrl: 'data:audio/wav;base64,test' }];
  assert.deepEqual(getLabEngineResults({ success: true, mode: 'pitch_f0', clips }), {
    pitch_f0: { success: true, clips }
  });
  assert.deepEqual(getLabEngineResults({ success: false, mode: 'all', engineResults: {} }), {});
});
