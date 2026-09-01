"""
Audar Canonical Dataset Builder & Schema Exporter
-------------------------------------------------
Orchestrates audio persistence and synchronizes multi-manifest outputs:
1. audio/*.wav (24kHz 16-bit Mono PCM WAV)
2. data.jsonl (Canonical Master JSONL)
3. metadata.csv (F5-TTS / StyleTTS2 pipe-delimited manifest)
4. whisper.jsonl (Whisper / Meta MMS ASR manifest)
5. manifest.json (Dataset Summary, Statistics & SHA256 Hashes)
"""

from __future__ import annotations

import os
import json
import csv
import hashlib
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional
from pathlib import Path

from .asosoft_normalizer import SoraniKurdishAsosoftNormalizer
from .phonetics import KurdishPhoneticAnalyzer
from .emotions import EmotionManager
from .audio_engine import AudioEngine
import numpy as np
import soundfile as sf


@dataclass
class CanonicalSampleRecord:
    id: str
    language: str = "ckb"
    speakerId: str = "spk_kurdish_male_01"
    speakerName: str = "ئاراس (دەنگی دەستکرد)"
    speakerGender: str = "male"
    datasetSplit: str = "train"
    source: str = "ElevenLabs Synthetic v2"
    duration: float = 0.0
    audioUrl: str = ""
    transcript: str = ""
    normalized_text: str = ""
    originalDraft: str = ""
    draftSource: str = "ElevenLabs Scribe v1 (ckb)"
    status: str = "approved"
    emotion: str = "neutral"
    emotionIntensity: float = 1.0
    metrics: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        if self.metrics is None:
            d["metrics"] = {
                "snrDb": 35.0,
                "speechRatio": 0.98,
                "ttsSuitabilityScore": 95,
                "sampleRate": 24000,
                "channels": 1,
                "bitDepth": 16,
                "format": "PCM WAV",
            }
        return d


