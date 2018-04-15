const winston = require('winston');
const DipeckWorker = require('./main.js');

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
new DipeckWorker(logger);
