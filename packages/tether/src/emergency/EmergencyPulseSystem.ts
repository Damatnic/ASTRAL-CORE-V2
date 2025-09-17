/**
 * ASTRAL_CORE 2.0 Emergency Pulse System
 * Handles critical emergency signals through tether connections
 */

import type { TetherEmergencyTrigger } from '../types/tether.types';

export interface EmergencyPulse {
  id: string;
  tetherId: string;
  triggerUserId: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  emergencyType: 'MENTAL_HEALTH_CRISIS' | 'SAFETY_CONCERN' | 'MEDICAL_EMERGENCY' | 'OTHER';
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  triggeredAt: Date;
  acknowledgedAt?: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  responderIds: string[];
  escalated: boolean;
  escalatedAt?: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'ESCALATED';
}

export interface EmergencyResponse {
  pulseId: string;
  responderId: string;
  responseTime: number; // milliseconds
  actionTaken: string;
  additionalResources?: string[];
  followUpRequired: boolean;
  notes?: string;
}

export class EmergencyPulseSystem {
  private activePulses: Map<string, EmergencyPulse> = new Map();
  private responseHistory: Map<string, EmergencyResponse[]> = new Map();
  private emergencyContacts: Map<string, string[]> = new Map(); // userId -> contact list

  /**
   * Activate emergency pulse - CRITICAL <50ms target
   */
  async activateEmergencyPulse(
    tetherId: string, 
    emergencyData: TetherEmergencyTrigger
  ): Promise<{ pulseId: string; responseTime: number }> {
    const startTime = performance.now();
    
    try {
      const pulseId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const emergencyPulse: EmergencyPulse = {
        id: pulseId,
        tetherId,
        triggerUserId: emergencyData.triggerUserId,
        urgencyLevel: emergencyData.urgencyLevel || 'HIGH',
        emergencyType: emergencyData.type,
        message: emergencyData.message,
        location: emergencyData.location,
        triggeredAt: new Date(),
        responderIds: [],
        escalated: false,
        status: 'ACTIVE'
      };

      // Store active pulse
      this.activePulses.set(pulseId, emergencyPulse);

      // Immediately notify emergency responders
      await this.notifyEmergencyResponders(emergencyPulse);

      // Start escalation timer for critical situations
      if (emergencyPulse.urgencyLevel === 'CRITICAL') {
        this.scheduleEscalation(pulseId, 30000); // 30 seconds for critical
      } else if (emergencyPulse.urgencyLevel === 'HIGH') {
        this.scheduleEscalation(pulseId, 120000); // 2 minutes for high
      }

      const responseTime = performance.now() - startTime;
      
      if (responseTime > 50) {
        console.error(`🔴 CRITICAL: Emergency pulse activation took ${responseTime.toFixed(2)}ms (target: <50ms)`);
      } else {
        console.log(`🚨 Emergency pulse activated: ${pulseId} (${responseTime.toFixed(2)}ms)`);
      }

      return { pulseId, responseTime };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error('❌ Failed to activate emergency pulse:', error);
      throw new Error(`Emergency pulse activation failed after ${responseTime.toFixed(2)}ms`);
    }
  }

  /**
   * Acknowledge emergency pulse by responder
   */
  async acknowledgePulse(pulseId: string, responderId: string): Promise<void> {
    const pulse = this.activePulses.get(pulseId);
    if (!pulse) {
      throw new Error('Emergency pulse not found');
    }

    pulse.acknowledgedAt = new Date();
    pulse.status = 'ACKNOWLEDGED';
    pulse.responderIds.push(responderId);

    this.activePulses.set(pulseId, pulse);

    console.log(`✅ Emergency pulse acknowledged: ${pulseId} by ${responderId}`);
  }

  /**
   * Record emergency response
   */
  async recordResponse(
    pulseId: string, 
    responderId: string, 
    response: Omit<EmergencyResponse, 'pulseId' | 'responderId' | 'responseTime'>
  ): Promise<void> {
    const pulse = this.activePulses.get(pulseId);
    if (!pulse) {
      throw new Error('Emergency pulse not found');
    }

    const responseTime = pulse.acknowledgedAt 
      ? Date.now() - pulse.acknowledgedAt.getTime()
      : Date.now() - pulse.triggeredAt.getTime();

    const emergencyResponse: EmergencyResponse = {
      pulseId,
      responderId,
      responseTime,
      ...response
    };

    // Store response
    const responses = this.responseHistory.get(pulseId) || [];
    responses.push(emergencyResponse);
    this.responseHistory.set(pulseId, responses);

    // Update pulse status
    pulse.respondedAt = new Date();
    pulse.status = 'RESPONDING';
    this.activePulses.set(pulseId, pulse);

    console.log(`📝 Emergency response recorded: ${pulseId} by ${responderId}`);
  }

