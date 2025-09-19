'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, MessageCircle, Heart, Shield, Users, 
  ChevronRight, User, Home, Calendar, HelpCircle,
  Activity, Zap, Target, BookOpen, Menu, X,
  AlertTriangle, Sparkles, HeartHandshake
} from 'lucide-react';

// Crisis-First Design: Immediate help is always accessible
const CRISIS_RESOURCES = [
  { 
    type: 'call',
    number: '988',
    label: 'Crisis Lifeline',
    action: 'tel:988',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    icon: Phone
  },
  {
    type: 'text',
    number: '741741',
    label: 'Crisis Text',
    action: 'sms:741741?body=HOME',
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: MessageCircle
  },
  {
    type: 'chat',
    number: 'Live Chat',
    label: 'Chat Now',
    action: '/crisis/chat',
    color: 'bg-purple-600 hover:bg-purple-700',
    icon: HeartHandshake
  }
];

// Simplified navigation for reduced cognitive load
const PRIMARY_ACTIONS = [
  {
    id: 'quick-check',
    title: "How are you?",
    subtitle: "2-minute check-in",
    icon: Heart,
    href: '/mood',
    gradient: 'from-rose-500 to-pink-600',
    priority: 1
  },
  {
    id: 'safety-plan',
    title: "Safety toolkit",
    subtitle: "Your personal plan",
    icon: Shield,
    href: '/safety',
    gradient: 'from-blue-500 to-indigo-600',
    priority: 1
  },
  {
    id: 'talk-someone',
    title: "Talk to someone",
    subtitle: "Peer support",
    icon: Users,
    href: '/peer-support',
    gradient: 'from-purple-500 to-violet-600',
    priority: 2
  },
  {
    id: 'self-help',
    title: "Self-help tools",
    subtitle: "Exercises & resources",
    icon: Sparkles,
    href: '/self-help',
    gradient: 'from-amber-500 to-orange-600',
    priority: 2
  }
];

// Floating Crisis Button Component - Always Visible
function FloatingCrisisButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 min-w-[280px]"
          >
            <p className="text-sm font-semibold text-gray-700 mb-3">Get help now:</p>
            <div className="space-y-2">
              {CRISIS_RESOURCES.map((resource) => (
                <a
                  key={resource.type}
                  href={resource.action}
                  className={`flex items-center justify-between p-3 rounded-xl text-white transition-all ${resource.color} hover:scale-105`}
                  aria-label={`${resource.label}: ${resource.number}`}
                >
                  <div className="flex items-center space-x-3">
                    <resource.icon className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">{resource.number}</p>
                      <p className="text-xs opacity-90">{resource.label}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="Crisis support options"
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="alert"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <AlertTriangle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      
      {!isExpanded && (
        <motion.div
          className="absolute -top-2 -right-2 bg-green-500 rounded-full w-4 h-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </div>
  );
}

// Action type for ActionCard component
interface ActionType {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href: string;
  gradient: string;
  priority: number;
}

// Simplified Action Card - Less Overwhelming
function ActionCard({ action, delay = 0 }: { action: ActionType; delay?: number }) {
  return (
    <motion.a
      href={action.href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="block"
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <action.icon className="w-6 h-6" />
            </div>
            {action.priority === 1 && (
              <span className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                Recommended
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">{action.title}</h3>
          <p className="text-sm opacity-90">{action.subtitle}</p>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <pattern id={`pattern-${action.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pattern-${action.id})`} />
          </svg>
        </div>
      </div>
    </motion.a>
  );
}

// Main Dashboard Component
export default function RedesignedHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  
  useEffect(() => {
    // Determine time of day for personalized greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
    
    // Check for returning user
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
  }, []);
  
  const getGreeting = () => {
    const greetings: Record<string, string> = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    };
    return greetings[timeOfDay] || 'Welcome';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      {/* Simplified Header - Clean and Calm */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Astral Core</h1>
                <p className="text-xs text-gray-700">Your wellness companion</p>
              </div>
            </div>
            
            {/* Desktop Navigation - Minimal */}
            <nav className="hidden md:flex items-center space-x-1">
              <a href="/mood" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Check-in
              </a>
              <a href="/safety" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Safety Plan
              </a>
              <a href="/resources" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Resources
              </a>
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sign in
              </button>
            </nav>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                <a href="/mood" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Daily Check-in
                </a>
                <a href="/safety" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Safety Plan
                </a>
                <a href="/resources" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Resources
                </a>
                <div className="pt-3 border-t border-gray-100">
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Sign in
                  </button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Welcome Section - Warm and Reassuring */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {getGreeting()}{userName && `, ${userName}`}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You're not alone. Take a moment for yourself today.
          </p>
          
          {/* Quick wellness pulse */}
          <div className="mt-6 inline-flex items-center space-x-2 bg-green-50 text-green-700 rounded-full px-4 py-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Your wellness journey is active</span>
          </div>
        </motion.section>
        
        {/* Primary Actions Grid - Clear and Simple */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              What would help you today?
            </h3>
            <p className="text-gray-600">
              Choose what feels right. There's no wrong answer.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PRIMARY_ACTIONS.filter(a => a.priority === 1).map((action, index) => (
              <ActionCard key={action.id} action={action} delay={index * 0.1} />
            ))}
          </div>
          
          {/* Secondary Actions - Progressive Disclosure */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <details className="inline-block">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50">
                More ways to help →
              </summary>
              <div className="grid md:grid-cols-2 gap-4 mt-4 max-w-4xl mx-auto">
                {PRIMARY_ACTIONS.filter(a => a.priority === 2).map((action, index) => (
                  <ActionCard key={action.id} action={action} delay={index * 0.1} />
                ))}
              </div>
            </details>
          </motion.div>
        </section>
        
        {/* Gentle Encouragement Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center"
        >
          <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Small steps make a difference
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Taking just 2 minutes for your mental health today is a victory worth celebrating.
          </p>
        </motion.section>
        
        {/* Resources Footer */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 border-t border-gray-100 pt-8"
        >
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About Us
            </a>
            <span className="text-gray-600">•</span>
            <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <span className="text-gray-600">•</span>
            <a href="/volunteer" className="text-gray-600 hover:text-gray-900 transition-colors">
              Volunteer
            </a>
            <span className="text-gray-600">•</span>
            <a href="/professional" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Professionals
            </a>
          </div>
          
          <p className="text-center text-xs text-gray-700 mt-4">
            Free forever • No barriers • Always here for you
          </p>
        </motion.section>
      </main>
      
      {/* Floating Crisis Button - Always Accessible */}
      <FloatingCrisisButton />
    </div>
  );
}