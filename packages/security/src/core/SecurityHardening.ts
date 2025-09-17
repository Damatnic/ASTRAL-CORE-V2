/**
 * ASTRAL_CORE 2.0 Security Hardening System
 * 
 * Comprehensive security measures for crisis intervention platform:
 * - Input validation and sanitization
 * - Rate limiting and DDoS protection  
 * - Content Security Policy (CSP) management
 * - Encryption key rotation
 * - Security audit logging
 * - Vulnerability scanning integration
 */

import crypto from 'crypto';

// Import proper logger - circular dependency resolved by separating logger utilities
import { createLogger } from '../utils/securityLogger';

export interface SecurityConfig {
  encryptionAlgorithm: string;
  keyRotationIntervalMs: number;
  maxRequestsPerMinute: number;
  enableCSP: boolean;
  auditLogLevel: 'basic' | 'detailed' | 'paranoid';
  allowedOrigins: string[];
  blockedPatterns: RegExp[];
}

export interface SecurityAuditEvent {
  eventId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'input_validation' | 'rate_limiting' | 'encryption' | 'access_control';
  description: string;
  sourceIp?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (request: any) => string;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'url' | 'custom';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  customValidator?: (value: any) => boolean;
}

class SecurityHardening {
  private static instance: SecurityHardening;
  
  private readonly config: SecurityConfig;
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private readonly auditEvents: SecurityAuditEvent[] = [];
  private encryptionKeys = new Map<string, { key: Buffer; created: Date }>();
  private currentKeyId: string | null = null;
  private readonly logger = createLogger();

