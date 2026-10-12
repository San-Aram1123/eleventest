import React from 'react';
import { Files, Pause, Square, Sparkles, RotateCcw } from 'lucide-react';
import { SplitterBatchStatus, SplitterFileQueueItem, SplitterWorkflowMode } from './splitterTypes';

interface SplitterBatchControlsProps {
  workflowMode: SplitterWorkflowMode;
  fileQueue: SplitterFileQueueItem[];
  activeFileId: string | null;
  uploadedFileName: string;
  autoRemoveDuplicates: boolean;
  autoAdvanceNextFile: boolean;
  batchStatus: SplitterBatchStatus;
  currentPacketIndex: number;
  packetsCount: number;
  allParagraphsCount: number;
  completedChunksCount: number;
  failedPacketIndices: number[];
  isManualGenerating: boolean;
  packetSize: number;
  handlePauseBatch: () => void;
  handleStopBatch: () => void;
  handleStartBatch: () => void;
  handleResetBatch: () => void;
  handleRetryFailed: () => void;
  handleGenerateManualPacket: () => void;
}

export const SplitterBatchControls: React.FC<SplitterBatchControlsProps> = ({
  workflowMode,
  fileQueue,
  activeFileId,
  uploadedFileName,
  autoRemoveDuplicates,
  autoAdvanceNextFile,
  batchStatus,
  currentPacketIndex,
  packetsCount,
  allParagraphsCount,
  completedChunksCount,
  failedPacketIndices,
  isManualGenerating,
  packetSize,
  handlePauseBatch,
  handleStopBatch,
  handleStartBatch,
  handleResetBatch,
  handleRetryFailed,
  handleGenerateManualPacket
}) => {
  if (workflowMode !== 'automated_batch') {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleGenerateManualPacket}
        disabled={isManualGenerating || allParagraphsCount === 0}
        style={{
          padding: '12px',
          fontSize: '0.92rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isManualGenerating ? (
          <>
            <RotateCcw className="spin" size={16} />
            <span>Generating and Slicing Packet #1...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Generate First {packetSize} Chunks for Manual Review</span>
          </>
        )}
      </button>
    );
  }

  const activeIndex = Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {fileQueue.length > 1 && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#94A3B8'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: 600 }}>
            <Files size={14} />
            Queue File {activeIndex} of {fileQueue.length}: {uploadedFileName || 'Active File'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: autoRemoveDuplicates ? '#38BDF8' : 'var(--text-dim)' }}>
              Auto-Dedupe: {autoRemoveDuplicates ? 'ON' : 'OFF'}
            </span>
            <span>•</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: autoAdvanceNextFile ? '#34D399' : '#F59E0B' }}>
              Auto-Advance: {autoAdvanceNextFile ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      )}

      {batchStatus === 'running' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-warning"
            onClick={handlePauseBatch}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Pause size={16} />
            <span>Pause Batch</span>
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleStopBatch}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Square size={16} />
            <span>Stop Batch</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStartBatch}
            disabled={allParagraphsCount === 0}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '12px',
              fontSize: '0.94rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Sparkles size={18} />
            <span>
              {batchStatus === 'paused'
                ? `Resume Batch (Packet ${currentPacketIndex + 1}/${packetsCount})`
                : currentPacketIndex > 0 && currentPacketIndex < packetsCount
                ? `Continue Batch (Packet ${currentPacketIndex + 1}/${packetsCount})`
                : fileQueue.length > 1
                ? `Start Automated Batch (${packetsCount} Packets • File ${activeIndex}/${fileQueue.length})`
                : `Start Automated Batch (${packetsCount} Packets / ${allParagraphsCount} Chunks)`}
            </span>
          </button>

          {(completedChunksCount > 0 || currentPacketIndex > 0) && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleResetBatch}
              style={{ padding: '12px 16px', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', whiteSpace: 'nowrap' }}
              title="Reset batch progress to 0"
            >
              <RotateCcw size={15} />
              <span>Reset Progress</span>
            </button>
          )}

          {failedPacketIndices.length > 0 && (
            <button
              type="button"
              className="btn"
              onClick={handleRetryFailed}
              style={{
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(245, 158, 11, 0.18)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Retry only the packets that failed during batch execution"
            >
              <RotateCcw size={16} />
              <span>Retry Failed ({failedPacketIndices.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
