import React, { useState } from 'react';
import { Languages, Tag, CheckCircle2, Globe2, Mic, Search, Sliders, RefreshCw, Sparkles } from 'lucide-react';
import { KurdishDialect, GeminiVoice, GeminiModel } from '../../../types';
import { GEMINI_EMOTION_TAGS } from '../constants';
import { SORANI_PRESETS, BADINI_PRESETS } from '../presets';

interface GeminiSinglePromptFormProps {
  dialect: KurdishDialect;
  onDialectChange: (dialect: KurdishDialect) => void;
  text: string;
  setText: (text: string) => void;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onInsertTag: (tag: string) => void;
  voices: GeminiVoice[];
  models: GeminiModel[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customInstruction: string;
  setCustomInstruction: (instruction: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const GeminiSinglePromptForm: React.FC<GeminiSinglePromptFormProps> = ({
  dialect,
  onDialectChange,
  text,
  setText,
  textareaRef,
  onInsertTag,
  voices,
  models,
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  customInstruction,
  setCustomInstruction,
  isGenerating,
  onGenerate
}) => {
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [voiceSearch, setVoiceSearch] = useState('');

  const currentPresets = dialect === 'badini' ? BADINI_PRESETS : SORANI_PRESETS;
  const filteredVoices = voices.filter(v => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false;
    if (voiceSearch.trim()) {
      const q = voiceSearch.toLowerCase().trim();
      return v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
    }
    return true;
  });

  const withoutTags = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, ' ');
  const hasLatin = /[a-zA-Z]/.test(withoutTags);
  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(withoutTags);
  const startsWithLatin = /[a-zA-Z]/.test(withoutTags.trim().match(/^[^\p{L}\p{N}]*([\p{L}\p{N}])/u)?.[1] || '');

  return (
    <div className="studio-left">
      {/* Dialect Selector Card */}
      <div className="card dialect-card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Languages size={18} className="text-cyan" />
            <span className="card-title">Kurdish Dialect Selection (زارەڤێ کوردی)</span>
          </div>
          <span className="badge badge-purple">
            {dialect === 'sorani' ? 'Central Kurdish' : 'Northern Kurmanji'}
          </span>
        </div>
        <div className="card-body">
          <div className="dialect-grid">
            <button
              type="button"
              className={`dialect-box ${dialect === 'sorani' ? 'dialect-box-active' : ''}`}
              onClick={() => onDialectChange('sorani')}
            >
              <div className="dialect-box-top">
                <strong className="dialect-box-title">Sorani (سۆرانی)</strong>
                {dialect === 'sorani' && <CheckCircle2 size={16} className="text-cyan" />}
              </div>
              <p className="dialect-box-desc">
                Central Kurdish (Erbil, Sulaymaniyah, Halabja, Mukriyan). Vowels: ۆ, ێ, ە
              </p>
            </button>
            <button
              type="button"
              className={`dialect-box ${dialect === 'badini' ? 'dialect-box-active' : ''}`}
              onClick={() => onDialectChange('badini')}
            >
              <div className="dialect-box-top">
                <strong className="dialect-box-title">Badini (بادینی / بهدینی)</strong>
                {dialect === 'badini' && <CheckCircle2 size={16} className="text-cyan" />}
              </div>
              <p className="dialect-box-desc">
                Northern Kurmanji (Duhok, Zakho, Amadiya, Akre). Sounds: ڤ, خ، ح، غ
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Emotions Toolbar */}
      <div className="card emotion-tags-card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} className="text-cyan" />
            <span className="card-title">Inline Emotional Cues & Vocal Effects</span>
          </div>
          <span style={{ fontSize: '0.76rem', color: '#38BDF8' }}>Inserts at cursor location</span>
        </div>
        <div className="card-body">
          <div className="emotion-chips-grid">
            {GEMINI_EMOTION_TAGS.map((em) => (
              <button
                key={em.tag}
                type="button"
                className="emotion-tag-chip"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertTag(em.tag)}
                title={em.desc}
                style={{ borderColor: `${em.color}40` }}
              >
                <span className="tag-pill" style={{ background: `${em.color}25`, color: em.color }}>{em.tag}</span>
                <span className="tag-name">{em.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kurdish Textarea */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Languages size={18} className="text-cyan" />
            <span className="card-title">{dialect === 'badini' ? 'Badini Kurdish Text' : 'Sorani Kurdish Text'}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{text.length} characters</span>
        </div>
        <div className="card-body">
          <div className="preset-chips">
            <span className="preset-label">{dialect === 'badini' ? 'نموونەیێن بادینی:' : 'نموونەکانی سۆرانی:'}</span>
            {currentPresets.map((p, idx) => (
              <button key={idx} type="button" className="chip-btn" onClick={() => setText(p.text)} title={p.text}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '12px' }}>
            <textarea
              ref={textareaRef}
              className="input-control text-area-kurdish"
              dir="auto"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={dialect === 'badini' ? 'دەقێ بادینی ل ڤێرە بنڤیسە...' : 'دەقی سۆرانی لێرە بنووسە...'}
            />
          </div>
          {hasLatin && hasArabicScript && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '8px', fontSize: '0.78rem', color: '#38BDF8', marginTop: '10px' }}>
              <Globe2 size={16} style={{ flexShrink: 0, color: '#22D3EE' }} />
              <div>
                <strong>Multilingual Code-Switching Active:</strong> Detected mixed English + Kurdish. {startsWithLatin ? 'Initial English sentence will be spoken immediately in English.' : 'Languages will switch seamlessly.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice & Model Grid */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={18} className="text-cyan" />
            <span className="card-title">Select Voice ({voices.length}) & Model</span>
          </div>
          <select
            className="input-control select-model-dropdown"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem', height: '32px' }}
          >
            {models.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
          </select>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button type="button" className={`btn btn-xs ${genderFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGenderFilter('all')} style={{ fontSize: '0.74rem', padding: '3px 9px' }}>All ({voices.length})</button>
              <button type="button" className={`btn btn-xs ${genderFilter === 'Male' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGenderFilter('Male')} style={{ fontSize: '0.74rem', padding: '3px 9px', color: genderFilter === 'Male' ? undefined : '#60A5FA' }}>♂ Male ({voices.filter(v => v.gender === 'Male').length})</button>
              <button type="button" className={`btn btn-xs ${genderFilter === 'Female' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGenderFilter('Female')} style={{ fontSize: '0.74rem', padding: '3px 9px', color: genderFilter === 'Female' ? undefined : '#F472B6' }}>♀ Female ({voices.filter(v => v.gender === 'Female').length})</button>
            </div>
            <div style={{ position: 'relative', minWidth: '180px', flex: '1', maxWidth: '260px' }}>
              <input type="text" className="input-control" placeholder="Search voices..." value={voiceSearch} onChange={(e) => setVoiceSearch(e.target.value)} style={{ fontSize: '0.78rem', height: '28px', padding: '2px 8px 2px 26px' }} />
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              {voiceSearch && (<button type="button" onClick={() => setVoiceSearch('')} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>×</button>)}
            </div>
          </div>
          <div className="voice-grid" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', paddingBottom: '4px' }}>
            {filteredVoices.map((v) => (
              <div key={v.id} className={`voice-card ${selectedVoice === v.id ? 'voice-card-active' : ''}`} onClick={() => setSelectedVoice(v.id)}>
                <div className="voice-card-top">
                  <strong className="voice-name">{v.name}</strong>
                  <span className={`gender-badge ${v.gender === 'Female' ? 'badge-pink' : 'badge-blue'}`}>{v.gender === 'Female' ? '♀ Female' : '♂ Male'}</span>
                </div>
                <p className="voice-desc">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Prompt Instruction */}
      <div className="card">
        <div className="card-header">
          <Sliders size={18} className="text-cyan" />
          <span className="card-title">Dialect Accent & Pronunciation Directives</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="field-label" style={{ margin: 0 }}>System Prompt Directive:</label>
            <button
              type="button"
              className="chip-btn"
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              onClick={() => setCustomInstruction(`You are an expert multilingual voice actor and speech synthesizer proficient in English, Kurdish (${dialect === 'badini' ? 'Badini' : 'Sorani'}), and Arabic. Read aloud every single sentence completely without skipping. Seamlessly code-switch accents between English, Kurdish, and Arabic.`)}
            >
              <Globe2 size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Multilingual Directive
            </button>
          </div>
          <textarea
            className="input-control"
            rows={2}
            placeholder={dialect === 'badini' ? 'Auto-configured for native Duhok Badini pronunciation...' : 'Auto-configured for native Central Kurdish Sorani pronunciation...'}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
          />
        </div>
      </div>

      {/* Generate CTA Button */}
      <button
        type="button"
        className="btn btn-primary btn-lg generate-btn"
        onClick={onGenerate}
        disabled={isGenerating || !text.trim()}
      >
        {isGenerating ? (
          <>
            <RefreshCw size={20} className="spin" />
            <span>Synthesizing with {selectedVoice}...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Generate {dialect === 'badini' ? 'Badini' : 'Sorani'} Speech ({selectedVoice})</span>
          </>
        )}
      </button>
    </div>
  );
};
