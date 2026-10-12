import React from 'react';

interface KurdishCharCounterProps {
  wordCount: number;
  charCount: number;
}

export const KurdishCharCounter: React.FC<KurdishCharCounterProps> = ({ wordCount, charCount }) => {
  return (
    <div className="editor-stats">
      <span>{wordCount} words</span>
      <span className="stats-divider">•</span>
      <span>{charCount} clean chars</span>
    </div>
  );
};
