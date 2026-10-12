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
    hop_s, frame_len, hop_len = 0.01, int(sr * 0.03), int(sr * 0.01)
    n_frames = (len(audio) - frame_len) // hop_len + 1
    rms = np.array([np.sqrt(np.mean(audio[i * hop_len: i * hop_len + frame_len] ** 2)) for i in range(n_frames)], dtype=np.float32)
    is_silent = rms < silence_thresh
    pauses, in_pause, p_start, total_dur = [], False, 0, len(audio) / float(sr)
    for i in range(len(is_silent)):
        if is_silent[i] and not in_pause:
            in_pause, p_start = True, i
        elif not is_silent[i] and in_pause:
            in_pause = False
            dur = (i - p_start) * hop_s
            if dur >= min_pause_s:
                t_s, t_e = p_start * hop_s, i * hop_s
                if t_s > 0.3 and t_e < total_dur - 0.3:
                    pauses.append({'start': round(t_s, 3), 'end': round(t_e, 3), 'duration': round(dur, 3), 'midpoint': round((t_s + t_e) / 2.0, 3)})
    return pauses

def snap_to_zero_crossing_min_energy(audio, sr, center_s, search_radius_s=0.25):
    center_idx, radius_idx = int(center_s * sr), int(search_radius_s * sr)
    start_idx, end_idx = max(0, center_idx - radius_idx), min(len(audio) - 1, center_idx + radius_idx)
    if end_idx <= start_idx: return center_s
    sub, sub_hop, sub_win = audio[start_idx:end_idx], int(sr * 0.008), int(sr * 0.016)
    min_energy_val, best_idx = float('inf'), center_idx - start_idx
    for i in range(0, max(1, len(sub) - sub_win), sub_hop):
        energy = np.mean(sub[i:i + sub_win] ** 2)
        if energy < min_energy_val:
            min_energy_val, best_idx = energy, i + sub_win // 2
    zc_s, zc_e, zc_idx = max(0, best_idx - int(sr * 0.015)), min(len(sub) - 1, best_idx + int(sr * 0.015)), best_idx
    for i in range(zc_s, zc_e):
        if sub[i] * sub[i + 1] <= 0:
            zc_idx = i; break
    return round(float(start_idx + zc_idx) / float(sr), 3)

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

