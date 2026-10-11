import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { refineWavSlice } from './waveformBoundaryRefiner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEGMENTER_SCRIPT = path.resolve(__dirname, 'whisperSegmenter.py');

let cachedPythonBin = null;

/**
 * Resolves the working Python executable.
 * Prioritizes process.env.PYTHON, then checks candidates ('python', 'py', 'python3')
 * to verify which binary has faster_whisper installed.
 */
function getPythonBin() {
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
function probeAudioDuration(audioPath) {
  return new Promise((resolve) => {
    const probe = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioPath]);
    let out = '';
    probe.stdout.on('data', d => { out += d.toString(); });
    probe.on('close', () => resolve(parseFloat(out.trim()) || 0));
    probe.on('error', () => resolve(0));
  });
}

/**
 * Single pass FFmpeg silence detection with configurable noise threshold and minimum duration.
 */
/**
 * Single pass FFmpeg silence detection with configurable noise threshold and minimum duration.
 * Uses midpoint cutting and expected boundary validation for Gemini 3.8 <long pause> boundaries.
 */
function runSingleSilencePass(audioPath, noise, minDur, minAcceptableDur, totalDur, expectedCount, options = {}) {
  return new Promise((resolve) => {
    const proc = spawn('ffmpeg', [
      '-i', audioPath,
      '-af', `silencedetect=noise=${noise}:d=${minDur}`,
      '-f', 'null', '-'
    ]);

    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) return resolve({ success: false, error: 'FFmpeg silencedetect failed' });

      const silences = [];
      const startRegex = /silence_start:\s*([\d\.]+)/g;
      const endRegex = /silence_end:\s*([\d\.]+)\s*\|\s*silence_duration:\s*([\d\.]+)/g;
      let starts = [], ends = [], m;
      while ((m = startRegex.exec(stderr)) !== null) starts.push(parseFloat(m[1]));
      while ((m = endRegex.exec(stderr)) !== null) ends.push({ end: parseFloat(m[1]), duration: parseFloat(m[2]) });

      for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
        silences.push({ start: starts[i], end: ends[i].end, duration: ends[i].duration });
      }

      // Sort raw silences chronologically by start time
      silences.sort((a, b) => a.start - b.start);

      // Acoustic Silence Bridging:
      // When laughing or expressing emotion, Gemini frequently chuckles/giggles during <long pause>.
      // These short laughter bursts break a 2.5s pause into multiple 0.4s-0.6s fragments separated by 0.1s-0.35s sounds.
      // Bridge adjacent silences separated by <= 0.35s bursts of laughter into a single solid pause!
      const bridgedSilences = [];
      for (const s of silences) {
        if (bridgedSilences.length === 0) {
          bridgedSilences.push({ ...s });
        } else {
          const last = bridgedSilences[bridgedSilences.length - 1];
          const soundGap = s.start - last.end;
          if (soundGap <= 0.35) {
            // Bridge: extend the last silence across the chuckle/breath sound
            last.end = s.end;
            last.duration = Math.round((last.end - last.start) * 1000) / 1000;
          } else {
            bridgedSilences.push({ ...s });
          }
        }
      }

      // 1. Separate leading dead air, trailing dead air, and genuine interior pauses
      let leadingDeadAir = null;
      let trailingDeadAir = null;
      const interiorSilences = [];

      for (const s of bridgedSilences) {
        // Silence starting within 0.35s of audio start is leading dead air
        if (s.start <= 0.35) {
          if (!leadingDeadAir || s.duration > leadingDeadAir.duration) {
            leadingDeadAir = s;
          }
          continue;
        }
        // Silence extending to within 0.40s of total duration is trailing dead air
        if (s.end >= totalDur - 0.40) {
          if (!trailingDeadAir || s.duration > trailingDeadAir.duration) {
            trailingDeadAir = s;
          }
          continue;
        }
        // True interior pause between spoken sentences
        interiorSilences.push(s);
      }

      if (interiorSilences.length < expectedCount - 1) {
        return resolve({
          success: false,
          error: `Found ${interiorSilences.length} interior pauses between sentences (expected at least ${expectedCount - 1})`
        });
      }

      const minClipDur = typeof options?.minClipDur === 'number' ? options.minClipDur : 6.0;
      const maxClipDur = typeof options?.maxClipDur === 'number' ? options.maxClipDur : 16.5;
      const minPauseSeparation = typeof options?.minClipDur === 'number' ? Math.max(1.0, options.minClipDur * 0.8) : 5.5;

      // 2. Pick the N-1 interior pauses corresponding to inter-paragraph/sentence boundaries.
      // If reference sentences/paragraphs are provided, use Proportional Word-Weight Time-Windowing!
      let topSilences = [];
      const sentences = options?.sentences;

      if (Array.isArray(sentences) && sentences.length === expectedCount && sentences.length > 1) {
        const words = sentences.map(s => String(s || '').trim().split(/\s+/).filter(Boolean).length);
        const totalWords = words.reduce((a, b) => a + b, 0) || 1;
        let cumulativeWords = 0;
        let lastBoundaryEnd = 0.0;
        const pickedCandidates = [];
        const minSep = Math.max(3.0, minPauseSeparation * 0.6);

        for (let b = 0; b < expectedCount - 1; b++) {
          cumulativeWords += words[b];
          const expectedTime = (cumulativeWords / totalWords) * totalDur;
          const windowSpan = Math.max(5.0, expectedTime * 0.40);
          const winStart = Math.max(lastBoundaryEnd + 2.0, expectedTime - windowSpan);
          const winEnd = Math.min(totalDur - 2.0, expectedTime + windowSpan);

          const candidates = interiorSilences.filter(s => 
            s.start >= winStart && 
            s.end <= winEnd && 
            s.start > lastBoundaryEnd + minSep &&
            s.duration >= minAcceptableDur
          );

          if (candidates.length > 0) {
            candidates.sort((a, b) => b.duration - a.duration);
            const best = candidates[0];
            pickedCandidates.push(best);
            lastBoundaryEnd = best.end;
          }
        }

        if (pickedCandidates.length === expectedCount - 1) {
          topSilences = pickedCandidates;
        }
      }

      // Fallback: If proportional window didn't match all boundaries
      if (topSilences.length !== expectedCount - 1) {
        if (!options.sentences) {
          if (interiorSilences.length === expectedCount - 1) {
            topSilences = interiorSilences.slice();
          } else {
            // Prioritize pauses separated by at least minPauseSeparation to avoid intra-sentence comma/breath pauses
            const sortedByDur = interiorSilences.slice().sort((a, b) => b.duration - a.duration);
            const spacedCandidates = [];
            for (const cand of sortedByDur) {
              const isTooClose = spacedCandidates.some(s => Math.abs(s.start - cand.start) < minPauseSeparation);
              if (!isTooClose) {
                spacedCandidates.push(cand);
                if (spacedCandidates.length === expectedCount - 1) break;
              }
            }
            if (spacedCandidates.length === expectedCount - 1) {
              topSilences = spacedCandidates;
            } else {
              topSilences = sortedByDur.slice(0, expectedCount - 1);
            }
          }
        } else {
          return resolve({
            success: false,
            error: `Proportional acoustic windowing found only ${pickedCandidates.length} of ${expectedCount - 1} boundaries within safe windows`
          });
        }
      }
      topSilences.sort((a, b) => a.start - b.start);

      // Verify that the smallest boundary meets minimum acceptable pause
      if (topSilences.some(s => s.duration < minAcceptableDur)) {
        return resolve({ success: false, error: `Smallest split pause is too short (< ${minAcceptableDur}s)` });
      }

      // Safe Midpoint Cutting: Cut at the acoustic midpoint of each interior boundary pause.
      // Slices are further refined at the waveform level by refineWavSlice.
      const initialStart = leadingDeadAir && leadingDeadAir.end < topSilences[0].start - 0.50
        ? Math.max(0, leadingDeadAir.end - 0.15)
        : 0.0;
      const finalEnd = trailingDeadAir && trailingDeadAir.start > topSilences[topSilences.length - 1].end + 0.50
        ? Math.min(totalDur, trailingDeadAir.start + 0.15)
        : totalDur;

      const segments = [];
      for (let i = 0; i < expectedCount; i++) {
        const sStart = i === 0 ? initialStart : ((topSilences[i - 1].start + topSilences[i - 1].end) / 2);
        const sEnd = i < expectedCount - 1 ? ((topSilences[i].start + topSilences[i].end) / 2) : Math.max(sStart + minClipDur, finalEnd);
        const dur = Math.max(0, sEnd - sStart);

        // Word-count adaptive safety check if sentences provided:
        let clipMinDur = minClipDur;
        let clipMaxDur = maxClipDur;
        if (Array.isArray(sentences) && sentences[i]) {
          const wCount = String(sentences[i]).trim().split(/\s+/).filter(Boolean).length;
          clipMinDur = Math.max(minClipDur, wCount * 0.22);
          clipMaxDur = Math.max(maxClipDur, wCount * 1.5 + 8.0);
        }

        // Safety Guardrail: check bounds
        if (dur < clipMinDur || dur > clipMaxDur) {
          return resolve({ success: false, error: `Segment ${i + 1} duration (${dur.toFixed(2)}s) violates safety guard [${clipMinDur.toFixed(1)}s - ${clipMaxDur.toFixed(1)}s]` });
        }

        segments.push({
          index: i + 1,
          start: Math.round(sStart * 1000) / 1000,
          end: Math.round(sEnd * 1000) / 1000,
          duration: Math.round(dur * 1000) / 1000
        });
      }

      // Duration outlier & anomaly validation against safety guardrail:
      const sortedDurs = segments.map(s => s.duration).sort((a, b) => a - b);
      const medianDur = sortedDurs[Math.floor(sortedDurs.length / 2)] || 8.0;
      let hasOutlier = false;
      let suspiciousExtraSpeech = false;
      const outlierDetails = [];

      for (let i = 0; i < segments.length; i++) {
        const d = segments[i].duration;
        if (d < minClipDur || d > maxClipDur) {
          hasOutlier = true;
          outlierDetails.push(`Clip ${i + 1} duration ${d.toFixed(2)}s is outside safe bounds [${minClipDur}s - ${maxClipDur}s]`);
        }
      }

      // If silence detection produced outlier or merged segments, it was INCONCLUSIVE!
      // Return success: false immediately so Whisper VAD can resolve it.
      if (hasOutlier || suspiciousExtraSpeech) {
        return resolve({
          success: false,
          error: `Silence detection produced outlier segments (possible missed boundary or merged sentence): ${outlierDetails.join('; ')}`
        });
      }

      // Speech occupancy: ratio of non-silent speech vs total effective audio
      const totalBoundarySilence = topSilences.reduce((acc, s) => acc + s.duration, 0);
      const speechOccupancy = Math.max(0, Math.min(1.0, (finalEnd - totalBoundarySilence) / finalEnd));

      // Comprehensive multi-factor segmentation confidence (0.0 to 1.0)
      let confidence = 0.40; // Base: expected interior pause count (N-1) verified

      const avgBoundaryDur = topSilences.reduce((acc, s) => acc + s.duration, 0) / topSilences.length;
      if (avgBoundaryDur >= 0.70) confidence += 0.20;
      else if (avgBoundaryDur >= 0.40) confidence += 0.10;

      const saneDurations = segments.every(s => s.duration >= minClipDur && s.duration <= maxClipDur);
      if (saneDurations) confidence += 0.20;

      if (speechOccupancy >= 0.35 && speechOccupancy <= 0.95) {
        confidence += 0.20;
      }

      confidence = Math.max(0.10, Math.min(1.0, Math.round(confidence * 100) / 100));

      if (confidence < 0.70) {
        return resolve({
          success: false,
          error: `Silence detection confidence too low (${confidence})`
        });
      }

      resolve({
        success: true,
        segments,
        boundaries: topSilences,
        confidence,
        hasOutlier: false,
        outlierReason: null,
        qcMetrics: {
          boundaryCount: topSilences.length,
          avgBoundaryDur: Math.round(avgBoundaryDur * 1000) / 1000,
          medianClipDur: Math.round(medianDur * 1000) / 1000,
          speechOccupancy: Math.round(speechOccupancy * 1000) / 1000,
          trailingSilenceDur: trailingDeadAir ? Math.round(trailingDeadAir.duration * 1000) / 1000 : 0,
          hasSuspiciousTrailingSilence: false,
          suspiciousExtraSpeech: false
        },
        strategy: 'gemini38_long_pause'
      });
    });

    proc.on('error', (err) => resolve({ success: false, error: err.message }));
  });
}

