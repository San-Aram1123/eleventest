"""Independent experiment modes sharing strict identity and slicing safety rules."""
import time

import numpy as np

from audio_features import load_audio, sustained_vectors, timbre_frames
from boundary_refinement import resolve_boundary
from decoder import UnsafeSeparation, cluster_centroids, decode_turns, identity_margin


DESCRIPTIONS = {
    'timbre_dp': 'Sustained cepstral timbre with global alternating duration DP',
    'spectral_change': 'Long-window spectral contrast with anchored global decoding',
    'speaker_embedding': 'CAM++ identity with multiscale handoff verification',
    'speaker_resnet': 'WeSpeaker ResNet34 identity with multiscale handoff verification',
    'speaker_eres2net': '3D-Speaker ERes2Net identity with multiscale handoff verification',
    'speaker_strict': 'CAM++ identity with original strict 60 ms quiet refinement',
}


def timbre_identity(audio, rate, options, spectral=False):
    frames, voiced, _, hop = timbre_frames(audio, rate)
    duration = len(audio) / rate
    window = 1.2 if spectral else 0.9
    vectors, weights, edges = sustained_vectors(frames, voiced, hop, duration, window=window)
    valid = weights > 0.65
    location = np.median(vectors[valid], axis=0)
    scale = np.maximum(np.std(vectors[valid], axis=0), 0.5)
    vectors = (vectors - location) / scale
    reference1, reference2 = options.get('reference1Path'), options.get('reference2Path')
    if bool(reference1) != bool(reference2):
        raise UnsafeSeparation('Provide both clean speaker reference WAVs, or neither.')
    if reference1:
        centroids, variances = [], []
        for filename in (reference1, reference2):
            reference, ref_rate, ref_duration = load_audio(filename)
            if ref_duration < 2:
                raise UnsafeSeparation('Each speaker reference requires at least 2 seconds of clean speech.')
            ref_features, ref_voiced, _, _ = timbre_frames(reference, ref_rate)
            if ref_voiced.sum() * hop < 1.2:
                raise UnsafeSeparation('Reference contains too little voiced speech for enrollment.')
            ref_vectors, ref_weights, _ = sustained_vectors(ref_features, ref_voiced, hop,
                                                           ref_duration, window=window)
            ref_vectors = (ref_vectors[ref_weights > 0.65] - location) / scale
            centroid = np.mean(ref_vectors, axis=0)
            centroids.append(centroid)
            variances.append(float(np.mean(np.sum((ref_vectors - centroid) ** 2, axis=1))))
        centroids = np.array(centroids)
        separation = float(np.sum((centroids[0] - centroids[1]) ** 2))
        within = float(np.mean(variances))
        ratio = separation / max(within, 1e-8)
        if separation < 0.4 or ratio < 1.3:
            raise UnsafeSeparation('Reference timbres are insufficiently distinct for safe separation.')
        diagnostics = {'enrollment': 'reference', 'centroidSeparation': separation,
                       'withinReferenceVariance': within, 'separationRatio': ratio,
                       'requiredSeparationRatio': 1.3}
    else:
        centroids, diagnostics = cluster_centroids(vectors, weights, edges)
    bonus = None
    if spectral:
        # Compare sustained spectral shape on each side, not momentary energy or F0.
        radius = 7
        cumulative = np.vstack([np.zeros((1, vectors.shape[1])), np.cumsum(vectors, axis=0)])
        bonus = np.zeros(len(vectors) + 1)
        for index in range(radius, len(vectors) - radius):
            left = (cumulative[index] - cumulative[index - radius]) / radius
            right = (cumulative[index + radius] - cumulative[index]) / radius
            bonus[index] = np.linalg.norm(left - right)
        bonus = np.minimum(bonus / max(float(np.percentile(bonus, 75)), 0.1), 3)
    diagnostics.update({'source': 'sustained_cepstral_spectral_envelope',
                        'windowSeconds': window, 'analysisHopSeconds': float(np.mean(np.diff(edges)))})
    return identity_margin(vectors, centroids), weights, edges, diagnostics, bonus


