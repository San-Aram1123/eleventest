import React from 'react';
import { Zap, Layers, AlertCircle } from 'lucide-react';
import { PairedBatchState } from './types';

interface BatchStateProgressCardProps {
  batchState: PairedBatchState;
  totalClips: number;
  mode: 'sliced' | 'individual';
}

export const BatchStateProgressCard: React.FC<BatchStateProgressCardProps> = ({
  batchState,
  totalClips,
  mode
}) => {
  if (!batchState.isActive) return null;

  const progressPercent = totalClips > 0
    ? Math.min(100, Math.round((batchState.completedClips / totalClips) * 100))
    : 0;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: mode === 'sliced' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(56, 189, 248, 0.12)',
        border: `1px solid ${mode === 'sliced' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {mode === 'sliced' ? <Zap size={16} color="#c084fc" /> : <Layers size={16} color="#38bdf8" />}
          <span style={{ fontWeight: 600, color: mode === 'sliced' ? '#c084fc' : '#38bdf8', fontSize: '0.9rem' }}>
            {mode === 'sliced'
              ? `Processing Family ${batchState.currentSentenceIdx}/${batchState.totalSentences}: ${batchState.currentFamilyId}`
              : `Generating Clip: ${batchState.currentFamilyId}_${batchState.currentEmotion}.wav`}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
          {batchState.completedClips} / {totalClips} clips ({progressPercent}%)
        </span>
      </div>

      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: mode === 'sliced'
              ? 'linear-gradient(90deg, #a855f7, #ec4899)'
              : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {batchState.errors.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontSize: '0.75rem' }}>
          <AlertCircle size={14} />
          <span>{batchState.errors.length} clip(s) encountered warnings or errors during synthesis</span>
        </div>
      )}
    </div>
  );
};
