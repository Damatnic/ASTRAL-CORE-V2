/**
 * CSRF Protection Service
 * Cross-Site Request Forgery protection for forms and API endpoints
 */

import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { SecurityLogger, SecurityEventType } from '../logging/security-logger';

export interface CSRFOptions {
  secretLength?: number;
  tokenLength?: number;
  saltLength?: number;
  sessionKey?: string;
  headerName?: string;
  parameterName?: string;
  cookieName?: string;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
  };
  excludePaths?: string[];
  excludeMethods?: string[];
}

export class CSRFProtection {
  private logger: SecurityLogger;
  private options: Required<CSRFOptions>;
  private tokenStore: Map<string, { token: string; timestamp: number }> = new Map();
  private secret: string;

  constructor(options: CSRFOptions = {}) {
    this.logger = new SecurityLogger();
    this.options = this.initializeOptions(options);
    this.secret = this.generateSecret();
    this.startCleanupInterval();
  }

  /**
   * Initialize CSRF options
   */
  private initializeOptions(options: CSRFOptions): Required<CSRFOptions> {
    return {
      secretLength: 32,
      tokenLength: 32,
      saltLength: 8,
      sessionKey: '_csrf',
      headerName: 'X-CSRF-Token',
      parameterName: '_csrf',
      cookieName: 'XSRF-TOKEN',
      cookieOptions: {
        httpOnly: false, // Must be false for JavaScript to read
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
        path: '/',
        ...options.cookieOptions
      },
      excludePaths: ['/api/health', '/api/status', ...(options.excludePaths || [])],
      excludeMethods: ['GET', 'HEAD', 'OPTIONS', ...(options.excludeMethods || [])],
      ...options
    };
  }

  /**
   * Generate secret for token generation
   */
  private generateSecret(): string {
    return process.env.CSRF_SECRET || crypto.randomBytes(this.options.secretLength).toString('hex');
  }

