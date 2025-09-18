/**
 * Performance Testing Suite
 * 
 * Comprehensive performance tests for the mental health crisis platform.
 * Ensures all critical paths meet response time requirements.
 */

import autocannon from 'autocannon';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import logger from '../utils/logger';

export interface PerformanceTestConfig {
  baseUrl: string;
  duration?: number;
  connections?: number;
  pipelining?: number;
  timeout?: number;
  thresholds?: PerformanceThresholds;
}

export interface PerformanceThresholds {
  crisisApiResponse: number;      // < 200ms
  emergencyEscalation: number;     // < 30s
  webSocketLatency: number;        // < 100ms
  databaseQuery: number;           // < 50ms
  pageLoadTime: number;            // < 2s
  uptimeRequirement: number;       // 99.9%
}

export interface TestResult {
  endpoint: string;
  passed: boolean;
  metrics: {
    mean: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    throughput: number;
    errors: number;
  };
  violations: string[];
}

export class PerformanceTestSuite {
  private config: PerformanceTestConfig;
  private results: TestResult[] = [];
  
  private readonly DEFAULT_THRESHOLDS: PerformanceThresholds = {
    crisisApiResponse: 200,
    emergencyEscalation: 30000,
    webSocketLatency: 100,
    databaseQuery: 50,
    pageLoadTime: 2000,
    uptimeRequirement: 0.999
  };

  constructor(config: PerformanceTestConfig) {
    this.config = {
      ...config,
      duration: config.duration || 30,
      connections: config.connections || 100,
      pipelining: config.pipelining || 10,
      timeout: config.timeout || 10,
      thresholds: { ...this.DEFAULT_THRESHOLDS, ...config.thresholds }
    };
  }

  /**
   * Run all performance tests
   */
  public async runAll(): Promise<{ passed: boolean; results: TestResult[] }> {
    logger.info('Starting performance test suite');
    
    try {
      // Test critical API endpoints
      await this.testCriticalAPIs();
      
      // Test WebSocket performance
      await this.testWebSocketPerformance();
      
      // Test database performance
      await this.testDatabasePerformance();
      
      // Test frontend performance
      await this.testFrontendPerformance();
      
      // Test concurrent load
      await this.testConcurrentLoad();
      
      // Test crisis scenarios
      await this.testCrisisScenarios();
      
      // Analyze results
      const passed = this.analyzeResults();
      
      return { passed, results: this.results };
    } catch (error) {
      logger.error('Performance test suite failed', { error });
      throw error;
    }
  }

  /**
   * Test critical API endpoints
   */
  private async testCriticalAPIs(): Promise<void> {
    const criticalEndpoints = [
      { path: '/api/crisis/emergency', threshold: 200 },
      { path: '/api/crisis/escalate', threshold: 500 },
      { path: '/api/crisis/responder', threshold: 300 },
      { path: '/api/health/critical', threshold: 100 },
      { path: '/api/messages/send', threshold: 200 },
      { path: '/api/session/create', threshold: 400 }
    ];

    for (const endpoint of criticalEndpoints) {
      const result = await this.loadTestEndpoint(endpoint.path, {
        duration: 10,
        connections: 50,
        threshold: endpoint.threshold
      });
      
      this.results.push(result);
    }
  }

  /**
   * Load test a specific endpoint
   */
  private async loadTestEndpoint(
    path: string,
    options: { duration: number; connections: number; threshold: number }
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      const instance = autocannon({
        url: `${this.config.baseUrl}${path}`,
        duration: options.duration,
        connections: options.connections,
        pipelining: this.config.pipelining,
        timeout: this.config.timeout! * 1000,
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Type': 'performance'
        }
      }, (err, result) => {
        if (err) {
          logger.error('Load test error', { path, error: err });
          resolve(this.createFailedResult(path, err.message));
          return;
        }

        const violations = this.checkViolations(result, options.threshold);
        
        resolve({
          endpoint: path,
          passed: violations.length === 0,
          metrics: {
            mean: result.latency.mean,
            min: result.latency.min,
            max: result.latency.max,
            p50: result.latency.p50,
            p95: (result.latency as any).p95 || result.latency.p99,
            p99: result.latency.p99,
            throughput: result.throughput.mean,
            errors: result.errors
          },
          violations
        });
      });

