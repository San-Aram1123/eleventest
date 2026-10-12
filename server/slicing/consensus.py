"""Agreement test requiring all three neural models; never an automatic fallback."""
import time

NEURAL_ENGINES = ('speaker_embedding', 'speaker_resnet', 'speaker_eres2net')
DESCRIPTION = 'Three-model agreement with intersecting verified quiet handoffs'


def consensus(results, count, duration):
    started = time.perf_counter()
    diagnostics = {'requiredModels': list(NEURAL_ENGINES), 'models': {
        name: {'success': results[name]['success'], 'error': results[name].get('error'),
               'elapsedMs': results[name]['diagnostics'].get('elapsedMs')}
        for name in NEURAL_ENGINES}}
    output = {'engine': 'speaker_consensus', 'description': DESCRIPTION, 'success': False,
              'segments': [], 'boundaries': [], 'diagnostics': diagnostics}
    if not all(results[name]['success'] for name in NEURAL_ENGINES):
        output['error'] = 'Consensus requires all three neural models to accept; no model was substituted.'
        return output
    boundaries = []
    for index in range(count - 1):
        proposals = [results[name]['boundaries'][index] for name in NEURAL_ENGINES]
        times = [proposal['midpoint'] for proposal in proposals]
        left = max(proposal['start'] for proposal in proposals)
        right = min(proposal['end'] for proposal in proposals)
        if max(times) - min(times) > .2 or right - left < .006:
            output['error'] = f'Models disagree on a common quiet handoff at boundary {index + 1}.'
            diagnostics['proposedBoundaries'] = [dict(item, accepted=False) for item in boundaries]
            diagnostics['disputedBoundary'] = index + 1
            diagnostics['modelCuts'] = times
            return output
        boundaries.append({'midpoint': (left + right) / 2, 'start': left, 'end': right,
                           'quietRunSeconds': right - left, 'accepted': True,
                           'modelCuts': dict(zip(NEURAL_ENGINES, times)),
                           'refinement': 'three_model_quiet_intersection'})
    points = [0, *[item['midpoint'] for item in boundaries], duration]
    minimum = max(results[name]['diagnostics']['minSegmentSeconds'] for name in NEURAL_ENGINES)
    maximum = min(results[name]['diagnostics']['maxSegmentSeconds'] for name in NEURAL_ENGINES)
    if any(not minimum <= end - start <= maximum for start, end in zip(points, points[1:])):
        output['error'] = 'Consensus violates turn duration limits.'
        return output
    output.update({'success': True, 'expectedCount': count, 'detectedCount': count,
                   'totalDuration': duration, 'boundaries': boundaries,
                   'segments': [{'index': i + 1, 'start': start, 'end': end, 'duration': end - start,
                                 'boundary_info': boundaries[i] if i < len(boundaries) else None}
                                for i, (start, end) in enumerate(zip(points, points[1:]))]})
    diagnostics.update({'proposedBoundaries': boundaries, 'minSegmentSeconds': minimum,
                        'maxSegmentSeconds': maximum, 'elapsedMs': round((time.perf_counter() - started) * 1000, 1),
                        'warning': 'Model agreement is corroboration, not transcript verification.'})
    return output
