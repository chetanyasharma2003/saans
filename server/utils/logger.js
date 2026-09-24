const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, data = {}) => {
    const logMessage = `[${getTimestamp()}] INFO: ${message} ${JSON.stringify(data)}\n`;
    console.log(`✅ ${logMessage.trim()}`);
    fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage);
  },

  error: (message, error = {}) => {
    const logMessage = `[${getTimestamp()}] ERROR: ${message} ${JSON.stringify(error)}\n`;
    console.error(`❌ ${logMessage.trim()}`);
    fs.appendFileSync(path.join(logsDir, 'error.log'), logMessage);
  },

  warn: (message, data = {}) => {
    const logMessage = `[${getTimestamp()}] WARN: ${message} ${JSON.stringify(data)}\n`;
    console.warn(`⚠️  ${logMessage.trim()}`);
    fs.appendFileSync(path.join(logsDir, 'app.log'), logMessage);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[${getTimestamp()}] DEBUG: ${message}`;
      console.log(`🔍 ${logMessage}`, data);
    }
  },

  request: (method, path, statusCode, duration) => {
    const logMessage = `[${getTimestamp()}] ${method} ${path} - ${statusCode} (${duration}ms)\n`;
    console.log(`🌐 ${logMessage.trim()}`);
    fs.appendFileSync(path.join(logsDir, 'request.log'), logMessage);
  }
};

module.exports = logger;
