import unittest
import flask
from dipeck_request.message_queue import MessageQueue


class MockConnection():

    def __init__(self):
        self.initialized = False
        self.closed = False

    def mock_init(self, conn_params):
        self.initialized = True
        return self

    def channel(self):
        return self

    def close(self):
        self.closed = True

    def queue_declare(self, **kwargs):
        self.queue = kwargs

    def basic_publish(self, **kwargs):
        self.publish = kwargs


class TestMessageQueue(unittest.TestCase):

    def setUp(self):
        self.mock = MockConnection()
        self.mq = MessageQueue(connection_factory=self.mock.mock_init)
        self.app = flask.Flask(__name__)
        self.mq.register_teardown(self.app)

    def test_mq_lifecycle(self):
        assert not self.mock.initialized
        assert not self.mock.closed

        with self.app.test_request_context('/is-prime?num=13'):
            self.mq.enqueue(13)
            self.assertTrue(self.mock.initialized)
            self.assertEqual('is-prime', self.mock.queue['queue'])
        self.assertTrue(self.mock.closed)

    def test_enqueue(self):
        with self.app.test_request_context('/is-prime?num=13'):
            self.mq.enqueue(13)
            self.assertEqual('is-prime', self.mock.publish['routing_key'])
            self.assertEqual('13', self.mock.publish['body'])
