'use client';

import React from 'react';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function TestDesignPage() {
  return (
    <div className="min-h-screen bg-black p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl font-bold text-center neon-purple mb-8">
          DESIGN TEST PAGE
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Glassmorphism Card */}
          <div className="glass p-6 text-white">
            <h2 className="text-2xl font-bold neon-blue mb-4">Glassmorphism Card</h2>
            <p>This card should have a glass effect with backdrop blur.</p>
          </div>
          
          {/* Heavy Glass Card */}
          <div className="glass-heavy p-6 text-white">
            <h2 className="text-2xl font-bold neon-pink mb-4">Heavy Glass Card</h2>
            <p>This card should have a stronger glass effect.</p>
          </div>
          
          {/* Mixed Glass Card */}
          <div className="glass-mixed p-6 text-white">
            <h2 className="text-2xl font-bold neon-blue mb-4">Mixed Glass Card</h2>
            <p>This card combines both glass styles with an inner highlight.</p>
          </div>
          
          {/* Gradient Mesh */}
          <div className="gradient-mesh p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Gradient Mesh</h2>
            <p>This should have an animated gradient background.</p>
          </div>
          
          {/* Holographic Text */}
          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-4xl font-bold holographic mb-4">
              HOLOGRAPHIC TEXT
            </h2>
            <p className="text-white">This text should have a holographic rainbow effect.</p>
          </div>
          
          {/* Neon Effects */}
          <div className="bg-black p-6 rounded-lg space-y-4">
            <h3 className="text-3xl font-bold neon-purple">Purple Neon</h3>
            <h3 className="text-3xl font-bold neon-blue">Blue Neon</h3>
            <h3 className="text-3xl font-bold neon-pink">Pink Neon</h3>
          </div>
          
          {/* Animation Test */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Animation Test</h2>
            <div className="w-16 h-16 bg-blue-500 rounded-full animate-blob mb-4" />
            <div className="w-16 h-16 bg-purple-500 rounded-full animate-blob animation-delay-2000 mb-4" />
            <div className="w-16 h-16 bg-pink-500 rounded-full animate-blob animation-delay-4000" />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button className="glass px-8 py-4 text-white font-bold text-xl neon-purple animate-neon-pulse">
            CLICK ME - NEON BUTTON
          </button>
        </div>
      </div>
    </div>
  );
}