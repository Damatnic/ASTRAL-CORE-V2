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

  // Skip npm install - Vercel handles this separately
  console.log('📦 Skipping dependency installation (handled by Vercel)...');

  // Generate Prisma client - more robust Vercel detection
  let prismaGenerated = false;
  
  // Log environment for debugging
  console.log('📍 Current working directory:', process.cwd());
  console.log('🌐 Environment: Vercel =', process.env.VERCEL ? 'true' : 'false');
  console.log('📍 Build path:', process.env.VERCEL_BUILD_OUTPUT_DIRECTORY || 'local');
  
  // Different schema paths for different environments
  const possibleSchemaPaths = process.env.VERCEL ? [
    // Vercel environment paths when deployed from web directory
    '../packages/database/schema.prisma',
    '../../packages/database/schema.prisma', 
    '/vercel/path0/packages/database/schema.prisma',
    'packages/database/schema.prisma',
    '../../../packages/database/schema.prisma'
  ] : [
    // Local development paths  
    '../../packages/database/schema.prisma',
    '../packages/database/schema.prisma'
  ];
  
  let foundSchemaPath = null;
  
  // First, find the schema file
  for (const schemaPath of possibleSchemaPaths) {
    const resolvedPath = path.resolve(schemaPath);
    console.log(`🔍 Checking: ${schemaPath} -> ${resolvedPath}`);
    
    if (fs.existsSync(resolvedPath)) {
      console.log(`✅ Found Prisma schema at: ${schemaPath}`);
      foundSchemaPath = schemaPath;
      break;
    } else {
      console.log(`❌ Not found: ${schemaPath}`);
    }
  }
  
  // If found, copy to web app directory and generate
  if (foundSchemaPath) {
    try {
      // Copy schema to local directory for reliable access  
      const localSchemaPath = './schema.prisma';
      fs.copyFileSync(path.resolve(foundSchemaPath), localSchemaPath);
      console.log(`📋 Copied schema to: ${localSchemaPath}`);
      
      // Modify schema to output client to node_modules location  
      let schemaContent = fs.readFileSync(localSchemaPath, 'utf8');
      
      // Replace the existing output path with the correct .prisma location
      schemaContent = schemaContent.replace(
        /output\s*=\s*"[^"]*"/,
        'output = "./node_modules/.prisma/client"'
      );
      
      fs.writeFileSync(localSchemaPath, schemaContent);
      console.log('📝 Updated schema output path to node_modules/.prisma/client');
      
      // Generate using local copy
      runCommand(`npx prisma generate --schema=${localSchemaPath}`, 'Generating Prisma client');
      
      // Verify client was generated
      if (fs.existsSync('./node_modules/.prisma/client')) {
        console.log('✅ Prisma client generated to node_modules/.prisma/client');
        prismaGenerated = true;
      } else {
        console.warn('⚠️ Client not found in expected location, checking for alternative...');
        throw new Error('Client generation failed');
      }
    } catch (error) {
      console.warn(`⚠️ Generation failed:`, error.message);
      // Try direct generation as fallback
      try {
        runCommand(`npx prisma generate --schema=${foundSchemaPath}`, 'Generating Prisma client (direct)');
        prismaGenerated = true;
      } catch (fallbackError) {
        console.warn(`⚠️ Fallback generation also failed:`, fallbackError.message);
      }
    }
  }

  // Final fallback - search for schema.prisma
  if (!prismaGenerated) {
    console.warn('⚠️ Package generation failed, searching for schema.prisma...');
    
    function findSchemaFile(dir, depth = 0) {
      if (depth > 3) return null; // Limit search depth
      
      try {
        const files = fs.readdirSync(dir);
        
        // Check for schema.prisma in current directory
        if (files.includes('schema.prisma')) {
          return path.join(dir, 'schema.prisma');
        }
        
        // Check subdirectories
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.')) {
            const found = findSchemaFile(fullPath, depth + 1);
            if (found) return found;
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
      return null;
    }
    
    // Search from current directory and parent directories
    const searchDirs = ['.', '..', '../..', '/vercel/path0'].filter(dir => {
      try {
        return fs.existsSync(dir);
      } catch {
        return false;
      }
    });
    
    for (const searchDir of searchDirs) {
      const found = findSchemaFile(path.resolve(searchDir));
      if (found) {
        console.log(`📍 Found schema via search: ${found}`);
        try {
          runCommand(`npx prisma generate --schema=${found}`, 'Generating Prisma client (found via search)');
          
          // Copy generated client to node_modules location
          const generatedPath = './generated/client';
          const targetPath = './node_modules/@prisma/client';
          
          if (fs.existsSync(generatedPath)) {
            console.log('📋 Copying generated client to node_modules...');
            
            // Ensure target directory exists
            fs.mkdirSync('./node_modules/@prisma', { recursive: true });
            
            // Copy the generated client (Linux-compatible for Vercel)
            execSync(`cp -r "${generatedPath}" "${targetPath}"`, { stdio: 'inherit' });
            console.log('✅ Copied Prisma client to node_modules/@prisma/client');
          }
          
          prismaGenerated = true;
          break;
        } catch (error) {
          console.warn(`⚠️ Generation failed with found schema:`, error.message);
        }
      }
    }
  }
  
  if (!prismaGenerated) {
    console.warn('⚠️ Prisma client generation failed - build may have issues with database functionality');
    console.log('📁 Available files and directories:');
    try {
      const listDir = (dir, prefix = '') => {
        if (prefix.length > 10) return; // Prevent deep recursion
        const files = fs.readdirSync(dir).slice(0, 5); // Limit output
        files.forEach(file => {
          console.log(`${prefix}${file}`);
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.') && prefix.length < 5) {
            listDir(fullPath, prefix + '  ');
          }
        });
      };
      listDir('.');
    } catch (e) {
      console.log('Could not list directory structure');
    }
  }

  // Build the application
  runCommand('npm run build', 'Building Next.js application');

  console.log('\n🎉 Vercel build completed successfully!');
  console.log('🌐 ASTRAL CORE V2 is ready for deployment');

} catch (error) {
  console.error('\n💥 Build failed:', error.message);
  process.exit(1);
}