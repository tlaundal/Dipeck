package io.totokaka.dipeck.worker.service;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Envelope;
import io.totokaka.dipeck.worker.handling.MessageHandler;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.logging.Logger;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class MessageConsumerTest {

    private Channel channel;
    private MessageHandler handler;
    private MessageConsumer consumer;
    private Envelope envelope;

    @Before
    public void setUp() throws Exception {
        this.channel = mock(Channel.class);
        this.handler = mock(MessageHandler.class);
        this.consumer = new MessageConsumer(channel, handler, mock(Logger.class));
        this.envelope = mock(Envelope.class);
    }

    @Test
    public void testAcknowledges() throws IOException {
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), "113".getBytes());

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
        doThrow(new RuntimeException("Calculation failed!")).when(handler).handle("113");
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), "113".getBytes());

        verify(channel).basicAck(envelope.getDeliveryTag(), false);
    }

    @Test
    public void testPassesValueOn() throws Exception {
        consumer.handleDelivery("tag", envelope, mock(AMQP.BasicProperties.class), "113".getBytes());

        verify(handler).handle("113");
    }
}
