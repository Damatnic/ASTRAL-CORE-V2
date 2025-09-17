/**
 * Mood Service - Database operations for mood tracking
 * Handles encrypted mood data with comprehensive analytics
 */
import type { PrismaClient, MoodEntry } from '../../generated/client';
export interface MoodEntryData {
    mood: number;
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
    commonTriggers: {
        trigger: string;
        count: number;
    }[];
    beneficialActivities: {
        activity: string;
        avgMoodAfter: number;
    }[];
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
export declare class MoodService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Creates a new mood entry with encryption
     */
    createMoodEntry(userId: string, data: MoodEntryData): Promise<MoodEntry>;
    /**
     * Gets mood entries for a user with optional date range
     */
    getMoodEntries(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<MoodEntry[]>;
    /**
     * Gets recent mood entries (last 30 days)
     */
    getRecentMoodEntries(userId: string): Promise<MoodEntry[]>;
    /**
     * Updates a mood entry
     */
    updateMoodEntry(entryId: string, userId: string, data: Partial<MoodEntryData>): Promise<MoodEntry>;
    /**
     * Deletes a mood entry
     */
    deleteMoodEntry(entryId: string, userId: string): Promise<void>;
    /**
     * Generates comprehensive mood analytics
     */
    getMoodAnalytics(userId: string, days?: number): Promise<MoodAnalytics>;
    /**
     * Generates personalized mood insights
     */
    getMoodInsights(userId: string): Promise<MoodInsight[]>;
    /**
     * Calculates current mood tracking streak
     */
    calculateMoodStreak(userId: string): Promise<number>;
    /**
     * Gets mood data for chart visualization
     */
    getMoodChartData(userId: string, days?: number): Promise<{
        daily: Array<{
            date: string;
            mood: number;
            emotions: Record<string, number>;
        }>;
        weekly: Array<{
            week: string;
            avgMood: number;
            entryCount: number;
        }>;
    }>;
    /**
     * Export mood data for backup/transfer
     */
    exportMoodData(userId: string): Promise<any>;
}
//# sourceMappingURL=mood.service.d.ts.map