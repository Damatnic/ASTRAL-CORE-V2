import { PrismaClient } from '../generated/client';

// Production-ready database configuration with connection pooling
declare global {
  var prisma: PrismaClient | undefined;
}

// Database connection configuration
const databaseConfig = {
  // Connection pool settings
  connectionLimit: 10,  // Maximum number of connections in the pool
  
  // Query timeout settings (in milliseconds)
  queryTimeout: 10000, // 10 seconds for regular queries
  crisisQueryTimeout: 2000, // 2 seconds for crisis-related queries (fast response required)
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second between retries
  
  // Health check settings
  healthCheckInterval: 30000, // Check connection health every 30 seconds
};

// Create Prisma client with production optimizations
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Error formatting for production
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  });
}

// Singleton pattern for database connection
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Connection pooling utilities
export class DatabasePool {
  private static instance: DatabasePool;
  private connectionPool: PrismaClient[] = [];
  private currentIndex = 0;
  
  private constructor(private poolSize: number = databaseConfig.connectionLimit) {
    this.initializePool();
  }
  
  static getInstance(poolSize?: number): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool(poolSize);
    }
    return DatabasePool.instance;
  }
  
  private initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.connectionPool.push(createPrismaClient());
    }
  }
  
  // Get next available connection (round-robin)
  getConnection(): PrismaClient {
    const connection = this.connectionPool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
    return connection;
  }
  
  // Execute query with automatic retry
  async executeWithRetry<T>(
    queryFn: (prisma: PrismaClient) => Promise<T>,
    options?: { maxRetries?: number; timeout?: number }
  ): Promise<T> {
    const maxRetries = options?.maxRetries || databaseConfig.maxRetries;
    const timeout = options?.timeout || databaseConfig.queryTimeout;
    
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const connection = this.getConnection();
        
        // Create promise with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });
        
        const queryPromise = queryFn(connection);
        
        // Race between query and timeout
        const result = await Promise.race([queryPromise, timeoutPromise]);
        return result as T;
        
      } catch (error) {
        lastError = error as Error;
        
        // Log error for monitoring
        console.error(`Database query attempt ${attempt} failed:`, error);
        
        // Don't retry on certain errors
        if (error instanceof Error && error.message.includes('Query timeout')) {
          throw error;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, databaseConfig.retryDelay));
        }
      }
    }
    
    throw lastError || new Error('Database query failed after retries');
  }
  
  // Graceful shutdown
  async disconnect() {
    await Promise.all(
      this.connectionPool.map(client => client.$disconnect())
    );
  }
}

// Export pool instance for use across the application
export const dbPool = DatabasePool.getInstance();

// Crisis-specific database utilities
export const crisisDb = {
  // Fast query for crisis situations
  async fastQuery<T>(
    queryFn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return dbPool.executeWithRetry(queryFn, {
      maxRetries: 1, // Only one retry for speed
      timeout: databaseConfig.crisisQueryTimeout,
    });
  },
  
  // Batch insert for crisis messages
  async batchInsert<T>(
    data: T[],
    insertFn: (prisma: PrismaClient, batch: T[]) => Promise<any>
  ) {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await dbPool.executeWithRetry(
        (prisma) => insertFn(prisma, batch)
      );
      results.push(result);
    }
    
    return results;
  },
};

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Start periodic health checks in production
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.error('CRITICAL: Database connection lost');
      // Could trigger alerts here
    }
  }, databaseConfig.healthCheckInterval);
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await dbPool.disconnect();
});

export default prisma;