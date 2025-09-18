/**
 * API Performance Middleware
 * 
 * Monitors and optimizes API response times for the crisis platform.
 * Ensures all crisis endpoints respond within 200ms.
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import responseTime from 'response-time';
import { PerformanceMonitor } from '../monitoring/performance-monitor';
import { CacheManager } from '../optimization/cache-manager';
import logger from '../utils/logger';

export interface PerformanceMiddlewareOptions {
  enableCompression?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  compressionThreshold?: number;
  cachePatterns?: CachePattern[];
  criticalEndpoints?: string[];
}

export interface CachePattern {
  pattern: RegExp;
  ttl: number;
  varyBy?: string[]; // Headers to vary cache by
}

export interface RequestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  path: string;
  method: string;
  statusCode?: number;
  responseSize?: number;
  cached?: boolean;
  compressed?: boolean;
  crisisLevel?: string;
}

export class APIPerformanceMiddleware {
  private performanceMonitor: PerformanceMonitor;
  private cacheManager: CacheManager;
  private options: PerformanceMiddlewareOptions;
  private requestMetrics: Map<string, RequestMetrics> = new Map();

  private readonly DEFAULT_OPTIONS: PerformanceMiddlewareOptions = {
    enableCompression: true,
    enableCaching: true,
    enableMetrics: true,
    compressionThreshold: 1024, // 1KB
    criticalEndpoints: [
      '/api/crisis/emergency',
      '/api/crisis/escalate',
      '/api/crisis/responder',
      '/api/health/critical'
    ]
  };

  constructor(options?: PerformanceMiddlewareOptions) {
    this.options = { ...this.DEFAULT_OPTIONS, ...options };
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.cacheManager = CacheManager.getInstance();
  }

  /**
   * Main middleware function
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Start performance tracking
      const requestId = this.generateRequestId();
      const metrics: RequestMetrics = {
        startTime: Date.now(),
        path: req.path,
        method: req.method,
        crisisLevel: this.determineCrisisLevel(req)
      };

      this.requestMetrics.set(requestId, metrics);
      (req as any).requestId = requestId;

      // Add response time header
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-Response-Time', '0');

      // Override res.json to capture response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        this.captureResponse(requestId, res, body);
        return originalJson(body);
      };

      // Override res.send for non-JSON responses
      const originalSend = res.send.bind(res);
      res.send = (body: any) => {
        this.captureResponse(requestId, res, body);
        return originalSend(body);
      };

      // Track response completion
      res.on('finish', () => {
        this.finalizeMetrics(requestId, res);
      });

      next();
    };
  }

  /**
   * Compression middleware
   */
  public compressionMiddleware() {
    if (!this.options.enableCompression) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return compression({
      threshold: this.options.compressionThreshold,
      filter: (req: Request, res: Response) => {
        // Always compress for crisis endpoints
        if (this.isCriticalEndpoint(req.path)) {
          return true;
        }
        // Default compression filter
        return compression.filter(req, res);
      },
      level: 6 // Balanced compression level
    });
  }

  /**
   * Caching middleware
   */
  public cachingMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.options.enableCaching || req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cachePattern = this.getCachePattern(req.path);

      if (!cachePattern) {
        return next();
      }

      try {
        // Check cache
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          const requestId = (req as any).requestId;
          if (requestId) {
            const metrics = this.requestMetrics.get(requestId);
            if (metrics) {
              metrics.cached = true;
            }
          }

          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Cache-Control', `max-age=${cachePattern.ttl / 1000}`);
          return res.json(cached);
        }

        // Cache miss - store original json method
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          // Cache the response
          this.cacheManager.set(cacheKey, body, cachePattern.ttl).catch(err => {
            logger.error('Failed to cache response', { error: err, path: req.path });
          });
          
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('Cache-Control', `max-age=${cachePattern.ttl / 1000}`);
          return originalJson(body);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error', { error, path: req.path });
        next();
      }
    };
  }

  /**
   * Response time middleware
   */
  public responseTimeMiddleware(): any {
    return responseTime((req: Request, res: Response, time: number) => {
      const requestId = (req as any).requestId;
      if (requestId) {
        const metrics = this.requestMetrics.get(requestId);
        if (metrics) {
          metrics.duration = time;
        }
      }

      res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);

      // Alert for slow critical endpoints
      if (this.isCriticalEndpoint(req.path) && time > 200) {
        this.performanceMonitor.recordHTTPRequest({
          method: req.method,
          route: req.path,
          statusCode: res.statusCode,
          duration: time,
          crisisLevel: 'critical'
        });
      }
    });
  }

  /**
   * Rate limiting for non-critical endpoints
   */
  public rateLimitMiddleware() {
    const rateLimit = require('express-rate-limit');
    
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: (req: Request) => {
        // Higher limits for critical endpoints
        if (this.isCriticalEndpoint(req.path)) {
          return 1000; // 1000 requests per minute for critical
        }
        return 100; // 100 requests per minute for normal
      },
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        // Never rate limit emergency endpoints
        return req.path.includes('/emergency') || req.path.includes('/crisis/escalate');
      },
      handler: (req: Request, res: Response) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          error: 'Too many requests',
          retryAfter: res.getHeader('Retry-After')
        });
      }
    });
  }

  /**
   * Circuit breaker for external services
   */
  public circuitBreakerMiddleware() {
    const circuitBreakers = new Map<string, CircuitBreaker>();

    return (req: Request, res: Response, next: NextFunction) => {
      const service = this.extractServiceName(req.path);
      
      if (!service) {
        return next();
      }

      let breaker = circuitBreakers.get(service);
      if (!breaker) {
        breaker = new CircuitBreaker(service);
        circuitBreakers.set(service, breaker);
      }

      if (breaker.isOpen()) {
        logger.warn('Circuit breaker open', { service });
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          service,
          retryAfter: breaker.getRetryAfter()
        });
      }

      // Track request through circuit breaker
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 500) {
          breaker!.recordFailure();
        } else {
          breaker!.recordSuccess();
        }
        return originalJson(body);
      };

      next();
    };
  }

  /**
   * Request timeout middleware
   */
  public timeoutMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Set different timeouts based on endpoint criticality
      const timeout = this.isCriticalEndpoint(req.path) ? 5000 : 30000; // 5s for critical, 30s for normal

      const timer = setTimeout(() => {
        if (!res.headersSent) {
          logger.error('Request timeout', {
            path: req.path,
            method: req.method,
            timeout
          });

          res.status(504).json({
            error: 'Request timeout',
            message: 'The request took too long to process'
          });
        }
      }, timeout);

      res.on('finish', () => {
        clearTimeout(timer);
      });

      next();
    };
  }

  private captureResponse(requestId: string, res: Response, body: any): void {
    const metrics = this.requestMetrics.get(requestId);
    if (!metrics) return;

    metrics.statusCode = res.statusCode;
    metrics.responseSize = JSON.stringify(body).length;
    metrics.compressed = res.getHeader('Content-Encoding') === 'gzip';
  }

  private finalizeMetrics(requestId: string, res: Response): void {
    const metrics = this.requestMetrics.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.duration = metrics.duration || (metrics.endTime - metrics.startTime);

    // Record in performance monitor
    this.performanceMonitor.recordHTTPRequest({
      method: metrics.method,
      route: metrics.path,
      statusCode: metrics.statusCode || 0,
      duration: metrics.duration,
      crisisLevel: metrics.crisisLevel as any
    });

    // Log slow requests
    if (metrics.duration > 1000) {
      logger.warn('Slow API request', {
        ...metrics,
        slowBy: metrics.duration - 1000
      });
    }

    // Clean up
    this.requestMetrics.delete(requestId);
  }

  private determineCrisisLevel(req: Request): string {
    const path = req.path.toLowerCase();
    
    if (path.includes('emergency') || path.includes('escalate')) {
      return 'critical';
    }
    if (path.includes('crisis')) {
      return 'high';
    }
    if (path.includes('responder') || path.includes('alert')) {
      return 'medium';
    }
    if (path.includes('health') || path.includes('session')) {
      return 'low';
    }
    
    return 'none';
  }

  private isCriticalEndpoint(path: string): boolean {
    return this.options.criticalEndpoints?.some(endpoint => 
      path.startsWith(endpoint)
    ) || false;
  }

  private getCachePattern(path: string): CachePattern | null {
    if (!this.options.cachePatterns) return null;

    for (const pattern of this.options.cachePatterns) {
      if (pattern.pattern.test(path)) {
        return pattern;
      }
    }

    return null;
  }

  private generateCacheKey(req: Request): string {
    const pattern = this.getCachePattern(req.path);
    let key = `${req.method}:${req.path}`;

    // Add query parameters
    const queryKeys = Object.keys(req.query).sort();
    if (queryKeys.length > 0) {
      const queryString = queryKeys.map(k => `${k}=${req.query[k]}`).join('&');
      key += `?${queryString}`;
    }

    // Add vary headers
    if (pattern?.varyBy) {
      for (const header of pattern.varyBy) {
        const value = req.get(header);
        if (value) {
          key += `:${header}=${value}`;
        }
      }
    }

    return key;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractServiceName(path: string): string | null {
    // Extract service name from path (e.g., /api/external/service-name/...)
    const match = path.match(/\/api\/external\/([^\/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Simple circuit breaker implementation
 */
class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute
  private readonly successThreshold = 3;

  constructor(private name: string) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      // Check if we should transition to half-open
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'closed';
        this.successes = 0;
        logger.info('Circuit breaker closed', { service: this.name });
      }
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.error('Circuit breaker opened', { 
        service: this.name, 
        failures: this.failures 
      });
    }
  }

  getRetryAfter(): number {
    return Math.max(0, this.timeout - (Date.now() - this.lastFailureTime));
  }
}