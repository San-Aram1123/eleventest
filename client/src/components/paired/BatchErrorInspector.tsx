import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Copy, Check, ChevronDown, ChevronUp, RefreshCw, XCircle, RotateCcw } from 'lucide-react';

export interface BatchErrorItem {
  timestamp: string;
  familyId: string;
  emotion: string;
  error: string;
}

interface BatchErrorInspectorProps {
  stopReason: string | null;
  errors: BatchErrorItem[];
  onClearErrors: () => void;
  onRetryFailed?: () => void;
}

export const BatchErrorInspector: React.FC<BatchErrorInspectorProps> = ({
  stopReason,
  errors,
  onClearErrors,
  onRetryFailed
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!stopReason && errors.length === 0) return null;

  const handleCopy = () => {
    const report = [
      stopReason ? `Stop Reason: ${stopReason}` : '',
      `Total Errors: ${errors.length}`,
      ...errors.map(e => `[${e.timestamp}] ${e.familyId} (${e.emotion}): ${e.error}`)
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const has429 = errors.some(e => e.error.includes('429') || e.error.toLowerCase().includes('resource exhausted'));
  const has404 = errors.some(e => e.error.includes('404'));

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        borderRadius: '12px',
        border: '1.5px solid rgba(239, 68, 68, 0.4)',
        background: 'rgba(239, 68, 68, 0.08)'
      }}
    >
      {/* Header with Reason */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="#f87171" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fca5a5' }}>
            {stopReason ? `Batch Status: ${stopReason}` : `Batch Warnings / Errors (${errors.length})`}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {errors.length > 0 && onRetryFailed && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={onRetryFailed}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} /> Retry Failed ({errors.length})
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleCopy}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy Diagnostics'}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Recommended Fix Banner */}
      {has429 && (
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#fde68a' }}>
          <strong>💡 Rate Limit (429) Detected:</strong> Your API key pool hit its quota. Switch to <strong>Smart Slicing (6-in-1 Mode)</strong> to save 83% of API calls, or add more Gemini keys in Settings.
        </div>
      )}
      {has404 && (
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#fca5a5' }}>
          <strong>💡 Route Not Found (404):</strong> Backend server endpoint was missing or outdated. Ensure <code>node server/index.js</code> is running.
        </div>
      )}

      {/* Error Details List */}
      {isExpanded && errors.length > 0 && (
        <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', padding: '0.5rem' }}>
          {errors.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0.6rem',
                borderBottom: idx < errors.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>{item.timestamp}</span>
                <code style={{ color: '#38bdf8' }}>{item.familyId}</code>
                <span style={{ color: '#c084fc' }}>[{item.emotion}]</span>
                <span style={{ color: '#f87171' }}>{item.error}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
