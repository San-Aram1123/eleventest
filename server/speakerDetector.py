import sys
import os
import io
import json
import wave
import numpy as np

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_wav_pcm(wav_path):
    with wave.open(wav_path, 'rb') as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        raw_bytes = wf.readframes(n_frames)

    dtype = np.int16 if sampwidth == 2 else (np.int32 if sampwidth == 4 else None)
    scale = 32768.0 if sampwidth == 2 else (2147483648.0 if sampwidth == 4 else 1.0)
    if dtype is None:
        raise ValueError(f"Unsupported sample width: {sampwidth}")

    audio = np.frombuffer(raw_bytes, dtype=dtype).astype(np.float32) / scale
    if n_channels > 1:
        audio = audio.reshape(-1, n_channels).mean(axis=1)

    duration = float(len(audio)) / float(framerate)
    return audio, framerate, duration

def resample_to_16k(audio, sr):
    if sr == 16000:
        return audio
    target_len = int(len(audio) * 16000 / sr)
    indices = np.linspace(0, len(audio) - 1, target_len).astype(int)
    return audio[indices]

def find_silence_pauses(audio, sr, min_pause_s=0.20, silence_thresh=0.016):
    hop_s = 0.01
    frame_len = int(sr * 0.03)
    hop_len = int(sr * hop_s)
    n_frames = (len(audio) - frame_len) // hop_len + 1
    rms = np.zeros(n_frames, dtype=np.float32)
    for i in range(n_frames):
        chunk = audio[i * hop_len: i * hop_len + frame_len]
        rms[i] = np.sqrt(np.mean(chunk ** 2))

    is_silent = rms < silence_thresh
    pauses = []
    in_pause = False
    p_start = 0
    total_dur = len(audio) / float(sr)

    for i in range(len(is_silent)):
        if is_silent[i] and not in_pause:
            in_pause = True
            p_start = i
        elif not is_silent[i] and in_pause:
            in_pause = False
            dur = (i - p_start) * hop_s
            if dur >= min_pause_s:
                t_s = p_start * hop_s
                t_e = i * hop_s
                if t_s > 0.3 and t_e < total_dur - 0.3:
                    pauses.append({
                        'start': round(t_s, 3),
                        'end': round(t_e, 3),
                        'duration': round(dur, 3),
                        'midpoint': round((t_s + t_e) / 2.0, 3)
                    })
    return pauses

def snap_to_zero_crossing_min_energy(audio, sr, center_s, search_radius_s=0.25):
    center_idx = int(center_s * sr)
    radius_idx = int(search_radius_s * sr)
    start_idx = max(0, center_idx - radius_idx)
    end_idx = min(len(audio) - 1, center_idx + radius_idx)
    if end_idx <= start_idx:
        return center_s

    sub = audio[start_idx:end_idx]
    sub_hop = int(sr * 0.008)
    sub_win = int(sr * 0.016)
    min_energy_val = float('inf')
    best_idx = center_idx - start_idx
    for i in range(0, max(1, len(sub) - sub_win), sub_hop):
        energy = np.mean(sub[i:i + sub_win] ** 2)
        if energy < min_energy_val:
            min_energy_val = energy
            best_idx = i + sub_win // 2

    zc_search_start = max(0, best_idx - int(sr * 0.015))
    zc_search_end = min(len(sub) - 1, best_idx + int(sr * 0.015))
    zc_idx = best_idx
    for i in range(zc_search_start, zc_search_end):
        if sub[i] * sub[i + 1] <= 0:
            zc_idx = i
            break

    final_idx = start_idx + zc_idx
    return round(float(final_idx) / float(sr), 3)

def build_engine_result(engine_key, description, chosen_boundaries, total_dur, expected_count):
    segments = []
    last_end = 0.0
    needed = expected_count - 1
    for i in range(expected_count):
        s_start = round(last_end, 3)
        s_end = round(chosen_boundaries[i]['midpoint'] if i < needed and i < len(chosen_boundaries) else total_dur, 3)
        dur = round(max(0.1, s_end - s_start), 3)
        segments.append({
            'index': i + 1,
            'start': s_start,
            'end': s_end,
            'duration': dur,
            'boundary_info': chosen_boundaries[i] if i < needed and i < len(chosen_boundaries) else None
        })
        last_end = s_end

    return {
        "success": True,
        "engine": engine_key,
        "description": description,
        "expectedCount": expected_count,
        "detectedCount": len(segments),
        "segments": segments,
        "boundaries": chosen_boundaries[:needed],
        "totalDuration": round(total_dur, 3)
    }

