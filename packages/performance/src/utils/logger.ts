/// <reference path="./logger.d.ts" />
/**
 * Logger utility for performance monitoring
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    json()
  ),
  defaultMeta: { 
    service: 'performance-monitor',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        consoleFormat
      )
    }),
    
    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: json()
    }),
    
    // File transport for errors only
    new DailyRotateFile({
      filename: 'logs/performance-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: json()
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/performance-exceptions.log' 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/performance-rejections.log' 
    })
  ]
});

// Add critical level for crisis situations
logger.critical = function(message: string, meta?: any) {
  return this.log({
    level: 'error',
    message: `[CRITICAL] ${message}`,
    critical: true,
    ...meta
  });
};

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Add external logging service transport (e.g., CloudWatch, Datadog)
  // logger.add(new CloudWatchTransport({ ... }));
}

// Development helpers
if (process.env.NODE_ENV === 'development') {
  logger.debug('Logger initialized in development mode');
}

export default logger;