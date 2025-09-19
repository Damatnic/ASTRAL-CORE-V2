'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

/**
 * Peer Support Community Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Moderated peer support groups
 * - Safe community spaces
 * - Shared experiences and recovery stories
 * - Anonymous participation options
 * - Crisis-aware design
 * - WCAG 2.2 AA compliant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, MessageCircle, Heart, Shield, Clock, 
  ArrowRight, Star, AlertCircle, CheckCircle2,
  UserCheck, Globe, Lock, Headphones
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isActive: boolean;
  moderators: number;
  tags: string[];
  safetyLevel: 'high' | 'medium';
}

const supportGroups: SupportGroup[] = [
  {
    id: 'anxiety-support',
    name: 'Anxiety & Panic Support',
    description: 'A safe space for those dealing with anxiety disorders, panic attacks, and related challenges.',
    category: 'Mental Health Conditions',
    memberCount: 2847,
    isActive: true,
    moderators: 8,
    tags: ['Anxiety', 'Panic', 'Coping Skills', 'Daily Support'],
    safetyLevel: 'high'
  },
  {
    id: 'depression-community',
    name: 'Depression Recovery Community',
    description: 'Supporting each other through depression with understanding, hope, and practical strategies.',
    category: 'Mental Health Conditions',
    memberCount: 3241,
    isActive: true,
    moderators: 12,
    tags: ['Depression', 'Recovery', 'Hope', 'Daily Check-ins'],
    safetyLevel: 'high'
  },
  {
    id: 'crisis-survivors',
    name: 'Crisis Survivors Circle',
    description: 'For those who have overcome crisis situations and want to support others on their journey.',
    category: 'Recovery & Support',
    memberCount: 1205,
    isActive: true,
    moderators: 15,
    tags: ['Crisis', 'Survivors', 'Recovery', 'Mentorship'],
    safetyLevel: 'high'
  },
  {
    id: 'daily-wellness',
    name: 'Daily Wellness Check-ins',
    description: 'Daily motivation, wellness tips, and accountability for maintaining mental health.',
    category: 'Wellness & Self-Care',
    memberCount: 4892,
    isActive: true,
    moderators: 6,
    tags: ['Wellness', 'Daily', 'Motivation', 'Accountability'],
    safetyLevel: 'medium'
  },
  {
    id: 'young-adults',
    name: 'Young Adults Mental Health',
    description: 'Peer support specifically for young adults (18-25) navigating mental health challenges.',
    category: 'Age-Specific',
    memberCount: 1876,
    isActive: true,
    moderators: 10,
    tags: ['Young Adults', 'Students', 'Career', 'Relationships'],
    safetyLevel: 'high'
  },
  {
    id: 'workplace-stress',
    name: 'Workplace Mental Health',
    description: 'Support for work-related stress, burnout, and maintaining mental health in professional settings.',
    category: 'Life Situations',
    memberCount: 2134,
    isActive: true,
    moderators: 7,
    tags: ['Work', 'Burnout', 'Stress', 'Professional'],
    safetyLevel: 'medium'
  }
];

const communityStats = [
  { label: 'Active Members', value: '15,000+', icon: Users },
  { label: 'Support Groups', value: '25+', icon: MessageCircle },
  { label: 'Trained Moderators', value: '100+', icon: UserCheck },
  { label: 'Messages Daily', value: '5,000+', icon: Heart }
];

const safetyFeatures = [
  {
    title: 'Trained Moderators',
    description: 'All groups are moderated by trained volunteers with mental health backgrounds',
    icon: UserCheck
  },
  {
    title: 'Crisis Detection',
    description: 'Automated systems and moderators watch for crisis situations and provide immediate support',
    icon: AlertCircle
  },
  {
    title: 'Safe Space Guidelines',
    description: 'Strict community guidelines ensure respectful, supportive, and safe interactions',
    icon: Shield
  },
  {
    title: 'Anonymous Options',
    description: 'Participate anonymously with username-only identification for privacy',
    icon: Lock
  }
];

export default function PeerSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    'all',
    'Mental Health Conditions',
    'Recovery & Support',
    'Wellness & Self-Care',
    'Age-Specific',
    'Life Situations'
  ];

  const filteredGroups = selectedCategory === 'all' 
    ? supportGroups 
    : supportGroups.filter(group => group.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Peer Support Community
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Connect with others who understand your journey. Share experiences, find hope, 
            and support each other in safe, moderated community spaces.
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
                <span className="font-medium">In crisis? Get immediate professional help: </span>
                <Link href="/crisis" className="ml-2 underline hover:no-underline">
                  Crisis Support
                </Link>
              </div>
            </Glass>
          </motion.div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Glass className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safety Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Your Safety is Our Priority
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Glass className="p-6 text-center h-full">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 text-sm">{feature.description}</p>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Find Your Community
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'All Groups' : category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Support Groups Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Glass className={`p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                  group.safetyLevel === 'high' ? 'border-2 border-green-200 bg-green-50/20' : ''
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                          {group.name}
                          {group.safetyLevel === 'high' && (
                            <Shield className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {group.memberCount.toLocaleString()} members
                          <span className="mx-2">•</span>
                          <UserCheck className="w-4 h-4 mr-1" />
                          {group.moderators} mods
                        </div>
                      </div>
                    </div>
                    {group.isActive && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                    {group.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {group.category}
                    </span>
                    
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="text-blue-600 font-medium text-sm"
                    >
                      Join Group →
                    </motion.div>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Glass className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              How Peer Support Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: 'Join a Group',
                  description: 'Browse our moderated support groups and join those that resonate with your experience and needs.',
                  icon: Users
                },
                {
                  step: 2,
                  title: 'Share & Connect',
                  description: 'Share your story, listen to others, and build meaningful connections with people who understand.',
                  icon: Heart
                },
                {
                  step: 3,
                  title: 'Grow Together',
                  description: 'Support each other through challenges, celebrate victories, and grow stronger together.',
                  icon: Star
                }
              ].map((item, index) => (
                <div key={item.step} className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </Glass>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Connect?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              You don't have to face your challenges alone. Join our supportive community and discover 
              the power of shared experiences and mutual support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                Browse Support Groups
              </button>
              <Link
                href="/crisis"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Need Immediate Help?
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}