  /**
   * Resolve emergency pulse
   */
  async resolvePulse(
    pulseId: string, 
    responderId: string, 
    resolution: {
      outcome: 'RESOLVED' | 'REFERRED' | 'ESCALATED';
      notes?: string;
      followUpRequired?: boolean;
      referralInfo?: string;
    }
  ): Promise<void> {
    const pulse = this.activePulses.get(pulseId);
    if (!pulse) {
      throw new Error('Emergency pulse not found');
    }

    pulse.resolvedAt = new Date();
    pulse.status = 'RESOLVED';

    // If escalated, mark as such
    if (resolution.outcome === 'ESCALATED') {
      pulse.escalated = true;
      pulse.escalatedAt = new Date();
      pulse.status = 'ESCALATED';
    }

    this.activePulses.set(pulseId, pulse);

    // Archive resolved pulse (remove from active)
    setTimeout(() => {
      this.activePulses.delete(pulseId);
    }, 300000); // Keep for 5 minutes after resolution

    console.log(`✅ Emergency pulse resolved: ${pulseId} - ${resolution.outcome}`);
  }

  /**
   * Notify emergency responders
   */
  private async notifyEmergencyResponders(pulse: EmergencyPulse): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Find available emergency responders
      // 2. Send push notifications
      // 3. Send SMS/email for critical situations
      // 4. Activate location-based emergency services if needed

      console.log(`🚨 Notifying emergency responders for pulse: ${pulse.id}`);
      console.log(`   Type: ${pulse.emergencyType}`);
      console.log(`   Urgency: ${pulse.urgencyLevel}`);
      console.log(`   Message: ${pulse.message || 'No message provided'}`);