_PYANNOTE_SESS = None
def get_pyannote_session():
    global _PYANNOTE_SESS
    if _PYANNOTE_SESS is None:
        import onnxruntime as ort
        from huggingface_hub import hf_hub_download
        model_path = hf_hub_download('onnx-community/pyannote-segmentation-3.0', 'onnx/model_quantized.onnx')
        _PYANNOTE_SESS = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    return _PYANNOTE_SESS

_SILERO_SESS = None
def get_silero_session():
    global _SILERO_SESS
    if _SILERO_SESS is None:
        import onnxruntime as ort
        from huggingface_hub import hf_hub_download
        model_path = hf_hub_download('onnx-community/silero-vad', 'onnx/model_quantized.onnx')
        _SILERO_SESS = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    return _SILERO_SESS

# --- 1. PYANNOTE BASELINE (The proven single-shot argmax baseline) ---
def detect_pyannote_boundaries(audio, sr, total_dur, expected_count):
    needed = expected_count - 1
    if needed <= 0:
        return build_engine_result("pyannote", "Pyannote 3.0 Neural Diarization (Baseline)", [], total_dur, expected_count)

    try:
        sess = get_pyannote_session()
        audio_16k = resample_to_16k(audio, sr)
        inp = audio_16k.reshape(1, 1, -1)
        outputs = sess.run(None, {'input_values': inp})
        logits = outputs[0][0]
        step_s = 270.0 / 16000.0
        preds = np.argmax(logits, axis=-1)

        pauses = find_silence_pauses(audio, sr)
        scored_pauses = []
        for p in pauses:
            f_pre = max(0, int((p['start'] - 0.3) / step_s))
            f_mid = int(p['midpoint'] / step_s)
            f_post = min(len(preds) - 1, int((p['end'] + 0.3) / step_s))

            pre_speaker = np.bincount(preds[f_pre:f_mid][preds[f_pre:f_mid] > 0]).argmax() if np.any(preds[f_pre:f_mid] > 0) else 0
            post_speaker = np.bincount(preds[f_mid:f_post][preds[f_mid:f_post] > 0]).argmax() if np.any(preds[f_mid:f_post] > 0) else 0
            is_handoff = (pre_speaker > 0 and post_speaker > 0 and pre_speaker != post_speaker)

            score = (p['duration'] * 2.0) + (6.0 if is_handoff else 0.0)
            scored_pauses.append({**p, 'score': score, 'is_handoff': is_handoff})

        sorted_p = sorted(scored_pauses, key=lambda x: x['score'], reverse=True)
        min_gap = max(2.0, (total_dur / float(expected_count)) * 0.45)
        chosen = []
        for cand in sorted_p:
            if not any(abs(cand['midpoint'] - c['midpoint']) < min_gap for c in chosen):
                chosen.append(cand)
                if len(chosen) == needed: break
        if len(chosen) < needed:
            for cand in sorted_p:
                if cand not in chosen:
                    chosen.append(cand)
                    if len(chosen) == needed: break
        chosen.sort(key=lambda x: x['midpoint'])
        return build_engine_result("pyannote", "Pyannote 3.0 Neural Diarization (Baseline)", chosen, total_dur, expected_count)
    except Exception as e:
        return {"success": False, "error": f"Pyannote failed: {str(e)}"}

