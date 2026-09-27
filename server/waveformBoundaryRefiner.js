import fs from 'fs';
import { createWavHeader } from './wavUtils.js';
import { AUDIO_BOUNDARY_CONFIG } from './pairedEmotionConfig.js';

/**
 * Parses PCM 16-bit mono or stereo samples from a RIFF WAV buffer.
 * Traverses WAV sub-chunks robustly to find 'fmt ' and 'data'.
 */
export function parseWavPcm(wavBuffer) {
  if (!wavBuffer || wavBuffer.length < 44) {
    throw new Error('Invalid WAV buffer: too short');
  }

  const riff = wavBuffer.toString('ascii', 0, 4);
  const wave = wavBuffer.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || wave !== 'WAVE') {
    throw new Error('Not a valid RIFF/WAVE file');
  }

  let offset = 12;
  let sampleRate = 24000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let pcmBuffer = null;

  while (offset + 8 <= wavBuffer.length) {
    const chunkId = wavBuffer.toString('ascii', offset, offset + 4);
    const chunkSize = wavBuffer.readUInt32LE(offset + 4);
    offset += 8;

    if (chunkId === 'fmt ') {
      numChannels = wavBuffer.readUInt16LE(offset + 2);
      sampleRate = wavBuffer.readUInt32LE(offset + 4);
      bitsPerSample = wavBuffer.readUInt16LE(offset + 14);
      offset += chunkSize;
    } else if (chunkId === 'data') {
      pcmBuffer = wavBuffer.subarray(offset, Math.min(wavBuffer.length, offset + chunkSize));
      offset += chunkSize;
      break;
    } else {
      offset += chunkSize;
    }
  }

  if (!pcmBuffer || pcmBuffer.length === 0) {
    throw new Error('WAV data chunk not found or empty');
  }

  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = Math.floor(pcmBuffer.length / (bytesPerSample * numChannels));
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    if (numChannels === 1) {
      const byteIdx = i * 2;
      samples[i] = pcmBuffer.readInt16LE(byteIdx) / 32768.0;
    } else {
      // Average stereo channels down to mono
      const byteIdx = i * 4;
      const ch1 = pcmBuffer.readInt16LE(byteIdx) / 32768.0;
      const ch2 = pcmBuffer.readInt16LE(byteIdx + 2) / 32768.0;
      samples[i] = (ch1 + ch2) / 2.0;
    }
  }

  return {
    sampleRate,
    numChannels,
    bitsPerSample,
    samples,
    durationSeconds: totalSamples / sampleRate
  };
}

/**
 * Computes short-frame acoustic activity metrics:
 * RMS energy, peak amplitude, Zero Crossing Rate (ZCR), and spectral flux/first difference energy.
 */
function computeFrameMetrics(samples, sampleRate, frameSize, hopSize) {
  const numFrames = Math.max(1, Math.floor((samples.length - frameSize) / hopSize) + 1);
  const frames = [];

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    let sumSq = 0;
    let peak = 0;
    let zcrCount = 0;
    let highFreqEnergy = 0;

    let prevSample = samples[start];
    for (let i = 0; i < frameSize; i++) {
      const idx = start + i;
      if (idx >= samples.length) break;
      const val = samples[idx];
      const absVal = Math.abs(val);

      sumSq += val * val;
      if (absVal > peak) peak = absVal;

      if (i > 0) {
        if ((val >= 0 && prevSample < 0) || (val < 0 && prevSample >= 0)) {
          zcrCount++;
        }
        const diff = val - prevSample;
        highFreqEnergy += diff * diff;
      }
      prevSample = val;
    }

    const rms = Math.sqrt(sumSq / frameSize);
    const zcr = zcrCount / frameSize;
    const hfe = highFreqEnergy / frameSize;
    const timeMs = (start / sampleRate) * 1000;

    frames.push({
      frameIndex: f,
      timeMs,
      rms,
      peak,
      zcr,
      hfe
    });
  }

  return frames;
}

/**
 * Detects real speech onset and ending using adaptive noise-floor and multi-band turbulence detection.
 * Accurately catches soft vowels, /h/, /s/, whispers, sighs, and inhales while rejecting isolated clicks.
 */
