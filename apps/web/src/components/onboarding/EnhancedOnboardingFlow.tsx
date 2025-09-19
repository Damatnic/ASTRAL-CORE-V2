'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  X, ChevronLeft, ChevronRight, Phone, MessageCircle, 
  Heart, Shield, AlertCircle, CheckCircle, SkipForward,
  Sparkles, ArrowRight, Zap, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Import onboarding step components
import WelcomeStep from './steps/WelcomeStep';
import TermsAcceptanceStep from './steps/TermsAcceptanceStep';
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
  'terms-acceptance': TermsAcceptanceStep,
  'crisis-safety': CrisisSafetyStep,
  'platform-overview': PlatformOverviewStep,
  'mood-tracking-intro': MoodTrackingIntroStep,
  'safety-planning-intro': SafetyPlanningIntroStep,
  'wellness-tools-intro': WellnessToolsIntroStep,
  personalization: PersonalizationStep,
  'crisis-resources': CrisisResourcesStep,
  complete: CompleteStep,
};

// Step titles for progress indicator
const stepTitles = {
  welcome: 'Welcome',
  'terms-acceptance': 'Terms & Privacy',
  'crisis-safety': 'Crisis Safety',
  'platform-overview': 'Platform Overview',
  'mood-tracking-intro': 'Mood Tracking',
  'safety-planning-intro': 'Safety Planning',
  'wellness-tools-intro': 'Wellness Tools',
  personalization: 'Personalization',
  'crisis-resources': 'Crisis Resources',
  complete: 'Complete',
};

export default function EnhancedOnboardingFlow({ className = '' }: OnboardingFlowProps) {
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
    markAsReturningUser,
  } = useOnboarding();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const stepKeys = Object.keys(stepTitles);
  const currentStepIndex = stepKeys.indexOf(currentStep);
  const totalSteps = stepKeys.length;
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  // Celebration confetti on completion
  const triggerConfetti = useCallback(() => {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
    }, 250);
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
    }, 400);
  }, []);

  // Close modal with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (currentStep === 'complete') {
        markAsReturningUser();
      } else if (canSkip) {
        skipOnboarding();
      }
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  }, [currentStep, canSkip, markAsReturningUser, skipOnboarding]);

  // Control visibility with animation
  useEffect(() => {
    if (isActive && !isClosing) {
      setIsVisible(true);
      return undefined;
    } else if (!isActive) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isActive, isClosing]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (event.ctrlKey || event.metaKey) {
            emergencyExit();
          } else if (canSkip) {
            handleClose();
          }
          break;
        case 'ArrowRight':
          if (currentStep !== 'complete') {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          if (currentStep !== 'welcome') {
            previousStep();
          }
          break;
        case 'Enter':
          if (currentStep === 'complete') {
            handleClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, canSkip, nextStep, previousStep, emergencyExit, handleClose]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > 100) {
      if (swipeDistance > 0 && currentStep !== 'welcome') {
        previousStep();
      } else if (swipeDistance < 0 && currentStep !== 'complete') {
        nextStep();
      }
    }
  };

  // Auto-focus management for accessibility
  useEffect(() => {
    if (isActive) {
      const focusTarget = document.querySelector('[data-onboarding-focus]') as HTMLElement;
      if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 100);
      }
    }
  }, [currentStep, isActive]);

  // Trigger confetti on complete step
  useEffect(() => {
    if (currentStep === 'complete' && isActive) {
      triggerConfetti();
    }
  }, [currentStep, isActive, triggerConfetti]);

  if (!isVisible) return null;

  const CurrentStepComponent = stepComponents[currentStep];

  if (!CurrentStepComponent) {
    console.error(`No component found for step: ${currentStep}`);
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
          onClick={(e) => {
            // Close on background click only if skippable
            if (e.target === e.currentTarget && canSkip) {
              handleClose();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: isClosing ? 0.9 : 1, 
              opacity: isClosing ? 0 : 1, 
              y: isClosing ? 20 : 0 
            }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Crisis Safety Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Crisis Support Always Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="tel:988"
                    className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-all transform hover:scale-105"
                    aria-label="Call 988 Crisis Hotline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>988</span>
                  </a>
                  <a
                    href="sms:741741"
                    className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition-all transform hover:scale-105"
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
                className="p-2 hover:bg-white/20 rounded-lg transition-all transform hover:scale-110"
                aria-label="Emergency exit - immediate access to crisis resources"
                title="Emergency Exit (Ctrl+Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 relative flex-shrink-0">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="bg-gradient-to-t from-gray-50 to-white px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {currentStepIndex + 1}/{totalSteps}
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      • {stepTitles[currentStep]}
                    </span>
                  </div>
                  
                  {/* Visual Progress Dots */}
                  <div className="flex items-center space-x-1">
                    {stepKeys.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${
                          index === currentStepIndex
                            ? 'w-6 h-2 bg-blue-600'
                            : index < currentStepIndex
                            ? 'w-2 h-2 bg-blue-400'
                            : 'w-2 h-2 bg-gray-300'
                        }`}
                        whileHover={{ scale: 1.2 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-3">
                  {/* Skip Button */}
                  {canSkip && currentStep !== 'complete' && (
                    <button
                      onClick={handleClose}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                      aria-label="Skip onboarding"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span className="hidden sm:inline">Skip</span>
                    </button>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={previousStep}
                    className={`flex items-center space-x-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg transition-all ${
                      currentStep === 'welcome'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105'
                    }`}
                    disabled={currentStep === 'welcome'}
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  {/* Next/Complete Button */}
                  <button
                    onClick={() => {
                      if (currentStep === 'complete') {
                        handleClose();
                      } else {
                        completeStep(currentStep);
                        nextStep();
                      }
                    }}
                    className={`flex items-center space-x-1 px-5 py-2 text-sm text-white rounded-lg transition-all transform hover:scale-105 ${
                      currentStep === 'complete'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    } shadow-lg`}
                    data-onboarding-focus
                    aria-label={currentStep === 'complete' ? 'Get Started' : 'Continue'}
                  >
                    <span>{currentStep === 'complete' ? 'Get Started' : 'Continue'}</span>
                    {currentStep === 'complete' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  Use arrow keys to navigate • Press Esc to {canSkip ? 'skip' : 'exit'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}