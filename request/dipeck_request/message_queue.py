from flask import g
import pika


class MessageQueue:

    def __init__(self, host='localhost', port=5672, user='', pswd='',
                 connection_factory=pika.BlockingConnection):
        self._credentials = pika.PlainCredentials(user, pswd)
        self._params = pika.ConnectionParameters(host, port, '/',
                                                 self._credentials)
        self._connection_factory = connection_factory

    def _get_connection(self):
        if not hasattr(g, 'mq'):
            g.mq = self._connection_factory(self._params)
        return g.mq

    def _get_channel(self):
        connection = self._get_connection()
        channel = connection.channel()

        channel.queue_declare(queue='is-prime')

        return channel

    def enqueue(self, num):
        """ Enqueue a number to be checked. """
        self._get_channel().basic_publish(exchange='', routing_key='is-prime',
                                          body=str(num))

    def register_teardown(self, app):
        def teardown(error):
            if hasattr(g, 'mq'):
                g.mq.close()

        app.teardown_appcontext(teardown)
