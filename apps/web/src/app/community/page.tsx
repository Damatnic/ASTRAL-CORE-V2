'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Star } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Mental Health Community
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Connect with others on similar journeys, share experiences, and build supportive relationships in our safe, moderated community spaces.
          </p>

          <Glass className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Our Community</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Our community features are designed to foster connection, understanding, and mutual support among individuals navigating mental health challenges.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Users, title: 'Peer Support Groups', desc: 'Moderated groups for specific conditions and challenges' },
                { icon: MessageCircle, title: 'Safe Discussions', desc: 'Anonymous sharing in supportive environments' },
                { icon: Star, title: 'Recovery Stories', desc: 'Share and find inspiration in recovery journeys' }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-green-800 mb-3">Community Guidelines</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Respect others' experiences and perspectives</li>
                <li>• Maintain confidentiality and privacy</li>
                <li>• No medical advice or crisis intervention</li>
                <li>• Professional moderation ensures safety</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/peer-support" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Join Peer Support
              </Link>
              <Link href="/stories" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Read Stories
              </Link>
              <Link href="/support" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Get Professional Support
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}