import json
import sys
import time

for line in sys.stdin:
    request = json.loads(line)
    if request.get('options', {}).get('stall'):
        time.sleep(2)
    print(json.dumps({'id': request['id'], 'result': {'success': True, 'totalDuration': 4,
          'segments': [{'start': 0, 'end': 4}]}}), flush=True)
