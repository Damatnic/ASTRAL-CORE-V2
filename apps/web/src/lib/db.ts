// Import from the database package instead of @prisma/client directly
import { prisma as dbPrisma, PrismaClient } from '@astralcore/database'

// Use the prisma instance from the database package
export const prisma = dbPrisma

// Export commonly used enums (stubbed for now)
export enum ActivityType {
  MOOD_LOG = 'MOOD_LOG',
  SAFETY_PLAN_UPDATE = 'SAFETY_PLAN_UPDATE',
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
  LEVEL_UP = 'LEVEL_UP',
  COMMUNITY_INTERACTION = 'COMMUNITY_INTERACTION',
  SELF_CARE_ACTIVITY = 'SELF_CARE_ACTIVITY',
  CRISIS_RESOURCE_ACCESS = 'CRISIS_RESOURCE_ACCESS'
}

export enum BreathingTechnique {
  FOUR_SEVEN_EIGHT = 'FOUR_SEVEN_EIGHT',
  BOX_BREATHING = 'BOX_BREATHING',
  BELLY_BREATHING = 'BELLY_BREATHING',
  ALTERNATE_NOSTRIL = 'ALTERNATE_NOSTRIL',
  COHERENT = 'COHERENT',
  LION_BREATH = 'LION_BREATH',
  COOLING_BREATH = 'COOLING_BREATH',
  FIRE_BREATH = 'FIRE_BREATH'
}

export enum ExerciseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum GroundingType {
  SENSORY = 'SENSORY',
  PHYSICAL = 'PHYSICAL',
  MENTAL = 'MENTAL',
  SPIRITUAL = 'SPIRITUAL',
  CREATIVE = 'CREATIVE',
  MOVEMENT = 'MOVEMENT'
}

export enum GroundingCategory {
  PANIC_ATTACK = 'PANIC_ATTACK',
  DISSOCIATION = 'DISSOCIATION',
  FLASHBACK = 'FLASHBACK',
  ANXIETY = 'ANXIETY',
  ANGER = 'ANGER',
  OVERWHELM = 'OVERWHELM',
  TRAUMA_RESPONSE = 'TRAUMA_RESPONSE'
}

export enum EvidenceLevel {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  EMERGING = 'EMERGING'
}

// Export PrismaClient type for consistency
export { PrismaClient }

// Export services from database package
export { MoodService, UserService } from '@astralcore/database'

// Gamification types
export interface Achievement {
  id: string
  name: string
  description: string
  xpReward: number
  pointReward: number
  icon?: string
  rarity: AchievementRarity
  category: AchievementCategory
  completed?: boolean
  isHidden?: boolean
  progress?: number
  unlockedAt?: Date
}

export interface Challenge {
  id: string
  name: string
  description: string
  xpReward: number
  pointReward: number
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum AchievementCategory {
  MOOD_TRACKING = 'MOOD_TRACKING',
  CONSISTENCY = 'CONSISTENCY',
  SELF_CARE = 'SELF_CARE',
  CRISIS_MANAGEMENT = 'CRISIS_MANAGEMENT',
  COMMUNITY = 'COMMUNITY',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH',
  WELLNESS_MILESTONES = 'WELLNESS_MILESTONES'
}

export enum ChallengeType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  MILESTONE = 'MILESTONE',
  COMMUNITY = 'COMMUNITY',
  SEASONAL = 'SEASONAL'
}

export enum ChallengeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  LOCKED = 'LOCKED'
}

// Gamification context types
export interface GamificationState {
  user: UserProfile | null;
  achievements: Achievement[];
  challenges: Challenge[];
  theme: GamificationTheme;
  isLoading: boolean;
  error: string | null;
}

export interface GamificationActions {
  unlockAchievement: (achievementId: string) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  addXP: (amount: number, source: string) => Promise<void>;
  awardXP: (amount: number, source: string, metadata?: any) => Promise<void>;
  logActivity: (activity: any) => Promise<void>;
  setTheme: (theme: GamificationTheme) => void;
}

export interface UserProfile {
  id: string;
  name?: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  currentLevelXP?: number;
  nextLevelXP?: number;
  stats?: {
    achievementsUnlocked: number;
    challengesCompleted: number;
    currentStreak: number;
    pointsEarned?: number;
  };
}

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
    rarities: Record<string, string>;
    levels: string[];
  };
  gradients: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  effects: Record<string, string>;
  animations: Record<string, Record<string, any>>;
}

// Additional interfaces for gamification context
export interface ActivityEntry {
  id: string;
  userId: string;
  type: ActivityType;
  xpEarned: number;
  timestamp: Date;
  metadata?: any;
}

export interface LevelInfo {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  rewards: string[];
}

export interface Notification {
  id: string;
  type: 'achievement' | 'level_up' | 'challenge' | 'streak';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
}

export interface GamificationConfig {
  xpMultiplier: number;
  streakBonus: number;
  achievementPoints: Record<AchievementRarity, number>;
  levelThresholds: LevelInfo[];
}

// Gamification utilities
export function calculateActivityXP(type: ActivityType): number {
  const xpMap: Record<ActivityType, number> = {
    [ActivityType.MOOD_LOG]: 10,
    [ActivityType.SAFETY_PLAN_UPDATE]: 50,
    [ActivityType.ACHIEVEMENT_UNLOCK]: 25,
    [ActivityType.CHALLENGE_COMPLETE]: 30,
    [ActivityType.LEVEL_UP]: 100,
    [ActivityType.COMMUNITY_INTERACTION]: 15,
    [ActivityType.SELF_CARE_ACTIVITY]: 20,
    [ActivityType.CRISIS_RESOURCE_ACCESS]: 35
  }
  return xpMap[type] || 10
}

export function getRarityColor(rarity: AchievementRarity): string {
  const colorMap: Record<AchievementRarity, string> = {
    [AchievementRarity.COMMON]: '#6B7280',
    [AchievementRarity.UNCOMMON]: '#10B981',
    [AchievementRarity.RARE]: '#3B82F6',
    [AchievementRarity.EPIC]: '#8B5CF6',
    [AchievementRarity.LEGENDARY]: '#F59E0B'
  }
  return colorMap[rarity]
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
  return xp.toString()
}

export default prisma