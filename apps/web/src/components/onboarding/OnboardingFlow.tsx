'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  X, ChevronLeft, ChevronRight, Phone, MessageCircle, 
  Heart, Shield, AlertCircle, CheckCircle, SkipForward
} from 'lucide-react';

// Import onboarding step components
import WelcomeStep from './steps/WelcomeStep';
import CrisisSafetyStep from './steps/CrisisSafetyStep';
import PlatformOverviewStep from './steps/PlatformOverviewStep';
import MoodTrackingIntroStep from './steps/MoodTrackingIntroStep';
import SafetyPlanningIntroStep from './steps/SafetyPlanningIntroStep';
import WellnessToolsIntroStep from './steps/WellnessToolsIntroStep';
import PersonalizationStep from './steps/PersonalizationStep';
import CrisisResourcesStep from './steps/CrisisResourcesStep';
import CompleteStep from './steps/CompleteStep';

interface OnboardingFlowProps {
  className?: string;
}

// Step component mapping
const stepComponents = {
  welcome: WelcomeStep,
  'crisis-safety': CrisisSafetyStep,
  'platform-overview': PlatformOverviewStep,
  'mood-tracking-intro': MoodTrackingIntroStep,
  'safety-planning-intro': SafetyPlanningIntroStep,
  'wellness-tools-intro': WellnessToolsIntroStep,
  personalization: PersonalizationStep,
  'crisis-resources': CrisisResourcesStep,
  complete: CompleteStep,
};

// Get step titles for progress indicator
const stepTitles = {
  welcome: 'Welcome',
  'crisis-safety': 'Crisis Safety',
  'platform-overview': 'Platform Overview',
  'mood-tracking-intro': 'Mood Tracking',
  'safety-planning-intro': 'Safety Planning',
  'wellness-tools-intro': 'Wellness Tools',
  personalization: 'Personalization',
  'crisis-resources': 'Crisis Resources',
  complete: 'Complete',
};

export default function OnboardingFlow({ className = '' }: OnboardingFlowProps) {
  const {
    isActive,
    currentStep,
    userJourney,
    canSkip,
    nextStep,
    previousStep,
    skipOnboarding,
    emergencyExit,
    completeStep,
  } = useOnboarding();

  const [isVisible, setIsVisible] = useState(false);

  // Control visibility with animation
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      return undefined;
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          // Emergency exit for crisis situations
          if (event.ctrlKey || event.metaKey) {
            emergencyExit();
          } else if (canSkip) {
            skipOnboarding();
          }
          break;
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            previousStep();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, canSkip, nextStep, previousStep, skipOnboarding, emergencyExit]);

  // Auto-focus management for accessibility
  useEffect(() => {
    if (isActive) {
      const focusTarget = document.querySelector('[data-onboarding-focus]') as HTMLElement;
      if (focusTarget) {
        focusTarget.focus();
      }
    }
  }, [currentStep, isActive]);

  if (!isVisible) return null;

  const CurrentStepComponent = stepComponents[currentStep];

  if (!CurrentStepComponent) {
    console.error(`No component found for step: ${currentStep}`);
    return null;
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Crisis Safety Header - Always Visible */}
            <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between" role="banner">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Crisis Support Always Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="tel:988"
                    className="flex items-center space-x-1 bg-white text-red-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                    aria-label="Call 988 Crisis Hotline immediately"
                  >
                    <Phone className="w-3 h-3" />
                    <span>988</span>
                  </a>
                  <a
                    href="sms:741741"
                    className="flex items-center space-x-1 bg-white text-red-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                    aria-label="Text HOME to 741741"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Text</span>
                  </a>
                </div>
              </div>
              
              {/* Emergency Exit Button */}
              <button
                onClick={emergencyExit}
                className="p-1 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                aria-label="Emergency exit - immediate access to crisis resources"
                title="Emergency Exit (Ctrl+Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Onboarding Content */}
            <div className="flex-1 overflow-auto">
              <CurrentStepComponent />
            </div>

            {/* Navigation Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200" role="navigation" aria-label="Onboarding navigation">
              <div className="flex items-center justify-between">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {stepTitles[currentStep]}
                  </span>
                  <div className="flex items-center space-x-1">
                    {/* Simple progress dots */}
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-3">
                  {/* Skip Button - Only for non-crisis users */}
                  {canSkip && currentStep !== 'complete' && (
                    <button
                      onClick={skipOnboarding}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      aria-label="Skip onboarding tour"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Skip for now</span>
                    </button>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={previousStep}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentStep === 'welcome'}
                    aria-label="Go to previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  {/* Next/Complete Button */}
                  <button
                    onClick={() => {
                      completeStep(currentStep);
                      if (currentStep === 'complete') {
                        // Handle completion
                        return;
                      }
                      nextStep();
                    }}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    data-onboarding-focus
                    aria-label={currentStep === 'complete' ? 'Finish onboarding' : 'Continue to next step'}
                  >
                    <span>{currentStep === 'complete' ? 'Get Started' : 'Continue'}</span>
                    {currentStep === 'complete' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="mt-2 text-xs text-gray-700 text-center">
                <span>Use Ctrl+→ to continue, Ctrl+← to go back</span>
                {canSkip && <span>, Esc to skip</span>}
                <span>, Ctrl+Esc for emergency exit</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}