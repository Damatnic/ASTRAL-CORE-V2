/**
 * ASTRAL_CORE 2.0 - Heartbeat Detection Service
 * 
 * LIFE-CRITICAL HEARTBEAT MONITORING SYSTEM
 * Monitors user heartbeats and detects missed check-ins with intelligent escalation.
 * This service runs continuously and is essential for user safety.
 */

import { PrismaClient } from '@astralcore/database';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

interface HeartbeatConfig {
  defaultInterval: number; // seconds
  missedThreshold: number; // number of missed beats before alert
  emergencyThreshold: number; // number of missed beats before emergency
  checkFrequency: number; // how often to check for missed beats (seconds)
  escalationDelays: {
    warning: number; // minutes
    alert: number; // minutes  
    emergency: number; // minutes
    critical: number; // minutes
  };
}

interface TetherHeartbeat {
  tetherId: string;
  seekerId: string;
  supporterId: string;
  lastHeartbeat: Date;
  expectedInterval: number; // seconds
  missedBeats: number;
  status: 'HEALTHY' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'CRITICAL';
  emergencyActive: boolean;
  lastEscalation?: Date;
  escalationLevel: 'NONE' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'CRITICAL';
}

interface MissedHeartbeatAlert {
  tetherId: string;
  userId: string;
  missedCount: number;
  timeSinceLastBeat: number; // seconds
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  escalationActions: string[];
  timestamp: Date;
}

export class HeartbeatDetectionService extends EventEmitter {
  private prisma: PrismaClient;
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private config: HeartbeatConfig;
  private heartbeatCache: Map<string, TetherHeartbeat> = new Map();

  constructor(prisma: PrismaClient, config?: Partial<HeartbeatConfig>) {
    super();
    this.prisma = prisma;
    this.config = {
      defaultInterval: 30, // 30 second default heartbeat
      missedThreshold: 2, // Alert after 2 missed beats
      emergencyThreshold: 6, // Emergency after 6 missed beats (3 minutes)
      checkFrequency: 10, // Check every 10 seconds
      escalationDelays: {
        warning: 1, // 1 minute
        alert: 5, // 5 minutes
        emergency: 15, // 15 minutes
        critical: 60, // 1 hour
      },
      ...config,
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle emergency escalations
    this.on('heartbeat:missed', this.handleMissedHeartbeat.bind(this));
    this.on('heartbeat:emergency', this.handleEmergencyEscalation.bind(this));
    this.on('heartbeat:critical', this.handleCriticalEscalation.bind(this));
    this.on('heartbeat:restored', this.handleHeartbeatRestored.bind(this));
  }

  /**
   * Start the heartbeat monitoring service
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Heartbeat detection service is already running');
      return;
    }

    console.log('🫀 Starting Heartbeat Detection Service...');
    
    try {
      // Load initial tether data
      await this.loadActiveTethers();
      
      // Start monitoring loop
      this.monitoringInterval = setInterval(
        () => this.monitorHeartbeats(),
        this.config.checkFrequency * 1000
      );
      
      this.isRunning = true;
      console.log(`✅ Heartbeat Detection Service started (checking every ${this.config.checkFrequency}s)`);
      
      // Emit startup event
      this.emit('service:started', {
        timestamp: new Date(),
        activeTethers: this.heartbeatCache.size,
        config: this.config,
      });

    } catch (error) {
      console.error('CRITICAL: Failed to start Heartbeat Detection Service:', error);
      throw error;
    }
  }

  /**
   * Stop the heartbeat monitoring service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Heartbeat detection service is not running');
      return;
    }

    console.log('🛑 Stopping Heartbeat Detection Service...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isRunning = false;
    this.heartbeatCache.clear();
    
    console.log('✅ Heartbeat Detection Service stopped');
    
    // Emit shutdown event
    this.emit('service:stopped', {
      timestamp: new Date(),
    });
  }

  /**
   * Load active tether connections into memory for monitoring
   */
  private async loadActiveTethers(): Promise<void> {
    try {
      console.log('📊 Loading active tether connections...');
      
      const activeTethers = await this.prisma.tetherLink.findMany({
        where: {
          // Only monitor active connections
          lastActivity: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Active in last 24 hours
          }
        },
        select: {
          id: true,
          seekerId: true,
          supporterId: true,
          lastPulse: true,
          pulseInterval: true,
          missedPulses: true,
          emergencyActive: true,
          strength: true,
        }
      });

      this.heartbeatCache.clear();

      for (const tether of activeTethers) {
        const heartbeat: TetherHeartbeat = {
          tetherId: tether.id,
          seekerId: tether.seekerId,
          supporterId: tether.supporterId,
          lastHeartbeat: tether.lastPulse,
          expectedInterval: tether.pulseInterval || this.config.defaultInterval,
          missedBeats: tether.missedPulses,
          status: this.calculateHeartbeatStatus(tether.lastPulse, tether.pulseInterval || this.config.defaultInterval, tether.missedPulses),
          emergencyActive: tether.emergencyActive,
          escalationLevel: 'NONE',
        };

        this.heartbeatCache.set(tether.id, heartbeat);
      }

      console.log(`✅ Loaded ${activeTethers.length} active tether connections for monitoring`);

    } catch (error) {
      console.error('CRITICAL: Failed to load active tethers:', error);
      throw error;
    }
  }

