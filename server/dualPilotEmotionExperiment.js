import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateGeminiSpeech } from './geminiService.js';
import { buildDualPilotGeminiPrompt } from './dualPilotService.js';
import { detectLocalSpeakerSegments } from './alignment/localSpeakerBridge.js';
import { readPcmWav } from './shared/wavPcm.js';
import { buildHybridCutPlan } from './hybridCutSelector.js';
import { evaluateGeminiClipAcceptance } from './shared/geminiClipAcceptance.js';

export async function runGeminiEmotionExperiment(params = {}) {
  const paragraphs = Array.isArray(params.paragraphs) ? params.paragraphs : [];
  if (paragraphs.length < 2 || paragraphs.length > 12) throw new Error('Enter 2–12 alternating Gemini turns.');
  const emit = (stage, detail) => params.onProgress?.({ stage, detail, at: new Date().toISOString() });
  emit('validate', `Validated ${paragraphs.length} turns; experimental clips will not be saved.`);
  const prompt = buildDualPilotGeminiPrompt(paragraphs, params);
  const model = 'gemini-3.8-flash-tts';
  emit('generate', `Requesting one continuous Gemini master with ${model}; selected voice pair ${prompt.cleanSpk1}/${prompt.cleanSpk2}.`);
  const generated = await generateGeminiSpeech({
    speechParts: prompt.speechParts, speechStyle: prompt.instruction, text: prompt.legacyPrompt,
    voiceName: prompt.cleanSpk1, dialect: params.language === 'kmr' ? 'badini' : (params.dialect || 'sorani'),
    promptInstruction: prompt.instruction, model, multiSpeakerConfig: prompt.multiSpeakerConfig,
    signal: params.signal
  });
  const audio = generated.audioBuffer;
  const wav = readPcmWav(audio);
  emit('master_ready', `Received ${wav.duration.toFixed(2)} seconds of PCM WAV (${audio.length.toLocaleString()} bytes).`);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'dual-emotion-experiment-'));
  const filename = path.join(directory, 'master.wav');
  const progressFile = path.join(directory, 'methods.jsonl');
  let progressOffset = 0;
  const progressTimer = setInterval(() => {
    try {
      const content = fs.readFileSync(progressFile, 'utf8');
      const completeLength = content.lastIndexOf('\n') + 1;
      const pending = content.slice(progressOffset, completeLength); progressOffset = completeLength;
      for (const line of pending.split(/\r?\n/).filter(Boolean)) {
        const item = JSON.parse(line);
        emit(item.success ? 'method_pass' : 'method_reject', `${item.name}: ${item.success ? 'accepted' : (item.error || 'rejected')}`);
      }
    } catch { /* The progress file appears once local analysis starts. */ }
  }, 200);
  try {
    fs.writeFileSync(filename, audio);
    emit('baseline', 'Running the seven existing neural/acoustic slicers on this same master as comparison baselines.');
    const baselineResult = await detectLocalSpeakerSegments(filename, paragraphs.length, 'all', params.options || {}, params.signal);
    const rawBaselines = Object.entries(baselineResult.engines || {}).map(([name, item]) => ({ name, ...item }));
    const baselines = rawBaselines.map(item => applyGeminiClipPolicy(item, paragraphs.length, wav.duration));
    for (const item of baselines) emit(item.success ? 'baseline_pass' : 'baseline_reject', `${item.name}: ${item.success ? 'accepted' : (item.error || 'rejected')}`);
    emit('analysis', 'Now running three isolated emotion-aware variants locally: robust MAD timbre, smoothed CAM++ identity, and three-model weighted identity.');
    const result = await detectLocalSpeakerSegments(filename, paragraphs.length, 'emotion_experiments',
      { ...(params.options || {}), progressFilePath: progressFile }, params.signal);
    const rawExperiments = Object.entries(result.engines || {}).map(([name, item]) => ({ name, ...item }));
    const experiments = rawExperiments.map(item => applyGeminiClipPolicy(item, paragraphs.length, wav.duration));
    const hybrid = applyGeminiClipPolicy({ name: 'per_boundary_hybrid', ...buildHybridCutPlan(
      [...rawBaselines, ...rawExperiments], paragraphs.length, wav.duration, prompt.cleanParagraphs) }, paragraphs.length, wav.duration);
    emit('hybrid', hybrid.success
      ? `Hybrid assembled ${hybrid.boundaries.length} handoffs from per-boundary candidates; status: ${hybrid.status}.`
      : `Hybrid needs review: ${hybrid.error}`);
    const acceptedMethods = [...baselines, ...experiments].filter(item => item.success);
    const winner = acceptedMethods.sort((a, b) => Number(b.diagnostics?.minConfidence || b.confidence || 0) - Number(a.diagnostics?.minConfidence || a.confidence || 0))[0];
    const acceptance = winner ? { accepted: true, method: winner.name, reason: winner.acceptanceReason }
      : hybrid.success ? { accepted: true, method: 'per_boundary_hybrid', reason: hybrid.acceptanceReason }
        : { accepted: false, method: null, reason: hybrid.acceptanceReason || hybrid.error };
    emit('complete', `Gemini clip policy: ${acceptance.accepted ? `accepted by ${acceptance.method}` : 'rejected'}; ${acceptance.reason}; hybrid: ${hybrid.status}; no dataset writes performed.`);
    return { success: acceptance.accepted, acceptance, modelId: model, durationSeconds: wav.duration,
      masterAudioUrl: `data:audio/wav;base64,${audio.toString('base64')}`, expectedCount: paragraphs.length, baselines, experiments, hybrid };
  } finally {
    clearInterval(progressTimer);
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function applyGeminiClipPolicy(method, expectedCount, duration) {
  const originalSuccess = method.success === true;
  const originalRejection = method.error || null;
  const accepted = evaluateGeminiClipAcceptance(method, expectedCount, duration);
  return {
    ...method,
    success: accepted.accepted,
    status: accepted.accepted ? (originalSuccess ? 'Accepted · 6–16 s policy' : 'Accepted · strict rejection overridden by clip policy') : 'Rejected · 6–16 s policy',
    error: accepted.accepted ? undefined : accepted.reason,
    acceptanceReason: accepted.reason,
    originalStrictRejection: originalSuccess ? undefined : originalRejection,
    segments: accepted.segments,
    boundaries: accepted.accepted
      ? (Array.isArray(method.boundaries) && method.boundaries.length === expectedCount - 1
        ? method.boundaries
        : accepted.segments.slice(0, -1).map(segment => ({ midpoint: segment.end, accepted: true, reason: accepted.reason })))
      : method.boundaries,
    diagnostics: { ...(method.diagnostics || {}), clipAcceptancePolicy: {
      expectedCount, minSeconds: 6, maxSeconds: 16, accepted: accepted.accepted,
      reason: accepted.reason, originalStrictRejection: originalSuccess ? undefined : originalRejection
    } }
  };
}
