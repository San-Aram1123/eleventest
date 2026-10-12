import { useState, useRef, useEffect } from 'react';

export const useSplitterAudioPlayer = () => {
  const [activePlayingId, setActivePlayingId] = useState<number | null>(null);
  const activePlayingAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = (chunkId: number, base64: string) => {
    if (activePlayingId === chunkId) {
      activePlayingAudioRef.current?.pause();
      setActivePlayingId(null);
    } else {
      activePlayingAudioRef.current?.pause();
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.onended = () => setActivePlayingId(null);
      activePlayingAudioRef.current = audio;
      audio.play().catch(e => console.warn('[Audio Player] Play error:', e));
      setActivePlayingId(chunkId);
    }
  };

  const stopPlayback = () => {
    if (activePlayingAudioRef.current) {
      activePlayingAudioRef.current.pause();
      activePlayingAudioRef.current = null;
    }
    setActivePlayingId(null);
  };

  useEffect(() => {
    return () => {
      if (activePlayingAudioRef.current) {
        activePlayingAudioRef.current.pause();
      }
    };
  }, []);

  return {
    activePlayingId,
    handlePlayAudio,
    stopPlayback
  };
};