export function detectSpeechBoundaries(samples, sampleRate, options = {}) {
  const isWhisper = Boolean(options.isWhisper);
  const frameDurMs = options.frameDurationMs || AUDIO_BOUNDARY_CONFIG.frameDurationMs;
  const hopDurMs = options.hopDurationMs || AUDIO_BOUNDARY_CONFIG.hopDurationMs;
  const minActivityMs = options.minimumActivityDurationMs || AUDIO_BOUNDARY_CONFIG.minimumActivityDurationMs;

  const frameSize = Math.max(16, Math.floor(sampleRate * (frameDurMs / 1000)));
  const hopSize = Math.max(8, Math.floor(sampleRate * (hopDurMs / 1000)));
  const frames = computeFrameMetrics(samples, sampleRate, frameSize, hopSize);

  if (frames.length === 0) {
    return {
      detectedStartMs: 0,
      detectedEndMs: (samples.length / sampleRate) * 1000,
      noiseFloor: 0.0001,
      totalDurMs: (samples.length / sampleRate) * 1000
    };
  }

  const totalDurMs = (samples.length / sampleRate) * 1000;

  // 1. Calculate clip's adaptive noise floor from lowest 2% energy frames (clamped to max 0.008 to prevent speech leakage)
  const sortedRms = frames.map(f => f.rms).sort((a, b) => a - b);
  const pIndex = Math.min(2, Math.floor(sortedRms.length * 0.02));
  const noiseFloorRms = Math.min(0.008, Math.max(0.00015, sortedRms[pIndex] || 0.0002));

  // 2. Multi-feature adaptive activity classification per frame
  // Voiced speech threshold:
  const voicedRmsThresh = Math.min(0.035, Math.max(0.008, noiseFloorRms * 3.5));
  const voicedPeakThresh = Math.min(0.080, Math.max(0.020, noiseFloorRms * 6.0));

  // Whisper / soft onset / sigh / /h/ / /s/ threshold:
  const whisperBoost = isWhisper ? AUDIO_BOUNDARY_CONFIG.whisperSensitivityBoost : 1.0;
  const unvoicedRmsThresh = Math.min(0.015, Math.max(0.0025, (noiseFloorRms * 2.2) / whisperBoost));
  const zcrThresh = 0.06 / whisperBoost;
  const hfeThresh = Math.max(0.00003, (noiseFloorRms * noiseFloorRms * 2.5) / whisperBoost);

  const activeFrames = new Uint8Array(frames.length);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const isVoiced = f.rms >= voicedRmsThresh || f.peak >= voicedPeakThresh;
    const isTurbulent = f.rms >= unvoicedRmsThresh && (f.zcr >= zcrThresh || f.hfe >= hfeThresh);
    activeFrames[i] = (isVoiced || isTurbulent) ? 1 : 0;
  }

  // 3. Two-pass sustained activity detection:
  // Require at least minActivityFrames consecutive active frames to ignore single clicks/pops
  const minActiveFrames = Math.max(3, Math.ceil(minActivityMs / hopDurMs));

  // Find earliest sustained activity (speech onset)
  let onsetFrameIdx = -1;
  let consecutive = 0;
  for (let i = 0; i < frames.length; i++) {
    if (activeFrames[i]) {
      consecutive++;
      if (consecutive >= minActiveFrames) {
        // Sustained activity confirmed! Walk back to find exact onset edge
        let edge = i - consecutive + 1;
        while (edge > 0 && (frames[edge - 1].rms > noiseFloorRms * 2.0)) {
          edge--;
        }
        onsetFrameIdx = edge;
        break;
      }
    } else {
      consecutive = 0;
    }
  }

  // Find latest sustained activity (speech ending)
  let offsetFrameIdx = -1;
  consecutive = 0;
  for (let i = frames.length - 1; i >= 0; i--) {
    if (activeFrames[i]) {
      consecutive++;
      if (consecutive >= minActiveFrames) {
        // Sustained activity confirmed! Walk forward to find exact release edge
        let edge = i + consecutive - 1;
        while (edge < frames.length - 1 && (frames[edge + 1].rms > noiseFloorRms * 2.0)) {
          edge++;
        }
        offsetFrameIdx = edge;
        break;
      }
    } else {
      consecutive = 0;
    }
  }

  if (onsetFrameIdx === -1 || offsetFrameIdx === -1 || onsetFrameIdx >= offsetFrameIdx) {
    // If no distinct activity found, retain entire clip safely
    return {
      detectedStartMs: 0,
      detectedEndMs: totalDurMs,
      noiseFloor: noiseFloorRms,
      totalDurMs,
      hasSpeech: false
    };
  }

  const detectedStartMs = Math.round(frames[onsetFrameIdx].timeMs);
  const detectedEndMs = Math.min(totalDurMs, Math.round(frames[offsetFrameIdx].timeMs + frameDurMs));

  return {
    detectedStartMs,
    detectedEndMs,
    noiseFloor: noiseFloorRms,
    totalDurMs,
    hasSpeech: true
  };
}

