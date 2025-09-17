# Performance Monitoring Integration Guide

## Overview

This performance monitoring package provides comprehensive monitoring and optimization for the mental health crisis platform, ensuring zero downtime and optimal response times during emergencies.

## Quick Start

### 1. Installation

```bash
# From the root of the monorepo
pnpm add @astral/performance --filter=web
```

### 2. Basic Setup (Express)

```typescript
import express from 'express';
import { setupPerformanceMonitoring } from '@astral/performance';

const app = express();

// Initialize performance monitoring
const { monitor, cache, middleware } = setupPerformanceMonitoring(app, {
  enableCompression: true,
  enableCaching: true,
  enableMetrics: true,
  redisUrl: process.env.REDIS_URL // Optional
});

// Your routes here
app.get('/api/crisis/emergency', async (req, res) => {
  // Track custom metrics
  monitor.startMeasure('crisis-emergency-handler');
  
  // Your crisis handling logic
  await handleEmergency(req.body);
  
  monitor.endMeasure('crisis-emergency-handler');
  res.json({ success: true });
});

app.listen(3000);
```

### 3. Client-Side Setup

```typescript
// In your main client entry point
import { ClientPerformanceTracker } from '@astral/performance';

// Initialize client tracking
const tracker = ClientPerformanceTracker.getInstance('/api/performance/metrics');

// Track custom crisis metrics
document.addEventListener('crisis-button-click', () => {
  tracker.mark('crisis-interaction-start');
});

document.addEventListener('crisis-resolved', () => {
  tracker.mark('crisis-interaction-end');
  tracker.measureCustom(
    'crisis-resolution-time',
    'crisis-interaction-start',
    'crisis-interaction-end'
  );
});
```

## Advanced Configuration

### Database Optimization

```typescript
import { DatabaseOptimizer } from '@astral/performance';

const optimizer = DatabaseOptimizer.getInstance();

// Profile your queries
const result = await optimizer.profileQuery(
  async () => {
    return await db.query('SELECT * FROM crisis_sessions WHERE is_active = true');
  },
  {
    query: 'SELECT * FROM crisis_sessions WHERE is_active = true',
    critical: true,
    cacheable: true,
    cacheTTL: 30000 // 30 seconds
  }
);

// Get optimization suggestions
const suggestions = await optimizer.optimizeQuery(query);

// Apply database indexes
const indexes = optimizer.generateIndexes();
for (const index of indexes) {
  await db.query(index);
}
```

### Custom Alert Configuration

```typescript
import { AlertManager } from '@astral/performance';

const alertManager = AlertManager.getInstance({
  cooldownPeriod: 60000, // 1 minute between same alerts
  maxAlertsPerHour: 100,
  channels: [
    {
      type: 'slack',
      enabled: true,
      config: {
        webhookUrl: process.env.SLACK_WEBHOOK
      },
      severityFilter: ['high', 'critical']
    },
    {
      type: 'pagerduty',
      enabled: true,
      config: {
        integrationKey: process.env.PAGERDUTY_KEY
      },
      severityFilter: ['critical']
    }
  ],
  escalationPolicy: {
    enabled: true,
    rules: [
      {
        condition: 'unresolved_duration',
        threshold: 300000, // 5 minutes
        action: 'notify_oncall'
      }
    ]
  }
});
```

### Cache Strategy

```typescript
import { CacheManager } from '@astral/performance';

const cache = CacheManager.getInstance({
  useRedis: true,
  redisUrl: process.env.REDIS_URL,
  defaultTTL: 300, // 5 minutes
  maxKeys: 10000,
  namespace: 'crisis-platform'
});

// Create cache-aside pattern for crisis data
const sessionCache = cache.createCacheAside(
  'crisis-session',
  async (sessionId: string) => {
    return await db.query('SELECT * FROM crisis_sessions WHERE id = $1', [sessionId]);
  },
  30000 // 30 second TTL
);

// Use the cache
const session = await sessionCache.get('session-123');

// Invalidate when data changes
await sessionCache.invalidate('session-123');
```

## Performance Testing

### Running Performance Tests

```typescript
import { PerformanceTestSuite } from '@astral/performance';

const suite = new PerformanceTestSuite({
  baseUrl: 'http://localhost:3000',
  duration: 30,
  connections: 100,
  thresholds: {
    crisisApiResponse: 200,
    emergencyEscalation: 30000,
    webSocketLatency: 100,
    databaseQuery: 50,
    pageLoadTime: 2000,
    uptimeRequirement: 0.999
  }
});

// Run all tests
const { passed, results } = await suite.runAll();

// Generate report
const report = suite.generateReport();
console.log(report);
```

### Custom Performance Tests

```bash
# Run performance tests
pnpm run perf:test --filter=@astral/performance

# Run specific test scenarios
pnpm run perf:test -- --scenario=crisis-load
```

## Dashboard Integration