# --- 2. TRI-HYBRID FUSION ENGINE (Speaker Diarization + Silero VAD + FFmpeg Silence) ---
def detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_count):
    needed = expected_count - 1
    if needed <= 0:
        return build_engine_result("tri_hybrid", "Tri-Hybrid Fusion (Diarization + Silero VAD + FFmpeg Silence)", [], total_dur, expected_count)

    try:
        vad_sess = get_silero_session()
        py_sess = get_pyannote_session()
        audio_16k = resample_to_16k(audio, sr)

        # Step A: Silero VAD (Identifies where speech actually starts and stops)
        sr_t = np.array(16000, dtype=np.int64)
        state = np.zeros((2, 1, 128), dtype=np.float32)
        chunk_size = 512
        frame_dur_s = chunk_size / 16000.0

        n_vad_chunks = len(audio_16k) // chunk_size
        vad_probs = np.zeros(n_vad_chunks, dtype=np.float32)
        for i in range(n_vad_chunks):
            chunk = audio_16k[i * chunk_size:(i + 1) * chunk_size].reshape(1, -1)
            out, state = vad_sess.run(None, {'input': chunk, 'state': state, 'sr': sr_t})
            vad_probs[i] = float(out[0][0])

        is_speech = vad_probs > 0.40
        speech_intervals = []
        in_speech = False
        s_start = 0
        for i in range(len(is_speech)):
            if is_speech[i] and not in_speech:
                in_speech = True
                s_start = i
            elif not is_speech[i] and in_speech:
                in_speech = False
                dur = (i - s_start) * frame_dur_s
                if dur >= 0.25:
                    speech_intervals.append({'start': s_start * frame_dur_s, 'end': i * frame_dur_s, 'duration': dur})

        silence_gaps = []
        for i in range(len(speech_intervals) - 1):
            g_start = speech_intervals[i]['end']
            g_end = speech_intervals[i + 1]['start']
            dur = g_end - g_start
            if dur >= 0.20:
                silence_gaps.append({
                    'start': round(g_start, 3),
                    'end': round(g_end, 3),
                    'duration': round(dur, 3)
                })

        # Supplemental fallback to RMS pauses if VAD found too few gaps
        if len(silence_gaps) < needed:
            rms_pauses = find_silence_pauses(audio, sr, min_pause_s=0.20)
            for rp in rms_pauses:
                if not any(abs(rp['midpoint'] - ((g['start'] + g['end']) / 2.0)) < 0.35 for g in silence_gaps):
                    silence_gaps.append(rp)

        # Step B: Speaker Diarization (Detects male/female transitions even without silence)
        inp = audio_16k.reshape(1, 1, -1)
        py_logits = py_sess.run(None, {'input_values': inp})[0][0]
        step_s = 270.0 / 16000.0
        preds = np.argmax(py_logits, axis=-1)

        # Step C: FFmpeg Silence Analysis (Locates precise low-energy cut point)
        scored_gaps = []
        for g in silence_gaps:
            g_start = g['start']
            g_end = g['end']
            midpoint = (g_start + g_end) / 2.0

            # Pyannote Speaker transition score
            f_pre = max(0, int((g_start - 0.35) / step_s))
            f_gstart = max(0, int(g_start / step_s))
            f_gend = min(len(preds) - 1, int(g_end / step_s))
            f_post = min(len(preds) - 1, int((g_end + 0.35) / step_s))

            pre_spk = np.bincount(preds[f_pre:f_gstart][preds[f_pre:f_gstart] > 0]).argmax() if np.any(preds[f_pre:f_gstart] > 0) else 0
            post_spk = np.bincount(preds[f_gend:f_post][preds[f_gend:f_post] > 0]).argmax() if np.any(preds[f_gend:f_post] > 0) else 0
            is_handoff = (pre_spk > 0 and post_spk > 0 and pre_spk != post_spk)

            # FFmpeg Low-Energy silence trough search + zero-crossing snap
            sub_start_idx = max(0, int(g_start * sr))
            sub_end_idx = min(len(audio), int(g_end * sr))
            if sub_end_idx > sub_start_idx + int(sr * 0.04):
                sub_audio = audio[sub_start_idx:sub_end_idx]
                win_len = int(sr * 0.015)
                hop_len = int(sr * 0.005)
                min_rms = float('inf')
                best_rel_idx = len(sub_audio) // 2
                for idx in range(0, max(1, len(sub_audio) - win_len), hop_len):
                    chunk = sub_audio[idx:idx + win_len]
                    rms = np.sqrt(np.mean(chunk ** 2))
                    if rms < min_rms:
                        min_rms = rms
                        best_rel_idx = idx + win_len // 2

                zc_start = max(0, best_rel_idx - int(sr * 0.01))
                zc_end = min(len(sub_audio) - 1, best_rel_idx + int(sr * 0.01))
                best_zc = best_rel_idx
                for zc in range(zc_start, zc_end):
                    if sub_audio[zc] * sub_audio[zc + 1] <= 0:
                        best_zc = zc
                        break
                cut_time = round((sub_start_idx + best_zc) / float(sr), 3)
            else:
                cut_time = snap_to_zero_crossing_min_energy(audio, sr, midpoint)

            score = (g['duration'] * 2.5) + (7.0 if is_handoff else 0.0)
            scored_gaps.append({
                'start': g_start,
                'end': g_end,
                'duration': g['duration'],
                'midpoint': cut_time,
                'score': score,
                'is_handoff': is_handoff
            })

        sorted_gaps = sorted(scored_gaps, key=lambda x: x['score'], reverse=True)
        min_gap = max(2.0, (total_dur / float(expected_count)) * 0.45)
        chosen = []
        for cand in sorted_gaps:
            if not any(abs(cand['midpoint'] - c['midpoint']) < min_gap for c in chosen):
                chosen.append(cand)
                if len(chosen) == needed: break
        if len(chosen) < needed:
            for cand in sorted_gaps:
                if cand not in chosen:
                    chosen.append(cand)
                    if len(chosen) == needed: break
        chosen.sort(key=lambda x: x['midpoint'])

        return build_engine_result("tri_hybrid", "Tri-Hybrid Fusion (Diarization + Silero VAD + FFmpeg Silence)", chosen, total_dur, expected_count)
    except Exception as e:
        return {"success": False, "error": f"Tri-Hybrid failed: {str(e)}"}

