/**
 * ASTRAL_CORE 2.0 - Emergency Intervention Triggers
 * 
 * LIFE-CRITICAL EMERGENCY INTERVENTION SYSTEM
 * Monitors multiple data sources and triggers appropriate interventions when users are at risk.
 * This service can literally save lives - it must be highly reliable and fail-safe.
 */

import { PrismaClient } from '@astralcore/database';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

interface InterventionTrigger {
  id: string;
  type: 'MISSED_CHECKIN' | 'MISSED_HEARTBEAT' | 'CRISIS_KEYWORDS' | 'WELLNESS_DECLINE' | 'EMERGENCY_SIGNAL' | 'LOCATION_ALERT' | 'BEHAVIORAL_CHANGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'LIFE_THREATENING';
  userId: string;
  tetherId?: string;
  sessionId?: string;
  triggerData: any;
  triggerTime: Date;
  status: 'PENDING' | 'PROCESSING' | 'ESCALATED' | 'RESOLVED' | 'FAILED';
  confidence: number; // 0-100 confidence in trigger accuracy
}

interface InterventionConfig {
  // Timing thresholds (in minutes)
  missedCheckinThresholds: {
    warning: number;
    alert: number;
    emergency: number;
    critical: number;
  };
  // Heartbeat thresholds (in number of missed beats)
  missedHeartbeatThresholds: {
    warning: number;
    alert: number;
    emergency: number;
    critical: number;
  };
  // Wellness score thresholds (1-10 scale)
  wellnessThresholds: {
    concerning: number;
    worrying: number;
    alarming: number;
    critical: number;
  };
  // Response timing requirements (in seconds)
  responseRequirements: {
    critical: number;
    emergency: number;
    high: number;
    medium: number;
  };
  // Escalation chains
  escalationChain: {
    level1: string[]; // Tether partner, peer supporters
    level2: string[]; // Crisis volunteers, trained responders
    level3: string[]; // Professional counselors, crisis team
    level4: string[]; // Emergency services, emergency contacts
  };
}

interface InterventionAction {
  id: string;
  triggerId: string;
  actionType: 'NOTIFY_TETHER' | 'ACTIVATE_VOLUNTEERS' | 'CRISIS_ESCALATION' | 'EMERGENCY_SERVICES' | 'WELLNESS_CHECK' | 'LOCATION_PING' | 'EMERGENCY_CONTACTS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scheduledTime: Date;
  executedTime?: Date;
  status: 'SCHEDULED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  result?: any;
  retryCount: number;
  maxRetries: number;
}

export class EmergencyInterventionTriggers extends EventEmitter {
  private prisma: PrismaClient;
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private config: InterventionConfig;
  private activeTriggers: Map<string, InterventionTrigger> = new Map();
  private pendingActions: Map<string, InterventionAction> = new Map();