  /**
   * Main monitoring loop - checks all tethers for missed heartbeats
   */
  private async monitorHeartbeats(): Promise<void> {
    const startTime = performance.now();
    let processedCount = 0;
    let alertsTriggered = 0;
    let emergenciesDetected = 0;

    try {
      const now = new Date();
      
      for (const [tetherId, heartbeat] of this.heartbeatCache) {
        processedCount++;
        
        const timeSinceLastBeat = (now.getTime() - heartbeat.lastHeartbeat.getTime()) / 1000;
        const expectedInterval = heartbeat.expectedInterval;
        const missedBeats = Math.floor(timeSinceLastBeat / expectedInterval);

        // Update missed beats count
        if (missedBeats > heartbeat.missedBeats) {
          heartbeat.missedBeats = missedBeats;
          
          // Update database
          await this.prisma.tetherLink.update({
            where: { id: tetherId },
            data: { missedPulses: missedBeats }
          });
        }

        // Calculate new status
        const newStatus = this.calculateHeartbeatStatus(heartbeat.lastHeartbeat, expectedInterval, missedBeats);
        
        // Check for status changes and trigger appropriate actions
        if (newStatus !== heartbeat.status) {
          await this.handleStatusChange(heartbeat, newStatus, timeSinceLastBeat);
          heartbeat.status = newStatus;
          
          if (newStatus === 'ALERT' || newStatus === 'EMERGENCY' || newStatus === 'CRITICAL') {
            alertsTriggered++;
            
            if (newStatus === 'EMERGENCY' || newStatus === 'CRITICAL') {
              emergenciesDetected++;
            }
          }
        }

        // Check for escalation timeouts
        await this.checkEscalationTimeouts(heartbeat, timeSinceLastBeat);
      }

      const processingTime = performance.now() - startTime;
      
      // Log monitoring cycle completion
      if (processedCount > 0) {
        console.log(`💓 Heartbeat monitoring cycle completed: ${processedCount} tethers, ${alertsTriggered} alerts, ${emergenciesDetected} emergencies (${processingTime.toFixed(2)}ms)`);
      }

      // Emit monitoring cycle event
      this.emit('monitoring:cycle', {
        timestamp: now,
        processedCount,
        alertsTriggered,
        emergenciesDetected,
        processingTime,
      });

    } catch (error) {
      console.error('CRITICAL: Heartbeat monitoring cycle failed:', error);
      
      // Emit error event but continue monitoring
      this.emit('monitoring:error', {
        timestamp: new Date(),
        error: error.message,
        processedCount,
      });
    }
  }

  /**
   * Calculate heartbeat status based on missed beats and timing
   */
  private calculateHeartbeatStatus(
    lastHeartbeat: Date, 
    expectedInterval: number, 
    missedBeats: number
  ): 'HEALTHY' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'CRITICAL' {
    
    const timeSinceLastBeat = (Date.now() - lastHeartbeat.getTime()) / 1000;
    
    // Critical: No heartbeat for more than 1 hour
    if (timeSinceLastBeat > 60 * 60) {
      return 'CRITICAL';
    }
    
    // Emergency: Missed emergency threshold (default 6 beats = 3 minutes)
    if (missedBeats >= this.config.emergencyThreshold) {
      return 'EMERGENCY';
    }
    
    // Alert: Missed alert threshold (default 2 beats = 1 minute)
    if (missedBeats >= this.config.missedThreshold) {
      return 'ALERT';
    }
    
    // Warning: One missed beat
    if (missedBeats >= 1) {
      return 'WARNING';
    }
    
    return 'HEALTHY';
  }

