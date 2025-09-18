/**
 * Exercise and therapeutic tool type definitions
 */

import { UUID, Timestamp, MediaContent, EffectivenessRating } from './index';

// Breathing exercise types
export interface BreathingExercise {
  id: UUID;
  name: string;
  type: BreathingType;
  description: string;
  duration: number; // total seconds
  pattern: BreathingPattern;
  difficulty: DifficultyLevel;
  benefits: string[];
  instructions: string[];
  audio?: AudioGuide;
  visual?: VisualGuide;
  hapticPattern?: HapticPattern;
  isGuided: boolean;
  tags: string[];
}

export type BreathingType = 
  | '4-7-8'        // 4 in, 7 hold, 8 out
  | 'box'          // 4-4-4-4
  | 'belly'        // Diaphragmatic breathing
  | 'alternate'    // Alternate nostril
  | 'coherent'     // 5-5 pattern
  | 'tactical'     // Combat breathing
  | 'custom';      // User-defined

export interface BreathingPattern {
  inhale: number; // seconds
  holdIn?: number;
  exhale: number;
  holdOut?: number;
  rounds?: number; // Number of repetitions
}

export interface AudioGuide {
  url: string;
  voiceType: 'male' | 'female' | 'neutral';
  language: string;
  duration: number;
  backgroundMusic?: string;
}

export interface VisualGuide {
  type: 'circle' | 'bar' | 'waves' | 'custom';
  colors: {
    inhale: string;
    hold: string;
    exhale: string;
    rest: string;
  };
  animation: 'smooth' | 'stepped';
}

export interface HapticPattern {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'strong';
  pattern: number[]; // Vibration pattern in ms
}

// Meditation types
export interface MeditationSession {
  id: UUID;
  name: string;
  type: MeditationType;
  duration: number; // seconds
  difficulty: DifficultyLevel;
  guide?: MeditationGuide;
  backgroundSounds?: SoundScape;
  script?: MeditationScript;
  focusArea?: string[];
  benefits: string[];
  prerequisites?: string[];
}

export type MeditationType = 
  | 'mindfulness'
  | 'guided'
  | 'body-scan'
  | 'loving-kindness'
  | 'visualization'
  | 'mantra'
  | 'movement'
  | 'sleep'
  | 'anxiety-relief'
  | 'pain-management';

export interface MeditationGuide {
  narrator: string;
  audioUrl: string;
  transcript?: string;
  cuePoints?: CuePoint[]; // Timed instructions
}

export interface CuePoint {
  time: number; // seconds from start
  text: string;
  type: 'instruction' | 'reminder' | 'transition';
}

export interface SoundScape {
  type: 'nature' | 'ambient' | 'white-noise' | 'binaural' | 'music';
  url: string;
  volume?: number; // 0-1
  loop: boolean;
}

export interface MeditationScript {
  introduction: string;
  body: ScriptSection[];
  conclusion: string;
  totalDuration: number;
}

export interface ScriptSection {
  content: string;
  duration: number;
  pauseAfter?: number;
}

// Grounding exercise types
export interface GroundingExercise {
  id: UUID;
  name: string;
  type: GroundingType;
  description: string;
  steps: GroundingStep[];
  estimatedTime: number; // minutes
  difficulty: DifficultyLevel;
  effectiveness?: EffectivenessRating;
  suitableFor: string[]; // e.g., 'panic', 'dissociation', 'anxiety'
}

export type GroundingType = 
  | '5-4-3-2-1'    // Sensory grounding
  | 'categories'    // Mental categories
  | 'mental-math'   // Counting, calculations
  | 'physical'      // Body-based grounding
  | 'visualization' // Safe place visualization
  | 'object-focus'; // Focus on single object

export interface GroundingStep {
  order: number;
  instruction: string;
  sense?: SenseType;
  count?: number;
  duration?: number; // seconds
  userInput?: string[];
  completed: boolean;
  tips?: string[];
}

export type SenseType = 'sight' | 'sound' | 'touch' | 'smell' | 'taste';

// Exercise session tracking
export interface ExerciseSession {
  id: UUID;
  userId: UUID;
  exerciseId: UUID;
  exerciseType: 'breathing' | 'meditation' | 'grounding' | 'movement' | 'other';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration: number; // actual seconds
  completed: boolean;
  effectiveness?: EffectivenessRating;
  moodBefore?: number; // 1-10
  moodAfter?: number; // 1-10
  notes?: string;
  data?: ExerciseData; // Exercise-specific data
}

export interface ExerciseData {
  breathCount?: number;
  heartRateBefore?: number;
  heartRateAfter?: number;
  distractionLevel?: number; // 1-10
  focusQuality?: number; // 1-10
  customMetrics?: Record<string, any>;
}

// Movement exercises
export interface MovementExercise {
  id: UUID;
  name: string;
  type: MovementType;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  equipment?: string[];
  instructions: MovementInstruction[];
  benefits: string[];
  contraindications?: string[];
  videoUrl?: string;
  imageUrls?: string[];
}

export type MovementType = 
  | 'yoga'
  | 'stretching'
  | 'tai-chi'
  | 'walking'
  | 'dancing'
  | 'progressive-muscle';

export interface MovementInstruction {
  step: number;
  description: string;
  duration?: number;
  imageUrl?: string;
  tips?: string[];
  modifications?: string[];
}

// Common types
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Exercise recommendations
export interface ExerciseRecommendation {
  exerciseId: UUID;
  type: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  basedOn: 'mood' | 'time' | 'history' | 'preference' | 'clinical';
  confidence: number; // 0-1
}