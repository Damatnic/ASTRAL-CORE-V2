/**
 * ASTRAL Core V2 - Crisis-Specific Error Boundary
 * 
 * Specialized error boundary for crisis intervention features.
 * Ensures that crisis chat, emergency contacts, and safety planning
 * remain accessible even when errors occur.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Phone, Heart, MessageCircle, Shield, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  featureType: 'crisis-chat' | 'safety-plan' | 'emergency-contacts' | 'assessment';
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorCount: number;
  lastErrorTime: number;
}

/**
 * Crisis-Specific Error Boundary
 * 
 * This boundary provides specialized error handling for crisis features:
 * - Always maintains access to emergency contacts
 * - Provides appropriate fallbacks for each crisis feature
 * - Implements progressive degradation strategies
 * - Never completely blocks crisis functionality
 */
export class CrisisErrorBoundary extends Component<Props, State> {
  private readonly maxRetries = 3;
  private readonly retryWindow = 60000; // 1 minute

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    
    // Reset error count if enough time has passed
    if (now - this.state.lastErrorTime > this.retryWindow) {
      this.setState({
        errorCount: 1,
        lastErrorTime: now,
      });
    } else {
      this.setState(prevState => ({
        errorCount: prevState.errorCount + 1,
        lastErrorTime: now,
      }));
    }

