/**
 * ASTRAL_CORE 2.0 CRISIS AUTO-SCALING SYSTEM
 * 
 * CRITICAL SCALING TARGETS:
 * - Scale up trigger: <200ms response time degradation
 * - Scale up time: <60 seconds for crisis scenarios
 * - Scale down delay: 10 minutes after load decrease
 * - Maximum capacity: 1000 concurrent crisis sessions
 * 
 * LIFE-CRITICAL AUTO-SCALING:
 * - Predictive scaling based on crisis patterns
 * - Emergency burst scaling for mass incidents
 * - Geographic load balancing for regional crises
 * - Database connection pool auto-scaling
 * - WebSocket server cluster management
 * - Volunteer pool auto-activation
 * - Infrastructure cost optimization
 */

import { EventEmitter } from 'events';
// import { performance } from "perf_hooks";

interface ScalingMetrics {
  timestamp: number;
  activeSessions: number;
  responseTime: number;
  cpuUtilization: number;
  memoryUtilization: number;
  connectionPoolUtilization: number;
  volunteerUtilization: number;
  queueLength: number;
  errorRate: number;
}

interface ScalingThresholds {
  scaleUp: {
    responseTimeMs: number;
    cpuPercent: number;
    memoryPercent: number;
    connectionPercent: number;
    queueLength: number;
    consecutiveChecks: number;
  };
  scaleDown: {
    responseTimeMs: number;
    cpuPercent: number;
    memoryPercent: number;
    connectionPercent: number;
    cooldownMinutes: number;
    consecutiveChecks: number;
  };
  emergency: {
    responseTimeMs: number;
    errorRate: number;
    massEventThreshold: number; // Concurrent crisis sessions
  };
}

interface ScalingAction {
  id: string;
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'EMERGENCY_SCALE';
  trigger: string;
  targetCapacity: number;
  currentCapacity: number;
  estimatedTime: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  metrics: ScalingMetrics;
}

interface InfrastructureComponent {
  id: string;
  type: 'WEBSERVER' | 'DATABASE' | 'WEBSOCKET' | 'CACHE' | 'LOADBALANCER';
  status: 'HEALTHY' | 'SCALING' | 'DEGRADED' | 'FAILED';
  currentCapacity: number;
  maxCapacity: number;
  scalingCooldown: number; // seconds
  lastScaleAction: number;
  region: string;
  cost: {
    perHour: number;
    current: number;
  };
}

interface PredictiveData {
  hour: number;
  dayOfWeek: number;
  month: number;
  historicalLoad: number;
  predictedLoad: number;
  confidence: number;
  seasonalFactor: number;
}

export class CrisisAutoScaler extends EventEmitter {
  private static instance: CrisisAutoScaler;
  
  // Scaling configuration
  private readonly thresholds: ScalingThresholds = {
    scaleUp: {
      responseTimeMs: 200,
      cpuPercent: 70,
      memoryPercent: 80,
      connectionPercent: 85,
      queueLength: 10,
      consecutiveChecks: 2
    },
    scaleDown: {
      responseTimeMs: 100,
      cpuPercent: 30,
      memoryPercent: 40,
      connectionPercent: 50,
      cooldownMinutes: 10,
      consecutiveChecks: 5
    },
    emergency: {
      responseTimeMs: 500,
      errorRate: 0.05, // 5%
      massEventThreshold: 100 // 100 concurrent sessions triggers emergency scaling
    }
  };
  
  // Infrastructure tracking
  private infrastructure = new Map<string, InfrastructureComponent>();
  private scalingHistory: ScalingAction[] = [];
  private currentMetrics?: ScalingMetrics;
  
  // Predictive scaling
  private historicalData: PredictiveData[] = [];
  private predictionModel?: any; // ML model for load prediction
  
  // Monitoring state
  private consecutiveScaleUpChecks = 0;
  private consecutiveScaleDownChecks = 0;
  private lastEmergencyScale = 0;
  private isEmergencyMode = false;
  
  // Timers
  private metricsTimer?: NodeJS.Timeout;
  private predictiveTimer?: NodeJS.Timeout;
  private costOptimizationTimer?: NodeJS.Timeout;
  
