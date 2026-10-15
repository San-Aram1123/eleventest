import React, { useRef } from 'react';
import { Bot, Sparkles, Upload, RotateCcw, Copy, ArrowRightLeft } from 'lucide-react';
import { CONTEXT_SWITCH_PRESETS } from '../../data/contextSwitchingPresets';
import { DualPilotLanguage, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';

interface DualPilotInputCardProps {
  geminiText: string;
  onChangeGeminiText: (text: string) => void;
  elevenText: string;
  onChangeElevenText: (text: string) => void;
  language: DualPilotLanguage;
  geminiFemaleVoice: string;
  geminiMaleVoice: string;
  elevenFemaleVoiceName: string;
  elevenMaleVoiceName: string;
  geminiParagraphCount: number;
  elevenParagraphCount: number;
  disabled?: boolean;
}

export const DualPilotInputCard: React.FC<DualPilotInputCardProps> = ({
  geminiText,
  onChangeGeminiText,
  elevenText,
  onChangeElevenText,
  language,
  geminiFemaleVoice,
  geminiMaleVoice,
  elevenFemaleVoiceName,
  elevenMaleVoiceName,
  geminiParagraphCount,
  elevenParagraphCount,
  disabled = false
}) => {
  const gFileInputRef = useRef<HTMLInputElement>(null);
  const eFileInputRef = useRef<HTMLInputElement>(null);

  const langObj = DUAL_PILOT_LANGUAGES.find(l => l.id === language) || DUAL_PILOT_LANGUAGES[0];

  const loadSentencesToBoth = () => {
    const textToLoad = langObj.sampleSentences.length > 0
      ? langObj.sampleSentences.join('\n\n')
      : CONTEXT_SWITCH_PRESETS.slice(0, 6).map(p => p.text).join('\n\n');
    onChangeGeminiText(textToLoad);
    onChangeElevenText(textToLoad);
  };

  const copyGeminiToEleven = () => {
    onChangeElevenText(geminiText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (t: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') setter(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const gLines = geminiText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const eLines = elevenText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const previewCount = Math.min(6, Math.max(gLines.length, eLines.length));

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Global Quick Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Provider Input Paragraphs</span>
          <span className="badge" style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED55' }}>
            Gemini: {geminiParagraphCount} lines
          </span>
          <span className="badge" style={{ background: '#10B98122', color: '#34D399', border: '1px solid #10B98155' }}>
            ElevenLabs: {elevenParagraphCount} lines
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadSentencesToBoth}
            disabled={disabled}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)' }}
          >
            <Sparkles size={13} style={{ color: '#818CF8' }} />
            <span>Load 6 {langObj.name} to Both</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={copyGeminiToEleven}
            disabled={disabled || !geminiText}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Copy Gemini paragraphs into ElevenLabs field"
          >
            <ArrowRightLeft size={13} />
            <span>Copy Gemini ➔ 11Labs</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => { onChangeGeminiText(''); onChangeElevenText(''); }}
            disabled={disabled || (!geminiText && !elevenText)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={13} />
            <span>Clear Both</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Textarea Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Gemini Input Field */}
        <div style={{ background: 'rgba(124, 58, 237, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bot size={16} style={{ color: '#A78BFA' }} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#DDD6FE' }}>Gemini 3.8 Paragraphs</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({Math.ceil(geminiParagraphCount / 6) || 0} chunk)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input type="file" ref={gFileInputRef} onChange={e => handleFileUpload(e, onChangeGeminiText)} accept=".txt" style={{ display: 'none' }} disabled={disabled} />
              <button type="button" className="btn btn-secondary btn-xs" onClick={() => gFileInputRef.current?.click()} disabled={disabled} title="Upload .txt for Gemini">
                <Upload size={12} />
              </button>
              <button type="button" className="btn btn-secondary btn-xs" onClick={() => onChangeGeminiText('')} disabled={!geminiText || disabled} title="Clear Gemini text">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={geminiText}
            onChange={e => onChangeGeminiText(e.target.value)}
            disabled={disabled}
            rows={5}
            placeholder={`Enter dialogue paragraphs for Gemini (chunks of 6 in 1 call)...`}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontSize: '0.88rem',
              lineHeight: '1.55',
              fontFamily: langObj.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, inherit' : 'inherit',
              resize: 'vertical'
            }}
            dir={langObj.direction}
          />
        </div>

        {/* ElevenLabs Input Field */}
        <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: '#34D399' }} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#A7F3D0' }}>ElevenLabs v4 Paragraphs</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({elevenParagraphCount} takes)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input type="file" ref={eFileInputRef} onChange={e => handleFileUpload(e, onChangeElevenText)} accept=".txt" style={{ display: 'none' }} disabled={disabled} />
              <button type="button" className="btn btn-secondary btn-xs" onClick={() => eFileInputRef.current?.click()} disabled={disabled} title="Upload .txt for ElevenLabs">
                <Upload size={12} />
              </button>
              <button type="button" className="btn btn-secondary btn-xs" onClick={() => onChangeElevenText('')} disabled={!elevenText || disabled} title="Clear ElevenLabs text">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={elevenText}
            onChange={e => onChangeElevenText(e.target.value)}
            disabled={disabled}
            rows={5}
            placeholder={`Enter paragraphs for ElevenLabs (1:1 individual takes with rotating keys)...`}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontSize: '0.88rem',
              lineHeight: '1.55',
              fontFamily: langObj.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, inherit' : 'inherit',
              resize: 'vertical'
            }}
            dir={langObj.direction}
          />
        </div>
      </div>

      {/* Turn Preview for Matching Lines */}
      {previewCount > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>
            Alternating Gender & Voice Assignment (Line 1 Female, Line 2 Male...):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '0.4rem' }}>
            {Array.from({ length: previewCount }).map((_, idx) => {
              const isFemale = idx % 2 === 0;
              const genderColor = isFemale ? '#EC4899' : '#3B82F6';
              const genderLabel = isFemale ? 'Female' : 'Male';
              const geminiVoice = isFemale ? geminiFemaleVoice : geminiMaleVoice;
              const elevenVoice = isFemale ? elevenFemaleVoiceName : elevenMaleVoiceName;
              const gPreview = gLines[idx] || '(No Gemini line)';
              const ePreview = eLines[idx] || '(No ElevenLabs line)';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '0.35rem 0.55rem',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '6px',
                    fontSize: '0.74rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ padding: '1px 5px', borderRadius: '4px', background: `${genderColor}22`, color: genderColor, fontWeight: 700, border: `1px solid ${genderColor}44` }}>
                      L{idx + 1} ({genderLabel}): G: {geminiVoice} | 11: {elevenVoice}
                    </span>
                  </div>
                  <div style={{ color: '#A78BFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={langObj.direction}>
                    G: {gPreview}
                  </div>
                  <div style={{ color: '#34D399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={langObj.direction}>
                    11: {ePreview}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
