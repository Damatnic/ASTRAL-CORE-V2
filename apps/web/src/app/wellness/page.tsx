'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

/**
 * Wellness Hub Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Comprehensive wellness tools hub featuring:
 * - Mental health tools and techniques
 * - Self-care resources
 * - Evidence-based therapeutic tools
 * - Crisis-first design approach
 * - WCAG 2.2 AA compliant
 */

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Activity, Headphones, Brain, Shield, 
  ChevronRight, Star, Clock, Users, ArrowRight,
  TrendingUp, Calendar, BookOpen, Sparkles,
  AlertCircle, Zap, Target, Compass
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface WellnessTool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'immediate' | 'daily' | 'long-term';
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isCrisisRelevant?: boolean;
}

const wellnessTools: WellnessTool[] = [
  {
    id: 'mood-tracking',
    title: 'Mood Tracking',
    description: 'Gamified mood tracking with insights and patterns to understand your emotional patterns',
    href: '/mood-gamified',
    icon: Activity,
    category: 'daily',
    duration: '2-5 min',
    difficulty: 'beginner',
    benefits: ['Self-awareness', 'Pattern recognition', 'Progress tracking'],
    isPopular: true
  },
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Guided breathing techniques for immediate stress relief and anxiety management',
    href: '/wellness/breathing',
    icon: Headphones,
    category: 'immediate',
    duration: '3-10 min',
    difficulty: 'beginner',
    benefits: ['Stress relief', 'Anxiety reduction', 'Improved focus'],
    isPopular: true,
    isCrisisRelevant: true
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness & Meditation',
    description: 'Mindfulness exercises, guided meditations, and grounding techniques',
    href: '/wellness/mindfulness',
    icon: Brain,
    category: 'daily',
    duration: '5-30 min',
    difficulty: 'beginner',
    benefits: ['Mental clarity', 'Emotional regulation', 'Present moment awareness'],
    isCrisisRelevant: true
  },
  {
    id: 'safety-planning',
    title: 'Safety Planning',
    description: 'Create personalized safety plans for crisis situations and mental health emergencies',
    href: '/safety',
    icon: Shield,
    category: 'long-term',
    duration: '15-30 min',
    difficulty: 'intermediate',
    benefits: ['Crisis preparedness', 'Self-protection', 'Peace of mind'],
    isNew: true,
    isCrisisRelevant: true
  },
  {
    id: 'coping-skills',
    title: 'Coping Skills Toolkit',
    description: 'Evidence-based coping strategies for various mental health challenges',
    href: '/self-help',
    icon: Target,
    category: 'immediate',
    duration: '5-15 min',
    difficulty: 'beginner',
    benefits: ['Emotional regulation', 'Stress management', 'Resilience building'],
    isCrisisRelevant: true
  },
  {
    id: 'goal-setting',
    title: 'Wellness Goals',
    description: 'Set and track personalized mental health and wellness goals',
    href: '/wellness/goals',
    icon: Compass,
    category: 'long-term',
    duration: '10-20 min',
    difficulty: 'intermediate',
    benefits: ['Motivation', 'Direction', 'Achievement tracking'],
    isNew: true
  }
];

const categories = [
  {
    id: 'immediate',
    title: 'Immediate Relief',
    description: 'Quick tools for when you need help right now',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'daily',
    title: 'Daily Wellness',
    description: 'Regular practices for ongoing mental health',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'long-term',
    title: 'Long-term Growth',
    description: 'Building skills and resilience over time',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
];

const stats = [
  { label: 'Active Users', value: '12,000+', icon: Users },
  { label: 'Sessions Completed', value: '850K+', icon: TrendingUp },
  { label: 'Average Rating', value: '4.8/5', icon: Star },
  { label: 'Tools Available', value: '25+', icon: BookOpen }
];

export default function WellnessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Wellness Tools
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover evidence-based tools and techniques to support your mental health journey. 
            From immediate relief to long-term growth, find what works for you.
          </p>

          {/* Crisis Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <Glass className="p-4 bg-red-50 border-2 border-red-200">
              <div className="flex items-center justify-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">In crisis? Get immediate help: </span>
                <Link href="/crisis" className="ml-2 underline hover:no-underline">
                  Crisis Support
                </Link>
                <span className="mx-2">•</span>
                <a href="tel:988" className="underline hover:no-underline">
                  Call 988
                </a>
              </div>
            </Glass>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Glass className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Path to Wellness
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Glass className={`p-6 h-full border-2 ${category.borderColor} ${category.bgColor}/30 hover:shadow-lg transition-all duration-300`}>
                  <div className="text-center">
                    <h3 className={`text-xl font-bold ${category.color} mb-3`}>
                      {category.title}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {category.description}
                    </p>
                    <div className="text-sm text-gray-600">
                      {wellnessTools.filter(tool => tool.category === category.id).length} tools available
                    </div>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wellness Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Tools
            </h2>
            <Link
              href="/self-help"
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              View All Tools
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link href={tool.href}>
                  <Glass className={`p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    tool.isCrisisRelevant ? 'border-2 border-red-200 bg-red-50/20' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`${
                          tool.isCrisisRelevant 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                        } p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                            {tool.title}
                            {tool.isPopular && (
                              <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current" />
                            )}
                            {tool.isNew && (
                              <Sparkles className="w-4 h-4 text-green-500 ml-2" />
                            )}
                            {tool.isCrisisRelevant && (
                              <Zap className="w-4 h-4 text-red-500 ml-2" />
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {tool.duration}
                            <span className="mx-2">•</span>
                            <span className="capitalize">{tool.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                      {tool.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tool.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        categories.find(c => c.id === tool.category)?.bgColor
                      } ${categories.find(c => c.id === tool.category)?.color}`}>
                        {categories.find(c => c.id === tool.category)?.title}
                      </span>
                      
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="text-purple-600 font-medium text-sm"
                      >
                        Try now →
                      </motion.div>
                    </div>
                  </Glass>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Support?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If you're in crisis or need immediate help, our crisis support team is available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/crisis"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Get Crisis Support
              </Link>
              <Link
                href="/crisis/chat"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Start Crisis Chat
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}