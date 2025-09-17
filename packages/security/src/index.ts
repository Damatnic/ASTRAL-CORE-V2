/**
 * Security Package - Main Entry Point
 * HIPAA-compliant security for mental health crisis platform
 */

// Core Security Modules
export * from './encryption';
export * from './authentication';
export * from './authorization';
export * from './rateLimit';
export * from './sanitization';
export * from './audit';

// Middleware
export { SecurityMiddleware } from './middleware/security-middleware';
export type { SecurityOptions } from './middleware/security-middleware';
export { SecurityHeaders } from './middleware/security-headers';
export type { CSPConfig } from './middleware/csp-config';

// Encryption
export { EncryptionService } from './encryption/encryption-service';
export type { EncryptedData, KeyPair } from './encryption/encryption-service';
export { DataEncryptionAtRest } from './encryption/data-encryption-at-rest';
export type { EncryptionConfig, EncryptedDocument } from './encryption/data-encryption-at-rest';

// Authentication & Authorization
export { AuthenticationService } from './authentication';
export type { AuthUser, AuthTokenPayload, MFASetup } from './authentication';
export { AuthorizationService } from './authorization';
export type { Permission, Role, UserAuthorization } from './authorization';

// Rate Limiting
export { RateLimitService, MemoryStore } from './rateLimit';
export type { RateLimitOptions, RateLimitStore } from './rateLimit';

// Input Sanitization
export { InputSanitizer } from './sanitization/input-sanitizer';
export type { SanitizationOptions } from './sanitization/input-sanitizer';

// Session Security
export { SessionSecurity } from './session/session-security';
export type { SessionConfig, SecureSession } from './session/session-security';

// CSRF Protection
export { CSRFProtection } from './csrf/csrf-protection';
export type { CSRFOptions } from './csrf/csrf-protection';

// Device Fingerprinting
export { DeviceFingerprint } from './fingerprint/device-fingerprint';
export type { DeviceFingerprintData, FingerprintOptions } from './fingerprint/device-fingerprint';

// Security Logging & Audit
export { SecurityLogger } from './logging/security-logger';
export type { SecurityEvent, SecurityEventType, AuditLogEntry } from './logging/security-logger';
export { AuditService } from './audit';
export type { AuditEvent, AuditQuery, AuditSummary } from './audit';

// HIPAA Audit Logger
export { HIPAAAuditLogger } from './audit-logger';
export type { 
  HIPAAAuditEvent, 
  HIPAAComplianceReport, 
  AuditQueryOptions,
  HIPAAAuditCategory,
  HIPAARiskLevel,
  HIPAAComplianceStatus 
} from './audit-logger';

// HIPAA Breach Detection
export { HIPAABreachDetector } from './breach-detector';
export type { 
  BreachPattern, 
  BreachIncident, 
  BreachAlert,
  AnomalyBaseline
} from './breach-detector';

// HIPAA Compliance Reporter
export { HIPAAComplianceReporter } from './compliance-reporter';
export type { 
  ComplianceSchedule, 
  ComplianceReportType, 
  ComplianceAlert 
} from './compliance-reporter';

// HIPAA Audit Chain Verifier
export { HIPAAAuditChainVerifier } from './audit-chain-verifier';
export type { 
  ChainIntegrityReport, 
  ChainBlock,
  ChainMetrics
} from './audit-chain-verifier';

// HIPAA Audit Storage
export { default as HIPAAAuditStorage } from './audit-storage';
export type { 
  EncryptedStorageOptions, 
  StorageMetadata,
  EncryptedContainer
} from './audit-storage';

// Security Monitoring
export { SecurityMonitor } from './monitoring/security-monitor';
export type { SecurityThreat, ThreatType, MonitoringConfig } from './monitoring/security-monitor';

// Breach Detection
export { BreachDetectionService } from './breach-detection/breach-monitor';
export type { BreachAlert as MonitoringBreachAlert, BreachResponse, ThreatPattern } from './breach-detection/breach-monitor';

