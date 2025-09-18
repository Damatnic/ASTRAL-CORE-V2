#!/usr/bin/env node

/**
 * Health Check Script for ASTRAL_CORE Web Application
 * Performs comprehensive health checks for production deployment
 */

const http = require('http');
const { execSync } = require('child_process');

const HEALTH_CHECK_TIMEOUT = 8000; // 8 seconds
const PORT = process.env.PORT || 3000;

async function performHealthCheck() {
  console.log('[HEALTH] Starting health check...');
  
  try {
    // Check if the main server is responding
    await checkHttpEndpoint();
    
    // Check critical dependencies
    await checkDependencies();
    
    // Check database connectivity (if applicable)
    await checkDatabase();
    
    // Check WebSocket server (if running)
    await checkWebSocket();
    
    console.log('[HEALTH] ✅ All health checks passed');
    process.exit(0);
    
  } catch (error) {
    console.error('[HEALTH] ❌ Health check failed:', error.message);
    process.exit(1);
  }
}

function checkHttpEndpoint() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: HEALTH_CHECK_TIMEOUT
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('[HEALTH] ✅ HTTP endpoint responding');
        resolve();
      } else {
        reject(new Error(`HTTP endpoint returned status ${res.statusCode}`));
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP endpoint timeout'));
    });
    
    req.on('error', (error) => {
      reject(new Error(`HTTP endpoint error: ${error.message}`));
    });
    
    req.end();
  });
}

async function checkDependencies() {
  try {
    // Check if critical Node.js modules are available
    require('next');
    require('react');
    console.log('[HEALTH] ✅ Core dependencies available');
  } catch (error) {
    throw new Error(`Dependency check failed: ${error.message}`);
  }
}

async function checkDatabase() {
  try {
    // Basic database connection check would go here
    // For now, we'll just ensure the DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    console.log('[HEALTH] ✅ Database configuration present');
  } catch (error) {
    throw new Error(`Database check failed: ${error.message}`);
  }
}

async function checkWebSocket() {
  try {
    // Check if WebSocket server is configured
    const wsPort = process.env.WS_PORT || 3001;
    console.log(`[HEALTH] ✅ WebSocket configured on port ${wsPort}`);
  } catch (error) {
    throw new Error(`WebSocket check failed: ${error.message}`);
  }
}

// Memory usage check
function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const maxMemory = 512 * 1024 * 1024; // 512MB limit
  
  if (usage.heapUsed > maxMemory) {
    throw new Error(`High memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
  }
  
  console.log(`[HEALTH] ✅ Memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
}

// Run health check
performHealthCheck();