/**
 * ASTRAL Core V2 - Global Error Page
 * 
 * Crisis-safe error page that ensures emergency resources are always accessible
 * even when the application encounters unexpected errors.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Phone, Heart, Home, RefreshCw, MessageCircle, Shield } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Page Component
 * 
 * This component handles unexpected application errors while maintaining
 * access to critical crisis intervention features.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const errorId = React.useMemo(() => 
    `ERR-${Date.now().toString(36).toUpperCase()}`, []
  );

  useEffect(() => {
    // Log error for monitoring (without sensitive data)
    console.error('Global error page triggered:', {
      errorId,
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // Store error info locally for support
    try {
      const errorLog = {
        id: errorId,
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      localStorage.setItem(`error_${errorId}`, JSON.stringify(errorLog));
    } catch (e) {
      // Fail silently if localStorage is not available
    }
  }, [error, errorId]);

  const emergencyContacts = [
    {
      name: '988 Crisis Lifeline',
      description: '24/7 Crisis Support & Suicide Prevention',
      phone: '988',
      href: 'tel:988',
      icon: Phone,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: '911 Emergency Services',
      description: 'Immediate Life-Threatening Emergency',
      phone: '911',
      href: 'tel:911',
      icon: Phone,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741',
      phone: '741741',
      href: 'sms:741741',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  const quickActions = [
    {
      name: 'Crisis Chat',
      description: 'Talk to someone now',
      href: '/crisis',
      icon: MessageCircle,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: 'Safety Plan',
      description: 'Access your safety plan',
      href: '/safety',
      icon: Shield,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      name: 'Mood Tracker',
      description: 'Track how you\'re feeling',
      href: '/mood',
      icon: Heart,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-semibold">
            🚨 Emergency resources are always available - see below for immediate help
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Emergency Contacts - Always Visible */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <Phone className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-900">Emergency Help Available</h2>
          </div>
          <p className="text-red-700 mb-4">
            If you're in crisis or need immediate help, these resources are always available:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.phone}
                href={contact.href}
                className={`flex items-center justify-between p-4 ${contact.bgColor} rounded-lg hover:shadow-md transition-all ${contact.borderColor} border`}
              >
                <div>
                  <div className={`font-semibold ${contact.color}`}>{contact.name}</div>
                  <div className={`text-sm ${contact.color} opacity-80`}>{contact.description}</div>
                </div>
                <contact.icon className={`w-5 h-5 ${contact.color}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Main Error Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're sorry, but something unexpected happened. Don't worry - your data is safe, 
              and all emergency resources remain available. You can try to recover or access 
              other features below.
            </p>

            {/* Error ID for support */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                <strong>Error ID:</strong> <span className="font-mono">{errorId}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please include this ID if you contact support
              </p>
            </div>

            {/* Recovery Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={reset}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              
              <a
                href="/"
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Home
              </a>
            </div>
          </div>
        </div>

        {/* Quick Access to Crisis Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Access Crisis Support Features
          </h3>
          <p className="text-gray-600 text-center mb-6">
            These essential features remain available even when other parts of the app have issues:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className={`flex flex-col items-center p-6 ${action.bgColor} rounded-lg hover:shadow-md transition-all ${action.borderColor} border text-center`}
              >
                <action.icon className={`w-8 h-8 ${action.color} mb-3`} />
                <div className={`font-semibold ${action.color} mb-1`}>{action.name}</div>
                <div className={`text-sm ${action.color} opacity-80`}>{action.description}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Alternative Resources */}
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Online Resources:</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• <a href="https://suicidepreventionlifeline.org" className="underline hover:text-blue-900">National Suicide Prevention Lifeline</a></li>
                <li>• <a href="https://www.crisistextline.org" className="underline hover:text-blue-900">Crisis Text Line</a></li>
                <li>• <a href="https://www.samhsa.gov" className="underline hover:text-blue-900">SAMHSA National Helpline</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">When to Seek Help:</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Thoughts of hurting yourself or others</li>
                <li>• Feeling out of control or overwhelmed</li>
                <li>• Substance use concerns</li>
                <li>• Any mental health emergency</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Information */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
              Developer Information (Development Only)
            </summary>
            <div className="mt-3 text-xs font-mono bg-white p-3 rounded border overflow-auto">
              <div className="mb-2">
                <strong>Error Message:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="mb-2">
                  <strong>Error Digest:</strong> {error.digest}
                </div>
              )}
              <div>
                <strong>Stack Trace:</strong>
                <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}