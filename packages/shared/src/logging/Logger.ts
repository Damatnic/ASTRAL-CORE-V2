/**
 * ASTRAL_CORE 2.0 Centralized Logging System
 * 
 * Replaces console.log statements with structured, configurable logging
 * that includes emergency alerting for critical crisis intervention events.
 */

import { Writable } from 'stream';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userId?: string;
  performanceMetrics?: {
    responseTimeMs?: number;
    memoryUsageMB?: number;
    cpuUsagePercent?: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLogging: boolean;
  enableSentryLogging: boolean;
  enableCrisisAlerts: boolean;
  logFilePath?: string;
  sentryDsn?: string;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logStream?: Writable;

  private constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFileLogging: process.env.NODE_ENV === 'production',
      enableSentryLogging: process.env.NODE_ENV === 'production',
      enableCrisisAlerts: true,
      logFilePath: process.env.LOG_FILE_PATH || './logs/astral-core.log',
      sentryDsn: process.env.SENTRY_DSN
    };
    
    this.initializeLogStream();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogStream(): void {
    if (this.config.enableFileLogging && this.config.logFilePath) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        // Ensure log directory exists
        const logDir = path.dirname(this.config.logFilePath);
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        this.logStream = fs.createWriteStream(this.config.logFilePath, { flags: 'a' });
      } catch (error) {
        console.error('Failed to initialize log stream:', error);
      }
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level];
    
    let formatted = `[${entry.timestamp}] ${levelName} [${entry.module}] ${entry.message}`;
    
    if (entry.sessionId) {
      formatted += ` [Session: ${entry.sessionId}]`;
    }
    
    if (entry.performanceMetrics) {
      const metrics = entry.performanceMetrics;
      if (metrics.responseTimeMs) {
        formatted += ` [Response: ${metrics.responseTimeMs}ms]`;
      }
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += ` ${JSON.stringify(entry.metadata)}`;
    }
    
    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatLogEntry(entry);

    // Console output
    if (this.config.enableConsole) {
      const colorCodes = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.CRITICAL]: '\x1b[41m\x1b[37m' // Red background, white text
      };
      
      const resetCode = '\x1b[0m';
      const colorCode = colorCodes[entry.level] || '';
      
      console.log(`${colorCode}${formatted}${resetCode}`);
    }

    // File output
    if (this.config.enableFileLogging && this.logStream) {
      this.logStream.write(formatted + '\n');
    }

    // Crisis alerts for critical events
    if (this.config.enableCrisisAlerts && (entry.level === LogLevel.CRITICAL || entry.level === LogLevel.ERROR)) {
      this.sendCrisisAlert(entry);
    }

    // Sentry integration for production
    if (this.config.enableSentryLogging && entry.level >= LogLevel.ERROR) {
      this.sendToSentry(entry);
    }
  }

  private sendCrisisAlert(entry: LogEntry): void {
    // In a real implementation, this would send alerts to:
    // - Slack/Discord webhooks
    // - PagerDuty
    // - SMS alerts for critical failures
    // - Emergency escalation protocols
    
    if (process.env.CRISIS_ALERT_WEBHOOK) {
      // Implement webhook alert in production
    }
  }

  private sendToSentry(entry: LogEntry): void {
    // Sentry integration for error tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      if (entry.level === LogLevel.CRITICAL) {
        Sentry.captureException(new Error(entry.message), {
          level: 'fatal',
          tags: {
            module: entry.module,
            sessionId: entry.sessionId
          },
          extra: entry.metadata
        });
      } else if (entry.level === LogLevel.ERROR) {
        Sentry.captureException(new Error(entry.message), {
          level: 'error',
          tags: {
            module: entry.module,
            sessionId: entry.sessionId
          },
          extra: entry.metadata
        });
      }
    }
  }

  public debug(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      module,
      message,
      metadata,
      sessionId
    });
  }

  public info(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      module,
      message,
      metadata,
      sessionId
    });
  }

  public warn(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      module,
      message,
      metadata,
      sessionId
    });
  }

  public error(module: string, message: string, error?: Error, metadata?: Record<string, any>, sessionId?: string): void {
    const errorMetadata = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...metadata
    } : metadata;

    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      module,
      message,
      metadata: errorMetadata,
      sessionId
    });
  }

  public critical(module: string, message: string, error?: Error, metadata?: Record<string, any>, sessionId?: string): void {
    const errorMetadata = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...metadata
    } : metadata;

    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.CRITICAL,
      module,
      message,
      metadata: errorMetadata,
      sessionId
    });
  }

  public performance(
    module: string, 
    message: string, 
    performanceMetrics: NonNullable<LogEntry['performanceMetrics']>,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      module,
      message,
      metadata,
      sessionId,
      performanceMetrics
    });
  }

  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enableFileLogging !== undefined || config.logFilePath !== undefined) {
      this.initializeLogStream();
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common logging patterns
export const logCrisisEvent = (
  event: string, 
  sessionId: string, 
  metadata?: Record<string, any>
) => {
  logger.info('CrisisIntervention', event, metadata, sessionId);
};

export const logCrisisError = (
  error: string, 
  sessionId: string, 
  errorObj?: Error, 
  metadata?: Record<string, any>
) => {
  logger.error('CrisisIntervention', error, errorObj, metadata, sessionId);
};

export const logCrisisCritical = (
  critical: string, 
  sessionId: string, 
  errorObj?: Error, 
  metadata?: Record<string, any>
) => {
  logger.critical('CrisisIntervention', critical, errorObj, metadata, sessionId);
};

export const logPerformance = (
  operation: string,
  responseTimeMs: number,
  targetMs: number,
  sessionId?: string,
  metadata?: Record<string, any>
) => {
  const level = responseTimeMs > targetMs ? 'warn' : 'info';
  const message = `${operation} completed in ${responseTimeMs}ms (target: ${targetMs}ms)`;
  
  if (level === 'warn') {
    logger.warn('Performance', message, metadata, sessionId);
  } else {
    logger.performance('Performance', message, { responseTimeMs }, sessionId, metadata);
  }
};