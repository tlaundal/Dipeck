from flask import jsonify as f_jsonify
from functools import wraps


def jsonify(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        res = f(*args, **kwargs)
        code = None
        if type(res) == tuple:
            code = res[1]
            res = res[0]
        res = f_jsonify(res)
        if code is not None:
            return res, code
        else:
            return res
    return wrapped


def parse_number(arg):
    if arg is None:
        return False, 1, 'No argument supplied'

    try:
        num = int(arg)
        return True, num
    except ValueError:
        return False, 2, 'Argument was not a number'
