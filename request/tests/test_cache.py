import unittest
from dipeck_request.cache import Cache


class MockRedis:

    def __init__(self):
        self._cache = {}

    def mock_init(self, host='', port=0):
        return self

    def exists(self, key):
        return key in self._cache

    def get(self, key):
        return self._cache.get(key)

    def set(self, key, value):
        self._cache[key] = value


class TestCache(unittest.TestCase):

    def setUp(self):
        self.mock = MockRedis()
        self.cache = Cache(redis_factory=self.mock.mock_init)

    def test_get(self):
        self.assertEqual(None, self.cache.get(13))

        self.mock.set('13', '1')
        self.assertEqual(True, self.cache.get(13))

        self.mock.set('12', '0')
        self.assertEqual(False, self.cache.get(12))

    def test_contains(self):
        self.assertFalse(self.cache.contains(13))

        self.mock.set('13', '1')
        self.assertTrue(self.cache.contains(13))
