/**
 * ASTRAL Core V2 - HIPAA-Compliant Error Logging Service
 * 
 * Secure logging system that captures technical errors while protecting
 * patient health information (PHI) and maintaining HIPAA compliance.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

import { z } from 'zod';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CRISIS_INTERVENTION = 'crisis_intervention',
  DATA_ACCESS = 'data_access',
  SYSTEM_ERROR = 'system_error',
  SECURITY_EVENT = 'security_event',
  PERFORMANCE = 'performance',
  VALIDATION = 'validation',
  EXTERNAL_SERVICE = 'external_service',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  code?: string;
  
  // Technical context (SAFE to log)
  technical: {
    component?: string;
    function?: string;
    stackTrace?: string;
    errorCode?: string;
    httpStatus?: number;
    requestId?: string;
    sessionId?: string; // Anonymized session identifier
    userAgent?: string;
    ipAddress?: string; // Hashed/anonymized
    path?: string;
    method?: string;
    duration?: number;
  };
  
  // Metadata (SAFE to log)
  metadata: {
    environment: string;
    version: string;
    buildId?: string;
    deployment?: string;
    region?: string;
  };
  
  // Anonymized user context (NO PHI)
  user?: {
    anonymousId: string; // Hashed user ID
    role?: string;
    sessionDuration?: number;
    isAuthenticated: boolean;
    lastActivity?: string;
  };
  
  // Performance metrics (SAFE to log)
  performance?: {
    responseTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    databaseQueryTime?: number;
    cacheHits?: number;
    cacheMisses?: number;
  };
}

// ============================================================================
// PHI DETECTION AND FILTERING
// ============================================================================

/**
 * Patterns that might indicate PHI or sensitive information
 */
const PHI_PATTERNS = [
  // Personal identifiers
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{9}\b/, // Plain SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
  /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
  /\b\(\d{3}\)\s*\d{3}-\d{4}\b/, // Phone numbers with parentheses
  
  // Medical information indicators
  /\b(diagnosis|condition|medication|treatment|symptom|disorder)\b/i,
  /\b(depression|anxiety|bipolar|schizophrenia|ptsd)\b/i,
  /\b(suicide|self.?harm|cutting|overdose)\b/i,
  
  // Names (basic detection)
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // First Last name pattern
  
  // Addresses
  /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i,
  /\b\d{5}(-\d{4})?\b/, // ZIP codes
  
  // Credit card numbers
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
  
  // Date of birth patterns
  /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/, // MM/DD/YYYY
  /\b\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/, // YYYY-MM-DD
];

/**
 * Common field names that might contain PHI
 */
const PHI_FIELD_NAMES = [
  'name', 'firstName', 'lastName', 'fullName',
  'email', 'phone', 'phoneNumber', 'mobile',
  'ssn', 'socialSecurityNumber', 'taxId',
  'address', 'street', 'city', 'zipCode', 'zip',
  'dateOfBirth', 'dob', 'birthDate',
  'medicalRecord', 'patientId', 'chart',
  'diagnosis', 'medication', 'treatment',
  'notes', 'comments', 'description',
  'password', 'token', 'secret', 'key',
];

/**
 * Sanitize data by removing or masking potential PHI
 */
function sanitizeData(data: any, key?: string): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Check if the key name suggests PHI
  if (key && PHI_FIELD_NAMES.some(phiField => 
    key.toLowerCase().includes(phiField.toLowerCase())
  )) {
    return '[REDACTED]';
  }

  if (typeof data === 'string') {
    // Check for PHI patterns in string content
    for (const pattern of PHI_PATTERNS) {
      if (pattern.test(data)) {
        return '[CONTAINS_PHI]';
      }
    }
    
    // Truncate very long strings that might contain PHI
    if (data.length > 500) {
      return data.substring(0, 100) + '... [TRUNCATED]';
    }
    
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item, index) => sanitizeData(item, `${key}_${index}`));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [objKey, value] of Object.entries(data)) {
      sanitized[objKey] = sanitizeData(value, objKey);
    }
    return sanitized;
  }

  return data;
}

