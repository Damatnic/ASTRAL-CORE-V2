'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, BarChart3, Clock, Zap, AlertTriangle, 
  CheckCircle, TrendingUp, TrendingDown, Monitor,
  Cpu, HardDrive, Wifi, Eye, X, Maximize2, Minimize2
} from 'lucide-react';
import { Glass, ProductionButton } from '@/components/design-system/ProductionGlassSystem';

// Performance Metrics Interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  inp: number | null; // Interaction to Next Paint
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint

  // Additional Metrics
  dom: number | null; // DOM Content Loaded
  load: number | null; // Window Load
  memory: number | null; // Memory Usage
  connection: string | null; // Connection Type

  // Real-time Data
  timestamp: number;
  url: string;
}

// Performance Thresholds (2025 standards)
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  inp: { good: 200, poor: 500 },
  ttfb: { good: 800, poor: 1800 },
  fcp: { good: 1800, poor: 3000 }
};

// Real-time Performance Monitor Hook
function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null, fid: null, cls: null, inp: null, ttfb: null, fcp: null,
    dom: null, load: null, memory: null, connection: null,
    timestamp: Date.now(), url: typeof window !== 'undefined' ? window.location.href : ''
  });
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let observer: PerformanceObserver | null = null;

    // Load web-vitals library dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Setup Web Vitals monitoring
      getCLS((metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value, timestamp: Date.now() }));
      });

      getFID((metric) => {
        setMetrics(prev => ({ ...prev, fid: metric.value, timestamp: Date.now() }));
      });

      getFCP((metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value, timestamp: Date.now() }));
      });

      getLCP((metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value, timestamp: Date.now() }));
      });

      getTTFB((metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value, timestamp: Date.now() }));
      });
    });

    // Monitor INP (Interaction to Next Paint)
    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        let maxInp = 0;
        for (const entry of list.getEntries()) {
          // Cast to any to access experimental properties
          const eventEntry = entry as any;
          if (eventEntry.processingStart && entry.startTime) {
            const inp = eventEntry.processingStart - entry.startTime;
            maxInp = Math.max(maxInp, inp);
          }
        }
        if (maxInp > 0) {
          setMetrics(prev => ({ ...prev, inp: maxInp, timestamp: Date.now() }));
        }
      });

      try {
        observer.observe({ type: 'event', buffered: true } as any);
      } catch (e) {
        // INP not supported in this browser
      }
    }

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
      
      setMetrics(prev => ({
        ...prev,
        dom: domContentLoaded,
        load: loadComplete,
        timestamp: Date.now()
      }));
    }

    // Get memory info
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memory: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        timestamp: Date.now()
      }));
    }

    // Get connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({
        ...prev,
        connection: connection?.effectiveType || 'unknown',
        timestamp: Date.now()
      }));
    }

    // Update history every 5 seconds
    const interval = setInterval(() => {
      setMetrics(current => {
        const newMetrics = { ...current, timestamp: Date.now() };
        setHistory(prev => {
          const newHistory = [...prev, newMetrics];
          return newHistory.slice(-20); // Keep last 20 entries
        });
        return newMetrics;
      });
    }, 5000);

    return () => {
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return { metrics, history };
}

// Performance Score Calculator
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;
  const weights = { lcp: 25, fid: 25, cls: 25, inp: 25 };

  Object.entries(weights).forEach(([metric, weight]) => {
    const value = metrics[metric as keyof PerformanceMetrics] as number;
    const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
    
    if (value !== null && threshold) {
      if (value > threshold.poor) {
        score -= weight;
      } else if (value > threshold.good) {
        score -= weight * 0.5;
      }
    }
  });

  return Math.max(0, Math.round(score));
}

