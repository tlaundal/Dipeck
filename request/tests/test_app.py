import unittest
import json
from dipeck_request.dipeck_request import create_app


class MockCache:

    def __init__(self, *args, **kwargs):
        self._cache = {'13': True}

    def contains(self, num):
        return str(num) in self._cache

    def get(self, num):
        return self._cache.get(str(num))


class MockMessageQueue:

    def __init__(self, *args, **kwargs):
        self.queue = []

    def enqueue(self, num):
        self.queue.append(str(num))

    def register_teardown(self, app):
        pass


class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = create_app(message_queue_factory=MockMessageQueue,
                              cache_factory=MockCache)
        self.app.testing = True
        self.app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
        self.client = self.app.test_client()

    def test_status(self):
        res = self.client.get('/')
        body = json.loads(res.data.decode())
        self.assertEqual({'status': 'ok'}, body)

    def test_enqueue_errors(self):
        res = self.client.get('is-prime')
        body = json.loads(res.data.decode())

        self.assertEqual(res.status_code, 400)
        self.assertEqual(body['type'], 'error')
        self.assertIn('code', body)
        self.assertIn('message', body)

        res = self.client.get('is-prime?num=a')
        body = json.loads(res.data.decode())

        self.assertEqual(res.status_code, 400)
        self.assertEqual(body['type'], 'error')
        self.assertIn('code', body)
        self.assertIn('message', body)

    def test_enqueue_results(self):
        res = self.client.get('is-prime?num=13')
        body = json.loads(res.data.decode())

        self.assertEqual(res.status_code, 200)
        self.assertEqual(body, {
            'type': 'result',
            'number': 13,
            'isPrime': True
        })

        res = self.client.get('is-prime?num=11')
        body = json.loads(res.data.decode())

        self.assertEqual(res.status_code, 200)
        self.assertEqual(body, {
            'type': 'enqueued',
            'number': 11
        })
