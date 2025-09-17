/**
 * Crisis Session Manager
 * Secure session management for mental health crisis intervention
 */

import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { CrisisSecurityService } from '@astralcore/security/crisis/crisis-security';
import { EncryptionService } from '@astralcore/security/encryption/encryption-service';

export interface CrisisSessionConfig {
  maxSessionDuration: number;
  autoEscalationThreshold: number;
  encryptionRequired: boolean;
  anonymousSessionsAllowed: boolean;
  maxConcurrentSessions: number;
}

export interface SessionParticipant {
  id: string;
  type: 'user' | 'volunteer' | 'supervisor' | 'ai_assistant';
  role: 'crisis_seeker' | 'crisis_responder' | 'supervisor' | 'emergency_contact';
  anonymous: boolean;
  encrypted: boolean;
  joinedAt: Date;
  lastActivity: Date;
  permissions: string[];
}

export interface CrisisSessionData {
  id: string;
  type: 'anonymous_chat' | 'authenticated_session' | 'emergency_escalation';
  status: 'active' | 'escalated' | 'resolved' | 'transferred' | 'ended';
  severity: 'low' | 'medium' | 'high' | 'critical';
  participants: SessionParticipant[];
  startTime: Date;
  endTime?: Date;
  lastActivity: Date;
  messageCount: number;
  riskFlags: string[];
  emergencyEscalations: number;
  encrypted: boolean;
  confidential: boolean;
  metadata: {
    ipHash: string;
    deviceFingerprint: string;
    geoLocation?: string;
    referralSource: string;
    userAgent: string;
  };
}

