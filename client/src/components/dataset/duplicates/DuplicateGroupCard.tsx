import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Sample } from '../../../types';
import { DuplicateTakeRow } from './DuplicateTakeRow';

export interface DuplicateGroup {
  normalizedKey: string;
  originalText: string;
  samples: Sample[];
}

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  copiedTextKey: string | null;
  onCopyText: (text: string, key: string) => void;
  onKeepOnlyOne: (keepSampleId: string, group: DuplicateGroup) => void;
  onDeleteSingle: (sampleId: string) => void;
  isDeletingId: string | null;
  isBatchOperating: boolean;
}

export const DuplicateGroupCard: React.FC<DuplicateGroupCardProps> = ({
  group,
  copiedTextKey,
  onCopyText,
  onKeepOnlyOne,
  onDeleteSingle,
  isDeletingId,
  isBatchOperating
}) => {
  const takesCount = group.samples.length;
  const isCopied = copiedTextKey === group.normalizedKey;

  return (
    <div
      style={{
        background: 'rgba(18, 24, 38, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '1rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Group Header with Kurdish Text */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '10px'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#FBBF24',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {takesCount} TAKES RECORDED
            </span>
            <button
              onClick={() => onCopyText(group.originalText, group.normalizedKey)}
              className="btn btn-ghost btn-xs"
              style={{
                fontSize: '0.72rem',
                color: '#94A3B8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Copy Kurdish sentence text"
            >
              {isCopied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
              <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div
            style={{
              fontFamily: 'Rabar, Tahoma, sans-serif',
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              direction: 'rtl',
              lineHeight: 1.6,
              background: 'var(--bg-box)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {group.originalText}
          </div>
        </div>
      </div>

      {/* Takes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {group.samples.map((sample, idx) => (
          <DuplicateTakeRow
            key={sample.id}
            sample={sample}
            isNewest={idx === 0}
            isOldest={idx === takesCount - 1}
            takesCount={takesCount}
            onKeepOnlyOne={() => onKeepOnlyOne(sample.id, group)}
            onDeleteSingle={() => onDeleteSingle(sample.id)}
            isDeleting={isDeletingId === sample.id}
            isBatchOperating={isBatchOperating}
          />
        ))}
      </div>
    </div>
  );
};
