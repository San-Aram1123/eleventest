import React from 'react';
import { FileArchive, Sparkles, Download, Check, Copy } from 'lucide-react';

interface ExportDownloadCardsProps {
  rawZipUrl: string;
  audarZipUrl: string;
  matchedCount: number;
  copiedLink: 'raw' | 'audar' | null;
  onCopyLink: (type: 'raw' | 'audar') => void;
}

export const ExportDownloadCards: React.FC<ExportDownloadCardsProps> = ({
  rawZipUrl,
  audarZipUrl,
  matchedCount,
  copiedLink,
  onCopyLink
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
      {/* Action 1: Raw ZIP */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileArchive size={18} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>Raw Dataset ZIP</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
            Includes exact <code>.wav</code> audio clips, <code>.json</code> metadata files, and an auto-generated <code>export_manifest.json</code>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <a
            href={rawZipUrl}
            download
            className="btn btn-secondary"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              pointerEvents: matchedCount === 0 ? 'none' : 'auto',
              opacity: matchedCount === 0 ? 0.5 : 1
            }}
            id="btn-download-filtered-raw-zip"
          >
            <Download size={15} />
            <span>Download Raw ZIP</span>
          </a>
          <button
            type="button"
            onClick={() => onCopyLink('raw')}
            className="btn btn-secondary"
            style={{ padding: '0 10px' }}
            title="Copy direct download link"
          >
            {copiedLink === 'raw' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Action 2: Audar Canonical ZIP */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={18} style={{ color: '#38bdf8' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>Audar Canonical ZIP</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
            Audar Speech Schema v2.0 with <code>data.jsonl</code>, <code>metadata.csv</code>, <code>whisper.jsonl</code>, and 24kHz mono WAVs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <a
            href={audarZipUrl}
            download
            className="btn btn-primary"
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              pointerEvents: matchedCount === 0 ? 'none' : 'auto',
              opacity: matchedCount === 0 ? 0.5 : 1
            }}
            id="btn-download-filtered-audar-zip"
          >
            <Download size={15} />
            <span>Download Audar ZIP</span>
          </a>
          <button
            type="button"
            onClick={() => onCopyLink('audar')}
            className="btn btn-secondary"
            style={{ padding: '0 10px' }}
            title="Copy direct download link"
          >
            {copiedLink === 'audar' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
