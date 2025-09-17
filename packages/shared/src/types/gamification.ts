/**
 * Comprehensive Gamification Types for ASTRAL CORE V2
 * Mental Health Platform - Xbox/PlayStation-style Gaming Elements
 * 
 * Designed with mental health best practices:
 * - No competitive pressure
 * - Focus on personal growth
 * - Positive reinforcement only
 * - Privacy-first approach
 */

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  avatarId?: string;
  joinDate: Date;
  lastActiveDate: Date;
  preferences: GamificationPreferences;
  stats: UserStats;
}

export interface GamificationPreferences {
  enabled: boolean;
  showLeaderboards: boolean;
  shareProgress: boolean;
  enableNotifications: boolean;
  reducedMotion: boolean;
  colorBlindFriendly: boolean;
  soundEnabled: boolean;
}

export interface UserStats {
  totalDaysActive: number;
  currentStreak: number;
  longestStreak: number;
  totalMoodEntries: number;
  totalActivities: number;
  completedChallenges: number;
  achievementsUnlocked: number;
  pointsEarned: number;
  hoursInApp: number;
  milestoneReached: number;
}

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory = 
  | 'self-care'
  | 'community' 
  | 'growth'
  | 'crisis-support'
  | 'wellness'
  | 'milestone'
  | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  iconColor: string;
  xpReward: number;
  pointsReward: number;
  requirements: AchievementRequirement[];
  isHidden: boolean;
  prerequisites?: string[]; // Other achievement IDs required
  unlockDate?: Date;
  progress?: number; // 0-100 percentage
  completed: boolean;
  unlockedAt?: Date;
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'time' | 'level' | 'points' | 'custom';
  target: number;
  metric: string; // e.g., 'moodEntries', 'consecutiveDays', 'minutesActive'
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
}

export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'special';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'available' | 'active' | 'completed' | 'expired' | 'locked';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  icon: string;
  iconColor: string;
  xpReward: number;
  pointsReward: number;
  requirements: ChallengeRequirement[];
  startDate: Date;
  endDate: Date;
  participants?: number;
  completions?: number;
  progress?: number; // 0-100 percentage
  completedAt?: Date;
  category: AchievementCategory;
}

export interface ChallengeRequirement {
  type: 'action' | 'count' | 'frequency' | 'duration';
  action?: string; // e.g., 'logMood', 'completeActivity', 'useFeature'
  target: number;
  description: string;
  completed?: boolean;
  progress?: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  description: string;
  xpRequired: number;
  xpTotal: number;
  rewards: LevelReward[];
  badgeIcon: string;
  badgeColor: string;
  unlockedFeatures?: string[];
}

export interface LevelReward {
  type: 'achievement' | 'points' | 'feature' | 'cosmetic';
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  type: 'mood_log' | 'activity_complete' | 'safety_plan' | 'therapy_session' | 'crisis_support' | 'community_help';
  timestamp: Date;
  xpEarned: number;
  pointsEarned: number;
  metadata?: Record<string, any>;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar?: string;
  score: number;
  level: number;
  streak?: number;
  lastActive: Date;
  isAnonymous: boolean;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'allTime';
  category: 'xp' | 'streak' | 'activities' | 'achievements';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  isAnonymous: boolean;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'level_up' | 'challenge' | 'streak' | 'milestone';
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  actionText?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface GamificationState {
  user: UserProfile | null;
  achievements: Achievement[];
  challenges: Challenge[];
  levels: LevelInfo[];
  recentActivity: ActivityEntry[];
  notifications: Notification[];
  leaderboards: Leaderboard[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export interface GamificationActions {
  // User Profile
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<GamificationPreferences>) => Promise<void>;
  
  // XP and Levels
  awardXP: (amount: number, reason: string, metadata?: Record<string, any>) => Promise<void>;
  awardPoints: (amount: number, reason: string) => Promise<void>;
  checkLevelUp: () => Promise<boolean>;
  
  // Achievements
  checkAchievements: (activity?: ActivityEntry) => Promise<Achievement[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  
  // Challenges
  activateChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  
  // Activities
  logActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => Promise<void>;
  
  // Notifications
  markNotificationRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Social Features
  joinLeaderboard: (leaderboardId: string, anonymous?: boolean) => Promise<void>;
  leaveLeaderboard: (leaderboardId: string) => Promise<void>;
  
  // Data Management
  syncData: () => Promise<void>;
  resetProgress: () => Promise<void>;
  exportData: () => Promise<string>;
}

// Xbox/PlayStation-style UI Theme Configuration
export interface GamificationTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    success: string;
    warning: string;
    error: string;
    text: string;
    textSecondary: string;
    border: string;
    rarities: {
      common: string;
      uncommon: string;
      rare: string;
      epic: string;
      legendary: string;
    };
    levels: string[];
  };
  gradients: {
    primary: string;
    secondary: string;
    achievement: string;
    level: string;
    challenge: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };
}

// Utility types for component props
export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  'data-testid'?: string;
}

export interface AnimatedComponentProps extends BaseComponentProps {
  animate?: boolean;
  delay?: number;
  duration?: number;
}

// Event types for analytics and tracking
export interface GamificationEvent {
  type: 'achievement_unlocked' | 'level_up' | 'challenge_completed' | 'xp_earned' | 'streak_extended';
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
  sessionId?: string;
}

// Configuration for the gamification system
export interface GamificationConfig {
  xpMultiplier: number;
  pointsMultiplier: number;
  levelingCurve: 'linear' | 'exponential' | 'logarithmic';
  maxLevel: number;
  streakProtection: {
    enabled: boolean;
    maxProtections: number;
    cooldownDays: number;
  };
  challengeRefresh: {
    daily: string; // cron expression
    weekly: string;
    monthly: string;
  };
  notifications: {
    maxPerDay: number;
    quietHours: {
      start: string;
      end: string;
    };
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
}

