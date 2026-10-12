import React from 'react';
import { KurdishDialect, GeminiVoice, GeminiModel, Sample } from '../../../types';
import { LongParagraphSplitter } from '../../LongParagraphSplitter';
import { GeminiBatchSubNav } from './GeminiBatchSubNav';
import { GeminiBatchVoiceConfigCard } from './GeminiBatchVoiceConfigCard';
import { GeminiBatchUploadCard } from './GeminiBatchUploadCard';
import { GeminiBatchFileQueueCard } from './GeminiBatchFileQueueCard';
import { GeminiBatchProgressMonitor } from './GeminiBatchProgressMonitor';
import { GeminiBatchItemsTable } from './GeminiBatchItemsTable';
import { useGeminiFileQueue } from '../hooks/useGeminiFileQueue';
import { useGeminiBatchRunner } from '../hooks/useGeminiBatchRunner';

interface GeminiBatchStudioProps {
  bulkSubMode: 'standard' | 'long_split';
  setBulkSubMode: (mode: 'standard' | 'long_split') => void;
  dialect: KurdishDialect;
  onDialectChange: (d: KurdishDialect) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  customInstruction: string;
  voices: GeminiVoice[];
  models: GeminiModel[];
  fileQueue: ReturnType<typeof useGeminiFileQueue>;
  batchRunner: ReturnType<typeof useGeminiBatchRunner>;
  onSampleCreated: (s: Sample) => void;
  addToast: (t: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const GeminiBatchStudio: React.FC<GeminiBatchStudioProps> = ({
  bulkSubMode,
  setBulkSubMode,
  dialect,
  onDialectChange,
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  customInstruction,
  voices,
  models,
  fileQueue,
  batchRunner,
  onSampleCreated,
  addToast
}) => {
  return (
    <div className="bulk-studio-wrapper">
      <GeminiBatchSubNav
        bulkSubMode={bulkSubMode}
        setBulkSubMode={setBulkSubMode}
        batchItemsCount={batchRunner.batchItems.length}
      />

      {bulkSubMode === 'long_split' ? (
        <LongParagraphSplitter
          voices={voices}
          models={models}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          dialect={dialect}
          setDialect={onDialectChange}
          customInstruction={customInstruction}
          onSampleCreated={onSampleCreated}
          addToast={addToast}
        />
      ) : (
        <>
          <div className="studio-grid">
            {/* Left Column: Config, Upload, Queue */}
            <div className="studio-left">
              <GeminiBatchVoiceConfigCard
                dialect={dialect}
                onDialectChange={onDialectChange}
                voices={voices}
                batchVoiceMode={batchRunner.batchVoiceMode}
                setBatchVoiceMode={batchRunner.setBatchVoiceMode}
                onRandomizeVoices={batchRunner.handleRandomizeVoices}
                onRandomizeMixVoices={batchRunner.handleRandomizeMixVoices}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                setBatchItems={batchRunner.setBatchItems}
                batchDelayMs={batchRunner.batchDelayMs}
                setBatchDelayMs={batchRunner.setBatchDelayMs}
                autoResumeEnabled={batchRunner.autoResumeEnabled}
                setAutoResumeEnabled={batchRunner.setAutoResumeEnabled}
                autoResumeMinutes={batchRunner.autoResumeMinutes}
                setAutoResumeMinutes={batchRunner.setAutoResumeMinutes}
                addToast={addToast}
              />

              <GeminiBatchUploadCard
                uploadedFileName={fileQueue.uploadedFileName}
                isDragOver={fileQueue.isDragOver}
                onDragOver={fileQueue.handleDragOver}
                onDragLeave={fileQueue.handleDragLeave}
                onDrop={fileQueue.handleDrop}
                fileInputRef={fileQueue.fileInputRef}
                onFileChange={fileQueue.handleFileChange}
                rawBatchInput={fileQueue.rawBatchInput}
                setRawBatchInput={fileQueue.setRawBatchInput}
                onParseRawInput={fileQueue.handleParseRawInput}
              />

              <GeminiBatchFileQueueCard
                fileQueue={fileQueue.fileQueue}
                activeFileId={fileQueue.activeFileId}
                batchState={batchRunner.batchState}
                autoAdvanceNextFile={fileQueue.autoAdvanceNextFile}
                setAutoAdvanceNextFile={fileQueue.setAutoAdvanceNextFile}
                fileInputRef={fileQueue.fileInputRef}
                onSwitchActiveFile={fileQueue.handleSwitchActiveFile}
                onMoveFileInQueue={fileQueue.handleMoveFileInQueue}
                onRemoveFileFromQueue={fileQueue.handleRemoveFileFromQueue}
                onClearCompletedFiles={fileQueue.handleClearCompletedFilesInQueue}
                onClearAllFiles={fileQueue.handleClearAllFilesInQueue}
              />
            </div>

            {/* Right Column: Progress Monitor & Execution Controls */}
            <div className="studio-right">
              <GeminiBatchProgressMonitor
                batchItemsCount={batchRunner.batchItems.length}
                batchState={batchRunner.batchState}
                fileQueue={fileQueue.fileQueue}
                activeFileId={fileQueue.activeFileId}
                uploadedFileName={fileQueue.uploadedFileName}
                autoAdvanceNextFile={fileQueue.autoAdvanceNextFile}
                progressPercent={batchRunner.progressPercent}
                totalLines={batchRunner.totalLines}
                completedLines={batchRunner.completedLines}
                failedLines={batchRunner.failedLines}
                pendingLines={batchRunner.pendingLines}
                batchDelayMs={batchRunner.batchDelayMs}
                setBatchDelayMs={batchRunner.setBatchDelayMs}
                autoResumeEnabled={batchRunner.autoResumeEnabled}
                setAutoResumeEnabled={batchRunner.setAutoResumeEnabled}
                autoResumeMinutes={batchRunner.autoResumeMinutes}
                setAutoResumeMinutes={batchRunner.setAutoResumeMinutes}
                autoResumeCountdown={batchRunner.autoResumeCountdown}
                onResumeBatch={batchRunner.handleResumeBatch}
                onCancelAutoResume={batchRunner.handleStopBatch}
                onStartBatch={batchRunner.handleStartBatch}
                onPauseBatch={batchRunner.handlePauseBatch}
                onStopBatch={batchRunner.handleStopBatch}
                onRetryFailedLines={batchRunner.handleRetryFailedLines}
                onClearBatch={batchRunner.handleClearBatch}
                isBatchRunning={batchRunner.isBatchRunningRef.current}
              />
            </div>
          </div>

          {/* Bottom Table: Interactive Lines Feed */}
          <GeminiBatchItemsTable
            batchItems={batchRunner.batchItems}
            filteredBatchItems={batchRunner.filteredBatchItems}
            totalLines={batchRunner.totalLines}
            completedLines={batchRunner.completedLines}
            failedLines={batchRunner.failedLines}
            pendingLines={batchRunner.pendingLines}
            batchFilter={batchRunner.batchFilter}
            setBatchFilter={batchRunner.setBatchFilter}
            currentProcessingId={batchRunner.currentProcessingId}
            isScanningDataset={batchRunner.isScanningDataset}
            batchState={batchRunner.batchState}
            onScanDatasetDuplicates={batchRunner.handleScanDatasetDuplicates}
            onRemovePendingLines={batchRunner.handleRemovePendingLines}
            onRemoveCompletedLines={batchRunner.handleRemoveCompletedLines}
            onRetrySingleLine={batchRunner.handleRetrySingleLine}
            onDeleteBatchSample={batchRunner.handleDeleteBatchSample}
            onDeleteAndRegenerate={batchRunner.handleDeleteAndRegenerate}
            onRemoveSingleBatchItem={batchRunner.handleRemoveSingleBatchItem}
          />
        </>
      )}
    </div>
  );
};
