'use client';

import React from 'react';

export default function SkipNavigation() {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a 
      href="#main-content" 
      className="
        sr-only focus:not-sr-only 
        focus:absolute focus:top-4 focus:left-4 focus:z-[9999] 
        focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white 
        focus:rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
        focus:text-lg focus:font-semibold focus:shadow-xl
        focus:transform focus:scale-105 focus:transition-all focus:duration-200
        focus:border-2 focus:border-white
        focus:no-underline hover:no-underline
      "
      onClick={handleSkip}
    >
      Skip to main content
    </a>
  );
}