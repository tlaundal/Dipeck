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
