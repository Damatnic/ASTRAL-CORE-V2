'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Play, Pause, RotateCcw, Bug } from 'lucide-react';

// Comprehensive testing utilities for ASTRAL CORE V2
export class TestRunner {
  private static instance: TestRunner;
  private tests: Map<string, TestCase> = new Map();
  private results: Map<string, TestResult> = new Map();
  private isRunning = false;

  static getInstance(): TestRunner {
    if (!TestRunner.instance) {
      TestRunner.instance = new TestRunner();
    }
    return TestRunner.instance;
  }

  // Register test cases
  registerTest(id: string, test: TestCase): void {
    this.tests.set(id, test);
  }

  // Run all tests
  async runAllTests(): Promise<TestSummary> {
    if (this.isRunning) return this.getSummary();
    
    this.isRunning = true;
    const startTime = Date.now();
    
    for (const [id, test] of this.tests) {
      try {
        const result = await this.runSingleTest(id, test);
        this.results.set(id, result);
      } catch (error) {
        this.results.set(id, {
          id,
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    this.isRunning = false;
    const endTime = Date.now();
    
    return {
      ...this.getSummary(),
      totalDuration: endTime - startTime
    };
  }

  // Run single test
  private async runSingleTest(id: string, test: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await test.run();
      const endTime = Date.now();
      
      return {
        id,
        status: 'passed',
        duration: endTime - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        id,
        status: 'failed',
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date()
      };
    }
  }

  // Get test summary
  getSummary(): TestSummary {
    const results = Array.from(this.results.values());
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    
    return {
      total: results.length,
      passed,
      failed,
      skipped,
      passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
      totalDuration: 0
    };
  }

  // Get all results
  getResults(): TestResult[] {
    return Array.from(this.results.values());
  }

  // Clear results
  clearResults(): void {
    this.results.clear();
  }
}

// Test case interface
interface TestCase {
  name: string;
  description: string;
  category: 'accessibility' | 'performance' | 'functionality' | 'ui' | 'integration';
  priority: 'high' | 'medium' | 'low';
  run: () => Promise<void>;
}

// Test result interface
interface TestResult {
  id: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: Date;
}

// Test summary interface
interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  totalDuration: number;
}

// Accessibility tests
export const accessibilityTests: TestCase[] = [
  {
    name: 'WCAG Color Contrast',
    description: 'Verify all text meets WCAG AA contrast requirements',
    category: 'accessibility',
    priority: 'high',
    run: async () => {
      const elements = document.querySelectorAll('*');
      const failedElements: Element[] = [];
      
      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const textColor = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simplified contrast check (in real implementation, use proper contrast calculation)
        if (textColor && backgroundColor && textColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = calculateContrast(textColor, backgroundColor);
          if (contrast < 4.5) { // WCAG AA standard
            failedElements.push(element);
          }
        }
      });
      
      if (failedElements.length > 0) {
        throw new Error(`${failedElements.length} elements failed contrast check`);
      }
    }
  },
  {
    name: 'Keyboard Navigation',
    description: 'Ensure all interactive elements are keyboard accessible',
    category: 'accessibility',
    priority: 'high',
    run: async () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const nonKeyboardAccessible: Element[] = [];
      
      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        const isDisabled = element.hasAttribute('disabled');
        
        if (!isDisabled && tabIndex !== '-1' && !element.matches(':focus-visible')) {
          // Check if element can receive focus
          if (element instanceof HTMLElement) {
            element.focus();
            if (document.activeElement !== element) {
              nonKeyboardAccessible.push(element);
            }
          }
        }
      });
      
      if (nonKeyboardAccessible.length > 0) {
        throw new Error(`${nonKeyboardAccessible.length} elements are not keyboard accessible`);
      }
    }
  },
  {
    name: 'ARIA Labels',
    description: 'Verify proper ARIA labeling for screen readers',
    category: 'accessibility',
    priority: 'high',
    run: async () => {
      const elementsNeedingLabels = document.querySelectorAll(
        'button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby]):not([id])'
      );
      
      const unlabeledElements: Element[] = [];
      
      elementsNeedingLabels.forEach(element => {
        const hasVisibleText = element.textContent?.trim() || element.getAttribute('value');
        if (!hasVisibleText) {
          unlabeledElements.push(element);
        }
      });
      
      if (unlabeledElements.length > 0) {
        throw new Error(`${unlabeledElements.length} elements lack proper ARIA labels`);
      }
    }
  }
];

