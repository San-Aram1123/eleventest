import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveSample, getSample, deleteSample, ensureDatasetDir } from './datasetService.js';
import { createWavHeader, ensureWavBuffer } from './wavUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log(' 🧪 KURDISH TTS UNICODE & DATASET INTEGRITY TEST SUITE');
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

async function runTests() {
  ensureDatasetDir();

  // ----------------------------------------------------
  // TEST 1: Kurdish Specific Characters Integrity
  // ----------------------------------------------------
  console.log('--- TEST 1: Kurdish Sorani Character Coverage ---');
  const kurdishAlphabetSnippet = 'ئ ێ ڕ ڵ ڤ ۆ ێ ی ک';
  const dummyWav = createWavHeader(100);
  const testSample1 = await saveSample({
    id: 'test_kurdish_chars',
    text: kurdishAlphabetSnippet,
    emotion: 'neutral',
    audioBuffer: dummyWav
  });

  const retrieved1 = await getSample('test_kurdish_chars');
  assert(retrieved1 !== null, 'Sample was saved and retrieved successfully');
  assert(retrieved1.text === kurdishAlphabetSnippet, `Kurdish characters match byte-for-byte: "${retrieved1.text}" === "${kurdishAlphabetSnippet}"`);

  // ----------------------------------------------------
  // TEST 2: Kurdish Example Strings from Requirements
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Required Kurdish Sentences ---');
  const testSentences = [
    'سڵاو! چۆنی؟',
    'ئەمە تاقیکردنەوەی دەنگی کوردییە.',
    'سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.',
    'ئەمە چییە؟ بۆچی هەمیشە ئەمە ڕوودەدات؟'
  ];

  for (let i = 0; i < testSentences.length; i++) {
    const text = testSentences[i];
    const testId = `test_sentence_${i + 1}`;
    await saveSample({
      id: testId,
      text,
      emotion: 'happy',
      audioBuffer: dummyWav
    });
    const retrieved = await getSample(testId);
    assert(retrieved.text === text, `Sentence ${i + 1} preserved exactly without corruption`);
    await deleteSample(testId);
  }

  // ----------------------------------------------------
  // TEST 3: Spoken Transcript vs Emotion Tag Separation
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Spoken Transcript vs Emotion Tag Separation ---');
  const spokenText = 'ئەمە چییە؟ بۆچی هەمیشە ئەمە ڕوودەدات؟';
  const emotionTag = '[angry]';

  const testSample3 = await saveSample({
    id: 'test_emotion_separation',
    text: spokenText,
    emotion: 'angry',
    emotionTag: emotionTag,
    audioBuffer: dummyWav
  });

  const retrieved3 = await getSample('test_emotion_separation');
  assert(!retrieved3.text.includes('[angry]'), 'Spoken transcript does NOT contain the emotion tag [angry]');
  assert(retrieved3.text === spokenText, 'Spoken transcript matches original clean Kurdish text');
  assert(retrieved3.emotion === 'angry', 'Emotion metadata correctly stored as "angry"');
  assert(retrieved3.emotion_tag === '[angry]', 'Emotion tag stored in dedicated metadata field');

  // ----------------------------------------------------
  // TEST 4: Audio WAV Header & Container Integrity
  // ----------------------------------------------------
  console.log('\n--- TEST 4: WAV Header & Buffer Integrity ---');
  const rawPcm = Buffer.alloc(44100 * 2); // 1 second of 16-bit mono PCM silence
  const wavWrapped = ensureWavBuffer(rawPcm, 44100);
  assert(wavWrapped.toString('ascii', 0, 4) === 'RIFF', 'WAV starts with RIFF descriptor');
  assert(wavWrapped.toString('ascii', 8, 12) === 'WAVE', 'WAV contains WAVE format identifier');
  assert(wavWrapped.length === 44 + rawPcm.length, 'WAV size is exact header + data length');

  // ----------------------------------------------------
  // TEST 5: JSON Encoding File on Disk
  // ----------------------------------------------------
  console.log('\n--- TEST 5: UTF-8 On-Disk File Verification ---');
  const diskJsonPath = path.join(__dirname, '..', 'dataset', 'test_kurdish_chars.json');
  const rawFileBytes = fs.readFileSync(diskJsonPath);
  const decodedString = rawFileBytes.toString('utf-8');
  assert(decodedString.includes('ئ ێ ڕ ڵ ڤ ۆ ێ ی ک'), 'Raw file on disk is valid UTF-8 containing Kurdish characters');

  // Cleanup test artifacts
  await deleteSample('test_kurdish_chars');
  await deleteSample('test_emotion_separation');

  console.log('\n====================================================');
  console.log(` 🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
