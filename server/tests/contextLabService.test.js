import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createContextLabService, buildContextLabBatchPrompt } from '../contextLabService.js';
import { readPcmWav, decodeWavDataUrl } from '../shared/wavPcm.js';
import { createTestWav, wavDataUrl } from './fixtures/wavFixture.js';

const paragraphs = ['سڵاو، this is the first turn.', 'مرحبا، ئەمە وەڵامی دووەمە.'];
const params = { paragraphs, speaker1Voice: 'Puck', speaker2Voice: 'Aoede', detectionEngine: 'timbre_dp' };
const master = createTestWav();

test('new comparison modes preserve rejected proposals without exporting clips or synthesizing', async () => {
  const proposals = [{ midpoint: 1.9, accepted: false, quietRunSeconds: .035 }];
  for (const mode of ['speaker_resnet', 'speaker_eres2net', 'speaker_strict', 'speaker_consensus']) {
    const service = createContextLabService({
      generateSpeech: async () => { throw new Error('Local comparison must not synthesize'); },
      detectSegments: async (_filename, _count, selected) => {
        assert.equal(selected, mode);
        return { success: false, error: 'Unverified handoff', diagnostics: { proposedBoundaries: proposals } };
      },
      sliceSegments: async () => { throw new Error('Rejected proposals must not be sliced'); },
    });
    const result = await service.analyzeContextLabMaster({ ...params, detectionEngine: mode, audioBuffer: master });
    assert.equal(result.success, false);
    assert.deepEqual(result.engineResults[mode].diagnostics.proposedBoundaries, proposals);
    assert.deepEqual(result.engineResults[mode].clips, []);
    assert.equal(result.masterAudioUrl, wavDataUrl(master));
  }
});

function acceptedEngine() {
  return { success: true, diagnostics: { confidence: 0.95 },
    segments: [{ index: 1, start: 0, end: 1.875 }, { index: 2, start: 1.875, end: 4 }] };
}

test('generation honors each exact requested model and alternate speaker metadata', async () => {
  for (const model of ['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview']) {
    const calls = [];
    const service = createContextLabService({
      generateSpeech: async request => { calls.push(request); return { audioBuffer: master, modelId: model }; },
      detectSegments: async () => acceptedEngine(),
    });
    const result = await service.generateContextLabBatch({ ...params, model });
    assert.equal(result.success, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].model, model);
    assert.deepEqual(calls[0].speechParts.map(part => part.speech_metadata.speaker), ['Speaker1', 'Speaker2']);
    assert.deepEqual(calls[0].speechParts.map(part => part.text), paragraphs);
    assert.deepEqual(calls[0].multiSpeakerConfig.speakerVoiceConfigs.map(config => config.voiceConfig.prebuiltVoiceConfig.voiceName), ['Puck', 'Aoede']);
    assert.equal(result.modelId, model);
  }
});

test('a rejected master uses one synthesis, retains exact audio, and never slices or requests individual takes', async () => {
  let generations = 0;
  let slices = 0;
  const service = createContextLabService({
    generateSpeech: async () => { generations++; return { audioBuffer: master }; },
    detectSegments: async () => ({ success: false, error: 'Speaker identity stayed ambiguous', diagnostics: { turnsObserved: 1 } }),
    sliceSegments: async () => { slices++; throw new Error('Unsafe detector output reached slicing'); },
  });
  const result = await service.generateContextLabBatch(params);
  assert.equal(generations, 1);
  assert.equal(slices, 0);
  assert.equal(result.success, false);
  assert.equal(result.masterAudioUrl, wavDataUrl(master));
  assert.deepEqual(result.clips, []);
  assert.match(result.error, /identity stayed ambiguous/);
  assert.equal(result.engineResults.timbre_dp.diagnostics.turnsObserved, 1);
});

