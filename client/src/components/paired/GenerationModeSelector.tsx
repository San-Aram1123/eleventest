import React from 'react';
import { Zap, Layers, CheckCircle2, Sparkles } from 'lucide-react';

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
  slicingStrategy = 'kurdish_align',
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
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
        GENERATION ARCHITECTURE & PRECISION
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {/* Sliced Mode Card - RECOMMENDED (Transposed Whisper Batch) */}
        <div
          onClick={() => !disabled && onChange('sliced')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'sliced' ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
            background: mode === 'sliced' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: mode === 'sliced' ? '#f8fafc' : '#cbd5e1' }}>
              <Zap size={16} color="#a855f7" />
              <span>Transposed Batch (Whisper-Aligned)</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#7e22ce', color: '#fff', fontWeight: 700 }}>
              RECOMMENDED
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
            Synthesizes unique sentences per emotion without repetition. Local <strong>faster-whisper</strong> performs speech boundary alignment with <strong>zero mid-sentence cuts</strong>.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600, marginBottom: mode === 'sliced' ? '0.6rem' : 0 }}>
            ⚡ Only {transposedRequests} API calls needed (saves {Math.max(0, individualRequests - transposedRequests)} calls)
          </div>

          {/* Interactive Slicing Controls when Sliced Mode is active */}
          {mode === 'sliced' && (
            <div
              style={{
                paddingTop: '0.65rem',
                borderTop: '1px solid rgba(168, 85, 247, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Slicing Strategy (Kurdish Word Alignment vs Markers vs Silence) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Boundary Anchor:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('kurdish_align')}
                    className={`btn btn-sm ${slicingStrategy === 'kurdish_align' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      background: slicingStrategy === 'kurdish_align' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.06)',
                      color: slicingStrategy === 'kurdish_align' ? '#fff' : '#94a3b8',
                      border: slicingStrategy === 'kurdish_align' ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: slicingStrategy === 'kurdish_align' ? 700 : 500
                    }}
                    title="Kurdish Word Alignment: Whisper maps known Kurdish words to exact timestamps. 100% pure Kurdish with 0 marker words, and immune to laughter in pauses."
                  >
                    🎯 Kurdish Alignment (Best)
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('markers')}
                    className={`btn btn-sm ${slicingStrategy === 'markers' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      background: slicingStrategy === 'markers' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.06)',
                      color: slicingStrategy === 'markers' ? '#fff' : '#94a3b8',
                      border: slicingStrategy === 'markers' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    title="Spoken Markers: Gemini speaks English markers (Marker One, Marker Two...). High precision but introduces English markers into audio."
                  >
                    🏷️ Markers
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSlicingStrategyChange?.('silence')}
                    className={`btn btn-sm ${slicingStrategy === 'silence' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '5px',
                      background: slicingStrategy === 'silence' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(255,255,255,0.06)',
                      color: slicingStrategy === 'silence' ? '#fff' : '#94a3b8',
                      border: slicingStrategy === 'silence' ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    title="Acoustic Silence: Uses <long pause> pauses between sentences without speaking any marker words."
                  >
                    🌿 Acoustic Pauses
                  </button>
                </div>
              </div>

              {/* Chunk Size Controls */}
              {onChunkSizeChange && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Batch Slicing Unit:
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChunkSizeChange(6)}
                      className={`btn btn-sm ${activeChunkSize === 6 ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        fontSize: '0.70rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: activeChunkSize === 6 ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255,255,255,0.04)',
                        color: activeChunkSize === 6 ? '#e9d5ff' : '#64748b',
                        border: activeChunkSize === 6 ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                      title="Adaptive: 6-in-1 for voiced emotions, auto 3-in-1 for whisper"
                    >
                      Adaptive 6-in-1
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChunkSizeChange(3)}
                      className={`btn btn-sm ${activeChunkSize === 3 ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        fontSize: '0.70rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: activeChunkSize === 3 ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255,255,255,0.04)',
                        color: activeChunkSize === 3 ? '#e9d5ff' : '#64748b',
                        border: activeChunkSize === 3 ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                      title="Pure 3-in-1: 3 sentences per call for all emotions"
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
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'individual' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
            background: mode === 'individual' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: mode === 'individual' ? '#f8fafc' : '#cbd5e1' }}>
              <Layers size={16} color="#38bdf8" />
              <span>Individual Requests (1:1 Mode)</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 600 }}>
              STANDALONE
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
            Generates each clip as an individual 1:1 API request. Uses maximum API calls, safe fallback when experimenting.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
            ✨ {individualRequests} API calls (rotates across your API key pool automatically)
          </div>
        </div>
      </div>
    </div>
  );
};
