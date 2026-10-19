import React from 'react';
import { Zap, Layers } from 'lucide-react';

interface GenerationModeSelectorProps {
  mode: 'sliced' | 'individual';
  onChange: (mode: 'sliced' | 'individual') => void;
  chunkSize?: number;
  onChunkSizeChange?: (size: number) => void;
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  onSlicingStrategyChange?: (strategy: 'kurdish_align' | 'markers' | 'silence') => void;
  sentenceCount: number;
  emotionCount: number;
  disabled?: boolean;
}

export const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  mode,
  onChange,
  chunkSize = 3,
  onChunkSizeChange,
  slicingStrategy = 'silence',
  onSlicingStrategyChange,
  sentenceCount,
  emotionCount,
  disabled = false
}) => {
  const totalClips = sentenceCount * emotionCount;
  const activeChunkSize = chunkSize || 6;
  const transposedRequests = Math.ceil(sentenceCount / activeChunkSize) * emotionCount;
  const individualRequests = totalClips;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
        Generation Architecture &amp; Precision
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {/* Sliced Mode Card */}
        <div
          onClick={() => !disabled && onChange('sliced')}
          style={{
            padding: '1rem',
            borderRadius: '14px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'sliced' ? '1.5px solid #BF5AF2' : '1px solid var(--border-subtle)',
            borderTop: mode === 'sliced' ? '1.5px solid #BF5AF2' : '1px solid var(--border-specular)',
            background: mode === 'sliced' ? 'rgba(191, 90, 242, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            transition: 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: mode === 'sliced' ? '0 4px 18px rgba(191, 90, 242, 0.22)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: mode === 'sliced' ? '#FFFFFF' : 'var(--text-primary)' }}>
              <Zap size={16} style={{ color: '#BF5AF2' }} />
              <span>Transposed Batch (Whisper-Aligned)</span>
            </div>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', background: '#BF5AF2', color: '#FFFFFF', fontWeight: 800 }}>
              RECOMMENDED
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>
            Synthesizes unique sentences per emotion without repetition. Local <strong>faster-whisper</strong> performs speech boundary alignment with <strong>zero mid-sentence cuts</strong>.
          </p>
          <div style={{ fontSize: '0.76rem', color: '#BF5AF2', fontWeight: 700, marginBottom: mode === 'sliced' ? '0.65rem' : 0 }}>
            ⚡ Only {transposedRequests} API calls needed (saves {Math.max(0, individualRequests - transposedRequests)} calls)
          </div>

          {mode === 'sliced' && (
            <div
              style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(191, 90, 242, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Boundary Anchor:</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('silence')}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: slicingStrategy === 'silence' ? 'linear-gradient(145deg, #BF5AF2, #9A30D0)' : 'rgba(255, 255, 255, 0.06)',
                      color: slicingStrategy === 'silence' ? '#fff' : 'var(--text-secondary)',
                      border: slicingStrategy === 'silence' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                      fontWeight: slicingStrategy === 'silence' ? 700 : 500
                    }}
                  >
                    🌿 Acoustic Pauses
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('kurdish_align')}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: slicingStrategy === 'kurdish_align' ? 'linear-gradient(145deg, #30D158, #248A3D)' : 'rgba(255, 255, 255, 0.06)',
                      color: slicingStrategy === 'kurdish_align' ? '#fff' : 'var(--text-secondary)',
                      border: slicingStrategy === 'kurdish_align' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                      fontWeight: slicingStrategy === 'kurdish_align' ? 700 : 500
                    }}
                  >
                    🎯 Kurdish Alignment
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('markers')}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: slicingStrategy === 'markers' ? 'linear-gradient(145deg, #0A84FF, #0066CC)' : 'rgba(255, 255, 255, 0.06)',
                      color: slicingStrategy === 'markers' ? '#fff' : 'var(--text-secondary)',
                      border: slicingStrategy === 'markers' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                      fontWeight: slicingStrategy === 'markers' ? 700 : 500
                    }}
                  >
                    🏷️ Markers
                  </button>
                </div>
              </div>

              {onChunkSizeChange && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Batch Slicing Unit:</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChunkSizeChange(6)}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.70rem',
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        background: activeChunkSize === 6 ? '#BF5AF2' : 'rgba(255, 255, 255, 0.06)',
                        color: activeChunkSize === 6 ? '#fff' : 'var(--text-secondary)',
                        border: activeChunkSize === 6 ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                        fontWeight: 600
                      }}
                    >
                      Adaptive 6-in-1
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChunkSizeChange(3)}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.70rem',
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        background: activeChunkSize === 3 ? '#BF5AF2' : 'rgba(255, 255, 255, 0.06)',
                        color: activeChunkSize === 3 ? '#fff' : 'var(--text-secondary)',
                        border: activeChunkSize === 3 ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                        fontWeight: 600
                      }}
                    >
                      Pure 3-in-1
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Individual Mode Card */}
        <div
          onClick={() => !disabled && onChange('individual')}
          style={{
            padding: '1rem',
            borderRadius: '14px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'individual' ? '1.5px solid #0A84FF' : '1px solid var(--border-subtle)',
            borderTop: mode === 'individual' ? '1.5px solid #0A84FF' : '1px solid var(--border-specular)',
            background: mode === 'individual' ? 'rgba(10, 132, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            transition: 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: mode === 'individual' ? '0 4px 18px rgba(10, 132, 255, 0.22)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: mode === 'individual' ? '#FFFFFF' : 'var(--text-primary)' }}>
              <Layers size={16} style={{ color: '#0A84FF' }} />
              <span>Individual Requests (1:1 Mode)</span>
            </div>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF', fontWeight: 700, border: '1px solid rgba(10, 132, 255, 0.3)' }}>
              STANDALONE
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>
            Generates each clip as an individual 1:1 API request. Uses maximum API calls, safe fallback when experimenting.
          </p>
          <div style={{ fontSize: '0.76rem', color: '#0A84FF', fontWeight: 700 }}>
            ✨ {individualRequests} API calls (rotates across your API key pool automatically)
          </div>
        </div>
      </div>
    </div>
  );
};
