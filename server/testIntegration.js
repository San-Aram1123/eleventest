import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWavHeader } from './wavUtils.js';

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

  // 2. Normal Workflow: Prepare sample
  console.log('\n--- 2. Testing POST /api/normal/prepare (Kurdish Unicode Preservation) ---');
  const kurdishText = 'سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.';
  const prepRes = await fetch(`${BASE_URL}/normal/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: kurdishText,
      emotion: 'happy',
      emotionTag: '[happy]',
      notes: 'Initial test run for Normal Website Workflow'
    })
  });
  const prepData = await prepRes.json();
  assert(prepRes.ok && prepData.success === true, 'Sample prepared successfully in pending queue');
  assert(prepData.pendingItem.text === kurdishText, 'Prepared pending text matches Kurdish Unicode byte-for-byte');
  const pendingId = prepData.pendingItem.pendingId;

  // 3. Check Pending Queue
  console.log('\n--- 3. Testing GET /api/normal/pending ---');
  const pendingRes = await fetch(`${BASE_URL}/normal/pending`);
  const pendingData = await pendingRes.json();
  assert(pendingData.pending.some(p => p.pendingId === pendingId), 'Pending item exists in pending queue');

  // 4. Upload WAV and Auto-Pair with prepared Kurdish text
  console.log('\n--- 4. Testing POST /api/normal/upload (Auto-Pairing WAV with Kurdish text) ---');
  const dummyPcm = Buffer.alloc(44100 * 2); // 1 second 16-bit PCM silence
  const dummyWav = createWavHeader(dummyPcm.length);
  const fullDummyWav = Buffer.concat([dummyWav, dummyPcm]);

  // Construct multipart form data using Blob
  const formData = new FormData();
  formData.append('audio', new Blob([fullDummyWav], { type: 'audio/wav' }), 'elevenlabs_output.wav');
  formData.append('pendingId', pendingId);
  formData.append('voiceName', 'Rachel');

  const uploadRes = await fetch(`${BASE_URL}/normal/upload`, {
    method: 'POST',
    body: formData
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.ok && uploadData.success === true, 'WAV uploaded and auto-paired with Kurdish text');
  const createdSample = uploadData.sample;
  assert(createdSample.text === kurdishText, 'Stored sample preserves exact Kurdish Unicode');
  assert(createdSample.emotion === 'happy', 'Stored sample has intended emotion: happy');
  assert(createdSample.method === 'elevenlabs_web', 'Method set to elevenlabs_web');
  assert(createdSample.hasAudio === true, 'Sample has valid associated WAV audio file');

  const sampleId = createdSample.id;

  // 5. Get Sample from Dataset
  console.log('\n--- 5. Testing GET /api/dataset/:id ---');
  const getRes = await fetch(`${BASE_URL}/dataset/${sampleId}`);
  const getData = await getRes.json();
  assert(getData.sample && getData.sample.text === kurdishText, 'Retrieved sample from dataset has exact Kurdish Unicode');

  // 6. Update Ratings
  console.log('\n--- 6. Testing PATCH /api/dataset/:id (Quality Ratings) ---');
  const patchRes = await fetch(`${BASE_URL}/dataset/${sampleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ratings: {
        naturalness: 5,
        emotion: 5,
        pronunciation: 4,
        overall: 5,
        notes: 'Exceptional Kurdish inflection and tone!'
      }
    })
  });
  const patchData = await patchRes.json();
  assert(patchData.success === true, 'Ratings updated successfully');
  assert(patchData.sample.ratings.naturalness === 5, 'Naturalness rating persisted as 5');
  assert(patchData.sample.ratings.pronunciation === 4, 'Pronunciation rating persisted as 4');

  // 7. Verify Audio Stream
  console.log('\n--- 7. Testing GET /api/dataset/:id/audio (Audio Streaming) ---');
  const audioRes = await fetch(`${BASE_URL}/dataset/${sampleId}/audio`);
  assert(audioRes.ok, 'Audio endpoint responded with 200 OK');
  assert(audioRes.headers.get('content-type') === 'audio/wav', 'Content-Type header is audio/wav');
  const audioBuffer = await audioRes.arrayBuffer();
  assert(audioBuffer.byteLength > 0, `Audio stream delivered ${audioBuffer.byteLength} bytes`);

  // 8. Verify ZIP Export
  console.log('\n--- 8. Testing GET /api/dataset/export/zip (Dataset ZIP Packaging) ---');
  const zipRes = await fetch(`${BASE_URL}/dataset/export/zip`);
  assert(zipRes.ok, 'ZIP export responded with 200 OK');
  assert(zipRes.headers.get('content-type')?.includes('zip'), 'ZIP Content-Type is valid');
  const zipBuffer = await zipRes.arrayBuffer();
  assert(zipBuffer.byteLength > 100, `Dataset ZIP package delivered ${zipBuffer.byteLength} bytes`);

  // 9. Clean up created test sample
  console.log('\n--- 9. Testing DELETE /api/dataset/:id ---');
  const delRes = await fetch(`${BASE_URL}/dataset/${sampleId}`, {
    method: 'DELETE'
  });
  const delData = await delRes.json();
  assert(delData.success === true, 'Sample deleted and cleaned up successfully');

  console.log('\n====================================================');
  console.log(` 🎉 ALL ${passedTests}/${totalTests} INTEGRATION TESTS PASSED!`);
  console.log('====================================================\n');
}

runIntegrationTests().catch(err => {
  console.error('Integration tests failed:', err);
  process.exit(1);
});
