/** Per-handoff test-only selector. It deliberately allows reviewable candidates from rejected methods. */
function methodBoundaryList(method) {
  const diagnostics = method.diagnostics || {};
  if (Array.isArray(method.boundaries) && method.boundaries.length) return method.boundaries;
  if (Array.isArray(diagnostics.proposedBoundaries)) return diagnostics.proposedBoundaries;
  if (Array.isArray(diagnostics.modelCuts)) return diagnostics.modelCuts.map(midpoint => ({ midpoint }));
  if (Array.isArray(diagnostics.coarseBoundaries)) return diagnostics.coarseBoundaries.map(midpoint => ({ midpoint }));
  return [];
}

function bounded(value, low = 0, high = 1) { return Math.max(low, Math.min(high, value)); }

function scoreCandidate(candidate, method) {
  const quietMs = Number(candidate.quietRunSeconds || 0) * 1000;
  const energy = Number(candidate.localEnergyRatio ?? 1);
  const margins = candidate.sideMargins;
  const minMargin = Array.isArray(margins) && margins.length ? Math.min(...margins) : null;
  const identityConfidence = candidate.identityEvidence?.confidence;
  let score = 0.2;
  if (Number.isFinite(identityConfidence)) score = Math.max(score, 0.35 + 0.4 * bounded(identityConfidence));
  if (minMargin !== null && Number.isFinite(minMargin)) score = Math.max(score, 0.3 + 0.5 * bounded((minMargin + 0.1) / 0.6));
  if (candidate.accepted) score = Math.max(score, 0.84);
  // Relax the 60 ms check only for the hybrid experiment: 30 ms plus low local energy is reviewable.
  if (quietMs >= 30 && energy <= 0.3) score = Math.max(score, 0.43 + 0.25 * bounded((quietMs - 30) / 60));
  if (quietMs >= 60 && energy <= 0.3) score = Math.max(score, 0.78);
  return { score: bounded(score), quietMs, energy, minMargin, source: method.name };
}

function collectCandidates(methods, count, duration) {
  const byBoundary = Array.from({ length: count - 1 }, () => []);
  for (const method of methods) {
    const boundaries = methodBoundaryList(method);
    boundaries.forEach((boundary, index) => {
      const add = candidate => {
        const time = Number(candidate.midpoint ?? candidate.coarse);
        if (!Number.isFinite(time) || time <= 0.2 || time >= duration - 0.2) return;
        const evidence = scoreCandidate(candidate, method);
        byBoundary[index]?.push({ time, ...evidence, accepted: Boolean(candidate.accepted),
          reason: candidate.reason || (candidate.accepted ? 'Method accepted this handoff' : 'Candidate retained for manual review') });
      };
      add(boundary);
      for (const candidate of (Array.isArray(boundary.candidates) ? boundary.candidates : [])) add(candidate);
    });
  }
  return byBoundary.map(candidates => {
    const merged = new Map();
    for (const candidate of candidates) {
      const key = Math.round(candidate.time * 100);
      const current = merged.get(key);
      if (!current) merged.set(key, { ...candidate, sources: [candidate.source] });
      else {
        if (!current.sources.includes(candidate.source)) current.sources.push(candidate.source);
        if (candidate.score > current.score || (candidate.accepted && !current.accepted)) {
          current.reason = candidate.reason;
          current.source = candidate.source;
        }
        current.score = Math.max(current.score, candidate.score) + 0.025;
        current.accepted ||= candidate.accepted;
        current.quietMs = Math.max(current.quietMs, candidate.quietMs);
      }
    }
    return [...merged.values()].map(candidate => ({ ...candidate, score: bounded(candidate.score) }))
      .sort((a, b) => b.score - a.score);
  });
}

function chooseOrderedPath(candidates, duration, minDuration, maxDuration) {
  const average = duration / (candidates.length + 1);
  let states = candidates[0].map(candidate => ({ path: [candidate], score: candidate.score }));
  for (let boundary = 1; boundary < candidates.length; boundary++) {
    const next = [];
    for (const candidate of candidates[boundary]) {
      let best = null;
      for (const state of states) {
        const previous = state.path[state.path.length - 1];
        const segmentLength = candidate.time - previous.time;
        if (segmentLength < minDuration || segmentLength > maxDuration) continue;
        const balanceCost = Math.abs(Math.log(Math.max(segmentLength, 0.01) / average)) * 0.035;
        const score = state.score + candidate.score - balanceCost;
        if (!best || score > best.score) best = { path: [...state.path, candidate], score };
      }
      if (best) next.push(best);
    }
    states = next;
    if (!states.length) return null;
  }
  return states.filter(state => duration - state.path.at(-1).time >= minDuration &&
    duration - state.path.at(-1).time <= maxDuration)
    .sort((a, b) => b.score - a.score)[0] || null;
}

export function buildHybridCutPlan(methods, count, duration, paragraphs = []) {
  const candidates = collectCandidates(methods, count, duration);
  const empty = candidates.findIndex(items => !items.length);
  if (empty !== -1) return { success: false, status: 'needs_review', error: `No method proposed boundary ${empty + 1}.`, boundaries: candidates.map((items, index) => ({ boundary: index + 1, alternatives: items.slice(0, 8) })), segments: [] };
  const average = duration / count;
  // Prefer paths matching the Gemini clip-duration policy; retain a short-turn proposal only for review.
  const selected = chooseOrderedPath(candidates, duration, 6, 16) ||
    chooseOrderedPath(candidates, duration, 0.35, duration);
  if (!selected) return { success: false, status: 'needs_review', error: 'Proposals could not form an ordered set of turns at least 350 ms long.', boundaries: candidates.map((items, index) => ({ boundary: index + 1, alternatives: items.slice(0, 8) })), segments: [] };
  const points = [0, ...selected.path.map(item => item.time), duration];
  const boundaries = selected.path.map((item, index) => ({
    boundary: index + 1, midpoint: item.time, source: item.sources.join(' + '), score: Number(item.score.toFixed(3)),
    status: item.accepted || (item.quietMs >= 30 && item.energy <= 0.3 && item.score >= 0.62) ||
      (item.sources.length >= 2 && item.score >= 0.68) ? 'supported' : 'pending_review',
    reviewRequired: !(item.accepted || (item.quietMs >= 30 && item.energy <= 0.3 && item.score >= 0.62) ||
      (item.sources.length >= 2 && item.score >= 0.68)),
    quietRunMs: Math.round(item.quietMs), localEnergyRatio: Number(item.energy.toFixed(4)),
    reason: item.reason, alternatives: candidates[index].slice(0, 8)
  }));
  const segments = points.slice(1).map((end, index) => ({ index: index + 1, start: points[index], end,
    duration: end - points[index], paragraph: paragraphs[index] || '', speakerTurn: index % 2 ? 'Speaker2' : 'Speaker1',
    startSource: index ? boundaries[index - 1].source : 'master start',
    endSource: index < boundaries.length ? boundaries[index].source : 'master end' }));
  return { success: true, status: boundaries.some(item => item.reviewRequired) ? 'pending_review' : 'supported',
    minSegmentSeconds: Math.min(...segments.map(segment => segment.duration)), averageSegmentSeconds: average,
    boundaries, segments };
}