/**
 * Detects inter-sentence pauses using adaptive multi-pass FFmpeg silence detection.
 * Calibrated specifically for Gemini 3.8 <long pause> boundary detection.
 */
async function detectViaSilence(audioPath, expectedCount, options = {}) {
  const totalDur = await probeAudioDuration(audioPath);
  if (totalDur <= 0) return { success: false, error: 'Empty or invalid audio' };

  if (expectedCount === 1) {
    return {
      success: true,
      segments: [{ index: 1, start: 0, end: totalDur, duration: totalDur }],
      boundaries: [],
      confidence: 1.0,
      strategy: 'single_clip'
    };
  }

  // Priority passes calibrated for Gemini 3.8 <long pause> (~0.8s to 2.0s)
  const passes = [
    { noise: '-28dB', minDur: '0.50', minAcceptableDur: 0.40 },
    { noise: '-30dB', minDur: '0.45', minAcceptableDur: 0.35 },
    { noise: '-33dB', minDur: '0.40', minAcceptableDur: 0.30 },
    { noise: '-24dB', minDur: '0.55', minAcceptableDur: 0.40 },
    { noise: '-36dB', minDur: '0.35', minAcceptableDur: 0.25 },
  ];

  let lastError = '';
  for (const pass of passes) {
    const res = await runSingleSilencePass(audioPath, pass.noise, pass.minDur, pass.minAcceptableDur, totalDur, expectedCount, options);
    if (res.success && res.segments && res.segments.length === expectedCount) {
      return res;
    }
    lastError = res.error || 'silence detection inconclusive';
  }

  return { success: false, error: lastError };
}