def build_segments(audio, rate, cuts, count, diagnostics, engine, validator=None):
    duration = len(audio) / rate
    minimum, maximum = diagnostics['minSegmentSeconds'], diagnostics['maxSegmentSeconds']
    refined, boundary_details = [], []
    for index, coarse in enumerate(cuts):
        previous = refined[-1] if refined else 0
        following = cuts[index + 1] if index + 1 < len(cuts) else duration
        left_limit = max(previous + minimum, following - maximum, 0)
        right_limit = min(previous + maximum, following - minimum, duration)
        cut, details = resolve_boundary(audio, rate, coarse, left_limit, right_limit,
                                        index, validator, engine == 'speaker_strict')
        if cut <= previous or cut >= following:
            raise UnsafeSeparation('Local refinement would produce unsafe or collapsed segment boundaries.', diagnostics)
        refined.append(cut)
        details.update({'midpoint': round(cut, 6), 'engine': engine,
                        'speakerBefore': 1 if index % 2 == 0 else 2,
                        'speakerAfter': 2 if index % 2 == 0 else 1})
        if index < len(diagnostics.get('boundaryConfidence', [])):
            details['identityEvidence'] = diagnostics['boundaryConfidence'][index]
        boundary_details.append(details)
    diagnostics['coarseBoundaries'] = [float(value) for value in cuts]
    diagnostics['proposedBoundaries'] = boundary_details
    rejected = [i + 1 for i, item in enumerate(boundary_details) if not item['accepted']]
    if rejected:
        raise UnsafeSeparation('No safe handoff at boundary ' + ', '.join(map(str, rejected)) +
                               '; no safe 60 ms quiet interval or verified short speaker handoff. '
                               'Audition the retained proposals; no clips were exported.',
                               {**diagnostics, 'rejectedBoundaries': rejected})
    points = [0, *refined, duration]
    segments = []
    for index, (start, end) in enumerate(zip(points, points[1:])):
        length = end - start
        if length < minimum - 1e-6 or length > maximum + 1e-6:
            raise UnsafeSeparation('Refined segment violates the configured duration limits.', diagnostics)
        segments.append({'index': index + 1, 'start': round(start, 6), 'end': round(end, 6),
                         'duration': round(length, 6),
                         'boundary_info': boundary_details[index] if index < len(cuts) else None})
    if len(segments) != count:
        raise UnsafeSeparation('Exact segment count was not satisfied.', diagnostics)
    return segments, boundary_details


def run_engine(engine, audio, rate, count, options, identity_cache=None):
    started = time.perf_counter()
    diagnostics = {}
    try:
        if count == 1:
            dur = len(audio) / rate
            minimum = min(options.get('minSegmentSeconds') or 0.8, dur)
            maximum = max(options.get('maxSegmentSeconds') or dur, dur)
            diagnostics = {'minSegmentSeconds': minimum, 'maxSegmentSeconds': maximum,
                           'minConfidence': 1, 'enrollment': 'single_turn_no_separation_required'}
            segments, boundaries = build_segments(audio, rate, [], count, diagnostics, engine)
        else:
            validator = None
            if engine.startswith('speaker_'):
                from embeddings import embedding_identity
                key = 'speaker_embedding' if engine == 'speaker_strict' else engine
                if identity_cache is None or key not in identity_cache:
                    identity = embedding_identity(audio, rate, options, key, with_validator=True)
                    if identity_cache is not None:
                        identity_cache[key] = identity
                else:
                    identity = identity_cache[key]
                margin, weights, edges, enrolled, validator = identity
                diagnostics = dict(enrolled)
                bonus = None
            else:
                margin, weights, edges, diagnostics, bonus = timbre_identity(
                    audio, rate, options, spectral=engine == 'spectral_change')
            cuts, decoded = decode_turns(margin, weights, edges, count, options, bonus)
            diagnostics.update(decoded)
            segments, boundaries = build_segments(audio, rate, cuts, count, diagnostics, engine, validator)
        diagnostics['elapsedMs'] = round((time.perf_counter() - started) * 1000, 1)
        result = {'success': True, 'engine': engine, 'description': DESCRIPTIONS[engine],
                  'expectedCount': count, 'detectedCount': count,
                  'totalDuration': round(len(audio) / rate, 6), 'segments': segments,
                  'boundaries': boundaries, 'diagnostics': diagnostics}
        expected = options.get('expectedBoundaries')
        if expected is not None:
            errors = [round((boundary['midpoint'] - reference) * 1000, 2)
                      for boundary, reference in zip(boundaries, expected)]
            result['metrics'] = {'boundaryErrorsMs': errors,
                                 'boundaryMaeMs': round(float(np.mean(np.abs(errors))), 2) if errors else 0,
                                 'maxBoundaryErrorMs': max(map(abs, errors), default=0)}
        return result
    except Exception as error:
        diagnostics.update(getattr(error, 'diagnostics', {}))
        diagnostics['elapsedMs'] = round((time.perf_counter() - started) * 1000, 1)
        return {'success': False, 'engine': engine, 'description': DESCRIPTIONS[engine],
                'error': str(error), 'segments': [], 'boundaries': [], 'diagnostics': diagnostics}
