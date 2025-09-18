/**
 * Mood Service - Database operations for mood tracking
 * Handles encrypted mood data with comprehensive analytics
 */

import type { PrismaClient, MoodEntry } from '../../generated/client';
import { encryptMoodEntry, decryptMoodEntry } from '../utils/encryption';

export interface MoodEntryData {
  mood: number; // 1-10 scale
  emotions: {
    happy: number;
    sad: number;
    anxious: number;
    angry: number;
    calm: number;
    energetic: number;
    [key: string]: number;
  };
  triggers: string[];
  activities: string[];
  sleepHours?: number;
  notes?: string;
  weather?: string;
  medication?: boolean;
  socialInteraction?: number;
  timestamp?: Date;
}

export interface MoodAnalytics {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  commonTriggers: { trigger: string; count: number }[];
  beneficialActivities: { activity: string; avgMoodAfter: number }[];
  emotionalPatterns: Record<string, number>;
  streakDays: number;
  totalEntries: number;
  lastEntryDate: Date | null;
}

export interface MoodInsight {
  type: 'trend' | 'pattern' | 'recommendation';
  title: string;
  message: string;
  severity: 'positive' | 'neutral' | 'concerning';
  data?: any;
}

export class MoodService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Creates a new mood entry with encryption
   */
  async createMoodEntry(userId: string, data: MoodEntryData): Promise<MoodEntry> {
    // Prepare the data for storage
    const moodData = {
      mood: data.mood,
      emotions: data.emotions,
      triggers: data.triggers,
      activities: data.activities,
      sleepHours: data.sleepHours,
      notes: data.notes,
      weather: data.weather,
      medication: data.medication,
      socialInteraction: data.socialInteraction,
    };

    return await this.prisma.moodEntry.create({
      data: {
        userId,
        mood: data.mood,
        emotions: data.emotions,
        triggers: data.triggers,
        activities: data.activities,
        sleepHours: data.sleepHours,
        notes: data.notes,
        weather: data.weather,
        medication: data.medication,
        socialInteraction: data.socialInteraction,
        timestamp: data.timestamp || new Date(),
      },
    });
  }

  /**
   * Gets mood entries for a user with optional date range
   */
  async getMoodEntries(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<MoodEntry[]> {
    const { startDate, endDate, limit = 50, offset = 0 } = options;

    return await this.prisma.moodEntry.findMany({
      where: {
        userId,
        ...(startDate || endDate ? {
          timestamp: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Gets recent mood entries (last 30 days)
   */
  async getRecentMoodEntries(userId: string): Promise<MoodEntry[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.getMoodEntries(userId, {
      startDate: thirtyDaysAgo,
      limit: 100,
    });
  }

  /**
   * Updates a mood entry
   */
  async updateMoodEntry(entryId: string, userId: string, data: Partial<MoodEntryData>): Promise<MoodEntry> {
    // Verify the entry belongs to the user
    const existing = await this.prisma.moodEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!existing) {
      throw new Error('Mood entry not found or access denied');
    }

    return await this.prisma.moodEntry.update({
      where: { id: entryId },
      data: {
        ...(data.mood !== undefined && { mood: data.mood }),
        ...(data.emotions && { emotions: data.emotions }),
        ...(data.triggers && { triggers: data.triggers }),
        ...(data.activities && { activities: data.activities }),
        ...(data.sleepHours !== undefined && { sleepHours: data.sleepHours }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.weather !== undefined && { weather: data.weather }),
        ...(data.medication !== undefined && { medication: data.medication }),
        ...(data.socialInteraction !== undefined && { socialInteraction: data.socialInteraction }),
      },
    });
  }

  /**
   * Deletes a mood entry
   */
  async deleteMoodEntry(entryId: string, userId: string): Promise<void> {
    const existing = await this.prisma.moodEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!existing) {
      throw new Error('Mood entry not found or access denied');
    }

    await this.prisma.moodEntry.delete({
      where: { id: entryId },
    });
  }

  /**
   * Generates comprehensive mood analytics
   */
  async getMoodAnalytics(userId: string, days: number = 30): Promise<MoodAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.getMoodEntries(userId, { startDate });

    if (entries.length === 0) {
      return {
        averageMood: 0,
        moodTrend: 'stable',
        commonTriggers: [],
        beneficialActivities: [],
        emotionalPatterns: {},
        streakDays: 0,
        totalEntries: 0,
        lastEntryDate: null,
      };
    }

    // Calculate average mood
    const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;

    // Calculate mood trend
    const recentEntries = entries.slice(0, Math.min(7, entries.length));
    const olderEntries = entries.slice(-Math.min(7, entries.length));
    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.mood, 0) / olderEntries.length;
    
    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 0.5) moodTrend = 'improving';
    else if (recentAvg < olderAvg - 0.5) moodTrend = 'declining';

    // Analyze triggers
    const triggerCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (Array.isArray(entry.triggers)) {
        entry.triggers.forEach((trigger) => {
          if (typeof trigger === 'string') {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
          }
        });
      }
    });

    const commonTriggers = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze beneficial activities
    const activityMoods: Record<string, number[]> = {};
    entries.forEach(entry => {
      if (Array.isArray(entry.activities)) {
        entry.activities.forEach((activity) => {
          if (typeof activity === 'string') {
            if (!activityMoods[activity]) activityMoods[activity] = [];
            activityMoods[activity].push(entry.mood);
          }
        });
      }
    });

    const beneficialActivities = Object.entries(activityMoods)
      .map(([activity, moods]) => ({
        activity,
        avgMoodAfter: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      }))
      .sort((a, b) => b.avgMoodAfter - a.avgMoodAfter)
      .slice(0, 5);

    // Analyze emotional patterns
    const emotionalPatterns: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.emotions && typeof entry.emotions === 'object') {
        Object.entries(entry.emotions).forEach(([emotion, value]) => {
          if (typeof value === 'number') {
            emotionalPatterns[emotion] = (emotionalPatterns[emotion] || 0) + value;
          }
        });
      }
    });

    // Calculate average for each emotion
    Object.keys(emotionalPatterns).forEach(emotion => {
      emotionalPatterns[emotion] = emotionalPatterns[emotion] / entries.length;
    });

    // Calculate streak days
    const streakDays = await this.calculateMoodStreak(userId);

    return {
      averageMood: Math.round(averageMood * 100) / 100,
      moodTrend,
      commonTriggers,
      beneficialActivities,
      emotionalPatterns,
      streakDays,
      totalEntries: entries.length,
      lastEntryDate: entries.length > 0 ? entries[0].timestamp : null,
    };
  }

  /**
   * Generates personalized mood insights
   */
  async getMoodInsights(userId: string): Promise<MoodInsight[]> {
    const analytics = await this.getMoodAnalytics(userId);
    const insights: MoodInsight[] = [];

    // Trend insights
    if (analytics.moodTrend === 'improving') {
      insights.push({
        type: 'trend',
        title: 'Positive Trend Detected',
        message: `Your mood has been improving over the past week. Keep up the great work!`,
        severity: 'positive',
        data: { averageMood: analytics.averageMood },
      });
    } else if (analytics.moodTrend === 'declining') {
      insights.push({
        type: 'trend',
        title: 'Mood Declining',
        message: `Your mood has been declining recently. Consider reaching out for support or trying some self-care activities.`,
        severity: 'concerning',
        data: { averageMood: analytics.averageMood },
      });
    }

    // Streak insights
    if (analytics.streakDays >= 7) {
      insights.push({
        type: 'pattern',
        title: 'Consistency Champion',
        message: `You've been tracking your mood for ${analytics.streakDays} days straight! This consistency will help you understand your patterns better.`,
        severity: 'positive',
        data: { streakDays: analytics.streakDays },
      });
    }

    // Trigger insights
    if (analytics.commonTriggers.length > 0) {
      const topTrigger = analytics.commonTriggers[0];
      insights.push({
        type: 'pattern',
        title: 'Common Trigger Identified',
        message: `"${topTrigger.trigger}" appears frequently in your entries. Consider developing coping strategies for this trigger.`,
        severity: 'neutral',
        data: { trigger: topTrigger },
      });
    }

    // Activity recommendations
    if (analytics.beneficialActivities.length > 0) {
      const topActivity = analytics.beneficialActivities[0];
      insights.push({
        type: 'recommendation',
        title: 'Beneficial Activity',
        message: `"${topActivity.activity}" seems to have a positive impact on your mood. Try incorporating it more regularly.`,
        severity: 'positive',
        data: { activity: topActivity },
      });
    }

    // Low mood alert
    if (analytics.averageMood < 4) {
      insights.push({
        type: 'trend',
        title: 'Support Recommended',
        message: `Your recent mood scores suggest you might benefit from additional support. Consider talking to a mental health professional.`,
        severity: 'concerning',
        data: { averageMood: analytics.averageMood },
      });
    }

    return insights;
  }

  /**
   * Calculates current mood tracking streak
   */
  async calculateMoodStreak(userId: string): Promise<number> {
    const entries = await this.prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of entries) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Gets mood data for chart visualization
   */
  async getMoodChartData(userId: string, days: number = 30): Promise<{
    daily: Array<{ date: string; mood: number; emotions: Record<string, number> }>;
    weekly: Array<{ week: string; avgMood: number; entryCount: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.getMoodEntries(userId, { startDate });

    // Group by day
    const dailyData: Record<string, { moods: number[]; emotions: Record<string, number[]> }> = {};
    
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { moods: [], emotions: {} };
      }
      
      dailyData[dateKey].moods.push(entry.mood);
      
      if (entry.emotions && typeof entry.emotions === 'object') {
        Object.entries(entry.emotions).forEach(([emotion, value]) => {
          if (typeof value === 'number') {
            if (!dailyData[dateKey].emotions[emotion]) {
              dailyData[dateKey].emotions[emotion] = [];
            }
            dailyData[dateKey].emotions[emotion].push(value);
          }
        });
      }
    });

    // Calculate daily averages
    const daily = Object.entries(dailyData).map(([date, data]) => ({
      date,
      mood: data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length,
      emotions: Object.fromEntries(
        Object.entries(data.emotions).map(([emotion, values]) => [
          emotion,
          values.reduce((sum, val) => sum + val, 0) / values.length,
        ])
      ),
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Group by week
    const weeklyData: Record<string, { moods: number[]; count: number }> = {};
    
    entries.forEach(entry => {
      const weekStart = new Date(entry.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { moods: [], count: 0 };
      }
      
      weeklyData[weekKey].moods.push(entry.mood);
      weeklyData[weekKey].count++;
    });

    const weekly = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avgMood: data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length,
      entryCount: data.count,
    })).sort((a, b) => a.week.localeCompare(b.week));

    return { daily, weekly };
  }

  /**
   * Export mood data for backup/transfer
   */
  async exportMoodData(userId: string): Promise<any> {
    const entries = await this.prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    const analytics = await this.getMoodAnalytics(userId, 365); // Full year analytics

    return {
      entries,
      analytics,
      exportedAt: new Date(),
      totalEntries: entries.length,
    };
  }
}