  constructor(prisma: PrismaClient, config?: Partial<InterventionConfig>) {
    super();
    this.prisma = prisma;
    this.config = {
      missedCheckinThresholds: {
        warning: 60,    // 1 hour
        alert: 240,     // 4 hours
        emergency: 720, // 12 hours
        critical: 1440, // 24 hours
      },
      missedHeartbeatThresholds: {
        warning: 2,  // 2 missed beats
        alert: 4,    // 4 missed beats
        emergency: 8, // 8 missed beats
        critical: 16, // 16 missed beats
      },
      wellnessThresholds: {
        concerning: 6,  // 6/10 or below
        worrying: 4,    // 4/10 or below
        alarming: 2,    // 2/10 or below
        critical: 1,    // 1/10 or below
      },
      responseRequirements: {
        critical: 60,    // 1 minute
        emergency: 300,  // 5 minutes
        high: 900,       // 15 minutes
        medium: 3600,    // 1 hour
      },
      escalationChain: {
        level1: ['tether_partner', 'peer_supporters'],
        level2: ['crisis_volunteers', 'trained_responders'],
        level3: ['professional_counselors', 'crisis_team'],
        level4: ['emergency_services', 'emergency_contacts'],
      },
      ...config,
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle different types of triggers
    this.on('trigger:missed_checkin', this.handleMissedCheckinTrigger.bind(this));
    this.on('trigger:missed_heartbeat', this.handleMissedHeartbeatTrigger.bind(this));
    this.on('trigger:wellness_decline', this.handleWellnessDeclineTrigger.bind(this));
    this.on('trigger:emergency_signal', this.handleEmergencySignalTrigger.bind(this));
    this.on('trigger:crisis_keywords', this.handleCrisisKeywordsTrigger.bind(this));
    this.on('trigger:behavioral_change', this.handleBehavioralChangeTrigger.bind(this));

    // Handle action execution
    this.on('action:execute', this.executeAction.bind(this));
    this.on('action:failed', this.handleActionFailure.bind(this));
    this.on('action:completed', this.handleActionCompletion.bind(this));
  }

  /**
   * Start the intervention trigger service
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Emergency Intervention Triggers service is already running');
      return;
    }

    console.log('🚨 Starting Emergency Intervention Triggers Service...');
    
    try {
      // Load pending triggers and actions
      await this.loadPendingInterventions();
      
      // Start monitoring loop
      this.monitoringInterval = setInterval(
        () => this.monitorAndTrigger(),
        10000 // Check every 10 seconds for rapid response
      );
      
      this.isRunning = true;
      console.log('✅ Emergency Intervention Triggers Service started');
      
      this.emit('service:started', {
        timestamp: new Date(),
        activeTriggers: this.activeTriggers.size,
        pendingActions: this.pendingActions.size,
      });

    } catch (error) {
      console.error('CRITICAL: Failed to start Emergency Intervention Triggers:', error);
      throw error;
    }
  }

  /**
   * Stop the intervention trigger service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Emergency Intervention Triggers service is not running');
      return;
    }

    console.log('🛑 Stopping Emergency Intervention Triggers Service...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Complete any critical pending actions
    await this.completeCriticalActions();
    
    this.isRunning = false;
    this.activeTriggers.clear();
    this.pendingActions.clear();
    
    console.log('✅ Emergency Intervention Triggers Service stopped');
    this.emit('service:stopped', { timestamp: new Date() });
  }

  /**
   * Load pending interventions from database
   */
  private async loadPendingInterventions(): Promise<void> {
    try {
      // This would load from a database table in production
      console.log('📊 Loading pending intervention triggers...');
      this.activeTriggers.clear();
      this.pendingActions.clear();
    } catch (error) {
      console.error('Failed to load pending interventions:', error);
      throw error;
    }
  }

  /**
   * Main monitoring loop
   */
  private async monitorAndTrigger(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Check for missed check-ins
      await this.checkMissedCheckins();
      
      // Check for missed heartbeats (integrated with HeartbeatDetectionService)
      await this.checkMissedHeartbeats();
      
      // Check for wellness score declines
      await this.checkWellnessDeclines();
      
      // Check for behavioral pattern changes
      await this.checkBehavioralChanges();
      
      // Execute pending actions
      await this.executePendingActions();
      
      const processingTime = performance.now() - startTime;
      
      if (this.activeTriggers.size > 0 || this.pendingActions.size > 0) {
        console.log(`🔍 Intervention monitoring cycle: ${this.activeTriggers.size} triggers, ${this.pendingActions.size} actions (${processingTime.toFixed(2)}ms)`);
      }

    } catch (error) {
      console.error('CRITICAL: Intervention monitoring failed:', error);
      
      // Continue monitoring even if there's an error
      this.emit('monitoring:error', {
        timestamp: new Date(),
        error: error.message,
      });
    }
  }