// Default Security Configuration
import { SecurityMiddleware } from './middleware/security-middleware';
import { SessionSecurity } from './session/session-security';
import { CSRFProtection } from './csrf/csrf-protection';
import { SecurityMonitor } from './monitoring/security-monitor';
import { DataEncryptionAtRest } from './encryption/data-encryption-at-rest';
import { Application } from 'express';

/**
 * Initialize complete security suite
 */
export function initializeSecurity(app: Application, options?: any): void {
  // Initialize security middleware
  const securityMiddleware = new SecurityMiddleware(options?.middleware);
  securityMiddleware.apply(app);

  // Initialize session security
  const sessionSecurity = new SessionSecurity(options?.session);
  app.use(sessionSecurity.middleware());

  // Initialize CSRF protection
  const csrfProtection = new CSRFProtection(options?.csrf);
  app.use(csrfProtection.middleware());

  // Initialize security monitoring
  const monitor = new SecurityMonitor(options?.monitoring);
  
  // Set up global error handler for security
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.name === 'SecurityError') {
      monitor.reportEvent(err.type, req.ip, req.path, err);
      res.status(403).json({ error: 'Security violation' });
    } else {
      next(err);
    }
  });

  console.log('Security suite initialized with HIPAA compliance');
}

/**
 * Security utilities
 */
export const SecurityUtils = {
  /**
   * Generate secure random token
   */
  generateToken: (length: number = 32): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('base64url');
  },

  /**
   * Hash password with salt
   */
  hashPassword: async (password: string): Promise<string> => {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, 12);
  },

  /**
   * Verify password hash
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hash);
  },

  /**
   * Generate OTP for 2FA
   */
  generateOTP: (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';
    const crypto = require('crypto');
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  /**
   * Validate strong password
   */
  isStrongPassword: (password: string): boolean => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData: (data: any): any => {
    const sensitive = ['password', 'ssn', 'creditCard', 'token', 'secret'];
    
    if (typeof data === 'string') {
      return '***MASKED***';
    }
    
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      
      for (const key in masked) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          masked[key] = '***MASKED***';
        } else if (typeof masked[key] === 'object') {
          masked[key] = SecurityUtils.maskSensitiveData(masked[key]);
        }
      }
      
      return masked;
    }
    
    return data;
  }
};

/**
 * HIPAA Compliance Utilities
 */
export const HIPAACompliance = {
  /**
   * Check if data contains PHI
   */
  containsPHI: (data: any): boolean => {
    const phiFields = [
      'ssn', 'socialSecurityNumber', 'dateOfBirth', 'medicalRecordNumber',
      'diagnosis', 'treatment', 'medication', 'mentalHealthNotes'
    ];
    
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).some(key => 
        phiFields.some(phi => key.toLowerCase().includes(phi.toLowerCase()))
      );
    }
    
    return false;
  },

  /**
   * Get required consent fields
   */
  getConsentRequirements: () => ({
    required: [
      'dataCollection',
      'dataUsage',
      'dataSharing',
      'dataRetention',
      'patientRights'
    ],
    optional: [
      'marketing',
      'research',
      'thirdPartySharing'
    ]
  }),

  /**
   * Validate consent
   */
  validateConsent: (consent: any): boolean => {
    const requirements = HIPAACompliance.getConsentRequirements();
    return requirements.required.every(field => consent[field] === true);
  },

  /**
   * Get audit requirements
   */
  getAuditRequirements: () => ({
    retention: '6 years',
    fields: [
      'timestamp',
      'userId',
      'action',
      'resource',
      'ipAddress',
      'result',
      'changes'
    ],
    encryption: 'required',
    integrity: 'hash-chain'
  })
};

// Export default security configuration
export default {
  initializeSecurity,
  SecurityUtils,
  HIPAACompliance
};