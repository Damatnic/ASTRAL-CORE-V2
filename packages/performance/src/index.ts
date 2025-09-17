/**
 * Performance Monitoring and Optimization Package
 * 
 * Comprehensive performance monitoring for the mental health crisis platform.
 * Ensures zero downtime and optimal response times during emergencies.
 */

// Core monitoring
export { PerformanceMonitor } from './monitoring/performance-monitor';
export type { PerformanceMetrics } from './monitoring/performance-monitor';

// Alert management
export { AlertManager } from './alerts/alert-manager';
export type { Alert, AlertConfig, AlertChannel } from './alerts/alert-manager';

// Optimization
export { DatabaseOptimizer } from './optimization/database-optimizer';
export { CacheManager } from './optimization/cache-manager';
export type { QueryProfile, OptimizationSuggestion } from './optimization/database-optimizer';
export type { CacheOptions, CacheStats } from './optimization/cache-manager';

// Middleware
export { APIPerformanceMiddleware } from './middleware/api-performance';
export type { PerformanceMiddlewareOptions, CachePattern } from './middleware/api-performance';

// Client-side tracking
export { ClientPerformanceTracker } from './metrics/client-performance';
export type { ClientMetrics, ResourceTiming } from './metrics/client-performance';

// Testing
export { PerformanceTestSuite } from './testing/performance-suite';
export type { PerformanceTestConfig, TestResult } from './testing/performance-suite';

// Utilities
export { logger } from './utils/logger';

/**
 * Quick setup function for Express applications
 */
export function setupPerformanceMonitoring(app: any, options?: {
  enableCompression?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  reportUrl?: string;
  redisUrl?: string;
}) {
  const { PerformanceMonitor } = require('./monitoring/performance-monitor');
  const { APIPerformanceMiddleware } = require('./middleware/api-performance');
  const { CacheManager } = require('./optimization/cache-manager');
  
  // Initialize performance monitor
  const monitor = PerformanceMonitor.getInstance();
  
  // Initialize cache manager
  const cache = CacheManager.getInstance({
    useRedis: !!options?.redisUrl,
    redisUrl: options?.redisUrl
  });
  
  // Create middleware instance
  const perfMiddleware = new APIPerformanceMiddleware({
    enableCompression: options?.enableCompression ?? true,
    enableCaching: options?.enableCaching ?? true,
    enableMetrics: options?.enableMetrics ?? true,
    cachePatterns: [
      { pattern: /^\/api\/static/, ttl: 3600000 }, // 1 hour for static data
      { pattern: /^\/api\/config/, ttl: 600000 },   // 10 minutes for config
      { pattern: /^\/api\/public/, ttl: 300000 }    // 5 minutes for public data
    ],
    criticalEndpoints: [
      '/api/crisis/emergency',
      '/api/crisis/escalate',
      '/api/crisis/responder',
      '/api/health/critical'
    ]
  });
  
  // Apply middleware in correct order
  app.use(perfMiddleware.compressionMiddleware());
  app.use(perfMiddleware.responseTimeMiddleware());
  app.use(perfMiddleware.middleware());
  app.use(perfMiddleware.cachingMiddleware());
  app.use(perfMiddleware.rateLimitMiddleware());
  app.use(perfMiddleware.circuitBreakerMiddleware());
  app.use(perfMiddleware.timeoutMiddleware());
  
  // Add metrics endpoint
  app.get('/api/performance/metrics', async (req: any, res: any) => {
    const metrics = await monitor.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  });
  
  // Add health check endpoint
  app.get('/api/health', (req: any, res: any) => {
    const currentMetrics = monitor.getCurrentMetrics();
    const healthy = currentMetrics.cpu.usage < 80 && 
                   currentMetrics.memory.used / currentMetrics.memory.total < 0.85;
    
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'degraded',
      metrics: currentMetrics,
      timestamp: Date.now()
    });
  });
  
  return { monitor, cache, middleware: perfMiddleware };
}

/**
 * Crisis-specific performance configurations
 */
export const CRISIS_PERFORMANCE_CONFIG = {
  // Critical endpoint thresholds (ms)
  thresholds: {
    emergency: 200,
    escalation: 500,
    responder: 300,
    message: 200,
    websocket: 100
  },
  
  // Cache configurations
  cache: {
    responderList: { ttl: 30000 },      // 30 seconds
    sessionState: { ttl: 10000 },       // 10 seconds
    userProfile: { ttl: 300000 },       // 5 minutes
    staticContent: { ttl: 3600000 }     // 1 hour
  },
  
  // Alert configurations
  alerts: {
    channels: [
      { type: 'console' as const, enabled: true, config: {} },
      { type: 'webhook' as const, enabled: false, config: { url: process.env.ALERT_WEBHOOK } }
    ],
    thresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      errorRate: 1,
      responseTime: 1000
    }
  }
};

/**
 * Database optimization queries for crisis platform
 */
export const CRISIS_DATABASE_INDEXES = [
  // Session indexes
  'CREATE INDEX CONCURRENTLY idx_sessions_active ON crisis_sessions(is_active) WHERE is_active = true;',
  'CREATE INDEX CONCURRENTLY idx_sessions_user ON crisis_sessions(user_id, created_at DESC);',
  'CREATE INDEX CONCURRENTLY idx_sessions_priority ON crisis_sessions(priority, created_at) WHERE is_active = true;',
  
  // Message indexes
  'CREATE INDEX CONCURRENTLY idx_messages_session ON messages(session_id, created_at DESC);',
  'CREATE INDEX CONCURRENTLY idx_messages_user ON messages(user_id, created_at DESC);',
  
  // Responder indexes
  'CREATE INDEX CONCURRENTLY idx_responders_available ON responders(is_available, last_active) WHERE is_available = true;',
  'CREATE INDEX CONCURRENTLY idx_responders_specialization ON responders(specialization) WHERE is_available = true;',
  
  // Alert indexes
  'CREATE INDEX CONCURRENTLY idx_alerts_active ON alerts(is_resolved, created_at) WHERE is_resolved = false;',
  'CREATE INDEX CONCURRENTLY idx_alerts_severity ON alerts(severity, created_at) WHERE is_resolved = false;'
];

