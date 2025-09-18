#!/usr/bin/env node

/**
 * Vercel Build Script for ASTRAL CORE V2
 * Ensures all dependencies are properly installed and built
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process for ASTRAL CORE V2...');

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

try {
  // Ensure we're in the right directory
  process.chdir(path.join(__dirname, '..'));
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found in apps/web directory');
  }

  // Install dependencies
  runCommand('npm install --legacy-peer-deps', 'Installing dependencies');

  // Generate Prisma client
  try {
    runCommand('npx prisma generate', 'Generating Prisma client');
  } catch (error) {
    console.warn('⚠️ Prisma generation failed, continuing with build...');
  }

  // Build the application
  runCommand('npm run build', 'Building Next.js application');

  console.log('\n🎉 Vercel build completed successfully!');
  console.log('🌐 ASTRAL CORE V2 is ready for deployment');

} catch (error) {
  console.error('\n💥 Build failed:', error.message);
  process.exit(1);
}