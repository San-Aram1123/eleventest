import React from 'react';
import { ArrowRight } from 'lucide-react';

export const WorkflowStepsBanner: React.FC = () => {
  return (
    <div className="workflow-steps-banner">
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <div className="step-title">Enter Kurdish Text</div>
          <div className="step-sub">Type or paste text once into this app</div>
        </div>
      </div>

      <ArrowRight size={18} className="step-arrow" />

      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <div className="step-title">Copy & Prepare</div>
          <div className="step-sub">Saves Unicode text & puts it in clipboard</div>
        </div>
      </div>

      <ArrowRight size={18} className="step-arrow" />

      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <div className="step-title">Generate in Web UI</div>
          <div className="step-sub">Paste into ElevenLabs & download WAV</div>
        </div>
      </div>

      <ArrowRight size={18} className="step-arrow" />

      <div className="step-card">
        <div className="step-number">4</div>
        <div className="step-content">
          <div className="step-title">Drop WAV Here</div>
          <div className="step-sub">Auto-pairs as <code>normal_001.wav/json</code></div>
        </div>
      </div>
    </div>
  );
};
