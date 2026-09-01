"""
Audar Sorani Kurdish Synthetic Speech Generator - Command Line Interface
========================================================================
Interactive & Automated CLI for producing Audar Canonical Speech Datasets.
"""

from __future__ import annotations

import os
import sys
import argparse
import json
from pathlib import Path
from typing import Optional

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .asosoft_normalizer import SoraniKurdishAsosoftNormalizer
from .phonetics import KurdishPhoneticAnalyzer
from .emotions import EmotionManager
from .audio_engine import AudioEngine
from .corpus_library import KURDISH_CANONICAL_CORPUS, get_corpus_by_domain, get_corpus_by_emotion
from .elevenlabs_client import ElevenLabsClient
from .dataset_builder import DatasetBuilder


def cmd_generate_sample(args):
    """Generates a single synthetic Kurdish speech sample."""
    print(f"\n=======================================================")
    print(f"🎙️  Audar Kurdish Synthetic Speech Generator: Single Sample")
    print(f"=======================================================")

    builder = DatasetBuilder(output_dir=args.output_dir)
    normalizer = SoraniKurdishAsosoftNormalizer()
    analyzer = KurdishPhoneticAnalyzer()

    # Normalize text first
    normalized_text = normalizer.normalize(args.text, preserve_paralinguistic=True)
    phonetics = analyzer.analyze(normalized_text)

    print(f"📝 Raw Text:       {args.text}")
    print(f"✨ Asosoft Text:   {normalized_text}")
    print(f"🎭 Emotion:        {args.emotion} (Intensity: {args.intensity})")
    print(f"📊 Words:          {phonetics['wordCount']} (Est. {phonetics['estimatedDurationSec']}s)")
    print(f"🎯 Phonetic Score: {phonetics['phoneticDiversityScore']} (Distinct Phonemes: {phonetics['distinctPhonemeCount']}/10)")
    print(f"👤 Speaker:        {args.speaker_name} [{args.speaker_id}] ({args.gender})")
    print(f"📁 Output Dir:     {args.output_dir}")

    # Generate Audio
    if args.dry_run:
        print(f"\n⚙️  [Dry-Run] Generating synthetic test waveform (24kHz Mono 16-bit PCM)...")
        audio_bytes = AudioEngine.generate_synthetic_test_wave(duration_sec=phonetics["estimatedDurationSec"])
    else:
        print(f"\n🌐 Connecting to ElevenLabs API (Voice ID: {args.voice_id})...")
        client = ElevenLabsClient(api_key=args.api_key)
        audio_bytes = client.synthesize(
            text=normalized_text,
            voice_id=args.voice_id,
            emotion=args.emotion,
            emotion_intensity=args.intensity,
            model_id=args.model_id,
        )

    # Save to Dataset
    record = builder.add_sample(
        clip_id=args.clip_id,
        text=normalized_text,
        audio_bytes=audio_bytes,
        speaker_id=args.speaker_id,
        speaker_name=args.speaker_name,
        gender=args.gender,
        emotion=args.emotion,
        emotion_intensity=args.intensity,
        split=args.split,
        source="ElevenLabs Synthetic v2" if not args.dry_run else "Audar Synthetic Wave Engine (Dry-Run)",
    )

    print(f"\n✅ Successfully generated and registered sample:")
    print(f"   ID:       {record.id}")
    print(f"   Audio:    {builder.output_dir / record.audioUrl}")
    print(f"   Duration: {record.duration}s")
    print(f"   SNR:      {record.metrics['snrDb']} dB")
    print(f"   Suitability Score: {record.metrics['ttsSuitabilityScore']}/100")
    print(f"   Updated manifests: data.jsonl, metadata.csv, whisper.jsonl, manifest.json\n")


