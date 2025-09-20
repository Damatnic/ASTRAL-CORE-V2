import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// Initialize Redis client (use environment variable or fallback to localhost)
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests per window
  message?: string;  // Custom error message
  skipIfAuthenticated?: boolean;  // Skip rate limiting for authenticated users
  keyGenerator?: (req: NextRequest) => string;  // Custom key generator function
}

// Default configurations for different endpoint types
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  },
  
  // Crisis endpoints need higher limits for emergency situations
  crisis: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Rate limit exceeded. If this is an emergency, please call 988.',
  },
  
  // Standard API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many requests. Please slow down.',
  },
  
  // AI therapy endpoints (resource intensive)
  aiTherapy: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'AI therapy rate limit exceeded. Please wait before continuing.',
  },
  
  // Search and data-heavy endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    message: 'Search rate limit exceeded. Please wait a moment.',
  },
};

// Rate limiter middleware
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<NextResponse | null> {
  try {
    // Skip rate limiting in development if specified
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return null;
    }

    // Generate unique key for rate limiting
    const key = config.keyGenerator ? 
      config.keyGenerator(req) : 
      `rate_limit:${req.ip || 'unknown'}:${req.nextUrl.pathname}`;

    // Get current count from Redis
    const current = await redis.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await redis.pexpire(key, config.windowMs);
    }
    
    // Get remaining TTL
    const ttl = await redis.pttl(key);
    
    // Check if limit exceeded
    if (current > config.maxRequests) {
      const retryAfter = Math.ceil(ttl / 1000);
      
      return NextResponse.json(
        { 
          error: config.message || 'Too many requests',
          retryAfter: retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + ttl).toISOString(),
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const remaining = config.maxRequests - current;
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
    
    return null; // Continue to the API route
  } catch (error) {
    // Log error but don't block requests if Redis is down
    console.error('Rate limiting error:', error);
    
    // In production, fail open (allow request) if Redis is unavailable
    // but log for monitoring
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Rate limiting failed in production, allowing request');
    }
    
    return null;
  }
}

// Helper function to create middleware wrapper for specific endpoints
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    const rateLimitResponse = await rateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    // Continue processing if not rate limited
    return null;
  };
}

// IP-based rate limiting for anonymous users
export function ipRateLimit(req: NextRequest, config: RateLimitConfig) {
  return rateLimit(req, {
    ...config,
    keyGenerator: (req) => `rate_limit:ip:${req.ip || req.headers.get('x-forwarded-for') || 'unknown'}`,
  });
}

// User-based rate limiting for authenticated users
export function userRateLimit(userId: string, endpoint: string, config: RateLimitConfig) {
  return rateLimit(null as any, {
    ...config,
    keyGenerator: () => `rate_limit:user:${userId}:${endpoint}`,
  });
}

// Global rate limit check for middleware
export async function checkGlobalRateLimit(req: NextRequest): Promise<boolean> {
  try {
    const key = `global_rate_limit:${req.ip || 'unknown'}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    // Global limit: 100 requests per minute per IP
    return current <= 100;
  } catch (error) {
    console.error('Global rate limit check error:', error);
    return true; // Fail open
  }
}

// Clean up old rate limit entries (run periodically)
export async function cleanupRateLimitKeys() {
  try {
    const keys = await redis.keys('rate_limit:*');
    const pipeline = redis.pipeline();
    
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) { // No expiry set
        pipeline.expire(key, 60); // Set 1 minute expiry
      }
    }
    
    await pipeline.exec();
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
}