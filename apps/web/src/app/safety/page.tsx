'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

import SafetyPlanner from '@/components/SafetyPlanner';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Planning Tool</h1>
          <p className="text-lg text-gray-600">Create your personalized safety plan for crisis prevention</p>
        </div>
        <SafetyPlanner />
      </div>
    </div>
  );
}