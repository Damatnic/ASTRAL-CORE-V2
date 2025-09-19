'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Star } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            About Astral Core
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            A comprehensive mental health platform designed with crisis-first approach, evidence-based tools, and community support at its core.
          </p>

          <Glass className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              To provide immediate, accessible, and comprehensive mental health support that prioritizes user safety, 
              combines evidence-based therapeutic tools, and fosters a supportive community for recovery and growth.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Crisis-First', desc: 'Immediate help when needed most' },
                { icon: Star, title: 'Evidence-Based', desc: 'Scientifically proven therapeutic tools' },
                { icon: Users, title: 'Community-Driven', desc: 'Peer support and professional guidance' },
                { icon: Heart, title: 'Compassionate Care', desc: 'Trauma-informed and accessible design' }
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Features</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-2 text-gray-700">
                  <li>• 24/7 Crisis chat support</li>
                  <li>• Guided breathing & mindfulness</li>
                  <li>• CBT & DBT therapeutic tools</li>
                  <li>• Peer support communities</li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li>• Safety planning tools</li>
                  <li>• Recovery story sharing</li>
                  <li>• Professional therapist network</li>
                  <li>• WCAG 2.2 AA accessibility</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/support" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Get Support
              </Link>
              <Link href="/community" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Join Community
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}