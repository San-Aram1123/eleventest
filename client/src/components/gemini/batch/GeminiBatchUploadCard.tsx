import React from 'react';
import { Upload, FileText, ListOrdered } from 'lucide-react';

interface GeminiBatchUploadCardProps {
  uploadedFileName: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rawBatchInput: string;
  setRawBatchInput: (val: string) => void;
  onParseRawInput: () => void;
}

export const GeminiBatchUploadCard: React.FC<GeminiBatchUploadCardProps> = ({
  uploadedFileName,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  onFileChange,
  rawBatchInput,
  setRawBatchInput,
  onParseRawInput
}) => {
  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} className="text-cyan" />
          <span className="card-title">Upload Kurdish Text Files (.txt)</span>
        </div>
        {uploadedFileName && (
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
            <FileText size={12} />
            <span>{uploadedFileName}</span>
          </span>
        )}
      </div>

      <div className="card-body">
        {/* Drag and Drop Zone */}
        <div
          className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.csv,.tsv,.jsonl"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon">
            <Upload size={32} className="text-cyan" />
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#E2E8F0', marginTop: '6px' }}>
            Click to choose or Drag & Drop Kurdish .txt files (Single or Multiple)
          </strong>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
            Support for multiple files: After finishing one file, it automatically moves to the next.
          </p>
        </div>

        {/* Or Paste Raw Text */}
        <div style={{ marginTop: '14px' }}>
          <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Or Paste Multiple Kurdish Lines:</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>1 line = 1 audio sample</span>
          </label>
          <textarea
            className="input-control text-area-kurdish"
            dir="rtl"
            rows={3}
            placeholder="دێڕی یەکەم بنووسە...&#10;دێڕی دووەم بنووسە [laugh]...&#10;دێڕی سێیەم [whisper]..."
            value={rawBatchInput}
            onChange={(e) => setRawBatchInput(e.target.value)}
          />
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onParseRawInput}
              disabled={!rawBatchInput.trim()}
            >
              <ListOrdered size={14} />
              <span>Parse Lines to Batch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