export class CrisisSessionManager extends EventEmitter {
  private crisisSecurity: CrisisSecurityService;
  private encryption: EncryptionService;
  private activeSessions: Map<string, CrisisSessionData> = new Map();
  private config: CrisisSessionConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<CrisisSessionConfig> = {}) {
    super();
    
    this.config = {
      maxSessionDuration: 4 * 60 * 60 * 1000, // 4 hours
      autoEscalationThreshold: 3, // 3 high-risk messages
      encryptionRequired: true,
      anonymousSessionsAllowed: true,
      maxConcurrentSessions: 1000,
      ...config
    };

    this.crisisSecurity = new CrisisSecurityService();
    this.encryption = new EncryptionService();
    
    this.startSessionCleanup();
  }

  /**
   * Create new crisis session with enhanced security
   */
  public async createSecureSession(
    initiatorId?: string,
    sessionType: 'anonymous_chat' | 'authenticated_session' | 'emergency_escalation' = 'anonymous_chat',
    metadata: any = {}
  ): Promise<CrisisSessionData> {
    try {
      // Check concurrent session limit
      if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
        throw new Error('Maximum concurrent sessions reached');
      }

      const sessionId = crypto.randomUUID();
      const now = new Date();

      // Map session type to expected format
      const mappedSessionType = sessionType === 'anonymous_chat' ? 'anonymous' :
                                sessionType === 'authenticated_session' ? 'authenticated' :
                                sessionType === 'emergency_escalation' ? 'emergency' : 'anonymous';
      
      // Create secure crisis session
      const crisisSession = await this.crisisSecurity.createCrisisSession(
        initiatorId,
        mappedSessionType,
        metadata
      );

      // Create session participant
      const initiator: SessionParticipant = {
        id: initiatorId || 'anonymous',
        type: initiatorId ? 'user' : 'user',
        role: 'crisis_seeker',
        anonymous: !initiatorId,
        encrypted: this.config.encryptionRequired,
        joinedAt: now,
        lastActivity: now,
        permissions: ['send_message', 'request_help', 'end_session']
      };

      // Create session data
      const session: CrisisSessionData = {
        id: sessionId,
        type: sessionType,
        status: 'active',
        severity: 'medium',
        participants: [initiator],
        startTime: now,
        lastActivity: now,
        messageCount: 0,
        riskFlags: [],
        emergencyEscalations: 0,
        encrypted: this.config.encryptionRequired,
        confidential: true,
        metadata: {
          ipHash: this.hashIP(metadata.ip || ''),
          deviceFingerprint: metadata.deviceFingerprint || '',
          geoLocation: metadata.location,
          referralSource: metadata.referral || 'direct',
          userAgent: metadata.userAgent || ''
        }
      };

      this.activeSessions.set(sessionId, session);

      // Emit session created event
      this.emit('session_created', {
        sessionId,
        type: sessionType,
        encrypted: session.encrypted,
        anonymous: initiator.anonymous
      });

      // Auto-escalate to emergency if needed
      if (sessionType === 'emergency_escalation') {
        await this.escalateToEmergency(sessionId, 'session_creation');
      }

      return session;
    } catch (error) {
      throw new Error(`Failed to create secure session: ${(error as Error).message}`);
    }
  }

  /**
   * Add volunteer to crisis session
   */
  public async addVolunteerToSession(
    sessionId: string,
    volunteerId: string,
    volunteerType: 'volunteer' | 'supervisor' = 'volunteer'
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if volunteer already in session
      if (session.participants.some(p => p.id === volunteerId)) {
        return true; // Already in session
      }

      const volunteer: SessionParticipant = {
        id: volunteerId,
        type: volunteerType,
        role: 'crisis_responder',
        anonymous: false,
        encrypted: session.encrypted,
        joinedAt: new Date(),
        lastActivity: new Date(),
        permissions: [
          'send_message',
          'view_history',
          'escalate_crisis',
          'request_supervisor',
          ...(volunteerType === 'supervisor' ? ['end_session', 'transfer_session'] : [])
        ]
      };

      session.participants.push(volunteer);
      session.lastActivity = new Date();

      // Update crisis security service
      await this.crisisSecurity.assignVolunteer(sessionId, volunteerId);

      // Emit volunteer joined event
      this.emit('volunteer_joined', {
        sessionId,
        volunteerId,
        volunteerType,
        participantCount: session.participants.length
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to add volunteer: ${(error as Error).message}`);
    }
  }

  /**
   * Process secure message in crisis session
   */
  public async processSecureMessage(
    sessionId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'system' | 'emergency' = 'text'
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Verify sender is participant
      const sender = session.participants.find(p => p.id === senderId);
      if (!sender) {
        throw new Error('Unauthorized sender');
      }

      // Update participant activity
      sender.lastActivity = new Date();
      session.lastActivity = new Date();
      session.messageCount++;

      // Map sender type to expected format
      const mappedSenderType = sender.type === 'supervisor' ? 'system' :
                              sender.type === 'ai_assistant' ? 'ai' :
                              sender.type; // user and volunteer map directly
      
      // Process message through crisis security
      const processedMessage = await this.crisisSecurity.processMessage(
        sessionId,
        senderId,
        mappedSenderType,
        content
      );

      // Handle risk detection
      if (processedMessage.riskLevel === 'high' || processedMessage.riskLevel === 'critical') {
        session.riskFlags.push(`${processedMessage.riskLevel}_risk_detected`);
        
        if (processedMessage.riskLevel === 'critical') {
          await this.escalateToEmergency(sessionId, 'critical_message');
        }
        
        // Update session severity
        if (processedMessage.riskLevel === 'critical') {
          session.severity = 'critical';
        } else if (processedMessage.riskLevel === 'high' && session.severity !== 'critical') {
          session.severity = 'high';
        }
      }

      // Check auto-escalation threshold
      const highRiskFlags = session.riskFlags.filter(flag => 
        flag.includes('high_risk') || flag.includes('critical_risk')
      ).length;

      if (highRiskFlags >= this.config.autoEscalationThreshold && session.status !== 'escalated') {
        await this.escalateToEmergency(sessionId, 'auto_escalation_threshold');
      }

      // Emit message processed event
      this.emit('message_processed', {
        sessionId,
        senderId,
        messageType,
        riskLevel: processedMessage.riskLevel,
        encrypted: processedMessage.encrypted,
        flagged: processedMessage.flagged
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to process message: ${(error as Error).message}`);
    }
  }

  /**
   * Escalate session to emergency status
   */
  public async escalateToEmergency(
    sessionId: string,
    reason: string,
    escalatedBy?: string
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'escalated';
      session.severity = 'critical';
      session.emergencyEscalations++;
      session.lastActivity = new Date();

      // Add emergency escalation flag
      session.riskFlags.push(`emergency_escalated:${reason}`);

      // Add emergency services as participant
      const emergencyServices: SessionParticipant = {
        id: 'emergency_services',
        type: 'supervisor',
        role: 'emergency_contact',
        anonymous: false,
        encrypted: session.encrypted,
        joinedAt: new Date(),
        lastActivity: new Date(),
        permissions: ['view_all', 'contact_authorities', 'preserve_evidence']
      };

      session.participants.push(emergencyServices);

      // Emit emergency escalation event
      this.emit('emergency_escalated', {
        sessionId,
        reason,
        escalatedBy: escalatedBy || 'system',
        severity: session.severity,
        participantCount: session.participants.length,
        riskFlags: session.riskFlags
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to escalate to emergency: ${(error as Error).message}`);
    }
  }

  /**
   * End crisis session securely
   */
  public async endSecureSession(
    sessionId: string,
    endedBy: string,
    reason: string = 'session_complete'
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Verify ending permissions
      const participant = session.participants.find(p => p.id === endedBy);
      if (!participant || !participant.permissions.includes('end_session')) {
        throw new Error('Insufficient permissions to end session');
      }

      session.status = 'ended';
      session.endTime = new Date();
      session.lastActivity = new Date();

      // Calculate session duration
      const duration = session.endTime.getTime() - session.startTime.getTime();

      // Emit session ended event
      this.emit('session_ended', {
        sessionId,
        endedBy,
        reason,
        duration,
        messageCount: session.messageCount,
        severity: session.severity,
        escalated: session.emergencyEscalations > 0,
        encrypted: session.encrypted
      });

      // Remove from active sessions (will be cleaned up automatically for ephemeral sessions)
      if (!session.riskFlags.includes('preserve_evidence')) {
        setTimeout(() => {
          this.activeSessions.delete(sessionId);
        }, 5 * 60 * 1000); // Keep for 5 minutes before removal
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to end session: ${(error as Error).message}`);
    }
  }

  /**
   * Get session data (with access control)
   */
  public getSessionData(
    sessionId: string,
    requesterId: string,
    requesterRole: string
  ): CrisisSessionData | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Check access permissions
    const isParticipant = session.participants.some(p => p.id === requesterId);
    const isAuthorized = isParticipant || 
                        requesterRole === 'admin' || 
                        requesterRole === 'supervisor';

    if (!isAuthorized) {
      return null;
    }

    // Return session data (potentially filtered based on permissions)
    return session;
  }

  /**
   * Get active sessions summary
   */
  public getActiveSessionsSummary(): any {
    const sessions = Array.from(this.activeSessions.values());
    
    return {
      total: sessions.length,
      byStatus: {
        active: sessions.filter(s => s.status === 'active').length,
        escalated: sessions.filter(s => s.status === 'escalated').length,
        resolved: sessions.filter(s => s.status === 'resolved').length
      },
      bySeverity: {
        low: sessions.filter(s => s.severity === 'low').length,
        medium: sessions.filter(s => s.severity === 'medium').length,
        high: sessions.filter(s => s.severity === 'high').length,
        critical: sessions.filter(s => s.severity === 'critical').length
      },
      encrypted: sessions.filter(s => s.encrypted).length,
      anonymous: sessions.filter(s => 
        s.participants.some(p => p.anonymous)
      ).length
    };
  }

  /**
   * Start session cleanup process
   */
  private startSessionCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expired = [];

    for (const [sessionId, session] of this.activeSessions) {
      const sessionAge = now - session.startTime.getTime();
      const inactiveTime = now - session.lastActivity.getTime();

      // Remove if max duration exceeded or inactive for too long
      const shouldCleanup = 
        sessionAge > this.config.maxSessionDuration ||
        (inactiveTime > 30 * 60 * 1000 && session.status === 'ended') || // 30 min after end
        (inactiveTime > 60 * 60 * 1000 && session.status === 'active'); // 1 hour inactive

      if (shouldCleanup && !session.riskFlags.includes('preserve_evidence')) {
        expired.push(sessionId);
      }
    }

    expired.forEach(sessionId => {
      const session = this.activeSessions.get(sessionId);
      if (session && session.status !== 'escalated') {
        this.activeSessions.delete(sessionId);
        
        this.emit('session_cleaned', {
          sessionId,
          reason: 'expired',
          duration: Date.now() - session.startTime.getTime()
        });
      }
    });
  }

  /**
   * Utility methods
   */
  private hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + 'crisis_salt').digest('hex').substring(0, 16);
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.activeSessions.clear();
    this.removeAllListeners();
  }
}

export default CrisisSessionManager;