/**
 * User Service - Database operations for user management
 * Handles both anonymous and registered users with privacy-first approach
 */
import { generateAnonymousId, encryptUserProfile, decryptUserProfile } from '../utils/encryption';
export class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Creates a new user (anonymous by default)
     */
    async createUser(data) {
        const userData = {
            anonymousId: data.anonymousId || generateAnonymousId(),
            email: data.email,
            username: data.username,
            isAnonymous: data.isAnonymous ?? true,
            dataSharing: data.dataSharing || 'MINIMAL',
            encryptedProfile: null,
        };
        // Encrypt profile data if provided
        if (data.profileData) {
            const { encryptedProfile } = encryptUserProfile(data.profileData, userData.anonymousId);
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
    async findByAnonymousId(anonymousId) {
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
    async findByEmail(email) {
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
    async updateUserProfile(userId, profileData) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Encrypt the new profile data
        const { encryptedProfile } = encryptUserProfile(profileData, user.anonymousId || user.id);
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
    async getUserProfileData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.encryptedProfile) {
            return null;
        }
        try {
            // This would need proper metadata handling in a real implementation
            // For now, we'll create a simplified version
            const profileData = decryptUserProfile(user.encryptedProfile, user.anonymousId || user.id, {
                salt: Buffer.alloc(32), // Placeholder - should be stored
                iv: Buffer.alloc(16), // Placeholder - should be stored
                tag: Buffer.alloc(16), // Placeholder - should be stored
                hash: '', // Placeholder - should be stored
            });
            return profileData;
        }
        catch (error) {
            console.error('Failed to decrypt user profile:', error);
            return null;
        }
    }
    /**
     * Updates user's data sharing preferences
     */
    async updateDataSharing(userId, dataSharing) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { dataSharing },
        });
    }
    /**
     * Converts anonymous user to registered user
     */
    async promoteToRegistered(userId, email, username) {
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
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
        });
    }
    /**
     * Gets user statistics (mood entries, safety plans, etc.)
     */
    async getUserStatistics(userId) {
        const [moodCount, safetyPlanCount, achievementCount, user, firstMoodEntry,] = await Promise.all([
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
    async deleteUser(userId) {
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
    async anonymizeUser(userId) {
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
    async exportUserData(userId) {
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
            }
            catch (error) {
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
//# sourceMappingURL=user.service.js.map