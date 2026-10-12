import os
import json
import numpy as np

def calculate_duration_targets(total_dur, paragraphs, expected_count):
    if not paragraphs or len(paragraphs) != expected_count:
        # Uniform expectation if no paragraphs provided
        turn_dur = total_dur / float(expected_count)
        return [{'index': i + 1, 'expected_dur': round(turn_dur, 2), 'min_dur': round(turn_dur * 0.45, 2), 'max_dur': round(turn_dur * 1.65, 2), 'chars': 0} for i in range(expected_count)]

    char_counts = [max(1, len(str(p).strip())) for p in paragraphs]
    total_chars = sum(char_counts)
    pause_allowance = 1.2 * max(0, expected_count - 1)
    speech_pool = max(float(expected_count), total_dur - pause_allowance)

    targets = []
    for i in range(expected_count):
        prop = float(char_counts[i]) / float(total_chars)
        exp_d = round((prop * speech_pool) + (1.2 if i < expected_count - 1 else 0.5), 2)
        # Realistic tolerance: between 45% and 165% of expected duration, min 0.8s
        min_d = round(max(0.8, exp_d * 0.45), 2)
        max_d = round(min(total_dur - 0.5, exp_d * 1.65), 2)
        targets.append({
            'index': i + 1,
            'expected_dur': exp_d,
            'min_dur': min_d,
            'max_dur': max_d,
            'chars': char_counts[i]
        })
    return targets

def evaluate_segment_plausibility(segments, targets):
    violations = []
    total_error = 0.0
    for i, seg in enumerate(segments):
        dur = seg['duration']
        tgt = targets[i] if i < len(targets) else None
        if not tgt: continue
        diff = abs(dur - tgt['expected_dur'])
        total_error += diff
        if dur < tgt['min_dur']:
            violations.append(f"Line {i + 1} ({dur:.2f}s) is shorter than realistic minimum ({tgt['min_dur']:.2f}s) - likely a breath pause cut.")
        elif dur > tgt['max_dur']:
            violations.append(f"Line {i + 1} ({dur:.2f}s) exceeds realistic maximum ({tgt['max_dur']:.2f}s) - likely swallowed next speaker.")

    is_plausible = len(violations) == 0
    avg_diff = total_error / float(len(segments)) if segments else 0.0
    score = max(10, min(100, int(100.0 - (len(violations) * 22.0) - (avg_diff * 4.0))))
    return is_plausible, violations, score

