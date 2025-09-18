'use client';

/**
 * Wellness Dashboard Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Main gamification page featuring:
 * - Xbox/PlayStation-style wellness dashboard
 * - Achievement tracking and progress
 * - Challenge system
 * - Mental health appropriate design
 */

import React from 'react';
import { useSession } from 'next-auth/react';
import { GamificationProvider } from '../../contexts/GamificationContextStub';
import { GamificationDashboard } from '../../components/gamification/Stub';

export default function WellnessPage() {
  const { data: session, status } = useSession();

  // Show loading state while session is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600 text-lg">Loading wellness dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication prompt if no session
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your wellness dashboard and track your mental health journey.</p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <GamificationProvider>
      <div className="min-h-screen">
        <GamificationDashboard />
      </div>
    </GamificationProvider>
  );
}