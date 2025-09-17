/**
 * Runtime Environment Validator
 * Validates environment configuration at application runtime
 * Ensures critical services are available and properly configured
 */

import { validateEnv, isCrisisSystemConfigured, isMonitoringConfigured, isEmergencyNotificationConfigured } from './env-validator';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    environment: string;
    timestamp: string;
    criticalSystemsOk: boolean;
  };
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

/**
 * Perform runtime validation of environment configuration
 */
export async function validateRuntime(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const startTime = Date.now();
  
  try {
    // Validate environment variables
    validateEnv();
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Environment validation failed: ${error.message}`);
    }
  }
  
  // Check critical systems
  const criticalChecks = await checkCriticalSystems();
  
  criticalChecks.forEach(check => {
    if (check.status === 'unhealthy') {
      errors.push(`Critical service ${check.service} is unhealthy: ${check.error || 'Unknown error'}`);
    } else if (check.status === 'degraded') {
      warnings.push(`Service ${check.service} is degraded: ${check.error || 'Slow response'}`);
    }
  });
  
  // Check feature configurations
  const featureChecks = checkFeatureConfiguration();
  warnings.push(...featureChecks.warnings);
  errors.push(...featureChecks.errors);
  
  const validationTime = Date.now() - startTime;
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      criticalSystemsOk: criticalChecks.every(c => c.status !== 'unhealthy'),
    },
  };
}

/**
 * Check critical system availability
 */
async function checkCriticalSystems(): Promise<HealthCheckResult[]> {
  const checks: Promise<HealthCheckResult>[] = [];
  
  // Check database connectivity
  if (process.env.DATABASE_URL) {
    checks.push(checkDatabase());
  }
  
  // Check Redis if configured
  if (process.env.REDIS_URL) {
    checks.push(checkRedis());
  }
  
  // Check emergency API if configured
  if (process.env.EMERGENCY_CONTACT_API) {
    checks.push(checkEmergencyAPI());
  }
  
  // Check notification services
  if (process.env.TWILIO_ACCOUNT_SID) {
    checks.push(checkTwilio());
  }
  
  if (process.env.SMTP_HOST) {
    checks.push(checkSMTP());
  }
  
  return Promise.all(checks);
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Import database client dynamically to avoid circular dependencies
    // Use eval to bypass TypeScript module resolution at compile time
    let PrismaClient: any;
    try {
      const prismaModule = await eval('import("@prisma/client")');
      PrismaClient = prismaModule.PrismaClient;
    } catch (importError) {
      return {
        service: 'Database',
        status: 'unhealthy',
        error: 'Prisma client not available',
        responseTime: Date.now() - startTime,
      };
    }
    
    const prisma = new PrismaClient();
    
    // Perform a simple query
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'Database',
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      service: 'Database',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Import Redis client dynamically (optional dependency)
    let createClient: any;
    try {
      // Use eval to bypass TypeScript module resolution at compile time
      const redisModule = await eval('import("redis")');
      createClient = redisModule.createClient;
    } catch (importError) {
      return {
        service: 'Redis',
        status: 'unhealthy',
        error: 'Redis module not available',
        responseTime: Date.now() - startTime,
      };
    }
    
    const client = createClient({
      url: process.env.REDIS_URL,
    });
    
    await client.connect();
    await client.ping();
    await client.disconnect();
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'Redis',
      status: responseTime > 500 ? 'degraded' : 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      service: 'Redis',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check Emergency API availability
 */
async function checkEmergencyAPI(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${process.env.EMERGENCY_CONTACT_API}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        service: 'Emergency API',
        status: 'unhealthy',
        error: `HTTP ${response.status}`,
        responseTime,
      };
    }
    
    return {
      service: 'Emergency API',
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      service: 'Emergency API',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check Twilio SMS service
 */
async function checkTwilio(): Promise<HealthCheckResult> {
  try {
    // Validate Twilio credentials format
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const phone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!sid?.startsWith('AC') || sid.length !== 34) {
      return {
        service: 'Twilio SMS',
        status: 'unhealthy',
        error: 'Invalid Account SID format',
      };
    }
    
    if (!token || token.length !== 32) {
      return {
        service: 'Twilio SMS',
        status: 'unhealthy',
        error: 'Invalid Auth Token format',
      };
    }
    
    if (!phone?.match(/^\+\d{10,15}$/)) {
      return {
        service: 'Twilio SMS',
        status: 'unhealthy',
        error: 'Invalid phone number format',
      };
    }
    
    return {
      service: 'Twilio SMS',
      status: 'healthy',
    };
  } catch (error) {
    return {
      service: 'Twilio SMS',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Check SMTP email service
 */
async function checkSMTP(): Promise<HealthCheckResult> {
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    
    if (!host || !port || !user) {
      return {
        service: 'Email (SMTP)',
        status: 'unhealthy',
        error: 'Missing SMTP configuration',
      };
    }
    
    // Basic validation of SMTP settings
    if (!host.includes('.')) {
      return {
        service: 'Email (SMTP)',
        status: 'unhealthy',
        error: 'Invalid SMTP host',
      };
    }
    
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return {
        service: 'Email (SMTP)',
        status: 'unhealthy',
        error: 'Invalid SMTP port',
      };
    }
    
    return {
      service: 'Email (SMTP)',
      status: 'healthy',
    };
  } catch (error) {
    return {
      service: 'Email (SMTP)',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Check feature configuration consistency
 */
function checkFeatureConfiguration(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const env = process.env.NODE_ENV || 'development';
  
  // Crisis features consistency check
  if (process.env.CRISIS_MODE !== env && env !== 'test') {
    warnings.push(`CRISIS_MODE (${process.env.CRISIS_MODE}) doesn't match NODE_ENV (${env})`);
  }
  
  // Emergency escalation configuration
  if (process.env.EMERGENCY_ESCALATION_ENABLED === 'true') {
    if (!process.env.EMERGENCY_CONTACT_API) {
      errors.push('Emergency escalation is enabled but EMERGENCY_CONTACT_API is not configured');
    }
    if (!process.env.CRISIS_WEBHOOK_URL && env === 'production') {
      errors.push('Emergency escalation is enabled but CRISIS_WEBHOOK_URL is not configured');
    }
  }
  
  // AI safety checks configuration
  if (process.env.AI_SAFETY_CHECKS_ENABLED === 'true') {
    if (!process.env.AI_SAFETY_ENDPOINT) {
      warnings.push('AI safety checks are enabled but AI_SAFETY_ENDPOINT is not configured');
    }
    if (!process.env.CONTENT_MODERATION_API) {
      warnings.push('AI safety checks are enabled but CONTENT_MODERATION_API is not configured');
    }
  }
  
  // Volunteer matching configuration
  if (process.env.VOLUNTEER_MATCHING_ENABLED === 'true') {
    if (!process.env.WEBSOCKET_PORT || !process.env.WEBSOCKET_SECRET) {
      warnings.push('Volunteer matching is enabled but WebSocket is not fully configured');
    }
  }
  
  // Production-specific checks
  if (env === 'production') {
    if (!isCrisisSystemConfigured()) {
      errors.push('Crisis system is not fully configured for production');
    }
    if (!isMonitoringConfigured()) {
      errors.push('Monitoring is not configured for production');
    }
    if (!isEmergencyNotificationConfigured()) {
      errors.push('Emergency notifications are not configured for production');
    }
    
    // HIPAA compliance check
    if (!process.env.HIPAA_AUDIT_ENDPOINT) {
      errors.push('HIPAA audit endpoint is required for production');
    }
    
    // Backup configuration check
    if (!process.env.BACKUP_ENDPOINT || !process.env.DISASTER_RECOVERY_WEBHOOK) {
      warnings.push('Backup and disaster recovery not fully configured');
    }
  }
  
  return { errors, warnings };
}

