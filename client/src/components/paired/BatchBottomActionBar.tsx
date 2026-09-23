import React from 'react';
import { Sparkles, Play, Pause, Square } from 'lucide-react';

interface BatchBottomActionBarProps {
  sentenceCount: number;
  emotionCount: number;
  totalClips: number;
  mode: 'sliced' | 'individual';
  randomizeVoices: boolean;
  isActive: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onStart: () => void;
}

export const BatchBottomActionBar: React.FC<BatchBottomActionBarProps> = ({
  sentenceCount,
  emotionCount,
  totalClips,
  mode,
  randomizeVoices,
  isActive,
  isPaused,
  onTogglePause,
  onStop,
  onStart
}) => {
  return (
    <div
      className="glass-card"
      style={{
        position: 'sticky',
        bottom: '1rem',
        padding: '1rem 1.5rem',
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1.5px solid rgba(168, 85, 247, 0.4)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        zIndex: 10
      }}
    >
      <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
        Total Batch: <strong style={{ color: '#f8fafc' }}>{sentenceCount} sentences</strong> × <strong style={{ color: '#f8fafc' }}>{emotionCount} emotions</strong> = <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{totalClips} audio clips</strong>
        <span style={{ marginLeft: '0.75rem', color: mode === 'sliced' ? '#c084fc' : '#38bdf8', fontWeight: 600 }}>
          ({mode === 'sliced' ? `${sentenceCount} API Calls` : `${totalClips} API Calls`})
        </span>
        {randomizeVoices && (
          <span style={{ marginLeft: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>
            • 50/50 Male & Female Pool
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {isActive ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={onTogglePause}>
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn btn-danger" onClick={onStop}>
              <Square size={16} /> Stop Batch
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStart}
            disabled={totalClips === 0 || isActive}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              padding: '0.65rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              opacity: isActive ? 0.6 : 1,
              cursor: isActive ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={18} /> Start Paired Batch ({totalClips} Clips)
          </button>
        )}
      </div>
    </div>
  );
};
