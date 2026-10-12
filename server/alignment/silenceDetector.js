import { spawn } from 'child_process';
import { probeAudioDuration } from './whisperBridge.js';

/**
 * Single pass FFmpeg silence detection with configurable noise threshold and minimum duration.
 * Uses midpoint cutting and expected boundary validation for Gemini 3.8 <long pause> boundaries.
 */
export function runSingleSilencePass(audioPath, noise, minDur, minAcceptableDur, totalDur, expectedCount, options = {}) {
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

      silences.sort((a, b) => a.start - b.start);

      // Acoustic Silence Bridging for laugh/chuckle gaps <= 0.35s
      const bridgedSilences = [];
      for (const s of silences) {
        if (bridgedSilences.length === 0) {
          bridgedSilences.push({ ...s });
        } else {
          const last = bridgedSilences[bridgedSilences.length - 1];
          const soundGap = s.start - last.end;
          if (soundGap <= 0.35) {
            last.end = s.end;
            last.duration = Math.round((last.end - last.start) * 1000) / 1000;
          } else {
            bridgedSilences.push({ ...s });
          }
        }
      }

      let leadingDeadAir = null;
      let trailingDeadAir = null;
      const interiorSilences = [];

      for (const s of bridgedSilences) {
        if (s.start <= 0.35) {
          if (!leadingDeadAir || s.duration > leadingDeadAir.duration) leadingDeadAir = s;
          continue;
        }
        if (s.end >= totalDur - 0.40) {
          if (!trailingDeadAir || s.duration > trailingDeadAir.duration) trailingDeadAir = s;
          continue;
        }
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

      if (topSilences.length !== expectedCount - 1) {
        if (!options.sentences) {
          if (interiorSilences.length === expectedCount - 1) {
            topSilences = interiorSilences.slice();
          } else {
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
            error: `Proportional acoustic windowing found only ${topSilences.length} of ${expectedCount - 1} boundaries within safe windows`
          });
        }
      }
      topSilences.sort((a, b) => a.start - b.start);

      if (topSilences.some(s => s.duration < minAcceptableDur)) {
        return resolve({ success: false, error: `Smallest split pause is too short (< ${minAcceptableDur}s)` });
      }

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

        let clipMinDur = minClipDur;
        let clipMaxDur = maxClipDur;
        if (Array.isArray(sentences) && sentences[i]) {
          const wCount = String(sentences[i]).trim().split(/\s+/).filter(Boolean).length;
          clipMinDur = Math.max(minClipDur, wCount * 0.22);
          clipMaxDur = Math.max(maxClipDur, wCount * 1.5 + 8.0);
        }

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

      const sortedDurs = segments.map(s => s.duration).sort((a, b) => a - b);
      const medianDur = sortedDurs[Math.floor(sortedDurs.length / 2)] || 8.0;
      let hasOutlier = false;
      const outlierDetails = [];

      for (let i = 0; i < segments.length; i++) {
        const d = segments[i].duration;
        if (d < minClipDur || d > maxClipDur) {
          hasOutlier = true;
          outlierDetails.push(`Clip ${i + 1} duration ${d.toFixed(2)}s is outside safe bounds [${minClipDur}s - ${maxClipDur}s]`);
        }
      }

      if (hasOutlier) {
        return resolve({
          success: false,
          error: `Silence detection produced outlier segments: ${outlierDetails.join('; ')}`
        });
      }

      const totalBoundarySilence = topSilences.reduce((acc, s) => acc + s.duration, 0);
      const speechOccupancy = Math.max(0, Math.min(1.0, (finalEnd - totalBoundarySilence) / finalEnd));

      let confidence = 0.40;
      const avgBoundaryDur = topSilences.reduce((acc, s) => acc + s.duration, 0) / topSilences.length;
      if (avgBoundaryDur >= 0.70) confidence += 0.20;
      else if (avgBoundaryDur >= 0.40) confidence += 0.10;

      const saneDurations = segments.every(s => s.duration >= minClipDur && s.duration <= maxClipDur);
      if (saneDurations) confidence += 0.20;
      if (speechOccupancy >= 0.35 && speechOccupancy <= 0.95) confidence += 0.20;

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
 */
export async function detectViaSilence(audioPath, expectedCount, options = {}) {
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
