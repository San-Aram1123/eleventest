import React, { forwardRef } from 'react';

interface KurdishTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const KurdishTextArea = forwardRef<HTMLTextAreaElement, KurdishTextAreaProps>(({
  value,
  onChange,
  placeholder,
  disabled = false
}, ref) => {
  return (
    <div className="textarea-wrapper">
      <textarea
        ref={ref}
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
  );
});

KurdishTextArea.displayName = 'KurdishTextArea';
