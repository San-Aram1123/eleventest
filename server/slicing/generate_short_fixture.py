"""Derive a reproducible 35 ms handoff fixture from free local speech.

Test artifacts only; production audio and TTS prompts are never modified.
"""
import argparse
import json
import wave
from pathlib import Path

import numpy as np


def generate(directory):
    directory = Path(directory)
    options = json.loads((directory / 'options_trimmed.json').read_text(encoding='utf-8'))
    with wave.open(str(directory / 'alternating_trimmed.wav')) as source:
        rate = source.getframerate()
        if source.getnchannels() != 1 or source.getsampwidth() != 2:
            raise ValueError('Expected the mono 16-bit local fixture.')
        data = np.frombuffer(source.readframes(source.getnframes()), '<i2').copy()
    points = [0, *[int(t * rate) for t in options['expectedBoundaries']], len(data)]
    parts, cuts, length = [], [], 0
    for i, (start, end) in enumerate(zip(points, points[1:])):
        piece = data[start:end]
        hop = max(1, int(rate * .002))
        power = np.array([np.mean(piece[j:j + hop].astype(float) ** 2)
                          for j in range(0, len(piece), hop)])
        voiced = np.flatnonzero(power > np.percentile(power, 80) * .01)
        if not len(voiced):
            raise ValueError('Fixture contains a silent turn.')
        piece = piece[voiced[0] * hop:min(len(piece), (voiced[-1] + 1) * hop)]
        parts.append(piece)
        length += len(piece)
        if i < len(points) - 2:
            gap = np.zeros(int(rate * .035), dtype='<i2')
            cuts.append((length + len(gap) / 2) / rate)
            parts.append(gap)
            length += len(gap)
    with wave.open(str(directory / 'short_handoffs.wav'), 'wb') as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(rate)
        target.writeframes(np.concatenate(parts).astype('<i2').tobytes())
    (directory / 'options_short.json').write_text(json.dumps({'expectedBoundaries': cuts}), encoding='utf-8')
    return {'duration': length / rate, 'expectedBoundaries': cuts, 'insertedGapSeconds': .035}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory')
    print(json.dumps(generate(parser.parse_args().directory)))