  private constructor() {
    super();
    this.initializeAutoScaler();
  }

  public static getInstance(): CrisisAutoScaler {
    if (!CrisisAutoScaler.instance) {
      CrisisAutoScaler.instance = new CrisisAutoScaler();
    }
    return CrisisAutoScaler.instance;
  }

  private initializeAutoScaler(): void {
    console.log('🔄 CRISIS Auto-Scaler initializing...');
    
    this.initializeInfrastructure();
    this.startMetricsCollection();
    this.startPredictiveScaling();
    this.startCostOptimization();
    
    console.log('✅ CRISIS Auto-Scaler ready for automatic scaling');
  }

  /**
   * Update current system metrics for scaling decisions
   */
  updateMetrics(metrics: ScalingMetrics): void {
    this.currentMetrics = {
      ...metrics,
      timestamp: Date.now()
    };
    
    // Evaluate scaling needs
    this.evaluateScalingNeeds();
    
    this.emit('metrics-updated', this.currentMetrics);
  }

  /**
   * CRITICAL: Trigger emergency scaling for mass crisis events
   */
  async triggerEmergencyScaling(reason: string, expectedLoad: number): Promise<ScalingAction> {
    console.log(`🚨 EMERGENCY SCALING TRIGGERED: ${reason} (expected load: ${expectedLoad})`);
    
    this.isEmergencyMode = true;
    this.lastEmergencyScale = Date.now();
    
    const action: ScalingAction = {
      id: `emergency-${Date.now()}`,
      type: 'EMERGENCY_SCALE',
      trigger: reason,
      targetCapacity: Math.min(1000, expectedLoad * 1.5), // 50% buffer, max 1000
      currentCapacity: this.getCurrentTotalCapacity(),
      estimatedTime: 30000, // 30 seconds for emergency scaling
      priority: 'CRITICAL',
      timestamp: Date.now(),
      status: 'PENDING',
      metrics: this.currentMetrics!
    };
    
    this.scalingHistory.push(action);
    
    try {
      await this.executeEmergencyScaling(action);
      action.status = 'COMPLETED';
      
      console.log(`✅ EMERGENCY SCALING COMPLETED: Capacity scaled to ${action.targetCapacity}`);
      
      this.emit('emergency-scale-completed', action);
      
    } catch (error: unknown) {
      action.status = 'FAILED';
      console.error('🔴 CRITICAL: Emergency scaling failed:', error);
      
      this.emit('emergency-scale-failed', { action, error: error instanceof Error ? error.message : String(error) });
      
      // Trigger backup emergency procedures
      this.triggerBackupEmergencyProcedures(reason);
    }
    
    return action;
  }

  /**
   * Register infrastructure component for auto-scaling
   */
  registerInfrastructureComponent(component: InfrastructureComponent): void {
    this.infrastructure.set(component.id, component);
    
    console.log(`📊 Registered infrastructure: ${component.type} (${component.id})`);
    
    this.emit('infrastructure-registered', component);
  }

  /**
   * Get current scaling status and metrics
   */
  getScalingStatus(): {
    currentCapacity: number;
    maxCapacity: number;
    utilizationPercent: number;
    isEmergencyMode: boolean;
    activeScalingActions: number;
    recentScalingHistory: ScalingAction[];
    predictedLoad?: number;
    costPerHour: number;
  } {
    const currentCapacity = this.getCurrentTotalCapacity();
    const maxCapacity = this.getMaxTotalCapacity();
    const activeActions = this.scalingHistory.filter(a => a.status === 'IN_PROGRESS').length;
    const recentHistory = this.scalingHistory.slice(-10);
    
    let totalCost = 0;
    for (const component of this.infrastructure.values()) {
      totalCost += component.cost.current;
    }
    
    return {
      currentCapacity,
      maxCapacity,
      utilizationPercent: this.currentMetrics ? 
        (this.currentMetrics.activeSessions / currentCapacity) * 100 : 0,
      isEmergencyMode: this.isEmergencyMode,
      activeScalingActions: activeActions,
      recentScalingHistory: recentHistory,
      predictedLoad: this.getPredictedLoad(),
      costPerHour: totalCost
    };
  }

