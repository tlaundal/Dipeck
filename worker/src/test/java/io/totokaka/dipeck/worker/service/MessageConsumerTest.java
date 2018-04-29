package io.totokaka.dipeck.worker.service;

import com.google.gson.Gson;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Envelope;
import io.totokaka.dipeck.worker.handling.MessageHandler;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Answers;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import java.io.IOException;
import java.util.logging.Logger;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class MessageConsumerTest {

    private final static byte[] TASK = "{\"type\":\"task\",\"number\":113}".getBytes();

    private Channel channel;
    private MessageHandler handler;
    private MessageConsumer consumer;
    private Envelope envelope;

    @Before
    public void setUp() throws Exception {
        this.channel = mock(Channel.class);
        this.handler = mock(MessageHandler.class);
        this.consumer = new MessageConsumer(channel, handler, mock(Logger.class), new Gson());
        this.envelope = mock(Envelope.class);
    }

    @Test
    public void testAcknowledges() throws IOException {
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), TASK);

        verify(channel).basicAck(envelope.getDeliveryTag(), false);
    }

    /**
     * Ensures the consumer acknowledges also on exceptions.
     * This is because all other workes will likely fail with the same exception
     * and because the non-acknowledged message will not be re-sent before this
     * worker disconnects.
     */
    @Test
    public void testAcknowledgesOnException() throws IOException {
        doThrow(new RuntimeException("Calculation failed!")).when(handler).handle(113L);
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), TASK);

        verify(channel).basicAck(envelope.getDeliveryTag(), false);
    }

    @Test
    public void testPassesValueOn() throws Exception {
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), TASK);

        verify(handler).handle(113L);
    }

    @Test
    public void testCheckHealthWithoutRuns() throws IOException {
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), TASK);
        assertTrue(consumer.checkHealth());
    }

    @Test
    public void testCheckHealthWhenRunning() throws InterruptedException {
        Object lock = new Object();
        doAnswer(invocation -> {
            synchronized (lock) {
                lock.notify();
            }
            Thread.sleep(10);
            return null;
        }).when(handler).handle(anyLong());
        new Thread(() -> {
            try {
                consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), TASK);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();
        synchronized (lock) {
            lock.wait();
        }

        assertTrue(consumer.checkHealth());
    }
}
