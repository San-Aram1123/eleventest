import { validateEngineResult } from '../alignment/localSpeakerBridge.js';
import { cleanLabParagraphs } from '../contextLabPrompt.js';

const NEURAL = ['speaker_embedding', 'speaker_resnet', 'speaker_eres2net', 'speaker_strict'];

export function selectBestEngine(result, paragraphs, options = {}) {
  const promptParagraphs = cleanLabParagraphs(paragraphs);
  const candidates = Object.entries(result.engineResults || {}).flatMap(([engine, item]) => {
    const checked = validateEngineResult(item, paragraphs.length, options, result.durationSeconds);
    if (!checked.success || !Array.isArray(item.clips) || item.clips.length !== paragraphs.length ||
        item.clips.some((clip, i) => (clip.text !== paragraphs[i] && clip.text !== promptParagraphs[i]) || !clip.audioUrl)) return [];
    if (engine !== 'speaker_consensus' && !NEURAL.includes(engine)) return [];
    const score = Number(item.diagnostics?.minConfidence || 0);
    return [{ engine, item, score, priority: engine === 'speaker_consensus' ? 3 : engine === 'speaker_strict' ? 1 : 2 }];
  });
  const neural = candidates.filter(candidate => NEURAL.includes(candidate.engine));
  const disagreements = [];
  for (let boundary = 0; boundary < paragraphs.length - 1; boundary++) {
    const cuts = neural.map(candidate => candidate.item.segments[boundary].end);
    if (cuts.length > 1 && Math.max(...cuts) - Math.min(...cuts) > .25) {
      disagreements.push({ boundary: boundary + 1, spreadMs: Math.round((Math.max(...cuts) - Math.min(...cuts)) * 1000),
        cuts: Object.fromEntries(neural.map(candidate => [candidate.engine, candidate.item.segments[boundary].end])) });
    }
  }
  candidates.sort((a, b) => b.priority - a.priority || b.score - a.score || a.engine.localeCompare(b.engine));
  const best = candidates[0];
  if (!best) throw new Error('No complete neural result passed automatic selection. Master retained for the Slicing Lab.');
  if (best.engine !== 'speaker_consensus' && best.score < (options.confidenceThreshold || .6)) {
    throw new Error('Best neural result has insufficient identity evidence for automatic saving.');
  }
  return { engine: best.engine, score: best.score, segments: best.item.segments,
    pendingReview: disagreements.length > 0, disagreements,
    reviewWarnings: disagreements.map(item => `Speaker boundary ${item.boundary}: accepted neural methods disagree by ${item.spreadMs} ms (over 250 ms). Listen and verify the cut.`),
    reason: best.engine === 'speaker_consensus' ? 'Three neural architectures share verified quiet handoffs.' :
      `Complete accepted neural result; ranked by refinement type and minimum identity score.${disagreements.length ? ' Saved pending human review of disputed cuts.' : ''}`,
    ranking: candidates.map(({ engine, score, priority }) => ({ engine, score, priority })) };
}

export function compactAnalysis(result) {
  return JSON.parse(JSON.stringify(result, (key, value) =>
    key === 'audioUrl' || key === 'masterAudioUrl' ? undefined : value));
}