/**
 * Monitor environment configuration continuously
 */
export class EnvironmentMonitor {
  private intervalId?: NodeJS.Timeout;
  private lastValidation?: ValidationResult;
  
  /**
   * Start monitoring environment configuration
   */
  start(intervalMs: number = 60000): void {
    if (this.intervalId) {
      return; // Already monitoring
    }
    
    // Initial validation
    this.validate();
    
    // Set up periodic validation
    this.intervalId = setInterval(() => {
      this.validate();
    }, intervalMs);
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
  
  /**
   * Perform validation and handle results
   */
  private async validate(): Promise<void> {
    try {
      const result = await validateRuntime();
      
      // Log results
      if (!result.valid) {
        console.error('Environment validation failed:', result.errors);
      }
      
      if (result.warnings.length > 0) {
        console.warn('Environment warnings:', result.warnings);
      }
      
      // Check for changes
      if (this.lastValidation) {
        this.detectChanges(this.lastValidation, result);
      }
      
      this.lastValidation = result;
      
      // Emit events or trigger alerts if needed
      if (!result.valid && process.env.NODE_ENV === 'production') {
        this.triggerAlert(result);
      }
    } catch (error) {
      console.error('Environment validation error:', error);
    }
  }
  
  /**
   * Detect changes between validations
   */
  private detectChanges(previous: ValidationResult, current: ValidationResult): void {
    const newErrors = current.errors.filter(e => !previous.errors.includes(e));
    const resolvedErrors = previous.errors.filter(e => !current.errors.includes(e));
    
    if (newErrors.length > 0) {
      console.error('New environment errors detected:', newErrors);
    }
    
    if (resolvedErrors.length > 0) {
      console.info('Environment errors resolved:', resolvedErrors);
    }
  }
  
  /**
   * Trigger alert for critical issues
   */
  private async triggerAlert(result: ValidationResult): Promise<void> {
    if (!process.env.ALERT_WEBHOOK_URL) {
      return;
    }
    
    try {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'environment_validation_failure',
          severity: 'critical',
          environment: result.metadata.environment,
          timestamp: result.metadata.timestamp,
          errors: result.errors,
          warnings: result.warnings,
        }),
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
  
  /**
   * Get last validation result
   */
  getLastValidation(): ValidationResult | undefined {
    return this.lastValidation;
  }
}

// Export singleton instance
export const environmentMonitor = new EnvironmentMonitor();