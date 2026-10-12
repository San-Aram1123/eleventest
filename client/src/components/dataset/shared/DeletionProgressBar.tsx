import React from 'react';
import { Loader2 } from 'lucide-react';
import { BatchDeleteProgress } from '../../../hooks/useBatchDelete';

interface DeletionProgressBarProps {
  progress: BatchDeleteProgress | null;
  message?: string;
  color?: string;
}

export const DeletionProgressBar: React.FC<DeletionProgressBarProps> = ({
  progress,
  message = 'Deleting samples from disk and database...',
  color = '#ef4444'
}) => {
  if (!progress) return null;

  const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Loader2 size={14} className="spin" />
          {message}
        </span>
        <span>
          {progress.current} / {progress.total}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            background: color,
            width: `${percent}%`,
            transition: 'width 0.2s ease'
          }}
        />
      </div>
    </div>
  );
};
