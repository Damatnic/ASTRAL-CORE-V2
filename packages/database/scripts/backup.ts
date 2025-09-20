#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

// Backup configuration
const backupConfig = {
  // Backup directory
  backupDir: process.env.BACKUP_DIR || './backups',
  
  // Database connection from environment
  databaseUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
  
  // Retention policy (days)
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  
  // Encryption settings
  encryptBackups: process.env.ENCRYPT_BACKUPS === 'true',
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  
  // S3 backup settings (optional)
  s3Enabled: process.env.S3_BACKUP_ENABLED === 'true',
  s3Bucket: process.env.S3_BACKUP_BUCKET,
  s3Region: process.env.S3_BACKUP_REGION || 'us-east-1',
  
  // Notification settings
  notificationWebhook: process.env.BACKUP_NOTIFICATION_WEBHOOK,
};

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(backupConfig.backupDir)) {
    fs.mkdirSync(backupConfig.backupDir, { recursive: true });
  }
}

// Parse database URL to get connection details
function parseDatabaseUrl(url: string) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid database URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5].split('?')[0], // Remove query params
  };
}

// Create backup filename with timestamp
function getBackupFilename(type: 'full' | 'incremental' = 'full') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `astralcore-${type}-backup-${timestamp}.sql`;
}

// Encrypt backup file
async function encryptBackup(inputFile: string, outputFile: string, key: string) {
  return new Promise<void>((resolve, reject) => {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    
    // Write IV to the beginning of the file
    output.write(iv);
    
    input
      .pipe(cipher)
      .pipe(output)
      .on('finish', () => {
        fs.unlinkSync(inputFile); // Remove unencrypted backup
        resolve();
      })
      .on('error', reject);
  });
}

// Perform database backup using pg_dump
async function performBackup(type: 'full' | 'incremental' = 'full') {
  console.log(`Starting ${type} backup...`);
  
  if (!backupConfig.databaseUrl) {
    throw new Error('DATABASE_URL environment variable not set');
  }
  
  const dbConfig = parseDatabaseUrl(backupConfig.databaseUrl);
  const filename = getBackupFilename(type);
  const filepath = path.join(backupConfig.backupDir, filename);
  
  // Set PGPASSWORD environment variable for pg_dump
  process.env.PGPASSWORD = dbConfig.password;
  
  // Construct pg_dump command
  const pgDumpCommand = [
    'pg_dump',
    `-h ${dbConfig.host}`,
    `-p ${dbConfig.port}`,
    `-U ${dbConfig.user}`,
    `-d ${dbConfig.database}`,
    '-f', filepath,
    '--verbose',
    '--no-owner',
    '--no-privileges',
    '--schema=public',
  ];
  
  // Add options for incremental backup
  if (type === 'incremental') {
    // For incremental, we'll backup only recent data
    pgDumpCommand.push('--data-only');
    pgDumpCommand.push(`--where="created_at >= NOW() - INTERVAL '1 day'"`);
  }
  
  try {
    // Execute pg_dump
    const { stdout, stderr } = await execAsync(pgDumpCommand.join(' '));
    
    if (stderr && !stderr.includes('dumping')) {
      console.warn('Backup warnings:', stderr);
    }
    
    console.log('Backup completed:', filename);
    
    // Encrypt backup if enabled
    if (backupConfig.encryptBackups && backupConfig.encryptionKey) {
      const encryptedFilepath = filepath + '.enc';
      await encryptBackup(filepath, encryptedFilepath, backupConfig.encryptionKey);
      console.log('Backup encrypted:', encryptedFilepath);
      return encryptedFilepath;
    }
    
    return filepath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  } finally {
    // Clean up PGPASSWORD
    delete process.env.PGPASSWORD;
  }
}

