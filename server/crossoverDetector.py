import sys
import os
import json
import numpy as np

def detect_neural_crossover_boundaries(audio, sr, total_dur, expected_count):
    from speakerDetector import (
        resample_to_16k, get_pyannote_session,
        snap_to_zero_crossing_min_energy, build_engine_result
    )

    needed = expected_count - 1
    if needed <= 0:
        return build_engine_result("neural_crossover", "Neural Speaker Crossover Detector (Pyannote P1 ↔ P2)", [], total_dur, expected_count)

    try:
        py_sess = get_pyannote_session()
        audio_16k = resample_to_16k(audio, sr)

        # Single forward pass through Pyannote 3.0
        inp = audio_16k.reshape(1, 1, -1)
        py_logits = py_sess.run(None, {'input_values': inp})[0][0]
        step_s = 270.0 / 16000.0
        n_frames = len(py_logits)
        times = np.arange(n_frames) * step_s

        exp_l = np.exp(py_logits - np.max(py_logits, axis=-1, keepdims=True))
        probs = exp_l / np.sum(exp_l, axis=-1, keepdims=True)

        # 7-Class Powerset Marginals
        m0 = probs[:, 1] + probs[:, 4] + probs[:, 5]
        m1 = probs[:, 2] + probs[:, 4] + probs[:, 6]
        m2 = probs[:, 3] + probs[:, 5] + probs[:, 6]

        # Anchor Turn 1 (Speaker 1, Puck)
        init_frames = min(int(3.0 / step_s), n_frames)
        s1_slot = int(np.argmax([np.sum(m0[:init_frames]), np.sum(m1[:init_frames]), np.sum(m2[:init_frames])]))
        energies = [float(np.sum(m0)), float(np.sum(m1)), float(np.sum(m2))]
        energies[s1_slot] = -1.0
        s2_slot = int(np.argmax(energies))

        slots = [m0, m1, m2]
        p1 = slots[s1_slot]
        p2 = slots[s2_slot]

        # Difference curve: D(t) = P1(t) - P2(t)
        # Positive when Speaker 1, Negative when Speaker 2
        diff_curve = p1 - p2

        # Smooth curve with moving average of 7 frames (~118ms)
        kernel = np.ones(7) / 7.0
        smooth_diff = np.convolve(diff_curve, kernel, mode='same')

        # Find zero-crossing points where smooth_diff changes sign
        crossovers = []
        win_eval = int(0.5 / step_s)

        for i in range(1, n_frames - 1):
            if smooth_diff[i - 1] * smooth_diff[i] <= 0:
                # Check sustained polarity before and after to reject noise
                pre = smooth_diff[max(0, i - win_eval): i]
                post = smooth_diff[i: min(n_frames, i + win_eval)]
                pre_m = float(np.mean(pre)) if len(pre) > 0 else 0.0
                post_m = float(np.mean(post)) if len(post) > 0 else 0.0

                swing = abs(post_m - pre_m)
                if swing > 0.35 and (pre_m * post_m < 0):
                    t_cross = times[i]
                    if 0.4 < t_cross < total_dur - 0.4:
                        crossovers.append({
                            'time': t_cross,
                            'swing': swing,
                            'from_spk': 'Speaker1' if pre_m > 0 else 'Speaker2',
                            'to_spk': 'Speaker2' if post_m < 0 else 'Speaker1'
                        })

        # Deduplicate crossovers closer than 1.5s
        merged = []
        for cr in crossovers:
            if not any(abs(cr['time'] - m['time']) < 1.5 for m in merged):
                merged.append(cr)

        # Supplement if fewer than needed
        if len(merged) < needed:
            even_step = total_dur / float(expected_count)
            for k in range(1, expected_count):
                c_time = k * even_step
                if not any(abs(c_time - m['time']) < 1.5 for m in merged):
                    merged.append({'time': c_time, 'swing': 0.5, 'from_spk': 'unknown', 'to_spk': 'unknown'})

        merged.sort(key=lambda x: x['time'])
        if len(merged) > needed:
            merged = merged[:needed]

        chosen_boundaries = []
        for cr in merged:
            snap_time = snap_to_zero_crossing_min_energy(audio, sr, cr['time'])
            chosen_boundaries.append({
                'start': round(max(0, snap_time - 0.05), 3),
                'end': round(min(total_dur, snap_time + 0.05), 3),
                'duration': 0.1,
                'midpoint': snap_time,
                'score': round(float(cr.get('swing', 1.0) * 100.0), 1),
                'is_handoff': True
            })

        chosen_boundaries.sort(key=lambda x: x['midpoint'])
        return build_engine_result("neural_crossover", "Neural Speaker Crossover Detector (Pyannote P1 ↔ P2)", chosen_boundaries, total_dur, expected_count)
    except Exception as e:
        return {"success": False, "error": f"Neural crossover detection failed: {str(e)}"}

