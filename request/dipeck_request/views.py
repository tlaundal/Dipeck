from flask import request
from .dipeck_request import app, cache, message_queue
from .utils import jsonify, parse_number


@app.route('/')
@jsonify
def status():
    return {'status': 'ok'}


@app.route('/is-prime')
@jsonify
def is_prime():
    res = parse_number(request.args.get('num', None))
    if not res[0]:
        return {'type': 'error', 'code': res[1], 'message': res[2]}

    arg = res[1]

    if cache.contains(arg):
        is_prime = cache.get(arg)
        return {'type': 'result', 'result': is_prime}
    else:
        message_queue.enqueue(arg)
        return {'type': 'enqueued'}
