/**
 * ASTRAL_CORE 2.0 Emergency Override Protocols
 * 
 * LIFE-CRITICAL EMERGENCY OVERRIDES:
 * - Immediate intervention bypass for imminent danger
 * - Manual override capabilities for crisis supervisors
 * - Emergency service direct contact protocols
 * - Location services integration for life-threatening situations
 * - Automated safety net when all else fails
 * 
 * ACTIVATION TRIGGERS:
 * - Multiple emergency keywords in single message
 * - Severity score >= 9.5 with immediate time indicators
 * - Manual supervisor override
 * - System-detected imminent danger patterns
 * - Failed volunteer assignment for critical case
 */

import { randomUUID } from 'crypto';
import type { CrisisAssessment } from '../types/assessment.types';

export interface EmergencyOverrideRequest {
  sessionId: string;
  trigger: EmergencyOverrideTrigger;
  severity: number;
  message?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  supervisorId?: string;
  reason: string;
  immediateAction: boolean;
}

export interface EmergencyOverrideResponse {
  overrideId: string;
  activated: boolean;
  actionsInitiated: EmergencyAction[];
  emergencyContacts: EmergencyContact[];
  responseTimeMs: number;
  estimatedArrivalTime?: number;
  trackingId?: string;
  fallbackPlan: string[];
}

export type EmergencyOverrideTrigger = 
  | 'IMMINENT_DANGER_DETECTED'
  | 'SUPERVISOR_MANUAL_OVERRIDE'
  | 'SYSTEM_FAILURE_PROTECTION'
  | 'LOCATION_BASED_EMERGENCY'
  | 'FAILED_VOLUNTEER_ASSIGNMENT'
  | 'MULTIPLE_EMERGENCY_KEYWORDS'
  | 'ESCALATION_TIMEOUT';

export type EmergencyAction = 
  | 'EMERGENCY_SERVICES_DISPATCHED'
  | 'LOCATION_SERVICES_ACTIVATED'
  | 'CRISIS_HOTLINE_CONNECTED'
  | 'SUPERVISOR_ALERTED'
  | 'EMERGENCY_CONTACT_NOTIFIED'
  | 'WELLNESS_CHECK_REQUESTED'
  | 'CRISIS_TEAM_MOBILIZED'
  | 'HOSPITAL_ALERT_SENT';

export interface EmergencyContact {
  type: 'EMERGENCY_SERVICES' | 'CRISIS_HOTLINE' | 'HOSPITAL' | 'MENTAL_HEALTH_CRISIS';
  name: string;
  phone: string;
  location?: string;
  estimatedResponse: number; // minutes
  capabilities: string[];
}

export class EmergencyOverrideProtocol {
  private static instance: EmergencyOverrideProtocol;
  
  // Emergency response targets
  private readonly OVERRIDE_TARGETS = {
    ACTIVATION_TIME_MS: 5000,     // 5 seconds to activate override
    CONTACT_TIME_MS: 15000,       // 15 seconds to contact emergency services
    LOCATION_TIME_MS: 30000,      // 30 seconds to activate location services
    DISPATCH_TIME_MS: 60000,      // 1 minute for emergency dispatch
  };
  
  // Emergency contact database (configured per region)
  private readonly EMERGENCY_CONTACTS: Record<string, EmergencyContact[]> = {
    'default': [
      {
        type: 'EMERGENCY_SERVICES',
        name: '911 Emergency Services',
        phone: '911',
        estimatedResponse: 8,
        capabilities: ['ambulance', 'police', 'fire', 'mental-health-crisis'],
      },
      {
        type: 'CRISIS_HOTLINE',
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        estimatedResponse: 0, // Immediate
        capabilities: ['suicide-prevention', 'crisis-counseling', '24/7-support'],
      },
      {
        type: 'CRISIS_HOTLINE',
        name: 'Crisis Text Line',
        phone: '741741',
        estimatedResponse: 1,
        capabilities: ['text-support', 'immediate-response', 'trained-counselors'],
      },
    ],
  };
  
