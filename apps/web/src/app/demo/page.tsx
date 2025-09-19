'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React from 'react';
import DemoLoginSystem from '@/components/demo/DemoLoginSystem';

export default function DemoPage() {
  const handleAccountSelect = (account: any) => {
    // Handle account selection - could navigate or set state
    console.log('Selected account:', account);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DemoLoginSystem onAccountSelect={handleAccountSelect} />
    </div>
  );
}