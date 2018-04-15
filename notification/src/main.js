const WebSocket = require('ws');
const redis = require('redis');

const CHANNEL_NAME = 'calculation-results';

class DipeckNotification {
  constructor(logger) {
    this.logger = logger;
    this.clients = new Set();

    const port = parseInt(process.env.DIPECK_CACHE_PORT) || 6379;
    const host = process.env.DIPECK_CACHE_HOST || 'localhost';
    logger.info(`Connecting to redis on ${host}:${port}`);
    this.subscribeClient = redis.createClient(port, host);
    this.subscribeClient.on('message', this.onMessage.bind(this));
    this.subscribeClient.subscribe(CHANNEL_NAME);
    this.cacheClient = redis.createClient(port, host);

    logger.info('Opening WebSocket server on port 8080');
    this.wss = new WebSocket.Server({ port: 8080 });
    this.wss.on('connection', this.onConnection.bind(this));
  }

  onConnection(ws) {
    this.logger.debug('Accepted new connection');
    const client = new Client(this.logger, this.cacheClient, ws);
    this.clients.add(client);
    ws.on('close', () => this.clients.delete(client));
  }

  onMessage(channel, message) {
    this.logger.info(`Recieved message on channel ${channel}: ${message}`);
    if (channel !== CHANNEL_NAME) {
      this.logger.warn(`Received message on uknown channel: ${channel}`);
      return;
    }

    const parts = message.split(':');
    if (parts.length !== 2) {
      this.logger.warn(`Received message in uknown format: ${message}`);
      return;
    }
    const number = parseInt(parts[0]);
    const isPrime = parts[1] === '1';

    this.logger.info(`Announcing that ${number} is prime: ${isPrime}`);
    for (let client of this.clients) {
      client.broadcast(number, isPrime);
    }
  }
}

class Client {
  constructor(logger, cache, ws) {
    this.logger = logger;
    this.cache = cache;
    this.ws = ws;
    this.ws.on('message', this.onMessage.bind(this));
  }

  onMessage(message) {
    this.lookingFor = parseInt(message);

    if (this.cache.exists(this.lookingFor)) {
      const isPrime = !!parseInt(this.cache.get(this.lookingFor));
      this.broadcast(this.lookingFor, isPrime);
    }
  }

  broadcast(number, isPrime) {
    if (!this.lookingFor || this.lookingFor === number) {
      isPrime = isPrime ? '1' : '0';
      this.ws.send(`${number}:${isPrime}`);
    }
  }
}

module.exports = DipeckNotification;
