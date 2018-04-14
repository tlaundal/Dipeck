const WebSocket = require('ws');
const redis = require('redis');

const CHANNEL_NAME = 'calculation-results';

class DipeckNotification {
  constructor() {
    this.clients = new Set();

    console.log('Listening ws on port 8080');
    this.wss = new WebSocket.Server({ port: 8080 });
    this.wss.on('connection', this.onConnection.bind(this));

    const port = parseInt(process.env.DIPECK_CACHE_PORT) || 6379;
    const host = process.env.DIPECK_CACHE_HOST || 'localhost';
    console.log('Connecting to redis on', host, ':', port);
    this.redisClient = redis.createClient(port, host);
    this.redisClient.on('message', this.onMessage.bind(this));
    this.redisClient.subscribe(CHANNEL_NAME);

    console.log('Ready');
  }

  onConnection(ws) {
    console.log('New client');
    this.clients.add(new Client(ws));
  }

  onMessage(channel, message) {
    if (channel !== CHANNEL_NAME) {
      console.log('Message on wrong channel:', channel);
      return
    };

    const parts = message.split(':');
    if (parts.length !== 2) {
      console.log('Message of wrong format:', message);
      return;
    }
    const number = parseInt(parts[0]);
    const isPrime = parts[1] === '1';

    for (let client of this.clients) {
      client.broadcast(number, isPrime);
    }
  }
}

class Client {
  constructor(ws) {
    this.ws = ws;
    this.ws.on('message', this.onMessage.bind(this));
  }

  onMessage(message) {
    message == 1;
  }

  broadcast(number, isPrime) {
    isPrime = isPrime ? '1' : '0';
    console.log("Broadcasting:", number, isPrime);
    this.ws.send(`${number}:${isPrime}`);
  }
}

module.exports = DipeckNotification;
