import sys
import os
import json
import re
import difflib
from faster_whisper import WhisperModel

def group_chunks_into_sentences(raw_chunks, expected_count):
    if not raw_chunks:
        return []
    
    if expected_count is None or expected_count <= 0:
        return raw_chunks

    if len(raw_chunks) < expected_count:
        return None  # Gemini dropped takes
    
    if expected_count == 1:
        return [{
            "start": raw_chunks[0]["start"],
            "end": raw_chunks[-1]["end"],
            "text": " ".join(c["text"] for c in raw_chunks).strip()
        }]

    if len(raw_chunks) == expected_count:
        return raw_chunks

    # If raw_chunks > expected_count, commas/breaths broke a sentence into sub-chunks.
    # Find the N-1 largest gaps between chunks to identify inter-sentence transitions.
    gaps = []
    for i in range(len(raw_chunks) - 1):
        gap_dur = raw_chunks[i + 1]["start"] - raw_chunks[i]["end"]
        gaps.append((gap_dur, i))

    sorted_gaps = sorted(gaps, key=lambda x: x[0], reverse=True)
    split_indices = sorted([g[1] for g in sorted_gaps[:expected_count - 1]])

    sentences = []
    start_chunk = 0
    for split_idx in split_indices:
        s_start = raw_chunks[start_chunk]["start"]
        s_end = raw_chunks[split_idx]["end"]
        s_text = " ".join(c["text"] for c in raw_chunks[start_chunk:split_idx + 1]).strip()
        sentences.append({"start": s_start, "end": s_end, "text": s_text})
        start_chunk = split_idx + 1

    s_start = raw_chunks[start_chunk]["start"]
    s_end = raw_chunks[-1]["end"]
    s_text = " ".join(c["text"] for c in raw_chunks[start_chunk:]).strip()
    sentences.append({"start": s_start, "end": s_end, "text": s_text})

    # Validate resulting sentence durations: none can be extreme outlier (> 12.0s or < 0.60s)
    if any((s["end"] - s["start"] > 12.0 or s["end"] - s["start"] < 0.60) for s in sentences):
        return None

    return sentences

def segment_sentences(audio_path, expected_count=None):
    if not os.path.exists(audio_path):
        return {"success": False, "error": f"Audio file not found: {audio_path}"}

    # Multilingual 'tiny' model handles non-English Kurdish phonetics accurately
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        audio_path,
        beam_size=3,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=300, speech_pad_ms=80, threshold=0.35)
    )

    raw_chunks = []
    for s in segments:
        raw_chunks.append({
            "start": round(s.start, 3),
            "end": round(s.end, 3),
            "text": s.text.strip()
        })

    merged_sentences = group_chunks_into_sentences(raw_chunks, expected_count)

    # Fallback: if VAD truncated quiet whisper takes, re-run with vad_filter=False
    if (merged_sentences is None or (expected_count and len(merged_sentences) != expected_count)) and expected_count and len(raw_chunks) < expected_count:
        segments_raw, _ = model.transcribe(audio_path, beam_size=1, vad_filter=False)
        raw_chunks = []
        for s in segments_raw:
            raw_chunks.append({
                "start": round(s.start, 3),
                "end": round(s.end, 3),
                "text": s.text.strip()
            })
        merged_sentences = group_chunks_into_sentences(raw_chunks, expected_count)

    if merged_sentences is None or (expected_count and len(merged_sentences) != expected_count):
        return {
            "success": False,
            "error": f"Expected {expected_count} sentences, but detected {len(raw_chunks)} raw segments that could not be partitioned safely. Gemini dropped or merged takes.",
            "expectedCount": expected_count,
            "detectedCount": len(raw_chunks),
            "segments": []
        }

    # Add safe 80ms padding without overlapping adjacent sentences
    padded_segments = []
    for idx, s in enumerate(merged_sentences):
        prev_end = padded_segments[idx - 1]["end"] if idx > 0 else 0.0
        start = max(prev_end, round(s["start"] - 0.08, 3))
        end = round(s["end"] + 0.08, 3)
        padded_segments.append({
            "index": idx + 1,
            "start": max(0.0, start),
            "end": end,
            "duration": round(end - max(0.0, start), 3),
            "text": s["text"]
        })

    return {
        "success": True,
        "error": None,
        "expectedCount": expected_count,
        "detectedCount": len(padded_segments),
        "segments": padded_segments,
        "strategy": "whisper_vad"
    }

