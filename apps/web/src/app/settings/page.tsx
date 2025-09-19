'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Bell, Accessibility, Palette, Globe } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Your display name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="your.email@example.com" />
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Privacy & Safety Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Anonymous Mode</h4>
                  <p className="text-sm text-gray-600">Hide your identity in community features</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Crisis Detection</h4>
                  <p className="text-sm text-gray-600">Allow automated monitoring for crisis situations</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Data Sharing</h4>
                  <p className="text-sm text-gray-600">Share anonymous data to improve services</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Crisis Alerts</h4>
                  <p className="text-sm text-gray-600">Emergency notifications and crisis reminders</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Wellness Reminders</h4>
                  <p className="text-sm text-gray-600">Daily check-ins and self-care reminders</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Community Updates</h4>
                  <p className="text-sm text-gray-600">New messages and community activity</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        );
      case 'accessibility':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Accessibility Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">High Contrast Mode</h4>
                  <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Large Text</h4>
                  <p className="text-sm text-gray-600">Increase font size throughout the app</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Reduced Motion</h4>
                  <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Screen Reader Support</h4>
                  <p className="text-sm text-gray-600">Enhanced compatibility with screen readers</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Appearance Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Light Mode</option>
                  <option>Dark Mode</option>
                  <option>Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Default (Purple/Blue)</option>
                  <option>Calming (Green/Teal)</option>
                  <option>Warm (Orange/Red)</option>
                  <option>Monochrome</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Language & Region</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Auto-detect</option>
                  <option>Eastern Time (UTC-5)</option>
                  <option>Central Time (UTC-6)</option>
                  <option>Mountain Time (UTC-7)</option>
                  <option>Pacific Time (UTC-8)</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-gray-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
            Settings
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto text-center leading-relaxed">
            Customize your experience and manage your privacy, accessibility, and notification preferences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Glass className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Settings Menu</h2>
              <nav className="space-y-2">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Glass>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Glass className="p-8">
              {renderTabContent()}
            </Glass>
          </motion.div>
        </div>
      </div>
    </div>
  );
}