  /**
   * Handle heartbeat status changes
   */
  private async handleStatusChange(
    heartbeat: TetherHeartbeat,
    newStatus: 'HEALTHY' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'CRITICAL',
    timeSinceLastBeat: number
  ): Promise<void> {
    
    const alert: MissedHeartbeatAlert = {
      tetherId: heartbeat.tetherId,
      userId: heartbeat.seekerId,
      missedCount: heartbeat.missedBeats,
      timeSinceLastBeat,
      riskLevel: this.mapStatusToRiskLevel(newStatus),
      escalationActions: this.determineEscalationActions(newStatus),
      timestamp: new Date(),
    };

    console.log(`🚨 Heartbeat status change: ${heartbeat.tetherId} → ${newStatus} (${heartbeat.missedBeats} missed beats)`);

    switch (newStatus) {
      case 'WARNING':
        this.emit('heartbeat:warning', alert);
        break;
        
      case 'ALERT':
        this.emit('heartbeat:missed', alert);
        await this.triggerAlert(heartbeat, alert);
        break;
        
      case 'EMERGENCY':
        this.emit('heartbeat:emergency', alert);
        await this.triggerEmergency(heartbeat, alert);
        break;
        
      case 'CRITICAL':
        this.emit('heartbeat:critical', alert);
        await this.triggerCriticalResponse(heartbeat, alert);
        break;
        
      case 'HEALTHY':
        this.emit('heartbeat:restored', {
          ...alert,
          riskLevel: 'LOW' as const,
        });
        await this.handleRecovery(heartbeat);
        break;
    }
  }

  /**
   * Check for escalation timeouts and trigger additional actions
   */
  private async checkEscalationTimeouts(heartbeat: TetherHeartbeat, timeSinceLastBeat: number): Promise<void> {
    const minutes = timeSinceLastBeat / 60;
    
    // Check if we need to escalate further based on time
    if (minutes >= this.config.escalationDelays.critical && heartbeat.escalationLevel !== 'CRITICAL') {
      heartbeat.escalationLevel = 'CRITICAL';
      await this.triggerCriticalResponse(heartbeat, {
        tetherId: heartbeat.tetherId,
        userId: heartbeat.seekerId,
        missedCount: heartbeat.missedBeats,
        timeSinceLastBeat,
        riskLevel: 'CRITICAL',
        escalationActions: ['EMERGENCY_SERVICES', 'EMERGENCY_CONTACTS', 'CRISIS_TEAM'],
        timestamp: new Date(),
      });
    } else if (minutes >= this.config.escalationDelays.emergency && heartbeat.escalationLevel === 'NONE') {
      heartbeat.escalationLevel = 'EMERGENCY';
      await this.triggerEmergency(heartbeat, {
        tetherId: heartbeat.tetherId,
        userId: heartbeat.seekerId,
        missedCount: heartbeat.missedBeats,
        timeSinceLastBeat,
        riskLevel: 'HIGH',
        escalationActions: ['CRISIS_VOLUNTEERS', 'EMERGENCY_CONTACTS'],
        timestamp: new Date(),
      });
    }
  }

  /**
   * Trigger alert for missed heartbeat
   */
  private async triggerAlert(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    try {
      // Notify tether partner
      await this.notifyTetherPartner(heartbeat.supporterId, 'ALERT', alert);
      
      // Log alert
      console.log(`⚠️  ALERT: Missed heartbeat for tether ${heartbeat.tetherId}`);
      
    } catch (error) {
      console.error('Failed to trigger heartbeat alert:', error);
    }
  }

