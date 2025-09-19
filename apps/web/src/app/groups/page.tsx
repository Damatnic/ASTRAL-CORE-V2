'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Star, Clock, Shield } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function GroupsPage() {
  const upcomingGroups = [
    {
      title: 'Anxiety Support Circle',
      facilitator: 'Dr. Sarah Johnson, LCSW',
      time: 'Today 7:00 PM EST',
      participants: 8,
      maxParticipants: 12,
      type: 'Support Group'
    },
    {
      title: 'Mindfulness for Depression',
      facilitator: 'Michael Chen, LPC',
      time: 'Tomorrow 6:00 PM EST',
      participants: 6,
      maxParticipants: 10,
      type: 'Therapy Group'
    },
    {
      title: 'DBT Skills Practice',
      facilitator: 'Dr. Emily Rodriguez, PhD',
      time: 'Friday 8:00 PM EST',
      participants: 5,
      maxParticipants: 8,
      type: 'Skills Group'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Group Therapy Sessions
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join professionally-led group therapy sessions for structured support, skill-building, and connection with others on similar journeys.
          </p>

          <Glass className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Group Therapy</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Our group therapy sessions are led by licensed mental health professionals and provide 
              structured, evidence-based treatment in a supportive group setting.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Shield, title: 'Licensed Facilitators', desc: 'All groups led by licensed therapists' },
                { icon: Calendar, title: 'Structured Programs', desc: 'Evidence-based therapy protocols' },
                { icon: Users, title: 'Small Groups', desc: 'Intimate groups of 6-12 participants' }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Service Notice</h3>
              <p className="text-yellow-700 text-sm">
                Our group therapy program is currently being established. We're recruiting licensed 
                therapists and developing our group therapy protocols. Registration will open soon.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions (Preview)</h3>
            <div className="space-y-4 mb-8">
              {upcomingGroups.map((group, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{group.title}</h4>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full">
                      {group.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">Facilitated by {group.facilitator}</p>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {group.time}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {group.participants}/{group.maxParticipants} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                Get Notified When Available
              </button>
              <Link href="/peer-support" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Join Peer Support Now
              </Link>
              <Link href="/therapist" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Individual Therapy
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}