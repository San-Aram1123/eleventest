import React, { useRef, useState } from 'react';
import { Copy, Trash2, Sparkles, Wand2, Plus } from 'lucide-react';

interface KurdishEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onSelectPreset?: (text: string, suggestedEmotion?: string) => void;
  showInlineTagToolbar?: boolean;
}

const PRESET_EXAMPLES = [
  {
    title: 'Happy with Laughs',
    emotion: 'laugh',
    text: 'سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش ڕوویدا.'
  },
  {
    title: 'Whisper Secret',
    emotion: 'whisper',
    text: '[whisper] گوێ بگرە، ئەمە نهێنییەکی زۆر گەورەیە.'
  },
  {
    title: 'Angry Question',
    emotion: 'angry',
    text: 'ئەمە چییە؟ [angry] بۆچی هەمیشە ئەمە ڕوودەدات؟'
  },
  {
    title: 'Multi-Emotions',
    emotion: 'mixed',
    text: 'سڵاو! [laugh] ئەمە زۆر خۆشە بەڵام [whisper] دەبێت زۆر هێمن بین.'
  },
  {
    title: 'Simple Greeting',
    emotion: 'neutral',
    text: 'سڵاو! چۆنی؟'
  }
];

const KURDISH_KEYBOARD_CHARS = [
  { char: 'ێ', name: 'Ye bi ser' },
  { char: 'ڕ', name: 'Re giran' },
  { char: 'ڵ', name: 'Lam giran' },
  { char: 'ڤ', name: 'Ve' },
  { char: 'ۆ', name: 'O' },
  { char: 'ئ', name: 'Hamza' },
  { char: 'ک', name: 'Kaf' },
  { char: 'ی', name: 'Ye' },
  { char: 'ە', name: 'He / Ae' }
];

