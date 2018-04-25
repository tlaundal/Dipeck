package io.totokaka.dipeck.worker.service;

import com.google.gson.Gson;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Publisher {

    private static final String CHANNEL_NAME = "calculation-results";

    private final JedisPool pool;
    private final Logger logger;
    private final Gson gson;

    public Publisher(JedisPool jedisPool, Logger logger, Gson gson) {
        this.pool = jedisPool;
        this.logger = logger;
        this.gson = gson;
    }

    public void publish(long number, boolean isPrime) {
        try (Jedis jedis = pool.getResource()){
            this.logger.log(Level.INFO, "Publishing result for {0}: {1}", new Object[]{number, isPrime});
            Packet packet = new Packet("result", number, isPrime);
            jedis.publish(CHANNEL_NAME, gson.toJson(packet));
        }
    }

}
