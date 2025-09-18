'use client';

import dynamic from 'next/dynamic';

const VolunteerDashboard = dynamic(() => import('@/components/VolunteerDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
});

export default function VolunteerPage() {
  return <VolunteerDashboard />;
}