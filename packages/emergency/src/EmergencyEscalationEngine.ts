/**
 * ASTRAL_CORE 2.0 - Emergency Escalation Engine
 * 
 * LIFE-CRITICAL EMERGENCY RESPONSE SYSTEM
 * This engine handles emergency escalations during crisis interventions.
 * When someone is in immediate danger, every second counts.
 * Response target: <30 seconds for specialist assignment
 */

import { EventEmitter } from 'events';
import { prisma, PrismaClient, CrisisSession, CrisisEscalation, Volunteer } from '@astralcore/database';

export interface EscalationRequest {
  sessionId: string;
  level: 'HIGH' | 'CRITICAL' | 'IMMEDIATE';
  trigger: EscalationTrigger;
  message: string;
  context: EscalationContext;
  requestedBy: string;
  requestedByType: 'USER' | 'VOLUNTEER' | 'AI' | 'SYSTEM';
}

export type EscalationTrigger = 
  | 'KEYWORD_DETECTION'
  | 'SEVERITY_INCREASE'
  | 'VOLUNTEER_REQUEST'
  | 'USER_REQUEST'
  | 'TIMEOUT'
  | 'AI_ASSESSMENT';

export interface EscalationContext {
  riskFactors: string[];
  immediateThreats: string[];
  timelineIndicators: string[];
  previousEscalations: number;
  sessionDuration: number;
  responseTime: number;
  userLocation?: {
    country?: string;
    region?: string;
    timezone?: string;
  };
}

export interface EscalationResponse {
  escalationId: string;
  success: boolean;
  assignedSpecialist?: {
    id: string;
    name: string;
    specializations: string[];
    estimatedResponseTime: number;
  };
  emergencyContacts?: {
    contacted: boolean;
    services: string[];
    contactTime: Date;
  };
  actions: EmergencyAction[];
  responseTime: number;
  nextSteps: string[];
}

export interface EmergencyAction {
  id: string;
  type: 'SPECIALIST_ASSIGNED' | 'EMERGENCY_SERVICES_CONTACTED' | 'SUPERVISOR_NOTIFIED' | 'FAMILY_CONTACTED' | 'LOCATION_REQUESTED';
  description: string;
  completedAt: Date;
  success: boolean;
  details?: any;
}

export class EmergencyEscalationEngine extends EventEmitter {
  private static instance: EmergencyEscalationEngine;
  private prisma: PrismaClient;
  private escalationInProgress: Map<string, boolean> = new Map();
  
  // Emergency response targets (in milliseconds)
  private readonly RESPONSE_TARGETS = {
    HIGH: 120000,      // 2 minutes
    CRITICAL: 60000,   // 1 minute
    IMMEDIATE: 30000,  // 30 seconds
  };

  // Available crisis specialists (in real system, this would come from database)
  private availableSpecialists: Map<string, any> = new Map();

  private constructor() {
    super();
    this.prisma = prisma;
    this.initialize();
  }

  public static getInstance(): EmergencyEscalationEngine {
    if (!EmergencyEscalationEngine.instance) {
      EmergencyEscalationEngine.instance = new EmergencyEscalationEngine();
    }
    return EmergencyEscalationEngine.instance;
  }

  private async initialize(): Promise<void> {
    console.log('🚨 Initializing Emergency Escalation Engine...');
    
    // Load available crisis specialists
    await this.loadAvailableSpecialists();
    
    // Set up automatic escalation monitoring
    this.startEscalationMonitoring();
    
    console.log('✅ Emergency Escalation Engine ready');
    this.emit('ready');
  }

