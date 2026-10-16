import React from 'react';
import { FileArchive, Sparkles, Download, Check, Copy, Layers } from 'lucide-react';

interface ExportDownloadCardsProps {
  rawZipUrl: string;
  audarZipUrl: string;
  v20ZipUrl?: string;
  matchedCount: number;
  copiedLink: 'raw' | 'audar' | 'v20' | null;
  onCopyLink: (type: 'raw' | 'audar' | 'v20') => void;
}

export const ExportDownloadCards: React.FC<ExportDownloadCardsProps> = ({
  rawZipUrl,
  audarZipUrl,
  v20ZipUrl,
  matchedCount,
  copiedLink,
  onCopyLink
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* Primary Action: Official Audar V20 Master ZIP */}
      {v20ZipUrl && (
        <div
          className="glass-card"
          style={{
            padding: '1.1rem',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Layers size={18} style={{ color: '#c084fc' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                  Audar V20 Master Dataset (Official Schema v2)
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(168, 85, 247, 0.25)',
                    color: '#e9d5ff',
                    border: '1px solid rgba(168, 85, 247, 0.4)'
                  }}
                >
                  Official
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45, margin: 0 }}>
                Includes official <code>metadata.jsonl</code> (raw, normalized, conditioned text), NeuCodec 50Hz <code>tokens.jsonl</code>, audio corpus, and manifest summary.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <a
              href={v20ZipUrl}
              download
              className="btn btn-primary"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
                pointerEvents: matchedCount === 0 ? 'none' : 'auto',
                opacity: matchedCount === 0 ? 0.5 : 1
              }}
              id="btn-download-filtered-v20-zip"
            >
              <Download size={16} />
              <span>Download Official V20 Master ZIP</span>
            </a>
            <button
              type="button"
              onClick={() => onCopyLink('v20')}
              className="btn btn-secondary"
              style={{ padding: '0 12px' }}
              title="Copy direct download link"
            >
              {copiedLink === 'v20' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Secondary Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
        {/* Action 1: Raw ZIP */}
        <div
          className="glass-card"
          style={{
            padding: '0.9rem',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FileArchive size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Raw Dataset ZIP</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 0.8rem 0' }}>
              Includes exact <code>.wav</code> audio clips, individual <code>.json</code> files, and <code>export_manifest.json</code>.
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
                fontSize: '0.8rem',
                pointerEvents: matchedCount === 0 ? 'none' : 'auto',
                opacity: matchedCount === 0 ? 0.5 : 1
              }}
              id="btn-download-filtered-raw-zip"
            >
              <Download size={14} />
              <span>Download Raw ZIP</span>
            </a>
            <button
              type="button"
              onClick={() => onCopyLink('raw')}
              className="btn btn-secondary"
              style={{ padding: '0 8px' }}
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
            padding: '0.9rem',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(6, 182, 212, 0.05)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={16} style={{ color: '#38bdf8' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Audar Canonical ZIP</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 0.8rem 0' }}>
              Audar Speech Schema v2.0 with <code>data.jsonl</code>, <code>metadata.csv</code>, and <code>whisper.jsonl</code>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <a
              href={audarZipUrl}
              download
              className="btn btn-secondary"
              style={{
                flex: 1,
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 600,
                fontSize: '0.8rem',
                pointerEvents: matchedCount === 0 ? 'none' : 'auto',
                opacity: matchedCount === 0 ? 0.5 : 1
              }}
              id="btn-download-filtered-audar-zip"
            >
              <Download size={14} />
              <span>Download Canonical ZIP</span>
            </a>
            <button
              type="button"
              onClick={() => onCopyLink('audar')}
              className="btn btn-secondary"
              style={{ padding: '0 8px' }}
              title="Copy direct download link"
            >
              {copiedLink === 'audar' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
