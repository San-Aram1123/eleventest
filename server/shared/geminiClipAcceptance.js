export const GEMINI_CLIP_MIN_SECONDS = 6;
export const GEMINI_CLIP_MAX_SECONDS = 16;

function boundaryTimes(method, expectedCount) {
  const diagnostics = method?.diagnostics || {};
  const boundaries = Array.isArray(diagnostics.proposedBoundaries) ? diagnostics.proposedBoundaries
    : Array.isArray(method?.boundaries) ? method.boundaries : null;
  if (boundaries?.length === expectedCount - 1) {
    return boundaries.map(item => Number(typeof item === 'number' ? item : (item?.midpoint ?? item?.coarse)));
  }
  if (Array.isArray(diagnostics.coarseBoundaries) && diagnostics.coarseBoundaries.length === expectedCount - 1) {
    return diagnostics.coarseBoundaries.map(Number);
  }
  if (Array.isArray(diagnostics.modelCuts) && diagnostics.modelCuts.length === expectedCount - 1) {
    return diagnostics.modelCuts.map(Number);
  }
  const segments = method?.segments?.length === expectedCount ? method.segments
    : method?.rawSegments?.length === expectedCount ? method.rawSegments : null;
  return segments ? segments.slice(0, -1).map(segment => Number(segment.end)) : null;
}

/** Gemini Dual Pilot acceptance: exact expected clip count and every clip in [6, 16] seconds. */
export function evaluateGeminiClipAcceptance(method, expectedCount, totalDuration) {
  if (!Number.isSafeInteger(expectedCount) || expectedCount < 1 || !Number.isFinite(totalDuration) || totalDuration <= 0) {
    return { accepted: false, segments: [], reason: 'Invalid expected clip count or master duration.' };
  }
  const cuts = boundaryTimes(method, expectedCount);
  if (!cuts || cuts.length !== expectedCount - 1 || cuts.some(time => !Number.isFinite(time))) {
    return { accepted: false, segments: [], reason: `Could not form exactly ${expectedCount} ordered clips from this method's boundaries.` };
  }
  const points = [0, ...cuts, totalDuration];
  if (points.some((point, index) => index > 0 && point <= points[index - 1])) {
    return { accepted: false, segments: [], reason: 'Proposed boundaries are crossed or duplicated; clips cannot be ordered.' };
  }
  const segments = points.slice(1).map((end, index) => ({ index: index + 1, start: points[index], end, duration: end - points[index] }));
  const invalid = segments.filter(segment => segment.duration < GEMINI_CLIP_MIN_SECONDS || segment.duration > GEMINI_CLIP_MAX_SECONDS);
  if (invalid.length) {
    return { accepted: false, segments, reason: `Clip duration policy failed for ${invalid.map(segment => `#${segment.index} (${segment.duration.toFixed(2)}s)`).join(', ')}; required range is 6.00–16.00 seconds.` };
  }
  return { accepted: true, segments, reason: `Exactly ${expectedCount} clips; every clip is within 6.00–16.00 seconds.` };
}
