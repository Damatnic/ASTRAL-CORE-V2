'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, Phone, Heart, CheckCircle, AlertCircle,
  FileText, Star, Lock, MessageCircle
} from 'lucide-react';

export default function SafetyPlanningIntroStep() {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const safetyElements = [
    { id: 'warning-signs', label: 'Early warning signs', icon: AlertCircle },
    { id: 'coping-strategies', label: 'Coping strategies', icon: Heart },
    { id: 'support-contacts', label: 'Support contacts', icon: Users },
    { id: 'professional-help', label: 'Professional help numbers', icon: Phone },
    { id: 'safe-environment', label: 'Making environment safe', icon: Shield },
    { id: 'reasons-to-live', label: 'Reasons for living', icon: Star }
  ];

  const toggleElement = (elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Create Your Safety Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A safety plan is your personalized guide for staying safe during difficult moments. 
          It helps you recognize warning signs and know exactly what to do.
        </p>
      </motion.div>

      {/* What is a Safety Plan */}
      <motion.div
        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            What Goes Into a Safety Plan?
          </h3>
          <p className="text-blue-800">
            Click on the elements you'd like to include in your safety plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {safetyElements.map((element) => (
            <motion.button
              key={element.id}
              onClick={() => toggleElement(element.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedElements.includes(element.id)
                  ? 'bg-green-100 border-green-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-25'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedElements.includes(element.id) ? 'bg-green-200' : 'bg-gray-100'
                }`}>
                  <element.icon className={`w-5 h-5 ${
                    selectedElements.includes(element.id) ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`font-medium ${
                  selectedElements.includes(element.id) ? 'text-green-900' : 'text-gray-700'
                }`}>
                  {element.label}
                </span>
                {selectedElements.includes(element.id) && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {selectedElements.length > 0 && (
          <motion.div
            className="mt-6 p-4 bg-green-100 rounded-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              Great! You've selected {selectedElements.length} elements for your safety plan.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Why Safety Plans Work */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="bg-purple-100 rounded-full p-3 inline-flex mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-purple-900 mb-2">Evidence-Based</h3>
          <p className="text-sm text-purple-800">
            Safety plans are recommended by mental health professionals and proven to reduce crisis risk
          </p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="bg-green-100 rounded-full p-3 inline-flex mb-4">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-900 mb-2">Personalized</h3>
          <p className="text-sm text-green-800">
            Your plan is unique to you - your triggers, your support system, your coping strategies
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="bg-blue-100 rounded-full p-3 inline-flex mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-blue-900 mb-2">Always Available</h3>
          <p className="text-sm text-blue-800">
            Access your plan anytime, even when you're not thinking clearly during a crisis
          </p>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="bg-gray-50 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          How Your Safety Plan Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Recognize Signs</h4>
            <p className="text-sm text-gray-600">
              Notice early warning signs that you might be struggling
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Use Coping Skills</h4>
            <p className="text-sm text-gray-600">
              Try your personalized coping strategies first
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-purple-600 font-bold text-lg">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Get Support</h4>
            <p className="text-sm text-gray-600">
              Reach out to your support network or crisis resources
            </p>
          </div>
        </div>
      </motion.div>

      {/* Privacy and Control */}
      <motion.div
        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-start space-x-4">
          <div className="bg-yellow-100 rounded-full p-3">
            <Lock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Your Safety Plan is Private
            </h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>Only you can see your safety plan</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>You can update it anytime</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>You choose what to include</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                <span>You decide when to share it with professionals</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Crisis Resources Always Available */}
      <motion.div
        className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Need Help Right Now?
          </h3>
          <p className="text-red-800 mb-4">
            Don't wait to create your safety plan. Immediate support is available.
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