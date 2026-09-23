import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Layers, Volume2, ShieldCheck } from 'lucide-react';
import { PairedValidationReport } from './types';

interface PairedValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PairedValidationModal: React.FC<PairedValidationModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<PairedValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'issues'>('issues');

  const fetchValidation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/paired/validate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch validation report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchValidation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayFamilies = (report?.families || []).filter(f => {
    if (filterMode === 'issues') return f.status !== 'valid';
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="modal-title">Paired Emotion Dataset Validator</h2>
              <p className="modal-subtitle">Verify: Same Speaker + Same Text + 6 Required Emotions + Audio Integrity</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p className="text-muted">Scanning dataset families & audio files on disk...</p>
            </div>
          ) : error ? (
            <div className="error-banner" style={{ padding: '1rem', color: '#ef4444' }}>
              Failed to load validation: {error}
            </div>
          ) : report ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Families</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{report.totalFamilies}</div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>6/6 Complete</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{report.validFamiliesCount}</div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Incomplete</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{report.incompleteFamiliesCount}</div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Compliance</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: report.isCompliant ? '#10b981' : '#f59e0b' }}>
                    {report.completionPercentage}%
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: report.isCompliant ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${report.isCompliant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                {report.isCompliant ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : (
                  <AlertTriangle size={20} color="#f59e0b" />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {report.isCompliant ? 'Dataset is 100% Compliant with Paired Emotion Rules!' : 'Dataset Has Missing or Incomplete Emotion Families'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Required emotions: <code>{report.requiredEmotions.join(', ')}</code>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    className={`btn btn-sm ${filterMode === 'issues' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterMode('issues')}
                    style={{ fontSize: '0.75rem' }}
                  >
                    Issues & Incomplete ({report.incompleteFamiliesCount + report.errorCount})
                  </button>
                  <button
                    className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilterMode('all')}
                    style={{ fontSize: '0.75rem' }}
                  >
                    All Families ({report.totalFamilies})
                  </button>
                </div>

                <button className="btn btn-ghost btn-sm" onClick={fetchValidation}>
                  <RefreshCw size={13} /> Re-scan
                </button>
              </div>

              {/* Families Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {displayFamilies.length === 0 ? (
                  <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    {filterMode === 'issues' ? '🎉 No issues found! All families are 6/6 complete.' : 'No families found.'}
                  </div>
                ) : (
                  displayFamilies.map((f) => (
                    <div
                      key={f.familyId}
                      className="glass-card"
                      style={{
                        padding: '0.75rem 1rem',
                        borderLeft: `3px solid ${f.status === 'valid' ? '#10b981' : (f.status === 'incomplete' ? '#f59e0b' : '#ef4444')}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ fontWeight: 700, color: '#38bdf8' }}>{f.familyId}</code>
                          <span className="badge" style={{ fontSize: '0.7rem' }}>Speaker: {f.speaker}</span>
                        </div>
                        <span className="badge" style={{ fontSize: '0.7rem', background: f.status === 'valid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
                          {f.presentCount} / {f.requiredCount} Emotions
                        </span>
                      </div>

                      <div dir="rtl" style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '0.45rem' }}>
                        {f.text}
                      </div>

                      {f.missingEmotions.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <AlertCircle size={13} />
                          <span>Missing emotions: <strong>{f.missingEmotions.join(', ')}</strong></span>
                        </div>
                      )}

                      {f.issues.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                          {f.issues.map((iss, i) => <div key={i}>• {iss}</div>)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
