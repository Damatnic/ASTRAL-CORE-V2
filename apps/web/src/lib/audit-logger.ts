/**
 * HIPAA-Compliant Audit Logger
 * Provides secure audit logging with automatic PHI filtering
 * Ensures no sensitive data exposure in logs
 */

import { prisma } from '@/lib/db';

/**
 * PHI (Protected Health Information) patterns to filter
 * These patterns are automatically redacted from logs
 */
const PHI_PATTERNS = {
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/gi,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/gi,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/gi,
  dateOfBirth: /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/gi,
  medicalRecordNumber: /\bMRN[\s:]?\d+\b/gi,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/gi,
};

/**
 * Sensitive field names that should be redacted
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'notes',
  'diagnosis',
  'medication',
  'treatment',
  'firstName',
  'lastName',
  'name',
  'address',
  'street',
  'city',
  'zipCode',
  'postalCode',
];

/**
 * Crisis keywords that trigger priority logging
 */
const CRISIS_KEYWORDS = [
  'suicide',
  'self-harm',
  'emergency',
  'crisis',
  'danger',
  'overdose',
  'hurt myself',
  'end it all',
  'kill',
  'die',
];

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  isCrisisRelated?: boolean;
}

/**
 * Filters PHI from a string value
 */
function filterPHI(value: string): string {
  let filtered = value;
  
  // Apply all PHI pattern filters
  Object.entries(PHI_PATTERNS).forEach(([name, pattern]) => {
    filtered = filtered.replace(pattern, `[REDACTED_${name.toUpperCase()}]`);
  });
  
  return filtered;
}

/**
 * Deep cleans an object to remove sensitive data
 */
function sanitizeObject(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return '[MAX_DEPTH_EXCEEDED]';
  
  if (obj === null || obj === undefined) return obj;
  
  // Handle primitive types
  if (typeof obj === 'string') {
    return filterPHI(obj);
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  // Handle objects
  const sanitized: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    
    // Check if field name is sensitive
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED_SENSITIVE_FIELD]';
    } else if (typeof value === 'string') {
      sanitized[key] = filterPHI(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

/**
 * Checks if content contains crisis keywords
 */
function checkForCrisisKeywords(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

/**
 * Main audit logging function
 * Logs user actions with HIPAA compliance
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Sanitize all data before logging
    const sanitizedEntry = {
      ...entry,
      details: entry.details ? sanitizeObject(entry.details) : undefined,
      ipAddress: entry.ipAddress ? filterPHI(entry.ipAddress) : undefined,
      userAgent: entry.userAgent ? filterPHI(entry.userAgent) : undefined,
    };
    
    // Check for crisis keywords in action or details
    const actionString = JSON.stringify(sanitizedEntry);
    const isCrisisRelated = entry.isCrisisRelated || checkForCrisisKeywords(actionString);
    
    // Determine severity
    const severity = entry.severity || (isCrisisRelated ? 'critical' : 'info');
    
    // Store in database if available
    if (process.env.DATABASE_URL) {
      try {
        // Type assertion to access auditLog model
        // This is safe because we know the schema includes AuditLog model
        await (prisma as any).auditLog.create({
          data: {
            userId: sanitizedEntry.userId,
            action: sanitizedEntry.action,
            resource: sanitizedEntry.resource,
            resourceId: sanitizedEntry.resourceId,
            details: sanitizedEntry.details || {},
            ipAddress: sanitizedEntry.ipAddress,
            userAgent: sanitizedEntry.userAgent,
            severity,
            isCrisisRelated,
            timestamp: new Date(),
          },
        });
      } catch (dbError) {
        // If database write fails, still log to console
        console.error('[AUDIT_LOG_DB_ERROR]', dbError);
      }
    }
    
    // Always log to console in structured format
    const logLevel = severity === 'critical' ? 'error' : 
                    severity === 'error' ? 'error' :
                    severity === 'warning' ? 'warn' : 'info';
    
    const logMessage = {
      timestamp: new Date().toISOString(),
      type: 'AUDIT_LOG',
      severity,
      isCrisisRelated,
      ...sanitizedEntry,
    };
    
    if (logLevel === 'error') {
      console.error('[AUDIT]', JSON.stringify(logMessage));
    } else if (logLevel === 'warn') {
      console.warn('[AUDIT]', JSON.stringify(logMessage));
    } else {
      console.log('[AUDIT]', JSON.stringify(logMessage));
    }
    
    // If crisis-related, trigger additional alerting
    if (isCrisisRelated && process.env.CRISIS_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRISIS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert: 'CRISIS_EVENT_DETECTED',
            timestamp: new Date().toISOString(),
            userId: sanitizedEntry.userId,
            action: sanitizedEntry.action,
          }),
        });
      } catch (webhookError) {
        console.error('[CRISIS_WEBHOOK_ERROR]', webhookError);
      }
    }
    
  } catch (error) {
    // Audit logging should never throw - log the error and continue
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}

/**
 * Logs access to sensitive resources
 */
export async function auditAccess(
  userId: string,
  resource: string,
  resourceId: string,
  action: 'VIEW' | 'EDIT' | 'DELETE' | 'EXPORT',
  request?: { ip?: string; userAgent?: string }
): Promise<void> {
  await auditLog({
    userId,
    action: `${resource}_${action}`,
    resource,
    resourceId,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}

/**
 * Logs authentication events
 */
export async function auditAuth(
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'FAILED_LOGIN',
  userId?: string,
  details?: Record<string, any>,
  request?: { ip?: string; userAgent?: string }
): Promise<void> {
  await auditLog({
    userId,
    action: `AUTH_${action}`,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
    severity: action === 'FAILED_LOGIN' ? 'warning' : 'info',
  });
}

/**
 * Logs crisis intervention events
 */
export async function auditCrisis(
  userId: string,
  action: string,
  details: Record<string, any>,
  severity: 'warning' | 'critical' = 'critical'
): Promise<void> {
  await auditLog({
    userId,
    action: `CRISIS_${action}`,
    details,
    severity,
    isCrisisRelated: true,
  });
}

/**
 * Logs data export events for GDPR compliance
 */
export async function auditDataExport(
  userId: string,
  exportType: 'USER_DATA' | 'MOOD_DATA' | 'FULL_EXPORT',
  request?: { ip?: string; userAgent?: string }
): Promise<void> {
  await auditLog({
    userId,
    action: `DATA_EXPORT_${exportType}`,
    resource: 'user_data',
    resourceId: userId,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  });
}

/**
 * Logs system events
 */
export async function auditSystem(
  action: string,
  details?: Record<string, any>,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  await auditLog({
    action: `SYSTEM_${action}`,
    details,
    severity,
  });
}

// Log system startup
if (typeof window === 'undefined') {
  auditSystem('STARTUP', {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
  });
}