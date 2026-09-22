import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Download, FileCode, Edit3, Save, Key } from 'lucide-react';
import { Sample } from '../types';
import { updateSample } from '../services/api';

interface MetadataModalProps {
  sample: Sample;
  onClose: () => void;
  onSampleUpdated: (updated: Sample) => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  sample,
  onClose,
  onSampleUpdated
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmotion, setEditedEmotion] = useState(sample.emotion || 'neutral');
  const [editedNotes, setEditedNotes] = useState(sample.notes || '');
  const [saving, setSaving] = useState(false);

  const usedKey = sample.used_key || (sample as any).customMetadata?.used_key || (sample as any).metadata_extra?.used_key;
  const jsonString = JSON.stringify(sample, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      const updated = await updateSample(sample.id, {
        emotion: editedEmotion,
        notes: editedNotes
      });
      onSampleUpdated(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileCode size={20} className="text-cyan" />
            <div>
              <div className="modal-title">Sample Metadata: #{sample.id}</div>
              <div className="modal-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span>
                  {sample.json_filename || `${sample.id}.json`} • {
                    sample.method === 'gemini_api' 
                      ? 'Google Gemini Voice Studio' 
                      : sample.method === 'elevenlabs_api' 
                        ? 'ElevenLabs API' 
                        : 'ElevenLabs Web'
                  }
                </span>
                {usedKey && (
                  <span 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '3px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '11px',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                    }}
                    title={`Gemini Key: ${usedKey}`}
                  >
                    <Key size={10} />
                    <span>{usedKey}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-header-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={14} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Metadata'}</span>
            </button>
            <button className="btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Kurdish Text Spotlight */}
        <div className="kurdish-spotlight-card">
          <div className="spotlight-header">
            <span className="spotlight-label">Authoritative Kurdish Transcript (Unicode UTF-8)</span>
            <span className="badge badge-emerald">
              {(sample.language || 'ku').toUpperCase()} • {sample.script || (sample.dialect === 'badini' ? 'Kurmanji' : 'Sorani')}
            </span>
          </div>
          <div className="kurdish-text kurdish-spotlight-body" dir="rtl">
            {sample.text}
          </div>
        </div>

        {/* Quick Edit Section */}
        {isEditing && (
          <div className="edit-metadata-form">
            <div className="form-group">
              <label className="form-label">Emotion</label>
              <select
                className="select-control"
                value={editedEmotion}
                onChange={(e) => setEditedEmotion(e.target.value)}
              >
                <option value="neutral">Neutral</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
                <option value="excited">Excited</option>
                <option value="whisper">Whisper</option>
                <option value="laughing">Laughing</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Feedback</label>
              <textarea
                className="textarea-control"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={2}
              />
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveEdits}
              disabled={saving}
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}

        {/* Raw JSON viewer */}
        <div className="json-viewer-wrapper">
          <div className="json-viewer-header">
            <span className="json-title">Raw JSON Payload</span>
            <div className="json-actions">
              <button className="aux-btn" onClick={handleCopyJson}>
                {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <a
                href={`/api/dataset/${sample.id}/download/json`}
                download={sample.json_filename || `${sample.id}.json`}
                className="aux-btn"
              >
                <Download size={13} />
                <span>Download JSON</span>
              </a>
            </div>
          </div>
          <pre className="json-code-block">{jsonString}</pre>
        </div>

        <div className="modal-footer">
          <div className="modal-created-info">
            Created: {sample.created_at ? new Date(sample.created_at).toLocaleString() : '—'}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #0F172A;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          max-width: 760px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }

        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .modal-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kurdish-spotlight-card {
          margin: 16px 20px;
          background: rgba(18, 24, 38, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          box-shadow: inset 0 0 20px rgba(56, 189, 248, 0.05);
        }

        .spotlight-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .spotlight-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .kurdish-spotlight-body {
          font-size: 1.3rem;
          color: #FFFFFF;
          line-height: 1.8;
        }

        .edit-metadata-form {
          margin: 0 20px 16px 20px;
          background: rgba(30, 41, 59, 0.6);
          padding: 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
        }

        .json-viewer-wrapper {
          margin: 0 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 180px;
          max-height: 300px;
          background: #080C14;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .json-viewer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: rgba(15, 23, 42, 0.9);
          border-bottom: 1px solid var(--border-subtle);
        }

        .json-title {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .json-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .json-code-block {
          flex: 1;
          margin: 0;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #38BDF8;
          overflow: auto;
          line-height: 1.5;
        }

        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(11, 15, 23, 0.9);
        }

        .modal-created-info {
          font-size: 0.78rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