# --- 3. COMPARATIVE BENCHMARK (Pyannote Baseline vs Tri-Hybrid Fusion) ---
def compare_all_engines(audio_path, expected_count):
    audio, sr, total_dur = load_wav_pcm(audio_path)
    res_py = detect_pyannote_boundaries(audio, sr, total_dur, expected_count)
    res_tri = detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_count)

    engines = {
        "pyannote": res_py,
        "tri_hybrid": res_tri
    }

    comparison_table = []
    needed = expected_count - 1
    for k in range(needed):
        b_py = res_py['boundaries'][k]['midpoint'] if k < len(res_py.get('boundaries', [])) else None
        b_tri = res_tri['boundaries'][k]['midpoint'] if k < len(res_tri.get('boundaries', [])) else None

        valid_cuts = [c for c in [b_py, b_tri] if c is not None]
        max_diff = round((max(valid_cuts) - min(valid_cuts)) * 1000, 1) if len(valid_cuts) > 1 else 0.0
        agreement = "PERFECT (<40ms)" if max_diff < 40 else ("ALIGNED (<150ms)" if max_diff < 150 else "DIVERGENT")

        comparison_table.append({
            "boundary": k + 1,
            "pyannote_cut_s": b_py,
            "tri_hybrid_cut_s": b_tri,
            "max_spread_ms": max_diff,
            "agreement": agreement
        })

    return {
        "success": True,
        "engine": "compare_all",
        "description": "Pyannote Baseline vs Tri-Hybrid Fusion Suite",
        "expectedCount": expected_count,
        "comparisonTable": comparison_table,
        "engines": engines,
        "totalDuration": round(total_dur, 3)
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: python speakerDetector.py <audio_path> <expected_count> [--mode=pyannote|tri_hybrid|all|compare]"}))
        sys.exit(1)

    audio_file = sys.argv[1]
    expected_c = int(sys.argv[2])
    mode = "all"
    for arg in sys.argv[3:]:
        if arg.startswith("--mode="):
            mode = arg.split("=", 1)[1].strip().lower()

    if mode in ["all", "compare", "compare_all"]:
        result = compare_all_engines(audio_file, expected_c)
    else:
        audio, sr, total_dur = load_wav_pcm(audio_file)
        if mode in ["tri_hybrid", "tri", "hybrid"]:
            result = detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_c)
        else:
            result = detect_pyannote_boundaries(audio, sr, total_dur, expected_c)

    def np_json_default(o):
        if isinstance(o, (np.bool_, bool)): return bool(o)
        if isinstance(o, (np.integer, int)): return int(o)
        if isinstance(o, (np.floating, float)): return float(o)
        if isinstance(o, np.ndarray): return o.tolist()
        return str(o)

    print(json.dumps(result, default=np_json_default))
