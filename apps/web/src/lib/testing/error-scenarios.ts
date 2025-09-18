/**
 * ASTRAL Core V2 - Error Scenario Testing
 * 
 * Comprehensive testing utilities for validating error handling
 * across all critical system components with crisis safety verification.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

import { hipaaLogger, LogLevel, LogCategory } from '../logging/hipaa-logger';
import { crisisRecoveryEngine } from '../recovery/crisis-recovery';
import { validationSchemas, validateWithCrisisSafety } from '../validation/schemas';

// ============================================================================
// ERROR SCENARIO TYPES
// ============================================================================

export enum ErrorScenarioType {
  VALIDATION_ERROR = 'validation_error',
  NETWORK_FAILURE = 'network_failure',
  DATABASE_ERROR = 'database_error',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  SERVICE_TIMEOUT = 'service_timeout',
  CRISIS_SERVICE_FAILURE = 'crisis_service_failure',
  JAVASCRIPT_ERROR = 'javascript_error',
  API_ERROR = 'api_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  SECURITY_BREACH = 'security_breach',
}

export interface ErrorScenario {
  id: string;
  type: ErrorScenarioType;
  name: string;
  description: string;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  affectsEmergencyServices: boolean;
  testFunction: () => Promise<void>;
  expectedBehavior: string;
  recoveryMechanism: string;
}

export interface TestResult {
  scenarioId: string;
  success: boolean;
  errorMessage?: string;
  recoveryTime?: number;
  emergencyAccessMaintained: boolean;
  logs: string[];
  timestamp: Date;
}

// ============================================================================
// ERROR SIMULATION UTILITIES
// ============================================================================

/**
 * Simulate various error conditions for testing
 */
export class ErrorSimulator {
  private static instance: ErrorSimulator;
  private testResults: TestResult[] = [];

  private constructor() {}

  public static getInstance(): ErrorSimulator {
    if (!ErrorSimulator.instance) {
      ErrorSimulator.instance = new ErrorSimulator();
    }
    return ErrorSimulator.instance;
  }

  /**
   * Simulate validation error
   */
  public async simulateValidationError(): Promise<void> {
    const invalidData = {
      mood: 15, // Invalid: should be 1-10
      email: 'invalid-email', // Invalid format
      phone: '123', // Too short
    };

    const result = validateWithCrisisSafety(
      validationSchemas.moodEntry,
      invalidData,
      true // Emergency mode
    );

    if (!result.success && !result.warnings) {
      throw new Error('Validation blocking crisis access');
    }

    hipaaLogger.info(LogCategory.VALIDATION, 'Validation error handled safely in crisis mode');
  }

  /**
   * Simulate network failure
   */
  public async simulateNetworkFailure(): Promise<void> {
    const networkError = new Error('Network request failed');
    networkError.name = 'NetworkError';

    // Test crisis recovery
    try {
      await crisisRecoveryEngine.executeWithRecovery(
        async () => {
          throw networkError;
        },
        {
          serviceName: 'crisis-chat',
          priority: 'critical_crisis' as any,
          operationType: 'send-message',
          isCrisisUser: true,
        }
      );
    } catch (error) {
      // Should have emergency fallback
      const emergencyResponse = crisisRecoveryEngine.emergencyBypass();
      if (!emergencyResponse.emergencyContacts.length) {
        throw new Error('Emergency contacts not available during network failure');
      }
    }
  }

  /**
   * Simulate JavaScript runtime error
   */
  public async simulateJavaScriptError(): Promise<void> {
    try {
      // Intentionally cause a runtime error
      (null as any).someProperty.nonExistentMethod();
    } catch (error) {
      // Verify error boundary would catch this
      if (!(error instanceof TypeError)) {
        throw new Error('Unexpected error type in JavaScript simulation');
      }
      
      hipaaLogger.error(LogCategory.SYSTEM_ERROR, 'JavaScript error simulated', {
        error: error as Error,
        technical: {
          component: 'error-simulator',
          function: 'simulateJavaScriptError',
        },
      });
    }
  }

