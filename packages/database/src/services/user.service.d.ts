/**
 * User Service - Database operations for user management
 * Handles both anonymous and registered users with privacy-first approach
 */
import type { PrismaClient, User, UserDataSharing } from '../../generated/client';
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
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Creates a new user (anonymous by default)
     */
    createUser(data: CreateUserData): Promise<User>;
    /**
     * Finds user by anonymous ID (primary lookup for anonymous users)
     */
    findByAnonymousId(anonymousId: string): Promise<User | null>;
    /**
     * Finds user by email (for registered users)
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Updates user's encrypted profile data
     */
    updateUserProfile(userId: string, profileData: UserProfileData): Promise<User>;
    /**
     * Gets decrypted user profile data
     */
    getUserProfileData(userId: string): Promise<UserProfileData | null>;
    /**
     * Updates user's data sharing preferences
     */
    updateDataSharing(userId: string, dataSharing: UserDataSharing): Promise<User>;
    /**
     * Converts anonymous user to registered user
     */
    promoteToRegistered(userId: string, email: string, username?: string): Promise<User>;
    /**
     * Updates user's last login timestamp
     */
    updateLastLogin(userId: string): Promise<void>;
    /**
     * Gets user statistics (mood entries, safety plans, etc.)
     */
    getUserStatistics(userId: string): Promise<{
        totalMoodEntries: number;
        activeSafetyPlans: number;
        achievementsUnlocked: number;
        daysActive: number;
        lastActivity: Date | null;
    }>;
    /**
     * Deletes user and all associated data (GDPR compliance)
     */
    deleteUser(userId: string): Promise<void>;
    /**
     * Anonymizes user data (alternative to deletion)
     */
    anonymizeUser(userId: string): Promise<void>;
    /**
     * Export user data for GDPR compliance
     */
    exportUserData(userId: string): Promise<any>;
}
//# sourceMappingURL=user.service.d.ts.map