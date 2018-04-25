package io.totokaka.dipeck.worker.service;

import com.google.gson.Gson;
import org.junit.Before;
import org.junit.Test;
import org.mockito.*;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.logging.Logger;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class PublisherTest {

    @Mock
    private Jedis jedis;
    @Captor
    private ArgumentCaptor<String> captor;

    private Gson gson;
    private Publisher publisher;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        JedisPool pool = mock(JedisPool.class);
        when(pool.getResource()).thenReturn(jedis);

        this.gson = new Gson();
        this.publisher = new Publisher(pool, mock(Logger.class), gson);
    }

    @Test
    public void testPublishPrime() {
        this.publisher.publish(113, true);

        Packet expected = new Packet("result", 113, true);

        verify(jedis).publish(eq("calculation-results"), captor.capture());
        Packet actual = gson.fromJson(captor.getValue(), Packet.class);

        assertEquals(expected, actual);
    }

    @Test
    public void testPublishNonPrime() {
        this.publisher.publish(114, false);

        Packet expected = new Packet("result", 114, false);

        verify(jedis).publish(eq("calculation-results"), captor.capture());
        Packet actual = gson.fromJson(captor.getValue(), Packet.class);

        assertEquals(expected, actual);
    }
}