  /**
   * Trigger emergency response for missed heartbeat
   */
  private async triggerEmergency(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    try {
      // Mark emergency as active
      await this.prisma.tetherLink.update({
        where: { id: heartbeat.tetherId },
        data: {
          emergencyActive: true,
          emergencyType: 'SAFETY_CONCERN',
          lastEmergency: new Date(),
        }
      });

      // Create emergency record
      await this.prisma.tetherEmergency.create({
        data: {
          tetherId: heartbeat.tetherId,
          triggerUserId: heartbeat.seekerId,
          emergencyType: 'SAFETY_CONCERN',
          severity: 'HIGH',
          description: `Missed heartbeat emergency: ${alert.missedCount} consecutive missed beats`,
          triggeredAt: new Date(),
          helpersNotified: [heartbeat.supporterId],
          emergencyContacts: [],
        }
      });

      // Notify tether partner immediately
      await this.notifyTetherPartner(heartbeat.supporterId, 'EMERGENCY', alert);
      
      // Activate crisis volunteers
      await this.activateCrisisVolunteers(heartbeat, alert);
      
      console.log(`🚨 EMERGENCY: Heartbeat emergency triggered for tether ${heartbeat.tetherId}`);
      
    } catch (error) {
      console.error('CRITICAL: Failed to trigger heartbeat emergency:', error);
    }
  }

  /**
   * Trigger critical response for prolonged missed heartbeat
   */
  private async triggerCriticalResponse(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    try {
      // Update emergency to critical level
      await this.prisma.tetherEmergency.updateMany({
        where: {
          tetherId: heartbeat.tetherId,
          resolvedAt: null,
        },
        data: {
          severity: 'CRITICAL',
          description: `CRITICAL: Extended missed heartbeat - ${Math.round(alert.timeSinceLastBeat / 60)} minutes without contact`,
        }
      });

      // Notify emergency contacts
      await this.notifyEmergencyContacts(heartbeat, alert);
      
      // Consider emergency services activation
      await this.considerEmergencyServices(heartbeat, alert);
      
      console.log(`🚑 CRITICAL: Critical heartbeat response triggered for tether ${heartbeat.tetherId}`);
      
    } catch (error) {
      console.error('CRITICAL: Failed to trigger critical heartbeat response:', error);
    }
  }

  /**
   * Handle heartbeat recovery
   */
  private async handleRecovery(heartbeat: TetherHeartbeat): Promise<void> {
    try {
      // Clear emergency status if active
      if (heartbeat.emergencyActive) {
        await this.prisma.tetherLink.update({
          where: { id: heartbeat.tetherId },
          data: {
            emergencyActive: false,
            missedPulses: 0,
          }
        });

        // Resolve any open emergencies
        await this.prisma.tetherEmergency.updateMany({
          where: {
            tetherId: heartbeat.tetherId,
            resolvedAt: null,
          },
          data: {
            resolvedAt: new Date(),
            outcome: 'USER_SAFE',
          }
        });

        console.log(`💚 RECOVERY: Heartbeat restored for tether ${heartbeat.tetherId}`);
      }

      // Reset escalation level
      heartbeat.escalationLevel = 'NONE';
      heartbeat.emergencyActive = false;
      
    } catch (error) {
      console.error('Failed to handle heartbeat recovery:', error);
    }
  }

  /**
   * Update heartbeat when pulse is received
   */
  public async updateHeartbeat(tetherId: string, pulseData: any): Promise<void> {
    const heartbeat = this.heartbeatCache.get(tetherId);
    
    if (heartbeat) {
      const wasEmergency = heartbeat.status === 'EMERGENCY' || heartbeat.status === 'CRITICAL';
      
      // Update heartbeat data
      heartbeat.lastHeartbeat = new Date();
      heartbeat.missedBeats = 0;
      heartbeat.status = 'HEALTHY';
      
      // If this was an emergency that's now resolved
      if (wasEmergency) {
        await this.handleRecovery(heartbeat);
      }
      
      console.log(`💓 Heartbeat updated for tether: ${tetherId}`);
    } else {
      // Reload tether data if not in cache
      await this.loadActiveTethers();
    }
  }

  /**
   * Add new tether to monitoring
   */
  public async addTetherToMonitoring(tetherId: string): Promise<void> {
    try {
      const tether = await this.prisma.tetherLink.findUnique({
        where: { id: tetherId },
        select: {
          id: true,
          seekerId: true,
          supporterId: true,
          lastPulse: true,
          pulseInterval: true,
          missedPulses: true,
          emergencyActive: true,
        }
      });

      if (tether) {
        const heartbeat: TetherHeartbeat = {
          tetherId: tether.id,
          seekerId: tether.seekerId,
          supporterId: tether.supporterId,
          lastHeartbeat: tether.lastPulse,
          expectedInterval: tether.pulseInterval || this.config.defaultInterval,
          missedBeats: tether.missedPulses,
          status: 'HEALTHY',
          emergencyActive: tether.emergencyActive,
          escalationLevel: 'NONE',
        };

        this.heartbeatCache.set(tetherId, heartbeat);
        console.log(`➕ Added tether to heartbeat monitoring: ${tetherId}`);
      }
    } catch (error) {
      console.error('Failed to add tether to monitoring:', error);
    }
  }

