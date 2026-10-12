import React from 'react';

interface ExportPreviewStatsCardProps {
  matchedStats: {
    count: number;
    maleCount: number;
    femaleCount: number;
    durationFormatted: string;
    sizeMb: string;
  };
  totalSamplesCount: number;
}

export const ExportPreviewStatsCard: React.FC<ExportPreviewStatsCardProps> = ({
  matchedStats,
  totalSamplesCount
}) => {
  const percent = ((matchedStats.count / (totalSamplesCount || 1)) * 100).toFixed(0);

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.9rem 1.1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
          Real-time Export Estimate
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
            👨 {matchedStats.maleCount} Male
          </span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
            👩 {matchedStats.femaleCount} Female
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Selected Samples</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: matchedStats.count > 0 ? '#38bdf8' : '#ef4444' }}>
            {matchedStats.count}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {percent}% of dataset
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Duration</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
            {matchedStats.durationFormatted}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            24kHz 16-bit audio
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Approx Size</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
            {matchedStats.sizeMb}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            ZIP Compressed
          </div>
        </div>
      </div>
    </div>
  );
};
