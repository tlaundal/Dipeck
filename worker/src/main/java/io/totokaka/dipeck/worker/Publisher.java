package io.totokaka.dipeck.worker;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class Publisher {

    private static final String CHANNEL_NAME = "calculation-results";

    private final JedisPool pool;

    public Publisher(JedisPool jedisPool) {
        this.pool = jedisPool;
    }

    public void publish(long number, boolean isPrime) {
        try (Jedis jedis = pool.getResource()){
            jedis.publish(CHANNEL_NAME, String.format("%d:%d", number, isPrime ? 1 : 0));
        }
    }

}
