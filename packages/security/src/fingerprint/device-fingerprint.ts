/**
 * Device Fingerprinting Service
 * Track and validate device fingerprints for enhanced security
 */

import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
// Removed vulnerable express-fingerprint dependency
// Using secure custom implementation
import { SecurityLogger, SecurityEventType } from '../logging/security-logger';

export interface DeviceFingerprintData {
  hash: string;
  components: {
    userAgent: string;
    acceptHeaders: string;
    language: string;
    colorDepth?: number;
    screenResolution?: string;
    timezone?: string;
    sessionStorage?: boolean;
    localStorage?: boolean;
    indexedDB?: boolean;
    cpuClass?: string;
    platform?: string;
    plugins?: string[];
    canvas?: string;
    webgl?: string;
    fonts?: string[];
    audio?: string;
  };
  ipAddress: string;
  timestamp: Date;
  trustScore: number;
}

export interface FingerprintOptions {
  parameters?: string[];
  trustThreshold?: number;
  maxDevicesPerUser?: number;
  requireFingerprint?: boolean;
  enableCanvasFingerprint?: boolean;
  enableWebGLFingerprint?: boolean;
  enableAudioFingerprint?: boolean;
}

export class DeviceFingerprint {
  private logger: SecurityLogger;
  private options: Required<FingerprintOptions>;
  private deviceStore: Map<string, DeviceFingerprintData[]> = new Map();
  private suspiciousDevices: Set<string> = new Set();

  constructor(options: FingerprintOptions = {}) {
    this.logger = new SecurityLogger();
    this.options = this.initializeOptions(options);
  }

  /**
   * Initialize fingerprint options
   */
  private initializeOptions(options: FingerprintOptions): Required<FingerprintOptions> {
    return {
      parameters: ['useragent', 'acceptHeaders', 'geoip'],
      trustThreshold: 0.7,
      maxDevicesPerUser: 5,
      requireFingerprint: false,
      enableCanvasFingerprint: true,
      enableWebGLFingerprint: true,
      enableAudioFingerprint: false,
      ...options
    };
  }

  /**
   * Fingerprint middleware (secure custom implementation)
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Create basic fingerprint from request headers
      const basicFingerprint = this.createBasicFingerprint(req);
      (req as any).fingerprint = basicFingerprint;
      
      this.enhanceFingerprint(req, res);
      this.validateFingerprint(req, res, next);
    };
  }

  /**
   * Create basic fingerprint from request data
   */
  private createBasicFingerprint(req: Request): any {
    return {
      hash: '',
      components: {
        userAgent: req.headers['user-agent'] || '',
        acceptHeaders: req.headers['accept'] || '',
        language: req.headers['accept-language'] || '',
        encoding: req.headers['accept-encoding'] || '',
        connection: req.headers['connection'] || '',
        cache: req.headers['cache-control'] || ''
      }
    };
  }

  /**
   * Enhance fingerprint with additional data
   */
  private enhanceFingerprint(req: Request, res: Response): void {
    const fingerprint = (req as any).fingerprint;
    
    if (!fingerprint) {
      return;
    }

    // Add additional components
    const enhanced = {
      ...fingerprint,
      components: {
        ...fingerprint.components,
        timezone: req.headers['x-timezone'] as string,
        colorDepth: req.headers['x-color-depth'] as string,
        screenResolution: req.headers['x-screen-resolution'] as string,
        platform: req.headers['x-platform'] as string,
        language: req.headers['accept-language']?.split(',')[0] || ''
      }
    };

    // Calculate trust score
    const trustScore = this.calculateTrustScore(enhanced);
    
    // Store enhanced fingerprint
    (req as any).deviceFingerprint = {
      hash: this.generateFingerprintHash(enhanced),
      components: enhanced.components,
      ipAddress: this.getClientIP(req),
      timestamp: new Date(),
      trustScore
    };

    // Set fingerprint in response header
    res.setHeader('X-Device-Fingerprint', (req as any).deviceFingerprint.hash);
  }

