/**
 * ASTRAL Core V2 - Crisis-Safe Error Recovery System
 * 
 * Implements progressive error recovery strategies that prioritize
 * maintaining access to crisis intervention features above all else.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

import { hipaaLogger, LogLevel, LogCategory } from '../logging/hipaa-logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum RecoveryStrategy {
  IMMEDIATE_RETRY = 'immediate_retry',
  DELAYED_RETRY = 'delayed_retry',
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  FALLBACK_SERVICE = 'fallback_service',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  EMERGENCY_MODE = 'emergency_mode',
  SERVICE_BYPASS = 'service_bypass',
}

export enum ServicePriority {
  CRITICAL_CRISIS = 'critical_crisis',      // Emergency contacts, crisis chat
  HIGH_CRISIS = 'high_crisis',             // Safety planning, assessment
  MEDIUM_SUPPORT = 'medium_support',       // Mood tracking, journal
  LOW_GENERAL = 'low_general',             // Analytics, reporting
}

export interface RecoveryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeoutMs: number;
  enableFallback: boolean;
  allowGracefulDegradation: boolean;
  emergencyBypass: boolean;
}

export interface RecoveryAttempt {
  attempt: number;
  timestamp: Date;
  strategy: RecoveryStrategy;
  success: boolean;
  error?: Error;
  duration: number;
}

export interface RecoveryContext {
  serviceName: string;
  priority: ServicePriority;
  operationType: string;
  userId?: string;
  sessionId?: string;
  isCrisisUser?: boolean;
  attempts: RecoveryAttempt[];
  config: RecoveryConfig;
}

// ============================================================================
// RECOVERY CONFIGURATIONS
// ============================================================================

const RECOVERY_CONFIGS: Record<ServicePriority, RecoveryConfig> = {
  [ServicePriority.CRITICAL_CRISIS]: {
    maxRetries: 5,
    baseDelay: 100,       // Very fast retry for crisis features
    maxDelay: 2000,       // Max 2 seconds
    backoffMultiplier: 1.5,
    timeoutMs: 5000,      // 5 second timeout
    enableFallback: true,
    allowGracefulDegradation: true,
    emergencyBypass: true, // Allow bypass for emergency access
  },
  [ServicePriority.HIGH_CRISIS]: {
    maxRetries: 4,
    baseDelay: 200,
    maxDelay: 5000,
    backoffMultiplier: 2,
    timeoutMs: 10000,
    enableFallback: true,
    allowGracefulDegradation: true,
    emergencyBypass: true,
  },
  [ServicePriority.MEDIUM_SUPPORT]: {
    maxRetries: 3,
    baseDelay: 500,
    maxDelay: 10000,
    backoffMultiplier: 2,
    timeoutMs: 15000,
    enableFallback: false,
    allowGracefulDegradation: true,
    emergencyBypass: false,
  },
  [ServicePriority.LOW_GENERAL]: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 3,
    timeoutMs: 30000,
    enableFallback: false,
    allowGracefulDegradation: false,
    emergencyBypass: false,
  },
};

// ============================================================================
// CRISIS RECOVERY ENGINE
// ============================================================================

export class CrisisRecoveryEngine {
  private static instance: CrisisRecoveryEngine;
  private activeRecoveries = new Map<string, RecoveryContext>();
  
  // Emergency contact information - always available
  private readonly emergencyContacts = [
    { name: '988 Crisis Lifeline', phone: '988' },
    { name: '911 Emergency Services', phone: '911' },
    { name: 'Crisis Text Line', phone: '741741', note: 'Text HOME to 741741' },
  ];

  // Fallback services for critical functions
  private readonly fallbackServices = new Map<string, () => Promise<any>>();

  private constructor() {
    this.initializeFallbackServices();
  }

  public static getInstance(): CrisisRecoveryEngine {
    if (!CrisisRecoveryEngine.instance) {
      CrisisRecoveryEngine.instance = new CrisisRecoveryEngine();
    }
    return CrisisRecoveryEngine.instance;
  }

  /**
   * Execute operation with crisis-safe error recovery
   */
  public async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: {
      serviceName: string;
      priority: ServicePriority;
      operationType: string;
      userId?: string;
      sessionId?: string;
      isCrisisUser?: boolean;
    }
  ): Promise<T> {
    const recoveryId = this.generateRecoveryId();
    const config = RECOVERY_CONFIGS[context.priority];
    
    const recoveryContext: RecoveryContext = {
      ...context,
      attempts: [],
      config,
    };

    this.activeRecoveries.set(recoveryId, recoveryContext);

    try {
      const result = await this.attemptOperation(operation, recoveryContext);
      this.activeRecoveries.delete(recoveryId);
      return result;
    } catch (error) {
      this.activeRecoveries.delete(recoveryId);
      
      // For crisis features, provide emergency fallback
      if (context.priority === ServicePriority.CRITICAL_CRISIS || context.isCrisisUser) {
        return this.handleCrisisFailure(error as Error, recoveryContext);
      }
      
      throw error;
    }
  }

  /**
   * Attempt operation with progressive recovery strategies
   */
  private async attemptOperation<T>(
    operation: () => Promise<T>,
    context: RecoveryContext
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= context.config.maxRetries; attempt++) {
      const startTime = Date.now();
      
      try {
        // Add timeout wrapper
        const result = await this.withTimeout(operation(), context.config.timeoutMs);
        
        // Log successful recovery if this wasn't the first attempt
        if (attempt > 1) {
          hipaaLogger.info(LogCategory.CRISIS_INTERVENTION, 
            `Service recovered successfully after ${attempt} attempts`, {
            technical: {
              component: context.serviceName,
              function: context.operationType,
              duration: Date.now() - startTime,
            },
          });
        }

        // Record successful attempt
        context.attempts.push({
          attempt,
          timestamp: new Date(),
          strategy: this.getStrategyForAttempt(attempt, context),
          success: true,
          duration: Date.now() - startTime,
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;
        
        // Record failed attempt
        context.attempts.push({
          attempt,
          timestamp: new Date(),
          strategy: this.getStrategyForAttempt(attempt, context),
          success: false,
          error: lastError,
          duration,
        });

        // Log attempt failure
        hipaaLogger.warn(LogCategory.CRISIS_INTERVENTION,
          `Service attempt ${attempt}/${context.config.maxRetries} failed`, {
          technical: {
            component: context.serviceName,
            function: context.operationType,
            errorCode: lastError.name,
            duration,
          },
          error: lastError,
        });

        // Don't retry on the last attempt
        if (attempt === context.config.maxRetries) {
          break;
        }

        // Apply recovery strategy delay
        const delay = this.calculateDelay(attempt, context.config);
        if (delay > 0) {
          await this.sleep(delay);
        }

        // Check if we should try fallback service
        if (attempt >= 2 && context.config.enableFallback && this.hasFallbackService(context.serviceName)) {
          try {
            const fallbackResult = await this.tryFallbackService(context.serviceName);
            if (fallbackResult !== null) {
              return fallbackResult;
            }
          } catch (fallbackError) {
            hipaaLogger.warn(LogCategory.CRISIS_INTERVENTION,
              'Fallback service also failed', {
              technical: {
                component: `${context.serviceName}_fallback`,
                function: context.operationType,
              },
              error: fallbackError as Error,
            });
          }
        }
      }
    }

    // All attempts failed
    hipaaLogger.error(LogCategory.CRISIS_INTERVENTION,
      `All recovery attempts failed for critical service`, {
      technical: {
        component: context.serviceName,
        function: context.operationType,
      },
      error: lastError!,
    });

    throw lastError!;
  }

  /**
   * Handle crisis feature failures with emergency protocols
   */
  private async handleCrisisFailure<T>(error: Error, context: RecoveryContext): Promise<T> {
    hipaaLogger.critical(LogCategory.CRISIS_INTERVENTION,
      'Crisis service failure - activating emergency protocols', {
      technical: {
        component: context.serviceName,
        function: context.operationType,
      },
      error,
    });

    // For crisis features, return emergency contact information
    const emergencyResponse = {
      error: 'Service temporarily unavailable',
      emergencyContacts: this.emergencyContacts,
      message: 'Crisis support is experiencing technical difficulties. Please use the emergency contacts above for immediate help.',
      fallbackActions: this.generateFallbackActions(context.operationType),
    };

    // This is a fallback response, not the actual expected type
    // In a real implementation, you'd need proper type handling
    return emergencyResponse as any;
  }

  /**
   * Generate fallback actions based on operation type
   */
  private generateFallbackActions(operationType: string): string[] {
    const actions: string[] = [];

    switch (operationType) {
      case 'crisis-chat':
        actions.push(
          'Call 988 Crisis Lifeline for immediate support',
          'Text HOME to 741741 for Crisis Text Line',
          'Call 911 if in immediate danger',
          'Go to nearest emergency room',
          'Contact local crisis intervention team'
        );
        break;
      
      case 'safety-planning':
        actions.push(
          'Use emergency contacts listed above',
          'Remove harmful objects from immediate area',
          'Go to a safe, public location',
          'Contact trusted friend or family member',
          'Use coping strategies you know work for you'
        );
        break;
      
      case 'crisis-assessment':
        actions.push(
          'If having thoughts of self-harm, call 988 immediately',
          'If in immediate danger, call 911',
          'Answer: Are you safe right now? If no, seek help immediately',
          'Contact mental health professional',
          'Use safety plan if you have one'
        );
        break;
      
      default:
        actions.push(
          'Emergency help is always available',
          'Call 988 for crisis support',
          'Call 911 for emergencies',
          'Seek immediate help if feeling unsafe'
        );
    }

    return actions;
  }

  /**
   * Initialize fallback services
   */
  private initializeFallbackServices(): void {
    // Emergency contacts fallback - always works
    this.fallbackServices.set('emergency-contacts', async () => ({
      contacts: this.emergencyContacts,
      source: 'fallback',
    }));

    // Crisis chat fallback - static resources
    this.fallbackServices.set('crisis-chat', async () => ({
      message: 'Crisis chat temporarily unavailable',
      emergencyContacts: this.emergencyContacts,
      alternatives: [
        'Call 988 Crisis Lifeline',
        'Text HOME to 741741',
        'Call 911 for emergencies',
      ],
    }));

    // Safety plan fallback - basic safety steps
    this.fallbackServices.set('safety-plan', async () => ({
      basicSafetySteps: [
        'Remove harmful objects from area',
        'Contact someone you trust',
        'Go to a safe location',
        'Use coping strategies you know',
        'Call emergency services if needed',
      ],
      emergencyContacts: this.emergencyContacts,
    }));
  }

  /**
   * Get recovery strategy for attempt number
   */
  private getStrategyForAttempt(attempt: number, context: RecoveryContext): RecoveryStrategy {
    if (attempt === 1) {
      return RecoveryStrategy.IMMEDIATE_RETRY;
    } else if (attempt === 2) {
      return RecoveryStrategy.DELAYED_RETRY;
    } else if (context.config.enableFallback && attempt === 3) {
      return RecoveryStrategy.FALLBACK_SERVICE;
    } else if (context.priority === ServicePriority.CRITICAL_CRISIS && attempt >= 4) {
      return RecoveryStrategy.EMERGENCY_MODE;
    } else {
      return RecoveryStrategy.EXPONENTIAL_BACKOFF;
    }
  }

  /**
   * Calculate delay between retry attempts
   */
  private calculateDelay(attempt: number, config: RecoveryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Check if fallback service exists
   */
  private hasFallbackService(serviceName: string): boolean {
    return this.fallbackServices.has(serviceName);
  }

  /**
   * Try fallback service
   */
  private async tryFallbackService(serviceName: string): Promise<any> {
    const fallbackFn = this.fallbackServices.get(serviceName);
    if (!fallbackFn) {
      return null;
    }

    return await fallbackFn();
  }

  /**
   * Wrap operation with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique recovery ID
   */
  private generateRecoveryId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get recovery statistics
   */
  public getRecoveryStats(): {
    activeRecoveries: number;
    totalAttempts: number;
    successRate: number;
    averageRecoveryTime: number;
  } {
    const allAttempts = Array.from(this.activeRecoveries.values())
      .flatMap(context => context.attempts);

    const successfulAttempts = allAttempts.filter(attempt => attempt.success);
    const totalDuration = allAttempts.reduce((sum, attempt) => sum + attempt.duration, 0);

    return {
      activeRecoveries: this.activeRecoveries.size,
      totalAttempts: allAttempts.length,
      successRate: allAttempts.length > 0 ? successfulAttempts.length / allAttempts.length : 0,
      averageRecoveryTime: allAttempts.length > 0 ? totalDuration / allAttempts.length : 0,
    };
  }

  /**
   * Emergency bypass for critical situations
   */
  public emergencyBypass(): {
    emergencyContacts: Array<{ name: string; phone: string; note?: string }>;
    message: string;
    timestamp: string;
  } {
    hipaaLogger.critical(LogCategory.CRISIS_INTERVENTION,
      'Emergency bypass activated - all technical safeguards bypassed for user safety');

    return {
      emergencyContacts: this.emergencyContacts,
      message: 'Emergency mode activated. All crisis resources are available below.',
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

const recoveryEngine = CrisisRecoveryEngine.getInstance();

/**
 * Execute crisis operation with automatic recovery
 */
export async function executeCrisisOperation<T>(
  operation: () => Promise<T>,
  context: {
    serviceName: string;
    operationType: string;
    userId?: string;
    sessionId?: string;
    isCrisisUser?: boolean;
  }
): Promise<T> {
  return recoveryEngine.executeWithRecovery(operation, {
    ...context,
    priority: ServicePriority.CRITICAL_CRISIS,
  });
}

/**
 * Execute support operation with recovery
 */
export async function executeSupportOperation<T>(
  operation: () => Promise<T>,
  context: {
    serviceName: string;
    operationType: string;
    userId?: string;
    sessionId?: string;
  }
): Promise<T> {
  return recoveryEngine.executeWithRecovery(operation, {
    ...context,
    priority: ServicePriority.MEDIUM_SUPPORT,
  });
}

/**
 * Get emergency bypass response
 */
export function getEmergencyBypass() {
  return recoveryEngine.emergencyBypass();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { recoveryEngine as crisisRecoveryEngine };
export default CrisisRecoveryEngine;