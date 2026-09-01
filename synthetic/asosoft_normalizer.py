"""
Sorani Kurdish Asosoft Text Normalizer & ZWNJ Engine
---------------------------------------------------
Strict adherence to Asosoft standard Kurdish spelling, Unicode NFC normalization,
and automated Zero-Width Non-Joiner (ZWNJ U+200C) rule enforcement.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Set, Tuple


class SoraniKurdishAsosoftNormalizer:
    """
    Standard Asosoft Sorani Kurdish (ckb) Normalizer:
    1. Preserves all native Kurdish consonants and vowels:
       پ (U+067E), چ (U+0686), ژ (U+0698), گ (U+06AF), ڤ (U+06A4),
       ڕ (U+0695), ێ (U+06CE), ۆ (U+06C6), ڵ (U+06B5), ە (U+06D5).
    2. Enforces ZWNJ (نیمبۆشایی U+200C) rules for verbal prefixes, compound suffixes,
       plurals, and definite forms.
    3. Handles paralinguistic markers ([laugh], [sigh], [whisper], [gasp], [cough]).
    4. Normalizes Kurdish punctuation (، ؛ ؟ « »).
    """

    ZWNJ = "\u200c"
    PARALINGUISTIC_TAGS: Set[str] = {
        "[laugh]",
        "[sigh]",
        "[whisper]",
        "[gasp]",
        "[cough]",
    }

    # Distinct Kurdish Characters
    DISTINCT_KURDISH_CHARS = {
        "ڵ": "Velarized L",
        "ڕ": "Trilled R",
        "ڤ": "Veh (V)",
        "ۆ": "Kurdish O",
        "ێ": "Kurdish E",
        "ە": "Kurdish Schwa / Ae",
        "پ": "Peh",
        "چ": "Tcheh",
        "ژ": "Jeh",
        "گ": "Gaf",
    }

    # Common prefixes that require ZWNJ when attached
    PREFIXES_NEEDING_ZWNJ = ["دە", "نا", "نە", "بێ", "پێ", "تێ", "لێ", "هاو", "خۆ", "ڕێ"]

    # Common compound suffixes that require ZWNJ when attached
    SUFFIXES_NEEDING_ZWNJ = [
        "خانە",
        "گە",
        "نامە",
        "ناس",
        "ناسی",
        "پەروەر",
        "پەروەری",
        "ساز",
        "سازی",
        "دۆست",
        "مەند",
        "مەندی",
        "کردن",
        "بوون",
        "دان",
        "دراو",
        "کە",
        "ەکان",
        "ەکانی",
        "ەکانمان",
        "ەکانتان",
        "ەکانسیان",
        "ەوە",
        "ڕا",
        "دا",
    ]

    def __init__(self):
        pass

    def normalize(self, text: str, preserve_paralinguistic: bool = True) -> str:
        """
        Normalizes Sorani Kurdish text adhering to Asosoft orthography and ZWNJ rules.
        """
        if not text or not isinstance(text, str):
            return ""

        # 1. NFC Normalization
        text = unicodedata.normalize("NFC", text)

        # 2. Convert standard Arabic variants to Kurdish equivalents
        text = text.replace("ك", "ک")  # Keheh
        text = text.replace("ي", "ی")  # Kurdish Yeh
        text = text.replace("ى", "ی")  # Alef Maksura -> Yeh
        text = text.replace("ة", "ە")  # Ta Marbuta -> Kurdish Ae

        # 3. Clean up non-standard control characters (ZWJ, BOM, Soft Hyphen)
        text = text.replace("\u200d", "")  # Remove ZWJ
        text = text.replace("\ufeff", "")  # Remove BOM
        text = text.replace("\u00ad", "")  # Remove Soft Hyphen

        # 4. Paralinguistic tag protection
        preserved_tokens = {}
        if preserve_paralinguistic:
            for tag in self.PARALINGUISTIC_TAGS:
                if tag in text:
                    placeholder = f"__PARALANG_{tag.strip('[]').upper()}__"
                    preserved_tokens[placeholder] = tag
                    text = text.replace(tag, placeholder)
        else:
            # Strip paralinguistic tags for clean ASR ground truth
            for tag in self.PARALINGUISTIC_TAGS:
                text = text.replace(tag, " ")

        # 5. Clean up bracketed noise that is not a valid paralinguistic tag
        text = re.sub(r"\([A-Za-z0-9_\s-]{2,}\)", " ", text)
        text = re.sub(r"\[[A-Za-z0-9_\s-]{2,}\]", " ", text)

        # 6. Apply Kurdish ZWNJ rules
        text = self._apply_zwnj_rules(text)

        # 7. Normalize Kurdish punctuation spacing
        text = self._normalize_punctuation(text)

        # 8. Clean redundant whitespaces
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r" ?\n ?", "\n", text).strip()

        # 9. Restore paralinguistic tokens
        for placeholder, tag in preserved_tokens.items():
            text = text.replace(placeholder, f" {tag} ")

        # Final whitespace clean around punctuation and brackets
        text = re.sub(r"\s+", " ", text).strip()
        text = re.sub(r"\s+([،؛؟\.\!\?])", r"\1", text)
        text = re.sub(r"(\[.*?\])\s+([،؛؟\.\!\?])", r"\1\2", text)

        return text

    def strip_paralinguistic(self, text: str) -> str:
        """
        Strips all inline paralinguistic tags and brackets, returning pure readable text (for ASR/Whisper).
        """
        cleaned = self.normalize(text, preserve_paralinguistic=False)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def _apply_zwnj_rules(self, text: str) -> str:
        """
        Enforces Asosoft ZWNJ rules systematically.
        """
        z = self.ZWNJ

        # Rule A: Fix isolated ZWNJ touching space or punctuation
        text = re.sub(rf"{z}+\s+", " ", text)
        text = re.sub(rf"\s+{z}+", " ", text)
        text = re.sub(rf"{z}+([،؛؟\.\!\?])", r"\1", text)
        text = re.sub(rf"([،؛؟\.\!\?]){z}+", r"\1", text)

        # Rule B: Specific common Kurdish compound words needing ZWNJ
        compounds = [
            ("دەستپێکردن", f"دەست{z}پێکردن"),
            ("خوێندنگە", f"خوێندں{z}گە".replace("ں", "ن")),
            ("کتێبخانە", f"کتێب{z}خانە"),
            ("چایخانە", f"چای{z}خانە"),
            ("نەخۆشخانە", f"نەخۆش{z}خانە"),
            ("کردووەتەوە", f"کردووەت{z}ەوە"),
            ("خانووەکە", f"خانوو{z}ەکە"),
            ("خانووەکان", f"خانوو{z}ەکان"),
            ("پێداچوونەوە", f"پێدا{z}چوونەوە"),
            ("پێکهاتن", f"پێک{z}هاتن"),
            ("تێگەیشتن", f"تێ{z}گەیشتن"),
            ("بێدەنگ", f"بێ{z}دەنگ"),
            ("بێهیوا", f"بێ{z}هیوا"),
            ("بێمانا", f"بێ{z}مانا"),
            ("هەمووان", "هەمووان"),
            ("دڵنیایی", "دڵنیایی"),
        ]

        for orig, target in compounds:
            # Match word boundary without zwnj or with broken space
            space_variant = orig.replace(z, " ")
            text = text.replace(orig, target)
            text = text.replace(space_variant, target)

        def _prefix_sub(match):
            lead = match.group(1) or ""
            prefix = match.group(2)
            stem = match.group(3)
            return f"{lead}{prefix}{z}{stem}"

        prefix_pattern = r"(^|\s)(دە|نا|نە|بێ)\s+([\u0600-\u06FF]{3,})"
        text = re.sub(prefix_pattern, _prefix_sub, text)

        # Rule D: Suffixes (ـەوە, ـەکان, ـەکانی, ـیان, ـمان, ـتان) with broken space
        suffix_pattern = r"([\u0600-\u06FF]{2,})\s+(ەوە|ەکان|ەکانی|مان|تان|یان|خانە|گە)(?=[\s،؛؟\.\!\?]|$)"
        text = re.sub(suffix_pattern, rf"\1{z}\2", text)

        # Remove duplicate ZWNJs
        text = re.sub(rf"{z}{{2,}}", z, text)

        return text

    def _normalize_punctuation(self, text: str) -> str:
        """
        Converts Western / Persian punctuation to standard Kurdish/Arabic forms where appropriate.
        """
        text = text.replace(",", "،")
        text = text.replace(";", "؛")
        text = text.replace("?", "؟")
        text = text.replace('"', "«")  # Normalize quotes if standalone
        # Clean double quotes
        text = text.replace("««", "«").replace("»»", "»")
        return text

    def validate_kurdish_orthography(self, text: str) -> Tuple[bool, list[str]]:
        """
        Validates text against Kurdish orthographic rules. Returns (is_valid, list_of_issues).
        """
        issues = []
        if not text:
            return False, ["دەق بەتاڵە (Empty text)"]

        # Check for non-standard Arabic characters that should be converted
        if "ك" in text:
            issues.append("پیتێکی عەرەبی (ك) دۆزرایەوە لەبری (ک)")
        if "ي" in text:
            issues.append("پیتێکی عەرەبی (ي) دۆزرایەوە لەبری (ی)")
        if "ة" in text:
            issues.append("پیتێکی عەرەبی (ة) دۆزرایەوە لەبری (ە)")

        # Check for forbidden control characters
        if "\u200d" in text:
            issues.append("کارەکتەری نەخوازراوی ZWJ دۆزرایەوە")

        words = text.split()
        if len(words) < 3:
            issues.append(f"ڕستەکە زۆر کورتە ({len(words)} وشە)")
        elif len(words) > 25:
            issues.append(f"ڕستەکە زۆر درێژە ({len(words)} وشە)")

        return len(issues) == 0, issues
