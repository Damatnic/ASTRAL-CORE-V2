'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Star } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Support Mental Health
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Help us provide free mental health support and crisis intervention services to those who need it most.
          </p>

          <Glass className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact Matters</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Every donation helps us maintain our crisis support services, develop new therapeutic tools, 
              and ensure that mental health care remains accessible to everyone, regardless of their financial situation.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Shield, title: 'Crisis Support', desc: 'Fund 24/7 crisis intervention services' },
                { icon: Users, title: 'Community Programs', desc: 'Support peer support and group therapy' },
                { icon: Star, title: 'Platform Development', desc: 'Enhance tools and accessibility' },
                { icon: Heart, title: 'Free Access', desc: 'Keep services free for those in need' }
              ].map((impact, idx) => {
                const Icon = impact.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{impact.title}</h3>
                    <p className="text-sm text-gray-600">{impact.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-green-800 mb-3">How Your Donation Helps</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• $25 provides one hour of crisis chat support</li>
                <li>• $50 funds therapeutic tool development</li>
                <li>• $100 supports training for volunteer moderators</li>
                <li>• $500 sponsors a complete safety planning workshop</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Donation Options Coming Soon</h3>
              <p className="text-gray-700">
                We're setting up secure donation processing to ensure your contributions go directly to 
                supporting mental health services. Thank you for your interest in supporting our mission.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Get Notified When Available
              </button>
              <Link href="/volunteer" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Volunteer Instead
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}