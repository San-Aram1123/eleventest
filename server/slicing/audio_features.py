"""Small NumPy-only acoustic frontend. Energy gates speech; it never picks turns."""
import math
import wave

import numpy as np


def load_audio(filename):
    with wave.open(str(filename), 'rb') as stream:
        channels, width, rate, frames = (stream.getnchannels(), stream.getsampwidth(),
                                         stream.getframerate(), stream.getnframes())
        if not 8000 <= rate <= 192000 or channels < 1 or channels > 8:
            raise ValueError('Unsupported WAV sample rate or channel count.')
        if frames / rate > 600:
            raise ValueError('Local experiment audio must be at most 600 seconds.')
        raw = stream.readframes(frames)
    if width == 1:
        audio = (np.frombuffer(raw, np.uint8).astype(np.float32) - 128) / 128
    elif width in (2, 4):
        audio = np.frombuffer(raw, '<i2' if width == 2 else '<i4').astype(np.float32)
        audio /= float(2 ** (width * 8 - 1))
    elif width == 3:
        values = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.int32)
        values = values[:, 0] | values[:, 1] << 8 | values[:, 2] << 16
        audio = ((values ^ 0x800000) - 0x800000).astype(np.float32) / 8388608
    else:
        raise ValueError('Only uncompressed 8/16/24/32-bit PCM WAV is supported.')
    if len(audio) != frames * channels:
        raise ValueError('WAV data is truncated.')
    audio = audio.reshape(-1, channels).mean(axis=1)
    if len(audio) < rate * 0.5 or not np.isfinite(audio).all():
        raise ValueError('Audio is too short or contains invalid samples.')
    if np.max(np.abs(audio)) < 0.0001:
        raise ValueError('Master audio is silent; no reliable speaker turns exist.')
    return audio, rate, len(audio) / rate


def resample(audio, rate, target=16000):
    """Windowed low-pass before interpolation; feature audio only, never master edits."""
    if rate == target:
        return audio.astype(np.float32)
    if rate > target:
        half = 48
        offsets = np.arange(-half, half + 1)
        cutoff = 0.46 * target / rate
        kernel = 2 * cutoff * np.sinc(2 * cutoff * offsets) * np.hanning(len(offsets))
        audio = np.convolve(np.pad(audio, (half, half), mode='reflect'),
                            kernel / kernel.sum(), mode='valid')
    times = np.arange(int(round(len(audio) * target / rate))) * rate / target
    return np.interp(times, np.arange(len(audio)), audio).astype(np.float32)


