import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Shield, Users, Phone, MessageCircle, Star,
  ChevronRight, ChevronLeft, Check, AlertTriangle,
  Lock, Eye, Zap, Wind, Brain, Activity, ArrowRight,
  X, Home, LifeBuoy, User, Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  skipToMain?: boolean;
  critical?: boolean;
}

interface AnonymousOnboardingProps {
  onComplete: (preferences?: OnboardingPreferences) => void;
  onSkip?: () => void;
  className?: string;
}

interface OnboardingPreferences {
  preferredContactMethod: 'call' | 'text' | 'chat';
  triggers: string[];
  copingStrategies: string[];
  supportContacts: Array<{
    name: string;
    relationship: string;
    available: boolean;
  }>;
  hasCompletedBefore: boolean;
  wantsReminders: boolean;
}

// Crisis-specific onboarding steps
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ASTRAL CORE',
    subtitle: 'Free Crisis Support - Always Available',
    critical: true,
    content: (
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You're not alone. This platform provides <strong>free, anonymous crisis support</strong> whenever you need it.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Shield className="w-5 h-5" />
              <span className="font-medium">100% Anonymous • 100% Free • Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'crisis-access',
    title: 'Immediate Crisis Help',
    subtitle: 'How to get help right now',
    critical: true,
    skipToMain: true,
    content: (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-bold text-xl mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            If you're in crisis right now:
          </h3>
          <div className="space-y-3">
            <a
              href="tel:988"
              className="flex items-center space-x-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-6 h-6" />
              <div>
                <div className="font-bold">Call 988 Immediately</div>
                <div className="text-sm">Suicide & Crisis Lifeline</div>
              </div>
            </a>
            <a
              href="sms:741741?body=HOME"
              className="flex items-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <div>
                <div className="font-bold">Text HOME to 741741</div>
                <div className="text-sm">Crisis Text Line</div>
              </div>
            </a>
          </div>
        </div>
        <p className="text-center text-gray-600">
          Or continue to learn about all the free tools available to you →
        </p>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'Your Privacy is Sacred',
    subtitle: 'How we protect your anonymity',
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Zero-Knowledge Encryption</span>
            </div>
            <p className="text-sm text-blue-700">
              We can't see your conversations. Everything is encrypted end-to-end.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">No Registration Required</span>
            </div>
            <p className="text-sm text-green-700">
              Use all features without creating an account or sharing personal info.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">No Data Collection</span>
            </div>
            <p className="text-sm text-purple-700">
              We don't track, store, or sell your data. Ever.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Instant Access</span>
            </div>
            <p className="text-sm text-yellow-700">
              Start getting help in under 30 seconds.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Free Tools Available to You',
    subtitle: 'Everything you need for crisis support',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <LifeBuoy className="w-6 h-6 text-red-500" />
              <span className="font-medium">Crisis Chat</span>
            </div>
            <p className="text-sm text-gray-600">
              Anonymous 1-on-1 crisis support with trained volunteers
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className="font-medium">Safety Plan Builder</span>
            </div>
            <p className="text-sm text-gray-600">
              Create a personalized crisis prevention plan
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Wind className="w-6 h-6 text-cyan-500" />
              <span className="font-medium">Breathing Exercises</span>
            </div>
            <p className="text-sm text-gray-600">
              Guided techniques to manage anxiety and panic
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="font-medium">Grounding Techniques</span>
            </div>
            <p className="text-sm text-gray-600">
              Tools to help you stay present during difficult moments
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-green-500" />
              <span className="font-medium">Support Network</span>
            </div>
            <p className="text-sm text-gray-600">
              Connect with peer supporters who understand
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Home className="w-6 h-6 text-orange-500" />
              <span className="font-medium">Resource Library</span>
            </div>
            <p className="text-sm text-gray-600">
              Thousands of free crisis support resources
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'quick-setup',
    title: 'Quick Setup (Optional)',
    subtitle: 'Personalize your experience in 30 seconds',
    content: (
      <div className="space-y-6">
        <p className="text-center text-gray-600">
          Everything is optional - you can skip this and start using the platform immediately.
        </p>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Preferred contact in crisis:</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="contact" value="call" className="text-blue-600" />
                <span>Phone call</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="contact" value="text" className="text-blue-600" defaultChecked />
                <span>Text message</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="contact" value="chat" className="text-blue-600" />
                <span>Anonymous chat</span>
              </label>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Quick coping strategies:</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Breathing', 'Music', 'Walking', 'Cold water', 'Call friend', 'Journal'].map(strategy => (
                <label key={strategy} className="flex items-center space-x-2">
                  <input type="checkbox" className="text-blue-600" />
                  <span className="text-sm">{strategy}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    subtitle: 'Help is always just one click away',
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You now have access to free, anonymous crisis support whenever you need it.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Remember: You are not alone, and help is always available.
            </p>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>✅ Zero-knowledge encryption active</p>
            <p>✅ Anonymous access enabled</p>
            <p>✅ 24/7 crisis support ready</p>
            <p>✅ All features unlocked</p>
          </div>
        </div>
      </div>
    )
  }
];

