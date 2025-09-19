#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Astral Core V2
 * Executes all test suites and generates coverage reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test execution configuration
const TEST_CONFIG = {
  phases: [
    {
      name: 'Phase 1: Crisis & Safety Tests',
      priority: 'CRITICAL',
      commands: [
        'jest tests/crisis --coverage --coverageDirectory=coverage/crisis',
        'jest tests/ai-therapy/ai-therapy-comprehensive.test.tsx --coverage'
      ]
    },
    {
      name: 'Phase 2: API Endpoint Tests',
      priority: 'HIGH',
      commands: [
        'jest tests/api --coverage --coverageDirectory=coverage/api'
      ]
    },
    {
      name: 'Phase 3: Page Component Tests',
      priority: 'HIGH',
      commands: [
        'jest tests/pages --coverage --coverageDirectory=coverage/pages'
      ]
    },
    {
      name: 'Phase 4: Integration Tests',
      priority: 'MEDIUM',
      commands: [
        'jest tests/integration --coverage --coverageDirectory=coverage/integration'
      ]
    },
    {
      name: 'Phase 5: E2E User Journey Tests',
      priority: 'HIGH',
      commands: [
        'playwright test tests/e2e/comprehensive-user-journeys.spec.ts'
      ]
    },
    {
      name: 'Phase 6: Performance & Security Tests',
      priority: 'CRITICAL',
      commands: [
        'jest tests/performance-security --coverage --coverageDirectory=coverage/security'
      ]
    },
    {
      name: 'Phase 7: Accessibility Tests',
      priority: 'CRITICAL',
      commands: [
        'jest tests/accessibility --coverage --coverageDirectory=coverage/accessibility'
      ]
    }
  ]
};

