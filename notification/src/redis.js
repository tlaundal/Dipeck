const redis = require('redis');

class Redis {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.subscribers = new Set();
  }

  connect(factory=redis.createClient) {
    this.client = factory(this.port, this.host);
  }

  subscribe(channel, listener, factory=redis.createClient) {
    const client = factory(this.port, this.host);

    client.on('message', listener);
    client.subscribe(channel);

    this.subscribers.add(client);
  }

  exists(key) {
    return this.client.exists(key);
  }

  get(key) {
    return this.client.get(key);
  }

}

module.exports = Redis;
