import React from 'react';
import { LongParagraphSplitterProps } from './splitter/splitterTypes';
import { useParagraphSplitter } from './splitter/useParagraphSplitter';
import { SplitterTopBanner } from './splitter/SplitterTopBanner';
import { SplitterDropZone } from './splitter/SplitterDropZone';
import { SplitterFileQueueCard } from './splitter/SplitterFileQueueCard';
import { SplitterTextEditor } from './splitter/SplitterTextEditor';
import { SplitterEmotionInspector } from './splitter/SplitterEmotionInspector';
import { SplitterConfigPanel } from './splitter/SplitterConfigPanel';
import { SplitterBatchControls } from './splitter/SplitterBatchControls';
import { SplitterProgressCard } from './splitter/SplitterProgressCard';
import { SplitterCompletedChunksGrid } from './splitter/SplitterCompletedChunksGrid';
import { SplitterManualReviewCard } from './splitter/SplitterManualReviewCard';

export const LongParagraphSplitter: React.FC<LongParagraphSplitterProps> = (props) => {
  const s = useParagraphSplitter(props);

  return (
    <div className="long-splitter-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <SplitterTopBanner packetSize={s.packetSize} onSelectPreset={(p) => {
        s.setAllParagraphs(p.paragraphs); s.setRawText(p.paragraphs.join('\n\n')); s.handleDialectSelect(p.dialect);
        props.addToast({ type: 'info', title: `Loaded Preset: ${p.title}` });
      }} />

      <div className="studio-grid" style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
        <div className="studio-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          <SplitterDropZone
            isDragOver={s.isDragOver} setIsDragOver={s.setIsDragOver} uploadedFileName={s.uploadedFileName}
            allParagraphsCount={s.allParagraphs.length} fileQueueLength={s.fileQueue.length}
            fileInputRef={s.fileInputRef} isAppendingRef={s.isAppendingRef}
            handleDrop={(e) => { e.preventDefault(); s.setIsDragOver(false); s.handleProcessMultipleFiles(Array.from(e.dataTransfer.files || []), false); }}
            handleFileChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) s.handleProcessMultipleFiles(files, s.isAppendingRef.current);
              s.isAppendingRef.current = false;
              if (s.fileInputRef.current) s.fileInputRef.current.value = '';
            }}
          />

          <SplitterFileQueueCard
            fileQueue={s.fileQueue} activeFileId={s.activeFileId} batchStatus={s.batchStatus}
            autoRemoveDuplicates={s.autoRemoveDuplicates} setAutoRemoveDuplicates={s.setAutoRemoveDuplicates}
            autoAdvanceNextFile={s.autoAdvanceNextFile} setAutoAdvanceNextFile={s.setAutoAdvanceNextFile}
            handleSwitchActiveFile={s.handleSwitchActiveFile} handleRemoveFileFromQueue={s.handleRemoveFileFromQueue}
            handleMoveFileInQueue={s.handleMoveFileInQueue} handleClearCompletedFilesInQueue={s.handleClearCompletedFilesInQueue}
            handleClearAllFilesInQueue={s.handleClearAllFilesInQueue}
            onAddFilesClick={() => { s.isAppendingRef.current = true; s.fileInputRef.current?.click(); }}
          />

          <SplitterTextEditor
            allParagraphs={s.allParagraphs} rawText={s.rawText} packetsCount={s.packets.length}
            packetSize={s.packetSize} duplicateCount={s.duplicateStats.duplicateCount}
            handleRawTextChange={s.handleRawTextChange} handleRemoveDuplicates={s.handleRemoveDuplicates}
          >
            <SplitterEmotionInspector
              allParagraphs={s.allParagraphs} packetSize={s.packetSize} defaultEmotion={s.defaultEmotion}
              showParagraphPreview={s.showParagraphPreview} setShowParagraphPreview={s.setShowParagraphPreview}
            />
          </SplitterTextEditor>
        </div>

        <div className="studio-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, maxWidth: '100%' }}>
          <SplitterConfigPanel
            selectedModel={props.selectedModel} setSelectedModel={props.setSelectedModel}
            isResettingCooldowns={s.isResettingCooldowns} handleResetCooldowns={s.handleResetCooldowns}
            dialect={props.dialect} handleDialectSelect={s.handleDialectSelect}
            defaultEmotion={s.defaultEmotion} setDefaultEmotion={s.setDefaultEmotion}
            showPromptSettings={s.showPromptSettings} setShowPromptSettings={s.setShowPromptSettings}
            splitterPromptInstruction={s.splitterPromptInstruction} setSplitterPromptInstruction={s.setSplitterPromptInstruction}
            voiceStrategy={s.voiceStrategy} setVoiceStrategy={s.setVoiceStrategy}
            voices={props.voices} selectedVoice={props.selectedVoice} setSelectedVoice={props.setSelectedVoice}
            packetSize={s.packetSize} handlePacketSizeChange={s.handlePacketSizeChange}
            packetsCount={s.packets.length} allParagraphsCount={s.allParagraphs.length}
            workflowMode={s.workflowMode} setWorkflowMode={s.setWorkflowMode}
          >
            <SplitterBatchControls
              workflowMode={s.workflowMode} fileQueue={s.fileQueue} activeFileId={s.activeFileId}
              uploadedFileName={s.uploadedFileName} autoRemoveDuplicates={s.autoRemoveDuplicates}
              autoAdvanceNextFile={s.autoAdvanceNextFile} batchStatus={s.batchStatus}
              currentPacketIndex={s.currentPacketIndex} packetsCount={s.packets.length}
              allParagraphsCount={s.allParagraphs.length} completedChunksCount={s.completedChunks.length}
              failedPacketIndices={s.failedPacketIndices} isManualGenerating={s.isManualGenerating}
              packetSize={s.packetSize} handlePauseBatch={s.handlePauseBatch} handleStopBatch={s.handleStopBatch}
              handleStartBatch={() => s.handleStartBatch()} handleResetBatch={s.handleResetBatch}
              handleRetryFailed={s.handleRetryFailedPackets} handleGenerateManualPacket={s.handleGenerateManualPacket}
            />
          </SplitterConfigPanel>
        </div>
      </div>

      <SplitterProgressCard
        workflowMode={s.workflowMode} batchStatus={s.batchStatus} completedChunksCount={s.completedChunks.length}
        allParagraphsCount={s.allParagraphs.length} uploadedFileName={s.uploadedFileName} fileQueueLength={s.fileQueue.length}
        activeFileIndex={Math.max(1, s.fileQueue.findIndex(f => f.id === s.activeFileId) + 1)}
        currentPacketIndex={s.currentPacketIndex} packetsCount={s.packets.length}
        currentPacketChunksCount={s.packets[s.currentPacketIndex]?.length || Math.min(s.packetSize, s.allParagraphs.length)}
        failedPacketIndices={s.failedPacketIndices} handleRetryFailed={s.handleRetryFailedPackets} batchLog={s.batchLog}
      >
        <SplitterCompletedChunksGrid completedChunks={s.completedChunks} activePlayingId={s.activePlayingId} handlePlayAudio={s.handlePlayAudio} />
      </SplitterProgressCard>

      <SplitterManualReviewCard
        workflowMode={s.workflowMode} manualResponse={s.manualResponse} manualChunks={s.manualChunks}
        isManualSavingAll={s.isManualSavingAll} activePlayingId={s.activePlayingId}
        handleSaveManualChunks={s.handleSaveManualChunks} handlePlayAudio={s.handlePlayAudio}
      />
    </div>
  );
};

export default LongParagraphSplitter;