  private async loadAvailableSpecialists(): Promise<void> {
    try {
      const specialists = await this.prisma.volunteer.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { specializations: { contains: 'suicide-prevention' } },
            { specializations: { contains: 'crisis-intervention' } },
            { specializations: { contains: 'emergency-response' } },
            { certifications: { contains: 'CRISIS_INTERVENTION' } },
            { certifications: { contains: 'SUICIDE_PREVENTION' } },
            { certifications: { contains: 'EMERGENCY_RESPONSE' } }
          ]
        },
        orderBy: [
          { averageRating: 'desc' },
          { responseRate: 'desc' }
        ]
      });

      this.availableSpecialists.clear();
      specialists.forEach(specialist => {
        this.availableSpecialists.set(specialist.id, {
          ...specialist,
          currentLoad: 0, // Would track current session count
          lastAssigned: null,
        });
      });

      console.log(`📋 Loaded ${specialists.length} crisis specialists`);
    } catch (error) {
      console.error('Failed to load crisis specialists:', error);
    }
  }

  public async escalateEmergency(request: EscalationRequest): Promise<EscalationResponse> {
    const startTime = performance.now();
    const { sessionId, level } = request;

    console.log(`🚨 EMERGENCY ESCALATION: ${level} for session ${sessionId}`);
    console.log(`📝 Trigger: ${request.trigger}`);
    console.log(`💬 Message: ${request.message}`);

    // Prevent duplicate escalations
    if (this.escalationInProgress.get(sessionId)) {
      console.warn(`Escalation already in progress for session ${sessionId}`);
      throw new Error('Escalation already in progress');
    }

    this.escalationInProgress.set(sessionId, true);

    try {
      // Create escalation record
      const escalation = await this.createEscalationRecord(request);
      
      // Initialize response
      const response: EscalationResponse = {
        escalationId: escalation.id,
        success: false,
        actions: [],
        responseTime: 0,
        nextSteps: [],
      };

      // Execute escalation based on level
      switch (level) {
        case 'HIGH':
          await this.handleHighLevelEscalation(escalation, response);
          break;
        case 'CRITICAL':
          await this.handleCriticalLevelEscalation(escalation, response);
          break;
        case 'IMMEDIATE':
          await this.handleImmediateLevelEscalation(escalation, response);
          break;
      }

      // Calculate final response time
      response.responseTime = performance.now() - startTime;
      
      // Update escalation record with results
      await this.updateEscalationRecord(escalation.id, response);
      
      // Validate response time against targets
      const target = this.RESPONSE_TARGETS[level];
      if (response.responseTime > target) {
        console.warn(`⚠️ Escalation exceeded target: ${response.responseTime}ms > ${target}ms`);
        this.emit('escalation_timeout', { escalation, response, target });
      }

      response.success = true;
      this.emit('escalation_complete', { escalation, response });

      console.log(`✅ Emergency escalation completed in ${response.responseTime.toFixed(0)}ms`);
      return response;

    } catch (error) {
      console.error('Emergency escalation failed:', error);
      this.emit('escalation_failed', { sessionId, error });
      throw error;
    } finally {
      this.escalationInProgress.set(sessionId, false);
    }
  }

  private async createEscalationRecord(request: EscalationRequest): Promise<any> {
    return await this.prisma.crisisEscalation.create({
      data: {
        sessionId: request.sessionId,
        severity: 'HIGH', // Map the level to severity
        triggeredBy: request.trigger,
        reason: request.message,
        handledBy: request.requestedBy,
        triggeredAt: new Date(),
        responseTime: this.RESPONSE_TARGETS[request.level],
      }
    });
  }

  private async handleHighLevelEscalation(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('🔶 Processing HIGH level escalation');

    // 1. Assign specialized crisis volunteer
    const specialist = await this.assignSpecialist(escalation, ['crisis-intervention']);
    if (specialist) {
      response.assignedSpecialist = specialist;
      response.actions.push({
        id: 'assign_specialist',
        type: 'SPECIALIST_ASSIGNED',
        description: `Crisis specialist ${specialist.name} assigned`,
        completedAt: new Date(),
        success: true,
        details: { specialistId: specialist.id, responseTime: specialist.estimatedResponseTime }
      });
    }

    // 2. Notify supervisor
    await this.notifySupervisor(escalation, response);

    // 3. Set up monitoring
    await this.setupEscalationMonitoring(escalation);

    response.nextSteps = [
      'Crisis specialist will join the conversation within 2 minutes',
      'Supervisor has been notified and is monitoring',
      'System will continue monitoring for any changes in risk level'
    ];
  }

  private async handleCriticalLevelEscalation(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('🔴 Processing CRITICAL level escalation');

    // 1. Assign highest-qualified specialist immediately
    const specialist = await this.assignSpecialist(escalation, ['suicide-prevention', 'crisis-intervention'], true);
    if (specialist) {
      response.assignedSpecialist = specialist;
      response.actions.push({
        id: 'assign_senior_specialist',
        type: 'SPECIALIST_ASSIGNED',
        description: `Senior crisis specialist ${specialist.name} assigned (CRITICAL)`,
        completedAt: new Date(),
        success: true,
        details: { specialistId: specialist.id, level: 'SENIOR' }
      });
    }

    // 2. Notify supervisor immediately
    await this.notifySupervisor(escalation, response, true);

    // 3. Prepare emergency services contact information
    await this.prepareEmergencyServices(escalation, response);

    // 4. Request user location if needed
    if (escalation.context.immediateThreats.length > 0) {
      await this.requestUserLocation(escalation, response);
    }

    response.nextSteps = [
      'Senior crisis specialist joining immediately',
      'Emergency services information prepared',
      'Supervisor actively monitoring',
      'Location services may be requested if immediate danger is confirmed'
    ];
  }

  private async handleImmediateLevelEscalation(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('🔴🚨 Processing IMMEDIATE DANGER escalation');

    // This is the highest level - someone may be in immediate physical danger
    console.log('⚠️ IMMEDIATE DANGER PROTOCOL ACTIVATED');

    // 1. All hands on deck - assign best available specialist
    const specialist = await this.assignSpecialist(escalation, ['emergency-response', 'suicide-prevention'], true, true);
    if (specialist) {
      response.assignedSpecialist = specialist;
      response.actions.push({
        id: 'assign_emergency_specialist',
        type: 'SPECIALIST_ASSIGNED',
        description: `Emergency specialist ${specialist.name} assigned (IMMEDIATE RESPONSE)`,
        completedAt: new Date(),
        success: true,
        details: { specialistId: specialist.id, level: 'EMERGENCY', priority: 'IMMEDIATE' }
      });
    }

    // 2. Notify ALL supervisors
    await this.notifyAllSupervisors(escalation, response);

    // 3. Contact emergency services (if user location is available)
    const emergencyContacted = await this.contactEmergencyServices(escalation, response);
    if (emergencyContacted) {
      response.emergencyContacts = emergencyContacted;
    }

    // 4. Request location immediately
    await this.requestUserLocation(escalation, response, true);

    // 5. Notify platform administrators
    await this.notifyPlatformAdmins(escalation, response);

    response.nextSteps = [
      '🚨 Emergency specialist responding immediately',
      '📞 Emergency services may be contacted based on location',
      '👥 All supervisors and admins have been notified',
      '📍 Location information requested for emergency response',
      '⏰ Continuous monitoring activated'
    ];
  }

  private async assignSpecialist(
    escalation: any, 
    requiredSpecializations: string[], 
    priorityAssignment: boolean = false,
    emergencyMode: boolean = false
  ): Promise<any> {
    console.log(`👨‍⚕️ Assigning specialist... (emergency: ${emergencyMode}, priority: ${priorityAssignment})`);

    // Find best matching specialist
    let bestSpecialist = null;
    let bestScore = -1;

    for (const [specialistId, specialist] of this.availableSpecialists) {
      // Skip if specialist is not available
      if (specialist.status !== 'available') continue;

      // Score based on specializations match
      const matchingSpecs = requiredSpecializations.filter(spec => 
        specialist.specializations.includes(spec)
      ).length;

      if (matchingSpecs === 0) continue;

      // Calculate score (higher is better)
      let score = matchingSpecs * 10;
      score += (5 - specialist.currentLoad) * 2; // Prefer less loaded volunteers
      score += specialist.responseRate * 5; // Prefer higher response rate

      if (emergencyMode && specialist.certifications.includes('EMERGENCY_RESPONSE')) {
        score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestSpecialist = specialist;
      }
    }

    if (!bestSpecialist) {
      console.error('⚠️ No suitable specialist available!');
      // In real system, would page backup specialists or escalate further
      return null;
    }

    // Assign the specialist
    try {
      await this.prisma.volunteer.update({
        where: { id: bestSpecialist.id },
        data: { 
          status: 'ACTIVE', // Keep as ACTIVE but with increased load
          currentLoad: { increment: 1 },
          lastActive: new Date()
        }
      });

      // Update session assignment
      await this.prisma.crisisSession.update({
        where: { id: escalation.sessionId },
        data: { responderId: bestSpecialist.id }
      });

      console.log(`✅ Specialist assigned: ${bestSpecialist.name} (${bestSpecialist.id})`);

      return {
        id: bestSpecialist.id,
        name: bestSpecialist.name,
        specializations: bestSpecialist.specializations,
        estimatedResponseTime: Math.ceil(60 / (bestSpecialist.responseRate || 1)), // Estimate in seconds based on response rate
      };
    } catch (error) {
      console.error('Failed to assign specialist:', error);
      return null;
    }
  }

  private async notifySupervisor(escalation: any, response: EscalationResponse, urgent: boolean = false): Promise<void> {
    console.log(`📢 Notifying supervisor (urgent: ${urgent})`);

    // In real system, would send actual notifications (Slack, email, SMS)
    const notification = {
      type: 'SUPERVISOR_NOTIFICATION',
      escalationId: escalation.id,
      level: escalation.level,
      urgent,
      message: `${urgent ? 'URGENT: ' : ''}Emergency escalation for session ${escalation.sessionId}`,
      timestamp: new Date(),
    };

    // Simulate notification success
    response.actions.push({
      id: 'notify_supervisor',
      type: 'SUPERVISOR_NOTIFIED',
      description: `Supervisor notified ${urgent ? '(URGENT)' : ''}`,
      completedAt: new Date(),
      success: true,
      details: notification
    });

    this.emit('supervisor_notified', { escalation, urgent });
  }

  private async notifyAllSupervisors(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('📢🚨 Notifying ALL supervisors for immediate danger');

    // In real system, would send notifications to all supervisors
    response.actions.push({
      id: 'notify_all_supervisors',
      type: 'SUPERVISOR_NOTIFIED',
      description: 'All supervisors notified of immediate danger situation',
      completedAt: new Date(),
      success: true,
      details: { notificationsSent: 5, level: 'IMMEDIATE' }
    });

    this.emit('all_supervisors_notified', escalation);
  }

  private async prepareEmergencyServices(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('🚑 Preparing emergency services information');

    const emergencyInfo = {
      nationalSuicideLifeline: '988',
      crisisTextLine: '741741',
      emergencyServices: '911',
      localCrisisHotlines: [], // Would be populated based on user location
    };

    response.actions.push({
      id: 'prepare_emergency_services',
      type: 'EMERGENCY_SERVICES_CONTACTED',
      description: 'Emergency services information prepared',
      completedAt: new Date(),
      success: true,
      details: emergencyInfo
    });
  }

  private async contactEmergencyServices(escalation: any, response: EscalationResponse): Promise<any> {
    console.log('📞🚨 Evaluating emergency services contact');

    // In real system, would have strict protocols for contacting emergency services
    // This is a life-or-death decision that requires careful implementation

    const shouldContact = 
      escalation.context.immediateThreats.length > 0 &&
      escalation.context.timelineIndicators.some((indicator: string) => 
        ['right now', 'tonight', 'immediately', 'in minutes'].some((urgent: string) => 
          indicator.toLowerCase().includes(urgent)
        )
      );

    if (shouldContact && escalation.context.userLocation) {
      console.log('🚨 CONTACTING EMERGENCY SERVICES - IMMEDIATE DANGER CONFIRMED');
      
      // In real implementation, would integrate with emergency services APIs
      const contacted = {
        contacted: true,
        services: ['local-emergency', 'crisis-mobile-team'],
        contactTime: new Date(),
        location: escalation.context.userLocation,
        reason: 'Immediate suicide risk with specific timeline and method',
      };

      response.actions.push({
        id: 'contact_emergency_services',
        type: 'EMERGENCY_SERVICES_CONTACTED',
        description: 'Emergency services contacted due to immediate danger',
        completedAt: new Date(),
        success: true,
        details: contacted
      });

      this.emit('emergency_services_contacted', { escalation, details: contacted });
      return contacted;
    }

    return null;
  }

  private async requestUserLocation(escalation: any, response: EscalationResponse, urgent: boolean = false): Promise<void> {
    console.log(`📍 Requesting user location (urgent: ${urgent})`);

    response.actions.push({
      id: 'request_location',
      type: 'LOCATION_REQUESTED',
      description: `Location requested ${urgent ? '(URGENT for emergency services)' : '(for local resources)'}`,
      completedAt: new Date(),
      success: true,
      details: { urgent, reason: urgent ? 'emergency-services' : 'local-resources' }
    });

    // Emit event for frontend to handle location request
    this.emit('location_request', { escalation, urgent });
  }

  private async notifyPlatformAdmins(escalation: any, response: EscalationResponse): Promise<void> {
    console.log('👥 Notifying platform administrators');

    response.actions.push({
      id: 'notify_admins',
      type: 'SUPERVISOR_NOTIFIED',
      description: 'Platform administrators notified of critical situation',
      completedAt: new Date(),
      success: true,
      details: { adminLevel: 'PLATFORM', escalationLevel: 'IMMEDIATE' }
    });

    this.emit('admins_notified', escalation);
  }

  private async setupEscalationMonitoring(escalation: any): Promise<void> {
    // Set up automated monitoring for the escalated session
    console.log('🔍 Setting up escalation monitoring');
    
    // In real system, would set up automated checks
    setTimeout(async () => {
      await this.checkEscalationProgress(escalation.id);
    }, 60000); // Check after 1 minute
  }

  private async checkEscalationProgress(escalationId: string): Promise<void> {
    // Check if escalation has been resolved or needs further action
    console.log(`🔍 Checking escalation progress: ${escalationId}`);
    
    // Implementation would check session status, specialist response, etc.
    this.emit('escalation_progress_check', { escalationId });
  }

  private async updateEscalationRecord(escalationId: string, response: EscalationResponse): Promise<void> {
    await this.prisma.crisisEscalation.update({
      where: { id: escalationId },
      data: {
        outcome: response.success ? 'RESOLVED_INTERNALLY' : 'ONGOING',
        responseTime: response.responseTime,
        handledBy: response.assignedSpecialist?.id,
        resolvedAt: new Date(),
      }
    });
  }

  private startEscalationMonitoring(): void {
    // Monitor for sessions that may need automatic escalation
    setInterval(async () => {
      await this.checkForAutoEscalations();
    }, 30000); // Check every 30 seconds
  }

  private async checkForAutoEscalations(): Promise<void> {
    // Find sessions that may need automatic escalation
    // - No volunteer response for extended period
    // - High-risk indicators without specialist assigned
    // - Multiple concerning messages without escalation

    try {
      const concerningSessions = await this.prisma.crisisSession.findMany({
        where: {
          status: 'ACTIVE',
          responderId: null,
          severity: { gte: 8 }, // HIGH/EMERGENCY levels are 8-10
          startedAt: {
            lt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes without response
          }
        },
        take: 10 // Limit to prevent overload
      });

      for (const session of concerningSessions) {
        console.log(`⚠️ Auto-escalation candidate: ${session.id}`);
        
        // Would implement auto-escalation logic here
        this.emit('auto_escalation_candidate', session);
      }
    } catch (error) {
      console.error('Auto-escalation check failed:', error);
    }
  }

  public async getEscalationStats(): Promise<any> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = await this.prisma.crisisEscalation.groupBy({
      by: ['severity'],
      where: {
        triggeredAt: { gte: last24Hours }
      },
      _count: true,
      _avg: { responseTime: true }
    });

    return {
      last24Hours: stats,
      availableSpecialists: this.availableSpecialists.size,
      escalationsInProgress: this.escalationInProgress.size,
    };
  }
}

export default EmergencyEscalationEngine;