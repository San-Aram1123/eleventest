import React from 'react';
import { Play, Pause } from 'lucide-react';
import { LongSplitChunk } from '../../types';

interface SplitterCompletedChunksGridProps {
  completedChunks: LongSplitChunk[];
  activePlayingId: number | null;
  handlePlayAudio: (chunkId: number, base64: string) => void;
}

export const SplitterCompletedChunksGrid: React.FC<SplitterCompletedChunksGridProps> = ({
  completedChunks,
  activePlayingId,
  handlePlayAudio
}) => {
  if (completedChunks.length === 0) return null;

  return (
    <div style={{ minWidth: 0, maxWidth: '100%' }}>
      <h5 style={{ margin: '8px 0', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
        Recently Sliced and Saved Samples ({completedChunks.length}):
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '10px', minWidth: 0, maxWidth: '100%' }}>
        {completedChunks.slice(-8).map((chunk, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-box)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>
                ✔ Sample #{chunk.savedSample?.id || idx + 1}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chunk.voiceName} • {chunk.duration.toFixed(1)}s {chunk.emotion && chunk.emotion !== 'neutral' && <span style={{ color: '#F59E0B', fontWeight: 600 }}>• [{chunk.emotion}]</span>}
              </span>
            </div>
            <div dir="rtl" style={{ fontSize: '0.84rem', color: 'var(--text-kurdish)', maxHeight: '42px', overflow: 'hidden', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {chunk.cleanText || chunk.text}
            </div>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => handlePlayAudio(idx, chunk.audioBase64)}
              style={{ alignSelf: 'flex-start', padding: '3px 8px', fontSize: '0.72rem' }}
            >
              {activePlayingId === idx ? <Pause size={12} /> : <Play size={12} />}
              <span style={{ marginLeft: '4px' }}>Listen</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
