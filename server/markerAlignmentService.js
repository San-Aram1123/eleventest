import {
  detectMarkerSegments,
  detectKurdishBoundarySegments,
  detectViaWhisper
} from './alignment/whisperBridge.js';
import { detectViaSilence } from './alignment/silenceDetector.js';
import { sliceAudioBySegments } from './alignment/audioSlicer.js';

// Re-exports for 100% backward compatibility
export {
  detectMarkerSegments,
  detectKurdishBoundarySegments,
  sliceAudioBySegments
};

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
