"""Search quiet candidates, verify disjoint speaker evidence, then cut PCM.

Identity scores are heuristics, not calibrated probabilities. No overlap is removed.
"""
import numpy as np

from audio_features import refine_boundary


def quiet_candidates(audio, rate, coarse, lower, upper, radius=.75):
    start, end = max(lower, coarse - radius), min(upper, coarse + radius)
    if start >= end:
        return []
    hop, half = max(1, int(rate * .002)), max(1, int(rate * .004))
    centers = np.arange(max(half, int(start * rate)),
                        min(len(audio) - half, int(end * rate)), hop)
    if not len(centers):
        return []
    cumulative = np.r_[0., np.cumsum(audio.astype(np.float64) ** 2)]
    energy = (cumulative[centers + half] - cumulative[centers - half]) / (2 * half)
    reference = max(float(np.percentile(energy, 80)), 1e-12)
    quiet = energy < reference * .01
    changes = np.diff(np.r_[False, quiet, False].astype(int))
    candidates = []
    for first, last in zip(np.flatnonzero(changes == 1), np.flatnonzero(changes == -1)):
        # Window centers are already inset from the voiced edges by half a window.
        left = centers[first] / rate
        right = centers[last - 1] / rate
        if right - left < .02:
            continue
        midpoint = (left + right) / 2
        sample = int(midpoint * rate)
        zero_left, zero_right = max(int(left * rate), sample - int(.003 * rate)), min(int(right * rate), sample + int(.003 * rate))
        if zero_right > zero_left:
            sample = zero_left + int(np.argmin(np.abs(audio[zero_left:zero_right])))
        candidates.append({'midpoint': sample / rate, 'start': left, 'end': right,
                           'quietRunSeconds': round(right - left, 4),
                           'localEnergyRatio': float(np.min(energy[first:last]) / reference)})
    return sorted(candidates, key=lambda item: abs(item['midpoint'] - coarse))[:8]


def resolve_boundary(audio, rate, coarse, lower, upper, index, validator=None, strict=False):
    if validator is None or strict:
        cut, details = refine_boundary(audio, rate, coarse, lower, upper)
        accepted = details.get('localEnergyRatio', 1) <= .3 and details.get('quietRunSeconds', 0) >= .06
        return cut, {**details, 'accepted': accepted,
                     'reason': '60 ms quiet interval accepted' if accepted else 'No safe 60 ms quiet interval',
                     'refinement': 'strict_quiet_baseline'}
    candidates = quiet_candidates(audio, rate, coarse, lower, upper)
    scores = validator(candidates, 1 if index % 2 == 0 else -1) if candidates else []
    for candidate, margins in zip(candidates, scores):
        # Short intervals need stronger evidence at BOTH window lengths and sides.
        short = candidate['quietRunSeconds'] < .06
        threshold = .30 if short else .15
        candidate.update({'sideMargins': [round(value, 4) for value in margins],
                          'requiredMargin': threshold,
                          'accepted': len(margins) == 4 and min(margins) >= threshold})
    accepted = [candidate for candidate in candidates if candidate['accepted']]
    selected = min(accepted or candidates, key=lambda item: abs(item['midpoint'] - coarse), default=None)
    cut = selected['midpoint'] if selected else coarse
    details = {**(selected or {}), 'coarse': coarse, 'midpoint': cut,
               'shiftMs': round((cut - coarse) * 1000, 2), 'searchRadiusMs': 750,
               'refinement': 'multiscale_disjoint_speaker_identity', 'accepted': bool(accepted),
               'reason': ('Quiet handoff with consistent speaker identity on both sides' if accepted else
                          'No quiet candidate has consistent departing/arriving speaker identity'),
               'candidates': candidates}
    return cut, details
