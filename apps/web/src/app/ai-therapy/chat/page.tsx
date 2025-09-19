'use client';

import React from 'react';
import TherapyChat from '@/components/ai-therapy/TherapyChat';
import { Glass } from '@/components/design-system/ProductionGlassSystem';
import { Brain, Shield } from 'lucide-react';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function AITherapyChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Crisis Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="mr-2">🚨</span>
        In crisis? Call 988 (Suicide & Crisis Lifeline) immediately
        <a href="tel:988" className="ml-3 underline font-bold">Call 988</a>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Glass variant="light" className="mb-6 p-4">
          <div className="flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI Therapy Session
            </h1>
          </div>
          <p className="text-center text-gray-800 dark:text-gray-300 mt-2">
            Secure, private, and evidence-based therapy chat with specialized AI therapists
          </p>
        </Glass>

        {/* Therapy Chat Component */}
        <TherapyChat 
          therapistId="aria"
          userId="demo-user"
          sessionType="check-in"
          onSessionEnd={(session) => {
            console.log('Session ended:', session);
            // Handle session end - maybe redirect to summary
          }}
        />

        {/* Privacy Notice */}
        <Glass variant="light" className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Privacy & Security
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your therapy sessions are end-to-end encrypted and completely confidential. 
                Our AI therapists are bound by the same privacy standards as human therapists. 
                Session data is used only to improve your care and is never shared.
              </p>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}