'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Heart, Users } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Mental Health Education
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Learn about mental health conditions, treatment options, and evidence-based strategies for wellbeing.
          </p>

          <Glass className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Educational Content Coming Soon</h2>
            <p className="text-gray-700 mb-6">We're preparing comprehensive educational resources about mental health topics, treatment options, and wellness strategies.</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Brain, title: 'Understanding Conditions', desc: 'Learn about various mental health conditions' },
                { icon: Heart, title: 'Treatment Options', desc: 'Explore therapy and treatment approaches' },
                { icon: Users, title: 'Support Systems', desc: 'Build effective support networks' }
              ].map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-sm text-gray-600">{topic.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/resources" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Browse Resources
              </Link>
              <Link href="/self-help" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Self-Help Tools
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}