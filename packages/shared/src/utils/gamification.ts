/**
 * Gamification Utilities and XP Calculation Logic
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Mental health appropriate XP calculations
 * - Achievement tracking and validation
 * - Challenge progress management
 * - Level progression system
 * - Streak calculations with mental health considerations
 */

import {
  UserProfile,
  Achievement,
  Challenge,
  ActivityEntry,
  LevelInfo,
  AchievementRequirement,
  ChallengeRequirement,
  GamificationConfig,
  AchievementRarity,
  ChallengeType,
  ChallengeDifficulty,
} from '../types/gamification';

// Base XP values for different activities (designed to be encouraging, not overwhelming)
export const BASE_XP_VALUES = {
  // Core mental health activities
  mood_log: 25,
  activity_complete: 15,
  safety_plan: 50,
  therapy_session: 100,
  crisis_support: 200,
  community_help: 75,
  
  // Self-care activities
  meditation_session: 30,
  breathing_exercise: 20,
  journal_entry: 35,
  gratitude_log: 25,
  
  // Social and community
  peer_support_given: 40,
  peer_support_received: 20,
  community_participation: 30,
  
  // Learning and growth
  educational_content: 15,
  skill_practice: 25,
  goal_setting: 30,
  reflection_complete: 20,
  
  // Milestones
  first_week_complete: 500,
  first_month_complete: 1500,
  streak_milestone: 100,
} as const;

// Mental health appropriate multipliers
export const WELLBEING_MULTIPLIERS = {
  // Encourage consistency over intensity
  daily_consistency: 1.2,
  weekly_consistency: 1.5,
  
  // Support during difficult times (no punishment for bad days)
  crisis_support: 2.0,
  recovery_day: 1.1,
  
  // Community engagement
  helping_others: 1.3,
  receiving_help: 1.0, // No shame in getting help
  
  // Long-term engagement
  monthly_active: 1.1,
  quarterly_active: 1.2,
} as const;

/**
 * Calculate XP for an activity with mental health considerations
 */
export function calculateActivityXP(
  activityType: keyof typeof BASE_XP_VALUES,
  metadata?: Record<string, any>,
  userProfile?: UserProfile,
  config?: Partial<GamificationConfig>
): number {
  const baseXP = BASE_XP_VALUES[activityType] || 10;
  let multiplier = config?.xpMultiplier || 1.0;
  
  // Apply wellbeing-focused multipliers
  if (metadata?.isConsistentDay) {
    multiplier *= WELLBEING_MULTIPLIERS.daily_consistency;
  }
  
  if (metadata?.isDuringCrisis) {
    multiplier *= WELLBEING_MULTIPLIERS.crisis_support;
  }
  
  if (metadata?.isHelpingOthers) {
    multiplier *= WELLBEING_MULTIPLIERS.helping_others;
  }
  
  // Streak bonus (encouraging but not overwhelming)
  if (userProfile?.stats.currentStreak && userProfile.stats.currentStreak > 3) {
    const streakBonus = Math.min(userProfile.stats.currentStreak * 0.05, 0.5); // Max 50% bonus
    multiplier *= (1 + streakBonus);
  }
  
  return Math.floor(baseXP * multiplier);
}

/**
 * Calculate level from total XP using various curves
 */
export function calculateLevelFromXP(
  totalXP: number,
  curve: 'linear' | 'exponential' | 'logarithmic' = 'exponential',
  maxLevel: number = 100
): number {
  let level = 1;
  
  switch (curve) {
    case 'linear':
      level = Math.floor(totalXP / 1000) + 1;
      break;
      
    case 'logarithmic':
      if (totalXP > 0) {
        level = Math.floor(Math.log(totalXP / 100 + 1) / Math.log(1.5)) + 1;
      }
      break;
      
    case 'exponential':
    default:
      // Gentle exponential curve designed for long-term engagement
      if (totalXP > 0) {
        level = Math.floor(Math.pow(totalXP / 100, 0.5)) + 1;
      }
      break;
  }
  
  return Math.min(level, maxLevel);
}

