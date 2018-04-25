package io.totokaka.dipeck.worker.handling;

import io.totokaka.dipeck.worker.service.Cache;
import io.totokaka.dipeck.worker.service.Publisher;
import org.junit.Before;
import org.junit.Test;

import java.util.logging.Logger;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class MessageHandlerTest {

    private Cache cache;
    private Publisher publisher;
    private MessageHandler messageHandler;

    @Before
    public void setUp() {
        this.cache = mock(Cache.class);
        this.publisher = mock(Publisher.class);
        this.messageHandler = new MessageHandler(mock(Logger.class), this.cache, this.publisher);
    }

    @Test
    public void testHandlePrime() {
        messageHandler.handle(113L);

        verify(this.cache).cache(113L, true);
        verify(this.publisher).publish(113L, true);
    }

    @Test
    public void testHandleNonPrime() {
        messageHandler.handle(114L);

        verify(this.cache).cache(114L, false);
        verify(this.publisher).publish(114L, false);
    }
}