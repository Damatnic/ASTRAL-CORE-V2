'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Onboarding step types for different user journeys
export type OnboardingStep = 
  | 'welcome' 
  | 'crisis-safety' 
  | 'platform-overview' 
  | 'mood-tracking-intro' 
  | 'safety-planning-intro' 
  | 'wellness-tools-intro' 
  | 'personalization' 
  | 'crisis-resources' 
  | 'complete';

export type UserJourneyType = 'crisis' | 'general' | 'volunteer' | 'therapist' | 'returning';

export interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  userJourney: UserJourneyType;
  canSkip: boolean;
  isFirstVisit: boolean;
  preferences: {
    anonymousMode: boolean;
    accessibilityMode: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    communicationPreferences: string[];
    personalizedWelcome: boolean;
  };
}

export interface OnboardingContextType extends OnboardingState {
  startOnboarding: (journey: UserJourneyType) => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: OnboardingStep) => void;
  updatePreferences: (preferences: Partial<OnboardingState['preferences']>) => void;
  resetOnboarding: () => void;
  markAsReturningUser: () => void;
  emergencyExit: () => void; // Crisis-safe immediate exit
}

const defaultState: OnboardingState = {
  isActive: false,
  currentStep: 'welcome',
  completedSteps: [],
  userJourney: 'general',
  canSkip: true,
  isFirstVisit: true,
  preferences: {
    anonymousMode: true,
    accessibilityMode: false,
    reducedMotion: false,
    highContrast: false,
    communicationPreferences: [],
    personalizedWelcome: true,
  },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Define step flows for different user journeys
const getStepFlow = (journey: UserJourneyType): OnboardingStep[] => {
  switch (journey) {
    case 'crisis':
      return [
        'welcome',
        'crisis-safety',
        'crisis-resources',
        'mood-tracking-intro',
        'safety-planning-intro',
        'complete'
      ];
    case 'general':
      return [
        'welcome',
        'platform-overview',
        'mood-tracking-intro',
        'safety-planning-intro',
        'wellness-tools-intro',
        'personalization',
        'crisis-resources',
        'complete'
      ];
    case 'volunteer':
      return [
        'welcome',
        'platform-overview',
        'crisis-resources',
        'personalization',
        'complete'
      ];
    case 'therapist':
      return [
        'welcome',
        'platform-overview',
        'crisis-resources',
        'personalization',
        'complete'
      ];
    case 'returning':
      return [
        'welcome',
        'platform-overview',
        'complete'
      ];
    default:
      return [
        'welcome',
        'platform-overview',
        'mood-tracking-intro',
        'safety-planning-intro',
        'wellness-tools-intro',
        'personalization',
        'crisis-resources',
        'complete'
      ];
  }
};

interface OnboardingProviderProps {
  children: ReactNode;
  autoStart?: boolean; // Start onboarding automatically for first-time users
}

export function OnboardingProvider({ children, autoStart = true }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>(defaultState);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('astral-onboarding-state');
      const savedPreferences = localStorage.getItem('astral-user-preferences');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setState(prevState => ({
          ...prevState,
          ...parsedState,
          isActive: false, // Always start with onboarding inactive
        }));
      }

      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setState(prevState => ({
          ...prevState,
          preferences: { ...prevState.preferences, ...parsedPreferences }
        }));
      }

      // Check if this is a first visit
      const hasVisited = localStorage.getItem('astral-has-visited');
      if (!hasVisited && autoStart) {
        setState(prevState => ({
          ...prevState,
          isFirstVisit: true,
          isActive: true,
        }));
        localStorage.setItem('astral-has-visited', 'true');
      } else {
        setState(prevState => ({
          ...prevState,
          isFirstVisit: false,
        }));
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
      // Continue with default state if there's an error
    }
  }, [autoStart]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        completedSteps: state.completedSteps,
        userJourney: state.userJourney,
        isFirstVisit: state.isFirstVisit,
      };
      localStorage.setItem('astral-onboarding-state', JSON.stringify(stateToSave));
      localStorage.setItem('astral-user-preferences', JSON.stringify(state.preferences));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, [state.completedSteps, state.userJourney, state.isFirstVisit, state.preferences]);

  const startOnboarding = (journey: UserJourneyType) => {
    setState(prevState => ({
      ...prevState,
      isActive: true,
      userJourney: journey,
      currentStep: 'welcome',
      canSkip: journey !== 'crisis', // Crisis users should not skip safety info
    }));
  };

  const skipOnboarding = () => {
    if (!state.canSkip) return; // Prevent skipping for crisis users
    
    setState(prevState => ({
      ...prevState,
      isActive: false,
      currentStep: 'complete',
    }));
  };

  const nextStep = () => {
    const stepFlow = getStepFlow(state.userJourney);
    const currentIndex = stepFlow.indexOf(state.currentStep);
    
    if (currentIndex < stepFlow.length - 1) {
      const nextStep = stepFlow[currentIndex + 1];
      setState(prevState => ({
        ...prevState,
        currentStep: nextStep,
      }));
    } else {
      // Reached the end
      setState(prevState => ({
        ...prevState,
        isActive: false,
        currentStep: 'complete',
      }));
    }
  };

  const previousStep = () => {
    const stepFlow = getStepFlow(state.userJourney);
    const currentIndex = stepFlow.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      const prevStep = stepFlow[currentIndex - 1];
      setState(prevState => ({
        ...prevState,
        currentStep: prevStep,
      }));
    }
  };

  const completeStep = (step: OnboardingStep) => {
    setState(prevState => ({
      ...prevState,
      completedSteps: [...new Set([...prevState.completedSteps, step])],
    }));
  };

  const updatePreferences = (preferences: Partial<OnboardingState['preferences']>) => {
    setState(prevState => ({
      ...prevState,
      preferences: { ...prevState.preferences, ...preferences },
    }));
  };

  const resetOnboarding = () => {
    setState(defaultState);
    try {
      localStorage.removeItem('astral-onboarding-state');
      localStorage.removeItem('astral-user-preferences');
      localStorage.removeItem('astral-has-visited');
    } catch (error) {
      console.error('Error resetting onboarding state:', error);
    }
  };

  const markAsReturningUser = () => {
    setState(prevState => ({
      ...prevState,
      isFirstVisit: false,
      userJourney: 'returning',
    }));
  };

  // Emergency exit for crisis situations - immediately close onboarding
  const emergencyExit = () => {
    setState(prevState => ({
      ...prevState,
      isActive: false,
      currentStep: 'complete',
    }));
    
    // Focus on crisis resources
    const crisisButton = document.querySelector('[href="tel:988"]') as HTMLElement;
    if (crisisButton) {
      crisisButton.focus();
    }
  };

  const contextValue: OnboardingContextType = {
    ...state,
    startOnboarding,
    skipOnboarding,
    nextStep,
    previousStep,
    completeStep,
    updatePreferences,
    resetOnboarding,
    markAsReturningUser,
    emergencyExit,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}