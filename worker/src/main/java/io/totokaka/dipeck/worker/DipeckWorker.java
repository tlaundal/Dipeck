package io.totokaka.dipeck.worker;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DipeckWorker {

    private static final String QUEUE_NAME = "is-prime";

    private final Logger logger;

    public DipeckWorker() {
        this.logger = Logger.getLogger("DipeckWorker");
    }

    private String getEnvVar(String key, String default_value) {
        String value = System.getenv(key);
        return value == null ? default_value : value;
    }

    private void run() {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(getEnvVar("DIPECK_MQ_HOST", "localhost"));
        factory.setPort(Integer.valueOf(getEnvVar("DIPECK_MQ_PORT", "5672")));
        factory.setUsername(getEnvVar("DIPECK_MQ_USER", ""));
        factory.setPassword(getEnvVar("DIPECK_MQ_PASS", ""));

        Channel channel;
        try {
            logger.log(Level.INFO, "Connecting to RabbitMQ {0}@{1}:{2}",
                    new String[]{factory.getUsername(), factory.getHost(), String.valueOf(factory.getPort())});
            Connection connection = factory.newConnection();
            channel = connection.createChannel();
            channel.queueDeclare(QUEUE_NAME, false, false, false, null);
            logger.info("Connection to RabbitMQ established");
        } catch (TimeoutException|IOException ex) {
            logger.log(Level.SEVERE, "Error while connecting to the MessageQueue", ex);
            System.exit(2);
            return;
        }


        MessageHandler handler = new MessageHandler(logger);
        MessageConsumer consumer = new MessageConsumer(channel, handler, logger);

        try {
            logger.info("Waiting for tasks");
            channel.basicConsume(QUEUE_NAME, consumer);
        } catch (IOException ex) {
            logger.log(Level.SEVERE, "Error with consumer", ex);
        }
    }

    public static void main(String[] args) {
        DipeckWorker worker = new DipeckWorker();
        worker.logger.info("Starting up...");
        try {
            worker.run();
        } catch (Exception ex) {
            worker.logger.log(Level.SEVERE, "Unhandled exception. Shutting down", ex);
            System.exit(1);
        }
    }

}
