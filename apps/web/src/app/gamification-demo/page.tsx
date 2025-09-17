'use client';

/**
 * Gamification Demo Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Comprehensive showcase of all gamification features:
 * - Xbox/PlayStation-style components
 * - Achievement and challenge systems
 * - Progress visualization
 * - Mental health appropriate design
 */

import React from 'react';
import { GamificationProvider } from '../../contexts/GamificationContext';
import GamificationDemo from '../../components/gamification/GamificationDemo';

export default function GamificationDemoPage() {
  return (
    <GamificationProvider>
      <GamificationDemo />
    </GamificationProvider>
  );
}