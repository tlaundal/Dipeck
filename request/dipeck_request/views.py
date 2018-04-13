from flask import request, Blueprint, current_app
from .utils import jsonify, parse_number


views = Blueprint('views', __name__)


@views.route('/')
@jsonify
def status():
    return {'status': 'ok'}


@views.route('/is-prime')
@jsonify
def is_prime():
    res = parse_number(request.args.get('num', None))
    if not res[0]:
        return {'type': 'error', 'code': res[1], 'message': res[2]}, 400

    arg = res[1]

    if current_app.cache.contains(arg):
        is_prime = current_app.cache.get(arg)
        return {'type': 'result', 'result': is_prime}
    else:
        current_app.message_queue.enqueue(arg)
        return {'type': 'enqueued'}
