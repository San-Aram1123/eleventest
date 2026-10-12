import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEGMENTER_SCRIPT = path.resolve(__dirname, '..', 'whisperSegmenter.py');
const SPEAKER_DETECTOR_SCRIPT = path.resolve(__dirname, '..', 'speakerDetector.py');

let cachedPythonBin = null;

/**
 * Resolves the working Python executable.
 */
export function getPythonBin() {
  if (process.env.PYTHON) return process.env.PYTHON;
  if (cachedPythonBin) return cachedPythonBin;

  const candidates = process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

  for (const bin of candidates) {
    try {
      const res = spawnSync(bin, ['-c', 'import faster_whisper'], { stdio: 'ignore' });
      if (res && res.status === 0) {
        cachedPythonBin = bin;
        return bin;
      }
    } catch (_) { }
  }

  cachedPythonBin = process.platform === 'win32' ? 'python' : 'python3';
  return cachedPythonBin;
}

/**
 * Probes total duration of audio file using ffprobe.
 */
export function probeAudioDuration(audioPath) {
  return new Promise((resolve) => {
    const probe = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioPath]);
    let out = '';
    probe.stdout.on('data', d => { out += d.toString(); });
    probe.on('close', () => resolve(parseFloat(out.trim()) || 0));
    probe.on('error', () => resolve(0));
  });
}

/**
 * Fallback to Whisper Python segmenter if silence detection is inconclusive.
 */
export function detectViaWhisper(audioPath, expectedCount) {
  const pythonBin = getPythonBin();
  return new Promise((resolve) => {
    const proc = spawn(pythonBin, [SEGMENTER_SCRIPT, audioPath, String(expectedCount)]);
    let stdout = '', stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) return resolve({ success: false, error: `Whisper exited with code ${code}` });
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (err) {
        resolve({ success: false, error: 'Failed to parse Whisper JSON output' });
      }
    });

    proc.on('error', (err) => resolve({ success: false, error: err.message }));
  });
}

/**
 * Detects sentence segments using spoken verbal markers.
 */
export function detectMarkerSegments(audioPath, expectedCount) {
  const pythonBin = getPythonBin();
  return new Promise((resolve) => {
    const proc = spawn(pythonBin, [SEGMENTER_SCRIPT, audioPath, String(expectedCount), '--mode=markers']);
    let stdout = '', stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) return resolve({ success: false, error: `Whisper marker detector exited with code ${code}: ${stderr}` });
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (err) {
        resolve({ success: false, error: 'Failed to parse Whisper marker JSON output' });
      }
    });

    proc.on('error', (err) => resolve({ success: false, error: err.message }));
  });
}

/**
 * Detects sentence segments using Kurdish Word Boundary Alignment with Whisper word-timestamps.
 */
export function detectKurdishBoundarySegments(audioPath, sentences, expectedCount) {
  const pythonBin = getPythonBin();
  return new Promise((resolve) => {
    const tmpSentencesFile = path.resolve(os.tmpdir(), `kurdish_sents_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
    try {
      fs.writeFileSync(tmpSentencesFile, JSON.stringify(sentences || []), 'utf8');
    } catch (err) {
      return resolve({ success: false, error: `Failed to write temporary sentences file: ${err.message}` });
    }

    const proc = spawn(pythonBin, [
      SEGMENTER_SCRIPT,
      audioPath,
      String(expectedCount || (sentences ? sentences.length : 6)),
      '--mode=kurdish_align',
      `--sentences-file=${tmpSentencesFile}`
    ]);

    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      try {
        if (fs.existsSync(tmpSentencesFile)) fs.unlinkSync(tmpSentencesFile);
      } catch (_) { }

      if (code !== 0) {
        return resolve({ success: false, error: `Whisper Kurdish alignment exited with code ${code}: ${stderr}` });
      }

      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (err) {
        resolve({ success: false, error: `Failed to parse Whisper JSON output: ${stdout || stderr}` });
      }
    });

    proc.on('error', (err) => {
      try {
        if (fs.existsSync(tmpSentencesFile)) fs.unlinkSync(tmpSentencesFile);
      } catch (_) { }
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Detects boundaries between alternating speakers using:
 * - 'pitch': Option 1 (Pitch F0 & Formant step tracking)
 * - 'diarization': Option 2 (Acoustic Diarization / SCD divergence)
 * - 'both': Runs both and provides side-by-side comparison
 */
export function detectViaSpeakerAcoustics(audioPath, expectedCount, mode = 'all', paragraphs = []) {
  const pythonBin = getPythonBin();
  let tmpParasFile = null;
  const args = [SPEAKER_DETECTOR_SCRIPT, audioPath, String(expectedCount), `--mode=${mode}`];

  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    try {
      tmpParasFile = path.resolve(os.tmpdir(), `paras_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
      fs.writeFileSync(tmpParasFile, JSON.stringify(paragraphs), 'utf8');
      args.push(`--paragraphs-file=${tmpParasFile}`);
    } catch (_) { }
  }

  return new Promise((resolve) => {
    const proc = spawn(pythonBin, args);
    let stdout = '', stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (tmpParasFile && fs.existsSync(tmpParasFile)) {
        try { fs.unlinkSync(tmpParasFile); } catch (_) { }
      }
      if (code !== 0) return resolve({ success: false, error: `Speaker detector exited with code ${code}: ${stderr}` });
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (err) {
        resolve({ success: false, error: 'Failed to parse speaker detector JSON output' });
      }
    });

    proc.on('error', (err) => {
      if (tmpParasFile && fs.existsSync(tmpParasFile)) {
        try { fs.unlinkSync(tmpParasFile); } catch (_) { }
      }
      resolve({ success: false, error: err.message });
    });
  });
}
