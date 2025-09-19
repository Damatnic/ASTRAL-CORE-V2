// Production Performance Monitoring & Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Core Web Vitals Thresholds (2025 Standards)
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay (being replaced by INP)
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
} as const;

// Performance Analytics Interface
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
}

// Enhanced Web Vitals Reporting
export function reportWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  const reportMetric = (metric: Metric) => {
    const performanceData: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: getPerformanceRating(metric.name, metric.value),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: getConnectionType(),
    };

    // Send to analytics service
    sendToAnalytics(performanceData);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance Metric: ${metric.name}`, performanceData);
    }

    // Store locally for debugging
    storeMetricLocally(performanceData);
  };

  // Collect all Core Web Vitals
  getCLS(reportMetric);
  getFID(reportMetric);
  getFCP(reportMetric);
  getLCP(reportMetric);
  getTTFB(reportMetric);
}

// Get performance rating based on thresholds
function getPerformanceRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
  
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Get connection type for context
function getConnectionType(): string {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }
  return 'unknown';
}

// Send metrics to analytics service
async function sendToAnalytics(metric: PerformanceMetric) {
  try {
    // In production, send to your analytics service
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    });
  } catch (error) {
    console.warn('Failed to send performance metric:', error);
  }
}

// Store metric locally for debugging
function storeMetricLocally(metric: PerformanceMetric) {
  try {
    const stored = localStorage.getItem('performance-metrics') || '[]';
    const metrics: PerformanceMetric[] = JSON.parse(stored);
    metrics.push(metric);
    
    // Keep only last 50 metrics
    if (metrics.length > 50) {
      metrics.splice(0, metrics.length - 50);
    }
    
    localStorage.setItem('performance-metrics', JSON.stringify(metrics));
  } catch (error) {
    // Ignore storage errors
  }
}

// Performance Budget Monitoring
export class PerformanceBudget {
  private violations: string[] = [];

  checkBudget() {
    this.checkResourceSizes();
    this.checkCoreWebVitals();
    this.checkJavaScriptBundles();
    
    if (this.violations.length > 0) {
      console.warn('🚨 Performance Budget Violations:', this.violations);
      this.reportViolations();
    }
  }

  private checkResourceSizes() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach(resource => {
        const size = resource.transferSize || 0;
        
        // Check image sizes
        if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
          if (size > 100 * 1024) { // 100KB limit for images
            this.violations.push(`Large image: ${resource.name} (${(size / 1024).toFixed(1)}KB)`);
          }
        }
        
        // Check JavaScript bundle sizes
        if (resource.name.match(/\.js$/i)) {
          if (size > 300 * 1024) { // 300KB limit for JS bundles
            this.violations.push(`Large JS bundle: ${resource.name} (${(size / 1024).toFixed(1)}KB)`);
          }
        }
        
        // Check CSS sizes
        if (resource.name.match(/\.css$/i)) {
          if (size > 50 * 1024) { // 50KB limit for CSS
            this.violations.push(`Large CSS file: ${resource.name} (${(size / 1024).toFixed(1)}KB)`);
          }
        }
      });
    }
  }

  private checkCoreWebVitals() {
    const metrics = this.getStoredMetrics();
    
    metrics.forEach(metric => {
      if (metric.rating === 'poor') {
        this.violations.push(`Poor ${metric.name}: ${metric.value}ms`);
      }
    });
  }

  private checkJavaScriptBundles() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation.loadEventEnd - navigation.fetchStart > 3000) {
        this.violations.push(`Slow page load: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(0)}ms`);
      }
    }
  }

  private getStoredMetrics(): PerformanceMetric[] {
    try {
      const stored = localStorage.getItem('performance-metrics') || '[]';
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private reportViolations() {
    // Send violations to monitoring service
    fetch('/api/monitoring/performance-violations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        violations: this.violations,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    }).catch(() => {
      // Ignore errors
    });
  }
}

// Resource Hints for Performance
export function addResourceHints() {
  const head = document.head;
  
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://vitals.vercel-insights.com',
  ];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    head.appendChild(link);
  });
  
  // DNS prefetch for faster lookups
  const dnsPrefetchDomains = [
    'https://api.openai.com',
    'https://dev-ac3ajs327vs5vzhk.us.auth0.com',
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    head.appendChild(link);
  });
}

// Critical CSS Inlining Helper
export function inlineCriticalCSS() {
  // This would be implemented at build time
  // For now, ensure critical CSS is in the head
  const criticalCSS = `
    .glass-mixed { 
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 18px;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .animate-blob { animation: blob 7s infinite; }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

// Initialize Performance Monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Start Web Vitals reporting
  reportWebVitals();
  
  // Add resource hints
  addResourceHints();
  
  // Check performance budget
  window.addEventListener('load', () => {
    setTimeout(() => {
      const budget = new PerformanceBudget();
      budget.checkBudget();
    }, 5000); // Check after 5 seconds to allow everything to load
  });
  
  // Monitor for long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold
          console.warn('🐌 Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}

// Export for use in _app.tsx or layout.tsx
export default {
  initializePerformanceMonitoring,
  reportWebVitals,
  PerformanceBudget,
  PERFORMANCE_THRESHOLDS,
};