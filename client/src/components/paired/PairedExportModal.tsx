import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileArchive, Copy, Check, Table, Sparkles } from 'lucide-react';
import { Sample } from '../../types';

interface PairedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const PairedExportModal: React.FC<PairedExportModalProps> = ({
  isOpen,
  onClose,
  samples,
  addToast
}) => {
  const [csvPreview, setCsvPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/paired/export-csv')
        .then(res => res.text())
        .then(text => {
          setCsvPreview(text);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const previewLines = csvPreview.split('\n').filter(Boolean);
  const header = previewLines[0] || 'audio_file|text|speaker_name|language|emotion|emotion_intensity|family_id';
  const rows = previewLines.slice(1, 6);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (addToast) addToast({ type: 'success', title: 'Copied metadata.csv to clipboard' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: '#fff' }}>
              <Download size={20} />
            </div>
            <div>
              <h2 className="modal-title">Export Paired Emotion Dataset</h2>
              <p className="modal-subtitle">Format: audio_file|text|speaker_name|language|emotion|emotion_intensity|family_id</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* Export Schema Banner */}
          <div className="glass-card" style={{ padding: '0.9rem 1.1rem', marginBottom: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 600, marginBottom: '0.35rem' }}>
              Standard Pipe-Separated Schema
            </div>
            <code style={{ fontSize: '0.85rem', color: '#f8fafc', wordBreak: 'break-all' }}>
              audio_file|text|speaker_name|language|emotion|emotion_intensity|family_id
            </code>
          </div>

          {/* Table Preview */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                Preview: First 5 Records ({previewLines.length - 1} total rows)
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleCopy} style={{ fontSize: '0.75rem' }}>
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy All CSV'}
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
                <p className="text-muted">Loading preview...</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                <table className="dataset-table" style={{ width: '100%', fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      {header.split('|').map((h, i) => (
                        <th key={i} style={{ padding: '0.5rem 0.65rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const cols = row.split('|');
                      return (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{cols[0]}</td>
                          <td dir="rtl" style={{ fontFamily: "'Rabar', 'Vazirmatn', sans-serif" }}>{cols[1]}</td>
                          <td><span className="badge" style={{ fontSize: '0.7rem' }}>{cols[2]}</span></td>
                          <td><code>{cols[3]}</code></td>
                          <td><span className="badge" style={{ fontSize: '0.7rem' }}>{cols[4]}</span></td>
                          <td><code>{cols[5]}</code></td>
                          <td><code style={{ color: '#c084fc' }}>{cols[6]}</code></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Download Actions */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href="/api/paired/export-csv"
              download="metadata.csv"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Download metadata.csv
            </a>

            <a
              href="/api/paired/export-zip"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}
            >
              <FileArchive size={16} /> Download Full Dataset (.ZIP)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
