import React from 'react';

export type PresetType = 'all' | 'male' | 'female' | 'current' | 'custom';

interface ExportPresetSelectorProps {
  preset: PresetType;
  onSelectPreset: (preset: PresetType) => void;
  samplesCount: number;
  maleCount: number;
  femaleCount: number;
  currentFilteredCount: number;
}

export const ExportPresetSelector: React.FC<ExportPresetSelectorProps> = ({
  preset,
  onSelectPreset,
  samplesCount,
  maleCount,
  femaleCount,
  currentFilteredCount
}) => {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
        Quick Filter Preset:
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        {/* Preset 1: Complete Dataset */}
        <button
          type="button"
          onClick={() => onSelectPreset('all')}
          style={{
            padding: '0.75rem 0.6rem',
            borderRadius: '10px',
            border: preset === 'all' ? '1.5px solid #38bdf8' : '1px solid var(--border-subtle)',
            background: preset === 'all' ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-box)',
            color: preset === 'all' ? 'var(--text-main)' : 'var(--text-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'all' ? '#38bdf8' : 'var(--text-main)' }}>
            📦 All Samples
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {samplesCount} total items
          </div>
        </button>

        {/* Preset 2: Male Voices Only */}
        <button
          type="button"
          onClick={() => onSelectPreset('male')}
          style={{
            padding: '0.75rem 0.6rem',
            borderRadius: '10px',
            border: preset === 'male' ? '1.5px solid #3b82f6' : '1px solid var(--border-subtle)',
            background: preset === 'male' ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-box)',
            color: preset === 'male' ? 'var(--text-main)' : 'var(--text-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'male' ? '#60a5fa' : 'var(--text-main)', display: 'center', alignItems: 'center', gap: '4px' }}>
            👨 Male Voices
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {maleCount} items in dataset
          </div>
        </button>

        {/* Preset 3: Female Voices Only */}
        <button
          type="button"
          onClick={() => onSelectPreset('female')}
          style={{
            padding: '0.75rem 0.6rem',
            borderRadius: '10px',
            border: preset === 'female' ? '1.5px solid #ec4899' : '1px solid var(--border-subtle)',
            background: preset === 'female' ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg-box)',
            color: preset === 'female' ? 'var(--text-main)' : 'var(--text-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'female' ? '#f472b6' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            👩 Female Voices
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {femaleCount} items in dataset
          </div>
        </button>

        {/* Preset 4: Current Filter / Search View */}
        <button
          type="button"
          onClick={() => onSelectPreset('current')}
          style={{
            padding: '0.75rem 0.6rem',
            borderRadius: '10px',
            border: preset === 'current' ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
            background: preset === 'current' ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-box)',
            color: preset === 'current' ? 'var(--text-main)' : 'var(--text-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'current' ? '#34d399' : 'var(--text-main)' }}>
            🎯 Current View
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {currentFilteredCount} filtered items
          </div>
        </button>

        {/* Preset 5: Custom Filters */}
        <button
          type="button"
          onClick={() => onSelectPreset('custom')}
          style={{
            padding: '0.75rem 0.6rem',
            borderRadius: '10px',
            border: preset === 'custom' ? '1.5px solid #a855f7' : '1px solid var(--border-subtle)',
            background: preset === 'custom' ? 'rgba(168, 85, 247, 0.18)' : 'var(--bg-box)',
            color: preset === 'custom' ? 'var(--text-main)' : 'var(--text-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'custom' ? '#c084fc' : 'var(--text-main)' }}>
            ⚙️ Custom
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Detailed selectors
          </div>
        </button>
      </div>
    </div>
  );
};
