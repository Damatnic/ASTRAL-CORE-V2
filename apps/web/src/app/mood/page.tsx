'use client';

import dynamicImport from 'next/dynamic';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

const MoodTracker = dynamicImport(() => import('@/components/MoodTracker'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="animate-pulse">
        <div className="bg-white rounded-2xl h-32 mb-6"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl h-64"></div>
          <div className="bg-white rounded-2xl h-64"></div>
          <div className="bg-white rounded-2xl h-64"></div>
          <div className="bg-white rounded-2xl h-64"></div>
        </div>
      </div>
    </div>
  )
});

export default function MoodPage() {
  return <MoodTracker />;
}