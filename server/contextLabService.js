import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateGeminiSpeech } from './geminiService.js';
import { detectViaSpeakerAcoustics } from './alignment/whisperBridge.js';
import { detectLocalSpeakerSegments, validateEngineResult } from './alignment/localSpeakerBridge.js';
import { readPcmWav, decodeWavDataUrl, slicePcmWav } from './shared/wavPcm.js';
import { buildContextLabBatchPrompt } from './contextLabPrompt.js';

export { buildContextLabBatchPrompt } from './contextLabPrompt.js';

const LOCAL_ENGINES = ['timbre_dp', 'spectral_change', 'speaker_embedding', 'speaker_resnet', 'speaker_eres2net', 'speaker_consensus', 'speaker_strict', 'all'];
const LEGACY_ENGINES = ['pyannote', 'pitch_f0', 'neural_crossover', 'tri_hybrid', 'iterative_dp'];

function abortIfNeeded(signal) {
  if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');
}

export function validateLabOptions(options = {}, count) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Invalid slicing options.');
  const clean = {};
  const ranges = { minSegmentSeconds: [0.4, 60], maxSegmentSeconds: [0.4, 600], confidenceThreshold: [0.5, 1] };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (options[key] === undefined || options[key] === '') continue;
    const number = Number(options[key]);
    if (!Number.isFinite(number) || number < min || number > max) throw new Error(`Invalid ${key}: expected ${min}–${max}.`);
    clean[key] = number;
  }
  if (clean.maxSegmentSeconds && clean.maxSegmentSeconds < (clean.minSegmentSeconds ?? 0.4)) {
    throw new Error('Maximum turn duration must be at least the minimum.');
  }
  if (options.expectedBoundaries !== undefined) {
    const values = options.expectedBoundaries;
    if (!Array.isArray(values) || values.length !== count - 1 || values.some((value, index) =>
      typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || (index > 0 && value <= values[index - 1]))) {
      throw new Error(`Evaluation requires exactly ${count - 1} increasing positive boundary times.`);
    }
    clean.expectedBoundaries = values;
  }
  return clean;
}

function prepareConfig(params) {
  const prompt = buildContextLabBatchPrompt(params.paragraphs, params);
  if (Boolean(params.reference1Audio || params.reference1Buffer) !== Boolean(params.reference2Audio || params.reference2Buffer)) {
    throw new Error('Provide both speaker references, or neither for automatic enrollment.');
  }
  const mode = ['both', 'compare'].includes(params.detectionEngine) ? 'all' : (params.detectionEngine || 'all');
  if (![...LOCAL_ENGINES, ...LEGACY_ENGINES].includes(mode)) throw new Error('Unknown slicing engine.');
  return { ...prompt, mode, options: validateLabOptions(params.options, prompt.cleanParagraphs.length) };
}

function clipsFromSegments(paragraphs, segments, buffers, engine, config) {
  if (buffers.length !== paragraphs.length || buffers.some(buffer => !buffer?.length)) {
    throw new Error('Slicer returned an incomplete set of clips.');
  }
  return paragraphs.map((text, index) => ({
    index: index + 1, engine, text,
    speakerName: index % 2 ? config.cleanSpk2 : config.cleanSpk1,
    speakerTurn: index % 2 ? 'Speaker2' : 'Speaker1',
    start: segments[index].start, end: segments[index].end,
    duration: segments[index].end - segments[index].start,
    audioUrl: `data:audio/wav;base64,${buffers[index].toString('base64')}`,
    boundaryInfo: segments[index].boundary_info || null
  }));
}

function comparisonFor(engines, count) {
  return Array.from({ length: Math.max(0, count - 1) }, (_, index) => {
    const cuts = Object.fromEntries(Object.entries(engines).filter(([, result]) => result.success)
      .map(([key, result]) => [key, result.clips[index].end]));
    const values = Object.values(cuts);
    const spread = values.length > 1 ? Math.round((Math.max(...values) - Math.min(...values)) * 1000) : 0;
    return { boundary: index + 1, cuts, max_spread_ms: spread,
      agreement: values.length < 2 ? 'Only one accepted engine' : `${spread} ms spread; agreement is not accuracy` };
  });
}

