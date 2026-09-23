import React from 'react';
import { Zap, Layers, CheckCircle2, Sparkles } from 'lucide-react';

interface GenerationModeSelectorProps {
  mode: 'sliced' | 'individual';
  onChange: (mode: 'sliced' | 'individual') => void;
  sentenceCount: number;
  emotionCount: number;
  disabled?: boolean;
}

export const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  mode,
  onChange,
  sentenceCount,
  emotionCount,
  disabled = false
}) => {
  const totalClips = sentenceCount * emotionCount;
  const slicedRequests = sentenceCount;
  const individualRequests = totalClips;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
        GENERATION ARCHITECTURE & PRECISION
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {/* Individual Mode Card - RECOMMENDED */}
        <div
          onClick={() => !disabled && onChange('individual')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'individual' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
            background: mode === 'individual' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: mode === 'individual' ? '#f8fafc' : '#cbd5e1' }}>
              <Layers size={16} color="#38bdf8" />
              <span>Individual Requests (1:1 Precision)</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#0284c7', color: '#fff', fontWeight: 700 }}>
              RECOMMENDED
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
            Generates each emotion as its own full sentence request. <strong>100% accurate, zero mid-sentence cuts</strong>, and distinct emotional acting.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
            ✨ {individualRequests} API calls (rotates across your API key pool automatically)
          </div>
        </div>

        {/* Sliced Mode Card */}
        <div
          onClick={() => !disabled && onChange('sliced')}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: mode === 'sliced' ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
            background: mode === 'sliced' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: mode === 'sliced' ? '#f8fafc' : '#cbd5e1' }}>
              <Zap size={16} color="#a855f7" />
              <span>Smart Slicing (6-in-1 Fast Batch)</span>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', fontWeight: 600 }}>
              83% QUOTA SAVER
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
            Synthesizes numbered takes in 1 single call with silence pauses and zero-cut safety guardrails. Aborts if takes are dropped to protect quota.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>
            ⚡ Only {slicedRequests} API calls needed (saves {Math.max(0, individualRequests - slicedRequests)} calls)
          </div>
        </div>
      </div>
    </div>
  );
};
