/**
 * Session Security Service
 * Secure session management with HIPAA compliance
 */

import session from 'express-session';
import MongoStore from 'connect-mongo';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { SecurityLogger, SecurityEventType } from '../logging/security-logger';

export interface SessionConfig {
  secret: string;
  name?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  rolling?: boolean;
  resave?: boolean;
  saveUninitialized?: boolean;
  store?: 'memory' | 'mongodb' | 'redis';
  mongoUrl?: string;
  redisUrl?: string;
  trustProxy?: boolean;
}

export interface SecureSession extends session.Session {
  userId?: string;
  role?: string;
  permissions?: string[];
  fingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity?: Date;
  loginTime?: Date;
  mfaVerified?: boolean;
  securityLevel?: 'low' | 'medium' | 'high';
  dataAccessLog?: Array<{
    timestamp: Date;
    resource: string;
    action: string;
  }>;
}

export class SessionSecurity {
  private logger: SecurityLogger;
  private sessionConfig: SessionConfig;
  private redis?: Redis;
  private activeSessions: Map<string, SecureSession> = new Map();
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<SessionConfig>) {
    this.logger = new SecurityLogger();
    this.sessionConfig = this.initializeConfig(config);
    
    if (this.sessionConfig.store === 'redis') {
      this.initializeRedis();
    }
  }

  /**
   * Initialize session configuration
   */
  private initializeConfig(config?: Partial<SessionConfig>): SessionConfig {
    return {
      secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
      name: 'astral.sid',
      maxAge: 30 * 60 * 1000, // 30 minutes default
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      rolling: true,
      resave: false,
      saveUninitialized: false,
      store: process.env.SESSION_STORE as SessionConfig['store'] || 'memory',
      mongoUrl: process.env.MONGODB_URI,
      redisUrl: process.env.REDIS_URL,
      trustProxy: true,
      ...config
    };
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    if (this.sessionConfig.redisUrl) {
      this.redis = new Redis(this.sessionConfig.redisUrl);
      
      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error', error);
      });

      this.redis.on('connect', () => {
        this.logger.info('Redis connected for session storage');
      });
    }
  }

  /**
   * Create session middleware
   */
  public middleware(): any {
    const sessionOptions: session.SessionOptions = {
      secret: this.sessionConfig.secret,
      name: this.sessionConfig.name,
      cookie: {
        maxAge: this.sessionConfig.maxAge,
        secure: this.sessionConfig.secure,
        httpOnly: this.sessionConfig.httpOnly,
        sameSite: this.sessionConfig.sameSite as any,
        path: '/',
        domain: process.env.COOKIE_DOMAIN
      },
      rolling: this.sessionConfig.rolling,
      resave: this.sessionConfig.resave,
      saveUninitialized: this.sessionConfig.saveUninitialized,
      store: this.getSessionStore()
    };

    const sessionMiddleware = session(sessionOptions);

    // Return enhanced middleware with security checks
    return (req: Request, res: Response, next: NextFunction) => {
      sessionMiddleware(req, res, () => {
        this.enhanceSession(req, res);
        this.validateSession(req, res, next);
      });
    };
  }

  /**
   * Get session store based on configuration
   */
  private getSessionStore(): any {
    switch (this.sessionConfig.store) {
      case 'mongodb':
        if (!this.sessionConfig.mongoUrl) {
          throw new Error('MongoDB URL required for MongoDB session store');
        }
        return MongoStore.create({
          mongoUrl: this.sessionConfig.mongoUrl,
          touchAfter: 24 * 3600, // Lazy session update
          crypto: {
            secret: this.sessionConfig.secret
          }
        });

      case 'redis':
        if (!this.redis) {
          throw new Error('Redis not initialized');
        }
        const RedisStore = require('connect-redis').default;
        return new RedisStore({
          client: this.redis,
          prefix: 'sess:',
          ttl: this.sessionConfig.maxAge! / 1000
        });

      default:
        // Memory store (development only)
        if (process.env.NODE_ENV === 'production') {
          console.warn('Using memory session store in production is not recommended');
        }
        return undefined;
    }
  }

  /**
   * Enhance session with security features
   */
  private enhanceSession(req: Request, res: Response): void {
    const session = req.session as SecureSession;

    if (!session.fingerprint) {
      // Generate session fingerprint
      session.fingerprint = this.generateFingerprint(req);
    }

    // Update session metadata
    session.ipAddress = this.getClientIP(req);
    session.userAgent = req.headers['user-agent'];
    session.lastActivity = new Date();

    // Add security headers for session
    res.setHeader('X-Session-ID', req.sessionID);
  }

  /**
   * Validate session security
   */
  private validateSession(req: Request, res: Response, next: NextFunction): void {
    const session = req.session as SecureSession;

    // Check session fingerprint
    if (session.fingerprint) {
      const currentFingerprint = this.generateFingerprint(req);
      if (session.fingerprint !== currentFingerprint) {
        this.logger.logViolation(SecurityEventType.SESSION_HIJACK_ATTEMPT, {
          sessionId: req.sessionID,
          expectedFingerprint: session.fingerprint,
          actualFingerprint: currentFingerprint,
          ipAddress: this.getClientIP(req)
        });

        // Destroy compromised session
        this.destroySession(req, res);
        res.status(401).json({ error: 'Session security violation' });
        return;
      }
    }

    // Check session timeout
    if (session.lastActivity) {
      const inactiveTime = Date.now() - new Date(session.lastActivity).getTime();
      const maxInactiveTime = this.sessionConfig.maxAge! * 2; // Double the cookie maxAge

      if (inactiveTime > maxInactiveTime) {
        this.logger.info('Session timeout', {
          sessionId: req.sessionID,
          inactiveTime
        });

        this.destroySession(req, res);
        res.status(401).json({ error: 'Session expired' });
        return;
      }
    }

    // Check concurrent sessions
    if (session.userId) {
      this.checkConcurrentSessions(session.userId, req.sessionID);
    }

    // Track active session
    this.activeSessions.set(req.sessionID, session);

    // Set session timeout handler
    this.setSessionTimeout(req.sessionID);

    next();
  }

  /**
   * Generate session fingerprint
   */
  private generateFingerprint(req: Request): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      this.getClientIP(req)
    ];

    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      ''
    );
  }

  /**
   * Check for concurrent sessions
   */
  private checkConcurrentSessions(userId: string, currentSessionId: string): void {
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([id, session]) => session.userId === userId && id !== currentSessionId);

    if (userSessions.length > 0) {
      this.logger.warn('Concurrent sessions detected', {
        userId,
        sessionCount: userSessions.length + 1,
        sessions: userSessions.map(([id]) => id)
      });

      // Optional: Terminate other sessions
      if (process.env.ENFORCE_SINGLE_SESSION === 'true') {
        userSessions.forEach(([sessionId]) => {
          this.terminateSession(sessionId);
        });
      }
    }
  }

  /**
   * Set session timeout
   */
  private setSessionTimeout(sessionId: string): void {
    // Clear existing timeout
    const existingTimeout = this.sessionTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.terminateSession(sessionId);
    }, this.sessionConfig.maxAge!);

    this.sessionTimeouts.set(sessionId, timeout);
  }

  /**
   * Terminate session
   */
  private terminateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    
    const timeout = this.sessionTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(sessionId);
    }

    // Remove from store
    if (this.redis) {
      this.redis.del(`sess:${sessionId}`);
    }

    this.logger.info('Session terminated', { sessionId });
  }

  /**
   * Destroy session
   */
  public destroySession(req: Request, res: Response): void {
    const sessionId = req.sessionID;
    
    req.session.destroy((err) => {
      if (err) {
        this.logger.error('Session destruction error', err);
      }
    });

    res.clearCookie(this.sessionConfig.name!);
    this.terminateSession(sessionId);
  }

  /**
   * Regenerate session ID (for privilege escalation)
   */
  public regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      const oldSessionId = req.sessionID;
      const session = req.session as SecureSession;

      req.session.regenerate((err) => {
        if (err) {
          this.logger.error('Session regeneration error', err);
          reject(err);
        } else {
          // Copy session data
          Object.assign(req.session, session);
          
          // Update tracking
          this.activeSessions.delete(oldSessionId);
          this.activeSessions.set(req.sessionID, req.session as SecureSession);

          this.logger.info('Session regenerated', {
            oldSessionId,
            newSessionId: req.sessionID
          });

          resolve();
        }
      });
    });
  }

  /**
   * Validate session permissions
   */
  public hasPermission(session: SecureSession, permission: string): boolean {
    return session.permissions?.includes(permission) || false;
  }

  /**
   * Require authentication middleware
   */
  public requireAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
      const session = req.session as SecureSession;

      if (!session.userId) {
        this.logger.logAuth(false, undefined, {
          path: req.path,
          ipAddress: this.getClientIP(req)
        });

        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      next();
    };
  }

  /**
   * Require specific role middleware
   */
  public requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const session = req.session as SecureSession;

      if (!session.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (session.role !== role && session.role !== 'admin') {
        this.logger.logViolation(SecurityEventType.ACCESS_DENIED, {
          userId: session.userId,
          requiredRole: role,
          actualRole: session.role,
          path: req.path
        });

        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }

  /**
   * Require MFA verification
   */
  public requireMFA() {
    return (req: Request, res: Response, next: NextFunction) => {
      const session = req.session as SecureSession;

      if (!session.mfaVerified) {
        res.status(403).json({ 
          error: 'MFA verification required',
          mfaRequired: true 
        });
        return;
      }

      next();
    };
  }

  /**
   * Get session metrics
   */
  public getSessionMetrics(): any {
    return {
      activeSessions: this.activeSessions.size,
      sessions: Array.from(this.activeSessions.entries()).map(([id, session]) => ({
        id,
        userId: session.userId,
        lastActivity: session.lastActivity,
        loginTime: session.loginTime,
        ipAddress: session.ipAddress
      }))
    };
  }

  /**
   * Clean up expired sessions
   */
  public cleanupSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.lastActivity) {
        const age = now - new Date(session.lastActivity).getTime();
        if (age > this.sessionConfig.maxAge! * 2) {
          this.terminateSession(sessionId);
        }
      }
    }

    this.logger.info('Session cleanup completed', {
      remainingSessions: this.activeSessions.size
    });
  }
}