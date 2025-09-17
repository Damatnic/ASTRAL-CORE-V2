/**
 * ASTRAL_CORE 2.0 Tether Engine
 * 
 * The heart of persistent peer support connections.
 * Creates lasting bonds between people in crisis and their supporters.
 */

import {
  prisma,
  executeWithMetrics
} from '../../../database/src/index';
import { CrisisInterventionEngine } from '../../../crisis/src/engines/CrisisInterventionEngine';
import { TetherMatchingSystem } from '../matching/TetherMatchingSystem';
import { EmergencyPulseSystem } from '../emergency/EmergencyPulseSystem';
import { TetherHeartbeatMonitor } from '../monitoring/TetherHeartbeatMonitor';
import { TetherEncryption } from '../encryption/TetherEncryption';
import { TETHER_CONSTANTS, calculateTetherStrength } from '../index';
import type {
  TetherConnection,
  TetherPulseData,
  TetherEmergencyTrigger,
  TetherStats,
  CreateTetherRequest,
  TetherUpdateData
} from '../types/tether.types';

export class TetherEngine {
  private static instance: TetherEngine;
  
  private readonly matchingSystem: TetherMatchingSystem;
  private readonly emergencySystem: EmergencyPulseSystem;
  private readonly heartbeatMonitor: TetherHeartbeatMonitor;
  private readonly encryption: TetherEncryption;
  private readonly crisisEngine: CrisisInterventionEngine;
  
  private constructor() {
    this.matchingSystem = new TetherMatchingSystem();
    this.emergencySystem = new EmergencyPulseSystem();
    this.heartbeatMonitor = new TetherHeartbeatMonitor();
    this.encryption = new TetherEncryption();
    this.crisisEngine = CrisisInterventionEngine.getInstance();
    
    // Start continuous monitoring
    this.startTetherMonitoring();
  }
  
  static getInstance(): TetherEngine {
    if (!TetherEngine.instance) {
      TetherEngine.instance = new TetherEngine();
    }
    return TetherEngine.instance;
  }
  
