import React from 'react';
import { isRtlLanguage } from '../../../utils/kurdishText';

interface KurdishTextSnippetProps {
  text: string;
  language?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const KurdishTextSnippet: React.FC<KurdishTextSnippetProps> = ({
  text,
  language,
  className = '',
  style
}) => {
  const isRtl = isRtlLanguage(language);

  return (
    <div
      className={className}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isRtl ? 'Rabar, Tahoma, var(--font-kurdish), sans-serif' : 'inherit',
        ...style
      }}
    >
      {text}
    </div>
  );
};
