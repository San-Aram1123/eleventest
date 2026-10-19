import React, { useRef } from 'react';
import { 
  FileText, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  Hash, 
  RefreshCw, 
  Zap
} from 'lucide-react';
import { CONTEXT_VOICES } from '../../data/contextSwitchingPresets';

interface ContextBatchInputCardProps {
  text: string;
  onChangeText: (text: string) => void;
  selectedVoice: string;
  onChangeVoice: (voice: string) => void;
  startIdx: number;
  onChangeStartIdx: (idx: number) => void;
  onRefreshStartIdx: () => void;
  isRefreshingIdx: boolean;
  paragraphCount: number;
  isBatchActive: boolean;
}

export const ContextBatchInputCard: React.FC<ContextBatchInputCardProps> = ({
  text,
  onChangeText,
  selectedVoice,
  onChangeVoice,
  startIdx,
  onChangeStartIdx,
  onRefreshStartIdx,
  isRefreshingIdx,
  paragraphCount,
  isBatchActive
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalBatches = Math.ceil(paragraphCount / 6);
  const quotaSavingsPercent = paragraphCount > 0 ? Math.round(((paragraphCount - totalBatches) / paragraphCount) * 100) : 83;

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
      {/* Top Header: Controls & Upload */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <FileText size={18} style={{ color: '#0A84FF' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.015em' }}>Text Input &amp; Paragraphs</span>
          <span className="badge" style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', border: '1px solid rgba(10, 132, 255, 0.3)', borderRadius: '9999px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
            {paragraphCount.toLocaleString()} paragraphs
          </span>
          <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '9999px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
            {totalBatches.toLocaleString()} batches (6/call)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            style={{ display: 'none' }}
            disabled={isBatchActive}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBatchActive}
            title="Upload .txt file"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px', padding: '5px 12px', fontSize: '0.76rem', fontWeight: 600, background: 'var(--bg-box-subtle)', border: '1px solid var(--border-subtle)' }}
          >
            <Upload size={13} />
            <span>Upload .txt</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            disabled={!text}
            title="Copy Text"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px', padding: '5px 12px', fontSize: '0.76rem', fontWeight: 600, background: 'var(--bg-box-subtle)', border: '1px solid var(--border-subtle)' }}
          >
            {copied ? <Check size={13} style={{ color: '#30D158' }} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChangeText('')}
            disabled={!text || isBatchActive}
            title="Clear Text"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px', padding: '5px 12px', fontSize: '0.76rem', fontWeight: 600, background: 'var(--bg-box-subtle)', border: '1px solid var(--border-subtle)' }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Multiline Textarea */}
      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={isBatchActive}
        rows={8}
        placeholder="Paste your lines here (or upload a .txt file up to 5,000+ lines). Every paragraph or line will be grouped 6-at-a-time into 1 API call with acoustic slicing..."
        style={{
          width: '100%',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          background: 'var(--bg-input)',
          color: 'var(--text-main)',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          fontFamily: 'inherit',
          resize: 'vertical',
          marginBottom: '1rem',
          outline: 'none'
        }}
        dir="auto"
      />

      {/* Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center', background: 'var(--bg-box)', padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
        {/* Voice Selector */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
            Speaker Voice:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => onChangeVoice(e.target.value)}
            disabled={isBatchActive}
            className="form-select"
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.84rem' }}
          >
            {CONTEXT_VOICES.map(v => (
              <option key={v.id} value={v.id}>{v.name} - {v.gender}</option>
            ))}
          </select>
        </div>

        {/* Emotion */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
            Emotion Mode:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.22)' }}>
            <span style={{ fontSize: '0.9rem' }}>😐</span>
            <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0A84FF' }}>Neutral (Fluid Multilingual)</span>
          </div>
        </div>

        {/* Start Index / Auto Indexing */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
            Starting Auto-Index:
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Hash size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="number"
                min={1}
                value={startIdx}
                onChange={(e) => onChangeStartIdx(Math.max(1, parseInt(e.target.value, 10) || 1))}
                disabled={isBatchActive}
                className="form-control"
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 1.9rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.84rem', fontWeight: 600 }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRefreshStartIdx}
              disabled={isBatchActive || isRefreshingIdx}
              title="Auto-detect next available index from dataset"
              style={{ padding: '0 0.75rem', borderRadius: '8px', background: 'var(--bg-box-subtle)', border: '1px solid var(--border-subtle)' }}
            >
              <RefreshCw size={13} className={isRefreshingIdx ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Quota Efficiency Badge */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
            API Quota Efficiency:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.25)', color: '#30D158', fontSize: '0.8rem', fontWeight: 600 }}>
            <Zap size={14} />
            <span>{quotaSavingsPercent}% Saved (6:1 Acoustic Slicing)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
