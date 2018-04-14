package io.totokaka.dipeck.worker.service;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class Cache {

    private final JedisPool pool;

    public Cache(JedisPool jedisPool) {
        this.pool = jedisPool;
    }

    public void cache(long number, boolean isPrime) {
        try (Jedis jedis = pool.getResource()){
            jedis.set(String.valueOf(number), formatBoolean(isPrime));
            jedis.publish("calculation-results", formatBoolean(isPrime));
        }
    }

    private String formatBoolean(boolean bool) {
        return bool ? "1": "0";
    }

}
