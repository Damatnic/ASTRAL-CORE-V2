/**
 * HIPAA Audit Logger Comprehensive Test Suite
 * 
 * This test suite validates all HIPAA compliance features including:
 * - Complete audit trail of PHI access
 * - Encrypted log storage with AES-256
 * - Tamper-proof hash chain verification
 * - 6-year retention policy enforcement
 * - Automated compliance reporting
 * - Real-time breach detection
 * - Crisis intervention logging
 * - Volunteer activity tracking
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  HIPAAAuditLogger, 
  HIPAAAuditEvent, 
  HIPAAAuditCategory, 
  HIPAARiskLevel, 
  HIPAAComplianceStatus,
  HIPAAComplianceReport,
  AuditQueryOptions 
} from '../src/audit-logger';
import { HIPAABreachDetector, BreachPattern, BreachIncident } from '../src/breach-detector';
import { HIPAAComplianceReporter, ComplianceReportType } from '../src/compliance-reporter';
import { HIPAAAuditChainVerifier } from '../src/audit-chain-verifier';

describe('HIPAA Audit Logger - Complete Compliance Test Suite', () => {
  let auditLogger: HIPAAAuditLogger;
  let breachDetector: HIPAABreachDetector;
  let complianceReporter: HIPAAComplianceReporter;
  let chainVerifier: HIPAAAuditChainVerifier;
  const testLogPath = path.join(process.cwd(), 'test-logs', 'hipaa-audit-test');

  beforeEach(async () => {
    // Initialize audit logger with test configuration
    auditLogger = new HIPAAAuditLogger({
      auditLogPath: testLogPath,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      signingKey: crypto.randomBytes(32).toString('hex'),
      retentionPeriodDays: 2190 // 6 years
    });

    // Initialize breach detector
    breachDetector = new HIPAABreachDetector(auditLogger);

    // Initialize compliance reporter
    complianceReporter = new HIPAAComplianceReporter(auditLogger);

    // Initialize chain verifier
    chainVerifier = new HIPAAAuditChainVerifier(auditLogger);

    // Wait for initialization
    await new Promise(resolve => {
      auditLogger.once('audit_system_ready', resolve);
    });
  });

  afterEach(async () => {
    // Cleanup test logs
    try {
      await fs.rmdir(testLogPath, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Core Audit Logging', () => {
    test('should log audit events with complete HIPAA fields', async () => {
      const event = await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.PHI_ACCESS,
        action: 'view_patient_record',
        description: 'Accessed patient mental health record',
        userId: 'doctor123',
        sessionId: 'session456',
        userRole: 'psychiatrist',
        userDepartment: 'mental_health',
        resourceType: 'patient_record',
        resourceId: 'patient789',
        phiInvolved: true,
        phiType: ['mental_health_diagnosis', 'medication_history'],
        patientId: 'patient789',
        sourceIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'device123',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.HIGH,
        impactLevel: 'medium',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT,
        jurisdiction: 'US-CA',
        dataLocation: 'us-west-2',
        crossBorderTransfer: false
      });

      expect(event).toBeDefined();
      expect(event.id).toBeTruthy();
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.sequence).toBeGreaterThan(0);
      expect(event.hash).toBeTruthy();
      expect(event.digitalSignature).toBeTruthy();
      expect(event.category).toBe(HIPAAAuditCategory.PHI_ACCESS);
      expect(event.phiInvolved).toBe(true);
      expect(event.phiType).toContain('mental_health_diagnosis');
      expect(event.retentionPeriod).toBe(2190);
    });

    test('should maintain audit trail sequence integrity', async () => {
      const events: HIPAAAuditEvent[] = [];
      
      for (let i = 0; i < 5; i++) {
        const event = await auditLogger.logAuditEvent({
          category: HIPAAAuditCategory.SYSTEM_SECURITY,
          action: `test_action_${i}`,
          description: `Test event ${i}`,
          resourceType: 'test',
          phiInvolved: false,
          sourceIP: '127.0.0.1',
          outcome: 'success',
          riskLevel: HIPAARiskLevel.LOW,
          impactLevel: 'none',
          complianceStatus: HIPAAComplianceStatus.COMPLIANT
        });
        events.push(event);
      }

      // Verify sequence numbers are sequential
      for (let i = 1; i < events.length; i++) {
        expect(events[i].sequence).toBe(events[i - 1].sequence + 1);
      }

      // Verify hash chain
      for (let i = 1; i < events.length; i++) {
        expect(events[i].previousHash).toBe(events[i - 1].hash);
      }
    });
  });

  describe('PHI Access Logging', () => {
    test('should log PHI access with all required fields', async () => {
      const phiAccessEvent = await auditLogger.logPHIAccess({
        userId: 'therapist001',
        sessionId: 'session123',
        action: 'view_treatment_plan',
        patientId: 'patient456',
        phiType: ['treatment_plan', 'therapy_notes', 'diagnosis'],
        accessReason: 'Scheduled therapy session',
        sourceIP: '10.0.0.50',
        userAgent: 'Chrome/120.0',
        resourceId: 'treatment_plan_789',
        outcome: 'success'
      });

      expect(phiAccessEvent.category).toBe(HIPAAAuditCategory.PHI_ACCESS);
      expect(phiAccessEvent.phiInvolved).toBe(true);
      expect(phiAccessEvent.phiType).toContain('treatment_plan');
      expect(phiAccessEvent.phiType).toContain('therapy_notes');
      expect(phiAccessEvent.phiType).toContain('diagnosis');
      expect(phiAccessEvent.patientId).toBe('patient456');
      expect(phiAccessEvent.riskLevel).toBe(HIPAARiskLevel.HIGH);
      expect(phiAccessEvent.requestDetails?.accessReason).toBe('Scheduled therapy session');
    });

    test('should log failed PHI access attempts', async () => {
      const failedAccess = await auditLogger.logPHIAccess({
        userId: 'unauthorized_user',
        sessionId: 'session999',
        action: 'attempt_view_record',
        patientId: 'patient111',
        phiType: ['mental_health_record'],
        accessReason: 'Unauthorized access attempt',
        sourceIP: '192.168.1.200',
        outcome: 'blocked'
      });

      expect(failedAccess.outcome).toBe('blocked');
      expect(failedAccess.category).toBe(HIPAAAuditCategory.PHI_ACCESS);
      expect(failedAccess.phiInvolved).toBe(true);
    });
  });

  describe('Crisis Intervention Logging', () => {
    test('should log crisis intervention with emergency level', async () => {
      const crisisEvent = await auditLogger.logCrisisIntervention({
        userId: 'crisis_counselor_001',
        sessionId: 'crisis_session_123',
        patientId: 'patient_in_crisis_456',
        crisisLevel: 'emergency',
        interventionType: 'suicide_prevention',
        escalationRequired: true,
        emergencyContacts: ['contact1@example.com', 'contact2@example.com'],
        sourceIP: '10.0.0.100',
        outcome: 'success',
        details: {
          riskAssessment: 'imminent_danger',
          actionsTaken: ['Emergency services contacted', 'Safety plan activated'],
          followUpRequired: true
        }
      });

      expect(crisisEvent.category).toBe(HIPAAAuditCategory.CRISIS_INTERVENTION);
      expect(crisisEvent.crisisLevel).toBe('emergency');
      expect(crisisEvent.escalationRequired).toBe(true);
      expect(crisisEvent.emergencyContacts).toHaveLength(2);
      expect(crisisEvent.riskLevel).toBe(HIPAARiskLevel.CRITICAL);
      expect(crisisEvent.impactLevel).toBe('severe');
      expect(crisisEvent.phiInvolved).toBe(true);
      expect(crisisEvent.phiType).toContain('mental_health_status');
      expect(crisisEvent.phiType).toContain('crisis_assessment');
    });

    test('should log moderate crisis intervention', async () => {
      const crisisEvent = await auditLogger.logCrisisIntervention({
        userId: 'counselor_002',
        sessionId: 'session_789',
        patientId: 'patient_789',
        crisisLevel: 'medium',
        interventionType: 'anxiety_management',
        escalationRequired: false,
        sourceIP: '10.0.0.101',
        outcome: 'success',
        details: {
          techniques: ['breathing_exercises', 'grounding_techniques'],
          duration: '45 minutes'
        }
      });

      expect(crisisEvent.crisisLevel).toBe('medium');
      expect(crisisEvent.escalationRequired).toBe(false);
      expect(crisisEvent.riskLevel).toBe(HIPAARiskLevel.HIGH);
      expect(crisisEvent.impactLevel).toBe('high');
    });
  });

  describe('Volunteer Activity Tracking', () => {
    test('should log volunteer activity with patient interaction', async () => {
      const volunteerEvent = await auditLogger.logVolunteerActivity({
        volunteerId: 'volunteer_001',
        supervisorId: 'supervisor_001',
        sessionId: 'volunteer_session_123',
        activity: 'peer_support_session',
        patientId: 'patient_123',
        trainingCompleted: true,
        volunteerLevel: 'certified_peer_specialist',
        sourceIP: '192.168.1.50',
        outcome: 'success',
        details: {
          sessionType: 'group_support',
          duration: '60 minutes',
          participants: 5
        }
      });

      expect(volunteerEvent.category).toBe(HIPAAAuditCategory.VOLUNTEER_ACTIVITY);
      expect(volunteerEvent.volunteerId).toBe('volunteer_001');
      expect(volunteerEvent.supervisorId).toBe('supervisor_001');
      expect(volunteerEvent.phiInvolved).toBe(true);
      expect(volunteerEvent.trainingCompleted).toBe(true);
      expect(volunteerEvent.complianceStatus).toBe(HIPAAComplianceStatus.COMPLIANT);
      expect(volunteerEvent.riskLevel).toBe(HIPAARiskLevel.MODERATE);
    });

    test('should flag untrained volunteer activity', async () => {
      const volunteerEvent = await auditLogger.logVolunteerActivity({
        volunteerId: 'volunteer_002',
        supervisorId: 'supervisor_002',
        sessionId: 'session_456',
        activity: 'administrative_support',
        trainingCompleted: false,
        volunteerLevel: 'trainee',
        sourceIP: '192.168.1.51',
        outcome: 'success'
      });

      expect(volunteerEvent.trainingCompleted).toBe(false);
      expect(volunteerEvent.complianceStatus).toBe(HIPAAComplianceStatus.UNDER_REVIEW);
      expect(volunteerEvent.phiInvolved).toBe(false);
      expect(volunteerEvent.riskLevel).toBe(HIPAARiskLevel.LOW);
    });
  });

  describe('Authentication Auditing', () => {
    test('should log successful authentication', async () => {
      const authEvent = await auditLogger.logAuthenticationEvent({
        userId: 'user123',
        action: 'login',
        sourceIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'device_abc123',
        sessionId: 'session_new_123',
        outcome: 'success'
      });

      expect(authEvent.category).toBe(HIPAAAuditCategory.AUTHENTICATION);
      expect(authEvent.action).toBe('login');
      expect(authEvent.outcome).toBe('success');
      expect(authEvent.riskLevel).toBe(HIPAARiskLevel.LOW);
    });

    test('should log failed authentication attempts', async () => {
      const authEvent = await auditLogger.logAuthenticationEvent({
        userId: 'unknown_user',
        action: 'login_failed',
        sourceIP: '192.168.1.200',
        userAgent: 'Mozilla/5.0',
        outcome: 'failure',
        failureReason: 'Invalid credentials'
      });

      expect(authEvent.action).toBe('login_failed');
      expect(authEvent.outcome).toBe('failure');
      expect(authEvent.riskLevel).toBe(HIPAARiskLevel.MODERATE);
      expect(authEvent.errorDetails?.reason).toBe('Invalid credentials');
    });

    test('should log account lockout events', async () => {
      const lockoutEvent = await auditLogger.logAuthenticationEvent({
        userId: 'user456',
        action: 'account_locked',
        sourceIP: '192.168.1.201',
        outcome: 'blocked',
        failureReason: 'Too many failed login attempts'
      });

      expect(lockoutEvent.action).toBe('account_locked');
      expect(lockoutEvent.outcome).toBe('blocked');
      expect(lockoutEvent.riskLevel).toBe(HIPAARiskLevel.MODERATE);
    });
  });

  describe('Tamper-Proof Hash Chain', () => {
    test('should verify audit chain integrity', async () => {
      // Log several events
      const events: HIPAAAuditEvent[] = [];
      for (let i = 0; i < 10; i++) {
        const event = await auditLogger.logAuditEvent({
          category: HIPAAAuditCategory.SYSTEM_SECURITY,
          action: `chain_test_${i}`,
          description: `Hash chain test event ${i}`,
          resourceType: 'test',
          phiInvolved: false,
          sourceIP: '127.0.0.1',
          outcome: 'success',
          riskLevel: HIPAARiskLevel.LOW,
          impactLevel: 'none',
          complianceStatus: HIPAAComplianceStatus.COMPLIANT
        });
        events.push(event);
      }

      // Verify chain integrity
      const integrityResult = await auditLogger.verifyAuditChainIntegrity();
      
      expect(integrityResult.isValid).toBe(true);
      expect(integrityResult.totalEvents).toBe(events.length);
      expect(integrityResult.validEvents).toBe(events.length);
      expect(integrityResult.invalidEvents).toBe(0);
      expect(integrityResult.tamperDetected).toBe(false);
    });

    test('should detect tampering in audit chain', async () => {
      // Log legitimate events
      const event1 = await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.PHI_ACCESS,
        action: 'view_record',
        description: 'Legitimate access',
        resourceType: 'patient_record',
        phiInvolved: true,
        sourceIP: '192.168.1.1',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.MODERATE,
        impactLevel: 'low',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT
      });

      // Simulate tampering by modifying an event
      const tamperedEvent = { ...event1, description: 'Tampered description' };
      
      // Mock the tampered event in the audit store
      const auditStore = (auditLogger as any).auditStore;
      const eventIndex = auditStore.findIndex((e: HIPAAAuditEvent) => e.id === event1.id);
      if (eventIndex >= 0) {
        auditStore[eventIndex] = tamperedEvent;
      }

      // Verify chain integrity should detect tampering
      const integrityResult = await auditLogger.verifyAuditChainIntegrity();
      
      expect(integrityResult.tamperDetected).toBe(true);
      expect(integrityResult.invalidEvents).toBeGreaterThan(0);
    });
  });

  describe('Compliance Reporting', () => {
    test('should generate comprehensive compliance report', async () => {
      // Log various events for reporting
      await auditLogger.logPHIAccess({
        userId: 'doctor001',
        sessionId: 'session001',
        action: 'view_record',
        patientId: 'patient001',
        phiType: ['diagnosis'],
        accessReason: 'Treatment',
        sourceIP: '10.0.0.1',
        outcome: 'success'
      });

      await auditLogger.logAuthenticationEvent({
        userId: 'user001',
        action: 'login',
        sourceIP: '10.0.0.2',
        outcome: 'success'
      });

      await auditLogger.logCrisisIntervention({
        userId: 'counselor001',
        sessionId: 'crisis001',
        patientId: 'patient002',
        crisisLevel: 'high',
        interventionType: 'crisis_support',
        escalationRequired: false,
        sourceIP: '10.0.0.3',
        outcome: 'success'
      });

      // Generate compliance report
      const report = await auditLogger.generateComplianceReport({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        includeRecommendations: true,
        includeRegulatoryRequirements: true
      });

      expect(report).toBeDefined();
      expect(report.reportId).toBeTruthy();
      expect(report.totalEvents).toBeGreaterThan(0);
      expect(report.phiAccessEvents).toBeGreaterThan(0);
      expect(report.complianceScore).toBeGreaterThanOrEqual(0);
      expect(report.complianceScore).toBeLessThanOrEqual(100);
      expect(report.complianceMetrics).toBeDefined();
      expect(report.complianceMetrics.auditLogCompleteness).toBeGreaterThanOrEqual(0);
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.regulatoryRequirements).toBeInstanceOf(Array);
    });

    test('should track compliance violations', async () => {
      // Log a compliance violation
      await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.PHI_ACCESS,
        action: 'unauthorized_access',
        description: 'Unauthorized PHI access attempt',
        userId: 'malicious_user',
        resourceType: 'patient_record',
        phiInvolved: true,
        sourceIP: '192.168.1.100',
        outcome: 'blocked',
        riskLevel: HIPAARiskLevel.CRITICAL,
        impactLevel: 'severe',
        complianceStatus: HIPAAComplianceStatus.VIOLATION
      });

      const report = await auditLogger.generateComplianceReport({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date()
      });

      expect(report.complianceViolations).toBeGreaterThan(0);
      expect(report.complianceScore).toBeLessThan(100);
    });
  });

  describe('Breach Detection', () => {
    test('should detect potential data breach patterns', async () => {
      // Simulate suspicious activity pattern
      for (let i = 0; i < 5; i++) {
        await auditLogger.logPHIAccess({
          userId: 'suspicious_user',
          sessionId: `suspicious_session_${i}`,
          action: 'bulk_export',
          patientId: `patient_${i}`,
          phiType: ['full_record'],
          accessReason: 'Data export',
          sourceIP: '192.168.1.99',
          outcome: 'success'
        });
      }

      // Check if breach detector triggered
      const breachPatterns = await breachDetector.analyzeRecentActivity(5);
      
      expect(breachPatterns).toBeDefined();
      expect(breachPatterns.suspiciousPatterns).toBeGreaterThan(0);
    });

    test('should detect unauthorized access attempts', async () => {
      // Simulate multiple failed access attempts
      for (let i = 0; i < 10; i++) {
        await auditLogger.logAuthenticationEvent({
          userId: 'attacker',
          action: 'login_failed',
          sourceIP: '192.168.1.66',
          outcome: 'failure',
          failureReason: 'Invalid credentials'
        });
      }

      const breachAnalysis = await breachDetector.detectBreachAttempts({
        timeWindow: 10, // minutes
        threshold: 5
      });

      expect(breachAnalysis.breachRisk).toBe('high');
      expect(breachAnalysis.recommendedActions).toContain('Block IP address');
    });
  });

  describe('Data Retention and Archival', () => {
    test('should enforce 6-year retention policy', async () => {
      const event = await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.ADMINISTRATIVE,
        action: 'retention_test',
        description: 'Testing retention policy',
        resourceType: 'test',
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.LOW,
        impactLevel: 'none',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT
      });

      expect(event.retentionPeriod).toBe(2190); // 6 years in days
    });

    test('should export audit logs for long-term storage', async () => {
      // Log some events
      for (let i = 0; i < 5; i++) {
        await auditLogger.logAuditEvent({
          category: HIPAAAuditCategory.SYSTEM_SECURITY,
          action: `export_test_${i}`,
          description: `Export test event ${i}`,
          resourceType: 'test',
          phiInvolved: false,
          sourceIP: '127.0.0.1',
          outcome: 'success',
          riskLevel: HIPAARiskLevel.LOW,
          impactLevel: 'none',
          complianceStatus: HIPAAComplianceStatus.COMPLIANT
        });
      }

      // Export logs
      const exportResult = await auditLogger.exportAuditLogs({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        format: 'encrypted_json',
        includeMetadata: true
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.exportId).toBeTruthy();
      expect(exportResult.eventCount).toBeGreaterThan(0);
      expect(exportResult.encrypted).toBe(true);
      expect(exportResult.format).toBe('encrypted_json');
    });
  });

  describe('Real-time Monitoring and Alerting', () => {
    test('should emit real-time alerts for critical events', async () => {
      let alertReceived = false;
      let alertEvent: HIPAAAuditEvent | null = null;

      auditLogger.on('critical_event', (event: HIPAAAuditEvent) => {
        alertReceived = true;
        alertEvent = event;
      });

      await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.BREACH_ATTEMPT,
        action: 'data_exfiltration_attempt',
        description: 'Attempted large-scale data export',
        userId: 'malicious_actor',
        resourceType: 'database',
        phiInvolved: true,
        sourceIP: '192.168.1.66',
        outcome: 'blocked',
        riskLevel: HIPAARiskLevel.CRITICAL,
        impactLevel: 'severe',
        complianceStatus: HIPAAComplianceStatus.VIOLATION
      });

      expect(alertReceived).toBe(true);
      expect(alertEvent).toBeDefined();
      expect(alertEvent?.riskLevel).toBe(HIPAARiskLevel.CRITICAL);
    });

    test('should monitor for compliance violations in real-time', async () => {
      let violationDetected = false;

      auditLogger.on('compliance_violation', (event: HIPAAAuditEvent) => {
        violationDetected = true;
      });

      await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.PHI_ACCESS,
        action: 'unauthorized_phi_access',
        description: 'Accessed PHI without authorization',
        resourceType: 'patient_record',
        phiInvolved: true,
        sourceIP: '192.168.1.100',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.HIGH,
        impactLevel: 'high',
        complianceStatus: HIPAAComplianceStatus.VIOLATION
      });

      expect(violationDetected).toBe(true);
    });
  });

  describe('Encryption and Security', () => {
    test('should encrypt audit logs with AES-256', async () => {
      const event = await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.PHI_ACCESS,
        action: 'view_record',
        description: 'Viewing encrypted record',
        resourceType: 'patient_record',
        phiInvolved: true,
        sourceIP: '192.168.1.1',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.MODERATE,
        impactLevel: 'low',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT
      });

      expect(event.encryptionAlgorithm).toBe('aes-256-gcm');
      expect(event.digitalSignature).toBeTruthy();
    });

    test('should use secure hash algorithm for chain integrity', async () => {
      const event = await auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.SYSTEM_SECURITY,
        action: 'security_test',
        description: 'Testing hash algorithm',
        resourceType: 'test',
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.LOW,
        impactLevel: 'none',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT
      });

      expect(event.hashAlgorithm).toBe('sha256');
      expect(event.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 produces 64 hex characters
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle high-volume logging efficiently', async () => {
      const startTime = Date.now();
      const eventCount = 100;
      const events: HIPAAAuditEvent[] = [];

      for (let i = 0; i < eventCount; i++) {
        const event = await auditLogger.logAuditEvent({
          category: HIPAAAuditCategory.SYSTEM_SECURITY,
          action: `performance_test_${i}`,
          description: `Performance test event ${i}`,
          resourceType: 'test',
          phiInvolved: false,
          sourceIP: '127.0.0.1',
          outcome: 'success',
          riskLevel: HIPAARiskLevel.LOW,
          impactLevel: 'none',
          complianceStatus: HIPAAComplianceStatus.COMPLIANT
        });
        events.push(event);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const averageTime = duration / eventCount;

      expect(events).toHaveLength(eventCount);
      expect(averageTime).toBeLessThan(100); // Each event should take less than 100ms
    });

    test('should efficiently query large audit logs', async () => {
      // Generate test data
      for (let i = 0; i < 50; i++) {
        await auditLogger.logAuditEvent({
          category: i % 2 === 0 ? HIPAAAuditCategory.PHI_ACCESS : HIPAAAuditCategory.SYSTEM_SECURITY,
          action: `query_test_${i}`,
          description: `Query test event ${i}`,
          userId: `user_${i % 10}`,
          resourceType: 'test',
          phiInvolved: i % 2 === 0,
          sourceIP: `192.168.1.${i}`,
          outcome: 'success',
          riskLevel: HIPAARiskLevel.LOW,
          impactLevel: 'none',
          complianceStatus: HIPAAComplianceStatus.COMPLIANT
        });
      }

      const startTime = Date.now();
      
      const results = await auditLogger.queryAuditEvents({
        category: HIPAAAuditCategory.PHI_ACCESS,
        phiInvolved: true,
        limit: 20
      });

      const queryTime = Date.now() - startTime;

      expect(results.length).toBeLessThanOrEqual(20);
      expect(results.every(e => e.category === HIPAAAuditCategory.PHI_ACCESS)).toBe(true);
      expect(results.every(e => e.phiInvolved === true)).toBe(true);
      expect(queryTime).toBeLessThan(500); // Query should complete within 500ms
    });
  });
});

// Helper function to wait for async events
function waitForEvent(emitter: any, eventName: string, timeout: number = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);

    emitter.once(eventName, (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}