import React, { useRef, useState } from 'react';
import { Upload, FileAudio, Clock, AlertTriangle } from 'lucide-react';
import { PendingSample } from '../../types';

export interface AudioDropzoneCardProps {
  activePendingItem: PendingSample | undefined;
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export const AudioDropzoneCard: React.FC<AudioDropzoneCardProps> = ({
  activePendingItem,
  onFileSelected,
  isUploading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-card dropzone-card">
      <div className="card-section-title">
        <span className="step-badge">Step 3 & 4</span>
        <span>Drop ElevenLabs Audio (WAV)</span>
      </div>

      {activePendingItem ? (
        <div className="active-pairing-target">
          <div className="target-label">
            <Clock size={14} className="text-cyan" />
            <span>Matching to Prepared Sample:</span>
          </div>
          <div className="kurdish-text target-kurdish-preview" dir="rtl">
            {activePendingItem.text}
          </div>
          <div className="target-meta">
            <span className="badge badge-emerald">
              {activePendingItem.emotion.toUpperCase()}
            </span>
            <span className="badge badge-dim">
              Ready for WAV drop
            </span>
          </div>
        </div>
      ) : (
        <div className="no-target-warning">
          <AlertTriangle size={15} className="text-amber" />
          <span>No active sample prepared yet. Click &quot;Copy Text &amp; Prepare Sample&quot; first!</span>
        </div>
      )}

      <div
        className={`drop-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,audio/wav,audio/x-wav,.mp3,audio/mpeg"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFileSelected(e.target.files[0]);
            }
          }}
        />

        <div className="drop-icon-wrap">
          <Upload size={32} className="text-cyan" />
        </div>
        <div className="drop-text-main">
          {isUploading ? 'Saving & Associating Audio...' : 'Drag & Drop Downloaded WAV Here'}
        </div>
        <div className="drop-text-sub">
          or click to browse from your computer
        </div>
        <div className="drop-badge">
          <FileAudio size={12} />
          <span>Accepts .wav / .mp3 from ElevenLabs</span>
        </div>
      </div>

      <div className="kurdish-safe-banner">
        <div className="safe-banner-title">✨ Kurdish Unicode Protection Guarantee</div>
        <div className="safe-banner-text">
          ElevenLabs&apos; website video sharing may show <code>□□□□</code> boxes due to web font issues. This tool completely bypasses that problem by taking the exact Unicode transcript stored in Step 2 and pairing it directly with your clean audio!
        </div>
      </div>
    </div>
  );
};
