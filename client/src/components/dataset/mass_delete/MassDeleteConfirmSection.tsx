import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MassDeleteConfirmSectionProps {
  count: number;
  confirmText: string;
  setConfirmText: (t: string) => void;
  confirmChecked: boolean;
  setConfirmChecked: (c: boolean) => void;
}

export const MassDeleteConfirmSection: React.FC<MassDeleteConfirmSectionProps> = ({
  count,
  confirmText,
  setConfirmText,
  confirmChecked,
  setConfirmChecked
}) => {
  if (count === 0) return null;

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={18} color="#f87171" />
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f87171' }}>
          Permanent Action Confirmation
        </span>
      </div>
      <p style={{ fontSize: '0.76rem', color: '#fca5a5', margin: 0, lineHeight: 1.4 }}>
        This will physically delete the WAV audio files and MySQL records permanently. You cannot recover these samples after deletion.
      </p>

      {count > 50 ? (
        <div style={{ marginTop: '4px' }}>
          <label style={{ fontSize: '0.76rem', color: '#fca5a5', display: 'block', marginBottom: '4px' }}>
            Type <strong style={{ color: '#ffffff', background: '#dc2626', padding: '1px 6px', borderRadius: '4px' }}>DELETE</strong> to confirm mass purge of {count.toLocaleString()} samples:
          </label>
          <input
            type="text"
            className="input-control"
            placeholder="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            style={{
              width: '100%',
              borderColor: confirmText.toUpperCase() === 'DELETE' ? '#22c55e' : '#ef4444',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontWeight: 700
            }}
          />
        </div>
      ) : (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
            I confirm I want to permanently delete these {count} sample(s).
          </span>
        </label>
      )}
    </div>
  );
};