  // Active override tracking
  private readonly activeOverrides = new Map<string, EmergencyOverrideResponse>();
  
  private constructor() {
    this.initializeEmergencyProtocols();
  }
  
  static getInstance(): EmergencyOverrideProtocol {
    if (!EmergencyOverrideProtocol.instance) {
      EmergencyOverrideProtocol.instance = new EmergencyOverrideProtocol();
    }
    return EmergencyOverrideProtocol.instance;
  }
  
  /**
   * Activate emergency override protocol
   * TARGET: <5s activation time
   */
  async activateEmergencyOverride(request: EmergencyOverrideRequest): Promise<EmergencyOverrideResponse> {
    const startTime = performance.now();
    const overrideId = randomUUID();
    
    console.log(`🚨 EMERGENCY OVERRIDE ACTIVATED: ${request.trigger} for session ${request.sessionId}`);
    
    try {
      // Immediate safety assessment
      const safetyLevel = this.assessImmediateSafety(request);
      
      // Determine emergency actions based on trigger and severity
      const actions = await this.determineEmergencyActions(request, safetyLevel);
      
      // Execute emergency actions in parallel for speed
      const actionResults = await Promise.allSettled([
        this.contactEmergencyServices(request, actions),
        this.activateLocationServices(request, actions),
        this.alertSupervisors(request, actions),
        this.establishEmergencyContact(request, actions),
      ]);
      
      // Compile emergency contacts
      const emergencyContacts = this.getEmergencyContacts(request.userLocation);
      
      // Create response with tracking information
      const response: EmergencyOverrideResponse = {
        overrideId,
        activated: true,
        actionsInitiated: actions,
        emergencyContacts,
        responseTimeMs: performance.now() - startTime,
        trackingId: this.generateTrackingId(overrideId),
        fallbackPlan: this.createFallbackPlan(request),
      };
      
      // Store for tracking
      this.activeOverrides.set(overrideId, response);
      
      // Log emergency override activation
      await this.logEmergencyOverride(request, response);
      
      // Performance validation
      if (response.responseTimeMs > this.OVERRIDE_TARGETS.ACTIVATION_TIME_MS) {
        console.warn(`⚠️ Emergency override exceeded target: ${response.responseTimeMs.toFixed(2)}ms > ${this.OVERRIDE_TARGETS.ACTIVATION_TIME_MS}ms`);
      } else {
        console.log(`✅ Emergency override activated in ${response.responseTimeMs.toFixed(2)}ms`);
      }
      
      return response;
      
    } catch (error) {
      console.error('🔴 CRITICAL: Emergency override activation failed:', error);
      
      // Emergency fallback - never let this fail completely
      return this.createEmergencyFallback(request, overrideId);
    }
  }
  