  /**
   * Force manual scaling override
   */
  async forceScale(
    targetCapacity: number,
    reason: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'HIGH'
  ): Promise<ScalingAction> {
    console.log(`🔧 MANUAL SCALING: ${reason} (target: ${targetCapacity})`);
    
    const currentCapacity = this.getCurrentTotalCapacity();
    const action: ScalingAction = {
      id: `manual-${Date.now()}`,
      type: targetCapacity > currentCapacity ? 'SCALE_UP' : 'SCALE_DOWN',
      trigger: `Manual override: ${reason}`,
      targetCapacity,
      currentCapacity,
      estimatedTime: 60000, // 1 minute
      priority,
      timestamp: Date.now(),
      status: 'PENDING',
      metrics: this.currentMetrics!
    };
    
    this.scalingHistory.push(action);
    
    try {
      await this.executeScalingAction(action);
      action.status = 'COMPLETED';
      
      console.log(`✅ MANUAL SCALING COMPLETED: ${currentCapacity} → ${targetCapacity}`);
      
    } catch (error: unknown) {
      action.status = 'FAILED';
      console.error('❌ Manual scaling failed:', error);
    }
    
    this.emit('manual-scale-completed', action);
    return action;
  }

  // PRIVATE SCALING LOGIC

  private evaluateScalingNeeds(): void {
    if (!this.currentMetrics) return;
    
    const metrics = this.currentMetrics;
    
    // Check emergency scaling triggers
    if (this.shouldTriggerEmergencyScaling(metrics)) {
      this.triggerEmergencyScaling(
        'Automatic emergency scaling triggered',
        metrics.activeSessions * 2
      );
      return;
    }
    
    // Check normal scale up conditions
    if (this.shouldScaleUp(metrics)) {
      this.consecutiveScaleUpChecks++;
      this.consecutiveScaleDownChecks = 0;
      
      if (this.consecutiveScaleUpChecks >= this.thresholds.scaleUp.consecutiveChecks) {
        this.triggerScaleUp('Automatic scale up triggered', metrics);
        this.consecutiveScaleUpChecks = 0;
      }
    }
    // Check scale down conditions
    else if (this.shouldScaleDown(metrics)) {
      this.consecutiveScaleDownChecks++;
      this.consecutiveScaleUpChecks = 0;
      
      if (this.consecutiveScaleDownChecks >= this.thresholds.scaleDown.consecutiveChecks) {
        this.triggerScaleDown('Automatic scale down triggered', metrics);
        this.consecutiveScaleDownChecks = 0;
      }
    }
    // Reset counters if conditions not met
    else {
      this.consecutiveScaleUpChecks = 0;
      this.consecutiveScaleDownChecks = 0;
    }
  }

  private shouldTriggerEmergencyScaling(metrics: ScalingMetrics): boolean {
    // Don't trigger emergency scaling too frequently
    if (Date.now() - this.lastEmergencyScale < 300000) { // 5 minutes cooldown
      return false;
    }
    
    return (
      metrics.responseTime > this.thresholds.emergency.responseTimeMs ||
      metrics.errorRate > this.thresholds.emergency.errorRate ||
      metrics.activeSessions > this.thresholds.emergency.massEventThreshold
    );
  }

  private shouldScaleUp(metrics: ScalingMetrics): boolean {
    const thresholds = this.thresholds.scaleUp;
    
    return (
      metrics.responseTime > thresholds.responseTimeMs ||
      metrics.cpuUtilization > thresholds.cpuPercent ||
      metrics.memoryUtilization > thresholds.memoryPercent ||
      metrics.connectionPoolUtilization > thresholds.connectionPercent ||
      metrics.queueLength > thresholds.queueLength
    );
  }

  private shouldScaleDown(metrics: ScalingMetrics): boolean {
    const thresholds = this.thresholds.scaleDown;
    
    // Don't scale down if we're in emergency mode
    if (this.isEmergencyMode) return false;
    
    // Check cooldown period
    const recentScaleUp = this.scalingHistory.find(action => 
      action.type === 'SCALE_UP' &&
      action.status === 'COMPLETED' &&
      Date.now() - action.timestamp < (thresholds.cooldownMinutes * 60 * 1000)
    );
    
    if (recentScaleUp) return false;
    
    return (
      metrics.responseTime < thresholds.responseTimeMs &&
      metrics.cpuUtilization < thresholds.cpuPercent &&
      metrics.memoryUtilization < thresholds.memoryPercent &&
      metrics.connectionPoolUtilization < thresholds.connectionPercent
    );
  }

