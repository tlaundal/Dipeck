const uuid = require('uuid');
const CHANNEL_NAME = 'calculation-results';

class DipeckNotification {

  /**
   * In addition to instantiation, a WebSocket server should be started, with
   * the 'connection' event bound to onConnection
   */
  constructor(logger, redis) {
    this.logger = logger;
    this.redis = redis;
    this.clients = new Set();

    this.redis.subscribe(CHANNEL_NAME, this.onMessage.bind(this));
    this.onConnection = this.onConnection.bind(this);
  }

  onConnection(ws) {
    ws.id = uuid.v4().substr(9,4);
    this.logger.info(`[${ws.id}] New client connected`);

    const client = new Client(this.logger, this.redis, ws);
    this.clients.add(client);

    ws.on('close', () => this.clients.delete(client));
  }

  onMessage(channel, message) {
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

    this.logger.info(`Recieved result: ${number} is prime: ${isPrime}`);
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
    this.id = ws.id;

    this.ws.on('message', this.onMessage.bind(this));
  }

  async onMessage(message) {
    this.logger.info(`[${this.id}] Looking for: ${message}`);
    this.lookingFor = parseInt(message);

    if (await this.cache.exists(message)) {
      const isPrime = !!parseInt(await this.cache.get(message));
      this.logger.info(`[${this.id}] Using cached result`);
      this.broadcast(this.lookingFor, isPrime);
    }
  }

  broadcast(number, isPrime) {
    if (!this.lookingFor || this.lookingFor === number) {
      this.logger.info(`[${this.id}] Broadcasting result: ${isPrime}`);
      isPrime = isPrime ? '1' : '0';
      this.ws.send(`${number}:${isPrime}`);
    }
  }
}

DipeckNotification.Client = Client;
module.exports = DipeckNotification;