def cmd_generate_corpus(args):
    """Batch generates dataset from curated canonical Kurdish corpus or input file."""
    print(f"\n=======================================================")
    print(f"🎙️  Audar Kurdish Synthetic Speech Generator: Batch Corpus")
    print(f"=======================================================")

    builder = DatasetBuilder(output_dir=args.output_dir)
    client = ElevenLabsClient(api_key=args.api_key) if not args.dry_run else None

    # Load corpus
    items = []
    if args.input_file:
        in_path = Path(args.input_file)
        if not in_path.exists():
            print(f"❌ Input file not found: {args.input_file}")
            sys.exit(1)
        if in_path.suffix == ".json":
            with open(in_path, "r", encoding="utf-8") as f:
                items = json.load(f)
        else:
            with open(in_path, "r", encoding="utf-8") as f:
                for idx, line in enumerate(f):
                    line = line.strip()
                    if line:
                        items.append({
                            "id_suffix": f"custom_{idx+1:03d}",
                            "transcript": line,
                            "emotion": args.emotion,
                            "emotion_intensity": args.intensity,
                            "speaker_gender": args.gender,
                            "split": args.split,
                        })
    else:
        if args.domain:
            items = get_corpus_by_domain(args.domain)
        elif args.emotion != "all":
            items = get_corpus_by_emotion(args.emotion)
        else:
            items = KURDISH_CANONICAL_CORPUS

    if args.limit and args.limit > 0:
        items = items[: args.limit]

    print(f"📚 Total Items to Generate: {len(items)}")
    print(f"📁 Destination:            {args.output_dir}")
    print(f"⚙️  Mode:                   {'[Dry-Run]' if args.dry_run else '[Live ElevenLabs API]'}")

    success_count = 0
    prefix = args.id_prefix or "krd_synth_spk01"

    for idx, item in enumerate(items, 1):
        clip_id = f"{prefix}_{idx:03d}"
        raw_text = item.get("transcript", "")
        emo = item.get("emotion", args.emotion)
        if emo == "all":
            emo = "neutral"
        intensity = item.get("emotion_intensity", args.intensity)
        gender = item.get("speaker_gender", args.gender)
        split = item.get("split", args.split)

        print(f"\n[{idx}/{len(items)}] Generating {clip_id} ({emo}, {split})...")

        try:
            if args.dry_run:
                analyzer = KurdishPhoneticAnalyzer()
                p_info = analyzer.analyze(raw_text)
                audio_bytes = AudioEngine.generate_synthetic_test_wave(duration_sec=p_info["estimatedDurationSec"])
            else:
                normalizer = SoraniKurdishAsosoftNormalizer()
                norm_text = normalizer.normalize(raw_text, preserve_paralinguistic=True)
                audio_bytes = client.synthesize(
                    text=norm_text,
                    voice_id=args.voice_id,
                    emotion=emo,
                    emotion_intensity=intensity,
                    model_id=args.model_id,
                )

            rec = builder.add_sample(
                clip_id=clip_id,
                text=raw_text,
                audio_bytes=audio_bytes,
                speaker_id=args.speaker_id,
                speaker_name=args.speaker_name,
                gender=gender,
                emotion=emo,
                emotion_intensity=intensity,
                split=split,
                source="ElevenLabs Synthetic v2" if not args.dry_run else "Audar Synthetic Wave Engine (Dry-Run)",
            )
            print(f"    ✓ Saved: {rec.duration}s | SNR: {rec.metrics['snrDb']}dB | Suitability: {rec.metrics['ttsSuitabilityScore']}")
            success_count += 1
        except Exception as e:
            print(f"    ❌ Failed {clip_id}: {e}")

    # Summary
    manifest = builder.update_manifest_summary()
    print(f"\n=======================================================")
    print(f"🎉 Batch Generation Complete!")
    print(f"   Successfully generated: {success_count}/{len(items)} samples")
    print(f"   Total Dataset Samples:  {manifest['totalSamples']}")
    print(f"   Total Duration:         {manifest['totalDurationSeconds']}s ({manifest['totalDurationHours']} hrs)")
    print(f"   Manifest:               {builder.manifest_json_path}")
    print(f"=======================================================\n")


def cmd_validate(args):
    """Validates dataset against Audar Canonical Speech Schema."""
    print(f"\n=======================================================")
    print(f"🔍 Validating Dataset: {args.output_dir}")
    print(f"=======================================================")

    builder = DatasetBuilder(output_dir=args.output_dir)
    res = builder.validate_dataset()

    print(f"Total Records: {res['totalRecords']}")
    print(f"Valid Records: {res['validRecords']}")
    print(f"Issue Count:   {res['issueCount']}")

    if res["isValid"]:
        print(f"\n✅ DATASET FULLY CONFORMS TO AUDAR CANONICAL SPEECH SCHEMA!")
    else:
        print(f"\n⚠️  Validation encountered issues:")
        for iss in res["issues"]:
            print(f"  - {iss}")
    print()


