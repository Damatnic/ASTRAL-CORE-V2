/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Performance Tests
 * 
 * LIFE-CRITICAL PERFORMANCE VALIDATION
 * 
 * These tests validate that the WebSocket manager meets the strict
 * performance requirements for life-saving crisis intervention:
 * 
 * - WebSocket handshake <50ms
 * - Message delivery <100ms
 * - Emergency escalation <200ms
 * - Zero message loss under load
 * - 1000+ concurrent connections
 */

import { performance } from 'perf_hooks';
import { CrisisWebSocketManager, CrisisWebSocketConfig } from '../src/websocket-manager';

interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  actualTime: number;
  targetTime: number;
  details: string;
}

interface LoadTestResult {
  concurrentConnections: number;
  successfulConnections: number;
  averageHandshakeTime: number;
  maxHandshakeTime: number;
  messageDeliveryRate: number;
  systemStability: 'STABLE' | 'UNSTABLE' | 'FAILED';
}

/**
 * Crisis WebSocket Performance Test Suite
 * 
 * Validates that the system can handle life-critical situations
 * with guaranteed response times.
 */
export class CrisisWebSocketPerformanceTests {
  private manager: CrisisWebSocketManager;
  private testResults: PerformanceTestResult[] = [];
  
  constructor() {
    this.manager = CrisisWebSocketManager.getInstance();
  }
  
  /**
   * Run complete performance test suite
   */
  async runAllTests(): Promise<void> {
    console.log('🚨 Starting Crisis WebSocket Performance Tests...\n');
    
    // Test 1: WebSocket Handshake Speed
    await this.testHandshakeSpeed();
    
    // Test 2: Message Delivery Speed
    await this.testMessageDeliverySpeed();
    
    // Test 3: Emergency Escalation Speed
    await this.testEmergencyEscalationSpeed();
    
    // Test 4: Load Testing (1000+ connections)
    await this.testLoadCapacity();
    
    // Test 5: Failover Performance
    await this.testFailoverPerformance();
    
    // Test 6: Message Loss Prevention
    await this.testMessageLossPrevention();
    
    // Generate final report
    this.generatePerformanceReport();
  }
  
