import React from 'react';
import { FileAudio, RotateCcw } from 'lucide-react';
import { LabAnalysisOptions } from '../../services/contextSwitchingApi';
import { LabMasterSource } from '../../services/contextLabUtils';

interface ContextLabSourceCardProps {
  source: LabMasterSource;
  onChangeSource: (source: LabMasterSource) => void;
  masterFile: File | null;
  onChangeMaster: (file: File | null) => void;
  reference1: File | null;
  reference2: File | null;
  onChangeReference1: (file: File | null) => void;
  onChangeReference2: (file: File | null) => void;
  hasReusableMaster: boolean;
  options: LabAnalysisOptions;
  onChangeOptions: (options: LabAnalysisOptions) => void;
  expectedBoundaries: string;
  onChangeExpectedBoundaries: (value: string) => void;
  isActive: boolean;
}

export const ContextLabSourceCard: React.FC<ContextLabSourceCardProps> = (props) => {
  const sources: Array<{ id: LabMasterSource; label: string; detail: string }> = [
    { id: 'upload', label: 'Analyze uploaded WAV', detail: 'Local analysis. No TTS request.' },
    { id: 'reuse', label: 'Reuse last master', detail: 'Compare methods on the exact same audio and script.' },
    { id: 'generate', label: 'Generate new master', detail: 'One Gemini 3.8 TTS request, then local analysis.' }
  ];
  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '.8rem' };
  const fileField = (label: string, file: File | null, onChange: (file: File | null) => void) => (
    <label style={{ display: 'block', fontSize: '.8rem' }}>
      {label}
      <input type="file" accept=".wav,audio/wav,audio/x-wav" disabled={props.isActive}
        onChange={event => onChange(event.target.files?.[0] || null)}
        style={{ display: 'block', maxWidth: '100%', marginTop: '.4rem', fontSize: '.75rem' }} />
      {file && <span style={{ display: 'block', color: '#94a3b8', marginTop: '.25rem' }}>
        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginLeft: '.4rem' }}
          disabled={props.isActive} onClick={() => onChange(null)} aria-label={`Clear ${label}`}><RotateCcw size={11} /></button>
      </span>}
    </label>
  );
  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '.5rem', fontWeight: 700, alignItems: 'center', marginBottom: '1rem' }}>
        <FileAudio size={18} /> Master audio source
      </div>
      <div style={grid}>
        {sources.map(source => <label key={source.id} style={{ padding: '.7rem', borderRadius: 8,
          border: `1px solid ${props.source === source.id ? '#60a5fa' : 'rgba(255,255,255,.12)'}` }}>
          <span style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem', fontWeight: 600 }}>
            <input type="radio" name="masterSource" checked={props.source === source.id}
              disabled={props.isActive || (source.id === 'reuse' && !props.hasReusableMaster)}
              onChange={() => props.onChangeSource(source.id)} />{source.label}
          </span>
          <span style={{ display: 'block', color: '#94a3b8', fontSize: '.75rem', marginTop: '.35rem' }}>{source.detail}</span>
        </label>)}
      </div>
      {props.source === 'upload' && <div style={{ marginTop: '1rem' }}>
        {fileField('Master WAV (dialogue or single take)', props.masterFile, props.onChangeMaster)}
      </div>}
      <p style={{ color: '#94a3b8', fontSize: '.78rem', marginBottom: 0 }}>
        Each test uses one master with 1–12 lines. After a run, reuse its master to change methods or settings without using TTS quota.
      </p>
      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '.85rem' }}>Speaker references and evaluation settings</summary>
        <p style={{ color: '#94a3b8', fontSize: '.78rem' }}>Optional references: upload a few seconds of clean speech from each actual voice. Without references, speaker identities are inferred from the master.</p>
        <div style={grid}>
          {fileField('Speaker 1 reference WAV', props.reference1, props.onChangeReference1)}
          {fileField('Speaker 2 reference WAV', props.reference2, props.onChangeReference2)}
        </div>
        <div style={{ ...grid, marginTop: '1rem' }}>
          {([
            ['minSegmentSeconds', 'Minimum line duration (s)', .05],
            ['maxSegmentSeconds', 'Maximum line duration (s, optional)', .1],
            ['confidenceThreshold', 'Minimum identity score (0.5–1.0)', .05]
          ] as const).map(([key, label, step]) => <label key={key} style={{ fontSize: '.78rem' }}>
            {label}
            <input type="number" className="form-control" value={props.options[key] ?? ''} step={step}
              min={key === 'confidenceThreshold' ? .5 : .4} max={key === 'confidenceThreshold' ? 1 : key === 'minSegmentSeconds' ? 60 : 600}
              disabled={props.isActive} placeholder="Automatic"
              onChange={event => props.onChangeOptions({ ...props.options, [key]: event.target.value === '' ? undefined : Number(event.target.value) })}
              style={{ display: 'block', width: '100%', marginTop: '.3rem' }} />
          </label>)}
        </div>
        <label style={{ display: 'block', marginTop: '1rem', fontSize: '.78rem' }}>
          Known turn boundaries in seconds (optional evaluation labels)
          <input className="form-control" type="text" value={props.expectedBoundaries}
            disabled={props.isActive} onChange={event => props.onChangeExpectedBoundaries(event.target.value)}
            placeholder="e.g. 8.42, 17.19, 25.03" style={{ display: 'block', width: '100%', marginTop: '.3rem' }} />
        </label>
        <p style={{ color: '#94a3b8', fontSize: '.75rem', marginBottom: 0 }}>Enter one time between each pair of lines. These labels measure boundary error; they are not used as forced cuts.</p>
      </details>
    </div>
  );
};
