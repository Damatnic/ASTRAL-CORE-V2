'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


/**
 * Support Hub Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Comprehensive support options including:
 * - Crisis chat support
 * - Peer support community
 * - Professional therapist services
 * - Group therapy sessions
 * - 24/7 hotlines and resources
 * - WCAG 2.2 AA compliant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, MessageCircle, Star, Phone, Video, Calendar,
  Clock, Shield, Heart, AlertCircle, CheckCircle2,
  ArrowRight, Headphones, Globe, MapPin, UserCheck
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  availability: string;
  responseTime?: string;
  isImmediate?: boolean;
  isProfessional?: boolean;
  isFree?: boolean;
  features: string[];
  userCount?: string;
  rating?: number;
}

const supportOptions: SupportOption[] = [
  {
    id: 'crisis-chat',
    title: 'Crisis Chat Support',
    description: 'Immediate text-based support with trained crisis counselors available 24/7',
    href: '/crisis/chat',
    icon: MessageCircle,
    availability: '24/7',
    responseTime: 'Immediate',
    isImmediate: true,
    isProfessional: true,
    isFree: true,
    features: ['Anonymous chat', 'Trained counselors', 'Crisis intervention', 'Safety planning'],
    userCount: '5,000+',
    rating: 4.9
  },
  {
    id: 'peer-support',
    title: 'Peer Support Community',
    description: 'Connect with others who understand your journey through moderated peer support groups',
    href: '/peer-support',
    icon: Users,
    availability: '24/7',
    responseTime: 'Varies',
    isImmediate: false,
    isProfessional: false,
    isFree: true,
    features: ['Peer connections', 'Shared experiences', 'Moderated groups', 'Safe space'],
    userCount: '12,000+',
    rating: 4.7
  },
  {
    id: 'professional-therapy',
    title: 'Professional Therapist Services',
    description: 'Licensed mental health professionals for ongoing therapy and specialized treatment',
    href: '/therapist',
    icon: Star,
    availability: 'Business Hours',
    responseTime: '24-48 hours',
    isImmediate: false,
    isProfessional: true,
    isFree: false,
    features: ['Licensed therapists', 'Individual therapy', 'Specialized treatment', 'Insurance accepted'],
    userCount: '2,500+',
    rating: 4.8
  },
  {
    id: 'group-therapy',
    title: 'Group Therapy Sessions',
    description: 'Structured group sessions led by licensed professionals for various mental health topics',
    href: '/groups',
    icon: Users,
    availability: 'Scheduled',
    responseTime: 'Weekly sessions',
    isImmediate: false,
    isProfessional: true,
    isFree: false,
    features: ['Group sessions', 'Licensed facilitators', 'Structured programs', 'Multiple topics'],
    userCount: '800+',
    rating: 4.6
  }
];

const emergencyResources = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: 'Free, confidential crisis support 24/7',
    type: 'Crisis Hotline'
  },
  {
    name: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME for immediate crisis support',
    type: 'Text Support'
  },
  {
    name: 'SAMHSA National Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referral and information service',
    type: 'Treatment Referral'
  }
];

const stats = [
  { label: 'Active Support Members', value: '20,000+', icon: Users },
  { label: 'Support Sessions Monthly', value: '150K+', icon: MessageCircle },
  { label: 'Licensed Professionals', value: '500+', icon: Star },
  { label: 'Average Response Time', value: '< 2 min', icon: Clock }
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'immediate' | 'professional' | 'peer'>('all');

  const filteredOptions = supportOptions.filter(option => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'immediate') return option.isImmediate;
    if (selectedCategory === 'professional') return option.isProfessional;
    if (selectedCategory === 'peer') return !option.isProfessional;
    return true;
  });

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
              className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Get Support
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            You're not alone in your mental health journey. Connect with trained professionals, 
            supportive peers, and crisis counselors who understand and care.
          </p>

          {/* Emergency Crisis Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <Glass className="p-6 bg-red-50 border-2 border-red-200">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center text-red-700 mb-4 md:mb-0">
                  <AlertCircle className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">In Crisis? Get Immediate Help</h3>
                    <p className="text-sm">Available 24/7 - No wait times</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href="tel:988"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call 988
                  </a>
                  <Link
                    href="/crisis/chat"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Crisis Chat
                  </Link>
                </div>
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
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
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

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { id: 'all', label: 'All Support Options', icon: Users },
              { id: 'immediate', label: 'Immediate Help', icon: AlertCircle },
              { id: 'professional', label: 'Professional Services', icon: Star },
              { id: 'peer', label: 'Peer Support', icon: Heart }
            ].map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Support Options Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Support Path
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {filteredOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link href={option.href}>
                  <Glass className={`p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    option.isImmediate ? 'border-2 border-red-200 bg-red-50/20' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`${
                          option.isImmediate 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : option.isProfessional
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                        } p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          <option.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
                            {option.title}
                            {option.isImmediate && (
                              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                                24/7
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 flex-wrap gap-2">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {option.availability}
                            </div>
                            {option.responseTime && (
                              <>
                                <span>•</span>
                                <span>{option.responseTime} response</span>
                              </>
                            )}
                            {option.isFree && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Free</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {option.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {option.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {option.userCount} users
                      </div>
                      
                      {option.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-700">{option.rating}</span>
                        </div>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`font-medium text-sm mt-4 ${
                        option.isImmediate ? 'text-red-600' : 'text-purple-600'
                      }`}
                    >
                      Get Support →
                    </motion.div>
                  </Glass>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Hotlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Emergency Hotlines & Resources
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {emergencyResources.map((resource, index) => (
              <motion.div
                key={resource.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <Glass className="p-6 text-center border-2 border-orange-200 bg-orange-50/20">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {resource.name}
                  </h3>
                  
                  <a
                    href={`tel:${resource.number}`}
                    className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors mb-2 block"
                  >
                    {resource.number}
                  </a>
                  
                  <p className="text-gray-700 text-sm mb-3">
                    {resource.description}
                  </p>
                  
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {resource.type}
                  </span>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How Support Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Glass className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              How Our Support Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: 'Choose Your Support',
                  description: 'Select the type of support that fits your needs - immediate crisis help, peer connection, or professional therapy.',
                  icon: Users
                },
                {
                  step: 2,
                  title: 'Connect Safely',
                  description: 'All our support options are private, secure, and staffed by trained professionals or moderated volunteers.',
                  icon: Shield
                },
                {
                  step: 3,
                  title: 'Get Ongoing Help',
                  description: 'Build lasting connections, develop coping strategies, and access resources for your continued mental health journey.',
                  icon: Heart
                }
              ].map((item, index) => (
                <div key={item.step} className="text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <Glass className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Support?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Taking the first step towards getting support takes courage. We're here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/crisis/chat"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Start Crisis Chat
              </Link>
              <Link
                href="/peer-support"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Join Peer Support
              </Link>
              <Link
                href="/therapist"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Find a Therapist
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}