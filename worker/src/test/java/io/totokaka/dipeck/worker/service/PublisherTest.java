package io.totokaka.dipeck.worker.service;

import org.junit.Before;
import org.junit.Test;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.logging.Logger;

import static org.mockito.Mockito.*;

public class PublisherTest {

    private Jedis jedis;
    private Publisher publisher;

    @Before
    public void setUp() throws Exception {
        this.jedis = mock(Jedis.class);
        JedisPool pool = mock(JedisPool.class);
        when(pool.getResource()).thenReturn(jedis);

        this.publisher = new Publisher(pool, mock(Logger.class));
    }

    @Test
    public void testPublishPrime() {
        this.publisher.publish(113, true);

        verify(jedis).publish("calculation-results", "113:1");
    }

    @Test
    public void testPublishNonPrime() {
        this.publisher.publish(114, false);

        verify(jedis).publish("calculation-results", "114:0");
    }
}