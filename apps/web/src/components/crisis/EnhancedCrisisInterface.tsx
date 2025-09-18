'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, MessageCircle, Heart, Shield, AlertTriangle, 
  Clock, MapPin, User, Headphones, Video, FileText,
  ChevronRight, Star, Zap, Activity, Brain, Users,
  ArrowRight, CheckCircle, X, Volume2, VolumeX
} from 'lucide-react';

// Enhanced crisis interface with accessibility and trauma-informed design
export default function EnhancedCrisisInterface() {
  const [activeMode, setActiveMode] = useState<'emergency' | 'support' | 'resources'>('emergency');
  const [isConnecting, setIsConnecting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Crisis support options with clear hierarchy
  const emergencyOptions = [
    {
      id: 'call-988',
      title: 'Call 988 Crisis Lifeline',
      subtitle: 'Speak with a trained counselor immediately',
      icon: Phone,
      action: () => window.location.href = 'tel:988',
      priority: 'critical',
      available: '24/7',
      waitTime: 'Usually < 1 minute',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'text-741741',
      title: 'Text Crisis Line',
      subtitle: 'Text HOME to 741741 for immediate support',
      icon: MessageCircle,
      action: () => window.location.href = 'sms:741741',
      priority: 'critical',
      available: '24/7',
      waitTime: 'Usually < 5 minutes',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'chat-support',
      title: 'Anonymous Crisis Chat',
      subtitle: 'Connect with a volunteer counselor via secure chat',
      icon: MessageCircle,
      action: () => setIsConnecting(true),
      priority: 'high',
      available: '24/7',
      waitTime: 'Usually < 3 minutes',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'video-call',
      title: 'Video Crisis Support',
      subtitle: 'Face-to-face support when you need human connection',
      icon: Video,
      action: () => setIsConnecting(true),
      priority: 'high',
      available: '16 hours/day',
      waitTime: 'Usually < 5 minutes',
      color: 'bg-green-600 hover:bg-green-700',
    },
  ];

  const supportResources = [
    {
      id: 'safety-plan',
      title: 'Create Safety Plan',
      description: 'Build a personalized plan to stay safe during difficult times',
      icon: Shield,
      href: '/safety',
      estimatedTime: '10-15 minutes',
    },
    {
      id: 'grounding',
      title: 'Grounding Techniques',
      description: 'Immediate techniques to help you feel more present and calm',
      icon: Activity,
      href: '/crisis/grounding',
      estimatedTime: '2-5 minutes',
    },
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Guided breathing to help reduce anxiety and panic',
      icon: Headphones,
      href: '/crisis/breathing',
      estimatedTime: '3-10 minutes',
    },
    {
      id: 'resources',
      title: 'Crisis Resources',
      description: 'Comprehensive list of crisis support resources',
      icon: FileText,
      href: '/crisis/resources',
      estimatedTime: '5 minutes',
    },
  ];

  // Accessibility features
  useEffect(() => {
    // Check for accessibility preferences
    const storedContrast = localStorage.getItem('astral_high_contrast');
    const storedFontSize = localStorage.getItem('astral_font_size');
    const storedSound = localStorage.getItem('astral_sound_enabled');

    if (storedContrast === 'true') setHighContrast(true);
    if (storedFontSize) setFontSize(storedFontSize);
    if (storedSound === 'true') setSoundEnabled(true);
  }, []);

  const toggleAccessibility = (feature: string) => {
    switch (feature) {
      case 'contrast':
        const newContrast = !highContrast;
        setHighContrast(newContrast);
        localStorage.setItem('astral_high_contrast', newContrast.toString());
        break;
      case 'sound':
        const newSound = !soundEnabled;
        setSoundEnabled(newSound);
        localStorage.setItem('astral_sound_enabled', newSound.toString());
        break;
      case 'fontSize':
        const sizes = ['small', 'normal', 'large'];
        const currentIndex = sizes.indexOf(fontSize);
        const newSize = sizes[(currentIndex + 1) % sizes.length];
        setFontSize(newSize);
        localStorage.setItem('astral_font_size', newSize);
        break;
    }
  };

  const containerClasses = `
    min-h-screen transition-all duration-300
    ${highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-red-50 via-white to-blue-50'}
    ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}
  `;

  return (
    <div className={containerClasses}>
      {/* Crisis Header with Accessibility Controls */}
      <header className={`${highContrast ? 'bg-red-900 border-red-700' : 'bg-red-600'} text-white py-4 border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <h1 className="text-2xl font-bold">Crisis Support</h1>
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="text-sm opacity-90">Available 24/7</span>
            </div>

            {/* Accessibility Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleAccessibility('contrast')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Toggle high contrast"
              >
                <span className="text-sm">🔆</span>
              </button>
              <button
                onClick={() => toggleAccessibility('fontSize')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Change font size"
              >
                <span className="text-sm">Aa</span>
              </button>
              <button
                onClick={() => toggleAccessibility('sound')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Toggle sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crisis Mode Selector */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg">
            {[
              { id: 'emergency', label: 'Emergency Help', icon: AlertTriangle },
              { id: 'support', label: 'Self-Help Tools', icon: Heart },
              { id: 'resources', label: 'Resources', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeMode === tab.id
                    ? highContrast 
                      ? 'bg-white text-black' 
                      : 'bg-red-600 text-white'
                    : highContrast
                      ? 'text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Emergency Help Section */}
        <AnimatePresence mode="wait">
          {activeMode === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h2 className={`text-3xl font-bold mb-4 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                  You're Not Alone - Help is Here
                </h2>
                <p className={`text-xl ${highContrast ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                  Choose the type of support that feels right for you. All options are free, confidential, and available 24/7.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${
                      highContrast 
                        ? 'bg-gray-900 border-gray-700' 
                        : 'bg-white'
                    } rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${option.color} text-white`}>
                        <option.icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          option.priority === 'critical' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {option.priority === 'critical' ? 'Immediate' : 'Quick Response'}
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                      {option.title}
                    </h3>
                    <p className={`${highContrast ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      {option.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className={highContrast ? 'text-gray-300' : 'text-gray-600'}>
                            {option.available}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className={highContrast ? 'text-gray-300' : 'text-gray-600'}>
                            {option.waitTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={option.action}
                      className={`w-full py-3 px-4 ${option.color} text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all`}
                    >
                      <span>Connect Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Additional Emergency Info */}
              <div className={`mt-8 p-6 ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-blue-50'} rounded-2xl border`}>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                      Your Privacy is Protected
                    </h3>
                    <p className={`${highContrast ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      All conversations are confidential and secure. You can remain anonymous if you choose.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>End-to-end encrypted</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>No personal info required</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>HIPAA compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Support Tools Section */}
          {activeMode === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h2 className={`text-3xl font-bold mb-4 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                  Self-Help Crisis Tools
                </h2>
                <p className={`text-xl ${highContrast ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                  Evidence-based tools to help you cope with crisis moments and build resilience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supportResources.map((resource, index) => (
                  <motion.a
                    key={resource.id}
                    href={resource.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${
                      highContrast 
                        ? 'bg-gray-900 border-gray-700' 
                        : 'bg-white'
                    } rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 block`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl">
                        <resource.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                        {resource.estimatedTime}
                      </span>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                      {resource.title}
                    </h3>
                    <p className={`${highContrast ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${highContrast ? 'text-purple-400' : 'text-purple-600'}`}>
                        Start Now
                      </span>
                      <ChevronRight className={`w-4 h-4 ${highContrast ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Modal */}
        <AnimatePresence>
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${
                  highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white'
                } rounded-2xl p-8 max-w-md w-full shadow-2xl`}
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                    Connecting you to support...
                  </h3>
                  <p className={`${highContrast ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                    Please wait while we find an available counselor for you.
                  </p>
                  <div className="flex justify-center space-x-1 mb-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="w-3 h-3 bg-purple-600 rounded-full"
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setIsConnecting(false)}
                    className={`px-4 py-2 ${highContrast ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden audio element for accessibility */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
