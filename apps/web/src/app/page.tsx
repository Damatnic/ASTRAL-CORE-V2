'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Phone, MessageCircle, Heart, Shield, Brain, Sparkles,
  ChevronRight, Star, Zap, Activity, Users, BookOpen,
  HeartHandshake, Moon, Sun, Menu, X, ArrowRight,
  Check, TrendingUp, Award, Target, Layers, Globe,
  Headphones, Video, Calendar, Clock, AlertCircle,
  ChevronDown, PlayCircle, UserCheck, Rocket, BarChart3
} from 'lucide-react';
import { 
  ProductionGlassSystem,
  colorSystem,
  touchTargets,
  focusStyles
} from '@/components/design-system/ProductionGlassSystem';

const { 
  Glass, 
  ProductionButton, 
  Alert, 
  LiveRegion 
} = ProductionGlassSystem;

// Production-Ready Animated Background
const ProductionBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Optimized animated gradients for Core Web Vitals */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob will-change-transform" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 will-change-transform" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 will-change-transform" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-green-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000 will-change-transform" />
      
      {/* Subtle grid pattern for depth */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-purple-50/50 to-blue-50/50" />
    </div>
  );
};

// WCAG 2.2 Compliant Hero Section
const ProductionHero = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Handle CTA interactions for analytics
  const handleCTAClick = (action: string) => {
    setAnnouncements(prev => [...prev, `${action} button activated`]);
    // In production: analytics.track('cta_click', { action });
    
    if (action === 'get-help') {
      window.location.href = '/crisis';
    } else if (action === 'watch-demo') {
      // Open demo modal or navigate to demo
      console.log('Demo requested');
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
      role="banner"
    >
      <ProductionBackground />
      
      <motion.div 
        style={{ y }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Crisis Alert Banner - High Priority */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Alert 
            variant="error" 
            role="alert" 
            aria-live="assertive"
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <span className="font-semibold">
                  In Crisis? Get Immediate Help 24/7
                </span>
              </div>
              <div className="flex gap-3">
                <ProductionButton
                  variant="crisis"
                  size="sm"
                  onClick={() => window.location.href = 'tel:988'}
                  aria-label="Call 988 Suicide & Crisis Lifeline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 988
                </ProductionButton>
                <ProductionButton
                  variant="crisis"
                  size="sm"
                  onClick={() => window.location.href = 'sms:741741'}
                  aria-label="Text Crisis Text Line at 741741"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text 741741
                </ProductionButton>
              </div>
            </div>
          </Alert>
        </motion.div>

        {/* Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Glass
            variant="mixed"
            className="inline-flex items-center space-x-2 px-6 py-3 mb-8"
            role="img"
            aria-label="Platform features announcement"
          >
            <Sparkles className="w-5 h-5 text-purple-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              WCAG 2.2 AA Compliant • HIPAA Secure • 24/7 Available
            </span>
          </Glass>
        </motion.div>
        
        {/* Main Headline - WCAG 2.2 Compliant */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Your Mental Health
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            Journey Starts Here
          </span>
        </motion.h1>
        
        {/* Subtitle with better contrast */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-gray-200 mb-12 max-w-4xl mx-auto font-medium"
        >
          Experience comprehensive mental wellness support with evidence-based interventions, 
          24/7 crisis care, and a supportive community. Your privacy and safety are our top priorities.
        </motion.p>
        
        {/* WCAG 2.2 Compliant CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          role="group"
          aria-label="Primary actions"
        >
          <ProductionButton
            variant="primary"
            size="lg"
            onClick={() => handleCTAClick('get-help')}
            aria-describedby="get-help-description"
            className="glass-mixed shadow-xl hover:shadow-2xl"
          >
            <span className="flex items-center">
              <Heart className="mr-3 w-6 h-6" aria-hidden="true" />
              Get Help Now
              <ArrowRight className="ml-3 w-6 h-6" aria-hidden="true" />
            </span>
          </ProductionButton>
          
          <ProductionButton
            variant="secondary"
            size="lg"
            onClick={() => handleCTAClick('watch-demo')}
            aria-describedby="watch-demo-description"
            className="glass-mixed shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center">
              <PlayCircle className="mr-3 w-6 h-6" aria-hidden="true" />
              Watch Platform Demo
            </span>
          </ProductionButton>
        </motion.div>

        {/* AI Therapy Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <Glass variant="mixed" className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Therapy - Available 24/7
                </h2>
                <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                  NEW
                </span>
              </div>
              <p className="text-gray-900 dark:text-gray-200 mb-6 max-w-2xl mx-auto">
                Chat with specialized AI therapists trained in CBT, trauma therapy, and crisis intervention. 
                Get professional support whenever you need it, with complete privacy and personalization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <ProductionButton
                  variant="primary"
                  size="md"
                  onClick={() => window.location.href = '/ai-therapy'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Try AI Therapy
                </ProductionButton>
                <ProductionButton
                  variant="ghost"
                  size="md"
                  onClick={() => window.location.href = '/ai-therapy'}
                >
                  Choose Your AI Therapist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </ProductionButton>
              </div>
            </div>
          </Glass>
        </motion.div>

        {/* Hidden descriptions for screen readers */}
        <div className="sr-only">
          <div id="get-help-description">
            Access immediate mental health support, crisis intervention, and therapeutic resources
          </div>
          <div id="watch-demo-description">
            View a comprehensive overview of our platform features and capabilities
          </div>
        </div>
        
        {/* Trust Indicators with proper semantics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 text-gray-700 dark:text-gray-300"
          role="list"
          aria-label="Platform certifications and features"
        >
          <div className="flex items-center gap-3" role="listitem">
            <Shield className="w-6 h-6 text-green-600" aria-hidden="true" />
            <span className="font-semibold">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-3" role="listitem">
            <Clock className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <span className="font-semibold">24/7 Support</span>
          </div>
          <div className="flex items-center gap-3" role="listitem">
            <Globe className="w-6 h-6 text-purple-600" aria-hidden="true" />
            <span className="font-semibold">Global Access</span>
          </div>
          <div className="flex items-center gap-3" role="listitem">
            <UserCheck className="w-6 h-6 text-indigo-600" aria-hidden="true" />
            <span className="font-semibold">WCAG 2.2 AA</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Accessible Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 ${focusStyles.base} ${focusStyles.primary} ${focusStyles.notObscured} cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-label="Scroll down to view more content"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <Glass variant="mixed" className="p-4 rounded-2xl">
          <ChevronDown className="w-6 h-6 text-purple-600 animate-bounce" />
        </Glass>
      </motion.div>

      {/* Live Region for Announcements */}
      <LiveRegion priority="polite">
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </LiveRegion>
    </section>
  );
};

// Production Features Section
const ProductionFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "Advanced therapeutic AI to provide personalized mental health guidance and crisis intervention.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "End-to-end encryption, HIPAA compliance, and absolute privacy protection for all your data.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: Heart,
      title: "Crisis Prevention",
      description: "24/7 monitoring, early warning systems, and immediate intervention when you need it most.",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with peers, join support groups, and build meaningful relationships in a safe environment.",
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  return (
    <section 
      className="py-24 relative"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 
            id="features-heading"
            className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            Comprehensive Mental Health Platform
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need for your mental wellness journey, built with the latest technology and evidence-based practices.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Glass
                  variant="mixed"
                  className="h-full p-8 text-center group hover:scale-105 transition-transform duration-300"
                  role="article"
                  aria-labelledby={`feature-${index}-title`}
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                    <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <h3 
                    id={`feature-${index}-title`}
                    className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Glass>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Main Page Component
export default function ProductionHomePage() {
  return (
    <>
      {/* Skip navigation is handled by layout.tsx - don't duplicate */}
      <main 
        id="main-content" 
        tabIndex={-1}
        className="relative focus:outline-none"
        role="main"
        aria-label="Main content"
      >
        <ProductionHero />
        <ProductionFeatures />
      </main>
    </>
  );
}