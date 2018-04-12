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


app = Flask(__name__)
app.config.from_object(Configuration)

cache = Cache(app.config["CACHE_HOST"], app.config["CACHE_PORT"])
message_queue = MessageQueue(app.config["MQ_HOST"], app.config["MQ_PORT"],
                             app.config["MQ_USER"], app.config["MQ_PASS"])
message_queue.register_teardown(app)


from . import views # noqa
