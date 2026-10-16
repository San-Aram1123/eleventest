import React, { useRef, useState } from 'react';
import { Activity, Play, Square } from 'lucide-react';
import { V20_ALL_50_EMOTIONS } from './v20Conditions';

type Experiment = { name: string; success: boolean; status?: string; description?: string; error?: string; originalStrictRejection?: string; acceptanceReason?: string; segments?: Array<{start:number;end:number}>; boundaries?: unknown[]; diagnostics?: Record<string, unknown> };
type HybridPlan = { success: boolean; status: string; error?: string; boundaries: ProposedBoundary[]; segments: Array<{index:number;start:number;end:number;duration:number;paragraph:string;speakerTurn:string;startSource:string;endSource:string}> };
type EventItem = { stage: string; detail?: string; at?: string; result?: { success: boolean; acceptance?: { accepted: boolean; method: string | null; reason: string }; durationSeconds: number; masterAudioUrl: string; expectedCount: number; baselines: Experiment[]; experiments: Experiment[]; hybrid: HybridPlan } };
type ProposedBoundary = { boundary?: number; midpoint?: number; coarse?: number; start?: number; end?: number; accepted?: boolean; status?: string; source?: string; score?: number; reviewRequired?: boolean; reason?: string; quietRunSeconds?: number; localEnergyRatio?: number; alternatives?: ProposedBoundary[]; candidates?: Array<{ midpoint?: number; start?: number; end?: number; accepted?: boolean; quietRunSeconds?: number; sideMargins?: number[] }> };

function methodBoundaries(method: Experiment): ProposedBoundary[] {
  const diagnostics = method.diagnostics || {};
  const proposed = diagnostics.proposedBoundaries;
  if (Array.isArray(proposed)) return proposed as ProposedBoundary[];
  if (Array.isArray(diagnostics.modelCuts)) {
    return diagnostics.modelCuts.filter((point): point is number => typeof point === 'number')
      .map(midpoint => ({ midpoint, accepted: false, reason: 'Model-specific disputed proposal' }));
  }
  if (Array.isArray(diagnostics.coarseBoundaries)) {
    return diagnostics.coarseBoundaries.filter((point): point is number => typeof point === 'number')
      .map(coarse => ({ coarse, midpoint: coarse, accepted: false, reason: 'Coarse boundary; refinement did not finish' }));
  }
  return Array.isArray(method.boundaries) ? method.boundaries as ProposedBoundary[] : [];
}

function proposedSegments(method: Experiment, duration: number) {
  if (method.segments?.length) return method.segments.map((segment, index) => ({ index: index + 1, start: segment.start, end: segment.end }));
  const points = methodBoundaries(method).map(item => item.midpoint ?? item.coarse)
    .filter((point): point is number => typeof point === 'number' && Number.isFinite(point) && point > 0 && point < duration)
    .sort((a, b) => a - b).filter((point, index, all) => !index || point - all[index - 1] > 0.02);
  return [0, ...points, duration].slice(1).map((end, index, all) => ({ index: index + 1, start: [0, ...points][index], end }));
}

interface Props {
  paragraphs: string[];
  femaleVoice: string;
  maleVoice: string;
  emotion: string;
  language: string;
  dialect: string;
  disabled?: boolean;
}