# --- 2. TRI-HYBRID DP ENGINE (Powerset Diarization + Silero VAD + FFmpeg Silence + Segment DP) ---
def detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_count):
    needed = expected_count - 1
    if needed <= 0:
        return build_engine_result("tri_hybrid", "Tri-Hybrid DP (Powerset Diarization + Silero VAD + FFmpeg)", [], total_dur, expected_count)

    try:
        vad_sess = get_silero_session()
        py_sess = get_pyannote_session()
        audio_16k = resample_to_16k(audio, sr)

        # 1. Silero VAD (Speech vs Silence at 32ms resolution)
        chunk_size = 512
        sr_t = np.array(16000, dtype=np.int64)
        state = np.zeros((2, 1, 128), dtype=np.float32)
        n_vad_chunks = len(audio_16k) // chunk_size
        vad_scores = np.zeros(n_vad_chunks, dtype=np.float32)
        for i in range(n_vad_chunks):
            chunk = audio_16k[i * chunk_size:(i + 1) * chunk_size].reshape(1, -1)
            out, state = vad_sess.run(None, {'input': chunk, 'state': state, 'sr': sr_t})
            vad_scores[i] = float(out[0][0])

        # 2. Pyannote 3.0 Powerset Marginals (16.875ms resolution)
        inp = audio_16k.reshape(1, 1, -1)
        py_logits = py_sess.run(None, {'input_values': inp})[0][0]
        step_s = 270.0 / 16000.0
        n_frames = len(py_logits)

        exp_l = np.exp(py_logits - np.max(py_logits, axis=-1, keepdims=True))
        probs = exp_l / np.sum(exp_l, axis=-1, keepdims=True)

        # 7-Class Powerset Marginals (0=none, 1=S0, 2=S1, 3=S2, 4=S01, 5=S02, 6=S12)
        m0 = probs[:, 1] + probs[:, 4] + probs[:, 5]
        m1 = probs[:, 2] + probs[:, 4] + probs[:, 6]
        m2 = probs[:, 3] + probs[:, 5] + probs[:, 6]
        p_sil = probs[:, 0]

        # Map Silero VAD onto Pyannote time frames
        frame_times = np.arange(n_frames) * step_s
        vad_idx = np.clip((frame_times * 16000 / chunk_size).astype(int), 0, n_vad_chunks - 1)
        vad_mapped = vad_scores[vad_idx]
        is_speech = (vad_mapped > 0.35) | ((m0 + m1 + m2 > 0.22) & (p_sil < 0.60))

        # 3. Global Speaker Anchoring: Turn 1 is Speaker 1 (Puck)
        speech_indices = np.where(is_speech)[0]
        init_speech_idx = speech_indices[:max(5, int(2.5 / step_s))] if len(speech_indices) > 0 else np.arange(min(30, n_frames))
        e0 = np.sum(m0[init_speech_idx])
        e1 = np.sum(m1[init_speech_idx])
        e2 = np.sum(m2[init_speech_idx])
        s1_slot = int(np.argmax([e0, e1, e2]))

        all_spk_idx = speech_indices if len(speech_indices) > 0 else np.arange(n_frames)
        energies = [float(np.sum(m0[all_spk_idx])), float(np.sum(m1[all_spk_idx])), float(np.sum(m2[all_spk_idx]))]
        energies[s1_slot] = -1.0
        s2_slot = int(np.argmax(energies))

        slots = [m0, m1, m2]
        raw_p1 = slots[s1_slot]
        raw_p2 = slots[s2_slot]

        denom = raw_p1 + raw_p2 + 1e-6
        p1_norm = np.clip((raw_p1 + 1e-4) / (denom + 2e-4), 0.001, 0.999)
        p2_norm = 1.0 - p1_norm

        # 4. Candidate Cut Extraction (Silero Gaps + RMS Pauses)
        raw_gaps = []
        vad_speech = vad_scores > 0.38
        in_sil = False
        sil_s = 0
        for i in range(len(vad_speech)):
            if not vad_speech[i] and not in_sil:
                in_sil = True
                sil_s = i
            elif vad_speech[i] and in_sil:
                in_sil = False
                dur = (i - sil_s) * (chunk_size / 16000.0)
                if dur >= 0.12:
                    raw_gaps.append({'start': sil_s * (chunk_size / 16000.0), 'end': i * (chunk_size / 16000.0), 'duration': dur})

        # Add RMS pauses
        rms_pauses = find_silence_pauses(audio, sr, min_pause_s=0.15)
        for rp in rms_pauses:
            if not any(abs(rp['midpoint'] - ((g['start'] + g['end']) / 2.0)) < 0.25 for g in raw_gaps):
                raw_gaps.append({'start': rp['start'], 'end': rp['end'], 'duration': rp['duration']})

        # If too few candidates, supplement with energy troughs in long segments
        if len(raw_gaps) < needed:
            target_step = total_dur / float(expected_count)
            for seg_idx in range(1, expected_count):
                center = seg_idx * target_step
                raw_gaps.append({'start': max(0.2, center - 0.2), 'end': min(total_dur - 0.2, center + 0.2), 'duration': 0.15})

        # Snap each gap to FFmpeg low-energy trough + zero crossing
        candidate_cuts = []
        for g in raw_gaps:
            mid = (g['start'] + g['end']) / 2.0
            sub_s = max(0, int(g['start'] * sr))
            sub_e = min(len(audio), int(g['end'] * sr))
            if sub_e > sub_s + int(sr * 0.03):
                sub_audio = audio[sub_s:sub_e]
                w = int(sr * 0.015)
                h = int(sr * 0.005)
                min_rms = float('inf')
                best_rel = len(sub_audio) // 2
                for idx in range(0, max(1, len(sub_audio) - w), h):
                    rms = np.sqrt(np.mean(sub_audio[idx:idx + w] ** 2))
                    if rms < min_rms:
                        min_rms = rms
                        best_rel = idx + w // 2
                zc_s = max(0, best_rel - int(sr * 0.01))
                zc_e = min(len(sub_audio) - 1, best_rel + int(sr * 0.01))
                best_zc = best_rel
                for zc in range(zc_s, zc_e):
                    if sub_audio[zc] * sub_audio[zc + 1] <= 0:
                        best_zc = zc
                        break
                cut_time = round((sub_s + best_zc) / float(sr), 3)
            else:
                cut_time = snap_to_zero_crossing_min_energy(audio, sr, mid)
            if 0.3 < cut_time < total_dur - 0.3:
                candidate_cuts.append({'time': cut_time, 'duration': g['duration'], 'start': g['start'], 'end': g['end']})

        # Sort and deduplicate candidates within 0.15s
        candidate_cuts.sort(key=lambda x: x['time'])
        unique_cands = []
        for c in candidate_cuts:
            if not any(abs(c['time'] - u['time']) < 0.15 for u in unique_cands):
                unique_cands.append(c)

        # Ensure candidates count is at least needed
        if len(unique_cands) < needed:
            even_cuts = [round((i + 1) * (total_dur / float(expected_count)), 3) for i in range(needed)]
            for ec in even_cuts:
                if not any(abs(ec - u['time']) < 0.3 for u in unique_cands):
                    unique_cands.append({'time': ec, 'duration': 0.15, 'start': ec - 0.075, 'end': ec + 0.075})
            unique_cands.sort(key=lambda x: x['time'])

        all_nodes = [0.0] + [u['time'] for u in unique_cands] + [round(total_dur, 3)]
        cand_meta = {u['time']: u for u in unique_cands}
        K = len(all_nodes)

        # 5. Cumulative Speech Likelihood Arrays for O(1) Segment Scoring
        cum_log1 = np.zeros(n_frames + 1, dtype=np.float64)
        cum_log2 = np.zeros(n_frames + 1, dtype=np.float64)
        cum_spk = np.zeros(n_frames + 1, dtype=np.int32)
        for f in range(n_frames):
            sp = 1 if is_speech[f] else 0
            cum_log1[f + 1] = cum_log1[f] + (np.log(p1_norm[f]) if sp else 0.0)
            cum_log2[f + 1] = cum_log2[f] + (np.log(p2_norm[f]) if sp else 0.0)
            cum_spk[f + 1] = cum_spk[f] + sp

        def seg_ll(i_node, j_node, expected_spk):
            t_s = all_nodes[i_node]
            t_e = all_nodes[j_node]
            dur = t_e - t_s
            if dur < 0.35: return -6000.0
            f_s = min(n_frames, int(t_s / step_s))
            f_e = min(n_frames, int(t_e / step_s))
            n_sp = cum_spk[f_e] - cum_spk[f_s]
            if n_sp < 3: return -3000.0
            return (cum_log1[f_e] - cum_log1[f_s]) if expected_spk == 1 else (cum_log2[f_e] - cum_log2[f_s])

        # 6. Candidate Cut Bonus: Local Identity Handoff + Soft Pause Prior
        def cut_bonus(cand_time, s_from, s_to):
            meta = cand_meta.get(cand_time, {})
            pause_dur = meta.get('duration', 0.15)
            f_cut = min(n_frames - 1, max(0, int(cand_time / step_s)))
            win_f = int(1.2 / step_s)
            l_frames = [f for f in range(max(0, f_cut - win_f), f_cut) if is_speech[f]]
            r_frames = [f for f in range(f_cut, min(n_frames, f_cut + win_f)) if is_speech[f]]
            if len(l_frames) >= 3 and len(r_frames) >= 3:
                p1_l = float(np.mean(p1_norm[l_frames]))
                p2_l = 1.0 - p1_l
                p1_r = float(np.mean(p1_norm[r_frames]))
                p2_r = 1.0 - p1_r
                h_trans = (p1_l * p2_r) if (s_from == 1 and s_to == 2) else ((p2_l * p1_r) if (s_from == 2 and s_to == 1) else 0.0)
                h_same = (p1_l * p1_r) + (p2_l * p2_r)
                handoff_score = 12.0 * (h_trans - h_same)
            else:
                handoff_score = 0.0
            pause_bonus = min(pause_dur, 1.5) * 3.5
            return handoff_score + pause_bonus

        # 7. Exact Constrained Segmentation Dynamic Programming O(M^2 * N)
        dp = np.full((expected_count + 1, K), -1e9, dtype=np.float64)
        parent = np.full((expected_count + 1, K), -1, dtype=np.int32)

        for j in range(1, K - (expected_count - 1)):
            dp[1, j] = seg_ll(0, j, 1)
            parent[1, j] = 0

        for k in range(2, expected_count + 1):
            exp_spk = 1 if (k % 2 != 0) else 2
            prev_spk = 2 if exp_spk == 1 else 1
            for j in range(k, K - (expected_count - k)):
                best_val = -1e9
                best_i = -1
                for i in range(k - 1, j):
                    if dp[k - 1, i] > -1e8:
                        c_time = all_nodes[i]
                        val = dp[k - 1, i] + seg_ll(i, j, exp_spk) + cut_bonus(c_time, prev_spk, exp_spk)
                        if val > best_val:
                            best_val = val
                            best_i = i
                dp[k, j] = best_val
                parent[k, j] = best_i

        # Backtrack chosen cut nodes
        chosen_indices = []
        curr = K - 1
        for k in range(expected_count, 1, -1):
            p = parent[k, curr]
            if p <= 0: break
            chosen_indices.append(p)
            curr = p
        chosen_indices.reverse()

        chosen_boundaries = []
        for idx in chosen_indices:
            c_time = all_nodes[idx]
            meta = cand_meta.get(c_time, {})
            chosen_boundaries.append({
                'start': meta.get('start', round(c_time - 0.1, 3)),
                'end': meta.get('end', round(c_time + 0.1, 3)),
                'duration': meta.get('duration', 0.2),
                'midpoint': c_time,
                'score': float(dp[expected_count, K - 1]),
                'is_handoff': True
            })

        chosen_boundaries.sort(key=lambda x: x['midpoint'])
        return build_engine_result("tri_hybrid", "Tri-Hybrid DP (Powerset Diarization + Silero VAD + FFmpeg)", chosen_boundaries, total_dur, expected_count)
    except Exception as e:
        return {"success": False, "error": f"Tri-Hybrid DP failed: {str(e)}"}

