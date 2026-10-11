import React from 'react';
import { X, Download, FileText, CheckCircle2, Package, Layers } from 'lucide-react';
import { ExpressiveTake, buildAudarRecord } from './expressiveConstants';

interface ExpressiveExportModalProps {
  takes: ExpressiveTake[];
  onClose: () => void;
}

export const ExpressiveExportModal: React.FC<ExpressiveExportModalProps> = ({
  takes,
  onClose
}) => {
  const totalDuration = takes.reduce((sum, t) => sum + (t.duration || 0), 0);
  const uniqueSpeakers = new Set(takes.map(t => t.speakerId)).size;
  const uniqueScripts = new Set(takes.map(t => t.scriptId)).size;
  const uniqueConditions = new Set(takes.map(t => t.conditionId)).size;

  const downloadJsonl = () => {
    const lines = takes.map(t => JSON.stringify(buildAudarRecord(t))).join('\n');
    const blob = new Blob([lines], { type: 'application/x-jsonlines;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadManifest = () => {
    const manifest = {
      dataset_name: 'Audar Expressive Speech Pilot',
      generator: 'Gemini 3.8 Flash TTS Generative Studio',
      pilot_language: 'ckb',
      total_takes: takes.length,
      total_duration_seconds: Math.round(totalDuration * 100) / 100,
      total_duration_minutes: Math.round((totalDuration / 60) * 100) / 100,
      unique_speakers: uniqueSpeakers,
      unique_scripts: uniqueScripts,
      condition_coverage_of_27: `${uniqueConditions}/27`,
      created_at: new Date().toISOString(),
      coverage_matrix: {
        neutral: takes.filter(t => t.emotion === 'neutral').length,
        happy: takes.filter(t => t.emotion === 'happy').length,
        sad: takes.filter(t => t.emotion === 'sad').length,
        angry: takes.filter(t => t.emotion === 'angry').length
      },
      delivery_matrix: {
        normal: takes.filter(t => t.delivery === 'normal').length,
        whisper: takes.filter(t => t.delivery === 'whisper').length,
        laughing_speech: takes.filter(t => t.delivery === 'laughing_speech').length
      }
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: '#1E2230',
        borderRadius: '12px',
        width: '520px',
        maxWidth: '90%',
        padding: '1.5rem',
        border: '1px solid #334155',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} style={{ color: '#8B5CF6' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F8FAFC' }}>
              Export Audar Expressive Package
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Coverage Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Total Accepted Takes</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38BDF8' }}>{takes.length}</div>
          </div>
          <div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Total Duration</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>{totalDuration.toFixed(1)}s</div>
          </div>
          <div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Speakers Tested</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F1F5F9' }}>{uniqueSpeakers}</div>
          </div>
          <div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Condition Matrix Coverage</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#A855F7' }}>{uniqueConditions} / 27</div>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Exports strictly into the format requested in <code>TTS_EXPRESSIVE_DATASET_PROMPT.md</code>, including <code>data.jsonl</code> with all <code>x_reviewer_*</code> fields and <code>manifest.json</code>.
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={downloadJsonl}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
          >
            <Download size={16} />
            Download <code>data.jsonl</code> (Canonical Metadata)
          </button>

          <button
            onClick={downloadManifest}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
          >
            <FileText size={16} />
            Download <code>manifest.json</code> (Summary & Coverage)
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

