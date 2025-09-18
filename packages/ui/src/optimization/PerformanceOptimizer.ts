// Performance Optimization Configuration for ASTRAL CORE 2.0
// Crisis-first performance targeting <200KB bundle, <1s load time

interface PerformanceConfig {
  bundleSize: {
    initial: number; // KB
    chunks: number; // KB per chunk
    total: number; // KB total
  };
  metrics: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte (ms)
    helpButton: number; // Time to Help Button (ms)
    chatLoad: number; // Chat Load Time (ms)
  };
  features: {
    lazyLoading: boolean;
    codesplitting: boolean;
    treeshaking: boolean;
    compression: boolean;
    caching: boolean;
    preloading: boolean;
  };
}

export const CRISIS_PERFORMANCE_TARGETS: PerformanceConfig = {
  bundleSize: {
    initial: 150, // Critical: <200KB for crisis situations
    chunks: 50,   // Lazy-loaded chunks
    total: 500,   // Total app size
  },
  metrics: {
    lcp: 1800,    // <2.5s target, aiming for <1.8s
    fid: 45,      // <100ms target, aiming for <45ms
    cls: 0.03,    // <0.1 target, aiming for <0.03
    ttfb: 200,    // <200ms for server response
    helpButton: 800, // <1s for crisis help button
    chatLoad: 1500,  // <2s for chat interface
  },
  features: {
    lazyLoading: true,
    codesplitting: true,
    treeshaking: true,
    compression: true,
    caching: true,
    preloading: true,
  }
};

// Critical resources that must load immediately
export const CRITICAL_RESOURCES = [
  '/crisis-button',
  '/emergency-hotlines',
  '/help-menu',
  '/emotion-theme',
  '/gesture-controls'
];

// Resources that can be lazy-loaded
export const LAZY_LOAD_ROUTES = [
  '/admin',
  '/analytics',
  '/settings',
  '/profile',
  '/documentation'
];