def cmd_report(args):
    """Displays rich phonetic and duration summary."""
    builder = DatasetBuilder(output_dir=args.output_dir)
    if not builder.manifest_json_path.exists():
        builder.update_manifest_summary()

    with open(builder.manifest_json_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"\n=======================================================")
    print(f"📊 Audar Kurdish Dataset Canonical Report")
    print(f"=======================================================")
    print(f"Schema Version:       {manifest.get('schemaVersion')}")
    print(f"Language:             {manifest.get('languageName')} ({manifest.get('language')})")
    print(f"Total Samples:        {manifest.get('totalSamples')}")
    print(f"Total Duration:       {manifest.get('totalDurationSeconds')}s ({manifest.get('totalDurationHours')} hrs)")
    print(f"Average Duration:     {manifest.get('averageDurationSeconds')}s")
    print(f"Splits:               {manifest.get('splits')}")
    print(f"Emotions:             {manifest.get('emotions')}")
    print(f"Speakers:             {manifest.get('speakers')}")
    print(f"\nDistinct Kurdish Phoneme Coverage:")
    for phoneme, desc in manifest.get("distinctPhonemesSummary", {}).items():
        print(f"  • {phoneme:<20}: {desc}")
    print(f"=======================================================\n")


def cmd_inspect_text(args):
    """Analyzes arbitrary Kurdish text for Asosoft orthography, ZWNJ, and phonetics."""
    normalizer = SoraniKurdishAsosoftNormalizer()
    analyzer = KurdishPhoneticAnalyzer()

    normalized = normalizer.normalize(args.text, preserve_paralinguistic=True)
    clean_asr = normalizer.strip_paralinguistic(normalized)
    p_info = analyzer.analyze(normalized)
    is_ortho_valid, issues = normalizer.validate_kurdish_orthography(normalized)

    print(f"\n=======================================================")
    print(f"🔍 Kurdish Text & Phonetic Inspector")
    print(f"=======================================================")
    print(f"Original:          {args.text}")
    print(f"Normalized (TTS):  {normalized}")
    print(f"ASR Clean Text:    {clean_asr}")
    print(f"Word Count:        {p_info['wordCount']} ({p_info['lengthStatus']})")
    print(f"Est. Duration:     {p_info['estimatedDurationSec']} seconds")
    print(f"Phonetic Score:    {p_info['phoneticDiversityScore']} (Phonemes detected: {p_info['distinctPhonemeCount']}/10)")
    print(f"Suitability Score: {p_info['ttsSuitabilityScore']}/100")
    print(f"Detected Phonemes: {', '.join(p_info['detectedPhonemes'])}")
    print(f"Orthography Valid: {'✅ Yes' if is_ortho_valid else '❌ No'}")
    if issues:
        for iss in issues:
            print(f"   - {iss}")
    print(f"=======================================================\n")


