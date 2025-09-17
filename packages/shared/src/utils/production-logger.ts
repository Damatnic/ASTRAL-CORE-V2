/**
 * ASTRAL_CORE 2.0 - Production Logger Utility
 * 
 * Replaces console.log statements with structured, production-ready logging
 * Compatible with monitoring systems like DataDog, New Relic, Sentry
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  component?: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  crisisLevel?: 'normal' | 'elevated' | 'critical' | 'emergency';
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private isProduction = process.env.NODE_ENV === 'production';
  
  public static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    
    return JSON.stringify({
      timestamp,
      level,
      message: entry.message,
      component: entry.component,
      metadata: entry.metadata,
      userId: entry.userId,
      sessionId: entry.sessionId,
      crisisLevel: entry.crisisLevel
    });
  }

  public debug(message: string, metadata?: Record<string, any>, component?: string): void {
    if (!this.isProduction) {
      this.log({ level: LogLevel.DEBUG, message, timestamp: new Date(), metadata, component });
    }
  }

  public info(message: string, metadata?: Record<string, any>, component?: string): void {
    this.log({ level: LogLevel.INFO, message, timestamp: new Date(), metadata, component });
  }

  public warn(message: string, metadata?: Record<string, any>, component?: string): void {
    this.log({ level: LogLevel.WARN, message, timestamp: new Date(), metadata, component });
  }

  public error(message: string, error?: Error, metadata?: Record<string, any>, component?: string): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    this.log({ level: LogLevel.ERROR, message, timestamp: new Date(), metadata: errorMetadata, component });
  }

  public critical(message: string, error?: Error, metadata?: Record<string, any>, component?: string): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    this.log({ level: LogLevel.CRITICAL, message, timestamp: new Date(), metadata: errorMetadata, component });
  }

  // Crisis-specific logging methods
  public crisisEvent(message: string, crisisLevel: 'normal' | 'elevated' | 'critical' | 'emergency', metadata?: Record<string, any>): void {
    this.log({ 
      level: crisisLevel === 'emergency' || crisisLevel === 'critical' ? LogLevel.CRITICAL : LogLevel.INFO,
      message, 
      timestamp: new Date(), 
      metadata, 
      crisisLevel,
      component: 'CrisisSystem'
    });
  }

  public performanceMetric(message: string, duration: number, metadata?: Record<string, any>, component?: string): void {
    const perfMetadata = {
      ...metadata,
      duration_ms: duration,
      performance: true
    };
    
    // Log as warning if performance is poor
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    this.log({ level, message, timestamp: new Date(), metadata: perfMetadata, component });
  }

  private log(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    
    // In production, send to external logging service
    if (this.isProduction) {
      // Send to monitoring service (Sentry, DataDog, etc.)
      this.sendToMonitoringService(entry);
    } else {
      // Development logging to console
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
        [LogLevel.INFO]: '\x1b[32m',    // Green
        [LogLevel.WARN]: '\x1b[33m',    // Yellow
        [LogLevel.ERROR]: '\x1b[31m',   // Red
        [LogLevel.CRITICAL]: '\x1b[41m\x1b[37m' // Red background
      };
      
      const resetColor = '\x1b[0m';
      const color = colors[entry.level] || '';
      console.log(`${color}${formatted}${resetColor}`);
    }
  }

  private sendToMonitoringService(entry: LogEntry): void {
    // In a real production environment, this would send to:
    // - Sentry for error tracking
    // - DataDog for metrics
    // - CloudWatch for AWS
    // - Custom monitoring endpoints
    
    // For now, just ensure structured output
    console.log(this.formatLogEntry(entry));
    
    // Crisis-level events trigger immediate alerts
    if (entry.crisisLevel === 'emergency' || entry.level >= LogLevel.ERROR) {
      // Trigger alert systems
      this.triggerEmergencyAlert(entry);
    }
  }

  private triggerEmergencyAlert(entry: LogEntry): void {
    // In production, this would:
    // - Send to PagerDuty
    // - Trigger SMS alerts
    // - Notify on-call engineers
    // - Create incident tickets
    
    console.error(`[EMERGENCY ALERT] ${entry.message}`, entry.metadata);
  }
}

// Export singleton instance
export const logger = ProductionLogger.getInstance();

// Convenience functions
export const logInfo = (message: string, metadata?: Record<string, any>, component?: string) => 
  logger.info(message, metadata, component);

export const logError = (message: string, error?: Error, metadata?: Record<string, any>, component?: string) => 
  logger.error(message, error, metadata, component);

export const logCrisisEvent = (message: string, level: 'normal' | 'elevated' | 'critical' | 'emergency', metadata?: Record<string, any>) =>
  logger.crisisEvent(message, level, metadata);

export const logPerformance = (message: string, duration: number, metadata?: Record<string, any>, component?: string) =>
  logger.performanceMetric(message, duration, metadata, component);