test('detector exceptions retain the original master without a synthesis retry', async () => {
  let generations = 0;
  const service = createContextLabService({
    generateSpeech: async () => { generations++; return { audioBuffer: master }; },
    detectSegments: async () => { throw new Error('Local dependency missing'); },
  });
  const result = await service.generateContextLabBatch(params);
  assert.equal(generations, 1);
  assert.equal(result.success, false);
  assert.equal(result.masterAudioUrl, wavDataUrl(master));
  assert.match(result.engineResults.timbre_dp.error, /dependency missing/);
});

test('re-analysis never generates speech and reconstructs exact original PCM across metadata chunks', async () => {
  for (const format of [{ channels: 1, bitsPerSample: 16 }, { channels: 2, bitsPerSample: 32 }]) {
    const audioBuffer = createTestWav({ ...format, metadata: true });
    let detections = 0;
    const service = createContextLabService({
      generateSpeech: async () => { throw new Error('Re-analysis must never synthesize'); },
      detectSegments: async (filename, count, mode) => {
        detections++;
        assert.deepEqual(fs.readFileSync(filename), audioBuffer);
        assert.equal(count, paragraphs.length);
        assert.equal(mode, 'timbre_dp');
        return acceptedEngine();
      },
    });
    const result = await service.analyzeContextLabMaster({ ...params, audioBuffer });
    assert.equal(result.success, true);
    assert.equal(detections, 1);
    assert.equal(result.reusedMaster, true);
    assert.equal(result.modelId, null);
    assert.equal(result.masterAudioUrl, wavDataUrl(audioBuffer));
    const reconstructed = Buffer.concat(result.clips.map(clip => readPcmWav(decodeWavDataUrl(clip.audioUrl)).data));
    assert.deepEqual(reconstructed, readPcmWav(audioBuffer).data);
    assert.deepEqual(result.clips.map(clip => clip.speakerTurn), ['Speaker1', 'Speaker2']);
  }
});

test('successful detector flags cannot bypass count and continuity safety checks', async () => {
  for (const segments of [
    [{ start: 0, end: 4 }],
    [{ start: 0, end: 1.8 }, { start: 2, end: 4 }],
    [{ start: 0, end: 2 }, { start: 1.9, end: 4 }],
    [{ start: 0, end: 0.1 }, { start: 0.1, end: 4 }],
  ]) {
    let slices = 0;
    const service = createContextLabService({
      detectSegments: async () => ({ success: true, segments }),
      sliceSegments: async () => { slices++; return [master, master]; },
    });
    const result = await service.analyzeContextLabMaster({ ...params, audioBuffer: master });
    assert.equal(result.success, false);
    assert.equal(slices, 0);
    assert.deepEqual(result.clips, []);
    assert.equal(result.masterAudioUrl, wavDataUrl(master));
  }
});

test('all mode exposes only accepted engines and keeps rejected-engine diagnostics', async () => {
  const service = createContextLabService({
    detectSegments: async () => ({ success: true, engines: {
      timbre_dp: acceptedEngine(),
      spectral_change: { success: false, error: 'No stable identity handoff', segments: acceptedEngine().segments, diagnostics: { confidence: 0.1 } },
      speaker_embedding: { success: false, error: 'Reference recording required' },
    } }),
  });
  const result = await service.analyzeContextLabMaster({ ...params, detectionEngine: 'all', audioBuffer: master });
  assert.equal(result.success, true);
  assert.equal(result.engineResults.timbre_dp.clips.length, 2);
  assert.deepEqual(result.engineResults.spectral_change.clips, []);
  assert.deepEqual(result.engineResults.spectral_change.segments, []);
  assert.equal(result.engineResults.spectral_change.diagnostics.confidence, 0.1);
  assert.deepEqual(result.comparisonTable[0].cuts, { timbre_dp: 1.875 });
  assert.match(result.comparisonTable[0].agreement, /Only one accepted/);
});

