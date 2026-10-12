import React from 'react';
import { Upload } from 'lucide-react';

interface SplitterDropZoneProps {
  isDragOver: boolean;
  setIsDragOver: (over: boolean) => void;
  handleDrop: (e: React.DragEvent) => void;
  uploadedFileName: string;
  allParagraphsCount: number;
  fileQueueLength: number;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isAppendingRef: React.MutableRefObject<boolean>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SplitterDropZone: React.FC<SplitterDropZoneProps> = ({
  isDragOver,
  setIsDragOver,
  handleDrop,
  uploadedFileName,
  allParagraphsCount,
  fileQueueLength,
  fileInputRef,
  isAppendingRef,
  handleFileChange
}) => {
  return (
    <div
      className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
      onDrop={handleDrop}
      onClick={() => {
        isAppendingRef.current = false;
        fileInputRef.current?.click();
      }}
      style={{
        padding: '18px',
        border: isDragOver ? '2px dashed #38BDF8' : '2px dashed rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-md)',
        background: isDragOver ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
        cursor: 'pointer',
        textAlign: 'center',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".txt,.csv,.tsv,.jsonl"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <Upload size={20} className="text-cyan" style={{ flexShrink: 0 }} />
        <div style={{ textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {uploadedFileName
              ? `Active File: ${uploadedFileName} (${allParagraphsCount} samples)${fileQueueLength > 1 ? ` • ${fileQueueLength} files in queue` : ''}`
              : 'Drop Kurdish .txt files here (Single or Multiple) or click to browse'}
          </span>
          <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
            {uploadedFileName
              ? 'Click or drop new files here to replace queue, or click "+ Add Files" in queue card below to append.'
              : 'Supports multiple .txt files: automatically advances to the next file upon completion.'}
          </span>
        </div>
      </div>
    </div>
  );
};
