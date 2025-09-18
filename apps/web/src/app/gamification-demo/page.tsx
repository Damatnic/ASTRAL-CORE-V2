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
import { GamificationProvider } from '../../contexts/GamificationContextStub';
import { GamificationDemo } from '../../components/gamification/Stub';

export default function GamificationDemoPage() {
  return (
    <GamificationProvider>
      <GamificationDemo />
    </GamificationProvider>
  );
}