  /**
   * Check for missed check-ins that require intervention
   */
  private async checkMissedCheckins(): Promise<void> {
    try {
      const now = new Date();
      const warningThreshold = new Date(now.getTime() - this.config.missedCheckinThresholds.warning * 60 * 1000);
      const alertThreshold = new Date(now.getTime() - this.config.missedCheckinThresholds.alert * 60 * 1000);
      const emergencyThreshold = new Date(now.getTime() - this.config.missedCheckinThresholds.emergency * 60 * 1000);
      const criticalThreshold = new Date(now.getTime() - this.config.missedCheckinThresholds.critical * 60 * 1000);

      // Find crisis sessions with overdue check-ins
      const overdueCheckIns = await this.prisma.crisisSession.findMany({
        where: {
          status: 'ACTIVE',
          nextScheduledCheckIn: {
            lt: warningThreshold
          }
        },
        select: {
          id: true,
          anonymousId: true,
          userId: true,
          nextScheduledCheckIn: true,
          latestWellnessScore: true,
          riskLevel: true,
        }
      });

      for (const session of overdueCheckIns) {
        const timeSinceExpected = now.getTime() - session.nextScheduledCheckIn.getTime();
        const minutesMissed = timeSinceExpected / (60 * 1000);

        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'LIFE_THREATENING' = 'LOW';
        let confidence = 70; // Base confidence

        if (minutesMissed >= this.config.missedCheckinThresholds.critical) {
          severity = 'CRITICAL';
          confidence = 95;
        } else if (minutesMissed >= this.config.missedCheckinThresholds.emergency) {
          severity = 'HIGH';
          confidence = 90;
        } else if (minutesMissed >= this.config.missedCheckinThresholds.alert) {
          severity = 'MEDIUM';
          confidence = 85;
        }

        // Adjust severity based on last known wellness score
        if (session.latestWellnessScore <= 3) {
          severity = severity === 'LOW' ? 'MEDIUM' : 
                   severity === 'MEDIUM' ? 'HIGH' : 'CRITICAL';
          confidence += 15;
        }

        // Adjust severity based on risk level
        if (session.riskLevel === 'HIGH') {
          severity = severity === 'LOW' ? 'HIGH' : 'CRITICAL';
          confidence += 10;
        }

        const triggerId = `missed-checkin-${session.id}-${Date.now()}`;
        
        if (!this.activeTriggers.has(triggerId)) {
          const trigger: InterventionTrigger = {
            id: triggerId,
            type: 'MISSED_CHECKIN',
            severity,
            userId: session.userId || session.anonymousId,
            sessionId: session.id,
            triggerData: {
              sessionId: session.id,
              minutesMissed,
              lastWellnessScore: session.latestWellnessScore,
              riskLevel: session.riskLevel,
              expectedCheckinTime: session.nextScheduledCheckIn,
            },
            triggerTime: now,
            status: 'PENDING',
            confidence,
          };

          this.activeTriggers.set(triggerId, trigger);
          
          console.log(`⚠️  MISSED CHECK-IN TRIGGER: ${severity} severity for session ${session.id} (${minutesMissed.toFixed(0)} minutes overdue)`);
          
          this.emit('trigger:missed_checkin', trigger);
        }
      }

    } catch (error) {
      console.error('Failed to check missed check-ins:', error);
    }
  }

