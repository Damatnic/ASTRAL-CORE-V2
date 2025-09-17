/**
 * Input Sanitization Service
 * Prevents XSS, SQL injection, and other injection attacks
 */

import xss from 'xss';
import sanitizeHtml from 'sanitize-html';
import { ValidationChain, body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripUnknown?: boolean;
  maxLength?: number;
  allowedProtocols?: string[];
}

export class InputSanitizer {
  private defaultOptions: SanitizationOptions;
  private sqlInjectionPatterns: RegExp[];
  private xssPatterns: RegExp[];

  constructor(options: SanitizationOptions = {}) {
    this.defaultOptions = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href', 'title']
      },
      stripUnknown: true,
      maxLength: 10000,
      allowedProtocols: ['http', 'https', 'mailto'],
      ...options
    };

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|SCRIPT|TRUNCATE)\b)/gi,
      /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
      /(--|\#|\/\*|\*\/)/g,
      /(\bWHERE\b.*=.*)/gi,
      /(';|";|`|\\x00|\\n|\\r|\\x1a)/g,
      /(\bINTO\b\s+\b(OUTFILE|DUMPFILE)\b)/gi,
      /(\bLOAD_FILE\b\s*\()/gi
    ];

    // XSS patterns
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<embed/gi,
      /<object/gi,
      /eval\(/gi,
      /expression\(/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /alert\(/gi,
      /confirm\(/gi,
      /prompt\(/gi
    ];
  }

  /**
   * Sanitize any input value
   */
  public sanitize(input: any, options?: SanitizationOptions): any {
    if (input === null || input === undefined) {
      return input;
    }

    if (typeof input === 'string') {
      return this.sanitizeString(input, options);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitize(item, options));
    }

    if (typeof input === 'object') {
      return this.sanitizeObject(input, options);
    }

    return input;
  }

  /**
   * Sanitize string input
   */
  public sanitizeString(input: string, options?: SanitizationOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check length
    if (opts.maxLength && input.length > opts.maxLength) {
      input = input.substring(0, opts.maxLength);
    }

    // Remove null bytes
    input = input.replace(/\0/g, '');

    // Decode HTML entities multiple times to prevent double encoding attacks
    let decoded = input;
    for (let i = 0; i < 3; i++) {
      const temp = this.decodeHtmlEntities(decoded);
      if (temp === decoded) break;
      decoded = temp;
    }

    // Check for SQL injection patterns
    if (this.detectSQLInjection(decoded)) {
      throw new Error('Potential SQL injection detected');
    }

    // Check for XSS patterns
    if (this.detectXSS(decoded)) {
      // Remove XSS attempts
      decoded = this.removeXSS(decoded);
    }

    // Sanitize HTML
    const sanitized = sanitizeHtml(decoded, {
      allowedTags: opts.allowedTags,
      allowedAttributes: opts.allowedAttributes as any,
      allowedSchemes: opts.allowedProtocols,
      textFilter: (text) => {
        // Additional text filtering
        return text.replace(/[<>]/g, '');
      }
    });

    // Apply XSS filter as additional layer
    return xss(sanitized, {
      whiteList: this.getXSSWhitelist(opts),
      stripIgnoreTag: opts.stripUnknown,
      stripIgnoreTagBody: ['script', 'style']
    });
  }

  /**
   * Sanitize object recursively
   */
  public sanitizeObject(obj: any, options?: SanitizationOptions): any {
    const sanitized: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize key
        const sanitizedKey = this.sanitizeString(key, options);
        
        // Sanitize value
        sanitized[sanitizedKey] = this.sanitize(obj[key], options);
      }
    }

    return sanitized;
  }

  /**
   * Detect SQL injection attempts
   */
  public detectSQLInjection(input: string): boolean {
    return this.sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect XSS attempts
   */
  public detectXSS(input: string): boolean {
    return this.xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Remove XSS attempts from string
   */
  private removeXSS(input: string): string {
    let cleaned = input;
    
    this.xssPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(input: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x5C;': '\\',
      '&#x60;': '`'
    };

    return input.replace(/&[#a-zA-Z0-9]+;/g, (match) => entities[match] || match);
  }

  /**
   * Get XSS whitelist for allowed tags
   */
  private getXSSWhitelist(options: SanitizationOptions): any {
    const whitelist: any = {};
    
    options.allowedTags?.forEach(tag => {
      whitelist[tag] = options.allowedAttributes?.[tag] || [];
    });

    return whitelist;
  }

  /**
   * Sanitize filename for file uploads
   */
  public sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    filename = filename.replace(/\.\./g, '');
    filename = filename.replace(/[\/\\]/g, '');
    
    // Remove special characters except dots and hyphens
    filename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // Limit length
    if (filename.length > 255) {
      const ext = filename.split('.').pop();
      const name = filename.substring(0, 250 - (ext?.length || 0) - 1);
      filename = ext ? `${name}.${ext}` : name;
    }

    return filename;
  }

  /**
   * Sanitize URL
   */
  public sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }

      // Prevent javascript: and data: URLs
      if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
        throw new Error('Invalid URL scheme');
      }

      return parsed.toString();
    } catch {
      throw new Error('Invalid URL');
    }
  }

  /**
   * Sanitize email address
   */
  public sanitizeEmail(email: string): string {
    // Basic email validation and sanitization
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    email = email.trim().toLowerCase();
    
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Additional checks
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      throw new Error('Invalid email format');
    }

    return email;
  }

  /**
   * Sanitize phone number
   */
  public sanitizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check length (assuming international format)
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Invalid phone number length');
    }

    return cleaned;
  }

  /**
   * Create validation rules for common fields
   */
  public getValidationRules(fieldName: string): ValidationChain {
    switch (fieldName) {
      case 'email':
        return body('email')
          .isEmail()
          .normalizeEmail()
          .custom((value) => this.sanitizeEmail(value));

      case 'password':
        return body('password')
          .isLength({ min: 8, max: 128 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('Password must contain uppercase, lowercase, number and special character');

      case 'username':
        return body('username')
          .isAlphanumeric()
          .isLength({ min: 3, max: 30 })
          .custom((value) => this.sanitizeString(value));

      case 'name':
        return body('name')
          .matches(/^[a-zA-Z\s'-]+$/)
          .isLength({ min: 1, max: 100 })
          .custom((value) => this.sanitizeString(value));

      case 'phone':
        return body('phone')
          .isMobilePhone('any')
          .custom((value) => this.sanitizePhoneNumber(value));

      case 'url':
        return body('url')
          .isURL({ protocols: ['http', 'https'] })
          .custom((value) => this.sanitizeURL(value));

      case 'date':
        return body('date')
          .isISO8601()
          .toDate();

      default:
        return body(fieldName)
          .custom((value) => this.sanitize(value));
    }
  }

  /**
   * Validation middleware
   */
  public validationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      next();
    };
  }

  /**
   * Sanitize MongoDB queries to prevent NoSQL injection
   */
  public sanitizeMongoQuery(query: any): any {
    if (typeof query === 'string') {
      return query;
    }

    if (Array.isArray(query)) {
      return query.map(item => this.sanitizeMongoQuery(item));
    }

    if (typeof query === 'object' && query !== null) {
      const sanitized: any = {};
      
      for (const key in query) {
        // Prevent operator injection
        if (key.startsWith('$')) {
          throw new Error('Invalid query operator');
        }

        sanitized[key] = this.sanitizeMongoQuery(query[key]);
      }

      return sanitized;
    }

    return query;
  }
}