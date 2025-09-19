// Production Accessibility Testing System - axe-core Integration
import React from 'react';
import type { AxeResults, Result, NodeResult } from 'axe-core';

// Accessibility Violation Interface
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
  tags: string[];
  ruleId: string;
  timestamp: number;
  page: string;
}

// Accessibility Node Interface
export interface AccessibilityNode {
  html: string;
  target: any; // Using any to handle complex axe selector types
  failureSummary: string;
  xpath?: string | string[];
}

// Accessibility Test Report Interface
export interface AccessibilityReport {
  id: string;
  timestamp: number;
  url: string;
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  score: number; // 0-100 accessibility score
  level: 'AA' | 'AAA';
  wcagVersion: '2.1' | '2.2';
}

// Accessibility Testing Configuration
export interface AccessibilityConfig {
  level: 'AA' | 'AAA';
  wcagVersion: '2.1' | '2.2';
  rules?: Record<string, any>;
  tags?: string[];
  reporter?: 'default' | 'v1' | 'v2' | 'raw';
  resultTypes?: Array<'violations' | 'incomplete' | 'passes' | 'inapplicable'>;
  runOnly?: {
    type: 'rule' | 'tag';
    values: string[];
  };
  elementRef?: boolean;
  selectors?: boolean;
  ancestry?: boolean;
  xpath?: boolean;
}

