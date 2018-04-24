package io.totokaka.dipeck.worker.service;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Publisher {

    private static final String CHANNEL_NAME = "calculation-results";

    private final JedisPool pool;
    private final Logger logger;

    public Publisher(JedisPool jedisPool, Logger logger) {
        this.pool = jedisPool;
        this.logger = logger;
    }

    public void publish(long number, boolean isPrime) {
        try (Jedis jedis = pool.getResource()){
            this.logger.log(Level.INFO, "Publishing result for {0}: {1}", new Object[]{number, isPrime});
            jedis.publish(CHANNEL_NAME, String.format("%d:%d", number, isPrime ? 1 : 0));
        }
    }

}
