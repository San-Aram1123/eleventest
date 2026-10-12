import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

interface SplitterTextEditorProps {
  allParagraphs: string[];
  rawText: string;
  packetsCount: number;
  packetSize: number;
  duplicateCount: number;
  handleRawTextChange: (txt: string) => void;
  handleRemoveDuplicates: () => void;
  children?: React.ReactNode;
}

export const SplitterTextEditor: React.FC<SplitterTextEditorProps> = ({
  allParagraphs,
  rawText,
  packetsCount,
  packetSize,
  duplicateCount,
  handleRawTextChange,
  handleRemoveDuplicates,
  children
}) => {
  return (
    <div className="card" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
      <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
          <FileText size={18} className="text-cyan" style={{ flexShrink: 0 }} />
          <span className="card-title">Kurdish Paragraphs Editor</span>
          <span className="badge" style={{ fontSize: '0.75rem' }}>
            {allParagraphs.length} Samples
          </span>
          {duplicateCount > 0 && (
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleRemoveDuplicates}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Remove duplicate paragraphs to prevent multiple recordings of identical text"
            >
              <AlertCircle size={12} />
              <span>Remove {duplicateCount} Duplicates</span>
            </button>
          )}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#A78BFA' }}>
          Grouped into <strong>{packetsCount}</strong> API Packets
        </div>
      </div>

      <div className="card-body" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <textarea
          value={rawText || allParagraphs.join('\n\n')}
          onChange={(e) => handleRawTextChange(e.target.value)}
          placeholder="دەقە کوردییەکان لێرە بنووسە یان دابنێ. هەر بڕگەیەک بە دێڕێکی بەتاڵ جیا بکەرەوە... پشتگیری تاگی هەستەکان وەک [laugh]، [whisper]، [happy]، [sigh] دەکات."
          rows={9}
          dir="rtl"
          style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-kurdish)',
            fontSize: '0.96rem',
            padding: '12px',
            lineHeight: 1.7,
            resize: 'vertical',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />

        {/* Stats Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            flexWrap: 'wrap',
            gap: '6px',
            minWidth: 0
          }}
        >
          <div>
            <strong>{allParagraphs.length}</strong> Paragraphs • <strong>{packetsCount}</strong> Packets • <strong>{packetSize}</strong> per Call
          </div>
          <div style={{ color: '#38BDF8' }}>
            ⚡ Uses <strong>{packetsCount} API Calls</strong> instead of {allParagraphs.length} calls! (Saves {Math.max(0, allParagraphs.length - packetsCount)} calls)
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};
