import React from 'react';
import { Database } from 'lucide-react';
import { DatabaseStatus } from '../../types';

export interface DatabaseStatusCardProps {
  database?: DatabaseStatus;
}

export const DatabaseStatusCard: React.FC<DatabaseStatusCardProps> = ({ database }) => {
  const isConnected = Boolean(database?.connected);

  return (
    <div className="add-key-card" style={{ marginTop: '0' }}>
      <div className="add-key-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} className="text-cyan" />
          <span className="add-key-title">MySQL Database Engine</span>
        </div>
        <span
          className="badge"
          style={{
            background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isConnected ? '#34D399' : '#FBBF24',
            borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            padding: '3px 10px'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isConnected ? '#10B981' : '#F59E0B'
            }}
          />
          {isConnected ? 'MySQL Connected' : 'Filesystem Fallback'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(0,0,0,0.25)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>HOST &amp; PORT</span>
          <strong style={{ color: '#E2E8F0' }}>{database?.host || 'localhost'}:{database?.port || 3306}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>DATABASE</span>
          <strong style={{ color: '#38BDF8' }}>{database?.database || 'kurdish_tts_db'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>STORED SAMPLES</span>
          <strong style={{ color: '#A78BFA' }}>{database?.sampleCount ?? 0} samples</strong>
        </div>
      </div>

      {database?.error && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '0.76rem',
            color: '#FBBF24',
            background: 'rgba(245, 158, 11, 0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          ℹ️ <strong>Storage Note:</strong> Running on file storage mode ({database.error}). To connect MySQL, configure <code>DB_PASSWORD</code> in your <code>.env</code> file.
        </div>
      )}
    </div>
  );
};
