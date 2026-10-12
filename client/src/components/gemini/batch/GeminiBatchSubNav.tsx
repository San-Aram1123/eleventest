import React from 'react';
import { Upload, Scissors } from 'lucide-react';

interface GeminiBatchSubNavProps {
  bulkSubMode: 'standard' | 'long_split';
  setBulkSubMode: (mode: 'standard' | 'long_split') => void;
  batchItemsCount: number;
}

export const GeminiBatchSubNav: React.FC<GeminiBatchSubNavProps> = ({
  bulkSubMode,
  setBulkSubMode,
  batchItemsCount
}) => {
  return (
    <div 
      className="batch-submode-row" 
      style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        borderBottom: '1px solid var(--border-subtle)', 
        paddingBottom: '14px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <button
        type="button"
        className={`studio-tab-btn ${bulkSubMode === 'standard' ? 'studio-tab-active' : ''}`}
        onClick={() => setBulkSubMode('standard')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}
      >
        <Upload size={16} />
        <span>Standard Multi-Line Batch</span>
        {batchItemsCount > 0 && (
          <span className="tab-counter-badge">{batchItemsCount} lines</span>
        )}
      </button>

      <button
        type="button"
        className={`studio-tab-btn ${bulkSubMode === 'long_split' ? 'studio-tab-active' : ''}`}
        onClick={() => setBulkSubMode('long_split')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          border: bulkSubMode === 'long_split' ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
          color: bulkSubMode === 'long_split' ? '#FFFFFF' : 'var(--text-muted)'
        }}
      >
        <Scissors size={16} className={bulkSubMode === 'long_split' ? 'text-cyan' : ''} />
        <span>⚡ Long Paragraph Auto-Splitter (1-Call Multi-Chunk)</span>
        <span 
          style={{ 
            fontSize: '0.66rem', 
            background: 'rgba(129, 140, 248, 0.25)', 
            color: '#A78BFA',
            padding: '2px 6px', 
            borderRadius: '10px',
            fontWeight: 700 
          }}
        >
          NEW
        </span>
      </button>
    </div>
  );
};
