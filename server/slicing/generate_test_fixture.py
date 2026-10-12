"""Optional Windows-only, free local speech fixture. Never calls Gemini or an API."""
import argparse
import json
import os
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np


TEXTS = [
    'Welcome to the speaker slicing laboratory. We are testing a long sentence with several different sounds and natural speaking rhythm.',
    'This is the second voice. I will speak slowly and clearly, with a few short sentences, to test speaker identity.',
    'The original speaker returns for the third turn. A pause within a sentence should never be mistaken for a new person.',
    'Now the second person answers. The system should listen to the texture of the voice and keep each sentence together.',
    'One final statement from the first speaker finishes our experiment. Each boundary should match a real change in voice.'
]


SAPI_SCRIPT = r"""
Add-Type -AssemblyName System.Speech
$taskSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$taskTexts = ConvertFrom-Json $env:ELEVENTEST_FIXTURE_TEXTS
for ($taskI = 0; $taskI -lt $taskTexts.Count; $taskI++) {
  $taskSynth.SelectVoice(@('Microsoft David Desktop','Microsoft Zira Desktop')[$taskI % 2])
  $taskSynth.SetOutputToWaveFile((Join-Path $env:ELEVENTEST_FIXTURE_DIR ('turn' + $taskI + '.wav')))
  $taskSynth.Speak($taskTexts[$taskI])
  $taskSynth.SetOutputToNull()
}
$taskSynth.Dispose()
"""


def generate(output_dir):
    if os.name != 'nt':
        raise RuntimeError('This optional fixture requires Windows System.Speech with David and Zira voices.')
    directory = Path(output_dir).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    environment = dict(os.environ, ELEVENTEST_FIXTURE_DIR=str(directory),
                       ELEVENTEST_FIXTURE_TEXTS=json.dumps(TEXTS))
    subprocess.run(['powershell', '-NoProfile', '-NonInteractive', '-Command', SAPI_SCRIPT],
                   env=environment, check=True, capture_output=True,
                   creationflags=subprocess.CREATE_NO_WINDOW, timeout=60)
    chunks, cuts, safe_intervals, elapsed, sample_rate = [], [], [], 0.0, None
    for index in range(5):
        with wave.open(str(directory / f'turn{index}.wav'), 'rb') as handle:
            rate = handle.getframerate()
            if handle.getnchannels() != 1 or handle.getsampwidth() != 2:
                raise ValueError('Unexpected SAPI audio format; expected mono 16-bit PCM.')
            if sample_rate is not None and rate != sample_rate:
                raise ValueError('SAPI voices returned incompatible sample rates.')
            sample_rate = rate
            samples = np.frombuffer(handle.readframes(handle.getnframes()), np.int16)
        audible = np.flatnonzero(np.abs(samples.astype(np.int32)) > 200)
        if not len(audible):
            raise ValueError('Local voice returned silent audio.')
        padding = int(0.025 * rate)
        samples = samples[max(0, audible[0] - padding):min(len(samples), audible[-1] + padding)]
        middle = len(samples) // 2
        # Test-only breaths deliberately exceed the inter-speaker gap. Production
        # synthesis prompts receive no markers, artificial silence, or this text.
        samples = np.r_[samples[:middle], np.zeros(int(0.6 * rate), np.int16), samples[middle:]]
        if index:
            cuts.append(elapsed + 0.075)
            safe_intervals.append([elapsed - 0.025, elapsed + 0.175])
            chunks.append(np.zeros(int(0.15 * rate), np.int16))
            elapsed += len(chunks[-1]) / rate
        chunks.append(samples)
        elapsed += len(samples) / rate
    master = directory / 'alternating_trimmed.wav'
    with wave.open(str(master), 'wb') as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sample_rate)
        handle.writeframes(np.concatenate(chunks).tobytes())
    options = directory / 'options_trimmed.json'
    options.write_text(json.dumps({'expectedBoundaries': cuts}), encoding='utf-8')
    metadata = {'source': 'free_local_Windows_System.Speech', 'language': 'English',
                'voices': ['Microsoft David Desktop', 'Microsoft Zira Desktop'], 'paragraphs': TEXTS,
                'count': 5, 'masterPath': str(master), 'optionsPath': str(options),
                'reference1Path': str(directory / 'turn0.wav'),
                'reference2Path': str(directory / 'turn1.wav'),
                'intraSentenceGapSeconds': 0.6, 'speakerGapSeconds': 0.15,
                'expectedBoundaries': cuts, 'safeHandoffIntervals': safe_intervals,
                'totalDuration': elapsed,
                'scope': 'Synthetic English regression fixture; no claim of Kurdish Gemini accuracy.'}
    (directory / 'fixture_metadata.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    return metadata


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', default=str(Path(tempfile.gettempdir()) / 'eleventest-local-slicing-fixtures'))
    print(json.dumps(generate(parser.parse_args().output_dir)))
