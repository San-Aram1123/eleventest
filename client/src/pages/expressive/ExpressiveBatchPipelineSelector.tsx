import React from 'react';
import { Scissors } from 'lucide-react';
import { BatchExecutionMode } from './useExpressiveBatchRunner';

interface ExpressiveBatchPipelineSelectorProps {
  batchMode: BatchExecutionMode;
  onChangeBatchMode: (mode: BatchExecutionMode) => void;
  chunkSize: number;
  onChangeChunkSize: (size: number) => void;
  isBatchActive: boolean;
}

export const ExpressiveBatchPipelineSelector: React.FC<ExpressiveBatchPipelineSelectorProps> = ({
  batchMode,
  onChangeBatchMode,
  chunkSize,
  onChangeChunkSize,
  isBatchActive
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        padding: '0.85rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}
    >
      <div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#A5B4FC',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px'
          }}
        >
          <Scissors size={14} /> Batch Execution Architecture:
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            disabled={isBatchActive}
            onClick={() => onChangeBatchMode('sliced')}
            className={`btn btn-sm ${batchMode === 'sliced' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.76rem', fontWeight: 600 }}
          >
            Sliced Mode (Acoustic Pauses)
          </button>
          <button
            disabled={isBatchActive}
            onClick={() => onChangeBatchMode('individual')}
            className={`btn btn-sm ${batchMode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.76rem' }}
          >
            1:1 Individual Requests
          </button>
        </div>
      </div>

      {batchMode === 'sliced' && (
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#38BDF8',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            Chunk Size (Sentences / API call):
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[3, 6].map(sz => (
              <button
                key={sz}
                disabled={isBatchActive}
                onClick={() => onChangeChunkSize(sz)}
                className={`btn btn-sm ${chunkSize === sz ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {sz} Sentences / Call {sz === 6 ? '(Standard)' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

