import React, { useRef } from 'react';
import { FileText, Upload, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { CONTEXT_SWITCH_PRESETS } from '../../data/contextSwitchingPresets';

interface ContextLabInputCardProps {
  text: string;
  onChangeText: (text: string) => void;
  speaker1Voice: string;
  speaker2Voice: string;
  paragraphCount: number;
  isBatchActive: boolean;
}

export const ContextLabInputCard: React.FC<ContextLabInputCardProps> = ({
  text,
  onChangeText,
  speaker1Voice,
  speaker2Voice,
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
      if (typeof content === 'string') onChangeText(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadPresetBatch = () => {
    const sample6 = CONTEXT_SWITCH_PRESETS.slice(0, 6).map(p => p.text).join('\n\n');
    onChangeText(sample6);
  };

  const totalBatches = Math.ceil(paragraphCount / 6);
  const previewLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 6);

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} className="text-primary" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Input Paragraphs (Pure Speech Script)</span>
          <span className="badge" style={{ background: '#3B82F622', color: '#3B82F6', border: '1px solid #3B82F655' }}>
            {paragraphCount.toLocaleString()} lines
          </span>
          <span className="badge" style={{ background: '#10B98122', color: '#10B981', border: '1px solid #10B98155' }}>
            {totalBatches.toLocaleString()} batches (6/call)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadPresetBatch}
            disabled={isBatchActive}
            title="Load 6 test context switching lines"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <Sparkles size={13} style={{ color: '#A78BFA' }} />
            <span>Load 6 Test Lines</span>
          </button>
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
            <Upload size={13} />
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
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
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
        rows={7}
        placeholder="Paste your lines here (or click 'Load 6 Test Lines'). Pure Kurdish / mixed text without any markers — speakers alternate automatically every line..."
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
          marginBottom: '0.75rem'
        }}
        dir="auto"
      />

      {/* Live Turn-by-Turn Speaker Preview */}
      {previewLines.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
            First Batch Speaker Turn Assignment (6 Lines):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.4rem' }}>
            {previewLines.map((line, idx) => {
              const isSpk1 = (idx % 2 === 0);
              const activeVoice = isSpk1 ? speaker1Voice : speaker2Voice;
              const speakerBadgeColor = isSpk1 ? '#3B82F6' : '#EC4899';
              const spkLabel = isSpk1 ? 'Speaker 1' : 'Speaker 2';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.55rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '6px',
                    fontSize: '0.78rem'
                  }}
                >
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: `${speakerBadgeColor}22`,
                      color: speakerBadgeColor,
                      fontWeight: 700,
                      border: `1px solid ${speakerBadgeColor}44`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Line {idx + 1}: {spkLabel} ({activeVoice})
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8', flex: 1 }} dir="auto">
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
