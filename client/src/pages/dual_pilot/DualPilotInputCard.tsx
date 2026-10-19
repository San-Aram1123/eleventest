import React, { useRef } from 'react';
import { Bot, Sparkles, Upload, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { CONTEXT_SWITCH_PRESETS } from '../../data/contextSwitchingPresets';
import { DualPilotLanguage, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';

interface DualPilotInputCardProps {
  geminiText: string;
  onChangeGeminiText: (text: string) => void;
  elevenText: string;
  onChangeElevenText: (text: string) => void;
  language: DualPilotLanguage;
  elevenVoiceSlots?: Array<{ voiceId: string; voiceName: string }>;
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
  elevenVoiceSlots,
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
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-medium)',
        borderTop: '1px solid var(--border-specular)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
      }}
    >
      {/* Apple Styled Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.015em' }}>Provider Input Paragraphs</span>
          <span className="badge" style={{ background: 'rgba(191, 90, 242, 0.12)', color: '#BF5AF2', border: '1px solid rgba(191, 90, 242, 0.3)', borderRadius: '9999px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
            Gemini: {geminiParagraphCount} lines
          </span>
          <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '9999px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
            ElevenLabs: {elevenParagraphCount} lines
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadSentencesToBoth}
            disabled={disabled}
            style={{ borderRadius: '9999px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)', color: '#0A84FF', fontWeight: 600, fontSize: '0.76rem' }}
          >
            <Sparkles size={13} />
            <span>Load 6 {langObj.name} to Both</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={copyGeminiToEleven}
            disabled={disabled || !geminiText}
            style={{ borderRadius: '9999px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.76rem' }}
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
            style={{ borderRadius: '9999px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.76rem' }}
          >
            <RotateCcw size={13} />
            <span>Clear Both</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Textarea Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Gemini Input Field */}
        <div style={{ background: 'rgba(191, 90, 242, 0.04)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(191, 90, 242, 0.22)', borderTop: '1px solid rgba(191, 90, 242, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(191, 90, 242, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} style={{ color: '#BF5AF2' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#BF5AF2', letterSpacing: '-0.01em' }}>Gemini 3.8 Paragraphs</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>({Math.ceil(geminiParagraphCount / 6) || 0} chunk)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input type="file" ref={gFileInputRef} onChange={e => handleFileUpload(e, onChangeGeminiText)} accept=".txt" style={{ display: 'none' }} disabled={disabled} />
              <button type="button" className="btn btn-secondary" onClick={() => gFileInputRef.current?.click()} disabled={disabled} title="Upload .txt for Gemini" style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}>
                <Upload size={12} />
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onChangeGeminiText('')} disabled={!geminiText || disabled} title="Clear Gemini text" style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}>
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
              padding: '0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(191, 90, 242, 0.25)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              lineHeight: '1.55',
              fontFamily: langObj.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, inherit' : 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease'
            }}
            dir={langObj.direction}
          />
        </div>

        {/* ElevenLabs Input Field */}
        <div style={{ background: 'rgba(48, 209, 88, 0.04)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(48, 209, 88, 0.22)', borderTop: '1px solid rgba(48, 209, 88, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={13} style={{ color: '#30D158' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#30D158', letterSpacing: '-0.01em' }}>ElevenLabs v4 Paragraphs</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>({elevenParagraphCount} takes)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input type="file" ref={eFileInputRef} onChange={e => handleFileUpload(e, onChangeElevenText)} accept=".txt" style={{ display: 'none' }} disabled={disabled} />
              <button type="button" className="btn btn-secondary" onClick={() => eFileInputRef.current?.click()} disabled={disabled} title="Upload .txt for ElevenLabs" style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-box)', border: '1px solid var(--border-subtle)' }}>
                <Upload size={12} />
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onChangeElevenText('')} disabled={!elevenText || disabled} title="Clear ElevenLabs text" style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-box)', border: '1px solid var(--border-subtle)' }}>
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
              padding: '0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(48, 209, 88, 0.25)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              lineHeight: '1.55',
              fontFamily: langObj.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, inherit' : 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease'
            }}
            dir={langObj.direction}
          />
        </div>
      </div>

      {/* Turn Preview for Matching Lines */}
      {previewCount > 0 && (
        <div style={{ background: 'var(--bg-box)', padding: '0.75rem 0.95rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            Alternating Gender & Voice Assignment (Line 1 Female, Line 2 Male...):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '0.45rem' }}>
            {Array.from({ length: previewCount }).map((_, idx) => {
              const isFemale = idx % 2 === 0;
              const genderColor = isFemale ? '#FF375F' : '#0A84FF';
              const genderLabel = isFemale ? 'Female' : 'Male';
              const geminiVoice = isFemale ? geminiFemaleVoice : geminiMaleVoice;
              const elevenVoice = elevenVoiceSlots?.[idx % 6]?.voiceName || (isFemale ? elevenFemaleVoiceName : elevenMaleVoiceName);
              const gPreview = gLines[idx] || '(No Gemini line)';
              const ePreview = eLines[idx] || '(No ElevenLabs line)';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    padding: '0.45rem 0.65rem',
                    background: 'var(--bg-box-subtle)',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ padding: '2px 7px', borderRadius: '9999px', background: `${genderColor}18`, color: genderColor, fontWeight: 700, border: `1px solid ${genderColor}35`, fontSize: '0.7rem' }}>
                      L{idx + 1} ({genderLabel}): G: {geminiVoice} | 11: {elevenVoice}
                    </span>
                  </div>
                  <div style={{ color: '#BF5AF2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={langObj.direction}>
                    G: {gPreview}
                  </div>
                  <div style={{ color: '#30D158', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir={langObj.direction}>
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
