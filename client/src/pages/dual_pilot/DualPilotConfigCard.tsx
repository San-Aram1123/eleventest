import React, { useMemo } from 'react';
import { Bot, Sparkles, Layers, CheckCircle2, Globe, Zap, Database } from 'lucide-react';
import { DualPilotConfig, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';
import { V20_PRESET_TIERS, V20_ALL_50_EMOTIONS } from './v20Conditions';
import { GeminiVoiceInfo } from './dualPilotApi';

interface VoiceOption {
  voice_id: string;
  name: string;
}

interface DualPilotConfigCardProps {
  config: DualPilotConfig;
  onChangeConfig: (updater: (prev: DualPilotConfig) => DualPilotConfig) => void;
  geminiVoices: Array<string | GeminiVoiceInfo>;
  elevenVoices: VoiceOption[];
  disabled?: boolean;
}

export const DualPilotConfigCard: React.FC<DualPilotConfigCardProps> = ({
  config,
  onChangeConfig,
  geminiVoices,
  elevenVoices,
  disabled = false
}) => {
  const activePreset = V20_PRESET_TIERS.find(p => p.id === config.selectedPresetId) || V20_PRESET_TIERS[0];

  const normalizedGemini = useMemo(() => {
    return geminiVoices.map(v => typeof v === 'string'
      ? { id: v, name: v, gender: 'unknown', desc: '' }
      : { id: v.id || v.name || '', name: v.name || v.id || '', gender: v.gender || 'unknown', desc: v.description || '' }
    );
  }, [geminiVoices]);

  const femaleGeminiVoices = useMemo(() => {
    const list = normalizedGemini.filter(v => v.gender?.toLowerCase() === 'female');
    return list.length > 0 ? list : normalizedGemini;
  }, [normalizedGemini]);

  const maleGeminiVoices = useMemo(() => {
    const list = normalizedGemini.filter(v => v.gender?.toLowerCase() === 'male');
    return list.length > 0 ? list : normalizedGemini;
  }, [normalizedGemini]);

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Target Language & Dialect Selector */}
      <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} style={{ color: '#38BDF8' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Target Language / Dialect</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Directs Gemini 3.8 and ElevenLabs v4 with authentic native phonetics and regional intonation.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
          {DUAL_PILOT_LANGUAGES.map(lang => {
            const isSelected = lang.id === config.language;
            return (
              <div
                key={lang.id}
                onClick={() => !disabled && onChangeConfig(prev => ({
                  ...prev,
                  language: lang.id,
                  dialect: lang.id === 'kmr' ? 'badini' : 'sorani'
                }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                  border: isSelected ? '2px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>{lang.name}</div>
                  <div style={{ fontSize: '0.74rem', color: isSelected ? '#7DD3FC' : '#94A3B8', fontFamily: 'Noto Naskh Arabic, Tahoma, inherit' }} dir={lang.direction}>{lang.nativeName}</div>
                </div>
                {isSelected && <CheckCircle2 size={16} style={{ color: '#38BDF8' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Preset Tier Selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} className="text-primary" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Automated Condition Matrix Tier</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            The batch runner automatically iterates through all conditions in the selected tier.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
          {V20_PRESET_TIERS.map(tier => {
            const isSelected = tier.id === config.selectedPresetId;
            return (
              <div
                key={tier.id}
                onClick={() => !disabled && onChangeConfig(prev => ({ ...prev, selectedPresetId: tier.id }))}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                  border: isSelected ? `2px solid ${tier.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px', padding: '0.75rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>{tier.name}</span>
                  <span style={{ padding: '1px 6px', borderRadius: '4px', background: `${tier.badgeColor}33`, color: tier.badgeColor, fontSize: '0.72rem', fontWeight: 700 }}>
                    {tier.conditionCount} Conds
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.4 }}>{tier.description}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Test Single Emotion Picker (ONLY for 1-Emotion Tier) */}
        {config.selectedPresetId === 'quick_smoke1' && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} style={{ color: '#34D399' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A7F3D0' }}>Quick Test Emotion:</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>(Select which emotion to test)</span>
            </div>
            <select
              className="select select-sm"
              value={config.smokeEmotion || 'neutral'}
              onChange={e => onChangeConfig(prev => ({ ...prev, smokeEmotion: e.target.value }))}
              disabled={disabled}
              style={{ minWidth: '240px', fontSize: '0.82rem' }}
            >
              {V20_ALL_50_EMOTIONS.map(emo => (
                <option key={emo.key} value={emo.key}>
                  {emo.name} ({emo.sorani}) [{emo.key}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Auto-Save to Dataset Manager Toggle */}
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: '#E2E8F0', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={config.saveToDataset !== false}
              onChange={e => onChangeConfig(prev => ({ ...prev, saveToDataset: e.target.checked }))}
              disabled={disabled}
              style={{ accentColor: '#10B981', width: '15px', height: '15px' }}
            />
            <Database size={14} style={{ color: config.saveToDataset !== false ? '#34D399' : '#64748B' }} />
            <span>Automatically register generated takes into <strong>Dataset Manager</strong> (MySQL &amp; disk)</span>
          </label>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: config.saveToDataset !== false ? '#34D399' : '#94A3B8' }}>
            {config.saveToDataset !== false ? '● Auto-Save ON' : '○ In-Memory Only'}
          </span>
        </div>
      </div>

      {/* Side-by-Side Voice Actor Setup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        
        {/* Gemini Provider Column */}
        <div style={{ background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={18} style={{ color: '#A78BFA' }} />
              <span style={{ fontWeight: 700, color: '#DDD6FE', fontSize: '0.95rem' }}>Google Gemini TTS</span>
            </div>
            <span className="badge" style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED55', fontSize: '0.7rem' }}>
              gemini-3.8-flash-tts
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '0.85rem' }}>
            Chunks of 6 sentences in 1 call • Segmented by all 7 neural slicing engines (auto-selecting best cut).
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Line 1,3,5: Female Voice
              </label>
              <select
                className="select"
                value={config.geminiFemaleVoice}
                onChange={e => onChangeConfig(prev => ({ ...prev, geminiFemaleVoice: e.target.value }))}
                disabled={disabled}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                {femaleGeminiVoices.map(v => (
                  <option key={`g_f_${v.id}`} value={v.id}>
                    {v.name} {v.desc ? `(${v.desc})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Line 2,4,6: Male Voice
              </label>
              <select
                className="select"
                value={config.geminiMaleVoice}
                onChange={e => onChangeConfig(prev => ({ ...prev, geminiMaleVoice: e.target.value }))}
                disabled={disabled}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                {maleGeminiVoices.map(v => (
                  <option key={`g_m_${v.id}`} value={v.id}>
                    {v.name} {v.desc ? `(${v.desc})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ElevenLabs Provider Column */}
        <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#34D399' }} />
              <span style={{ fontWeight: 700, color: '#A7F3D0', fontSize: '0.95rem' }}>ElevenLabs Engine</span>
            </div>
            <span className="badge" style={{ background: '#10B98122', color: '#34D399', border: '1px solid #10B98155', fontSize: '0.7rem' }}>
              eleven_v4_turbo
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '0.85rem' }}>
            1 paragraph per call (concurrency = 2) • Rotating through API key pool without request limits.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Line 1,3,5: Female Voice
              </label>
              <select
                className="select"
                value={config.elevenFemaleVoiceId}
                onChange={e => {
                  const sel = elevenVoices.find(v => v.voice_id === e.target.value);
                  onChangeConfig(prev => ({
                    ...prev,
                    elevenFemaleVoiceId: e.target.value,
                    elevenFemaleVoiceName: sel?.name || e.target.value
                  }));
                }}
                disabled={disabled}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                {elevenVoices.map(v => (
                  <option key={`e_f_${v.voice_id}`} value={v.voice_id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Line 2,4,6: Male Voice
              </label>
              <select
                className="select"
                value={config.elevenMaleVoiceId}
                onChange={e => {
                  const sel = elevenVoices.find(v => v.voice_id === e.target.value);
                  onChangeConfig(prev => ({
                    ...prev,
                    elevenMaleVoiceId: e.target.value,
                    elevenMaleVoiceName: sel?.name || e.target.value
                  }));
                }}
                disabled={disabled}
                style={{ width: '100%', fontSize: '0.82rem' }}
              >
                {elevenVoices.map(v => (
                  <option key={`e_m_${v.voice_id}`} value={v.voice_id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
