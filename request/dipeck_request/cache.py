import redis


class Cache:

    def __init__(self, host='localhost', port=6379,
                 redis_factory=redis.StrictRedis):
        self.__redis = redis_factory(host=host, port=port)

    def contains(self, num):
        return self.__redis.exists(str(num))

    def get(self, num):
        val = self.__redis.get(str(num))
        return bool(int(val)) if val is not None else None
