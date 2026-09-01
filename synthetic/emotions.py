"""
Sorani Kurdish Emotion & Expressive Conditioning Engine
------------------------------------------------------
Configures voice dynamics, paralinguistic markers, and ElevenLabs API voice settings
tailored to specific emotional states and intensity levels.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any, Optional, Set


@dataclass
class VoiceSettingsConfig:
    stability: float
    similarity_boost: float
    style: float
    use_speaker_boost: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stability": round(self.stability, 2),
            "similarity_boost": round(self.similarity_boost, 2),
            "style": round(self.style, 2),
            "use_speaker_boost": self.use_speaker_boost,
        }


class EmotionManager:
    """
    Manages emotional categories, intensity levels, inline paralinguistic tags,
    and maps them to optimized ElevenLabs voice settings.
    """

    SUPPORTED_EMOTIONS: Set[str] = {
        "neutral",
        "happy",
        "calm_tender",
        "excited",
        "laughing",
        "sad",
        "angry",
        "whisper",
    }

    PARALINGUISTIC_MARKERS = {
        "[laugh]": "Expressive chuckling or laughter",
        "[sigh]": "Audible exhalation / sigh",
        "[whisper]": "Soft whispered speech tone",
        "[gasp]": "Sudden intake of breath / surprise",
        "[cough]": "Brief throat clear or slight cough",
    }

    # Baseline Voice Settings per Emotion according to Audar canonical specification
    EMOTION_SETTINGS_MAP = {
        "neutral": VoiceSettingsConfig(
            stability=0.65, similarity_boost=0.85, style=0.20, use_speaker_boost=True
        ),
        "calm_tender": VoiceSettingsConfig(
            stability=0.65, similarity_boost=0.85, style=0.20, use_speaker_boost=True
        ),
        "happy": VoiceSettingsConfig(
            stability=0.40, similarity_boost=0.80, style=0.65, use_speaker_boost=True
        ),
        "excited": VoiceSettingsConfig(
            stability=0.38, similarity_boost=0.80, style=0.70, use_speaker_boost=True
        ),
        "laughing": VoiceSettingsConfig(
            stability=0.40, similarity_boost=0.80, style=0.65, use_speaker_boost=True
        ),
        "sad": VoiceSettingsConfig(
            stability=0.50, similarity_boost=0.75, style=0.40, use_speaker_boost=True
        ),
        "whisper": VoiceSettingsConfig(
            stability=0.50, similarity_boost=0.75, style=0.40, use_speaker_boost=True
        ),
        "angry": VoiceSettingsConfig(
            stability=0.45, similarity_boost=0.80, style=0.70, use_speaker_boost=True
        ),
    }

    @classmethod
    def validate_emotion(cls, emotion: str) -> str:
        """
        Validates and returns canonical emotion tag. Defaults to 'neutral' if unrecognized.
        """
        normalized = emotion.lower().strip()
        if normalized in cls.SUPPORTED_EMOTIONS:
            return normalized
        # Fallback aliases
        alias_map = {
            "joy": "happy",
            "happiness": "happy",
            "laughter": "laughing",
            "calm": "calm_tender",
            "tender": "calm_tender",
            "excitement": "excited",
            "sorrow": "sad",
            "grief": "sad",
            "rage": "angry",
            "whispering": "whisper",
        }
        return alias_map.get(normalized, "neutral")

    @classmethod
    def get_voice_settings(
        cls, emotion: str, intensity: float = 1.0
    ) -> VoiceSettingsConfig:
        """
        Computes dynamic ElevenLabs voice settings scaled by emotion intensity (0.1 to 1.0).
        """
        emo = cls.validate_emotion(emotion)
        base = cls.EMOTION_SETTINGS_MAP.get(emo, cls.EMOTION_SETTINGS_MAP["neutral"])

        # Clamp intensity to [0.1, 1.0]
        clamped_intensity = max(0.1, min(1.0, intensity))

        # Scale style parameter according to intensity
        scaled_style = base.style * clamped_intensity

        # For expressive emotions, lower stability slightly with higher intensity
        if emo in {"happy", "excited", "laughing", "angry"}:
            scaled_stability = max(0.30, base.stability - (clamped_intensity - 0.5) * 0.1)
        else:
            scaled_stability = base.stability

        return VoiceSettingsConfig(
            stability=round(scaled_stability, 2),
            similarity_boost=base.similarity_boost,
            style=round(scaled_style, 2),
            use_speaker_boost=base.use_speaker_boost,
        )
