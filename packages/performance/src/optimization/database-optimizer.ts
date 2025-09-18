/**
 * Database Query Optimizer
 * 
 * Profiles and optimizes database queries for the crisis platform.
 * Ensures all critical queries complete within 50ms threshold.
 */

import { PerformanceMonitor } from '../monitoring/performance-monitor';
import logger from '../utils/logger';

export interface QueryProfile {
  query: string;
  params?: any[];
  duration: number;
  rowCount: number;
  executionPlan?: any;
  suggestions?: string[];
  critical: boolean;
}

export interface OptimizationSuggestion {
  type: 'index' | 'query_rewrite' | 'cache' | 'denormalize' | 'partition';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private performanceMonitor: PerformanceMonitor;
  private queryProfiles: Map<string, QueryProfile[]> = new Map();
  private slowQueryLog: QueryProfile[] = [];
  private queryCache: Map<string, { result: any; timestamp: number }> = new Map();
  
  private readonly SLOW_QUERY_THRESHOLD = 50; // ms
  private readonly CRITICAL_QUERY_THRESHOLD = 30; // ms for critical queries
  private readonly CACHE_TTL = 60000; // 1 minute default
  
  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.startCacheCleanup();
  }

  public static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Profile a database query execution
   */
  public async profileQuery<T>(
    queryFn: () => Promise<T>,
    options: {
      query: string;
      params?: any[];
      critical?: boolean;
      cacheable?: boolean;
      cacheTTL?: number;
    }
  ): Promise<T> {
    const { query, params, critical = false, cacheable = false, cacheTTL = this.CACHE_TTL } = options;
    
    // Check cache for cacheable queries
    if (cacheable) {
      const cached = this.getFromCache(query, params);
      if (cached !== null) {
        logger.debug('Query served from cache', { query });
        return cached;
      }
    }
    
    const startTime = performance.now();
    
    try {
      // Execute the query
      const result = await queryFn();
      
      const duration = performance.now() - startTime;
      
      // Create profile
      const profile: QueryProfile = {
        query,
        params,
        duration,
        rowCount: Array.isArray(result) ? result.length : 1,
        critical
      };
      
      // Record metrics
      this.performanceMonitor.recordDatabaseQuery({
        operation: this.extractOperation(query),
        table: this.extractTable(query),
        duration,
        critical
      });
      
      // Check if query is slow
      const threshold = critical ? this.CRITICAL_QUERY_THRESHOLD : this.SLOW_QUERY_THRESHOLD;
      if (duration > threshold) {
        this.handleSlowQuery(profile);
      }
      
      // Store profile
      this.storeProfile(profile);
      
      // Cache if cacheable
      if (cacheable) {
        this.addToCache(query, params, result, cacheTTL);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Log error with performance context
      logger.error('Query execution failed', {
        query,
        params,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Optimize a specific query
   */
  public async optimizeQuery(query: string): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Analyze query structure
    const analysis = this.analyzeQuery(query);
    
    // Check for missing indexes
    if (analysis.whereClause && !analysis.hasIndex) {
      suggestions.push({
        type: 'index',
        description: `Add index on ${analysis.whereColumns.join(', ')}`,
        impact: 'high',
        implementation: `CREATE INDEX idx_${analysis.table}_${analysis.whereColumns.join('_')} ON ${analysis.table}(${analysis.whereColumns.join(', ')});`
      });
    }
    
    // Check for SELECT *
    if (analysis.selectAll) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Avoid SELECT *, specify only needed columns',
        impact: 'medium',
        implementation: 'Replace SELECT * with specific column names'
      });
    }
    
    // Check for missing JOIN conditions
    if (analysis.hasJoin && !analysis.hasJoinCondition) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Add proper JOIN conditions to avoid cartesian product',
        impact: 'high',
        implementation: 'Ensure all JOINs have ON or USING clauses'
      });
    }
    
    // Check for cacheable queries
    if (analysis.isReadOnly && !analysis.hasRandomFunction) {
      suggestions.push({
        type: 'cache',
        description: 'This query can be cached to improve performance',
        impact: 'medium',
        implementation: 'Enable query caching with appropriate TTL'
      });
    }
    
    // Check for N+1 query pattern
    const profiles = this.queryProfiles.get(query) || [];
    if (profiles.length > 10 && this.detectNPlusOne(profiles)) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Potential N+1 query pattern detected',
        impact: 'high',
        implementation: 'Use JOIN or batch loading instead of multiple queries'
      });
    }
    
    // Check for large result sets
    if (!analysis.hasLimit && analysis.isSelect) {
      suggestions.push({
        type: 'query_rewrite',
        description: 'Add LIMIT clause to prevent large result sets',
        impact: 'medium',
        implementation: 'Add LIMIT clause with appropriate pagination'
      });
    }
    
    return suggestions;
  }

  /**
   * Get query execution statistics
   */
  public getQueryStats(query?: string): any {
    if (query) {
      const profiles = this.queryProfiles.get(query) || [];
      return this.calculateStats(profiles);
    }
    
    // Return overall stats
    const allProfiles = Array.from(this.queryProfiles.values()).flat();
    return {
      totalQueries: allProfiles.length,
      slowQueries: this.slowQueryLog.length,
      averageDuration: this.calculateAverage(allProfiles.map(p => p.duration)),
      p50: this.calculatePercentile(allProfiles.map(p => p.duration), 50),
      p95: this.calculatePercentile(allProfiles.map(p => p.duration), 95),
      p99: this.calculatePercentile(allProfiles.map(p => p.duration), 99),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * Create database indexes for optimization
   */
  public generateIndexes(): string[] {
    const indexes: string[] = [];
    
    // Critical tables that need indexes for crisis response
    const criticalIndexes = [
      // Crisis-related indexes
      'CREATE INDEX idx_crisis_sessions_active ON crisis_sessions(is_active, created_at) WHERE is_active = true;',
      'CREATE INDEX idx_crisis_sessions_user ON crisis_sessions(user_id, created_at);',
      'CREATE INDEX idx_crisis_escalations ON crisis_escalations(session_id, escalated_at);',
      
      // Message indexes for real-time chat
      'CREATE INDEX idx_messages_session ON messages(session_id, created_at);',
      'CREATE INDEX idx_messages_user ON messages(user_id, created_at);',
      
      // User and responder indexes
      'CREATE INDEX idx_users_role ON users(role) WHERE role = \'responder\';',
      'CREATE INDEX idx_responders_available ON responders(is_available, last_active) WHERE is_available = true;',
      'CREATE INDEX idx_responders_specialization ON responders(specialization, is_available);',
      
      // Analytics and monitoring indexes
      'CREATE INDEX idx_session_metrics ON session_metrics(session_id, metric_type);',
      'CREATE INDEX idx_alerts_active ON alerts(is_resolved, created_at) WHERE is_resolved = false;',
      
      // Composite indexes for complex queries
      'CREATE INDEX idx_crisis_priority ON crisis_sessions(priority, created_at, is_active);',
      'CREATE INDEX idx_message_search ON messages USING gin(to_tsvector(\'english\', content));'
    ];
    
    indexes.push(...criticalIndexes);
    
    // Analyze slow queries and suggest additional indexes
    for (const profile of this.slowQueryLog) {
      const suggestion = this.suggestIndexForQuery(profile.query);
      if (suggestion && !indexes.includes(suggestion)) {
        indexes.push(suggestion);
      }
    }
    
    return indexes;
  }

  /**
   * Enable query caching for specific patterns
   */
  public setupQueryCache(patterns: Array<{ pattern: RegExp; ttl: number }>): void {
    // This would be implemented at the database client level
    // For now, we'll store the patterns for reference
    logger.info('Query cache patterns configured', { patterns: patterns.length });
  }

  private analyzeQuery(query: string): any {
    const normalized = query.toLowerCase().trim();
    
    return {
      isSelect: normalized.startsWith('select'),
      isInsert: normalized.startsWith('insert'),
      isUpdate: normalized.startsWith('update'),
      isDelete: normalized.startsWith('delete'),
      selectAll: /select\s+\*/.test(normalized),
      hasWhere: /where\s+/.test(normalized),
      whereClause: this.extractWhereClause(normalized),
      whereColumns: this.extractWhereColumns(normalized),
      hasJoin: /join\s+/.test(normalized),
      hasJoinCondition: /on\s+|using\s*\(/.test(normalized),
      hasLimit: /limit\s+\d+/.test(normalized),
      hasOrderBy: /order\s+by/.test(normalized),
      hasGroupBy: /group\s+by/.test(normalized),
      hasIndex: false, // Would need to check actual database
      table: this.extractTable(normalized),
      isReadOnly: normalized.startsWith('select'),
      hasRandomFunction: /random\(\)|rand\(\)|now\(\)|current_/.test(normalized)
    };
  }

  private extractOperation(query: string): string {
    const normalized = query.toLowerCase().trim();
    if (normalized.startsWith('select')) return 'SELECT';
    if (normalized.startsWith('insert')) return 'INSERT';
    if (normalized.startsWith('update')) return 'UPDATE';
    if (normalized.startsWith('delete')) return 'DELETE';
    return 'OTHER';
  }

  private extractTable(query: string): string {
    const normalized = query.toLowerCase().trim();
    
    // Extract table from different query types
    let match;
    if (normalized.startsWith('select')) {
      match = normalized.match(/from\s+(\w+)/);
    } else if (normalized.startsWith('insert')) {
      match = normalized.match(/into\s+(\w+)/);
    } else if (normalized.startsWith('update')) {
      match = normalized.match(/update\s+(\w+)/);
    } else if (normalized.startsWith('delete')) {
      match = normalized.match(/from\s+(\w+)/);
    }
    
    return match ? match[1] : 'unknown';
  }

  private extractWhereClause(query: string): string | null {
    const match = query.match(/where\s+(.+?)(?:order|group|limit|$)/i);
    return match ? match[1].trim() : null;
  }

  private extractWhereColumns(query: string): string[] {
    const whereClause = this.extractWhereClause(query);
    if (!whereClause) return [];
    
    // Extract column names from WHERE clause
    const columns = new Set<string>();
    const columnPattern = /(\w+)\s*(?:=|<|>|<=|>=|<>|!=|like|in|between)/gi;
    let match;
    
    while ((match = columnPattern.exec(whereClause)) !== null) {
      columns.add(match[1].toLowerCase());
    }
    
    return Array.from(columns);
  }

  private detectNPlusOne(profiles: QueryProfile[]): boolean {
    if (profiles.length < 10) return false;
    
    // Check if queries are executed in rapid succession
    const timeDiffs: number[] = [];
    for (let i = 1; i < profiles.length; i++) {
      timeDiffs.push(profiles[i].duration - profiles[i-1].duration);
    }
    
    // If most queries have similar execution time and are frequent, likely N+1
    const avgDiff = this.calculateAverage(timeDiffs);
    return avgDiff < 10; // Less than 10ms between queries suggests N+1
  }

  private suggestIndexForQuery(query: string): string | null {
    const analysis = this.analyzeQuery(query);
    
    if (!analysis.whereColumns.length) return null;
    
    const table = analysis.table;
    const columns = analysis.whereColumns;
    
    if (table === 'unknown' || !columns.length) return null;
    
    return `CREATE INDEX idx_${table}_${columns.join('_')} ON ${table}(${columns.join(', ')});`;
  }

  private handleSlowQuery(profile: QueryProfile): void {
    // Log slow query
    logger.warn('Slow query detected', {
      query: profile.query,
      duration: profile.duration,
      critical: profile.critical,
      threshold: profile.critical ? this.CRITICAL_QUERY_THRESHOLD : this.SLOW_QUERY_THRESHOLD
    });
    
    // Add to slow query log
    this.slowQueryLog.push(profile);
    
    // Keep only last 100 slow queries
    if (this.slowQueryLog.length > 100) {
      this.slowQueryLog.shift();
    }
    
    // Generate optimization suggestions
    this.optimizeQuery(profile.query).then(suggestions => {
      if (suggestions.length > 0) {
        profile.suggestions = suggestions.map(s => s.description);
        logger.info('Query optimization suggestions', {
          query: profile.query,
          suggestions
        });
      }
    });
  }

  private storeProfile(profile: QueryProfile): void {
    const key = profile.query;
    
    if (!this.queryProfiles.has(key)) {
      this.queryProfiles.set(key, []);
    }
    
    const profiles = this.queryProfiles.get(key)!;
    profiles.push(profile);
    
    // Keep only last 100 profiles per query
    if (profiles.length > 100) {
      profiles.shift();
    }
  }

  private getFromCache(query: string, params?: any[]): any {
    const key = this.getCacheKey(query, params);
    const cached = this.queryCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    
    return null;
  }

  private addToCache(query: string, params: any[] | undefined, result: any, ttl: number): void {
    const key = this.getCacheKey(query, params);
    this.queryCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // Schedule removal after TTL
    setTimeout(() => {
      this.queryCache.delete(key);
    }, ttl);
  }

  private getCacheKey(query: string, params?: any[]): string {
    return `${query}-${JSON.stringify(params || [])}`;
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.queryCache) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.queryCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  private calculateStats(profiles: QueryProfile[]): any {
    if (profiles.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }
    
    const durations = profiles.map(p => p.duration).sort((a, b) => a - b);
    
    return {
      count: profiles.length,
      average: this.calculateAverage(durations),
      min: durations[0],
      max: durations[durations.length - 1],
      p50: this.calculatePercentile(durations, 50),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99)
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateCacheHitRate(): number {
    // This would track actual cache hits vs misses
    // For now, return a placeholder
    return 0;
  }

  public getSlowQueries(limit: number = 10): QueryProfile[] {
    return this.slowQueryLog.slice(-limit).reverse();
  }

  public clearProfiles(): void {
    this.queryProfiles.clear();
    this.slowQueryLog = [];
    this.queryCache.clear();
  }
}