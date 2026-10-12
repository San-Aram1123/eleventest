import React, { useRef } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import './editor/KurdishEditor.css';
import { useKurdishTextParser } from './editor/useKurdishTextParser';
import { KurdishPresetsBar } from './editor/KurdishPresetsBar';
import { AudioTagToolbar } from './editor/AudioTagToolbar';
import { KurdishTextArea } from './editor/KurdishTextArea';
import { KurdishTagPreviewBanner } from './editor/KurdishTagPreviewBanner';
import { KurdishVirtualKeyboard } from './editor/KurdishVirtualKeyboard';
import { KurdishCharCounter } from './editor/KurdishCharCounter';

export interface KurdishEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onSelectPreset?: (text: string, suggestedEmotion?: string) => void;
  showInlineTagToolbar?: boolean;
}

export const KurdishEditor: React.FC<KurdishEditorProps> = ({
  value,
  onChange,
  label = 'Kurdish Text (Unicode / RTL)',
  placeholder = 'دەقی کوردی لێرە بنووسە... (کلیک لەسەر تاگەکانی [laugh] یان [whisper] بکە بۆ دانانیان لەناو دێڕەکەدا)',
  disabled = false,
  onSelectPreset,
  showInlineTagToolbar = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { cleanTranscript, detectedTags, tagCounts, wordCount, charCount } = useKurdishTextParser(value);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange((value || '') + textToInsert);
      return;
    }
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const needsLead = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
    const needsTrail = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');
    const formatted = `${needsLead ? ' ' : ''}${textToInsert}${needsTrail ? ' ' : ' '}`;
    onChange(before + formatted + after);
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formatted.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  return (
    <div className="kurdish-editor-container">
      <div className="editor-header">
        <div className="editor-label-group">
          <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
          <span className="badge badge-cyan">Sorani UTF-8</span>
          {detectedTags.length > 0 && (
            <span className="badge badge-emerald">
              {detectedTags.length} Tag{detectedTags.length > 1 ? 's' : ''} in Text
            </span>
          )}
        </div>
        <div className="editor-actions">
          {value && (
            <>
              <button type="button" className="aux-btn" onClick={() => navigator.clipboard.writeText(value)} title="Copy Kurdish text to clipboard">
                <Copy size={13} />
                <span>Copy</span>
              </button>
              <button type="button" className="aux-btn" onClick={() => onChange('')} title="Clear text">
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {onSelectPreset && <KurdishPresetsBar onSelectPreset={onSelectPreset} />}
      {showInlineTagToolbar && <AudioTagToolbar disabled={disabled} onInsertTag={insertAtCursor} />}

      <KurdishTextArea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />

      <KurdishTagPreviewBanner detectedTags={detectedTags} tagCounts={tagCounts} cleanTranscript={cleanTranscript} />

      <div className="editor-footer">
        <KurdishVirtualKeyboard onInsertChar={insertAtCursor} />
        <KurdishCharCounter wordCount={wordCount} charCount={charCount} />
      </div>
    </div>
  );
};
