from flask import request
from .dipeck_request import app, cache, message_queue
from .utils import jsonify


@app.route('/')
@jsonify
def status():
    return {'status': 'ok'}


@app.route('/is-prime')
@jsonify
def is_prime():
    arg = request.args.get('num', None)
    if arg is None:
        return {'type': 'error', 'code': 1, 'message': 'No argument'}, 400

    try:
        arg = int(arg)
    except ValueError:
        return {
            'type': 'error',
            'code': 2,
            'message': 'Argument was not number'
        }, 400

    if cache.contains(arg):
        is_prime = cache.get(arg)
        return {
            'type': 'result',
            'result': is_prime
        }
    else:
        message_queue.enqueue(arg)
        return {
            'type': 'enqueued'
        }