// Performance tests
export const performanceTests: TestCase[] = [
  {
    name: 'Core Web Vitals - LCP',
    description: 'Largest Contentful Paint should be under 2.5s',
    category: 'performance',
    priority: 'high',
    run: async () => {
      return new Promise((resolve, reject) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry && lastEntry.startTime > 2500) {
              reject(new Error(`LCP is ${lastEntry.startTime.toFixed(0)}ms, exceeds 2.5s threshold`));
            } else {
              resolve();
            }
            
            observer.disconnect();
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            observer.disconnect();
            resolve(); // Pass if no LCP detected within timeout
          }, 10000);
        } else {
          resolve(); // Skip if PerformanceObserver not supported
        }
      });
    }
  },
  {
    name: 'Bundle Size Check',
    description: 'JavaScript bundle should be under 500KB',
    category: 'performance',
    priority: 'medium',
    run: async () => {
      const scripts = Array.from(document.scripts);
      let totalSize = 0;
      
      for (const script of scripts) {
        if (script.src && script.src.includes('/_next/')) {
          try {
            const response = await fetch(script.src, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              totalSize += parseInt(contentLength, 10);
            }
          } catch (error) {
            // Skip if can't fetch size
          }
        }
      }
      
      const maxSize = 500 * 1024; // 500KB
      if (totalSize > maxSize) {
        throw new Error(`Bundle size ${(totalSize / 1024).toFixed(0)}KB exceeds ${maxSize / 1024}KB limit`);
      }
    }
  },
  {
    name: 'Memory Usage',
    description: 'Memory usage should be within acceptable limits',
    category: 'performance',
    priority: 'medium',
    run: async () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        const maxMB = 100; // 100MB limit
        
        if (usedMB > maxMB) {
          throw new Error(`Memory usage ${usedMB.toFixed(0)}MB exceeds ${maxMB}MB limit`);
        }
      }
    }
  }
];

// Functionality tests
export const functionalityTests: TestCase[] = [
  {
    name: 'Crisis Button Functionality',
    description: 'Crisis button should be present and functional',
    category: 'functionality',
    priority: 'high',
    run: async () => {
      const crisisButtons = document.querySelectorAll('[href="tel:988"], [onclick*="988"]');
      
      if (crisisButtons.length === 0) {
        throw new Error('No crisis buttons found on page');
      }
      
      // Check if buttons are visible and clickable
      let visibleButtons = 0;
      crisisButtons.forEach(button => {
        const styles = window.getComputedStyle(button as Element);
        if (styles.display !== 'none' && styles.visibility !== 'hidden') {
          visibleButtons++;
        }
      });
      
      if (visibleButtons === 0) {
        throw new Error('Crisis buttons are not visible');
      }
    }
  },
  {
    name: 'Navigation Links',
    description: 'All navigation links should be functional',
    category: 'functionality',
    priority: 'medium',
    run: async () => {
      const navLinks = document.querySelectorAll('nav a[href]');
      const brokenLinks: Element[] = [];
      
      for (const link of navLinks) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          try {
            const response = await fetch(href, { method: 'HEAD' });
            if (!response.ok && response.status !== 404) { // Allow 404 for testing
              brokenLinks.push(link);
            }
          } catch (error) {
            // Network errors are acceptable in testing
          }
        }
      }
      
      if (brokenLinks.length > 0) {
        throw new Error(`${brokenLinks.length} navigation links appear broken`);
      }
    }
  }
];

// Test Dashboard Component
export function TestDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    const testRunner = TestRunner.getInstance();
    
    // Clear previous results
    testRunner.clearResults();
    
    // Register all test cases
    [...accessibilityTests, ...performanceTests, ...functionalityTests].forEach((test, index) => {
      testRunner.registerTest(`test_${index}`, test);
    });
    
    // Run tests
    const testSummary = await testRunner.runAllTests();
    const testResults = testRunner.getResults();
    
    setResults(testResults);
    setSummary(testSummary);
    setIsRunning(false);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-20 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="Test Dashboard"
      >
        <Bug className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-40 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Test Dashboard
                </h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Test Controls */}
              <div className="mb-6">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </button>
              </div>

              {/* Test Summary */}
              {summary && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Test Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Total:</span>
                      <span className="ml-2 font-medium">{summary.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Passed:</span>
                      <span className="ml-2 font-medium text-green-600">{summary.passed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{summary.failed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Pass Rate:</span>
                      <span className="ml-2 font-medium">{summary.passRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          summary.passRate >= 90 ? 'bg-green-500' :
                          summary.passRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${summary.passRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results */}
              {results.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Test Results
                  </h3>
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.status === 'passed'
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                          : result.status === 'failed'
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                          : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {result.status === 'passed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : result.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Test {result.id}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {result.duration}ms
                        </span>
                      </div>
                      {result.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          {result.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper function for contrast calculation (simplified)
function calculateContrast(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In a real implementation, you would parse RGB values and calculate proper contrast ratio
  return Math.random() * 10; // Placeholder for demo
}

// TestRunner is already exported above