# --- 3. COMPARATIVE BENCHMARK SUITE ---
def compare_all_engines(audio_path, expected_count, paragraphs=None):
    from iterativeDetector import run_iterative_adaptive_slicing
    from pitchDetector import detect_pitch_f0_boundaries
    from crossoverDetector import detect_neural_crossover_boundaries
    audio, sr, total_dur = load_wav_pcm(audio_path)
    res_py = detect_pyannote_boundaries(audio, sr, total_dur, expected_count)
    res_pitch = detect_pitch_f0_boundaries(audio, sr, total_dur, expected_count)
    res_cross = detect_neural_crossover_boundaries(audio, sr, total_dur, expected_count)
    res_tri = detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_count)
    res_iter = run_iterative_adaptive_slicing(audio, sr, total_dur, expected_count, paragraphs)
    engines = {"pyannote": res_py, "pitch_f0": res_pitch, "neural_crossover": res_cross, "tri_hybrid": res_tri, "iterative_dp": res_iter}

    comparison_table = []
    needed = expected_count - 1
    for k in range(needed):
        b_py = res_py['boundaries'][k]['midpoint'] if k < len(res_py.get('boundaries', [])) else None
        b_pitch = res_pitch['boundaries'][k]['midpoint'] if k < len(res_pitch.get('boundaries', [])) else None
        b_cross = res_cross['boundaries'][k]['midpoint'] if k < len(res_cross.get('boundaries', [])) else None
        b_tri = res_tri['boundaries'][k]['midpoint'] if k < len(res_tri.get('boundaries', [])) else None
        b_iter = res_iter['boundaries'][k]['midpoint'] if k < len(res_iter.get('boundaries', [])) else None

        valid_cuts = [c for c in [b_py, b_pitch, b_cross, b_tri, b_iter] if c is not None]
        max_diff = round((max(valid_cuts) - min(valid_cuts)) * 1000, 1) if len(valid_cuts) > 1 else 0.0
        agreement = "PERFECT (<40ms)" if max_diff < 40 else ("ALIGNED (<150ms)" if max_diff < 150 else "DIVERGENT")

        comparison_table.append({
            "boundary": k + 1,
            "pyannote_cut_s": b_py,
            "pitch_f0_cut_s": b_pitch,
            "crossover_cut_s": b_cross,
            "tri_hybrid_cut_s": b_tri,
            "iterative_cut_s": b_iter,
            "max_spread_ms": max_diff,
            "agreement": agreement
        })

    return {
        "success": True,
        "engine": "compare_all",
        "description": "Multi-Engine Benchmark (Pyannote, Pitch F0, Crossover, Tri-Hybrid, Iterative)",
        "expectedCount": expected_count,
        "comparisonTable": comparison_table,
        "engines": engines,
        "totalDuration": round(total_dur, 3),
        "iterativeAttempts": res_iter.get('attempts', [])
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: python speakerDetector.py <audio_path> <expected_count> [--mode=pyannote|pitch_f0|neural_crossover|tri_hybrid|iterative_dp|all]"}))
        sys.exit(1)

    audio_file, expected_c = sys.argv[1], int(sys.argv[2])
    mode, paras = "all", None
    for arg in sys.argv[3:]:
        if arg.startswith("--mode="): mode = arg.split("=", 1)[1].strip().lower()
        elif arg.startswith("--paragraphs-file="):
            pf = arg.split("=", 1)[1].strip()
            if os.path.exists(pf):
                try:
                    with open(pf, 'r', encoding='utf-8') as f: paras = json.load(f)
                except Exception: paras = None

    if mode in ["all", "compare", "compare_all"]:
        result = compare_all_engines(audio_file, expected_c, paras)
    else:
        audio, sr, total_dur = load_wav_pcm(audio_file)
        if mode in ["pitch_f0", "pitch", "f0", "hz"]:
            from pitchDetector import detect_pitch_f0_boundaries
            result = detect_pitch_f0_boundaries(audio, sr, total_dur, expected_c)
        elif mode in ["neural_crossover", "crossover"]:
            from crossoverDetector import detect_neural_crossover_boundaries
            result = detect_neural_crossover_boundaries(audio, sr, total_dur, expected_c)
        elif mode in ["iterative_dp", "iterative", "try_try_try"]:
            from iterativeDetector import run_iterative_adaptive_slicing
            result = run_iterative_adaptive_slicing(audio, sr, total_dur, expected_c, paras)
        elif mode in ["tri_hybrid", "tri", "hybrid"]:
            result = detect_tri_hybrid_boundaries(audio, sr, total_dur, expected_c)
        else:
            result = detect_pyannote_boundaries(audio, sr, total_dur, expected_c)

    def np_json_default(o):
        if isinstance(o, (np.bool_, bool)): return bool(o)
        if isinstance(o, (np.integer, int)): return int(o)
        if isinstance(o, (np.floating, float)): return float(o)
        return o.tolist() if isinstance(o, np.ndarray) else str(o)

    print(json.dumps(result, default=np_json_default))
