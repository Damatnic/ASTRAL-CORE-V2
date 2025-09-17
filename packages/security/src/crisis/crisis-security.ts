/**
 * Crisis-Specific Security Measures
 * Enhanced security for mental health crisis intervention platform
 */

import * as crypto from 'crypto';
import { EncryptionService } from '../encryption/encryption-service';
import { AuditService } from '../audit';
import { SecurityLogger } from '../logging/security-logger';
import { BreachDetectionService } from '../breach-detection/breach-monitor';

export interface CrisisSession {
  id: string;
  userId?: string; // Can be null for anonymous sessions
  volunteerId?: string;
  type: 'anonymous' | 'authenticated' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: Date;
  endTime?: Date;
  encrypted: boolean;
  ephemeral: boolean; // Auto-delete after session
  metadata: {
    ipHash: string;
    deviceFingerprint: string;
    geoLocation?: string;
    referralSource?: string;
  };
}

export interface CrisisMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'volunteer' | 'system' | 'ai';
  content: string;
  timestamp: Date;
  encrypted: boolean;
  flagged: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis?: {
    sentiment: number;
    riskFactors: string[];
    recommendations: string[];
  };
}

export interface EmergencyEscalation {
  id: string;
  sessionId: string;
  userId?: string;
  triggeredBy: 'user' | 'volunteer' | 'ai' | 'keyword';
  severity: 'urgent' | 'critical';
  reason: string;
  location?: {
    country: string;
    region?: string;
    approximate: boolean;
  };
  actions: Array<{
    type: 'notify_emergency' | 'alert_supervisor' | 'contact_authorities' | 'preserve_evidence';
    executed: boolean;
    timestamp: Date;
    result?: any;
  }>;
  resolved: boolean;
  timestamp: Date;
}

export class CrisisSecurityService {
  private logger: SecurityLogger;
  private auditService: AuditService;
  private encryptionService: EncryptionService;
  private breachDetection: BreachDetectionService;
  private activeSessions: Map<string, CrisisSession> = new Map();
  private riskKeywords: Set<string> = new Set();
  private emergencyContacts: Map<string, any[]> = new Map();

  constructor() {
    this.logger = new SecurityLogger();
    this.auditService = new AuditService();
    this.encryptionService = new EncryptionService();
    this.breachDetection = new BreachDetectionService();
    this.initializeRiskKeywords();
    this.startSessionCleanup();
  }

  /**
   * Initialize risk detection keywords
   */
  private initializeRiskKeywords(): void {
    this.riskKeywords = new Set([
      // High-risk keywords
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'harm myself', 'cut myself', 'overdose', 'pills',
      'rope', 'gun', 'jump', 'bridge',
      
      // Self-harm keywords
      'self harm', 'self-harm', 'cutting', 'burning',
      'hurting myself', 'pain relief', 'deserve pain',
      
      // Violence keywords  
      'hurt others', 'kill them', 'revenge', 'weapon',
      'violence', 'attack', 'harm them',
      
      // Crisis indicators
      'goodbye', 'final message', 'last time', 'can\'t go on',
      'nobody cares', 'hopeless', 'nothing left',
      'emergency', 'crisis', 'help me', 'urgent'
    ]);
  }

  /**
   * Create secure crisis session
   */
  public async createCrisisSession(
    userId?: string,
    type: 'anonymous' | 'authenticated' | 'emergency' = 'anonymous',
    metadata: any = {}
  ): Promise<CrisisSession> {
    try {
      const sessionId = crypto.randomUUID();
      
      const session: CrisisSession = {
        id: sessionId,
        userId,
        type,
        severity: 'medium',
        startTime: new Date(),
        encrypted: true,
        ephemeral: type === 'anonymous',
        metadata: {
          ipHash: this.hashIP(metadata.ip || ''),
          deviceFingerprint: metadata.deviceFingerprint || '',
          geoLocation: metadata.location,
          referralSource: metadata.referral
        }
      };

      this.activeSessions.set(sessionId, session);

      // Log session creation with enhanced security
      await this.auditService.logCrisisAccess(
        userId || 'anonymous',
        'crisis_session_created',
        sessionId,
        {
          sessionType: type,
          ephemeral: session.ephemeral,
          encrypted: session.encrypted,
          ipHash: session.metadata.ipHash
        }
      );

      // Set up automatic cleanup for anonymous sessions
      if (session.ephemeral) {
        setTimeout(() => {
          this.cleanupSession(sessionId);
        }, 4 * 60 * 60 * 1000); // 4 hours
      }

      return session;
    } catch (error) {
      this.logger.error('Crisis session creation failed', error as Error);
      throw error;
    }
  }

