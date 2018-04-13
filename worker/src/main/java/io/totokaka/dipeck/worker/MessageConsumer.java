package io.totokaka.dipeck.worker;

import com.rabbitmq.client.*;

import java.io.IOException;
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
        this.logger.info("Recieved message: " + message);
        handler.handle(message);
        super.getChannel().basicAck(envelope.getDeliveryTag(), false);
    }

}
