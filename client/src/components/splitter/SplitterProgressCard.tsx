import React from 'react';
import { Zap, AlertCircle, RotateCcw } from 'lucide-react';
import { SplitterBatchStatus, SplitterWorkflowMode } from './splitterTypes';

interface SplitterProgressCardProps {
  workflowMode: SplitterWorkflowMode;
  batchStatus: SplitterBatchStatus;
  completedChunksCount: number;
  allParagraphsCount: number;
  uploadedFileName: string;
  fileQueueLength: number;
  activeFileIndex: number;
  currentPacketIndex: number;
  packetsCount: number;
  currentPacketChunksCount: number;
  failedPacketIndices: number[];
  handleRetryFailed: () => void;
  batchLog: string[];
  children?: React.ReactNode;
}

export const SplitterProgressCard: React.FC<SplitterProgressCardProps> = ({
  workflowMode,
  batchStatus,
  completedChunksCount,
  allParagraphsCount,
  uploadedFileName,
  fileQueueLength,
  activeFileIndex,
  currentPacketIndex,
  packetsCount,
  currentPacketChunksCount,
  failedPacketIndices,
  handleRetryFailed,
  batchLog,
  children
}) => {
  if (workflowMode !== 'automated_batch' || (batchStatus !== 'running' && completedChunksCount === 0)) {
    return null;
  }

  const progressPercent = Math.min(100, (completedChunksCount / Math.max(1, allParagraphsCount)) * 100);

  return (
    <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
      <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Zap size={18} className="text-cyan" />
          <span className="card-title">Live Automated Batch Progress</span>
          <span className="badge badge-cyan">
            {completedChunksCount} / {allParagraphsCount} Saved
          </span>
          {uploadedFileName && (
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              File: {uploadedFileName} ({allParagraphsCount} samples)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fileQueueLength > 1 && (
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Queue File <strong>{activeFileIndex}</strong> of <strong>{fileQueueLength}</strong> •
            </span>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Packet <strong>{Math.min(currentPacketIndex + 1, Math.max(1, packetsCount))}</strong> of <strong>{Math.max(1, packetsCount)}</strong> ({currentPacketChunksCount} chunks)
          </span>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', background: 'var(--bg-box)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
              height: '100%',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Failed Packets Alert & Quick Retry */}
        {failedPacketIndices.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              color: '#fca5a5',
              fontSize: '0.84rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#f87171' }} />
              <span>
                <strong>{failedPacketIndices.length} packet{failedPacketIndices.length > 1 ? 's' : ''}</strong> failed during batch run.
              </span>
            </div>
            {batchStatus !== 'running' && (
              <button
                type="button"
                className="btn btn-warning btn-xs"
                onClick={handleRetryFailed}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, padding: '4px 10px' }}
              >
                <RotateCcw size={13} />
                <span>Retry Failed ({failedPacketIndices.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Live Terminal Log */}
        <div
          style={{
            background: 'var(--bg-box)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            maxHeight: '140px',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: '#94A3B8',
            minWidth: 0,
            maxWidth: '100%'
          }}
        >
          {batchLog.length === 0 ? (
            <div>Waiting to start...</div>
          ) : (
            batchLog.map((line, idx) => (
              <div
                key={idx}
                style={{
                  color: line.startsWith('✔') ? '#34D399' : line.startsWith('❌') ? '#F87171' : '#E2E8F0',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {line}
              </div>
            ))
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
