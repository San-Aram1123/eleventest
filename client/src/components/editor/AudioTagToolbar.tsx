import React, { useState } from 'react';
import { Wand2, Plus } from 'lucide-react';
import { QUICK_INLINE_TAGS } from './editorConstants';

interface AudioTagToolbarProps {
  disabled?: boolean;
  onInsertTag: (tag: string) => void;
}

export const AudioTagToolbar: React.FC<AudioTagToolbarProps> = ({ disabled, onInsertTag }) => {
  const [customTagInput, setCustomTagInput] = useState('');

  const handleInsertCustomTag = () => {
    if (!customTagInput.trim()) return;
    let tag = customTagInput.trim();
    if (!tag.startsWith('[')) tag = `[${tag}`;
    if (!tag.endsWith(']')) tag = `${tag}]`;
    onInsertTag(tag);
    setCustomTagInput('');
  };

  return (
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
            onClick={() => onInsertTag(t.tag)}
            title={`Click to insert ${t.tag} (click multiple times for repeated tags)`}
            disabled={disabled}
          >
            <code>{t.tag}</code>
          </button>
        ))}

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
  );
};
