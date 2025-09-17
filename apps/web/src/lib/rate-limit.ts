/**
 * Rate Limiting Middleware
 * Provides protection against abuse and ensures service availability
 * Critical for mental health platform stability
 */

// Simple LRU Cache implementation for rate limiting
class LRUCache<K, V> {
  private cache: Map<K, { value: V; expires: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(options: { max: number; ttl: number }) {
    this.cache = new Map();
    this.maxSize = options.max;
    this.ttl = options.ttl;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: K, value: V): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    });
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export interface RateLimitOptions {
  interval?: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max number of unique tokens
  maxRequests?: number; // Max requests per interval
}

export interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>;
  remaining: (token: string) => number;
  reset: (token: string) => void;
}

/**
 * Creates a rate limiter instance
 * Uses in-memory LRU cache for performance
 */
export function rateLimit(options: RateLimitOptions = {}): RateLimiter {
  const {
    interval = 60 * 1000, // Default 1 minute
    uniqueTokenPerInterval = 500,
    maxRequests = 10,
  } = options;

  const cache = new LRUCache<string, number[]>({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    /**
     * Checks if a request should be rate limited
     * Throws an error if limit exceeded
     */
    async check(limit: number, token: string): Promise<void> {
      const now = Date.now();
      const windowStart = now - interval;
      
      // Get existing requests for this token
      const requests = cache.get(token) || [];
      
      // Filter out requests outside the current window
      const validRequests = requests.filter(time => time > windowStart);
      
      // Check if limit exceeded
      if (validRequests.length >= limit) {
        const oldestRequest = Math.min(...validRequests);
        const resetTime = oldestRequest + interval;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        const error = new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
        (error as any).status = 429;
        (error as any).retryAfter = retryAfter;
        throw error;
      }
      
      // Add current request
      validRequests.push(now);
      cache.set(token, validRequests);
    },
    
    /**
     * Returns the number of remaining requests for a token
     */
    remaining(token: string): number {
      const now = Date.now();
      const windowStart = now - interval;
      const requests = cache.get(token) || [];
      const validRequests = requests.filter(time => time > windowStart);
      return Math.max(0, maxRequests - validRequests.length);
    },
    
    /**
     * Resets the rate limit for a specific token
     */
    reset(token: string): void {
      cache.delete(token);
    },
  };
}

/**
 * Crisis-specific rate limiter with higher limits
 * Critical services should not be rate limited as aggressively
 */
export const crisisRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
  maxRequests: 100, // Much higher limit for crisis situations
});

/**
 * API endpoint rate limiter
 * Standard limits for general API usage
 */
export const apiRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
  maxRequests: 100,
});

/**
 * Authentication rate limiter
 * Stricter limits to prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 100,
  maxRequests: 5,
});

/**
 * Export rate limiter for data exports
 * Very restrictive to prevent data harvesting
 */
export const exportRateLimit = rateLimit({
  interval: 24 * 60 * 60 * 1000, // 24 hours
  uniqueTokenPerInterval: 100,
  maxRequests: 3,
});

/**
 * Helper to get client identifier from request
 * Uses IP address with fallback to session ID
 */
export function getClientId(request: Request): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  // Use first available IP
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown';
  
  // For anonymous users, combine with user agent for better uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const hash = Buffer.from(`${ip}:${userAgent}`).toString('base64').slice(0, 16);
  
  return `${ip}:${hash}`;
}

/**
 * Express/Next.js middleware wrapper
 */
export function rateLimitMiddleware(
  limiter: RateLimiter,
  limit: number = 10,
  keyGenerator?: (req: any) => string
) {
  return async (req: any, res: any, next: any) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : getClientId(req);
      await limiter.check(limit, key);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', limiter.remaining(key).toString());
      
      next();
    } catch (error: any) {
      if (error.status === 429) {
        res.setHeader('Retry-After', error.retryAfter.toString());
        res.status(429).json({
          error: 'Too Many Requests',
          message: error.message,
          retryAfter: error.retryAfter,
        });
      } else {
        next(error);
      }
    }
  };
}

