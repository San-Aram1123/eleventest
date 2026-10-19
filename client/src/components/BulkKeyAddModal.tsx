import React, { useState, useMemo, useEffect } from 'react';
import { X, Zap, KeyRound, CheckCircle2, AlertCircle, Trash2, ShieldCheck } from 'lucide-react';

interface BulkKeyAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkAdd: (keysText: string) => Promise<void>;
  existingMaskedKeys?: string[];
}

export const BulkKeyAddModal: React.FC<BulkKeyAddModalProps> = ({
  isOpen,
  onClose,
  onBulkAdd,
  existingMaskedKeys = []
}) => {
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Extract keys dynamically for real-time validation & counts
  const parsed = useMemo(() => {
    if (!rawText.trim()) {
      return { keys: [], newKeys: [], existingCount: 0 };
    }
    const rawItems = rawText.split(/[\r\n,;'"\[\]\s]+/);
    const seen = new Set<string>();
    const keys: string[] = [];

    for (const item of rawItems) {
      const clean = item.trim().replace(/^['"`]+|['"`]+$/g, '');
      if (clean.length >= 20 && !seen.has(clean)) {
        seen.add(clean);
        keys.push(clean);
      }
    }

    const existingSet = new Set(existingMaskedKeys.map(k => k.trim()));
    const newKeys = keys.filter(k => {
      const masked = `${k.slice(0, 4)}...${k.slice(-4)}`;
      return !existingSet.has(masked);
    });
    const existingCount = keys.length - newKeys.length;

    return { keys, newKeys, existingCount };
  }, [rawText, existingMaskedKeys]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsed.keys.length === 0 || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await onBulkAdd(rawText);
      setRawText('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add keys to pool');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !isSubmitting && onClose()}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-header" style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
                Quick Add Gemini API Keys
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Paste 30+ keys at once to bulk import into your rotation pool
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '6px', color: '#94a3b8' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} className="text-cyan" />
              <span>Paste Keys (Line-separated, commas, spaces, or JSON)</span>
            </label>
            {rawText.trim() && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="btn btn-ghost btn-sm"
                disabled={isSubmitting}
                style={{ fontSize: '0.72rem', color: '#ef4444', padding: '2px 6px', height: 'auto' }}
              >
                <Trash2 size={12} style={{ marginRight: '4px' }} />
                Clear
              </button>
            )}
          </div>

          <textarea
            className="input-control"
            rows={8}
            placeholder={`Paste your Google AI Studio keys here, for example:\nAIzaSyA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5\nAIzaSyB1b2c3d4e5f6g7h8i9j0k1l2m3n4o5\nAQ.Ab8RN6LISPi8pfiSKmMhcgEmjXPSPQFV9vuii...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isSubmitting}
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              resize: 'vertical',
              padding: '12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)'
            }}
          />

          {/* Key Detection Metrics */}
          <div style={{
            background: 'var(--bg-box)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${parsed.keys.length > 0 ? 'badge-cyan' : 'badge-ghost'}`} style={{ fontWeight: 600 }}>
                {parsed.keys.length} {parsed.keys.length === 1 ? 'Key' : 'Keys'} Detected
              </span>
              {parsed.newKeys.length > 0 && parsed.existingCount > 0 && (
                <span style={{ color: 'var(--text-secondary)' }}>
                  ({parsed.newKeys.length} new, {parsed.existingCount} already in pool)
                </span>
              )}
              {parsed.keys.length > 0 && parsed.newKeys.length === 0 && (
                <span style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} />
                  All keys are already present in the pool
                </span>
              )}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              Minimum key length: 20 chars
            </span>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || parsed.keys.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-mini" style={{ width: '14px', height: '14px' }} />
                  <span>Importing {parsed.keys.length} Keys...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Import {parsed.keys.length > 0 ? `${parsed.keys.length} Keys` : 'Keys'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
