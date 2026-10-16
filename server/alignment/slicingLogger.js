/**
 * Slicing Engine Logger & Diagnostics Reporter
 * Prints structured, highly informative diagnostic breakdowns of all candidate
 * slicing engines (neural & acoustic) directly to CMD/terminal.
 */

function formatTime(sec) {
  if (typeof sec !== 'number' || !Number.isFinite(sec)) return '?';
  return `${sec.toFixed(2)}s`;
}

function extractSegments(item) {
  if (Array.isArray(item?.clips) && item.clips.length > 0) {
    return item.clips.map(c => ({ start: c.start, end: c.end, duration: c.duration }));
  }
  if (Array.isArray(item?.segments) && item.segments.length > 0) {
    return item.segments.map(s => ({
      start: s.start,
      end: s.end,
      duration: s.duration ?? (s.end - s.start)
    }));
  }
  if (Array.isArray(item?.rawSegments) && item.rawSegments.length > 0) {
    return item.rawSegments.map(s => ({
      start: s.start,
      end: s.end,
      duration: s.duration ?? (s.end - s.start)
    }));
  }
  if (Array.isArray(item?.boundaries) && item.boundaries.length > 0) {
    const list = [];
    let prev = 0;
    for (const b of item.boundaries) {
      const cut = typeof b === 'number' ? b : (b?.midpoint ?? b?.end ?? 0);
      list.push({ start: prev, end: cut, duration: cut - prev });
      prev = cut;
    }
    return list;
  }
  return [];
}

export function logSlicingReport({
  title = 'Slicing Engine Diagnostic Evaluation',
  provider = 'Gemini 3.8',
  masterPath = '',
  duration = 0,
  expectedCount = 6,
  engineResults = {},
  selection = null,
  failureError = null
}) {
  const engines = Object.entries(engineResults || {});
  const total = engines.length;
  const sep = '='.repeat(80);
  const thinSep = '-'.repeat(80);

  console.log(`\n${sep}`);
  console.log(`🔍 [${title}]`);
  console.log(`   Provider: ${provider} | Audio Duration: ${formatTime(duration)} | Target Clips: ${expectedCount}`);
  if (masterPath) console.log(`   Master File: ${masterPath}`);
  console.log(thinSep);
  console.log(`📋 Candidate Engines Evaluated (${total} total):`);

  let acceptedCount = 0;

  engines.forEach(([name, item], idx) => {
    const isAccepted = item.success === true;
    if (isAccepted) acceptedCount++;
    const icon = isAccepted ? '✅' : '❌';
    const status = isAccepted ? 'ACCEPTED' : 'REJECTED';
    const num = `[${idx + 1}/${total}]`;

    const score = item.diagnostics?.minConfidence ?? item.confidence;
    const scoreStr = typeof score === 'number' ? ` | Confidence: ${score.toFixed(3)}` : '';
    const elapsed = item.diagnostics?.elapsedMs ? ` | Elapsed: ${item.diagnostics.elapsedMs}ms` : '';

    console.log(`\n ${icon} ${num} Engine: "${name}" -> ${status}${scoreStr}${elapsed}`);

    const segs = extractSegments(item);
    if (segs.length > 0) {
      const cuts = segs.slice(0, -1).map(s => formatTime(s.end)).join(', ');
      const durations = segs.map(s => formatTime(s.duration)).join(', ');
      const minD = Math.min(...segs.map(s => s.duration));
      const maxD = Math.max(...segs.map(s => s.duration));

      console.log(`      • Segment count : ${segs.length}/${expectedCount} ${segs.length === expectedCount ? '✓' : '⚠️ MISMATCH'}`);
      if (cuts) console.log(`      • Boundary cuts : [${cuts}]`);
      console.log(`      • Clip durations: [${durations}] (min: ${formatTime(minD)}, max: ${formatTime(maxD)})`);
    } else {
      console.log(`      • Segment count : 0/${expectedCount} (No boundary segments resolved)`);
    }

    if (!isAccepted) {
      const reason = item.error || item.diagnostics?.error || 'Rejected by safety/continuity gates.';
      console.log(`      • Rejection Reason: ${reason}`);
    } else {
      console.log(`      • Validation: All safety checks passed (monotonic, contiguous, duration safe).`);
    }
  });

  console.log(`\n${thinSep}`);

  if (selection && selection.engine) {
    const winnerScore = typeof selection.score === 'number' ? ` (Score: ${selection.score.toFixed(3)})` : '';
    console.log(`🏆 WINNING ENGINE: "${selection.engine}"${winnerScore}`);
    console.log(`   • Priority Rank  : ${selection.ranking?.find(r => r.engine === selection.engine)?.priority ?? 'N/A'}`);
    console.log(`   • Selection Reason: ${selection.reason || 'Optimal engine by ranking score.'}`);

    if (Array.isArray(selection.disagreements) && selection.disagreements.length > 0) {
      console.log(`   ⚠️ Disagreements : ${selection.disagreements.length} boundaries have > 250ms spread between neural models`);
      selection.disagreements.forEach(d => {
        console.log(`      - Boundary #${d.boundary}: spread ${d.spreadMs}ms (cuts: ${JSON.stringify(d.cuts)})`);
      });
    }
  } else {
    console.log(`❌ SLICING FAILED: 0 of ${total} engines produced a valid, safe segmentation.`);
    if (failureError) console.log(`   • Failure Message : ${failureError}`);
    console.log(`   • Safe Policy     : Master retained for inspection. 1:1 fallback is strictly forbidden.`);
  }

  console.log(`${sep}\n`);
}

export function formatSlicingFailureSummary(engineResults = {}) {
  const entries = Object.entries(engineResults);
  if (entries.length === 0) return 'No slicing engines evaluated';
  return entries.map(([engine, res]) => {
    const err = res.error || (res.success ? 'passed' : 'failed validation');
    return `${engine}: ${err}`;
  }).join(' | ');
}