def run_iterative_adaptive_slicing(audio, sr, total_dur, expected_count, paragraphs=None):
    from speakerDetector import (
        get_silero_session, get_pyannote_session, resample_to_16k,
        find_silence_pauses, snap_to_zero_crossing_min_energy, build_engine_result
    )

    needed = expected_count - 1
    if needed <= 0:
        res = build_engine_result("iterative_dp", "Iterative Adaptive Loop (Duration-Targeted)", [], total_dur, expected_count)
        res['attempts'] = []
        return res

    targets = calculate_duration_targets(total_dur, paragraphs, expected_count)
    audio_16k = resample_to_16k(audio, sr)
    chunk_size = 512
    sr_t = np.array(16000, dtype=np.int64)

    # 1. Silero VAD
    vad_sess = get_silero_session()
    state = np.zeros((2, 1, 128), dtype=np.float32)
    n_vad_chunks = len(audio_16k) // chunk_size
    vad_scores = np.zeros(n_vad_chunks, dtype=np.float32)
    for i in range(n_vad_chunks):
        chunk = audio_16k[i * chunk_size:(i + 1) * chunk_size].reshape(1, -1)
        out, state = vad_sess.run(None, {'input': chunk, 'state': state, 'sr': sr_t})
        vad_scores[i] = float(out[0][0])

    # 2. Pyannote 3.0 Powerset Marginals
    py_sess = get_pyannote_session()
    inp = audio_16k.reshape(1, 1, -1)
    py_logits = py_sess.run(None, {'input_values': inp})[0][0]
    step_s = 270.0 / 16000.0
    n_frames = len(py_logits)

    exp_l = np.exp(py_logits - np.max(py_logits, axis=-1, keepdims=True))
    probs = exp_l / np.sum(exp_l, axis=-1, keepdims=True)
    m0 = probs[:, 1] + probs[:, 4] + probs[:, 5]
    m1 = probs[:, 2] + probs[:, 4] + probs[:, 6]
    m2 = probs[:, 3] + probs[:, 5] + probs[:, 6]
    p_sil = probs[:, 0]

    frame_times = np.arange(n_frames) * step_s
    vad_idx = np.clip((frame_times * 16000 / chunk_size).astype(int), 0, n_vad_chunks - 1)
    is_speech = (vad_scores[vad_idx] > 0.35) | ((m0 + m1 + m2 > 0.22) & (p_sil < 0.60))

    # Turn 1 speaker anchoring
    speech_indices = np.where(is_speech)[0]
    init_speech = speech_indices[:max(5, int(2.5 / step_s))] if len(speech_indices) > 0 else np.arange(min(30, n_frames))
    s1_slot = int(np.argmax([np.sum(m0[init_speech]), np.sum(m1[init_speech]), np.sum(m2[init_speech])]))
    all_spk = speech_indices if len(speech_indices) > 0 else np.arange(n_frames)
    energies = [float(np.sum(m0[all_spk])), float(np.sum(m1[all_spk])), float(np.sum(m2[all_spk]))]
    energies[s1_slot] = -1.0
    s2_slot = int(np.argmax(energies))

    slots = [m0, m1, m2]
    denom = slots[s1_slot] + slots[s2_slot] + 1e-6
    p1_norm = np.clip((slots[s1_slot] + 1e-4) / (denom + 2e-4), 0.001, 0.999)
    p2_norm = 1.0 - p1_norm

    # Cumulative log-likelihoods
    cum_log1, cum_log2, cum_spk = np.zeros(n_frames + 1), np.zeros(n_frames + 1), np.zeros(n_frames + 1, dtype=int)
    for f in range(n_frames):
        sp = 1 if is_speech[f] else 0
        cum_log1[f + 1] = cum_log1[f] + (np.log(p1_norm[f]) if sp else 0.0)
        cum_log2[f + 1] = cum_log2[f] + (np.log(p2_norm[f]) if sp else 0.0)
        cum_spk[f + 1] = cum_spk[f] + sp

    # Iterative strategies
    STRATEGIES = [
        {"name": "Standard Tri-Hybrid Acoustic DP", "min_pause": 0.12, "breath_pen": 12.0, "dur_lambda": 0.0},
        {"name": "Breath-Pause Suppression (min_pause=0.22s, penalty=22.0)", "min_pause": 0.22, "breath_pen": 22.0, "dur_lambda": 1.5},
        {"name": "Elastic Duration-Prior DP Guided Search (lambda=6.0)", "min_pause": 0.15, "breath_pen": 18.0, "dur_lambda": 6.0},
        {"name": "Targeted Localized Window DP (lambda=16.0)", "min_pause": 0.12, "breath_pen": 24.0, "dur_lambda": 16.0}
    ]

    attempts_log = []
    best_attempt = None
    best_score = -1

    for attempt_idx, strat in enumerate(STRATEGIES):
        # Extract candidate gaps
        raw_gaps = []
        in_sil, sil_s = False, 0
        vad_speech = vad_scores > 0.38
        for i in range(len(vad_speech)):
            if not vad_speech[i] and not in_sil:
                in_sil, sil_s = True, i
            elif vad_speech[i] and in_sil:
                in_sil = False
                dur = (i - sil_s) * (chunk_size / 16000.0)
                if dur >= strat['min_pause']:
                    raw_gaps.append({'start': sil_s * (chunk_size / 16000.0), 'end': i * (chunk_size / 16000.0), 'duration': dur})

        # Add RMS pauses
        for rp in find_silence_pauses(audio, sr, min_pause_s=max(0.15, strat['min_pause'])):
            if not any(abs(rp['midpoint'] - ((g['start'] + g['end']) / 2.0)) < 0.25 for g in raw_gaps):
                raw_gaps.append({'start': rp['start'], 'end': rp['end'], 'duration': rp['duration']})

        # Snap gaps to low-energy trough
        cand_cuts = []
        for g in raw_gaps:
            mid = (g['start'] + g['end']) / 2.0
            sub_s, sub_e = max(0, int(g['start'] * sr)), min(len(audio), int(g['end'] * sr))
            cut_time = snap_to_zero_crossing_min_energy(audio, sr, mid)
            if 0.3 < cut_time < total_dur - 0.3:
                cand_cuts.append({'time': cut_time, 'duration': g['duration'], 'start': g['start'], 'end': g['end']})

        cand_cuts.sort(key=lambda x: x['time'])
        unique_cands = []
        for c in cand_cuts:
            if not any(abs(c['time'] - u['time']) < 0.15 for u in unique_cands):
                unique_cands.append(c)

        if len(unique_cands) < needed:
            even_cuts = [round((i + 1) * (total_dur / float(expected_count)), 3) for i in range(needed)]
            for ec in even_cuts:
                if not any(abs(ec - u['time']) < 0.3 for u in unique_cands):
                    unique_cands.append({'time': ec, 'duration': 0.15, 'start': ec - 0.075, 'end': ec + 0.075})
            unique_cands.sort(key=lambda x: x['time'])

        all_nodes = [0.0] + [u['time'] for u in unique_cands] + [round(total_dur, 3)]
        cand_meta = {u['time']: u for u in unique_cands}
        K = len(all_nodes)

        # DP scoring functions
        def seg_ll(i_node, j_node, exp_spk, turn_idx):
            t_s, t_e = all_nodes[i_node], all_nodes[j_node]
            dur = t_e - t_s
            if dur < 0.35: return -7000.0
            f_s, f_e = min(n_frames, int(t_s / step_s)), min(n_frames, int(t_e / step_s))
            if (cum_spk[f_e] - cum_spk[f_s]) < 3: return -4000.0
            ll = (cum_log1[f_e] - cum_log1[f_s]) if exp_spk == 1 else (cum_log2[f_e] - cum_log2[f_s])

            # Duration target penalty
            if strat['dur_lambda'] > 0 and turn_idx - 1 < len(targets):
                tgt_d = targets[turn_idx - 1]['expected_dur']
                tol = max(1.0, tgt_d * 0.40)
                dur_pen = strat['dur_lambda'] * (((dur - tgt_d) / tol) ** 2)
                ll -= dur_pen
            return ll

        def cut_sc(cand_time, s_from, s_to):
            meta = cand_meta.get(cand_time, {})
            pause_dur = meta.get('duration', 0.15)
            f_cut = min(n_frames - 1, max(0, int(cand_time / step_s)))
            win_f = int(1.2 / step_s)
            l_frames = [f for f in range(max(0, f_cut - win_f), f_cut) if is_speech[f]]
            r_frames = [f for f in range(f_cut, min(n_frames, f_cut + win_f)) if is_speech[f]]
            if len(l_frames) >= 3 and len(r_frames) >= 3:
                p1_l = float(np.mean(p1_norm[l_frames]))
                p1_r = float(np.mean(p1_norm[r_frames]))
                h_trans = (p1_l * (1.0 - p1_r)) if (s_from == 1 and s_to == 2) else (((1.0 - p1_l) * p1_r) if (s_from == 2 and s_to == 1) else 0.0)
                h_same = (p1_l * p1_r) + ((1.0 - p1_l) * (1.0 - p1_r))
                h_score = strat['breath_pen'] * (h_trans - h_same)
            else:
                h_score = 0.0
            return h_score + (min(pause_dur, 1.5) * 3.5)

        # Solve DP
        dp = np.full((expected_count + 1, K), -1e9, dtype=np.float64)
        parent = np.full((expected_count + 1, K), -1, dtype=np.int32)

        for j in range(1, K - (expected_count - 1)):
            dp[1, j] = seg_ll(0, j, 1, 1)
            parent[1, j] = 0

        for k in range(2, expected_count + 1):
            exp_spk = 1 if (k % 2 != 0) else 2
            prev_spk = 2 if exp_spk == 1 else 1
            for j in range(k, K - (expected_count - k)):
                best_val, best_i = -1e9, -1
                for i in range(k - 1, j):
                    if dp[k - 1, i] > -1e8:
                        val = dp[k - 1, i] + seg_ll(i, j, exp_spk, k) + cut_sc(all_nodes[i], prev_spk, exp_spk)
                        if val > best_val:
                            best_val, best_i = val, i
                dp[k, j] = best_val
                parent[k, j] = best_i

        # Backtrack
        chosen_indices = []
        curr = K - 1
        for k in range(expected_count, 1, -1):
            p = parent[k, curr]
            if p <= 0: break
            chosen_indices.append(p)
            curr = p
        chosen_indices.reverse()

        cur_segments = []
        last_e = 0.0
        cur_bounds = []
        for idx in chosen_indices:
            c_time = all_nodes[idx]
            meta = cand_meta.get(c_time, {})
            cur_bounds.append({'midpoint': c_time, 'duration': meta.get('duration', 0.2), 'start': meta.get('start', c_time - 0.1), 'end': meta.get('end', c_time + 0.1)})

        for i in range(expected_count):
            s_end = cur_bounds[i]['midpoint'] if i < len(cur_bounds) else total_dur
            dur = max(0.1, s_end - last_e)
            cur_segments.append({'index': i + 1, 'start': round(last_e, 3), 'end': round(s_end, 3), 'duration': round(dur, 3)})
            last_e = s_end

        is_plausible, violations, score = evaluate_segment_plausibility(cur_segments, targets)

        attempt_info = {
            "attemptNumber": attempt_idx + 1,
            "strategy": strat['name'],
            "status": "success" if is_plausible else "adjusted",
            "score": score,
            "reason": "All lines matched realistic human duration target bounds." if is_plausible else (violations[0] if violations else "Suboptimal duration balance."),
            "segments": cur_segments,
            "boundaries": cur_bounds
        }
        attempts_log.append(attempt_info)

        if score > best_score:
            best_score = score
            best_attempt = attempt_info

        if is_plausible:
            break

    # Build final result
    chosen = best_attempt['boundaries'] if best_attempt else []
    final_res = build_engine_result("iterative_dp", "Iterative Adaptive Loop (Duration-Targeted)", chosen, total_dur, expected_count)
    final_res['attempts'] = attempts_log
    final_res['convergedAttempt'] = best_attempt['attemptNumber'] if best_attempt else 1
    final_res['targetEstimates'] = targets
    return final_res