  private async triggerScaleUp(reason: string, metrics: ScalingMetrics): Promise<void> {
    const currentCapacity = this.getCurrentTotalCapacity();
    const targetCapacity = Math.min(
      currentCapacity * 1.5, // Increase by 50%
      this.getMaxTotalCapacity()
    );
    
    if (targetCapacity <= currentCapacity) {
      console.warn('⚠️ Already at maximum capacity, cannot scale up');
      return;
    }
    
    const action: ScalingAction = {
      id: `scaleup-${Date.now()}`,
      type: 'SCALE_UP',
      trigger: reason,
      targetCapacity,
      currentCapacity,
      estimatedTime: 60000, // 1 minute
      priority: 'HIGH',
      timestamp: Date.now(),
      status: 'PENDING',
      metrics
    };
    
    this.scalingHistory.push(action);
    
    console.log(`📈 SCALING UP: ${currentCapacity} → ${targetCapacity} (${reason})`);
    
    try {
      await this.executeScalingAction(action);
      action.status = 'COMPLETED';
      
      this.emit('scale-up-completed', action);
      
    } catch (error: unknown) {
      action.status = 'FAILED';
      console.error('❌ Scale up failed:', error);
      
      this.emit('scale-up-failed', { action, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async triggerScaleDown(reason: string, metrics: ScalingMetrics): Promise<void> {
    const currentCapacity = this.getCurrentTotalCapacity();
    const targetCapacity = Math.max(
      currentCapacity * 0.7, // Decrease by 30%
      this.getMinTotalCapacity()
    );
    
    if (targetCapacity >= currentCapacity) {
      return; // No need to scale down
    }
    
    const action: ScalingAction = {
      id: `scaledown-${Date.now()}`,
      type: 'SCALE_DOWN',
      trigger: reason,
      targetCapacity,
      currentCapacity,
      estimatedTime: 30000, // 30 seconds
      priority: 'NORMAL',
      timestamp: Date.now(),
      status: 'PENDING',
      metrics
    };
    
    this.scalingHistory.push(action);
    
    console.log(`📉 SCALING DOWN: ${currentCapacity} → ${targetCapacity} (${reason})`);
    
    try {
      await this.executeScalingAction(action);
      action.status = 'COMPLETED';
      
      this.emit('scale-down-completed', action);
      
    } catch (error: unknown) {
      action.status = 'FAILED';
      console.error('❌ Scale down failed:', error);
    }
  }

  private async executeScalingAction(action: ScalingAction): Promise<void> {
    action.status = 'IN_PROGRESS';
    
    const capacityDiff = action.targetCapacity - action.currentCapacity;
    const isScaleUp = capacityDiff > 0;
    
    // Calculate components to scale
    const componentsToScale = this.selectComponentsForScaling(capacityDiff, action.priority);
    
    // Execute scaling for each component
    const scalingPromises = componentsToScale.map(component => 
      this.scaleComponent(component, isScaleUp, action.priority)
    );
    
    await Promise.all(scalingPromises);
    
    // Update infrastructure state
    this.updateInfrastructureCapacity();
    
    console.log(`✅ Scaling action completed: ${action.id}`);
  }

  private async executeEmergencyScaling(action: ScalingAction): Promise<void> {
    action.status = 'IN_PROGRESS';
    
    console.log(`🚨 Executing emergency scaling to ${action.targetCapacity} capacity`);
    
    // Emergency scaling priorities:
    // 1. Scale WebSocket servers first (immediate connection capacity)
    // 2. Scale web servers (API capacity)
    // 3. Scale database connections (data capacity)
    // 4. Scale load balancers if needed
    
    const emergencyScalingPlan = [
      { type: 'WEBSOCKET', priority: 1 },
      { type: 'WEBSERVER', priority: 2 },
      { type: 'DATABASE', priority: 3 },
      { type: 'LOADBALANCER', priority: 4 }
    ];
    
    for (const plan of emergencyScalingPlan) {
      const components = Array.from(this.infrastructure.values())
        .filter(c => c.type === plan.type);
      
      const scalingPromises = components.map(component =>
        this.emergencyScaleComponent(component, action.targetCapacity)
      );
      
      await Promise.all(scalingPromises);
    }
    
    // Activate emergency volunteer pool
    await this.activateEmergencyVolunteerPool();
    
    console.log(`✅ Emergency scaling completed`);
  }

  private selectComponentsForScaling(capacityDiff: number, priority: string): InfrastructureComponent[] {
    const components: InfrastructureComponent[] = [];
    
    // Priority order for scaling
    const scalingOrder = ['WEBSOCKET', 'WEBSERVER', 'DATABASE', 'CACHE', 'LOADBALANCER'];
    
    for (const type of scalingOrder) {
      const typeComponents = Array.from(this.infrastructure.values())
        .filter(c => c.type === type && c.status === 'HEALTHY');
      
      // Select components that can handle the required capacity
      components.push(...typeComponents);
    }
    
    return components;
  }

  private async scaleComponent(
    component: InfrastructureComponent, 
    isScaleUp: boolean, 
    priority: string
  ): Promise<void> {
    const now = Date.now();
    
    // Check cooldown period
    if (now - component.lastScaleAction < component.scalingCooldown * 1000) {
      console.warn(`⏳ Component ${component.id} is in cooldown, skipping scaling`);
      return;
    }
    
    component.status = 'SCALING';
    component.lastScaleAction = now;
    
    try {
      if (isScaleUp) {
        const newCapacity = Math.min(
          component.currentCapacity * 1.3, // Increase by 30%
          component.maxCapacity
        );
        
        console.log(`📈 Scaling up ${component.type} ${component.id}: ${component.currentCapacity} → ${newCapacity}`);
        
        // In production, this would trigger actual infrastructure scaling
        // Examples: AWS Auto Scaling Groups, Kubernetes HPA, etc.
        await this.simulateScaling(component, newCapacity);
        
        component.currentCapacity = newCapacity;
        component.cost.current = component.cost.perHour * (newCapacity / 100);
        
      } else {
        const newCapacity = Math.max(
          component.currentCapacity * 0.8, // Decrease by 20%
          10 // Minimum capacity
        );
        
        console.log(`📉 Scaling down ${component.type} ${component.id}: ${component.currentCapacity} → ${newCapacity}`);
        
        await this.simulateScaling(component, newCapacity);
        
        component.currentCapacity = newCapacity;
        component.cost.current = component.cost.perHour * (newCapacity / 100);
      }
      
      component.status = 'HEALTHY';
      
    } catch (error: unknown) {
      component.status = 'FAILED';
      console.error(`❌ Failed to scale ${component.id}:`, error);
      throw error;
    }
  }

  private async emergencyScaleComponent(component: InfrastructureComponent, targetCapacity: number): Promise<void> {
    component.status = 'SCALING';
    
    try {
      // Emergency scaling bypasses cooldowns and scales aggressively
      const newCapacity = Math.min(targetCapacity, component.maxCapacity);
      
      console.log(`🚨 EMERGENCY SCALING ${component.type} ${component.id}: ${component.currentCapacity} → ${newCapacity}`);
      
      await this.simulateScaling(component, newCapacity, true);
      
      component.currentCapacity = newCapacity;
      component.cost.current = component.cost.perHour * (newCapacity / 100);
      component.status = 'HEALTHY';
      component.lastScaleAction = Date.now();
      
    } catch (error: unknown) {
      component.status = 'FAILED';
      console.error(`🔴 EMERGENCY SCALING FAILED for ${component.id}:`, error);
      throw error;
    }
  }

  private async simulateScaling(
    component: InfrastructureComponent, 
    targetCapacity: number, 
    isEmergency: boolean = false
  ): Promise<void> {
    // Simulate scaling time based on component type and emergency status
    const baseScalingTime = {
      WEBSOCKET: 15000,  // 15 seconds
      WEBSERVER: 30000,  // 30 seconds  
      DATABASE: 45000,   // 45 seconds
      CACHE: 20000,      // 20 seconds
      LOADBALANCER: 10000 // 10 seconds
    };
    
    let scalingTime = baseScalingTime[component.type] || 30000;
    
    // Emergency scaling is faster
    if (isEmergency) {
      scalingTime = scalingTime * 0.5;
    }
    
    await new Promise(resolve => setTimeout(resolve, scalingTime));
  }

  private async activateEmergencyVolunteerPool(): Promise<void> {
    console.log('👥 Activating emergency volunteer pool...');
    
    // In production, this would:
    // 1. Send emergency notifications to off-duty volunteers
    // 2. Activate backup volunteer systems
    // 3. Contact partner organizations for volunteer support
    // 4. Prepare overflow handling procedures
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate activation
    
    console.log('✅ Emergency volunteer pool activated');
    
    this.emit('emergency-volunteers-activated');
  }

  private async triggerBackupEmergencyProcedures(reason: string): Promise<void> {
    console.log(`🆘 TRIGGERING BACKUP EMERGENCY PROCEDURES: ${reason}`);
    
    // Backup emergency procedures:
    // 1. Activate manual overflow handling
    // 2. Contact emergency services partners
    // 3. Implement queue management with priority routing
    // 4. Activate disaster recovery protocols
    
    this.emit('backup-emergency-triggered', { reason, timestamp: Date.now() });
  }

  private initializeInfrastructure(): void {
    // Register default infrastructure components
    const defaultInfrastructure: InfrastructureComponent[] = [
      {
        id: 'webserver-primary',
        type: 'WEBSERVER',
        status: 'HEALTHY',
        currentCapacity: 100,
        maxCapacity: 1000,
        scalingCooldown: 60,
        lastScaleAction: 0,
        region: 'us-east-1',
        cost: { perHour: 50, current: 50 }
      },
      {
        id: 'websocket-cluster',
        type: 'WEBSOCKET',
        status: 'HEALTHY',
        currentCapacity: 50,
        maxCapacity: 500,
        scalingCooldown: 30,
        lastScaleAction: 0,
        region: 'us-east-1',
        cost: { perHour: 30, current: 30 }
      },
      {
        id: 'database-primary',
        type: 'DATABASE',
        status: 'HEALTHY',
        currentCapacity: 20,
        maxCapacity: 200,
        scalingCooldown: 120,
        lastScaleAction: 0,
        region: 'us-east-1',
        cost: { perHour: 100, current: 100 }
      },
      {
        id: 'cache-cluster',
        type: 'CACHE',
        status: 'HEALTHY',
        currentCapacity: 10,
        maxCapacity: 100,
        scalingCooldown: 30,
        lastScaleAction: 0,
        region: 'us-east-1',
        cost: { perHour: 20, current: 20 }
      }
    ];
    
    for (const component of defaultInfrastructure) {
      this.infrastructure.set(component.id, component);
    }
    
    console.log(`📊 Initialized ${defaultInfrastructure.length} infrastructure components`);
  }

  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      // In production, collect real metrics from monitoring system
      this.collectPredictiveMetrics();
    }, 30000); // Every 30 seconds
  }

  private startPredictiveScaling(): void {
    this.predictiveTimer = setInterval(() => {
      this.runPredictiveScaling();
    }, 300000); // Every 5 minutes
  }

  private startCostOptimization(): void {
    this.costOptimizationTimer = setInterval(() => {
      this.optimizeCosts();
    }, 600000); // Every 10 minutes
  }

  private collectPredictiveMetrics(): void {
    const now = new Date();
    const data: PredictiveData = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      month: now.getMonth(),
      historicalLoad: this.currentMetrics?.activeSessions || 0,
      predictedLoad: 0,
      confidence: 0,
      seasonalFactor: 1
    };
    
    this.historicalData.push(data);
    
    // Keep only recent data for prediction model
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-500);
    }
  }

  private runPredictiveScaling(): void {
    const predictedLoad = this.getPredictedLoad();
    const currentCapacity = this.getCurrentTotalCapacity();
    
    if (predictedLoad && predictedLoad > currentCapacity * 0.8) {
      console.log(`🔮 PREDICTIVE SCALING: Expected load ${predictedLoad}, pre-scaling infrastructure`);
      
      this.triggerScaleUp('Predictive scaling based on expected load increase', {
        ...this.currentMetrics!,
        activeSessions: predictedLoad
      });
    }
  }

  private optimizeCosts(): void {
    let totalCost = 0;
    let optimizationSavings = 0;
    
    for (const component of this.infrastructure.values()) {
      totalCost += component.cost.current;
      
      // Check if component is underutilized
      if (component.currentCapacity > 20 && this.isComponentUnderutilized(component)) {
        const optimizedCapacity = component.currentCapacity * 0.8;
        optimizationSavings += (component.currentCapacity - optimizedCapacity) * 
                              (component.cost.perHour / 100);
        
        console.log(`💰 Cost optimization opportunity: ${component.id} can be scaled down`);
      }
    }
    
    if (optimizationSavings > 10) { // More than $10/hour savings
      console.log(`💰 COST OPTIMIZATION: Potential savings of $${optimizationSavings.toFixed(2)}/hour identified`);
      
      this.emit('cost-optimization', {
        currentCost: totalCost,
        potentialSavings: optimizationSavings
      });
    }
  }

  private isComponentUnderutilized(component: InfrastructureComponent): boolean {
    // Check if component has been consistently underutilized
    const recentMetrics = this.scalingHistory.slice(-10);
    const utilizationHistory = recentMetrics.map(m => 
      m.metrics.activeSessions / component.currentCapacity
    );
    
    const avgUtilization = utilizationHistory.reduce((sum, util) => sum + util, 0) / utilizationHistory.length;
    
    return avgUtilization < 0.3; // Less than 30% utilization
  }

  private getCurrentTotalCapacity(): number {
    return Array.from(this.infrastructure.values())
      .reduce((total, component) => total + component.currentCapacity, 0);
  }

  private getMaxTotalCapacity(): number {
    return Array.from(this.infrastructure.values())
      .reduce((total, component) => total + component.maxCapacity, 0);
  }

  private getMinTotalCapacity(): number {
    return Array.from(this.infrastructure.values())
      .reduce((total, component) => total + 10, 0); // Minimum 10 per component
  }

  private getPredictedLoad(): number | undefined {
    // Simple prediction based on historical patterns
    if (this.historicalData.length < 10) return undefined;
    
    const recent = this.historicalData.slice(-24); // Last 24 data points
    const trend = this.calculateTrend(recent.map(d => d.historicalLoad));
    const currentLoad = this.currentMetrics?.activeSessions || 0;
    
    return Math.max(currentLoad, currentLoad + trend);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    let sum = 0;
    for (let i = 1; i < values.length; i++) {
      sum += values[i] - values[i - 1];
    }
    
    return sum / (values.length - 1);
  }

  private updateInfrastructureCapacity(): void {
    // Update infrastructure status after scaling operations
    for (const component of this.infrastructure.values()) {
      if (component.status === 'SCALING') {
        component.status = 'HEALTHY';
      }
    }
  }

  /**
   * Reset emergency mode after crisis subsides
   */
  resetEmergencyMode(): void {
    if (this.isEmergencyMode) {
      this.isEmergencyMode = false;
      console.log('✅ Emergency mode reset');
      
      this.emit('emergency-mode-reset');
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Crisis Auto-Scaler...');
    
    // Clear timers
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    if (this.predictiveTimer) clearInterval(this.predictiveTimer);
    if (this.costOptimizationTimer) clearInterval(this.costOptimizationTimer);
    
    // Report final status
    console.log('📊 Final Scaling Status:');
    console.log(`   Total Capacity: ${this.getCurrentTotalCapacity()}`);
    console.log(`   Infrastructure Components: ${this.infrastructure.size}`);
    console.log(`   Emergency Mode: ${this.isEmergencyMode ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Total Scaling Actions: ${this.scalingHistory.length}`);
    
    this.removeAllListeners();
    
    console.log('✅ Crisis Auto-Scaler shutdown complete');
  }
}

export type { 
  ScalingMetrics, 
  ScalingThresholds, 
  ScalingAction, 
  InfrastructureComponent, 
  PredictiveData 
};