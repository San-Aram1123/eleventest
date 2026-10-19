import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  Database,
  BarChart3,
  FileText,
  Volume2
} from 'lucide-react';
import { fetchAudarSummary, getAudarZipExportUrl } from '../services/api';

interface AudarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudarExportModal: React.FC<AudarExportModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      fetchAudarSummary()
        .then((data) => {
          setSummary(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-card audar-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#0f172a' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="modal-title">Audar Canonical Speech Dataset Exporter</h2>
              <p className="modal-subtitle">Central Kurdish (Sorani / سۆرانی - ckb) Canonical Schema v2.0</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="loading-state" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p className="text-muted">Computing Kurdish phoneme coverage and schema verification...</p>
            </div>
          ) : error ? (
            <div className="error-banner" style={{ padding: '1rem', color: '#ef4444' }}>
              <p>Failed to load summary: {error}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Samples</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{summary.totalSamples}</div>
                </div>
                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Duration</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{summary.totalDurationSeconds}s</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>~{summary.totalDurationHours} hrs</div>
                </div>
                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Splits (T/V/T)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                    {summary.splits?.train || 0} / {summary.splits?.val || 0} / {summary.splits?.test || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Train / Val / Test</div>
                </div>
                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Audio Target</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>24 kHz</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>16-bit Mono WAV</div>
                </div>
              </div>

              {/* Phoneme Coverage Report */}
              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <BarChart3 size={16} className="text-cyan" />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Kurdish Phoneme Inventory Coverage</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {Object.entries(summary.phoneticCoverage || {}).map(([char, pct]: [string, any]) => (
                    <div 
                      key={char} 
                      style={{ 
                        padding: '0.5rem 0.6rem', 
                        borderRadius: '6px', 
                        background: pct > 0 ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-box-subtle)',
                        border: pct > 0 ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid var(--border-subtle)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Noto Naskh Arabic, sans-serif' }}>{char}</span>
                      <span style={{ fontSize: '0.75rem', color: pct > 0 ? '#38bdf8' : 'var(--text-tertiary)', fontWeight: 600 }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exact Canonical Structure Preview */}
              <div className="glass-card" style={{ padding: '1rem', background: 'var(--bg-box)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  ZIP ARCHIVE LAYOUT (Audar Canonical Schema v2.0):
                </div>
                <pre style={{ margin: 0, fontSize: '0.78rem', color: '#38bdf8', lineHeight: 1.45, fontFamily: 'monospace' }}>
{`dataset_export/
├── audio/                      <-- 24kHz 16-bit Mono PCM WAV files
├── data.jsonl                  <-- Master Canonical JSONL (Full Metrics & Tags)
├── mixed_emotions/
│   └── data.jsonl              <-- Multi-Emotion JSONL (Components & Mode)
├── whispered_speech.jsonl      <-- Filtered Whispered Speech Manifest
├── metadata.csv                <-- TTS Manifest (audio|text|spk|emotion|intensity|delivery)
├── whisper.jsonl               <-- ASR Training Manifest (Whisper / Meta MMS)
└── manifest.json               <-- Dataset Summary, Stats & SHA256 Hashes`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          
          <a
            href={getAudarZipExportUrl()}
            download="audar_kurdish_canonical_dataset.zip"
            className="btn btn-accent btn-md"
            style={{ 
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <Download size={18} />
            <span>Download Audar Canonical Dataset (ZIP)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
