import { NextRequest, NextResponse } from 'next/server';
import { checkGlobalRateLimit, rateLimit as rateLimitHandler, rateLimitConfigs } from './lib/rate-limiter';
import { getToken } from 'next-auth/jwt';

// Production Security Headers - OWASP Compliant
const securityHeaders = [
  // Content Security Policy - Strict configuration
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://vitals.vercel-insights.com https://dev-ac3ajs327vs5vzhk.us.auth0.com https://api.openai.com;
      media-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()
  },
  // Strict Transport Security with preload
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  // Referrer Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // Permissions Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // Cross-Origin Opener Policy
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  // Cross-Origin Resource Policy
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin'
  }
];

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function rateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const key = ip;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Production Security Middleware
 * Mental health platform with enterprise-grade security
 * Accessible to all users while maintaining security standards
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check global rate limit first (using Redis if available)
  try {
    const globalRateLimitOk = await checkGlobalRateLimit(request);
    if (!globalRateLimitOk) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain'
        }
      });
    }
  } catch (error) {
    // Fall back to in-memory rate limiting if Redis is not available
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    if (!rateLimit(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain'
        }
      });
    }
  }

  // Apply API-specific rate limiting
  if (pathname.startsWith('/api/')) {
    // Define API route rate limit configurations
    const apiRateLimits: Record<string, typeof rateLimitConfigs[keyof typeof rateLimitConfigs]> = {
      '/api/auth': rateLimitConfigs.auth,
      '/api/crisis': rateLimitConfigs.crisis,
      '/api/ai-therapy': rateLimitConfigs.aiTherapy,
      '/api/search': rateLimitConfigs.search,
    };

    // Find the most specific rate limit config for this API route
    let rateLimitConfig = rateLimitConfigs.api; // Default
    
    for (const [route, config] of Object.entries(apiRateLimits)) {
      if (pathname.startsWith(route)) {
        rateLimitConfig = config;
        break;
      }
    }
    
    // Apply rate limiting
    const rateLimitResponse = await rateLimitHandler(request, rateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Authentication check for protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/therapist', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!token) {
        // Redirect to sign in page with return URL
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }
  
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  
  // Additional security for API routes
  if (pathname.startsWith('/api/')) {
    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // API-specific security headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  }
  
  // Security for sensitive routes
  const sensitiveRoutes = ['/admin', '/dashboard'];
  const isSensitiveRoute = sensitiveRoutes.some(route => pathname.startsWith(route));
  
  if (isSensitiveRoute) {
    // Enhanced security for sensitive routes
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  // Crisis route specific headers
  if (pathname.startsWith('/crisis')) {
    response.headers.set('X-Crisis-Route', 'true');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

// Configure matcher to handle all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};