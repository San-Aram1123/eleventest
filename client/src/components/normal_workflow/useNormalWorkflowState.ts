import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sample, PendingSample, EmotionType, SampleRatings } from '../../types';
import { prepareNormalSample, fetchNormalPending, deleteNormalPending, uploadNormalWav, updateSample } from '../../services/api';
import { EMOTIONS } from '../../constants/emotions';

interface UseNormalWorkflowStateProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useNormalWorkflowState({ onSampleCreated, addToast }: UseNormalWorkflowStateProps) {
  const [kurdishText, setKurdishText] = useState('سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.');
  const [selectedEmotion] = useState<EmotionType>('happy');
  const [voiceName, setVoiceName] = useState('');
  const [notes, setNotes] = useState('');

  const [pendingList, setPendingList] = useState<PendingSample[]>([]);
  const [activePendingId, setActivePendingId] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [lastPairedSample, setLastPairedSample] = useState<Sample | null>(null);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const loadPendingQueue = async () => {
    try {
      const list = await fetchNormalPending();
      setPendingList(list);
      if (list.length > 0 && !activePendingId) setActivePendingId(list[0].pendingId);
    } catch (err) {
      console.warn('Error loading pending queue:', err);
    }
  };

  const handlePrepareAndCopy = async () => {
    if (!kurdishText.trim()) {
      addToast({ type: 'error', title: 'Empty Input', message: 'Please enter Kurdish text before preparing.' });
      return;
    }

    setIsPreparing(true);
    try {
      await navigator.clipboard.writeText(kurdishText.trim());
      const activeEmotionObj = EMOTIONS.find(e => e.value === selectedEmotion);
      const res = await prepareNormalSample({
        text: kurdishText.trim(),
        emotion: selectedEmotion,
        emotionTag: activeEmotionObj?.tag || '',
        voiceName: voiceName.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setPendingList(res.allPending);
      setActivePendingId(res.pendingItem.pendingId);
      addToast({
        type: 'success',
        title: 'Text Copied & Sample Prepared!',
        message: 'Kurdish text is in your clipboard. Now generate in ElevenLabs and drop the WAV here!'
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Preparation Failed', message: err.message });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleFileDrop = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.wav') && !file.name.toLowerCase().endsWith('.mp3')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please upload a WAV audio file downloaded from ElevenLabs.' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      if (activePendingId) {
        formData.append('pendingId', activePendingId);
      } else {
        formData.append('text', kurdishText.trim());
        formData.append('emotion', selectedEmotion);
      }
      if (voiceName) formData.append('voiceName', voiceName);
      if (notes) formData.append('notes', notes);

      const res = await uploadNormalWav(formData);
      const newSample = res.sample;
      setLastPairedSample(newSample);
      onSampleCreated(newSample);

      const remaining = res.remainingPending || [];
      setPendingList(remaining);
      setActivePendingId(remaining.length > 0 ? remaining[0].pendingId : null);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      addToast({
        type: 'success',
        title: 'Audio Paired Automatically!',
        message: `Saved as ${newSample.id}.wav & ${newSample.id}.json with zero transcript retyping!`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Could not pair audio.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePending = async (pendingId: string) => {
    try {
      await deleteNormalPending(pendingId);
      setPendingList(prev => prev.filter(p => p.pendingId !== pendingId));
      if (activePendingId === pendingId) setActivePendingId(null);
      addToast({ type: 'info', title: 'Item Removed', message: 'Pending sample removed from queue.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  const handleSaveRatings = async (ratings: SampleRatings) => {
    if (!lastPairedSample) return;
    try {
      const updated = await updateSample(lastPairedSample.id, { ratings });
      setLastPairedSample(updated);
      onSampleCreated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: 'Evaluation saved to metadata JSON.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  return {
    kurdishText, setKurdishText,
    voiceName, setVoiceName,
    notes, setNotes,
    pendingList, activePendingId, setActivePendingId,
    isPreparing, isUploading,
    lastPairedSample, setLastPairedSample,
    inspectingSample, setInspectingSample,
    handlePrepareAndCopy, handleFileDrop,
    handleDeletePending, handleSaveRatings
  };
}
