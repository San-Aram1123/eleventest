#!/usr/bin/env python3
"""
Audar Sorani Kurdish Synthetic Speech Generator
-----------------------------------------------
Top-level entrypoint for generating, validating, and exporting
high-quality, phonetically diverse, and expressive Sorani Kurdish (ckb) speech datasets.

Usage examples:
    # 1. Inspect Kurdish text, ZWNJ rules and phonetic diversity
    python generate_kurdish_dataset.py inspect-text "ئەمڕۆ کەشوهەوای سلێمانی زۆر فێنک و خۆشە، [laugh] هیوادارم هەمووان ڕۆژێکی باش بەسەربەرن."

    # 2. Generate a single sample (Live or Dry-Run)
    python generate_kurdish_dataset.py generate-sample --text "سڵاو هاوڕێ گیان، چۆنی؟" --emotion happy --dry-run

    # 3. Batch generate the curated canonical Kurdish corpus
    python generate_kurdish_dataset.py generate-corpus --limit 10 --dry-run

    # 4. Validate dataset export conformity
    python generate_kurdish_dataset.py validate --output-dir dataset_export

    # 5. Display detailed phonetic distribution & dataset manifest report
    python generate_kurdish_dataset.py report --output-dir dataset_export
"""

import sys
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from speech_platform.synthetic.generator_cli import main
except ImportError:
    from synthetic.generator_cli import main

if __name__ == "__main__":
    main()
