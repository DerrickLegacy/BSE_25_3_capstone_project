// =====================
// logger.js – Winston logging configuration
// =====================

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use to print out messages
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, 'logs', 'app.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  // File transport for errors only
  new winston.transports.File({
    filename: path.join(__dirname, 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http',
  levels,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log the request
  logger.http(`${req.method} ${req.url} - ${req.ip}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function logResponseEnd(chunk, encoding) {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Add error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url} - ${req.ip}`, {
    error: err.stack,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  });
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
};
