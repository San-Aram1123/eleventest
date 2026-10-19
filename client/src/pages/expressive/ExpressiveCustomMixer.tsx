import React, { useState } from 'react';
import { Sliders, Sparkles, Zap, Flame, Play, RefreshCw, Volume2 } from 'lucide-react';
import { 
  EXTENDED_EMOTIONS, 
  DRAMATIC_MIX_PRESETS, 
  CustomMixPreset, 
  buildCustomMixDirective 
} from './expressiveExtendedConstants';

interface ExpressiveCustomMixerProps {
  onGenerateCustom: (config: {
    emotionA: string;
    intensityA: number;
    emotionB: string;
    intensityB: number;
    delivery: 'normal' | 'whisper' | 'laughing_speech';
    label: string;
    directive: string;
  }) => void;
  isGenerating: boolean;
}

export const ExpressiveCustomMixer: React.FC<ExpressiveCustomMixerProps> = ({
  onGenerateCustom,
  isGenerating
}) => {
  const [emotionA, setEmotionA] = useState('angry');
  const [intensityA, setIntensityA] = useState(0.85);
  const [emotionB, setEmotionB] = useState('sad');
  const [intensityB, setIntensityB] = useState(0.40);
  const [delivery, setDelivery] = useState<'normal' | 'whisper' | 'laughing_speech'>('normal');
  const [customContext, setCustomContext] = useState('');

  const metaA = EXTENDED_EMOTIONS.find(e => e.id === emotionA) || EXTENDED_EMOTIONS[0];
  const metaB = EXTENDED_EMOTIONS.find(e => e.id === emotionB) || EXTENDED_EMOTIONS[1];

  const handleApplyPreset = (p: CustomMixPreset) => {
    setEmotionA(p.emotionA);
    setIntensityA(p.intensityA);
    setEmotionB(p.emotionB);
    setIntensityB(p.intensityB);
    setDelivery(p.delivery);
    setCustomContext(p.context);
  };

  const handleTrigger = () => {
    const directive = buildCustomMixDirective(emotionA, intensityA, emotionB, intensityB, delivery, customContext);
    const label = `${metaA.name} (${Math.round(intensityA * 100)}%) + ${metaB.name} (${Math.round(intensityB * 100)}%) [${delivery}]`;
    onGenerateCustom({
      emotionA,
      intensityA,
      emotionB,
      intensityB,
      delivery,
      label,
      directive
    });
  };

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
      {/* Header & Preset Recipes */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Sliders size={18} style={{ color: '#06B6D4' }} />
            Custom Dual-Emotion Mixer & Continuous Sliders
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Mix any 2 emotions with independent intensity</span>
        </div>

        {/* Dramatic Preset Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>Recipes:</span>
          {DRAMATIC_MIX_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}
              title={p.context}
            >
              <Zap size={11} style={{ color: '#F59E0B', marginRight: '4px' }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: 'var(--bg-box)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        {/* Emotion A Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: metaA.color }}>
              Primary Emotion (A): {metaA.kurdishName}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {Math.round(intensityA * 100)}% ({intensityA.toFixed(2)})
            </span>
          </div>

          <select
            value={emotionA}
            onChange={e => setEmotionA(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '8px' }}
          >
            {EXTENDED_EMOTIONS.map(e => (
              <option key={e.id} value={e.id}>{e.name} — {e.kurdishName}</option>
            ))}
          </select>

          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={intensityA}
            onChange={e => setIntensityA(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: metaA.color, cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{metaA.description}</div>
        </div>

        {/* Emotion B Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: metaB.color }}>
              Secondary Emotion (B): {metaB.kurdishName}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {Math.round(intensityB * 100)}% ({intensityB.toFixed(2)})
            </span>
          </div>

          <select
            value={emotionB}
            onChange={e => setEmotionB(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '8px' }}
          >
            {EXTENDED_EMOTIONS.map(e => (
              <option key={e.id} value={e.id}>{e.name} — {e.kurdishName}</option>
            ))}
          </select>

          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={intensityB}
            onChange={e => setIntensityB(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: metaB.color, cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{metaB.description}</div>
        </div>
      </div>

      {/* Delivery Selector & Context */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Delivery:</span>
          {(['normal', 'whisper', 'laughing_speech'] as const).map(del => (
            <button
              key={del}
              onClick={() => setDelivery(del)}
              className={`btn btn-sm ${delivery === del ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}
            >
              {del === 'laughing_speech' ? 'Laughing' : del}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Optional acting notes (e.g. bitterly laughing at betrayal)"
          value={customContext}
          onChange={e => setCustomContext(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.82rem' }}
        />

        <button
          onClick={handleTrigger}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '0.85rem' }}
        >
          {isGenerating ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
          Test Custom Blend
        </button>
      </div>
    </div>
  );
};

