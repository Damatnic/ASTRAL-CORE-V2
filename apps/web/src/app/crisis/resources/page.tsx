'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Phone, MessageCircle, Globe, Clock, Shield } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function CrisisResourcesPage() {
  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 crisis support for suicidal thoughts",
      type: "Crisis Hotline"
    },
    {
      name: "Crisis Text Line",
      number: "741741", 
      description: "Text HOME for immediate crisis support",
      type: "Text Support"
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Treatment referral and information service",
      type: "Treatment Referral"
    },
    {
      name: "Emergency Services",
      number: "911",
      description: "Immediate emergency medical and safety response", 
      type: "Emergency"
    }
  ];

  const crisisTools = [
    {
      title: "Safety Planning",
      description: "Create a personalized crisis safety plan",
      href: "/safety",
      icon: Shield
    },
    {
      title: "Crisis Chat",
      description: "Immediate chat support with trained counselors",
      href: "/crisis/chat", 
      icon: MessageCircle
    },
    {
      title: "Breathing Exercises",
      description: "Quick breathing techniques for panic relief",
      href: "/wellness/breathing",
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-2xl shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-6">
            Crisis Resources
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Immediate help and resources when you need them most. Available 24/7 for crisis situations and mental health emergencies.
          </p>

          <Glass className="p-6 max-w-4xl mx-auto mb-12 bg-red-50 border-2 border-red-200">
            <div className="text-red-700 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">If you are in immediate danger</h3>
              <p className="mb-4">Call 911 or go to your nearest emergency room immediately</p>
              <a href="tel:911" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-block">
                Call 911 Now
              </a>
            </div>
          </Glass>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Emergency Contact Numbers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Glass className="p-6 text-center border-2 border-orange-200 bg-orange-50/20">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {contact.name}
                  </h3>
                  
                  <a
                    href={`tel:${contact.number}`}
                    className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors mb-2 block"
                  >
                    {contact.number}
                  </a>
                  
                  <p className="text-gray-700 text-sm mb-3">
                    {contact.description}
                  </p>
                  
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {contact.type}
                  </span>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Crisis Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Immediate Crisis Tools
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {crisisTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={tool.href}>
                    <Glass className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                      <p className="text-gray-700 text-sm">{tool.description}</p>
                    </Glass>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Remember: You Are Not Alone
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Crisis situations are temporary. Help is available, and recovery is possible. 
              Reach out for support when you need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Support
              </Link>
              <Link href="/peer-support" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Peer Support
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}