def cmd_voices(args):
    """Lists available ElevenLabs voices."""
    client = ElevenLabsClient(api_key=args.api_key)
    voices = client.list_voices()
    sub = client.get_subscription_info()

    print(f"\n=======================================================")
    print(f"🗣️  Available ElevenLabs Voices ({len(voices)} voices)")
    print(f"   Account Tier: {sub.get('tier')} | Remaining Chars: {sub.get('remainingCharacters')}")
    print(f"=======================================================")
    for v in voices:
        print(f"• ID: {v['voice_id']:<24} | Name: {v.get('name', 'N/A'):<25} | Category: {v.get('category', 'N/A')}")
    print(f"=======================================================\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="audar-kurdish-synth",
        description="Audar Sorani Kurdish Synthetic Speech Generator & Canonical Dataset Manager",
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Subcommand to execute")

    # Sample Generator
    p_sample = subparsers.add_parser("generate-sample", help="Generate a single Kurdish speech sample")
    p_sample.add_argument("--text", "-t", required=True, help="Kurdish Sorani text to speak")
    p_sample.add_argument("--clip-id", "-id", default="krd_synth_spk01_001", help="Unique clip ID")
    p_sample.add_argument("--emotion", "-e", default="neutral", choices=["neutral", "happy", "calm_tender", "excited", "laughing", "sad", "angry", "whisper"])
    p_sample.add_argument("--intensity", "-i", type=float, default=1.0, help="Emotion intensity (0.1 - 1.0)")
    p_sample.add_argument("--speaker-id", default="spk_kurdish_male_01", help="Speaker identifier")
    p_sample.add_argument("--speaker-name", default="ئاراس (دەنگی دەستکرد)", help="Speaker human-readable name")
    p_sample.add_argument("--gender", default="male", choices=["male", "female"])
    p_sample.add_argument("--split", default="train", choices=["train", "validation", "test"])
    p_sample.add_argument("--voice-id", default="21m00Tcm4TlvDq8ikWAM", help="ElevenLabs Voice ID")
    p_sample.add_argument("--model-id", default="eleven_multilingual_v2", help="ElevenLabs Model ID")
    p_sample.add_argument("--api-key", default=None, help="ElevenLabs API Key")
    p_sample.add_argument("--output-dir", "-o", default="dataset_export", help="Output dataset export directory")
    p_sample.add_argument("--dry-run", action="store_true", help="Synthesize test waveform without calling ElevenLabs API")
    p_sample.set_defaults(func=cmd_generate_sample)

    # Batch Corpus Generator
    p_corpus = subparsers.add_parser("generate-corpus", help="Batch generate dataset from Kurdish canonical corpus")
    p_corpus.add_argument("--input-file", "-f", default=None, help="Custom JSON or text file with sentences")
    p_corpus.add_argument("--domain", "-d", choices=["conversational", "storytelling", "technology_news", "expressive_reactions"], help="Filter corpus by domain")
    p_corpus.add_argument("--emotion", "-e", default="all", help="Filter corpus by emotion or set default")
    p_corpus.add_argument("--intensity", "-i", type=float, default=1.0, help="Default emotion intensity")
    p_corpus.add_argument("--speaker-id", default="spk_kurdish_male_01", help="Speaker ID")
    p_corpus.add_argument("--speaker-name", default="ئاراس (دەنگی دەستکرد)", help="Speaker Name")
    p_corpus.add_argument("--gender", default="male", choices=["male", "female"])
    p_corpus.add_argument("--split", default="train", choices=["train", "validation", "test"])
    p_corpus.add_argument("--id-prefix", default="krd_synth_spk01", help="ID prefix for generated clips")
    p_corpus.add_argument("--voice-id", default="21m00Tcm4TlvDq8ikWAM", help="ElevenLabs Voice ID")
    p_corpus.add_argument("--model-id", default="eleven_multilingual_v2", help="ElevenLabs Model ID")
    p_corpus.add_argument("--api-key", default=None, help="ElevenLabs API Key")
    p_corpus.add_argument("--limit", "-n", type=int, default=None, help="Limit number of items to generate")
    p_corpus.add_argument("--output-dir", "-o", default="dataset_export", help="Output dataset directory")
    p_corpus.add_argument("--dry-run", action="store_true", help="Generate test waveforms without consuming API credits")
    p_corpus.set_defaults(func=cmd_generate_corpus)

    # Validator
    p_val = subparsers.add_parser("validate", help="Validate dataset directory against Audar Canonical Schema")
    p_val.add_argument("--output-dir", "-o", default="dataset_export", help="Dataset directory to validate")
    p_val.set_defaults(func=cmd_validate)

    # Report
    p_rep = subparsers.add_parser("report", help="Display dataset statistics and phoneme coverage")
    p_rep.add_argument("--output-dir", "-o", default="dataset_export", help="Dataset directory")
    p_rep.set_defaults(func=cmd_report)

    # Text Inspector
    p_insp = subparsers.add_parser("inspect-text", help="Inspect Kurdish text, ZWNJ rules, and phonetics")
    p_insp.add_argument("text", help="Kurdish text string to inspect")
    p_insp.set_defaults(func=cmd_inspect_text)

    # Voices
    p_voices = subparsers.add_parser("voices", help="List available ElevenLabs voices")
    p_voices.add_argument("--api-key", default=None, help="ElevenLabs API Key")
    p_voices.set_defaults(func=cmd_voices)

    return parser


def main():
    parser = build_parser()
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)
    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
