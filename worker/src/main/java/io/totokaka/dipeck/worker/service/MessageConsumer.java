package io.totokaka.dipeck.worker.service;

import com.google.gson.Gson;
import com.rabbitmq.client.*;
import io.totokaka.dipeck.worker.handling.MessageHandler;
import io.totokaka.dipeck.worker.health.HealthChecked;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class MessageConsumer extends DefaultConsumer implements HealthChecked {

    private static final long HEALTH_TIMEOUT = 10 * 60 * 1000;

    private final MessageHandler handler;
    private final Logger logger;
    private final Gson gson;

    private long lastStart = -1;

    public MessageConsumer(Channel channel, MessageHandler handler, Logger logger, Gson gson) {
        super(channel);
        this.handler = handler;
        this.logger = logger;
        this.gson = gson;
    }

    @Override
    public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body)
            throws IOException {
        lastStart = System.currentTimeMillis();

        try {
            String message = new String(body, "UTF-8");
            Packet packet = gson.fromJson(message, Packet.class);

            if (packet.type.equals("task")) {
                handler.handle(packet.number);
            }
        } catch (Exception ex) {
            this.logger.log(Level.WARNING, "Error while handling message", ex);
        } finally {
            super.getChannel().basicAck(envelope.getDeliveryTag(), false);
            lastStart = -1;
        }
    }

    @Override
    public boolean checkHealth() {
        return lastStart == -1 || (System.currentTimeMillis() - lastStart) < HEALTH_TIMEOUT;
    }
}
