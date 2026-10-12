import React from 'react';
import {
  Shuffle,
  RefreshCw,
  Sliders,
  ChevronUp,
  ChevronDown,
  Globe2,
  Dices,
  Volume2
} from 'lucide-react';
import { GeminiVoice } from '../../types';
import { SplitterVoiceStrategy, SplitterConfigPanelProps } from './splitterTypes';
import {
  PACKET_SIZE_OPTIONS,
  BADINI_DIRECTIVE,
  SORANI_DIRECTIVE,
  getTrilingualDirective
} from './splitterConstants';

export const SplitterConfigPanel: React.FC<SplitterConfigPanelProps> = ({
  selectedModel,
  setSelectedModel,
  isResettingCooldowns,
  handleResetCooldowns,
  dialect,
  handleDialectSelect,
  defaultEmotion,
  setDefaultEmotion,
  showPromptSettings,
  setShowPromptSettings,
  splitterPromptInstruction,
  setSplitterPromptInstruction,
  voiceStrategy,
  setVoiceStrategy,
  voices,
  selectedVoice,
  setSelectedVoice,
  packetSize,
  handlePacketSizeChange,
  packetsCount,
  allParagraphsCount,
  workflowMode,
  setWorkflowMode,
  children
}) => {
  const femaleVoices = voices.filter(v => v.gender === 'Female');
  const maleVoices = voices.filter(v => v.gender === 'Male');

  const STRATEGIES: { id: SplitterVoiceStrategy; label: string; desc: string; icon: any; color: string; border: string; bg: string }[] = [
    { id: 'mix_gender', label: '⚖ 50/50 Mix Gender', desc: 'Alternates ♀ / ♂', icon: Dices, color: '#C084FC', border: 'rgba(192, 132, 252, 0.4)', bg: 'rgba(192, 132, 252, 0.2)' },
    { id: 'random_female', label: '♀ Random Female', desc: `${femaleVoices.length} Female Voices`, icon: Shuffle, color: '#F472B6', border: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.2)' },
    { id: 'random_male', label: '♂ Random Male', desc: `${maleVoices.length} Male Voices`, icon: Shuffle, color: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(56, 189, 248, 0.2)' },
    { id: 'fixed', label: 'Fixed Voice', desc: 'Use Selected Below', icon: Volume2, color: 'var(--text-main)', border: 'rgba(255, 255, 255, 0.2)', bg: 'rgba(255, 255, 255, 0.08)' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shuffle size={18} className="text-cyan" />
          <span className="card-title">Voice Strategy and Packet Sizing</span>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Gemini Model (Strictly Gemini 3.8 / 3.1, NO Gemini 2.5) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="field-label" style={{ margin: 0 }}>Gemini TTS Model:</label>
            <button
              type="button"
              onClick={handleResetCooldowns}
              disabled={isResettingCooldowns}
              className="chip-btn"
              style={{ fontSize: '0.7rem', padding: '2px 8px', color: '#38BDF8' }}
              title="Reset rate-limit cooldowns across all API keys"
            >
              <RefreshCw size={11} className={isResettingCooldowns ? 'spin' : ''} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Reset Cooldowns
            </button>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="select"
            style={{ width: '100%', padding: '6px 8px', fontSize: '0.84rem' }}
          >
            <option value="gemini-3.8-flash-tts">Gemini 3.8 Flash TTS (Default)</option>
            <option value="gemini-3.8-flash-lite-tts">Gemini 3.8 Flash-Lite TTS</option>
            <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS</option>
          </select>
        </div>

        {/* Dialect */}
        <div>
          <label className="field-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Kurdish Dialect:</span>
            <span style={{ fontSize: '0.72rem', color: dialect === 'badini' ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 600 }}>
              {dialect === 'badini' ? 'Duhok / Kurmanji' : 'Erbil / Sorani'}
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${dialect === 'sorani' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleDialectSelect('sorani')}
            >
              Sorani (سۆرانی)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dialect === 'badini' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleDialectSelect('badini')}
            >
              Badini (بادینی)
            </button>
          </div>
        </div>

        {/* Default Emotion Fallback */}
        <div>
          <label className="field-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Default Emotion (Fallback):</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Inline [tags] take priority</span>
          </label>
          <select
            value={defaultEmotion}
            onChange={(e) => setDefaultEmotion(e.target.value)}
            className="select"
            style={{ width: '100%', padding: '6px 8px', fontSize: '0.86rem' }}
          >
            {['neutral', 'whisper', 'happy', 'calm', 'excited', 'laugh', 'sad', 'angry', 'nervous'].map(em => (
              <option key={em} value={em}>Auto-detect from [tags] (Fallback: {em})</option>
            ))}
          </select>
        </div>

        {/* Dialect Directives & 3-Language Prompt Settings */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowPromptSettings(prev => !prev)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, padding: 0 }}
            >
              <Sliders size={14} className="text-cyan" />
              <span>Directives & 3-Language Prompt</span>
              {showPromptSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <span style={{ fontSize: '0.7rem', color: splitterPromptInstruction ? 'var(--warning)' : 'var(--success)', fontWeight: 500 }}>
              {splitterPromptInstruction ? 'Custom Directives' : 'Auto-Optimized'}
            </span>
          </div>

          {showPromptSettings && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button type="button" className="chip-btn" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => setSplitterPromptInstruction('')}>
                  ⚡ Reset Auto
                </button>
                <button type="button" className="chip-btn" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => setSplitterPromptInstruction(dialect === 'badini' ? BADINI_DIRECTIVE : SORANI_DIRECTIVE)}>
                  {dialect === 'badini' ? 'Badini Directive' : 'Sorani Directive'}
                </button>
                <button type="button" className="chip-btn" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => setSplitterPromptInstruction(getTrilingualDirective(dialect))}>
                  <Globe2 size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                  Trilingual Directive
                </button>
              </div>
              <textarea
                className="input-control"
                rows={3}
                placeholder="Dialect directives..."
                value={splitterPromptInstruction}
                onChange={(e) => setSplitterPromptInstruction(e.target.value)}
                style={{ fontSize: '0.78rem', fontFamily: 'monospace', width: '100%', resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        {/* Voice Strategy Buttons */}
        <div>
          <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>Packet Voice Allocation Strategy:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {STRATEGIES.map(st => {
              const active = voiceStrategy === st.id;
              const Icon = st.icon;
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`btn btn-xs ${active ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setVoiceStrategy(st.id)}
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    border: `1px solid ${active ? st.color : st.border}`,
                    background: active ? st.bg : 'rgba(255, 255, 255, 0.03)',
                    color: st.color
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Icon size={13} />
                    <span>{st.label}</span>
                  </div>
                  <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {voiceStrategy === 'fixed' && (
          <div>
            <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>Selected Single Voice:</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="select"
              style={{ width: '100%', padding: '6px 8px', fontSize: '0.86rem' }}
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.gender}) — {v.description}</option>
              ))}
            </select>
          </div>
        )}

        {/* Packet Size */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="field-label" style={{ margin: 0 }}>Packet Size (Paragraphs per Call):</label>
            <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>{packetsCount} packet{packetsCount > 1 ? 's' : ''} total</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {PACKET_SIZE_OPTIONS.map(num => (
              <button
                key={num}
                type="button"
                className={`btn btn-xs ${packetSize === num ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handlePacketSizeChange(num)}
                style={{ padding: '6px 2px', fontWeight: 700, fontSize: '0.74rem' }}
              >
                {num} Chunks
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Processes up to {packetSize} paragraphs per request ({allParagraphsCount} samples in active file).
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <button
            type="button"
            className={`btn btn-xs ${workflowMode === 'automated_batch' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setWorkflowMode('automated_batch')}
            style={{ flex: 1 }}
          >
            ⚡ Automated Batch Runner
          </button>
          <button
            type="button"
            className={`btn btn-xs ${workflowMode === 'manual_review' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setWorkflowMode('manual_review')}
            style={{ flex: 1 }}
          >
            🔍 Single-Packet Manual Review
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