// Test results collector
class TestResultsCollector {
  constructor() {
    this.results = {
      startTime: new Date(),
      phases: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverage: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      },
      criticalFailures: [],
      warnings: []
    };
  }

  addPhaseResult(phaseName, result, output) {
    const phaseData = {
      name: phaseName,
      passed: result === 0,
      output: output,
      tests: this.extractTestCount(output),
      coverage: this.extractCoverage(output),
      duration: this.extractDuration(output)
    };

    this.results.phases.push(phaseData);
    
    if (!phaseData.passed) {
      this.results.criticalFailures.push({
        phase: phaseName,
        errors: this.extractErrors(output)
      });
    }
  }

  extractTestCount(output) {
    const match = output.match(/Tests:\s+(\d+)\s+passed.*?(\d+)\s+total/);
    if (match) {
      return {
        passed: parseInt(match[1]),
        total: parseInt(match[2])
      };
    }
    return { passed: 0, total: 0 };
  }

  extractCoverage(output) {
    const coverage = {};
    const patterns = {
      lines: /Lines\s+:\s+([\d.]+)%/,
      functions: /Functions\s+:\s+([\d.]+)%/,
      branches: /Branches\s+:\s+([\d.]+)%/,
      statements: /Statements\s+:\s+([\d.]+)%/
    };

    Object.keys(patterns).forEach(key => {
      const match = output.match(patterns[key]);
      if (match) {
        coverage[key] = parseFloat(match[1]);
      }
    });

    return coverage;
  }

  extractDuration(output) {
    const match = output.match(/Time:\s+([\d.]+)\s*s/);
    return match ? parseFloat(match[1]) : 0;
  }

  extractErrors(output) {
    const errors = [];
    const errorPattern = /●.*?FAIL.*?\n(.*?)\n/g;
    let match;
    
    while ((match = errorPattern.exec(output)) !== null) {
      errors.push(match[1].trim());
    }
    
    return errors;
  }

  generateReport() {
    const endTime = new Date();
    this.results.duration = (endTime - this.results.startTime) / 1000;

    // Calculate totals
    this.results.phases.forEach(phase => {
      if (phase.tests) {
        this.results.totalTests += phase.tests.total;
        this.results.passedTests += phase.tests.passed;
        this.results.failedTests += phase.tests.total - phase.tests.passed;
      }
    });

    // Calculate average coverage
    const coverageValues = this.results.phases
      .map(p => p.coverage)
      .filter(c => c && Object.keys(c).length > 0);

    if (coverageValues.length > 0) {
      ['lines', 'functions', 'branches', 'statements'].forEach(metric => {
        const values = coverageValues.map(c => c[metric]).filter(v => v !== undefined);
        if (values.length > 0) {
          this.results.coverage[metric] = 
            values.reduce((a, b) => a + b, 0) / values.length;
        }
      });
    }

    return this.results;
  }

  saveReport(filepath) {
    const report = this.generateReport();
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    return report;
  }

  printSummary() {
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('                    ASTRAL CORE V2 - TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\nExecution Time: ${report.duration.toFixed(2)}s`);
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests} (${((report.passedTests/report.totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${report.failedTests}`);
    
    console.log('\n--- Coverage Summary ---');
    console.log(`Lines:      ${report.coverage.lines.toFixed(2)}%`);
    console.log(`Functions:  ${report.coverage.functions.toFixed(2)}%`);
    console.log(`Branches:   ${report.coverage.branches.toFixed(2)}%`);
    console.log(`Statements: ${report.coverage.statements.toFixed(2)}%`);
    
    if (report.criticalFailures.length > 0) {
      console.log('\n⚠️  CRITICAL FAILURES DETECTED:');
      report.criticalFailures.forEach(failure => {
        console.log(`\n  Phase: ${failure.phase}`);
        failure.errors.slice(0, 3).forEach(error => {
          console.log(`    - ${error}`);
        });
      });
    }
    
    // Check if crisis tests passed (most critical)
    const crisisPhase = report.phases.find(p => p.name.includes('Crisis'));
    if (crisisPhase && !crisisPhase.passed) {
      console.log('\n🚨 CRITICAL: Crisis intervention tests failed!');
      console.log('   Platform should not be deployed until these are fixed.');
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Test Suite for Astral Core V2');
  console.log('   Mental Health Platform - Safety Critical Testing\n');
  
  const collector = new TestResultsCollector();
  let hasFailures = false;
  
  // Create coverage directory
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  // Run each test phase
  for (const phase of TEST_CONFIG.phases) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`▶️  ${phase.name}`);
    console.log(`   Priority: ${phase.priority}`);
    console.log(`${'─'.repeat(60)}\n`);
    
    for (const command of phase.commands) {
      console.log(`   Executing: ${command}`);
      
      try {
        const output = execSync(command, {
          encoding: 'utf8',
          stdio: 'pipe',
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        
        console.log('   ✅ Passed');
        collector.addPhaseResult(phase.name, 0, output);
      } catch (error) {
        console.log('   ❌ Failed');
        hasFailures = true;
        
        const output = error.stdout || error.message;
        collector.addPhaseResult(phase.name, 1, output);
        
        // For critical phases, stop execution
        if (phase.priority === 'CRITICAL') {
          console.error('\n🛑 Critical test failure - stopping execution');
          console.error('   Fix critical issues before continuing');
          break;
        }
      }
    }
  }
  
  // Generate and save reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(coverageDir, `test-report-${timestamp}.json`);
  const htmlReportPath = path.join(coverageDir, 'index.html');
  
  collector.saveReport(reportPath);
  console.log(`\n📊 Test report saved to: ${reportPath}`);
  
  // Generate HTML report
  generateHTMLReport(collector.generateReport(), htmlReportPath);
  console.log(`📄 HTML report saved to: ${htmlReportPath}`);
  
  // Print summary
  collector.printSummary();
  
  // Exit with appropriate code
  if (hasFailures) {
    console.log('\n❌ Test suite completed with failures');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  }
}

// Generate HTML coverage report
function generateHTMLReport(report, filepath) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Astral Core V2 - Test Coverage Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      background: #f8f9fa;
    }
    .metric {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }
    .metric-label {
      color: #666;
      margin-top: 0.5rem;
    }
    .coverage-bar {
      width: 100%;
      height: 30px;
      background: #e0e0e0;
      border-radius: 15px;
      overflow: hidden;
      margin: 1rem 0;
    }
    .coverage-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #8bc34a);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 1rem;
      color: white;
      font-weight: bold;
    }
    .phase-results {
      padding: 2rem;
    }
    .phase {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
    }
    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .phase-name { font-weight: bold; }
    .status-passed { color: #4caf50; }
    .status-failed { color: #f44336; }
    .critical-warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem;
      margin: 1rem 2rem;
      border-radius: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Astral Core V2 - Test Coverage Report</h1>
      <p>Mental Health Platform - Comprehensive Testing Results</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${report.totalTests}</div>
        <div class="metric-label">Total Tests</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #4caf50">${report.passedTests}</div>
        <div class="metric-label">Passed</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: ${report.failedTests > 0 ? '#f44336' : '#4caf50'}">
          ${report.failedTests}
        </div>
        <div class="metric-label">Failed</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.duration.toFixed(1)}s</div>
        <div class="metric-label">Duration</div>
      </div>
    </div>
    
    <div style="padding: 2rem;">
      <h2 style="margin-bottom: 1rem;">Coverage Overview</h2>
      
      <div>
        <div style="display: flex; justify-content: space-between;">
          <span>Lines</span>
          <span>${report.coverage.lines.toFixed(2)}%</span>
        </div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${report.coverage.lines}%">
            ${report.coverage.lines.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between;">
          <span>Functions</span>
          <span>${report.coverage.functions.toFixed(2)}%</span>
        </div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${report.coverage.functions}%">
            ${report.coverage.functions.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between;">
          <span>Branches</span>
          <span>${report.coverage.branches.toFixed(2)}%</span>
        </div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${report.coverage.branches}%">
            ${report.coverage.branches.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between;">
          <span>Statements</span>
          <span>${report.coverage.statements.toFixed(2)}%</span>
        </div>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${report.coverage.statements}%">
            ${report.coverage.statements.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
    
    ${report.criticalFailures.length > 0 ? `
      <div class="critical-warning">
        <strong>⚠️ Critical Issues Detected</strong>
        <p>The following critical test phases have failures that must be addressed:</p>
        <ul style="margin-top: 0.5rem;">
          ${report.criticalFailures.map(f => `<li>${f.phase}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div class="phase-results">
      <h2 style="margin-bottom: 1rem;">Test Phase Results</h2>
      ${report.phases.map(phase => `
        <div class="phase">
          <div class="phase-header">
            <span class="phase-name">${phase.name}</span>
            <span class="${phase.passed ? 'status-passed' : 'status-failed'}">
              ${phase.passed ? '✅ PASSED' : '❌ FAILED'}
            </span>
          </div>
          ${phase.tests ? `
            <div style="color: #666; font-size: 0.9rem;">
              Tests: ${phase.tests.passed}/${phase.tests.total} passed
              ${phase.duration ? `| Duration: ${phase.duration}s` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(filepath, html);
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error during test execution:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, TestResultsCollector };