'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  Heart, Shield, Users, Brain, Phone, MessageCircle,
  UserCheck, UserX, ChevronRight, Star, Lock
} from 'lucide-react';

export default function WelcomeStep() {
  const { userJourney, startOnboarding, updatePreferences, preferences } = useOnboarding();

  const handleJourneySelection = (journey: 'crisis' | 'general' | 'volunteer' | 'therapist') => {
    startOnboarding(journey);
  };

  const handleAnonymousToggle = (anonymous: boolean) => {
    updatePreferences({ anonymousMode: anonymous });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 id="onboarding-title" className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to ASTRAL CORE
        </h1>
        <p id="onboarding-description" className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          You've taken an important step for your wellbeing. We're here to support you on your mental health journey with compassion, safety, and respect.
        </p>
      </motion.div>

      {/* Quick Safety Note */}
      <motion.div
        className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 rounded-full p-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">You're in a Safe Space</h3>
            <p className="text-green-800 text-sm">
              Your privacy and safety are our top priorities. You can exit at any time and access crisis support immediately.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Journey Selection */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          What brings you here today?
        </h3>
        <p className="text-center text-gray-600 mb-6">
          Choose what best describes your current situation. You can change this later.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Crisis Support */}
          <motion.button
            onClick={() => handleJourneySelection('crisis')}
            className="p-6 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100 transition-all duration-300 text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 group-hover:bg-red-200 rounded-lg p-3 transition-colors">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-2">I need immediate support</h4>
                <p className="text-sm text-red-800 mb-3">
                  You're experiencing a crisis or need urgent mental health support right now.
                </p>
                <div className="flex items-center space-x-1 text-red-700 font-medium">
                  <span className="text-sm">Fast-track to crisis resources</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* General Mental Health */}
          <motion.button
            onClick={() => handleJourneySelection('general')}
            className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 transition-all duration-300 text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 group-hover:bg-blue-200 rounded-lg p-3 transition-colors">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">I want to improve my mental health</h4>
                <p className="text-sm text-blue-800 mb-3">
                  You're looking for tools and resources to support your overall wellbeing.
                </p>
                <div className="flex items-center space-x-1 text-blue-700 font-medium">
                  <span className="text-sm">Full platform tour</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Volunteer */}
          <motion.button
            onClick={() => handleJourneySelection('volunteer')}
            className="p-6 rounded-xl border-2 border-orange-200 bg-orange-50 hover:border-orange-300 hover:bg-orange-100 transition-all duration-300 text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 group-hover:bg-orange-200 rounded-lg p-3 transition-colors">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-2">I want to help others</h4>
                <p className="text-sm text-orange-800 mb-3">
                  You're interested in volunteering and supporting others in crisis.
                </p>
                <div className="flex items-center space-x-1 text-orange-700 font-medium">
                  <span className="text-sm">Volunteer onboarding</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Professional */}
          <motion.button
            onClick={() => handleJourneySelection('therapist')}
            className="p-6 rounded-xl border-2 border-purple-200 bg-purple-50 hover:border-purple-300 hover:bg-purple-100 transition-all duration-300 text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 group-hover:bg-purple-200 rounded-lg p-3 transition-colors">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2">I'm a mental health professional</h4>
                <p className="text-sm text-purple-800 mb-3">
                  You're a therapist, counselor, or other mental health professional.
                </p>
                <div className="flex items-center space-x-1 text-purple-700 font-medium">
                  <span className="text-sm">Professional tools setup</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Immediate Crisis Support - Always Visible */}
      <motion.div
        className="bg-red-100 border-2 border-red-300 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="text-center">
          <h4 className="text-lg font-semibold text-red-900 mb-3">
            Need Help Right Now?
          </h4>
          <p className="text-red-800 mb-4">
            Don't wait - immediate support is available 24/7
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:988"
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 988 Now</span>
            </a>
            <a
              href="sms:741741"
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Text 741741</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}