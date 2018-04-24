package io.totokaka.dipeck.worker;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.totokaka.dipeck.worker.handling.MessageHandler;
import io.totokaka.dipeck.worker.service.Cache;
import io.totokaka.dipeck.worker.service.MessageConsumer;
import io.totokaka.dipeck.worker.service.Publisher;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.exceptions.JedisException;

import java.io.IOException;
import java.net.ConnectException;
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
        Channel messageQueue;
        try {
            messageQueue = connectRabbitMQ();
        } catch (IOException|TimeoutException|InterruptedException ex) {
            logger.log(Level.SEVERE, "Error while connecting to RabbitMQ", ex);
            System.exit(2);
            return;
        }

        Cache cache;
        Publisher publisher;
        try {
            JedisPool jedisPool = connectRedis();

            cache = new Cache(jedisPool);
            publisher = new Publisher(jedisPool);
        } catch (JedisException ex) {
            logger.log(Level.SEVERE, "Error while connecting to Redis", ex);
            System.exit(2);
            return;
        }


        MessageHandler handler = new MessageHandler(logger, cache, publisher);
        MessageConsumer consumer = new MessageConsumer(messageQueue, handler, logger);

        try {
            logger.info("Waiting for tasks");
            messageQueue.basicConsume(QUEUE_NAME, false, consumer);
        } catch (IOException ex) {
            logger.log(Level.SEVERE, "Error with consumer", ex);
        }
    }

    private JedisPool connectRedis() {
        String host = getEnvVar("DIPECK_CACHE_HOST", "localhost");
        int port = Integer.parseInt(getEnvVar("DIPECK_CACHE_PORT", "6379"));
        JedisPool jedisPool = new JedisPool(
                new JedisPoolConfig(),
                host, port
        );

        logger.log(Level.INFO, "Connecting to Redis {0}:{1}",
                new String[]{host, String.valueOf(port)});

        try (Jedis jedis = jedisPool.getResource()) {
            jedis.ping();
        }

        return jedisPool;
    }

    private Channel connectRabbitMQ() throws IOException, TimeoutException, InterruptedException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(getEnvVar("DIPECK_MQ_HOST", "localhost"));
        factory.setPort(Integer.parseInt(getEnvVar("DIPECK_MQ_PORT", "5672")));
        factory.setUsername(getEnvVar("DIPECK_MQ_USER", ""));
        factory.setPassword(getEnvVar("DIPECK_MQ_PASS", ""));

        logger.log(Level.INFO, "Connecting to RabbitMQ {0}@{1}:{2}",
                new String[]{factory.getUsername(), factory.getHost(), String.valueOf(factory.getPort())});
        Connection connection = null;
        for (int i = 0; i < 5; i++) {
            try {
                connection = factory.newConnection();
                break;
            } catch (ConnectException ex) {
                if (i == 4) {
                    throw ex;
                } else {
                    logger.warning("Failed to connect. Sleeping for " + (i+1) + " seconds before retrying");
                    Thread.sleep((i+1) * 1000L);
                }
            }
        }
        assert connection != null;

        Channel channel = connection.createChannel();
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        channel.basicQos(1);
        logger.info("Connection to RabbitMQ established");
        return channel;
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
