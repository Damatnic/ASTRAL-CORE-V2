'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Star, ArrowRight, Smile, Shield } from 'lucide-react';

export default function CompleteStep() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Wellness Journey!</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">You've completed the onboarding. You're now ready to start using ASTRAL CORE to support your mental health and wellbeing.</p>
      </motion.div>

      <motion.div className="grid md:grid-cols-3 gap-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <Smile className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-blue-900 mb-2">Start Your Check-in</h3>
          <p className="text-sm text-blue-800">Begin with a simple mood check-in to establish your baseline</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-green-900 mb-2">Create Safety Plan</h3>
          <p className="text-sm text-green-800">Build your personalized safety plan when you're ready</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center">
          <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-semibold text-purple-900 mb-2">Explore Wellness</h3>
          <p className="text-sm text-purple-800">Discover tools and activities that work best for you</p>
        </div>
      </motion.div>

      <motion.div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Remember: You're Not Alone</h3>
        <p className="text-yellow-800 max-w-2xl mx-auto">ASTRAL CORE is here to support you every step of the way. Take your time, be gentle with yourself, and remember that seeking help is a sign of strength.</p>
      </motion.div>

      <motion.div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-lg font-semibold text-red-900 mb-3">Crisis Support Always Available</h3>
        <p className="text-red-800 mb-4">Remember: If you ever need immediate help, crisis resources are always just one click away on every page.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2"><span className="text-red-800 text-sm font-medium">988 Crisis Line</span></span>
          <span className="inline-flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2"><span className="text-red-800 text-sm font-medium">Crisis Text: 741741</span></span>
        </div>
      </motion.div>
    </div>
  );
}