/**
 * Calculate XP required for a specific level
 */
export function calculateXPForLevel(
  level: number,
  curve: 'linear' | 'exponential' | 'logarithmic' = 'exponential'
): number {
  switch (curve) {
    case 'linear':
      return (level - 1) * 1000;
      
    case 'logarithmic':
      return Math.floor(100 * (Math.pow(1.5, level - 1) - 1));
      
    case 'exponential':
    default:
      return Math.floor(100 * Math.pow(level - 1, 2));
  }
}

/**
 * Calculate streak with mental health considerations
 * Includes "streak protection" to avoid punishing mental health struggles
 */
export function calculateStreak(
  activities: ActivityEntry[],
  protectionConfig?: {
    enabled: boolean;
    maxProtections: number;
    cooldownDays: number;
  }
): {
  currentStreak: number;
  longestStreak: number;
  protectionsUsed: number;
  canUseProtection: boolean;
} {
  if (activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      protectionsUsed: 0,
      canUseProtection: false,
    };
  }
  
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let protectionsUsed = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check each day going backwards
  for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - dayOffset);
    
    const hasActivityOnDay = sortedActivities.some(activity => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === checkDate.getTime();
    });
    
    if (hasActivityOnDay) {
      tempStreak++;
      if (dayOffset === 0 || (dayOffset === 1 && currentStreak === 0)) {
        currentStreak = tempStreak;
      }
    } else {
      // Check if we can use streak protection
      const canProtect = protectionConfig?.enabled &&
        protectionsUsed < (protectionConfig?.maxProtections || 0) &&
        tempStreak > 2; // Only protect established streaks
      
      if (canProtect && dayOffset < 3) { // Only protect recent gaps
        protectionsUsed++;
        tempStreak++; // Continue streak with protection
        if (dayOffset === 0 || (dayOffset === 1 && currentStreak === 0)) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        if (dayOffset === 0 || dayOffset === 1) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  const canUseProtection = Boolean(protectionConfig?.enabled &&
    protectionsUsed < (protectionConfig?.maxProtections || 0));
  
  return {
    currentStreak,
    longestStreak,
    protectionsUsed,
    canUseProtection,
  };
}

/**
 * Check if user qualifies for an achievement
 */
export function checkAchievementRequirements(
  achievement: Achievement,
  userProfile: UserProfile,
  recentActivities: ActivityEntry[]
): {
  qualified: boolean;
  progress: number;
  missingRequirements: string[];
} {
  if (achievement.completed) {
    return { qualified: true, progress: 100, missingRequirements: [] };
  }
  
  const missingRequirements: string[] = [];
  let totalProgress = 0;
  
  for (const requirement of achievement.requirements) {
    const { qualified, progress } = checkSingleRequirement(
      requirement,
      userProfile,
      recentActivities
    );
    
    if (!qualified) {
      missingRequirements.push(`${requirement.metric}: ${requirement.target}`);
    }
    
    totalProgress += progress;
  }
  
  const averageProgress = totalProgress / achievement.requirements.length;
  
  return {
    qualified: missingRequirements.length === 0,
    progress: Math.round(averageProgress),
    missingRequirements,
  };
}

/**
 * Check a single achievement requirement
 */
function checkSingleRequirement(
  requirement: AchievementRequirement,
  userProfile: UserProfile,
  recentActivities: ActivityEntry[]
): { qualified: boolean; progress: number } {
  const { type, target, metric, timeframe } = requirement;
  
  let currentValue = 0;
  
  // Filter activities by timeframe
  const filteredActivities = filterActivitiesByTimeframe(recentActivities, timeframe);
  
  switch (type) {
    case 'count':
      currentValue = getMetricCount(metric, userProfile, filteredActivities);
      break;
      
    case 'streak':
      currentValue = userProfile.stats.currentStreak;
      break;
      
    case 'time':
      currentValue = getTimeMetric(metric, userProfile, filteredActivities);
      break;
      
    case 'level':
      currentValue = userProfile.level;
      break;
      
    case 'points':
      currentValue = userProfile.stats.pointsEarned;
      break;
      
    default:
      return { qualified: false, progress: 0 };
  }
  
  const progress = Math.min((currentValue / target) * 100, 100);
  const qualified = currentValue >= target;
  
  return { qualified, progress };
}

/**
 * Filter activities by timeframe
 */
function filterActivitiesByTimeframe(
  activities: ActivityEntry[],
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime'
): ActivityEntry[] {
  if (!timeframe || timeframe === 'allTime') {
    return activities;
  }
  
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeframe) {
    case 'daily':
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'monthly':
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      break;
  }
  
  return activities.filter(activity => activity.timestamp >= cutoffDate);
}

