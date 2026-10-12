import React from 'react';
import { Play, Pause } from 'lucide-react';
import { LabClip } from '../../services/contextSwitchingApi';

interface ContextLabClipPlayerProps {
  clip?: LabClip;
  label: string;
  color: string;
  icon: React.ReactNode;
  keyPrefix: string;
  idx: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onEnded?: () => void;
}

export const ContextLabClipPlayer: React.FC<ContextLabClipPlayerProps> = (props) => {
  const { clip } = props;
  if (!clip) return null;
  const confidence = clip.confidence ?? clip.boundaryInfo?.confidence;
  return (
    <div style={{ padding: '.65rem', borderRadius: 6, background: `${props.color}0c`, border: `1px solid ${props.color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
        <button type="button" onClick={props.onTogglePlay} className="btn btn-secondary btn-sm"
          aria-label={`${props.isPlaying ? 'Pause' : 'Play'} ${props.label} line ${props.idx + 1}`}
          style={{ padding: '.4rem', borderRadius: '50%', flexShrink: 0, background: props.isPlaying ? props.color : undefined }}>
          {props.isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <audio id={`audio_${props.keyPrefix}_${props.idx}`} src={clip.audioUrl} onEnded={props.onEnded} onPause={props.onEnded} preload="none" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', fontWeight: 700, color: props.color }}>
            {props.icon}{props.label}
          </div>
          <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '.2rem' }}>
            {clip.start.toFixed(2)}–{clip.end.toFixed(2)}s · {clip.duration.toFixed(2)}s
          </div>
          {typeof confidence === 'number' && <div style={{ fontSize: '.7rem', color: '#94a3b8' }}>Confidence: {(confidence * 100).toFixed(1)}%</div>}
        </div>
      </div>
      <a href={clip.audioUrl} download={`line_${props.idx + 1}_${props.keyPrefix}.wav`}
        className="btn btn-secondary btn-sm" style={{ fontSize: '.68rem', padding: '.25rem .4rem', flexShrink: 0 }}>WAV</a>
    </div>
  );
};
