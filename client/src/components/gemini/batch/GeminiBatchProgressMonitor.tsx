import React from 'react';
import { Layers, Files, Clock, Play, Pause, Square, RotateCcw, Trash2 } from 'lucide-react';
import { BatchFileQueueItem } from '../../../types';

interface GeminiBatchProgressMonitorProps {
  batchItemsCount: number;
  batchState: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  fileQueue: BatchFileQueueItem[];
  activeFileId: string | null;
  uploadedFileName: string;
  autoAdvanceNextFile: boolean;
  progressPercent: number;
  totalLines: number;
  completedLines: number;
  failedLines: number;
  pendingLines: number;
  batchDelayMs: number;
  setBatchDelayMs: (ms: number) => void;
  autoResumeEnabled: boolean;
  setAutoResumeEnabled: (val: boolean) => void;
  autoResumeMinutes: number;
  setAutoResumeMinutes: (m: number) => void;
  autoResumeCountdown: number | null;
  onResumeBatch: () => void;
  onCancelAutoResume: () => void;
  onStartBatch: () => void;
  onPauseBatch: () => void;
  onStopBatch: () => void;
  onRetryFailedLines: () => void;
  onClearBatch: () => void;
  isBatchRunning: boolean;
}

export const GeminiBatchProgressMonitor: React.FC<GeminiBatchProgressMonitorProps> = ({
  batchItemsCount,
  batchState,
  fileQueue,
  activeFileId,
  uploadedFileName,
  autoAdvanceNextFile,
  progressPercent,
  totalLines,
  completedLines,
  failedLines,
  pendingLines,
  batchDelayMs,
  setBatchDelayMs,
  autoResumeEnabled,
  setAutoResumeEnabled,
  autoResumeMinutes,
  setAutoResumeMinutes,
  autoResumeCountdown,
  onResumeBatch,
  onCancelAutoResume,
  onStartBatch,
  onPauseBatch,
  onStopBatch,
  onRetryFailedLines,
  onClearBatch,
  isBatchRunning
}) => {
  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} className="text-cyan" />
          <span className="card-title">Batch Progress & Controls</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {batchItemsCount > 0 && (
            <span className="badge badge-ghost" style={{ fontSize: '0.68rem', padding: '2px 6px', color: '#10B981', borderColor: 'rgba(16,185,129,0.3)' }}>
              💾 Saved
            </span>
          )}
          <span className={`badge ${batchState === 'running' ? 'badge-cyan' : (batchState === 'completed' ? 'badge-success' : (batchState === 'paused' ? 'badge-amber' : 'badge-purple'))}`}>
            {batchState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="card-body">
        {fileQueue.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Files size={16} className="text-cyan" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38BDF8', flexShrink: 0 }}>
                Queue File {Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)} of {fileQueue.length}:
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {uploadedFileName}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: autoAdvanceNextFile ? '#34D399' : 'var(--text-dim)', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
              {autoAdvanceNextFile ? '⚡ Auto-Advance: ON' : 'Auto-Advance: OFF'}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-section" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 600, color: '#E2E8F0' }}>Progress</span>
            <span style={{ color: '#38BDF8', fontWeight: 700 }}>{progressPercent}% ({completedLines}/{totalLines})</span>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.08)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #0284C7, #38BDF8, #10B981)', height: '100%', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Summary Counters */}
        <div className="meta-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div className="meta-item" style={{ textAlign: 'center' }}><span className="meta-lbl">TOTAL</span><strong className="meta-val">{totalLines}</strong></div>
          <div className="meta-item" style={{ textAlign: 'center' }}><span className="meta-lbl" style={{ color: '#34D399' }}>COMPLETED</span><strong className="meta-val text-green">{completedLines}</strong></div>
          <div className="meta-item" style={{ textAlign: 'center' }}><span className="meta-lbl" style={{ color: '#F87171' }}>FAILED</span><strong className="meta-val" style={{ color: '#F87171' }}>{failedLines}</strong></div>
          <div className="meta-item" style={{ textAlign: 'center' }}><span className="meta-lbl" style={{ color: '#A78BFA' }}>PENDING</span><strong className="meta-val" style={{ color: '#A78BFA' }}>{pendingLines}</strong></div>
        </div>

        {/* Active Countdown Banner */}
        {autoResumeCountdown !== null && autoResumeCountdown > 0 && (
          <div style={{ marginBottom: '10px', padding: '12px 14px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.12) 100%)', border: '1.5px solid rgba(245, 158, 11, 0.45)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#F59E0B" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FBBF24' }}>
                  Auto-Resuming in {Math.floor(autoResumeCountdown / 60)}:{String(autoResumeCountdown % 60).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Google quota cooldown active. Retrying line once refreshed...</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn btn-xs btn-primary" onClick={onResumeBatch} style={{ background: '#F59E0B', color: '#000', fontWeight: 700 }}>⚡ Resume Now</button>
              <button type="button" className="btn btn-xs btn-secondary" onClick={onCancelAutoResume}>Cancel</button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {batchState === 'idle' || batchState === 'completed' || batchState === 'stopped' ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={onStartBatch} disabled={totalLines === 0 || isBatchRunning} style={{ width: '100%', justifyContent: 'center' }}>
              <Play size={18} />
              <span>Start Batch Synthesis ({pendingLines || totalLines} Lines{fileQueue.length > 1 ? ` • File ${Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)}/${fileQueue.length}` : ''})</span>
            </button>
          ) : batchState === 'running' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onPauseBatch} style={{ flex: 1, justifyContent: 'center', background: '#F59E0B', color: '#000' }}><Pause size={18} /><span>Pause</span></button>
              <button type="button" className="btn btn-danger" onClick={onStopBatch} style={{ flex: 1, justifyContent: 'center' }}><Square size={18} /><span>Stop</span></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-primary" onClick={onResumeBatch} style={{ flex: 1, justifyContent: 'center' }}><Play size={18} /><span>Resume Batch</span></button>
              <button type="button" className="btn btn-danger" onClick={onStopBatch} style={{ flex: 1, justifyContent: 'center' }}><Square size={18} /><span>Stop</span></button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {failedLines > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onRetryFailedLines} style={{ flex: 1, justifyContent: 'center' }}><RotateCcw size={14} /><span>Retry Failed ({failedLines})</span></button>
            )}
            {totalLines > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClearBatch} disabled={batchState === 'running'} style={{ color: '#EF4444' }}><Trash2 size={14} /><span>Clear List</span></button>
            )}
          </div>
        </div>

        <div className="resilience-callout" style={{ marginTop: '14px' }}>
          🛡️ <strong>Resilient Multi-Key Failover</strong>: If any line fails or an API key runs out, the engine automatically switches to backup keys and continues with the rest of the file without crashing.
        </div>
      </div>
    </div>
  );
};
