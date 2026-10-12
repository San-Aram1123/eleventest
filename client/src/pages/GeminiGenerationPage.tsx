import React, { useState, useRef, useCallback } from 'react';
import '../styles/gemini-studio.css';
import { Sample, KurdishDialect } from '../types';
import { FALLBACK_GEMINI_VOICES } from '../components/gemini/constants';
import { getStoredBatchState } from '../components/gemini/storage';
import { useGeminiKeyPool } from '../components/gemini/hooks/useGeminiKeyPool';
import { useGeminiSingleSynthesis } from '../components/gemini/hooks/useGeminiSingleSynthesis';
import { useGeminiFileQueue } from '../components/gemini/hooks/useGeminiFileQueue';
import { useGeminiBatchRunner } from '../components/gemini/hooks/useGeminiBatchRunner';
import { GeminiPageHeader } from '../components/gemini/header/GeminiPageHeader';
import { GeminiKeyManager } from '../components/GeminiKeyManager';
import { GeminiSingleStudio } from '../components/gemini/single/GeminiSingleStudio';
import { GeminiBatchStudio } from '../components/gemini/batch/GeminiBatchStudio';
import { PairedEmotionBatchPage } from './PairedEmotionBatchPage';

// Re-export for backward compatibility with SpeakerConfigSection.tsx
export { FALLBACK_GEMINI_VOICES };

