import { spawn, spawnSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../slicing/detect.py', import.meta.url));
const MODES = new Set(['all', 'timbre_dp', 'spectral_change', 'speaker_embedding', 'speaker_resnet', 'speaker_eres2net', 'speaker_consensus', 'speaker_strict']);
const TIMEOUT_MS = 180_000;
const OUTPUT_LIMIT = 4 * 1024 * 1024;
const TIME_TOLERANCE = 0.02;
const CONTIGUITY_TOLERANCE = 0.000001;
let cachedPython;

export async function checkLocalSpeakerModels() {
  const script = fileURLToPath(new URL('../slicing/check_models.py', import.meta.url));
  const { stdout } = await promisify(execFile)(pythonExecutable(), [script], { timeout: 30000, windowsHide: true });
  const result = JSON.parse(stdout);
  if (!result.success) throw new Error(result.error || 'Local speaker models are not ready.');
  return result;
}

function failure(result, message) {
  return { ...result, success: false, error: message, segments: [] };
}

/** Independently reject unsafe boundaries before any clip is written. */
export function validateEngineResult(result, expectedCount, options = {}, totalDuration = result?.totalDuration) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return failure({}, 'Local detector returned an invalid engine result.');
  }
  if (result.success !== true) return failure(result, result.error || 'Detector could not resolve safe speaker boundaries.');
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1) {
    return failure(result, 'Expected segment count must be a positive integer.');
  }
  if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
    return failure(result, 'Detector returned an invalid audio duration.');
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return failure(result, 'Invalid local detector options.');
  }
  const minDuration = options.minSegmentSeconds ?? 0.35;
  const maxDuration = options.maxSegmentSeconds === undefined ? Infinity : options.maxSegmentSeconds;
  if (!Number.isFinite(minDuration) || minDuration <= 0 ||
      (options.maxSegmentSeconds !== undefined && (!Number.isFinite(maxDuration) || maxDuration < minDuration))) {
    return failure(result, 'Invalid segment duration limits.');
  }
  if (!Array.isArray(result.segments) || result.segments.length !== expectedCount) {
    return failure(result, `Unsafe segmentation: expected ${expectedCount} segments, received ${result.segments?.length ?? 0}.`);
  }
  let previousEnd = 0;
  const segments = [];
  for (let i = 0; i < result.segments.length; i++) {
    const segment = result.segments[i];
    if (!segment || !Number.isFinite(segment.start) || !Number.isFinite(segment.end) ||
        segment.start < 0 || segment.end > totalDuration + TIME_TOLERANCE || segment.end <= segment.start) {
      return failure(result, `Unsafe segmentation: segment ${i + 1} has invalid timestamps.`);
    }
    if (Math.abs(segment.start - previousEnd) > CONTIGUITY_TOLERANCE) {
      return failure(result, `Unsafe segmentation: segment ${i + 1} leaves a gap or overlaps the previous segment.`);
    }
    const duration = segment.end - segment.start;
    const effectiveMin = expectedCount === 1 ? Math.min(minDuration, totalDuration) : minDuration;
    if (duration + 0.001 < effectiveMin || duration - 0.001 > maxDuration) {
      return failure(result, `Unsafe segmentation: segment ${i + 1} violates duration limits.`);
    }
    if (segment.duration !== undefined &&
        (!Number.isFinite(segment.duration) || Math.abs(segment.duration - duration) > TIME_TOLERANCE)) {
      return failure(result, `Unsafe segmentation: segment ${i + 1} has inconsistent duration metadata.`);
    }
    segments.push({ ...segment, start: segment.start, end: segment.end, duration });
    previousEnd = segment.end;
  }
  if (Math.abs(previousEnd - totalDuration) > TIME_TOLERANCE) {
    return failure(result, 'Unsafe segmentation: segments do not cover the complete master audio.');
  }
  return { ...result, success: true, totalDuration, segments };
}

export function pythonExecutable() {
  if (process.env.PYTHON) return process.env.PYTHON;
  if (cachedPython) return cachedPython;
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const executable of candidates) {
    const probe = spawnSync(executable, ['-c', 'import sys; sys.exit(0)'], { stdio: 'ignore', timeout: 5_000, windowsHide: true });
    if (probe.status === 0) return (cachedPython = executable);
  }
  throw new Error('Python 3 was not found. Set PYTHON to your Python executable.');
}

export function abortError() {
  const error = new Error('Local speaker analysis was cancelled.');
  error.name = 'AbortError';
  return error;
}

