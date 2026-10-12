import React from 'react';
import { KURDISH_KEYBOARD_CHARS } from './editorConstants';

interface KurdishVirtualKeyboardProps {
  onInsertChar: (char: string) => void;
}

export const KurdishVirtualKeyboard: React.FC<KurdishVirtualKeyboardProps> = ({ onInsertChar }) => {
  return (
    <div className="keyboard-helper">
      <span className="helper-label">Kurdish Chars:</span>
      <div className="char-buttons">
        {KURDISH_KEYBOARD_CHARS.map((item) => (
          <button
            key={item.char}
            type="button"
            className="char-btn"
            onClick={() => onInsertChar(item.char)}
            title={`Insert ${item.name} (${item.char})`}
          >
            {item.char}
          </button>
        ))}
      </div>
    </div>
  );
};
