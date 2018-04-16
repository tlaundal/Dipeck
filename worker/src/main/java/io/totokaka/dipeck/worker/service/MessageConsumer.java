package io.totokaka.dipeck.worker.service;

import com.rabbitmq.client.*;
import io.totokaka.dipeck.worker.handling.MessageHandler;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class MessageConsumer extends DefaultConsumer {

    private final MessageHandler handler;
    private final Logger logger;

    public MessageConsumer(Channel channel, MessageHandler handler, Logger logger) {
        super(channel);
        this.handler = handler;
        this.logger = logger;
    }

    @Override
    public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body)
            throws IOException {
        String message = new String(body, "UTF-8");
        try {
            handler.handle(message);
            super.getChannel().basicAck(envelope.getDeliveryTag(), false);
        } catch (Exception ex) {
            this.logger.log(Level.WARNING, "Error while handling message", ex);
        }
    }

}
