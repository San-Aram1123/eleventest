"""Persistent JSON-lines CPU slicer; only models, never speaker identities, are cached."""
import json
import sys
from detect import detect

for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        result = detect(request['audio'], request['count'], request.get('mode', 'all'), request.get('options', {}))
    except Exception as error:
        result = {'success': False, 'error': str(error), 'segments': [], 'engines': {}}
    print(json.dumps({'id': request.get('id'), 'result': result}, ensure_ascii=True, allow_nan=False,
                     default=lambda value: value.item() if hasattr(value, 'item') else str(value)), flush=True)
