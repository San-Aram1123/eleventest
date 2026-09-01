"""
ElevenLabs API Client for Kurdish Speech Synthesis
--------------------------------------------------
Supports multi-key pooling, emotion-tuned voice settings, rate limit recovery,
and direct generation of 24kHz audio streams with eleven_multilingual_v2.
"""

from __future__ import annotations

import os
import time
import requests
from typing import Dict, Any, List, Optional
from pathlib import Path

from .emotions import EmotionManager, VoiceSettingsConfig


def _read_env_file(filepath: Path) -> Dict[str, str]:
    """Lightweight .env file parser without third-party dependencies."""
    env_vars = {}
    if not filepath.exists():
        return env_vars
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k:
                    env_vars[k] = v
                    if k not in os.environ:
                        os.environ[k] = v
    except Exception:
        pass
    return env_vars


class ElevenLabsClient:
    """
    Robust API client for ElevenLabs TTS with Kurdish language support.
    """

    BASE_URL = "https://api.elevenlabs.io/v1"
    DEFAULT_MODEL = "eleven_multilingual_v2"
    DEFAULT_OUTPUT_FORMAT = "pcm_24000"  # 24kHz raw PCM for ultra-high fidelity

    def __init__(self, api_key: Optional[str] = None, keys_pool: Optional[List[str]] = None):
        self._load_env_keys()
        self.keys_pool: List[str] = []

        if api_key:
            self.keys_pool.append(api_key.strip())
        if keys_pool:
            for k in keys_pool:
                if k and k.strip() and k.strip() not in self.keys_pool:
                    self.keys_pool.append(k.strip())

        # Fallback to discovered environment keys
        for env_k in self._discovered_keys:
            if env_k not in self.keys_pool:
                self.keys_pool.append(env_k)

        self.current_key_index = 0

    def _load_env_keys(self):
        self._discovered_keys = []
        # Try loading .env from current dir, parent dirs, or Desktop/eleventest
        search_paths = [
            Path(".env"),
            Path(__file__).resolve().parent / ".env",
            Path(__file__).resolve().parents[2] / ".env",
            Path("C:/Users/PC/Desktop/eleventest/.env"),
            Path("C:/Users/PC/Desktop/audar-kurdish-speech/.env"),
        ]
        for p in search_paths:
            if p.exists():
                _read_env_file(p)

        # 1. Comma separated keys
        env_keys_str = os.getenv("ELEVENLABS_API_KEYS", "")
        if env_keys_str:
            for k in env_keys_str.split(","):
                if k.strip():
                    self._discovered_keys.append(k.strip())

        # 2. Single key
        single_key = os.getenv("ELEVENLABS_API_KEY", "")
        if single_key and single_key.strip() not in self._discovered_keys:
            self._discovered_keys.append(single_key.strip())

    @property
    def primary_key(self) -> str:
        if not self.keys_pool:
            return ""
        return self.keys_pool[self.current_key_index % len(self.keys_pool)]

    def rotate_key(self):
        if len(self.keys_pool) > 1:
            self.current_key_index = (self.current_key_index + 1) % len(self.keys_pool)

    def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: str = "neutral",
        emotion_intensity: float = 1.0,
        model_id: str = DEFAULT_MODEL,
        output_format: str = DEFAULT_OUTPUT_FORMAT,
        max_retries: int = 3,
    ) -> bytes:
        """
        Synthesizes text using ElevenLabs API and returns raw audio bytes.
        """
        if not self.primary_key:
            raise ValueError("No ElevenLabs API Key provided. Please set ELEVENLABS_API_KEY.")

        voice_settings = EmotionManager.get_voice_settings(emotion, emotion_intensity)

        url = f"{self.BASE_URL}/text-to-speech/{voice_id}?output_format={output_format}"
        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": voice_settings.to_dict(),
        }

        last_error = None
        for attempt in range(max_retries):
            current_key = self.primary_key
            headers = {
                "xi-api-key": current_key,
                "Content-Type": "application/json",
                "Accept": "audio/*",
            }

            try:
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                if response.status_code == 200:
                    return response.content
                elif response.status_code in {401, 403, 429}:
                    # Rate limit or quota exhausted -> rotate key if available
                    last_error = f"API Error {response.status_code}: {response.text}"
                    self.rotate_key()
                    time.sleep(1.0)
                else:
                    last_error = f"API Error {response.status_code}: {response.text}"
                    time.sleep(1.5)
            except Exception as e:
                last_error = str(e)
                time.sleep(1.0)

        raise RuntimeError(f"ElevenLabs TTS failed after {max_retries} attempts. Last error: {last_error}")

    def list_voices(self) -> List[Dict[str, Any]]:
        """
        Fetches list of available voices from ElevenLabs.
        """
        if not self.primary_key:
            return []

        url = f"{self.BASE_URL}/voices"
        headers = {"xi-api-key": self.primary_key}
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.json().get("voices", [])
        return []

    def get_subscription_info(self) -> Dict[str, Any]:
        """
        Returns account character quota & status.
        """
        if not self.primary_key:
            return {"status": "no_key", "remaining_characters": 0}

        url = f"{self.BASE_URL}/user"
        headers = {"xi-api-key": self.primary_key}
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            user_data = resp.json()
            sub = user_data.get("subscription", {})
            char_count = sub.get("character_count", 0)
            char_limit = sub.get("character_limit", 10000)
            return {
                "tier": sub.get("tier", "free"),
                "characterCount": char_count,
                "characterLimit": char_limit,
                "remainingCharacters": max(0, char_limit - char_count),
                "status": sub.get("status", "active"),
            }
        return {"status": "error", "message": resp.text}