  /**
   * Validate device fingerprint
   */
  private validateFingerprint(req: Request, res: Response, next: NextFunction): void {
    const fingerprint = (req as any).deviceFingerprint as DeviceFingerprintData;
    
    if (!fingerprint && this.options.requireFingerprint) {
      this.logger.warn('Missing device fingerprint', {
        path: req.path,
        ip: this.getClientIP(req)
      });
      res.status(400).json({ error: 'Device fingerprint required' });
      return;
    }

    if (!fingerprint) {
      return next();
    }

    // Check if device is suspicious
    if (this.suspiciousDevices.has(fingerprint.hash)) {
      this.logger.logViolation(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        fingerprint: fingerprint.hash,
        ip: fingerprint.ipAddress,
        path: req.path
      });

      res.status(403).json({ error: 'Suspicious device detected' });
      return;
    }

    // Check trust score
    if (fingerprint.trustScore < this.options.trustThreshold) {
      this.logger.warn('Low trust score device', {
        fingerprint: fingerprint.hash,
        trustScore: fingerprint.trustScore,
        ip: fingerprint.ipAddress
      });

      // Optional: Require additional verification for low trust devices
      (req as any).requireAdditionalVerification = true;
    }

    // Track device for user
    if ((req.session as any)?.userId) {
      this.trackUserDevice((req.session as any).userId, fingerprint);
    }