interface GeminiGenerationPageProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const GeminiGenerationPage: React.FC<GeminiGenerationPageProps> = ({
  onSampleCreated,
  addToast
}) => {
  const initialSaved = useRef(getStoredBatchState()).current;

  // Active navigation modes
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'paired'>(() => initialSaved?.activeTab || 'single');
  const [bulkSubMode, setBulkSubMode] = useState<'standard' | 'long_split'>('standard');

  // Shared Synthesis Configuration
  const [dialect, setDialect] = useState<KurdishDialect>(() => initialSaved?.dialect || 'sorani');
  const [selectedVoice, setSelectedVoice] = useState(() => initialSaved?.selectedVoice || 'Puck');
  const [selectedModel, setSelectedModel] = useState(() => initialSaved?.selectedModel || 'gemini-3.8-flash-tts');
  const [customInstruction, setCustomInstruction] = useState(() => initialSaved?.customInstruction || '');

  const handleDefaultConfigLoaded = useCallback((defVoice?: string, defModel?: string) => {
    setSelectedVoice(prev => (prev && prev !== 'Puck') ? prev : (initialSaved?.selectedVoice || defVoice || 'Puck'));
    setSelectedModel(prev => (prev && prev !== 'gemini-3.1-flash-tts-preview' && prev !== 'gemini-3.8-flash-tts') ? prev : (initialSaved?.selectedModel || defModel || 'gemini-3.8-flash-tts'));
  }, [initialSaved]);

  // 1. Key Pool & Live Quota Monitor Hook
  const keyPool = useGeminiKeyPool({
    addToast,
    onDefaultConfigLoaded: handleDefaultConfigLoaded
  });

  // 2. Single Synthesis Studio Hook
  const singleSynthesis = useGeminiSingleSynthesis({
    dialect,
    selectedVoice,
    selectedModel,
    customInstruction,
    onSampleCreated,
    addToast
  });

  // Batch Runner & File Queue coordination refs
  const fileQueueRef = useRef<any[]>(initialSaved?.fileQueue || []);
  const activeFileIdRef = useRef<string | null>(initialSaved?.activeFileId || null);
  const autoAdvanceNextFileRef = useRef<boolean>(true);
  const advanceToNextQueuedFileRef = useRef<(finishedFileId?: string | null, forceStart?: boolean) => Promise<void>>(async () => {});
  const setFileQueueRef = useRef<React.Dispatch<React.SetStateAction<any[]>>>(() => {});
  const isBatchRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);
  const startBatchExecutionRef = useRef<any>(null);
  const batchItemsRef = useRef<any[]>(initialSaved?.batchItems || []);

  const handleDialectChange = (newDialect: KurdishDialect) => {
    setDialect(newDialect);
    if (newDialect === 'badini') {
      if (activeTab === 'single') {
        singleSynthesis.setText('سلاڤ! [laugh] ئەز مۆدێلا دەنگی یا جێمینایم ب دەنگێ پاک (Puck) و ب زارەڤێ کوردیێ بادینی [happy] د ئاخڤم.');
      }
      if (customInstruction.includes('Kurdish (Sorani)')) {
        setCustomInstruction(customInstruction.replace(/Kurdish\s*\(\s*Sorani\s*\)/gi, 'Kurdish (Badini)'));
      }
      addToast({ type: 'info', title: 'Dialect Changed', message: 'Switched to Kurdish Badini (Northern Kurmanji / Duhok).' });
    } else {
      if (activeTab === 'single') {
        singleSynthesis.setText('سڵاو! [laugh] من مۆدێلی دەنگی جێمینایم بە دەنگی پاک (Puck) و بە زمانی کوردی سۆرانی [happy] قسە دەکەم.');
      }
      if (customInstruction.includes('Kurdish (Badini)')) {
        setCustomInstruction(customInstruction.replace(/Kurdish\s*\(\s*Badini\s*\)/gi, 'Kurdish (Sorani)'));
      }
      addToast({ type: 'info', title: 'Dialect Changed', message: 'Switched to Kurdish Sorani (Central Kurdish / Sulaymaniyah / Erbil).' });
    }
  };

  // 3. Batch Runner Execution Engine Hook
  const batchRunner = useGeminiBatchRunner({
    dialect,
    selectedVoice,
    selectedModel,
    customInstruction,
    voices: keyPool.voices,
    onSampleCreated,
    addToast,
    loadConfigAndPool: keyPool.loadConfigAndPool,
    uploadedFileName: initialSaved?.uploadedFileName || '',
    rawBatchInput: initialSaved?.rawBatchInput || '',
    fileQueue: initialSaved?.fileQueue || [],
    setFileQueue: (updater: any) => setFileQueueRef.current(updater),
    activeFileId: initialSaved?.activeFileId || null,
    autoAdvanceNextFile: initialSaved?.autoAdvanceNextFile ?? true,
    fileQueueRef,
    activeFileIdRef,
    autoAdvanceNextFileRef,
    advanceToNextQueuedFile: (finishedFileId?: string | null, forceStart?: boolean) => advanceToNextQueuedFileRef.current(finishedFileId, forceStart),
    initialItems: initialSaved?.batchItems,
    initialBatchState: initialSaved?.batchState,
    initialDelayMs: initialSaved?.batchDelayMs,
    initialFilter: initialSaved?.batchFilter,
    initialVoiceMode: initialSaved?.batchVoiceMode,
    activeTab
  });

  // 4. File Queue & Parser Hook
  const fileQueue = useGeminiFileQueue({
    voices: keyPool.voices,
    selectedVoice,
    batchVoiceMode: batchRunner.batchVoiceMode,
    isBatchRunningRef: batchRunner.isBatchRunningRef,
    isPausedRef: batchRunner.isPausedRef,
    isStoppedRef: batchRunner.isStoppedRef,
    startBatchExecutionRef: batchRunner.startBatchExecutionRef,
    setBatchItems: batchRunner.setBatchItems,
    batchItemsRef: batchRunner.batchItemsRef,
    setBatchState: batchRunner.setBatchState,
    setCurrentProcessingId: batchRunner.setCurrentProcessingId,
    onClearBatch: batchRunner.handleClearBatch,
    onStopBatch: batchRunner.handleStopBatch,
    addToast,
    initialQueue: initialSaved?.fileQueue,
    initialActiveFileId: initialSaved?.activeFileId,
    initialUploadedFileName: initialSaved?.uploadedFileName,
    initialRawBatchInput: initialSaved?.rawBatchInput,
    initialAutoAdvance: initialSaved?.autoAdvanceNextFile
  });

  // Keep shared refs in sync
  setFileQueueRef.current = fileQueue.setFileQueue;
  advanceToNextQueuedFileRef.current = fileQueue.advanceToNextQueuedFile;
  fileQueueRef.current = fileQueue.fileQueue;
  activeFileIdRef.current = fileQueue.activeFileId;
  autoAdvanceNextFileRef.current = fileQueue.autoAdvanceNextFile;
  isBatchRunningRef.current = batchRunner.isBatchRunningRef.current;
  isPausedRef.current = batchRunner.isPausedRef.current;
  isStoppedRef.current = batchRunner.isStoppedRef.current;
  startBatchExecutionRef.current = batchRunner.startBatchExecutionRef.current;
  batchItemsRef.current = batchRunner.batchItems;

  return (
    <div className="gemini-studio-page">
      <GeminiPageHeader
        dialect={dialect}
        selectedModel={selectedModel}
        poolCount={keyPool.poolCount}
        readyKeyCount={keyPool.readyKeyCount}
        activeKeyCount={keyPool.activeKeyCount}
        disabledKeyCount={keyPool.disabledKeyCount}
        dailyExhaustedCount={keyPool.dailyExhaustedKeys.length}
        minuteCooldownCount={keyPool.minuteCooldownKeys.length}
        minCooldownSeconds={keyPool.minCooldownSeconds}
        showKeyManager={keyPool.showKeyManager}
        setShowKeyManager={keyPool.setShowKeyManager}
        isReloadingKeys={keyPool.isReloadingKeys}
        onReloadKeys={keyPool.handleReloadKeys}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        batchItemsCount={batchRunner.batchItems.length}
      />

      {(keyPool.showKeyManager || keyPool.poolCount === 0) && (
        <GeminiKeyManager
          keyPool={keyPool.keyPool}
          poolCount={keyPool.poolCount}
          isReloadingKeys={keyPool.isReloadingKeys}
          probingKeyIndex={keyPool.probingKeyIndex}
          customKeyInput={keyPool.customKeyInput}
          isSavingKey={keyPool.isSavingKey}
          onKeyInputChange={keyPool.setCustomKeyInput}
          onAddKey={keyPool.handleAddKey}
          onBulkAddKeys={keyPool.handleBulkAddKeys}
          onDeleteKey={keyPool.handleDeleteKey}
          onToggleKey={keyPool.handleToggleKey}
          onToggleAllKeys={keyPool.handleToggleAllKeys}
          onToggleBulkKeys={keyPool.handleToggleBulkKeys}
          onProbeKey={keyPool.handleProbeSingleKey}
          onReloadKeys={keyPool.handleReloadKeys}
          onResetCooldowns={keyPool.handleResetCooldowns}
          onClose={() => keyPool.setShowKeyManager(false)}
        />
      )}

      {activeTab === 'single' && (
        <GeminiSingleStudio
          dialect={dialect}
          onDialectChange={handleDialectChange}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          customInstruction={customInstruction}
          setCustomInstruction={setCustomInstruction}
          voices={keyPool.voices}
          models={keyPool.models}
          singleSynthesis={singleSynthesis}
        />
      )}

      {activeTab === 'bulk' && (
        <GeminiBatchStudio
          bulkSubMode={bulkSubMode}
          setBulkSubMode={setBulkSubMode}
          dialect={dialect}
          onDialectChange={handleDialectChange}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          customInstruction={customInstruction}
          voices={keyPool.voices}
          models={keyPool.models}
          fileQueue={fileQueue}
          batchRunner={batchRunner}
          onSampleCreated={onSampleCreated}
          addToast={addToast}
        />
      )}

      {activeTab === 'paired' && (
        <PairedEmotionBatchPage
          onSampleCreated={onSampleCreated}
          addToast={addToast}
        />
      )}
    </div>
  );
};
