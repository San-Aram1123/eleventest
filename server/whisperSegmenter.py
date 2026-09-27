import sys
import os
import json
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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python whisperSegmenter.py <audio_file> [expected_count] [--mode=markers|silence]"}))
        sys.exit(1)

    audio_file = sys.argv[1]
    expected = None
    mode = "silence"

    for arg in sys.argv[2:]:
        if arg.startswith("--mode="):
            mode = arg.split("=")[1].strip().lower()
        elif arg.isdigit():
            expected = int(arg)

    if mode == "markers":
        result = segment_with_markers(audio_file, expected)
    else:
        result = segment_sentences(audio_file, expected)

    print(json.dumps(result))


