'use client';
import dynamicImport from 'next/dynamic';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

const TherapistPortal = dynamicImport(() => import('@/components/TherapistPortal'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200 rounded-xl mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
});

export default function TherapistPage() {
  return <TherapistPortal />;
}