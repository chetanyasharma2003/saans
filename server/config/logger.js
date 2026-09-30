const pino = require('pino');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

const pinoConfig = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
};

const logger = pino(pinoConfig);

// Create file transports for production
if (isProduction) {
  const transport = pino.transport({
    targets: [
      {
        level: 'info',
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'app.log') },
      },
      {
        level: 'error',
        target: 'pino/file',
        options: { destination: path.join(logsDir, 'error.log') },
      },
    ],
  });

  logger.info('Logging initialized in production mode');
}

module.exports = logger;
