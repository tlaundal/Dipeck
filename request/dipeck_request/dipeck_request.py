from flask import Flask
from .cache import Cache
from .message_queue import MessageQueue


app = Flask(__name__)
cache = Cache()
message_queue = MessageQueue()

from . import views # noqa
