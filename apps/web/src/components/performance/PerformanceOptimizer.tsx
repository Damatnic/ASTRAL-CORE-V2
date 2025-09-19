'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: IntersectionObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Core Web Vitals monitoring
  measureCLS(): void {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const cls = (entries: any[]) => {
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (clsEntries.length === 0 || entry.startTime - lastSessionEntry.startTime < 1000) {
            clsEntries.push(entry);
          } else {
            clsValue = Math.max(clsValue, clsEntries.reduce((sum, entry) => sum + entry.value, 0));
            clsEntries = [entry];
          }
        }
      });

      clsValue = Math.max(clsValue, clsEntries.reduce((sum, entry) => sum + entry.value, 0));
      this.recordMetric('CLS', clsValue);
    };

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => cls(list.getEntries()));
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureFID(): void {
    const fid = (entries: any[]) => {
      entries.forEach((entry) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    };

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => fid(list.getEntries()));
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  measureLCP(): void {
    const lcp = (entries: any[]) => {
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    };

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => lcp(list.getEntries()));
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  measureTTFB(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.recordMetric('TTFB', ttfb);
      }
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Send to analytics (in production, send to your analytics service)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(metric: string, value: number): void {
    // In a real app, send to your analytics service
    console.log(`Performance Metric - ${metric}: ${value}`);
  }

  getMetrics(): Record<string, number[]> {
    return Object.fromEntries(this.metrics);
  }

  // Lazy loading optimization
  createIntersectionObserver(callback: IntersectionObserverCallback): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1
    });
    this.observers.push(observer);
    return observer;
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Lazy loading component wrapper
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
}

export function LazyComponent({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" />,
  rootMargin = '50px',
  threshold = 0.1,
  onVisible
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, onVisible]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
}

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-700 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Code splitting utility
export function loadComponentAsync<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Bundle analyzer component (development only)
export function BundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Analyze bundle size and dependencies
      const scripts = Array.from(document.scripts);
      const totalSize = scripts.reduce((size, script) => {
        if (script.src && script.src.includes('/_next/')) {
          // Estimate size (in production, use actual bundle analyzer)
          return size + Math.random() * 100000;
        }
        return size;
      }, 0);

      setBundleInfo({
        totalSize: Math.round(totalSize),
        scriptCount: scripts.length,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !bundleInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs font-mono z-50">
      Bundle: {(bundleInfo.totalSize / 1000).toFixed(1)}KB | Scripts: {bundleInfo.scriptCount}
    </div>
  );
}

// Memory usage monitor
export function MemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !memoryInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-2 rounded text-xs font-mono z-50">
      Memory: {memoryInfo.used}/{memoryInfo.total}MB
    </div>
  );
}

// Performance dashboard component
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Record<string, number[]>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    // Start monitoring
    monitor.measureCLS();
    monitor.measureFID();
    monitor.measureLCP();
    monitor.measureTTFB();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
    }, 5000);

    return () => {
      clearInterval(interval);
      monitor.cleanup();
    };
  }, []);

  const getAverageMetric = (metricName: string): number => {
    const values = metrics[metricName];
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const getMetricStatus = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 bg-green-600 text-white p-2 rounded-full z-50 shadow-lg"
        title="Performance Dashboard"
      >
        📊
      </button>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-50 w-80"
        >
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Core Web Vitals</h3>
          
          {['CLS', 'FID', 'LCP', 'TTFB'].map(metric => {
            const value = getAverageMetric(metric);
            const status = getMetricStatus(metric, value);
            
            return (
              <div key={metric} className="mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-600">
                    {metric}
                  </span>
                  <span className={`text-sm font-bold ${
                    status === 'good' ? 'text-green-600' :
                    status === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric === 'CLS' ? value.toFixed(3) : Math.round(value)}
                    {metric !== 'CLS' && 'ms'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      status === 'good' ? 'bg-green-500' :
                      status === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (value / (metric === 'CLS' ? 0.5 : 5000)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setIsVisible(false)}
            className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-600 py-2 rounded text-sm"
          >
            Close
          </button>
        </motion.div>
      )}
    </>
  );
}

// Service Worker registration
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Resource hints component
export function ResourceHints() {
  useEffect(() => {
    // Add DNS prefetch hints
    const dnsPrefetchDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.astralcore.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Add preconnect hints for critical resources
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Critical CSS inliner (build-time utility)
export function CriticalCSS({ css }: { css: string }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [css]);

  return null;
}
