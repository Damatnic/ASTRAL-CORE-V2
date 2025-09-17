/**
 * Advanced Rate Limiting for Mental Health Platform
 * Protects against abuse while ensuring crisis users get priority access
 */

import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from './logging/security-logger';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
  store?: RateLimitStore;
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | undefined>;
  set(key: string, entry: RateLimitEntry, ttl: number): Promise<void>;
  increment(key: string): Promise<RateLimitEntry>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get(key: string): Promise<RateLimitEntry | undefined> {
    const entry = this.store.get(key);
    
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    
    return entry;
  }

  async set(key: string, entry: RateLimitEntry, ttl: number): Promise<void> {
    this.store.set(key, {
      ...entry,
      resetTime: Date.now() + ttl
    });
  }

  async increment(key: string): Promise<RateLimitEntry> {
    const existing = await this.get(key);
    
    if (existing) {
      existing.count++;
      this.store.set(key, existing);
      return existing;
    } else {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: Date.now() + (15 * 60 * 1000), // 15 minutes default
        firstRequest: Date.now()
      };
      this.store.set(key, newEntry);
      return newEntry;
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RateLimitService {
  private logger: SecurityLogger;
  private store: RateLimitStore;

  constructor(store?: RateLimitStore) {
    this.logger = new SecurityLogger();
    this.store = store || new MemoryStore();
  }

  /**
   * Create rate limit middleware
   */
  public createLimiter(options: RateLimitOptions) {
    const {
      windowMs,
      maxRequests,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      keyGenerator = this.defaultKeyGenerator,
      onLimitReached,
      message = 'Too many requests, please try again later.',
      statusCode = 429,
      headers = true
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = keyGenerator(req);
        const entry = await this.store.increment(key);

        // Set headers if enabled
        if (headers) {
          res.setHeader('X-RateLimit-Limit', maxRequests);
          res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
          res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
        }

        // Check if limit exceeded
        if (entry.count > maxRequests) {
          this.logger.warn('Rate limit exceeded', {
            action: 'rate_limit_exceeded',
            key,
            count: entry.count,
            maxRequests,
            ip: req.ip,
            path: req.path,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
          });

          if (onLimitReached) {
            onLimitReached(req, res);
          }

          res.status(statusCode).json({
            error: message,
            retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
          });
          return;
        }

        // Handle response completion
        const originalEnd = res.end;
        res.end = function(this: Response, ...args: any[]): Response {
          const shouldSkip = 
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400);

          if (shouldSkip) {
            // Decrement count if we're skipping this request
            entry.count = Math.max(0, entry.count - 1);
          }

          return originalEnd.apply(this, args as any);
        };

        next();
      } catch (error) {
        this.logger.error('Rate limiting error', error as Error);
        next(); // Continue on error to avoid blocking legitimate traffic
      }
    };
  }

  /**
   * Crisis-specific rate limiter (more lenient for crisis endpoints)
   */
  public crisisRateLimiter(options: Partial<RateLimitOptions> = {}) {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute window
      maxRequests: 100, // Higher limit for crisis situations
      keyGenerator: (req) => `crisis:${req.ip}:${req.path}`,
      message: 'Crisis support is temporarily limited. If this is an emergency, please call 911 or 988.',
      ...options
    });
  }

  /**
   * Authentication rate limiter (stricter for login attempts)
   */
  public authRateLimiter(options: Partial<RateLimitOptions> = {}) {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minute window
      maxRequests: 5, // Only 5 failed attempts
      keyGenerator: (req) => `auth:${req.ip}`,
      skipSuccessfulRequests: true, // Only count failed attempts
      message: 'Too many login attempts. Please try again later.',
      onLimitReached: (req, res) => {
        this.logger.warn('Authentication rate limit exceeded', {
          action: 'auth_rate_limit',
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        });
      },
      ...options
    });
  }

  /**
   * API rate limiter (general API protection)
   */
  public apiRateLimiter(options: Partial<RateLimitOptions> = {}) {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000, // 1000 requests per 15 minutes
      keyGenerator: (req) => {
        const user = (req as any).user;
        return user ? `api:user:${user.userId}` : `api:ip:${req.ip}`;
      },
      ...options
    });
  }

  /**
   * File upload rate limiter
   */
  public uploadRateLimiter(options: Partial<RateLimitOptions> = {}) {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 uploads per hour
      keyGenerator: (req) => {
        const user = (req as any).user;
        return user ? `upload:user:${user.userId}` : `upload:ip:${req.ip}`;
      },
      message: 'Upload limit exceeded. Please try again later.',
      ...options
    });
  }

  /**
   * Adaptive rate limiter (adjusts based on user behavior)
   */
  public adaptiveRateLimiter(options: Partial<RateLimitOptions> = {}) {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      keyGenerator: (req) => {
        const user = (req as any).user;
        const baseKey = user ? `adaptive:user:${user.userId}` : `adaptive:ip:${req.ip}`;
        
        // Adjust based on user role or behavior
        if (user?.roles?.includes('volunteer') || user?.roles?.includes('therapist')) {
          return `${baseKey}:priority`;
        }
        
        return baseKey;
      },
      ...options
    });
  }

  /**
   * Progressive rate limiter (increases restrictions over time)
   */
  public progressiveRateLimiter(baseLimits: RateLimitOptions[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const keyGenerator = baseLimits[0].keyGenerator || this.defaultKeyGenerator;
      const key = keyGenerator(req);
      
      try {
        // Check each tier
        for (let i = 0; i < baseLimits.length; i++) {
          const limit = baseLimits[i];
          const tierKey = `${key}:tier:${i}`;
          const entry = await this.store.get(tierKey);
          
          if (entry && entry.count > limit.maxRequests) {
            this.logger.warn('Progressive rate limit exceeded', {
              action: 'progressive_rate_limit',
              tier: i,
              key: tierKey,
              count: entry.count,
              maxRequests: limit.maxRequests,
              ip: req.ip,
              path: req.path
            });
            
            res.status(429).json({
              error: `Rate limit exceeded (Tier ${i + 1})`,
              retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
            });
            return;
          }
        }

        // Increment all tiers
        for (let i = 0; i < baseLimits.length; i++) {
          const tierKey = `${key}:tier:${i}`;
          await this.store.increment(tierKey);
        }

        next();
      } catch (error) {
        this.logger.error('Progressive rate limiting error', error as Error);
        next();
      }
    };
  }

  /**
   * Whitelist rate limiter (bypasses rate limits for certain IPs/users)
   */
  public whitelistRateLimiter(whitelist: string[], baseLimiter: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const ip = req.ip || '';
      
      // Check if IP or user is whitelisted
      const isWhitelisted = 
        whitelist.includes(ip) ||
        (user && whitelist.includes(user.userId)) ||
        (user?.roles && user.roles.some((role: string) => whitelist.includes(`role:${role}`)));
      
      if (isWhitelisted) {
        this.logger.audit('Rate limit bypassed (whitelisted)', {
          action: 'rate_limit_bypass',
          ip,
          userId: user?.userId,
          roles: user?.roles,
          timestamp: new Date().toISOString()
        });
        return next();
      }
      
      return baseLimiter(req, res, next);
    };
  }

  /**
   * Default key generator
   */
  private defaultKeyGenerator(req: Request): string {
    const user = (req as any).user;
    return user ? `user:${user.userId}` : `ip:${req.ip}`;
  }

  /**
   * Reset rate limit for a key
   */
  public async resetLimit(key: string): Promise<void> {
    await this.store.delete(key);
    
    this.logger.audit('Rate limit reset', {
      action: 'rate_limit_reset',
      key,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get current rate limit status
   */
  public async getStatus(key: string): Promise<RateLimitEntry | undefined> {
    return await this.store.get(key);
  }

  /**
   * Clear all rate limits
   */
  public async clearAll(): Promise<void> {
    await this.store.clear();
    
    this.logger.audit('All rate limits cleared', {
      action: 'rate_limits_clear',
      timestamp: new Date().toISOString()
    });
  }
}

export default RateLimitService;