  private constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      encryptionAlgorithm: 'aes-256-gcm',
      keyRotationIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequestsPerMinute: 100,
      enableCSP: true,
      auditLogLevel: process.env.NODE_ENV === 'production' ? 'detailed' : 'basic',
      allowedOrigins: this.getDefaultAllowedOrigins(),
      blockedPatterns: this.getDefaultBlockedPatterns(),
      ...config
    };

    this.initializeEncryption();
    this.startKeyRotation();
  }

  public static getInstance(config?: Partial<SecurityConfig>): SecurityHardening {
    if (!SecurityHardening.instance) {
      SecurityHardening.instance = new SecurityHardening(config);
    }
    return SecurityHardening.instance;
  }

  /**
   * Comprehensive input validation and sanitization
   */
  public validateInput(data: any, rules: ValidationRule[]): { isValid: boolean; errors: string[]; sanitized: any } {
    const errors: string[] = [];
    const sanitized: any = {};

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      let validatedValue = value;
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Field '${rule.field}' must be a string`);
            continue;
          }
          break;

        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`Field '${rule.field}' must be a number`);
            continue;
          }
          validatedValue = num;
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push(`Field '${rule.field}' must be a valid email`);
            continue;
          }
          break;

        case 'phone':
          const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
          if (!phoneRegex.test(String(value))) {
            errors.push(`Field '${rule.field}' must be a valid phone number`);
            continue;
          }
          break;

        case 'url':
          try {
            new URL(String(value));
          } catch {
            errors.push(`Field '${rule.field}' must be a valid URL`);
            continue;
          }
          break;

        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            errors.push(`Field '${rule.field}' failed custom validation`);
            continue;
          }
          break;
      }

      // Length validation
      if (rule.minLength && String(validatedValue).length < rule.minLength) {
        errors.push(`Field '${rule.field}' must be at least ${rule.minLength} characters`);
        continue;
      }

      if (rule.maxLength && String(validatedValue).length > rule.maxLength) {
        errors.push(`Field '${rule.field}' must be no more than ${rule.maxLength} characters`);
        continue;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(String(validatedValue))) {
        errors.push(`Field '${rule.field}' does not match required pattern`);
        continue;
      }

      // Sanitization
      if (rule.sanitize && typeof validatedValue === 'string') {
        validatedValue = this.sanitizeString(validatedValue);
      }

      sanitized[rule.field] = validatedValue;
    }

    // Check for malicious patterns
    const maliciousCheck = this.checkForMaliciousPatterns(sanitized);
    if (!maliciousCheck.isSafe) {
      errors.push('Input contains potentially malicious content');
      this.auditSecurityEvent({
        severity: 'high',
        category: 'input_validation',
        description: 'Malicious input pattern detected',
        metadata: { patterns: maliciousCheck.detectedPatterns, input: sanitized }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Rate limiting implementation
   */
  public checkRateLimit(identifier: string, config?: Partial<RateLimitConfig>): { allowed: boolean; resetTime: number; remaining: number } {
    const rateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: this.config.maxRequestsPerMinute,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };

    const now = Date.now();
    const windowStart = now - rateLimitConfig.windowMs;

    let record = this.rateLimitStore.get(identifier);
    
    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + rateLimitConfig.windowMs
      };
    }

    record.count++;
    this.rateLimitStore.set(identifier, record);

    const allowed = record.count <= rateLimitConfig.maxRequests;
    const remaining = Math.max(0, rateLimitConfig.maxRequests - record.count);

    if (!allowed) {
      this.auditSecurityEvent({
        severity: 'medium',
        category: 'rate_limiting',
        description: 'Rate limit exceeded',
        metadata: { identifier, count: record.count, limit: rateLimitConfig.maxRequests }
      });
    }

    return {
      allowed,
      resetTime: record.resetTime,
      remaining
    };
  }

  /**
   * Content Security Policy generation
   */
  public generateCSPHeader(): string {
    if (!this.config.enableCSP) {
      return '';
    }

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ];

    return cspDirectives.join('; ');
  }

  /**
   * Secure encryption with key rotation
   */
  public encrypt(data: string, keyId?: string): { encrypted: string; keyId: string; iv: string } {
    const activeKeyId = keyId || this.currentKeyId;
    if (!activeKeyId) {
      throw new Error('No encryption key available');
    }

    const key = this.encryptionKeys.get(activeKeyId);
    if (!key) {
      throw new Error(`Encryption key ${activeKeyId} not found`);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(this.config.encryptionAlgorithm, key.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      keyId: activeKeyId,
      iv: iv.toString('hex')
    };
  }

  /**
   * Secure decryption
   */
  public decrypt(encryptedData: string, keyId: string, iv: string): string {
    const key = this.encryptionKeys.get(keyId);
    if (!key) {
      throw new Error(`Decryption key ${keyId} not found`);
    }

    const decipher = crypto.createDecipherGCM(this.config.encryptionAlgorithm, key.key, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Origin validation for CORS
   */
  public validateOrigin(origin: string): boolean {
    if (!origin) return false;

    return this.config.allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
  }

  /**
   * Security audit event logging
   */
  public auditSecurityEvent(event: Omit<SecurityAuditEvent, 'eventId' | 'timestamp'>): void {
    const auditEvent: SecurityAuditEvent = {
      eventId: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date(),
      ...event
    };

    this.auditEvents.push(auditEvent);

    // Log based on severity and config
    if (event.severity === 'critical') {
      logger.error(`[CRITICAL] SecurityAudit: ${event.description}`, event.metadata, event.sessionId);
    } else if (event.severity === 'high') {
      logger.error(`[ERROR] SecurityAudit: ${event.description}`, event.metadata, event.sessionId);
    } else if (event.severity === 'medium') {
      logger.warn(`[WARN] SecurityAudit: ${event.description}`, event.metadata, event.sessionId);
    } else if (this.config.auditLogLevel === 'detailed' || this.config.auditLogLevel === 'paranoid') {
      logger.info(`[INFO] SecurityAudit: ${event.description}`, event.metadata, event.sessionId);
    }

    // Keep only recent events in memory
    if (this.auditEvents.length > 10000) {
      this.auditEvents.splice(0, 1000);
    }
  }

  /**
   * Get recent security audit events
   */
  public getAuditEvents(limit: number = 100): SecurityAuditEvent[] {
    return this.auditEvents.slice(-limit);
  }

  /**
   * Security health check
   */
  public getSecurityHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: {
      activeKeys: number;
      recentAuditEvents: number;
      rateLimitViolations: number;
      cspEnabled: boolean;
    };
  } {
    const issues: string[] = [];
    const now = Date.now();

    // Check key rotation
    if (this.currentKeyId) {
      const currentKey = this.encryptionKeys.get(this.currentKeyId);
      if (currentKey && now - currentKey.created.getTime() > this.config.keyRotationIntervalMs) {
        issues.push('Encryption key rotation overdue');
      }
    } else {
      issues.push('No active encryption key');
    }

    // Check recent audit events
    const recentEvents = this.auditEvents.filter(e => 
      now - e.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );
    
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;

    if (criticalEvents > 0) {
      issues.push(`${criticalEvents} critical security events in last hour`);
    }
    if (highEvents > 5) {
      issues.push(`${highEvents} high-severity security events in last hour`);
    }

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalEvents > 0) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      metrics: {
        activeKeys: this.encryptionKeys.size,
        recentAuditEvents: recentEvents.length,
        rateLimitViolations: recentEvents.filter(e => e.category === 'rate_limiting').length,
        cspEnabled: this.config.enableCSP
      }
    };
  }

  // Private helper methods

  private initializeEncryption(): void {
    this.generateNewKey();
  }

  private generateNewKey(): void {
    const keyId = `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const key = crypto.randomBytes(32); // 256-bit key
    
    this.encryptionKeys.set(keyId, {
      key,
      created: new Date()
    });
    
    this.currentKeyId = keyId;
    
    logger.info(`[INFO] SecurityHardening: New encryption key generated`, { keyId });
  }

  private startKeyRotation(): void {
    setInterval(() => {
      this.generateNewKey();
      
      // Clean up old keys (keep last 3)
      const sortedKeys = Array.from(this.encryptionKeys.entries())
        .sort(([, a], [, b]) => b.created.getTime() - a.created.getTime());
      
      if (sortedKeys.length > 3) {
        const keysToRemove = sortedKeys.slice(3);
        keysToRemove.forEach(([keyId]) => {
          this.encryptionKeys.delete(keyId);
          logger.info(`[INFO] SecurityHardening: Old encryption key removed`, { keyId });
        });
      }
    }, this.config.keyRotationIntervalMs);
  }

  private sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>'"&]/g, (char) => {
        const htmlEntities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return htmlEntities[char] || char;
      });
  }

  private checkForMaliciousPatterns(data: any): { isSafe: boolean; detectedPatterns: string[] } {
    const dataString = JSON.stringify(data).toLowerCase();
    const detectedPatterns: string[] = [];

    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(dataString)) {
        detectedPatterns.push(pattern.source);
      }
    }

    return {
      isSafe: detectedPatterns.length === 0,
      detectedPatterns
    };
  }

  private getDefaultAllowedOrigins(): string[] {
    const origins = ['https://astralcore.org'];
    
    if (process.env.NODE_ENV === 'development') {
      origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');
    }
    
    return origins;
  }

  private getDefaultBlockedPatterns(): RegExp[] {
    return [
      /script\s*:/i,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /data\s*:/i,
      /<\s*script/i,
      /<\s*iframe/i,
      /<\s*object/i,
      /<\s*embed/i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /Function\s*\(/i,
      /\bexec\b/i,
      /\bsystem\b/i,
      /\bshell\b/i,
      /\bsql\b.*\b(union|select|insert|update|delete|drop)\b/i
    ];
  }
}

// Export singleton instance
export const securityHardening = SecurityHardening.getInstance();

// Export validation rules for common use cases
export const commonValidationRules = {
  crisisMessage: [
    { field: 'message', type: 'string' as const, required: true, minLength: 1, maxLength: 5000, sanitize: true },
    { field: 'sessionId', type: 'string' as const, required: true, pattern: /^[a-zA-Z0-9_-]+$/ }
  ],
  volunteerProfile: [
    { field: 'name', type: 'string' as const, required: true, minLength: 2, maxLength: 100, sanitize: true },
    { field: 'email', type: 'email' as const, required: true },
    { field: 'phone', type: 'phone' as const, required: false },
    { field: 'specializations', type: 'string' as const, required: true, maxLength: 1000 }
  ],
  adminAction: [
    { field: 'action', type: 'string' as const, required: true, pattern: /^[a-zA-Z_]+$/ },
    { field: 'sessionId', type: 'string' as const, required: true, pattern: /^[a-zA-Z0-9_-]+$/ },
    { field: 'reason', type: 'string' as const, required: false, maxLength: 500, sanitize: true }
  ]
};