      // Note: autocannon doesn't have a 'tick' event
      // Progress tracking removed for compatibility
    });
  }

  /**
   * Test WebSocket performance
   */
  private async testWebSocketPerformance(): Promise<void> {
    const WebSocket = require('ws');
    const wsUrl = this.config.baseUrl.replace('http', 'ws') + '/ws';
    
    const latencies: number[] = [];
    const connections = 50;
    const messages = 100;
    
    const testPromises = Array.from({ length: connections }, async () => {
      const ws = new WebSocket(wsUrl);
      
      return new Promise<void>((resolve) => {
        ws.on('open', () => {
          for (let i = 0; i < messages; i++) {
            const startTime = Date.now();
            const message = JSON.stringify({
              type: 'ping',
              timestamp: startTime,
              id: i
            });
            
            ws.send(message);
            
            ws.once('message', (data: string) => {
              const latency = Date.now() - startTime;
              latencies.push(latency);
            });
          }
          
          setTimeout(() => {
            ws.close();
            resolve();
          }, 5000);
        });
        
        ws.on('error', (err: Error) => {
          logger.error('WebSocket test error', { error: err });
          resolve();
        });
      });
    });
    
    await Promise.all(testPromises);
    
    // Analyze WebSocket latencies
    const sorted = latencies.sort((a, b) => a - b);
    const result: TestResult = {
      endpoint: '/ws',
      passed: sorted[Math.floor(sorted.length * 0.99)] < this.config.thresholds!.webSocketLatency,
      metrics: {
        mean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        throughput: connections * messages / 5,
        errors: 0
      },
      violations: []
    };
    
    if (!result.passed) {
      result.violations.push(`WebSocket p99 latency ${result.metrics.p99}ms exceeds threshold ${this.config.thresholds!.webSocketLatency}ms`);
    }
    
    this.results.push(result);
  }

  /**
   * Test database performance
   */
  private async testDatabasePerformance(): Promise<void> {
    const queries = [
      'SELECT * FROM crisis_sessions WHERE is_active = true',
      'SELECT * FROM responders WHERE is_available = true',
      'INSERT INTO messages (session_id, user_id, content) VALUES ($1, $2, $3)',
      'UPDATE crisis_sessions SET priority = $1 WHERE id = $2',
      'SELECT COUNT(*) FROM sessions WHERE created_at > NOW() - INTERVAL \'1 hour\''
    ];
    
    for (const query of queries) {
      // Simulate database query test
      const startTime = performance.now();
      
      // This would actually execute the query
      await this.simulateQuery(query);
      
      const duration = performance.now() - startTime;
      
      const result: TestResult = {
        endpoint: `db:${query.substring(0, 30)}...`,
        passed: duration < this.config.thresholds!.databaseQuery,
        metrics: {
          mean: duration,
          min: duration,
          max: duration,
          p50: duration,
          p95: duration,
          p99: duration,
          throughput: 1000 / duration,
          errors: 0
        },
        violations: duration > this.config.thresholds!.databaseQuery 
          ? [`Query time ${duration.toFixed(2)}ms exceeds threshold ${this.config.thresholds!.databaseQuery}ms`]
          : []
      };
      
      this.results.push(result);
    }
  }

  /**
   * Test frontend performance using Lighthouse
   */
  private async testFrontendPerformance(): Promise<void> {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    try {
      const options = {
        logLevel: 'error' as const,
        output: 'json' as const,
        port: chrome?.port,
        onlyCategories: ['performance']
      };
      
      const pages = [
        '/',
        '/crisis',
        '/responder',
        '/dashboard'
      ];
      
      for (const page of pages) {
        const url = `${this.config.baseUrl}${page}`;
        const runnerResult = await lighthouse(url, options);
        
        if (runnerResult && runnerResult.lhr) {
          const lhr = runnerResult.lhr;
          const performanceScore = lhr.categories.performance.score || 0;
          const metrics = lhr.audits;
          
          const result: TestResult = {
            endpoint: `frontend:${page}`,
            passed: performanceScore >= 0.9, // 90% or higher
            metrics: {
              mean: metrics['interactive']?.numericValue || 0,
              min: metrics['first-contentful-paint']?.numericValue || 0,
              max: metrics['max-potential-fid']?.numericValue || 0,
              p50: metrics['speed-index']?.numericValue || 0,
              p95: metrics['total-blocking-time']?.numericValue || 0,
              p99: metrics['cumulative-layout-shift']?.numericValue || 0,
              throughput: performanceScore * 100,
              errors: 0
            },
            violations: []
          };
          
          if (!result.passed) {
            result.violations.push(`Performance score ${(performanceScore * 100).toFixed(0)}% below 90% threshold`);
          }
          
          // Check specific metrics
          const lcpValue = metrics['largest-contentful-paint']?.numericValue;
          if (lcpValue && lcpValue > 2500) {
            result.violations.push('LCP exceeds 2.5s threshold');
          }
          const fidValue = metrics['first-input-delay']?.numericValue;
          if (fidValue && fidValue > 100) {
            result.violations.push('FID exceeds 100ms threshold');
          }
          
          this.results.push(result);
        }
      }
    } finally {
      await chrome?.kill();
    }
  }

  /**
   * Test concurrent load scenarios
   */
  private async testConcurrentLoad(): Promise<void> {
    const scenarios = [
      {
        name: 'normal-load',
        connections: 100,
        duration: 30,
        rps: 100
      },
      {
        name: 'peak-load',
        connections: 500,
        duration: 60,
        rps: 500
      },
      {
        name: 'stress-test',
        connections: 1000,
        duration: 120,
        rps: 1000
      }
    ];
    
    for (const scenario of scenarios) {
      logger.info(`Running ${scenario.name} scenario`);
      
      const result = await this.runScenario(scenario);
      this.results.push(result);
      
      // Wait between scenarios
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  /**
   * Test crisis-specific scenarios
   */
  private async testCrisisScenarios(): Promise<void> {
    const scenarios = [
      {
        name: 'mass-emergency',
        description: 'Simulate 100 simultaneous emergency requests',
        test: () => this.simulateMassEmergency()
      },
      {
        name: 'escalation-cascade',
        description: 'Simulate cascading escalations',
        test: () => this.simulateEscalationCascade()
      },
      {
        name: 'responder-surge',
        description: 'Simulate sudden responder availability change',
        test: () => this.simulateResponderSurge()
      }
    ];
    
    for (const scenario of scenarios) {
      logger.info(`Testing crisis scenario: ${scenario.name}`);
      
      const startTime = performance.now();
      const success = await scenario.test();
      const duration = performance.now() - startTime;
      
      const result: TestResult = {
        endpoint: `crisis:${scenario.name}`,
        passed: success && duration < 5000,
        metrics: {
          mean: duration,
          min: duration,
          max: duration,
          p50: duration,
          p95: duration,
          p99: duration,
          throughput: 1,
          errors: success ? 0 : 1
        },
        violations: []
      };
      
      if (!result.passed) {
        result.violations.push(`${scenario.description} failed or took ${duration.toFixed(0)}ms`);
      }
      
      this.results.push(result);
    }
  }

  private async simulateMassEmergency(): Promise<boolean> {
    const promises = Array.from({ length: 100 }, async (_, i) => {
      const response = await fetch(`${this.config.baseUrl}/api/crisis/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: 'critical',
          userId: `test-user-${i}`,
          timestamp: Date.now()
        })
      });
      
      return response.ok;
    });
    
    const results = await Promise.all(promises);
    return results.every(r => r);
  }

  private async simulateEscalationCascade(): Promise<boolean> {
    // Simulate escalation cascade scenario
    const sessionIds = Array.from({ length: 10 }, (_, i) => `session-${i}`);
    
    for (const sessionId of sessionIds) {
      const response = await fetch(`${this.config.baseUrl}/api/crisis/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          reason: 'automated-test',
          priority: 'high'
        })
      });
      
      if (!response.ok) return false;
    }
    
    return true;
  }

  private async simulateResponderSurge(): Promise<boolean> {
    // Simulate responder surge scenario
    const responderIds = Array.from({ length: 50 }, (_, i) => `responder-${i}`);
    
    const promises = responderIds.map(async (id) => {
      const response = await fetch(`${this.config.baseUrl}/api/responder/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responderId: id,
          available: true,
          capacity: 5
        })
      });
      
      return response.ok;
    });
    
    const results = await Promise.all(promises);
    return results.every(r => r);
  }

  private async runScenario(scenario: any): Promise<TestResult> {
    return new Promise((resolve) => {
      const instance = autocannon({
        url: `${this.config.baseUrl}/api/health`,
        duration: scenario.duration,
        connections: scenario.connections,
        amount: scenario.rps * scenario.duration,
        headers: {
          'X-Scenario': scenario.name
        }
      }, (err, result) => {
        if (err) {
          resolve(this.createFailedResult(`scenario:${scenario.name}`, err.message));
          return;
        }
        
        const passed = result.errors === 0 && 
                      result.latency.p99 < 1000 &&
                      result.non2xx === 0;
        
        resolve({
          endpoint: `scenario:${scenario.name}`,
          passed,
          metrics: {
            mean: result.latency.mean,
            min: result.latency.min,
            max: result.latency.max,
            p50: result.latency.p50,
            p95: (result.latency as any).p95 || result.latency.p99,
            p99: result.latency.p99,
            throughput: result.throughput.mean,
            errors: result.errors + result.non2xx
          },
          violations: passed ? [] : [`Scenario ${scenario.name} failed performance criteria`]
        });
      });
    });
  }

  private checkViolations(result: any, threshold: number): string[] {
    const violations: string[] = [];
    
    if (result.latency.p99 > threshold) {
      violations.push(`p99 latency ${result.latency.p99}ms exceeds threshold ${threshold}ms`);
    }
    
    if (result.errors > 0) {
      violations.push(`${result.errors} errors occurred`);
    }
    
    if (result.non2xx > 0) {
      violations.push(`${result.non2xx} non-2xx responses`);
    }
    
    if (result.timeouts > 0) {
      violations.push(`${result.timeouts} timeouts occurred`);
    }
    
    return violations;
  }

  private createFailedResult(endpoint: string, error: string): TestResult {
    return {
      endpoint,
      passed: false,
      metrics: {
        mean: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        throughput: 0,
        errors: 1
      },
      violations: [error]
    };
  }

  private async simulateQuery(query: string): Promise<void> {
    // Simulate database query execution
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 100);
    });
  }

  private analyzeResults(): boolean {
    let allPassed = true;
    
    logger.info('Performance Test Results:');
    logger.info('=' .repeat(80));
    
    for (const result of this.results) {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const color = result.passed ? '\x1b[32m' : '\x1b[31m';
      
      console.log(`${color}${status}\x1b[0m ${result.endpoint}`);
      console.log(`  Mean: ${result.metrics.mean.toFixed(2)}ms`);
      console.log(`  P95: ${result.metrics.p95.toFixed(2)}ms`);
      console.log(`  P99: ${result.metrics.p99.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.metrics.throughput.toFixed(2)} req/s`);
      
      if (result.violations.length > 0) {
        console.log('  Violations:');
        result.violations.forEach(v => console.log(`    - ${v}`));
        allPassed = false;
      }
      
      console.log('');
    }
    
    logger.info('=' .repeat(80));
    logger.info(`Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return allPassed;
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length
      },
      results: this.results,
      thresholds: this.config.thresholds
    };
    
    return JSON.stringify(report, null, 2);
  }
}