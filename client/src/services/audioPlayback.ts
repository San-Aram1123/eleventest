export async function playExclusiveAudio(audio: HTMLAudioElement): Promise<void> {
  document.querySelectorAll('audio').forEach(other => {
    if (other !== audio) other.pause();
  });
  await audio.play();
}
