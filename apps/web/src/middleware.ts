import { NextRequest, NextResponse } from 'next/server';

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
export default function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  
  // Rate limiting
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
  
  // Additional security for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // API-specific security headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  }
  
  // Security for sensitive routes
  const sensitiveRoutes = ['/admin', '/dashboard'];
  const isSensitiveRoute = sensitiveRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isSensitiveRoute) {
    // Enhanced security for sensitive routes
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
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