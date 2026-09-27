import React, { useState, useEffect } from 'react';
import { Volume2, RefreshCw, Trash2, Music } from 'lucide-react';

interface MasterAudioItem {
  id: string;
  emotion: string;
  voiceName: string;
  speakerId: string;
  sentenceCount: number;
  model: string;
  audioBytes: number;
  createdAt: number;
  streamUrl: string;
}

interface MasterAudioPreviewPlayerProps {
  isBatchActive?: boolean;
}

const EMOTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  laughing: { bg: 'rgba(234, 179, 8, 0.2)', text: '#fde047', border: 'rgba(234, 179, 8, 0.4)' },
  whisper: { bg: 'rgba(148, 163, 184, 0.2)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
  happy: { bg: 'rgba(34, 197, 94, 0.2)', text: '#86efac', border: 'rgba(34, 197, 94, 0.4)' },
  angry: { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.4)' },
  sad: { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.4)' },
  neutral: { bg: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.4)' }
};

export const MasterAudioPreviewPlayer: React.FC<MasterAudioPreviewPlayerProps> = ({
  isBatchActive = false
}) => {
  const [items, setItems] = useState<MasterAudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMasterList = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/paired/master-audio/list');
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.warn('Failed to fetch master audio list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/paired/master-audio/clear', { method: 'POST' });
      setItems([]);
    } catch (err) {
      console.warn('Failed to clear master audio history:', err);
    }
  };

  useEffect(() => {
    fetchMasterList();
  }, []);

  // Poll for new master audio whenever a batch take completes
  useEffect(() => {
    if (!isBatchActive) {
      fetchMasterList();
      return;
    }
    const interval = setInterval(fetchMasterList, 3000);
    return () => clearInterval(interval);
  }, [isBatchActive]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.1rem 1.25rem',
        marginBottom: '1.5rem',
        borderRadius: '12px',
        border: '1.5px solid rgba(168, 85, 247, 0.35)',
        background: 'rgba(26, 22, 60, 0.65)',
        boxShadow: '0 4px 24px rgba(168, 85, 247, 0.12)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                Master Audio Takes
              </span>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.72rem', fontWeight: 700 }}>
                {items.length} {items.length === 1 ? 'Take' : 'Takes'} Stacked
              </span>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.7rem' }}>
                Pre-Sliced Raw Audio
              </span>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.7rem' }}>
                Not in Dataset
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Direct Gemini master takes stacked newest-on-top. Each take plays full unsliced audio for inspection.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={fetchMasterList}
            disabled={isLoading}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '4px' }}
            title="Refresh master list"
          >
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost text-error"
            onClick={handleClearHistory}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '4px', opacity: 0.8 }}
            title="Clear preview stack"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Stacked Master Audio Cards (Newest on Top) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {items.map((item, idx) => {
          const emColor = EMOTION_COLORS[item.emotion.toLowerCase()] || EMOTION_COLORS.neutral;
          const sizeKb = item.audioBytes ? Math.round(item.audioBytes / 1024) : 0;
          const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : '';
          const isLatest = idx === 0;

          return (
            <div
              key={item.id}
              style={{
                borderRadius: '9px',
                border: isLatest ? '1.5px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isLatest ? 'rgba(38, 29, 78, 0.7)' : 'rgba(20, 18, 42, 0.55)',
                padding: '0.65rem 0.85rem',
                boxShadow: isLatest ? '0 2px 12px rgba(168, 85, 247, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {isLatest && (
                    <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#e9d5ff', fontSize: '0.68rem', fontWeight: 800 }}>
                      LATEST
                    </span>
                  )}
                  <span
                    className="badge"
                    style={{
                      background: emColor.bg,
                      color: emColor.text,
                      border: `1px solid ${emColor.border}`,
                      fontSize: '0.76rem',
                      fontWeight: 700
                    }}
                  >
                    [{item.emotion}]
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', fontSize: '0.72rem' }}>
                    {item.speakerId} ({item.voiceName})
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.72rem' }}>
                    {item.sentenceCount} sentences
                  </span>
                  {sizeKb > 0 && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.72rem' }}>
                      {sizeKb} KB
                    </span>
                  )}
                </div>

                {timeStr && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {timeStr}
                  </div>
                )}
              </div>

              {/* Native Audio Player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.6rem', borderRadius: '7px' }}>
                <Volume2 size={15} color={emColor.text} />
                <audio
                  controls
                  src={item.streamUrl}
                  style={{ width: '100%', height: '32px', outline: 'none' }}
                  preload="metadata"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
