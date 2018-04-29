package io.totokaka.dipeck.worker.health;

import org.junit.Before;
import org.junit.Test;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class JedisHealthCheckerTest {

    private Jedis jedis;
    private JedisHealthChecker healthChecker;

    @Before
    public void setUp() {
        this.jedis = mock(Jedis.class);

        JedisPool jedisPool = mock(JedisPool.class);
        when(jedisPool.getResource()).thenReturn(this.jedis);

        healthChecker = new JedisHealthChecker(jedisPool);
    }

    @Test
    public void checkHealth() {
        when(jedis.ping()).thenReturn("PONG");

        assertTrue(healthChecker.checkHealth());
    }

    @Test
    public void checkHealthFail() {
        when(jedis.ping()).thenThrow(new RuntimeException("No connection"));

        assertFalse(healthChecker.checkHealth());
    }
}