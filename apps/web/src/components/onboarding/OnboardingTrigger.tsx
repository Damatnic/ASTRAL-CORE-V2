'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  Settings, Phone, MessageCircle, Users, Brain, 
  BookOpen, ChevronRight, Heart, HelpCircle 
} from 'lucide-react';

interface OnboardingTriggerProps {
  variant?: 'button' | 'card' | 'banner';
  className?: string;
  showOptions?: boolean;
}

export default function OnboardingTrigger({ 
  variant = 'button', 
  className = '',
  showOptions = false 
}: OnboardingTriggerProps) {
  const { startOnboarding, isFirstVisit } = useOnboarding();

  const journeyOptions = [
    {
      id: 'crisis',
      title: 'I need immediate support',
      description: 'Fast-track to crisis resources and safety information',
      icon: Phone,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'general',
      title: 'I want to improve my mental health',
      description: 'Complete tour of all platform features and tools',
      icon: Brain,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'volunteer',
      title: 'I want to help others',
      description: 'Volunteer onboarding and training information',
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'therapist',
      title: 'I\'m a mental health professional',
      description: 'Professional tools and platform overview',
      icon: BookOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  if (variant === 'button') {
    return (
      <button
        onClick={() => startOnboarding('general')}
        className={`inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>{isFirstVisit ? 'Start Tour' : 'Take Tour Again'}</span>
      </button>
    );
  }

  if (variant === 'banner' && isFirstVisit) {
    return (
      <motion.div
        className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Welcome to ASTRAL CORE
              </h3>
              <p className="text-blue-800 mb-4">
                Take a quick tour to learn how our platform can support your mental health journey.
              </p>
              {showOptions ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {journeyOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => startOnboarding(option.id as any)}
                      className={`p-3 rounded-lg ${option.bgColor} ${option.borderColor} border-2 text-left hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center space-x-2">
                        <option.icon className={`w-4 h-4 ${option.color.replace('bg-', 'text-')}`} />
                        <span className="text-sm font-medium text-gray-900">{option.title}</span>
                        <ChevronRight className="w-3 h-3 text-gray-500 group-hover:translate-x-1 transition-transform ml-auto" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => startOnboarding('general')}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Start Tour</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => startOnboarding('general')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Close welcome banner"
          >
            {/* We could add a close button here, but for mental health apps, we want to encourage onboarding */}
          </button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        className={`bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Platform Tour
          </h3>
          <p className="text-gray-600 mb-4">
            {isFirstVisit 
              ? 'Learn how to use ASTRAL CORE to support your mental health'
              : 'Want a refresher? Take the tour again anytime'
            }
          </p>
          
          {showOptions ? (
            <div className="space-y-2">
              {journeyOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => startOnboarding(option.id as any)}
                  className={`w-full p-3 rounded-lg ${option.bgColor} ${option.borderColor} border text-left hover:shadow-sm transition-all group`}
                >
                  <div className="flex items-center space-x-3">
                    <option.icon className={`w-4 h-4 ${option.color.replace('bg-', 'text-')}`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => startOnboarding('general')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isFirstVisit ? 'Start Tour' : 'Take Tour Again'}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}