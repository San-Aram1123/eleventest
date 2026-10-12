import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export interface QuickAddKeyDrawerProps {
  isOpen: boolean;
  onAddKey: (key: string) => Promise<void>;
  placeholder?: string;
  hintText?: string;
}

export const QuickAddKeyDrawer: React.FC<QuickAddKeyDrawerProps> = ({
  isOpen,
  onAddKey,
  placeholder = 'Paste xi-api-key here to add to pool (e.g. sk_...)',
  hintText
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddKey(apiKey.trim());
      setApiKey('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-key-form-card glass-card">
      <div className="key-form-row">
        <input
          type="password"
          className="input-control"
          placeholder={placeholder}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          id="inline-api-key-input"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting || !apiKey.trim()}
        >
          <Plus size={14} />
          <span>{isSubmitting ? 'Validating...' : 'Add to Pool'}</span>
        </button>
      </div>
      <div className="key-form-hint">
        {hintText || (
          <>
            🔒 Key will be validated and added to the failover pool (<code>.env</code> & <code>keys.json</code>).
          </>
        )}
      </div>
    </form>
  );
};