// Upload backup to S3 (if configured)
async function uploadToS3(filepath: string) {
  if (!backupConfig.s3Enabled) {
    return;
  }
  
  console.log('Uploading backup to S3...');
  
  const filename = path.basename(filepath);
  const s3Key = `database-backups/${new Date().getFullYear()}/${filename}`;
  
  try {
    const awsCommand = [
      'aws s3 cp',
      filepath,
      `s3://${backupConfig.s3Bucket}/${s3Key}`,
      `--region ${backupConfig.s3Region}`,
      '--storage-class GLACIER_IR', // Use Glacier for cost-effective storage
    ].join(' ');
    
    await execAsync(awsCommand);
    console.log('Backup uploaded to S3:', s3Key);
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
}

// Clean up old backups based on retention policy
async function cleanOldBackups() {
  console.log('Cleaning old backups...');
  
  const files = fs.readdirSync(backupConfig.backupDir);
  const now = Date.now();
  const retentionMs = backupConfig.retentionDays * 24 * 60 * 60 * 1000;
  
  for (const file of files) {
    if (!file.includes('backup')) continue;
    
    const filepath = path.join(backupConfig.backupDir, file);
    const stats = fs.statSync(filepath);
    const age = now - stats.mtimeMs;
    
    if (age > retentionMs) {
      fs.unlinkSync(filepath);
      console.log('Deleted old backup:', file);
    }
  }
}

// Send notification about backup status
async function sendNotification(status: 'success' | 'failure', details: string) {
  if (!backupConfig.notificationWebhook) {
    return;
  }
  
  try {
    const payload = {
      text: `Database Backup ${status.toUpperCase()}`,
      details: details,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
    };
    
    await execAsync(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' ${backupConfig.notificationWebhook}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// Verify backup integrity
async function verifyBackup(filepath: string): Promise<boolean> {
  try {
    const stats = fs.statSync(filepath);
    
    // Check if file exists and has content
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }
    
    // For SQL files, check if it contains expected content
    if (filepath.endsWith('.sql')) {
      const content = fs.readFileSync(filepath, 'utf-8');
      if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
        throw new Error('Backup file does not contain expected SQL content');
      }
    }
    
    console.log('Backup verification passed');
    return true;
  } catch (error) {
    console.error('Backup verification failed:', error);
    return false;
  }
}

// Main backup function
export async function runBackup(options: { type?: 'full' | 'incremental'; skipUpload?: boolean } = {}) {
  const startTime = Date.now();
  
  try {
    // Ensure backup directory exists
    ensureBackupDir();
    
    // Perform the backup
    const backupFile = await performBackup(options.type || 'full');
    
    // Verify backup integrity
    const isValid = await verifyBackup(backupFile);
    if (!isValid) {
      throw new Error('Backup verification failed');
    }
    
    // Upload to S3 if configured and not skipped
    if (!options.skipUpload) {
      await uploadToS3(backupFile);
    }
    
    // Clean old backups
    await cleanOldBackups();
    
    // Calculate duration
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    // Send success notification
    await sendNotification('success', `Backup completed in ${duration} seconds: ${path.basename(backupFile)}`);
    
    console.log(`Backup completed successfully in ${duration} seconds`);
    return backupFile;
    
  } catch (error) {
    // Send failure notification
    await sendNotification('failure', `Backup failed: ${error}`);
    
    console.error('Backup process failed:', error);
    throw error;
  }
}

// Schedule backups (called from cron or scheduler)
export function scheduleBackups() {
  // Full backup daily at 2 AM
  const fullBackupHour = 2;
  
  // Incremental backup every 6 hours
  const incrementalInterval = 6 * 60 * 60 * 1000; // 6 hours in ms
  
  // Schedule full backup
  const scheduleFullBackup = () => {
    const now = new Date();
    const nextBackup = new Date(now);
    nextBackup.setHours(fullBackupHour, 0, 0, 0);
    
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    const delay = nextBackup.getTime() - now.getTime();
    
    setTimeout(async () => {
      await runBackup({ type: 'full' });
      scheduleFullBackup(); // Reschedule for next day
    }, delay);
    
    console.log(`Full backup scheduled for ${nextBackup.toISOString()}`);
  };
  
  // Schedule incremental backups
  setInterval(async () => {
    const hour = new Date().getHours();
    // Skip incremental backup during full backup time
    if (hour !== fullBackupHour) {
      await runBackup({ type: 'incremental' });
    }
  }, incrementalInterval);
  
  scheduleFullBackup();
  console.log('Backup scheduling initialized');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'full':
      runBackup({ type: 'full' })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'incremental':
      runBackup({ type: 'incremental' })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'schedule':
      scheduleBackups();
      break;
      
    default:
      console.log('Usage: backup.ts [full|incremental|schedule]');
      process.exit(1);
  }
}