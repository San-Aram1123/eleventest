import React from 'react';
import { KurdishDialect, GeminiVoice, GeminiModel } from '../../../types';
import { useGeminiSingleSynthesis } from '../hooks/useGeminiSingleSynthesis';
import { GeminiSinglePromptForm } from './GeminiSinglePromptForm';
import { GeminiSingleAudioResult } from './GeminiSingleAudioResult';

interface GeminiSingleStudioProps {
  dialect: KurdishDialect;
  onDialectChange: (dialect: KurdishDialect) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customInstruction: string;
  setCustomInstruction: (instruction: string) => void;
  voices: GeminiVoice[];
  models: GeminiModel[];
  singleSynthesis: ReturnType<typeof useGeminiSingleSynthesis>;
}

export const GeminiSingleStudio: React.FC<GeminiSingleStudioProps> = ({
  dialect,
  onDialectChange,
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  customInstruction,
  setCustomInstruction,
  voices,
  models,
  singleSynthesis
}) => {
  return (
    <div className="studio-grid">
      <GeminiSinglePromptForm
        dialect={dialect}
        onDialectChange={onDialectChange}
        text={singleSynthesis.text}
        setText={singleSynthesis.setText}
        textareaRef={singleSynthesis.textareaRef}
        onInsertTag={singleSynthesis.handleInsertTag}
        voices={voices}
        models={models}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        customInstruction={customInstruction}
        setCustomInstruction={setCustomInstruction}
        isGenerating={singleSynthesis.isGenerating}
        onGenerate={singleSynthesis.handleGenerate}
      />
      <GeminiSingleAudioResult
        generatedSample={singleSynthesis.generatedSample}
        generatedAudioUrl={singleSynthesis.generatedAudioUrl}
        dialect={dialect}
        selectedVoice={selectedVoice}
        duration={singleSynthesis.duration}
        usedKeyMasked={singleSynthesis.usedKeyMasked}
        detectedTags={singleSynthesis.detectedTags}
        activeRatings={singleSynthesis.activeRatings}
        onRatingsChange={singleSynthesis.handleRatingsChange}
      />
    </div>
  );
};