    next();
  }

  /**
   * Generate fingerprint hash
   */
  private generateFingerprintHash(fingerprint: any): string {
    const data = JSON.stringify({
      userAgent: fingerprint.components.userAgent,
      acceptHeaders: fingerprint.components.acceptHeaders,
      language: fingerprint.components.language,
      colorDepth: fingerprint.components.colorDepth,
      screenResolution: fingerprint.components.screenResolution,
      timezone: fingerprint.components.timezone,
      platform: fingerprint.components.platform
    });

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Calculate trust score for device
   */
  private calculateTrustScore(fingerprint: any): number {
    let score = 0;
    let factors = 0;

    // User agent consistency
    if (fingerprint.components.userAgent) {
      const ua = fingerprint.components.userAgent.toLowerCase();
      // Check for common bot patterns
      if (!ua.includes('bot') && !ua.includes('crawl') && !ua.includes('spider')) {
        score += 0.2;
      }
      factors++;
    }

    // Accept headers present
    if (fingerprint.components.acceptHeaders) {
      score += 0.15;
      factors++;
    }

    // Language header present
    if (fingerprint.components.language) {
      score += 0.15;
      factors++;
    }

    // Screen resolution (client-side data)
    if (fingerprint.components.screenResolution) {
      const resolution = fingerprint.components.screenResolution;
      // Check for common resolutions
      if (resolution && !resolution.includes('0x0')) {
        score += 0.15;
      }
      factors++;
    }

    // Timezone presence
    if (fingerprint.components.timezone) {
      score += 0.1;
      factors++;
    }

    // Platform consistency
    if (fingerprint.components.platform) {
      score += 0.1;
      factors++;
    }

    // IP address reputation (simplified)
    if (fingerprint.hash) {
      // Check if not from known VPN/proxy ranges
      score += 0.15;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Track user devices
   */
  private trackUserDevice(userId: string, fingerprint: DeviceFingerprintData): void {
    const userDevices = this.deviceStore.get(userId) || [];
    
    // Check if device already tracked
    const existingDevice = userDevices.find(d => d.hash === fingerprint.hash);
    
    if (!existingDevice) {
      // New device for user
      userDevices.push(fingerprint);
      
      // Check device limit
      if (userDevices.length > this.options.maxDevicesPerUser) {
        this.logger.warn('User exceeded device limit', {
          userId,
          deviceCount: userDevices.length,
          newDevice: fingerprint.hash
        });

        // Remove oldest device
        userDevices.shift();
      }

      this.deviceStore.set(userId, userDevices);

      // Log new device
      this.logger.info('New device registered for user', {
        userId,
        deviceHash: fingerprint.hash,
        trustScore: fingerprint.trustScore
      });
    } else {
      // Update last seen
      existingDevice.timestamp = new Date();
    }
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
   * Mark device as suspicious
   */
  public markSuspicious(fingerprintHash: string, reason: string): void {
    this.suspiciousDevices.add(fingerprintHash);
    
    this.logger.logViolation(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      fingerprint: fingerprintHash,
      reason,
      action: 'marked_suspicious'
    });
  }

  /**
   * Remove suspicious marking
   */
  public unmarkSuspicious(fingerprintHash: string): void {
    this.suspiciousDevices.delete(fingerprintHash);
    
    this.logger.info('Device unmarked as suspicious', {
      fingerprint: fingerprintHash
    });
  }

  /**
   * Get user devices
   */
  public getUserDevices(userId: string): DeviceFingerprintData[] {
    return this.deviceStore.get(userId) || [];
  }

  /**
   * Remove user device
   */
  public removeUserDevice(userId: string, fingerprintHash: string): boolean {
    const devices = this.deviceStore.get(userId);
    
    if (!devices) {
      return false;
    }

    const filtered = devices.filter(d => d.hash !== fingerprintHash);
    
    if (filtered.length < devices.length) {
      this.deviceStore.set(userId, filtered);
      
      this.logger.info('Device removed for user', {
        userId,
        deviceHash: fingerprintHash
      });
      
      return true;
    }

    return false;
  }

  /**
   * Client-side fingerprint collection script
   */
  public getClientScript(): string {
    return `
      (function() {
        const fingerprint = {
          screenResolution: screen.width + 'x' + screen.height,
          colorDepth: screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
          languages: navigator.languages,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigator.deviceMemory,
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          indexedDB: !!window.indexedDB,
          canvas: getCanvasFingerprint(),
          webgl: getWebGLFingerprint(),
          fonts: getFontsFingerprint()
        };

        function getCanvasFingerprint() {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('fingerprint', 2, 2);
            return canvas.toDataURL().substring(0, 100);
          } catch (e) {
            return null;
          }
        }

        function getWebGLFingerprint() {
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return null;
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return null;
            return {
              vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
              renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
          } catch (e) {
            return null;
          }
        }

        function getFontsFingerprint() {
          // Simplified font detection
          const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New'];
          return fonts.filter(font => document.fonts.check('12px ' + font));
        }

        // Send fingerprint data with requests
        fetch('/api/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Screen-Resolution': fingerprint.screenResolution,
            'X-Color-Depth': fingerprint.colorDepth.toString(),
            'X-Timezone': fingerprint.timezone,
            'X-Platform': fingerprint.platform
          },
          body: JSON.stringify(fingerprint)
        });

        // Store in session storage for subsequent requests
        sessionStorage.setItem('deviceFingerprint', JSON.stringify(fingerprint));
      })();
    `;
  }

  /**
   * Analyze device anomalies
   */
  public analyzeAnomalies(fingerprint: DeviceFingerprintData): string[] {
    const anomalies: string[] = [];

    // Check for headless browser indicators
    if (!fingerprint.components.plugins || fingerprint.components.plugins.length === 0) {
      anomalies.push('No browser plugins detected');
    }

    // Check for automation tools
    const ua = fingerprint.components.userAgent.toLowerCase();
    if (ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium')) {
      anomalies.push('Automation tool detected');
    }

    // Check for impossible combinations
    if (fingerprint.components.platform === 'Win32' && ua.includes('linux')) {
      anomalies.push('Platform mismatch');
    }

    // Check for missing expected headers
    if (!fingerprint.components.acceptHeaders || !fingerprint.components.language) {
      anomalies.push('Missing standard headers');
    }

    return anomalies;
  }

  /**
   * Get device metrics
   */
  public getMetrics(): any {
    return {
      totalDevices: Array.from(this.deviceStore.values()).flat().length,
      suspiciousDevices: this.suspiciousDevices.size,
      usersWithMultipleDevices: Array.from(this.deviceStore.entries())
        .filter(([_, devices]) => devices.length > 1).length,
      devicesByUser: Array.from(this.deviceStore.entries()).map(([userId, devices]) => ({
        userId,
        deviceCount: devices.length,
        devices: devices.map(d => ({
          hash: d.hash.substring(0, 10) + '...',
          trustScore: d.trustScore,
          lastSeen: d.timestamp
        }))
      }))
    };
  }
}