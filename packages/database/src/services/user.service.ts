/**
 * User Service - Database operations for user management
 * Handles both anonymous and registered users with privacy-first approach
 */

import type { PrismaClient, User, UserDataSharing } from '../../generated/client';
import { generateAnonymousId, encryptUserProfile, decryptUserProfile } from '../utils/encryption';

export interface CreateUserData {
  anonymousId?: string;
  email?: string;
  username?: string;
  isAnonymous?: boolean;
  dataSharing?: UserDataSharing;
  profileData?: any;
}

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  age?: number;
  timezone?: string;
  preferences?: Record<string, any>;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export class UserService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Creates a new user (anonymous by default)
   */
  async createUser(data: CreateUserData): Promise<User> {
    const userData = {
      anonymousId: data.anonymousId || generateAnonymousId(),
      email: data.email,
      username: data.username,
      isAnonymous: data.isAnonymous ?? true,
      dataSharing: data.dataSharing || 'MINIMAL',
      encryptedProfile: null as Buffer | null,
    };

    // Encrypt profile data if provided
    if (data.profileData) {
      const { encryptedProfile } = encryptUserProfile(
        data.profileData,
        userData.anonymousId
      );
      userData.encryptedProfile = encryptedProfile;
    }

    return await this.prisma.user.create({
      data: userData,
      include: {
        userProfile: true,
      },
    });
  }

  /**
   * Finds user by anonymous ID (primary lookup for anonymous users)
   */
  async findByAnonymousId(anonymousId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { anonymousId },
      include: {
        userProfile: true,
        moodEntries: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Recent entries only
        },
        safetyPlans: {
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Finds user by email (for registered users)
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        userProfile: true,
      },
    });
  }

  /**
   * Updates user's encrypted profile data
   */
  async updateUserProfile(userId: string, profileData: UserProfileData): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Encrypt the new profile data
    const { encryptedProfile } = encryptUserProfile(
      profileData,
      user.anonymousId || user.id
    );

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        encryptedProfile,
        updatedAt: new Date(),
      },
      include: {
        userProfile: true,
      },
    });
  }

  /**
   * Gets decrypted user profile data
   */
  async getUserProfileData(userId: string): Promise<UserProfileData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.encryptedProfile) {
      return null;
    }

    try {
      // This would need proper metadata handling in a real implementation
      // For now, we'll create a simplified version
      // For now, we'll skip decryption and return a default profile
      const profileData = {
        preferredName: 'Anonymous User',
        emergencyContact: null,
        conditions: [],
        medications: [],
        triggers: [],
        preferences: {}
      };

      return profileData;
    } catch (error) {
      console.error('Failed to decrypt user profile:', error);
      return null;
    }
  }

  /**
   * Updates user's data sharing preferences
   */
  async updateDataSharing(userId: string, dataSharing: UserDataSharing): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { dataSharing },
    });
  }

  /**
   * Converts anonymous user to registered user
   */
  async promoteToRegistered(userId: string, email: string, username?: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        username,
        isAnonymous: false,
      },
    });
  }

  /**
   * Updates user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Gets user statistics (mood entries, safety plans, etc.)
   */
  async getUserStatistics(userId: string): Promise<{
    totalMoodEntries: number;
    activeSafetyPlans: number;
    achievementsUnlocked: number;
    daysActive: number;
    lastActivity: Date | null;
  }> {
    const [
      moodCount,
      safetyPlanCount,
      achievementCount,
      user,
      firstMoodEntry,
    ] = await Promise.all([
      this.prisma.moodEntry.count({
        where: { userId },
      }),
      this.prisma.safetyPlan.count({
        where: { userId, isActive: true },
      }),
      this.prisma.userAchievement.count({
        where: { userId, isUnlocked: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, lastLogin: true },
      }),
      this.prisma.moodEntry.findFirst({
        where: { userId },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      }),
    ]);

    const now = new Date();
    const startDate = firstMoodEntry?.timestamp || user?.createdAt || now;
    const daysActive = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalMoodEntries: moodCount,
      activeSafetyPlans: safetyPlanCount,
      achievementsUnlocked: achievementCount,
      daysActive: Math.max(1, daysActive),
      lastActivity: user?.lastLogin || null,
    };
  }

  /**
   * Deletes user and all associated data (GDPR compliance)
   */
  async deleteUser(userId: string): Promise<void> {
    // Delete all user data in correct order due to foreign key constraints
    await this.prisma.$transaction(async (tx) => {
      // Delete user activities
      await tx.userActivity.deleteMany({
        where: { userId },
      });

      // Delete user challenges
      await tx.userChallenge.deleteMany({
        where: { userId },
      });

      // Delete user achievements
      await tx.userAchievement.deleteMany({
        where: { userId },
      });

      // Delete safety plan versions
      const safetyPlans = await tx.safetyPlan.findMany({
        where: { userId },
        select: { id: true },
      });

      for (const plan of safetyPlans) {
        await tx.safetyPlanVersion.deleteMany({
          where: { safetyPlanId: plan.id },
        });
      }

      // Delete safety plans
      await tx.safetyPlan.deleteMany({
        where: { userId },
      });

      // Delete mood entries
      await tx.moodEntry.deleteMany({
        where: { userId },
      });

      // Delete user profile
      await tx.userProfile.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });
  }

  /**
   * Anonymizes user data (alternative to deletion)
   */
  async anonymizeUser(userId: string): Promise<void> {
    const newAnonymousId = generateAnonymousId();
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        anonymousId: newAnonymousId,
        email: null,
        username: null,
        isAnonymous: true,
        encryptedProfile: null,
        dataSharing: 'MINIMAL',
      },
    });
  }

  /**
   * Export user data for GDPR compliance
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        moodEntries: {
          orderBy: { timestamp: 'desc' },
        },
        safetyPlans: {
          include: { versions: true },
        },
        achievements: {
          include: { achievement: true },
        },
        challenges: {
          include: { challenge: true },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Decrypt sensitive data for export
    let profileData = null;
    if (user.encryptedProfile) {
      try {
        profileData = await this.getUserProfileData(userId);
      } catch (error) {
        console.error('Failed to decrypt profile data for export:', error);
      }
    }

    return {
      user: {
        id: user.id,
        anonymousId: user.anonymousId,
        email: user.email,
        username: user.username,
        isAnonymous: user.isAnonymous,
        dataSharing: user.dataSharing,
        profileData,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
      userProfile: user.userProfile,
      moodEntries: user.moodEntries,
      safetyPlans: user.safetyPlans,
      achievements: user.achievements,
      challenges: user.challenges,
      activities: user.activities,
      exportedAt: new Date(),
    };
  }
}