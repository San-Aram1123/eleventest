"""
Sorani Kurdish Phonetic Analyzer & Diversity Calculator
------------------------------------------------------
Evaluates phonetic coverage of distinct Kurdish phonemes (ڵ, ڕ, ڤ, ۆ, ێ, ە, پ, چ, ژ, گ),
sentence rhythm, word counts, and TTS suitability scores.
"""

from __future__ import annotations

import re
from typing import Dict, Any, List, Tuple


class KurdishPhoneticAnalyzer:
    """
    Analyzes phonetic features, Kurdish phoneme inventory density,
    sentence length compliance, and suitability scoring for speech synthesis.
    """

    # Distinct Kurdish phonemes (Vowels & Consonants unique/essential to Sorani Kurdish)
    KURDISH_PHONEMES = {
        "ڵ": {"name": "Velarized L", "category": "consonant", "ipa": "ɫ"},
        "ڕ": {"name": "Trilled R", "category": "consonant", "ipa": "r"},
        "ڤ": {"name": "Veh", "category": "consonant", "ipa": "v"},
        "ۆ": {"name": "Kurdish O", "category": "vowel", "ipa": "oː"},
        "ێ": {"name": "Kurdish E", "category": "vowel", "ipa": "eː"},
        "ە": {"name": "Schwa / Ae", "category": "vowel", "ipa": "æ / ə"},
        "پ": {"name": "Peh", "category": "consonant", "ipa": "p"},
        "چ": {"name": "Tcheh", "category": "consonant", "ipa": "t͡ʃ"},
        "ژ": {"name": "Jeh", "category": "consonant", "ipa": "ʒ"},
        "گ": {"name": "Gaf", "category": "consonant", "ipa": "ɡ"},
    }

    # Minimum and maximum recommended words per utterance
    MIN_WORD_COUNT = 4
    MAX_WORD_COUNT = 18

    # Estimated speaking rate: ~2.0 words per second in Kurdish Sorani
    ESTIMATED_WORDS_PER_SECOND = 2.0

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Runs comprehensive phonetic analysis on Kurdish text.
        """
        # Clean inline paralinguistic tags before counting words & phonemes
        clean_text = re.sub(r"\[.*?\]", "", text).strip()
        words = clean_text.split()
        word_count = len(words)
        char_count = len(clean_text)

        # Count occurrences of distinct Kurdish phonemes
        phoneme_counts = {}
        detected_phonemes = []
        for char, meta in self.KURDISH_PHONEMES.items():
            count = clean_text.count(char)
            phoneme_counts[char] = count
            if count > 0:
                detected_phonemes.append(char)

        # Phonetic Coverage: percentage of distinct Kurdish phonemes present (out of 10)
        coverage_ratio = len(detected_phonemes) / len(self.KURDISH_PHONEMES)
        phonetic_diversity_score = round(coverage_ratio, 3)

        # Estimate expected speech duration in seconds
        estimated_duration = round(max(1.5, word_count / self.ESTIMATED_WORDS_PER_SECOND), 2)

        # Word count suitability
        length_status = "optimal"
        if word_count < self.MIN_WORD_COUNT:
            length_status = "too_short"
        elif word_count > self.MAX_WORD_COUNT:
            length_status = "too_long"

        # Calculate overall TTS Suitability Score (0 - 100)
        suitability_score = self._compute_tts_suitability(
            word_count=word_count,
            coverage_ratio=coverage_ratio,
            has_punctuation=bool(re.search(r"[،؛؟\.\!\?]", text)),
            clean_text=clean_text,
        )

        return {
            "wordCount": word_count,
            "charCount": char_count,
            "estimatedDurationSec": estimated_duration,
            "lengthStatus": length_status,
            "phonemeCounts": phoneme_counts,
            "detectedPhonemes": detected_phonemes,
            "distinctPhonemeCount": len(detected_phonemes),
            "phoneticDiversityScore": phonetic_diversity_score,
            "ttsSuitabilityScore": suitability_score,
            "hasDistinctL": phoneme_counts.get("ڵ", 0) > 0,
            "hasDistinctR": phoneme_counts.get("ڕ", 0) > 0,
            "hasDistinctV": phoneme_counts.get("ڤ", 0) > 0,
            "hasDistinctO": phoneme_counts.get("ۆ", 0) > 0,
            "hasDistinctE": phoneme_counts.get("ێ", 0) > 0,
            "hasDistinctAe": phoneme_counts.get("ە", 0) > 0,
        }

    def _compute_tts_suitability(
        self,
        word_count: int,
        coverage_ratio: float,
        has_punctuation: bool,
        clean_text: str,
    ) -> int:
        score = 80.0

        # Word count penalty / reward
        if self.MIN_WORD_COUNT <= word_count <= self.MAX_WORD_COUNT:
            score += 10.0
        elif word_count < 3 or word_count > 25:
            score -= 30.0
        else:
            score -= 10.0

        # Phonetic diversity reward (up to +10)
        score += coverage_ratio * 10.0

        # Punctuation bonus
        if has_punctuation:
            score += 5.0
        else:
            score -= 5.0

        # Penalty for excessive non-Kurdish Latin/symbols
        latin_count = len(re.findall(r"[A-Za-z]", clean_text))
        if latin_count > 0:
            score -= min(15.0, latin_count * 2.0)

        return int(max(10, min(100, round(score))))

    def generate_phonetic_report(self, dataset_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates dataset-level phonetic summary and coverage report.
        """
        total_samples = len(dataset_records)
        if total_samples == 0:
            return {}

        total_words = 0
        total_duration = 0.0
        phoneme_total_counts = {char: 0 for char in self.KURDISH_PHONEMES}
        phoneme_sample_occurrences = {char: 0 for char in self.KURDISH_PHONEMES}

        for rec in dataset_records:
            text = rec.get("transcript", "")
            duration = rec.get("duration", 0.0)
            total_duration += duration
            analysis = self.analyze(text)
            total_words += analysis["wordCount"]

            for char, cnt in analysis["phonemeCounts"].items():
                phoneme_total_counts[char] += cnt
                if cnt > 0:
                    phoneme_sample_occurrences[char] += 1

        # Calculate percentage of clips containing each phoneme
        phoneme_coverage_pct = {
            char: round((phoneme_sample_occurrences[char] / total_samples) * 100, 1)
            for char in self.KURDISH_PHONEMES
        }

        return {
            "totalSamples": total_samples,
            "totalWords": total_words,
            "totalDurationHours": round(total_duration / 3600.0, 3),
            "totalDurationSec": round(total_duration, 2),
            "averageWordCount": round(total_words / total_samples, 1),
            "averageDurationSec": round(total_duration / total_samples, 2),
            "phonemeTotalCounts": phoneme_total_counts,
            "phonemeCoveragePercent": phoneme_coverage_pct,
            "distinctPhonemesSummary": {
                "ڵ (Velarized L)": f"{phoneme_coverage_pct.get('ڵ', 0)}% of samples",
                "ڕ (Trilled R)": f"{phoneme_coverage_pct.get('ڕ', 0)}% of samples",
                "ڤ (Veh)": f"{phoneme_coverage_pct.get('ڤ', 0)}% of samples",
                "ۆ (Kurdish O)": f"{phoneme_coverage_pct.get('ۆ', 0)}% of samples",
                "ێ (Kurdish E)": f"{phoneme_coverage_pct.get('ێ', 0)}% of samples",
                "ە (Schwa)": f"{phoneme_coverage_pct.get('ە', 0)}% of samples",
            },
        }
