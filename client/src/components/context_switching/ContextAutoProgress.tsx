import React from 'react';
import { Pause, Play, RotateCcw, Download, Copy, CheckCircle2 } from 'lucide-react';
import { AutoJob } from '../../services/contextAutoApi';
import { contextLabEngineMeta } from '../../data/contextLabEngines';
import { ContextMasterAudioPlayer } from './ContextMasterAudioPlayer';

export const ContextAutoProgress: React.FC<{
  job: AutoJob; busy: boolean;
  onControl: (command: 'pause' | 'resume' | 'retry-analysis') => void;
}> = ({ job, busy, onControl }) => {
  const active = ['queued', 'running'].includes(job.status);
  const percent = job.totalParagraphs ? job.savedCount / job.totalParagraphs * 100 : 0;
  const current = job.batches.find(batch => ['generating', 'analyzing', 'selecting', 'saving', 'save_failed'].includes(batch.status));
  const reviewCount = job.batches.filter(batch => ['rejected', 'generation_failed'].includes(batch.status) || batch.pendingReview).length;
  return <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
      <div><strong>{job.status.replace(/_/g, ' ')}</strong><p style={{ color: '#94a3b8', fontSize: '.82rem' }}>{job.message}</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {active && <button className="btn btn-secondary" type="button" disabled={busy || job.pauseRequested} onClick={() => onControl('pause')}>
          <Pause size={14} />{job.pauseRequested ? 'Pause requested' : 'Pause after current tasks'}</button>}
        {job.status === 'paused' && <button className="btn btn-primary" type="button" disabled={busy} onClick={() => onControl('resume')}>
          <Play size={14} />Resume remaining work</button>}
        {!active && job.batches.some(batch => batch.status === 'rejected' && batch.masterUrl) &&
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => onControl('retry-analysis')}>
            <RotateCcw size={14} />Retry retained masters · 0 TTS calls</button>}
      </div>
    </div>
    {job.pipeline && <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.82rem', padding: '.7rem 0', color: '#93c5fd' }}>
      <span>Generation: {job.pipeline.generationState.replace(/_/g, ' ')}{job.pipeline.generatingGroup ? ` · group ${job.pipeline.generatingGroup}` : ''}</span>
      <span>Slicing: {job.pipeline.analysisState.replace(/_/g, ' ')}{job.pipeline.analyzingGroup ? ` · group ${job.pipeline.analyzingGroup}` : ''}</span>
      <span>{job.generatedGroups ?? 0}/{job.batches.length} masters generated</span>
      <span>{job.pipeline.waitingMasters}/{job.pipeline.backlogLimit} waiting for slicing</span>
    </div>}
    <a href="/api/context-auto/activity" target="_blank" rel="noreferrer" style={{ fontSize: '.78rem' }}>Persistent terminal progress log</a>
    <progress value={job.savedCount} max={job.totalParagraphs} style={{ width: '100%', height: 16 }} aria-label="Paragraphs saved" />
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.82rem', marginTop: '.6rem' }}>
      <span><CheckCircle2 size={13} /> {job.savedCount}/{job.totalParagraphs} saved ({percent.toFixed(0)}%)</span>
      <span>{job.completedGroups}/{job.batches.length} groups processed</span>
      <span>{reviewCount} group(s) need review</span>
      {current && <span style={{ color: '#93c5fd' }}>Group {current.number + 1}: {current.status.replace(/_/g, ' ')}</span>}
    </div>
    <p style={{ color: '#94a3b8', fontSize: '.75rem' }}>Reserved dataset indices {job.firstIndex}–{job.firstIndex + job.totalParagraphs - 1} ·
      {' '}{job.config.model} · {job.config.speaker1Voice} / {job.config.speaker2Voice}</p>
    {job.batches.some(batch => batch.status === 'generation_failed') && <p style={{ color: '#fbbf24', fontSize: '.8rem' }}>
      Failed or interrupted generation groups are skipped when you resume. They are never resent automatically; their text remains below.
    </p>}
    <div style={{ maxHeight: 680, overflow: 'auto' }}>
      {job.batches.map(batch => <details key={batch.number} style={{ padding: '.8rem 0', borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <summary style={{ cursor: 'pointer', fontSize: '.85rem' }}>
          Group {batch.number + 1} · paragraphs {batch.offset + 1}–{batch.offset + batch.paragraphs.length} ·
          {' '}{batch.status.replace(/_/g, ' ')} · {batch.saved.length}/{batch.paragraphs.length} saved
          {batch.selectedEngine && ` · ${contextLabEngineMeta(batch.selectedEngine).label}`}
        </summary>
        {batch.pendingReview && <p style={{ color: '#fbbf24', fontSize: '.8rem' }}>Saved with Pending review warnings in Dataset Manager.</p>}
        {batch.error && <p role="alert" style={{ color: '#fca5a5', fontSize: '.8rem' }}>{batch.error}</p>}
        {batch.selectionReason && <p style={{ fontSize: '.78rem', color: '#94a3b8' }}>{batch.selectionReason}</p>}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.6rem' }}>
          {batch.masterUrl && <a className="btn btn-secondary btn-sm" href={batch.masterUrl} download><Download size={12} />Master WAV</a>}
          {batch.diagnosticsUrl && <a className="btn btn-secondary btn-sm" href={batch.diagnosticsUrl} download><Download size={12} />All diagnostics</a>}
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => void navigator.clipboard.writeText(batch.paragraphs.join('\n\n'))}>
            <Copy size={12} />Copy group text for Lab</button>
        </div>
        {batch.masterUrl && <ContextMasterAudioPlayer masterAudioUrl={batch.masterUrl}
          speaker1Voice={job.config.speaker1Voice} speaker2Voice={job.config.speaker2Voice} />}
        {batch.methods && <table style={{ width: '100%', fontSize: '.75rem', marginTop: '.6rem' }}>
          <thead><tr><th align="left">Method</th><th align="left">Result</th><th align="right">Identity score</th></tr></thead>
          <tbody>{batch.methods.map(method => <tr key={method.engine}>
            <td>{contextLabEngineMeta(method.engine).label}</td><td title={method.error}>{method.success ? 'Accepted' : 'Rejected'}</td>
            <td align="right">{method.score?.toFixed(3) ?? '—'}</td>
          </tr>)}</tbody>
        </table>}
        <ol start={batch.offset + 1} style={{ fontSize: '.8rem', lineHeight: 1.6 }}>
          {batch.paragraphs.map((text, i) => <li key={i} dir="auto">{text}
            {batch.saved[i] && <a href={batch.saved[i].audioUrl} target="_blank" rel="noreferrer" style={{ marginInlineStart: '.5rem' }}>
              Saved #{batch.saved[i].index}</a>}</li>)}
        </ol>
      </details>)}
    </div>
  </div>;
};
