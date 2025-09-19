/**
 * Performance Monitoring Component
 * Real-time performance metrics and optimization suggestions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Zap, TrendingUp, AlertTriangle, 
  CheckCircle, XCircle, Info, BarChart3,
  Clock, Globe, Smartphone, Monitor
} from 'lucide-react';

interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTI: number; // Time to Interactive
  TBT: number; // Total Blocking Time
  INP: number; // Interaction to Next Paint
}

interface PerformanceData {
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
  device: 'mobile' | 'desktop';
  connection: string;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Collect Web Vitals
  const collectMetrics = useCallback(() => {
    if (!window.performance) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const FCP = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const LCP = getLCP();
    const FID = getFID();
    const CLS = getCLS();
    const TTI = navigation.loadEventEnd - navigation.fetchStart;
    const TBT = getTBT();
    const INP = getINP();
    
    const metrics: PerformanceMetrics = {
      FCP: Math.round(FCP),
      LCP: Math.round(LCP),
      FID: Math.round(FID),
      CLS: parseFloat(CLS.toFixed(3)),
      TTI: Math.round(TTI),
      TBT: Math.round(TBT),
      INP: Math.round(INP)
    };
    
    const score = calculateScore(metrics);
    const recommendations = generateRecommendations(metrics);
    const device = getDeviceType();
    const connection = getConnectionType();
    
    setPerformanceData({
      metrics,
      score,
      recommendations,
      device,
      connection
    });
  }, []);
  
  // Helper functions for metrics
  const getLCP = (): number => {
    // Simplified LCP calculation
    const entries = performance.getEntriesByType('largest-contentful-paint');
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1] as any;
      return lastEntry.renderTime || lastEntry.loadTime || 0;
    }
    return 0;
  };
  
  const getFID = (): number => {
    // Simplified FID calculation
    const entries = performance.getEntriesByType('first-input') as any[];
    if (entries.length > 0) {
      return entries[0].processingStart - entries[0].startTime;
    }
    return 0;
  };
  
  const getCLS = (): number => {
    // Simplified CLS calculation
    let clsValue = 0;
    const entries = performance.getEntriesByType('layout-shift') as any[];
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    return clsValue;
  };
  
  const getTBT = (): number => {
    // Simplified TBT calculation
    const longTasks = performance.getEntriesByType('longtask') as any[];
    return longTasks.reduce((total, task) => total + Math.max(0, task.duration - 50), 0);
  };
  
  const getINP = (): number => {
    // Simplified INP calculation (would need more complex logic in production)
    return 200; // Placeholder
  };
  
  const getDeviceType = (): 'mobile' | 'desktop' => {
    return /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  };
  
  const getConnectionType = (): string => {
    const connection = (navigator as any).connection;
    if (!connection) return 'Unknown';
    return `${connection.effectiveType || 'Unknown'} (${connection.downlink || '?'}Mbps)`;
  };
  
  // Calculate performance score
  const calculateScore = (metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // Deduct points based on thresholds
    if (metrics.FCP > 1800) score -= 10;
    else if (metrics.FCP > 3000) score -= 20;
    
    if (metrics.LCP > 2500) score -= 15;
    else if (metrics.LCP > 4000) score -= 30;
    
    if (metrics.FID > 100) score -= 10;
    else if (metrics.FID > 300) score -= 20;
    
    if (metrics.CLS > 0.1) score -= 10;
    else if (metrics.CLS > 0.25) score -= 20;
    
    if (metrics.TTI > 3800) score -= 5;
    else if (metrics.TTI > 7300) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };
  
  // Generate recommendations
  const generateRecommendations = (metrics: PerformanceMetrics): string[] => {
    const recommendations: string[] = [];
    
    if (metrics.FCP > 1800) {
      recommendations.push('Optimize server response time and reduce render-blocking resources');
    }
    
    if (metrics.LCP > 2500) {
      recommendations.push('Optimize images with lazy loading and modern formats (WebP/AVIF)');
    }
    
    if (metrics.FID > 100) {
      recommendations.push('Break up long JavaScript tasks and use web workers');
    }
    
    if (metrics.CLS > 0.1) {
      recommendations.push('Add size attributes to images and avoid inserting content above existing content');
    }
    
    if (metrics.TTI > 3800) {
      recommendations.push('Reduce JavaScript bundle size and implement code splitting');
    }
    
    if (metrics.TBT > 300) {
      recommendations.push('Minimize main thread work and defer non-critical JavaScript');
    }
    
    return recommendations;
  };
  
  // Get metric status
  const getMetricStatus = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds: { [key: string]: { good: number; poor: number } } = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTI: { good: 3800, poor: 7300 },
      TBT: { good: 200, poor: 600 },
      INP: { good: 200, poor: 500 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };
  
  // Start monitoring
  useEffect(() => {
    if (isMonitoring) {
      collectMetrics();
      const interval = setInterval(collectMetrics, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isMonitoring, collectMetrics]);
  
  // Auto-start in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsMonitoring(true);
    }
  }, []);
  
  if (!isMonitoring && process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Minimized View */}
      {!showDetails && performanceData && (
        <button
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white transition-all hover:scale-105 ${
            performanceData.score >= 90 ? 'bg-green-600' :
            performanceData.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="font-semibold">Score: {performanceData.score}</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      
      {/* Detailed View */}
      {showDetails && performanceData && (
        <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-600 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Overall Score */}
          <div className={`rounded-lg p-4 mb-4 ${
            performanceData.score >= 90 ? 'bg-green-50' :
            performanceData.score >= 50 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Overall Performance</p>
                <p className="text-3xl font-bold mt-1">
                  {performanceData.score}
                  <span className="text-lg font-normal text-gray-600">/100</span>
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  {performanceData.device === 'mobile' ? 
                    <Smartphone className="w-4 h-4" /> : 
                    <Monitor className="w-4 h-4" />
                  }
                  <span>{performanceData.device}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Globe className="w-3 h-3" />
                  <span className="text-xs">{performanceData.connection}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Core Web Vitals */}
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-gray-900 text-sm">Core Web Vitals</h4>
            
            {Object.entries(performanceData.metrics).map(([key, value]) => {
              const status = getMetricStatus(key, value);
              const unit = key === 'CLS' ? '' : 'ms';
              
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{key}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-900">
                    {value}{unit}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Recommendations */}
          {performanceData.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                Optimization Suggestions
              </h4>
              <ul className="space-y-1">
                {performanceData.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={collectMetrics}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={() => console.log(performanceData)}
              className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component imports
const ChevronUp = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const X = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default PerformanceMonitor;