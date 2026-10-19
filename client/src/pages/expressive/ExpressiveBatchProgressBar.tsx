import React from 'react';
import { Play, Pause, Square, AlertCircle, Clock } from 'lucide-react';
import { AutomatedBatchState } from './expressiveFamilyTypes';

interface ExpressiveBatchProgressBarProps {
  batchState: AutomatedBatchState;
  startTime: number | null;
  onTogglePause: () => void;
  onStop: () => void;
}

export const ExpressiveBatchProgressBar: React.FC<ExpressiveBatchProgressBarProps> = ({
  batchState,
  startTime,
  onTogglePause,
  onStop
}) => {
  if (!batchState.isActive && batchState.completedClips === 0 && batchState.errors.length === 0) {
    return null;
  }

  const percent = batchState.totalClips > 0
    ? Math.min(100, Math.round((batchState.completedClips / batchState.totalClips) * 100))
    : 0;

  const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-medium)',
        borderTop: '1px solid var(--border-specular)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
      }}
    >
      {/* Top Header with Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: batchState.isPaused ? '#FF9F0A' : batchState.isActive ? '#30D158' : 'var(--text-tertiary)',
            boxShadow: batchState.isActive && !batchState.isPaused ? '0 0 10px rgba(48, 209, 88, 0.8)' : 'none'
          }} />
          <span style={{ fontWeight: 700, fontSize: '0.94rem', letterSpacing: '-0.015em' }}>
            {batchState.isActive ? (batchState.isPaused ? 'Batch Paused' : 'Automated Family Pipeline Running') : 'Batch Finished'}
          </span>
          <span style={{ fontSize: '0.74rem', background: 'rgba(191, 90, 242, 0.15)', color: '#BF5AF2', padding: '3px 9px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(191, 90, 242, 0.3)' }}>
            {batchState.completedClips} / {batchState.totalClips} Clips ({percent}%)
          </span>
        </div>

        {batchState.isActive && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onTogglePause}
              className="btn btn-sm"
              style={{
                fontSize: '0.76rem',
                borderRadius: '9999px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                background: batchState.isPaused ? '#0A84FF' : 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {batchState.isPaused ? <Play size={13} /> : <Pause size={13} />}
              {batchState.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onStop}
              className="btn btn-danger btn-sm"
              style={{
                fontSize: '0.76rem',
                borderRadius: '9999px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                background: 'linear-gradient(145deg, #FF453A, #D62B20)'
              }}
            >
              <Square size={13} /> Stop
            </button>
          </div>
        )}
      </div>

      {/* Apple Gradient Progress Bar Track */}
      <div style={{
        height: '7px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginBottom: '0.85rem'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #0A84FF 0%, #BF5AF2 50%, #30D158 100%)',
          borderRadius: '9999px',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>

      {/* Live Context Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {batchState.currentFamilyId && (
            <span>Family: <strong style={{ color: '#0A84FF' }}>{batchState.currentFamilyId}</strong></span>
          )}
          {batchState.totalSentences > 0 && (
            <span>Sentence: <strong style={{ color: 'var(--text-primary)' }}>{batchState.currentSentenceIdx} / {batchState.totalSentences}</strong></span>
          )}
          {batchState.currentConditionLabel && (
            <span>Condition: <strong style={{ color: '#FF375F' }}>{batchState.currentConditionLabel}</strong></span>
          )}
          {batchState.usedKeyMasked && (
            <span style={{ color: '#30D158', display: 'flex', alignItems: 'center', gap: '3px' }}>
              Key: <strong>{batchState.usedKeyMasked}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          <Clock size={13} />
          <span>Elapsed: {formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Errors Banner */}
      {batchState.errors.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.85rem',
          background: 'rgba(255, 69, 58, 0.08)',
          border: '1px solid rgba(255, 69, 58, 0.25)',
          borderRadius: '10px',
          fontSize: '0.76rem',
          color: '#FF6961'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, marginBottom: '2px' }}>
            <AlertCircle size={14} /> {batchState.errors.length} Generation Notices:
          </div>
          <ul style={{ margin: '2px 0 0 16px', padding: 0 }}>
            {batchState.errors.slice(-2).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
