'use client';

/**
 * Gamification Context Provider for ASTRAL CORE V2
 * Xbox/PlayStation-style Mental Health Gaming System
 * 
 * Features:
 * - Comprehensive state management for gamification
 * - Mental health appropriate design patterns
 * - Accessibility-first implementation
 * - Privacy-focused social features
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  GamificationState,
  GamificationActions,
  GamificationTheme,
  UserProfile,
  Achievement,
  Challenge,
  ActivityEntry,
  LevelInfo,
  Notification,
  GamificationConfig,
  AchievementRarity,
  ChallengeType,
} from '@astralcore/shared/types/gamification';
import { UserProfileStorage, storeData, retrieveData } from '../lib/data-persistence';

// Xbox/PlayStation-inspired theme configuration
const DEFAULT_THEME: GamificationTheme = {
  colors: {
    primary: '#0078D4',      // Xbox Blue
    secondary: '#1B7CE8',    // PlayStation Blue
    accent: '#00BCF2',       // Cyan accent
    background: '#0D1117',   // Dark background
    surface: '#161B22',      // Card surfaces
    success: '#28A745',      // Achievement green
    warning: '#FFC107',      // Caution yellow
    error: '#DC3545',        // Error red
    text: '#F0F6FC',         // Primary text
    textSecondary: '#8B949E', // Secondary text
    border: '#30363D',       // Border color
    rarities: {
      common: '#6E7681',     // Gray
      uncommon: '#58A6FF',   // Blue
      rare: '#A5A5FF',       // Purple
      epic: '#FF7B72',       // Orange-red
      legendary: '#FFD700',  // Gold
    },
    levels: [
      '#6E7681', // Level 1-10: Gray
      '#58A6FF', // Level 11-20: Blue
      '#A5A5FF', // Level 21-30: Purple
      '#FF7B72', // Level 31-40: Orange
      '#FFD700', // Level 41-50: Gold
      '#FF6AC7', // Level 51+: Pink
    ],
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0078D4 0%, #1B7CE8 100%)',
    secondary: 'linear-gradient(135deg, #1B7CE8 0%, #00BCF2 100%)',
    achievement: 'linear-gradient(135deg, #28A745 0%, #20C997 100%)',
    level: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
    challenge: 'linear-gradient(135deg, #FF7B72 0%, #FF6B6B 100%)',
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(88, 166, 255, 0.3)',
  },
};

const DEFAULT_CONFIG: GamificationConfig = {
  xpMultiplier: 1.0,
  pointsMultiplier: 1.0,
  levelingCurve: 'exponential',
  maxLevel: 100,
  streakProtection: {
    enabled: true,
    maxProtections: 3,
    cooldownDays: 7,
  },
  challengeRefresh: {
    daily: '0 0 * * *',
    weekly: '0 0 * * 0',
    monthly: '0 0 1 * *',
  },
  notifications: {
    maxPerDay: 5,
    quietHours: {
      start: '22:00',
      end: '08:00',
    },
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: true,
  },
};

// Action types for the reducer
type GamificationActionType =
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'UPDATE_CHALLENGE'; payload: { id: string; updates: Partial<Challenge> } }
  | { type: 'ADD_ACTIVITY'; payload: ActivityEntry }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_SUCCESS'; payload: Date };

// Initial state
const initialState: GamificationState = {
  user: null,
  achievements: [],
  challenges: [],
  levels: [],
  recentActivity: [],
  notifications: [],
  leaderboards: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

// Reducer function
function gamificationReducer(state: GamificationState, action: GamificationActionType): GamificationState {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return { ...state, user: action.payload };
    
    case 'UPDATE_USER_PROFILE':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
    
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload.id ? action.payload : achievement
        ),
      };
    
    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload };
    
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload.id 
            ? { ...challenge, ...action.payload.updates }
            : challenge
        ),
      };
    
    case 'ADD_ACTIVITY':
      return {
        ...state,
        recentActivity: [action.payload, ...state.recentActivity].slice(0, 50),
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, read: true }
            : notification
        ),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SYNC_SUCCESS':
      return { ...state, lastSync: action.payload, error: null };
    
    default:
      return state;
  }
}

// Context interface
interface GamificationContextType {
  state: GamificationState;
  actions: GamificationActions;
  theme: GamificationTheme;
  config: GamificationConfig;
}

// Create context
const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider component props
interface GamificationProviderProps {
  children: React.ReactNode;
  theme?: Partial<GamificationTheme>;
  config?: Partial<GamificationConfig>;
}

// Provider component
export function GamificationProvider({ 
  children, 
  theme = {}, 
  config = {}
}: GamificationProviderProps) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Merge themes and configs
  const mergedTheme = useMemo(() => ({
    ...DEFAULT_THEME,
    ...theme,
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    gradients: { ...DEFAULT_THEME.gradients, ...theme.gradients },
    animations: { ...DEFAULT_THEME.animations, ...theme.animations },
    spacing: { ...DEFAULT_THEME.spacing, ...theme.spacing },
    borderRadius: { ...DEFAULT_THEME.borderRadius, ...theme.borderRadius },
    shadows: { ...DEFAULT_THEME.shadows, ...theme.shadows },
  }), [theme]);

  const mergedConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    streakProtection: { ...DEFAULT_CONFIG.streakProtection, ...config.streakProtection },
    challengeRefresh: { ...DEFAULT_CONFIG.challengeRefresh, ...config.challengeRefresh },
    notifications: { ...DEFAULT_CONFIG.notifications, ...config.notifications },
    accessibility: { ...DEFAULT_CONFIG.accessibility, ...config.accessibility },
  }), [config]);

  // Calculate XP required for level
  const calculateXPForLevel = useCallback((level: number): number => {
    switch (mergedConfig.levelingCurve) {
      case 'linear':
        return level * 1000;
      case 'logarithmic':
        return Math.floor(1000 * Math.log(level + 1) * 2);
      case 'exponential':
      default:
        return Math.floor(100 * Math.pow(level, 1.8));
    }
  }, [mergedConfig.levelingCurve]);

  // Award XP to user
  const awardXP = useCallback(async (amount: number, reason: string, metadata?: Record<string, any>) => {
    if (!state.user) return;

    const adjustedAmount = Math.floor(amount * mergedConfig.xpMultiplier);
    const newTotalXP = state.user.totalXP + adjustedAmount;
    const currentLevel = state.user.level;
    const nextLevelXP = calculateXPForLevel(currentLevel + 1);
    
    // Check for level up
    let newLevel = currentLevel;
    while (newTotalXP >= calculateXPForLevel(newLevel + 1) && newLevel < mergedConfig.maxLevel) {
      newLevel++;
    }

    // Update user profile
    dispatch({
      type: 'UPDATE_USER_PROFILE',
      payload: {
        totalXP: newTotalXP,
        level: newLevel,
        currentLevelXP: newTotalXP - calculateXPForLevel(newLevel),
        nextLevelXP: calculateXPForLevel(newLevel + 1) - calculateXPForLevel(newLevel),
      },
    });

    // Log activity
    const activity: ActivityEntry = {
      id: `activity_${Date.now()}`,
      userId: state.user.id,
      type: 'mood_log', // This would be dynamic based on the reason
      timestamp: new Date(),
      xpEarned: adjustedAmount,
      pointsEarned: 0,
      description: reason,
      metadata,
    };

    dispatch({ type: 'ADD_ACTIVITY', payload: activity });

    // Check for level up notification
    if (newLevel > currentLevel) {
      const notification: Notification = {
        id: `level_up_${Date.now()}`,
        type: 'level_up',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newLevel}!`,
        icon: '🎉',
        iconColor: mergedTheme.colors.success,
        timestamp: new Date(),
        read: false,
        data: { newLevel, previousLevel: currentLevel },
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }
  }, [state.user, mergedConfig.xpMultiplier, mergedConfig.maxLevel, calculateXPForLevel, mergedTheme.colors.success]);

  // Award points to user
  const awardPoints = useCallback(async (amount: number, reason: string) => {
    if (!state.user) return;

    const adjustedAmount = Math.floor(amount * mergedConfig.pointsMultiplier);
    
    dispatch({
      type: 'UPDATE_USER_PROFILE',
      payload: {
        stats: {
          ...state.user.stats,
          pointsEarned: state.user.stats.pointsEarned + adjustedAmount,
        },
      },
    });
  }, [state.user, mergedConfig.pointsMultiplier]);

  // Check for level up
  const checkLevelUp = useCallback(async (): Promise<boolean> => {
    if (!state.user) return false;

    const currentLevel = state.user.level;
    const nextLevelXP = calculateXPForLevel(currentLevel + 1);
    
    return state.user.totalXP >= nextLevelXP && currentLevel < mergedConfig.maxLevel;
  }, [state.user, calculateXPForLevel, mergedConfig.maxLevel]);

  // Initialize user data from session and localStorage
  useEffect(() => {
    const initializeUserData = async () => {
      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (!session?.user) {
        setIsLoading(false);
        setError('No active session found');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const userId = session.user.id;
        
        // Try to load existing user profile from localStorage
        let userProfile = UserProfileStorage.load(userId);
        
        // If no profile exists, create a new one
        if (!userProfile) {
          userProfile = {
            id: userId,
            username: session.user.name || `user_${userId.slice(-6)}`,
            displayName: session.user.isAnonymous 
              ? 'Wellness Seeker' 
              : session.user.name || 'Wellness Warrior',
            level: 1,
            totalXP: 0,
            currentLevelXP: 0,
            nextLevelXP: calculateXPForLevel(1),
            joinDate: new Date(),
            lastActiveDate: new Date(),
            preferences: {
              enabled: true,
              showLeaderboards: false, // Privacy-first default
              shareProgress: false,     // Privacy-first default
              enableNotifications: !session.user.isAnonymous, // Disable for anonymous
              reducedMotion: false,
              colorBlindFriendly: false,
              soundEnabled: true,
            },
            stats: {
              totalDaysActive: 0,
              currentStreak: 0,
              longestStreak: 0,
              totalMoodEntries: 0,
              totalActivities: 0,
              completedChallenges: 0,
              achievementsUnlocked: 0,
              pointsEarned: 0,
              hoursInApp: 0,
              milestoneReached: 0,
            },
          };
          
          // Save the new profile
          UserProfileStorage.save(userProfile, userId);
        } else {
          // Update last active date for existing users
          userProfile.lastActiveDate = new Date();
          UserProfileStorage.save(userProfile, userId);
        }

        dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize user data:', err);
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, [session, status, calculateXPForLevel]);

  // Actions object
  const actions: GamificationActions = {
    updateUserProfile: async (updates) => {
      if (!session?.user?.id) return;
      
      dispatch({ type: 'UPDATE_USER_PROFILE', payload: updates });
      
      // Persist to localStorage
      const currentProfile = state.user;
      if (currentProfile) {
        const updatedProfile = { 
          ...currentProfile, 
          ...updates,
          // Keep displayName optional - don't force empty string for anonymous users
          displayName: updates.displayName !== undefined ? updates.displayName : currentProfile.displayName
        };
        UserProfileStorage.save(updatedProfile, session.user.id);
      }
    },
    
    updatePreferences: async (preferences) => {
      if (!state.user || !session?.user?.id) return;
      
      const updatedProfile = {
        ...state.user,
        preferences: { ...state.user.preferences, ...preferences },
      };
      
      dispatch({
        type: 'UPDATE_USER_PROFILE',
        payload: {
          preferences: updatedProfile.preferences,
        },
      });
      
      // Persist to localStorage
      UserProfileStorage.save(updatedProfile, session.user.id);
    },
    
    awardXP,
    awardPoints,
    checkLevelUp,
    
    checkAchievements: async (activity) => {
      // This would contain the achievement checking logic
      return [];
    },
    
    unlockAchievement: async (achievementId) => {
      // Implementation for unlocking achievements
    },
    
    activateChallenge: async (challengeId) => {
      // Implementation for activating challenges
    },
    
    updateChallengeProgress: async (challengeId, progress) => {
      dispatch({
        type: 'UPDATE_CHALLENGE',
        payload: { id: challengeId, updates: { progress } },
      });
    },
    
    completeChallenge: async (challengeId) => {
      // Implementation for completing challenges
    },
    
    logActivity: async (activity) => {
      const fullActivity: ActivityEntry = {
        ...activity,
        id: `activity_${Date.now()}`,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: fullActivity });
    },
    
    markNotificationRead: async (notificationId) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    },
    
    clearAllNotifications: async () => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },
    
    joinLeaderboard: async (leaderboardId, anonymous = true) => {
      // Implementation for joining leaderboards
    },
    
    leaveLeaderboard: async (leaderboardId) => {
      // Implementation for leaving leaderboards
    },
    
    syncData: async () => {
      if (!session?.user?.id) return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Refresh user profile from localStorage
        const savedProfile = UserProfileStorage.load(session.user.id);
        if (savedProfile) {
          dispatch({ type: 'SET_USER_PROFILE', payload: savedProfile });
        }
        
        dispatch({ type: 'SYNC_SUCCESS', payload: new Date() });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sync failed' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    
    resetProgress: async () => {
      // Implementation for resetting progress
    },
    
    exportData: async () => {
      if (!session?.user?.id) return JSON.stringify({}, null, 2);
      
      // Export all user data from localStorage
      const { exportUserData } = await import('../lib/data-persistence');
      const exportedData = exportUserData(session.user.id);
      return JSON.stringify(exportedData, null, 2);
    },
  };

  const contextValue: GamificationContextType = {
    state: {
      ...state,
      isLoading: isLoading || state.isLoading,
      error: error || state.error,
    },
    actions,
    theme: mergedTheme,
    config: mergedConfig,
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

// Hook to use the gamification context
export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

// Export types and utilities
export type { GamificationContextType };
export { DEFAULT_THEME, DEFAULT_CONFIG };