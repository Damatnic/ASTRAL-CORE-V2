/**
 * Performance Optimization Configuration
 * Comprehensive settings for optimizing Astral Core V2 performance
 */

module.exports = {
  // Core Web Vitals thresholds
  webVitals: {
    // Largest Contentful Paint - must load within 2.5s
    lcp: {
      good: 2500,
      needsImprovement: 4000,
      poor: 4000,
    },
    // First Input Delay - must respond within 100ms
    fid: {
      good: 100,
      needsImprovement: 300,
      poor: 300,
    },
    // Cumulative Layout Shift - visual stability
    cls: {
      good: 0.1,
      needsImprovement: 0.25,
      poor: 0.25,
    },
    // Time to First Byte - server response time
    ttfb: {
      good: 800,
      needsImprovement: 1800,
      poor: 1800,
    },
    // First Contentful Paint - perceived load speed
    fcp: {
      good: 1800,
      needsImprovement: 3000,
      poor: 3000,
    },
    // Interaction to Next Paint - responsiveness
    inp: {
      good: 200,
      needsImprovement: 500,
      poor: 500,
    },
  },

  // Caching strategies
  caching: {
    // Static assets caching
    static: {
      maxAge: 31536000, // 1 year for static assets
      immutable: true,
      staleWhileRevalidate: 86400, // 1 day
    },
    // API responses caching
    api: {
      // Default API cache
      default: {
        maxAge: 60, // 1 minute
        staleWhileRevalidate: 300, // 5 minutes
      },
      // User data cache
      userData: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 600, // 10 minutes
        private: true,
      },
      // Crisis data - no cache
      crisis: {
        noStore: true,
        noCache: true,
        mustRevalidate: true,
      },
      // Public content cache
      publicContent: {
        maxAge: 3600, // 1 hour
        staleWhileRevalidate: 7200, // 2 hours
        public: true,
      },
    },
    // Database query caching
    database: {
      // Redis cache settings
      redis: {
        defaultTTL: 300, // 5 minutes default
        maxTTL: 3600, // 1 hour max
        namespace: 'astral:cache:',
      },
      // Query result caching
      queries: {
        userProfile: 600, // 10 minutes
        dashboardMetrics: 300, // 5 minutes
        assessmentResults: 1800, // 30 minutes
        publicContent: 3600, // 1 hour
      },
    },
  },

  // Bundle optimization
  bundling: {
    // Code splitting strategies
    codeSplitting: {
      // Vendor chunks
      vendor: {
        react: ['react', 'react-dom', 'react-router'],
        ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        utilities: ['lodash', 'date-fns', 'axios'],
        monitoring: ['@sentry/nextjs', '@opentelemetry/api'],
      },
      // Dynamic imports for heavy components
      dynamicImports: [
        'charts',
        'pdf-generator',
        'video-player',
        'rich-text-editor',
      ],
      // Prefetch priority routes
      prefetch: {
        high: ['/dashboard', '/crisis', '/chat'],
        medium: ['/profile', '/resources', '/assessments'],
        low: ['/settings', '/about', '/privacy'],
      },
    },
    // Minification settings
    minification: {
      javascript: {
        compress: true,
        mangle: true,
        removeComments: true,
        removeConsole: ['log', 'debug'],
        keepConsole: ['error', 'warn', 'info'],
      },
      css: {
        minify: true,
        removeComments: true,
        mergeRules: true,
        mergeIdents: true,
      },
      html: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false, // Keep for better readability
        minifyJS: true,
        minifyCSS: true,
      },
    },
    // Tree shaking configuration
    treeShaking: {
      sideEffects: false,
      usedExports: true,
      deadCodeElimination: true,
      pureExternalModules: true,
    },
  },

  // Image optimization
  images: {
    // Format preferences
    formats: {
      preferred: ['avif', 'webp'],
      fallback: 'jpeg',
    },
    // Size optimization
    sizes: {
      thumbnail: { width: 150, height: 150, quality: 80 },
      small: { width: 400, height: 400, quality: 85 },
      medium: { width: 800, height: 800, quality: 85 },
      large: { width: 1200, height: 1200, quality: 90 },
      full: { width: 2400, height: 2400, quality: 90 },
    },
    // Lazy loading configuration
    lazyLoading: {
      enabled: true,
      rootMargin: '50px',
      threshold: 0.01,
      placeholder: 'blur',
    },
    // Responsive images
    responsive: {
      breakpoints: [640, 768, 1024, 1280, 1536],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
  },

  // Database optimization
  database: {
    // Connection pooling
    pooling: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
    // Query optimization
    queries: {
      // Batch size for bulk operations
      batchSize: 100,
      // Pagination defaults
      defaultPageSize: 20,
      maxPageSize: 100,
      // Query timeout
      timeout: 5000,
      // Enable query result caching
      enableCache: true,
      // Use prepared statements
      preparedStatements: true,
    },
    // Indexing strategy
    indexes: {
      // Frequently queried fields
      primary: ['id', 'userId', 'createdAt'],
      // Composite indexes
      composite: [
        ['userId', 'createdAt'],
        ['status', 'priority'],
        ['type', 'category'],
      ],
      // Full-text search indexes
      fullText: ['content', 'title', 'description'],
    },
  },

  // API optimization
  api: {
    // Rate limiting
    rateLimit: {
      // General API limits
      general: {
        windowMs: 60000, // 1 minute
        max: 100, // 100 requests per minute
      },
      // Auth endpoints
      auth: {
        windowMs: 900000, // 15 minutes
        max: 5, // 5 attempts per 15 minutes
      },
      // Crisis endpoints - no limit
      crisis: {
        windowMs: 60000,
        max: 1000, // Very high limit for crisis situations
      },
    },
    // Response compression
    compression: {
      enabled: true,
      level: 6, // Balanced compression level
      threshold: 1024, // Compress responses > 1KB
      filter: (req, res) => {
        // Don't compress server-sent events
        if (res.getHeader('Content-Type') === 'text/event-stream') {
          return false;
        }
        return true;
      },
    },
    // Pagination defaults
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
      defaultOffset: 0,
    },
    // Field filtering
    fieldFiltering: {
      enabled: true,
      maxFields: 50,
      defaultFields: ['id', 'title', 'createdAt', 'updatedAt'],
    },
  },

  // Client-side optimization
  client: {
    // Debounce settings
    debounce: {
      search: 300, // 300ms for search inputs
      validation: 500, // 500ms for form validation
      autosave: 2000, // 2s for autosave
      resize: 100, // 100ms for window resize
    },
    // Virtual scrolling
    virtualScrolling: {
      enabled: true,
      itemHeight: 50,
      buffer: 5, // Render 5 items outside viewport
      threshold: 100, // Start loading more when 100px from bottom
    },
    // Prefetching strategies
    prefetching: {
      // Link prefetching
      links: {
        enabled: true,
        onHover: true,
        onVisible: true,
        priority: ['high', 'medium'],
      },
      // Data prefetching
      data: {
        enabled: true,
        routes: ['/dashboard', '/profile', '/resources'],
        maxAge: 300000, // 5 minutes
      },
    },
    // Service Worker
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 3600000, // Check for updates every hour
      cacheStrategies: {
        // Network first for API calls
        api: 'network-first',
        // Cache first for static assets
        static: 'cache-first',
        // Stale while revalidate for images
        images: 'stale-while-revalidate',
      },
    },
  },

  // Monitoring and alerting
  monitoring: {
    // Performance monitoring
    performance: {
      enabled: true,
      sampleRate: 0.1, // Sample 10% of users
      reportUri: '/api/monitoring/performance',
      metrics: ['lcp', 'fid', 'cls', 'ttfb', 'fcp', 'inp'],
    },
    // Error tracking
    errors: {
      enabled: true,
      sampleRate: 1.0, // Track all errors
      reportUri: '/api/monitoring/errors',
      ignorePatterns: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    },
    // Resource timing
    resources: {
      enabled: true,
      trackExternalResources: true,
      slowResourceThreshold: 1000, // 1 second
    },
    // Custom metrics
    custom: {
      // Track critical user actions
      userActions: {
        login: true,
        assessment: true,
        crisis: true,
        chat: true,
      },
      // Business metrics
      business: {
        engagementTime: true,
        completionRate: true,
        dropoffPoints: true,
      },
    },
  },

  // Edge optimization (CDN/Edge functions)
  edge: {
    // CDN configuration
    cdn: {
      enabled: true,
      providers: ['cloudflare', 'fastly'],
      purgeOnDeploy: true,
      geoRouting: true,
    },
    // Edge caching rules
    caching: {
      // Cache static assets at edge
      static: {
        maxAge: 31536000, // 1 year
        sMaxAge: 31536000,
        immutable: true,
      },
      // Cache API responses at edge
      api: {
        public: {
          maxAge: 60,
          sMaxAge: 300,
          staleWhileRevalidate: 600,
        },
        private: {
          maxAge: 0,
          sMaxAge: 0,
          noStore: true,
        },
      },
    },
    // Edge functions
    functions: {
      // Geolocation-based routing
      geoRouting: true,
      // A/B testing at edge
      abTesting: true,
      // Request transformation
      requestTransform: true,
      // Response optimization
      responseOptimization: true,
    },
  },

  // Development optimization
  development: {
    // Hot module replacement
    hmr: {
      enabled: true,
      port: 3001,
      overlay: true,
    },
    // Source maps
    sourceMaps: {
      development: 'eval-cheap-module-source-map',
      production: 'hidden-source-map',
    },
    // Development server
    devServer: {
      compress: false, // Disable compression in dev for faster builds
      historyApiFallback: true,
      hot: true,
      open: false,
    },
  },

  // Production optimization
  production: {
    // Build optimization
    build: {
      // Parallel builds
      parallel: true,
      workers: 4,
      // Cache builds
      cache: true,
      // Incremental builds
      incremental: true,
    },
    // Runtime optimization
    runtime: {
      // Use production React build
      reactProductionMode: true,
      // Enable all optimizations
      optimize: true,
      // Minify runtime
      minify: true,
    },
    // Deployment optimization
    deployment: {
      // Use standalone output
      standalone: true,
      // Optimize for serverless
      serverless: true,
      // Enable ISR (Incremental Static Regeneration)
      isr: {
        enabled: true,
        revalidate: 60, // Revalidate every minute
      },
    },
  },
};