test('reference files and options reach the detector and temporary audio is cleaned', async () => {
  const reference = createTestWav({ durationSeconds: 2 });
  let masterPath;
  let referencePaths;
  const service = createContextLabService({
    detectSegments: async (filename, count, mode, options) => {
      masterPath = filename;
      referencePaths = [options.reference1Path, options.reference2Path];
      assert.equal(count, 2);
      assert.equal(mode, 'speaker_embedding');
      assert.equal(options.confidenceThreshold, 0.7);
      assert.deepEqual(options.expectedBoundaries, [1.875]);
      referencePaths.forEach(referencePath => assert.deepEqual(fs.readFileSync(referencePath), reference));
      return acceptedEngine();
    },
  });
  const result = await service.analyzeContextLabMaster({ ...params, detectionEngine: 'speaker_embedding', audioBuffer: master,
    reference1Audio: wavDataUrl(reference), reference2Audio: wavDataUrl(reference),
    options: { confidenceThreshold: 0.7, expectedBoundaries: [1.875] } });
  assert.equal(result.success, true);
  [masterPath, ...referencePaths].forEach(filename => assert.equal(fs.existsSync(filename), false));
});

test('invalid configuration and references fail before any paid generation', async () => {
  let generations = 0;
  const service = createContextLabService({ generateSpeech: async () => { generations++; return { audioBuffer: master }; } });
  for (const invalid of [
    { detectionEngine: 'equal_split' }, { paragraphs: ['', 'text'] }, { speaker2Voice: 'Puck' },
    { options: { minSegmentSeconds: 0.1 } }, { options: { maxSegmentSeconds: 1, minSegmentSeconds: 2 } },
    { options: { expectedBoundaries: [NaN] } }, { reference1Audio: 'data:audio/wav;base64,AAAA' },
  ]) await assert.rejects(service.generateContextLabBatch({ ...params, ...invalid }));
  assert.equal(generations, 0);
});

test('a generator returning another model is rejected without detection', async () => {
  let detections = 0;
  const service = createContextLabService({
    generateSpeech: async () => ({ audioBuffer: master, modelId: 'gemini-2.5-flash-preview-tts' }),
    detectSegments: async () => { detections++; return acceptedEngine(); },
  });
  await assert.rejects(service.generateContextLabBatch({ ...params, model: 'gemini-3.8-flash-tts' }), /different model/);
  assert.equal(detections, 0);
});

test('dialogue prompt preserves speaker turns and requests natural speech without artificial boundary artifacts', () => {
  const prompt = buildContextLabBatchPrompt(paragraphs, params);
  const instructions = [prompt.instruction, ...prompt.speechParts.map(part => part.speech_metadata.style)].join(' ');
  assert.doesNotMatch(instructions, /\b(?:pause|silence|marker|beep|chirp|separator|ssml)\b|<break/i);
  assert.match(instructions, /exactly once and in order/);
  assert.match(instructions, /natural conversational turn-taking/);
  assert.deepEqual(prompt.cleanParagraphs, paragraphs);
});

test('evaluation labels beyond a generated master warn and are excluded from detection without discarding audio', async () => {
  let generations = 0;
  let detections = 0;
  const suppliedOptions = { confidenceThreshold: 0.7, expectedBoundaries: [5] };
  const service = createContextLabService({
    generateSpeech: async () => { generations++; return { audioBuffer: master, modelId: params.model }; },
    detectSegments: async (_filename, _count, _mode, options) => {
      detections++;
      assert.equal(Object.hasOwn(options, 'expectedBoundaries'), false);
      assert.equal(options.confidenceThreshold, 0.7);
      return acceptedEngine();
    },
  });
  const result = await service.generateContextLabBatch({ ...params, options: suppliedOptions });
  assert.equal(generations, 1);
  assert.equal(detections, 1);
  assert.equal(result.success, true);
  assert.equal(result.masterAudioUrl, wavDataUrl(master));
  assert.equal(result.clips.length, 2);
  assert.ok(result.warnings.some(warning => /labels extend beyond the master duration/.test(warning)));
  assert.deepEqual(suppliedOptions.expectedBoundaries, [5], 'Caller options must remain unchanged');
});
