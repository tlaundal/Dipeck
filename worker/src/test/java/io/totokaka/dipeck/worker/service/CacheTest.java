package io.totokaka.dipeck.worker.service;

import org.junit.Before;
import org.junit.Test;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class CacheTest {

    private Jedis jedis;
    private Cache cache;

    @Before
    public void setUp() {
        this.jedis = mock(Jedis.class);

        JedisPool jedisPool = mock(JedisPool.class);
        when(jedisPool.getResource()).thenReturn(this.jedis);

        this.cache = new Cache(jedisPool);
    }

    @Test
    public void testCachePrime() {
        cache.cache(113, true);

        verify(jedis).set("113", "1");
    }

    @Test
    public void testCacheNonPrime() {
        cache.cache(123, false);

        verify(jedis).set("123", "0");
    }
}