// Performance monitoring class
export class CrisisPerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  
  constructor() {
    this.initializeObservers();
  }
  
  private initializeObservers() {
    // Core Web Vitals observers
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('lcp', lastEntry.startTime);
        this.checkCrisisMetrics();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
      
      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.set('fid', entry.processingStart - entry.startTime);
          this.checkCrisisMetrics();
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
      
      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('cls', clsValue);
            this.checkCrisisMetrics();
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    }
  }
  
  // Monitor crisis-specific metrics
  public measureCrisisAction(action: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.metrics.set(action, duration);
    
    // Check if crisis action meets performance targets
    if (action === 'help-button-click' && duration > CRISIS_PERFORMANCE_TARGETS.metrics.helpButton) {
      console.warn(`🚨 Crisis help button took ${duration}ms (target: ${CRISIS_PERFORMANCE_TARGETS.metrics.helpButton}ms)`);
      this.escalatePerformanceIssue('help-button-slow', duration);
    }
    
    if (action === 'chat-load' && duration > CRISIS_PERFORMANCE_TARGETS.metrics.chatLoad) {
      console.warn(`🚨 Crisis chat took ${duration}ms to load (target: ${CRISIS_PERFORMANCE_TARGETS.metrics.chatLoad}ms)`);
      this.escalatePerformanceIssue('chat-slow', duration);
    }
  }
  
  private checkCrisisMetrics() {
    const lcp = this.metrics.get('lcp') || 0;
    const fid = this.metrics.get('fid') || 0;
    const cls = this.metrics.get('cls') || 0;
    
    // Alert if any crisis metrics are exceeded
    if (lcp > CRISIS_PERFORMANCE_TARGETS.metrics.lcp) {
      this.escalatePerformanceIssue('lcp-exceeded', lcp);
    }
    
    if (fid > CRISIS_PERFORMANCE_TARGETS.metrics.fid) {
      this.escalatePerformanceIssue('fid-exceeded', fid);
    }
    
    if (cls > CRISIS_PERFORMANCE_TARGETS.metrics.cls) {
      this.escalatePerformanceIssue('cls-exceeded', cls);
    }
  }
  
  private escalatePerformanceIssue(issue: string, value: number) {
    // In a real crisis platform, this would trigger alerts
    console.error(`🚨 CRISIS PERFORMANCE ISSUE: ${issue} = ${value}`);
    
    // Send to monitoring service (simulated)
    if (typeof window !== 'undefined') {
      // Store performance issues for analysis
      const issues = JSON.parse(localStorage.getItem('crisis-performance-issues') || '[]');
      issues.push({
        timestamp: Date.now(),
        issue,
        value,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      localStorage.setItem('crisis-performance-issues', JSON.stringify(issues));
    }
  }
  
  public getMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Bundle analyzer configuration
export const BUNDLE_ANALYSIS_CONFIG = {
  // Analyze bundle composition
  analyze: process.env.ANALYZE === 'true',
  
  // Budget warnings for crisis-critical bundles
  budgets: [
    {
      type: 'initial',
      maximumWarning: '150kb',
      maximumError: '200kb'
    },
    {
      type: 'anyChunkSize',
      maximumWarning: '50kb',
      maximumError: '100kb'
    },
    {
      type: 'any',
      maximumWarning: '500kb',
      maximumError: '1mb'
    }
  ],
  
  // Critical path resources
  criticalResources: CRITICAL_RESOURCES,
  
  // Preload hints for crisis resources
  preloadHints: [
    { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', crossorigin: 'anonymous' },
    { rel: 'preload', href: '/crisis-button.js', as: 'script' },
    { rel: 'preload', href: '/emotion-theme.css', as: 'style' }
  ]
};

// Tree shaking configuration for optimal bundle size
export const TREE_SHAKING_CONFIG = {
  // Remove unused emotion components
  removeUnusedEmotions: true,
  
  // Remove non-crisis UI components in crisis mode
  crisisMode: {
    removeComponents: [
      'AdminCharts',
      'AnalyticsDashboard',
      'DetailedSettings',
      'AdvancedProfile'
    ]
  },
  
  // Keep only essential libraries
  essentialLibraries: [
    'react',
    'react-dom',
    'lucide-react',
    'framer-motion' // For crisis animations
  ],
  
  // Remove development utilities in production
  removeInProduction: [
    'DevTools',
    'StoryBook',
    'TestUtils',
    'MockData'
  ]
};

// Progressive loading strategy
export class CrisisProgressiveLoader {
  private loadedChunks: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  // Load critical crisis resources first
  async loadCriticalResources() {
    const criticalLoads = CRITICAL_RESOURCES.map(resource => this.loadResource(resource));
    return Promise.all(criticalLoads);
  }
  
  // Lazy load non-critical features
  async loadFeature(featureName: string) {
    if (this.loadedChunks.has(featureName)) {
      return;
    }
    
    if (this.loadingPromises.has(featureName)) {
      return this.loadingPromises.get(featureName);
    }
    
    const loadPromise = this.dynamicImport(featureName);
    this.loadingPromises.set(featureName, loadPromise);
    
    try {
      await loadPromise;
      this.loadedChunks.add(featureName);
    } catch (error) {
      console.error(`Failed to load feature: ${featureName}`, error);
    } finally {
      this.loadingPromises.delete(featureName);
    }
  }
  
  private async dynamicImport(featureName: string) {
    switch (featureName) {
      case 'admin':
        return import('../components/admin/CrisisAdminDashboard');
      case 'analytics':
        return import('../components/charts/CrisisDataCharts');
      case 'animations':
        return import('../components/animations/CrisisAnimations');
      case 'communication':
        return import('../components/communication/VoiceVideoCommunication');
      default:
        throw new Error(`Unknown feature: ${featureName}`);
    }
  }
  
  private async loadResource(resource: string) {
    // Simulate resource loading with performance tracking
    const startTime = performance.now();
    
    try {
      // In a real implementation, this would load actual resources
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network
      
      const loadTime = performance.now() - startTime;
      console.log(`✅ Crisis resource loaded: ${resource} (${loadTime.toFixed(2)}ms)`);
      
      return { resource, loadTime };
    } catch (error) {
      console.error(`❌ Failed to load crisis resource: ${resource}`, error);
      throw error;
    }
  }
}

// Performance budget enforcement
export const enforcePerformanceBudget = () => {
  if (typeof window === 'undefined') return;
  
  // Check bundle size on page load
  window.addEventListener('load', () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalSize = 0;
      resources.forEach(resource => {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
        }
      });
      
      const totalSizeKB = totalSize / 1024;
      
      if (totalSizeKB > CRISIS_PERFORMANCE_TARGETS.bundleSize.total) {
        console.warn(`🚨 Bundle size exceeded: ${totalSizeKB.toFixed(2)}KB (target: ${CRISIS_PERFORMANCE_TARGETS.bundleSize.total}KB)`);
      } else {
        console.log(`✅ Bundle size within target: ${totalSizeKB.toFixed(2)}KB`);
      }
    }
  });
  
  // Monitor performance continuously
  const monitor = new CrisisPerformanceMonitor();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    monitor.disconnect();
  });
  
  return monitor;
};

// All classes and constants are already exported with export keyword above

export default {
  CRISIS_PERFORMANCE_TARGETS,
  CRITICAL_RESOURCES,
  LAZY_LOAD_ROUTES,
  CrisisPerformanceMonitor,
  CrisisProgressiveLoader,
  enforcePerformanceBudget
};