/**
 * ASTRAL_CORE 2.0 - Crisis Test Results Processor
 * Life-critical test result monitoring and alerting
 */

module.exports = (testResults) => {
  const { testResults: results, coverageMap } = testResults;
  
  // Crisis-critical test categories
  const crisisCategories = {
    'crisis': 0,
    'emergency': 0,
    'safety': 0,
    'intervention': 0,
    'security': 0,
    'accessibility': 0
  };
  
  let criticalFailures = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Process each test file
  results.forEach(result => {
    totalTests += result.numPassingTests + result.numFailingTests;
    passedTests += result.numPassingTests;
    failedTests += result.numFailingTests;
    
    // Check for crisis-related test failures
    if (result.numFailingTests > 0) {
      result.testResults.forEach(test => {
        if (test.status === 'failed') {
          const testPath = result.testFilePath;
          const isCritical = Object.keys(crisisCategories).some(category => 
            testPath.toLowerCase().includes(category) ||
            test.fullName.toLowerCase().includes(category)
          );
          
          if (isCritical) {
            criticalFailures.push({
              testPath,
              testName: test.fullName,
              error: test.failureMessages[0],
              isCritical: true
            });
          }
        }
      });
    }
    
    // Categorize tests
    Object.keys(crisisCategories).forEach(category => {
      if (result.testFilePath.toLowerCase().includes(category)) {
        crisisCategories[category] += result.numPassingTests + result.numFailingTests;
      }
    });
  });
  
  // Calculate pass rate
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  // Crisis system requirements: minimum 95% pass rate
  const isPassRateAcceptable = passRate >= 95;
  const hasCriticalFailures = criticalFailures.length > 0;
  
  // Generate detailed report
  console.log('\n🚨 ASTRAL CORE V2 - CRISIS TEST RESULTS 🚨');
  console.log('=' . repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${passRate.toFixed(2)}%)`);
  console.log(`Failed: ${failedTests}`);
  
  console.log('\nCrisis Category Coverage:');
  Object.entries(crisisCategories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} tests`);
  });
  
  if (hasCriticalFailures) {
    console.log('\n❌ CRITICAL FAILURES DETECTED:');
    criticalFailures.forEach((failure, index) => {
      console.log(`  ${index + 1}. ${failure.testName}`);
      console.log(`     File: ${failure.testPath}`);
      console.log(`     Error: ${failure.error.split('\n')[0]}`);
    });
  }
  
  // Coverage analysis for crisis components
  if (coverageMap) {
    const crisisCoverage = {};
    const fileCoverageMap = coverageMap.getCoverageSummary();
    
    Object.keys(fileCoverageMap.data).forEach(file => {
      if (file.includes('crisis') || file.includes('emergency') || file.includes('safety')) {
        const summary = coverageMap.fileCoverageFor(file).toSummary();
        crisisCoverage[file] = {
          statements: summary.statements.pct,
          branches: summary.branches.pct,
          functions: summary.functions.pct,
          lines: summary.lines.pct
        };
      }
    });
    
    console.log('\nCrisis Component Coverage:');
    Object.entries(crisisCoverage).forEach(([file, coverage]) => {
      const avgCoverage = (
        coverage.statements + 
        coverage.branches + 
        coverage.functions + 
        coverage.lines
      ) / 4;
      
      const status = avgCoverage >= 95 ? '✅' : avgCoverage >= 80 ? '⚠️' : '❌';
      console.log(`  ${status} ${file}: ${avgCoverage.toFixed(1)}%`);
    });
  }
  
  // Final assessment
  console.log('\n' + '=' . repeat(50));
  
  if (isPassRateAcceptable && !hasCriticalFailures) {
    console.log('✅ CRISIS PLATFORM READY FOR DEPLOYMENT');
    console.log('All critical systems passing required thresholds');
  } else {
    console.log('❌ CRISIS PLATFORM NOT READY');
    if (!isPassRateAcceptable) {
      console.log(`⚠️  Pass rate ${passRate.toFixed(2)}% below required 95%`);
    }
    if (hasCriticalFailures) {
      console.log(`⚠️  ${criticalFailures.length} critical system failures detected`);
    }
    console.log('IMMEDIATE ACTION REQUIRED - LIVES DEPEND ON THESE SYSTEMS');
  }
  
  console.log('=' . repeat(50) + '\n');
  
  // Return modified results for Jest
  return testResults;
};