  /**
   * Remove tether from monitoring
   */
  public removeTetherFromMonitoring(tetherId: string): void {
    this.heartbeatCache.delete(tetherId);
    console.log(`➖ Removed tether from heartbeat monitoring: ${tetherId}`);
  }

  // Helper methods
  private mapStatusToRiskLevel(status: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (status) {
      case 'CRITICAL': return 'CRITICAL';
      case 'EMERGENCY': return 'HIGH';
      case 'ALERT': return 'MEDIUM';
      default: return 'LOW';
    }
  }

  private determineEscalationActions(status: string): string[] {
    switch (status) {
      case 'CRITICAL':
        return ['EMERGENCY_SERVICES', 'EMERGENCY_CONTACTS', 'CRISIS_TEAM', 'LOCATION_TRACKING'];
      case 'EMERGENCY':
        return ['CRISIS_VOLUNTEERS', 'EMERGENCY_CONTACTS', 'TETHER_PARTNER'];
      case 'ALERT':
        return ['TETHER_PARTNER', 'WELLNESS_CHECK'];
      case 'WARNING':
        return ['GENTLE_REMINDER'];
      default:
        return [];
    }
  }

  private async notifyTetherPartner(supporterId: string, level: string, alert: MissedHeartbeatAlert): Promise<void> {
    // Implementation would integrate with notification service
    console.log(`📱 Notifying tether partner ${supporterId} of ${level} level alert`);
  }

  private async activateCrisisVolunteers(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    // Implementation would activate available crisis volunteers
    console.log(`👥 Activating crisis volunteers for heartbeat emergency: ${heartbeat.tetherId}`);
  }

  private async notifyEmergencyContacts(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    // Implementation would notify emergency contacts
    console.log(`📞 Notifying emergency contacts for critical heartbeat situation: ${heartbeat.tetherId}`);
  }

  private async considerEmergencyServices(heartbeat: TetherHeartbeat, alert: MissedHeartbeatAlert): Promise<void> {
    // Implementation would consider activating emergency services based on user consent and risk level
    console.log(`🚑 Considering emergency services activation for: ${heartbeat.tetherId}`);
  }

  // Event handlers
  private async handleMissedHeartbeat(alert: MissedHeartbeatAlert): Promise<void> {
    console.log(`⚠️  Missed heartbeat alert: ${alert.tetherId} (${alert.missedCount} missed)`);
  }

  private async handleEmergencyEscalation(alert: MissedHeartbeatAlert): Promise<void> {
    console.log(`🚨 Emergency escalation: ${alert.tetherId} (${Math.round(alert.timeSinceLastBeat / 60)} minutes)`);
  }

  private async handleCriticalEscalation(alert: MissedHeartbeatAlert): Promise<void> {
    console.log(`🚑 Critical escalation: ${alert.tetherId} (${Math.round(alert.timeSinceLastBeat / 60)} minutes)`);
  }

  private async handleHeartbeatRestored(alert: MissedHeartbeatAlert): Promise<void> {
    console.log(`💚 Heartbeat restored: ${alert.tetherId}`);
  }

  /**
   * Get service status and statistics
   */
  public getStatus(): {
    isRunning: boolean;
    activeTethers: number;
    emergencyCount: number;
    alertCount: number;
    config: HeartbeatConfig;
  } {
    const emergencyCount = Array.from(this.heartbeatCache.values())
      .filter(h => h.status === 'EMERGENCY' || h.status === 'CRITICAL').length;
    
    const alertCount = Array.from(this.heartbeatCache.values())
      .filter(h => h.status === 'ALERT').length;

    return {
      isRunning: this.isRunning,
      activeTethers: this.heartbeatCache.size,
      emergencyCount,
      alertCount,
      config: this.config,
    };
  }
}