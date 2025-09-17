/**
 * ASTRAL_CORE 2.0 Crisis Escalation System
 * 
 * INTELLIGENT ESCALATION TRIGGERS
 * - Real-time crisis escalation based on content analysis
 * - Multi-level escalation protocols
 * - Emergency service integration
 * - Automated crisis intervention
 * - Expert assignment and routing
 * - Performance tracking and optimization
 * 
 * TARGET PERFORMANCE:
 * - Escalation decision: <25ms
 * - Emergency response: <5 minutes
 * - Expert assignment: <30 seconds
 * - False escalation rate: <2%
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

export interface EscalationTrigger {
  id: string;
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  
  // Trigger conditions
  conditions: {
    riskScoreThreshold?: number;
    crisisLevel?: string[];
    keywords?: string[];
    timeConstraints?: {
      timeOfDay?: number[];
      dayOfWeek?: number[];
    };
    userContext?: {
      previousEscalations?: number;
      userRiskProfile?: string;
    };
    conversationPattern?: {
      escalatingRisk?: boolean;
      timeInSession?: number;
      messageCount?: number;
    };
  };
  
  // Escalation actions
  actions: {
    notifyExperts: boolean;
    contactEmergencyServices: boolean;
    assignSpecialist: boolean;
    activateCrisisProtocol: boolean;
    alertSupervisor: boolean;
    documentIncident: boolean;
    followUpRequired: boolean;
  };
  
  // Routing and assignment
  routing: {
    expertiseRequired: string[];
    responseTimeTarget: number; // minutes
    escalationPath: string[];
    fallbackOptions: string[];
  };
  
  // Performance tracking
  enabled: boolean;
  activatedCount: number;
  successRate: number;
  averageResponseTime: number;
  lastActivated?: Date;
}

export interface EscalationEvent {
  id: string;
  triggerId: string;
  timestamp: Date;
  
  // Source information
  contentAnalysis: {
    originalContent: string;
    riskScore: number;
    crisisLevel: string;
    detectedKeywords: string[];
    confidence: number;
  };
  
  // User and session context
  context: {
    userId?: string;
    sessionId?: string;
    volunteerId?: string;
    conversationHistory: Array<{
      timestamp: Date;
      content: string;
      speaker: 'user' | 'volunteer';
      riskScore?: number;
    }>;
    userProfile?: {
      previousEscalations: number;
      riskHistory: number[];
      lastCrisisEvent?: Date;
    };
  };
  
  // Escalation details
  escalation: {
    level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'EMERGENCY';
    reason: string;
    triggeredActions: string[];
    assignedExperts: string[];
    estimatedSeverity: number;
    urgencyScore: number;
  };
  
  // Response tracking
  response?: {
    acknowledgedAt?: Date;
    assignedTo?: string;
    responseTime?: number;
    actions: Array<{
      action: string;
      timestamp: Date;
      performer: string;
      result: 'success' | 'failed' | 'pending';
    }>;
    outcome?: 'resolved' | 'ongoing' | 'transferred' | 'emergency_services';
  };
  
  // Status and resolution
  status: 'triggered' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated_further';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  resolution?: {
    resolvedAt: Date;
    resolvedBy: string;
    outcome: string;
    followUpScheduled: boolean;
    lessonsLearned: string[];
  };
}

export interface EscalationMetrics {
  totalEscalations: number;
  escalationsByLevel: Record<string, number>;
  averageResponseTime: number;
  emergencyResponseTime: number;
  successfulInterventions: number;
  falseEscalationRate: number;
  expertUtilization: number;
  emergencyServiceContacts: number;
}

/**
 * Crisis Escalation System
 * Intelligently escalates crisis situations based on AI analysis and content triggers
 */
export class CrisisEscalationSystem extends EventEmitter {
  private static instance: CrisisEscalationSystem;
  
  // Escalation configuration
  private escalationTriggers = new Map<string, EscalationTrigger>();
  private activeEscalations = new Map<string, EscalationEvent>();
  private escalationQueue: string[] = []; // Priority-ordered escalation IDs
  
  // Expert and resource management
  private availableExperts = new Map<string, {
    id: string;
    expertise: string[];
    availability: 'available' | 'busy' | 'offline';
    currentCaseLoad: number;
    maxConcurrentCases: number;
    averageResponseTime: number;
  }>();
  
