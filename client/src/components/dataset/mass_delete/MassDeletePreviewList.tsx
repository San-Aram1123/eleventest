import React from 'react';
import { HardDrive } from 'lucide-react';
import { Sample } from '../../../types';

interface MassDeletePreviewListProps {
  matchingSamples: Sample[];
  stats: {
    count: number;
    durationFormatted: string;
    remainingCount: number;
    percentOfTotal: string;
  };
}

export const MassDeletePreviewList: React.FC<MassDeletePreviewListProps> = ({
  matchingSamples,
  stats
}) => {
  if (stats.count === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Stats Summary Pill Banner */}
      <div
        className="glass-card"
        style={{
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={16} color="#f87171" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f87171' }}>
            {stats.count.toLocaleString()} samples targeted
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            ({stats.percentOfTotal}% of total dataset)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#cbd5e1' }}>
          <span>Duration: <strong style={{ color: '#ffffff' }}>{stats.durationFormatted}</strong></span>
          <span>Remaining after purge: <strong style={{ color: '#22c55e' }}>{stats.remainingCount.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Preview Table of First 30 Matching Items */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>Previewing first {Math.min(30, stats.count)} matching samples:</span>
        <span style={{ fontFamily: 'monospace' }}>Total {stats.count.toLocaleString()} samples</span>
      </div>

      <div
        style={{
          maxHeight: '140px',
          overflowY: 'auto',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {matchingSamples.slice(0, 30).map((sample) => (
          <div
            key={sample.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              padding: '4px 6px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span className="badge badge-secondary" style={{ fontSize: '0.7rem', padding: '1px 5px' }}>
                #{sample.id}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                {sample.voice_name || (sample as any).voiceName || 'Voice'}
              </span>
              <span
                style={{
                  color: '#e2e8f0',
                  direction: 'rtl',
                  fontFamily: 'Rabar, Tahoma, sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '360px'
                }}
              >
                {sample.text}
              </span>
            </div>

            <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : 'Unknown date'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
