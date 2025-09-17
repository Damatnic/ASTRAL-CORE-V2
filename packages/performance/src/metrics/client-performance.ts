/**
 * Client-Side Performance Tracking
 * 
 * Monitors browser performance metrics for the crisis platform.
 * Uses Web Vitals and Performance Observer APIs.
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";

export interface ClientMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  memoryUsage?: number;
  connectionType?: string;
  
  // Crisis-specific metrics
  crisisResponseTime?: number;
  messageDeliveryTime?: number;
  webSocketLatency?: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
}

export class ClientPerformanceTracker {
  private static instance: ClientPerformanceTracker;
  private metrics: ClientMetrics = {};
  private resourceTimings: ResourceTiming[] = [];
  private observer?: PerformanceObserver;
  private reportUrl: string;
  private reportInterval: number = 30000; // 30 seconds
  private metricsBuffer: ClientMetrics[] = [];
  private readonly MAX_BUFFER_SIZE = 50;

  private constructor(reportUrl: string = '/api/performance/metrics') {
    this.reportUrl = reportUrl;
    this.initializeTracking();
    this.startReporting();
  }

  public static getInstance(reportUrl?: string): ClientPerformanceTracker {
    if (!ClientPerformanceTracker.instance) {
      ClientPerformanceTracker.instance = new ClientPerformanceTracker(reportUrl);
    }
    return ClientPerformanceTracker.instance;
  }

  private initializeTracking(): void {
    // Track Core Web Vitals
    this.trackWebVitals();
    
    // Track navigation timing
    this.trackNavigationTiming();
    
    // Track resource loading
    this.trackResourceTiming();
    
    // Track memory usage
    this.trackMemoryUsage();
    
    // Track connection info
    this.trackConnectionInfo();
    
    // Set up Performance Observer
    this.setupPerformanceObserver();
    
    // Track custom crisis metrics
    this.trackCrisisMetrics();
  }

  private trackWebVitals(): void {
    // Largest Contentful Paint
    getLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.checkCriticalThreshold('LCP', metric.value, 2500);
    });

    // First Input Delay
    getFID((metric) => {
      this.metrics.fid = metric.value;
      this.checkCriticalThreshold('FID', metric.value, 100);
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.metrics.cls = metric.value;
      this.checkCriticalThreshold('CLS', metric.value, 0.1);
    });


    // First Contentful Paint
    getFCP((metric) => {
      this.metrics.fcp = metric.value;
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.checkCriticalThreshold('TTFB', metric.value, 800);
    });
  }

  private trackNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // Wait for page load
    if (document.readyState === 'complete') {
      this.captureNavigationMetrics();
    } else {
      window.addEventListener('load', () => {
        this.captureNavigationMetrics();
      });
    }

    // Track DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      const timing = performance.timing;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    });
  }

  private captureNavigationMetrics(): void {
    const timing = performance.timing;
    
    // Page load time
    this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    
    // Check if page load exceeds threshold
    if (this.metrics.pageLoadTime > 2000) {
      this.reportSlowPageLoad();
    }
  }

  private trackResourceTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // Get initial resource timings
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resources.forEach(resource => this.processResourceTiming(resource));
  }

  private processResourceTiming(resource: PerformanceResourceTiming): void {
    const timing: ResourceTiming = {
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
      cached: resource.transferSize === 0 && resource.decodedBodySize > 0
    };

    this.resourceTimings.push(timing);

    // Alert for slow critical resources
    if (this.isCriticalResource(resource.name) && resource.duration > 1000) {
      this.reportSlowResource(timing);
    }
  }

  private trackMemoryUsage(): void {
    if (typeof window === 'undefined') return;

    // Check if memory API is available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      setInterval(() => {
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.jsHeapSizeLimit;
        const usage = usedMemory / totalMemory;

        this.metrics.memoryUsage = usage;

        // Alert if memory usage is high
        if (usage > 0.9) {
          this.reportHighMemoryUsage(usage);
        }

        // Check for potential memory leaks
        this.checkMemoryLeak(usedMemory);
      }, 10000); // Check every 10 seconds
    }
  }

  private memoryHistory: number[] = [];
  private checkMemoryLeak(currentMemory: number): void {
    this.memoryHistory.push(currentMemory);
    
    // Keep last 10 measurements
    if (this.memoryHistory.length > 10) {
      this.memoryHistory.shift();
    }

    // Check for consistent growth
    if (this.memoryHistory.length === 10) {
      const growth = this.memoryHistory[9] - this.memoryHistory[0];
      const averageGrowth = growth / 9;
      
      // Alert if memory is growing consistently
      if (averageGrowth > 1024 * 1024) { // 1MB per measurement
        this.reportMemoryLeak(averageGrowth);
      }
    }
  }

  private trackConnectionInfo(): void {
    if (typeof window === 'undefined') return;

    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.metrics.connectionType = connection.effectiveType;

      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.metrics.connectionType = connection.effectiveType;
        
        // Adjust behavior for slow connections
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          this.enableLowBandwidthMode();
        }
      });
    }
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Process different entry types
        switch (entry.entryType) {
          case 'navigation':
            this.processNavigationEntry(entry as PerformanceNavigationTiming);
            break;
          case 'resource':
            this.processResourceTiming(entry as PerformanceResourceTiming);
            break;
          case 'measure':
            this.processCustomMeasure(entry);
            break;
          case 'mark':
            this.processCustomMark(entry);
            break;
        }
      }
    });

    // Observe various performance entries
    this.observer.observe({ 
      entryTypes: ['navigation', 'resource', 'measure', 'mark', 'layout-shift', 'largest-contentful-paint'] 
    });
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    // Additional navigation metrics
    this.metrics.resourceLoadTime = entry.loadEventEnd - entry.fetchStart;
  }

  private processCustomMeasure(entry: PerformanceEntry): void {
    // Process custom performance measures
    if (entry.name.startsWith('crisis-')) {
      this.processCrisisMeasure(entry);
    }
  }

  private processCustomMark(entry: PerformanceEntry): void {
    // Process custom performance marks
    console.debug('Performance mark:', entry.name, entry.startTime);
  }

  private processCrisisMeasure(entry: PerformanceEntry): void {
    const duration = entry.duration;
    
    if (entry.name === 'crisis-response-time') {
      this.metrics.crisisResponseTime = duration;
      
      // Alert if crisis response is slow
      if (duration > 200) {
        this.reportSlowCrisisResponse(duration);
      }
    } else if (entry.name === 'crisis-message-delivery') {
      this.metrics.messageDeliveryTime = duration;
    } else if (entry.name === 'crisis-websocket-_latency') {
      this.metrics.webSocketLatency = duration;
      
      // Alert if WebSocket _latency is high
      if (duration > 100) {
        this.reportHighWebSocketLatency(duration);
      }
    }
  }

  private trackCrisisMetrics(): void {
    // Track crisis-specific user interactions
    this.trackCrisisButtonClicks();
    this.trackMessageSending();
    this.trackWebSocketPerformance();
  }

  private trackCrisisButtonClicks(): void {
    if (typeof document === 'undefined') return;

    // Track emergency button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.classList.contains('emergency-btn') || 
          target.dataset.crisis === 'true') {
        
        performance.mark('crisis-button-click');
        
        // Measure time to response
        const measureName = `crisis-response-${Date.now()}`;
        performance.mark(`${measureName}-start`);
        
        // Listen for response
        const responseHandler = () => {
          performance.mark(`${measureName}-end`);
          performance.measure(
            'crisis-response-time',
            `${measureName}-start`,
            `${measureName}-end`
          );
          document.removeEventListener('crisis-response', responseHandler);
        };
        
        document.addEventListener('crisis-response', responseHandler);
        
        // Timeout if no response
        setTimeout(() => {
          document.removeEventListener('crisis-response', responseHandler);
        }, 5000);
      }
    });
  }

  private trackMessageSending(): void {
    if (typeof window === 'undefined') return;

    // Override fetch to track message API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      if (typeof url === 'string' && url.includes('/api/messages')) {
        const startMark = `message-send-${Date.now()}`;
        performance.mark(`${startMark}-start`);
        
        try {
          const response = await originalFetch(...args);
          
          performance.mark(`${startMark}-end`);
          performance.measure(
            'crisis-message-delivery',
            `${startMark}-start`,
            `${startMark}-end`
          );
          
          return response;
        } catch (error) {
          performance.mark(`${startMark}-error`);
          throw error;
        }
      }
      
      return originalFetch(...args);
    };
  }

  private trackWebSocketPerformance(): void {
    if (typeof window === 'undefined' || !window.WebSocket) return;

    // Override WebSocket to track performance
    const OriginalWebSocket = window.WebSocket;
    
    window.WebSocket = class extends OriginalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        const startTime = performance.now();
        
        this.addEventListener('open', () => {
          const _connectionTime = performance.now() - startTime;
          performance.measure('websocket-connection', undefined, undefined);
        });
        
        // Track message _latency
        this.addEventListener('message', (event) => {
          if (event.data && typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              if (data.timestamp) {
                const _latency = Date.now() - data.timestamp;
                performance.measure('crisis-websocket-_latency', undefined, undefined);
              }
            } catch {
              // Not JSON or no timestamp
            }
          }
        });
      }
    } as any;
  }

  private startReporting(): void {
    // Batch and send metrics periodically
    setInterval(() => {
      if (this.metricsBuffer.length > 0 || Object.keys(this.metrics).length > 0) {
        this.sendMetrics();
      }
    }, this.reportInterval);

    // Send metrics on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.sendMetrics(true);
      });
    }
  }

  private sendMetrics(immediate: boolean = false): void {
    const metricsToSend = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.metricsBuffer.push(metricsToSend);

    // Send if buffer is full or immediate send requested
    if (this.metricsBuffer.length >= this.MAX_BUFFER_SIZE || immediate) {
      const payload = {
        metrics: this.metricsBuffer,
        resources: this.getTopSlowResources()
      };

      // Use sendBeacon for reliable delivery
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.reportUrl, JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch(this.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(console.error);
      }

      // Clear buffer
      this.metricsBuffer = [];
      this.resourceTimings = [];
    }
  }

  private getTopSlowResources(limit: number = 10): ResourceTiming[] {
    return [...this.resourceTimings]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  private checkCriticalThreshold(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      console.warn(`Performance warning: ${metric} exceeded threshold`, {
        metric,
        value,
        threshold,
        exceeded: value - threshold
      });

      // Send immediate alert for critical metrics
      this.sendAlert({
        type: 'performance_threshold',
        metric,
        value,
        threshold
      });
    }
  }

  private sendAlert(alert: any): void {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/performance/alert', JSON.stringify(alert));
    }
  }

  private reportSlowPageLoad(): void {
    this.sendAlert({
      type: 'slow_page_load',
      duration: this.metrics.pageLoadTime,
      url: window.location.href
    });
  }

  private reportSlowResource(resource: ResourceTiming): void {
    this.sendAlert({
      type: 'slow_resource',
      resource: resource.name,
      duration: resource.duration,
      size: resource.size
    });
  }

  private reportHighMemoryUsage(usage: number): void {
    this.sendAlert({
      type: 'high_memory_usage',
      usage: (usage * 100).toFixed(2) + '%',
      memory: (performance as any).memory
    });
  }

  private reportMemoryLeak(growth: number): void {
    this.sendAlert({
      type: 'potential_memory_leak',
      growthRate: `${(growth / 1024 / 1024).toFixed(2)}MB per measurement`,
      history: this.memoryHistory
    });
  }

  private reportSlowCrisisResponse(duration: number): void {
    this.sendAlert({
      type: 'slow_crisis_response',
      duration,
      threshold: 200
    });
  }

  private reportHighWebSocketLatency(_latency: number): void {
    this.sendAlert({
      type: 'high_websocket__latency',
      _latency,
      threshold: 100
    });
  }

  private isCriticalResource(url: string): boolean {
    return url.includes('/api/crisis') || 
           url.includes('/api/emergency') ||
           url.includes('/api/responder');
  }

  private getResourceType(url: string): string {
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'stylesheet';
    if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(url)) return 'image';
    if (/\.(woff|woff2|ttf|eot)/.test(url)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private enableLowBandwidthMode(): void {
    console.log('Enabling low bandwidth mode');
    
    // Notify application to reduce data usage
    document.dispatchEvent(new CustomEvent('low-bandwidth-mode', {
      detail: { connectionType: this.metrics.connectionType }
    }));
  }

  public measureCustom(name: string, startMark: string, endMark: string): void {
    performance.measure(name, startMark, endMark);
  }

  public mark(name: string): void {
    performance.mark(name);
  }

  public getMetrics(): ClientMetrics {
    return { ...this.metrics };
  }

  public destroy(): void {
    this.observer?.disconnect();
  }
}