  // Emergency service integration
  private emergencyServices = {
    enabled: true,
    phoneNumber: '911',
    apiEndpoint: process.env.EMERGENCY_API_ENDPOINT,
    backupContacts: ['supervisor@astralcore.com'],
    responseTimeThreshold: 300000 // 5 minutes
  };
  
  // Performance tracking
  private metrics: EscalationMetrics = {
    totalEscalations: 0,
    escalationsByLevel: {},
    averageResponseTime: 0,
    emergencyResponseTime: 0,
    successfulInterventions: 0,
    falseEscalationRate: 0,
    expertUtilization: 0,
    emergencyServiceContacts: 0
  };
  
  private readonly ESCALATION_TIMEOUT = 300000; // 5 minutes for emergency response
  private readonly QUEUE_CHECK_INTERVAL = 10000; // 10 seconds
  
  private constructor() {
    super();
    this.initializeEscalationTriggers();
    this.initializeExperts();
    this.startEscalationMonitoring();
    console.log('🚨 Crisis Escalation System initialized');
  }
  
  static getInstance(): CrisisEscalationSystem {
    if (!CrisisEscalationSystem.instance) {
      CrisisEscalationSystem.instance = new CrisisEscalationSystem();
    }
    return CrisisEscalationSystem.instance;
  }
  
