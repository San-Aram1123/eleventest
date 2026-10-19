import React from 'react';
import { Sparkles } from 'lucide-react';
import { getEmotionBadgeInfo } from '../../utils/kurdishTextSplitter';

interface SplitterEmotionInspectorProps {
  allParagraphs: string[];
  packetSize: number;
  defaultEmotion: string;
  showParagraphPreview: boolean;
  setShowParagraphPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SplitterEmotionInspector: React.FC<SplitterEmotionInspectorProps> = ({
  allParagraphs,
  packetSize,
  defaultEmotion,
  showParagraphPreview,
  setShowParagraphPreview
}) => {
  if (allParagraphs.length === 0) return null;

  return (
    <div style={{ marginTop: '12px', minWidth: 0, maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} className="text-amber" />
          <span>Detected Paragraph Emotions ({allParagraphs.length}):</span>
        </span>
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={() => setShowParagraphPreview(prev => !prev)}
          style={{ fontSize: '0.74rem', padding: '2px 8px' }}
        >
          {showParagraphPreview ? 'Hide List' : 'Show List'}
        </button>
      </div>

      {showParagraphPreview && (
        <div
          style={{
            maxHeight: '190px',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            background: 'var(--bg-box)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            minWidth: 0,
            maxWidth: '100%'
          }}
        >
          {allParagraphs.map((p, idx) => {
            const badge = getEmotionBadgeInfo(p, defaultEmotion);
            const packetNum = Math.floor(idx / packetSize) + 1;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${badge.color}`,
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  #{idx + 1} (P{packetNum})
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: badge.color,
                    background: badge.bg,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    textTransform: 'lowercase',
                    flexShrink: 0
                  }}
                >
                  {badge.tag}
                </span>
                <span
                  dir="rtl"
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                    minWidth: 0
                  }}
                  title={p}
                >
                  {p}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
