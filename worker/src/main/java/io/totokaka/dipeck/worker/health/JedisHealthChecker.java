package io.totokaka.dipeck.worker.health;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class JedisHealthChecker implements HealthChecked {
    private final JedisPool jedisPool;

    public JedisHealthChecker(JedisPool jedisPool) {
        this.jedisPool = jedisPool;
    }

    @Override
    public boolean checkHealth() {
        try (Jedis jedis = jedisPool.getResource()) {
            String response = jedis.ping();

            return response.equals("PONG");
        } catch (Exception ignored) {
            return false;
        }
    }
}