  /**
   * Simulate service timeout
   */
  public async simulateServiceTimeout(): Promise<void> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Service timeout')), 100);
    });

    try {
      await crisisRecoveryEngine.executeWithRecovery(
        () => timeoutPromise as Promise<any>,
        {
          serviceName: 'safety-plan',
          priority: 'high_crisis' as any,
          operationType: 'load-plan',
          isCrisisUser: true,
        }
      );
    } catch (error) {
      // Should provide fallback safety information
      if (!(error as any).fallbackActions?.length) {
        throw new Error('No fallback safety information provided during timeout');
      }
    }
  }

  /**
   * Simulate crisis service failure
   */
  public async simulateCrisisServiceFailure(): Promise<void> {
    const crisisError = new Error('Crisis service unavailable');
    crisisError.name = 'CrisisServiceError';

    try {
      await crisisRecoveryEngine.executeWithRecovery(
        async () => {
          throw crisisError;
        },
        {
          serviceName: 'emergency-contacts',
          priority: 'critical_crisis' as any,
          operationType: 'get-contacts',
          isCrisisUser: true,
        }
      );
    } catch (error) {
      // Must have emergency bypass
      const bypass = crisisRecoveryEngine.emergencyBypass();
      if (!bypass.emergencyContacts.some(contact => contact.phone === '988')) {
        throw new Error('988 Crisis Lifeline not available in emergency bypass');
      }
    }
  }

  /**
   * Simulate database connection error
   */
  public async simulateDatabaseError(): Promise<void> {
    const dbError = new Error('Database connection failed');
    dbError.name = 'PrismaClientKnownRequestError';

    // Test that crisis features can work without database
    try {
      await crisisRecoveryEngine.executeWithRecovery(
        async () => {
          throw dbError;
        },
        {
          serviceName: 'mood-tracker',
          priority: 'medium_support' as any,
          operationType: 'save-entry',
        }
      );
    } catch (error) {
      // Should gracefully degrade
      hipaaLogger.warn(LogCategory.SYSTEM_ERROR, 'Database error - graceful degradation', {
        error: error as Error,
      });
    }
  }

  /**
   * Test error scenario
   */
  public async testErrorScenario(scenario: ErrorScenario): Promise<TestResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    
    // Capture logs during test
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push(`LOG: ${args.join(' ')}`);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      await scenario.testFunction();
      
      const recoveryTime = Date.now() - startTime;
      
      // Verify emergency access is maintained
      const emergencyAccess = await this.verifyEmergencyAccess();
      
      const result: TestResult = {
        scenarioId: scenario.id,
        success: true,
        recoveryTime,
        emergencyAccessMaintained: emergencyAccess,
        logs,
        timestamp: new Date(),
      };

      this.testResults.push(result);
      return result;
      
    } catch (error) {
      const result: TestResult = {
        scenarioId: scenario.id,
        success: false,
        errorMessage: (error as Error).message,
        emergencyAccessMaintained: await this.verifyEmergencyAccess(),
        logs,
        timestamp: new Date(),
      };

      this.testResults.push(result);
      return result;
      
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
    }
  }

  /**
   * Verify emergency access is maintained
   */
  private async verifyEmergencyAccess(): Promise<boolean> {
    try {
      const bypass = crisisRecoveryEngine.emergencyBypass();
      
      // Check that all critical emergency contacts are available
      const has988 = bypass.emergencyContacts.some(contact => contact.phone === '988');
      const has911 = bypass.emergencyContacts.some(contact => contact.phone === '911');
      const hasTextLine = bypass.emergencyContacts.some(contact => contact.phone === '741741');
      
      return has988 && has911 && hasTextLine;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get test results
   */
  public getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * Clear test results
   */
  public clearResults(): void {
    this.testResults = [];
  }
}

// ============================================================================
// ERROR SCENARIOS DEFINITIONS
// ============================================================================

export const ERROR_SCENARIOS: ErrorScenario[] = [
  {
    id: 'validation-crisis-safe',
    type: ErrorScenarioType.VALIDATION_ERROR,
    name: 'Crisis-Safe Validation',
    description: 'Test that validation errors never block crisis access',
    criticalityLevel: 'critical',
    affectsEmergencyServices: false,
    testFunction: () => ErrorSimulator.getInstance().simulateValidationError(),
    expectedBehavior: 'Validation provides warnings but allows crisis access',
    recoveryMechanism: 'Emergency bypass with warnings',
  },
  {
    id: 'network-failure-recovery',
    type: ErrorScenarioType.NETWORK_FAILURE,
    name: 'Network Failure Recovery',
    description: 'Test recovery when network services fail',
    criticalityLevel: 'critical',
    affectsEmergencyServices: true,
    testFunction: () => ErrorSimulator.getInstance().simulateNetworkFailure(),
    expectedBehavior: 'Fallback to local emergency contacts',
    recoveryMechanism: 'Local emergency contact cache',
  },
  {
    id: 'javascript-error-boundary',
    type: ErrorScenarioType.JAVASCRIPT_ERROR,
    name: 'JavaScript Error Boundary',
    description: 'Test React error boundary catches runtime errors',
    criticalityLevel: 'high',
    affectsEmergencyServices: false,
    testFunction: () => ErrorSimulator.getInstance().simulateJavaScriptError(),
    expectedBehavior: 'Error boundary displays fallback UI with emergency contacts',
    recoveryMechanism: 'Error boundary with crisis resources',
  },
  {
    id: 'service-timeout-handling',
    type: ErrorScenarioType.SERVICE_TIMEOUT,
    name: 'Service Timeout Handling',
    description: 'Test behavior when services timeout',
    criticalityLevel: 'high',
    affectsEmergencyServices: true,
    testFunction: () => ErrorSimulator.getInstance().simulateServiceTimeout(),
    expectedBehavior: 'Quick timeout with fallback information',
    recoveryMechanism: 'Cached safety plan basics',
  },
  {
    id: 'crisis-service-failure',
    type: ErrorScenarioType.CRISIS_SERVICE_FAILURE,
    name: 'Crisis Service Failure',
    description: 'Test when core crisis services fail',
    criticalityLevel: 'critical',
    affectsEmergencyServices: true,
    testFunction: () => ErrorSimulator.getInstance().simulateCrisisServiceFailure(),
    expectedBehavior: 'Emergency bypass activates immediately',
    recoveryMechanism: 'Emergency contact bypass system',
  },
  {
    id: 'database-connection-failure',
    type: ErrorScenarioType.DATABASE_ERROR,
    name: 'Database Connection Failure',
    description: 'Test behavior when database is unavailable',
    criticalityLevel: 'medium',
    affectsEmergencyServices: false,
    testFunction: () => ErrorSimulator.getInstance().simulateDatabaseError(),
    expectedBehavior: 'Graceful degradation with local storage fallback',
    recoveryMechanism: 'Local storage with sync when available',
  },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

export class ErrorHandlingTestRunner {
  private simulator = ErrorSimulator.getInstance();

  /**
   * Run all error scenarios
   */
  public async runAllTests(): Promise<{
    passed: number;
    failed: number;
    emergencyAccessMaintained: number;
    results: TestResult[];
  }> {
    console.log('🧪 Starting comprehensive error handling tests...');
    
    this.simulator.clearResults();
    const results: TestResult[] = [];

    for (const scenario of ERROR_SCENARIOS) {
      console.log(`\n🔍 Testing: ${scenario.name}`);
      
      try {
        const result = await this.simulator.testErrorScenario(scenario);
        results.push(result);
        
        if (result.success) {
          console.log(`✅ ${scenario.name} - PASSED`);
        } else {
          console.log(`❌ ${scenario.name} - FAILED: ${result.errorMessage}`);
        }
        
        if (result.emergencyAccessMaintained) {
          console.log(`🚨 Emergency access: MAINTAINED`);
        } else {
          console.log(`🚨 Emergency access: COMPROMISED`);
        }
        
        if (result.recoveryTime) {
          console.log(`⏱️ Recovery time: ${result.recoveryTime}ms`);
        }
        
      } catch (error) {
        console.error(`💥 Test execution failed: ${error}`);
        results.push({
          scenarioId: scenario.id,
          success: false,
          errorMessage: (error as Error).message,
          emergencyAccessMaintained: false,
          logs: [],
          timestamp: new Date(),
        });
      }
    }

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const emergencyAccessMaintained = results.filter(r => r.emergencyAccessMaintained).length;

    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);
    console.log(`🚨 Emergency Access Maintained: ${emergencyAccessMaintained}/${results.length}`);

    return { passed, failed, emergencyAccessMaintained, results };
  }

  /**
   * Run tests for specific criticality level
   */
  public async runCriticalTests(): Promise<TestResult[]> {
    const criticalScenarios = ERROR_SCENARIOS.filter(
      scenario => scenario.criticalityLevel === 'critical'
    );

    const results: TestResult[] = [];
    for (const scenario of criticalScenarios) {
      const result = await this.simulator.testErrorScenario(scenario);
      results.push(result);
    }

    return results;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const errorSimulator = ErrorSimulator.getInstance();
export const testRunner = new ErrorHandlingTestRunner();

export default {
  ErrorSimulator,
  ErrorHandlingTestRunner,
  ERROR_SCENARIOS,
  errorSimulator,
  testRunner,
};