YEH = r'[\u064a\u06cc\u06ce\u0649يیێى]'
KAF = r'[كک]'
WAW = r'[وۆ\u0648\u06c6]'

NUM_PATTERNS = [
    rf'(?:one|^1$|^(?:i|I)\b|وان|ون|[اأإ{YEH}][\u064e\u064f\u0650]?{KAF}|يك|ايك|اک)',
    rf'(?:two|^2$|^(?:ii|II)\b|تو|د{WAW}|ادو|دویم|دویەم)',
    rf'(?:three|^3$|^(?:iii|III)\b|تری|ثری|س{YEH}|اسي)',
    rf'(?:four|^4$|^(?:iv|IV)\b|فور|چ{WAW}[ا]?ر|اشوار|چهار)',
    rf'(?:five|^5$|^(?:v|V)\b|فایف|فایو|پ{YEH}?ن[جچ]|پنج|ابينز|بينج)',
    rf'(?:six|^6$|^(?:vi|VI)\b|سکس|ش[ەا]?ش|شش|اشاش)',
    rf'(?:seven|^7$|^(?:vii|VII)\b|ح[ەا]?وت|حوت|هفت)',
    rf'(?:eight|^8$|^(?:viii|VIII)\b|ه[ەا]?شت|هشت)',
    rf'(?:nine|^9$|^(?:ix|IX)\b|ن{WAW}|نه|نو)',
    rf'(?:ten|^10$|^(?:x|X)\b|د[ەا]|ده)'
]

def segment_with_markers(audio_path, expected_count):
    if not os.path.exists(audio_path):
        return {"success": False, "error": f"Audio file not found: {audio_path}"}

    import re
    # small or tiny model with word_timestamps
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, word_timestamps=True)
    
    words = []
    for s in segments:
        if s.words:
            for w in s.words:
                words.append({
                    "word": w.word.strip(),
                    "start": round(w.start, 3),
                    "end": round(w.end, 3)
                })

    if not words:
        return {"success": False, "error": "No speech detected in audio file"}

    # Search for sequential markers
    found_markers = []
    total_target = expected_count or 6

    for i, w in enumerate(words):
        clean_w = w["word"].strip().rstrip('.:,')
        is_marker_prefix = bool(re.search(r'^(?:marker|mark|number|مارک|مارکر|جمار|شمار|ژمار)', clean_w, re.I))

        matched_idx = None
        marker_end = w["end"]

        if is_marker_prefix and i + 1 < len(words):
            next_w = words[i + 1]["word"].strip().rstrip('.:,')
            for idx, pat in enumerate(NUM_PATTERNS):
                if re.search(pat, next_w, re.I):
                    matched_idx = idx + 1
                    marker_end = words[i + 1]["end"]
                    break

        if matched_idx is None:
            for idx, pat in enumerate(NUM_PATTERNS):
                if re.search(rf'(?:marker|mark|number|مارک|مارکر|جمار|شمار|ژمار)[\s\-_:]*{pat}', clean_w, re.I):
                    matched_idx = idx + 1
                    marker_end = w["end"]
                    break

        if matched_idx is not None:
            if not any(m["index"] == matched_idx for m in found_markers):
                if not found_markers or w["start"] > found_markers[-1]["start"]:
                    found_markers.append({
                        "index": matched_idx,
                        "start": w["start"],
                        "end": marker_end
                    })
                    if len(found_markers) >= total_target:
                        break

    if len(found_markers) < total_target:
        missing = [idx + 1 for idx in range(total_target) if not any(m["index"] == idx + 1 for m in found_markers)]
        return {
            "success": False,
            "error": f"Found {len(found_markers)} of {total_target} spoken markers. Missing: {missing}.",
            "expectedCount": total_target,
            "detectedCount": len(found_markers),
            "foundMarkers": found_markers
        }

    # Build segments excluding marker audio with 150ms safety buffer
    total_dur = round(info.duration, 3) if hasattr(info, 'duration') and info.duration else words[-1]["end"]
    segments_out = []
    for i in range(total_target):
        m = found_markers[i]
        # Sentence starts 150ms after the marker finishes to eliminate any marker bleed
        s_start = round(m["end"] + 0.15, 3)
        # Sentence ends 150ms before the next marker begins (or at total duration)
        s_end = round(found_markers[i + 1]["start"] - 0.15, 3) if i < total_target - 1 else total_dur
        dur = max(0.1, round(s_end - s_start, 3))

        segments_out.append({
            "index": i + 1,
            "start": round(s_start, 3),
            "end": round(s_end, 3),
            "duration": dur,
            "marker_info": {
                "marker_start": m["start"],
                "marker_end": m["end"]
            }
        })

    return {
        "success": True,
        "error": None,
        "expectedCount": total_target,
        "detectedCount": len(segments_out),
        "segments": segments_out,
        "confidence": 1.0,
        "strategy": "spoken_markers"
    }

