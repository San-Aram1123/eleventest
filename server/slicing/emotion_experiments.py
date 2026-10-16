"""Experimental emotion-robust alternatives; never used by production selection."""
import time
import json

import numpy as np

from audio_features import sustained_vectors, timbre_frames
from decoder import UnsafeSeparation, cluster_centroids, decode_turns, identity_margin
from engines import build_segments


EXPERIMENTS = {
    'emotion_mad_timbre': 'Robust cepstral scaling reduces outlier influence from expressive delivery.',
    'emotion_smooth_embedding': 'Temporal median filtering suppresses brief emotion-driven embedding swings.',
    'emotion_multi_model': 'Reliability-weighted agreement from CAM++, ResNet34, and ERes2Net margins.'
}


def _smooth(values, radius=2):
    return np.array([np.median(values[max(0, i-radius):min(len(values), i+radius+1)])
                     for i in range(len(values))])


def _progress(options, name, result):
    filename = options.get('progressFilePath')
    if filename:
        with open(filename, 'a', encoding='utf-8') as handle:
            handle.write(json.dumps({'name': name, 'success': result.get('success', False),
                                     'error': result.get('error')}, ensure_ascii=True) + '\n')
            handle.flush()


def _finish(name, margin, weights, edges, audio, rate, count, options, details):
    cuts, decoded = decode_turns(margin, weights, edges, count, options)
    diagnostics = {**details, **decoded, 'emotionRobustTransform': name}
    segments, boundaries = build_segments(audio, rate, cuts, count, diagnostics, name)
    return {'success': True, 'engine': name, 'description': EXPERIMENTS[name],
            'expectedCount': count, 'detectedCount': count, 'totalDuration': len(audio)/rate,
            'segments': segments, 'boundaries': boundaries, 'diagnostics': diagnostics}


def run_emotion_experiments(audio, rate, count, options, identity_cache=None):
    results = {}
    started = time.perf_counter()
    try:
        frames, voiced, _, hop = timbre_frames(audio, rate)
        duration = len(audio) / rate
        vectors, weights, edges = sustained_vectors(frames, voiced, hop, duration, window=1.1)
        valid = weights > .65
        center = np.median(vectors[valid], axis=0)
        mad = np.median(np.abs(vectors[valid] - center), axis=0) * 1.4826
        robust = (vectors - center) / np.maximum(mad, .25)
        centroids, enrolled = cluster_centroids(robust, weights, edges)
        results['emotion_mad_timbre'] = _finish('emotion_mad_timbre', identity_margin(robust, centroids),
            weights, edges, audio, rate, count, options, {'normalization': 'median/MAD', 'enrollment': enrolled})
    except Exception as error:
        results['emotion_mad_timbre'] = {'success': False, 'engine': 'emotion_mad_timbre',
            'description': EXPERIMENTS['emotion_mad_timbre'], 'error': str(error),
            'diagnostics': getattr(error, 'diagnostics', {})}
    _progress(options, 'emotion_mad_timbre', results['emotion_mad_timbre'])
    try:
        from embeddings import embedding_identity
        margin, weights, edges, enrolled = embedding_identity(audio, rate, options)
        smoothed = _smooth(margin)
        results['emotion_smooth_embedding'] = _finish('emotion_smooth_embedding', smoothed,
            weights, edges, audio, rate, count, options,
            {'model': enrolled.get('model'), 'embeddingDimensions': enrolled.get('embeddingDimensions'),
             'windowSeconds': enrolled.get('windowSeconds'), 'smoothing': '5-point median',
             'enrollment': enrolled})
    except Exception as error:
        results['emotion_smooth_embedding'] = {'success': False, 'engine': 'emotion_smooth_embedding',
            'description': EXPERIMENTS['emotion_smooth_embedding'], 'error': str(error),
            'diagnostics': getattr(error, 'diagnostics', {})}
    _progress(options, 'emotion_smooth_embedding', results['emotion_smooth_embedding'])
    try:
        from embeddings import embedding_identity
        margins, supports, edges = [], [], None
        model_meta = {}
        for model in ('speaker_embedding', 'speaker_resnet', 'speaker_eres2net'):
            margin, support, model_edges, enrolled = embedding_identity(audio, rate, options, model)
            margins.append(_smooth(margin)); supports.append(support); edges = model_edges
            model_meta[model] = {'model': enrolled.get('model'), 'dimensions': enrolled.get('embeddingDimensions')}
        support_matrix = np.stack(supports)
        common = np.min(support_matrix, axis=0)
        weights_by_model = np.maximum(support_matrix, .05)
        blended = np.sum(np.stack(margins) * weights_by_model, axis=0) / weights_by_model.sum(axis=0)
        results['emotion_multi_model'] = _finish('emotion_multi_model', blended, common, edges,
            audio, rate, count, options, {'models': model_meta, 'transform': 'per-model 5-point median then reliability-weighted mean'})
    except Exception as error:
        results['emotion_multi_model'] = {'success': False, 'engine': 'emotion_multi_model',
            'description': EXPERIMENTS['emotion_multi_model'], 'error': str(error),
            'diagnostics': getattr(error, 'diagnostics', {})}
    _progress(options, 'emotion_multi_model', results['emotion_multi_model'])
    for result in results.values():
        result.setdefault('diagnostics', {})['elapsedMs'] = round((time.perf_counter() - started) * 1000, 1)
    return results
