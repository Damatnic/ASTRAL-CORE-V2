/**
 * Accessibility Testing Dashboard
 * 
 * Real-time accessibility monitoring and testing interface
 * For development and QA validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, Info, X, Play,
  Eye, EyeOff, Keyboard, Focus, Volume2, Contrast,
  Monitor, Smartphone, Tablet, RefreshCw, Download,
  Settings, Bug, TrendingUp, Clock, Target
} from 'lucide-react';
import { 
  AccessibilityTester, 
  AccessibilityReport, 
  AccessibilityTestResult,
  runQuickAccessibilityCheck,
  enableAccessibilityMonitoring
} from '@/utils/accessibility-testing';
import { useAccessibility } from './AccessibilityEnhancer';

interface AccessibilityDashboardProps {
  /** Whether to show in development mode only */
  developmentOnly?: boolean;
  /** Auto-run tests on mount */
  autoRun?: boolean;
}

export function AccessibilityDashboard({ 
  developmentOnly = true, 
  autoRun = false 
}: AccessibilityDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [selectedTest, setSelectedTest] = useState<AccessibilityTestResult | null>(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [activeTests, setActiveTests] = useState<Set<string>>(new Set([
    'keyboard', 'focus', 'contrast', 'screenReader', 'skip', 'forms', 'images', 'headings', 'landmarks', 'crisis', 'chat'
  ]));

  const { settings, announceToScreenReader } = useAccessibility();

  // Hide in production if developmentOnly is true
  if (developmentOnly && process.env.NODE_ENV === 'production') {
    return null;
  }

  useEffect(() => {
    if (autoRun) {
      runTests();
    }
  }, [autoRun]);

  const runTests = async () => {
    setIsRunning(true);
    announceToScreenReader('Running accessibility tests');
    
    try {
      const tester = new AccessibilityTester();
      const testReport = await tester.runAllTests();
      setReport(testReport);
      
      announceToScreenReader(
        `Accessibility tests completed. Score: ${testReport.score}%. ${testReport.errors} errors, ${testReport.warnings} warnings.`
      );
    } catch (error) {
      console.error('Accessibility test failed:', error);
      announceToScreenReader('Accessibility tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  const toggleMonitoring = () => {
    if (!monitoringEnabled) {
      enableAccessibilityMonitoring();
      setMonitoringEnabled(true);
      announceToScreenReader('Accessibility monitoring enabled');
    } else {
      setMonitoringEnabled(false);
      announceToScreenReader('Accessibility monitoring disabled');
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const renderTestResult = (result: AccessibilityTestResult, index: number) => {
    const Icon = result.passed ? CheckCircle : 
                result.severity === 'error' ? AlertTriangle : Info;
    const iconColor = result.passed ? 'text-green-600' : 
                     result.severity === 'error' ? 'text-red-600' : 'text-yellow-600';

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          selectedTest === result ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => setSelectedTest(selectedTest === result ? null : result)}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {result.testName}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                result.severity === 'error' ? 'bg-red-100 text-red-800' :
                result.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {result.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {result.message}
            </p>
            {result.wcagCriterion && (
              <p className="text-xs text-gray-500 mt-1">
                WCAG: {result.wcagCriterion}
              </p>
            )}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {selectedTest === result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.element && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Element:</h5>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block overflow-x-auto">
                    {result.element.tagName.toLowerCase()}
                    {result.element.className && ` class="${result.element.className}"`}
                    {result.element.id && ` id="${result.element.id}"`}
                  </code>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      result.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      result.element?.focus();
                    }}
                  >
                    Scroll to element
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="Open accessibility dashboard"
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => setIsOpen(false)}
      />

      {/* Dashboard Panel */}
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Accessibility Dashboard
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close accessibility dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm">Run Tests</span>
            </button>

            <button
              onClick={toggleMonitoring}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                monitoringEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm">Monitor</span>
            </button>

            {report && (
              <button
                onClick={exportReport}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Export report"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isRunning ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Running accessibility tests...</p>
              </div>
            </div>
          ) : report ? (
            <div className="p-4 space-y-6">
              {/* Score */}
              <div className={`p-4 rounded-lg border ${getScoreBg(report.score)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Accessibility Score
                    </h3>
                    <p className="text-sm text-gray-600">
                      {report.passed} passed, {report.failed} failed
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score}%
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">{report.errors}</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{report.warnings}</p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                <div className="space-y-2">
                  {report.results.map(renderTestResult)}
                </div>
              </div>

              {/* Report Info */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p>Report generated: {report.timestamp.toLocaleString()}</p>
                <p>Page: {report.pageUrl}</p>
                <p>Total tests: {report.totalTests}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Run tests to see accessibility report</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                document.documentElement.classList.toggle('high-contrast');
                announceToScreenReader('High contrast toggled');
              }}
              className="flex items-center space-x-2 p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Contrast className="w-4 h-4" />
              <span>Toggle Contrast</span>
            </button>

            <button
              onClick={() => {
                document.documentElement.classList.toggle('reduce-motion');
                announceToScreenReader('Reduced motion toggled');
              }}
              className="flex items-center space-x-2 p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Focus className="w-4 h-4" />
              <span>Toggle Motion</span>
            </button>

            <button
              onClick={() => {
                const focusable = document.querySelectorAll('[tabindex], button, a, input, select, textarea');
                focusable.forEach(el => el.classList.toggle('outline-2'));
                announceToScreenReader('Focus indicators toggled');
              }}
              className="flex items-center space-x-2 p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Target className="w-4 h-4" />
              <span>Show Focus</span>
            </button>

            <button
              onClick={() => {
                const skipLink = document.querySelector('a[href="#main-content"]') as HTMLElement;
                skipLink?.focus();
                announceToScreenReader('Skip link focused');
              }}
              className="flex items-center space-x-2 p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Keyboard className="w-4 h-4" />
              <span>Test Skip Link</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Lightweight accessibility status indicator
 */
export function AccessibilityIndicator() {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const checkAccessibility = async () => {
    setIsRunning(true);
    try {
      const report = await runQuickAccessibilityCheck();
      setLastScore(report.score);
    } catch (error) {
      console.error('Quick accessibility check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run quick check on mount
    checkAccessibility();
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={checkAccessibility}
        disabled={isRunning}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        title={`Accessibility score: ${lastScore || 'Unknown'}%`}
      >
        {isRunning ? (
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <Shield className="w-4 h-4 text-gray-600" />
        )}
        
        {lastScore !== null && (
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(lastScore)}`} />
            <span className="text-xs font-medium text-gray-700">{lastScore}%</span>
          </div>
        )}
      </button>
    </div>
  );
}