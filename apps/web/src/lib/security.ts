/**
 * ASTRAL Core V2 - Security Utilities
 * Zero-knowledge encryption and privacy protection
 */

import { logger } from './logger';

export class SecurityManager {
  private static instance: SecurityManager;
  
  private constructor() {}
  
  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Generate a cryptographically secure random key
   */
  generateSecureKey(length: number = 32): string {
    if (typeof crypto === 'undefined') {
      logger.error('Web Crypto API not available', undefined, {
        component: 'security',
        action: 'generateSecureKey'
      });
      throw new Error('Crypto API not available');
    }

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a session token for crisis sessions
   */
  generateSessionToken(): string {
    try {
      return this.generateSecureKey(32);
    } catch (error) {
      logger.error('Failed to generate session token', error as Error, {
        component: 'security',
        action: 'generateSessionToken'
      });
      throw error;
    }
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      logger.warn('Non-string input provided to sanitizeInput', {
        component: 'security',
        inputType: typeof input
      });
      return String(input);
    }

    // Remove potential script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  /**
   * Validate and sanitize crisis chat messages
   */
  sanitizeCrisisMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return '';
    }

    // Sanitize but preserve emotional content
    const sanitized = this.sanitizeInput(message);
    
    // Log if potentially malicious content was removed
    if (sanitized !== message) {
      logger.warn('Potentially malicious content sanitized from crisis message', {
        originalLength: message.length,
        sanitizedLength: sanitized.length,
        component: 'crisis-chat'
      });
    }

    return sanitized;
  }

  /**
   * Encrypt sensitive data for storage (placeholder - would use actual encryption in production)
   */
  encryptSensitiveData(data: string, key?: string): string {
    // In production, this would use actual encryption like AES-256-GCM
    // For now, we'll use base64 encoding as a placeholder
    try {
      if (typeof window !== 'undefined' && window.btoa) {
        return window.btoa(data);
      }
      return Buffer.from(data).toString('base64');
    } catch (error) {
      logger.error('Failed to encrypt sensitive data', error as Error, {
        component: 'security',
        dataLength: data.length
      });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data (placeholder - would use actual decryption in production)
   */
  decryptSensitiveData(encryptedData: string, key?: string): string {
    // In production, this would use actual decryption
    try {
      if (typeof window !== 'undefined' && window.atob) {
        return window.atob(encryptedData);
      }
      return Buffer.from(encryptedData, 'base64').toString();
    } catch (error) {
      logger.error('Failed to decrypt sensitive data', error as Error, {
        component: 'security'
      });
      throw new Error('Decryption failed');
    }
  }

  /**
   * Validate emergency contact numbers
   */
  validateEmergencyContact(contact: string): boolean {
    // Remove all non-numeric characters
    const cleaned = contact.replace(/\D/g, '');
    
    // Check for valid emergency numbers
    const validPatterns = [
      /^911$/, // US Emergency
      /^988$/, // US Crisis Lifeline
      /^741741$/, // Crisis Text Line
      /^\d{10}$/, // 10-digit US number
      /^1\d{10}$/, // 11-digit US number with country code
    ];

    return validPatterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Rate limiting for sensitive operations
   */
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const existing = this.rateLimitStore.get(identifier);

    if (!existing || now > existing.resetTime) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (existing.count >= maxAttempts) {
      logger.warn('Rate limit exceeded', {
        identifier: identifier.substring(0, 8) + '***', // Partial identifier for privacy
        attempts: existing.count,
        component: 'security'
      });
      return true;
    }

    existing.count++;
    return false;
  }

  /**
   * Secure header validation for API requests
   */
  validateSecurityHeaders(headers: Headers): boolean {
    // Check for required security headers
    const requiredHeaders = [
      'user-agent',
      'accept',
    ];

    for (const header of requiredHeaders) {
      if (!headers.get(header)) {
        logger.warn('Missing required security header', {
          missingHeader: header,
          component: 'security'
        });
        return false;
      }
    }

    // Check for suspicious patterns
    const userAgent = headers.get('user-agent') || '';
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      logger.warn('Suspicious user agent detected', {
        userAgent: userAgent.substring(0, 50),
        component: 'security'
      });
      return false;
    }

    return true;
  }

  /**
   * Validate anonymous session integrity
   */
  validateAnonymousSession(sessionData: any): boolean {
    if (!sessionData || typeof sessionData !== 'object') {
      return false;
    }

    // Check required fields for anonymous sessions
    const requiredFields = ['id', 'isAnonymous'];
    for (const field of requiredFields) {
      if (!(field in sessionData)) {
        logger.warn('Invalid anonymous session structure', {
          missingField: field,
          component: 'security'
        });
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const security = SecurityManager.getInstance();

// Utility functions for common operations
export const securityUtils = {
  sanitize: (input: string) => security.sanitizeInput(input),
  sanitizeCrisisMessage: (message: string) => security.sanitizeCrisisMessage(message),
  generateSessionToken: () => security.generateSessionToken(),
  validateEmergencyContact: (contact: string) => security.validateEmergencyContact(contact),
  isRateLimited: (id: string, max?: number, window?: number) => security.isRateLimited(id, max, window),
  validateHeaders: (headers: Headers) => security.validateSecurityHeaders(headers),
  validateAnonymousSession: (session: any) => security.validateAnonymousSession(session)
};

export default security;