import React from 'react';
import { Files, Plus, CheckCircle2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { SplitterFileQueueItem, SplitterBatchStatus } from './splitterTypes';

interface SplitterFileQueueCardProps {
  fileQueue: SplitterFileQueueItem[];
  activeFileId: string | null;
  batchStatus: SplitterBatchStatus;
  autoRemoveDuplicates: boolean;
  setAutoRemoveDuplicates: (v: boolean) => void;
  autoAdvanceNextFile: boolean;
  setAutoAdvanceNextFile: (v: boolean) => void;
  handleSwitchActiveFile: (id: string) => void;
  handleRemoveFileFromQueue: (id: string) => void;
  handleMoveFileInQueue: (index: number, direction: 'up' | 'down') => void;
  handleClearCompletedFilesInQueue: () => void;
  handleClearAllFilesInQueue: () => void;
  onAddFilesClick: () => void;
}

export const SplitterFileQueueCard: React.FC<SplitterFileQueueCardProps> = ({
  fileQueue,
  activeFileId,
  batchStatus,
  autoRemoveDuplicates,
  setAutoRemoveDuplicates,
  autoAdvanceNextFile,
  setAutoAdvanceNextFile,
  handleSwitchActiveFile,
  handleRemoveFileFromQueue,
  handleMoveFileInQueue,
  handleClearCompletedFilesInQueue,
  handleClearAllFilesInQueue,
  onAddFilesClick
}) => {
  if (fileQueue.length === 0) return null;

  const finishedCount = fileQueue.filter(f => f.status === 'completed').length;

  return (
    <div
      className="card"
      style={{
        border: '1px solid rgba(56, 189, 248, 0.3)',
        background: 'var(--bg-card)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8'
          }}>
            <Files size={15} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
            Multi-File Batch Queue
          </span>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            {finishedCount} / {fileQueue.length} Finished
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              color: autoRemoveDuplicates ? '#38BDF8' : 'var(--text-muted)',
              fontWeight: 600,
              background: autoRemoveDuplicates ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-box-subtle)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: autoRemoveDuplicates ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-subtle)'
            }}
            title="Automatically eliminates duplicate paragraphs before sending packets"
          >
            <input
              type="checkbox"
              checked={autoRemoveDuplicates}
              onChange={(e) => setAutoRemoveDuplicates(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#38BDF8' }}
            />
            <span>Auto-Remove Duplicates</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              color: autoAdvanceNextFile ? '#34D399' : 'var(--text-muted)',
              fontWeight: 600,
              background: autoAdvanceNextFile ? 'rgba(52, 211, 153, 0.12)' : 'var(--bg-box-subtle)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: autoAdvanceNextFile ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid var(--border-subtle)'
            }}
            title="Automatically begins synthesizing the next queued file upon completion"
          >
            <input
              type="checkbox"
              checked={autoAdvanceNextFile}
              onChange={(e) => setAutoAdvanceNextFile(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#10B981' }}
            />
            <span>Auto-Advance Next File</span>
          </label>

          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={onAddFilesClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '4px 8px', border: '1px solid var(--border-subtle)' }}
          >
            <Plus size={12} />
            <span>Add Files</span>
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {fileQueue.map((item, idx) => {
          const isActive = item.id === activeFileId;
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
                  : isCompleted
                  ? 'rgba(16, 185, 129, 0.06)'
                  : 'var(--bg-box)',
                border: isActive
                  ? '1px solid rgba(56, 189, 248, 0.45)'
                  : isCompleted
                  ? '1px solid rgba(16, 185, 129, 0.25)'
                  : '1px solid var(--border-subtle)',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isActive ? '#38BDF8' : 'var(--text-dim)', width: '20px', textAlign: 'center' }}>
                  #{idx + 1}
                </span>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#F8FAFC' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                      {item.fileName}
                    </span>
                    {isActive && (
                      <span style={{ background: 'rgba(56, 189, 248, 0.25)', color: '#38BDF8', fontSize: '0.66rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontSize: '0.66rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={10} /> DONE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{item.paragraphs.length} samples</span>
                    <span>•</span>
                    <span>{item.totalPackets} packets</span>
                    {item.completedPackets ? (
                      <>
                        <span>•</span>
                        <span style={{ color: '#34D399' }}>{item.completedPackets}/{item.totalPackets} packets done</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {!isActive && batchStatus !== 'running' && (
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => handleSwitchActiveFile(item.id)}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#94A3B8' }}
                    title="Switch to this file as active"
                  >
                    Switch
                  </button>
                )}

                {fileQueue.length > 1 && batchStatus !== 'running' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      disabled={idx === 0}
                      onClick={() => handleMoveFileInQueue(idx, 'up')}
                      style={{ padding: '2px 4px', opacity: idx === 0 ? 0.3 : 0.8 }}
                      title="Move up"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      disabled={idx === fileQueue.length - 1}
                      onClick={() => handleMoveFileInQueue(idx, 'down')}
                      style={{ padding: '2px 4px', opacity: idx === fileQueue.length - 1 ? 0.3 : 0.8 }}
                      title="Move down"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleRemoveFileFromQueue(item.id)}
                  style={{ padding: '3px 6px', color: '#F87171' }}
                  title="Remove file from queue"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--bg-box)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.74rem'
        }}
      >
        <span style={{ color: 'var(--text-dim)' }}>💡 Files execute sequentially from top to bottom.</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {fileQueue.some(f => f.status === 'completed') && (
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={handleClearCompletedFilesInQueue}
              style={{ fontSize: '0.72rem', color: '#94A3B8' }}
            >
              Clear Completed
            </button>
          )}
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={handleClearAllFilesInQueue}
            style={{ fontSize: '0.72rem', color: '#F87171' }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