// Production Accessibility Tester Class
export class ProductionAccessibilityTester {
  private axe: any = null;
  private config: AccessibilityConfig;
  private reports: AccessibilityReport[] = [];

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      level: 'AA',
      wcagVersion: '2.2',
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
      resultTypes: ['violations', 'incomplete'],
      elementRef: true,
      selectors: true,
      ancestry: true,
      xpath: true,
      ...config
    };
  }

  // Initialize axe-core
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Accessibility testing can only run in browser environment');
    }

    if (this.axe) return;

    try {
      // Load axe-core dynamically
      this.axe = await import('axe-core');
      
      // Configure axe with our settings
      this.axe.configure({
        reporter: this.config.reporter || 'v2',
        rules: this.config.rules || {},
        tags: this.config.tags,
        locale: 'en'
      });

      console.log('🔍 Accessibility testing initialized with axe-core');
    } catch (error) {
      throw new Error(`Failed to initialize axe-core: ${error}`);
    }
  }

  // Run accessibility audit on current page
  async auditPage(context?: any): Promise<AccessibilityReport> {
    if (!this.axe) {
      await this.initialize();
    }

    try {
      const options = {
        resultTypes: this.config.resultTypes,
        runOnly: this.config.runOnly,
        elementRef: this.config.elementRef,
        selectors: this.config.selectors,
        ancestry: this.config.ancestry,
        xpath: this.config.xpath
      };

      // Run axe audit
      const results: AxeResults = await this.axe.run(context || document, options);
      
      // Process results into our format
      const report = this.processResults(results);
      
      // Store report
      this.reports.push(report);
      
      // Send to monitoring service
      this.sendReport(report);
      
      // Log results in development
      if (process.env.NODE_ENV === 'development') {
        this.logResults(report);
      }

      return report;
    } catch (error) {
      throw new Error(`Accessibility audit failed: ${error}`);
    }
  }

  // Run accessibility audit on specific element
  async auditElement(element: Element | string): Promise<AccessibilityReport> {
    if (!this.axe) {
      await this.initialize();
    }

    const target = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!target) {
      throw new Error('Element not found for accessibility audit');
    }

    return this.auditPage(target);
  }

  // Continuous monitoring setup
  startContinuousMonitoring(interval: number = 30000): void {
    if (typeof window === 'undefined') return;

    // Monitor DOM changes
    const observer = new MutationObserver(async (mutations) => {
      const hasSignificantChanges = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        mutation.removedNodes.length > 0 ||
        (mutation.type === 'attributes' && 
         ['aria-', 'role', 'tabindex'].some(attr => 
           mutation.attributeName?.startsWith(attr)))
      );

      if (hasSignificantChanges) {
        // Debounce rapid changes
        clearTimeout((window as any).a11yTimeout);
        (window as any).a11yTimeout = setTimeout(async () => {
          try {
            await this.auditPage();
          } catch (error) {
            console.warn('Continuous accessibility monitoring failed:', error);
          }
        }, 2000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'aria-expanded', 'aria-selected', 'role', 'tabindex']
    });

    // Periodic full audits
    setInterval(async () => {
      try {
        await this.auditPage();
      } catch (error) {
        console.warn('Periodic accessibility audit failed:', error);
      }
    }, interval);

    console.log('🔄 Continuous accessibility monitoring started');
  }

  // Process axe results into our format
  private processResults(results: AxeResults): AccessibilityReport {
    const violations: AccessibilityViolation[] = results.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact as any,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
        xpath: node.xpath
      })),
      tags: violation.tags,
      ruleId: violation.id,
      timestamp: Date.now(),
      page: window.location.pathname
    }));

    // Calculate accessibility score
    const totalIssues = violations.length + results.incomplete.length;
    const criticalIssues = violations.filter(v => v.impact === 'critical').length;
    const seriousIssues = violations.filter(v => v.impact === 'serious').length;
    const moderateIssues = violations.filter(v => v.impact === 'moderate').length;
    const minorIssues = violations.filter(v => v.impact === 'minor').length;

    // Weighted scoring system
    const score = Math.max(0, 100 - (
      (criticalIssues * 20) +
      (seriousIssues * 10) +
      (moderateIssues * 5) +
      (minorIssues * 2) +
      (results.incomplete.length * 1)
    ));

    const report: AccessibilityReport = {
      id: this.generateReportId(),
      timestamp: Date.now(),
      url: window.location.href,
      violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      score: Math.round(score),
      level: this.config.level,
      wcagVersion: this.config.wcagVersion
    };

    return report;
  }

  // Generate unique report ID
  private generateReportId(): string {
    return `a11y-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send report to monitoring service
  private async sendReport(report: AccessibilityReport): Promise<void> {
    try {
      await fetch('/api/monitoring/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send accessibility report:', error);
      // Store locally as fallback
      this.storeReportLocally(report);
    }
  }

  // Store report locally
  private storeReportLocally(report: AccessibilityReport): void {
    try {
      const stored = localStorage.getItem('accessibility-reports') || '[]';
      const reports: AccessibilityReport[] = JSON.parse(stored);
      reports.push(report);
      
      // Keep only last 10 reports
      if (reports.length > 10) {
        reports.splice(0, reports.length - 10);
      }
      
      localStorage.setItem('accessibility-reports', JSON.stringify(reports));
    } catch (error) {
      console.warn('Failed to store accessibility report locally:', error);
    }
  }

  // Log results in development
  private logResults(report: AccessibilityReport): void {
    console.group(`🔍 Accessibility Report - Score: ${report.score}/100`);
    
    if (report.violations.length > 0) {
      console.group(`❌ ${report.violations.length} Violations Found:`);
      report.violations.forEach(violation => {
        const color = {
          critical: '#ff0000',
          serious: '#ff6600',
          moderate: '#ffaa00',
          minor: '#ffdd00'
        }[violation.impact];
        
        console.group(`%c${violation.impact.toUpperCase()} - ${violation.description}`, 
          `color: ${color}; font-weight: bold`);
        console.log(`Help: ${violation.help}`);
        console.log(`URL: ${violation.helpUrl}`);
        console.log(`Nodes:`, violation.nodes);
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.log('✅ No accessibility violations found!');
    }
    
    console.log(`✅ ${report.passes} tests passed`);
    if (report.incomplete > 0) {
      console.log(`⚠️ ${report.incomplete} tests incomplete`);
    }
    console.log(`ℹ️ ${report.inapplicable} tests not applicable`);
    
    console.groupEnd();
  }

  // Get recent reports
  getReports(): AccessibilityReport[] {
    return [...this.reports];
  }

  // Get latest report
  getLatestReport(): AccessibilityReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null;
  }

  // Clear all reports
  clearReports(): void {
    this.reports = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessibility-reports');
    }
  }
}

// React Hook for Accessibility Testing
export function useAccessibilityTesting(config?: Partial<AccessibilityConfig>) {
  const [tester] = React.useState(() => new ProductionAccessibilityTester(config));
  const [latestReport, setLatestReport] = React.useState<AccessibilityReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Run audit
  const runAudit = React.useCallback(async (context?: any) => {
    setIsLoading(true);
    try {
      const report = await tester.auditPage(context);
      setLatestReport(report);
      return report;
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tester]);

  // Start continuous monitoring
  const startMonitoring = React.useCallback((interval?: number) => {
    tester.startContinuousMonitoring(interval);
  }, [tester]);

  return {
    runAudit,
    startMonitoring,
    latestReport,
    isLoading,
    reports: tester.getReports()
  };
}

// Global accessibility tester instance
let globalTester: ProductionAccessibilityTester | null = null;

// Initialize global accessibility testing
export function initializeAccessibilityTesting(config?: Partial<AccessibilityConfig>): ProductionAccessibilityTester {
  if (!globalTester) {
    globalTester = new ProductionAccessibilityTester(config);
  }
  return globalTester;
}

// Convenience functions
export const accessibilityTesting = {
  init: initializeAccessibilityTesting,
  audit: async (context?: any) => {
    if (!globalTester) {
      globalTester = initializeAccessibilityTesting();
    }
    return globalTester.auditPage(context);
  },
  auditElement: async (element: Element | string) => {
    if (!globalTester) {
      globalTester = initializeAccessibilityTesting();
    }
    return globalTester.auditElement(element);
  },
  startMonitoring: (interval?: number) => {
    if (!globalTester) {
      globalTester = initializeAccessibilityTesting();
    }
    globalTester.startContinuousMonitoring(interval);
  }
};

export default accessibilityTesting;