const QUICK_INLINE_TAGS = [
  { tag: '[laugh]', label: 'Laugh' },
  { tag: '[whisper]', label: 'Whisper' },
  { tag: '[sigh]', label: 'Sigh' },
  { tag: '[gasp]', label: 'Gasp' },
  { tag: '[crying]', label: 'Crying' },
  { tag: '[shouting]', label: 'Shout' },
  { tag: '[angry]', label: 'Angry' },
  { tag: '[happy]', label: 'Happy' },
  { tag: '[giggle]', label: 'Giggle' },
  { tag: '[excited]', label: 'Excited' },
  { tag: '[cough]', label: 'Cough' }
];

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
  const [customTagInput, setCustomTagInput] = useState('');

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

    // Smart surrounding whitespace for audio tags
    const needsLeadingSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
    const needsTrailingSpace = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');
    const formatted = `${needsLeadingSpace ? ' ' : ''}${textToInsert}${needsTrailingSpace ? ' ' : ' '}`;

    const updated = before + formatted + after;
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formatted.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleInsertCustomTag = () => {
    if (!customTagInput.trim()) return;
    let tag = customTagInput.trim();
    if (!tag.startsWith('[')) tag = `[${tag}`;
    if (!tag.endsWith(']')) tag = `${tag}]`;
    insertAtCursor(tag);
    setCustomTagInput('');
  };

  const insertChar = (char: string) => {
    insertAtCursor(char);
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  };

  // Extract all tags and clean transcript
  const cleanTranscript = value.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();
  const detectedTags = (value.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
  
  // Count frequencies of each tag
  const tagCounts: Record<string, number> = {};
  detectedTags.forEach(t => {
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  });

  const wordCount = cleanTranscript ? cleanTranscript.split(/\s+/).length : 0;
  const charCount = cleanTranscript.length;

  return (
    <div className="kurdish-editor-container">
      <div className="editor-header">
        <div className="editor-label-group">
          <label className="form-label" style={{ marginBottom: 0 }}>
            {label}
          </label>
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
              <button
                type="button"
                className="aux-btn"
                onClick={copyToClipboard}
                title="Copy Kurdish text to clipboard"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
              <button
                type="button"
                className="aux-btn"
                onClick={() => onChange('')}
                title="Clear text"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preset Suggestions Bar */}
      {onSelectPreset && (
        <div className="presets-bar">
          <div className="presets-title">
            <Sparkles size={12} />
            <span>Presets:</span>
          </div>
          <div className="presets-list">
            {PRESET_EXAMPLES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-pill"
                onClick={() => onSelectPreset(preset.text, preset.emotion)}
                title={preset.text}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline Audio Tags Insertion Palette */}
      {showInlineTagToolbar && (
        <div className="inline-tags-bar">
          <div className="tags-bar-header">
            <Wand2 size={13} className="text-cyan" />
            <span>Click to Insert Audio Tag at Cursor:</span>
          </div>
          <div className="inline-tags-list">
            {QUICK_INLINE_TAGS.map((t) => (
              <button
                key={t.tag}
                type="button"
                className="inline-tag-chip"
                onClick={() => insertAtCursor(t.tag)}
                title={`Click to insert ${t.tag} (click multiple times for repeated tags)`}
                disabled={disabled}
              >
                <code>{t.tag}</code>
              </button>
            ))}

            {/* Custom Tag Mini Inserter */}
            <div className="custom-tag-mini-box">
              <input
                type="text"
                className="custom-tag-mini-input"
                placeholder="custom tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertCustomTag();
                  }
                }}
              />
              <button
                type="button"
                className="custom-tag-mini-btn"
                onClick={handleInsertCustomTag}
                title="Insert custom tag"
                disabled={!customTagInput.trim()}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          dir="rtl"
          lang="ckb"
          className="textarea-control textarea-kurdish"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          id="kurdish-text-input"
        />
      </div>

      {/* Tag Summary & Clean Transcript Preview (if tags exist) */}
      {detectedTags.length > 0 && (
        <div className="tags-detected-banner">
          <div className="detected-chips-row">
            <span className="detected-label">Active Speech Tags:</span>
            {Object.entries(tagCounts).map(([tag, count]) => (
              <span key={tag} className="tag-count-pill">
                <code>{tag}</code>
                {count > 1 && <span className="pill-count">×{count}</span>}
              </span>
            ))}
          </div>
          <div className="clean-transcript-row" dir="rtl">
            <span className="clean-label">Saved in JSON (Clean Unicode):</span>
            <span className="kurdish-text clean-text-val">{cleanTranscript || '(Empty)'}</span>
          </div>
        </div>
      )}

      {/* Footer: Kurdish Keyboard Insert Bar & Counters */}
      <div className="editor-footer">
        <div className="keyboard-helper">
          <span className="helper-label">Kurdish Chars:</span>
          <div className="char-buttons">
            {KURDISH_KEYBOARD_CHARS.map((item) => (
              <button
                key={item.char}
                type="button"
                className="char-btn"
                onClick={() => insertChar(item.char)}
                title={`Insert ${item.name} (${item.char})`}
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>

        <div className="editor-stats">
          <span>{wordCount} words</span>
          <span className="stats-divider">•</span>
          <span>{charCount} clean chars</span>
        </div>
      </div>

      <style>{`
        .kurdish-editor-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }

        .editor-label-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .editor-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inline-tags-bar {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(15, 23, 42, 0.7);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
        }

        .tags-bar-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #38BDF8;
        }

        .inline-tags-list {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .inline-tag-chip {
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #F8FAFC;
          padding: 4px 9px;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.12s ease;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .inline-tag-chip code {
          font-family: var(--font-mono);
          color: #38BDF8;
          font-weight: 600;
        }

        .inline-tag-chip:hover {
          background: #0284C7;
          border-color: #38BDF8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
        }

        .inline-tag-chip:hover code {
          color: #FFFFFF;
        }

        .inline-tag-chip:active {
          transform: scale(0.95);
        }

        .custom-tag-mini-box {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 1px 4px;
        }

        .custom-tag-mini-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.75rem;
          font-family: var(--font-mono);
          padding: 3px 6px;
          width: 95px;
          outline: none;
        }

        .custom-tag-mini-btn {
          background: #0284C7;
          border: none;
          color: #fff;
          border-radius: 3px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .custom-tag-mini-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .presets-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .presets-title {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .presets-list {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preset-pill {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .preset-pill:hover {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.35);
        }

        .textarea-wrapper {
          position: relative;
        }

        .tags-detected-banner {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detected-chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .detected-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #38BDF8;
        }

        .tag-count-pill {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-sm);
          padding: 2px 7px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag-count-pill code {
          font-family: var(--font-mono);
          color: #BAE6FD;
          font-weight: 600;
        }

        .pill-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #34D399;
          font-weight: 700;
        }

        .clean-transcript-row {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 6px;
        }

        .clean-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #34D399;
          white-space: nowrap;
          font-family: var(--font-sans);
        }

        .clean-text-val {
          color: #FFFFFF;
          font-size: 0.95rem;
        }

        .editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 4px;
        }

        .keyboard-helper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .helper-label {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .char-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .char-btn {
          font-family: var(--font-kurdish);
          font-size: 1.05rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid var(--border-medium);
          color: var(--text-main);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .char-btn:hover {
          background: #0284C7;
          color: #fff;
          border-color: #38BDF8;
          transform: translateY(-1px);
        }

        .editor-stats {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stats-divider {
          color: var(--border-medium);
        }
      `}</style>
    </div>
  );
};
