#!/usr/bin/env node

/**
 * Health Check Script for ASTRAL_CORE Admin Dashboard
 * Enhanced security checks for administrative interface
 */

const http = require('http');

const HEALTH_CHECK_TIMEOUT = 8000;
const PORT = process.env.PORT || 3002;

async function performHealthCheck() {
  console.log('[ADMIN-HEALTH] Starting admin dashboard health check...');
  
  try {
    // Check if the admin server is responding
    await checkHttpEndpoint();
    
    // Check critical dependencies
    await checkDependencies();
    
    // Check admin-specific configurations
    await checkAdminConfig();
    
    // Memory usage check
    checkMemoryUsage();
    
    console.log('[ADMIN-HEALTH] ✅ All admin health checks passed');
    process.exit(0);
    
  } catch (error) {
    console.error('[ADMIN-HEALTH] ❌ Admin health check failed:', error.message);
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
        console.log('[ADMIN-HEALTH] ✅ Admin HTTP endpoint responding');
        resolve();
      } else {
        reject(new Error(`Admin HTTP endpoint returned status ${res.statusCode}`));
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Admin HTTP endpoint timeout'));
    });
    
    req.on('error', (error) => {
      reject(new Error(`Admin HTTP endpoint error: ${error.message}`));
    });
    
    req.end();
  });
}

async function checkDependencies() {
  try {
    require('next');
    require('react');
    require('zustand');
    console.log('[ADMIN-HEALTH] ✅ Admin dependencies available');
  } catch (error) {
    throw new Error(`Admin dependency check failed: ${error.message}`);
  }
}

async function checkAdminConfig() {
  try {
    // Check admin-specific environment variables
    const requiredVars = ['DATABASE_URL'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Required admin environment variable ${varName} not set`);
      }
    }
    console.log('[ADMIN-HEALTH] ✅ Admin configuration valid');
  } catch (error) {
    throw new Error(`Admin config check failed: ${error.message}`);
  }
}

function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const maxMemory = 256 * 1024 * 1024; // 256MB limit for admin
  
  if (usage.heapUsed > maxMemory) {
    throw new Error(`Admin high memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
  }
  
  console.log(`[ADMIN-HEALTH] ✅ Admin memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
}

performHealthCheck();