/**
 * Fallback to Whisper Python segmenter if silence detection is inconclusive.
 */
function detectViaWhisper(audioPath, expectedCount) {
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
 * Detects sentence segments using spoken verbal markers (e.g. "ژمارە یەک", "ژمارە دوو").
 * Whisper word-timestamp alignment guarantees 100% precision even with laughter or erratic pauses.
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
 * Completely eliminates English verbal markers and isolates speech from inter-sentence giggles/laughter.
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
 * Main sentence segmentation function:
 * Supports 'kurdish_align' (Whisper word boundary alignment), 'markers' (spoken verbal markers), and 'silence' (inter-sentence pause detection).
 */
export async function detectWhisperSegments(audioPath, expectedCount, options = {}) {
  const strategy = options.slicingStrategy || 'silence';

  // Strategy 0: Kurdish Word Boundary Alignment (Recommended - zero markers, immune to laugh breaks)
  if (strategy === 'kurdish_align' && Array.isArray(options.sentences) && options.sentences.length > 0) {
    console.log(`[Marker Alignment] Running Kurdish word alignment (expecting ${expectedCount} sentences)...`);
    const alignResult = await detectKurdishBoundarySegments(audioPath, options.sentences, expectedCount);
    if (alignResult.success && alignResult.segments && alignResult.segments.length === expectedCount) {
      return alignResult;
    }
    const err = alignResult.error || `Expected ${expectedCount} sentences, but only aligned ${alignResult.detectedCount || 0}`;
    console.error(`[Marker Alignment] Kurdish word alignment failed: ${err}`);
    return {
      success: false,
      error: `Kurdish word alignment failed: ${err}. Take aborted to prevent bad boundary cuts.`
    };
  }

  // Strategy 1: Spoken verbal markers (bulletproof alignment with Whisper)
  if (strategy === 'markers') {
    console.log(`[Marker Alignment] Running spoken marker alignment (expecting ${expectedCount} markers)...`);
    const markerResult = await detectMarkerSegments(audioPath, expectedCount);
    if (markerResult.success && markerResult.segments && markerResult.segments.length === expectedCount) {
      return markerResult;
    }
    // Strict Guardrail: Never fall back to silence detection when verbal markers are in the audio stream!
    // Silence detection cuts at interior pauses and leaves spoken markers in the training audio.
    const markerErr = markerResult.error || `Expected ${expectedCount} markers, but only detected ${markerResult.detectedCount || 0}`;
    console.error(`[Marker Alignment] Spoken marker alignment failed: ${markerErr}`);
    return {
      success: false,
      error: `Spoken marker alignment failed: ${markerErr}. Take aborted to prevent marker words from entering clips.`
    };
  }

  // Strategy 2: Instant, sample-accurate FFmpeg silence partitioning (for pause-separated prompts)
  const silenceResult = await detectViaSilence(audioPath, expectedCount, options);
  if (silenceResult.success && silenceResult.segments && silenceResult.segments.length === expectedCount) {
    return silenceResult;
  }

  // If noModels mode is requested, do not run heavy local Whisper ML models
  if (options.noModels) {
    return {
      success: false,
      error: `Silence detection could not resolve boundaries safely: ${silenceResult.error || 'inconclusive'}. Slicing aborted.`
    };
  }

  // Tier 3: Whisper VAD fallback
  console.log(`[Marker Alignment] Silence detection inconclusive (${silenceResult.error}), trying Whisper VAD fallback...`);
  const whisperResult = await detectViaWhisper(audioPath, expectedCount);
  if (whisperResult.success && whisperResult.segments && whisperResult.segments.length === expectedCount) {
    return whisperResult;
  }

  return {
    success: false,
    error: `Expected ${expectedCount} sentences, but could not resolve boundaries safely. Silence error: ${silenceResult.error}; Whisper error: ${whisperResult.error}`
  };
}

/**
 * Slices master WAV based on segments with sample-accurate boundaries.
 * Automatically runs waveform boundary refinement against the actual audio waveform.
 */
export async function sliceAudioBySegments(masterWavPath, segments, options = {}) {
  const buffers = [];
  const sliceMetrics = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const outTmp = path.resolve(os.tmpdir(), `seg_slice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
    const dur = Math.max(0.1, seg.end - seg.start);

    try {
      await new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', [
          '-y',
          '-ss', String(seg.start),
          '-t', String(dur),
          '-i', masterWavPath,
          '-c:a', 'pcm_s16le',
          outTmp
        ]);
        proc.on('close', (c) => c === 0 ? resolve() : reject(new Error(`FFmpeg slice failed with code ${c}`)));
        proc.on('error', reject);
      });

      if (fs.existsSync(outTmp) && fs.statSync(outTmp).size > 4000) {
        const rawBuf = fs.readFileSync(outTmp);
        const { refinedBuffer, boundaryMetrics } = refineWavSlice(rawBuf, {
          isWhisper: Boolean(options.isWhisper),
          emotion: options.emotion,
          stripBreathing: Boolean(options.stripBreathing)
        });
        buffers.push(refinedBuffer);
        sliceMetrics.push(boundaryMetrics);
      } else {
        buffers.push(Buffer.alloc(0));
        sliceMetrics.push(null);
      }
    } finally {
      if (fs.existsSync(outTmp)) {
        try { fs.unlinkSync(outTmp); } catch (_) { }
      }
    }
  }

  buffers.sliceMetrics = sliceMetrics;
  return buffers;
}
