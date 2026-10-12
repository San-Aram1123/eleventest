import React from 'react';
import { Files, Plus, FileText, Check, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { BatchFileQueueItem } from '../../../types';

interface GeminiBatchFileQueueCardProps {
  fileQueue: BatchFileQueueItem[];
  activeFileId: string | null;
  batchState: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  autoAdvanceNextFile: boolean;
  setAutoAdvanceNextFile: (val: boolean) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onSwitchActiveFile: (id: string) => void;
  onMoveFileInQueue: (index: number, direction: 'up' | 'down') => void;
  onRemoveFileFromQueue: (id: string) => void;
  onClearCompletedFiles: () => void;
  onClearAllFiles: () => void;
}

export const GeminiBatchFileQueueCard: React.FC<GeminiBatchFileQueueCardProps> = ({
  fileQueue,
  activeFileId,
  batchState,
  autoAdvanceNextFile,
  setAutoAdvanceNextFile,
  fileInputRef,
  onSwitchActiveFile,
  onMoveFileInQueue,
  onRemoveFileFromQueue,
  onClearCompletedFiles,
  onClearAllFiles
}) => {
  if (fileQueue.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Files size={18} className="text-cyan" />
          <span className="card-title">File Queue ({fileQueue.length})</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            {fileQueue.filter(f => f.status === 'completed').length} / {fileQueue.length} Done
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={autoAdvanceNextFile}
              onChange={(e) => setAutoAdvanceNextFile(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: '#38BDF8', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: autoAdvanceNextFile ? '#38BDF8' : 'var(--text-dim)' }}>
              Auto-Advance Next File
            </span>
          </label>
          <button
            type="button"
            className="btn btn-xs btn-primary"
            onClick={() => fileInputRef.current?.click()}
            title="Add more .txt files to the queue"
          >
            <Plus size={12} />
            <span>Add Files</span>
          </button>
        </div>
      </div>

      <div className="card-body" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
          {fileQueue.map((f, idx) => {
            const isActive = f.id === activeFileId || f.status === 'active';
            return (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'rgba(56, 189, 248, 0.09)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isActive ? '#38BDF8' : 'var(--text-dim)', minWidth: '22px', textAlign: 'center', padding: '2px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    #{idx + 1}
                  </span>
                  <FileText size={16} className={isActive ? 'text-cyan' : 'text-muted'} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: isActive ? 700 : 600, color: isActive ? '#F8FAFC' : 'var(--text-main)', fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.fileName}
                      </span>
                      {isActive && (
                        <span className="badge badge-cyan" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                          {batchState === 'running' ? '⚡ Synthesizing' : 'Active File'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {f.lineCount} line(s)
                      {f.completedLines !== undefined && f.completedLines > 0 && (
                        <span style={{ color: '#34D399', marginLeft: '6px' }}>• {f.completedLines} completed</span>
                      )}
                      {f.failedLines !== undefined && f.failedLines > 0 && (
                        <span style={{ color: '#F87171', marginLeft: '6px' }}>• {f.failedLines} failed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
                  <span className={`badge ${
                    f.status === 'completed' ? 'badge-success' :
                    f.status === 'active' ? 'badge-cyan' :
                    f.status === 'failed' ? 'badge-danger' :
                    'badge-purple'
                  }`} style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                    {f.status === 'completed' && <Check size={10} style={{ marginRight: '3px' }} />}
                    {f.status}
                  </span>

                  {!isActive && batchState !== 'running' && (
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => onSwitchActiveFile(f.id)}
                      title="Switch active file to this file"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    >
                      Switch
                    </button>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={idx === 0 || batchState === 'running'}
                      onClick={() => onMoveFileInQueue(idx, 'up')}
                      title="Move up in queue"
                      style={{ padding: '1px 3px', height: '14px', minHeight: 'unset' }}
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={idx === fileQueue.length - 1 || batchState === 'running'}
                      onClick={() => onMoveFileInQueue(idx, 'down')}
                      title="Move down in queue"
                      style={{ padding: '1px 3px', height: '14px', minHeight: 'unset' }}
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    disabled={isActive && batchState === 'running'}
                    onClick={() => onRemoveFileFromQueue(f.id)}
                    title="Remove from queue"
                    style={{ padding: '3px 6px', color: '#EF4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            💡 Files are processed in sequential order. After finishing one file, the next automatically begins.
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {fileQueue.some(f => f.status === 'completed') && (
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={onClearCompletedFiles}
                style={{ fontSize: '0.7rem' }}
              >
                Clear Completed
              </button>
            )}
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={onClearAllFiles}
              disabled={batchState === 'running'}
              style={{ fontSize: '0.7rem', color: '#EF4444' }}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
