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

    const packet = JSON.parse(message);
    switch (packet.type) {
    case 'result':
      return this.handleResult(packet);
    default:
      return this.logger.warn(`Received packet of uknown kind: ${message}`);
    }
  }

  handleResult(packet) {
    this.logger.info(`Recieved result: ${packet.number} is prime: ${packet.isPrime}`);
    for (let client of this.clients) {
      client.broadcast(packet);
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
    const packet = JSON.parse(message);
    switch (packet.type) {
    case 'target':
      return this.handleTarget(packet);
    case 'status':
      return this.handleStatus(packet);
    default:
      return this.logger.warn(`Recieved uknown ws packet: ${packet}`);
    }
  }

  async handleTarget(packet) {
    this.lookingFor = packet.number;
    this.logger.info(`[${this.id}] Looking for: ${this.lookingFor}`);
    if (await this.cache.exists(this.lookingFor)) {
      const isPrime = !!parseInt(await this.cache.get(this.lookingFor));
      this.logger.info(`[${this.id}] Using cached result`);
      this.broadcast({
        type: 'result',
        number: this.lookingFor,
        isPrime
      });
    }
  }

  async handleStatus() {
    const pong = await this.cache.ping();
    this.ws.send(JSON.stringify({
      type: 'status',
      healthy: pong
    }));
  }

  broadcast(packet) {
    if (!this.lookingFor || this.lookingFor === packet.number) {
      this.logger.info(`[${this.id}] Broadcasting result: ${packet.isPrime}`);
      this.ws.send(JSON.stringify(packet));
    }
  }
}

DipeckNotification.Client = Client;
module.exports = DipeckNotification;
