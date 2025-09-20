'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React from 'react';
import AITherapyHub from '@/components/ai-therapy/AITherapyHub';
import TherapistSelectionInterface from '@/components/ai-therapy/TherapistSelectionInterface';
import { Glass, ProductionButton } from '@/components/design-system/ProductionGlassSystem';
import { Brain, MessageCircle, Shield, Clock } from 'lucide-react';
import { Metadata } from 'next';

export default function AITherapyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Crisis Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="mr-2">🚨</span>
        In crisis? Call 988 (Suicide & Crisis Lifeline) or chat with our crisis team immediately
        <a href="tel:988" className="ml-3 underline font-bold">Call 988</a>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Glass variant="light" className="mb-8 p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-12 h-12 text-purple-600 mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI Therapy Hub
            </h1>
          </div>
          
          <p className="text-xl text-gray-900 dark:text-gray-200 mb-6 max-w-3xl mx-auto">
            Connect with specialized AI therapists available 24/7. Our evidence-based AI therapy combines 
            the latest in mental health research with personalized, compassionate care.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Glass variant="light" className="p-4">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Availability</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Crisis support and therapy sessions available around the clock
              </p>
            </Glass>

            <Glass variant="light" className="p-4">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Evidence-Based</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                CBT, DBT, EMDR, and other proven therapeutic approaches
              </p>
            </Glass>

            <Glass variant="light" className="p-4">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalized Care</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                AI therapists that adapt to your unique needs and progress
              </p>
            </Glass>
          </div>
        </Glass>

        {/* New Therapist Selection Interface with AI Disclosure */}
        <TherapistSelectionInterface 
          userId="demo-user"
          onTherapistSelected={(therapist, sessionType) => {
            // Navigate to therapy chat with selected therapist
            const therapistId = therapist.id.replace('dr-', ''); // Convert dr-aria to aria for compatibility
            window.location.href = `/ai-therapy/chat?therapist=${therapistId}&sessionType=${sessionType || 'check-in'}`;
          }}
          onDisclosureComplete={(userAccepted) => {
            if (!userAccepted) {
              // User declined AI therapy, show alternatives
              console.log('User declined AI therapy');
            }
          }}
        />

        {/* Enhanced Resource Hub */}
        <AITherapyHub 
          userId="demo-user" 
          onSessionStart={(therapist, sessionType) => {
            // Navigate to therapy chat with therapist and session type
            window.location.href = `/ai-therapy/chat?therapist=${therapist.id}&sessionType=${sessionType}`;
          }}
        />

        {/* Emergency Resources */}
        <Glass variant="medium" className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Emergency Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProductionButton
              variant="crisis"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = 'tel:988'}
            >
              Call 988 - Crisis Lifeline
            </ProductionButton>
            <ProductionButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/crisis/chat'}
            >
              Crisis Chat Support
            </ProductionButton>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-4">
            If you're having thoughts of suicide or are in immediate danger, please contact emergency services 
            or go to your nearest emergency room.
          </p>
        </Glass>
      </div>
    </div>
  );
}