// Performance Status Badge
const PerformanceStatus: React.FC<{ 
  value: number | null; 
  threshold: { good: number; poor: number };
  unit?: string;
  name: string;
}> = ({ value, threshold, unit = 'ms', name }) => {
  if (value === null) {
    return (
      <div className="flex items-center space-x-2 text-gray-700">
        <div className="w-3 h-3 rounded-full bg-gray-300" />
        <span className="text-sm font-medium">Measuring...</span>
      </div>
    );
  }

  const status = value <= threshold.good ? 'good' : 
                value <= threshold.poor ? 'needs-improvement' : 'poor';
  
  const colors = {
    good: 'text-green-700 bg-green-100',
    'needs-improvement': 'text-yellow-700 bg-yellow-100',
    poor: 'text-red-700 bg-red-100'
  };

  const icons = {
    good: CheckCircle,
    'needs-improvement': AlertTriangle,
    poor: AlertTriangle
  };

  const Icon = icons[status];

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${colors[status]}`}>
      <Icon className="w-4 h-4" />
      <div>
        <div className="font-semibold text-sm">
          {value.toFixed(unit === 'ms' ? 0 : 3)}{unit}
        </div>
        <div className="text-xs opacity-75">{name}</div>
      </div>
    </div>
  );
};

// Metric Chart Component
const MetricChart: React.FC<{
  data: PerformanceMetrics[];
  metric: keyof PerformanceMetrics;
  name: string;
  unit: string;
  threshold: { good: number; poor: number };
}> = ({ data, metric, name, unit, threshold }) => {
  const values = data.map(d => d[metric] as number).filter(v => v !== null);
  
  if (values.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-700">
        No data available
      </div>
    );
  }

  const max = Math.max(...values, threshold.poor * 1.2);
  const min = Math.min(...values, 0);

  return (
    <div className="relative h-24">
      <svg className="w-full h-full" viewBox="0 0 400 100">
        {/* Threshold lines */}
        <line
          x1="0"
          y1={100 - (threshold.good / max) * 100}
          x2="400"
          y2={100 - (threshold.good / max) * 100}
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.5"
        />
        <line
          x1="0"
          y1={100 - (threshold.poor / max) * 100}
          x2="400"
          y2={100 - (threshold.poor / max) * 100}
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.5"
        />

        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={values.map((value, index) => {
            const x = (index / (values.length - 1)) * 400;
            const y = 100 - ((value - min) / (max - min)) * 100;
            return `${x},${y}`;
          }).join(' ')}
        />

        {/* Data points */}
        {values.map((value, index) => {
          const x = (index / (values.length - 1)) * 400;
          const y = 100 - ((value - min) / (max - min)) * 100;
          const color = value <= threshold.good ? '#10b981' : 
                       value <= threshold.poor ? '#f59e0b' : '#ef4444';
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>

      <div className="absolute top-0 left-0 text-xs text-gray-700">
        {name}: {values[values.length - 1]?.toFixed(unit === 'ms' ? 0 : 3)}{unit}
      </div>
    </div>
  );
};

// Main Performance Dashboard Component
export const PerformanceDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics, history } = usePerformanceMonitor();
  const score = calculatePerformanceScore(metrics);

  // Only show in development or when explicitly enabled
  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show-performance-dashboard') === 'true';
    setIsVisible(shouldShow);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 z-[9998] max-w-sm"
      >
        <Glass variant="heavy" className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Performance
              </h3>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                score >= 90 ? 'bg-green-100 text-green-700' :
                score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {score}/100
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <ProductionButton
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse dashboard" : "Expand dashboard"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </ProductionButton>
              
              <ProductionButton
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                aria-label="Close performance dashboard"
              >
                <X className="w-4 h-4" />
              </ProductionButton>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <PerformanceStatus
              value={metrics.lcp}
              threshold={THRESHOLDS.lcp}
              name="LCP"
            />
            
            <PerformanceStatus
              value={metrics.inp || metrics.fid}
              threshold={THRESHOLDS.inp}
              name="INP/FID"
            />
            
            <PerformanceStatus
              value={metrics.cls}
              threshold={THRESHOLDS.cls}
              unit=""
              name="CLS"
            />
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
              >
                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-700">TTFB</div>
                    <div className="font-medium">
                      {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-700">FCP</div>
                    <div className="font-medium">
                      {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-700">Memory</div>
                    <div className="font-medium">
                      {metrics.memory ? `${metrics.memory.toFixed(1)}MB` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-700">Connection</div>
                    <div className="font-medium">{metrics.connection || 'N/A'}</div>
                  </div>
                </div>

                {/* Charts */}
                {history.length > 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Trends
                    </h4>
                    
                    <MetricChart
                      data={history}
                      metric="lcp"
                      name="LCP"
                      unit="ms"
                      threshold={THRESHOLDS.lcp}
                    />
                    
                    <MetricChart
                      data={history}
                      metric="cls"
                      name="CLS"
                      unit=""
                      threshold={THRESHOLDS.cls}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <ProductionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Refresh Metrics
                  </ProductionButton>
                  
                  <ProductionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Performance Metrics:', metrics);
                      console.log('Performance History:', history);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Log to Console
                  </ProductionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Glass>
      </motion.div>
    </AnimatePresence>
  );
};

// Performance Summary Component for Dev Tools
export const PerformanceSummary: React.FC = () => {
  const { metrics } = usePerformanceMonitor();
  const score = calculatePerformanceScore(metrics);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-sm text-gray-600">Overall Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">LCP</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {metrics.inp || metrics.fid ? `${(metrics.inp || metrics.fid)!.toFixed(0)}ms` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">INP/FID</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">CLS</div>
        </div>
      </div>

      <div className="text-xs text-gray-700">
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PerformanceDashboard;