export const DualPilotEmotionExperiment: React.FC<Props> = props => {
  const [active, setActive] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [result, setResult] = useState<EventItem['result']>();
  const [emotion, setEmotion] = useState(props.emotion);
  const [intensity, setIntensity] = useState(0.8);
  const controller = useRef<AbortController | null>(null);
  const masterPlayer = useRef<HTMLAudioElement | null>(null);
  const auditionEnd = useRef<number | null>(null);
  const [auditioning, setAuditioning] = useState<string | null>(null);
  const resultAcceptance = result?.acceptance || {
    accepted: Boolean(result?.success), method: null,
    reason: 'Acceptance details were not included in this server response.'
  };

  const stop = () => controller.current?.abort();
  const playSegment = (method: Experiment, start: number, end: number) => {
    const player = masterPlayer.current;
    if (!player) return;
    player.currentTime = start;
    auditionEnd.current = end;
    setAuditioning(`${method.name}:${start.toFixed(2)}`);
    void player.play().catch(() => setAuditioning(null));
  };
  const renderMethod = (item: Experiment, key: string, label: string) => {
    const boundaries = methodBoundaries(item);
    const segments = result ? proposedSegments(item, result.durationSeconds) : [];
    return <details key={key} style={{ background: '#0B1220', padding: '.55rem .7rem', borderRadius: 6, marginTop: '.4rem' }}>
      <summary style={{ cursor: 'pointer', color: item.success ? '#6EE7B7' : '#FDA4AF' }}>{label}{item.name} · {item.status || (item.success ? 'Accepted' : 'Rejected')}{item.error ? ` — ${item.error}` : ''}</summary>
      <p style={{ color: '#94A3B8', fontSize: '.76rem', margin: '.45rem 0' }}>These are {item.success ? 'accepted by the Gemini clip policy' : 'proposed, unverified'} cuts. Acceptance requires exactly the expected number of clips and every clip to be 6–16 seconds inclusive. Auditioning plays the corresponding range from the master; it does not create or save a clip.</p>
      {item.originalStrictRejection && <p style={{ color: '#FCD34D', fontSize: '.76rem', margin: '.35rem 0' }}>Passed the clip count/duration policy despite the original acoustic gate: {item.originalStrictRejection}</p>}
      {segments.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '.35rem', marginBottom: '.55rem' }}>
        {segments.map(segment => <div key={segment.index} style={{ border: '1px solid #334155', borderRadius: 6, padding: '.45rem' }}>
          <button type="button" className="btn btn-secondary btn-xs" onClick={() => playSegment(item, segment.start, segment.end)}>
            <Play size={12}/> {auditioning === `${item.name}:${segment.start.toFixed(2)}` ? 'Playing' : `Play cut ${segment.index}`} · {segment.start.toFixed(2)}–{segment.end.toFixed(2)}s
          </button>
          <p dir="auto" style={{ fontSize: '.8rem', color: '#E2E8F0', margin: '.4rem 0 0', lineHeight: 1.5 }}><b>Paragraph {segment.index}:</b> {props.paragraphs[segment.index - 1] || 'No matching paragraph text.'}</p>
        </div>)}
      </div>}
      {boundaries.length > 0 && <div style={{ overflowX: 'auto', marginBottom: '.55rem' }}><table style={{ width: '100%', fontSize: '.73rem', borderCollapse: 'collapse' }}>
        <thead><tr><th align="left">Handoff</th><th align="left">Coarse → proposed</th><th align="left">Quiet run</th><th align="left">Source / score</th><th align="left">Status / reason</th></tr></thead>
        <tbody>{boundaries.map((boundary, index) => <tr key={index}>
          <td style={{ padding: '.25rem' }}>{index + 1}</td>
          <td style={{ padding: '.25rem' }}>{boundary.coarse?.toFixed(3) ?? '—'} → {(boundary.midpoint ?? boundary.coarse)?.toFixed(3) ?? '—'}s</td>
          <td style={{ padding: '.25rem' }}>{boundary.quietRunSeconds === undefined ? '—' : `${(boundary.quietRunSeconds * 1000).toFixed(0)} ms`}</td>
          <td style={{ padding: '.25rem' }}>{boundary.source || '—'}{boundary.score === undefined ? '' : ` · ${boundary.score.toFixed(2)}`}</td>
          <td style={{ padding: '.25rem', color: boundary.accepted || boundary.status === 'supported' ? '#6EE7B7' : '#FDA4AF' }}>{boundary.reason || boundary.status || (boundary.accepted ? 'accepted' : 'rejected / review candidates')}</td>
        </tr>)}</tbody>
      </table></div>}
      {item.description && <p style={{ color: '#94A3B8', margin: '.4rem 0' }}>{item.description}</p>}
      <details><summary style={{ cursor: 'pointer', fontSize: '.75rem' }}>Full diagnostics JSON</summary><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: '.72rem', margin: '.4rem 0 0' }}>{JSON.stringify({ boundaries, segments: item.segments, diagnostics: item.diagnostics }, null, 2)}</pre></details>
    </details>;
  };
  const run = async () => {
    if (props.paragraphs.length < 2 || props.paragraphs.length > 12) return;
    const abort = new AbortController(); controller.current = abort;
    setActive(true); setResult(undefined); setEvents([]);
    try {
      const response = await fetch('/api/dual-pilot/gemini-emotion-experiment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abort.signal,
        body: JSON.stringify({ paragraphs: props.paragraphs, femaleVoice: props.femaleVoice,
          maleVoice: props.maleVoice, emotion, intensity,
          language: props.language, dialect: props.dialect })
      });
      if (!response.ok || !response.body) throw new Error(`Experiment request failed (${response.status}).`);
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
      while (true) {
        const { done, value } = await reader.read(); buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const frames = buffer.split('\n\n'); buffer = frames.pop() || '';
        for (const frame of frames) {
          const data = frame.split('\n').find(line => line.startsWith('data: '))?.slice(6);
          if (!data) continue;
          const item: EventItem = JSON.parse(data);
          if (item.stage === 'result') setResult(item.result);
          else setEvents(previous => [...previous, item]);
        }
        if (done) break;
      }
    } catch (error) {
      if (!abort.signal.aborted) setEvents(previous => [...previous, { stage: 'error', detail: error instanceof Error ? error.message : String(error) }]);
    } finally { setActive(false); controller.current = null; }
  };

  return <section className="glass-card" style={{ padding: '1rem', margin: '1rem 0', borderColor: '#A78BFA55' }}>
    <h3 style={{ margin: '0 0 .35rem', color: '#DDD6FE', display: 'flex', alignItems: 'center', gap: '.5rem' }}><Activity size={17}/> Gemini Emotion-aware Slicing Experiments</h3>
    <p style={{ color: '#94A3B8', fontSize: '.82rem', margin: '0 0 .8rem' }}>Runs three new experimental methods on one fresh Gemini master. It does not call ElevenLabs or save clips to the dataset. Existing slicing results remain unchanged.</p>
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.65rem', marginBottom: '.75rem', fontSize: '.8rem' }}>
      <label>Emotion <select value={emotion} onChange={event => setEmotion(event.target.value)} disabled={active || props.disabled}>
        {V20_ALL_50_EMOTIONS.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}
      </select></label>
      <label>Intensity {intensity.toFixed(1)} <input type="range" min="0.2" max="1" step="0.1" value={intensity} onChange={event => setIntensity(Number(event.target.value))} disabled={active || props.disabled}/></label>
    </div>
    {!active ? <button className="btn btn-secondary btn-sm" disabled={props.disabled || props.paragraphs.length < 2 || props.paragraphs.length > 12} onClick={run}><Play size={14}/> Run experiment ({props.paragraphs.length} turns)</button>
      : <button className="btn btn-danger btn-sm" onClick={stop}><Square size={14}/> Cancel experiment</button>}
    {(events.length > 0 || result) && <div style={{ marginTop: '.8rem' }}>
      <strong style={{ fontSize: '.8rem' }}>Live progress</strong>
      <ol style={{ margin: '.4rem 0', paddingLeft: '1.4rem', fontSize: '.78rem', color: '#CBD5E1' }}>{events.map((item, i) => <li key={`${i}-${item.stage}`}><b>{item.stage}</b>{item.detail ? ` — ${item.detail}` : ''}</li>)}</ol>
      {result && <div style={{ fontSize: '.8rem', color: resultAcceptance.accepted ? '#6EE7B7' : '#FDA4AF', margin: '.5rem 0' }}><b>{resultAcceptance.accepted ? 'Accepted' : 'Rejected'} by Gemini clip policy</b> · {resultAcceptance.method || 'method details unavailable'} · {resultAcceptance.reason}<br/><span style={{ color: '#CBD5E1' }}>Gemini master: {result.durationSeconds.toFixed(2)}s · {result.expectedCount} expected turns · each clip must be 6–16s inclusive</span></div>}
      {result?.masterAudioUrl && <audio ref={masterPlayer} controls preload="none" src={result.masterAudioUrl} onTimeUpdate={event => {
        if (auditionEnd.current !== null && event.currentTarget.currentTime >= auditionEnd.current) {
          event.currentTarget.pause(); auditionEnd.current = null; setAuditioning(null);
        }
      }} onPause={() => { auditionEnd.current = null; setAuditioning(null); }} style={{ width: '100%', marginBottom: '.6rem' }}/>}
      {result?.hybrid && <>
        <div style={{ border: '1px solid #34D39966', borderRadius: 8, padding: '.65rem .8rem', margin: '.55rem 0', background: '#064E3B22' }}>
          <strong style={{ color: '#6EE7B7' }}>Combined result: {result.hybrid.status.replace('_', ' ')} · {result.hybrid.boundaries.length}/{result.expectedCount - 1} handoffs assembled</strong>
          <div style={{ color: '#A7F3D0', fontSize: '.76rem', marginTop: '.25rem' }}>This is the per-cut mixed-method result. Every method contributes its boundary proposals even when that method fails as a complete set; the hybrid selects a compatible source separately for each handoff. Gemini acceptance still requires the expected clip count and 6–16 seconds per clip.</div>
        </div>
        {renderMethod({ name: 'Per-boundary hybrid', success: result.hybrid.success,
          status: result.hybrid.status === 'pending_review' ? 'Assembled · pending review' : result.hybrid.status,
          error: result.hybrid.error, segments: result.hybrid.segments, boundaries: result.hybrid.boundaries,
          diagnostics: { minSegmentSeconds: result.hybrid.segments.length ? Math.min(...result.hybrid.segments.map(s => s.duration)) : undefined,
            selectedFrom: 'Each handoff is selected independently from all original and experimental method proposals.' } }, 'hybrid', 'Hybrid · ')}
      </>}
      {result && <div style={{ fontSize: '.8rem', color: '#CBD5E1', margin: '.9rem 0 .35rem' }}><b>Individual method diagnostics</b> · each slicer is evaluated by the Gemini clip count/duration policy; proposals from rejected methods are still eligible for the combined result.</div>}
      {result?.baselines.map(item => renderMethod(item, `base-${item.name}`, 'Existing · '))}
      {result?.experiments.map(item => renderMethod(item, `exp-${item.name}`, 'New · '))}
    </div>}
  </section>;
};
