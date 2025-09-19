'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, Phone, MessageCircle, Shield, Heart, Users, 
  ChevronDown, Menu, X, ArrowRight, AlertCircle,
  Headphones, BookOpen, Activity, Calendar, Settings,
  Home, Zap, Star, Clock, Globe, Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationChild {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationItem {
  id?: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  badge?: string;
  children?: NavigationChild[];
}

// Navigation structure with clear information architecture
const navigationStructure: {
  primary: NavigationItem[];
  secondary: NavigationItem[];
  utility: NavigationItem[];
} = {
  primary: [
    {
      id: 'crisis',
      label: 'Crisis Support',
      href: '/crisis',
      icon: AlertCircle,
      priority: 'critical',
      description: 'Immediate help when you need it most',
      badge: '24/7',
    },
    {
      id: 'wellness',
      label: 'Wellness Tools',
      href: '/wellness',
      icon: Heart,
      priority: 'high',
      description: 'Self-care and mental health resources',
      children: [
        { label: 'Mood Tracking', href: '/mood-gamified', icon: Activity },
        { label: 'Breathing Exercises', href: '/wellness/breathing', icon: Headphones },
        { label: 'Mindfulness', href: '/wellness/mindfulness', icon: Brain },
        { label: 'Safety Planning', href: '/safety', icon: Shield },
      ],
    },
    {
      id: 'ai-therapy',
      label: 'AI Therapy',
      href: '/ai-therapy',
      icon: Brain,
      priority: 'high',
      description: '24/7 AI therapists with specialized expertise',
      badge: 'AI',
      children: [
        { label: 'Dr. Aria - CBT & Crisis', href: '/ai-therapy/chat?therapist=aria', icon: Brain },
        { label: 'Dr. Sage - Trauma & PTSD', href: '/ai-therapy/chat?therapist=sage', icon: Heart },
        { label: 'Dr. Luna - Sleep & Wellness', href: '/ai-therapy/chat?therapist=luna', icon: Star },
        { label: 'Choose Your Therapist', href: '/ai-therapy', icon: Users },
      ],
    },
    {
      id: 'support',
      label: 'Get Support',
      href: '/support',
      icon: Users,
      priority: 'high',
      description: 'Connect with trained volunteers and professionals',
      children: [
        { label: 'Crisis Chat', href: '/crisis/chat', icon: MessageCircle },
        { label: 'Peer Support', href: '/peer-support', icon: Users },
        { label: 'Professional Help', href: '/therapist', icon: Star },
        { label: 'Group Sessions', href: '/groups', icon: Users },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      href: '/resources',
      icon: BookOpen,
      priority: 'medium',
      description: 'Educational content and self-help materials',
      children: [
        { label: 'Self-Help Hub', href: '/self-help', icon: BookOpen },
        { label: 'Educational Content', href: '/education', icon: BookOpen },
        { label: 'Crisis Resources', href: '/crisis/resources', icon: AlertCircle },
        { label: 'Recovery Stories', href: '/stories', icon: Heart },
      ],
    },
  ],
  secondary: [
    { label: 'About', href: '/about', icon: Home },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Volunteer', href: '/volunteer', icon: Heart },
    { label: 'Donate', href: '/donate', icon: Star },
  ],
  utility: [
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Help', href: '/help', icon: MessageCircle },
  ],
};

// Enhanced navigation component
export default function EnhancedNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ['var(--glass-heavy)', 'var(--glass-heavy)']
  );

  const navShadow = useTransform(
    scrollY,
    [0, 50],
    ['var(--glass-shadow)', 'var(--glass-shadow)']
  );

  return (
    <motion.nav
      style={{
        backgroundColor: navBackground,
        boxShadow: navShadow,
      }}
      className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-gray-200/30 dark:border-gray-700/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-primary">
                ASTRAL
              </h1>
              <p className="text-xs text-link font-bold -mt-1">CORE</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {navigationStructure.primary.map((item) => (
              <div key={item.id} className="relative">
                {item.children ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : (item.id || null))}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith(item.href)
                        ? 'bg-astral-purple-100 text-astral-purple-800 shadow-sm dark:bg-astral-purple-900/20 dark:text-astral-purple-300'
                        : 'text-primary hover:text-link hover:bg-tertiary font-bold'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                      activeDropdown === item.id ? 'rotate-180' : ''
                    }`} />
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-astral-purple-100 text-astral-purple-800 shadow-sm dark:bg-astral-purple-900/20 dark:text-astral-purple-300'
                        : item.priority === 'critical'
                        ? 'bg-crisis-red-600 text-white hover:bg-crisis-red-700 shadow-md focus-visible'
                        : 'text-primary hover:text-link hover:bg-tertiary font-bold'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.id && item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-primary rounded-xl shadow-lg border border-quaternary py-2 z-50 dark:bg-tertiary dark:border-quaternary"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-primary">{item.label}</p>
                        <p className="text-xs text-secondary font-medium">{item.description}</p>
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-tertiary hover:text-primary transition-colors font-semibold"
                        >
                          <child.icon className="w-4 h-4 mr-3 text-link" />
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search */}
            <Link href="/search" className="p-2 text-primary hover:text-link hover:bg-tertiary rounded-lg transition-colors shadow-sm focus-visible">
              <Search className="w-5 h-5" />
            </Link>

            {/* Emergency Crisis Button */}
            <motion.a
              href="tel:988"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-crisis-red-600 text-white rounded-lg font-semibold hover:bg-crisis-red-700 transition-colors shadow-lg focus-visible"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 988
              <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-primary hover:text-link hover:bg-tertiary rounded-lg transition-colors shadow-sm focus-visible"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-primary border-t border-quaternary shadow-lg dark:bg-secondary dark:border-quaternary"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {/* Emergency button first on mobile */}
              <a
                href="tel:988"
                className="flex items-center w-full px-4 py-3 bg-crisis-red-600 text-white rounded-lg font-semibold hover:bg-crisis-red-700 transition-colors focus-visible"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call 988 - Crisis Hotline
                <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </a>

              {/* Primary navigation */}
              {navigationStructure.primary.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-astral-purple-100 text-astral-purple-800 shadow-sm dark:bg-astral-purple-900/20 dark:text-astral-purple-300'
                        : 'text-primary hover:bg-tertiary font-semibold'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  
                  {/* Mobile submenu */}
                  {item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors font-medium"
                        >
                          <child.icon className="w-4 h-4 mr-3" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Secondary navigation */}
              <div className="border-t border-quaternary pt-4 mt-4">
                {navigationStructure.secondary.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center w-full px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors font-medium"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