### React Integration

```tsx
import { PerformanceDashboard } from '@astral/performance/dashboard';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <PerformanceDashboard />
    </div>
  );
}
```

### Standalone Dashboard

```html
<!DOCTYPE html>
<html>
<head>
  <title>Performance Dashboard</title>
</head>
<body>
  <div id="performance-dashboard"></div>
  <script src="/api/performance/dashboard.js"></script>
</body>
</html>
```

## Monitoring Best Practices

### 1. Critical Path Monitoring

Always monitor critical crisis intervention paths:

```typescript
// Mark critical operations
monitor.startMeasure('crisis-severity-high-response');
await handleHighSeverityCrisis();
monitor.endMeasure('crisis-severity-high-response');
```

### 2. Memory Leak Detection

Enable memory monitoring in production:

```typescript
// Check for memory leaks every minute
setInterval(() => {
  const metrics = monitor.getCurrentMetrics();
  if (metrics.memory.heapUsed / metrics.memory.heapTotal > 0.9) {
    // Trigger memory dump for analysis
    require('heapdump').writeSnapshot(`./dumps/heap-${Date.now()}.heapsnapshot`);
  }
}, 60000);
```

### 3. WebSocket Monitoring

Track WebSocket performance for real-time crisis communication:

```typescript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  const latency = Date.now() - message.timestamp;
  
  monitor.recordWebSocketLatency({
    eventType: message.type,
    priority: message.priority || 'normal',
    latency
  });
});
```

## Performance Targets

The platform must meet these critical performance targets:

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Crisis API Response | < 200ms | 500ms |
| Emergency Escalation | < 30s | 60s |
| WebSocket Latency | < 100ms | 200ms |
| Database Queries | < 50ms | 100ms |
| Page Load Time | < 2s | 5s |
| Uptime | 99.9% | 99.5% |

## Troubleshooting

### High Memory Usage

```typescript
// Enable detailed memory profiling
const v8Profiler = require('v8-profiler-next');
v8Profiler.startProfiling('CPU profile');
setTimeout(() => {
  const profile = v8Profiler.stopProfiling();
  profile.export((error, result) => {
    fs.writeFileSync('cpu-profile.cpuprofile', result);
    profile.delete();
  });
}, 60000);
```

### Slow Database Queries

```typescript
// Enable query profiling
const slowQueries = optimizer.getSlowQueries(10);
for (const query of slowQueries) {
  console.log(`Slow query: ${query.query}`);
  console.log(`Duration: ${query.duration}ms`);
  console.log(`Suggestions:`, query.suggestions);
}
```

### API Timeout Issues

```typescript
// Adjust timeout for specific endpoints
app.use('/api/crisis/bulk', (req, res, next) => {
  req.setTimeout(30000); // 30 second timeout for bulk operations
  next();
});
```

## Environment Variables

```env
# Performance Monitoring
PERFORMANCE_REPORT_URL=/api/performance/metrics
PERFORMANCE_ALERT_WEBHOOK=https://hooks.slack.com/services/xxx
PERFORMANCE_REDIS_URL=redis://localhost:6379

# Thresholds
PERF_THRESHOLD_CRISIS_API=200
PERF_THRESHOLD_WEBSOCKET=100
PERF_THRESHOLD_DATABASE=50

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
PAGERDUTY_INTEGRATION_KEY=xxx
ALERT_EMAIL_RECIPIENTS=oncall@example.com

# Testing
PERF_TEST_BASE_URL=http://localhost:3000
PERF_TEST_DURATION=30
PERF_TEST_CONNECTIONS=100
```

## Production Deployment

### 1. Enable Production Optimizations

```typescript
if (process.env.NODE_ENV === 'production') {
  // Enable aggressive caching
  cache.warmUp(async () => {
    const criticalData = new Map();
    // Pre-load critical data
    criticalData.set('responders:available', await getAvailableResponders());
    criticalData.set('config:crisis', await getCrisisConfig());
    return criticalData;
  });
  
  // Enable compression for all responses
  app.use(compression({ level: 6 }));
  
  // Enable CDN for static assets
  app.use('/static', express.static('public', {
    maxAge: '1y',
    etag: true
  }));
}
```

### 2. Set Up Monitoring Infrastructure

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 3. Configure Auto-scaling

```typescript
// Monitor load and scale automatically
setInterval(async () => {
  const metrics = monitor.getCurrentMetrics();
  
  if (metrics.cpu.usage > 70 || metrics.response.p95 > 500) {
    // Trigger auto-scaling
    await scaleUp();
  } else if (metrics.cpu.usage < 30 && instances > minInstances) {
    // Scale down during low load
    await scaleDown();
  }
}, 30000);
```

## Support

For issues or questions about performance monitoring:
- Check the logs in `logs/performance-*.log`
- Review metrics at `/api/performance/metrics`
- Contact the on-call team for critical performance issues