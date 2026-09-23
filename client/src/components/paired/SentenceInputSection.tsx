import React, { useRef } from 'react';
import { Upload, FileText, Sparkles, Trash2, Globe2 } from 'lucide-react';
import { SAMPLE_SENTENCES_BY_LANG } from './pairedConstants';

interface SentenceInputSectionProps {
  text: string;
  onChange: (val: string) => void;
  language: 'ckb' | 'kmr' | 'ar' | 'en' | string;
  onLanguageChange: (val: 'ckb' | 'kmr' | 'ar' | 'en') => void;
  startIdx: number;
}

export const SentenceInputSection: React.FC<SentenceInputSectionProps> = ({
  text,
  onChange,
  language,
  onLanguageChange,
  startIdx
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sentences = text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onChange(content.trim());
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleLoadSamples = () => {
    const samples = SAMPLE_SENTENCES_BY_LANG[language] || SAMPLE_SENTENCES_BY_LANG.ckb;
    onChange(samples.join('\n'));
  };

  const isRtl = language !== 'en';

  const placeholderText = language === 'kmr'
    ? 'ڕستێن بادینی ل ڤێرە بنڤیسە، هەر ڕستەیەک ل دێڕەکێدا...\nئەڤرۆ ئەز گەلەک وەستیامە.\nکەنگی دێ گەهینە وێرێ؟'
    : language === 'ar'
    ? 'أدخل الجمل العربية هنا، جملة واحدة في كل سطر...\nأنا متعب جدا اليوم.\nمتى سنصل إلى هناك؟'
    : language === 'en'
    ? 'Enter English sentences here, one sentence per line...\nI am very tired today.\nWhen will we arrive there?'
    : 'ڕستە کوردییە کورتەکان لێرە بنووسە، هەر ڕستەیەک لە دێڕێکدا...\nئەمڕۆ زۆر ماندووم.\nکەی دەگەینە ئەوێ؟';

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Top Header: Title & Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileText size={18} className="text-primary" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
            Input Sentences
          </h3>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
            {sentences.length} {sentences.length === 1 ? 'sentence' : 'sentences'}
          </span>
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload .txt sentence list"
            style={{ fontSize: '0.78rem' }}
          >
            <Upload size={14} /> Upload .txt
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleLoadSamples}
            title="Load sample sentences for selected language"
            style={{ fontSize: '0.78rem' }}
          >
            <Sparkles size={14} /> Load Samples
          </button>

          {text && (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-danger"
              onClick={() => onChange('')}
              title="Clear text"
              style={{ fontSize: '0.78rem' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Language Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Target Language:</span>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px', gap: '2px' }}>
          <button
            type="button"
            className={`btn btn-sm ${language === 'ckb' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
            onClick={() => onLanguageChange('ckb')}
          >
            Kurdish Sorani (ckb)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${language === 'kmr' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
            onClick={() => onLanguageChange('kmr')}
          >
            Kurdish Badini (kmr)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${language === 'ar' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
            onClick={() => onLanguageChange('ar')}
          >
            Arabic (ar)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
            onClick={() => onLanguageChange('en')}
          >
            English (en)
          </button>
        </div>
      </div>

      <textarea
        className="kurdish-textarea"
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={5}
        placeholder={placeholderText}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '1rem',
          fontFamily: isRtl ? "'Rabar', 'Vazirmatn', sans-serif" : 'system-ui, sans-serif',
          color: '#f8fafc',
          resize: 'vertical'
        }}
      />

      {/* Quick preview of index numbering */}
      {sentences.length > 0 && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Family IDs:</span>
            {sentences.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                className="badge"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', direction: isRtl ? 'rtl' : 'ltr' }}
              >
                #{String(startIdx + idx).padStart(3, '0')}: {s.length > 25 ? s.slice(0, 25) + '...' : s}
              </span>
            ))}
            {sentences.length > 3 && (
              <span style={{ color: '#64748b' }}>+{sentences.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