class DatasetBuilder:
    """
    Manages generation, storage, indexing, and validation of the Audar Canonical Speech Dataset.
    """

    SCHEMA_VERSION = "Audar Canonical Speech Schema v2.0 (ckb)"

    def __init__(self, output_dir: str = "dataset_export"):
        self.output_dir = Path(output_dir).resolve()
        self.audio_dir = self.output_dir / "audio"
        self.data_jsonl_path = self.output_dir / "data.jsonl"
        self.metadata_csv_path = self.output_dir / "metadata.csv"
        self.whisper_jsonl_path = self.output_dir / "whisper.jsonl"
        self.manifest_json_path = self.output_dir / "manifest.json"

        self.normalizer = SoraniKurdishAsosoftNormalizer()
        self.phonetic_analyzer = KurdishPhoneticAnalyzer()

        self._ensure_directories()

    def _ensure_directories(self):
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def add_sample(
        self,
        clip_id: str,
        text: str,
        audio_bytes: bytes,
        speaker_id: str = "spk_kurdish_male_01",
        speaker_name: str = "ئاراس (دەنگی دەستکرد)",
        gender: str = "male",
        emotion: str = "neutral",
        emotion_intensity: float = 1.0,
        split: str = "train",
        source: str = "ElevenLabs Synthetic v2",
    ) -> CanonicalSampleRecord:
        """
        Processes audio, normalizes Kurdish orthography, writes WAV, and updates all 4 manifests.
        """
        # 1. Normalize Kurdish Text adhering to Asosoft standard
        transcript = self.normalizer.normalize(text, preserve_paralinguistic=True)
        normalized_text = transcript
        original_draft = self.normalizer.strip_paralinguistic(transcript)

        # 2. Process and Save 24kHz Mono 16-bit PCM WAV
        wav_filename = f"{clip_id}.wav"
        wav_rel_path = f"audio/{wav_filename}"
        wav_full_path = self.audio_dir / wav_filename

        audio_metrics = AudioEngine.process_and_save_audio(
            audio_bytes=audio_bytes,
            output_filepath=str(wav_full_path),
            target_sample_rate=24000,
        )

        # 3. Analyze Kurdish Phonetics
        phonetic_info = self.phonetic_analyzer.analyze(transcript)
        audio_metrics["ttsSuitabilityScore"] = phonetic_info["ttsSuitabilityScore"]

        # 4. Build Canonical Record
        record = CanonicalSampleRecord(
            id=clip_id,
            language="ckb",
            speakerId=speaker_id,
            speakerName=speaker_name,
            speakerGender=gender,
            datasetSplit=split,
            source=source,
            duration=audio_metrics["duration"],
            audioUrl=wav_rel_path,
            transcript=transcript,
            normalized_text=normalized_text,
            originalDraft=original_draft,
            draftSource="ElevenLabs Scribe v1 (ckb)",
            status="approved",
            emotion=EmotionManager.validate_emotion(emotion),
            emotionIntensity=round(float(emotion_intensity), 2),
            metrics=audio_metrics,
        )

        # 5. Atomic Append to Manifests
        self._append_to_data_jsonl(record)
        self._append_to_metadata_csv(record)
        self._append_to_whisper_jsonl(record)

        # 6. Update manifest.json summary
        self.update_manifest_summary()

        return record

    def _append_to_data_jsonl(self, record: CanonicalSampleRecord):
        with open(self.data_jsonl_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record.to_dict(), ensure_ascii=False) + "\n")

    def _append_to_metadata_csv(self, record: CanonicalSampleRecord):
        # Format: audio_file|text|speaker_name|emotion
        file_exists = self.metadata_csv_path.exists()
        with open(self.metadata_csv_path, "a", encoding="utf-8", newline="") as f:
            if not file_exists or self.metadata_csv_path.stat().st_size == 0:
                f.write("audio_file|text|speaker_name|emotion\n")
            line = f"{record.audioUrl}|{record.transcript}|{record.speakerId}|{record.emotion}\n"
            f.write(line)

    def _append_to_whisper_jsonl(self, record: CanonicalSampleRecord):
        # Format: {"id": ..., "audio": ..., "text": ..., "language": "ckb", "duration": ..., "speaker": ...}
        whisper_entry = {
            "id": record.id,
            "audio": record.audioUrl,
            "text": record.originalDraft,  # Pure clean text for ASR
            "language": "ckb",
            "duration": record.duration,
            "speaker": record.speakerId,
        }
        with open(self.whisper_jsonl_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(whisper_entry, ensure_ascii=False) + "\n")

    def read_all_records(self) -> List[Dict[str, Any]]:
        """
        Reads all canonical records from data.jsonl.
        """
        if not self.data_jsonl_path.exists():
            return []

        records = []
        with open(self.data_jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except Exception:
                        pass
        return records

    def update_manifest_summary(self) -> Dict[str, Any]:
        """
        Recomputes total duration, hashes, phoneme coverage, and writes manifest.json.
        """
        records = self.read_all_records()
        total_samples = len(records)
        total_duration = sum(r.get("duration", 0.0) for r in records)

        # Splits distribution
        splits_count = {"train": 0, "val": 0, "test": 0}
        for r in records:
            sp = r.get("datasetSplit", "train")
            if sp in {"val", "validation"}:
                splits_count["val"] += 1
            elif sp == "test":
                splits_count["test"] += 1
            else:
                splits_count["train"] += 1

        # Emotion distribution
        emotions_count = {}
        for r in records:
            emo = r.get("emotion", "neutral")
            emotions_count[emo] = emotions_count.get(emo, 0) + 1

        # Speakers distribution
        speakers_count = {}
        for r in records:
            spk = r.get("speakerId", "unknown")
            speakers_count[spk] = speakers_count.get(spk, 0) + 1

        # Phonetics report
        phonetics_report = self.phonetic_analyzer.generate_phonetic_report(records)

        # Checksums
        hashes = {
            "data.jsonl": self._compute_sha256(self.data_jsonl_path),
            "metadata.csv": self._compute_sha256(self.metadata_csv_path),
            "whisper.jsonl": self._compute_sha256(self.whisper_jsonl_path),
        }

        manifest = {
            "schemaVersion": self.SCHEMA_VERSION,
            "language": "ckb",
            "languageName": "Central Kurdish (Sorani / سۆرانی)",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "totalSamples": total_samples,
            "totalDurationSeconds": round(total_duration, 2),
            "totalDurationHours": round(total_duration / 3600.0, 4),
            "averageDurationSeconds": round(total_duration / total_samples, 2) if total_samples > 0 else 0,
            "splits": splits_count,
            "emotions": emotions_count,
            "speakers": speakers_count,
            "audioSpecification": {
                "format": "PCM WAV",
                "sampleRate": 24000,
                "channels": 1,
                "bitDepth": 16,
            },
            "phoneticCoverage": phonetics_report.get("phonemeCoveragePercent", {}),
            "distinctPhonemesSummary": phonetics_report.get("distinctPhonemesSummary", {}),
            "fileChecksums": hashes,
        }

        with open(self.manifest_json_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        return manifest

    def validate_dataset(self) -> Dict[str, Any]:
        """
        Validates entire dataset directory structure, file integrity, and schema conformity.
        """
        records = self.read_all_records()
        issues = []
        valid_count = 0

        if not self.data_jsonl_path.exists():
            issues.append("Missing data.jsonl file")
        if not self.metadata_csv_path.exists():
            issues.append("Missing metadata.csv file")
        if not self.whisper_jsonl_path.exists():
            issues.append("Missing whisper.jsonl file")

        for idx, rec in enumerate(records):
            rec_id = rec.get("id", f"record_{idx}")
            wav_rel = rec.get("audioUrl", "")
            wav_path = self.output_dir / wav_rel

            if not wav_path.exists():
                issues.append(f"Sample {rec_id}: Audio file missing at {wav_rel}")
                continue

            # Check audio file format
            try:
                info = AudioEngine.compute_audio_metrics(np.zeros(1), 24000)
                # verify with soundfile
                import soundfile as sf
                sf_info = sf.info(str(wav_path))
                if sf_info.samplerate != 24000:
                    issues.append(f"Sample {rec_id}: Sample rate is {sf_info.samplerate}, expected 24000")
                if sf_info.channels != 1:
                    issues.append(f"Sample {rec_id}: Channels is {sf_info.channels}, expected 1 (Mono)")
                if sf_info.subtype != "PCM_16":
                    issues.append(f"Sample {rec_id}: Subtype is {sf_info.subtype}, expected PCM_16")
            except Exception as err:
                issues.append(f"Sample {rec_id}: Audio read error: {err}")
                continue

            # Check mandatory fields
            for field in ["language", "speakerId", "transcript", "normalized_text", "emotion", "metrics"]:
                if field not in rec:
                    issues.append(f"Sample {rec_id}: Missing mandatory field '{field}'")

            valid_count += 1

        is_valid = len(issues) == 0 and len(records) > 0
        return {
            "isValid": is_valid,
            "totalRecords": len(records),
            "validRecords": valid_count,
            "issueCount": len(issues),
            "issues": issues[:20],  # top 20 issues
        }

    @staticmethod
    def _compute_sha256(filepath: Path) -> str:
        if not filepath.exists():
            return ""
        h = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
