'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, Phone, Search, ArrowRight } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function HelpPage() {
  const helpTopics = [
    { title: 'Getting Started', desc: 'How to use the platform and find support', href: '/help/getting-started' },
    { title: 'Crisis Support', desc: 'How to access immediate crisis help', href: '/crisis' },
    { title: 'Wellness Tools', desc: 'Using breathing, mindfulness, and self-help tools', href: '/wellness' },
    { title: 'Community Guidelines', desc: 'Rules and expectations for community participation', href: '/help/guidelines' },
    { title: 'Privacy & Safety', desc: 'How we protect your data and ensure safety', href: '/help/privacy' },
    { title: 'Technical Support', desc: 'Troubleshooting and technical assistance', href: '/help/technical' }
  ];

  const quickActions = [
    { title: 'Contact Support', desc: 'Get help from our team', icon: MessageCircle, href: '/help/contact' },
    { title: 'Crisis Hotlines', desc: 'Emergency phone numbers', icon: Phone, href: '/crisis/resources' },
    { title: 'FAQ', desc: 'Frequently asked questions', icon: Book, href: '/help/faq' },
    { title: 'Search Help', desc: 'Find specific information', icon: Search, href: '/help/search' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Help & Support
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Find answers, get support, and learn how to make the most of your mental health journey with Astral.
          </p>

          {/* Emergency Notice */}
          <Glass className="p-6 max-w-4xl mx-auto mb-12 bg-red-50 border-2 border-red-200">
            <div className="text-red-700 text-center">
              <Phone className="w-6 h-6 mx-auto mb-2" />
              <h3 className="text-lg font-bold mb-2">Need Immediate Help?</h3>
              <p className="mb-4">If you're in crisis, don't wait for help documentation</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:988" className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Call 988 Crisis Line
                </a>
                <Link href="/crisis/chat" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Start Crisis Chat
                </Link>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={action.href}>
                    <Glass className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-700 text-sm">{action.desc}</p>
                    </Glass>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Help Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Help Topics
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpTopics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link href={topic.href}>
                  <Glass className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-gray-700 text-sm">{topic.desc}</p>
                  </Glass>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you navigate 
              the platform and get the mental health support you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Contact Support Team
              </button>
              <Link href="/community" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Ask the Community
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}