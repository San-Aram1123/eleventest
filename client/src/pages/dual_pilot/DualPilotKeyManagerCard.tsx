import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { addElevenLabsKey, deleteElevenLabsKey } from './dualPilotApi';

interface KeyItem {
  index: number;
  maskedKey: string;
  status: string;
  remainingCharacters?: number;
}

interface DualPilotKeyManagerCardProps {
  elevenKeys: KeyItem[];
  geminiKeysCount: number;
  onRefreshKeys: () => void;
  disabled?: boolean;
}

export const DualPilotKeyManagerCard: React.FC<DualPilotKeyManagerCardProps> = ({
  elevenKeys,
  geminiKeysCount,
  onRefreshKeys,
  disabled = false
}) => {
  const [newKey, setNewKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      await addElevenLabsKey(newKey.trim());
      setNewKey('');
      onRefreshKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to add key');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteElevenLabsKey(index);
      onRefreshKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to delete key');
    }
  };

  const readyElevenCount = elevenKeys.filter(k => k.status !== 'exhausted' && k.status !== 'invalid').length;

  return (
    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <KeyRound size={18} className="text-primary" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dual Provider Key Pools & Auto-Rotation</span>
          <span className="badge" style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED55' }}>
            Gemini: {geminiKeysCount} Keys
          </span>
          <span className="badge" style={{ background: '#10B98122', color: '#34D399', border: '1px solid #10B98155' }}>
            ElevenLabs: {elevenKeys.length} Keys ({readyElevenCount} Ready)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefreshKeys}
            disabled={disabled}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={13} /> Refresh Keys
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsOpen(!isOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {isOpen ? 'Hide ElevenLabs Key Manager' : 'Manage ElevenLabs Key Pool'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
            <Zap size={13} style={{ display: 'inline', marginRight: '4px', color: '#FBBF24' }} />
            ElevenLabs synthesis automatically rotates through this key pool in round-robin order, failing over instantly if a key hits rate limits or quota caps.
          </p>

          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <input
              type="password"
              placeholder="Paste new ElevenLabs API Key (e.g. sk_...)"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              disabled={disabled || isAdding}
              style={{
                flex: 1,
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={disabled || isAdding || !newKey.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} /> Add to Pool
            </button>
          </form>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {elevenKeys.map((k, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>{k.maskedKey}</div>
                  <div style={{ fontSize: '0.7rem', color: k.status === 'exhausted' ? 'var(--accent-red)' : 'var(--accent-emerald)', marginTop: '2px' }}>
                    {k.status === 'exhausted' ? 'Quota Exhausted' : 'Ready (Active)'}
                    {k.remainingCharacters !== undefined ? ` • ${k.remainingCharacters.toLocaleString()} chars left` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  onClick={() => handleDelete(k.index)}
                  disabled={disabled}
                  title="Remove Key from Pool"
                  style={{ color: 'var(--accent-red)', width: '28px', height: '28px', minWidth: '28px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