/**
 * Get metric count from user data
 */
function getMetricCount(
  metric: string,
  userProfile: UserProfile,
  activities: ActivityEntry[]
): number {
  switch (metric) {
    case 'moodEntries':
      return userProfile.stats.totalMoodEntries;
    case 'activities':
      return userProfile.stats.totalActivities;
    case 'achievementsUnlocked':
      return userProfile.stats.achievementsUnlocked;
    case 'challengesCompleted':
      return userProfile.stats.completedChallenges;
    case 'daysActive':
      return userProfile.stats.totalDaysActive;
    default:
      return activities.filter(a => a.type === metric).length;
  }
}

/**
 * Get time-based metric
 */
function getTimeMetric(
  metric: string,
  userProfile: UserProfile,
  activities: ActivityEntry[]
): number {
  switch (metric) {
    case 'hoursInApp':
      return userProfile.stats.hoursInApp;
    case 'consecutiveDays':
      return userProfile.stats.currentStreak;
    default:
      return 0;
  }
}

/**
 * Generate mental health appropriate challenges
 */
export function generateDailyChallenges(
  userProfile: UserProfile,
  difficulty: ChallengeDifficulty = 'easy'
): Challenge[] {
  const challenges: Challenge[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const baseChallenges = [
    {
      title: 'Mindful Moment',
      description: 'Take 5 minutes for mindfulness or meditation',
      category: 'wellness' as const,
      requirements: [
        {
          type: 'action' as const,
          action: 'meditation_session',
          target: 1,
          description: 'Complete a 5-minute mindfulness session',
        },
      ],
    },
    {
      title: 'Mood Check-In',
      description: 'Log your mood and emotions for today',
      category: 'self-care' as const,
      requirements: [
        {
          type: 'action' as const,
          action: 'mood_log',
          target: 1,
          description: 'Record your mood for today',
        },
      ],
    },
    {
      title: 'Gratitude Practice',
      description: 'Write down three things you\'re grateful for',
      category: 'growth' as const,
      requirements: [
        {
          type: 'action' as const,
          action: 'gratitude_log',
          target: 1,
          description: 'Complete a gratitude exercise',
        },
      ],
    },
    {
      title: 'Self-Care Activity',
      description: 'Do something kind for yourself today',
      category: 'self-care' as const,
      requirements: [
        {
          type: 'action' as const,
          action: 'activity_complete',
          target: 1,
          description: 'Complete a self-care activity',
        },
      ],
    },
  ];
  
  // Select and customize challenges based on difficulty
  const selectedChallenges = baseChallenges.slice(0, difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
  
  selectedChallenges.forEach((baseChallenge, index) => {
    const xpReward = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
    const pointsReward = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 40 : 60;
    
    challenges.push({
      id: `daily_${today.getDate()}_${index}`,
      title: baseChallenge.title,
      description: baseChallenge.description,
      type: 'daily',
      difficulty,
      status: 'available',
      icon: '🎯',
      iconColor: '#3B82F6',
      xpReward,
      pointsReward,
      requirements: baseChallenge.requirements,
      startDate: today,
      endDate: tomorrow,
      category: baseChallenge.category,
      progress: 0,
    });
  });
  
  return challenges;
}

/**
 * Update challenge progress based on activity
 */
export function updateChallengeProgress(
  challenge: Challenge,
  activity: ActivityEntry
): Challenge {
  if (challenge.status !== 'active') {
    return challenge;
  }
  
  const updatedRequirements = challenge.requirements.map(req => {
    if (req.type === 'action' && req.action === activity.type) {
      const newProgress = (req.progress || 0) + 1;
      return {
        ...req,
        progress: newProgress,
        completed: newProgress >= req.target,
      };
    }
    return req;
  });
  
  const totalProgress = updatedRequirements.reduce((sum, req) => {
    return sum + ((req.progress || 0) / req.target) * 100;
  }, 0) / updatedRequirements.length;
  
  const allCompleted = updatedRequirements.every(req => req.completed);
  
  return {
    ...challenge,
    requirements: updatedRequirements,
    progress: Math.round(totalProgress),
    status: allCompleted ? 'completed' : challenge.status,
    completedAt: allCompleted ? new Date() : challenge.completedAt,
  };
}

/**
 * Validate gamification data for mental health appropriateness
 */
export function validateGamificationData(data: any): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check for potentially harmful competitive elements
  if (data.competitiveRankings) {
    warnings.push('Competitive rankings may increase anxiety for some users');
    suggestions.push('Consider anonymous, personal progress tracking instead');
  }
  
  // Check for overwhelming achievement requirements
  if (data.achievements) {
    data.achievements.forEach((achievement: Achievement) => {
      achievement.requirements.forEach(req => {
        if (req.type === 'streak' && req.target > 30) {
          warnings.push(`Achievement "${achievement.title}" requires ${req.target}-day streak, which may be overwhelming`);
          suggestions.push('Consider breaking long streaks into smaller milestones');
        }
      });
    });
  }
  
  // Check for appropriate messaging
  if (data.challenges) {
    data.challenges.forEach((challenge: Challenge) => {
      if (challenge.description.toLowerCase().includes('beat') || 
          challenge.description.toLowerCase().includes('defeat')) {
        warnings.push(`Challenge "${challenge.title}" uses competitive language`);
        suggestions.push('Use supportive, growth-oriented language instead');
      }
    });
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Generate level information with mental health themes
 */
export function generateLevelInfo(level: number): LevelInfo {
  const themes = [
    { title: 'Seedling', description: 'Beginning your wellness journey' },
    { title: 'Sprout', description: 'Growing in self-awareness' },
    { title: 'Sapling', description: 'Developing healthy habits' },
    { title: 'Tree', description: 'Rooted in self-care practices' },
    { title: 'Oak', description: 'Strong and resilient' },
    { title: 'Redwood', description: 'Towering in wisdom and peace' },
  ];
  
  const themeIndex = Math.floor((level - 1) / 10);
  const theme = themes[Math.min(themeIndex, themes.length - 1)];
  
  return {
    level,
    title: `${theme.title} ${level}`,
    description: theme.description,
    xpRequired: calculateXPForLevel(level),
    xpTotal: calculateXPForLevel(level + 1),
    rewards: [
      {
        type: 'points',
        id: `level_${level}_points`,
        name: 'Wellness Points',
        description: `${level * 50} bonus points for reaching level ${level}`,
      },
    ],
    badgeIcon: '🌱',
    badgeColor: level <= 10 ? '#10B981' : level <= 30 ? '#3B82F6' : level <= 50 ? '#8B5CF6' : '#F59E0B',
  };
}

export default {
  calculateActivityXP,
  calculateLevelFromXP,
  calculateXPForLevel,
  calculateStreak,
  checkAchievementRequirements,
  generateDailyChallenges,
  updateChallengeProgress,
  validateGamificationData,
  generateLevelInfo,
  BASE_XP_VALUES,
  WELLBEING_MULTIPLIERS,
};