/**
 * ASTRAL Core V2 - Production Logging System
 * Secure, structured logging for crisis intervention platform
 */

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
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  component?: string;
  feature?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly logLevel = parseInt(process.env.LOG_LEVEL || '2'); // Default to WARN in production

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      environment: process.env.NODE_ENV,
      service: 'astral-web'
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
      correlationId: this.generateCorrelationId()
    };

    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    } else {
      console.log(this.formatLogEntry(entry));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
      correlationId: this.generateCorrelationId()
    };

    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    } else {
      console.log(this.formatLogEntry(entry));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
      correlationId: this.generateCorrelationId()
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      console.warn(this.formatLogEntry(entry));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      correlationId: this.generateCorrelationId(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      console.error(this.formatLogEntry(entry));
    }
  }

  critical(message: string, error?: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.CRITICAL,
      message,
      context,
      correlationId: this.generateCorrelationId(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    // Critical logs always go to console regardless of environment
    if (this.isDevelopment) {
      console.error(`[CRITICAL] ${message}`, error, context);
    } else {
      console.error(this.formatLogEntry(entry));
    }

    // In production, also trigger alerting mechanisms
    if (!this.isDevelopment) {
      this.triggerAlert(entry);
    }
  }

  // Crisis-specific logging methods
  crisisEvent(message: string, userId: string, sessionId: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.CRITICAL,
      message: `[CRISIS] ${message}`,
      userId,
      sessionId,
      context,
      feature: 'crisis-intervention',
      correlationId: this.generateCorrelationId()
    };

    // Crisis events are always logged
    console.error(this.formatLogEntry(entry));
    this.triggerAlert(entry);
  }

  securityEvent(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.CRITICAL,
      message: `[SECURITY] ${message}`,
      context,
      component: 'security',
      correlationId: this.generateCorrelationId()
    };

    // Security events are always logged
    console.error(this.formatLogEntry(entry));
    this.triggerAlert(entry);
  }

  private triggerAlert(entry: LogEntry): void {
    // In a real implementation, this would send alerts to monitoring systems
    // For now, we'll just ensure the log is captured
    try {
      // Store in localStorage for recovery analysis in browser
      if (typeof window !== 'undefined') {
        const alerts = JSON.parse(localStorage.getItem('astral-alerts') || '[]');
        alerts.push(entry);
        
        // Keep only last 50 alerts
        if (alerts.length > 50) {
          alerts.splice(0, alerts.length - 50);
        }
        
        localStorage.setItem('astral-alerts', JSON.stringify(alerts));
      }
    } catch (error) {
      // Fail silently to avoid infinite loops
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context),
  critical: (message: string, error?: Error, context?: Record<string, any>) => logger.critical(message, error, context),
  crisis: (message: string, userId: string, sessionId: string, context?: Record<string, any>) => 
    logger.crisisEvent(message, userId, sessionId, context),
  security: (message: string, context?: Record<string, any>) => logger.securityEvent(message, context)
};

export default logger;