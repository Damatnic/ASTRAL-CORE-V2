/**
 * ASTRAL Core V2 - Global Error Boundary
 * 
 * Crisis-safe error boundary that ensures emergency features remain accessible
 * even when other parts of the application fail.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Phone, Heart, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showCrisisResources?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * Global Error Boundary with Crisis Safety Features
 * 
 * Key Features:
 * - Always displays emergency contacts when errors occur
 * - Provides gentle, non-alarming error messages
 * - Offers multiple recovery options
 * - Logs errors for debugging while protecting user privacy
 * - Never blocks access to crisis intervention features
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private errorLogTimeout: NodeJS.Timeout | null = null;
  refs: any;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a user-friendly error ID for support purposes
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    
    return {
      hasError: true,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store error details for logging
    this.setState({
      error,
      errorInfo,
    });

    // Log error with privacy protection
    this.logErrorSafely(error, errorInfo);
  }

  /**
   * Log errors safely without exposing sensitive user data
   */
  private logErrorSafely = (error: Error, errorInfo: ErrorInfo) => {
    // Debounce error logging to prevent spam
    if (this.errorLogTimeout) {
      clearTimeout(this.errorLogTimeout);
    }

    this.errorLogTimeout = setTimeout(() => {
      try {
        const errorData = {
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          // Explicitly exclude any user data
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('🚨 ASTRAL Core Error Boundary Caught Error:', errorData);
        }

        // Send to error tracking service (Sentry, etc.)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: `${error.message} (${this.state.errorId})`,
            fatal: false,
          });
        }

        // Store locally for support purposes (without sensitive data)
        const errorLog = {
          id: this.state.errorId,
          timestamp: errorData.timestamp,
          message: error.message,
        };
        
        localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorLog));
      } catch (loggingError) {
        // If logging fails, fail silently to not impact user experience
        console.warn('Error logging failed:', loggingError);
      }
    }, 1000);
  };

  /**
   * Attempt to recover from error
   */
  private handleRecovery = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    });
  };

  /**
   * Navigate to safe fallback page
   */
  private handleSafeNavigation = (path: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    } catch (error) {
      // If navigation fails, try page reload
      window.location.reload();
    }
  };

  /**
   * Emergency contact component - always visible during errors
   */
  private renderEmergencyContacts = () => (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Phone className="w-5 h-5 text-red-600 mr-2" />
        <h3 className="font-semibold text-red-900">Emergency Resources Available</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a
          href="tel:988"
          className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900">988 Crisis Lifeline</p>
            <p className="text-sm text-gray-600">24/7 Crisis Support</p>
          </div>
          <Phone className="w-4 h-4 text-red-600" />
        </a>
        <a
          href="tel:911"
          className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900">911 Emergency</p>
            <p className="text-sm text-gray-600">Immediate Emergency</p>
          </div>
          <Phone className="w-4 h-4 text-red-600" />
        </a>
        <a
          href="sms:741741"
          className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900">Crisis Text Line</p>
            <p className="text-sm text-gray-600">Text HOME to 741741</p>
          </div>
          <Phone className="w-4 h-4 text-red-600" />
        </a>
      </div>
    </div>
  );

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
              {this.props.showCrisisResources !== false && this.renderEmergencyContacts()}
              {this.props.fallback}
            </div>
          </div>
        );
      }

      // Default error fallback
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Always show emergency contacts first */}
            {this.renderEmergencyContacts()}

            {/* Main error content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're sorry, but something unexpected happened. Don't worry - your data is safe, 
                and emergency resources are always available above.
              </p>

              {/* Error ID for support */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600">
                  Error ID: <span className="font-mono font-semibold">{this.state.errorId}</span>
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Please include this ID if you contact support
                </p>
              </div>

              {/* Recovery Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={this.handleRecovery}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={() => this.handleSafeNavigation('/')}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {/* Alternative Navigation */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Or try accessing these features directly:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => this.handleSafeNavigation('/crisis')}
                    className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Heart className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Crisis Chat</span>
                  </button>
                  
                  <button
                    onClick={() => this.handleSafeNavigation('/safety')}
                    className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Safety Plan</span>
                  </button>
                  
                  <button
                    onClick={() => this.handleSafeNavigation('/mood')}
                    className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Heart className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Mood Tracker</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Reload Page</span>
                  </button>
                </div>
              </div>

              {/* Development Info */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-700">
                    Developer Details (Development Only)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  showCrisisResources: boolean = true
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <GlobalErrorBoundary fallback={fallback} showCrisisResources={showCrisisResources}>
      <WrappedComponent {...props} />
    </GlobalErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}

export default GlobalErrorBoundary;