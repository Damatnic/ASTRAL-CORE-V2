'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Quote, ArrowRight } from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import Link from 'next/link';

export default function StoriesPage() {
  const sampleStories = [
    {
      title: "From Crisis to Hope",
      excerpt: "My journey through depression and how I found light again...",
      author: "Sarah M.",
      category: "Depression Recovery"
    },
    {
      title: "Breaking the Anxiety Cycle", 
      excerpt: "How I learned to manage panic attacks and reclaim my life...",
      author: "Alex K.",
      category: "Anxiety Management"
    },
    {
      title: "Finding My Voice",
      excerpt: "Overcoming trauma and discovering inner strength...",
      author: "Jordan T.", 
      category: "Trauma Recovery"
    }
  ];

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
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Recovery Stories
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Real stories of hope, healing, and resilience from our community members who have overcome mental health challenges.
          </p>

          <Glass className="p-6 max-w-2xl mx-auto mb-12 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center text-yellow-800">
              <Quote className="w-5 h-5 mr-2" />
              <span className="font-medium">
                "Recovery is not one and done. It is a lifelong process. It happens one day at a time." - Anonymous
              </span>
            </div>
          </Glass>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sampleStories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Glass className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {story.category}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{story.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    by {story.author}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Story
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Your story of recovery and resilience could inspire others on their journey. Help us build a community of hope.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Join Community
              </Link>
              <Link href="/support" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Support
              </Link>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}