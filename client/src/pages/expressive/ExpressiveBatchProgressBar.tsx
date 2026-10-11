import React from 'react';
import { Play, Pause, Square, AlertCircle, Clock, Zap, Layers } from 'lucide-react';
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
    <div className="card" style={{
      padding: '1.25rem',
      marginBottom: '1.25rem',
      background: 'linear-gradient(135deg, rgba(30, 34, 48, 0.95) 0%, rgba(20, 24, 36, 0.95) 100%)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Top Header with Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: batchState.isPaused ? '#F59E0B' : batchState.isActive ? '#10B981' : '#64748B',
            boxShadow: batchState.isActive && !batchState.isPaused ? '0 0 10px #10B981' : 'none'
          }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
            {batchState.isActive ? (batchState.isPaused ? 'Batch Paused' : 'Automated Family Pipeline Running') : 'Batch Finished'}
          </span>
          <span style={{ fontSize: '0.78rem', background: 'rgba(139, 92, 246, 0.2)', color: '#C084FC', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
            {batchState.completedClips} / {batchState.totalClips} Clips ({percent}%)
          </span>
        </div>

        {batchState.isActive && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onTogglePause}
              className={`btn btn-sm ${batchState.isPaused ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {batchState.isPaused ? <Play size={13} /> : <Pause size={13} />}
              {batchState.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onStop}
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Square size={13} /> Stop
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar Track */}
      <div style={{
        height: '8px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Live Context Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94A3B8', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {batchState.currentFamilyId && (
            <span>Family: <strong style={{ color: '#38BDF8' }}>{batchState.currentFamilyId}</strong></span>
          )}
          {batchState.totalSentences > 0 && (
            <span>Sentence: <strong style={{ color: '#F1F5F9' }}>{batchState.currentSentenceIdx} / {batchState.totalSentences}</strong></span>
          )}
          {batchState.currentConditionLabel && (
            <span>Condition: <strong style={{ color: '#EC4899' }}>{batchState.currentConditionLabel}</strong></span>
          )}
          {batchState.usedKeyMasked && (
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
              Key: <strong>{batchState.usedKeyMasked}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
          <Clock size={13} />
          <span>Elapsed: {formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Errors Banner */}
      {batchState.errors.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem 0.8rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          color: '#FCA5A5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, marginBottom: '2px' }}>
            <AlertCircle size={14} color="#EF4444" /> {batchState.errors.length} Generation Notices:
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

