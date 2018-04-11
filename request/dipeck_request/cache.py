class Cache:

    def __init__(self):
        self._cache = {}

    def contains(self, num):
        return num in self._cache

    def get(self, num):
        return self._cache[num]
