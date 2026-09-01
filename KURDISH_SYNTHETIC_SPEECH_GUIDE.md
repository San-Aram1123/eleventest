# Audar Sorani Kurdish Synthetic Speech Generator (ckb)
**Version**: 2.0 (Audar Canonical Speech Schema)  
**Supported Dialect**: Central Kurdish (Sorani / سۆرانی - `ckb`)

---

## 🌟 Overview
The **Audar Sorani Kurdish Synthetic Speech Generator** is a production-grade pipeline and CLI designed to create phonetically diverse, emotionally expressive, and orthographically compliant Sorani Kurdish speech datasets using the ElevenLabs API, formatted strictly in accordance with the **Audar Canonical Speech Schema**.

---

## 📁 Dataset Output Layout
```
dataset_export/
├── audio/
│   ├── krd_synth_spk01_001.wav
│   ├── krd_synth_spk01_002.wav
│   └── ...
├── data.jsonl          <-- Master Canonical JSONL (Full Metadata & Acoustic Metrics)
├── metadata.csv        <-- TTS Manifest (Pipe-delimited for F5-TTS / StyleTTS2)
├── whisper.jsonl       <-- ASR Manifest (Whisper / Meta MMS Training)
└── manifest.json       <-- Dataset Summary, Phonetic Stats & SHA256 Hashes
```

---

## 🚀 Quick Start CLI Commands

### 1. Inspect Kurdish Text & Phonetic Diversity
```bash
python generate_kurdish_dataset.py inspect-text "ئەمڕۆ کەشوهەوای سلێمانی زۆر فێنک و دڵگیرە، [laugh] هیوادارم هەمووان ڕۆژێکی پڕ لە کامەرانی بەسەربەرن."
```

### 2. Generate a Single Synthetic Clip
```bash
# Live ElevenLabs Synthesis:
python generate_kurdish_dataset.py generate-sample \
  --text "ئەمڕۆ کەشوهەوای سلێمانی زۆر فێنک و دڵگیرە." \
  --clip-id krd_synth_spk01_001 \
  --speaker-id spk_kurdish_aras_m \
  --speaker-name "ئاراس ئەحمەد (دەنگی دەستکرد)" \
  --voice-id TX3LPaxmHKxFdv7VOQHJ \
  --emotion happy \
  --intensity 0.85

# Dry-Run (No API credits required):
python generate_kurdish_dataset.py generate-sample \
  --text "سڵاو هاوڕێ گیان، لە کوێی؟" \
  --emotion calm_tender \
  --dry-run
```

### 3. Batch Generate Canonical Kurdish Corpus
```bash
# Generate curated corpus across 4 domains (Conversational, Storytelling, News/Tech, Expressive):
python generate_kurdish_dataset.py generate-corpus --output-dir dataset_export

# Or test in dry-run mode:
python generate_kurdish_dataset.py generate-corpus --limit 10 --dry-run
```

### 4. Validate Dataset Integrity & Schema Compliance
```bash
python generate_kurdish_dataset.py validate --output-dir dataset_export
```

### 5. View Phonetic & Dataset Distribution Report
```bash
python generate_kurdish_dataset.py report --output-dir dataset_export
```

### 6. List Available ElevenLabs Voices
```bash
python generate_kurdish_dataset.py voices
```

---

## 📐 Linguistic & Orthographic Rules (Asosoft Standard)
1. **Consonants & Vowels Preserved**: `ڵ`, `ڕ`, `ڤ`, `ۆ`, `ێ`, `ە`, `پ`, `چ`, `ژ`, `گ`.
2. **Standardization**:
   - Arabic Kaf (`ك`) ➔ Kurdish Keheh (`ک`)
   - Arabic Yeh (`ي` / `ى`) ➔ Kurdish Yeh (`ی`)
   - Arabic Ta Marbuta (`ة`) ➔ Kurdish Ae (`ە`)
3. **Zero-Width Non-Joiner (ZWNJ U+200C / نیمبۆشایی)**:
   - Automated prefix attachment: `دە‌`, `نا‌`, `نە‌`, `بێ‌`, `پێ‌`
   - Automated suffix attachment: `ـەوە`, `ـەکان`, `ـەکانی`, `ـیان`, `ـمان`, `ـتان`, `ـخانە`, `ـگە`
   - Plurals & Definite forms: `خانووەکە`, `هەمووان`, `دڵنیایی`
4. **Phonetic Target**: 4 to 18 words per sentence (~2.5s to 9.5s audio duration).
5. **Paralinguistic Markers**: `[laugh]`, `[sigh]`, `[whisper]`, `[gasp]`, `[cough]`.

---

## 🎧 Audio Standards (Audar Canonical)
- **Format**: 16-bit Linear PCM Mono WAV (`PCM_16`)
- **Sample Rate**: 24,000 Hz
- **Metrics Tracked**: SNR (dB), Speech Ratio, TTS Suitability Score (0-100), RMS Peak
