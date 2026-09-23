import React from 'react';
import { Smile, Sliders, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { REQUIRED_EMOTIONS, OPTIONAL_EMOTIONS } from './pairedConstants';
import { SelectedEmotion } from './types';

interface EmotionSelectorSectionProps {
  emotions: Record<string, SelectedEmotion>;
  onChange: (emotions: Record<string, SelectedEmotion>) => void;
}

export const EmotionSelectorSection: React.FC<EmotionSelectorSectionProps> = ({
  emotions,
  onChange
}) => {
  const toggleEmotion = (id: string) => {
    const current = emotions[id];
    onChange({
      ...emotions,
      [id]: {
        ...current,
        enabled: !current.enabled
      }
    });
  };

  const updateIntensity = (id: string, intensity: number) => {
    onChange({
      ...emotions,
      [id]: {
        ...emotions[id],
        intensity
      }
    });
  };

  const selectAllRequired = () => {
    const updated = { ...emotions };
    for (const req of REQUIRED_EMOTIONS) {
      updated[req.id] = {
        emotion: req.id,
        intensity: req.defaultIntensity,
        enabled: true
      };
    }
    onChange(updated);
  };

  const resetDefaults = () => {
    const updated: Record<string, SelectedEmotion> = {};
    for (const req of REQUIRED_EMOTIONS) {
      updated[req.id] = { emotion: req.id, intensity: req.defaultIntensity, enabled: true };
    }
    for (const opt of OPTIONAL_EMOTIONS) {
      updated[opt.id] = { emotion: opt.id, intensity: opt.defaultIntensity, enabled: false };
    }
    onChange(updated);
  };

  const enabledCount = Object.values(emotions).filter(e => e.enabled).length;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Smile size={18} className="text-primary" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Target Emotions & Intensities</h3>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            {enabledCount} emotions active
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={selectAllRequired}
            style={{ fontSize: '0.75rem' }}
          >
            <CheckSquare size={13} /> Select 6 Required
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={resetDefaults}
            title="Reset intensities to defaults"
            style={{ fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* 1. Required Emotions Grid */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem' }}>
          REQUIRED EMOTIONS (6)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
          {REQUIRED_EMOTIONS.map((emo) => {
            const current = emotions[emo.id] || { emotion: emo.id, intensity: emo.defaultIntensity, enabled: true };
            return (
              <div
                key={emo.id}
                style={{
                  background: current.enabled ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${current.enabled ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleEmotion(emo.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {current.enabled ? <CheckSquare size={15} color="#38bdf8" /> : <Square size={15} color="#64748b" />}
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emo.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({emo.kurdish})</span>
                  </div>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>
                    {Number(current.intensity).toFixed(1)}
                  </span>
                </div>

                {current.enabled && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      value={current.intensity}
                      onChange={(e) => updateIntensity(emo.id, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Optional Extra Emotions Grid */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
          OPTIONAL EXTRA EMOTIONS (5)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
          {OPTIONAL_EMOTIONS.map((emo) => {
            const current = emotions[emo.id] || { emotion: emo.id, intensity: emo.defaultIntensity, enabled: false };
            return (
              <div
                key={emo.id}
                style={{
                  background: current.enabled ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${current.enabled ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem'
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleEmotion(emo.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {current.enabled ? <CheckSquare size={15} color="#c084fc" /> : <Square size={15} color="#64748b" />}
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emo.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({emo.kurdish})</span>
                  </div>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>
                    {Number(current.intensity).toFixed(1)}
                  </span>
                </div>

                {current.enabled && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      value={current.intensity}
                      onChange={(e) => updateIntensity(emo.id, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#c084fc' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