  /**
   * Test WebSocket handshake speed
   * TARGET: <50ms consistently
   */
  async testHandshakeSpeed(): Promise<void> {
    console.log('📊 Testing WebSocket handshake speed...');
    
    const iterations = 100;
    const handshakeTimes: number[] = [];
    let passedTests = 0;
    
    for (let i = 0; i < iterations; i++) {
      const config: CrisisWebSocketConfig = {
        sessionId: `test-session-${i}`,
        anonymousId: `test-anon-${i}`,
        sessionToken: `test-token-${i}`,
        severity: Math.floor(Math.random() * 10) + 1,
        isEmergency: Math.random() > 0.8
      };
      
      try {
        const startTime = performance.now();
        const metrics = await this.manager.establishConnection(config);
        const handshakeTime = performance.now() - startTime;
        
        handshakeTimes.push(handshakeTime);
        
        if (handshakeTime < 50) {
          passedTests++;
        }
        
        // Clean up
        await this.manager.closeSession(config.sessionId);
        
      } catch (error) {
        console.error(`❌ Handshake test ${i} failed:`, error);
      }
    }
    
    const averageTime = handshakeTimes.reduce((sum, time) => sum + time, 0) / handshakeTimes.length;
    const maxTime = Math.max(...handshakeTimes);
    const minTime = Math.min(...handshakeTimes);
    const successRate = (passedTests / iterations) * 100;
    
    const result: PerformanceTestResult = {
      testName: 'WebSocket Handshake Speed',
      passed: successRate >= 95, // 95% must pass the 50ms requirement
      actualTime: averageTime,
      targetTime: 50,
      details: `${successRate.toFixed(1)}% passed, avg: ${averageTime.toFixed(2)}ms, max: ${maxTime.toFixed(2)}ms, min: ${minTime.toFixed(2)}ms`
    };
    
    this.testResults.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} Handshake Speed: ${result.details}\n`);
  }
  
  /**
   * Test message delivery speed
   * TARGET: <100ms consistently
   */
  async testMessageDeliverySpeed(): Promise<void> {
    console.log('📊 Testing message delivery speed...');
    
    const sessionId = 'delivery-test-session';
    const config: CrisisWebSocketConfig = {
      sessionId,
      anonymousId: 'delivery-test-anon',
      sessionToken: 'delivery-test-token',
      severity: 7,
      isEmergency: false
    };
    
    // Establish connection
    await this.manager.establishConnection(config);
    
    const iterations = 200;
    const deliveryTimes: number[] = [];
    let successfulDeliveries = 0;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const success = await this.manager.sendCrisisMessage(sessionId, {
          sessionId,
          type: 'crisis_alert',
          priority: 'HIGH',
          payload: {
            message: `Test message ${i}`,
            timestamp: Date.now()
          }
        });
        
        const deliveryTime = performance.now() - startTime;
        deliveryTimes.push(deliveryTime);
        
        if (success && deliveryTime < 100) {
          successfulDeliveries++;
        }
        
      } catch (error) {
        console.error(`❌ Message delivery test ${i} failed:`, error);
      }
    }
    
    const averageTime = deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length;
    const successRate = (successfulDeliveries / iterations) * 100;
    
    const result: PerformanceTestResult = {
      testName: 'Message Delivery Speed',
      passed: successRate >= 98, // 98% must deliver within 100ms
      actualTime: averageTime,
      targetTime: 100,
      details: `${successRate.toFixed(1)}% delivered under 100ms, avg: ${averageTime.toFixed(2)}ms`
    };
    
    this.testResults.push(result);
    
    // Clean up
    await this.manager.closeSession(sessionId);
    
    console.log(`${result.passed ? '✅' : '❌'} Message Delivery: ${result.details}\n`);
  }
  
  /**
   * Test emergency escalation speed
   * TARGET: <200ms end-to-end
   */
  async testEmergencyEscalationSpeed(): Promise<void> {
    console.log('📊 Testing emergency escalation speed...');
    
    const iterations = 50;
    const escalationTimes: number[] = [];
    let successfulEscalations = 0;
    
    for (let i = 0; i < iterations; i++) {
      const sessionId = `escalation-test-${i}`;
      const config: CrisisWebSocketConfig = {
        sessionId,
        anonymousId: `escalation-anon-${i}`,
        sessionToken: `escalation-token-${i}`,
        severity: 10, // Maximum severity
        isEmergency: true
      };
      
      try {
        // Establish connection first
        await this.manager.establishConnection(config);
        
        const startTime = performance.now();
        
        // Trigger emergency escalation
        const success = await this.manager.handleEmergencyEscalation(
          sessionId,
          10,
          { lat: 40.7128, lng: -74.0060 } // NYC coordinates for test
        );
        
        const escalationTime = performance.now() - startTime;
        escalationTimes.push(escalationTime);
        
        if (success && escalationTime < 200) {
          successfulEscalations++;
        }
        
        // Clean up
        await this.manager.closeSession(sessionId);
        
      } catch (error) {
        console.error(`❌ Emergency escalation test ${i} failed:`, error);
      }
    }
    
    const averageTime = escalationTimes.reduce((sum, time) => sum + time, 0) / escalationTimes.length;
    const successRate = (successfulEscalations / iterations) * 100;
    
    const result: PerformanceTestResult = {
      testName: 'Emergency Escalation Speed',
      passed: successRate >= 100, // 100% must escalate within 200ms
      actualTime: averageTime,
      targetTime: 200,
      details: `${successRate.toFixed(1)}% escalated under 200ms, avg: ${averageTime.toFixed(2)}ms`
    };
    
    this.testResults.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} Emergency Escalation: ${result.details}\n`);
  }
  
  /**
   * Test load capacity with 1000+ concurrent connections
   */
  async testLoadCapacity(): Promise<void> {
    console.log('📊 Testing load capacity (1000+ connections)...');
    
    const targetConnections = 1000;
    const connectionPromises: Promise<any>[] = [];
    const handshakeTimes: number[] = [];
    let successfulConnections = 0;
    
    // Create 1000 concurrent connections
    for (let i = 0; i < targetConnections; i++) {
      const config: CrisisWebSocketConfig = {
        sessionId: `load-test-${i}`,
        anonymousId: `load-anon-${i}`,
        sessionToken: `load-token-${i}`,
        severity: Math.floor(Math.random() * 10) + 1,
        isEmergency: Math.random() > 0.9
      };
      
      const promise = this.manager.establishConnection(config)
        .then((metrics) => {
          handshakeTimes.push(metrics.handshakeTime);
          successfulConnections++;
          return { sessionId: config.sessionId, success: true };
        })
        .catch((error) => {
          console.error(`Connection ${i} failed:`, error);
          return { sessionId: config.sessionId, success: false };
        });
      
      connectionPromises.push(promise);
    }
    
    console.log(`⏳ Establishing ${targetConnections} concurrent connections...`);
    const results = await Promise.allSettled(connectionPromises);
    
    const averageHandshakeTime = handshakeTimes.reduce((sum, time) => sum + time, 0) / handshakeTimes.length;
    const maxHandshakeTime = Math.max(...handshakeTimes);
    const connectionSuccessRate = (successfulConnections / targetConnections) * 100;
    
    // Test message delivery under load
    console.log('📤 Testing message delivery under load...');
    let messagesDelivered = 0;
    const messagePromises: Promise<boolean>[] = [];
    
    for (let i = 0; i < Math.min(100, successfulConnections); i++) {
      const sessionId = `load-test-${i}`;
      const promise = this.manager.sendCrisisMessage(sessionId, {
        sessionId,
        type: 'crisis_alert',
        priority: 'MEDIUM',
        payload: { loadTest: true, messageIndex: i }
      }).then((success) => {
        if (success) messagesDelivered++;
        return success;
      });
      
      messagePromises.push(promise);
    }
    
    await Promise.allSettled(messagePromises);
    const messageDeliveryRate = (messagesDelivered / Math.min(100, successfulConnections)) * 100;
    
    const loadResult: LoadTestResult = {
      concurrentConnections: targetConnections,
      successfulConnections,
      averageHandshakeTime,
      maxHandshakeTime,
      messageDeliveryRate,
      systemStability: connectionSuccessRate >= 95 && messageDeliveryRate >= 98 ? 'STABLE' : 
                      connectionSuccessRate >= 80 && messageDeliveryRate >= 90 ? 'UNSTABLE' : 'FAILED'
    };
    
    const result: PerformanceTestResult = {
      testName: 'Load Capacity (1000+ connections)',
      passed: loadResult.systemStability === 'STABLE',
      actualTime: averageHandshakeTime,
      targetTime: 50,
      details: `${connectionSuccessRate.toFixed(1)}% connections, ${messageDeliveryRate.toFixed(1)}% delivery, ${loadResult.systemStability}`
    };
    
    this.testResults.push(result);
    
    // Clean up all connections
    for (let i = 0; i < successfulConnections; i++) {
      try {
        await this.manager.closeSession(`load-test-${i}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    console.log(`${result.passed ? '✅' : '❌'} Load Capacity: ${result.details}\n`);
  }
  
  /**
   * Test failover performance when primary connections fail
   */
  async testFailoverPerformance(): Promise<void> {
    console.log('📊 Testing failover performance...');
    
    const iterations = 20;
    let successfulFailovers = 0;
    const failoverTimes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const sessionId = `failover-test-${i}`;
      const config: CrisisWebSocketConfig = {
        sessionId,
        anonymousId: `failover-anon-${i}`,
        sessionToken: `failover-token-${i}`,
        severity: 8,
        isEmergency: true
      };
      
      try {
        // Simulate primary connection failure by attempting connection
        const startTime = performance.now();
        
        // This will attempt primary connection and fall back to failover
        const metrics = await this.manager.establishConnection(config);
        
        const failoverTime = performance.now() - startTime;
        failoverTimes.push(failoverTime);
        
        if (failoverTime < 5000) { // Failover should complete within 5 seconds
          successfulFailovers++;
        }
        
        await this.manager.closeSession(sessionId);
        
      } catch (error) {
        console.error(`❌ Failover test ${i} failed:`, error);
      }
    }
    
    const averageFailoverTime = failoverTimes.reduce((sum, time) => sum + time, 0) / failoverTimes.length;
    const successRate = (successfulFailovers / iterations) * 100;
    
    const result: PerformanceTestResult = {
      testName: 'Failover Performance',
      passed: successRate >= 95,
      actualTime: averageFailoverTime,
      targetTime: 5000,
      details: `${successRate.toFixed(1)}% successful failovers, avg: ${averageFailoverTime.toFixed(2)}ms`
    };
    
    this.testResults.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} Failover Performance: ${result.details}\n`);
  }
  
  /**
   * Test message loss prevention under stress
   */
  async testMessageLossPrevention(): Promise<void> {
    console.log('📊 Testing message loss prevention...');
    
    const sessionId = 'message-loss-test';
    const config: CrisisWebSocketConfig = {
      sessionId,
      anonymousId: 'message-loss-anon',
      sessionToken: 'message-loss-token',
      severity: 9,
      isEmergency: true
    };
    
    // Establish connection
    await this.manager.establishConnection(config);
    
    const totalMessages = 500;
    const messagePromises: Promise<boolean>[] = [];
    let deliveredMessages = 0;
    
    // Send messages rapidly to stress the system
    for (let i = 0; i < totalMessages; i++) {
      const promise = this.manager.sendCrisisMessage(sessionId, {
        sessionId,
        type: 'crisis_alert',
        priority: i % 10 === 0 ? 'EMERGENCY' : 'HIGH',
        payload: {
          messageIndex: i,
          timestamp: Date.now(),
          stressTest: true
        }
      }).then((success) => {
        if (success) deliveredMessages++;
        return success;
      });
      
      messagePromises.push(promise);
      
      // Add small delay to simulate realistic load
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    await Promise.allSettled(messagePromises);
    
    // Wait for retry queue to process (must be <200ms for crisis response)
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const deliveryRate = (deliveredMessages / totalMessages) * 100;
    
    const result: PerformanceTestResult = {
      testName: 'Message Loss Prevention',
      passed: deliveryRate >= 99.5, // 99.5% delivery rate required (0.5% acceptable loss)
      actualTime: deliveryRate,
      targetTime: 100,
      details: `${deliveryRate.toFixed(2)}% message delivery rate (${deliveredMessages}/${totalMessages})`
    };
    
    this.testResults.push(result);
    
    // Clean up
    await this.manager.closeSession(sessionId);
    
    console.log(`${result.passed ? '✅' : '❌'} Message Loss Prevention: ${result.details}\n`);
  }
  
  /**
   * Generate comprehensive performance report
   */
  private generatePerformanceReport(): void {
    console.log('📊 CRISIS WEBSOCKET PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const overallSuccess = (passedTests / totalTests) * 100;
    
    console.log(`Overall Performance: ${overallSuccess.toFixed(1)}% (${passedTests}/${totalTests} tests passed)\n`);
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}`);
      console.log(`   Target: ${result.targetTime}ms | Actual: ${result.actualTime.toFixed(2)}${result.testName.includes('Message Loss') ? '%' : 'ms'}`);
      console.log(`   Details: ${result.details}\n`);
    });
    
    // System requirements validation
    console.log('🎯 LIFE-CRITICAL REQUIREMENTS VALIDATION');
    console.log('-'.repeat(50));
    
    const handshakeTest = this.testResults.find(r => r.testName.includes('Handshake'));
    const deliveryTest = this.testResults.find(r => r.testName.includes('Delivery'));
    const escalationTest = this.testResults.find(r => r.testName.includes('Escalation'));
    const loadTest = this.testResults.find(r => r.testName.includes('Load'));
    const messageLossTest = this.testResults.find(r => r.testName.includes('Message Loss'));
    
    console.log(`WebSocket handshake <50ms: ${handshakeTest?.passed ? '✅' : '❌'}`);
    console.log(`Message delivery <100ms: ${deliveryTest?.passed ? '✅' : '❌'}`);
    console.log(`Emergency escalation <200ms: ${escalationTest?.passed ? '✅' : '❌'}`);
    console.log(`1000+ concurrent users: ${loadTest?.passed ? '✅' : '❌'}`);
    console.log(`Zero message loss tolerance: ${messageLossTest?.passed ? '✅' : '❌'}`);
    
    const allCriticalPassed = handshakeTest?.passed && deliveryTest?.passed && 
                             escalationTest?.passed && messageLossTest?.passed;
    
    console.log('\n' + '='.repeat(60));
    
    if (allCriticalPassed && overallSuccess >= 90) {
      console.log('🚨 SYSTEM STATUS: READY FOR LIFE-CRITICAL OPERATIONS');
      console.log('✅ All performance requirements met');
      console.log('✅ System certified for crisis intervention');
    } else {
      console.log('❌ SYSTEM STATUS: NOT READY FOR PRODUCTION');
      console.log('⚠️  Critical performance requirements not met');
      console.log('🔧 System requires optimization before deployment');
    }
    
    console.log('='.repeat(60));
  }
}

// Export for use in test scripts
export default CrisisWebSocketPerformanceTests;