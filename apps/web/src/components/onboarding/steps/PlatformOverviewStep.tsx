'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Smile, Shield, Heart, Star, Users, Brain,
  Target, TrendingUp, MessageCircle, Phone, ChevronRight
} from 'lucide-react';

export default function PlatformOverviewStep() {
  const features = [
    {
      icon: Smile,
      title: 'Mood Tracking',
      description: 'Check in with yourself daily and track your emotional wellbeing over time',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Shield,
      title: 'Safety Planning',
      description: 'Create and update your personal safety plan for difficult moments',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Heart,
      title: 'Wellness Tools',
      description: 'Access breathing exercises, meditation, and other self-care activities',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Users,
      title: 'Crisis Support',
      description: 'Connect with trained volunteers for immediate support when you need it',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      icon: Star,
      title: 'Progress Rewards',
      description: 'Earn achievements and track your wellness journey with gentle gamification',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Brain,
      title: 'Mental Health Resources',
      description: 'Access educational content and evidence-based mental health information',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Your Mental Health Toolkit
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ASTRAL CORE provides evidence-based tools and support to help you maintain and improve your mental wellbeing.
        </p>
      </motion.div>

      {/* Core Features Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-xl p-6`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-700">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="bg-gray-50 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          How ASTRAL CORE Works for You
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start Where You Are</h4>
            <p className="text-sm text-gray-600">
              Begin with simple check-ins and explore tools at your own pace
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Build Your Routine</h4>
            <p className="text-sm text-gray-600">
              Develop healthy habits with gentle reminders and progress tracking
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <span className="text-purple-600 font-bold text-lg">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Get Support</h4>
            <p className="text-sm text-gray-600">
              Access crisis support and professional resources whenever needed
            </p>
          </div>
        </div>
      </motion.div>

      {/* Privacy and Control */}
      <motion.div
        className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-green-900 mb-4">
            You're Always in Control
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-800">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p><strong>Privacy First:</strong> Your data is encrypted and protected</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p><strong>Your Pace:</strong> Use tools when and how you want</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p><strong>Choose Support:</strong> Decide when to connect with others</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Always Available Support */}
      <motion.div
        className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Crisis Support is Always Available
          </h3>
          <p className="text-red-800 mb-4">
            Every page includes easy access to immediate help
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">988 Crisis Line</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
              <MessageCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">Crisis Text Support</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
              <Users className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">Volunteer Support</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}