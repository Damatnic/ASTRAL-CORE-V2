'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smile, Frown, Meh, TrendingUp, Calendar, BarChart3,
  Heart, Star, CheckCircle, ArrowRight
} from 'lucide-react';

const moodOptions = [
  { emoji: '😢', label: 'Very Low', value: 1, color: 'bg-red-500' },
  { emoji: '😔', label: 'Low', value: 2, color: 'bg-orange-500' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'bg-yellow-500' },
  { emoji: '😊', label: 'Good', value: 4, color: 'bg-green-500' },
  { emoji: '😄', label: 'Great', value: 5, color: 'bg-blue-500' }
];

export default function MoodTrackingIntroStep() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showBenefits, setShowBenefits] = useState(false);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    setTimeout(() => setShowBenefits(true), 500);
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
          <Smile className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Track Your Mood, Understand Yourself
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Simple daily check-ins help you recognize patterns and celebrate progress in your mental health journey.
        </p>
      </motion.div>

      {/* Interactive Mood Demo */}
      <motion.div
        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            Try It Now: How are you feeling today?
          </h3>
          <p className="text-blue-800">
            Click on the mood that best represents how you're feeling right now
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedMood === mood.value
                  ? `${mood.color} border-white text-white shadow-lg transform scale-105`
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-25'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className={`text-sm font-medium ${
                selectedMood === mood.value ? 'text-white' : 'text-gray-700'
              }`}>
                {mood.label}
              </div>
            </motion.button>
          ))}
        </div>

        {selectedMood && (
          <motion.div
            className="text-center p-4 bg-green-100 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              Great job! You just completed your first mood check-in.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Benefits of Mood Tracking */}
      {showBenefits && (
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="bg-purple-100 rounded-full p-3 inline-flex mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">Spot Patterns</h3>
            <p className="text-sm text-purple-800">
              Notice what activities, situations, or times of day affect your mood most
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="bg-green-100 rounded-full p-3 inline-flex mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Track Progress</h3>
            <p className="text-sm text-green-800">
              See your improvements over time and celebrate your mental health wins
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="bg-blue-100 rounded-full p-3 inline-flex mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Share with Professionals</h3>
            <p className="text-sm text-blue-800">
              Provide valuable data to your therapist or counselor about your wellbeing
            </p>
          </div>
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div
        className="bg-gray-50 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          How Mood Tracking Works
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Daily Check-in</h4>
            <p className="text-sm text-gray-600">Quick 30-second mood rating</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Optional Notes</h4>
            <p className="text-sm text-gray-600">Add context about your day</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">See Patterns</h4>
            <p className="text-sm text-gray-600">View trends over time</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-3 inline-flex mb-3">
              <span className="text-yellow-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Take Action</h4>
            <p className="text-sm text-gray-600">Use insights for better self-care</p>
          </div>
        </div>
      </motion.div>

      {/* Gentle Encouragement */}
      <motion.div
        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
            <Heart className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Every Mood is Valid
          </h3>
          <p className="text-yellow-800 max-w-2xl mx-auto mb-4">
            There are no "wrong" answers in mood tracking. Whether you're having a difficult day or a great one, 
            checking in with yourself is an act of self-care and awareness.
          </p>
          <div className="inline-flex items-center space-x-2 text-yellow-700">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Small steps lead to big changes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}