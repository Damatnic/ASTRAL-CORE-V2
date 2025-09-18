/**
 * Content Security Policy Configuration
 * HIPAA-compliant CSP directives for mental health platform
 */

export class CSPConfig {
  private environment: string;

  constructor(environment: string = 'production') {
    this.environment = environment;
  }

  /**
   * Get CSP directives based on environment
   */
  public getDirectives(): Record<string, any> {
    const baseDirectives = {
      defaultSrc: ["'self'"],
      scriptSrc: this.getScriptSources(),
      styleSrc: this.getStyleSources(),
      imgSrc: this.getImageSources(),
      connectSrc: this.getConnectSources(),
      fontSrc: this.getFontSources(),
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
      reportUri: '/api/security/csp-report',
      reportTo: 'csp-endpoint',
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'", 'blob:']
    };

    // Add nonces for inline scripts in production
    if (this.environment === 'production') {
      baseDirectives.scriptSrc.push("'strict-dynamic'");
      baseDirectives.styleSrc.push("'nonce-{nonce}'"); // Use nonce instead of unsafe-inline
    }

    return baseDirectives;
  }

  /**
   * Script sources configuration
   */
  private getScriptSources(): string[] {
    const sources = ["'self'"];

    if (this.environment === 'development') {
      sources.push("'unsafe-eval'"); // For hot reload
      sources.push("'unsafe-inline'"); // For development tools
    } else {
      // Production - use nonces or hashes for inline scripts
      sources.push("'nonce-{NONCE}'"); // Will be replaced by middleware
    }

    // Trusted CDNs for production
    if (this.environment === 'production') {
      sources.push(
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com'
      );
    }

    return sources;
  }

  /**
   * Style sources configuration
   */
  private getStyleSources(): string[] {
    const sources = ["'self'"];

    // Use nonce for styled-components instead of unsafe-inline
    sources.push("'nonce-{nonce}'");

    // Trusted CDNs
    if (this.environment === 'production') {
      sources.push(
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      );
    }

    return sources;
  }

  /**
   * Image sources configuration
   */
  private getImageSources(): string[] {
    return [
      "'self'",
      'data:',
      'blob:',
      'https://*.cloudinary.com', // If using Cloudinary for images
      'https://*.amazonaws.com', // If using S3
      'https://*.googleusercontent.com' // For OAuth profile pictures
    ];
  }

  /**
   * Connection sources configuration
   */
  private getConnectSources(): string[] {
    const sources = ["'self'"];

    // API endpoints
    sources.push(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      'wss://*.astralcore.com', // WebSocket connections
      'https://*.sentry.io', // Error tracking
      'https://api.segment.io' // Analytics
    );

    // Development sources
    if (this.environment === 'development') {
      sources.push(
        'http://localhost:*',
        'ws://localhost:*',
        'http://127.0.0.1:*',
        'ws://127.0.0.1:*'
      );
    }

    return sources;
  }

  /**
   * Font sources configuration
   */
  private getFontSources(): string[] {
    return [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com'
    ];
  }

  /**
   * Generate CSP report-to header
   */
  public getReportToHeader(): string {
    return JSON.stringify({
      group: 'csp-endpoint',
      max_age: 86400,
      endpoints: [{
        url: '/api/security/csp-report'
      }]
    });
  }

  /**
   * Generate nonce for inline scripts
   */
  public generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }
}