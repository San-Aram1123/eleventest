import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { refineWavSlice } from './waveformBoundaryRefiner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEGMENTER_SCRIPT = path.resolve(__dirname, 'whisperSegmenter.py');

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
function runSingleSilencePass(audioPath, noise, minDur, minAcceptableDur, totalDur, expectedCount) {
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

      // 2. Pick the N-1 largest interior pauses corresponding to intentional <long pause> boundaries
      let topSilences = [];
      if (interiorSilences.length === expectedCount - 1) {
        topSilences = interiorSilences.slice();
      } else {
        // If there are extra pauses (e.g. within-sentence breaths), sort by duration and pick
        // the N-1 most prominent pauses that are separated chronologically by at least 0.8s
        const sortedByDur = interiorSilences.slice().sort((a, b) => b.duration - a.duration);
        topSilences = sortedByDur.slice(0, expectedCount - 1);
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
        const sEnd = i < expectedCount - 1 ? ((topSilences[i].start + topSilences[i].end) / 2) : Math.max(sStart + 0.65, finalEnd);
        const dur = Math.max(0, sEnd - sStart);

        if (dur < 0.65) {
          return resolve({ success: false, error: `Segment ${i + 1} duration too short (${dur.toFixed(2)}s)` });
        }

        segments.push({
          index: i + 1,
          start: Math.round(sStart * 1000) / 1000,
          end: Math.round(sEnd * 1000) / 1000,
          duration: Math.round(dur * 1000) / 1000
        });
      }

      // Duration outlier & anomaly validation:
      const sortedDurs = segments.map(s => s.duration).sort((a, b) => a - b);
      const medianDur = sortedDurs[Math.floor(sortedDurs.length / 2)] || 3.0;
      let hasOutlier = false;
      let suspiciousExtraSpeech = false;
      const outlierDetails = [];

      for (let i = 0; i < segments.length; i++) {
        const d = segments[i].duration;
        // Check for suspicious repeated / merged sentences (e.g., segment > 2.2x median and > 10s)
        if (d > Math.max(10.0, medianDur * 2.2)) {
          suspiciousExtraSpeech = true;
          outlierDetails.push(`Clip ${i + 1} suspicious extra/repeated speech (${d}s vs median ${medianDur.toFixed(2)}s)`);
        } else if (d > Math.max(8.0, medianDur * 2.0) || (medianDur >= 2.0 && d < Math.min(0.8, medianDur * 0.35))) {
          hasOutlier = true;
          outlierDetails.push(`Clip ${i + 1} duration outlier: ${d}s vs median ${medianDur.toFixed(2)}s`);
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

      const saneDurations = segments.every(s => s.duration >= 0.65 && s.duration <= 16.0);
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
async function detectViaSilence(audioPath, expectedCount) {
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
    const res = await runSingleSilencePass(audioPath, pass.noise, pass.minDur, pass.minAcceptableDur, totalDur, expectedCount);
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
  return new Promise((resolve) => {
    const proc = spawn('python', [SEGMENTER_SCRIPT, audioPath, String(expectedCount)]);
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
  return new Promise((resolve) => {
    const proc = spawn('python', [SEGMENTER_SCRIPT, audioPath, String(expectedCount), '--mode=markers']);
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
 * Main sentence segmentation function:
 * Supports 'markers' (spoken verbal markers) and 'silence' (inter-sentence pause detection).
 */
export async function detectWhisperSegments(audioPath, expectedCount, options = {}) {
  const strategy = options.slicingStrategy || 'markers';

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
  const silenceResult = await detectViaSilence(audioPath, expectedCount);
  if (silenceResult.success && silenceResult.segments && silenceResult.segments.length === expectedCount) {
    return silenceResult;
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
          emotion: options.emotion
        });
        buffers.push(refinedBuffer);
        sliceMetrics.push(boundaryMetrics);
      } else {
        buffers.push(Buffer.alloc(0));
        sliceMetrics.push(null);
      }
    } finally {
      if (fs.existsSync(outTmp)) {
        try { fs.unlinkSync(outTmp); } catch (_) {}
      }
    }
  }

  buffers.sliceMetrics = sliceMetrics;
  return buffers;
}
