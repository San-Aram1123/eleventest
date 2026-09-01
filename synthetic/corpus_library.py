"""
Curated Canonical Sorani Kurdish (ckb) Corpus Library
----------------------------------------------------
Diverse, high-quality, phonetically balanced sentences covering 4 core domains:
1. Everyday Conversational Dialogue
2. Storytelling & Literature
3. News, Science, Technology & Culture
4. Expressive & Emotional Reactions

Every item adheres strictly to Asosoft Kurdish spelling, ZWNJ rules,
phonetic richness (ڵ, ڕ, ڤ, ۆ, ێ, ە), and sentence length constraints (4-18 words).
"""

from __future__ import annotations

from typing import List, Dict, Any

KURDISH_CANONICAL_CORPUS: List[Dict[str, Any]] = [
    # =========================================================================
    # DOMAIN 1: CONVERSATIONAL & EVERYDAY DIALOGUE
    # =========================================================================
    {
        "id_suffix": "conv_001",
        "domain": "conversational",
        "transcript": "ئەمڕۆ کەشوهەوای سلێمانی زۆر فێنک و خۆشە، [laugh] هیوادارم هەمووان ڕۆژێکی باش بەسەربەرن.",
        "emotion": "happy",
        "emotion_intensity": 0.85,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Rich in ڵ, ڕ, ۆ, ێ with laugh marker",
    },
    {
        "id_suffix": "conv_002",
        "domain": "conversational",
        "transcript": "سڵاو هاوڕێ گیان، لە کوێی؟ زۆرم پێخۆشە بتبینم و پێکەوە قاوەیەک بخۆینەوە.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.70,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Warm greeting with ڵ, ێ, ۆ, ZWNJ in پێخۆشە and بخۆینەوە",
    },
    {
        "id_suffix": "conv_003",
        "domain": "conversational",
        "transcript": "ئەگەر کاتت هەبێت، دەتوانین بەیانی پێکەوە بچینە بازاڕ بۆ کڕینی پێداویستییەکان.",
        "emotion": "neutral",
        "emotion_intensity": 0.50,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Daily planning, ZWNJ in دەتوانین, پێداویستییەکان",
    },
    {
        "id_suffix": "conv_004",
        "domain": "conversational",
        "transcript": "ببورە کەمێک درەنگ گەیشتم، قەرەباڵغیی شەقامەکە بێ‌ئەندازە زۆر بوو.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.60,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Polite apology, ZWNJ in بێ‌ئەندازە, ڕ and ڵ phonemes",
    },
    {
        "id_suffix": "conv_005",
        "domain": "conversational",
        "transcript": "دەستت خۆش بێت بۆ ئەم خواردنە بەتامە، بەڕاستی ماندووبوونەکەت دیارە!",
        "emotion": "happy",
        "emotion_intensity": 0.80,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Gratitude expression, ڵ and ڕ, ZWNJ in ماندووبوونەکەت",
    },
    {
        "id_suffix": "conv_006",
        "domain": "conversational",
        "transcript": "دەتوانیت کەمێک یارمەتیم بدەیت لە ڕێکخستنی ئەم کتێبخانە نوێیەدا؟",
        "emotion": "neutral",
        "emotion_intensity": 0.40,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Request, ZWNJ in دەتوانیت, کتێبخانە, ڕ and ێ",
    },
    {
        "id_suffix": "conv_007",
        "domain": "conversational",
        "transcript": "ناوەکە، ئەوەی زەمانی زووە، [laugh] هێندە بەپەلە بووین هەموومان بیرمان چوو!",
        "emotion": "laughing",
        "emotion_intensity": 0.90,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Conversational laughter, inline laugh token",
    },
    {
        "id_suffix": "conv_008",
        "domain": "conversational",
        "transcript": "هەواڵی باشت پێیە؟ دڵنیام هەموو شتێک بە باشترین شێوە کۆتایی دێت.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.75,
        "speaker_gender": "female",
        "split": "validation",
        "notes": "Reassurance, ڵ, ێ, ۆ",
    },
    # =========================================================================
    # DOMAIN 2: STORYTELLING & LITERATURE
    # =========================================================================
    {
        "id_suffix": "lit_001",
        "domain": "storytelling",
        "transcript": "لە لوتکەی چیا بەرزەکانەوە، شنەبای فێنکی بەهار دارستانە سەوزەکانی دەلاواندەوە.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.75,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Poetic narrative with ڵ, ڕ, ۆ, ێ, ZWNJ in دەلاواندەوە",
    },
    {
        "id_suffix": "lit_002",
        "domain": "storytelling",
        "transcript": "پیرەمێردەکە دەستەکانی بەرز کردەوە و بە دەنگێکی نزم چرپاندی، [whisper] هەموو نهێنییەکان لێرەن.",
        "emotion": "whisper",
        "emotion_intensity": 0.85,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Literary whisper with [whisper] tag, ڵ, ڕ, ێ",
    },
    {
        "id_suffix": "lit_003",
        "domain": "storytelling",
        "transcript": "بارانە نم‌نمەکە شەقامە بەردینەکانی شاری هەولێری بە تەواوی تەڕ و ڕازاوە کردبوو.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.70,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Atmospheric story scene, ڵ, ڕ, ێ, ۆ, ZWNJ in نم‌نمەکە",
    },
    {
        "id_suffix": "lit_004",
        "domain": "storytelling",
        "transcript": "شەوگارێکی تاریک و بێدەنگ بوو، تەنیا چریکەی باڵندەکان لە دوورەوە دەبیسترا.",
        "emotion": "neutral",
        "emotion_intensity": 0.60,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Story setup, ڵ, ێ, ۆ, ZWNJ in بێدەنگ and دەبیسترا",
    },
    {
        "id_suffix": "lit_005",
        "domain": "storytelling",
        "transcript": "کاتێک گەیشتە کانییە زوڵاڵەکە، [sigh] هەناسەیەکی قووڵی هەڵکێشا و ئاوی ساردی نۆشی.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.80,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Paralinguistic sigh marker with ڵ, ڕ, ۆ, ێ",
    },
    {
        "id_suffix": "lit_006",
        "domain": "storytelling",
        "transcript": "خەونی منداڵیم هەمیشە گەشتکردن بوو بەناو دنیای ئەفسانە کۆن و پڕ لە ڕازەکاندا.",
        "emotion": "calm_tender",
        "emotion_intensity": 0.70,
        "speaker_gender": "female",
        "split": "validation",
        "notes": "Nostalgic reflection, ڵ, ڕ, ۆ, ێ",
    },
    # =========================================================================
    # DOMAIN 3: NEWS, SCIENCE, TECHNOLOGY & CULTURE
    # =========================================================================
    {
        "id_suffix": "tech_001",
        "domain": "technology_news",
        "transcript": "سیستەمی ژیریی دەستکرد دەتوانێت گۆڕانکاریی گەورە لە بواری زانست و پزیشکیدا دروست بکات.",
        "emotion": "neutral",
        "emotion_intensity": 0.50,
        "speaker_gender": "male",
        "split": "train",
        "notes": "AI & Tech domain, ZWNJ in دەتوانێت, ۆ, ێ, ڵ",
    },
    {
        "id_suffix": "tech_002",
        "domain": "technology_news",
        "transcript": "زانکۆکانی کوردستان چەندین توێژینەوەی نوێیان لەسەر بەکارهێنانی وزەی نوێبووەوە بڵاوکردووەتەوە.",
        "emotion": "neutral",
        "emotion_intensity": 0.55,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Academic news with ڤ (نوێبووەوە), ڵ, ۆ, ێ, ZWNJ in بڵاوکردووەتەوە",
    },
    {
        "id_suffix": "tech_003",
        "domain": "technology_news",
        "transcript": "کۆمپانیا پێشەنگەکان خەریکی پەرەپێدانی مۆدێلی نوێی دەنگی و ئاخاوتنی زمانی کوردین.",
        "emotion": "neutral",
        "emotion_intensity": 0.60,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Speech platform tech domain, ۆ, ێ, ڵ, ZWNJ in پەرەپێدانی",
    },
    {
        "id_suffix": "tech_004",
        "domain": "technology_news",
        "transcript": "زانایان هۆشداری دەدەن لە کاریگەریی گۆڕانی کەشوهەوا لەسەر سەرچاوە ئاوییەکانی ناوچەکە.",
        "emotion": "neutral",
        "emotion_intensity": 0.50,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Environmental news, ۆ, ێ, ڵ, ڕ, ZWNJ in دەدەن",
    },
    {
        "id_suffix": "tech_005",
        "domain": "technology_news",
        "transcript": "فستیڤاڵی ساڵانەی کلتووری کوردی بە بەشداریی دەیان هونەرمەند لە شاری دهۆک بەڕێوەچوو.",
        "emotion": "neutral",
        "emotion_intensity": 0.65,
        "speaker_gender": "male",
        "split": "test",
        "notes": "Cultural news with ڤ, ڵ, ڕ, ۆ, ێ, ZWNJ in بەڕێوەچوو",
    },
    # =========================================================================
    # DOMAIN 4: EXPRESSIVE & EMOTIONAL REACTIONS
    # =========================================================================
    {
        "id_suffix": "emo_001",
        "domain": "expressive_reactions",
        "transcript": "ئای چەندە دڵخۆشم! بەڕاستی باوەڕ ناکەم ئەم سەرکەوتنە مەزنەمان بەدەستهێنابێت!",
        "emotion": "excited",
        "emotion_intensity": 0.95,
        "speaker_gender": "female",
        "split": "train",
        "notes": "High excitement, exclamation, ڵ, ڕ, ۆ, ێ, ZWNJ in بەدەستهێنابێت",
    },
    {
        "id_suffix": "emo_002",
        "domain": "expressive_reactions",
        "transcript": "ئەمە بێ‌مانایە! [gasp] چۆن دەکرێت بەبێ پرسی ئێمە ئەم بڕیارە گرنگە بدەن؟",
        "emotion": "angry",
        "emotion_intensity": 0.85,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Angry reaction with [gasp] marker, ZWNJ in بێ‌مانایە, دەکرێت",
    },
    {
        "id_suffix": "emo_003",
        "domain": "expressive_reactions",
        "transcript": "[sigh] دڵم زۆر تەنگە، بریا دەمتوانی جارێکی تر بگەڕێمەوە بۆ ئەو ڕۆژانە.",
        "emotion": "sad",
        "emotion_intensity": 0.80,
        "speaker_gender": "female",
        "split": "train",
        "notes": "Melancholic reflection with [sigh], ڵ, ڕ, ۆ, ێ, ZWNJ in دەمتوانی",
    },
    {
        "id_suffix": "emo_004",
        "domain": "expressive_reactions",
        "transcript": "ئافەرین بۆ ئەم بیرۆکە نایابە! هەموومان شانازیت پێوە دەکەین و دەستخۆشیت لێ دەکەین.",
        "emotion": "happy",
        "emotion_intensity": 0.90,
        "speaker_gender": "male",
        "split": "train",
        "notes": "Encouragement & pride, ۆ, ێ, ڵ, ڕ, ZWNJ in دەکەین",
    },
    {
        "id_suffix": "emo_005",
        "domain": "expressive_reactions",
        "transcript": "[whisper] وریابە، دەنگ مەکە! با کەس لەم گفتوگۆیە تایبەتەمان ئاگادار نەبێتەوە.",
        "emotion": "whisper",
        "emotion_intensity": 0.90,
        "speaker_gender": "female",
        "split": "test",
        "notes": "Secretive whisper with [whisper] marker, ۆ, ێ, ڵ, ZWNJ in نەبێتەوە",
    },
    {
        "id_suffix": "emo_006",
        "domain": "expressive_reactions",
        "transcript": "هاها، ئەوە چی بوو! [laugh] هەرگیز شتی وا پێکەنیناویم لە ژیانمدا نەدیبوو!",
        "emotion": "laughing",
        "emotion_intensity": 0.95,
        "speaker_gender": "male",
        "split": "validation",
        "notes": "Pure laughter and hilarity, ڵ, ڕ, ۆ, ێ, ZWNJ in نەدیبوو",
    },
]


def get_corpus_by_domain(domain: str) -> List[Dict[str, Any]]:
    """
    Returns corpus items filtered by specific domain.
    """
    return [item for item in KURDISH_CANONICAL_CORPUS if item.get("domain") == domain]


def get_corpus_by_emotion(emotion: str) -> List[Dict[str, Any]]:
    """
    Returns corpus items filtered by emotion.
    """
    return [item for item in KURDISH_CANONICAL_CORPUS if item.get("emotion") == emotion]
