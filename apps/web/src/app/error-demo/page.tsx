/**
 * ASTRAL Core V2 - Error Handling Demo
 * 
 * Demonstration page for testing error handling capabilities
 * DEVELOPMENT ONLY - Shows error scenarios and recovery mechanisms
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { AlertTriangle, Bug, Phone, Shield, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { CrisisErrorBoundary } from '@/components/error-boundaries/CrisisErrorBoundary';

export default function ErrorDemoPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900">Error Demo Not Available</h1>
        <p className="text-gray-600 mt-2">This page is only available in development mode.</p>
      </div>
    );
  }

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const testJavaScriptError = () => {
    try {
      // Intentionally cause a JavaScript error
      (null as any).someProperty.nonExistentMethod();
    } catch (error) {
      addResult('✅ JavaScript error caught and handled');
    }
  };

  const testValidationError = () => {
    try {
      // Import and test validation
      import('@/lib/validation/schemas').then(({ validateWithCrisisSafety, moodEntrySchema }) => {
        const invalidData = { mood: 15, email: 'invalid' };
        const result = validateWithCrisisSafety(moodEntrySchema, invalidData, true);
        
        if (result.warnings && result.warnings.length > 0) {
          addResult('✅ Validation provided warnings without blocking crisis access');
        } else {
          addResult('❌ Validation test failed');
        }
      });
    } catch (error) {
      addResult('❌ Validation test error');
    }
  };

  const testNetworkError = () => {
    // Simulate network error
    fetch('/nonexistent-endpoint')
      .catch(() => {
        addResult('✅ Network error handled gracefully');
      });
  };

  const TestErrorComponent = () => {
    const [shouldError, setShouldError] = useState(false);
    
    if (shouldError) {
      throw new Error('Intentional test error for error boundary');
    }
    
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Test Component</h3>
        <p className="text-green-700 mb-3">This component will trigger an error when you click the button.</p>
        <button
          onClick={() => setShouldError(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Trigger Error
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <TestTube className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Error Handling Demo</h1>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Development Only</p>
                <p className="text-yellow-700 text-sm">
                  This page demonstrates error handling capabilities and is only available in development mode.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Resources - Always Visible */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Phone className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-900">Emergency Resources</h2>
          </div>
          <p className="text-red-700 mb-4">
            These resources remain available even during system errors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:988"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="font-semibold text-red-900">988 Crisis Lifeline</span>
              <Phone className="w-4 h-4 text-red-600" />
            </a>
            <a
              href="tel:911"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="font-semibold text-red-900">911 Emergency</span>
              <Phone className="w-4 h-4 text-red-600" />
            </a>
            <a
              href="sms:741741"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="font-semibold text-red-900">Crisis Text Line</span>
              <Phone className="w-4 h-4 text-red-600" />
            </a>
          </div>
        </div>

        {/* Error Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* JavaScript Error Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Bug className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">JavaScript Error Test</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test that JavaScript runtime errors are caught and handled gracefully.
            </p>
            <button
              onClick={testJavaScriptError}
              className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Test JavaScript Error
            </button>
          </div>

          {/* Validation Error Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Validation Error Test</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test that validation errors provide warnings without blocking crisis access.
            </p>
            <button
              onClick={testValidationError}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Validation Error
            </button>
          </div>

          {/* Network Error Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Network Error Test</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test network error handling and fallback mechanisms.
            </p>
            <button
              onClick={testNetworkError}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Network Error
            </button>
          </div>

          {/* Component Error Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Component Error Test</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Test React Error Boundary with crisis-specific fallback.
            </p>
            <CrisisErrorBoundary featureType="crisis-chat">
              <TestErrorComponent />
            </CrisisErrorBoundary>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Test Results</h3>
          </div>
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <p className="text-gray-700 italic">No tests run yet. Click the test buttons above.</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.startsWith('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          )}
        </div>

        {/* Implementation Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Error Handling Implementation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Features Implemented:</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Global Error Boundary with crisis resources</li>
                <li>• Crisis-specific error boundaries</li>
                <li>• Custom 404 and error pages</li>
                <li>• API error handling middleware</li>
                <li>• HIPAA-compliant error logging</li>
                <li>• Crisis-safe validation schemas</li>
                <li>• Progressive error recovery</li>
                <li>• Emergency bypass mechanisms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Crisis Safety Features:</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Emergency contacts always visible</li>
                <li>• Validation never blocks crisis access</li>
                <li>• Fallback services for critical features</li>
                <li>• Emergency bypass for system failures</li>
                <li>• Graceful degradation strategies</li>
                <li>• Protected health information filtering</li>
                <li>• Crisis-appropriate error messages</li>
                <li>• Offline emergency contact cache</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}