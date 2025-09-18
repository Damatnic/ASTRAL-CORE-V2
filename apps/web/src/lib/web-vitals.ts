/**
 * Core Web Vitals Monitoring for Astral Core V2
 * Tracks and reports performance metrics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface WebVitalsMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
  timestamp: number;
  url: string;
  userId?: string;
  [key: string]: any;
}

class WebVitalsTracker {
  private metrics: WebVitalsMetrics = {
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ''
  };

  private reportThresholds = {
    LCP: 2500,  // Good: <= 2.5s
    FID: 100,   // Good: <= 100ms
    CLS: 0.1,   // Good: <= 0.1
    FCP: 1800,  // Good: <= 1.8s
    TTFB: 800   // Good: <= 800ms
  };

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    const { name, value } = metric;
    
    // Store the metric
    this.metrics[name as keyof WebVitalsMetrics] = value;
    
    // Check if metric exceeds threshold
    const threshold = this.reportThresholds[name as keyof typeof this.reportThresholds];
    const exceedsThreshold = value > threshold;
    
    // Report to analytics
    this.reportMetric({
      name,
      value,
      threshold,
      exceedsThreshold,
      rating: this.getRating(name, value),
      timestamp: Date.now(),
      url: window.location.href
    });

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c[Web Vitals] ${name}`, 
        `color: ${exceedsThreshold ? '#ff4444' : '#44ff44'}; font-weight: bold`,
        `${value.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private async reportMetric(data: any) {
    try {
      // Send to monitoring endpoint
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Send to external analytics if configured
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          metric_name: data.name,
          metric_value: data.value,
          metric_rating: data.rating,
          custom_parameter: data.exceedsThreshold ? 'threshold_exceeded' : 'within_threshold'
        });
      }
    } catch (error) {
      console.warn('Failed to report web vitals metric:', error);
    }
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  public generateReport(): string {
    const report = Object.entries(this.metrics)
      .filter(([key]) => key !== 'timestamp' && key !== 'url')
      .map(([key, value]) => {
        if (typeof value !== 'number') return '';
        const threshold = this.reportThresholds[key as keyof typeof this.reportThresholds];
        const rating = this.getRating(key, value);
        const status = value <= threshold ? '✅' : '❌';
        return `${status} ${key}: ${value.toFixed(2)}ms (${rating})`;
      })
      .filter(Boolean)
      .join('\n');

    return `Web Vitals Report:\n${report}`;
  }
}

// Create global instance
export const webVitalsTracker = new WebVitalsTracker();

// Export function for manual tracking
export function trackWebVitals() {
  return webVitalsTracker;
}

// Export function for getting current metrics
export function getWebVitalsMetrics() {
  return webVitalsTracker.getMetrics();
}

// Export function for generating report
export function generateWebVitalsReport() {
  return webVitalsTracker.generateReport();
}