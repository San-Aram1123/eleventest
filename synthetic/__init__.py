"""
Audar Sorani Kurdish Synthetic Speech Generator
-----------------------------------------------
Generates high-quality, phonetically diverse, and expressive Sorani Kurdish (ckb)
speech datasets using ElevenLabs API, formatted strictly according to the Audar Canonical Speech Schema.
"""

from .asosoft_normalizer import SoraniKurdishAsosoftNormalizer
from .phonetics import KurdishPhoneticAnalyzer
from .emotions import EmotionManager, VoiceSettingsConfig
from .audio_engine import AudioEngine
from .corpus_library import KURDISH_CANONICAL_CORPUS, get_corpus_by_domain
from .elevenlabs_client import ElevenLabsClient
from .dataset_builder import DatasetBuilder, CanonicalSampleRecord

__all__ = [
    "SoraniKurdishAsosoftNormalizer",
    "KurdishPhoneticAnalyzer",
    "EmotionManager",
    "VoiceSettingsConfig",
    "AudioEngine",
    "KURDISH_CANONICAL_CORPUS",
    "get_corpus_by_domain",
    "ElevenLabsClient",
    "DatasetBuilder",
    "CanonicalSampleRecord",
]
