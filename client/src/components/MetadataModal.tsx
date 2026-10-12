import React, { useState } from 'react';
import '../styles/metadataModal.css';
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

    </div>
  );

  return createPortal(modalContent, document.body);
};
