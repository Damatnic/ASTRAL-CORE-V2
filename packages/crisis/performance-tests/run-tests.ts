/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Performance Test Runner
 * 
 * Execute this script to validate that the WebSocket manager
 * meets all life-critical performance requirements.
 * 
 * Usage: npm run perf:test
 */

import CrisisWebSocketPerformanceTests from './websocket-performance';

async function runPerformanceTests() {
  console.log('🚨 ASTRAL_CORE 2.0 Crisis WebSocket Performance Tests');
  console.log('🔬 Validating life-critical response times...\n');
  
  const testSuite = new CrisisWebSocketPerformanceTests();
  
  try {
    const startTime = Date.now();
    
    await testSuite.runAllTests();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total test execution time: ${(totalTime / 1000).toFixed(2)} seconds`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Performance test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests();
}

export { runPerformanceTests };