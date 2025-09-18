/**
 * Mood tracking type definitions
 */

import { UUID, Timestamp, GeoLocation, WeatherData } from './index';

// Mood entry types
export interface MoodEntry {
  id: UUID;
  userId: UUID;
  timestamp: Timestamp;
  moodScore: number; // 1-10 scale
  emotions: Emotion[];
  triggers?: Trigger[];
  activities?: Activity[];
  notes?: string;
  location?: GeoLocation;
  weather?: WeatherData;
  sleepHours?: number;
  medicationTaken?: boolean;
  energyLevel?: number; // 1-10
  anxietyLevel?: number; // 1-10
  stressLevel?: number; // 1-10
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Emotion types
export interface Emotion {
  category: EmotionCategory;
  name: string;
  intensity: number; // 1-10
  color?: string; // For visualization
}

export type EmotionCategory = 
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'surprised'
  | 'disgusted'
  | 'neutral'
  | 'anxious'
  | 'excited'
  | 'grateful'
  | 'lonely'
  | 'overwhelmed'
  | 'hopeful'
  | 'frustrated';

// Trigger types
export interface Trigger {
  id: UUID;
  type: TriggerType;
  description: string;
  intensity: number; // 1-10
  category?: string;
  copingStrategiesUsed?: UUID[]; // References to coping strategies
}

export type TriggerType = 
  | 'internal'   // Thoughts, feelings, physical sensations
  | 'external'   // Environmental, social
  | 'situational'; // Specific circumstances

// Activity types
export interface Activity {
  name: string;
  category: ActivityCategory;
  duration?: number; // minutes
  enjoyment?: number; // 1-10
  accomplishment?: number; // 1-10
}

export type ActivityCategory = 
  | 'work'
  | 'leisure'
  | 'social'
  | 'exercise'
  | 'self-care'
  | 'household'
  | 'creative'
  | 'spiritual'
  | 'education'
  | 'therapy';

// Mood patterns and trends
export interface MoodPattern {
  userId: UUID;
  pattern: string;
  frequency: number;
  firstDetected: Timestamp;
  lastOccurred: Timestamp;
  significance: 'low' | 'medium' | 'high';
  recommendations?: string[];
}

export interface MoodTrend {
  userId: UUID;
  period: TrendPeriod;
  averageMood: number;
  moodVariability: number;
  dominantEmotions: Emotion[];
  commonTriggers: Trigger[];
  improvement: number; // Percentage
  data: TrendDataPoint[];
}

export type TrendPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface TrendDataPoint {
  date: Timestamp;
  value: number;
  count: number;
}

// Mood input for creating entries
export interface MoodInput {
  moodScore: number;
  emotions?: EmotionInput[];
  triggers?: TriggerInput[];
  activities?: ActivityInput[];
  notes?: string;
  sleepHours?: number;
  medicationTaken?: boolean;
  energyLevel?: number;
  anxietyLevel?: number;
  stressLevel?: number;
}

export interface EmotionInput {
  category: EmotionCategory;
  name: string;
  intensity: number;
}

export interface TriggerInput {
  type: TriggerType;
  description: string;
  intensity: number;
}

export interface ActivityInput {
  name: string;
  category: ActivityCategory;
  duration?: number;
  enjoyment?: number;
  accomplishment?: number;
}

// Mood analytics
export interface MoodAnalytics {
  userId: UUID;
  period: DateRange;
  summary: MoodSummary;
  patterns: MoodPattern[];
  insights: MoodInsight[];
  recommendations: MoodRecommendation[];
}

export interface MoodSummary {
  totalEntries: number;
  averageMood: number;
  moodRange: { min: number; max: number };
  mostFrequentEmotions: Emotion[];
  consistency: number; // 0-100%
  streakDays: number;
}

export interface MoodInsight {
  type: InsightType;
  title: string;
  description: string;
  data?: any;
  importance: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export type InsightType = 
  | 'pattern'
  | 'correlation'
  | 'improvement'
  | 'warning'
  | 'achievement';

export interface MoodRecommendation {
  id: UUID;
  type: 'tool' | 'exercise' | 'content' | 'action';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  resourceId?: UUID;
}

interface DateRange {
  start: Timestamp;
  end: Timestamp;
}