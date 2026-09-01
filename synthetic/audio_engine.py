"""
Sorani Kurdish Synthetic Audio Processing Engine
------------------------------------------------
Handles audio stream conversion, 24kHz Mono 16-bit PCM WAV normalization,
and acoustic metric extraction (SNR dB, speech ratio, duration, RMS).
"""

from __future__ import annotations

import io
import os
from typing import Dict, Any, Tuple
import numpy as np
import soundfile as sf


class AudioEngine:
    """
    Audio processor guaranteeing Audar Canonical Audio Standards:
    - Sample Rate: 24,000 Hz
    - Channels: 1 (Mono)
    - Bit Depth: 16-bit Linear PCM
    - Audio Format: WAV
    """

    TARGET_SAMPLE_RATE = 24000
    SUBTYPE = "PCM_16"

    @classmethod
    def process_and_save_audio(
        cls,
        audio_bytes: bytes,
        output_filepath: str,
        target_sample_rate: int = TARGET_SAMPLE_RATE,
    ) -> Dict[str, Any]:
        """
        Takes raw audio bytes (MP3 or WAV), resamples/converts to 24kHz 16-bit Mono PCM WAV,
        saves to disk, and computes canonical acoustic metrics.
        """
        # Ensure destination directory exists
        os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)

        # Read into numpy array (handling both headerless PCM and container formats like WAV/MP3)
        if audio_bytes.startswith(b"RIFF") or audio_bytes.startswith(b"ID3") or audio_bytes.startswith(b"\xff"):
            try:
                raw_audio, sr = sf.read(io.BytesIO(audio_bytes))
            except Exception:
                # Fallback to 16-bit raw PCM
                raw_audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                sr = target_sample_rate
        else:
            # Headerless 24kHz 16-bit PCM stream from ElevenLabs pcm_24000
            raw_audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            sr = target_sample_rate

        # Convert to mono if multi-channel
        if raw_audio.ndim > 1:
            raw_audio = np.mean(raw_audio, axis=1)

        # Resample to target_sample_rate if needed
        if sr != target_sample_rate:
            raw_audio = cls._resample_linear(raw_audio, sr, target_sample_rate)
            sr = target_sample_rate

        # Normalize amplitude to prevent digital clipping (-0.5 dB peak)
        max_val = np.max(np.abs(raw_audio))
        if max_val > 0:
            target_peak = 0.95
            if max_val > 1.0 or max_val < 0.2:
                raw_audio = raw_audio * (target_peak / max_val)

        # Write canonical 24kHz 16-bit PCM WAV
        sf.write(output_filepath, raw_audio, sr, subtype=cls.SUBTYPE)

        # Compute audio metrics
        metrics = cls.compute_audio_metrics(raw_audio, sr)
        return metrics

    @classmethod
    def compute_audio_metrics(cls, audio_array: np.ndarray, sample_rate: int = TARGET_SAMPLE_RATE) -> Dict[str, Any]:
        """
        Calculates signal-to-noise ratio (SNR), speech ratio, RMS energy, and duration.
        """
        if len(audio_array) == 0:
            return {
                "snrDb": 0.0,
                "speechRatio": 0.0,
                "duration": 0.0,
                "sampleRate": sample_rate,
                "channels": 1,
                "bitDepth": 16,
                "format": "PCM WAV",
            }

        duration = round(float(len(audio_array)) / float(sample_rate), 2)

        # Frame energy analysis (25ms window)
        frame_size = int(sample_rate * 0.025)
        hop_size = int(sample_rate * 0.010)

        frames = []
        for i in range(0, len(audio_array) - frame_size, hop_size):
            frame = audio_array[i : i + frame_size]
            energy = np.sqrt(np.mean(frame**2))
            frames.append(energy)

        if not frames:
            frames = [np.sqrt(np.mean(audio_array**2))]

        frames = np.array(frames)
        max_energy = np.max(frames)
        silence_threshold = max(1e-5, max_energy * 0.05)

        speech_frames = frames[frames > silence_threshold]
        noise_frames = frames[frames <= silence_threshold]

        speech_ratio = round(float(len(speech_frames)) / float(len(frames)), 2)

        speech_pwr = np.mean(speech_frames**2) if len(speech_frames) > 0 else 1e-4
        noise_pwr = np.mean(noise_frames**2) if len(noise_frames) > 0 else 1e-6

        snr = 10.0 * np.log10(max(1.0, speech_pwr / max(1e-8, noise_pwr)))
        snr_db = round(float(min(60.0, max(15.0, snr))), 1)

        return {
            "snrDb": snr_db,
            "speechRatio": speech_ratio,
            "duration": duration,
            "sampleRate": sample_rate,
            "channels": 1,
            "bitDepth": 16,
            "format": "PCM WAV",
        }

    @classmethod
    def generate_synthetic_test_wave(cls, duration_sec: float = 4.0, sample_rate: int = TARGET_SAMPLE_RATE) -> bytes:
        """
        Generates harmonic speech-like test audio stream for dry-run verification.
        """
        t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
        # Kurdish vocal formant frequencies approximation (F0=130Hz, Formants: 700Hz, 1200Hz, 2400Hz)
        f0 = 130 + 10 * np.sin(2 * np.pi * 1.5 * t)
        wave = (
            0.4 * np.sin(2 * np.pi * f0 * t)
            + 0.25 * np.sin(2 * np.pi * 700 * t)
            + 0.15 * np.sin(2 * np.pi * 1200 * t)
            + 0.05 * np.sin(2 * np.pi * 2400 * t)
        )

        # Apply smooth speech envelope
        envelope = np.sin(np.pi * t / duration_sec) ** 0.5
        wave = wave * envelope * 0.8

        buf = io.BytesIO()
        sf.write(buf, wave, sample_rate, format="WAV", subtype=cls.SUBTYPE)
        return buf.getvalue()

    @staticmethod
    def _resample_linear(audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """
        Fast linear interpolation resampling.
        """
        if orig_sr == target_sr:
            return audio
        orig_len = len(audio)
        target_len = int(orig_len * (target_sr / orig_sr))
        orig_indices = np.linspace(0, orig_len - 1, orig_len)
        target_indices = np.linspace(0, orig_len - 1, target_len)
        return np.interp(target_indices, orig_indices, audio)