    // Log crisis feature error with high priority
    this.logCrisisError(error, errorInfo);
  }

  private logCrisisError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      feature: this.props.featureType,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorCount: this.state.errorCount,
      isCritical: true, // Mark as critical since it's a crisis feature
    };

    // Console logging for development
    console.error('🚨 CRITICAL: Crisis Feature Error', errorData);

    // Store in localStorage for recovery analysis
    try {
      const crisisErrors = JSON.parse(localStorage.getItem('crisisErrors') || '[]');
      crisisErrors.push(errorData);
      
      // Keep only last 10 errors to prevent storage overflow
      if (crisisErrors.length > 10) {
        crisisErrors.splice(0, crisisErrors.length - 10);
      }
      
      localStorage.setItem('crisisErrors', JSON.stringify(crisisErrors));
    } catch (storageError) {
      console.warn('Could not store crisis error for analysis:', storageError);
    }
  };

  private handleRetry = () => {
    if (this.state.errorCount < this.maxRetries) {
      this.setState({
        hasError: false,
      });
    }
  };

  private renderEmergencyContacts = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center mb-2">
        <Phone className="w-5 h-5 text-red-600 mr-2" />
        <h3 className="font-semibold text-red-900">Emergency Help Available</h3>
      </div>
      <div className="space-y-2">
        <a
          href="tel:988"
          className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
        >
          <span className="font-medium text-gray-900">988 Crisis Lifeline</span>
          <Phone className="w-4 h-4 text-red-600" />
        </a>
        <a
          href="tel:911"
          className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
        >
          <span className="font-medium text-gray-900">911 Emergency</span>
          <Phone className="w-4 h-4 text-red-600" />
        </a>
      </div>
    </div>
  );

  private renderCrisisChatFallback = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="text-center mb-6">
        <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Crisis Chat Temporarily Unavailable</h2>
        <p className="text-gray-600">
          We're sorry, but the crisis chat feature is experiencing technical difficulties.
          Please use the emergency contacts above for immediate help.
        </p>
      </div>

      {this.renderEmergencyContacts()}

      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Alternative Options:</h4>
          <ul className="text-blue-800 space-y-1">
            <li>• Text HOME to 741741 for Crisis Text Line</li>
            <li>• Visit your local emergency room</li>
            <li>• Contact your mental health provider</li>
            <li>• Reach out to a trusted friend or family member</li>
          </ul>
        </div>

        {this.state.errorCount < this.maxRetries && (
          <button
            onClick={this.handleRetry}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Crisis Chat Again
          </button>
        )}
      </div>
    </div>
  );

  private renderSafetyPlanFallback = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Safety Plan Temporarily Unavailable</h2>
        <p className="text-gray-600">
          Your safety plan couldn't load right now, but emergency help is always available.
        </p>
      </div>

      {this.renderEmergencyContacts()}

      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-green-900 mb-2">Quick Safety Reminders:</h4>
        <ul className="text-green-800 space-y-1">
          <li>• Remove or secure any harmful objects nearby</li>
          <li>• Stay in a safe, public place if possible</li>
          <li>• Contact someone you trust</li>
          <li>• Avoid alcohol or substances</li>
          <li>• Use coping strategies you know work for you</li>
        </ul>
      </div>

      {this.state.errorCount < this.maxRetries && (
        <button
          onClick={this.handleRetry}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Loading Safety Plan Again
        </button>
      )}
    </div>
  );

  private renderAssessmentFallback = () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Tool Unavailable</h2>
        <p className="text-gray-600">
          The assessment tool is temporarily unavailable, but help is still accessible.
        </p>
      </div>

      {this.renderEmergencyContacts()}

      <div className="bg-purple-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-purple-900 mb-2">Self-Assessment Questions:</h4>
        <div className="text-purple-800 space-y-2">
          <p>• Are you having thoughts of hurting yourself or others?</p>
          <p>• Do you feel like you're in immediate danger?</p>
          <p>• Are you feeling overwhelmed or out of control?</p>
          <p className="font-medium">If you answered yes to any of these, please call 988 or 911 immediately.</p>
        </div>
      </div>

      {this.state.errorCount < this.maxRetries && (
        <button
          onClick={this.handleRetry}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Assessment Again
        </button>
      )}
    </div>
  );

  private renderEmergencyContactsFallback = () => (
    <div className="bg-white rounded-lg border-2 border-red-200 p-6">
      <div className="text-center mb-6">
        <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Contacts</h2>
        <p className="text-gray-600">
          Even with technical difficulties, these emergency numbers always work:
        </p>
      </div>

      {/* Static emergency contacts that always work */}
      <div className="space-y-3">
        <a
          href="tel:988"
          className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
        >
          <div>
            <div className="font-semibold text-red-900">988 Crisis Lifeline</div>
            <div className="text-sm text-red-700">24/7 Crisis Support & Suicide Prevention</div>
          </div>
          <Phone className="w-5 h-5 text-red-600" />
        </a>

        <a
          href="tel:911"
          className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
        >
          <div>
            <div className="font-semibold text-red-900">911 Emergency Services</div>
            <div className="text-sm text-red-700">Immediate Life-Threatening Emergency</div>
          </div>
          <Phone className="w-5 h-5 text-red-600" />
        </a>

        <a
          href="sms:741741"
          className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
        >
          <div>
            <div className="font-semibold text-red-900">Crisis Text Line</div>
            <div className="text-sm text-red-700">Text HOME to 741741</div>
          </div>
          <MessageCircle className="w-5 h-5 text-red-600" />
        </a>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> These numbers work from any phone, even without cell service or internet.
        </p>
      </div>
    </div>
  );

  private renderFallback = () => {
    const { featureType, fallbackMessage } = this.props;

    switch (featureType) {
      case 'crisis-chat':
        return this.renderCrisisChatFallback();
      case 'safety-plan':
        return this.renderSafetyPlanFallback();
      case 'assessment':
        return this.renderAssessmentFallback();
      case 'emergency-contacts':
        return this.renderEmergencyContactsFallback();
      default:
        return (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Feature Temporarily Unavailable</h2>
              <p className="text-gray-600 mb-4">
                {fallbackMessage || 'This feature is experiencing technical difficulties.'}
              </p>
              {this.renderEmergencyContacts()}
              {this.state.errorCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          {this.renderFallback()}
          
          {/* Navigation to other features */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Try accessing other features:
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </button>
              {this.props.featureType !== 'crisis-chat' && (
                <button
                  onClick={() => window.location.href = '/crisis'}
                  className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Crisis Chat
                </button>
              )}
              {this.props.featureType !== 'safety-plan' && (
                <button
                  onClick={() => window.location.href = '/safety'}
                  className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Safety Plan
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CrisisErrorBoundary;