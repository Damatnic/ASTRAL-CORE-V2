'use client';

/**
 * Resources Hub Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Educational content and resources including:
 * - Mental health education
 * - Crisis resources
 * - Recovery stories
 * - Professional guides
 * - Support networks
 * - WCAG 2.2 AA compliant
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Heart, AlertCircle, Star, Users, Phone,
  FileText, Video, Headphones, Globe, ArrowRight,
  Clock, Shield, CheckCircle2, ExternalLink
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'crisis' | 'stories' | 'guides' | 'networks';
  type: 'article' | 'video' | 'audio' | 'interactive' | 'external';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  href: string;
  isExternal?: boolean;
  rating?: number;
  views?: number;
}

const resources: Resource[] = [
  {
    id: 'understanding-anxiety',
    title: 'Understanding Anxiety Disorders',
    description: 'Comprehensive guide to recognizing and managing various anxiety disorders',
    category: 'education',
    type: 'article',
    duration: '15 min read',
    difficulty: 'beginner',
    href: '/education/anxiety-disorders',
    rating: 4.8,
    views: 25000
  },
  {
    id: 'crisis-hotlines',
    title: 'Crisis Hotlines & Emergency Resources',
    description: 'Complete directory of crisis support numbers and emergency resources',
    category: 'crisis',
    type: 'interactive',
    duration: '5 min',
    difficulty: 'beginner',
    href: '/crisis/resources',
    rating: 4.9,
    views: 45000
  },
  {
    id: 'recovery-journey',
    title: 'Recovery Stories: From Crisis to Hope',
    description: 'Inspiring stories of recovery and resilience from community members',
    category: 'stories',
    type: 'video',
    duration: '20-30 min',
    difficulty: 'beginner',
    href: '/stories',
    rating: 4.7,
    views: 18000
  },
  {
    id: 'therapist-guide',
    title: 'How to Find the Right Therapist',
    description: 'Professional guide to selecting and working with mental health professionals',
    category: 'guides',
    type: 'article',
    duration: '12 min read',
    difficulty: 'intermediate',
    href: '/education/finding-therapist',
    rating: 4.6,
    views: 32000
  },
  {
    id: 'support-networks',
    title: 'Building Your Support Network',
    description: 'Learn how to identify, build, and maintain supportive relationships',
    category: 'networks',
    type: 'interactive',
    duration: '25 min',
    difficulty: 'intermediate',
    href: '/education/support-networks',
    rating: 4.5,
    views: 15000
  }
];

const categories = [
  { id: 'all', label: 'All Resources', icon: BookOpen, color: 'blue' },
  { id: 'education', label: 'Education', icon: BookOpen, color: 'purple' },
  { id: 'crisis', label: 'Crisis Resources', icon: AlertCircle, color: 'red' },
  { id: 'stories', label: 'Recovery Stories', icon: Heart, color: 'green' },
  { id: 'guides', label: 'Professional Guides', icon: Star, color: 'orange' },
  { id: 'networks', label: 'Support Networks', icon: Users, color: 'teal' }
];

const quickAccess = [
  {
    title: 'National Suicide Prevention Lifeline',
    number: '988',
    description: '24/7 crisis support',
    color: 'red'
  },
  {
    title: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME for support',
    color: 'blue'
  },
  {
    title: 'SAMHSA Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referrals',
    color: 'green'
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
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
              className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Mental Health Resources
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Access comprehensive mental health education, crisis resources, recovery stories, 
            and professional guidance to support your wellbeing journey.
          </p>

          {/* Quick Access Crisis Numbers */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {quickAccess.map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Glass className={`p-4 text-center border-2 ${
                  item.color === 'red' ? 'border-red-200 bg-red-50' :
                  item.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                  'border-green-200 bg-green-50'
                }`}>
                  <Phone className={`w-6 h-6 mx-auto mb-2 ${
                    item.color === 'red' ? 'text-red-600' :
                    item.color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                  <a href={`tel:${item.number}`} className={`text-xl font-bold block mb-1 hover:underline ${
                    item.color === 'red' ? 'text-red-700' :
                    item.color === 'blue' ? 'text-blue-700' :
                    'text-green-700'
                  }`}>
                    {item.number}
                  </a>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-600 text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Quick Access
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Educational Content', href: '/education', icon: BookOpen, color: 'purple' },
              { title: 'Crisis Resources', href: '/crisis/resources', icon: AlertCircle, color: 'red' },
              { title: 'Recovery Stories', href: '/stories', icon: Heart, color: 'green' },
              { title: 'Self-Help Tools', href: '/self-help', icon: Star, color: 'blue' }
            ].map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={link.href}>
                    <Glass className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className={`bg-gradient-to-r ${
                        link.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        link.color === 'red' ? 'from-red-500 to-red-600' :
                        link.color === 'green' ? 'from-green-500 to-green-600' :
                        'from-blue-500 to-blue-600'
                      } p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{link.title}</h3>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto transition-colors duration-300" />
                    </Glass>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Resources ({filteredResources.length})
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => {
              const typeIcons = {
                article: FileText,
                video: Video,
                audio: Headphones,
                interactive: Star,
                external: ExternalLink
              };
              const TypeIcon = typeIcons[resource.type];
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={resource.href}>
                    <Glass className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                            <TypeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {resource.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {resource.duration}
                              <span className="mx-2">•</span>
                              <span className="capitalize">{resource.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {resource.views?.toLocaleString()} views
                        </div>
                        {resource.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-700">{resource.rating}</span>
                          </div>
                        )}
                      </div>

                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${
                        resource.category === 'crisis' ? 'bg-red-100 text-red-700' :
                        resource.category === 'education' ? 'bg-purple-100 text-purple-700' :
                        resource.category === 'stories' ? 'bg-green-100 text-green-700' :
                        resource.category === 'guides' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                      </span>
                    </Glass>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Support?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If you're in crisis or need immediate help, don't wait. Professional support is available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/crisis"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Crisis Support
              </Link>
              <Link
                href="/support"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Get Support
              </Link>
              <a
                href="tel:988"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                Call 988
              </a>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}