  /**
   * CSRF middleware
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF for excluded paths
      if (this.isExcludedPath(req.path)) {
        return next();
      }

      // Skip CSRF for excluded methods
      if (this.isExcludedMethod(req.method)) {
        // Generate and attach token for subsequent requests
        this.attachToken(req, res);
        return next();
      }

      // Verify CSRF token
      try {
        await this.verifyToken(req);
        // Generate new token for next request
        this.attachToken(req, res);
        next();
      } catch (error) {
        this.handleCSRFError(error as Error, req, res);
      }
    };
  }

  /**
   * Generate CSRF token
   */
  public generateToken(sessionId?: string): string {
    const salt = crypto.randomBytes(this.options.saltLength).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${salt}.${timestamp}.${sessionId || ''}`;
    
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');

    const token = `${salt}.${hash}`;

    // Store token with timestamp for cleanup
    if (sessionId) {
      this.tokenStore.set(sessionId, { token, timestamp: Date.now() });
    }

    return token;
  }

  /**
   * Verify CSRF token
   */
  public async verifyToken(req: Request): Promise<void> {
    const token = this.extractToken(req);

    if (!token) {
      throw new Error('CSRF token not found');
    }

    // Parse token
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new Error('Invalid CSRF token format');
    }

    const [salt, hash] = parts;
    const sessionId = req.sessionID || req.session?.id;

    // Regenerate hash
    const timestamp = Date.now().toString();
    const data = `${salt}.${timestamp}.${sessionId || ''}`;
    
    const expectedHash = crypto
      .createHmac('sha256', this.secret)
      .update(`${salt}.${timestamp}.${sessionId || ''}`)
      .digest('hex');

    // Verify token from store if session exists
    if (sessionId && this.tokenStore.has(sessionId)) {
      const storedToken = this.tokenStore.get(sessionId);
      if (storedToken?.token !== token) {
        // Allow regenerated token verification
        const regeneratedData = `${salt}.${storedToken?.timestamp}.${sessionId}`;
        const regeneratedHash = crypto
          .createHmac('sha256', this.secret)
          .update(regeneratedData)
          .digest('hex');

        if (hash !== regeneratedHash) {
          throw new Error('CSRF token verification failed');
        }
      }
    } else {
      // Verify without session (stateless)
      const verifyHash = crypto
        .createHmac('sha256', this.secret)
        .update(`${salt}.${Date.now().toString()}.`)
        .digest('hex');

      // Allow some time variance (5 minutes)
      const maxAge = 5 * 60 * 1000;
      let isValid = false;

      for (let i = 0; i < 10; i++) {
        const testTime = Date.now() - (i * 30000); // Check every 30 seconds
        const testData = `${salt}.${testTime}.${sessionId || ''}`;
        const testHash = crypto
          .createHmac('sha256', this.secret)
          .update(testData)
          .digest('hex');

        if (hash === testHash) {
          isValid = true;
          break;
        }
      }

      if (!isValid) {
        throw new Error('CSRF token verification failed');
      }
    }
  }

  /**
   * Extract token from request
   */
  private extractToken(req: Request): string | undefined {
    // Check header
    let token = req.headers[this.options.headerName.toLowerCase()] as string;

    // Check body
    if (!token && req.body) {
      token = req.body[this.options.parameterName];
    }

    // Check query
    if (!token && req.query) {
      token = req.query[this.options.parameterName] as string;
    }

    // Check cookie
    if (!token && req.cookies) {
      token = req.cookies[this.options.cookieName];
    }

    return token;
  }

  /**
   * Attach CSRF token to response
   */
  private attachToken(req: Request, res: Response): void {
    const sessionId = req.sessionID || req.session?.id;
    const token = this.generateToken(sessionId);

    // Set token in session if available
    if (req.session) {
      (req.session as any)[this.options.sessionKey] = token;
    }

    // Set token in cookie
    res.cookie(this.options.cookieName, token, this.options.cookieOptions as any);

    // Set token in response header
    res.setHeader(this.options.headerName, token);

    // Attach token to response locals for template rendering
    res.locals.csrfToken = token;
  }

  /**
   * Handle CSRF error
   */
  private handleCSRFError(error: Error, req: Request, res: Response): void {
    this.logger.logViolation(SecurityEventType.CSRF_VIOLATION, {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(403).json({
      error: 'CSRF token validation failed',
      code: 'CSRF_ERROR'
    });
  }

  /**
   * Check if path is excluded
   */
  private isExcludedPath(path: string): boolean {
    return this.options.excludePaths.some(excludedPath => {
      if (excludedPath.endsWith('*')) {
        return path.startsWith(excludedPath.slice(0, -1));
      }
      return path === excludedPath;
    });
  }

  /**
   * Check if method is excluded
   */
  private isExcludedMethod(method: string): boolean {
    return this.options.excludeMethods.includes(method.toUpperCase());
  }

  /**
   * Double submit cookie pattern middleware
   */
  public doubleSubmitCookie() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (this.isExcludedMethod(req.method)) {
        return next();
      }

      const cookieToken = req.cookies[this.options.cookieName];
      const headerToken = req.headers[this.options.headerName.toLowerCase()] as string;

      if (!cookieToken || !headerToken) {
        return res.status(403).json({
          error: 'CSRF tokens missing'
        });
      }

      if (cookieToken !== headerToken) {
        this.logger.logViolation(SecurityEventType.CSRF_VIOLATION, {
          path: req.path,
          method: req.method,
          ip: req.ip
        });

        return res.status(403).json({
          error: 'CSRF token mismatch'
        });
      }

      next();
    };
  }

  /**
   * Synchronizer token pattern middleware
   */
  public synchronizerToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (this.isExcludedMethod(req.method)) {
        this.attachToken(req, res);
        return next();
      }

      const sessionToken = (req.session as any)?.[this.options.sessionKey];
      const submittedToken = this.extractToken(req);

      if (!sessionToken || !submittedToken) {
        return res.status(403).json({
          error: 'CSRF token missing'
        });
      }

      if (sessionToken !== submittedToken) {
        this.logger.logViolation(SecurityEventType.CSRF_VIOLATION, {
          path: req.path,
          method: req.method,
          ip: req.ip,
          expected: sessionToken.substring(0, 10) + '...',
          received: submittedToken.substring(0, 10) + '...'
        });

        return res.status(403).json({
          error: 'CSRF token invalid'
        });
      }

      // Regenerate token after successful validation
      this.attachToken(req, res);
      next();
    };
  }

  /**
   * Clean up old tokens
   */
  private cleanupTokens(): void {
    const now = Date.now();
    const maxAge = this.options.cookieOptions.maxAge || 3600000;

    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (now - data.timestamp > maxAge) {
        this.tokenStore.delete(sessionId);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupTokens();
    }, 60 * 60 * 1000); // Clean up every hour
  }

  /**
   * Get CSRF token for a session
   */
  public getToken(sessionId: string): string | undefined {
    return this.tokenStore.get(sessionId)?.token;
  }

  /**
   * Invalidate token for a session
   */
  public invalidateToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
  }

  /**
   * React/Angular helper - get token from meta tag
   */
  public static getTokenFromMeta(): string | null {
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta?.getAttribute('content') || null;
    }
    return null;
  }

  /**
   * Axios interceptor for CSRF
   */
  public static axiosInterceptor(config: any): any {
    const token = CSRFProtection.getTokenFromMeta() || 
                  CSRFProtection.getTokenFromCookie('XSRF-TOKEN');
    
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }

    return config;
  }

  /**
   * Get token from cookie (client-side)
   */
  private static getTokenFromCookie(name: string): string | null {
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
    }
    return null;
  }
}