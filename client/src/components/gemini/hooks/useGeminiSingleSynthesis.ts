import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sample, SampleRatings, KurdishDialect } from '../../../types';
import { generateGeminiSpeech, updateSample } from '../../../services/api';

interface UseGeminiSingleSynthesisOptions {
  dialect: KurdishDialect;
  selectedVoice: string;
  selectedModel: string;
  customInstruction: string;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useGeminiSingleSynthesis({
  dialect,
  selectedVoice,
  selectedModel,
  customInstruction,
  onSampleCreated,
  addToast
}: UseGeminiSingleSynthesisOptions) {
  const [text, setText] = useState('سڵاو! [laugh] من مۆدێلی دەنگی جێمینایم بە دەنگی پاک (Puck) و بە زمانی کوردی سۆرانی [happy] قسە دەکەم.');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSample, setGeneratedSample] = useState<Sample | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [usedKeyMasked, setUsedKeyMasked] = useState<string>('');
  const [activeRatings, setActiveRatings] = useState<SampleRatings>({
    naturalness: 0,
    emotion: 0,
    pronunciation: 0,
    overall: 0,
    notes: ''
  });

  const insertAtCursor = (textToInsert: string, isTag = false) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText(prev => `${prev} ${textToInsert}`);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    const before = text.substring(0, start);
    const after = text.substring(end);

    let formatted = textToInsert;
    if (isTag) {
      const needsLeadingSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
      const needsTrailingSpace = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');
      formatted = `${needsLeadingSpace ? ' ' : ''}${textToInsert}${needsTrailingSpace ? ' ' : ' '}`;
    }

    const updated = before + formatted + after;
    setText(updated);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formatted.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleInsertTag = (tag: string) => {
    insertAtCursor(tag, true);
    addToast({
      type: 'info',
      title: `Tag ${tag} Inserted`,
      message: `Inserted ${tag} at cursor position.`
    });
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      addToast({ type: 'error', title: 'Text Required', message: 'Please enter Kurdish text to synthesize.' });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateGeminiSpeech({
        text: text.trim(),
        voiceName: selectedVoice,
        dialect: dialect,
        model: selectedModel,
        promptInstruction: customInstruction.trim() || undefined,
        saveToDataset: true
      });

      if (res.sample) {
        setGeneratedSample(res.sample);
        setGeneratedAudioUrl(res.sample.audioUrl || `/api/dataset/${res.sample.id}/audio`);
        setDuration(res.durationSeconds || 0);
        setDetectedTags(res.detectedTags || []);
        setUsedKeyMasked(res.usedKeyMasked || '');
        onSampleCreated(res.sample);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });

        addToast({
          type: 'success',
          title: `${dialect === 'badini' ? 'Badini' : 'Sorani'} Audio Generated!`,
          message: `Sample #${res.sample.id} created with '${selectedVoice}' on ${res.model} (${res.durationSeconds}s)`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gemini Generation Failed',
        message: err.message || 'Error generating speech with Gemini'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRatingsChange = async (newRatings: SampleRatings) => {
    setActiveRatings(newRatings);
    if (generatedSample) {
      try {
        const updated = await updateSample(generatedSample.id, { ratings: newRatings });
        setGeneratedSample(updated);
        addToast({ type: 'success', title: 'Rating Saved', message: 'Evaluation recorded in dataset & MySQL.' });
      } catch (err: any) {
        addToast({ type: 'error', title: 'Failed to update rating', message: err.message });
      }
    }
  };

  return {
    text,
    setText,
    textareaRef,
    isGenerating,
    generatedSample,
    generatedAudioUrl,
    duration,
    detectedTags,
    usedKeyMasked,
    activeRatings,
    insertAtCursor,
    handleInsertTag,
    handleGenerate,
    handleRatingsChange
  };
}
