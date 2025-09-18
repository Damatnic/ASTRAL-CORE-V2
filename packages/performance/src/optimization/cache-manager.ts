/**
 * Cache Manager for Performance Optimization
 * 
 * Implements multi-layer caching strategy for the crisis platform.
 * Uses in-memory cache with Redis backing for distributed systems.
 */

import NodeCache from 'node-cache';
import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';
import { PerformanceMonitor } from '../monitoring/performance-monitor';

export interface CacheOptions {
  useRedis?: boolean;
  redisUrl?: string;
  defaultTTL?: number;
  checkPeriod?: number;
  maxKeys?: number;
  enableCompression?: boolean;
  namespace?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage: number;
  hitRate: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: NodeCache;
  private redisClient?: RedisClientType;
  private performanceMonitor: PerformanceMonitor;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };
  private options: CacheOptions;

  private readonly DEFAULT_OPTIONS: CacheOptions = {
    useRedis: process.env.REDIS_URL ? true : false,
    redisUrl: process.env.REDIS_URL,
    defaultTTL: 300, // 5 minutes
    checkPeriod: 60, // Check for expired keys every 60 seconds
    maxKeys: 10000,
    enableCompression: true,
    namespace: 'astral-core'
  };

  private constructor(options?: CacheOptions) {
    this.options = { ...this.DEFAULT_OPTIONS, ...options };
    this.performanceMonitor = PerformanceMonitor.getInstance();

    // Initialize in-memory cache
    this.memoryCache = new NodeCache({
      stdTTL: this.options.defaultTTL!,
      checkperiod: this.options.checkPeriod!,
      maxKeys: this.options.maxKeys!,
      useClones: false // Better performance, but requires careful handling
    });

    // Initialize Redis if configured
    if (this.options.useRedis && this.options.redisUrl) {
      this.initializeRedis();
    }

    this.setupEventHandlers();
    this.startStatsReporting();
  }

  public static getInstance(options?: CacheOptions): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redisClient = createClient({
        url: this.options.redisUrl,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.redisClient.on('error', (err: any) => {
        logger.error('Redis client error', { error: err });
        this.stats.errors++;
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis client connected');
      });

      this.redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis', { error });
      this.options.useRedis = false;
    }
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const startTime = performance.now();

    try {
      // Try memory cache first
      let value = this.memoryCache.get<T>(fullKey);
      
      if (value !== undefined) {
        this.stats.hits++;
        this.recordCacheMetrics('hit', performance.now() - startTime);
        return value;
      }

      // Try Redis if available
      if (this.redisClient?.isReady) {
        const redisValue = await this.redisClient.get(fullKey);
        if (redisValue) {
          value = this.deserialize<T>(redisValue);
          
          // Populate memory cache
          this.memoryCache.set(fullKey, value);
          
          this.stats.hits++;
          this.recordCacheMetrics('hit', performance.now() - startTime);
          return value;
        }
      }

      this.stats.misses++;
      this.recordCacheMetrics('miss', performance.now() - startTime);
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const startTime = performance.now();
    const actualTTL = ttl || this.options.defaultTTL!;

    try {
      // Set in memory cache
      const memorySuccess = this.memoryCache.set(fullKey, value, actualTTL);

      // Set in Redis if available
      if (this.redisClient?.isReady) {
        const serialized = this.serialize(value);
        await this.redisClient.setEx(fullKey, actualTTL, serialized);
      }

      this.stats.sets++;
      this.recordCacheMetrics('set', performance.now() - startTime);
      return memorySuccess;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const startTime = performance.now();

    try {
      // Delete from memory cache
      const memoryDeleted = this.memoryCache.del(fullKey) > 0;

      // Delete from Redis if available
      if (this.redisClient?.isReady) {
        await this.redisClient.del(fullKey);
      }

      this.stats.deletes++;
      this.recordCacheMetrics('delete', performance.now() - startTime);
      return memoryDeleted;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.flushAll();

      // Clear Redis if available
      if (this.redisClient?.isReady && this.options.namespace) {
        const keys = await this.redisClient.keys(`${this.options.namespace}:*`);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', { error });
      this.stats.errors++;
    }
  }

  /**
   * Get or set value with factory function
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Batch get multiple keys
   */
  public async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    const fullKeys = keys.map(k => this.getFullKey(k));

    // Get from memory cache
    const memoryResults = this.memoryCache.mget<T>(fullKeys);
    
    for (let i = 0; i < keys.length; i++) {
      const value = memoryResults[fullKeys[i]];
      if (value !== undefined) {
        results.set(keys[i], value);
        this.stats.hits++;
      } else {
        results.set(keys[i], null);
        this.stats.misses++;
      }
    }

    // Try Redis for missing keys if available
    if (this.redisClient?.isReady) {
      const missingKeys = keys.filter(k => results.get(k) === null);
      if (missingKeys.length > 0) {
        const redisKeys = missingKeys.map(k => this.getFullKey(k));
        const redisValues = await this.redisClient.mGet(redisKeys);
        
        for (let i = 0; i < missingKeys.length; i++) {
          const value = redisValues[i];
          if (value) {
            const deserialized = this.deserialize<T>(value);
            results.set(missingKeys[i], deserialized);
            
            // Populate memory cache
            this.memoryCache.set(redisKeys[i], deserialized);
            
            this.stats.hits++;
          }
        }
      }
    }

    return results;
  }

  /**
   * Batch set multiple keys
   */
  public async mset<T>(entries: Map<string, T>, ttl?: number): Promise<boolean> {
    const actualTTL = ttl || this.options.defaultTTL!;

    try {
      // Set in memory cache
      for (const [key, value] of entries) {
        const fullKey = this.getFullKey(key);
        this.memoryCache.set(fullKey, value, actualTTL);
      }

      // Set in Redis if available
      if (this.redisClient?.isReady) {
        const multi = this.redisClient.multi();
        for (const [key, value] of entries) {
          const fullKey = this.getFullKey(key);
          const serialized = this.serialize(value);
          multi.setEx(fullKey, actualTTL, serialized);
        }
        await multi.exec();
      }

      this.stats.sets += entries.size;
      return true;
    } catch (error) {
      logger.error('Cache mset error', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  public async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;

    // Invalidate in memory cache
    const memoryKeys = this.memoryCache.keys();
    const regex = new RegExp(pattern);
    
    for (const key of memoryKeys) {
      if (regex.test(key)) {
        this.memoryCache.del(key);
        count++;
      }
    }

    // Invalidate in Redis if available
    if (this.redisClient?.isReady) {
      const redisPattern = `${this.options.namespace}:${pattern}*`;
      const keys = await this.redisClient.keys(redisPattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        count += keys.length;
      }
    }

    logger.info('Cache invalidated by pattern', { pattern, count });
    return count;
  }

  /**
   * Warm up cache with critical data
   */
  public async warmUp(warmUpFn: () => Promise<Map<string, any>>): Promise<void> {
    try {
      const startTime = performance.now();
      const data = await warmUpFn();
      
      for (const [key, value] of data) {
        await this.set(key, value);
      }

      const duration = performance.now() - startTime;
      logger.info('Cache warmed up', { 
        keys: data.size, 
        duration: `${duration.toFixed(2)}ms` 
      });
    } catch (error) {
      logger.error('Cache warm up failed', { error });
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const memoryKeys = this.memoryCache.keys();
    const total = this.stats.hits + this.stats.misses;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: memoryKeys.length,
      memoryUsage: this.calculateMemoryUsage(),
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  private setupEventHandlers(): void {
    // Memory cache events
    this.memoryCache.on('expired', (key, _value) => {
      logger.debug('Cache key expired', { key });
    });

    this.memoryCache.on('flush', () => {
      logger.info('Memory cache flushed');
    });

    // Monitor memory usage
    setInterval(() => {
      const stats = this.getStats();
      if (stats.memoryUsage > 100 * 1024 * 1024) { // 100MB threshold
        logger.warn('High cache memory usage', { 
          memoryUsage: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          keys: stats.keys
        });
      }
    }, 60000); // Check every minute
  }

  private startStatsReporting(): void {
    setInterval(() => {
      const stats = this.getStats();
      logger.info('Cache statistics', {
        ...stats,
        hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
        memoryUsage: `${(stats.memoryUsage / 1024).toFixed(2)}KB`
      });
    }, 300000); // Report every 5 minutes
  }

  private getFullKey(key: string): string {
    return this.options.namespace ? `${this.options.namespace}:${key}` : key;
  }

  private serialize<T>(value: T): string {
    const json = JSON.stringify(value);
    
    if (this.options.enableCompression && json.length > 1024) {
      // Would implement compression here (e.g., using zlib)
      return json;
    }
    
    return json;
  }

  private deserialize<T>(value: string): T {
    // Would implement decompression here if needed
    return JSON.parse(value);
  }

  private calculateMemoryUsage(): number {
    // Estimate memory usage of cache
    let totalSize = 0;
    const keys = this.memoryCache.keys();
    
    for (const key of keys) {
      const value = this.memoryCache.get(key);
      if (value) {
        totalSize += this.estimateSize(value);
      }
    }
    
    return totalSize;
  }

  private estimateSize(obj: any): number {
    // Simple size estimation
    if (typeof obj === 'string') {
      return obj.length * 2; // UTF-16
    }
    if (typeof obj === 'number') {
      return 8;
    }
    if (typeof obj === 'boolean') {
      return 4;
    }
    if (obj === null || obj === undefined) {
      return 0;
    }
    
    // For objects, stringify and measure
    try {
      return JSON.stringify(obj).length * 2;
    } catch {
      return 0;
    }
  }

  private recordCacheMetrics(operation: string, duration: number): void {
    // Record metrics to performance monitor
    this.performanceMonitor.recordDatabaseQuery({
      operation: `cache_${operation}`,
      table: 'cache',
      duration,
      critical: false
    });
  }

  /**
   * Implement cache-aside pattern
   */
  public createCacheAside<T>(
    keyPrefix: string,
    dataFetcher: (id: string) => Promise<T>,
    ttl?: number
  ) {
    return {
      get: async (id: string): Promise<T | null> => {
        const key = `${keyPrefix}:${id}`;
        return this.getOrSet(key, () => dataFetcher(id), ttl);
      },
      invalidate: async (id: string): Promise<boolean> => {
        const key = `${keyPrefix}:${id}`;
        return this.delete(key);
      },
      invalidateAll: async (): Promise<number> => {
        return this.invalidatePattern(`${keyPrefix}:`);
      }
    };
  }

  /**
   * Shutdown cache connections
   */
  public async shutdown(): Promise<void> {
    try {
      this.memoryCache.flushAll();
      this.memoryCache.close();
      
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      
      logger.info('Cache manager shut down');
    } catch (error) {
      logger.error('Error shutting down cache manager', { error });
    }
  }
}