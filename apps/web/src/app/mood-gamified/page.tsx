'use client';

/**
 * Gamified Mood Tracker Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Enhanced mood tracking with:
 * - XP rewards for consistency
 * - Achievement progress tracking
 * - Gaming-style progress visualization
 * - Mental health focused design
 */

import React from 'react';
import { GamificationProvider } from '../../contexts/GamificationContext';
import MoodTrackerGamified from '../../components/MoodTrackerGamified';

export default function MoodGamifiedPage() {
  return (
    <GamificationProvider>
      <div className="min-h-screen">
        <MoodTrackerGamified />
      </div>
    </GamificationProvider>
  );
}