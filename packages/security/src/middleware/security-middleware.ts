/**
 * Comprehensive Security Middleware
 * HIPAA-compliant security middleware for mental health platform
 */

import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction, Application } from 'express';
import { SecurityHeaders } from './security-headers';
import { CSPConfig } from './csp-config';
import { InputSanitizer } from '../sanitization/input-sanitizer';
import { SecurityLogger } from '../logging/security-logger';
import { SessionSecurity } from '../session/session-security';
import { DeviceFingerprint } from '../fingerprint/device-fingerprint';

export interface SecurityOptions {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableRateLimiting?: boolean;
  enableFingerprinting?: boolean;
  enableSessionSecurity?: boolean;
  enableAuditLogging?: boolean;
  trustProxy?: boolean;
  corsOrigins?: string[];
  rateLimitWindowMs?: number;
  rateLimitMaxRequests?: number;
  environment?: 'development' | 'staging' | 'production';
}

export class SecurityMiddleware {
  private logger: SecurityLogger;
  private inputSanitizer: InputSanitizer;
  private sessionSecurity: SessionSecurity;
  private deviceFingerprint: DeviceFingerprint;
  private options: SecurityOptions;

  constructor(options: SecurityOptions = {}) {
    this.options = {
      enableHSTS: true,
      enableCSP: true,
      enableRateLimiting: true,
      enableFingerprinting: true,
      enableSessionSecurity: true,
      enableAuditLogging: true,
      trustProxy: true,
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
      rateLimitMaxRequests: 100,
      environment: (process.env.NODE_ENV as SecurityOptions['environment']) || 'development',
      ...options
    };

    this.logger = new SecurityLogger();
    this.inputSanitizer = new InputSanitizer();
    this.sessionSecurity = new SessionSecurity();
    this.deviceFingerprint = new DeviceFingerprint();
  }

  /**
   * Apply all security middleware to Express app
   */
  public apply(app: Application): void {
    // Trust proxy for accurate IP addresses
    if (this.options.trustProxy) {
      app.set('trust proxy', 1);
    }

    // Basic security headers with Helmet
    app.use(this.getHelmetConfig());

    // CORS configuration
    app.use(this.getCORSConfig());

    // Prevent HTTP Parameter Pollution
    app.use(hpp());

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }: any) => {
        this.logger.warn('NoSQL injection attempt detected', {
          ip: req.ip,
          path: req.path,
          key
        });
      }
    }));

    // Rate limiting
    if (this.options.enableRateLimiting) {
      app.use(this.getRateLimiter());
    }

    // Input sanitization middleware
    app.use(this.sanitizeInput.bind(this));

    // Device fingerprinting
    if (this.options.enableFingerprinting) {
      app.use(this.deviceFingerprint.middleware());
    }

    // Session security
    if (this.options.enableSessionSecurity) {
      app.use(this.sessionSecurity.middleware());
    }

    // Security monitoring and audit logging
    if (this.options.enableAuditLogging) {
      app.use(this.auditMiddleware.bind(this));
    }

    // Additional security headers
    app.use(this.additionalSecurityHeaders.bind(this));

    // Error handling for security violations
    app.use(this.securityErrorHandler.bind(this));
  }

  /**
   * Helmet configuration for security headers
   */
  private getHelmetConfig() {
    const cspConfig = new CSPConfig(this.options.environment);
    
    return helmet({
      contentSecurityPolicy: this.options.enableCSP ? {
        directives: cspConfig.getDirectives()
      } : false,
      hsts: this.options.enableHSTS ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      } : false,
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'deny' },
      permittedCrossDomainPolicies: false,
      hidePoweredBy: true,
      ieNoOpen: true,
      dnsPrefetchControl: { allow: false },
      originAgentCluster: true,
      crossOriginEmbedderPolicy: this.options.environment === 'production',
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' }
    });
  }

  /**
   * CORS configuration
   */
  private getCORSConfig() {
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin && this.options.environment === 'development') {
          return callback(null, true);
        }

        if (!origin || this.options.corsOrigins?.includes(origin)) {
          callback(null, true);
        } else {
          this.logger.warn('CORS violation attempt', { origin });
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400 // 24 hours
    });
  }

  /**
   * Rate limiting configuration
   */
  private getRateLimiter() {
    return rateLimit({
      windowMs: this.options.rateLimitWindowMs!,
      max: this.options.rateLimitMaxRequests!,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
      },
      handler: (req: Request, res: Response) => {
        this.logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          userAgent: req.headers['user-agent']
        });
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: res.getHeader('Retry-After')
        });
      }
    });
  }

  /**
   * Input sanitization middleware
   */
  private sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = this.inputSanitizer.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = this.inputSanitizer.sanitizeObject(req.query as any);
      }

      // Sanitize params
      if (req.params) {
        req.params = this.inputSanitizer.sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      this.logger.error('Input sanitization error', error as Error);
      res.status(400).json({ error: 'Invalid input data' });
    }
  }

  /**
   * Additional security headers
   */
  private additionalSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || this.generateRequestId());
    
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
  }

  /**
   * Audit logging middleware
   */
  private auditMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    
    // Log request
    this.logger.audit('Request received', {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      fingerprint: (req as any).fingerprint
    });

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.audit('Request completed', {
        requestId,
        statusCode: res.statusCode,
        duration,
        path: req.path
      });
    });

    next();
  }

  /**
   * Security error handler
   */
  private securityErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    if (err.name === 'UnauthorizedError') {
      this.logger.warn('Unauthorized access attempt', {
        ip: req.ip,
        path: req.path,
        error: err.message
      });
      res.status(401).json({ error: 'Unauthorized' });
    } else if (err.name === 'ForbiddenError') {
      this.logger.warn('Forbidden access attempt', {
        ip: req.ip,
        path: req.path,
        error: err.message
      });
      res.status(403).json({ error: 'Forbidden' });
    } else if (err.code === 'EBADCSRFTOKEN') {
      this.logger.warn('CSRF token validation failed', {
        ip: req.ip,
        path: req.path
      });
      res.status(403).json({ error: 'Invalid CSRF token' });
    } else {
      next(err);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}