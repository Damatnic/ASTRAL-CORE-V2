/**
 * Security-specific logger to avoid circular dependencies
 * Standalone logger for security events and audit trails
 */

export interface SecurityLogger {
  info(message: string, metadata?: any, sessionId?: string): void;
  warn(message: string, metadata?: any, sessionId?: string): void;
  error(message: string, metadata?: any, sessionId?: string): void;
}

class SecurityLoggerImpl implements SecurityLogger {
  private logToConsole(level: string, message: string, metadata?: any, sessionId?: string): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      sessionId,
      metadata,
      component: 'SecurityHardening'
    };
    
    if (level === 'ERROR') {
      console.error(`[${timestamp}] ${level}: ${message}`, metadata || '');
    } else if (level === 'WARN') {
      console.warn(`[${timestamp}] ${level}: ${message}`, metadata || '');
    } else {
      console.log(`[${timestamp}] ${level}: ${message}`, metadata || '');
    }
  }

  info(message: string, metadata?: any, sessionId?: string): void {
    this.logToConsole('INFO', message, metadata, sessionId);
  }

  warn(message: string, metadata?: any, sessionId?: string): void {
    this.logToConsole('WARN', message, metadata, sessionId);
  }

  error(message: string, metadata?: any, sessionId?: string): void {
    this.logToConsole('ERROR', message, metadata, sessionId);
  }
}

export const createLogger = (): SecurityLogger => new SecurityLoggerImpl();