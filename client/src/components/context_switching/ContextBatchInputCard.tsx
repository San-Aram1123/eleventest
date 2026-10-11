import React, { useRef } from 'react';
import { 
  FileText, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  Hash, 
  RefreshCw, 
  Sparkles,
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
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Top Header: Controls & Upload */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} className="text-primary" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Text Input & Paragraphs</span>
          <span className="badge" style={{ background: '#3B82F622', color: '#3B82F6', border: '1px solid #3B82F655' }}>
            {paragraphCount.toLocaleString()} paragraphs
          </span>
          <span className="badge" style={{ background: '#10B98122', color: '#10B981', border: '1px solid #10B98155' }}>
            {totalBatches.toLocaleString()} batches (6/call)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Upload size={14} />
            <span>Upload .txt</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            disabled={!text}
            title="Copy Text"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChangeText('')}
            disabled={!text || isBatchActive}
            title="Clear Text"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={14} />
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
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
          background: 'var(--bg-input, rgba(0,0,0,0.25))',
          color: 'inherit',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          fontFamily: 'inherit',
          resize: 'vertical',
          marginBottom: '1rem'
        }}
        dir="auto"
      />

      {/* Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Voice Selector */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
            Speaker Voice:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => onChangeVoice(e.target.value)}
            disabled={isBatchActive}
            className="form-select"
            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--bg-input, rgba(0,0,0,0.3))', color: 'inherit', fontSize: '0.85rem' }}
          >
            {CONTEXT_VOICES.map(v => (
              <option key={v.id} value={v.id}>{v.name} - {v.gender}</option>
            ))}
          </select>
        </div>

        {/* Emotion (Fixed to Neutral with Zero-Pause Code-Switching) */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
            Emotion Mode:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.65rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <span style={{ fontSize: '0.9rem' }}>😐</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#60A5FA' }}>Neutral (Fluid Multilingual)</span>
          </div>
        </div>

        {/* Start Index / Auto Indexing */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
            Starting Auto-Index:
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Hash size={14} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="number"
                min={1}
                value={startIdx}
                onChange={(e) => onChangeStartIdx(Math.max(1, parseInt(e.target.value, 10) || 1))}
                disabled={isBatchActive}
                className="form-control"
                style={{ width: '100%', padding: '0.45rem 0.5rem 0.45rem 1.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--bg-input, rgba(0,0,0,0.3))', color: 'inherit', fontSize: '0.85rem' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRefreshStartIdx}
              disabled={isBatchActive || isRefreshingIdx}
              title="Auto-detect next available index from dataset"
              style={{ padding: '0 0.6rem' }}
            >
              <RefreshCw size={13} className={isRefreshingIdx ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Quota Efficiency Badge */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#94a3b8' }}>
            API Quota Efficiency:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.65rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
            <Zap size={14} />
            <span>{quotaSavingsPercent}% Saved (6:1 Acoustic Slicing)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

