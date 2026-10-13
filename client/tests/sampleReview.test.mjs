import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/sampleReview.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getSampleReview } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
test('pending queue recognizes disk and database review metadata; reviewed clips leave the queue', () => {
  const warning = ['Boundary 2: 500 ms disagreement'];
  assert.equal(getSampleReview({ review_status: 'pending', review_warnings: warning }).pending, true);
  assert.deepEqual(getSampleReview({ metadata_extra: { review_status: 'pending', review_warnings: warning } }).warnings, warning);
  assert.equal(getSampleReview({ customMetadata: { review_status: 'reviewed' } }).pending, false);
  assert.equal(getSampleReview({}).pending, false);
});
