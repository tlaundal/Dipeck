from flask import jsonify as f_jsonify
from functools import wraps


def jsonify(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        res = f(*args, **kwargs)
        code = 200
        if type(res) == tuple:
            code = res[1]
            res = res[0]
        return f_jsonify(res), code
    return wrapped


def parse_number(arg):
    if arg is None:
        return False, 1, 'No argument supplied'

    try:
        num = int(arg)
        return True, num
    except ValueError:
        return False, 2, 'Argument was not a number'
