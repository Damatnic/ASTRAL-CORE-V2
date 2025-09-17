'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Wind, Brain, Music, Book, Sun } from 'lucide-react';

export default function WellnessToolsIntroStep() {
  const tools = [
    { icon: Wind, title: 'Breathing Exercises', description: 'Guided breathing for anxiety and stress relief', color: 'bg-blue-500' },
    { icon: Brain, title: 'Mindfulness', description: 'Short meditation and grounding exercises', color: 'bg-purple-500' },
    { icon: Music, title: 'Calming Sounds', description: 'Nature sounds and calming music for relaxation', color: 'bg-green-500' },
    { icon: Book, title: 'Self-Care Tips', description: 'Daily wellness practices and coping strategies', color: 'bg-orange-500' },
    { icon: Sun, title: 'Positive Affirmations', description: 'Uplifting messages to boost your mood', color: 'bg-yellow-500' },
    { icon: Heart, title: 'Gratitude Practice', description: 'Simple exercises to cultivate thankfulness', color: 'bg-pink-500' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Wellness Tools for Daily Self-Care</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Quick, evidence-based tools to help you feel better in moments of stress, anxiety, or low mood.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool, index) => (
          <motion.div key={tool.title} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * index }}>
            <div className={`inline-flex items-center justify-center w-12 h-12 ${tool.color} rounded-lg mb-4`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
            <p className="text-sm text-gray-700">{tool.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">How Wellness Tools Help</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div><Wind className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-blue-800"><strong>Immediate Relief:</strong> Quick tools for moments of distress</p></div>
          <div><Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-blue-800"><strong>Build Resilience:</strong> Regular practice strengthens coping skills</p></div>
          <div><Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-sm text-blue-800"><strong>Prevent Crisis:</strong> Daily self-care reduces crisis risk</p></div>
        </div>
      </motion.div>
    </div>
  );
}