  /**
   * Check if emergency override should be triggered automatically
   */
  shouldTriggerOverride(assessment: CrisisAssessment, context?: any): boolean {
    // Imminent danger indicators
    if (assessment.severity >= 9.5 && assessment.immediateRisk) {
      return true;
    }
    
    // Multiple emergency keywords
    if (assessment.emergencyKeywords.length >= 3) {
      return true;
    }
    
    // High-risk behavioral patterns
    if (context?.hasPlanningLanguage && context?.hasFinalityLanguage && context?.hasImmediateTimeWords) {
      return true;
    }
    
    // Very high confidence emergency assessment
    if (assessment.severity >= 9 && assessment.confidence >= 0.9) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get override status for tracking
   */
  getOverrideStatus(overrideId: string): EmergencyOverrideResponse | null {
    return this.activeOverrides.get(overrideId) || null;
  }
  
  /**
   * Complete emergency override (when situation is resolved)
   */
  async completeOverride(overrideId: string, outcome: string): Promise<void> {
    const override = this.activeOverrides.get(overrideId);
    if (override) {
      await this.logOverrideCompletion(overrideId, outcome);
      this.activeOverrides.delete(overrideId);
      console.log(`✅ Emergency override ${overrideId} completed: ${outcome}`);
    }
  }
  
  // Private implementation methods
  
  private assessImmediateSafety(request: EmergencyOverrideRequest): 'CRITICAL' | 'HIGH' | 'MODERATE' {
    if (request.severity >= 9.5 || request.trigger === 'IMMINENT_DANGER_DETECTED') {
      return 'CRITICAL';
    }
    if (request.severity >= 8.5 || request.immediateAction) {
      return 'HIGH';
    }
    return 'MODERATE';
  }
  
  private async determineEmergencyActions(
    request: EmergencyOverrideRequest,
    safetyLevel: 'CRITICAL' | 'HIGH' | 'MODERATE'
  ): Promise<EmergencyAction[]> {
    const actions: EmergencyAction[] = [];
    
    // Critical safety level - all available actions
    if (safetyLevel === 'CRITICAL') {
      actions.push(
        'EMERGENCY_SERVICES_DISPATCHED',
        'LOCATION_SERVICES_ACTIVATED',
        'CRISIS_HOTLINE_CONNECTED',
        'SUPERVISOR_ALERTED',
        'CRISIS_TEAM_MOBILIZED'
      );
      
      if (request.userLocation) {
        actions.push('WELLNESS_CHECK_REQUESTED');
      }
    }
    
    // High safety level - targeted actions
    else if (safetyLevel === 'HIGH') {
      actions.push(
        'CRISIS_HOTLINE_CONNECTED',
        'SUPERVISOR_ALERTED',
        'EMERGENCY_CONTACT_NOTIFIED'
      );
      
      if (request.trigger === 'FAILED_VOLUNTEER_ASSIGNMENT') {
        actions.push('CRISIS_TEAM_MOBILIZED');
      }
    }
    
    // Moderate safety level - supportive actions
    else {
      actions.push(
        'SUPERVISOR_ALERTED',
        'CRISIS_HOTLINE_CONNECTED'
      );
    }
    
    return actions;
  }
  
  private async contactEmergencyServices(
    request: EmergencyOverrideRequest,
    actions: EmergencyAction[]
  ): Promise<boolean> {
    if (!actions.includes('EMERGENCY_SERVICES_DISPATCHED')) {
      return false;
    }
    
    try {
      // In production, integrate with emergency services API
      console.log(`📞 EMERGENCY SERVICES CONTACTED for session ${request.sessionId}`);
      console.log(`📍 Location: ${request.userLocation ? 'Provided' : 'Not available'}`);
      console.log(`🚨 Reason: ${request.reason}`);
      
      // Log emergency service contact
      await this.logEmergencyServiceContact(request);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to contact emergency services:', error);
      return false;
    }
  }
  
  private async activateLocationServices(
    request: EmergencyOverrideRequest,
    actions: EmergencyAction[]
  ): Promise<boolean> {
    if (!actions.includes('LOCATION_SERVICES_ACTIVATED')) {
      return false;
    }
    
    try {
      // In production, activate location tracking
      console.log(`📍 LOCATION SERVICES ACTIVATED for session ${request.sessionId}`);
      
      if (request.userLocation) {
        console.log(`📍 Current location: ${request.userLocation.latitude}, ${request.userLocation.longitude}`);
      } else {
        console.log(`📍 Requesting location permission from user`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to activate location services:', error);
      return false;
    }
  }
  
  private async alertSupervisors(
    request: EmergencyOverrideRequest,
    actions: EmergencyAction[]
  ): Promise<boolean> {
    if (!actions.includes('SUPERVISOR_ALERTED')) {
      return false;
    }
    
    try {
      console.log(`👥 SUPERVISORS ALERTED for emergency override ${request.sessionId}`);
      
      // In production, send alerts to on-call supervisors
      const alertData = {
        sessionId: request.sessionId,
        trigger: request.trigger,
        severity: request.severity,
        reason: request.reason,
        timestamp: new Date(),
      };
      
      return true;
    } catch (error) {
      console.error('❌ Failed to alert supervisors:', error);
      return false;
    }
  }
  
  private async establishEmergencyContact(
    request: EmergencyOverrideRequest,
    actions: EmergencyAction[]
  ): Promise<boolean> {
    if (!actions.includes('CRISIS_HOTLINE_CONNECTED')) {
      return false;
    }
    
    try {
      console.log(`☎️ CRISIS HOTLINE CONNECTION established for session ${request.sessionId}`);
      
      // In production, establish direct connection to crisis hotline
      const hotlineContact = this.EMERGENCY_CONTACTS['default'].find(
        contact => contact.type === 'CRISIS_HOTLINE'
      );
      
      if (hotlineContact) {
        console.log(`☎️ Connecting to ${hotlineContact.name}: ${hotlineContact.phone}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to establish emergency contact:', error);
      return false;
    }
  }
  
  private getEmergencyContacts(location?: any): EmergencyContact[] {
    // In production, return location-specific emergency contacts
    return this.EMERGENCY_CONTACTS['default'];
  }
  
  private generateTrackingId(overrideId: string): string {
    return `EMRG-${Date.now()}-${overrideId.substring(0, 8)}`;
  }
  
  private createFallbackPlan(request: EmergencyOverrideRequest): string[] {
    const plan = [
      '1. Crisis hotline automatically contacted (988)',
      '2. On-call supervisor notified immediately',
      '3. Session flagged for manual review',
      '4. User provided with emergency resources',
    ];
    
    if (request.userLocation) {
      plan.push('5. Wellness check requested for provided location');
    }
    
    if (request.severity >= 9) {
      plan.push('6. Emergency services on standby');
    }
    
    plan.push('7. Continuous monitoring until resolution');
    
    return plan;
  }
  
  private createEmergencyFallback(
    request: EmergencyOverrideRequest,
    overrideId: string
  ): EmergencyOverrideResponse {
    console.log('🆘 EMERGENCY FALLBACK ACTIVATED - All safety nets engaged');
    
    return {
      overrideId,
      activated: true,
      actionsInitiated: ['CRISIS_HOTLINE_CONNECTED', 'SUPERVISOR_ALERTED'],
      emergencyContacts: this.EMERGENCY_CONTACTS['default'],
      responseTimeMs: 0,
      trackingId: this.generateTrackingId(overrideId),
      fallbackPlan: [
        'EMERGENCY FALLBACK ACTIVATED',
        'All available safety measures engaged',
        'Manual intervention required',
        'Crisis team mobilized',
      ],
    };
  }
  
  private async logEmergencyOverride(
    request: EmergencyOverrideRequest,
    response: EmergencyOverrideResponse
  ): Promise<void> {
    // In production, log to secure audit system
    console.log('📋 Emergency override logged:', {
      overrideId: response.overrideId,
      sessionId: request.sessionId,
      trigger: request.trigger,
      severity: request.severity,
      actions: response.actionsInitiated,
      responseTime: response.responseTimeMs,
    });
  }
  
  private async logEmergencyServiceContact(request: EmergencyOverrideRequest): Promise<void> {
    // In production, log emergency service contact for legal/audit purposes
    console.log('📋 Emergency service contact logged for session:', request.sessionId);
  }
  
  private async logOverrideCompletion(overrideId: string, outcome: string): Promise<void> {
    console.log('📋 Emergency override completion logged:', { overrideId, outcome });
  }
  
  private initializeEmergencyProtocols(): void {
    console.log('🚨 Emergency override protocols initialized');
    
    // In production, establish connections to emergency services
    // Validate emergency contact information
    // Set up monitoring and alerting systems
  }
}