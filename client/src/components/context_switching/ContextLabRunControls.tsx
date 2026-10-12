import React from 'react';
import { Play, Square, Clock, AlertTriangle } from 'lucide-react';
import { LabMasterSource } from '../../services/contextLabUtils';

interface ContextLabRunControlsProps {
  source: LabMasterSource;
  isActive: boolean;
  canStart: boolean;
  elapsedSeconds: number;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export const ContextLabRunControls: React.FC<ContextLabRunControlsProps> = (props) => (
  <div className="glass-card" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontWeight: 700 }}>Run one master test</div>
        <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '.3rem' }}>
          {props.source === 'generate' ? '1 TTS request; analysis uses the resulting master.' : '0 TTS requests; analyze existing audio locally.'}
          {' '}Clips are saved only when you choose Save.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.8rem' }}>
          <Clock size={13} />{props.elapsedSeconds}s
        </span>
        {props.isActive ? <button className="btn btn-secondary" type="button" onClick={props.onStop}>
          <Square size={14} /> Stop analysis
        </button> : <button className="btn btn-primary" type="button" onClick={props.onStart} disabled={!props.canStart}>
          <Play size={14} />{props.source === 'generate' ? 'Generate and test' : 'Analyze master'}
        </button>}
      </div>
    </div>
    {props.isActive && <div role="status" style={{ color: '#93c5fd', fontSize: '.8rem', marginTop: '.7rem' }}>
      Analyzing one master. A model may download on its first use; subsequent runs reuse the cache.
    </div>}
    {props.error && <div role="alert" style={{ display: 'flex', alignItems: 'start', gap: '.4rem', padding: '.7rem',
      marginTop: '.8rem', borderRadius: 6, color: '#fca5a5', background: '#ef444418', fontSize: '.82rem' }}>
      <AlertTriangle size={15} style={{ flexShrink: 0 }} />{props.error}
    </div>}
  </div>
);
