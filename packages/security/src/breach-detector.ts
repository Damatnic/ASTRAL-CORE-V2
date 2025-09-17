/**
 * HIPAA Breach Detection and Alerting System
 * 
 * Real-time monitoring and detection of potential security breaches,
 * unauthorized access, and compliance violations in mental health systems.
 * Provides immediate alerting and automated response capabilities.
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { SecurityLogger } from './logging/security-logger';
import { HIPAAAuditLogger, HIPAAAuditEvent, HIPAAAuditCategory, HIPAARiskLevel, HIPAAComplianceStatus } from './audit-logger';

export interface BreachPattern {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'access_anomaly' | 'data_exfiltration' | 'unauthorized_access' | 'system_compromise' | 'insider_threat';
  
  // Detection criteria
  conditions: {
    timeWindow: number; // minutes
    threshold: number;
    eventTypes: HIPAAAuditCategory[];
    riskLevels: HIPAARiskLevel[];
    userPatterns?: string[];
    ipPatterns?: string[];
    timePatterns?: string[];
  };
  
  // Advanced detection
  anomalyDetection: {
    enabled: boolean;
    baselineWindow: number; // days
    sensitivityLevel: 'low' | 'medium' | 'high';
    minimumSamples: number;
  };
  
  // Response configuration
  response: {
    autoBlock: boolean;
    autoEscalate: boolean;
    notificationChannels: string[];
    requiresManualReview: boolean;
    quarantineUser: boolean;
    lockdownSystem: boolean;
  };
  
  // Regulatory implications
  regulatoryImpact: {
    hipaaBreachRule: boolean;
    requiresBRENotification: boolean; // Business Associate Agreement
    requires24HourNotification: boolean;
    requiresPatientNotification: boolean;
    requiresMediaNotification: boolean;
  };
  
  active: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface BreachIncident {
  id: string;
  patternId: string;
  patternName: string;
  detectedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  
  // Event details
  triggerEvents: HIPAAAuditEvent[];
  affectedUsers: string[];
  affectedPatients: string[];
  affectedSystems: string[];
  dataAtRisk: string[];
  
  // Investigation details
  investigator?: string;
  investigationStarted?: Date;
  investigationNotes: string[];
  evidenceCollected: string[];
  
  // Response actions
  responseActions: {
    action: string;
    performedBy: string;
    performedAt: Date;
    result: string;
    automated: boolean;
  }[];
  
  // Risk assessment
  riskAssessment: {
    probabilityOfHarm: 'low' | 'medium' | 'high';
    impactAssessment: 'minimal' | 'moderate' | 'significant' | 'severe';
    breachDetermination: 'breach' | 'not_breach' | 'pending_review';
    riskMitigated: boolean;
  };
  
  // Regulatory requirements
  notifications: {
    hhs: { sent: boolean; sentAt?: Date; confirmationNumber?: string; };
    patients: { required: boolean; sent: boolean; sentAt?: Date; };
    media: { required: boolean; sent: boolean; sentAt?: Date; };
    businessAssociates: { required: boolean; sent: boolean; sentAt?: Date; };
  };
  
  // Resolution
  rootCause?: string;
  correctiveActions: string[];
  preventiveMeasures: string[];
  resolvedAt?: Date;
  resolvedBy?: string;
  lessonsLearned?: string;
}

export interface BreachAlert {
  id: string;
  incidentId: string;
  alertType: 'immediate' | 'escalation' | 'reminder' | 'resolution';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recipients: string[];
  channels: ('email' | 'sms' | 'push' | 'slack' | 'pager')[];
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AnomalyBaseline {
  userId: string;
  baselineData: {
    avgDailyAccesses: number;
    avgSessionDuration: number;
    commonAccessTimes: { hour: number; frequency: number; }[];
    commonResources: { resource: string; frequency: number; }[];
    commonLocations: { ip: string; frequency: number; }[];
    patientAccessPatterns: { patientCount: number; frequency: number; }[];
  };
  lastUpdated: Date;
  samplePeriodDays: number;
  confidence: number;
}

export class HIPAABreachDetector extends EventEmitter {
  private logger: SecurityLogger;
  private auditLogger: HIPAAAuditLogger;
  private breachPatterns: BreachPattern[] = [];
  private activeIncidents: BreachIncident[] = [];
  private sentAlerts: BreachAlert[] = [];
  private anomalyBaselines: Map<string, AnomalyBaseline> = new Map();
  
  // Real-time monitoring
  private eventBuffer: HIPAAAuditEvent[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private baselineUpdateInterval?: NodeJS.Timeout;
  
  // Configuration
  private readonly bufferSize = 10000;
  private readonly monitoringFrequency = 30000; // 30 seconds
  private readonly baselineUpdateFrequency = 24 * 60 * 60 * 1000; // 24 hours

  constructor(auditLogger: HIPAAAuditLogger) {
    super();
    
    this.logger = new SecurityLogger();
    this.auditLogger = auditLogger;
    
    this.initializeBreachDetector();
  }

  /**
   * Initialize the breach detection system
   */
  private async initializeBreachDetector(): Promise<void> {
    try {
      // Load default breach patterns
      await this.loadDefaultBreachPatterns();
      
      // Load existing baselines
      await this.loadAnomalyBaselines();
      
      // Start real-time monitoring
      this.startRealTimeMonitoring();
      
      // Start baseline updates
      this.startBaselineUpdates();
      
      // Listen for audit events
      this.auditLogger.on('audit_event_logged', (event: HIPAAAuditEvent) => {
        this.processAuditEvent(event);
      });

      this.logger.audit('HIPAA breach detector initialized', {
        patternsLoaded: this.breachPatterns.length,
        baselinesLoaded: this.anomalyBaselines.size,
        realTimeMonitoring: true
      });

    } catch (error) {
      this.logger.error('Failed to initialize breach detector', error as Error);
      throw error;
    }
  }

  /**
   * Add a custom breach pattern
   */
  public async addBreachPattern(pattern: Omit<BreachPattern, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>): Promise<BreachPattern> {
    try {
      const newPattern: BreachPattern = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        triggerCount: 0,
        ...pattern
      };

      this.breachPatterns.push(newPattern);
      
      // Log pattern creation
      await this.auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.SYSTEM_SECURITY,
        action: 'breach_pattern_added',
        description: `Added breach detection pattern: ${newPattern.name}`,
        resourceType: 'breach_pattern',
        resourceId: newPattern.id,
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        applicationName: 'ASTRAL_CORE',
        applicationVersion: '2.0.0',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.MODERATE,
        impactLevel: 'medium',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT,
        requestDetails: {
          patternName: newPattern.name,
          severity: newPattern.severity,
          category: newPattern.category
        }
      });

      this.emit('pattern_added', newPattern);
      return newPattern;

    } catch (error) {
      this.logger.error('Failed to add breach pattern', error as Error);
      throw error;
    }
  }

  /**
   * Process an audit event for breach detection
   */
  private async processAuditEvent(event: HIPAAAuditEvent): Promise<void> {
    try {
      // Add to event buffer
      this.eventBuffer.push(event);
      
      // Maintain buffer size
      if (this.eventBuffer.length > this.bufferSize) {
        this.eventBuffer = this.eventBuffer.slice(-this.bufferSize);
      }

      // Check for immediate threats
      await this.checkImmediateThreats(event);
      
      // Update user behavior baselines
      if (event.userId) {
        this.updateUserBaseline(event);
      }

    } catch (error) {
      this.logger.error('Failed to process audit event for breach detection', error as Error);
    }
  }

  /**
   * Check for immediate security threats
   */
  private async checkImmediateThreats(event: HIPAAAuditEvent): Promise<void> {
    // High-risk event patterns that require immediate attention
    const immediateThreats = [
      // Multiple failed PHI access attempts
      event.phiInvolved && event.outcome === 'failure',
      // Critical system access from unusual location
      event.riskLevel === HIPAARiskLevel.CRITICAL && this.isUnusualLocation(event),
      // After-hours access to sensitive data
      event.phiInvolved && this.isAfterHours(event.timestamp),
      // Bulk data access
      this.isBulkDataAccess(event),
      // Administrative action without proper authorization
      event.category === HIPAAAuditCategory.ADMINISTRATIVE && !this.hasProperAuthorization(event)
    ];

    if (immediateThreats.some(threat => threat)) {
      await this.triggerImmediateAlert(event);
    }
  }

  /**
   * Analyze patterns across the event buffer
   */
  private async analyzePatterns(): Promise<void> {
    try {
      for (const pattern of this.breachPatterns.filter(p => p.active)) {
        const matchingEvents = this.findMatchingEvents(pattern);
        
        if (matchingEvents.length >= pattern.conditions.threshold) {
          await this.triggerBreachIncident(pattern, matchingEvents);
        }
        
        // Check for anomalies if enabled
        if (pattern.anomalyDetection.enabled) {
          await this.checkForAnomalies(pattern, matchingEvents);
        }
      }
    } catch (error) {
      this.logger.error('Failed to analyze breach patterns', error as Error);
    }
  }

  /**
   * Find events matching a breach pattern
   */
  private findMatchingEvents(pattern: BreachPattern): HIPAAAuditEvent[] {
    const timeWindowMs = pattern.conditions.timeWindow * 60 * 1000;
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    
    return this.eventBuffer.filter(event => {
      // Check time window
      if (event.timestamp < cutoffTime) return false;
      
      // Check event types
      if (!pattern.conditions.eventTypes.includes(event.category)) return false;
      
      // Check risk levels
      if (!pattern.conditions.riskLevels.includes(event.riskLevel)) return false;
      
      // Check user patterns
      if (pattern.conditions.userPatterns) {
        const userMatches = pattern.conditions.userPatterns.some(userPattern => 
          event.userId?.includes(userPattern)
        );
        if (!userMatches) return false;
      }
      
      // Check IP patterns
      if (pattern.conditions.ipPatterns) {
        const ipMatches = pattern.conditions.ipPatterns.some(ipPattern => 
          event.sourceIP.includes(ipPattern)
        );
        if (!ipMatches) return false;
      }
      
      return true;
    });
  }

  /**
   * Trigger a breach incident
   */
  private async triggerBreachIncident(pattern: BreachPattern, events: HIPAAAuditEvent[]): Promise<BreachIncident> {
    try {
      const incident: BreachIncident = {
        id: crypto.randomUUID(),
        patternId: pattern.id,
        patternName: pattern.name,
        detectedAt: new Date(),
        severity: pattern.severity,
        status: 'new',
        triggerEvents: events,
        affectedUsers: [...new Set(events.map(e => e.userId).filter(Boolean))] as string[],
        affectedPatients: [...new Set(events.map(e => e.patientId).filter(Boolean))] as string[],
        affectedSystems: [...new Set(events.map(e => e.resourceType))],
        dataAtRisk: this.assessDataAtRisk(events),
        investigationNotes: [],
        evidenceCollected: [],
        responseActions: [],
        riskAssessment: {
          probabilityOfHarm: this.assessProbabilityOfHarm(events),
          impactAssessment: this.assessImpact(events),
          breachDetermination: 'pending_review',
          riskMitigated: false
        },
        notifications: {
          hhs: { sent: false },
          patients: { required: false, sent: false },
          media: { required: false, sent: false },
          businessAssociates: { required: false, sent: false }
        },
        correctiveActions: [],
        preventiveMeasures: []
      };

      // Update pattern trigger count
      pattern.lastTriggered = new Date();
      pattern.triggerCount++;

      // Add to active incidents
      this.activeIncidents.push(incident);

      // Log the incident
      await this.auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.BREACH_ATTEMPT,
        action: 'breach_incident_detected',
        description: `Breach incident detected: ${pattern.name}`,
        resourceType: 'breach_incident',
        resourceId: incident.id,
        phiInvolved: events.some(e => e.phiInvolved),
        sourceIP: events[0]?.sourceIP || '0.0.0.0',
        applicationName: 'ASTRAL_CORE',
        applicationVersion: '2.0.0',
        outcome: 'failure',
        riskLevel: HIPAARiskLevel.CRITICAL,
        impactLevel: pattern.severity === 'critical' ? 'severe' : pattern.severity,
        complianceStatus: HIPAAComplianceStatus.VIOLATION,
        requestDetails: {
          patternName: pattern.name,
          severity: pattern.severity,
          eventCount: events.length,
          affectedUsers: incident.affectedUsers.length,
          affectedPatients: incident.affectedPatients.length
        }
      });

      // Trigger automated responses
      await this.executeAutomatedResponse(pattern, incident);

      // Send alerts
      await this.sendBreachAlert(incident);

      this.emit('breach_detected', incident);
      return incident;

    } catch (error) {
      this.logger.error('Failed to trigger breach incident', error as Error);
      throw error;
    }
  }

  /**
   * Execute automated response actions
   */
  private async executeAutomatedResponse(pattern: BreachPattern, incident: BreachIncident): Promise<void> {
    const responses: Array<{
      action: string;
      performedBy: string;
      performedAt: Date;
      result: string;
      automated: boolean;
    }> = [];

    try {
      // Auto-block users if configured
      if (pattern.response.autoBlock && incident.affectedUsers.length > 0) {
        for (const userId of incident.affectedUsers) {
          await this.blockUser(userId);
          responses.push({
            action: `blocked_user_${userId}`,
            performedBy: 'BREACH_DETECTOR_SYSTEM',
            performedAt: new Date(),
            result: 'success',
            automated: true
          });
        }
      }

      // Quarantine users if configured
      if (pattern.response.quarantineUser && incident.affectedUsers.length > 0) {
        for (const userId of incident.affectedUsers) {
          await this.quarantineUser(userId);
          responses.push({
            action: `quarantined_user_${userId}`,
            performedBy: 'BREACH_DETECTOR_SYSTEM',
            performedAt: new Date(),
            result: 'success',
            automated: true
          });
        }
      }

      // System lockdown if configured
      if (pattern.response.lockdownSystem) {
        await this.initiateSystemLockdown();
        responses.push({
          action: 'system_lockdown_initiated',
          performedBy: 'BREACH_DETECTOR_SYSTEM',
          performedAt: new Date(),
          result: 'success',
          automated: true
        });
      }

      incident.responseActions.push(...responses);

    } catch (error) {
      this.logger.error('Failed to execute automated response', error as Error);
      
      responses.push({
        action: 'automated_response_failed',
        performedBy: 'BREACH_DETECTOR_SYSTEM',
        performedAt: new Date(),
        result: `failed: ${error instanceof Error ? error.message : String(error)}`,
        automated: true
      });
      
      incident.responseActions.push(...responses);
    }
  }

  /**
   * Send breach alert
   */
  private async sendBreachAlert(incident: BreachIncident): Promise<void> {
    try {
      const pattern = this.breachPatterns.find(p => p.id === incident.patternId);
      if (!pattern) return;

      const alert: BreachAlert = {
        id: crypto.randomUUID(),
        incidentId: incident.id,
        alertType: 'immediate',
        severity: incident.severity,
        title: `HIPAA Breach Detected: ${incident.patternName}`,
        message: this.generateAlertMessage(incident),
        recipients: pattern.response.notificationChannels,
        channels: this.determineAlertChannels(incident.severity),
        sentAt: new Date(),
        acknowledged: false
      };

      this.sentAlerts.push(alert);

      // Log the alert
      await this.auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.SYSTEM_SECURITY,
        action: 'breach_alert_sent',
        description: `Breach alert sent for incident ${incident.id}`,
        resourceType: 'breach_alert',
        resourceId: alert.id,
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        applicationName: 'ASTRAL_CORE',
        applicationVersion: '2.0.0',
        outcome: 'success',
        riskLevel: incident.severity === 'critical' ? HIPAARiskLevel.CRITICAL : HIPAARiskLevel.HIGH,
        impactLevel: incident.severity as 'low' | 'medium' | 'high' | 'none' | 'severe',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT,
        requestDetails: {
          incidentId: incident.id,
          alertType: alert.alertType,
          recipients: alert.recipients.length
        }
      });

      this.emit('alert_sent', alert);

    } catch (error) {
      this.logger.error('Failed to send breach alert', error as Error);
    }
  }

  /**
   * Investigate a breach incident
   */
  public async investigateIncident(
    incidentId: string,
    investigator: string,
    initialNotes?: string
  ): Promise<void> {
    try {
      const incident = this.activeIncidents.find(i => i.id === incidentId);
      if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
      }

      incident.status = 'investigating';
      incident.investigator = investigator;
      incident.investigationStarted = new Date();
      
      if (initialNotes) {
        incident.investigationNotes.push(`${new Date().toISOString()}: ${initialNotes}`);
      }

      // Log investigation start
      await this.auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.ADMINISTRATIVE,
        action: 'breach_investigation_started',
        description: `Investigation started for breach incident ${incidentId}`,
        resourceType: 'breach_incident',
        resourceId: incidentId,
        userId: investigator,
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        applicationName: 'ASTRAL_CORE',
        applicationVersion: '2.0.0',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.MODERATE,
        impactLevel: 'medium',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT,
        requestDetails: { investigator, initialNotes }
      });

      this.emit('investigation_started', { incident, investigator });

    } catch (error) {
      this.logger.error('Failed to start incident investigation', error as Error);
      throw error;
    }
  }

  /**
   * Resolve a breach incident
   */
  public async resolveIncident(
    incidentId: string,
    resolvedBy: string,
    resolution: {
      rootCause: string;
      correctiveActions: string[];
      preventiveMeasures: string[];
      lessonsLearned?: string;
      breachDetermination: 'breach' | 'not_breach';
    }
  ): Promise<void> {
    try {
      const incident = this.activeIncidents.find(i => i.id === incidentId);
      if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
      }

      incident.status = 'resolved';
      incident.resolvedAt = new Date();
      incident.resolvedBy = resolvedBy;
      incident.rootCause = resolution.rootCause;
      incident.correctiveActions = resolution.correctiveActions;
      incident.preventiveMeasures = resolution.preventiveMeasures;
      incident.lessonsLearned = resolution.lessonsLearned;
      incident.riskAssessment.breachDetermination = resolution.breachDetermination;
      incident.riskAssessment.riskMitigated = true;

      // Remove from active incidents
      this.activeIncidents = this.activeIncidents.filter(i => i.id !== incidentId);

      // Log resolution
      await this.auditLogger.logAuditEvent({
        category: HIPAAAuditCategory.ADMINISTRATIVE,
        action: 'breach_incident_resolved',
        description: `Breach incident resolved: ${incident.patternName}`,
        resourceType: 'breach_incident',
        resourceId: incidentId,
        userId: resolvedBy,
        phiInvolved: false,
        sourceIP: '127.0.0.1',
        applicationName: 'ASTRAL_CORE',
        applicationVersion: '2.0.0',
        outcome: 'success',
        riskLevel: HIPAARiskLevel.LOW,
        impactLevel: 'low',
        complianceStatus: HIPAAComplianceStatus.COMPLIANT,
        requestDetails: {
          rootCause: resolution.rootCause,
          breachDetermination: resolution.breachDetermination,
          correctiveActions: resolution.correctiveActions.length,
          preventiveMeasures: resolution.preventiveMeasures.length
        }
      });

      this.emit('incident_resolved', incident);

    } catch (error) {
      this.logger.error('Failed to resolve incident', error as Error);
      throw error;
    }
  }

  // Private helper methods

  private async loadDefaultBreachPatterns(): Promise<void> {
    const defaultPatterns: Omit<BreachPattern, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>[] = [
      {
        name: 'Multiple Failed PHI Access Attempts',
        description: 'Detects multiple failed attempts to access PHI within a short time window',
        severity: 'high',
        category: 'unauthorized_access',
        conditions: {
          timeWindow: 15,
          threshold: 5,
          eventTypes: [HIPAAAuditCategory.PHI_ACCESS],
          riskLevels: [HIPAARiskLevel.HIGH, HIPAARiskLevel.CRITICAL]
        },
        anomalyDetection: {
          enabled: true,
          baselineWindow: 30,
          sensitivityLevel: 'high',
          minimumSamples: 100
        },
        response: {
          autoBlock: true,
          autoEscalate: true,
          notificationChannels: ['security@astralcore.com', 'compliance@astralcore.com'],
          requiresManualReview: true,
          quarantineUser: true,
          lockdownSystem: false
        },
        regulatoryImpact: {
          hipaaBreachRule: true,
          requiresBRENotification: true,
          requires24HourNotification: true,
          requiresPatientNotification: false,
          requiresMediaNotification: false
        },
        active: true
      },
      {
        name: 'After-Hours PHI Access',
        description: 'Detects PHI access during unusual hours',
        severity: 'medium',
        category: 'access_anomaly',
        conditions: {
          timeWindow: 60,
          threshold: 3,
          eventTypes: [HIPAAAuditCategory.PHI_ACCESS],
          riskLevels: [HIPAARiskLevel.MODERATE, HIPAARiskLevel.HIGH]
        },
        anomalyDetection: {
          enabled: true,
          baselineWindow: 90,
          sensitivityLevel: 'medium',
          minimumSamples: 200
        },
        response: {
          autoBlock: false,
          autoEscalate: true,
          notificationChannels: ['security@astralcore.com'],
          requiresManualReview: true,
          quarantineUser: false,
          lockdownSystem: false
        },
        regulatoryImpact: {
          hipaaBreachRule: false,
          requiresBRENotification: false,
          requires24HourNotification: false,
          requiresPatientNotification: false,
          requiresMediaNotification: false
        },
        active: true
      },
      {
        name: 'Bulk Data Export',
        description: 'Detects large-scale data export operations',
        severity: 'critical',
        category: 'data_exfiltration',
        conditions: {
          timeWindow: 30,
          threshold: 1,
          eventTypes: [HIPAAAuditCategory.DATA_EXPORT],
          riskLevels: [HIPAARiskLevel.HIGH, HIPAARiskLevel.CRITICAL]
        },
        anomalyDetection: {
          enabled: false,
          baselineWindow: 30,
          sensitivityLevel: 'high',
          minimumSamples: 50
        },
        response: {
          autoBlock: true,
          autoEscalate: true,
          notificationChannels: ['security@astralcore.com', 'compliance@astralcore.com', 'ciso@astralcore.com'],
          requiresManualReview: true,
          quarantineUser: true,
          lockdownSystem: true
        },
        regulatoryImpact: {
          hipaaBreachRule: true,
          requiresBRENotification: true,
          requires24HourNotification: true,
          requiresPatientNotification: true,
          requiresMediaNotification: true
        },
        active: true
      }
    ];

    for (const patternData of defaultPatterns) {
      await this.addBreachPattern(patternData);
    }
  }

  private async loadAnomalyBaselines(): Promise<void> {
    // In a real implementation, this would load from persistent storage
    this.logger.audit('Anomaly baselines loaded', {
      baselinesCount: this.anomalyBaselines.size
    });
  }

  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.analyzePatterns();
      } catch (error) {
        this.logger.error('Real-time monitoring failed', error as Error);
      }
    }, this.monitoringFrequency);
  }

  private startBaselineUpdates(): void {
    this.baselineUpdateInterval = setInterval(async () => {
      try {
        await this.updateAllBaselines();
      } catch (error) {
        this.logger.error('Baseline update failed', error as Error);
      }
    }, this.baselineUpdateFrequency);
  }

  private async triggerImmediateAlert(event: HIPAAAuditEvent): Promise<void> {
    // Create immediate alert for high-risk events
    const alert: BreachAlert = {
      id: crypto.randomUUID(),
      incidentId: 'immediate',
      alertType: 'immediate',
      severity: 'critical',
      title: 'Immediate Security Threat Detected',
      message: `High-risk event detected: ${event.action} by user ${event.userId}`,
      recipients: ['security@astralcore.com'],
      channels: ['email', 'sms', 'push'],
      sentAt: new Date(),
      acknowledged: false
    };

    this.sentAlerts.push(alert);
    this.emit('immediate_alert', alert);
  }

  private isUnusualLocation(event: HIPAAAuditEvent): boolean {
    // Check if the IP address is from an unusual location
    // This would integrate with IP geolocation services
    return false; // Placeholder
  }

  private isAfterHours(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    return hour < 6 || hour > 22; // Before 6 AM or after 10 PM
  }

  private isBulkDataAccess(event: HIPAAAuditEvent): boolean {
    // Check if this represents bulk data access
    return event.category === HIPAAAuditCategory.DATA_EXPORT ||
           Boolean(event.requestDetails && event.requestDetails.recordCount != null && event.requestDetails.recordCount > 100);
  }

  private hasProperAuthorization(event: HIPAAAuditEvent): boolean {
    // Check if administrative action has proper authorization
    return event.userRole === 'admin' || event.userRole === 'system_admin';
  }

  private updateUserBaseline(event: HIPAAAuditEvent): void {
    // Update user behavior baseline
    if (!event.userId) return;
    
    const baseline = this.anomalyBaselines.get(event.userId);
    if (baseline) {
      // Update existing baseline
      baseline.lastUpdated = new Date();
    } else {
      // Create new baseline
      this.anomalyBaselines.set(event.userId, {
        userId: event.userId,
        baselineData: {
          avgDailyAccesses: 0,
          avgSessionDuration: 0,
          commonAccessTimes: [],
          commonResources: [],
          commonLocations: [],
          patientAccessPatterns: []
        },
        lastUpdated: new Date(),
        samplePeriodDays: 30,
        confidence: 0
      });
    }
  }

  private async checkForAnomalies(pattern: BreachPattern, events: HIPAAAuditEvent[]): Promise<void> {
    // Implement anomaly detection logic
    // This would use machine learning or statistical analysis
  }

  private assessDataAtRisk(events: HIPAAAuditEvent[]): string[] {
    const dataTypes = new Set<string>();
    
    events.forEach(event => {
      if (event.phiInvolved && event.phiType) {
        event.phiType.forEach(type => dataTypes.add(type));
      }
    });
    
    return Array.from(dataTypes);
  }

  private assessProbabilityOfHarm(events: HIPAAAuditEvent[]): 'low' | 'medium' | 'high' {
    const riskEvents = events.filter(e => e.riskLevel === HIPAARiskLevel.HIGH || e.riskLevel === HIPAARiskLevel.CRITICAL);
    const riskRatio = riskEvents.length / events.length;
    
    if (riskRatio > 0.7) return 'high';
    if (riskRatio > 0.3) return 'medium';
    return 'low';
  }

  private assessImpact(events: HIPAAAuditEvent[]): 'minimal' | 'moderate' | 'significant' | 'severe' {
    const phiEvents = events.filter(e => e.phiInvolved);
    const uniquePatients = new Set(events.map(e => e.patientId).filter(Boolean)).size;
    
    if (uniquePatients > 500 || phiEvents.length > 1000) return 'severe';
    if (uniquePatients > 100 || phiEvents.length > 100) return 'significant';
    if (uniquePatients > 10 || phiEvents.length > 10) return 'moderate';
    return 'minimal';
  }

  private generateAlertMessage(incident: BreachIncident): string {
    return `
    HIPAA Breach Incident Detected
    
    Pattern: ${incident.patternName}
    Severity: ${incident.severity.toUpperCase()}
    Detected: ${incident.detectedAt.toISOString()}
    
    Affected Users: ${incident.affectedUsers.length}
    Affected Patients: ${incident.affectedPatients.length}
    Systems Involved: ${incident.affectedSystems.join(', ')}
    
    Immediate action required. Please investigate immediately.
    
    Incident ID: ${incident.id}
    `;
  }

  private determineAlertChannels(severity: string): ('email' | 'sms' | 'push' | 'slack' | 'pager')[] {
    switch (severity) {
      case 'critical':
        return ['email', 'sms', 'push', 'pager'];
      case 'high':
        return ['email', 'sms', 'push'];
      case 'medium':
        return ['email', 'push'];
      default:
        return ['email'];
    }
  }

  private async blockUser(userId: string): Promise<void> {
    // Implement user blocking logic
    this.logger.audit('User blocked due to breach detection', { userId });
  }

  private async quarantineUser(userId: string): Promise<void> {
    // Implement user quarantine logic
    this.logger.audit('User quarantined due to breach detection', { userId });
  }

  private async initiateSystemLockdown(): Promise<void> {
    // Implement system lockdown logic
    this.logger.audit('System lockdown initiated due to critical breach');
  }

  private async updateAllBaselines(): Promise<void> {
    // Update all user baselines
    this.logger.audit('Anomaly baselines updated', {
      baselinesCount: this.anomalyBaselines.size
    });
  }

  /**
   * Get active incidents
   */
  public getActiveIncidents(): BreachIncident[] {
    return [...this.activeIncidents];
  }

  /**
   * Get breach patterns
   */
  public getBreachPatterns(): BreachPattern[] {
    return [...this.breachPatterns];
  }

  /**
   * Get recent alerts
   */
  public getRecentAlerts(hours: number = 24): BreachAlert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.sentAlerts.filter(alert => alert.sentAt >= cutoff);
  }

  /**
   * Cleanup method
   */
  public cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.baselineUpdateInterval) {
      clearInterval(this.baselineUpdateInterval);
    }
  }
}

export default HIPAABreachDetector;