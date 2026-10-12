"""Global duration-constrained alternating turn decoder with independent safety gates."""
import numpy as np


class UnsafeSeparation(ValueError):
    def __init__(self, message, diagnostics=None):
        super().__init__(message)
        self.diagnostics = diagnostics or {}


def cluster_centroids(vectors, weights, edges, normalized=False):
    """Fit two identities once across the entire recording, then anchor speaker 1."""
    valid = weights > 0.65
    if valid.sum() < 12:
        raise UnsafeSeparation('Too few sustained voiced windows for two-speaker enrollment.')
    data = vectors[valid]
    centered = data - np.mean(data, axis=0)
    _, _, axes = np.linalg.svd(centered, full_matrices=False)
    best = None
    for axis in axes[:min(4, len(axes))]:
        projection = centered @ axis
        centers = np.array([data[np.argmin(projection)], data[np.argmax(projection)]])
        for _ in range(40):
            distances = ((data[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)
            labels = np.argmin(distances, axis=1)
            if min(np.sum(labels == 0), np.sum(labels == 1)) < max(3, len(data) * 0.08):
                break
            updated = np.array([np.mean(data[labels == s], axis=0) for s in (0, 1)])
            if normalized:
                updated /= np.maximum(np.linalg.norm(updated, axis=1, keepdims=True), 1e-9)
            if np.max(np.abs(updated - centers)) < 1e-5:
                centers = updated
                break
            centers = updated
        else:
            labels = np.argmin(((data[:, None] - centers) ** 2).sum(axis=2), axis=1)
        counts = [int(np.sum(labels == s)) for s in (0, 1)]
        if min(counts) < max(3, len(data) * 0.08):
            continue
        residual = float(np.mean(np.min(((data[:, None] - centers) ** 2).sum(axis=2), axis=1)))
        if best is None or residual < best[0]:
            best = (residual, centers.copy())
    if best is None:
        raise UnsafeSeparation('A second sustained speaker identity could not be enrolled.')
    residual, centers = best
    separation = float(np.sum((centers[0] - centers[1]) ** 2))
    ratio = separation / max(residual, 1e-8)
    if separation < 0.02 or ratio < 1.3:
        raise UnsafeSeparation('Global speaker centroids overlap; reliable separation is unavailable.',
                               {'centroidSeparation': separation, 'withinClusterVariance': residual,
                                'separationRatio': ratio, 'requiredSeparationRatio': 1.3})
    # Anchor by the first sustained voiced region, not an arbitrary cluster index.
    valid_indices = np.flatnonzero(valid)
    anchor_indices = valid_indices[edges[valid_indices] < edges[valid_indices[0]] + 1.2]
    anchor = np.mean(vectors[anchor_indices], axis=0)
    if np.sum((anchor - centers[1]) ** 2) < np.sum((anchor - centers[0]) ** 2):
        centers = centers[::-1]
    return centers, {'enrollment': 'global_cluster', 'centroidSeparation': separation,
                     'withinClusterVariance': float(residual),
                     'separationRatio': ratio, 'requiredSeparationRatio': 1.3,
                     'anchor': 'first_1.2_seconds_of_sustained_voiced_windows'}


def identity_margin(vectors, centroids):
    distances = ((vectors[:, None] - centroids[None]) ** 2).sum(axis=2)
    scale = max(float(np.sum((centroids[0] - centroids[1]) ** 2)), 1e-8)
    return np.clip((distances[:, 1] - distances[:, 0]) / scale, -1, 1)


def transition_evidence(margin, weights, hop):
    """Sustained identity on both sides; silence and instantaneous pitch cannot vote."""
    radius, skip = max(3, int(round(0.8 / hop))), max(1, int(round(0.15 / hop)))
    prefix = np.r_[0, np.cumsum(margin * weights)]
    support = np.r_[0, np.cumsum(weights)]
    left, right = np.zeros(len(margin) + 1), np.zeros(len(margin) + 1)
    for boundary in range(1, len(margin)):
        a, b = max(0, boundary - radius), max(0, boundary - skip)
        c, d = min(len(margin), boundary + skip), min(len(margin), boundary + radius)
        lw, rw = support[b] - support[a], support[d] - support[c]
        if lw >= 1.5 and rw >= 1.5:
            left[boundary] = (prefix[b] - prefix[a]) / lw
            right[boundary] = (prefix[d] - prefix[c]) / rw
    return left, right


def decode_turns(margin, weights, edges, count, options=None, change_bonus=None):
    """Semi-Markov DP: exactly N turns, bounded duration, globally fixed identities."""
    options = options or {}
    duration, frames = float(edges[-1]), len(margin)
    average = duration / count
    minimum = float(options.get('minSegmentSeconds') or max(0.8, average * 0.2))
    maximum = float(options.get('maxSegmentSeconds') or average * 2.4)
    threshold = float(options.get('confidenceThreshold', 0.6))
    diagnostics = {'minSegmentSeconds': minimum, 'maxSegmentSeconds': maximum,
                   'confidenceThreshold': threshold, 'expectedCount': count}
    if minimum <= 0 or maximum < minimum or minimum * count > duration + 1e-8 or maximum * count < duration:
        raise UnsafeSeparation('Requested turn count cannot fit the duration limits.', diagnostics)
    if count == 1:
        return [], {**diagnostics, 'segmentConfidence': [], 'minConfidence': 1.0}
    hop = float(np.mean(np.diff(edges)))
    left, right = transition_evidence(margin, weights, hop)
    boundary_gate = max(0.1, threshold * 2 - 1)
    evidence = np.minimum(left, -right)
    cumulative = np.r_[0, np.cumsum(margin * weights * np.diff(edges))]
    scores = np.full(frames + 1, -np.inf)
    scores[0] = 0
    history = np.full((count, frames + 1), -1, dtype=np.int32)
    for turn in range(count):
        sign = 1 if turn % 2 == 0 else -1
        updated = np.full(frames + 1, -np.inf)
        for end in range(1, frames + 1):
            remaining = count - turn - 1
            if not minimum * remaining - 1e-8 <= duration - edges[end] <= maximum * remaining + 1e-8:
                continue
            if remaining and (sign * left[end] < boundary_gate or -sign * right[end] < boundary_gate):
                continue
            lo = max(0, int(np.searchsorted(edges, edges[end] - maximum - 1e-8)))
            hi = min(end, int(np.searchsorted(edges, edges[end] - minimum + 1e-8, side='right')))
            starts = np.arange(lo, hi)
            if not len(starts):
                continue
            lengths = edges[end] - edges[starts]
            acoustic = sign * (cumulative[end] - cumulative[starts])
            prior = average * 0.06 * np.log(np.maximum(lengths / average, 1e-8)) ** 2
            candidates = scores[starts] + acoustic - prior
            if remaining:
                candidates += min(sign * left[end], -sign * right[end]) * 0.35
                if change_bonus is not None:
                    candidates += float(change_bonus[end]) * 0.25
            selected = int(np.argmax(candidates))
            if np.isfinite(candidates[selected]):
                updated[end] = candidates[selected]
                history[turn, end] = starts[selected]
        scores = updated
    if not np.isfinite(scores[-1]):
        diagnostics['supportedSpeaker1To2'] = int(np.sum(evidence > 0.06))
        diagnostics['supportedSpeaker2To1'] = int(np.sum(np.minimum(-left, right) > 0.06))
        raise UnsafeSeparation('No safe alternating path with the requested number of sustained speaker turns.', diagnostics)
    cuts, end = [], frames
    for turn in range(count - 1, -1, -1):
        start = int(history[turn, end])
        if turn:
            cuts.append(start)
        end = start
    cuts.reverse()
    indices = [0, *cuts, frames]
    confidence = []
    for turn, (start, end) in enumerate(zip(indices, indices[1:])):
        # Exclude only mixed boundary windows, keep interior breaths as zero support.
        trim = min(int(0.3 / hop), max(0, (end - start - 4) // 2))
        a, b = start + (trim if turn else 0), end - (trim if turn < count - 1 else 0)
        signed, support = margin[a:b] * (1 if turn % 2 == 0 else -1), weights[a:b]
        total = float(support.sum())
        mean = float(np.sum(signed * support) / max(total, 1e-8))
        purity = float(np.sum((signed > 0.05) * support) / max(total, 1e-8))
        value = min((mean + 1) / 2, purity)
        # An otherwise confident long segment must not conceal an extra speaker turn.
        opposite = (signed < -0.25) & (support > 0.5)
        padded = np.r_[False, opposite, False].astype(np.int8)
        starts = np.flatnonzero(np.diff(padded) == 1)
        ends = np.flatnonzero(np.diff(padded) == -1)
        longest_opposite = float(max(ends - starts, default=0) * hop)
        confidence.append({'turn': turn + 1, 'confidence': round(value, 4),
                           'purity': round(purity, 4), 'meanMargin': round(mean, 4),
                           'longestOppositeSpeakerSeconds': round(longest_opposite, 3),
                           'speechSupportSeconds': round(total * hop, 3)})
    boundary_confidence = [
        {'boundary': index + 1, 'leftMargin': round(float(left[cut] * (1 if index % 2 == 0 else -1)), 4),
         'rightMargin': round(float(right[cut] * (-1 if index % 2 == 0 else 1)), 4),
         'confidence': round(float((min(left[cut] * (1 if index % 2 == 0 else -1),
                                        right[cut] * (-1 if index % 2 == 0 else 1)) + 1) / 2), 4)}
        for index, cut in enumerate(cuts)]
    diagnostics.update({'segmentConfidence': confidence,
                        'boundaryConfidence': boundary_confidence,
                        'minConfidence': min(item['confidence'] for item in [*confidence, *boundary_confidence]),
                        'objective': round(float(scores[-1]), 4)})
    if any(item['confidence'] < threshold or item['speechSupportSeconds'] < min(0.6, minimum * 0.5)
           for item in confidence):
        raise UnsafeSeparation('Speaker identity confidence is too low in one or more turns; slicing aborted.', diagnostics)
    if any(item['longestOppositeSpeakerSeconds'] > 1.2 for item in confidence):
        raise UnsafeSeparation('A sustained extra speaker turn remains inside a proposed segment; count mismatch or uncertain identities.', diagnostics)
    return [float(edges[index]) for index in cuts], diagnostics
