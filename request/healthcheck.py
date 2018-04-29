#!/usr/bin/env python3
import sys
import json
from uwsgi_tools.curl import curl as ucurl


def healthcheck():
    response = ucurl('127.0.0.1:5000', '/')
    head, body = response.replace('\r\n', '\n').split('\n\n')
    body = json.loads(body)
    return '200 OK' in head and body['status'] == 'ok'


if __name__ == '__main__':
    healthy = False

    try:
        healthy = healthcheck()
    except:  # noqa: F821
        pass

    sys.exit(0 if healthy else 1)