      // Simulate notification delay
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error('❌ Failed to notify emergency responders:', error);
    }
  }

  /**
   * Schedule automatic escalation if no response
   */
  private scheduleEscalation(pulseId: string, delayMs: number): void {
    setTimeout(async () => {
      const pulse = this.activePulses.get(pulseId);
      if (!pulse || pulse.status !== 'ACTIVE') {
        return; // Already handled
      }

      console.warn(`⚠️ Auto-escalating emergency pulse: ${pulseId} (no response after ${delayMs}ms)`);
      
      try {
        await this.escalateEmergency(pulseId);
      } catch (error) {
        console.error('❌ Failed to escalate emergency:', error);
      }
    }, delayMs);
  }

  /**
   * Escalate emergency to higher-level responders
   */
  async escalateEmergency(pulseId: string): Promise<void> {
    const pulse = this.activePulses.get(pulseId);
    if (!pulse) {
      throw new Error('Emergency pulse not found');
    }

    pulse.escalated = true;
    pulse.escalatedAt = new Date();
    pulse.status = 'ESCALATED';
    this.activePulses.set(pulseId, pulse);

    // In a real implementation, this would:
    // 1. Contact professional crisis services
    // 2. Notify emergency contacts
    // 3. Alert local emergency services if location available
    // 4. Activate backup response protocols

    console.log(`🔴 Emergency escalated: ${pulseId}`);
  }

  /**
   * Get active emergency pulses
   */
  getActivePulses(): EmergencyPulse[] {
    return Array.from(this.activePulses.values())
      .sort((a, b) => {
        // Sort by urgency level and time
        const urgencyOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
        if (urgencyDiff !== 0) return urgencyDiff;
        
        return a.triggeredAt.getTime() - b.triggeredAt.getTime(); // Oldest first
      });
  }

  /**
   * Get emergency pulse by ID
   */
  getPulse(pulseId: string): EmergencyPulse | undefined {
    return this.activePulses.get(pulseId);
  }

  /**
   * Get emergency response history
   */
  getResponseHistory(pulseId: string): EmergencyResponse[] {
    return this.responseHistory.get(pulseId) || [];
  }

  /**
   * Get emergency statistics
   */
  getEmergencyStats(): {
    activePulses: number;
    criticalPulses: number;
    averageResponseTime: number;
    escalationRate: number;
    resolutionRate: number;
  } {
    const activePulses = this.activePulses.size;
    const criticalPulses = Array.from(this.activePulses.values())
      .filter(p => p.urgencyLevel === 'CRITICAL').length;

    // Calculate average response time from history
    const allResponses = Array.from(this.responseHistory.values()).flat();
    const averageResponseTime = allResponses.length > 0
      ? allResponses.reduce((sum, r) => sum + r.responseTime, 0) / allResponses.length
      : 0;

    // Calculate escalation rate
    const totalPulses = this.activePulses.size + this.responseHistory.size;
    const escalatedPulses = Array.from(this.activePulses.values())
      .filter(p => p.escalated).length;
    const escalationRate = totalPulses > 0 ? (escalatedPulses / totalPulses) * 100 : 0;

    // Calculate resolution rate
    const resolvedPulses = Array.from(this.activePulses.values())
      .filter(p => p.status === 'RESOLVED').length;
    const resolutionRate = totalPulses > 0 ? (resolvedPulses / totalPulses) * 100 : 0;

    return {
      activePulses,
      criticalPulses,
      averageResponseTime: Math.round(averageResponseTime),
      escalationRate: Math.round(escalationRate * 100) / 100,
      resolutionRate: Math.round(resolutionRate * 100) / 100
    };
  }

  /**
   * Register emergency contact for user
   */
  registerEmergencyContact(userId: string, contactInfo: string): void {
    const contacts = this.emergencyContacts.get(userId) || [];
    if (!contacts.includes(contactInfo)) {
      contacts.push(contactInfo);
      this.emergencyContacts.set(userId, contacts);
    }
  }

  /**
   * Get emergency contacts for user
   */
  getEmergencyContacts(userId: string): string[] {
    return this.emergencyContacts.get(userId) || [];
  }

  /**
   * Check for stale emergency pulses and auto-escalate
   */
  async checkStaleEmergencies(): Promise<void> {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [pulseId, pulse] of this.activePulses.entries()) {
      if (pulse.status === 'ACTIVE' && 
          now - pulse.triggeredAt.getTime() > staleThreshold) {
        
        console.warn(`⚠️ Stale emergency pulse detected: ${pulseId}`);
        await this.escalateEmergency(pulseId);
      }
    }
  }

  /**
   * Generate emergency analytics report
   */
  generateEmergencyReport(): {
    totalEmergencies: number;
    byUrgencyLevel: Record<string, number>;
    byType: Record<string, number>;
    averageResponseTime: number;
    escalationRate: number;
    resolutionRate: number;
    criticalMetrics: {
      under30Seconds: number;
      under2Minutes: number;
      over5Minutes: number;
    };
  } {
    const allPulses = Array.from(this.activePulses.values());
    const totalEmergencies = allPulses.length + this.responseHistory.size;

    // Count by urgency level
    const byUrgencyLevel = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    // Count by type
    const byType = {
      MENTAL_HEALTH_CRISIS: 0,
      SAFETY_CONCERN: 0,
      MEDICAL_EMERGENCY: 0,
      OTHER: 0
    };

    allPulses.forEach(pulse => {
      byUrgencyLevel[pulse.urgencyLevel]++;
      byType[pulse.emergencyType]++;
    });

    // Calculate response time metrics
    const allResponses = Array.from(this.responseHistory.values()).flat();
    const averageResponseTime = allResponses.length > 0
      ? allResponses.reduce((sum, r) => sum + r.responseTime, 0) / allResponses.length
      : 0;

    const criticalMetrics = {
      under30Seconds: allResponses.filter(r => r.responseTime < 30000).length,
      under2Minutes: allResponses.filter(r => r.responseTime < 120000).length,
      over5Minutes: allResponses.filter(r => r.responseTime > 300000).length
    };

    const escalatedCount = allPulses.filter(p => p.escalated).length;
    const resolvedCount = allPulses.filter(p => p.status === 'RESOLVED').length;

    return {
      totalEmergencies,
      byUrgencyLevel,
      byType,
      averageResponseTime: Math.round(averageResponseTime),
      escalationRate: totalEmergencies > 0 ? (escalatedCount / totalEmergencies) * 100 : 0,
      resolutionRate: totalEmergencies > 0 ? (resolvedCount / totalEmergencies) * 100 : 0,
      criticalMetrics
    };
  }

  /**
   * Test emergency system functionality
   */
  async testEmergencySystem(): Promise<{
    success: boolean;
    responseTime: number;
    errors: string[];
  }> {
    const startTime = performance.now();
    const errors: string[] = [];

    try {
      // Test emergency pulse creation
      const testPulse = await this.activateEmergencyPulse('test-tether', {
        triggerUserId: 'test-user',
        urgencyLevel: 'LOW',
        type: 'OTHER',
        message: 'Emergency system test'
      });

      // Test acknowledgment
      await this.acknowledgePulse(testPulse.pulseId, 'test-responder');

      // Test response recording
      await this.recordResponse(testPulse.pulseId, 'test-responder', {
        actionTaken: 'System test completed',
        followUpRequired: false,
        notes: 'Automated test'
      });

      // Test resolution
      await this.resolvePulse(testPulse.pulseId, 'test-responder', {
        outcome: 'RESOLVED',
        notes: 'Test completed successfully'
      });

      const responseTime = performance.now() - startTime;
      
      return {
        success: true,
        responseTime,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        responseTime: performance.now() - startTime,
        errors
      };
    }
  }

  /**
   * Cleanup resolved emergencies older than 24 hours
   */
  cleanupOldEmergencies(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [pulseId, pulse] of this.activePulses.entries()) {
      if (pulse.status === 'RESOLVED' && 
          pulse.resolvedAt && 
          pulse.resolvedAt.getTime() < cutoffTime) {
        
        this.activePulses.delete(pulseId);
        console.log(`🧹 Cleaned up old emergency pulse: ${pulseId}`);
      }
    }
  }
}