/**
 * Refines a WAV slice against the actual audio waveform:
 * 1. Locates real speech onset and ending.
 * 2. Applies configured safe pre-roll (80ms) and post-roll (120ms).
 * 3. Applies micro-fade (3ms) to eliminate cut clicks.
 * 4. Re-analyzes the resulting slice to verify leading/trailing silence QC and clipping absence.
 */
export function refineWavSlice(wavBuffer, options = {}) {
  const {
    preRollMs = AUDIO_BOUNDARY_CONFIG.preRollMs,
    postRollMs = AUDIO_BOUNDARY_CONFIG.postRollMs,
    maxLeadingSilenceMs = AUDIO_BOUNDARY_CONFIG.maxLeadingSilenceMs,
    maxTrailingSilenceMs = AUDIO_BOUNDARY_CONFIG.maxTrailingSilenceMs,
    isWhisper = false
  } = options;

  const parsed = parseWavPcm(wavBuffer);
  const { sampleRate, samples, durationSeconds } = parsed;
  const totalDurMs = durationSeconds * 1000;

  // Pass 1: Detect speech boundaries in the raw candidate slice
  const bounds = detectSpeechBoundaries(samples, sampleRate, { isWhisper });

  if (!bounds.hasSpeech) {
    return {
      refinedBuffer: wavBuffer,
      boundaryMetrics: {
        detected_start_ms: 0,
        detected_end_ms: Math.round(totalDurMs),
        pre_roll_ms: preRollMs,
        post_roll_ms: postRollMs,
        final_start_ms: 0,
        final_end_ms: Math.round(totalDurMs),
        leading_silence_ms: 0,
        trailing_silence_ms: 0,
        speech_start_clipped: false,
        speech_end_clipped: false,
        boundary_qc_pass: false,
        was_trimmed: false,
        reason: 'No speech activity detected in slice'
      }
    };
  }

  const detectedStartMs = bounds.detectedStartMs;
  const detectedEndMs = bounds.detectedEndMs;

  const rawLeadingSilenceMs = detectedStartMs;
  const rawTrailingSilenceMs = Math.max(0, totalDurMs - detectedEndMs);

  // Check if refinement is necessary:
  // Refine if leading silence > 140ms or trailing silence > 220ms
  const needsTrimming = (rawLeadingSilenceMs > 140) || (rawTrailingSilenceMs > 220);

  let finalStartMs = 0;
  let finalEndMs = totalDurMs;

  if (needsTrimming) {
    finalStartMs = Math.max(0, detectedStartMs - preRollMs);
    finalEndMs = Math.min(totalDurMs, detectedEndMs + postRollMs);
  }

  // Ensure minimum valid slice duration (at least 500ms)
  if (finalEndMs - finalStartMs < 500) {
    finalStartMs = Math.max(0, detectedStartMs - Math.max(preRollMs, 100));
    finalEndMs = Math.min(totalDurMs, detectedEndMs + Math.max(postRollMs, 150));
  }

  const startSample = Math.floor((finalStartMs / 1000) * sampleRate);
  const endSample = Math.min(samples.length, Math.ceil((finalEndMs / 1000) * sampleRate));
  const trimmedLength = Math.max(0, endSample - startSample);

  let outputBuffer = wavBuffer;
  let wasTrimmed = false;

  if (needsTrimming && trimmedLength > 0 && trimmedLength < samples.length) {
    const trimmedSamples = samples.subarray(startSample, endSample);

    // Apply 3ms anti-click micro-fade at cut boundaries
    const fadeSamples = Math.min(Math.floor(trimmedLength / 2), Math.floor((AUDIO_BOUNDARY_CONFIG.microFadeDurationMs / 1000) * sampleRate));
    for (let i = 0; i < fadeSamples; i++) {
      const gainIn = i / fadeSamples;
      trimmedSamples[i] *= gainIn;

      const outIdx = trimmedSamples.length - 1 - i;
      const gainOut = i / fadeSamples;
      trimmedSamples[outIdx] *= gainOut;
    }

    // Convert Float32Array to 16-bit PCM Buffer
    const pcmData = Buffer.alloc(trimmedLength * 2);
    for (let i = 0; i < trimmedLength; i++) {
      const s = Math.max(-1.0, Math.min(1.0, trimmedSamples[i]));
      pcmData.writeInt16LE(Math.floor(s < 0 ? s * 32768 : s * 32767), i * 2);
    }

    const wavHeader = createWavHeader(pcmData.length, sampleRate, 1, 16);
    outputBuffer = Buffer.concat([wavHeader, pcmData]);
    wasTrimmed = true;
  }

  // Pass 2: Re-verify the final audio file
  const reParsed = parseWavPcm(outputBuffer);
  const finalDurMs = reParsed.durationSeconds * 1000;

  // The actual leading silence preserved before speech in the output clip:
  const leadingSilenceMs = Math.max(0, Math.round(detectedStartMs - finalStartMs));
  // The actual trailing silence preserved after speech in the output clip:
  const trailingSilenceMs = Math.max(0, Math.round(finalEndMs - detectedEndMs));

  // Check for clipped speech at boundaries:
  let speechStartClipped = false;
  if (leadingSilenceMs < 25) {
    const checkSamples = Math.min(reParsed.samples.length, Math.floor(reParsed.sampleRate * 0.015));
    let startEnergy = 0;
    for (let i = 0; i < checkSamples; i++) {
      startEnergy += reParsed.samples[i] * reParsed.samples[i];
    }
    if (checkSamples > 0 && Math.sqrt(startEnergy / checkSamples) > 0.08) {
      speechStartClipped = true;
    }
  }

  let speechEndClipped = false;
  if (trailingSilenceMs < 25) {
    const checkSamples = Math.min(reParsed.samples.length, Math.floor(reParsed.sampleRate * 0.015));
    let endEnergy = 0;
    for (let i = 0; i < checkSamples; i++) {
      const s = reParsed.samples[reParsed.samples.length - 1 - i];
      endEnergy += s * s;
    }
    if (checkSamples > 0 && Math.sqrt(endEnergy / checkSamples) > 0.08) {
      speechEndClipped = true;
    }
  }

  const boundaryQcPass = (leadingSilenceMs <= maxLeadingSilenceMs) &&
                         (trailingSilenceMs <= maxTrailingSilenceMs) &&
                         !speechStartClipped &&
                         !speechEndClipped;

  return {
    refinedBuffer: outputBuffer,
    boundaryMetrics: {
      detected_start_ms: detectedStartMs,
      detected_end_ms: detectedEndMs,
      pre_roll_ms: preRollMs,
      post_roll_ms: postRollMs,
      final_start_ms: Math.round(finalStartMs),
      final_end_ms: Math.round(finalEndMs),
      leading_silence_ms: Math.round(leadingSilenceMs),
      trailing_silence_ms: Math.round(trailingSilenceMs),
      speech_start_clipped: speechStartClipped,
      speech_end_clipped: speechEndClipped,
      boundary_qc_pass: boundaryQcPass,
      was_trimmed: wasTrimmed,
      final_duration_seconds: Math.round(reParsed.durationSeconds * 1000) / 1000
    }
  };
}
