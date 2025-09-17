'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Settings, Eye, Volume, Palette, Bell, Shield } from 'lucide-react';

export default function PersonalizationStep() {
  const { preferences, updatePreferences } = useOnboarding();

  const togglePreference = (key: keyof typeof preferences, value?: any) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreferences({ [key]: !preferences[key] });
    } else {
      updatePreferences({ [key]: value });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Personalize Your Experience</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Customize ASTRAL CORE to work best for you. You can change these settings anytime.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Accessibility Options */}
        <motion.div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center"><Eye className="w-6 h-6 mr-2" />Accessibility</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-25">
              <span className="text-gray-700">High contrast mode</span>
              <input type="checkbox" checked={preferences.highContrast} onChange={() => togglePreference('highContrast')} className="rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-25">
              <span className="text-gray-700">Reduced motion</span>
              <input type="checkbox" checked={preferences.reducedMotion} onChange={() => togglePreference('reducedMotion')} className="rounded" />
            </label>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div className="bg-green-50 border-2 border-green-200 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center"><Shield className="w-6 h-6 mr-2" />Privacy</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-25">
              <div><span className="text-gray-700 font-medium">Anonymous mode</span><p className="text-sm text-gray-600">Use the platform without creating an account</p></div>
              <input type="checkbox" checked={preferences.anonymousMode} onChange={() => togglePreference('anonymousMode')} className="rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-25">
              <div><span className="text-gray-700 font-medium">Personalized welcome</span><p className="text-sm text-gray-600">Show personalized greetings and recommendations</p></div>
              <input type="checkbox" checked={preferences.personalizedWelcome} onChange={() => togglePreference('personalizedWelcome')} className="rounded" />
            </label>
          </div>
        </motion.div>

        {/* Communication Preferences */}
        <motion.div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center"><Bell className="w-6 h-6 mr-2" />Gentle Reminders</h3>
          <p className="text-purple-800 mb-4">Choose how you'd like to be reminded about self-care (optional)</p>
          <div className="grid md:grid-cols-2 gap-4">
            {['Daily mood check-in', 'Weekly wellness summary', 'Safety plan review', 'New wellness tools'].map((option) => (
              <label key={option} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-25">
                <span className="text-gray-700">{option}</span>
                <input 
                  type="checkbox" 
                  checked={preferences.communicationPreferences.includes(option)}
                  onChange={() => {
                    const current = preferences.communicationPreferences;
                    const updated = current.includes(option) 
                      ? current.filter(p => p !== option)
                      : [...current, option];
                    togglePreference('communicationPreferences', updated);
                  }}
                  className="rounded" 
                />
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">You're in Control</h3>
        <p className="text-yellow-800">These settings can be changed anytime in your profile. Your privacy and comfort are always our priority.</p>
      </motion.div>
    </div>
  );
}