def normalize_kurdish_token(w):
    if not w:
        return ""
    w = w.lower()
    # Normalize Arabic/Kurdish letter variants
    w = re.sub(r'[\u064a\u0649\u06cc\u06ce]', 'ی', w)
    w = re.sub(r'[\u0643]', 'ک', w)
    w = re.sub(r'[\u0629]', 'ە', w)
    w = re.sub(r'[\u200c\u200b\u0640]', '', w)
    w = re.sub(r'[\u064b-\u065f]', '', w)
    w = re.sub(r'[^\w\s]', '', w)
    return w.strip()

def segment_kurdish_alignment(audio_path, sentences, expected_count=None):
    if not os.path.exists(audio_path):
        return {"success": False, "error": f"Audio file not found: {audio_path}"}
    if not sentences or len(sentences) == 0:
        return {"success": False, "error": "No reference sentences provided for Kurdish alignment"}

    target_count = expected_count or len(sentences)

    # Use small model with int8 quantization on CPU for robust word alignment
    model = WhisperModel("small", device="cpu", compute_type="int8")

    # Kurdish prompt biasing ensures vocabulary and orthography are prioritized
    prompt_context = " ".join(sentences)[:600]
    segments, info = model.transcribe(
        audio_path,
        word_timestamps=True,
        initial_prompt=prompt_context,
        vad_filter=False
    )

    words = []
    for s in segments:
        if s.words:
            for w in s.words:
                cleaned_word = w.word.strip()
                if cleaned_word:
                    words.append({
                        "word": cleaned_word,
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "prob": round(getattr(w, 'probability', 1.0), 3)
                    })

    if not words:
        return {"success": False, "error": "No speech detected in audio file"}

    total_dur = round(info.duration, 3) if hasattr(info, 'duration') and info.duration else words[-1]["end"]

    # Flatten reference tokens and track sentence mapping
    all_ref_tokens = []
    token_to_sent = []
    sent_tokens = []
    for s_idx, s in enumerate(sentences):
        tokens_in_s = [normalize_kurdish_token(w) for w in s.split() if normalize_kurdish_token(w)]
        sent_tokens.append(tokens_in_s)
        for tok in tokens_in_s:
            all_ref_tokens.append(tok)
            token_to_sent.append(s_idx)

    hyp_tokens = [normalize_kurdish_token(w["word"]) for w in words]

    # Global sequence matcher for exact sequential matches
    matcher = difflib.SequenceMatcher(None, all_ref_tokens, hyp_tokens)
    blocks = matcher.get_matching_blocks()

    sent_matches = {i: [] for i in range(len(sentences))}
    for b in blocks:
        for offset in range(b.size):
            ref_idx = b.a + offset
            hyp_idx = b.b + offset
            s_idx = token_to_sent[ref_idx]
            sent_matches[s_idx].append(hyp_idx)

    # Monotonic fallback/expansion for any sentence with low or missing matches
    for s_idx in range(len(sentences)):
        if not sent_matches[s_idx]:
            prev_max = max(sent_matches[s_idx - 1]) if (s_idx > 0 and sent_matches[s_idx - 1]) else -1
            next_min = min(sent_matches[s_idx + 1]) if (s_idx < len(sentences) - 1 and sent_matches[s_idx + 1]) else len(hyp_tokens)
            for h_idx in range(prev_max + 1, next_min):
                ht = hyp_tokens[h_idx]
                if not ht:
                    continue
                for rt in sent_tokens[s_idx]:
                    if difflib.SequenceMatcher(None, rt, ht).ratio() >= 0.55:
                        sent_matches[s_idx].append(h_idx)
                        break

    # Verify every sentence was matched
    missing_indices = [i + 1 for i in range(len(sentences)) if not sent_matches[i]]
    if missing_indices:
        return {
            "success": False,
            "error": f"Failed to align {len(missing_indices)} sentence(s) in audio (Sentence(s) #{missing_indices}). Gemini dropped or merged takes.",
            "expectedCount": len(sentences),
            "detectedCount": len(sentences) - len(missing_indices),
            "missingSentences": missing_indices
        }

    # Resolve monotonic boundary timestamps with acoustic safety buffers
    segments_out = []
    last_end_cut = 0.0

    for s_idx in range(len(sentences)):
        matches = sorted(set(sent_matches[s_idx]))
        start_w = words[matches[0]]
        end_w = words[matches[-1]]

        w_start = start_w["start"]
        w_end = end_w["end"]

        # Inter-sentence gap spacing
        prev_w_end = words[max(sent_matches[s_idx - 1])]["end"] if s_idx > 0 else 0.0
        next_w_start = words[min(sent_matches[s_idx + 1])]["start"] if s_idx < len(sentences) - 1 else total_dur

        pre_gap = max(0.0, w_start - prev_w_end)
        post_gap = max(0.0, next_w_start - w_end)

        start_pad = min(0.12, pre_gap * 0.4)
        end_pad = min(0.15, post_gap * 0.4)

        seg_start = round(max(last_end_cut, w_start - start_pad), 3)
        seg_end = round(min(next_w_start - 0.05, w_end + end_pad), 3)

        if seg_end <= seg_start:
            seg_end = round(seg_start + 0.6, 3)

        dur = round(seg_end - seg_start, 3)
        last_end_cut = seg_end

        segments_out.append({
            "index": s_idx + 1,
            "start": seg_start,
            "end": seg_end,
            "duration": dur,
            "word_range": {
                "start_word": start_w["word"],
                "end_word": end_w["word"],
                "start_t": w_start,
                "end_t": w_end
            },
            "matched_word_count": len(matches),
            "total_sentence_tokens": len(sent_tokens[s_idx])
        })

    return {
        "success": True,
        "error": None,
        "expectedCount": len(sentences),
        "detectedCount": len(segments_out),
        "segments": segments_out,
        "confidence": 1.0,
        "strategy": "kurdish_align"
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python whisperSegmenter.py <audio_file> [expected_count] [--mode=markers|silence|kurdish_align] [--sentences-file=path]"}))
        sys.exit(1)

    audio_file = sys.argv[1]
    expected = None
    mode = "silence"
    sentences = []

    for arg in sys.argv[2:]:
        if arg.startswith("--mode="):
            mode = arg.split("=")[1].strip().lower()
        elif arg.startswith("--sentences-file="):
            s_file = arg.split("=", 1)[1].strip()
            if os.path.exists(s_file):
                with open(s_file, "r", encoding="utf-8") as f:
                    sentences = json.load(f)
        elif arg.isdigit():
            expected = int(arg)

    if mode == "kurdish_align":
        result = segment_kurdish_alignment(audio_file, sentences, expected)
    elif mode == "markers":
        result = segment_with_markers(audio_file, expected)
    else:
        result = segment_sentences(audio_file, expected)

    print(json.dumps(result))


