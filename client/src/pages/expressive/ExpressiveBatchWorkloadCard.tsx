import React from 'react';
import { Cpu, KeyRound } from 'lucide-react';
import { BatchExecutionMode } from './useExpressiveBatchRunner';

interface ExpressiveBatchWorkloadCardProps {
  totalClips: number;
  sentenceCount: number;
  conditionCount: number;
  batchMode: BatchExecutionMode;
  chunkCount: number;
  actualRequests: number;
  quotaSavingsPercent: number;
  activeKeysCount: number;
  requestsPerKey: number;
}

export const ExpressiveBatchWorkloadCard: React.FC<ExpressiveBatchWorkloadCardProps> = ({
  totalClips,
  sentenceCount,
  conditionCount,
  batchMode,
  chunkCount,
  actualRequests,
  quotaSavingsPercent,
  activeKeysCount,
  requestsPerKey
}) => {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem'
      }}
    >
      <div>
        <div style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Cpu size={13} style={{ color: '#38BDF8' }} /> Planned Output & Requests:
        </div>
        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>
          {totalClips} Total Clips ({sentenceCount} fam × {conditionCount} cond)
        </div>
        <div style={{ fontSize: '0.76rem', color: batchMode === 'sliced' ? '#10B981' : '#F59E0B', marginTop: '2px', fontWeight: 600 }}>
          {batchMode === 'sliced'
            ? `Actual Calls: ${chunkCount} chunks × ${conditionCount} = ${actualRequests} calls (${quotaSavingsPercent}% Quota Saved!)`
            : `Actual Calls: 1:1 Mode = ${actualRequests} calls (No Slicing)`}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <KeyRound size={13} style={{ color: '#10B981' }} /> Multi-Key Pool Distribution:
        </div>
        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
          {activeKeysCount} Active Keys → ≈ {requestsPerKey} calls / key
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
          Model: <code>gemini-3.8-flash-tts</code> with automatic failover
        </div>
      </div>
    </div>
  );
};

