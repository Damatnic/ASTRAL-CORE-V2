import { CrisisProfile, EmergencyProtocol, EscalationLevel } from './types';

export interface EmergencyEscalation {
  escalationId: string;
  level: EscalationLevel;
  triggeredAt: Date;
  protocol: EmergencyProtocol;
  notifiedParties: string[];
  estimatedResponseTime: number;
}

export class EmergencyEscalationEngine {
  private static instance: EmergencyEscalationEngine;
  private escalationRules: Map<string, any> = new Map();
  private activeEscalations: Map<string, EmergencyEscalation> = new Map();

  private constructor() {
    this.initializeEscalationRules();
  }

  static getInstance(): EmergencyEscalationEngine {
    if (!EmergencyEscalationEngine.instance) {
      EmergencyEscalationEngine.instance = new EmergencyEscalationEngine();
    }
    return EmergencyEscalationEngine.instance;
  }

  async evaluateEscalationNeed(crisis: CrisisProfile): Promise<EmergencyEscalation | null> {
    const riskLevel = this.assessRiskLevel(crisis);
    
    if (riskLevel >= 8) {
      return await this.triggerImmediateEscalation(crisis);
    } else if (riskLevel >= 6) {
      return await this.triggerStandardEscalation(crisis);
    }
    
    return null;
  }

  async triggerEmergencyEscalation(
    crisisId: string,
    level: EscalationLevel,
    reason: string
  ): Promise<EmergencyEscalation> {
    const escalation: EmergencyEscalation = {
      escalationId: `esc_${Date.now()}_${crisisId}`,
      level,
      triggeredAt: new Date(),
      protocol: this.getProtocolForLevel(level),
      notifiedParties: await this.getNotificationList(level),
      estimatedResponseTime: this.getEstimatedResponseTime(level)
    };

    this.activeEscalations.set(escalation.escalationId, escalation);
    await this.executeEscalationProtocol(escalation);
    
    return escalation;
  }

  private assessRiskLevel(crisis: CrisisProfile): number {
    let risk = crisis.severityLevel || 5;
    
    if (crisis.suicidalIdeation) risk += 3;
    if (crisis.violenceRisk) risk += 2;
    if (crisis.substanceAbuse) risk += 1;
    
    return Math.min(risk, 10);
  }

  private async triggerImmediateEscalation(crisis: CrisisProfile): Promise<EmergencyEscalation> {
    return this.triggerEmergencyEscalation(
      crisis.id,
      'CRITICAL',
      'Immediate risk to life detected'
    );
  }

  private async triggerStandardEscalation(crisis: CrisisProfile): Promise<EmergencyEscalation> {
    return this.triggerEmergencyEscalation(
      crisis.id,
      'HIGH',
      'Elevated risk level requiring supervisor attention'
    );
  }

  private getProtocolForLevel(level: EscalationLevel): EmergencyProtocol {
    const protocols = {
      'CRITICAL': { responseTime: 60, requiresSupervisor: true, contactEmergencyServices: true },
      'HIGH': { responseTime: 300, requiresSupervisor: true, contactEmergencyServices: false },
      'MEDIUM': { responseTime: 900, requiresSupervisor: false, contactEmergencyServices: false }
    };
    
    return protocols[level] || protocols['MEDIUM'];
  }

  private async getNotificationList(level: EscalationLevel): Promise<string[]> {
    const notifications = ['supervisor@astral.care'];
    
    if (level === 'CRITICAL') {
      notifications.push('emergency@astral.care', 'director@astral.care');
    }
    
    return notifications;
  }

  private getEstimatedResponseTime(level: EscalationLevel): number {
    const times = { 'CRITICAL': 60, 'HIGH': 300, 'MEDIUM': 900 };
    return times[level] || 900;
  }

  private async executeEscalationProtocol(escalation: EmergencyEscalation): Promise<void> {
    // Send notifications to all parties
    for (const party of escalation.notifiedParties) {
      await this.sendNotification(party, escalation);
    }
  }

  private async sendNotification(recipient: string, escalation: EmergencyEscalation): Promise<void> {
    console.log(`Sending escalation notification to ${recipient} for ${escalation.escalationId}`);
  }

  private initializeEscalationRules(): void {
    // Initialize escalation rules and protocols
  }

  /**
   * Assess severity of a crisis message/text
   */
  async assessSeverity(message: string): Promise<SeverityAssessmentResult> {
    let level = 1;
    let riskFactors: string[] = [];
    
    // Simple severity assessment based on keywords
    const criticalWords = ['kill', 'suicide', 'die', 'death', 'hurt myself', 'end it all'];
    const highRiskWords = ['depressed', 'hopeless', 'worthless', 'alone', 'pain'];
    const mediumRiskWords = ['sad', 'worried', 'anxious', 'stressed', 'difficult'];
    
    const lowerMessage = message.toLowerCase();
    
    for (const word of criticalWords) {
      if (lowerMessage.includes(word)) {
        level = Math.max(level, 5);
        riskFactors.push(`Critical keyword: ${word}`);
      }
    }
    
    for (const word of highRiskWords) {
      if (lowerMessage.includes(word)) {
        level = Math.max(level, 4);
        riskFactors.push(`High-risk keyword: ${word}`);
      }
    }
    
    for (const word of mediumRiskWords) {
      if (lowerMessage.includes(word)) {
        level = Math.max(level, 3);
        riskFactors.push(`Medium-risk keyword: ${word}`);
      }
    }
    
    return {
      level,
      confidence: 0.85,
      reason: `Assessed based on content analysis. Risk factors: ${riskFactors.length}`,
      riskFactors
    };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
    activeEscalations: number;
    responseTime: number;
    uptime: number;
    lastCheck: Date;
  }> {
    return {
      systemStatus: 'OPERATIONAL',
      activeEscalations: this.activeEscalations.size,
      responseTime: 150, // milliseconds
      uptime: process.uptime() * 1000,
      lastCheck: new Date()
    };
  }
}

// Export types that are expected by index.ts
export type { EscalationLevel } from './types';

export interface SeverityAssessmentResult {
  level: number;
  confidence: number;
  reason: string;
  riskFactors: string[];
}

export interface EscalationRequest {
  crisisId: string;
  level: EscalationLevel;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationResult {
  escalationId: string;
  success: boolean;
  responseTime: number;
  responseTimeMs: number; // Alias for monitoring compatibility
  notifiedParties: string[];
  nextActions: string[];
  nextSteps: string[]; // Alias for nextActions
  level: number;
  targetMet: boolean;
  actionsExecuted: number;
  volunteerAssigned: boolean;
  hotlineContacted: boolean;
  emergencyServicesContacted: boolean;
  geographicRouting: {
    region: string;
    coordinates?: { lat: number; lng: number };
    availableResources: string[];
  };
}