import React from 'react';
import { Play, Plus, Workflow, RotateCcw } from 'lucide-react';
import { isAutoJobFinished } from '../../services/contextAutoStorage';
import { Sample } from '../../types';
import { extractParagraphsArray } from '../../data/contextSwitchingPresets';
import { useContextAutoRunner } from './useContextAutoRunner';
import { ContextLabInputCard } from './ContextLabInputCard';
import { ContextSpeakerFields } from './ContextSpeakerFields';
import { ContextAutoProgress } from './ContextAutoProgress';

export const ContextAutoTab: React.FC<{ onSampleCreated: (sample: Sample) => void }> = ({ onSampleCreated }) => {
  const runner = useContextAutoRunner(onSampleCreated);
  const { draft, job, history, busy, error, pending } = runner;
  const paragraphs = extractParagraphsArray(draft.text);
  const locked = Boolean(job || pending || busy);
  const finished = isAutoJobFinished(job?.status);
  const shown = job ? { ...job.config, text: job.paragraphs.join('\n\n') } : pending ?
    { ...pending, text: pending.paragraphs.join('\n\n') } : draft;
  return <div>
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><Workflow size={18} />Automatic speaker slicing</strong>
        <button className="btn btn-secondary btn-sm" type="button" onClick={runner.newJob}
          disabled={busy || Boolean(pending && !(finished && pending.id === job?.id))}>
          {finished ? <RotateCcw size={13} /> : <Plus size={13} />}{finished ? 'Clear finished job / new batch' : 'New job'}</button>
      </div>
      <p style={{ fontSize: '.83rem', color: '#94a3b8', lineHeight: 1.6 }}>
        Every six paragraphs become one Gemini master. Generation continues while the previous master is sliced with all seven methods and saved to Dataset Manager.
        The final group uses the remaining paragraphs. Keys rotate through your enabled project pool.
      </p>
      <p style={{ fontSize: '.78rem', color: '#93c5fd' }}>
        Refresh or close this tab freely: the server keeps working. Masters and checkpoints survive a server restart; resume from job history.
        The server must remain running for processing to continue.
        {' '}Up to three masters wait for slicing; the queue slows generation automatically when full.
      </p>
      <ContextSpeakerFields speaker1Voice={shown.speaker1Voice} speaker2Voice={shown.speaker2Voice} disabled={locked}
        onChangeSpeaker1={value => runner.setDraft(previous => ({ ...previous, speaker1Voice: value }))}
        onChangeSpeaker2={value => runner.setDraft(previous => ({ ...previous, speaker2Voice: value }))} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.7rem' }}>
        <label style={{ fontSize: '.8rem' }}>TTS model
          <select className="form-select" style={{ display: 'block', width: '100%' }} value={shown.model} disabled={locked}
            onChange={event => runner.setDraft(previous => ({ ...previous, model: event.target.value }))}>
            <option value="gemini-3.8-flash-tts">Gemini 3.8 Flash TTS</option>
            <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS Preview</option>
          </select>
        </label>
        <label style={{ fontSize: '.8rem' }}>Kurdish dialect
          <select className="form-select" style={{ display: 'block', width: '100%' }} value={shown.dialect} disabled={locked}
            onChange={event => runner.setDraft(previous => ({ ...previous, dialect: event.target.value }))}>
            <option value="sorani">Sorani</option><option value="badini">Badini</option>
          </select>
        </label>
        <label style={{ fontSize: '.8rem' }}>Minimum identity score (uncalibrated)
          <input className="form-control" type="number" min={.5} max={1} step={.05} value={shown.options.confidenceThreshold ?? .6}
            disabled={locked} style={{ display: 'block', width: '100%' }} onChange={event => runner.setDraft(previous => ({ ...previous,
              options: { ...previous.options, confidenceThreshold: Number(event.target.value) } }))} />
        </label>
      </div>
      <p style={{ fontSize: '.76rem', color: '#94a3b8', marginBottom: 0 }}>
        Consensus is preferred. Other accepted neural methods are ranked by refinement and identity evidence; major disagreement saves the chosen clips with Pending review warnings.
        Indices are reserved automatically. No clips from a rejected group are saved.
      </p>
    </div>
    <ContextLabInputCard automated text={shown.text} onChangeText={text => runner.setDraft(previous => ({ ...previous, text }))}
      speaker1Voice={shown.speaker1Voice} speaker2Voice={shown.speaker2Voice} paragraphCount={extractParagraphsArray(shown.text).length} isBatchActive={locked} />
    {!job && <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <button className="btn btn-primary" type="button" disabled={busy || (!pending && (!paragraphs.length || draft.speaker1Voice === draft.speaker2Voice))}
        onClick={() => void runner.start()}><Play size={15} />{busy ? 'Checking models and creating job…' : pending ? 'Reconnect / retry same submission' : 'Start automatic batch'}</button>
      <span style={{ color: '#94a3b8', fontSize: '.8rem' }}>{Math.ceil((pending?.paragraphs.length || paragraphs.length) / 6)} master group(s) · automatic dataset saves</span>
    </div>}
    {error && <p role="alert" style={{ color: '#fca5a5', fontSize: '.83rem' }}>{error}</p>}
    {job && <ContextAutoProgress job={job} busy={busy} onControl={command => void runner.control(command)} />}
    <div className="glass-card" style={{ padding: '1rem' }}>
      <strong>Saved job history</strong>
      {!history.length && <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Submitted jobs appear here and survive refreshes.</p>}
      {history.map(item => <button key={item.id} className="btn btn-secondary btn-sm" type="button" disabled={busy || Boolean(pending)}
        onClick={() => runner.open(item.id)} style={{ display: 'block', marginTop: '.5rem', textAlign: 'left', width: '100%' }}>
        {new Date(item.createdAt).toLocaleString()} · {item.savedCount}/{item.totalParagraphs} saved · {item.status.replace(/_/g, ' ')}
      </button>)}
    </div>
  </div>;
};