def timbre_frames(audio, rate):
    data = resample(audio, rate)
    win, hop, nfft = 400, 160, 512
    padded = np.pad(data, (win // 2, win // 2), mode='reflect')
    frames = np.lib.stride_tricks.sliding_window_view(padded, win)[::hop]
    rms = np.sqrt(np.mean(frames * frames, axis=1))
    emphasized = frames - 0.97 * np.concatenate([frames[:, :1], frames[:, :-1]], axis=1)
    power = np.abs(np.fft.rfft(emphasized * np.hanning(win), n=nfft)) ** 2
    frequencies = np.fft.rfftfreq(nfft, 1 / 16000)
    mel = lambda hz: 2595 * np.log10(1 + hz / 700)
    edges = 700 * (10 ** (np.linspace(mel(150), mel(5500), 50) / 2595) - 1)
    bank = np.maximum(0, np.minimum(
        (frequencies[None, :] - edges[:-2, None]) / np.diff(edges)[:-1, None],
        (edges[2:, None] - frequencies[None, :]) / np.diff(edges)[1:, None]))
    logmel = np.log(np.maximum(power @ bank.T, 1e-8))
    # Low-order cepstra smooth away harmonics. No F0 or male/female threshold is used.
    dct = np.cos(np.pi / 48 * (np.arange(48) + 0.5)[None, :] *
                 np.arange(1, 13)[:, None]) / math.sqrt(24)
    features = logmel @ dct.T
    threshold = max(0.0002, float(np.percentile(rms, 80)) * 0.08)
    voiced = rms > threshold
    if voiced.sum() < 40:
        raise ValueError('Insufficient audible speech for acoustic comparison.')
    return features, voiced.astype(float), rms, 0.01


def sustained_vectors(features, weights, frame_hop, duration, window=0.9, step=0.1):
    """Speech-weighted centered integration, with a common full-master timeline."""
    edges = np.linspace(0, duration, int(np.ceil(duration / step)) + 1)
    centers = (edges[:-1] + edges[1:]) / 2
    cumulative = np.vstack([np.zeros((1, features.shape[1])),
                            np.cumsum(features * weights[:, None], axis=0)])
    counts = np.r_[0, np.cumsum(weights)]
    left = np.clip(((centers - window / 2) / frame_hop).astype(int), 0, len(features))
    right = np.clip(((centers + window / 2) / frame_hop).astype(int), 0, len(features))
    support = counts[right] - counts[left]
    vectors = (cumulative[right] - cumulative[left]) / np.maximum(support[:, None], 1)
    reliability = np.minimum(1, support / max(1, window / frame_hop * 0.45))
    return vectors, reliability, edges


def refine_boundary(audio, rate, coarse, left_limit, right_limit, radius=0.18):
    """Snap ONLY within the acoustic handoff neighborhood, never a global pause."""
    left = max(int(left_limit * rate), int((coarse - radius) * rate), 0)
    right = min(int(right_limit * rate), int((coarse + radius) * rate), len(audio) - 1)
    half = max(1, int(rate * 0.008))
    candidates = np.arange(left + half, right - half, max(1, int(rate * 0.003)))
    if not len(candidates):
        return float(coarse), {'refinement': 'coarse', 'shiftMs': 0}
    squared = np.r_[0, np.cumsum(audio.astype(float) ** 2)]
    energy = (squared[candidates + half] - squared[candidates - half]) / (2 * half)
    # Prefer the closest quiet point; avoids drifting to unrelated phoneme gaps.
    proximity = ((candidates / rate - coarse) / radius) ** 2
    objective = energy / max(float(np.percentile(energy, 80)), 1e-10) + proximity * 0.08
    best = int(candidates[np.argmin(objective)])
    zleft, zright = max(left, best - int(rate * 0.004)), min(right, best + int(rate * 0.004))
    zeros = np.flatnonzero(audio[zleft:zright] * audio[zleft + 1:zright + 1] <= 0) + zleft
    if len(zeros):
        best = int(zeros[np.argmin(np.abs(zeros - best))])
    cut = best / rate
    measured = (squared[min(len(audio), best + half)] - squared[max(0, best - half)]) / (2 * half)
    energy_ratio = measured / max(float(np.percentile(energy, 80)), 1e-10)
    # A single zero crossing or consonant notch is not a safe speaker handoff.
    # Measure a contiguous quiet run around the cut, at 5 ms resolution.
    quiet_hop = max(1, int(rate * 0.005))
    quiet_centers = np.arange(max(half, best - int(rate * 0.3)),
                              min(len(audio) - half, best + int(rate * 0.3)), quiet_hop)
    quiet_energy = (squared[quiet_centers + half] - squared[quiet_centers - half]) / (2 * half)
    quiet_threshold = max(0.0002 ** 2, float(np.percentile(energy, 80)) * 0.01)
    quiet = quiet_energy <= quiet_threshold
    run_seconds = 0.0
    if len(quiet):
        nearest = int(np.argmin(np.abs(quiet_centers - best)))
        if quiet[nearest]:
            qleft = qright = nearest
            while qleft > 0 and quiet[qleft - 1]:
                qleft -= 1
            while qright + 1 < len(quiet) and quiet[qright + 1]:
                qright += 1
            run_seconds = (qright - qleft + 1) * quiet_hop / rate
    return cut, {'refinement': 'local_energy_zero_crossing',
                 'coarse': round(coarse, 6), 'shiftMs': round((cut - coarse) * 1000, 2),
                 'localEnergyRatio': round(float(energy_ratio), 4),
                 'quietRunSeconds': round(run_seconds, 4),
                 'searchRadiusMs': radius * 1000}