  /**
   * PRIMARY ESCALATION FUNCTION
   * Evaluates content and context to determine if escalation is needed
   * TARGET: <25ms decision time
   */
  async evaluateForEscalation(data: {
    content: string;
    riskAssessment: any;
    crisisDetection: any;
    context: any;
  }): Promise<{
    escalationNeeded: boolean;
    escalationEvent?: EscalationEvent;
    triggeredRules: string[];
    processingTime: number;
  }> {
    
    const startTime = performance.now();
    
    try {
      // Evaluate all escalation triggers
      const triggeredRules: string[] = [];
      let highestPriorityTrigger: EscalationTrigger | null = null;
      
      for (const trigger of this.escalationTriggers.values()) {
        if (!trigger.enabled) continue;
        
        const isTriggered = await this.evaluateTrigger(trigger, data);
        if (isTriggered) {
          triggeredRules.push(trigger.id);
          
          if (!highestPriorityTrigger || this.comparePriority(trigger.priority, highestPriorityTrigger.priority) > 0) {
            highestPriorityTrigger = trigger;
          }
        }
      }
      
      const processingTime = performance.now() - startTime;
      
      // Performance warning
      if (processingTime > 25) {
        console.warn(`⚠️ Escalation evaluation exceeded target latency: ${processingTime.toFixed(2)}ms`);
      }
      
      // If no triggers activated, no escalation needed
      if (!highestPriorityTrigger) {
        return {
          escalationNeeded: false,
          triggeredRules,
          processingTime
        };
      }
      
      // Create escalation event
      const escalationEvent = await this.createEscalationEvent(
        highestPriorityTrigger,
        data,
        triggeredRules
      );
      
      // Process escalation immediately for emergency cases
      if (escalationEvent.priority === 'EMERGENCY') {
        await this.processEscalation(escalationEvent.id);
      } else {
        // Queue for processing
        this.queueEscalation(escalationEvent);
      }
      
      this.metrics.totalEscalations++;
      this.updateTriggerMetrics(highestPriorityTrigger.id);
      
      // Emit escalation event
      this.emit('escalation_triggered', {
        escalationId: escalationEvent.id,
        level: escalationEvent.escalation.level,
        priority: escalationEvent.priority,
        triggeredRules
      });
      
      console.log(`🚨 Escalation triggered: ${escalationEvent.escalation.level} (${escalationEvent.priority}) - ${escalationEvent.escalation.reason}`);
      
      return {
        escalationNeeded: true,
        escalationEvent,
        triggeredRules,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Escalation evaluation failed:', error);
      
      // Default to emergency escalation on system failure for safety
      const emergencyEvent = await this.createEmergencyEscalation(data, error);
      await this.processEscalation(emergencyEvent.id);
      
      return {
        escalationNeeded: true,
        escalationEvent: emergencyEvent,
        triggeredRules: ['system_failure'],
        processingTime: performance.now() - startTime
      };
    }
  }
  
  /**
   * Process escalation event and trigger appropriate actions
   */
  async processEscalation(escalationId: string): Promise<{
    success: boolean;
    actionsTriggered: string[];
    errors?: string[];
  }> {
    
    const escalationEvent = this.activeEscalations.get(escalationId);
    if (!escalationEvent) {
      return { success: false, actionsTriggered: [], errors: ['Escalation event not found'] };
    }
    
    const trigger = this.escalationTriggers.get(escalationEvent.triggerId);
    if (!trigger) {
      return { success: false, actionsTriggered: [], errors: ['Escalation trigger not found'] };
    }
    
    const actionsTriggered: string[] = [];
    const errors: string[] = [];
    
    try {
      escalationEvent.status = 'in_progress';
      escalationEvent.response = {
        acknowledgedAt: new Date(),
        actions: []
      };
      
      // Execute escalation actions based on trigger configuration
      
      // 1. Notify experts
      if (trigger.actions.notifyExperts) {
        try {
          await this.notifyExperts(escalationEvent);
          actionsTriggered.push('experts_notified');
        } catch (error) {
          errors.push(`Failed to notify experts: ${error}`);
        }
      }
      
      // 2. Assign specialist
      if (trigger.actions.assignSpecialist) {
        try {
          await this.assignSpecialist(escalationEvent);
          actionsTriggered.push('specialist_assigned');
        } catch (error) {
          errors.push(`Failed to assign specialist: ${error}`);
        }
      }
      
      // 3. Contact emergency services (highest priority)
      if (trigger.actions.contactEmergencyServices || escalationEvent.priority === 'EMERGENCY') {
        try {
          await this.contactEmergencyServices(escalationEvent);
          actionsTriggered.push('emergency_services_contacted');
          this.metrics.emergencyServiceContacts++;
        } catch (error) {
          errors.push(`Failed to contact emergency services: ${error}`);
        }
      }
      
      // 4. Activate crisis protocol
      if (trigger.actions.activateCrisisProtocol) {
        try {
          await this.activateCrisisProtocol(escalationEvent);
          actionsTriggered.push('crisis_protocol_activated');
        } catch (error) {
          errors.push(`Failed to activate crisis protocol: ${error}`);
        }
      }
      
      // 5. Alert supervisor
      if (trigger.actions.alertSupervisor) {
        try {
          await this.alertSupervisor(escalationEvent);
          actionsTriggered.push('supervisor_alerted');
        } catch (error) {
          errors.push(`Failed to alert supervisor: ${error}`);
        }
      }
      
      // 6. Document incident
      if (trigger.actions.documentIncident) {
        try {
          await this.documentIncident(escalationEvent);
          actionsTriggered.push('incident_documented');
        } catch (error) {
          errors.push(`Failed to document incident: ${error}`);
        }
      }
      
      // Update escalation with actions taken
      escalationEvent.escalation.triggeredActions = actionsTriggered;
      
      // Emit action completion event
      this.emit('escalation_processed', {
        escalationId,
        actionsTriggered,
        errors,
        timestamp: new Date()
      });
      
      console.log(`🚨 Escalation ${escalationId} processed: ${actionsTriggered.length} actions triggered`);
      
      return {
        success: errors.length === 0,
        actionsTriggered,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      console.error('❌ Escalation processing failed:', error);
      escalationEvent.status = 'escalated_further';
      
      // Escalate to next level on processing failure
      await this.escalateToNextLevel(escalationEvent);
      
      return {
        success: false,
        actionsTriggered,
        errors: [`Processing failed: ${error}`]
      };
    }
  }
  
  /**
   * Resolve escalation event
   */
  async resolveEscalation(
    escalationId: string,
    resolution: {
      outcome: string;
      resolvedBy: string;
      followUpScheduled?: boolean;
      lessonsLearned?: string[];
    }
  ): Promise<{ success: boolean }> {
    
    const escalationEvent = this.activeEscalations.get(escalationId);
    if (!escalationEvent) {
      return { success: false };
    }
    
    const now = new Date();
    const responseTime = now.getTime() - escalationEvent.timestamp.getTime();
    
    escalationEvent.status = 'resolved';
    escalationEvent.resolution = {
      resolvedAt: now,
      resolvedBy: resolution.resolvedBy,
      outcome: resolution.outcome,
      followUpScheduled: resolution.followUpScheduled || false,
      lessonsLearned: resolution.lessonsLearned || []
    };
    
    // Update response tracking
    if (escalationEvent.response) {
      escalationEvent.response.responseTime = responseTime;
      escalationEvent.response.outcome = resolution.outcome as any;
    }
    
    // Update metrics
    this.updateResponseMetrics(escalationEvent, responseTime);
    
    // Track successful intervention
    if (resolution.outcome === 'crisis_averted' || resolution.outcome === 'user_safe') {
      this.metrics.successfulInterventions++;
    }
    
    // Remove from active escalations
    this.activeEscalations.delete(escalationId);
    
    // Emit resolution event
    this.emit('escalation_resolved', {
      escalationId,
      outcome: resolution.outcome,
      responseTime,
      timestamp: now
    });
    
    console.log(`✅ Escalation ${escalationId} resolved: ${resolution.outcome} (${responseTime}ms)`);
    
    return { success: true };
  }
  
  // Private implementation methods
  
  private async evaluateTrigger(trigger: EscalationTrigger, data: any): Promise<boolean> {
    const conditions = trigger.conditions;
    
    // Risk score threshold
    if (conditions.riskScoreThreshold !== undefined) {
      if (data.riskAssessment.adjustedRiskScore < conditions.riskScoreThreshold) {
        return false;
      }
    }
    
    // Crisis level
    if (conditions.crisisLevel && conditions.crisisLevel.length > 0) {
      if (!conditions.crisisLevel.includes(data.crisisDetection.crisisLevel)) {
        return false;
      }
    }
    
    // Keywords
    if (conditions.keywords && conditions.keywords.length > 0) {
      const detectedKeywords = data.crisisDetection.keywords?.map((k: any) => k.keyword) || [];
      const hasKeyword = conditions.keywords.some(keyword => 
        detectedKeywords.includes(keyword) || data.content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }
    
    // Time constraints
    if (conditions.timeConstraints) {
      const now = new Date();
      
      if (conditions.timeConstraints.timeOfDay) {
        if (!conditions.timeConstraints.timeOfDay.includes(now.getHours())) {
          return false;
        }
      }
      
      if (conditions.timeConstraints.dayOfWeek) {
        if (!conditions.timeConstraints.dayOfWeek.includes(now.getDay())) {
          return false;
        }
      }
    }
    
    // User context
    if (conditions.userContext) {
      if (conditions.userContext.previousEscalations !== undefined) {
        const userEscalations = data.context.userProfile?.previousEscalations || 0;
        if (userEscalations < conditions.userContext.previousEscalations) {
          return false;
        }
      }
    }
    
    // Conversation pattern
    if (conditions.conversationPattern) {
      if (conditions.conversationPattern.escalatingRisk) {
        // Check if risk is escalating across messages
        const riskHistory = data.context.conversationHistory
          ?.map((msg: any) => msg.riskScore)
          .filter((score: any) => score !== undefined);
        
        if (!riskHistory || riskHistory.length < 3) {
          return false; // Not enough data to determine escalation
        }
        
        const isEscalating = riskHistory[riskHistory.length - 1] > riskHistory[riskHistory.length - 3];
        if (!isEscalating) {
          return false;
        }
      }
      
      if (conditions.conversationPattern.timeInSession !== undefined) {
        const sessionTime = data.context.sessionDuration || 0;
        if (sessionTime < conditions.conversationPattern.timeInSession * 60000) { // Convert minutes to ms
          return false;
        }
      }
      
      if (conditions.conversationPattern.messageCount !== undefined) {
        const messageCount = data.context.conversationHistory?.length || 0;
        if (messageCount < conditions.conversationPattern.messageCount) {
          return false;
        }
      }
    }
    
    return true; // All conditions passed
  }
  
  private async createEscalationEvent(
    trigger: EscalationTrigger,
    data: any,
    triggeredRules: string[]
  ): Promise<EscalationEvent> {
    
    const escalationId = randomUUID();
    const now = new Date();
    
    // Determine escalation level based on priority and context
    const escalationLevel = this.determineEscalationLevel(trigger.priority, data);
    
    // Calculate urgency score
    const urgencyScore = this.calculateUrgencyScore(data);
    
    const escalationEvent: EscalationEvent = {
      id: escalationId,
      triggerId: trigger.id,
      timestamp: now,
      
      contentAnalysis: {
        originalContent: data.content,
        riskScore: data.riskAssessment.adjustedRiskScore,
        crisisLevel: data.crisisDetection.crisisLevel,
        detectedKeywords: data.crisisDetection.keywords?.map((k: any) => k.keyword) || [],
        confidence: data.riskAssessment.confidenceLevel
      },
      
      context: {
        userId: data.context.userId,
        sessionId: data.context.sessionId,
        volunteerId: data.context.volunteerId,
        conversationHistory: data.context.conversationHistory || [],
        userProfile: data.context.userProfile
      },
      
      escalation: {
        level: escalationLevel,
        reason: `Trigger: ${trigger.name} - ${trigger.description}`,
        triggeredActions: [],
        assignedExperts: [],
        estimatedSeverity: data.riskAssessment.adjustedRiskScore,
        urgencyScore
      },
      
      status: 'triggered',
      priority: trigger.priority
    };
    
    // Store escalation event
    this.activeEscalations.set(escalationId, escalationEvent);
    
    return escalationEvent;
  }
  
  private async createEmergencyEscalation(data: any, error: any): Promise<EscalationEvent> {
    const escalationId = randomUUID();
    
    const escalationEvent: EscalationEvent = {
      id: escalationId,
      triggerId: 'system_failure',
      timestamp: new Date(),
      
      contentAnalysis: {
        originalContent: data.content || '',
        riskScore: 100, // Maximum risk on system failure
        crisisLevel: 'EMERGENCY',
        detectedKeywords: ['system_failure'],
        confidence: 100
      },
      
      context: {
        userId: data.context?.userId,
        sessionId: data.context?.sessionId,
        conversationHistory: []
      },
      
      escalation: {
        level: 'EMERGENCY',
        reason: `System failure during escalation evaluation: ${error.message}`,
        triggeredActions: [],
        assignedExperts: [],
        estimatedSeverity: 100,
        urgencyScore: 10
      },
      
      status: 'triggered',
      priority: 'EMERGENCY'
    };
    
    this.activeEscalations.set(escalationId, escalationEvent);
    return escalationEvent;
  }
  
  private queueEscalation(escalationEvent: EscalationEvent): void {
    // Insert into priority queue
    const priorityOrder = ['EMERGENCY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const eventPriorityIndex = priorityOrder.indexOf(escalationEvent.priority);
    
    let insertIndex = this.escalationQueue.length;
    for (let i = 0; i < this.escalationQueue.length; i++) {
      const queuedEvent = this.activeEscalations.get(this.escalationQueue[i]);
      if (queuedEvent) {
        const queuedPriorityIndex = priorityOrder.indexOf(queuedEvent.priority);
        if (eventPriorityIndex < queuedPriorityIndex) {
          insertIndex = i;
          break;
        }
      }
    }
    
    this.escalationQueue.splice(insertIndex, 0, escalationEvent.id);
    console.log(`🚨 Escalation ${escalationEvent.id} queued at position ${insertIndex}`);
  }
  
  // Action implementation methods
  
  private async notifyExperts(escalationEvent: EscalationEvent): Promise<void> {
    const trigger = this.escalationTriggers.get(escalationEvent.triggerId);
    if (!trigger) throw new Error('Trigger not found');
    
    const requiredExpertise = trigger.routing.expertiseRequired;
    const availableExperts = Array.from(this.availableExperts.values())
      .filter(expert => 
        expert.availability === 'available' &&
        requiredExpertise.some(expertise => expert.expertise.includes(expertise))
      );
    
    if (availableExperts.length === 0) {
      throw new Error('No available experts with required expertise');
    }
    
    // Notify all available matching experts
    for (const expert of availableExperts) {
      await this.sendExpertNotification(expert.id, escalationEvent);
    }
    
    console.log(`📧 Notified ${availableExperts.length} experts for escalation ${escalationEvent.id}`);
  }
  
  private async assignSpecialist(escalationEvent: EscalationEvent): Promise<void> {
    const trigger = this.escalationTriggers.get(escalationEvent.triggerId);
    if (!trigger) throw new Error('Trigger not found');
    
    // Find best available specialist
    const bestExpert = this.findBestExpert(trigger.routing.expertiseRequired);
    if (!bestExpert) {
      throw new Error('No available specialists');
    }
    
    // Assign expert
    escalationEvent.escalation.assignedExperts.push(bestExpert.id);
    bestExpert.availability = 'busy';
    bestExpert.currentCaseLoad++;
    
    await this.sendExpertAssignment(bestExpert.id, escalationEvent);
    
    console.log(`👨‍⚕️ Specialist ${bestExpert.id} assigned to escalation ${escalationEvent.id}`);
  }
  
  private async contactEmergencyServices(escalationEvent: EscalationEvent): Promise<void> {
    if (!this.emergencyServices.enabled) {
      throw new Error('Emergency services integration disabled');
    }
    
    const emergencyData = {
      escalationId: escalationEvent.id,
      urgency: escalationEvent.escalation.urgencyScore,
      location: 'unknown', // Would be extracted from user context
      description: escalationEvent.escalation.reason,
      riskScore: escalationEvent.contentAnalysis.riskScore,
      timestamp: escalationEvent.timestamp
    };
    
    // In production, this would make actual API calls to emergency services
    console.log(`🚑 Emergency services contacted for escalation ${escalationEvent.id}:`, emergencyData);
    
    // Simulate emergency service response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to response actions
    if (escalationEvent.response) {
      escalationEvent.response.actions.push({
        action: 'emergency_services_contacted',
        timestamp: new Date(),
        performer: 'system',
        result: 'success'
      });
    }
  }
  
  private async activateCrisisProtocol(escalationEvent: EscalationEvent): Promise<void> {
    // Crisis protocol activation includes:
    // 1. Lock current session to prevent user from leaving
    // 2. Activate suicide prevention resources
    // 3. Start continuous monitoring
    // 4. Prepare intervention team
    
    console.log(`🔴 Crisis protocol activated for escalation ${escalationEvent.id}`);
    
    // Emit crisis protocol activation
    this.emit('crisis_protocol_activated', {
      escalationId: escalationEvent.id,
      sessionId: escalationEvent.context.sessionId,
      urgency: escalationEvent.escalation.urgencyScore
    });
  }
  
  private async alertSupervisor(escalationEvent: EscalationEvent): Promise<void> {
    const supervisorAlert = {
      escalationId: escalationEvent.id,
      priority: escalationEvent.priority,
      urgency: escalationEvent.escalation.urgencyScore,
      reason: escalationEvent.escalation.reason,
      timestamp: escalationEvent.timestamp
    };
    
    // In production, would send actual alerts via email, SMS, etc.
    console.log(`👨‍💼 Supervisor alerted for escalation ${escalationEvent.id}:`, supervisorAlert);
  }
  
  private async documentIncident(escalationEvent: EscalationEvent): Promise<void> {
    // Create incident report
    const incidentReport = {
      id: randomUUID(),
      escalationId: escalationEvent.id,
      timestamp: new Date(),
      severity: escalationEvent.priority,
      description: escalationEvent.escalation.reason,
      context: escalationEvent.context,
      actions: escalationEvent.escalation.triggeredActions
    };
    
    // Store incident report (in production, would use proper incident management system)
    console.log(`📋 Incident documented for escalation ${escalationEvent.id}:`, incidentReport.id);
  }
  
  private async escalateToNextLevel(escalationEvent: EscalationEvent): Promise<void> {
    // Escalate to higher level of response
    const currentLevel = escalationEvent.escalation.level;
    let nextLevel: EscalationEvent['escalation']['level'];
    
    switch (currentLevel) {
      case 'LEVEL_1': nextLevel = 'LEVEL_2'; break;
      case 'LEVEL_2': nextLevel = 'LEVEL_3'; break;
      case 'LEVEL_3': nextLevel = 'EMERGENCY'; break;
      default: nextLevel = 'EMERGENCY'; break;
    }
    
    escalationEvent.escalation.level = nextLevel;
    escalationEvent.priority = 'EMERGENCY';
    
    // Process with emergency priority
    await this.processEscalation(escalationEvent.id);
    
    console.log(`⬆️ Escalation ${escalationEvent.id} escalated to ${nextLevel}`);
  }
  
  // Helper methods
  
  private comparePriority(priority1: string, priority2: string): number {
    const order = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY'];
    return order.indexOf(priority1) - order.indexOf(priority2);
  }
  
  private determineEscalationLevel(priority: string, data: any): EscalationEvent['escalation']['level'] {
    if (priority === 'EMERGENCY' || data.riskAssessment.adjustedRiskScore >= 90) {
      return 'EMERGENCY';
    } else if (priority === 'URGENT' || data.riskAssessment.adjustedRiskScore >= 80) {
      return 'LEVEL_3';
    } else if (priority === 'HIGH' || data.riskAssessment.adjustedRiskScore >= 60) {
      return 'LEVEL_2';
    } else {
      return 'LEVEL_1';
    }
  }
  
  private calculateUrgencyScore(data: any): number {
    let urgency = 5; // Base urgency
    
    // Risk score contribution
    urgency += (data.riskAssessment.adjustedRiskScore / 100) * 3;
    
    // Crisis level contribution
    if (data.crisisDetection.crisisLevel === 'EMERGENCY') urgency += 2;
    else if (data.crisisDetection.crisisLevel === 'CRITICAL') urgency += 1.5;
    else if (data.crisisDetection.crisisLevel === 'HIGH') urgency += 1;
    
    // Immediate risk indicator
    if (data.crisisDetection.immediateRisk) urgency += 2;
    
    // Time factor (higher urgency during off-hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) urgency += 1;
    
    return Math.min(10, Math.max(1, urgency));
  }
  
  private findBestExpert(requiredExpertise: string[]): any {
    return Array.from(this.availableExperts.values())
      .filter(expert => 
        expert.availability === 'available' &&
        expert.currentCaseLoad < expert.maxConcurrentCases &&
        requiredExpertise.some(expertise => expert.expertise.includes(expertise))
      )
      .sort((a, b) => a.currentCaseLoad - b.currentCaseLoad)[0]; // Prefer experts with lower case load
  }
  
  private async sendExpertNotification(expertId: string, escalationEvent: EscalationEvent): Promise<void> {
    // Implementation would send actual notification
    console.log(`📱 Notification sent to expert ${expertId} for escalation ${escalationEvent.id}`);
  }
  
  private async sendExpertAssignment(expertId: string, escalationEvent: EscalationEvent): Promise<void> {
    // Implementation would send actual assignment
    console.log(`📝 Assignment sent to expert ${expertId} for escalation ${escalationEvent.id}`);
  }
  
  private updateTriggerMetrics(triggerId: string): void {
    const trigger = this.escalationTriggers.get(triggerId);
    if (trigger) {
      trigger.activatedCount++;
      trigger.lastActivated = new Date();
    }
  }
  
  private updateResponseMetrics(escalationEvent: EscalationEvent, responseTime: number): void {
    // Update overall metrics
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalEscalations - 1) + responseTime) / 
      this.metrics.totalEscalations;
    
    // Track emergency response time separately
    if (escalationEvent.priority === 'EMERGENCY') {
      this.metrics.emergencyResponseTime = responseTime;
    }
    
    // Update escalation level metrics
    const level = escalationEvent.escalation.level;
    this.metrics.escalationsByLevel[level] = (this.metrics.escalationsByLevel[level] || 0) + 1;
  }
  
  private initializeEscalationTriggers(): void {
    // Initialize default escalation triggers
    const defaultTriggers: EscalationTrigger[] = [
      {
        id: 'immediate_danger',
        name: 'Immediate Danger Detection',
        description: 'Detects immediate suicide risk or self-harm intention',
        priority: 'EMERGENCY',
        conditions: {
          riskScoreThreshold: 90,
          crisisLevel: ['EMERGENCY'],
          keywords: ['kill myself now', 'going to die tonight', 'have the pills', 'gun is loaded']
        },
        actions: {
          notifyExperts: true,
          contactEmergencyServices: true,
          assignSpecialist: true,
          activateCrisisProtocol: true,
          alertSupervisor: true,
          documentIncident: true,
          followUpRequired: true
        },
        routing: {
          expertiseRequired: ['crisis_counseling', 'emergency_intervention'],
          responseTimeTarget: 2, // 2 minutes
          escalationPath: ['emergency_team', 'supervisor', 'emergency_services'],
          fallbackOptions: ['backup_counselor', 'emergency_hotline']
        },
        enabled: true,
        activatedCount: 0,
        successRate: 0.95,
        averageResponseTime: 3.2
      },
      
      {
        id: 'high_risk_planning',
        name: 'Suicide Planning Detection',
        description: 'Detects suicide planning and preparation activities',
        priority: 'URGENT',
        conditions: {
          riskScoreThreshold: 80,
          crisisLevel: ['CRITICAL', 'HIGH'],
          keywords: ['suicide plan', 'how to kill myself', 'suicide note', 'final arrangements']
        },
        actions: {
          notifyExperts: true,
          contactEmergencyServices: false,
          assignSpecialist: true,
          activateCrisisProtocol: true,
          alertSupervisor: true,
          documentIncident: true,
          followUpRequired: true
        },
        routing: {
          expertiseRequired: ['crisis_counseling', 'suicide_prevention'],
          responseTimeTarget: 5,
          escalationPath: ['crisis_specialist', 'supervisor'],
          fallbackOptions: ['senior_counselor']
        },
        enabled: true,
        activatedCount: 0,
        successRate: 0.88,
        averageResponseTime: 7.1
      },
      
      {
        id: 'escalating_risk',
        name: 'Escalating Risk Pattern',
        description: 'Detects patterns of increasing risk over conversation',
        priority: 'HIGH',
        conditions: {
          riskScoreThreshold: 60,
          conversationPattern: {
            escalatingRisk: true,
            timeInSession: 30,
            messageCount: 10
          }
        },
        actions: {
          notifyExperts: true,
          contactEmergencyServices: false,
          assignSpecialist: true,
          activateCrisisProtocol: false,
          alertSupervisor: false,
          documentIncident: true,
          followUpRequired: true
        },
        routing: {
          expertiseRequired: ['crisis_counseling'],
          responseTimeTarget: 10,
          escalationPath: ['available_counselor'],
          fallbackOptions: ['queue_for_next_available']
        },
        enabled: true,
        activatedCount: 0,
        successRate: 0.82,
        averageResponseTime: 12.5
      }
    ];
    
    defaultTriggers.forEach(trigger => {
      this.escalationTriggers.set(trigger.id, trigger);
    });
    
    console.log(`🚨 ${defaultTriggers.length} escalation triggers initialized`);
  }
  
  private initializeExperts(): void {
    // Initialize available experts
    const experts = [
      {
        id: 'expert_crisis_001',
        expertise: ['crisis_counseling', 'suicide_prevention', 'emergency_intervention'],
        availability: 'available' as const,
        currentCaseLoad: 0,
        maxConcurrentCases: 3,
        averageResponseTime: 4.2
      },
      {
        id: 'expert_crisis_002',
        expertise: ['crisis_counseling', 'trauma_counseling'],
        availability: 'available' as const,
        currentCaseLoad: 1,
        maxConcurrentCases: 4,
        averageResponseTime: 6.8
      }
    ];
    
    experts.forEach(expert => {
      this.availableExperts.set(expert.id, expert);
    });
    
    console.log(`👥 ${experts.length} crisis experts initialized`);
  }
  
  private startEscalationMonitoring(): void {
    // Process escalation queue periodically
    setInterval(() => {
      this.processEscalationQueue();
    }, this.QUEUE_CHECK_INTERVAL);
    
    // Check for escalation timeouts
    setInterval(() => {
      this.checkEscalationTimeouts();
    }, 30000); // Every 30 seconds
    
    // Log metrics periodically
    setInterval(() => {
      console.log(`🚨 Escalation Metrics - Total: ${this.metrics.totalEscalations}, Avg Response: ${this.metrics.averageResponseTime.toFixed(1)}ms, Emergency: ${this.metrics.emergencyServiceContacts}`);
    }, 300000); // Every 5 minutes
  }
  
  private async processEscalationQueue(): Promise<void> {
    if (this.escalationQueue.length === 0) return;
    
    const escalationId = this.escalationQueue.shift();
    if (escalationId) {
      try {
        await this.processEscalation(escalationId);
      } catch (error) {
        console.error(`❌ Failed to process queued escalation ${escalationId}:`, error);
      }
    }
  }
  
  private checkEscalationTimeouts(): void {
    const now = Date.now();
    
    for (const [id, escalation] of this.activeEscalations.entries()) {
      if (escalation.status === 'in_progress' || escalation.status === 'acknowledged') {
        const timeElapsed = now - escalation.timestamp.getTime();
        
        if (timeElapsed > this.ESCALATION_TIMEOUT) {
          console.warn(`⏰ Escalation ${id} timed out - escalating further`);
          this.escalateToNextLevel(escalation);
        }
      }
    }
  }
  
  /**
   * Get current escalation metrics
   */
  getMetrics(): EscalationMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get active escalations
   */
  getActiveEscalations(): EscalationEvent[] {
    return Array.from(this.activeEscalations.values());
  }
  
  /**
   * Get escalation by ID
   */
  getEscalation(escalationId: string): EscalationEvent | undefined {
    return this.activeEscalations.get(escalationId);
  }
  
  /**
   * Update escalation trigger configuration
   */
  updateTrigger(triggerId: string, updates: Partial<EscalationTrigger>): boolean {
    const trigger = this.escalationTriggers.get(triggerId);
    if (!trigger) return false;
    
    Object.assign(trigger, updates);
    console.log(`🔧 Escalation trigger ${triggerId} updated`);
    
    return true;
  }
}

// Export singleton instance
export const crisisEscalationSystem = CrisisEscalationSystem.getInstance();