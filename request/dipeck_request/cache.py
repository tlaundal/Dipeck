import redis


class Cache:

    def __init__(self, host, port):
        self.__redis = redis.StrictRedis(host=host, port=port)

    def contains(self, num):
        return self.__redis.exists(str(num))

    def get(self, num):
        return bool(int(self.__redis.get(str(num))))
