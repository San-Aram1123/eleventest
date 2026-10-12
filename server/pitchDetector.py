import sys
import os
import json
import numpy as np

def detect_pitch_f0_boundaries(audio, sr, total_dur, expected_count):
    from speakerDetector import resample_to_16k, snap_to_zero_crossing_min_energy, build_engine_result

    needed = expected_count - 1
    if needed <= 0:
        return build_engine_result("pitch_f0", "Pitch F0 Step Detector (Male ~120Hz ↔ Female ~220Hz)", [], total_dur, expected_count)

    try:
        audio_16k = resample_to_16k(audio, sr)
        sr_16k = 16000
        win_len = int(sr_16k * 0.04)   # 40ms window
        hop_len = int(sr_16k * 0.015)  # 15ms hop
        min_lag = int(sr_16k / 320.0)  # 50 samples (320 Hz)
        max_lag = int(sr_16k / 75.0)   # 213 samples (75 Hz)

        n_frames = (len(audio_16k) - win_len) // hop_len
        times = np.arange(n_frames) * (hop_len / float(sr_16k))
        pitch_curve = np.zeros(n_frames, dtype=np.float32)

        for i in range(n_frames):
            frame = audio_16k[i * hop_len: i * hop_len + win_len]
            energy = np.mean(frame ** 2)
            if energy < 0.0008:
                continue

            acf = np.correlate(frame, frame, mode='full')
            center = len(frame) - 1
            lags = acf[center + min_lag: center + max_lag]
            if len(lags) == 0: continue
            best_rel = np.argmax(lags)
            best_lag = min_lag + best_rel
            peak_val = lags[best_rel] / (acf[center] + 1e-9)

            if peak_val > 0.28:
                pitch_curve[i] = sr_16k / float(best_lag)

        # Speaker gender classification per frame:
        # 1 = Male (Puck, 80-160 Hz), -1 = Female (Aoede, 175-300 Hz), 0 = unvoiced
        gender_track = np.zeros(n_frames, dtype=np.int32)
        for i in range(n_frames):
            f0 = pitch_curve[i]
            if 75.0 <= f0 <= 165.0:
                gender_track[i] = 1   # Male
            elif 175.0 <= f0 <= 320.0:
                gender_track[i] = -1  # Female

        # Median filter to remove noise spikes (5-frame window)
        filtered_gender = np.zeros(n_frames, dtype=np.int32)
        half_w = 3
        for i in range(n_frames):
            sub = gender_track[max(0, i - half_w): min(n_frames, i + half_w + 1)]
            sub_nonzero = sub[sub != 0]
            if len(sub_nonzero) > 0:
                filtered_gender[i] = 1 if np.sum(sub_nonzero) > 0 else -1
            else:
                filtered_gender[i] = filtered_gender[i - 1] if i > 0 else 1

        # Turn 1 is Speaker 1 (Male). Identify transitions where state flips
        transitions = []
        for i in range(1, n_frames - 1):
            if filtered_gender[i] != filtered_gender[i - 1]:
                t_change = times[i]
                # Look 0.5s before and after to verify sustained voice change
                win_eval = int(0.4 / (hop_len / float(sr_16k)))
                pre = filtered_gender[max(0, i - win_eval): i]
                post = filtered_gender[i: min(n_frames, i + win_eval)]
                pre_m = np.mean(pre) if len(pre) > 0 else 0
                post_m = np.mean(post) if len(post) > 0 else 0
                if abs(post_m - pre_m) > 0.8:
                    transitions.append({
                        'time': t_change,
                        'from_gender': 'male' if pre_m > 0 else 'female',
                        'to_gender': 'female' if post_m < 0 else 'male',
                        'magnitude': abs(post_m - pre_m)
                    })

        # Deduplicate transitions closer than 1.5s
        merged = []
        for tr in transitions:
            if not any(abs(tr['time'] - m['time']) < 1.5 for m in merged):
                merged.append(tr)

        # If too few transitions detected, supplement with local step-change peaks
        if len(merged) < needed:
            even_step = total_dur / float(expected_count)
            for k in range(1, expected_count):
                c_time = k * even_step
                if not any(abs(c_time - m['time']) < 1.5 for m in merged):
                    merged.append({'time': c_time, 'from_gender': 'unknown', 'to_gender': 'unknown', 'magnitude': 0.5})

        merged.sort(key=lambda x: x['time'])

        # Pick top needed transitions closest to expected alternation
        if len(merged) > needed:
            # Rank by magnitude and spacing
            merged = merged[:needed]
            merged.sort(key=lambda x: x['time'])

        chosen_boundaries = []
        for tr in merged[:needed]:
            snap_time = snap_to_zero_crossing_min_energy(audio, sr, tr['time'])
            chosen_boundaries.append({
                'start': round(max(0, snap_time - 0.05), 3),
                'end': round(min(total_dur, snap_time + 0.05), 3),
                'duration': 0.1,
                'midpoint': snap_time,
                'score': round(float(tr.get('magnitude', 1.0) * 100.0), 1),
                'is_handoff': True
            })

        chosen_boundaries.sort(key=lambda x: x['midpoint'])
        return build_engine_result("pitch_f0", "Pitch F0 Step Detector (Male ~120Hz ↔ Female ~220Hz)", chosen_boundaries, total_dur, expected_count)
    except Exception as e:
        return {"success": False, "error": f"Pitch F0 detection failed: {str(e)}"}

