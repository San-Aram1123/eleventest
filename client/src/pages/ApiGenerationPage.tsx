import React from 'react';
import { Sparkles } from 'lucide-react';
import { MetadataModal } from '../components/MetadataModal';
import { Sample, SystemConfig } from '../types';
import { KeyPoolBanner } from '../components/shared/KeyPoolBanner';
import { QuickAddKeyDrawer } from '../components/shared/QuickAddKeyDrawer';
import { ApiGenerationForm } from '../components/api_generation/ApiGenerationForm';
import { ApiGenerationOutputPanel } from '../components/api_generation/ApiGenerationOutputPanel';
import { useApiGenerationState } from '../components/api_generation/useApiGenerationState';

interface ApiGenerationPageProps {
  config: SystemConfig | null;
  onOpenSettings: () => void;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  onConfigUpdated?: (config: SystemConfig) => void;
}

export const ApiGenerationPage: React.FC<ApiGenerationPageProps> = (props) => {
  const { config, onOpenSettings } = props;
  const state = useApiGenerationState(props);

  return (
    <div className="api-page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} className="text-cyan inline-icon" />
            <span>ElevenLabs Multi-Key Speech Generator</span>
          </h1>
          <p className="page-description">
            Synthesize Kurdish emotional speech with ElevenLabs v3. Supports inline tags, continuous whisper, and <strong>automatic multi-key quota failover</strong>.
          </p>
        </div>
      </div>

      <KeyPoolBanner
        config={config}
        onOpenSettings={onOpenSettings}
        onToggleQuickAdd={() => state.setShowInlineKeyEdit(!state.showInlineKeyEdit)}
        isQuickAddOpen={state.showInlineKeyEdit}
      />

      <QuickAddKeyDrawer
        isOpen={state.showInlineKeyEdit}
        onAddKey={state.handleAddInlineKey}
      />

      <div className="api-grid-layout">
        <ApiGenerationForm
          kurdishText={state.kurdishText}
          onTextChange={state.setKurdishText}
          onSelectEmotion={state.setSelectedEmotion}
          whisperEntire={state.whisperEntire}
          onWhisperEntireChange={state.setWhisperEntire}
          voices={state.voices}
          selectedVoiceId={state.selectedVoiceId}
          onVoiceChange={state.setSelectedVoiceId}
          selectedModelId={state.selectedModelId}
          onModelChange={state.setSelectedModelId}
          isCustomModel={state.isCustomModel}
          onIsCustomModelChange={state.setIsCustomModel}
          customModelText={state.customModelText}
          onCustomModelTextChange={state.setCustomModelText}
          loadingVoices={state.loadingVoices}
          onReloadVoices={state.loadCatalog}
          isKeyValid={Boolean(config?.keyValid)}
          showAdvanced={state.showAdvanced}
          onToggleAdvanced={() => state.setShowAdvanced(!state.showAdvanced)}
          stability={state.stability}
          onStabilityChange={state.setStability}
          similarityBoost={state.similarityBoost}
          onSimilarityBoostChange={state.setSimilarityBoost}
          styleExaggeration={state.styleExaggeration}
          onStyleExaggerationChange={state.setStyleExaggeration}
          speakerBoost={state.speakerBoost}
          onSpeakerBoostChange={state.setSpeakerBoost}
          generating={state.generating}
          onSubmit={state.handleGenerate}
        />

        <ApiGenerationOutputPanel
          currentSample={state.currentSample}
          activePlaybackTime={state.activePlaybackTime}
          onTimeUpdate={state.setActivePlaybackTime}
          onSaveRatings={state.handleSaveRatings}
          onInspect={state.setInspectingSample}
          resultRef={state.resultRef}
        />
      </div>

      {state.inspectingSample && (
        <MetadataModal
          sample={state.inspectingSample}
          onClose={() => state.setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            state.setInspectingSample(updated);
            if (state.currentSample?.id === updated.id) state.setCurrentSample(updated);
          }}
        />
      )}
    </div>
  );
};