export const AnonymousOnboarding: React.FC<AnonymousOnboardingProps> = ({
  onComplete,
  onSkip,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<OnboardingPreferences>>({
    preferredContactMethod: 'text',
    triggers: [],
    copingStrategies: [],
    supportContacts: [],
    hasCompletedBefore: false,
    wantsReminders: true
  });
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    // Store completion in localStorage for anonymous users
    localStorage.setItem('astral-onboarding-completed', 'true');
    localStorage.setItem('astral-onboarding-date', new Date().toISOString());
    
    onComplete(preferences as OnboardingPreferences);
  };

  const handleSkipToMain = () => {
    if (currentStepData.skipToMain) {
      handleComplete();
    }
  };

  const handleSkipAll = () => {
    if (showSkipConfirm) {
      localStorage.setItem('astral-onboarding-skipped', 'true');
      onSkip?.();
    } else {
      setShowSkipConfirm(true);
    }
  };

  // Progress percentage
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className={cn('fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{currentStepData.title}</h1>
                <p className="text-blue-100">{currentStepData.subtitle}</p>
              </div>
            </div>
            
            {!currentStepData.critical && (
              <button
                onClick={handleSkipAll}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-sm text-blue-100 mt-2">
            <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex space-x-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {/* Skip to main for crisis step */}
              {currentStepData.skipToMain && (
                <button
                  onClick={handleSkipToMain}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Skip to Crisis Support
                </button>
              )}

              {/* Skip all (non-critical steps) */}
              {!currentStepData.critical && (
                <button
                  onClick={handleSkipAll}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip All
                </button>
              )}

              {/* Next/Complete */}
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <span>{isLastStep ? 'Get Started' : 'Continue'}</span>
                {isLastStep ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-60 flex items-center justify-center p-4"
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">Skip Crisis Safety Tour?</h3>
              <p className="text-gray-600 mb-4">
                This tour shows you how to access immediate crisis support. Are you sure you want to skip it?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue Tour
                </button>
                <button
                  onClick={handleSkipAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Skip All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook to check if onboarding should be shown
export const useAnonymousOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('astral-onboarding-completed');
    const hasSkipped = localStorage.getItem('astral-onboarding-skipped');
    const isReturningUser = localStorage.getItem('astral-last-visit');

    // Show onboarding for truly new users only
    if (!hasCompleted && !hasSkipped && !isReturningUser) {
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1500); // Slight delay to let app load
    }

    // Mark this visit
    localStorage.setItem('astral-last-visit', new Date().toISOString());
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('astral-onboarding-completed');
    localStorage.removeItem('astral-onboarding-skipped');
    setShowOnboarding(true);
  };

  const completeOnboarding = (preferences?: OnboardingPreferences) => {
    setShowOnboarding(false);
    if (preferences) {
      localStorage.setItem('astral-user-preferences', JSON.stringify(preferences));
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('astral-onboarding-skipped', 'true');
  };

  return {
    showOnboarding,
    setShowOnboarding,
    resetOnboarding,
    completeOnboarding,
    skipOnboarding
  };
};

export default AnonymousOnboarding;