/**
 * Hash sensitive identifiers for tracking without exposing PHI
 */
function hashIdentifier(identifier: string): string {
  // Simple hash for demonstration - in production, use crypto.subtle
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

// ============================================================================
// HIPAA LOGGER CLASS
// ============================================================================

export class HipaaLogger {
  private static instance: HipaaLogger;
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 1000;
  private readonly batchSize = 50;
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Start batch processing
    this.startBatchProcessing();
  }

  public static getInstance(): HipaaLogger {
    if (!HipaaLogger.instance) {
      HipaaLogger.instance = new HipaaLogger();
    }
    return HipaaLogger.instance;
  }

  /**
   * Log an entry with automatic PHI sanitization
   */
  public log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    options: {
      code?: string;
      error?: Error;
      technical?: Partial<LogEntry['technical']>;
      user?: Partial<LogEntry['user']>;
      performance?: Partial<LogEntry['performance']>;
      additionalData?: any;
    } = {}
  ): void {
    try {
      const logEntry: LogEntry = {
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        level,
        category,
        message: this.sanitizeMessage(message),
        code: options.code,
        
        technical: {
          component: options.technical?.component,
          function: options.technical?.function,
          stackTrace: this.sanitizeStackTrace(options.error?.stack || options.technical?.stackTrace),
          errorCode: options.technical?.errorCode,
          httpStatus: options.technical?.httpStatus,
          requestId: options.technical?.requestId,
          sessionId: options.technical?.sessionId ? hashIdentifier(options.technical.sessionId) : undefined,
          userAgent: options.technical?.userAgent,
          ipAddress: options.technical?.ipAddress ? hashIdentifier(options.technical.ipAddress) : undefined,
          path: options.technical?.path,
          method: options.technical?.method,
          duration: options.technical?.duration,
        },
        
        metadata: {
          environment: process.env.NODE_ENV || 'unknown',
          version: '2.0.0',
          buildId: process.env.BUILD_ID,
          deployment: process.env.DEPLOYMENT_ENV,
          region: process.env.AWS_REGION || process.env.REGION,
        },
        
        user: options.user ? {
          anonymousId: hashIdentifier(options.user.anonymousId || 'unknown'),
          role: options.user.role,
          sessionDuration: options.user.sessionDuration,
          isAuthenticated: options.user.isAuthenticated || false,
          lastActivity: options.user.lastActivity,
        } : undefined,
        
        performance: options.performance,
      };

      // Sanitize any additional data
      if (options.additionalData) {
        (logEntry as any).additionalData = sanitizeData(options.additionalData);
      }

      this.addToQueue(logEntry);
    } catch (error) {
      // If logging fails, fail silently to not impact application
      console.error('Logger failed:', error);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  public debug(category: LogCategory, message: string, options?: Parameters<typeof this.log>[3]): void {
    this.log(LogLevel.DEBUG, category, message, options);
  }

  public info(category: LogCategory, message: string, options?: Parameters<typeof this.log>[3]): void {
    this.log(LogLevel.INFO, category, message, options);
  }

  public warn(category: LogCategory, message: string, options?: Parameters<typeof this.log>[3]): void {
    this.log(LogLevel.WARN, category, message, options);
  }

  public error(category: LogCategory, message: string, options?: Parameters<typeof this.log>[3]): void {
    this.log(LogLevel.ERROR, category, message, options);
  }

  public critical(category: LogCategory, message: string, options?: Parameters<typeof this.log>[3]): void {
    this.log(LogLevel.CRITICAL, category, message, options);
  }

  /**
   * Log crisis-related events with special handling
   */
  public logCrisisEvent(
    level: LogLevel,
    message: string,
    options: Parameters<typeof this.log>[3] = {}
  ): void {
    this.log(level, LogCategory.CRISIS_INTERVENTION, message, {
      ...options,
      technical: {
        ...options.technical,
        // Mark as crisis-related for priority handling
        component: 'crisis-system',
      },
    });
  }

  /**
   * Log security events
   */
  public logSecurityEvent(
    level: LogLevel,
    message: string,
    options: Parameters<typeof this.log>[3] = {}
  ): void {
    this.log(level, LogCategory.SECURITY_EVENT, message, {
      ...options,
      technical: {
        ...options.technical,
        component: 'security-system',
      },
    });
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeMessage(message: string): string {
    return sanitizeData(message) as string;
  }

  private sanitizeStackTrace(stackTrace?: string): string | undefined {
    if (!stackTrace) return undefined;
    
    // Remove file paths that might contain sensitive information
    return stackTrace
      .replace(/\/[^\s]+/g, '[PATH]') // Replace file paths
      .replace(/at\s+[^\s]+\s+\([^)]+\)/g, 'at [FUNCTION] ([LOCATION])') // Sanitize function calls
      .substring(0, 2000); // Limit length
  }

  private addToQueue(logEntry: LogEntry): void {
    this.logQueue.push(logEntry);
    
    // Prevent memory leaks by limiting queue size
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift(); // Remove oldest entry
    }

    // Trigger immediate processing for critical errors
    if (logEntry.level === LogLevel.CRITICAL || logEntry.category === LogCategory.CRISIS_INTERVENTION) {
      this.processBatch();
    }
  }

  private startBatchProcessing(): void {
    this.batchTimer = setInterval(() => {
      this.processBatch();
    }, 10000); // Process every 10 seconds
  }

  private processBatch(): void {
    if (this.logQueue.length === 0) return;

    const batch = this.logQueue.splice(0, this.batchSize);
    
    try {
      // Process batch based on environment
      if (process.env.NODE_ENV === 'development') {
        this.processLocalLogs(batch);
      } else {
        this.processProductionLogs(batch);
      }
    } catch (error) {
      console.error('Failed to process log batch:', error);
      // Re-add logs to queue for retry (with limit)
      if (this.logQueue.length < this.maxQueueSize - batch.length) {
        this.logQueue.unshift(...batch);
      }
    }
  }

  private processLocalLogs(logs: LogEntry[]): void {
    logs.forEach(log => {
      const logMethod = log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL ? 
        console.error : 
        log.level === LogLevel.WARN ? console.warn : console.log;
      
      logMethod(`[${log.level.toUpperCase()}] [${log.category}] ${log.message}`, {
        id: log.id,
        technical: log.technical,
        performance: log.performance,
      });
    });
  }

  private processProductionLogs(logs: LogEntry[]): void {
    // In production, send to secure logging service
    // This could be AWS CloudWatch, Azure Monitor, etc.
    
    // For now, structured console logging
    logs.forEach(log => {
      console.log(JSON.stringify(log));
    });

    // Store locally for backup (with rotation)
    if (typeof window !== 'undefined') {
      try {
        const storedLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        storedLogs.push(...logs);
        
        // Keep only last 100 logs locally
        if (storedLogs.length > 100) {
          storedLogs.splice(0, storedLogs.length - 100);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(storedLogs));
      } catch (error) {
        // Fail silently if local storage is not available
      }
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Process remaining logs
    this.processBatch();
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

const logger = HipaaLogger.getInstance();

export const logCrisisEvent = (level: LogLevel, message: string, options?: any) => 
  logger.logCrisisEvent(level, message, options);

export const logSecurityEvent = (level: LogLevel, message: string, options?: any) => 
  logger.logSecurityEvent(level, message, options);

export const logError = (message: string, error: Error, options?: any) => 
  logger.error(LogCategory.SYSTEM_ERROR, message, { ...options, error });

export const logCritical = (message: string, options?: any) => 
  logger.critical(LogCategory.SYSTEM_ERROR, message, options);

export const logValidation = (message: string, options?: any) => 
  logger.warn(LogCategory.VALIDATION, message, options);

export const logPerformance = (message: string, performance: LogEntry['performance'], options?: any) => 
  logger.info(LogCategory.PERFORMANCE, message, { ...options, performance });

// ============================================================================
// EXPORTS
// ============================================================================

export { logger as hipaaLogger };
export default HipaaLogger;