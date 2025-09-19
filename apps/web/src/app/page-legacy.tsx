'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Phone, MessageCircle, Heart, Shield, Brain, Sparkles,
  ChevronRight, Star, Zap, Activity, Users, BookOpen,
  HeartHandshake, Moon, Sun, Menu, X, ArrowRight,
  Check, TrendingUp, Award, Target, Layers, Globe,
  Headphones, Video, Calendar, Clock, AlertCircle
} from 'lucide-react';
import { 
  EnhancedButton, 
  InteractiveCard, 
  FloatingActionButton,
  MagneticText 
} from '@/components/interactions/MicroInteractions';

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated Gradient Orbs - Spread Across Full Width */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-purple-50 to-blue-50" />
    </div>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu transition-all duration-200 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Glassmorphic Navigation Bar
const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Animation */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                ASTRAL
              </h1>
              <p className="text-xs text-gray-600 font-medium">Mental Wellness Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {['Features', 'Resources', 'Community', 'About'].map((item, index) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors relative group"
              >
                {item}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </motion.button>
            ))}
            
            {/* CTA Buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </motion.button>
            
            {/* Crisis Button - Always Visible */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-2 p-3 bg-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all relative"
            >
              <Phone className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

// Hero Section with Parallax
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <AnimatedBackground />
      
      {/* Floating Elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-70"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-xl opacity-70"
      />
      
      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Your Mental Wellness Journey Starts Here
          </span>
        </motion.div>
        
        {/* Main Headline with Gradient */}
          <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black mb-6"
        >
          <MagneticText className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Your Mental Health
          </MagneticText>
          <br />
          <MagneticText className="bg-gradient-to-r from-blue-600 via-green-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
            Matters Most
          </MagneticText>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 mb-12 max-w-4xl mx-auto"
        >
          Experience a comprehensive approach to mental wellness with evidence-based support, 
          crisis intervention, and a caring community.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <EnhancedButton
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600"
            onClick={() => window.location.href = '/crisis'}
          >
            <span className="flex items-center">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </span>
          </EnhancedButton>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-800 dark:text-white rounded-2xl font-bold text-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <span className="flex items-center">
              <Video className="mr-2 w-5 h-5" />
              Watch Demo
            </span>
          </motion.button>
        </motion.div>
        
        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 text-gray-600"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium">24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Available Globally</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-purple-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-purple-600 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

// Feature Cards with Modern Design
const FeatureSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "Get personalized mental health guidance when you need it",
      gradient: "from-purple-600 to-pink-600",
      delay: 0
    },
    {
      icon: Users,
      title: "Peer Support",
      description: "Connect with others who understand your journey",
      gradient: "from-blue-600 to-cyan-600",
      delay: 0.1
    },
    {
      icon: Shield,
      title: "Crisis Help",
      description: "Immediate support available 24/7",
      gradient: "from-red-600 to-orange-600",
      delay: 0.2
    },
    {
      icon: Activity,
      title: "Track Progress",
      description: "Monitor your wellness journey",
      gradient: "from-green-600 to-teal-600",
      delay: 0.3
    },
    {
      icon: Headphones,
      title: "Meditation",
      description: "Guided sessions to calm your mind",
      gradient: "from-indigo-600 to-purple-600",
      delay: 0.4
    },
    {
      icon: Calendar,
      title: "Schedule Help",
      description: "Book professional support easily",
      gradient: "from-yellow-600 to-orange-600",
      delay: 0.5
    },
    {
      icon: Heart,
      title: "Self-Care Tools",
      description: "Evidence-based exercises and resources",
      gradient: "from-pink-600 to-rose-600",
      delay: 0.6
    },
    {
      icon: BookOpen,
      title: "Learn & Grow",
      description: "Educational content about mental health",
      gradient: "from-teal-600 to-green-600",
      delay: 0.7
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 font-medium mb-4"
          >
            ✨ Features
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-600">
            Comprehensive mental health support designed for the modern world
          </p>
        </motion.div>
        
        {/* Feature Grid - Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.5 }}
            >
              <InteractiveCard
                hoverEffect="lift"
                className="group relative h-full bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
                onClick={() => window.location.href = '/wellness'}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                {/* Icon */}
                <div className={`relative mb-6 inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-600 mb-6">
                  {feature.description}
                </p>
                
                {/* Learn More Link */}
                <div className="group/link inline-flex items-center text-purple-600 dark:text-purple-400 font-medium">
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </div>
                
                {/* Decorative Element */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              </InteractiveCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Core Values Section
const ValuesSection = () => {
  const values = [
    { 
      title: "Always Free", 
      description: "No paywalls, no premium tiers, no locked features", 
      icon: Heart,
      color: "from-pink-500 to-rose-500"
    },
    { 
      title: "24/7 Available", 
      description: "Crisis support around the clock, whenever you need it", 
      icon: Clock,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      title: "Completely Private", 
      description: "Zero-knowledge architecture protects your privacy", 
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    },
    { 
      title: "No Barriers", 
      description: "Instant access without registration or requirements", 
      icon: Users,
      color: "from-purple-500 to-violet-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Our Core Values
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every decision we make is guided by our commitment to saving lives and providing accessible mental health support.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex p-4 bg-gradient-to-r ${value.color} rounded-2xl mb-4`}>
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Resources Section
const ResourcesSection = () => {
  const resources = [
    {
      title: "Crisis Support",
      description: "Immediate help when you need it most",
      link: "/crisis",
      icon: AlertCircle
    },
    {
      title: "Self-Help Tools",
      description: "Evidence-based exercises and techniques",
      link: "/self-help",
      icon: BookOpen
    },
    {
      title: "Community Support",
      description: "Connect with others on similar journeys",
      link: "/community",
      icon: Users
    }
  ];

  return (
    <section className="py-32 relative bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-4">
            📚 Resources
          </span>
          <h2 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Help & Support
            </span>
          </h2>
        </motion.div>
        
        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <resource.icon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {resource.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-600">
                {resource.description}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section with Gradient
const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring" }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-xl text-gray-900 mb-12 max-w-3xl mx-auto">
            Take the first step toward better mental wellness.
            Always free, always here for you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-all"
            >
              Schedule Demo
            </motion.button>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-12 inline-flex items-center space-x-4 text-gray-900">
            <Check className="w-5 h-5" />
            <span>No credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>HIPAA compliant</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Main Component
export default function SpectacularHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <ModernNavbar />
      <HeroSection />
      <FeatureSection />
      <ValuesSection />
      <ResourcesSection />
      <CTASection />
      
      {/* Floating Crisis Button */}
      <FloatingActionButton
        icon={Phone}
        onClick={() => window.location.href = 'tel:988'}
        className="bg-gradient-to-r from-red-500 to-red-600"
      />
    </div>
  );
}