  /**
   * Creates a new Tether connection between users
   * TARGET: <500ms execution time
   */
  async createTether(request: CreateTetherRequest): Promise<TetherConnection> {
    const startTime = performance.now();
    
    return await executeWithMetrics(async () => {
      // Validate connection compatibility
      const compatibility = await this.matchingSystem.calculateCompatibility(
        request.seekerId,
        request.supporterId,
        request.preferences
      );
      
      if (compatibility.score < TETHER_CONSTANTS.MIN_COMPATIBILITY_SCORE) {
        throw new Error(`Compatibility score too low: ${compatibility.score}`);
      }
      
      // Check connection limits
      const seekerConnections = await prisma.tetherLink.count({
        where: { seekerId: request.seekerId, emergencyActive: false },
      });
      
      const supporterConnections = await prisma.tetherLink.count({
        where: { supporterId: request.supporterId, emergencyActive: false },
      });
      
      if (seekerConnections >= TETHER_CONSTANTS.MAX_CONNECTIONS_PER_USER ||
          supporterConnections >= TETHER_CONSTANTS.MAX_CONNECTIONS_PER_USER) {
        throw new Error('Maximum connections reached');
      }
      
      // Generate connection metadata
      const encryptedMeta = request.sharedPreferences 
        ? this.encryption.encryptTetherData(request.sharedPreferences)
        : null;
      
      // Create Tether link
      const tetherLink = await prisma.tetherLink.create({
        data: {
          seekerId: request.seekerId,
          supporterId: request.supporterId,
          strength: 0.5, // Starting strength
          trustScore: 0.0,
          matchingScore: compatibility.score,
          specialties: compatibility.sharedInterests,
          languages: compatibility.sharedLanguages,
          timezone: request.timezone,
          dataSharing: request.dataSharing || 'MINIMAL',
          locationSharing: request.locationSharing || false,
          emergencyContact: request.emergencyContact !== false,
          encryptedMeta: encryptedMeta ? Buffer.from(encryptedMeta, 'hex') : null,
          pulseInterval: request.pulseInterval || TETHER_CONSTANTS.DEFAULT_PULSE_INTERVAL_SECONDS,
        },
      });
      
      // Start heartbeat monitoring
      await this.heartbeatMonitor.startMonitoring(tetherLink.id);
      
      // Send initial pulse to establish connection
      await this.sendPulse(tetherLink.id, {
        type: 'HEARTBEAT',
        strength: 0.5,
        status: 'NORMAL',
        message: 'Tether connection established',
        urgencyLevel: 'LOW',
      });
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 500) {
        console.warn(`⚠️ Tether creation took ${executionTime.toFixed(2)}ms (target: <500ms)`);
      }
      
      console.log(`✅ Tether created: ${tetherLink.id} (${executionTime.toFixed(2)}ms)`);
      
      return {
        id: tetherLink.id,
        seekerId: tetherLink.seekerId,
        supporterId: tetherLink.supporterId,
        strength: tetherLink.strength,
        established: tetherLink.established,
        pulseInterval: tetherLink.pulseInterval,
        emergencyActive: tetherLink.emergencyActive,
        specialties: tetherLink.specialties || [],
        languages: tetherLink.languages || [],
        compatibility: compatibility,
        executionTimeMs: executionTime,
      };
      
    }, 'create-tether');
  }
  
  /**
   * Sends a pulse through a Tether connection
   * TARGET: <100ms execution time
   */
  async sendPulse(tetherId: string, pulseData: TetherPulseData): Promise<void> {
    const startTime = performance.now();
    
    await executeWithMetrics(async () => {
      // Get Tether link
      const tether = await prisma.tetherLink.findUnique({
        where: { id: tetherId },
        select: { 
          id: true, 
          seekerId: true, 
          supporterId: true,
          emergencyActive: true,
          strength: true,
        },
      });
      
      if (!tether) {
        throw new Error('Tether not found');
      }
      
      // Create pulse record
      await prisma.tetherPulse.create({
        data: {
          tetherId,
          pulseType: pulseData.type,
          strength: pulseData.strength,
          mood: pulseData.mood,
          status: pulseData.status,
          message: pulseData.message,
          emergencySignal: pulseData.emergencySignal || false,
          urgencyLevel: pulseData.urgencyLevel,
        },
      });
      
      // Update Tether activity
      await prisma.tetherLink.update({
        where: { id: tetherId },
        data: {
          lastActivity: new Date(),
          lastPulse: new Date(),
          missedPulses: 0, // Reset missed pulse counter
        },
      });
      
      // Handle emergency signals
      if (pulseData.emergencySignal) {
        await this.emergencySystem.activateEmergencyPulse(tetherId, {
          triggerUserId: pulseData.senderId || tether.seekerId,
          urgencyLevel: pulseData.urgencyLevel,
          message: pulseData.message,
          type: 'MENTAL_HEALTH_CRISIS',
        });
      }
      
      // Update connection strength based on interaction
      if (pulseData.type !== 'HEARTBEAT') {
        await this.updateTetherStrength(tetherId);
      }
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 100) {
        console.warn(`⚠️ Pulse send took ${executionTime.toFixed(2)}ms (target: <100ms)`);
      }
      
    }, 'send-tether-pulse');
  }
  
  /**
   * Activates emergency pulse for immediate help
   * CRITICAL: <50ms execution time for life-saving response
   */
  async activateEmergencyPulse(
    tetherId: string, 
    emergencyData: TetherEmergencyTrigger
  ): Promise<void> {
    const startTime = performance.now();
    
    await executeWithMetrics(async () => {
      // Activate emergency system
      await this.emergencySystem.activateEmergencyPulse(tetherId, emergencyData);
      
      // Update Tether status
      await prisma.tetherLink.update({
        where: { id: tetherId },
        data: {
          emergencyActive: true,
          emergencyType: emergencyData.type,
          lastEmergency: new Date(),
        },
      });
      
      // If high severity, also trigger crisis intervention system
      if (emergencyData.severity && emergencyData.severity >= 8) {
        try {
          await this.crisisEngine.connectAnonymous(emergencyData.message);
          console.log(`✅ Crisis system activated for emergency Tether: ${tetherId}`);
        } catch (error) {
          console.error('❌ Failed to activate crisis system:', error);
        }
      }
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 50) {
        console.error(`🔴 CRITICAL: Emergency pulse took ${executionTime.toFixed(2)}ms (target: <50ms)`);
      } else {
        console.log(`🚨 Emergency pulse activated: ${tetherId} (${executionTime.toFixed(2)}ms)`);
      }
      
    }, 'emergency-pulse');
  }
  
  /**
   * Gets all active Tether connections for a user
   */
  async getUserTethers(userId: string): Promise<TetherConnection[]> {
    return await executeWithMetrics(async () => {
      const tethers = await prisma.tetherLink.findMany({
        where: {
          OR: [
            { seekerId: userId },
            { supporterId: userId },
          ],
          lastActivity: {
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Active in last 24 hours
          },
        },
        orderBy: { strength: 'desc' },
      });
      
      return tethers.map((tether: any) => ({
        id: tether.id,
        seekerId: tether.seekerId,
        supporterId: tether.supporterId,
        strength: tether.strength,
        established: tether.established,
        lastActivity: tether.lastActivity,
        pulseInterval: tether.pulseInterval,
        emergencyActive: tether.emergencyActive,
        emergencyType: tether.emergencyType,
        specialties: tether.specialties || [],
        languages: tether.languages || [],
      }));
      
    }, 'get-user-tethers');
  }
  
  /**
   * Gets Tether statistics for monitoring
   */
  async getTetherStats(): Promise<TetherStats> {
    return await executeWithMetrics(async () => {
      const [
        totalTethers,
        activeTethers,
        emergencyTethers,
        avgStrength,
        pulsesToday,
        emergenciesToday,
      ] = await Promise.all([
        prisma.tetherLink.count(),
        prisma.tetherLink.count({
          where: {
            lastActivity: {
              gt: new Date(Date.now() - 60 * 60 * 1000), // Active in last hour
            },
          },
        }),
        prisma.tetherLink.count({ where: { emergencyActive: true } }),
        prisma.tetherLink.aggregate({
          _avg: { strength: true },
        }),
        prisma.tetherPulse.count({
          where: {
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.tetherEmergency.count({
          where: {
            triggeredAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);
      
      return {
        totalTethers,
        activeTethers,
        emergencyTethers,
        averageStrength: avgStrength._avg.strength || 0,
        pulsesToday,
        emergenciesToday,
        systemHealth: emergencyTethers === 0 ? 'HEALTHY' : emergencyTethers < 10 ? 'DEGRADED' : 'CRITICAL',
      };
      
    }, 'get-tether-stats');
  }
  
  /**
   * Updates Tether connection strength based on interactions
   */
  private async updateTetherStrength(tetherId: string): Promise<void> {
    const tether = await prisma.tetherLink.findUnique({
      where: { id: tetherId },
      include: {
        pulses: {
          where: { timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          orderBy: { timestamp: 'desc' },
        },
        emergencies: {
          where: { triggeredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        },
      },
    });
    
    if (!tether) return;
    
    const now = Date.now();
    const establishedTime = tether.established.getTime();
    const durationDays = (now - establishedTime) / (24 * 60 * 60 * 1000);
    
    // Calculate interaction metrics
    const totalMessages = tether.pulses.filter((p: any) => p.pulseType !== 'HEARTBEAT').length;
    const positiveInteractions = tether.pulses.filter((p: any) =>
      p.mood && p.mood > 6 || p.status === 'NORMAL'
    ).length;
    
    const responseTimes = tether.pulses
      .filter((p: any) => p.acknowledgedAt)
      .map((p: any) => p.acknowledgedAt!.getTime() - p.timestamp.getTime());
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length
      : 3600000; // Default to 1 hour if no responses
      
    const emergencyResponseTime = tether.emergencies.length > 0
      ? Math.min(...tether.emergencies
          .filter((e: any) => e.respondedAt)
          .map((e: any) => e.respondedAt!.getTime() - e.triggeredAt.getTime()))
      : undefined;
    
    // Calculate new strength
    const newStrength = calculateTetherStrength({
      totalMessages,
      averageResponseTime,
      positiveInteractions,
      emergencyResponseTime,
      durationDays,
    });
    
    // Update database
    await prisma.tetherLink.update({
      where: { id: tetherId },
      data: { 
        strength: newStrength,
        trustScore: Math.min(newStrength * 1.2, 1), // Trust grows with strength
      },
    });
  }
  
  /**
   * Starts continuous monitoring of all Tether connections
   */
  private startTetherMonitoring(): void {
    // Monitor missed pulses every minute
    setInterval(async () => {
      try {
        await this.checkMissedPulses();
      } catch (error) {
        console.error('❌ Error checking missed pulses:', error);
      }
    }, 60000);
    
    // Update Tether strengths every 5 minutes
    setInterval(async () => {
      try {
        await this.updateAllTetherStrengths();
      } catch (error) {
        console.error('❌ Error updating Tether strengths:', error);
      }
    }, 300000);
    
    // Health check every minute
    setInterval(async () => {
      try {
        const stats = await this.getTetherStats();
        
        if (stats.systemHealth === 'CRITICAL') {
          console.error('🔴 CRITICAL: Tether system health degraded');
        }
        
        console.log(`💓 Tether Health: ${stats.activeTethers} active, ${stats.emergencyTethers} emergencies`);
      } catch (error) {
        console.error('❌ Tether health check failed:', error);
      }
    }, 60000);
  }
  
  private async checkMissedPulses(): Promise<void> {
    const staleTethers = await prisma.tetherLink.findMany({
      where: {
        lastPulse: {
          lt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes since last pulse
        },
        emergencyActive: false,
      },
    });
    
    for (const tether of staleTethers) {
      await prisma.tetherLink.update({
        where: { id: tether.id },
        data: { missedPulses: { increment: 1 } },
      });
      
      if (tether.missedPulses >= TETHER_CONSTANTS.MAX_MISSED_PULSES) {
        console.warn(`⚠️ Tether connection may be lost: ${tether.id}`);
        // Could trigger reconnection attempt here
      }
    }
  }
  
  private async updateAllTetherStrengths(): Promise<void> {
    const activeTethers = await prisma.tetherLink.findMany({
      where: {
        lastActivity: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true },
    });
    
    // Update in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < activeTethers.length; i += batchSize) {
      const batch = activeTethers.slice(i, i + batchSize);
      await Promise.all(batch.map((tether: any) => this.updateTetherStrength(tether.id)));
    }
  }
}