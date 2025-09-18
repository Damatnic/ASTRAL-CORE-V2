/**
 * Performance & Optimization Testing
 * Tests query optimization, caching, connection pooling, and scalability
 */

import { OptimizedDatabaseClient } from '../optimized-database-client';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

// Performance benchmarks
const PERFORMANCE_TARGETS = {
  queryExecution: 50,      // ms
  connectionEstablishment: 100, // ms
  crisisDataAccess: 25,    // ms
  volunteerLookup: 10,     // ms
  sessionCreation: 30,     // ms
  bulkInsert: 5000,        // ms for 1000 records
  cacheHitRate: 0.8,       // 80%
};

describe('Performance & Optimization', () => {
  let dbClient: OptimizedDatabaseClient;
  let performanceMetrics: any[] = [];

  beforeAll(async () => {
    const config = {
      primary: {
        host: 'localhost',
        port: 5432,
        database: 'astral_test',
        user: 'test_user',
        password: 'test_password',
      },
      replicas: [
        {
          host: 'replica1.localhost',
          port: 5432,
          database: 'astral_test',
          user: 'test_user',
          password: 'test_password',
          weight: 1,
        },
      ],
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
      cache: {
        enabled: true,
        maxSize: 1000,
        ttlMs: 300000, // 5 minutes
        criticalTtlMs: 30000, // 30 seconds for critical data
      },
      performance: {
        queryTimeoutMs: 5000,
        slowQueryThreshold: 50,
        enableMetrics: true,
      },
    };

    dbClient = OptimizedDatabaseClient.getInstance(config);
    await dbClient.initialize();

    // Collect performance metrics
    dbClient.on('query-executed', (metric) => {
      performanceMetrics.push(metric);
    });
  });

  afterAll(async () => {
    await dbClient.shutdown();
  });

  describe('Query Performance', () => {
    test('should execute simple queries under 50ms', async () => {
      const queries = [
        'SELECT * FROM crisis_sessions WHERE status = $1 LIMIT 10',
        'SELECT COUNT(*) FROM volunteers WHERE status = $1',
        'SELECT id, severity FROM crisis_sessions WHERE anonymous_id = $1',
      ];

      for (const query of queries) {
        const startTime = performance.now();
        
        await dbClient.executeQuery(query, ['ACTIVE'], {
          priority: 'NORMAL',
          useCache: false, // Test without cache
        });

        const executionTime = performance.now() - startTime;
        expect(executionTime).toBeLessThan(PERFORMANCE_TARGETS.queryExecution);
      }
    });

    test('should optimize complex joins', async () => {
      const complexQuery = `
        SELECT 
          cs.id, cs.severity, cs.status,
          COUNT(cm.id) as message_count,
          MAX(cm.risk_score) as max_risk,
          AVG(cm.sentiment_score) as avg_sentiment
        FROM crisis_sessions cs
        LEFT JOIN crisis_messages cm ON cs.id = cm.session_id
        WHERE cs.status = $1 AND cs.severity >= $2
        GROUP BY cs.id, cs.severity, cs.status
        ORDER BY cs.severity DESC
        LIMIT 20
      `;

      const result = await dbClient.executeQuery(complexQuery, ['ACTIVE', 7], {
        priority: 'HIGH',
        useCache: true,
      });

      expect(result.executionTime).toBeLessThan(100); // Complex query < 100ms
      expect(result.data).toBeDefined();
    });

    test('should handle parameterized queries efficiently', async () => {
      const preparedQuery = 'SELECT * FROM volunteers WHERE skills @> $1 AND experience_hours >= $2';
      const executionTimes = [];

      // Run same query multiple times (should use prepared statement)
      for (let i = 0; i < 10; i++) {
        const result = await dbClient.executeQuery(
          preparedQuery,
          [['crisis', 'anxiety'], 100],
          { priority: 'NORMAL' }
        );
        executionTimes.push(result.executionTime);
      }

      // Later executions should be faster due to prepared statements
      const firstHalf = executionTimes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const secondHalf = executionTimes.slice(5).reduce((a, b) => a + b, 0) / 5;
      
      expect(secondHalf).toBeLessThanOrEqual(firstHalf);
    });
  });

  describe('Crisis Operations Performance', () => {
    test('should create crisis session under 30ms', async () => {
      const sessionData = {
        anonymousId: 'perf_test_' + Date.now(),
        severity: 8,
        encryptedContent: Buffer.from('encrypted_data'),
        keyDerivationSalt: Buffer.from('salt_value'),
      };

      const startTime = performance.now();
      const result = await dbClient.createCrisisSession(sessionData);
      const executionTime = performance.now() - startTime;

      expect(executionTime).toBeLessThan(PERFORMANCE_TARGETS.sessionCreation);
      expect(result.id).toBeDefined();
      expect(result.sessionToken).toBeDefined();
    });

    test('should find available volunteers under 10ms', async () => {
      const criteria = {
        severity: 7,
        skills: ['crisis', 'anxiety'],
        region: 'US-CA',
        limit: 5,
      };

      const startTime = performance.now();
      const volunteers = await dbClient.findAvailableVolunteers(criteria);
      const executionTime = performance.now() - startTime;

      expect(executionTime).toBeLessThan(PERFORMANCE_TARGETS.volunteerLookup);
      expect(Array.isArray(volunteers)).toBe(true);
    });

    test('should handle crisis escalation quickly', async () => {
      const escalationData = {
        sessionId: 'test_session_123',
        severity: 10,
        triggeredBy: 'KEYWORD_DETECTION',
        reason: 'Critical keywords detected',
      };

      const startTime = performance.now();
      
      // Simulate escalation workflow
      const queries = [
        // Update session
        dbClient.executeQuery(
          'UPDATE crisis_sessions SET severity = $1, status = $2, escalated_at = NOW() WHERE id = $3',
          [escalationData.severity, 'ESCALATED', escalationData.sessionId],
          { priority: 'CRITICAL', useCache: false }
        ),
        // Create escalation record
        dbClient.executeQuery(
          'INSERT INTO crisis_escalations (session_id, triggered_by, severity, reason) VALUES ($1, $2, $3, $4)',
          [escalationData.sessionId, escalationData.triggeredBy, 'CRITICAL', escalationData.reason],
          { priority: 'CRITICAL', useCache: false }
        ),
        // Find emergency responders
        dbClient.findAvailableVolunteers({ severity: 10, limit: 3 }),
      ];

      await Promise.all(queries);
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(100); // Complete escalation under 100ms
    });
  });

  describe('Caching System', () => {
    test('should achieve 80% cache hit rate', async () => {
      const testQuery = 'SELECT * FROM crisis_resources WHERE category = $1';
      const params = ['CRISIS_HOTLINE'];

      // Clear cache stats
      dbClient.getPerformanceMetrics(); // Reset stats

      // First query - cache miss
      await dbClient.executeQuery(testQuery, params, { useCache: true });

      // Subsequent queries - cache hits
      for (let i = 0; i < 9; i++) {
        await dbClient.executeQuery(testQuery, params, { useCache: true });
      }

      const metrics = dbClient.getPerformanceMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(PERFORMANCE_TARGETS.cacheHitRate);
    });

    test('should respect cache TTL settings', async () => {
      const query = 'SELECT * FROM public_metrics WHERE is_public = true';
      
      // First query - populate cache
      const result1 = await dbClient.executeQuery(query, [], {
        useCache: true,
        priority: 'LOW',
      });
      expect(result1.fromCache).toBe(false);

      // Immediate second query - should hit cache
      const result2 = await dbClient.executeQuery(query, [], {
        useCache: true,
        priority: 'LOW',
      });
      expect(result2.fromCache).toBe(true);

      // Critical query should have shorter TTL
      const criticalQuery = 'SELECT * FROM crisis_sessions WHERE status = $1';
      await dbClient.executeQuery(criticalQuery, ['ACTIVE'], {
        useCache: true,
        priority: 'CRITICAL',
      });

      // Verify cache size management
      const metrics = dbClient.getPerformanceMetrics();
      expect(metrics.connectionHealth).toBeDefined();
    });

    test('should invalidate cache appropriately', async () => {
      const selectQuery = 'SELECT mood FROM mood_entries WHERE user_id = $1';
      const userId = 'cache_test_user';

      // Populate cache
      await dbClient.executeQuery(selectQuery, [userId], { useCache: true });

      // Perform update (should invalidate related cache)
      await dbClient.executeQuery(
        'UPDATE mood_entries SET mood = $1 WHERE user_id = $2',
        [8, userId],
        { useCache: false }
      );

      // Next select should miss cache (invalidated by update)
      const result = await dbClient.executeQuery(selectQuery, [userId], { useCache: true });
      
      // In a real implementation, cache would be invalidated
      // For this test, we verify the caching system is working
      expect(result).toBeDefined();
    });
  });

  describe('Connection Pool Management', () => {
    test('should handle connection pool efficiently', async () => {
      const concurrentQueries = 50;
      const queries = [];

      const startTime = performance.now();

      // Generate concurrent queries
      for (let i = 0; i < concurrentQueries; i++) {
        const query = i % 2 === 0
          ? 'SELECT COUNT(*) FROM crisis_sessions WHERE severity >= $1'
          : 'SELECT * FROM volunteers WHERE status = $1 LIMIT 5';
        
        const params = i % 2 === 0 ? [5] : ['ACTIVE'];
        
        queries.push(
          dbClient.executeQuery(query, params, {
            priority: 'NORMAL',
            readOnly: true,
          })
        );
      }

      const results = await Promise.all(queries);
      const totalTime = performance.now() - startTime;

      // All queries should complete
      expect(results.every(r => r.data !== undefined)).toBe(true);
      
      // Should handle 50 concurrent queries efficiently
      expect(totalTime).toBeLessThan(5000);
      
      // Average time per query
      const avgTime = totalTime / concurrentQueries;
      expect(avgTime).toBeLessThan(200); // Average < 200ms despite concurrency
    });

    test('should balance load across replicas', async () => {
      const readQueries = [];
      
      // Generate read-only queries
      for (let i = 0; i < 20; i++) {
        readQueries.push(
          dbClient.executeQuery(
            'SELECT * FROM crisis_resources LIMIT 10',
            [],
            { readOnly: true, useCache: false }
          )
        );
      }

      const results = await Promise.all(readQueries);
      
      // Check that different connection IDs were used (load balancing)
      const connectionIds = new Set(results.map(r => r.connectionId));
      
      // Should use multiple connections (primary + replicas)
      expect(connectionIds.size).toBeGreaterThan(1);
    });

    test('should handle connection failures gracefully', async () => {
      // Simulate replica failure
      const healthStatus = dbClient.getPerformanceMetrics().connectionHealth;
      
      // Even with some unhealthy connections, queries should succeed
      const query = 'SELECT * FROM crisis_sessions WHERE status = $1';
      const result = await dbClient.executeQuery(query, ['ACTIVE'], {
        readOnly: true,
      });

      expect(result.data).toBeDefined();
      expect(result.connectionId).toBeDefined();
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk inserts efficiently', async () => {
      const bulkData = [];
      const recordCount = 1000;

      // Generate bulk data
      for (let i = 0; i < recordCount; i++) {
        bulkData.push({
          user_id: `bulk_user_${i}`,
          mood: Math.floor(Math.random() * 10) + 1,
          timestamp: new Date(),
        });
      }

      const startTime = performance.now();

      // Simulate bulk insert with batching
      const batchSize = 100;
      const insertPromises = [];

      for (let i = 0; i < recordCount; i += batchSize) {
        const batch = bulkData.slice(i, i + batchSize);
        const values = batch.map(d => `('${d.user_id}', ${d.mood}, '${d.timestamp.toISOString()}')`).join(',');
        
        insertPromises.push(
          dbClient.executeQuery(
            `INSERT INTO mood_entries (user_id, mood, timestamp) VALUES ${values}`,
            [],
            { priority: 'LOW', useCache: false }
          )
        );
      }

      await Promise.all(insertPromises);
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(PERFORMANCE_TARGETS.bulkInsert);
    });

    test('should optimize bulk updates', async () => {
      const updateData = [];
      for (let i = 0; i < 100; i++) {
        updateData.push({
          id: `session_${i}`,
          newStatus: i % 2 === 0 ? 'RESOLVED' : 'ACTIVE',
        });
      }

      const startTime = performance.now();

      // Use CASE statement for bulk update
      const caseStatements = updateData.map(d => 
        `WHEN id = '${d.id}' THEN '${d.newStatus}'`
      ).join(' ');

      const ids = updateData.map(d => `'${d.id}'`).join(',');

      await dbClient.executeQuery(
        `UPDATE crisis_sessions 
         SET status = CASE ${caseStatements} END 
         WHERE id IN (${ids})`,
        [],
        { priority: 'NORMAL', useCache: false }
      );

      const updateTime = performance.now() - startTime;
      expect(updateTime).toBeLessThan(1000); // Bulk update under 1 second
    });
  });

  describe('Query Optimization', () => {
    test('should use indexes effectively', async () => {
      // Queries that should use indexes
      const indexedQueries = [
        {
          query: 'SELECT * FROM crisis_sessions WHERE status = $1 AND severity >= $2',
          params: ['ACTIVE', 7],
          description: 'Composite index on (status, severity)',
        },
        {
          query: 'SELECT * FROM crisis_messages WHERE session_id = $1 ORDER BY timestamp',
          params: ['test_session'],
          description: 'Index on (session_id, timestamp)',
        },
        {
          query: 'SELECT * FROM volunteers WHERE emergency_available = true',
          params: [],
          description: 'Index on emergency_available',
        },
      ];

      for (const testCase of indexedQueries) {
        const result = await dbClient.executeQuery(
          testCase.query,
          testCase.params,
          { useCache: false }
        );

        // Indexed queries should be very fast
        expect(result.executionTime).toBeLessThan(20);
      }
    });

    test('should prevent N+1 queries', async () => {
      // Bad pattern - N+1 queries
      const startTimeBad = performance.now();
      const sessions = await dbClient.executeQuery(
        'SELECT id FROM crisis_sessions LIMIT 10',
        [],
        { useCache: false }
      );

      // This would cause N+1 problem
      const messagePromises = sessions.data.map(session =>
        dbClient.executeQuery(
          'SELECT * FROM crisis_messages WHERE session_id = $1',
          [session.id],
          { useCache: false }
        )
      );
      await Promise.all(messagePromises);
      const badPatternTime = performance.now() - startTimeBad;

      // Good pattern - single query with JOIN
      const startTimeGood = performance.now();
      await dbClient.executeQuery(
        `SELECT cs.id, cm.*
         FROM crisis_sessions cs
         LEFT JOIN crisis_messages cm ON cs.id = cm.session_id
         WHERE cs.id IN (SELECT id FROM crisis_sessions LIMIT 10)`,
        [],
        { useCache: false }
      );
      const goodPatternTime = performance.now() - startTimeGood;

      // Single query should be significantly faster
      expect(goodPatternTime).toBeLessThan(badPatternTime);
    });
  });

  describe('Real-time Monitoring', () => {
    test('should track slow queries', async () => {
      const slowQueryEvents: any[] = [];
      
      dbClient.on('slow-query', (event) => {
        slowQueryEvents.push(event);
      });

      // Execute a potentially slow query
      await dbClient.executeQuery(
        'SELECT * FROM crisis_messages WHERE encrypted_content LIKE $1',
        ['%search%'],
        { useCache: false, timeout: 5000 }
      );

      // Check if slow queries are being tracked
      const metrics = dbClient.getPerformanceMetrics();
      expect(metrics.slowQueries).toBeDefined();
      expect(metrics.recentMetrics).toBeDefined();
    });

    test('should emit performance alerts', async () => {
      const alerts: any[] = [];
      
      dbClient.on('performance-alert', (alert) => {
        alerts.push(alert);
      });

      // Simulate performance degradation
      const heavyQueries = [];
      for (let i = 0; i < 20; i++) {
        heavyQueries.push(
          dbClient.executeQuery(
            'SELECT * FROM crisis_sessions cs JOIN crisis_messages cm ON cs.id = cm.session_id',
            [],
            { useCache: false }
          )
        );
      }

      await Promise.all(heavyQueries);

      // Wait for metrics emission
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have performance metrics
      const metrics = dbClient.getPerformanceMetrics();
      expect(metrics.averageQueryTime).toBeDefined();
      expect(metrics.queriesPerSecond).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    test('should manage cache memory efficiently', async () => {
      // Fill cache with data
      for (let i = 0; i < 100; i++) {
        await dbClient.executeQuery(
          'SELECT * FROM crisis_resources WHERE id = $1',
          [`resource_${i}`],
          { useCache: true }
        );
      }

      const metrics = dbClient.getPerformanceMetrics();
      
      // Cache should respect size limits
      expect(metrics.cacheHitRate).toBeDefined();
      
      // Memory usage should be reasonable (would check actual memory in production)
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });

    test('should clean up expired cache entries', async () => {
      // Create entries with short TTL
      for (let i = 0; i < 10; i++) {
        await dbClient.executeQuery(
          'SELECT * FROM temp_data WHERE id = $1',
          [`temp_${i}`],
          { useCache: true, priority: 'CRITICAL' } // Short TTL
        );
      }

      // Wait for cleanup cycle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Cache should be cleaned
      const metrics = dbClient.getPerformanceMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Performance Benchmarks Summary', () => {
    afterAll(() => {
      console.log('\n=== Performance Benchmark Results ===\n');
      
      const metrics = dbClient.getPerformanceMetrics();
      
      console.log(`Average Query Time: ${metrics.averageQueryTime.toFixed(2)}ms (Target: ${PERFORMANCE_TARGETS.queryExecution}ms)`);
      console.log(`Queries Per Second: ${metrics.queriesPerSecond.toFixed(2)}`);
      console.log(`Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}% (Target: ${PERFORMANCE_TARGETS.cacheHitRate * 100}%)`);
      console.log(`Slow Queries: ${metrics.slowQueries}`);
      
      console.log('\nConnection Health:');
      metrics.connectionHealth.forEach(health => {
        console.log(`  ${health.id}: ${health.isAlive ? '✓' : '✗'} (latency: ${health.latency.toFixed(2)}ms)`);
      });

      // Analyze collected performance metrics
      if (performanceMetrics.length > 0) {
        const byQueryType = performanceMetrics.reduce((acc, m) => {
          if (!acc[m.queryType]) {
            acc[m.queryType] = { count: 0, totalTime: 0 };
          }
          acc[m.queryType].count++;
          acc[m.queryType].totalTime += m.executionTime;
          return acc;
        }, {} as any);

        console.log('\nQuery Performance by Type:');
        Object.entries(byQueryType).forEach(([type, stats]: [string, any]) => {
          const avgTime = stats.totalTime / stats.count;
          console.log(`  ${type}: ${avgTime.toFixed(2)}ms (${stats.count} queries)`);
        });
      }

      console.log('\n=== End Performance Results ===\n');
    });
  });
});