import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWavHeader } from './wavUtils.js';
import { saveSample, deleteSample } from './datasetService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

console.log('====================================================');
console.log(' 🧪 KURDISH TTS END-TO-END INTEGRATION TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(` ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(` ❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
}

async function runIntegrationTests() {
  // 1. Check system config endpoint
  console.log('--- 1. Testing GET /api/config ---');
  const cfgRes = await fetch(`${BASE_URL}/config`);
  const cfgData = await cfgRes.json();
  assert(cfgRes.ok && cfgData.status === 'ok', 'Config endpoint returned status ok');

  // 2. Multi-Key Pool Endpoint
  console.log('\n--- 2. Testing GET /api/config/keys (Multi-Key Pool) ---');
  const keysRes = await fetch(`${BASE_URL}/config/keys`);
  const keysData = await keysRes.json();
  assert(keysRes.ok && Array.isArray(keysData.keys), 'Key pool endpoint returned keys array');
  assert(typeof keysData.totalKeys === 'number', 'Key pool returns totalKeys count');
  assert(typeof keysData.totalRemainingCharacters === 'number', 'Key pool returns totalRemainingCharacters');

  // 3. Kurdish Unicode Dataset Preservation
  console.log('\n--- 3. Testing Dataset Service with Kurdish Unicode ---');
  const kurdishText = 'سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.';
  const dummyPcm = Buffer.alloc(44100 * 2);
  const dummyWav = createWavHeader(dummyPcm.length);
  const fullDummyWav = Buffer.concat([dummyWav, dummyPcm]);

  const testSample = saveSample({
    id: 'test_kurdish_001',
    text: kurdishText,
    emotion: 'laugh, happy',
    emotionTag: '[laugh] [happy]',
    method: 'elevenlabs_api',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    voiceName: 'Rachel',
    modelId: 'eleven_v3',
    audioBuffer: fullDummyWav
  });

  assert(testSample.text === kurdishText, 'Stored sample preserves exact Kurdish Unicode');
  assert(testSample.id === 'test_kurdish_001', 'Sample ID assigned properly');
  assert(testSample.hasAudio === true, 'Sample has valid associated WAV audio file');

  const sampleId = testSample.id;

  // 4. Get Sample from Dataset
  console.log('\n--- 4. Testing GET /api/dataset/:id ---');
  const getRes = await fetch(`${BASE_URL}/dataset/${sampleId}`);
  const getData = await getRes.json();
  assert(getData.sample && getData.sample.text === kurdishText, 'Retrieved sample from dataset has exact Kurdish Unicode');

  // 5. Update Ratings
  console.log('\n--- 5. Testing PATCH /api/dataset/:id (Quality Ratings) ---');
  const patchRes = await fetch(`${BASE_URL}/dataset/${sampleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ratings: {
        naturalness: 5,
        emotion: 5,
        pronunciation: 4,
        overall: 5,
        notes: 'Excellent Kurdish pronunciation and emotion synthesis.'
      }
    })
  });
  const patchData = await patchRes.json();
  assert(patchRes.ok && patchData.sample, 'Ratings updated successfully');
  assert(patchData.sample.ratings?.naturalness === 5, 'Naturalness rating persisted as 5');
  assert(patchData.sample.ratings?.pronunciation === 4, 'Pronunciation rating persisted as 4');

  // 6. Test Audio Streaming Route
  console.log('\n--- 6. Testing GET /api/dataset/:id/audio (Audio Streaming) ---');
  const audioRes = await fetch(`${BASE_URL}/dataset/${sampleId}/audio`);
  assert(audioRes.ok, 'Audio endpoint responded with 200 OK');
  assert(audioRes.headers.get('content-type')?.includes('audio/'), 'Content-Type header is audio/*');
  const audioBlob = await audioRes.arrayBuffer();
  assert(audioBlob.byteLength > 0, `Audio stream delivered ${audioBlob.byteLength} bytes`);

  // 7. Test Export Dataset as ZIP
  console.log('\n--- 7. Testing GET /api/dataset/export/zip (Dataset ZIP Packaging) ---');
  const zipRes = await fetch(`${BASE_URL}/dataset/export/zip`);
  assert(zipRes.ok, 'ZIP export responded with 200 OK');
  assert(zipRes.headers.get('content-type')?.includes('application/zip'), 'ZIP Content-Type is valid');
  const zipBlob = await zipRes.arrayBuffer();
  assert(zipBlob.byteLength > 0, `Dataset ZIP package delivered ${zipBlob.byteLength} bytes`);

  // 8. Delete Sample and cleanup
  console.log('\n--- 8. Testing DELETE /api/dataset/:id ---');
  const delRes = await fetch(`${BASE_URL}/dataset/${sampleId}`, { method: 'DELETE' });
  const delData = await delRes.json();
  assert(delRes.ok && delData.success === true, 'Sample deleted and cleaned up successfully');

  console.log('\n====================================================');
  console.log(` 🎉 ALL ${passedTests}/${totalTests} INTEGRATION TESTS PASSED!`);
  console.log('====================================================\n');
}

runIntegrationTests().catch(err => {
  console.error('\n❌ Integration Test Suite Failed:', err);
  process.exit(1);
});
