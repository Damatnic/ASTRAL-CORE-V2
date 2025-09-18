/**
 * Security Headers Configuration
 * Additional security headers for enhanced protection
 */

import { Request, Response, NextFunction } from 'express';

export class SecurityHeaders {
  /**
   * Apply comprehensive security headers
   */
  public static apply() {
    return (req: Request, res: Response, next: NextFunction) => {
      // HSTS - Enforce HTTPS
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
      }

      // Content Security Policy - Prevent XSS
      res.setHeader(
        'Content-Security-Policy',
        this.getCSPPolicy()
      );

      // X-Frame-Options - Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // X-Content-Type-Options - Prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // X-XSS-Protection - Legacy XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer-Policy - Control referrer information
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions-Policy - Control browser features
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self), payment=()'
      );

      // Cross-Origin Headers
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

      // Additional security headers
      res.setHeader('X-DNS-Prefetch-Control', 'off');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

      // Remove sensitive headers
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      // Cache control for sensitive pages
      if (req.path.includes('/api/') || req.path.includes('/auth/')) {
        res.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      }

      next();
    };
  }

  /**
   * Get CSP policy string
   */
  private static getCSPPolicy(): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net",
      "style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ];

    return policies.join('; ');
  }

  /**
   * Apply CORS headers with security
   */
  public static cors(allowedOrigins: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;

      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-CSRF-Token, X-Request-ID'
        );
        res.setHeader('Access-Control-Max-Age', '86400');
      }

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
      } else {
        next();
      }
    };
  }
}