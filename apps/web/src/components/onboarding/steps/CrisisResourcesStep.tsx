'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Users, Globe, Clock, Heart } from 'lucide-react';

export default function CrisisResourcesStep() {
  const resources = [
    { icon: Phone, title: '988 Suicide & Crisis Lifeline', contact: 'tel:988', description: '24/7 free and confidential support', action: 'Call 988', color: 'bg-red-500' },
    { icon: MessageCircle, title: 'Crisis Text Line', contact: 'sms:741741', description: 'Text HOME to 741741 for crisis counseling', action: 'Text HOME', color: 'bg-blue-500' },
    { icon: Users, title: 'LGBTQ+ Support', contact: 'tel:1-866-488-7386', description: 'Trevor Project for LGBTQ+ youth', action: 'Call Trevor', color: 'bg-purple-500' },
    { icon: Globe, title: 'Veterans Crisis Line', contact: 'tel:1-800-273-8255', description: 'Press 1 for veteran-specific support', action: 'Call & Press 1', color: 'bg-green-500' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Crisis Resources - Always Here for You</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">These resources are available 24/7, completely free, and staffed by trained professionals who care about your wellbeing.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {resources.map((resource, index) => (
          <motion.div key={resource.title} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * index }}>
            <div className={`inline-flex items-center justify-center w-12 h-12 ${resource.color} rounded-lg mb-4`}>
              <resource.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{resource.description}</p>
            <a href={resource.contact} className={`inline-flex items-center justify-center w-full ${resource.color} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2`}>
              {resource.action}
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center flex items-center justify-center"><Clock className="w-6 h-6 mr-2" />What to Expect When You Reach Out</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div><Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" /><h4 className="font-medium text-blue-900 mb-1">Immediate Response</h4><p className="text-sm text-blue-800">Someone will answer your call or text right away</p></div>
          <div><Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" /><h4 className="font-medium text-blue-900 mb-1">Compassionate Support</h4><p className="text-sm text-blue-800">Trained counselors who understand and care</p></div>
          <div><Users className="w-8 h-8 text-blue-600 mx-auto mb-2" /><h4 className="font-medium text-blue-900 mb-1">Confidential Help</h4><p className="text-sm text-blue-800">Your privacy is protected and respected</p></div>
        </div>
      </motion.div>

      <motion.div className="bg-green-50 border-2 border-green-200 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-lg font-semibold text-green-900 mb-3 text-center">Remember: Reaching Out is Strength</h3>
        <p className="text-green-800 text-center max-w-2xl mx-auto">Asking for help when you need it is one of the bravest things you can do. These resources exist because your life matters, and there are people who want to help you through difficult times.</p>
      </motion.div>
    </div>
  );
}