'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Phone, MessageCircle, Heart, AlertTriangle, CheckCircle,
  Clock, Users, Home, Star
} from 'lucide-react';

export default function CrisisSafetyStep() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Your Safety is Our Priority
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Before we continue, let's make sure you know how to get help immediately if you need it.
        </p>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
            <Phone className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="font-bold text-red-900 mb-2">988 Crisis Lifeline</h3>
          <p className="text-red-800 text-sm mb-4">
            24/7 free and confidential support for people in distress
          </p>
          <a
            href="tel:988"
            className="inline-flex items-center justify-center w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Call 988 Now
          </a>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-blue-900 mb-2">Crisis Text Line</h3>
          <p className="text-blue-800 text-sm mb-4">
            Text HOME to 741741 for 24/7 crisis counseling
          </p>
          <a
            href="sms:741741"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Text 741741
          </a>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
          <div className="bg-orange-100 rounded-full p-4 inline-flex mb-4">
            <Phone className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="font-bold text-orange-900 mb-2">Emergency Services</h3>
          <p className="text-orange-800 text-sm mb-4">
            For life-threatening emergencies, call 911 immediately
          </p>
          <a
            href="tel:911"
            className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Call 911
          </a>
        </div>
      </motion.div>

      {/* Crisis Warning Signs */}
      <motion.div
        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-start space-x-4">
          <div className="bg-yellow-100 rounded-full p-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              When to Seek Immediate Help
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div>
                <h4 className="font-medium mb-2">Contact 988 or 741741 if you have:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Thoughts of suicide or self-harm</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Overwhelming feelings of despair</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Feeling like you have no way out</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Call 911 if you have:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Made a suicide attempt</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Immediate plan to hurt yourself</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    <span>Medical emergency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Safety Features */}
      <motion.div
        className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            How ASTRAL CORE Keeps You Safe
          </h3>
          <p className="text-green-800">
            Our platform is designed with your safety and wellbeing in mind
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">24/7 Crisis Access</h4>
                <p className="text-sm text-green-800">Crisis resources are always visible and accessible</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Trained Volunteers</h4>
                <p className="text-sm text-green-800">Connect with caring, trained crisis support volunteers</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Privacy Protected</h4>
                <p className="text-sm text-green-800">Your information is encrypted and kept confidential</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Home className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Safe Environment</h4>
                <p className="text-sm text-green-800">Judgment-free space designed for healing and support</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">You're in Control</h4>
                <p className="text-sm text-green-800">You decide what to share and when to seek help</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Professional Standards</h4>
                <p className="text-sm text-green-800">Evidence-based tools and crisis intervention protocols</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reassurance Message */}
      <motion.div
        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <Heart className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          You're Not Alone
        </h3>
        <p className="text-blue-800 max-w-2xl mx-auto">
          Taking care of your mental health is a sign of strength, not weakness. 
          We're here to support you every step of the way, and help is always available when you need it.
        </p>
      </motion.div>
    </div>
  );
}