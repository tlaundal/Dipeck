const {promisify} = require('util');
const redis = require('redis');

class Redis {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.subscribers = new Set();
  }

  connect(factory=redis.createClient) {
    this.client = factory(this.port, this.host);
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.exists = promisify(this.client.exists).bind(this.client);
  }

  subscribe(channel, listener, factory=redis.createClient) {
    const client = factory(this.port, this.host);

    client.on('message', listener);
    client.subscribe(channel);

    this.subscribers.add(client);
  }

  async exists(key) {
    return await this.client.exists(key);
  }

  async get(key) {
    return await this.client.get(key);
  }

}

module.exports = Redis;