  /**
   * Check for missed heartbeats (integrates with HeartbeatDetectionService)
   */
  private async checkMissedHeartbeats(): Promise<void> {
    try {
      const now = new Date();
      
      // Find tethers with missed heartbeats
      const missedHeartbeats = await this.prisma.tetherLink.findMany({
        where: {
          missedPulses: {
            gte: this.config.missedHeartbeatThresholds.warning
          },
          // Only active tethers
          lastActivity: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Active in last 24 hours
          }
        },
        select: {
          id: true,
          seekerId: true,
          supporterId: true,
          missedPulses: true,
          lastPulse: true,
          pulseInterval: true,
          strength: true,
          emergencyActive: true,
        }
      });

      for (const tether of missedHeartbeats) {
        // Skip if already in emergency mode
        if (tether.emergencyActive) continue;

        const missedBeats = tether.missedPulses;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'LIFE_THREATENING' = 'LOW';
        let confidence = 80;

        if (missedBeats >= this.config.missedHeartbeatThresholds.critical) {
          severity = 'CRITICAL';
          confidence = 95;
        } else if (missedBeats >= this.config.missedHeartbeatThresholds.emergency) {
          severity = 'HIGH';
          confidence = 90;
        } else if (missedBeats >= this.config.missedHeartbeatThresholds.alert) {
          severity = 'MEDIUM';
          confidence = 85;
        }

        // Adjust based on connection strength (lower strength = higher concern)
        if (tether.strength < 0.3) {
          severity = severity === 'LOW' ? 'MEDIUM' : 
                   severity === 'MEDIUM' ? 'HIGH' : 'CRITICAL';
          confidence += 10;
        }

        const triggerId = `missed-heartbeat-${tether.id}-${Date.now()}`;
        
        if (!this.activeTriggers.has(triggerId)) {
          const trigger: InterventionTrigger = {
            id: triggerId,
            type: 'MISSED_HEARTBEAT',
            severity,
            userId: tether.seekerId,
            tetherId: tether.id,
            triggerData: {
              tetherId: tether.id,
              missedBeats,
              lastPulse: tether.lastPulse,
              pulseInterval: tether.pulseInterval,
              connectionStrength: tether.strength,
            },
            triggerTime: now,
            status: 'PENDING',
            confidence,
          };

          this.activeTriggers.set(triggerId, trigger);
          
          console.log(`💓 MISSED HEARTBEAT TRIGGER: ${severity} severity for tether ${tether.id} (${missedBeats} missed beats)`);
          
          this.emit('trigger:missed_heartbeat', trigger);
        }
      }

    } catch (error) {
      console.error('Failed to check missed heartbeats:', error);
    }
  }

  /**
   * Check for concerning wellness score declines
   */
  private async checkWellnessDeclines(): Promise<void> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find sessions with concerning wellness trends
      const recentCheckIns = await this.prisma.crisisCheckIn.findMany({
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          sessionId: true,
          userId: true,
          wellnessScore: true,
          riskFactors: true,
          createdAt: true,
        }
      });

      // Group by session/user and analyze trends
      const sessionTrends = new Map<string, any[]>();
      
      for (const checkIn of recentCheckIns) {
        const key = checkIn.sessionId || checkIn.userId || 'unknown';
        if (!sessionTrends.has(key)) {
          sessionTrends.set(key, []);
        }
        sessionTrends.get(key)!.push(checkIn);
      }

      for (const [sessionKey, checkIns] of sessionTrends) {
        if (checkIns.length < 2) continue; // Need at least 2 data points

        const sortedCheckIns = checkIns.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const latest = sortedCheckIns[sortedCheckIns.length - 1];
        const previous = sortedCheckIns[sortedCheckIns.length - 2];

        // Check for concerning wellness scores
        if (latest.wellnessScore <= this.config.wellnessThresholds.critical) {
          await this.createWellnessTrigger(latest, 'CRITICAL', 95, 'Critical wellness score');
        } else if (latest.wellnessScore <= this.config.wellnessThresholds.alarming) {
          await this.createWellnessTrigger(latest, 'HIGH', 90, 'Alarming wellness score');
        } else if (latest.wellnessScore <= this.config.wellnessThresholds.worrying) {
          await this.createWellnessTrigger(latest, 'MEDIUM', 80, 'Worrying wellness score');
        }

        // Check for rapid decline
        const decline = previous.wellnessScore - latest.wellnessScore;
        if (decline >= 3) { // 3+ point decline
          const severity = decline >= 5 ? 'HIGH' : 'MEDIUM';
          await this.createWellnessTrigger(latest, severity, 85, `Rapid wellness decline (${decline} points)`);
        }

        // Check for concerning risk factors
        if (latest.riskFactors.includes('suicidal_ideation') || 
            latest.riskFactors.includes('self_harm') ||
            latest.riskFactors.includes('immediate_danger')) {
          await this.createWellnessTrigger(latest, 'CRITICAL', 95, 'High-risk factors detected');
        }
      }

    } catch (error) {
      console.error('Failed to check wellness declines:', error);
    }
  }

  /**
   * Create a wellness decline trigger
   */
  private async createWellnessTrigger(
    checkIn: any, 
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'LIFE_THREATENING', 
    confidence: number, 
    reason: string
  ): Promise<void> {
    const triggerId = `wellness-decline-${checkIn.id}-${Date.now()}`;
    
    if (!this.activeTriggers.has(triggerId)) {
      const trigger: InterventionTrigger = {
        id: triggerId,
        type: 'WELLNESS_DECLINE',
        severity,
        userId: checkIn.userId || checkIn.sessionId,
        sessionId: checkIn.sessionId,
        triggerData: {
          checkInId: checkIn.id,
          wellnessScore: checkIn.wellnessScore,
          riskFactors: checkIn.riskFactors,
          reason,
        },
        triggerTime: new Date(),
        status: 'PENDING',
        confidence,
      };

      this.activeTriggers.set(triggerId, trigger);
      
      console.log(`📉 WELLNESS DECLINE TRIGGER: ${severity} severity - ${reason} (score: ${checkIn.wellnessScore})`);
      
      this.emit('trigger:wellness_decline', trigger);
    }
  }

  /**
   * Check for concerning behavioral pattern changes
   */
  private async checkBehavioralChanges(): Promise<void> {
    try {
      // This would analyze patterns like:
      // - Sudden changes in communication frequency
      // - Changes in response times
      // - Changes in mood reporting patterns
      // - Changes in help-seeking behavior
      
      // For now, this is a placeholder for future behavioral analysis
      console.log('🔍 Checking behavioral patterns... (placeholder)');
      
    } catch (error) {
      console.error('Failed to check behavioral changes:', error);
    }
  }

  /**
   * Execute pending intervention actions
   */
  private async executePendingActions(): Promise<void> {
    const now = new Date();
    
    for (const [actionId, action] of this.pendingActions) {
      if (action.status === 'SCHEDULED' && action.scheduledTime <= now) {
        action.status = 'EXECUTING';
        
        try {
          await this.executeInterventionAction(action);
          action.status = 'COMPLETED';
          action.executedTime = now;
          this.emit('action:completed', action);
          
        } catch (error) {
          action.status = 'FAILED';
          action.retryCount++;
          
          console.error(`Failed to execute intervention action ${actionId}:`, error);
          
          if (action.retryCount < action.maxRetries) {
            // Reschedule for retry
            action.scheduledTime = new Date(now.getTime() + 30000); // Retry in 30 seconds
            action.status = 'SCHEDULED';
          } else {
            this.emit('action:failed', action);
          }
        }
      }
    }

    // Clean up completed actions
    for (const [actionId, action] of this.pendingActions) {
      if (action.status === 'COMPLETED' || (action.status === 'FAILED' && action.retryCount >= action.maxRetries)) {
        this.pendingActions.delete(actionId);
      }
    }
  }

  /**
   * Execute a specific intervention action
   */
  private async executeInterventionAction(action: InterventionAction): Promise<void> {
    console.log(`🚀 Executing intervention action: ${action.actionType} (${action.priority} priority)`);

    switch (action.actionType) {
      case 'NOTIFY_TETHER':
        await this.notifyTetherPartner(action);
        break;
        
      case 'ACTIVATE_VOLUNTEERS':
        await this.activateCrisisVolunteers(action);
        break;
        
      case 'CRISIS_ESCALATION':
        await this.escalateToCrisisTeam(action);
        break;
        
      case 'EMERGENCY_SERVICES':
        await this.contactEmergencyServices(action);
        break;
        
      case 'WELLNESS_CHECK':
        await this.initiateWellnessCheck(action);
        break;
        
      case 'LOCATION_PING':
        await this.requestLocationUpdate(action);
        break;
        
      case 'EMERGENCY_CONTACTS':
        await this.notifyEmergencyContacts(action);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  /**
   * Schedule intervention actions based on trigger
   */
  public async scheduleInterventions(trigger: InterventionTrigger): Promise<void> {
    const now = new Date();
    
    // Determine appropriate interventions based on severity
    const interventions = this.determineInterventions(trigger);
    
    for (const intervention of interventions) {
      const actionId = `${trigger.id}-${intervention.type}-${Date.now()}`;
      
      const action: InterventionAction = {
        id: actionId,
        triggerId: trigger.id,
        actionType: intervention.type,
        priority: this.mapSeverityToPriority(trigger.severity),
        scheduledTime: new Date(now.getTime() + (intervention.delaySeconds * 1000)),
        status: 'SCHEDULED',
        retryCount: 0,
        maxRetries: intervention.maxRetries || 3,
      };

      this.pendingActions.set(actionId, action);
      
      console.log(`📅 Scheduled intervention: ${action.actionType} in ${intervention.delaySeconds}s (${action.priority} priority)`);
    }
  }

  /**
   * Determine appropriate interventions for a trigger
   */
  private determineInterventions(trigger: InterventionTrigger): Array<{
    type: InterventionAction['actionType'];
    delaySeconds: number;
    maxRetries: number;
  }> {
    const interventions: Array<{
      type: InterventionAction['actionType'];
      delaySeconds: number;
      maxRetries: number;
    }> = [];

    switch (trigger.severity) {
      case 'CRITICAL':
      case 'LIFE_THREATENING':
        // Immediate response required
        if (trigger.tetherId) {
          interventions.push({ type: 'NOTIFY_TETHER', delaySeconds: 0, maxRetries: 5 });
        }
        interventions.push({ type: 'ACTIVATE_VOLUNTEERS', delaySeconds: 30, maxRetries: 3 });
        interventions.push({ type: 'CRISIS_ESCALATION', delaySeconds: 60, maxRetries: 5 });
        interventions.push({ type: 'EMERGENCY_CONTACTS', delaySeconds: 300, maxRetries: 3 });
        if (trigger.confidence >= 90) {
          interventions.push({ type: 'EMERGENCY_SERVICES', delaySeconds: 900, maxRetries: 3 }); // 15 minutes
        }
        break;
        
      case 'HIGH':
        // Rapid response needed
        if (trigger.tetherId) {
          interventions.push({ type: 'NOTIFY_TETHER', delaySeconds: 0, maxRetries: 3 });
        }
        interventions.push({ type: 'ACTIVATE_VOLUNTEERS', delaySeconds: 120, maxRetries: 3 });
        interventions.push({ type: 'WELLNESS_CHECK', delaySeconds: 300, maxRetries: 2 });
        interventions.push({ type: 'CRISIS_ESCALATION', delaySeconds: 900, maxRetries: 3 });
        break;
        
      case 'MEDIUM':
        // Standard response
        if (trigger.tetherId) {
          interventions.push({ type: 'NOTIFY_TETHER', delaySeconds: 60, maxRetries: 2 });
        }
        interventions.push({ type: 'WELLNESS_CHECK', delaySeconds: 300, maxRetries: 2 });
        interventions.push({ type: 'ACTIVATE_VOLUNTEERS', delaySeconds: 1800, maxRetries: 2 });
        break;
        
      case 'LOW':
        // Gentle intervention
        if (trigger.tetherId) {
          interventions.push({ type: 'NOTIFY_TETHER', delaySeconds: 300, maxRetries: 1 });
        }
        interventions.push({ type: 'WELLNESS_CHECK', delaySeconds: 600, maxRetries: 1 });
        break;
    }

    return interventions;
  }

  private mapSeverityToPriority(severity: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (severity) {
      case 'LIFE_THREATENING':
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  /**
   * Complete any critical pending actions before shutdown
   */
  private async completeCriticalActions(): Promise<void> {
    const criticalActions = Array.from(this.pendingActions.values())
      .filter(action => action.priority === 'CRITICAL' && action.status === 'SCHEDULED');

    if (criticalActions.length > 0) {
      console.log(`⚠️  Completing ${criticalActions.length} critical actions before shutdown...`);
      
      for (const action of criticalActions) {
        try {
          await this.executeInterventionAction(action);
        } catch (error) {
          console.error(`Failed to complete critical action ${action.id}:`, error);
        }
      }
    }
  }

  // Trigger handlers
  private async handleMissedCheckinTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed missed check-in trigger: ${trigger.id}`);
  }

  private async handleMissedHeartbeatTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed missed heartbeat trigger: ${trigger.id}`);
  }

  private async handleWellnessDeclineTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed wellness decline trigger: ${trigger.id}`);
  }

  private async handleEmergencySignalTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    // Emergency signals get immediate response
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed emergency signal trigger: ${trigger.id}`);
  }

  private async handleCrisisKeywordsTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed crisis keywords trigger: ${trigger.id}`);
  }

  private async handleBehavioralChangeTrigger(trigger: InterventionTrigger): Promise<void> {
    trigger.status = 'PROCESSING';
    await this.scheduleInterventions(trigger);
    console.log(`✅ Processed behavioral change trigger: ${trigger.id}`);
  }

  // Action implementations (these would integrate with real services)
  private async notifyTetherPartner(action: InterventionAction): Promise<void> {
    console.log(`📱 Notifying tether partner for action: ${action.id}`);
    // Implementation would send notification to tether partner
  }

  private async activateCrisisVolunteers(action: InterventionAction): Promise<void> {
    console.log(`👥 Activating crisis volunteers for action: ${action.id}`);
    // Implementation would activate available crisis volunteers
  }

  private async escalateToCrisisTeam(action: InterventionAction): Promise<void> {
    console.log(`🚨 Escalating to crisis team for action: ${action.id}`);
    // Implementation would escalate to professional crisis team
  }

  private async contactEmergencyServices(action: InterventionAction): Promise<void> {
    console.log(`🚑 Contacting emergency services for action: ${action.id}`);
    // Implementation would contact appropriate emergency services
  }

  private async initiateWellnessCheck(action: InterventionAction): Promise<void> {
    console.log(`💚 Initiating wellness check for action: ${action.id}`);
    // Implementation would initiate automated wellness check
  }

  private async requestLocationUpdate(action: InterventionAction): Promise<void> {
    console.log(`📍 Requesting location update for action: ${action.id}`);
    // Implementation would request user location (with consent)
  }

  private async notifyEmergencyContacts(action: InterventionAction): Promise<void> {
    console.log(`📞 Notifying emergency contacts for action: ${action.id}`);
    // Implementation would contact user's emergency contacts
  }

  /**
   * Manually trigger an intervention (for testing or manual escalation)
   */
  public async manualTrigger(
    type: InterventionTrigger['type'],
    severity: InterventionTrigger['severity'],
    userId: string,
    data: any
  ): Promise<string> {
    const triggerId = `manual-${type}-${userId}-${Date.now()}`;
    
    const trigger: InterventionTrigger = {
      id: triggerId,
      type,
      severity,
      userId,
      triggerData: { ...data, manual: true },
      triggerTime: new Date(),
      status: 'PENDING',
      confidence: 100, // Manual triggers are 100% confident
    };

    this.activeTriggers.set(triggerId, trigger);
    
    console.log(`🔧 Manual trigger created: ${triggerId} (${severity} ${type})`);
    
    // Process immediately
    this.emit(`trigger:${type.toLowerCase()}`, trigger);
    
    return triggerId;
  }

  /**
   * Get service status and statistics
   */
  public getStatus(): {
    isRunning: boolean;
    activeTriggers: number;
    pendingActions: number;
    triggerBreakdown: { [key: string]: number };
    actionBreakdown: { [key: string]: number };
  } {
    const triggerBreakdown: { [key: string]: number } = {};
    const actionBreakdown: { [key: string]: number } = {};

    for (const trigger of this.activeTriggers.values()) {
      triggerBreakdown[trigger.severity] = (triggerBreakdown[trigger.severity] || 0) + 1;
    }

    for (const action of this.pendingActions.values()) {
      actionBreakdown[action.status] = (actionBreakdown[action.status] || 0) + 1;
    }

    return {
      isRunning: this.isRunning,
      activeTriggers: this.activeTriggers.size,
      pendingActions: this.pendingActions.size,
      triggerBreakdown,
      actionBreakdown,
    };
  }
}