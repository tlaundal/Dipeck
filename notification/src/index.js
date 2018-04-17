const winston = require('winston');
const Redis = require('./redis.js');
const WebSocket = require('ws');
const DipeckNotification = require('./main.js');

function findProperties() {
  const host = process.env.DIPECK_CACHE_HOST || 'localhost';
  const port = parseInt(process.env.DIPECK_CACHE_PORT) || 6379;
  return {host, port};
}

function start() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

  logger.info('Starting dipeck_notification');

  const props = findProperties();
  const redis = new Redis(props.host, props.port);

  const dipeckNotification = new DipeckNotification(logger, redis);

  logger.info(`Connecting to redis on ${props.host}:${props.port}`);
  redis.connect();

  logger.info('Opening WebSocket server on port 8080');
  const wss = new WebSocket.Server({ port: 8080 });
  wss.on('connection', dipeckNotification.onConnection);
}

if (require.main === module) {
  start();
}
module.exports = {
  start,
  findProperties
};
