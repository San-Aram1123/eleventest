import React from 'react';
import { CheckCircle2, Save, Play, Pause } from 'lucide-react';
import { LongSplitChunk, LongSplitResponse } from '../../types';
import { SplitterWorkflowMode } from './splitterTypes';

interface SplitterManualReviewCardProps {
  workflowMode: SplitterWorkflowMode;
  manualResponse: LongSplitResponse | null;
  manualChunks: LongSplitChunk[];
  isManualSavingAll: boolean;
  activePlayingId: number | null;
  handleSaveManualChunks: () => void;
  handlePlayAudio: (chunkId: number, base64: string) => void;
}

export const SplitterManualReviewCard: React.FC<SplitterManualReviewCardProps> = ({
  workflowMode,
  manualResponse,
  manualChunks,
  isManualSavingAll,
  activePlayingId,
  handleSaveManualChunks,
  handlePlayAudio
}) => {
  if (workflowMode !== 'manual_review' || !manualResponse || manualChunks.length === 0) {
    return null;
  }

  const allSaved = manualChunks.every(c => c.status === 'saved');

  return (
    <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)' }}>
      <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} className="text-green" />
          <span className="card-title">Manual Review: Sliced Chunks ({manualChunks.length})</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-success"
          onClick={handleSaveManualChunks}
          disabled={isManualSavingAll || allSaved}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Save size={14} />
          <span>Save All to Dataset</span>
        </button>
      </div>

      <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
        {manualChunks.map((chunk) => (
          <div
            key={chunk.id}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.78rem' }}>Chunk #{chunk.id}</span>
                {chunk.emotion && chunk.emotion !== 'neutral' && (
                  <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.18)', padding: '1px 6px', borderRadius: '4px' }}>
                    [{chunk.emotion}]
                  </span>
                )}
              </div>
              <span style={{ color: '#A78BFA', fontSize: '0.72rem' }}>⏱ {chunk.duration.toFixed(2)}s</span>
            </div>
            <div dir="rtl" style={{ fontSize: '0.9rem', color: 'var(--text-kurdish)', minHeight: '44px' }}>
              {chunk.cleanText || chunk.text}
            </div>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => handlePlayAudio(chunk.id, chunk.audioBase64)}
              style={{ alignSelf: 'flex-start', padding: '4px 10px' }}
            >
              {activePlayingId === chunk.id ? <Pause size={12} /> : <Play size={12} />}
              <span style={{ marginLeft: '4px' }}>Play Audio</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
