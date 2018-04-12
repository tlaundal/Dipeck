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


app = Flask(__name__)
app.config.from_object(Configuration)

cache = Cache()
message_queue = MessageQueue(app.config["MQ_HOST"], app.config["MQ_PORT"],
                             app.config["MQ_USER"], app.config["MQ_PASS"])

from . import views # noqa
