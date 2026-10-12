import React from 'react';

export const KeyPoolTipsSection: React.FC = () => {
  return (
    <div className="tips-section">
      <div className="tips-title">⚡ How Multi-Key Auto-Failover Works:</div>
      <ul className="tips-list">
        <li>You can add 2, 3, or more free/paid ElevenLabs accounts to this pool.</li>
        <li>
          Generations automatically use the first ready key. If that key exhausts its quota (401/402/429), the engine{' '}
          <strong>immediately switches to the next account</strong> without failing your request.
        </li>
        <li>
          Keys are stored locally in your environment (<code>.env</code> &amp; <code>keys.json</code>) and never exposed publicly.
        </li>
      </ul>
    </div>
  );
};
