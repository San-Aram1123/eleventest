import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { CONTEXT_VOICES } from '../../data/contextSwitchingPresets';
import { CONTEXT_LAB_ENGINES } from '../../data/contextLabEngines';
import { DetectionEngineType } from '../../services/contextSwitchingApi';

interface ContextLabConfigCardProps {
  detectionEngine: DetectionEngineType;
  onChangeDetectionEngine: (engine: DetectionEngineType) => void;
  speaker1Voice: string;
  onChangeSpeaker1: (voice: string) => void;
  speaker2Voice: string;
  onChangeSpeaker2: (voice: string) => void;
  startIdx: number;
  onChangeStartIdx: (index: number) => void;
  onRefreshStartIdx: () => void;
  isRefreshingIdx: boolean;
  isBatchActive: boolean;
  voicesReadOnly?: boolean;
}

export const ContextLabConfigCard: React.FC<ContextLabConfigCardProps> = (props) => {
  const renderEngine = (engine: typeof CONTEXT_LAB_ENGINES[number]) => (
    <label key={engine.id} style={{ display: 'block', padding: '.8rem', borderRadius: 8,
      border: `1px solid ${props.detectionEngine === engine.id ? engine.color : 'rgba(255,255,255,.12)'}`,
      background: props.detectionEngine === engine.id ? `${engine.color}15` : 'rgba(255,255,255,.02)',
      cursor: props.isBatchActive ? 'default' : 'pointer' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: engine.color, fontWeight: 700 }}>
        <input type="radio" name="labEngine" value={engine.id} checked={props.detectionEngine === engine.id}
          onChange={() => props.onChangeDetectionEngine(engine.id)} disabled={props.isBatchActive} />
        {engine.label}
      </span>
      <span style={{ display: 'block', marginTop: '.4rem', color: '#94a3b8', fontSize: '.78rem', lineHeight: 1.5 }}>
        {engine.description}
      </span>
    </label>
  );
  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.65rem' };
  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 700 }}>
          <Activity size={18} /> Speaker boundary testing
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem' }}>
          Dataset start index
          <input type="number" min={1} value={props.startIdx} className="form-control" style={{ width: 90 }}
            disabled={props.isBatchActive} onChange={event => props.onChangeStartIdx(Math.max(1, Number(event.target.value) || 1))} />
          <button type="button" className="btn btn-secondary btn-sm" title="Refresh dataset start index"
            onClick={props.onRefreshStartIdx} disabled={props.isBatchActive || props.isRefreshingIdx}>
            <RefreshCw size={14} className={props.isRefreshingIdx ? 'spin' : ''} />
          </button>
        </label>
      </div>
      <div style={{ ...grid, marginBottom: '1rem' }}>
        {[1, 2].map(speaker => (
          <label key={speaker} style={{ fontSize: '.8rem', color: speaker === 1 ? '#93c5fd' : '#f472b6' }}>
            Speaker {speaker} ({speaker === 1 ? 'odd' : 'even'} lines)
            <select className="form-select" style={{ display: 'block', width: '100%', marginTop: '.35rem' }}
              value={speaker === 1 ? props.speaker1Voice : props.speaker2Voice}
              disabled={props.isBatchActive || props.voicesReadOnly}
              onChange={event => (speaker === 1 ? props.onChangeSpeaker1 : props.onChangeSpeaker2)(event.target.value)}>
              {CONTEXT_VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name} ({voice.gender})</option>)}
            </select>
          </label>
        ))}
      </div>
      <div style={grid}>{CONTEXT_LAB_ENGINES.filter(engine => !engine.experimental).map(renderEngine)}</div>
      <details style={{ marginTop: '1rem' }} open={CONTEXT_LAB_ENGINES.find(engine => engine.id === props.detectionEngine)?.experimental || undefined}>
        <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '.82rem' }}>Previous experimental methods</summary>
        <p style={{ color: '#94a3b8', fontSize: '.78rem' }}>These older detectors are opt-in. They may require model downloads or extra local dependencies.</p>
        <div style={grid}>{CONTEXT_LAB_ENGINES.filter(engine => engine.experimental).map(renderEngine)}</div>
      </details>
    </div>
  );
};
