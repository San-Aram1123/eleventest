import React from 'react';
import { Layers } from 'lucide-react';
import { MetadataModal } from '../components/MetadataModal';
import { Sample } from '../types';
import { WorkflowStepsBanner } from '../components/normal_workflow/WorkflowStepsBanner';
import { NormalPrepareCard } from '../components/normal_workflow/NormalPrepareCard';
import { AudioDropzoneCard } from '../components/normal_workflow/AudioDropzoneCard';
import { PendingQueueList } from '../components/normal_workflow/PendingQueueList';
import { SampleResultCard } from '../components/shared/SampleResultCard';
import { useNormalWorkflowState } from '../components/normal_workflow/useNormalWorkflowState';

interface NormalWorkflowProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const NormalWorkflowPage: React.FC<NormalWorkflowProps> = (props) => {
  const state = useNormalWorkflowState(props);
  const activePendingItem = state.pendingList.find(p => p.pendingId === state.activePendingId);

  return (
    <div className="normal-page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={24} className="text-emerald inline-icon" />
            <span>Normal ElevenLabs Website Workflow</span>
          </h1>
          <p className="page-description">
            Generate speech using ElevenLabs official web interface and download the WAV. The application preserves your exact Kurdish transcript and automatically pairs it with your dropped WAV file — <strong>never retype transcripts</strong>.
          </p>
        </div>
      </div>

      <WorkflowStepsBanner />

      <div className="normal-grid-layout">
        <NormalPrepareCard
          kurdishText={state.kurdishText}
          onTextChange={state.setKurdishText}
          voiceName={state.voiceName}
          onVoiceNameChange={state.setVoiceName}
          notes={state.notes}
          onNotesChange={state.setNotes}
          isPreparing={state.isPreparing}
          onPrepareAndCopy={state.handlePrepareAndCopy}
        />

        <div className="dropzone-column">
          <AudioDropzoneCard
            activePendingItem={activePendingItem}
            onFileSelected={state.handleFileDrop}
            isUploading={state.isUploading}
          />

          <PendingQueueList
            pendingList={state.pendingList}
            activePendingId={state.activePendingId}
            onSelectPending={state.setActivePendingId}
            onDeletePending={state.handleDeletePending}
          />

          {state.lastPairedSample && (
            <SampleResultCard
              sample={state.lastPairedSample}
              statusBadgeText="Successfully Created"
              autoPlay={true}
              onSaveRatings={state.handleSaveRatings}
              onInspect={state.setInspectingSample}
              className="glass-card-glow paired-sample-card"
            />
          )}
        </div>
      </div>

      {state.inspectingSample && (
        <MetadataModal
          sample={state.inspectingSample}
          onClose={() => state.setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            state.setInspectingSample(updated);
            if (state.lastPairedSample?.id === updated.id) state.setLastPairedSample(updated);
          }}
        />
      )}
    </div>
  );
};
