"""CLI for local audio-only speaker slicing. JSON is the only stdout output."""
import argparse
import json
import math
import sys

from audio_features import load_audio
from engines import DESCRIPTIONS, run_engine
from consensus import consensus, NEURAL_ENGINES, DESCRIPTION
from emotion_experiments import run_emotion_experiments

MODES = {**DESCRIPTIONS, 'speaker_consensus': DESCRIPTION}
EXPERIMENT_MODE = 'emotion_experiments'


def validate_options(options, count, duration):
    if not isinstance(options, dict):
        raise ValueError('Options JSON must be an object.')
    for key in ('minSegmentSeconds', 'maxSegmentSeconds', 'confidenceThreshold'):
        if key not in options or options[key] is None:
            options.pop(key, None)
            continue
        value = options[key]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            raise ValueError(f'{key} must be a finite number.')
        if key == 'confidenceThreshold':
            if not 0.5 <= value <= 1:
                raise ValueError('confidenceThreshold must be between 0.5 and 1.')
        elif value < 0.4 or value > (60 if key == 'minSegmentSeconds' else 600):
            maximum = 60 if key == 'minSegmentSeconds' else 600
            raise ValueError(f'{key} must be between 0.4 and {maximum} seconds.')
    for key in ('reference1Path', 'reference2Path'):
        if key in options and options[key] is not None and not isinstance(options[key], str):
            raise ValueError(f'{key} must be a WAV path.')
    expected = options.get('expectedBoundaries')
    if expected is not None:
        if not isinstance(expected, list) or len(expected) != count - 1:
            raise ValueError('expectedBoundaries must contain exactly N - 1 ordered timestamps.')
        previous = 0
        for value in expected:
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
                raise ValueError('Expected boundary timestamps must be finite numbers.')
            if not previous < value < duration:
                raise ValueError('Expected boundaries must increase strictly within the master duration.')
            previous = value
    return options


def detect(filename, count, mode='all', options=None):
    if not isinstance(count, int) or isinstance(count, bool) or not 1 <= count <= 40:
        raise ValueError('Expected count must be an integer from 1 to 40.')
    if mode not in ('all', EXPERIMENT_MODE) and mode not in MODES:
        raise ValueError('Unknown local speaker detection mode.')
    audio, rate, duration = load_audio(filename)
    options = validate_options(dict(options or {}), count, duration)
    if mode == EXPERIMENT_MODE:
        results = run_emotion_experiments(audio, rate, count, options)
        return {'success': any(item['success'] for item in results.values()),
                'totalDuration': round(duration, 6), 'engines': results}
    names = list(DESCRIPTIONS) if mode == 'all' else list(NEURAL_ENGINES) if mode == 'speaker_consensus' else [mode]
    identity_cache = {}
    engines = {name: run_engine(name, audio, rate, count, options, identity_cache) for name in names}
    if mode in ('all', 'speaker_consensus'):
        engines['speaker_consensus'] = consensus(engines, count, duration)
        combined = engines['speaker_consensus']
        if combined['success'] and options.get('expectedBoundaries') is not None:
            errors = [(item['midpoint'] - label) * 1000 for item, label in
                      zip(combined['boundaries'], options['expectedBoundaries'])]
            combined['metrics'] = {'boundaryErrorsMs': [round(value, 2) for value in errors],
                                   'boundaryMaeMs': round(sum(map(abs, errors)) / len(errors), 2) if errors else 0,
                                   'maxBoundaryErrorMs': round(max(map(abs, errors), default=0), 2)}
    if mode == 'speaker_consensus':
        engines = {'speaker_consensus': engines['speaker_consensus']}
    success = any(result['success'] for result in engines.values())
    result = {'success': success, 'totalDuration': round(duration, 6), 'engines': engines}
    if mode != 'all':
        result.update(engines[mode])
    else:
        result['comparisonTable'] = [
            {'engine': name, 'success': item['success'],
             'boundaries': [boundary['midpoint'] for boundary in item['boundaries']],
             'minConfidence': item['diagnostics'].get('minConfidence'),
             'elapsedMs': item['diagnostics'].get('elapsedMs'),
             'metrics': item.get('metrics'), 'error': item.get('error')}
            for name, item in engines.items()]
    if not success and 'error' not in result:
        result['error'] = 'No engine produced a safe exact-count separation. Master audio is preserved.'
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('audio')
    parser.add_argument('count', type=int)
    parser.add_argument('--mode', choices=[*MODES, EXPERIMENT_MODE, 'all'], default='all')
    parser.add_argument('--options-file')
    args = parser.parse_args()
    try:
        options = {}
        if args.options_file:
            with open(args.options_file, encoding='utf-8') as handle:
                options = json.load(handle)
        if not isinstance(options, dict):
            raise ValueError('Options JSON must be an object.')
        result = detect(args.audio, args.count, args.mode, options)
    except Exception as error:
        result = {'success': False, 'error': str(error), 'segments': [], 'engines': {}}
    print(json.dumps(result, ensure_ascii=True, allow_nan=False,
                     default=lambda value: value.item() if hasattr(value, 'item') else str(value)))


if __name__ == '__main__':
    main()
