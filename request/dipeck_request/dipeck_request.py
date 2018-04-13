from flask import Flask
from flask_env import MetaFlaskEnv
from .cache import Cache
from .message_queue import MessageQueue


class Configuration(metaclass=MetaFlaskEnv):
    ENV_PREFIX = 'DIPECK_'

    MQ_HOST = 'localhost'
    MQ_PORT = 5672
    MQ_USER = 'RabbitMQ'
    MQ_PASS = 'RabbitMQ'

    CACHE_HOST = 'localhost'
    CACHE_PORT = 6379


def create_app(message_queue_factory=MessageQueue, cache_factory=Cache):
    app = Flask(__name__)
    app.config.from_object(Configuration)

    app.cache = cache_factory(app.config["CACHE_HOST"],
                              app.config["CACHE_PORT"])
    app.message_queue = message_queue_factory(app.config["MQ_HOST"],
                                              app.config["MQ_PORT"],
                                              app.config["MQ_USER"],
                                              app.config["MQ_PASS"])
    app.message_queue.register_teardown(app)

    from .views import views
    app.register_blueprint(views)

    return app
