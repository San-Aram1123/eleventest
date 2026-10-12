import React from 'react';
import { Scissors, BookOpen } from 'lucide-react';
import { PRESET_STORIES } from './splitterConstants';
import { PresetStory } from './splitterTypes';

interface SplitterTopBannerProps {
  packetSize: number;
  onSelectPreset: (preset: PresetStory) => void;
}

export const SplitterTopBanner: React.FC<SplitterTopBannerProps> = ({
  packetSize,
  onSelectPreset
}) => {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(129, 140, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8'
            }}
          >
            <Scissors size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
                Smart Long-Paragraph Audio Splitter and Automated Batch
              </h3>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}
              >
                ⚡ {packetSize}x Quota Multiplier
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Upload or paste paragraphs separated by blank lines. The engine sends <strong>{packetSize} paragraphs per Gemini request</strong> with 1.5s silence pauses, then auto-slices via FFmpeg with zero mid-sentence cutoffs.
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Presets:</span>
          {PRESET_STORIES.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => onSelectPreset(p)}
              style={{
                fontSize: '0.74rem',
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <BookOpen size={12} style={{ marginRight: '4px' }} />
              {p.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
