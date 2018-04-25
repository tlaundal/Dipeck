package io.totokaka.dipeck.worker.service;

import com.google.gson.Gson;
import com.rabbitmq.client.*;
import io.totokaka.dipeck.worker.handling.MessageHandler;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class MessageConsumer extends DefaultConsumer {

    private final MessageHandler handler;
    private final Logger logger;
    private final Gson gson;

    public MessageConsumer(Channel channel, MessageHandler handler, Logger logger, Gson gson) {
        super(channel);
        this.handler = handler;
        this.logger = logger;
        this.gson = gson;
    }

    @Override
    public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body)
            throws IOException {
        String message = new String(body, "UTF-8");
        Packet packet = gson.fromJson(message, Packet.class);

        try {
            if (packet.type.equals("task")) {
                handler.handle(packet.number);
            }
        } catch (Exception ex) {
            this.logger.log(Level.WARNING, "Error while handling message", ex);
        } finally {
            super.getChannel().basicAck(envelope.getDeliveryTag(), false);
        }
    }

}