  /**
   * Secure message processing for crisis chat
   */
  public async processMessage(
    sessionId: string,
    senderId: string,
    senderType: 'user' | 'volunteer' | 'system' | 'ai',
    content: string
  ): Promise<CrisisMessage> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid session');
      }

      // Analyze message for risk
      const riskAnalysis = await this.analyzeMessageRisk(content);
      
      const message: CrisisMessage = {
        id: crypto.randomUUID(),
        sessionId,
        senderId,
        senderType,
        content: session.encrypted ? this.encryptionService.encryptField(content, 'crisis_message') : content,
        timestamp: new Date(),
        encrypted: session.encrypted,
        flagged: riskAnalysis.flagged,
        riskLevel: riskAnalysis.riskLevel,
        aiAnalysis: riskAnalysis.aiAnalysis
      };

      // Handle high-risk messages
      if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
        await this.handleHighRiskMessage(session, message);
      }

      // Log message processing
      await this.auditService.logCrisisAccess(
        senderId,
        'crisis_message_processed',
        sessionId,
        {
          messageId: message.id,
          riskLevel: message.riskLevel,
          flagged: message.flagged,
          encrypted: message.encrypted
        }
      );

      return message;
    } catch (error) {
      this.logger.error('Message processing failed', error as Error);
      throw error;
    }
  }

  /**
   * Analyze message for risk factors
   */
  private async analyzeMessageRisk(content: string): Promise<{
    flagged: boolean;
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    aiAnalysis: {
      sentiment: number;
      riskFactors: string[];
      recommendations: string[];
    };
  }> {
    const lowerContent = content.toLowerCase();
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check for risk keywords
    for (const keyword of this.riskKeywords) {
      if (lowerContent.includes(keyword)) {
        riskFactors.push(keyword);
        
        // Weight different types of keywords
        if (keyword.includes('suicide') || keyword.includes('kill')) {
          riskScore += 10;
        } else if (keyword.includes('harm') || keyword.includes('cut')) {
          riskScore += 7;
        } else if (keyword.includes('help') || keyword.includes('crisis')) {
          riskScore += 5;
        } else {
          riskScore += 3;
        }
      }
    }

    // Simple sentiment analysis (in production, use proper NLP)
    const negativeWords = ['sad', 'depressed', 'angry', 'hopeless', 'alone', 'worthless'];
    const positiveWords = ['better', 'hope', 'help', 'support', 'love', 'care'];
    
    let sentiment = 0;
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) sentiment -= 1;
    });
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) sentiment += 1;
    });

    // Determine risk level
    let riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    if (riskScore >= 15) riskLevel = 'critical';
    else if (riskScore >= 10) riskLevel = 'high';
    else if (riskScore >= 5) riskLevel = 'medium';
    else if (riskScore > 0) riskLevel = 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Immediate human intervention required');
      recommendations.push('Consider emergency services escalation');
      recommendations.push('Preserve conversation data');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor conversation closely');
      recommendations.push('Prepare crisis resources');
    }

    return {
      flagged: riskLevel === 'high' || riskLevel === 'critical',
      riskLevel,
      aiAnalysis: {
        sentiment,
        riskFactors,
        recommendations
      }
    };
  }

  /**
   * Handle high-risk messages
   */
  private async handleHighRiskMessage(session: CrisisSession, message: CrisisMessage): Promise<void> {
    try {
      // Update session severity
      if (message.riskLevel === 'critical') {
        session.severity = 'critical';
      } else if (message.riskLevel === 'high' && session.severity !== 'critical') {
        session.severity = 'high';
      }

      // Create emergency escalation if critical
      if (message.riskLevel === 'critical') {
        await this.createEmergencyEscalation(session, message);
      }

      // Alert monitoring systems
      await this.breachDetection.createBreachAlert({
        type: 'data_access_anomaly',
        severity: message.riskLevel === 'critical' ? 'critical' : 'high',
        description: `High-risk crisis message detected in session ${session.id}`,
        userId: session.userId,
        indicators: message.aiAnalysis?.riskFactors.map(factor => ({
          type: 'risk_keyword',
          value: factor,
          confidence: 0.9
        })) || [],
        automated: false,
        affectedData: {
          type: 'phi',
          records: 1,
          details: { sessionId: session.id, messageId: message.id }
        }
      });

      // Log high-risk event
      await this.auditService.logEvent({
        action: 'high_risk_message_detected',
        resource: 'crisis',
        resourceId: session.id,
        details: {
          messageId: message.id,
          riskLevel: message.riskLevel,
          riskFactors: message.aiAnalysis?.riskFactors,
          sessionSeverity: session.severity
        },
        phi: true,
        risk: 'critical'
      });

    } catch (error) {
      this.logger.error('High-risk message handling failed', error as Error);
    }
  }

  /**
   * Create emergency escalation
   */
  private async createEmergencyEscalation(
    session: CrisisSession,
    message: CrisisMessage
  ): Promise<EmergencyEscalation> {
    const escalationId = crypto.randomUUID();
    
    const escalation: EmergencyEscalation = {
      id: escalationId,
      sessionId: session.id,
      userId: session.userId,
      triggeredBy: 'ai',
      severity: 'critical',
      reason: `Critical risk message detected: ${message.aiAnalysis?.riskFactors.join(', ')}`,
      location: session.metadata.geoLocation ? {
        country: 'US', // This would be determined from actual geo data
        region: session.metadata.geoLocation,
        approximate: true
      } : undefined,
      actions: [],
      resolved: false,
      timestamp: new Date()
    };

    // Execute emergency actions
    const actions = [
      'alert_supervisor',
      'preserve_evidence',
      'notify_emergency'
    ] as const;

    for (const actionType of actions) {
      try {
        const result = await this.executeEmergencyAction(actionType, escalation);
        escalation.actions.push({
          type: actionType,
          executed: true,
          timestamp: new Date(),
          result
        });
      } catch (error) {
        escalation.actions.push({
          type: actionType,
          executed: false,
          timestamp: new Date(),
          result: error
        });
      }
    }

    // Log emergency escalation
    await this.auditService.logEvent({
      action: 'emergency_escalation_created',
      resource: 'crisis',
      resourceId: escalation.id,
      details: {
        sessionId: session.id,
        severity: escalation.severity,
        triggeredBy: escalation.triggeredBy,
        actions: escalation.actions.length,
        location: escalation.location
      },
      phi: true,
      risk: 'critical'
    });

    return escalation;
  }

  /**
   * Execute emergency action
   */
  private async executeEmergencyAction(
    actionType: 'notify_emergency' | 'alert_supervisor' | 'contact_authorities' | 'preserve_evidence',
    escalation: EmergencyEscalation
  ): Promise<any> {
    switch (actionType) {
      case 'alert_supervisor':
        // Alert crisis supervisors
        return { alerted: ['supervisor1', 'supervisor2'], timestamp: new Date() };

      case 'preserve_evidence':
        // Preserve session data
        const session = this.activeSessions.get(escalation.sessionId);
        if (session) {
          session.ephemeral = false; // Prevent auto-deletion
        }
        return { preserved: true, sessionId: escalation.sessionId };

      case 'notify_emergency':
        // This would integrate with 988 Lifeline or emergency services
        return { service: '988_lifeline', notified: true, reference: crypto.randomUUID() };

      case 'contact_authorities':
        // Contact local authorities if location is available
        if (escalation.location) {
          return { 
            contacted: true, 
            location: escalation.location,
            reference: crypto.randomUUID()
          };
        }
        return { contacted: false, reason: 'No location available' };

      default:
        throw new Error(`Unknown emergency action: ${actionType}`);
    }
  }

  /**
   * Anonymize user data for privacy
   */
  public anonymizeUserData(data: any): any {
    const anonymized = { ...data };
    
    // Remove or hash identifying information
    if (anonymized.userId) {
      anonymized.userId = this.hashData(anonymized.userId);
    }
    
    if (anonymized.email) {
      delete anonymized.email;
    }
    
    if (anonymized.phone) {
      delete anonymized.phone;
    }
    
    if (anonymized.name) {
      delete anonymized.name;
    }
    
    if (anonymized.ip) {
      anonymized.ipHash = this.hashIP(anonymized.ip);
      delete anonymized.ip;
    }

    return anonymized;
  }

  /**
   * Secure session cleanup
   */
  private async cleanupSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      // Only cleanup ephemeral sessions
      if (session.ephemeral) {
        session.endTime = new Date();
        
        // Log session cleanup
        await this.auditService.logEvent({
          action: 'crisis_session_cleanup',
          resource: 'crisis',
          resourceId: sessionId,
          details: {
            sessionType: session.type,
            duration: session.endTime.getTime() - session.startTime.getTime(),
            severity: session.severity
          },
          phi: true,
          risk: 'low'
        });

        // Remove from active sessions
        this.activeSessions.delete(sessionId);
      }
    } catch (error) {
      this.logger.error('Session cleanup failed', error as Error);
    }
  }

  /**
   * Start automatic session cleanup
   */
  private startSessionCleanup(): void {
    // Clean up expired sessions every hour
    setInterval(() => {
      const now = Date.now();
      const fourHoursAgo = now - (4 * 60 * 60 * 1000);

      for (const [sessionId, session] of this.activeSessions) {
        if (session.ephemeral && session.startTime.getTime() < fourHoursAgo) {
          this.cleanupSession(sessionId);
        }
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Utility methods
   */
  private hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + 'salt').digest('hex').substring(0, 16);
  }

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data + 'data_salt').digest('hex').substring(0, 16);
  }

  /**
   * Get active sessions (for monitoring)
   */
  public getActiveSessions(): CrisisSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get session by ID (with access control)
   */
  public getSession(sessionId: string, requesterId: string, requesterRole: string): CrisisSession | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) return null;

    // Access control
    if (requesterRole === 'admin' || requesterRole === 'supervisor') {
      return session;
    }
    
    if (session.userId === requesterId || session.volunteerId === requesterId) {
      return session;
    }

    // Log unauthorized access attempt
    this.auditService.logSecurityViolation(
      'unauthorized_session_access',
      { sessionId, requesterId, requesterRole },
      undefined,
      requesterId
    );

    return null;
  }

  /**
   * Update session volunteer assignment
   */
  public async assignVolunteer(sessionId: string, volunteerId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.volunteerId = volunteerId;
    
    await this.auditService.logEvent({
      action: 'crisis_volunteer_assigned',
      resource: 'crisis',
      resourceId: sessionId,
      details: { volunteerId, sessionType: session.type },
      phi: true,
      risk: 'medium'
    });
  }
}

export default CrisisSecurityService;