/** Read PCM WAV duration without loading the master into Node memory. */
export async function wavDuration(audioPath) {
  const file = await fs.open(audioPath, 'r');
  try {
    const stat = await file.stat();
    const header = Buffer.alloc(12);
    if ((await file.read(header, 0, 12, 0)).bytesRead < 12 ||
        header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WAVE') return null;
    let byteRate;
    let dataBytes;
    let offset = 12;
    for (let chunk = 0; chunk < 1024 && offset + 8 <= stat.size; chunk++) {
      const chunkHeader = Buffer.alloc(8);
      if ((await file.read(chunkHeader, 0, 8, offset)).bytesRead < 8) return null;
      const size = chunkHeader.readUInt32LE(4);
      const chunkType = chunkHeader.toString('ascii', 0, 4);
      if (offset + 8 + size > stat.size) return null;
      if (chunkType === 'fmt ' && size >= 16) {
        const format = Buffer.alloc(16);
        await file.read(format, 0, 16, offset + 8);
        byteRate = format.readUInt32LE(8);
      }
      if (chunkType === 'data') dataBytes = size;
      if (byteRate && dataBytes !== undefined) return dataBytes / byteRate;
      offset += 8 + size + (size % 2);
    }
    return null;
  } finally {
    await file.close();
  }
}

function runDetector(executable, args, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const child = spawn(executable, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let forcedError;
    const stop = (error) => {
      if (forcedError) return;
      forcedError = error;
      child.kill('SIGKILL');
    };
    const onAbort = () => stop(abortError());
    const timer = setTimeout(() => stop(new Error('Local speaker analysis timed out after 180 seconds.')), TIMEOUT_MS);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
    child.stdout.on('data', data => {
      stdout += data.toString();
      if (stdout.length > OUTPUT_LIMIT) stop(new Error('Local detector output exceeded the safety limit.'));
    });
    child.stderr.on('data', data => { stderr = (stderr + data.toString()).slice(-16_384); });
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };
    child.once('error', error => { cleanup(); reject(forcedError || error); });
    child.once('close', code => {
      cleanup();
      if (forcedError) return reject(forcedError);
      try {
        const result = JSON.parse(stdout.trim());
        if (code !== 0 && result?.success === true) return reject(new Error(`Local detector exited with code ${code}: ${stderr}`));
        resolve(result);
      } catch (error) {
        reject(new Error(`Local detector returned invalid JSON (exit ${code}): ${stderr || error.message}`));
      }
    });
  });
}

/** Free local analysis only: this bridge never generates replacement audio. */
export async function detectLocalSpeakerSegments(audioPath, expectedCount, mode = 'all', options = {}, signal = null) {
  if (signal?.aborted) throw abortError();
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1) return failure({}, 'Expected segment count must be a positive integer.');
  if (!MODES.has(mode)) return failure({}, `Unknown local speaker mode: ${mode}`);
  let tempDirectory;
  try {
    const duration = await wavDuration(audioPath);
    if (signal?.aborted) throw abortError();
    const executable = pythonExecutable();
    tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'local-speaker-'));
    const optionsPath = path.join(tempDirectory, 'options.json');
    await fs.writeFile(optionsPath, JSON.stringify(options), { encoding: 'utf8', mode: 0o600 });
    const raw = await runDetector(executable, [SCRIPT, audioPath, String(expectedCount), `--mode=${mode}`, `--options-file=${optionsPath}`], signal);
    return validateDetectorResult(raw, expectedCount, mode, options, duration);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return failure({}, error.message);
  } finally {
    if (tempDirectory) await fs.rm(tempDirectory, { recursive: true, force: true }).catch(() => {});
  }
}

export function validateDetectorResult(raw, expectedCount, mode, options, duration) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return failure({}, 'Local detector returned an invalid result.');
    if (Number.isFinite(duration) && Math.abs(raw.totalDuration - duration) > TIME_TOLERANCE) {
      const error = 'Unsafe segmentation: reported duration differs from the master WAV.';
      const engines = Object.fromEntries(Object.entries(raw.engines || {}).map(([key, engine]) => [key, failure(engine, error)]));
      return { ...failure(raw, error), engines };
    }
    const totalDuration = duration ?? raw.totalDuration;
    const engines = Object.fromEntries(Object.entries(raw.engines || {}).map(([key, engine]) =>
      [key, validateEngineResult(engine, expectedCount, options, totalDuration)]));
    if (Object.keys(engines).length === 0) return validateEngineResult(raw, expectedCount, options, totalDuration);
    const successful = Object.values(engines).some(engine => engine.success);
    const result = { ...raw, totalDuration, engines, success: successful, segments: [] };
    if (mode !== 'all') {
      const selected = engines[mode];
      if (!selected) return failure(result, `Local detector did not return the requested ${mode} engine.`);
      return { ...result, ...selected, engines };
    }
    if (!successful) {
      result.error = raw.error || 'Every local speaker detector rejected this master. Inspect engine diagnostics.';
      result.segments = [];
    }
    return result;
}

export const supportedSpeakerMode = mode => MODES.has(mode);
