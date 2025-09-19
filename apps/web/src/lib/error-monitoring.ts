// Production Error Monitoring System - Sentry-like Implementation

// Simple ID generator (replacing nanoid)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Error Severity Levels
export type ErrorSeverity = 'low' | 'normal' | 'high' | 'critical';

// Error Context Interface
export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    anonymous?: boolean;
  };
  session?: {
    id: string;
    startTime: number;
    userAgent: string;
    url: string;
  };
  browser?: {
    name: string;
    version: string;
    os: string;
  };
  performance?: {
    memory?: number;
    timing?: PerformanceTiming;
  };
  breadcrumbs?: Breadcrumb[];
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

// Breadcrumb Interface for Error Tracking
export interface Breadcrumb {
  timestamp: number;
  message: string;
  category: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Error Event Interface
export interface ErrorEvent {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint: string;
  handled: boolean;
  type: 'javascript' | 'unhandled' | 'promise' | 'network' | 'custom';
}

// Production Error Monitor Class
export class ProductionErrorMonitor {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;
  private context: Partial<ErrorContext> = {};
  private isInitialized = false;
  
  constructor() {
    this.sessionId = generateId();
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        severity: 'high',
        type: 'javascript',
        handled: false
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        type: 'promise',
        handled: false
      });
    });

    // Capture network errors
    this.interceptFetch();
    this.interceptXHR();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
    this.addBreadcrumb('system', 'Error monitoring initialized', 'info');
  }

  // Capture and report errors
  public captureError(error: Partial<ErrorEvent>) {
    const errorEvent: ErrorEvent = {
      id: generateId(),
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      line: error.line,
      column: error.column,
      severity: error.severity || 'normal',
      context: {
        ...this.context,
        session: this.getSessionContext(),
        browser: this.getBrowserContext(),
        performance: this.getPerformanceContext(),
        breadcrumbs: [...this.breadcrumbs]
      },
      fingerprint: this.generateFingerprint(error.message || '', error.stack),
      handled: error.handled ?? true,
      type: error.type || 'custom'
    };

    // Add error as breadcrumb
    this.addBreadcrumb('error', error.message || 'Error occurred', 'error', {
      severity: error.severity,
      type: error.type
    });

    // Send to error reporting service
    this.sendErrorReport(errorEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Captured:', errorEvent);
    }

    // Store locally for offline scenarios
    this.storeErrorLocally(errorEvent);
  }

  // Add breadcrumb for error context
  public addBreadcrumb(category: string, message: string, level: Breadcrumb['level'] = 'info', data?: Record<string, any>) {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      message,
      category,
      level,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  // Set user context
  public setUserContext(user: ErrorContext['user']) {
    this.context.user = user;
  }

  // Set additional context
  public setContext(key: string, value: any) {
    if (!this.context.extra) this.context.extra = {};
    this.context.extra[key] = value;
  }

  // Set tags for categorization
  public setTag(key: string, value: string) {
    if (!this.context.tags) this.context.tags = {};
    this.context.tags[key] = value;
  }

  // Manual error capture
  public captureException(error: Error, context?: Partial<ErrorContext>) {
    this.captureError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      type: 'javascript',
      handled: true
    });
  }

  // Capture custom messages
  public captureMessage(message: string, severity: ErrorSeverity = 'normal') {
    this.captureError({
      message,
      severity,
      type: 'custom',
      handled: true
    });
  }

  // Get session context
  private getSessionContext() {
    return {
      id: this.sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  // Get browser context
  private getBrowserContext() {
    const userAgent = navigator.userAgent;
    return {
      name: this.getBrowserName(userAgent),
      version: this.getBrowserVersion(userAgent),
      os: this.getOSName(userAgent)
    };
  }

  // Get performance context
  private getPerformanceContext() {
    const context: any = {};
    
    if ('memory' in performance && (performance as any).memory) {
      context.memory = (performance as any).memory.usedJSHeapSize;
    }
    
    if ('timing' in performance) {
      context.timing = performance.timing;
    }
    
    return context;
  }

  // Generate error fingerprint for deduplication
  private generateFingerprint(message: string, stack?: string): string {
    const content = stack || message;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Send error report to backend
  private async sendErrorReport(errorEvent: ErrorEvent) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEvent)
      });
    } catch (error) {
      // Fallback to local storage if network fails
      console.warn('Failed to send error report:', error);
    }
  }

  // Store error locally for offline scenarios
  private storeErrorLocally(errorEvent: ErrorEvent) {
    try {
      const stored = localStorage.getItem('error-reports') || '[]';
      const errors: ErrorEvent[] = JSON.parse(stored);
      errors.push(errorEvent);
      
      // Keep only last 20 errors
      if (errors.length > 20) {
        errors.splice(0, errors.length - 20);
      }
      
      localStorage.setItem('error-reports', JSON.stringify(errors));
    } catch (error) {
      // Ignore storage errors
    }
  }

  // Intercept fetch for network error monitoring
  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      
      try {
        const response = await originalFetch(...args);
        
        // Log successful requests as breadcrumbs
        this.addBreadcrumb('network', `${response.status} ${args[0]}`, 'info', {
          status: response.status,
          duration: Date.now() - startTime
        });
        
        // Capture 4xx/5xx errors
        if (!response.ok) {
          this.captureError({
            message: `Network Error: ${response.status} ${response.statusText}`,
            severity: response.status >= 500 ? 'high' : 'normal',
            type: 'network',
            handled: true
          });
        }
        
        return response;
      } catch (error) {
        this.captureError({
          message: `Network Error: ${error}`,
          severity: 'high',
          type: 'network',
          handled: false
        });
        throw error;
      }
    };
  }

  // Intercept XMLHttpRequest for network error monitoring
  private interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string) {
      (this as any)._errorMonitor = { method, url, startTime: Date.now() };
      return originalOpen.apply(this, arguments as any);
    };
    
    XMLHttpRequest.prototype.send = function() {
      const monitor = (this as any)._errorMonitor;
      
      this.addEventListener('load', () => {
        if (monitor) {
          const duration = Date.now() - monitor.startTime;
          window.errorMonitor?.addBreadcrumb('xhr', `${this.status} ${monitor.method} ${monitor.url}`, 'info', {
            status: this.status,
            duration
          });
          
          if (this.status >= 400) {
            window.errorMonitor?.captureError({
              message: `XHR Error: ${this.status} ${this.statusText}`,
              severity: this.status >= 500 ? 'high' : 'normal',
              type: 'network',
              handled: true
            });
          }
        }
      });
      
      this.addEventListener('error', () => {
        if (monitor) {
          window.errorMonitor?.captureError({
            message: `XHR Error: ${monitor.method} ${monitor.url}`,
            severity: 'high',
            type: 'network',
            handled: false
          });
        }
      });
      
      return originalSend.apply(this, arguments as any);
    };
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.addBreadcrumb('performance', `Long task: ${entry.duration}ms`, 'warning');
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          this.captureError({
            message: 'High memory usage detected',
            severity: 'normal',
            type: 'custom',
            handled: true
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Browser detection helpers
  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/([0-9.]+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}

// Global error monitor instance
declare global {
  interface Window {
    errorMonitor?: ProductionErrorMonitor;
  }
}

// Initialize error monitoring
export function initializeErrorMonitoring() {
  if (typeof window !== 'undefined' && !window.errorMonitor) {
    window.errorMonitor = new ProductionErrorMonitor();
  }
  return window.errorMonitor;
}

// Export convenience functions
export const errorMonitor = {
  init: initializeErrorMonitoring,
  captureError: (error: Partial<ErrorEvent>) => window.errorMonitor?.captureError(error),
  captureException: (error: Error) => window.errorMonitor?.captureException(error),
  captureMessage: (message: string, severity?: ErrorSeverity) => window.errorMonitor?.captureMessage(message, severity),
  addBreadcrumb: (category: string, message: string, level?: Breadcrumb['level']) => window.errorMonitor?.addBreadcrumb(category, message, level),
  setUserContext: (user: ErrorContext['user']) => window.errorMonitor?.setUserContext(user),
  setContext: (key: string, value: any) => window.errorMonitor?.setContext(key, value),
  setTag: (key: string, value: string) => window.errorMonitor?.setTag(key, value)
};

export default errorMonitor;