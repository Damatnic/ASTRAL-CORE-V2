/**
 * ASTRAL_CORE 2.0 - HIPAA Compliance Security Tests
 * Life-critical security testing for protected health information (PHI)
 */

import { HIPAAAuditLogger } from '../../packages/security/src/audit-logger';
import { HIPAABreachDetector } from '../../packages/security/src/breach-detector';
import { EncryptionService } from '../../packages/security/src/encryption/encryption-service';
import { SecurityUtils, HIPAACompliance } from '../../packages/security/src';

describe('HIPAA Compliance Security Tests', () => {
  let auditLogger: HIPAAAuditLogger;
  let breachDetector: HIPAABreachDetector;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    auditLogger = new HIPAAAuditLogger({
      encryptionEnabled: true,
      integrityChecking: true,
      retentionPeriodYears: 6,
    });

    breachDetector = new HIPAABreachDetector({
      realTimeMonitoring: true,
      anomalyThreshold: 0.8,
      alertingEnabled: true,
    });

    encryptionService = new EncryptionService({
      keySize: 256,
      algorithm: 'AES-256-GCM',
      keyRotationEnabled: true,
    });
  });

  describe('PHI Data Protection (164.312)', () => {
    describe('Access Control (164.312(a))', () => {
      it('should enforce unique user identification', () => {
        const userData = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'patient',
          permissions: ['view_own_data', 'create_safety_plan'],
        };

        const isValidUser = SecurityUtils.validateUserIdentification(userData);
        expect(isValidUser).toBe(true);

        // Invalid user should fail
        const invalidUser = { id: '', email: '', role: '' };
        const isInvalidUser = SecurityUtils.validateUserIdentification(invalidUser);
        expect(isInvalidUser).toBe(false);
      });

      it('should implement automatic logoff', async () => {
        const sessionTimeout = 15 * 60 * 1000; // 15 minutes
        const sessionData = {
          userId: 'user-123',
          sessionId: 'session-456',
          lastActivity: Date.now() - (20 * 60 * 1000), // 20 minutes ago
          timeoutDuration: sessionTimeout,
        };

        const isSessionValid = SecurityUtils.validateSessionTimeout(sessionData);
        expect(isSessionValid).toBe(false);

        // Active session should be valid
        const activeSession = {
          ...sessionData,
          lastActivity: Date.now() - (10 * 60 * 1000), // 10 minutes ago
        };

        const isActiveSessionValid = SecurityUtils.validateSessionTimeout(activeSession);
        expect(isActiveSessionValid).toBe(true);
      });

      it('should encrypt/decrypt authentication verifiers', async () => {
        const password = 'SecureP@ssw0rd123!';
        const hashedPassword = await SecurityUtils.hashPassword(password);

        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword).toMatch(/^\$2[aby]?\$\d+\$/); // bcrypt format

        const isValidPassword = await SecurityUtils.verifyPassword(password, hashedPassword);
        expect(isValidPassword).toBe(true);

        const isInvalidPassword = await SecurityUtils.verifyPassword('wrongpassword', hashedPassword);
        expect(isInvalidPassword).toBe(false);
      });
    });

    describe('Audit Controls (164.312(b))', () => {
      it('should log all PHI access events', async () => {
        const phiAccessEvent = {
          userId: 'user-123',
          action: 'VIEW_PHI',
          resource: 'patient_record',
          resourceId: 'patient-456',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(),
          outcome: 'SUCCESS',
          phiFields: ['name', 'dateOfBirth', 'medicalRecordNumber'],
        };

        const auditEntry = await auditLogger.logHIPAAEvent(phiAccessEvent);
        
        expect(auditEntry.id).toBeDefined();
        expect(auditEntry.encrypted).toBe(true);
        expect(auditEntry.integrityHash).toBeDefined();
        expect(auditEntry.category).toBe('PHI_ACCESS');
        expect(auditEntry.riskLevel).toBe('MEDIUM');
      });

      it('should detect and log unauthorized access attempts', async () => {
        const unauthorizedAccess = {
          userId: 'user-789',
          action: 'VIEW_PHI',
          resource: 'patient_record',
          resourceId: 'patient-456',
          ipAddress: '192.168.1.100',
          outcome: 'FAILURE',
          reason: 'INSUFFICIENT_PERMISSIONS',
        };

        const auditEntry = await auditLogger.logHIPAAEvent(unauthorizedAccess);
        
        expect(auditEntry.category).toBe('SECURITY_VIOLATION');
        expect(auditEntry.riskLevel).toBe('HIGH');
        expect(auditEntry.alertGenerated).toBe(true);
      });

      it('should maintain audit log integrity', async () => {
        const events = [
          { action: 'LOGIN', userId: 'user-1' },
          { action: 'VIEW_PHI', userId: 'user-1', resourceId: 'patient-1' },
          { action: 'UPDATE_PHI', userId: 'user-1', resourceId: 'patient-1' },
          { action: 'LOGOUT', userId: 'user-1' },
        ];

        for (const event of events) {
          await auditLogger.logHIPAAEvent({
            ...event,
            timestamp: new Date(),
            ipAddress: '192.168.1.1',
            outcome: 'SUCCESS',
          });
        }

        const integrityReport = await auditLogger.verifyAuditChainIntegrity();
        
        expect(integrityReport.isValid).toBe(true);
        expect(integrityReport.totalEntries).toBe(4);
        expect(integrityReport.corruptedEntries).toHaveLength(0);
      });

      it('should implement proper audit log retention', async () => {
        const oldEvent = {
          userId: 'user-123',
          action: 'VIEW_PHI',
          timestamp: new Date(Date.now() - (7 * 365 * 24 * 60 * 60 * 1000)), // 7 years ago
          ipAddress: '192.168.1.1',
          outcome: 'SUCCESS',
        };

        const recentEvent = {
          userId: 'user-123',
          action: 'VIEW_PHI',
          timestamp: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)), // 3 years ago
          ipAddress: '192.168.1.1',
          outcome: 'SUCCESS',
        };

        await auditLogger.logHIPAAEvent(oldEvent);
        await auditLogger.logHIPAAEvent(recentEvent);

        const retentionResult = await auditLogger.applyRetentionPolicy();
        
        expect(retentionResult.entriesRetained).toBe(1); // Only recent event
        expect(retentionResult.entriesArchived).toBe(1); // Old event archived
      });
    });

    describe('Integrity (164.312(c))', () => {
      it('should protect PHI from unauthorized alteration', async () => {
        const phiData = {
          patientId: 'patient-123',
          name: 'John Doe',
          dateOfBirth: '1980-01-01',
          medicalRecordNumber: 'MRN-456789',
          diagnosis: 'Major Depressive Disorder',
          treatment: 'Cognitive Behavioral Therapy',
          lastUpdated: new Date(),
        };

        const encryptedPHI = await encryptionService.encryptPHI(phiData);
        
        expect(encryptedPHI.encrypted).toBe(true);
        expect(encryptedPHI.integrityHash).toBeDefined();
        expect(encryptedPHI.encryptedData).not.toEqual(phiData);

        // Verify integrity
        const isIntegrityValid = await encryptionService.verifyIntegrity(encryptedPHI);
        expect(isIntegrityValid).toBe(true);

        // Tamper with data
        const tamperedData = {
          ...encryptedPHI,
          encryptedData: 'tampered_data',
        };

        const isTamperedDataValid = await encryptionService.verifyIntegrity(tamperedData);
        expect(isTamperedDataValid).toBe(false);
      });

      it('should detect unauthorized modifications to PHI', async () => {
        const originalRecord = {
          id: 'record-123',
          patientId: 'patient-456',
          content: 'Patient reported anxiety symptoms',
          lastModified: new Date(),
          modifiedBy: 'therapist-789',
        };

        // Simulate unauthorized modification
        const modificationAttempt = {
          recordId: 'record-123',
          newContent: 'Patient reported no symptoms', // Unauthorized change
          modifiedBy: 'unauthorized-user',
          timestamp: new Date(),
          ipAddress: '192.168.1.100',
        };

        const breachAlert = await breachDetector.detectUnauthorizedModification(
          originalRecord,
          modificationAttempt
        );

        expect(breachAlert.breachDetected).toBe(true);
        expect(breachAlert.breachType).toBe('UNAUTHORIZED_MODIFICATION');
        expect(breachAlert.severity).toBe('HIGH');
        expect(breachAlert.immediateAction).toBe('BLOCK_MODIFICATION');
      });
    });

    describe('Transmission Security (164.312(e))', () => {
      it('should encrypt PHI during transmission', async () => {
        const phiMessage = {
          senderId: 'therapist-123',
          recipientId: 'patient-456',
          content: 'Your therapy session is scheduled for tomorrow at 2 PM',
          messageType: 'appointment_reminder',
          containsPHI: true,
        };

        const encryptedTransmission = await encryptionService.encryptForTransmission(phiMessage);
        
        expect(encryptedTransmission.encrypted).toBe(true);
        expect(encryptedTransmission.protocol).toBe('TLS_1_3');
        expect(encryptedTransmission.encryptedPayload).not.toEqual(phiMessage.content);
        expect(encryptedTransmission.integrityVerification).toBeDefined();
      });

      it('should ensure end-to-end encryption for crisis communications', async () => {
        const crisisMessage = {
          sessionId: 'crisis-session-789',
          senderId: 'user-123',
          content: 'I am having thoughts of self-harm',
          messageType: 'crisis_communication',
          severity: 'high',
          timestamp: new Date(),
        };

        const e2eEncrypted = await encryptionService.encryptEndToEnd(crisisMessage);
        
        expect(e2eEncrypted.endToEndEncrypted).toBe(true);
        expect(e2eEncrypted.keyExchangeMethod).toBe('ECDH');
        expect(e2eEncrypted.forwardSecrecy).toBe(true);
        expect(e2eEncrypted.recipientVerification).toBe(true);
      });

      it('should implement secure key management', async () => {
        const keyManagement = await encryptionService.getKeyManagementStatus();
        
        expect(keyManagement.keyRotationEnabled).toBe(true);
        expect(keyManagement.keyStrength).toBe(256);
        expect(keyManagement.keyStorageMethod).toBe('HSM'); // Hardware Security Module
        expect(keyManagement.keyEscrowCompliant).toBe(true);
        expect(keyManagement.lastKeyRotation).toBeDefined();
      });
    });
  });

  describe('Breach Detection and Response (164.400-414)', () => {
    it('should detect potential data breaches', async () => {
      const suspiciousActivity = {
        userId: 'user-123',
        activities: [
          { action: 'BULK_DOWNLOAD', recordCount: 500, timestamp: new Date() },
          { action: 'UNUSUAL_ACCESS_PATTERN', locationChange: true, timestamp: new Date() },
          { action: 'OFF_HOURS_ACCESS', hour: 3, timestamp: new Date() },
        ],
        ipAddress: '192.168.1.100',
        userAgent: 'automated-script/1.0',
      };

      const breachAnalysis = await breachDetector.analyzeSuspiciousActivity(suspiciousActivity);
      
      expect(breachAnalysis.riskScore).toBeGreaterThan(0.8);
      expect(breachAnalysis.potentialBreach).toBe(true);
      expect(breachAnalysis.recommendedActions).toContain('IMMEDIATE_ACCOUNT_SUSPENSION');
      expect(breachAnalysis.recommendedActions).toContain('SECURITY_TEAM_NOTIFICATION');
    });

    it('should track PHI disclosure incidents', async () => {
      const disclosureIncident = {
        incidentId: 'incident-456',
        incidentType: 'UNAUTHORIZED_DISCLOSURE',
        affectedRecords: 150,
        phiTypes: ['names', 'medical_record_numbers', 'treatment_records'],
        discoveryDate: new Date(),
        reportingRequired: true,
        affectedIndividuals: 150,
        riskLevel: 'HIGH',
      };

      const incident = await breachDetector.recordBreachIncident(disclosureIncident);
      
      expect(incident.breachReportGenerated).toBe(true);
      expect(incident.regulatoryReportingRequired).toBe(true);
      expect(incident.individualNotificationRequired).toBe(true);
      expect(incident.mediaNotificationRequired).toBe(false); // < 500 individuals
      expect(incident.reportingDeadline).toBeDefined();
    });

    it('should implement breach notification procedures', async () => {
      const breachNotification = {
        incidentId: 'incident-789',
        affectedIndividuals: 75,
        breachDescription: 'Unauthorized access to crisis intervention records',
        discoveryDate: new Date(Date.now() - (24 * 60 * 60 * 1000)), // 1 day ago
        containmentMeasures: [
          'Account suspension',
          'Password reset requirement',
          'Enhanced monitoring',
        ],
      };

      const notificationResult = await breachDetector.processBreachNotification(breachNotification);
      
      expect(notificationResult.individualNotificationsSent).toBe(75);
      expect(notificationResult.hhs_notification_submitted).toBe(true);
      expect(notificationResult.notification_within_60_days).toBe(true);
      expect(notificationResult.containment_measures_implemented).toBe(true);
    });
  });

  describe('Administrative Safeguards (164.308)', () => {
    it('should enforce minimum necessary standard', () => {
      const accessRequest = {
        userId: 'user-123',
        userRole: 'crisis_counselor',
        requestedPHI: ['full_medical_history', 'insurance_information', 'family_contacts'],
        requestPurpose: 'crisis_intervention',
        patientId: 'patient-456',
      };

      const minimumNecessary = HIPAACompliance.evaluateMinimumNecessary(accessRequest);
      
      expect(minimumNecessary.approved).toBe(true);
      expect(minimumNecessary.approvedFields).not.toContain('insurance_information');
      expect(minimumNecessary.approvedFields).toContain('family_contacts');
      expect(minimumNecessary.justification).toBeDefined();
    });

    it('should track workforce access and training', async () => {
      const workforceAccess = {
        employeeId: 'emp-123',
        role: 'crisis_therapist',
        hipaaTrainingCompleted: true,
        trainingDate: new Date(Date.now() - (6 * 30 * 24 * 60 * 60 * 1000)), // 6 months ago
        accessLevel: 'PHI_READ_WRITE',
        supervisorApproval: true,
      };

      const accessEvaluation = await auditLogger.evaluateWorkforceAccess(workforceAccess);
      
      expect(accessEvaluation.accessGranted).toBe(true);
      expect(accessEvaluation.trainingCurrent).toBe(true);
      expect(accessEvaluation.reTrainingRequired).toBe(false);
      expect(accessEvaluation.accessReviewDate).toBeDefined();
    });

    it('should implement information access management', () => {
      const accessManagement = {
        requestType: 'PHI_ACCESS',
        requesterId: 'user-123',
        requesterRole: 'therapist',
        patientId: 'patient-456',
        purposeOfUse: 'treatment',
        emergencyAccess: false,
      };

      const accessDecision = HIPAACompliance.evaluateAccessRequest(accessManagement);
      
      expect(accessDecision.approved).toBe(true);
      expect(accessDecision.accessLevel).toBe('TREATMENT_RELATED');
      expect(accessDecision.auditRequired).toBe(true);
      expect(accessDecision.timeLimit).toBeDefined();
    });
  });

  describe('Physical Safeguards (164.310)', () => {
    it('should ensure workstation security', () => {
      const workstationSecurity = {
        workstationId: 'ws-001',
        locationSecure: true,
        screenLockEnabled: true,
        encryptionEnabled: true,
        automaticLogoff: true,
        physicalAccess: 'RESTRICTED',
        lastSecurityAudit: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
      };

      const securityCompliance = HIPAACompliance.evaluateWorkstationSecurity(workstationSecurity);
      
      expect(securityCompliance.compliant).toBe(true);
      expect(securityCompliance.riskLevel).toBe('LOW');
      expect(securityCompliance.nextAuditDate).toBeDefined();
    });

    it('should control device and media access', () => {
      const deviceAccess = {
        deviceId: 'mobile-device-123',
        deviceType: 'smartphone',
        encryptionEnabled: true,
        remoteLockEnabled: true,
        appContainerSecure: true,
        userApproved: true,
        mdmManaged: true,
      };

      const deviceCompliance = HIPAACompliance.evaluateDeviceSecurity(deviceAccess);
      
      expect(deviceCompliance.approved).toBe(true);
      expect(deviceCompliance.securityScore).toBeGreaterThan(0.8);
      expect(deviceCompliance.phiAccessAllowed).toBe(true);
    });
  });

  describe('Risk Assessment and Management (164.308(a)(1))', () => {
    it('should conduct regular security risk assessments', async () => {
      const riskAssessment = {
        assessmentId: 'risk-assessment-2024',
        scope: 'FULL_ORGANIZATION',
        vulnerabilities: [
          { type: 'WEAK_PASSWORDS', severity: 'MEDIUM', count: 15 },
          { type: 'UNPATCHED_SYSTEMS', severity: 'HIGH', count: 3 },
          { type: 'EXCESSIVE_PRIVILEGES', severity: 'LOW', count: 8 },
        ],
        threats: [
          { type: 'INSIDER_THREAT', likelihood: 'LOW', impact: 'HIGH' },
          { type: 'EXTERNAL_ATTACK', likelihood: 'MEDIUM', impact: 'HIGH' },
          { type: 'SYSTEM_FAILURE', likelihood: 'LOW', impact: 'MEDIUM' },
        ],
      };

      const riskAnalysis = await breachDetector.conductRiskAssessment(riskAssessment);
      
      expect(riskAnalysis.overallRiskScore).toBeDefined();
      expect(riskAnalysis.criticalVulnerabilities).toHaveLength(3); // UNPATCHED_SYSTEMS
      expect(riskAnalysis.recommendedActions).toContain('PATCH_SYSTEMS_IMMEDIATELY');
      expect(riskAnalysis.nextAssessmentDate).toBeDefined();
    });

    it('should track security incident responses', async () => {
      const securityIncident = {
        incidentId: 'sec-incident-123',
        incidentType: 'UNAUTHORIZED_LOGIN_ATTEMPT',
        severity: 'MEDIUM',
        detectedBy: 'AUTOMATED_MONITORING',
        responseTeam: ['security_admin', 'it_manager'],
        containmentActions: [
          'ACCOUNT_LOCKOUT',
          'IP_BLOCKING',
          'ENHANCED_MONITORING',
        ],
        investigationStatus: 'IN_PROGRESS',
      };

      const incidentResponse = await auditLogger.trackSecurityIncident(securityIncident);
      
      expect(incidentResponse.responseTime).toBeLessThan(60 * 60 * 1000); // Within 1 hour
      expect(incidentResponse.containmentImplemented).toBe(true);
      expect(incidentResponse.escalationRequired).toBe(false);
      expect(incidentResponse.lessonLearned).toBeDefined();
    });
  });

  describe('Data Anonymization and De-identification (164.514)', () => {
    it('should properly de-identify PHI for research', () => {
      const phiRecord = {
        name: 'John Doe',
        dateOfBirth: '1980-06-15',
        address: '123 Main St, City, State 12345',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        medicalRecordNumber: 'MRN-123456',
        diagnosis: 'Major Depressive Disorder',
        treatmentNotes: 'Patient responded well to CBT',
        zip: '12345',
      };

      const deIdentified = HIPAACompliance.deIdentifyPHI(phiRecord);
      
      expect(deIdentified.name).toBeUndefined();
      expect(deIdentified.dateOfBirth).toMatch(/\d{4}/); // Year only
      expect(deIdentified.address).toBeUndefined();
      expect(deIdentified.phone).toBeUndefined();
      expect(deIdentified.email).toBeUndefined();
      expect(deIdentified.medicalRecordNumber).toBeUndefined();
      expect(deIdentified.zip).toMatch(/123\*\*/); // First 3 digits only
      expect(deIdentified.diagnosis).toBeDefined(); // Medical info retained
    });

    it('should maintain statistical utility while ensuring privacy', () => {
      const dataset = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        age: 25 + Math.floor(Math.random() * 40),
        diagnosis: ['anxiety', 'depression', 'ptsd'][Math.floor(Math.random() * 3)],
        treatmentDuration: Math.floor(Math.random() * 12) + 1,
        outcome: Math.floor(Math.random() * 10) + 1,
      }));

      const anonymized = HIPAACompliance.anonymizeDataset(dataset);
      
      expect(anonymized.records).toHaveLength(100);
      expect(anonymized.kAnonymity).toBeGreaterThanOrEqual(5);
      expect(anonymized.lDiversity).toBeGreaterThanOrEqual(2);
      expect(anonymized.statisticalUtility).toBeGreaterThan(0.8);
    });
  });

  describe('Business Associate Agreements (164.502)', () => {
    it('should track business associate compliance', async () => {
      const businessAssociate = {
        name: 'Cloud Storage Provider',
        serviceType: 'DATA_STORAGE',
        phiAccess: true,
        baaExecuted: true,
        baaDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1 year ago
        securityAssessment: 'COMPLETED',
        lastAudit: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)), // 90 days ago
      };

      const baCompliance = await auditLogger.assessBusinessAssociateCompliance(businessAssociate);
      
      expect(baCompliance.compliant).toBe(true);
      expect(baCompliance.baaCurrently).toBe(true);
      expect(baCompliance.nextAuditDue).toBeDefined();
      expect(baCompliance.riskLevel).toBe('LOW');
    });
  });

  describe('Incident Response and Forensics', () => {
    it('should preserve digital evidence for forensic analysis', async () => {
      const forensicEvidence = {
        incidentId: 'forensic-case-123',
        evidenceType: 'AUDIT_LOGS',
        timeRange: {
          start: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
          end: new Date(),
        },
        affectedSystems: ['crisis_chat_server', 'database_server'],
        preservationMethod: 'CRYPTOGRAPHIC_HASH',
      };

      const evidencePreservation = await auditLogger.preserveForensicEvidence(forensicEvidence);
      
      expect(evidencePreservation.chainOfCustody).toBeDefined();
      expect(evidencePreservation.integrityVerified).toBe(true);
      expect(evidencePreservation.hashValues).toBeDefined();
      expect(evidencePreservation.admissibleInCourt).toBe(true);
    });

    it('should support legal discovery requests', async () => {
      const discoveryRequest = {
        requestId: 'discovery-456',
        requestingParty: 'Patient Legal Representative',
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        patientId: 'patient-789',
        recordTypes: ['therapy_notes', 'crisis_interventions', 'safety_plans'],
        legalBasis: 'PATIENT_RIGHTS_REQUEST',
      };

      const discoveryResponse = await auditLogger.processDiscoveryRequest(discoveryRequest);
      
      expect(discoveryResponse.recordsFound).toBeGreaterThan(0);
      expect(discoveryResponse.privilegedRecords).toBeDefined();
      expect(discoveryResponse.redactedRecords).toBeDefined();
      expect(discoveryResponse.legalReview).toBe('COMPLETED');
    });
  });
});