// Dependency injection verifies quota and safety behavior without paid API calls.
export function createContextLabService({
  generateSpeech = generateGeminiSpeech,
  detectSegments = detectLocalSpeakerSegments,
  detectLegacy = detectViaSpeakerAcoustics,
  sliceSegments = async (filename, segments) => slicePcmWav(fs.readFileSync(filename), segments)
} = {}) {
  async function analyzePrepared(params, config, audioBuffer, modelId = null) {
    abortIfNeeded(params.signal);
    const wav = readPcmWav(audioBuffer);
    const warnings = [];
    const options = { ...config.options };
    if (config.options.expectedBoundaries?.some(value => value >= wav.duration)) {
      warnings.push('Evaluation labels extend beyond the master duration. Detection ran without these labels; correct them and reuse this master to measure error.');
      delete options.expectedBoundaries;
    }
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx_lab_'));
    const master = path.join(directory, 'master.wav');
    try {
      fs.writeFileSync(master, audioBuffer);
      for (const index of [1, 2]) {
        const reference = params[`reference${index}Buffer`]
          || (params[`reference${index}Audio`] ? decodeWavDataUrl(params[`reference${index}Audio`]) : null);
        if (!reference) continue;
        readPcmWav(reference);
        const filename = path.join(directory, `reference${index}.wav`);
        fs.writeFileSync(filename, reference);
        options[`reference${index}Path`] = filename;
      }
      abortIfNeeded(params.signal);
      let detection;
      try {
        detection = LEGACY_ENGINES.includes(config.mode)
          ? await detectLegacy(master, config.cleanParagraphs.length, config.mode, config.cleanParagraphs)
          : await detectSegments(master, config.cleanParagraphs.length, config.mode, options, params.signal);
      } catch (error) {
        abortIfNeeded(params.signal);
        detection = { success: false, error: error.message };
      }
      abortIfNeeded(params.signal);
      const rawEngines = detection.engines || { [config.mode]: detection };
      const engineResults = {};
      for (const [key, raw] of Object.entries(rawEngines)) {
        const checked = validateEngineResult(raw, config.cleanParagraphs.length, options, wav.duration);
        const result = { ...checked, clips: [], segments: checked.segments || [] };
        if (checked.metrics) result.diagnostics = { ...checked.diagnostics, metrics: checked.metrics };
        if (checked.success) {
          try {
            const segments = checked.segments.map((segment, index) => ({ ...segment,
              start: index === 0 ? 0 : checked.segments[index - 1].end,
              end: index === checked.segments.length - 1 ? wav.duration : segment.end
            }));
            const buffers = await sliceSegments(master, segments);
            abortIfNeeded(params.signal);
            result.clips = clipsFromSegments(config.cleanParagraphs, segments, buffers, key, config);
            result.clips = result.clips.map((clip, index) => ({ ...clip, modelId,
              confidence: checked.diagnostics?.segmentConfidence?.[index]?.confidence }));
          } catch (error) {
            abortIfNeeded(params.signal);
            result.success = false;
            result.error = error.message;
            result.clips = [];
          }
        }
        if (LEGACY_ENGINES.includes(key)) result.diagnostics = { ...result.diagnostics,
          warning: 'Legacy experiment: boundaries are not verified by the new identity confidence gates.' };
        engineResults[key] = result;
      }
      const accepted = Object.values(engineResults).filter(result => result.success);
      const comparisonTable = comparisonFor(engineResults, config.cleanParagraphs.length);
      const disputed = comparisonTable.filter(row => row.max_spread_ms > 250);
      if (disputed.length) warnings.push(`Methods disagree by more than 250 ms at boundary ${disputed.map(row => row.boundary).join(', ')}. Review the uncut master around these handoffs before saving.`);
      const response = {
        success: accepted.length > 0, mode: config.mode, engineResults, warnings,
        masterAudioUrl: `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
        durationSeconds: wav.duration, speaker1Voice: config.cleanSpk1, speaker2Voice: config.cleanSpk2,
        modelId, reusedMaster: !modelId, clips: engineResults[config.mode]?.clips || accepted[0]?.clips || [],
        comparisonTable,
        iterativeAttempts: detection.iterativeAttempts || detection.attempts || []
      };
      for (const [key, field] of Object.entries({ pyannote: 'pyannoteClips', pitch_f0: 'pitchClips',
        neural_crossover: 'crossoverClips', tri_hybrid: 'triHybridClips', iterative_dp: 'iterativeClips' })) {
        response[field] = engineResults[key]?.clips || [];
      }
      if (!response.success) response.error = detection.error || 'No engine resolved safe speaker boundaries. Reuse this master to test another mode; no new synthesis was requested.';
      return response;
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }

  async function generateContextLabBatch(params = {}) {
    abortIfNeeded(params.signal);
    const config = prepareConfig(params);
    for (const index of [1, 2]) if (params[`reference${index}Audio`]) decodeWavDataUrl(params[`reference${index}Audio`]);
    const model = params.model || 'gemini-3.8-flash-tts';
    const generated = await generateSpeech({
      speechParts: config.speechParts, speechStyle: config.instruction, text: config.legacyPrompt,
      voiceName: config.cleanSpk1, dialect: params.dialect || 'sorani', promptInstruction: config.instruction,
      apiKey: params.apiKey || '', model, multiSpeakerConfig: config.multiSpeakerConfig, signal: params.signal
    });
    abortIfNeeded(params.signal);
    if (generated.modelId && generated.modelId !== model) throw new Error('Generator returned a different model than requested.');
    return analyzePrepared(params, config, generated.audioBuffer, model);
  }

  async function analyzeContextLabMaster(params = {}) {
    return analyzePrepared(params, prepareConfig(params), params.audioBuffer);
  }
  return { generateContextLabBatch, analyzeContextLabMaster };
}

export const { generateContextLabBatch, analyzeContextLabMaster } = createContextLabService();
