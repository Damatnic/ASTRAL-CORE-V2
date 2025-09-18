export const __esModule: boolean;
export namespace Prisma {
    let TransactionIsolationLevel: any;
    namespace CrisisSessionScalarFieldEnum {
        let id: string;
        let sessionToken: string;
        let anonymousId: string;
        let severity: string;
        let status: string;
        let responderId: string;
        let startedAt: string;
        let endedAt: string;
        let responseTimeMs: string;
        let outcome: string;
        let encryptedData: string;
        let keyDerivationSalt: string;
        let handoffTime: string;
        let resolutionTime: string;
        let emergencyTriggered: string;
        let escalatedAt: string;
        let escalationType: string;
    }
    namespace CrisisMessageScalarFieldEnum {
        let id_1: string;
        export { id_1 as id };
        export let sessionId: string;
        export let senderType: string;
        export let senderId: string;
        export let encryptedContent: string;
        export let messageHash: string;
        export let timestamp: string;
        export let messageType: string;
        export let priority: string;
        export let sentimentScore: string;
        export let riskScore: string;
        export let riskLevel: string;
        export let keywordsDetected: string;
    }
    namespace CrisisEscalationScalarFieldEnum {
        let id_2: string;
        export { id_2 as id };
        let sessionId_1: string;
        export { sessionId_1 as sessionId };
        export let triggeredBy: string;
        let severity_1: string;
        export { severity_1 as severity };
        export let reason: string;
        export let actionsTaken: string;
        export let emergencyContacted: string;
        export let lifeline988Called: string;
        export let triggeredAt: string;
        export let resolvedAt: string;
        export let responseTime: string;
        export let handledBy: string;
        let outcome_1: string;
        export { outcome_1 as outcome };
    }
    namespace TetherLinkScalarFieldEnum {
        let id_3: string;
        export { id_3 as id };
        export let seekerId: string;
        export let supporterId: string;
        export let strength: string;
        export let trustScore: string;
        export let established: string;
        export let lastActivity: string;
        export let pulseInterval: string;
        export let lastPulse: string;
        export let missedPulses: string;
        export let emergencyActive: string;
        export let emergencyType: string;
        export let lastEmergency: string;
        export let matchingScore: string;
        export let specialties: string;
        export let languages: string;
        export let timezone: string;
        export let dataSharing: string;
        export let locationSharing: string;
        export let emergencyContact: string;
        export let encryptedMeta: string;
    }
    namespace TetherPulseScalarFieldEnum {
        let id_4: string;
        export { id_4 as id };
        export let tetherId: string;
        export let pulseType: string;
        let strength_1: string;
        export { strength_1 as strength };
        export let mood: string;
        let status_1: string;
        export { status_1 as status };
        export let message: string;
        export let emergencySignal: string;
        export let urgencyLevel: string;
        let timestamp_1: string;
        export { timestamp_1 as timestamp };
        export let acknowledged: string;
        export let acknowledgedAt: string;
    }
    namespace TetherEmergencyScalarFieldEnum {
        let id_5: string;
        export { id_5 as id };
        let tetherId_1: string;
        export { tetherId_1 as tetherId };
        export let triggerUserId: string;
        let emergencyType_1: string;
        export { emergencyType_1 as emergencyType };
        let severity_2: string;
        export { severity_2 as severity };
        export let description: string;
        export let location: string;
        let triggeredAt_1: string;
        export { triggeredAt_1 as triggeredAt };
        let acknowledgedAt_1: string;
        export { acknowledgedAt_1 as acknowledgedAt };
        export let respondedAt: string;
        let resolvedAt_1: string;
        export { resolvedAt_1 as resolvedAt };
        let responseTime_1: string;
        export { responseTime_1 as responseTime };
        let actionsTaken_1: string;
        export { actionsTaken_1 as actionsTaken };
        let outcome_2: string;
        export { outcome_2 as outcome };
        export let helpersNotified: string;
        export let emergencyContacts: string;
    }
    namespace VolunteerScalarFieldEnum {
        let id_6: string;
        export { id_6 as id };
        let anonymousId_1: string;
        export { anonymousId_1 as anonymousId };
        let status_2: string;
        export { status_2 as status };
        export let trainingHours: string;
        export let certifications: string;
        export let specializations: string;
        let languages_1: string;
        export { languages_1 as languages };
        export let backgroundCheck: string;
        export let sessionsCount: string;
        export let hoursVolunteered: string;
        export let averageRating: string;
        export let responseRate: string;
        export let isActive: string;
        export let currentLoad: string;
        export let maxConcurrent: string;
        export let schedule: string;
        let timezone_1: string;
        export { timezone_1 as timezone };
        export let lastActive: string;
        export let burnoutScore: string;
        export let needsSupport: string;
        export let emergencyResponder: string;
        export let emergencyAvailable: string;
    }
    namespace VolunteerTrainingScalarFieldEnum {
        let id_7: string;
        export { id_7 as id };
        export let volunteerId: string;
        export let moduleId: string;
        let status_3: string;
        export { status_3 as status };
        let startedAt_1: string;
        export { startedAt_1 as startedAt };
        export let completedAt: string;
        export let score: string;
        export let passingScore: string;
        export let attempts: string;
        export let moduleTitle: string;
        export let moduleType: string;
        export let duration: string;
        export let content: string;
    }
    namespace VolunteerSessionScalarFieldEnum {
        let id_8: string;
        export { id_8 as id };
        let volunteerId_1: string;
        export { volunteerId_1 as volunteerId };
        export let sessionType: string;
        let startedAt_2: string;
        export { startedAt_2 as startedAt };
        let endedAt_1: string;
        export { endedAt_1 as endedAt };
        let duration_1: string;
        export { duration_1 as duration };
        export let crisisSessionId: string;
        let responseTime_2: string;
        export { responseTime_2 as responseTime };
        export let userSatisfaction: string;
        let outcome_3: string;
        export { outcome_3 as outcome };
    }
    namespace VolunteerFeedbackScalarFieldEnum {
        let id_9: string;
        export { id_9 as id };
        let volunteerId_2: string;
        export { volunteerId_2 as volunteerId };
        let sessionId_2: string;
        export { sessionId_2 as sessionId };
        export let feedbackType: string;
        export let rating: string;
        export let comment: string;
        export let submittedBy: string;
        export let sourceType: string;
        export let submittedAt: string;
        export let isAnonymous: string;
        export let isApproved: string;
        export let moderatedAt: string;
        export let moderatedBy: string;
    }
    namespace CrisisResourceUsageScalarFieldEnum {
        let id_10: string;
        export { id_10 as id };
        let sessionId_3: string;
        export { sessionId_3 as sessionId };
        export let resourceId: string;
        export let accessedAt: string;
        export let timeSpent: string;
        export let wasHelpful: string;
        export let helpfulRating: string;
        export let resourceTitle: string;
        export let resourceType: string;
    }
    namespace SafetyReportScalarFieldEnum {
        let id_11: string;
        export { id_11 as id };
        let sessionId_4: string;
        export { sessionId_4 as sessionId };
        export let messageId: string;
        export let reportType: string;
        let severity_3: string;
        export { severity_3 as severity };
        let status_4: string;
        export { status_4 as status };
        let content_1: string;
        export { content_1 as content };
        let reason_1: string;
        export { reason_1 as reason };
        export let confidence: string;
        export let aiAnalysis: string;
        export let keywordsMatched: string;
        let riskScore_1: string;
        export { riskScore_1 as riskScore };
        export let reviewedBy: string;
        export let reviewedAt: string;
        export let reviewNotes: string;
        export let createdAt: string;
        export let updatedAt: string;
    }
    namespace AuditLogScalarFieldEnum {
        let id_12: string;
        export { id_12 as id };
        export let userId: string;
        export let action: string;
        export let resource: string;
        let resourceId_1: string;
        export { resourceId_1 as resourceId };
        export let details: string;
        export let ipAddress: string;
        export let userAgent: string;
        export let success: string;
        export let errorMessage: string;
        let timestamp_2: string;
        export { timestamp_2 as timestamp };
        let sessionId_5: string;
        export { sessionId_5 as sessionId };
    }
    namespace AnalyticsEventScalarFieldEnum {
        let id_13: string;
        export { id_13 as id };
        export let eventType: string;
        export let eventName: string;
        export let userHash: string;
        let sessionId_6: string;
        export { sessionId_6 as sessionId };
        export let properties: string;
        let timestamp_3: string;
        export { timestamp_3 as timestamp };
        let responseTime_3: string;
        export { responseTime_3 as responseTime };
        let success_1: string;
        export { success_1 as success };
        export let errorCode: string;
    }
    namespace PerformanceMetricScalarFieldEnum {
        let id_14: string;
        export { id_14 as id };
        export let metricType: string;
        export let value: string;
        export let unit: string;
        export let endpoint: string;
        export let region: string;
        let timestamp_4: string;
        export { timestamp_4 as timestamp };
        export let target: string;
        export let threshold: string;
        let status_5: string;
        export { status_5 as status };
    }
    namespace SystemHealthScalarFieldEnum {
        let id_15: string;
        export { id_15 as id };
        export let component: string;
        let status_6: string;
        export { status_6 as status };
        let responseTime_4: string;
        export { responseTime_4 as responseTime };
        export let uptime: string;
        export let errorRate: string;
        export let lastError: string;
        let errorMessage_1: string;
        export { errorMessage_1 as errorMessage };
        export let cpuUsage: string;
        export let memoryUsage: string;
        export let diskUsage: string;
        let timestamp_5: string;
        export { timestamp_5 as timestamp };
    }
    namespace CrisisResourceScalarFieldEnum {
        let id_16: string;
        export { id_16 as id };
        export let title: string;
        let description_1: string;
        export { description_1 as description };
        export let category: string;
        export let phoneNumber: string;
        export let url: string;
        export let email: string;
        export let textNumber: string;
        let content_2: string;
        export { content_2 as content };
        export let instructions: string;
        export let available24_7: string;
        let languages_2: string;
        export { languages_2 as languages };
        export let countries: string;
        export let regions: string;
        let priority_1: string;
        export { priority_1 as priority };
        export let isEmergency: string;
        export let severityMin: string;
        export let tags: string;
        let isActive_1: string;
        export { isActive_1 as isActive };
        let createdAt_1: string;
        export { createdAt_1 as createdAt };
        let updatedAt_1: string;
        export { updatedAt_1 as updatedAt };
    }
    namespace PublicMetricsScalarFieldEnum {
        let id_17: string;
        export { id_17 as id };
        export let metricName: string;
        let value_1: string;
        export { value_1 as value };
        export let displayValue: string;
        let description_2: string;
        export { description_2 as description };
        export let isPublic: string;
        export let displayOrder: string;
        export let icon: string;
        export let color: string;
        export let lastUpdated: string;
        export let updateFrequency: string;
    }
    namespace EmergencyContactScalarFieldEnum {
        let id_18: string;
        export { id_18 as id };
        let userId_1: string;
        export { userId_1 as userId };
        export let encryptedName: string;
        export let encryptedPhone: string;
        export let encryptedEmail: string;
        export let relationship: string;
        let priority_2: string;
        export { priority_2 as priority };
        export let contactMethod: string;
        let timezone_2: string;
        export { timezone_2 as timezone };
        export let availableHours: string;
        export let preferredMethod: string;
        export let autoNotify: string;
        export let crisisOnly: string;
        export let hasConsent: string;
        export let consentDate: string;
        let keyDerivationSalt_1: string;
        export { keyDerivationSalt_1 as keyDerivationSalt };
        export let isVerified: string;
        export let verifiedAt: string;
        let isActive_2: string;
        export { isActive_2 as isActive };
        let createdAt_2: string;
        export { createdAt_2 as createdAt };
        let updatedAt_2: string;
        export { updatedAt_2 as updatedAt };
        export let lastContacted: string;
    }
    namespace EmergencyNotificationScalarFieldEnum {
        let id_19: string;
        export { id_19 as id };
        export let emergencyContactId: string;
        let sessionId_7: string;
        export { sessionId_7 as sessionId };
        export let tetherEmergencyId: string;
        export let notificationType: string;
        let severity_4: string;
        export { severity_4 as severity };
        let message_1: string;
        export { message_1 as message };
        export let sentAt: string;
        export let deliveredAt: string;
        let acknowledgedAt_2: string;
        export { acknowledgedAt_2 as acknowledgedAt };
        export let responseReceived: string;
        let responseTime_5: string;
        export { responseTime_5 as responseTime };
        export let method: string;
        let status_7: string;
        export { status_7 as status };
        let attempts_1: string;
        export { attempts_1 as attempts };
        export let maxAttempts: string;
        let errorMessage_2: string;
        export { errorMessage_2 as errorMessage };
        export let nextRetryAt: string;
    }
    namespace WebSocketConnectionScalarFieldEnum {
        let id_20: string;
        export { id_20 as id };
        let sessionId_8: string;
        export { sessionId_8 as sessionId };
        export let userType: string;
        let userId_2: string;
        export { userId_2 as userId };
        let isActive_3: string;
        export { isActive_3 as isActive };
        let createdAt_3: string;
        export { createdAt_3 as createdAt };
        let lastActivity_1: string;
        export { lastActivity_1 as lastActivity };
        export let expiresAt: string;
        let ipAddress_1: string;
        export { ipAddress_1 as ipAddress };
        let userAgent_1: string;
        export { userAgent_1 as userAgent };
    }
    namespace UserScalarFieldEnum {
        let id_21: string;
        export { id_21 as id };
        let anonymousId_2: string;
        export { anonymousId_2 as anonymousId };
        let email_1: string;
        export { email_1 as email };
        export let username: string;
        let isAnonymous_1: string;
        export { isAnonymous_1 as isAnonymous };
        export let lastLogin: string;
        let dataSharing_1: string;
        export { dataSharing_1 as dataSharing };
        export let allowAnalytics: string;
        export let dataRetentionDays: string;
        export let verificationStatus: string;
        export let professionalType: string;
        export let licenseNumber: string;
        let verifiedAt_1: string;
        export { verifiedAt_1 as verifiedAt };
        export let encryptedProfile: string;
        let createdAt_4: string;
        export { createdAt_4 as createdAt };
        let updatedAt_3: string;
        export { updatedAt_3 as updatedAt };
    }
    namespace MoodEntryScalarFieldEnum {
        let id_22: string;
        export { id_22 as id };
        let userId_3: string;
        export { userId_3 as userId };
        let mood_1: string;
        export { mood_1 as mood };
        export let emotions: string;
        export let triggers: string;
        export let activities: string;
        export let sleepHours: string;
        export let notes: string;
        export let weather: string;
        export let medication: string;
        export let socialInteraction: string;
        let timestamp_6: string;
        export { timestamp_6 as timestamp };
    }
    namespace SafetyPlanScalarFieldEnum {
        let id_23: string;
        export { id_23 as id };
        let userId_4: string;
        export { userId_4 as userId };
        let title_1: string;
        export { title_1 as title };
        export let version: string;
        let isActive_4: string;
        export { isActive_4 as isActive };
        let encryptedContent_1: string;
        export { encryptedContent_1 as encryptedContent };
        export let contentHash: string;
        export let sharedWith: string;
        export let emergencyShare: string;
        let createdAt_5: string;
        export { createdAt_5 as createdAt };
        let updatedAt_4: string;
        export { updatedAt_4 as updatedAt };
    }
    namespace SafetyPlanVersionScalarFieldEnum {
        let id_24: string;
        export { id_24 as id };
        export let safetyPlanId: string;
        let version_1: string;
        export { version_1 as version };
        export let changeLog: string;
        let encryptedContent_2: string;
        export { encryptedContent_2 as encryptedContent };
        let contentHash_1: string;
        export { contentHash_1 as contentHash };
        let createdAt_6: string;
        export { createdAt_6 as createdAt };
        export let createdBy: string;
    }
    namespace UserProfileScalarFieldEnum {
        let id_25: string;
        export { id_25 as id };
        let userId_5: string;
        export { userId_5 as userId };
        export let displayName: string;
        export let level: string;
        export let totalXP: string;
        export let preferences: string;
        export let stats: string;
        export let joinDate: string;
        export let lastActiveDate: string;
    }
    namespace AchievementScalarFieldEnum {
        let id_26: string;
        export { id_26 as id };
        export let name: string;
        let description_3: string;
        export { description_3 as description };
        let category_1: string;
        export { category_1 as category };
        export let rarity: string;
        export let requirements: string;
        export let xpReward: string;
        export let pointReward: string;
        let icon_1: string;
        export { icon_1 as icon };
        let color_1: string;
        export { color_1 as color };
        let isActive_5: string;
        export { isActive_5 as isActive };
    }
    namespace UserAchievementScalarFieldEnum {
        let id_27: string;
        export { id_27 as id };
        let userId_6: string;
        export { userId_6 as userId };
        export let achievementId: string;
        export let progress: string;
        export let isUnlocked: string;
        export let unlockedAt: string;
        let createdAt_7: string;
        export { createdAt_7 as createdAt };
    }
    namespace ChallengeScalarFieldEnum {
        let id_28: string;
        export { id_28 as id };
        let name_1: string;
        export { name_1 as name };
        let description_4: string;
        export { description_4 as description };
        export let type: string;
        export let difficulty: string;
        let requirements_1: string;
        export { requirements_1 as requirements };
        let duration_2: string;
        export { duration_2 as duration };
        let xpReward_1: string;
        export { xpReward_1 as xpReward };
        let pointReward_1: string;
        export { pointReward_1 as pointReward };
        export let startDate: string;
        export let endDate: string;
        let isActive_6: string;
        export { isActive_6 as isActive };
    }
    namespace UserChallengeScalarFieldEnum {
        let id_29: string;
        export { id_29 as id };
        let userId_7: string;
        export { userId_7 as userId };
        export let challengeId: string;
        let progress_1: string;
        export { progress_1 as progress };
        export let isCompleted: string;
        let completedAt_1: string;
        export { completedAt_1 as completedAt };
        let startedAt_3: string;
        export { startedAt_3 as startedAt };
        export let data: string;
    }
    namespace UserActivityScalarFieldEnum {
        let id_30: string;
        export { id_30 as id };
        let userId_8: string;
        export { userId_8 as userId };
        let type_1: string;
        export { type_1 as type };
        let description_5: string;
        export { description_5 as description };
        export let xpEarned: string;
        export let pointsEarned: string;
        export let metadata: string;
        let timestamp_7: string;
        export { timestamp_7 as timestamp };
    }
    namespace JournalEntryScalarFieldEnum {
        let id_31: string;
        export { id_31 as id };
        let userId_9: string;
        export { userId_9 as userId };
        let title_2: string;
        export { title_2 as title };
        export let promptId: string;
        export let promptText: string;
        export let entryType: string;
        let encryptedContent_3: string;
        export { encryptedContent_3 as encryptedContent };
        let contentHash_2: string;
        export { contentHash_2 as contentHash };
        let keyDerivationSalt_2: string;
        export { keyDerivationSalt_2 as keyDerivationSalt };
        let mood_2: string;
        export { mood_2 as mood };
        let sentimentScore_1: string;
        export { sentimentScore_1 as sentimentScore };
        let emotions_1: string;
        export { emotions_1 as emotions };
        let tags_1: string;
        export { tags_1 as tags };
        export let isPrivate: string;
        export let shareWithTherapist: string;
        export let wordCount: string;
        let createdAt_8: string;
        export { createdAt_8 as createdAt };
        let updatedAt_5: string;
        export { updatedAt_5 as updatedAt };
    }
    namespace BreathingExerciseScalarFieldEnum {
        let id_32: string;
        export { id_32 as id };
        let name_2: string;
        export { name_2 as name };
        let description_6: string;
        export { description_6 as description };
        export let technique: string;
        let difficulty_1: string;
        export { difficulty_1 as difficulty };
        export let inhaleSeconds: string;
        export let holdSeconds: string;
        export let exhaleSeconds: string;
        export let pauseSeconds: string;
        export let cyclesRecommended: string;
        let instructions_1: string;
        export { instructions_1 as instructions };
        export let visualGuideUrl: string;
        export let audioGuideUrl: string;
        export let benefits: string;
        export let bestFor: string;
        export let contraindications: string;
        let isActive_7: string;
        export { isActive_7 as isActive };
        let createdAt_9: string;
        export { createdAt_9 as createdAt };
    }
    namespace BreathingSessionScalarFieldEnum {
        let id_33: string;
        export { id_33 as id };
        let userId_10: string;
        export { userId_10 as userId };
        export let exerciseId: string;
        let startedAt_4: string;
        export { startedAt_4 as startedAt };
        let completedAt_2: string;
        export { completedAt_2 as completedAt };
        let duration_3: string;
        export { duration_3 as duration };
        export let cyclesCompleted: string;
        export let moodBefore: string;
        export let moodAfter: string;
        export let anxietyBefore: string;
        export let anxietyAfter: string;
        export let averageBreathRate: string;
        export let heartRateBefore: string;
        export let heartRateAfter: string;
        let wasHelpful_1: string;
        export { wasHelpful_1 as wasHelpful };
        let rating_1: string;
        export { rating_1 as rating };
        let notes_1: string;
        export { notes_1 as notes };
    }
    namespace GroundingTechniqueScalarFieldEnum {
        let id_34: string;
        export { id_34 as id };
        let name_3: string;
        export { name_3 as name };
        let description_7: string;
        export { description_7 as description };
        let type_2: string;
        export { type_2 as type };
        let category_2: string;
        export { category_2 as category };
        let instructions_2: string;
        export { instructions_2 as instructions };
        let duration_4: string;
        export { duration_4 as duration };
        export let materials: string;
        let audioGuideUrl_1: string;
        export { audioGuideUrl_1 as audioGuideUrl };
        export let videoGuideUrl: string;
        export let imageGuides: string;
        export let evidenceLevel: string;
        let bestFor_1: string;
        export { bestFor_1 as bestFor };
        let contraindications_1: string;
        export { contraindications_1 as contraindications };
        let isActive_8: string;
        export { isActive_8 as isActive };
        let createdAt_10: string;
        export { createdAt_10 as createdAt };
    }
    namespace GroundingSessionScalarFieldEnum {
        let id_35: string;
        export { id_35 as id };
        let userId_11: string;
        export { userId_11 as userId };
        export let techniqueId: string;
        let startedAt_5: string;
        export { startedAt_5 as startedAt };
        let completedAt_3: string;
        export { completedAt_3 as completedAt };
        let duration_5: string;
        export { duration_5 as duration };
        export let triggerType: string;
        export let severityBefore: string;
        export let severityAfter: string;
        export let panicBefore: string;
        export let panicAfter: string;
        export let dissociationBefore: string;
        export let dissociationAfter: string;
        export let stepsCompleted: string;
        export let completionRate: string;
        let wasHelpful_2: string;
        export { wasHelpful_2 as wasHelpful };
        let rating_2: string;
        export { rating_2 as rating };
        let notes_2: string;
        export { notes_2 as notes };
        export let wouldUseAgain: string;
    }
    namespace SelfHelpResourceScalarFieldEnum {
        let id_36: string;
        export { id_36 as id };
        let title_3: string;
        export { title_3 as title };
        let description_8: string;
        export { description_8 as description };
        let category_3: string;
        export { category_3 as category };
        let type_3: string;
        export { type_3 as type };
        let content_3: string;
        export { content_3 as content };
        let url_1: string;
        export { url_1 as url };
        export let mediaUrl: string;
        export let thumbnailUrl: string;
        let duration_6: string;
        export { duration_6 as duration };
        let difficulty_2: string;
        export { difficulty_2 as difficulty };
        let evidenceLevel_1: string;
        export { evidenceLevel_1 as evidenceLevel };
        let tags_2: string;
        export { tags_2 as tags };
        export let conditions: string;
        export let symptoms: string;
        export let viewCount: string;
        export let helpfulCount: string;
        let averageRating_1: string;
        export { averageRating_1 as averageRating };
        let isActive_9: string;
        export { isActive_9 as isActive };
        let createdAt_11: string;
        export { createdAt_11 as createdAt };
        let updatedAt_6: string;
        export { updatedAt_6 as updatedAt };
    }
    namespace SelfHelpInteractionScalarFieldEnum {
        let id_37: string;
        export { id_37 as id };
        let userId_12: string;
        export { userId_12 as userId };
        let resourceId_2: string;
        export { resourceId_2 as resourceId };
        export let interactionType: string;
        let startedAt_6: string;
        export { startedAt_6 as startedAt };
        let completedAt_4: string;
        export { completedAt_4 as completedAt };
        let duration_7: string;
        export { duration_7 as duration };
        let wasHelpful_3: string;
        export { wasHelpful_3 as wasHelpful };
        let rating_3: string;
        export { rating_3 as rating };
        let notes_3: string;
        export { notes_3 as notes };
        let moodBefore_1: string;
        export { moodBefore_1 as moodBefore };
        let moodAfter_1: string;
        export { moodAfter_1 as moodAfter };
    }
    namespace SortOrder {
        let asc: string;
        let desc: string;
    }
    namespace NullableJsonNullValueInput {
        import DbNull = Prisma.DbNull;
        export { DbNull };
        import JsonNull = Prisma.JsonNull;
        export { JsonNull };
    }
    namespace JsonNullValueInput {
        import JsonNull_1 = Prisma.JsonNull;
        export { JsonNull_1 as JsonNull };
    }
    namespace NullsOrder {
        let first: string;
        let last: string;
    }
    namespace JsonNullValueFilter {
        import DbNull_1 = Prisma.DbNull;
        export { DbNull_1 as DbNull };
        import JsonNull_2 = Prisma.JsonNull;
        export { JsonNull_2 as JsonNull };
        import AnyNull = Prisma.AnyNull;
        export { AnyNull };
    }
    namespace QueryMode {
        let _default: string;
        export { _default as default };
        export let insensitive: string;
    }
    namespace ModelName {
        let CrisisSession: string;
        let CrisisMessage: string;
        let CrisisEscalation: string;
        let TetherLink: string;
        let TetherPulse: string;
        let TetherEmergency: string;
        let Volunteer: string;
        let VolunteerTraining: string;
        let VolunteerSession: string;
        let VolunteerFeedback: string;
        let CrisisResourceUsage: string;
        let SafetyReport: string;
        let AuditLog: string;
        let AnalyticsEvent: string;
        let PerformanceMetric: string;
        let SystemHealth: string;
        let CrisisResource: string;
        let PublicMetrics: string;
        let EmergencyContact: string;
        let EmergencyNotification: string;
        let WebSocketConnection: string;
        let User: string;
        let MoodEntry: string;
        let SafetyPlan: string;
        let SafetyPlanVersion: string;
        let UserProfile: string;
        let Achievement: string;
        let UserAchievement: string;
        let Challenge: string;
        let UserChallenge: string;
        let UserActivity: string;
        let JournalEntry: string;
        let BreathingExercise: string;
        let BreathingSession: string;
        let GroundingTechnique: string;
        let GroundingSession: string;
        let SelfHelpResource: string;
        let SelfHelpInteraction: string;
    }
}
export namespace $Enums {
    namespace CrisisStatus {
        let ACTIVE: string;
        let ASSIGNED: string;
        let RESOLVED: string;
        let ESCALATED: string;
        let ABANDONED: string;
    }
    namespace EscalationType {
        let AUTOMATIC_KEYWORD: string;
        let MANUAL_VOLUNTEER: string;
        let USER_REQUEST: string;
        let SYSTEM_TIMEOUT: string;
        let EMERGENCY_SERVICES: string;
    }
    namespace MessageSender {
        let ANONYMOUS_USER: string;
        let VOLUNTEER: string;
        let SYSTEM: string;
        let AI_ASSISTANT: string;
    }
    namespace MessageType {
        let TEXT: string;
        let VOICE_NOTE: string;
        let IMAGE: string;
        let SYSTEM_MESSAGE: string;
        let RESOURCE_SHARE: string;
    }
    namespace MessagePriority {
        let LOW: string;
        let NORMAL: string;
        let HIGH: string;
        let URGENT: string;
        let EMERGENCY: string;
    }
    namespace EscalationTrigger {
        export let KEYWORD_DETECTION: string;
        export let SEVERITY_INCREASE: string;
        export let VOLUNTEER_REQUEST: string;
        let USER_REQUEST_1: string;
        export { USER_REQUEST_1 as USER_REQUEST };
        export let TIMEOUT: string;
        export let AI_ASSESSMENT: string;
    }
    namespace EscalationSeverity {
        export let MODERATE: string;
        let HIGH_1: string;
        export { HIGH_1 as HIGH };
        export let CRITICAL: string;
        let EMERGENCY_1: string;
        export { EMERGENCY_1 as EMERGENCY };
    }
    namespace EscalationOutcome {
        let RESOLVED_INTERNALLY: string;
        let REFERRED_TO_PROFESSIONAL: string;
        let EMERGENCY_SERVICES_CONTACTED: string;
        let USER_DISCONNECTED: string;
        let ONGOING: string;
    }
    namespace TetherDataSharing {
        export let MINIMAL: string;
        let MODERATE_1: string;
        export { MODERATE_1 as MODERATE };
        export let FULL: string;
    }
    namespace PulseType {
        export let HEARTBEAT: string;
        export let CHECK_IN: string;
        export let MOOD_UPDATE: string;
        let EMERGENCY_2: string;
        export { EMERGENCY_2 as EMERGENCY };
        export let CUSTOM: string;
    }
    namespace UserStatus {
        let NORMAL_1: string;
        export { NORMAL_1 as NORMAL };
        export let STRUGGLING: string;
        export let CRISIS: string;
        let EMERGENCY_3: string;
        export { EMERGENCY_3 as EMERGENCY };
        export let OFFLINE: string;
    }
    namespace UrgencyLevel {
        let LOW_1: string;
        export { LOW_1 as LOW };
        export let MEDIUM: string;
        let HIGH_2: string;
        export { HIGH_2 as HIGH };
        let CRITICAL_1: string;
        export { CRITICAL_1 as CRITICAL };
    }
    namespace EmergencyType {
        let MENTAL_HEALTH_CRISIS: string;
        let SELF_HARM_RISK: string;
        let SUICIDAL_IDEATION: string;
        let PANIC_ATTACK: string;
        let MEDICAL_EMERGENCY: string;
        let SAFETY_CONCERN: string;
    }
    namespace EmergencySeverity {
        let LOW_2: string;
        export { LOW_2 as LOW };
        let MEDIUM_1: string;
        export { MEDIUM_1 as MEDIUM };
        let HIGH_3: string;
        export { HIGH_3 as HIGH };
        let CRITICAL_2: string;
        export { CRITICAL_2 as CRITICAL };
        export let LIFE_THREATENING: string;
    }
    namespace EmergencyOutcome {
        let RESOLVED_1: string;
        export { RESOLVED_1 as RESOLVED };
        let ESCALATED_1: string;
        export { ESCALATED_1 as ESCALATED };
        let EMERGENCY_SERVICES_1: string;
        export { EMERGENCY_SERVICES_1 as EMERGENCY_SERVICES };
        let ONGOING_1: string;
        export { ONGOING_1 as ONGOING };
        export let USER_SAFE: string;
    }
    namespace VolunteerStatus {
        export let PENDING: string;
        export let TRAINING: string;
        export let BACKGROUND_CHECK: string;
        export let VERIFIED: string;
        let ACTIVE_1: string;
        export { ACTIVE_1 as ACTIVE };
        export let INACTIVE: string;
        export let SUSPENDED: string;
        export let REVOKED: string;
    }
    namespace VerificationStatus {
        let PENDING_1: string;
        export { PENDING_1 as PENDING };
        export let IN_PROGRESS: string;
        export let APPROVED: string;
        export let REJECTED: string;
        export let EXPIRED: string;
    }
    namespace TrainingStatus {
        export let NOT_STARTED: string;
        let IN_PROGRESS_1: string;
        export { IN_PROGRESS_1 as IN_PROGRESS };
        export let COMPLETED: string;
        export let FAILED: string;
        let EXPIRED_1: string;
        export { EXPIRED_1 as EXPIRED };
    }
    namespace TrainingType {
        let CRISIS_INTERVENTION: string;
        let ACTIVE_LISTENING: string;
        let DE_ESCALATION: string;
        let PLATFORM_TRAINING: string;
        let SPECIALIZED_TOPIC: string;
        let ONGOING_EDUCATION: string;
    }
    namespace VolunteerSessionType {
        let CRISIS_RESPONSE: string;
        let PEER_SUPPORT: string;
        let GROUP_MODERATION: string;
        let TRAINING_SESSION: string;
        let SUPERVISION: string;
    }
    namespace SessionOutcome {
        export let SUCCESSFUL_RESOLUTION: string;
        let REFERRED_TO_PROFESSIONAL_1: string;
        export { REFERRED_TO_PROFESSIONAL_1 as REFERRED_TO_PROFESSIONAL };
        let USER_DISCONNECTED_1: string;
        export { USER_DISCONNECTED_1 as USER_DISCONNECTED };
        export let ESCALATED_TO_EMERGENCY: string;
        let ONGOING_2: string;
        export { ONGOING_2 as ONGOING };
    }
    namespace ResourceCategory {
        export let CRISIS_HOTLINE: string;
        export let EMERGENCY_SERVICE: string;
        export let SELF_HELP_TOOL: string;
        export let BREATHING_EXERCISE: string;
        export let GROUNDING_TECHNIQUE: string;
        export let SAFETY_PLANNING: string;
        export let PROFESSIONAL_HELP: string;
        let PEER_SUPPORT_1: string;
        export { PEER_SUPPORT_1 as PEER_SUPPORT };
    }
    namespace MetricStatus {
        let NORMAL_2: string;
        export { NORMAL_2 as NORMAL };
        export let WARNING: string;
        let CRITICAL_3: string;
        export { CRITICAL_3 as CRITICAL };
        export let UNKNOWN: string;
    }
    namespace HealthStatus {
        let HEALTHY: string;
        let DEGRADED: string;
        let UNHEALTHY: string;
        let DOWN: string;
    }
    namespace FeedbackType {
        let GENERAL: string;
        let SESSION_QUALITY: string;
        let RESPONSE_TIME: string;
        let PROFESSIONALISM: string;
        let EMPATHY: string;
        let EFFECTIVENESS: string;
        let TECHNICAL_ISSUES: string;
        let COMMUNICATION: string;
        let COMPLAINT: string;
        let SUGGESTION: string;
        let APPRECIATION: string;
        let OTHER: string;
    }
    namespace FeedbackSource {
        export let USER: string;
        let SYSTEM_1: string;
        export { SYSTEM_1 as SYSTEM };
        export let PEER_REVIEW: string;
        export let SUPERVISOR: string;
        export let AUTOMATED: string;
        export let ANONYMOUS: string;
        let OTHER_1: string;
        export { OTHER_1 as OTHER };
    }
    namespace ReportType {
        export let CONTENT_VIOLATION: string;
        export let HARASSMENT: string;
        export let SPAM: string;
        export let SELF_HARM_CONTENT: string;
        export let INAPPROPRIATE_BEHAVIOR: string;
        export let TECHNICAL_ISSUE: string;
        export let PRIVACY_CONCERN: string;
        let OTHER_2: string;
        export { OTHER_2 as OTHER };
    }
    namespace ReportSeverity {
        let LOW_3: string;
        export { LOW_3 as LOW };
        let MEDIUM_2: string;
        export { MEDIUM_2 as MEDIUM };
        let HIGH_4: string;
        export { HIGH_4 as HIGH };
        let CRITICAL_4: string;
        export { CRITICAL_4 as CRITICAL };
        let EMERGENCY_4: string;
        export { EMERGENCY_4 as EMERGENCY };
    }
    namespace ReportStatus {
        let PENDING_2: string;
        export { PENDING_2 as PENDING };
        export let UNDER_REVIEW: string;
        let RESOLVED_2: string;
        export { RESOLVED_2 as RESOLVED };
        export let DISMISSED: string;
        let ESCALATED_2: string;
        export { ESCALATED_2 as ESCALATED };
    }
    namespace UserDataSharing {
        let MINIMAL_1: string;
        export { MINIMAL_1 as MINIMAL };
        export let ANONYMOUS_ANALYTICS: string;
        export let COMMUNITY_FEATURES: string;
        export let FULL_RESEARCH: string;
    }
    namespace AchievementCategory {
        let MOOD_TRACKING: string;
        let CONSISTENCY: string;
        let SELF_CARE: string;
        let CRISIS_MANAGEMENT: string;
        let COMMUNITY: string;
        let PERSONAL_GROWTH: string;
        let WELLNESS_MILESTONES: string;
    }
    namespace AchievementRarity {
        let COMMON: string;
        let UNCOMMON: string;
        let RARE: string;
        let EPIC: string;
        let LEGENDARY: string;
    }
    namespace ChallengeType {
        export let DAILY: string;
        export let WEEKLY: string;
        export let MONTHLY: string;
        export let MILESTONE: string;
        let COMMUNITY_1: string;
        export { COMMUNITY_1 as COMMUNITY };
        export let SEASONAL: string;
    }
    namespace ChallengeDifficulty {
        export let EASY: string;
        let MEDIUM_3: string;
        export { MEDIUM_3 as MEDIUM };
        export let HARD: string;
        export let EXPERT: string;
    }
    namespace ActivityType {
        let MOOD_LOG: string;
        let SAFETY_PLAN_UPDATE: string;
        let ACHIEVEMENT_UNLOCK: string;
        let CHALLENGE_COMPLETE: string;
        let LEVEL_UP: string;
        let COMMUNITY_INTERACTION: string;
        let SELF_CARE_ACTIVITY: string;
        let CRISIS_RESOURCE_ACCESS: string;
    }
    namespace EmergencyNotificationType {
        export let CRISIS_ESCALATION: string;
        export let SAFETY_PLAN_ACTIVATION: string;
        export let EMERGENCY_ALERT: string;
        export let WELLNESS_CHECK: string;
        let MEDICAL_EMERGENCY_1: string;
        export { MEDICAL_EMERGENCY_1 as MEDICAL_EMERGENCY };
        export let SELF_HARM_DETECTED: string;
        export let SUICIDE_RISK: string;
        let PANIC_ATTACK_1: string;
        export { PANIC_ATTACK_1 as PANIC_ATTACK };
        export let CUSTOM_ALERT: string;
    }
    namespace NotificationStatus {
        let PENDING_3: string;
        export { PENDING_3 as PENDING };
        export let SENT: string;
        export let DELIVERED: string;
        export let ACKNOWLEDGED: string;
        let FAILED_1: string;
        export { FAILED_1 as FAILED };
        export let RETRYING: string;
        export let CANCELLED: string;
        let EXPIRED_2: string;
        export { EXPIRED_2 as EXPIRED };
    }
    namespace JournalType {
        export let FREEFORM: string;
        export let GUIDED: string;
        export let GRATITUDE: string;
        export let REFLECTION: string;
        export let GOAL_SETTING: string;
        let MOOD_LOG_1: string;
        export { MOOD_LOG_1 as MOOD_LOG };
        export let DREAM: string;
        export let THERAPY_NOTES: string;
    }
    namespace BreathingTechnique {
        let FOUR_SEVEN_EIGHT: string;
        let BOX_BREATHING: string;
        let BELLY_BREATHING: string;
        let ALTERNATE_NOSTRIL: string;
        let COHERENT: string;
        let LION_BREATH: string;
        let COOLING_BREATH: string;
        let FIRE_BREATH: string;
    }
    namespace GroundingType {
        let SENSORY: string;
        let PHYSICAL: string;
        let MENTAL: string;
        let SPIRITUAL: string;
        let CREATIVE: string;
        let MOVEMENT: string;
    }
    namespace GroundingCategory {
        let PANIC_ATTACK_2: string;
        export { PANIC_ATTACK_2 as PANIC_ATTACK };
        export let DISSOCIATION: string;
        export let FLASHBACK: string;
        export let ANXIETY: string;
        export let ANGER: string;
        export let OVERWHELM: string;
        export let TRAUMA_RESPONSE: string;
    }
    namespace ExerciseDifficulty {
        export let BEGINNER: string;
        export let INTERMEDIATE: string;
        export let ADVANCED: string;
        let EXPERT_1: string;
        export { EXPERT_1 as EXPERT };
    }
    namespace EvidenceLevel {
        let HIGH_5: string;
        export { HIGH_5 as HIGH };
        let MODERATE_2: string;
        export { MODERATE_2 as MODERATE };
        let LOW_4: string;
        export { LOW_4 as LOW };
        export let EMERGING: string;
    }
    namespace SelfHelpCategory {
        let MOOD_TRACKING_1: string;
        export { MOOD_TRACKING_1 as MOOD_TRACKING };
        export let JOURNALING: string;
        export let BREATHING: string;
        export let GROUNDING: string;
        export let MEDITATION: string;
        export let EXERCISE: string;
        export let SLEEP: string;
        export let NUTRITION: string;
        export let SOCIAL: string;
        let CREATIVE_1: string;
        export { CREATIVE_1 as CREATIVE };
        export let EDUCATIONAL: string;
    }
    namespace ResourceType {
        let ARTICLE: string;
        let VIDEO: string;
        let AUDIO: string;
        let INTERACTIVE: string;
        let PDF: string;
        let WORKSHEET: string;
        let APP: string;
        let WEBSITE: string;
    }
    namespace InteractionType {
        let VIEW: string;
        let START: string;
        let COMPLETE: string;
        let SAVE: string;
        let SHARE: string;
        let RATE: string;
    }
}
export namespace CrisisStatus {
    let ACTIVE_2: string;
    export { ACTIVE_2 as ACTIVE };
    let ASSIGNED_1: string;
    export { ASSIGNED_1 as ASSIGNED };
    let RESOLVED_3: string;
    export { RESOLVED_3 as RESOLVED };
    let ESCALATED_3: string;
    export { ESCALATED_3 as ESCALATED };
    let ABANDONED_1: string;
    export { ABANDONED_1 as ABANDONED };
}
export namespace EscalationType {
    let AUTOMATIC_KEYWORD_1: string;
    export { AUTOMATIC_KEYWORD_1 as AUTOMATIC_KEYWORD };
    let MANUAL_VOLUNTEER_1: string;
    export { MANUAL_VOLUNTEER_1 as MANUAL_VOLUNTEER };
    let USER_REQUEST_2: string;
    export { USER_REQUEST_2 as USER_REQUEST };
    let SYSTEM_TIMEOUT_1: string;
    export { SYSTEM_TIMEOUT_1 as SYSTEM_TIMEOUT };
    let EMERGENCY_SERVICES_2: string;
    export { EMERGENCY_SERVICES_2 as EMERGENCY_SERVICES };
}
export namespace MessageSender {
    let ANONYMOUS_USER_1: string;
    export { ANONYMOUS_USER_1 as ANONYMOUS_USER };
    let VOLUNTEER_1: string;
    export { VOLUNTEER_1 as VOLUNTEER };
    let SYSTEM_2: string;
    export { SYSTEM_2 as SYSTEM };
    let AI_ASSISTANT_1: string;
    export { AI_ASSISTANT_1 as AI_ASSISTANT };
}
export namespace MessageType {
    let TEXT_1: string;
    export { TEXT_1 as TEXT };
    let VOICE_NOTE_1: string;
    export { VOICE_NOTE_1 as VOICE_NOTE };
    let IMAGE_1: string;
    export { IMAGE_1 as IMAGE };
    let SYSTEM_MESSAGE_1: string;
    export { SYSTEM_MESSAGE_1 as SYSTEM_MESSAGE };
    let RESOURCE_SHARE_1: string;
    export { RESOURCE_SHARE_1 as RESOURCE_SHARE };
}
export namespace MessagePriority {
    let LOW_5: string;
    export { LOW_5 as LOW };
    let NORMAL_3: string;
    export { NORMAL_3 as NORMAL };
    let HIGH_6: string;
    export { HIGH_6 as HIGH };
    let URGENT_1: string;
    export { URGENT_1 as URGENT };
    let EMERGENCY_5: string;
    export { EMERGENCY_5 as EMERGENCY };
}
export namespace EscalationTrigger {
    let KEYWORD_DETECTION_1: string;
    export { KEYWORD_DETECTION_1 as KEYWORD_DETECTION };
    let SEVERITY_INCREASE_1: string;
    export { SEVERITY_INCREASE_1 as SEVERITY_INCREASE };
    let VOLUNTEER_REQUEST_1: string;
    export { VOLUNTEER_REQUEST_1 as VOLUNTEER_REQUEST };
    let USER_REQUEST_3: string;
    export { USER_REQUEST_3 as USER_REQUEST };
    let TIMEOUT_1: string;
    export { TIMEOUT_1 as TIMEOUT };
    let AI_ASSESSMENT_1: string;
    export { AI_ASSESSMENT_1 as AI_ASSESSMENT };
}
export namespace EscalationSeverity {
    let MODERATE_3: string;
    export { MODERATE_3 as MODERATE };
    let HIGH_7: string;
    export { HIGH_7 as HIGH };
    let CRITICAL_5: string;
    export { CRITICAL_5 as CRITICAL };
    let EMERGENCY_6: string;
    export { EMERGENCY_6 as EMERGENCY };
}
export namespace EscalationOutcome {
    let RESOLVED_INTERNALLY_1: string;
    export { RESOLVED_INTERNALLY_1 as RESOLVED_INTERNALLY };
    let REFERRED_TO_PROFESSIONAL_2: string;
    export { REFERRED_TO_PROFESSIONAL_2 as REFERRED_TO_PROFESSIONAL };
    let EMERGENCY_SERVICES_CONTACTED_1: string;
    export { EMERGENCY_SERVICES_CONTACTED_1 as EMERGENCY_SERVICES_CONTACTED };
    let USER_DISCONNECTED_2: string;
    export { USER_DISCONNECTED_2 as USER_DISCONNECTED };
    let ONGOING_3: string;
    export { ONGOING_3 as ONGOING };
}
export namespace TetherDataSharing {
    let MINIMAL_2: string;
    export { MINIMAL_2 as MINIMAL };
    let MODERATE_4: string;
    export { MODERATE_4 as MODERATE };
    let FULL_1: string;
    export { FULL_1 as FULL };
}
export namespace PulseType {
    let HEARTBEAT_1: string;
    export { HEARTBEAT_1 as HEARTBEAT };
    let CHECK_IN_1: string;
    export { CHECK_IN_1 as CHECK_IN };
    let MOOD_UPDATE_1: string;
    export { MOOD_UPDATE_1 as MOOD_UPDATE };
    let EMERGENCY_7: string;
    export { EMERGENCY_7 as EMERGENCY };
    let CUSTOM_1: string;
    export { CUSTOM_1 as CUSTOM };
}
export namespace UserStatus {
    let NORMAL_4: string;
    export { NORMAL_4 as NORMAL };
    let STRUGGLING_1: string;
    export { STRUGGLING_1 as STRUGGLING };
    let CRISIS_1: string;
    export { CRISIS_1 as CRISIS };
    let EMERGENCY_8: string;
    export { EMERGENCY_8 as EMERGENCY };
    let OFFLINE_1: string;
    export { OFFLINE_1 as OFFLINE };
}
export namespace UrgencyLevel {
    let LOW_6: string;
    export { LOW_6 as LOW };
    let MEDIUM_4: string;
    export { MEDIUM_4 as MEDIUM };
    let HIGH_8: string;
    export { HIGH_8 as HIGH };
    let CRITICAL_6: string;
    export { CRITICAL_6 as CRITICAL };
}
export namespace EmergencyType {
    let MENTAL_HEALTH_CRISIS_1: string;
    export { MENTAL_HEALTH_CRISIS_1 as MENTAL_HEALTH_CRISIS };
    let SELF_HARM_RISK_1: string;
    export { SELF_HARM_RISK_1 as SELF_HARM_RISK };
    let SUICIDAL_IDEATION_1: string;
    export { SUICIDAL_IDEATION_1 as SUICIDAL_IDEATION };
    let PANIC_ATTACK_3: string;
    export { PANIC_ATTACK_3 as PANIC_ATTACK };
    let MEDICAL_EMERGENCY_2: string;
    export { MEDICAL_EMERGENCY_2 as MEDICAL_EMERGENCY };
    let SAFETY_CONCERN_1: string;
    export { SAFETY_CONCERN_1 as SAFETY_CONCERN };
}
export namespace EmergencySeverity {
    let LOW_7: string;
    export { LOW_7 as LOW };
    let MEDIUM_5: string;
    export { MEDIUM_5 as MEDIUM };
    let HIGH_9: string;
    export { HIGH_9 as HIGH };
    let CRITICAL_7: string;
    export { CRITICAL_7 as CRITICAL };
    let LIFE_THREATENING_1: string;
    export { LIFE_THREATENING_1 as LIFE_THREATENING };
}
export namespace EmergencyOutcome {
    let RESOLVED_4: string;
    export { RESOLVED_4 as RESOLVED };
    let ESCALATED_4: string;
    export { ESCALATED_4 as ESCALATED };
    let EMERGENCY_SERVICES_3: string;
    export { EMERGENCY_SERVICES_3 as EMERGENCY_SERVICES };
    let ONGOING_4: string;
    export { ONGOING_4 as ONGOING };
    let USER_SAFE_1: string;
    export { USER_SAFE_1 as USER_SAFE };
}
export namespace VolunteerStatus {
    let PENDING_4: string;
    export { PENDING_4 as PENDING };
    let TRAINING_1: string;
    export { TRAINING_1 as TRAINING };
    let BACKGROUND_CHECK_1: string;
    export { BACKGROUND_CHECK_1 as BACKGROUND_CHECK };
    let VERIFIED_1: string;
    export { VERIFIED_1 as VERIFIED };
    let ACTIVE_3: string;
    export { ACTIVE_3 as ACTIVE };
    let INACTIVE_1: string;
    export { INACTIVE_1 as INACTIVE };
    let SUSPENDED_1: string;
    export { SUSPENDED_1 as SUSPENDED };
    let REVOKED_1: string;
    export { REVOKED_1 as REVOKED };
}
export namespace VerificationStatus {
    let PENDING_5: string;
    export { PENDING_5 as PENDING };
    let IN_PROGRESS_2: string;
    export { IN_PROGRESS_2 as IN_PROGRESS };
    let APPROVED_1: string;
    export { APPROVED_1 as APPROVED };
    let REJECTED_1: string;
    export { REJECTED_1 as REJECTED };
    let EXPIRED_3: string;
    export { EXPIRED_3 as EXPIRED };
}
export namespace TrainingStatus {
    let NOT_STARTED_1: string;
    export { NOT_STARTED_1 as NOT_STARTED };
    let IN_PROGRESS_3: string;
    export { IN_PROGRESS_3 as IN_PROGRESS };
    let COMPLETED_1: string;
    export { COMPLETED_1 as COMPLETED };
    let FAILED_2: string;
    export { FAILED_2 as FAILED };
    let EXPIRED_4: string;
    export { EXPIRED_4 as EXPIRED };
}
export namespace TrainingType {
    let CRISIS_INTERVENTION_1: string;
    export { CRISIS_INTERVENTION_1 as CRISIS_INTERVENTION };
    let ACTIVE_LISTENING_1: string;
    export { ACTIVE_LISTENING_1 as ACTIVE_LISTENING };
    let DE_ESCALATION_1: string;
    export { DE_ESCALATION_1 as DE_ESCALATION };
    let PLATFORM_TRAINING_1: string;
    export { PLATFORM_TRAINING_1 as PLATFORM_TRAINING };
    let SPECIALIZED_TOPIC_1: string;
    export { SPECIALIZED_TOPIC_1 as SPECIALIZED_TOPIC };
    let ONGOING_EDUCATION_1: string;
    export { ONGOING_EDUCATION_1 as ONGOING_EDUCATION };
}
export namespace VolunteerSessionType {
    let CRISIS_RESPONSE_1: string;
    export { CRISIS_RESPONSE_1 as CRISIS_RESPONSE };
    let PEER_SUPPORT_2: string;
    export { PEER_SUPPORT_2 as PEER_SUPPORT };
    let GROUP_MODERATION_1: string;
    export { GROUP_MODERATION_1 as GROUP_MODERATION };
    let TRAINING_SESSION_1: string;
    export { TRAINING_SESSION_1 as TRAINING_SESSION };
    let SUPERVISION_1: string;
    export { SUPERVISION_1 as SUPERVISION };
}
export namespace SessionOutcome {
    let SUCCESSFUL_RESOLUTION_1: string;
    export { SUCCESSFUL_RESOLUTION_1 as SUCCESSFUL_RESOLUTION };
    let REFERRED_TO_PROFESSIONAL_3: string;
    export { REFERRED_TO_PROFESSIONAL_3 as REFERRED_TO_PROFESSIONAL };
    let USER_DISCONNECTED_3: string;
    export { USER_DISCONNECTED_3 as USER_DISCONNECTED };
    let ESCALATED_TO_EMERGENCY_1: string;
    export { ESCALATED_TO_EMERGENCY_1 as ESCALATED_TO_EMERGENCY };
    let ONGOING_5: string;
    export { ONGOING_5 as ONGOING };
}
export namespace ResourceCategory {
    let CRISIS_HOTLINE_1: string;
    export { CRISIS_HOTLINE_1 as CRISIS_HOTLINE };
    let EMERGENCY_SERVICE_1: string;
    export { EMERGENCY_SERVICE_1 as EMERGENCY_SERVICE };
    let SELF_HELP_TOOL_1: string;
    export { SELF_HELP_TOOL_1 as SELF_HELP_TOOL };
    let BREATHING_EXERCISE_1: string;
    export { BREATHING_EXERCISE_1 as BREATHING_EXERCISE };
    let GROUNDING_TECHNIQUE_1: string;
    export { GROUNDING_TECHNIQUE_1 as GROUNDING_TECHNIQUE };
    let SAFETY_PLANNING_1: string;
    export { SAFETY_PLANNING_1 as SAFETY_PLANNING };
    let PROFESSIONAL_HELP_1: string;
    export { PROFESSIONAL_HELP_1 as PROFESSIONAL_HELP };
    let PEER_SUPPORT_3: string;
    export { PEER_SUPPORT_3 as PEER_SUPPORT };
}
export namespace MetricStatus {
    let NORMAL_5: string;
    export { NORMAL_5 as NORMAL };
    let WARNING_1: string;
    export { WARNING_1 as WARNING };
    let CRITICAL_8: string;
    export { CRITICAL_8 as CRITICAL };
    let UNKNOWN_1: string;
    export { UNKNOWN_1 as UNKNOWN };
}
export namespace HealthStatus {
    let HEALTHY_1: string;
    export { HEALTHY_1 as HEALTHY };
    let DEGRADED_1: string;
    export { DEGRADED_1 as DEGRADED };
    let UNHEALTHY_1: string;
    export { UNHEALTHY_1 as UNHEALTHY };
    let DOWN_1: string;
    export { DOWN_1 as DOWN };
}
export namespace FeedbackType {
    let GENERAL_1: string;
    export { GENERAL_1 as GENERAL };
    let SESSION_QUALITY_1: string;
    export { SESSION_QUALITY_1 as SESSION_QUALITY };
    let RESPONSE_TIME_1: string;
    export { RESPONSE_TIME_1 as RESPONSE_TIME };
    let PROFESSIONALISM_1: string;
    export { PROFESSIONALISM_1 as PROFESSIONALISM };
    let EMPATHY_1: string;
    export { EMPATHY_1 as EMPATHY };
    let EFFECTIVENESS_1: string;
    export { EFFECTIVENESS_1 as EFFECTIVENESS };
    let TECHNICAL_ISSUES_1: string;
    export { TECHNICAL_ISSUES_1 as TECHNICAL_ISSUES };
    let COMMUNICATION_1: string;
    export { COMMUNICATION_1 as COMMUNICATION };
    let COMPLAINT_1: string;
    export { COMPLAINT_1 as COMPLAINT };
    let SUGGESTION_1: string;
    export { SUGGESTION_1 as SUGGESTION };
    let APPRECIATION_1: string;
    export { APPRECIATION_1 as APPRECIATION };
    let OTHER_3: string;
    export { OTHER_3 as OTHER };
}
export namespace FeedbackSource {
    let USER_1: string;
    export { USER_1 as USER };
    let SYSTEM_3: string;
    export { SYSTEM_3 as SYSTEM };
    let PEER_REVIEW_1: string;
    export { PEER_REVIEW_1 as PEER_REVIEW };
    let SUPERVISOR_1: string;
    export { SUPERVISOR_1 as SUPERVISOR };
    let AUTOMATED_1: string;
    export { AUTOMATED_1 as AUTOMATED };
    let ANONYMOUS_1: string;
    export { ANONYMOUS_1 as ANONYMOUS };
    let OTHER_4: string;
    export { OTHER_4 as OTHER };
}
export namespace ReportType {
    let CONTENT_VIOLATION_1: string;
    export { CONTENT_VIOLATION_1 as CONTENT_VIOLATION };
    let HARASSMENT_1: string;
    export { HARASSMENT_1 as HARASSMENT };
    let SPAM_1: string;
    export { SPAM_1 as SPAM };
    let SELF_HARM_CONTENT_1: string;
    export { SELF_HARM_CONTENT_1 as SELF_HARM_CONTENT };
    let INAPPROPRIATE_BEHAVIOR_1: string;
    export { INAPPROPRIATE_BEHAVIOR_1 as INAPPROPRIATE_BEHAVIOR };
    let TECHNICAL_ISSUE_1: string;
    export { TECHNICAL_ISSUE_1 as TECHNICAL_ISSUE };
    let PRIVACY_CONCERN_1: string;
    export { PRIVACY_CONCERN_1 as PRIVACY_CONCERN };
    let OTHER_5: string;
    export { OTHER_5 as OTHER };
}
export namespace ReportSeverity {
    let LOW_8: string;
    export { LOW_8 as LOW };
    let MEDIUM_6: string;
    export { MEDIUM_6 as MEDIUM };
    let HIGH_10: string;
    export { HIGH_10 as HIGH };
    let CRITICAL_9: string;
    export { CRITICAL_9 as CRITICAL };
    let EMERGENCY_9: string;
    export { EMERGENCY_9 as EMERGENCY };
}
export namespace ReportStatus {
    let PENDING_6: string;
    export { PENDING_6 as PENDING };
    let UNDER_REVIEW_1: string;
    export { UNDER_REVIEW_1 as UNDER_REVIEW };
    let RESOLVED_5: string;
    export { RESOLVED_5 as RESOLVED };
    let DISMISSED_1: string;
    export { DISMISSED_1 as DISMISSED };
    let ESCALATED_5: string;
    export { ESCALATED_5 as ESCALATED };
}
export namespace UserDataSharing {
    let MINIMAL_3: string;
    export { MINIMAL_3 as MINIMAL };
    let ANONYMOUS_ANALYTICS_1: string;
    export { ANONYMOUS_ANALYTICS_1 as ANONYMOUS_ANALYTICS };
    let COMMUNITY_FEATURES_1: string;
    export { COMMUNITY_FEATURES_1 as COMMUNITY_FEATURES };
    let FULL_RESEARCH_1: string;
    export { FULL_RESEARCH_1 as FULL_RESEARCH };
}
export namespace AchievementCategory {
    let MOOD_TRACKING_2: string;
    export { MOOD_TRACKING_2 as MOOD_TRACKING };
    let CONSISTENCY_1: string;
    export { CONSISTENCY_1 as CONSISTENCY };
    let SELF_CARE_1: string;
    export { SELF_CARE_1 as SELF_CARE };
    let CRISIS_MANAGEMENT_1: string;
    export { CRISIS_MANAGEMENT_1 as CRISIS_MANAGEMENT };
    let COMMUNITY_2: string;
    export { COMMUNITY_2 as COMMUNITY };
    let PERSONAL_GROWTH_1: string;
    export { PERSONAL_GROWTH_1 as PERSONAL_GROWTH };
    let WELLNESS_MILESTONES_1: string;
    export { WELLNESS_MILESTONES_1 as WELLNESS_MILESTONES };
}
export namespace AchievementRarity {
    let COMMON_1: string;
    export { COMMON_1 as COMMON };
    let UNCOMMON_1: string;
    export { UNCOMMON_1 as UNCOMMON };
    let RARE_1: string;
    export { RARE_1 as RARE };
    let EPIC_1: string;
    export { EPIC_1 as EPIC };
    let LEGENDARY_1: string;
    export { LEGENDARY_1 as LEGENDARY };
}
export namespace ChallengeType {
    let DAILY_1: string;
    export { DAILY_1 as DAILY };
    let WEEKLY_1: string;
    export { WEEKLY_1 as WEEKLY };
    let MONTHLY_1: string;
    export { MONTHLY_1 as MONTHLY };
    let MILESTONE_1: string;
    export { MILESTONE_1 as MILESTONE };
    let COMMUNITY_3: string;
    export { COMMUNITY_3 as COMMUNITY };
    let SEASONAL_1: string;
    export { SEASONAL_1 as SEASONAL };
}
export namespace ChallengeDifficulty {
    let EASY_1: string;
    export { EASY_1 as EASY };
    let MEDIUM_7: string;
    export { MEDIUM_7 as MEDIUM };
    let HARD_1: string;
    export { HARD_1 as HARD };
    let EXPERT_2: string;
    export { EXPERT_2 as EXPERT };
}
export namespace ActivityType {
    let MOOD_LOG_2: string;
    export { MOOD_LOG_2 as MOOD_LOG };
    let SAFETY_PLAN_UPDATE_1: string;
    export { SAFETY_PLAN_UPDATE_1 as SAFETY_PLAN_UPDATE };
    let ACHIEVEMENT_UNLOCK_1: string;
    export { ACHIEVEMENT_UNLOCK_1 as ACHIEVEMENT_UNLOCK };
    let CHALLENGE_COMPLETE_1: string;
    export { CHALLENGE_COMPLETE_1 as CHALLENGE_COMPLETE };
    let LEVEL_UP_1: string;
    export { LEVEL_UP_1 as LEVEL_UP };
    let COMMUNITY_INTERACTION_1: string;
    export { COMMUNITY_INTERACTION_1 as COMMUNITY_INTERACTION };
    let SELF_CARE_ACTIVITY_1: string;
    export { SELF_CARE_ACTIVITY_1 as SELF_CARE_ACTIVITY };
    let CRISIS_RESOURCE_ACCESS_1: string;
    export { CRISIS_RESOURCE_ACCESS_1 as CRISIS_RESOURCE_ACCESS };
}
export namespace EmergencyNotificationType {
    let CRISIS_ESCALATION_1: string;
    export { CRISIS_ESCALATION_1 as CRISIS_ESCALATION };
    let SAFETY_PLAN_ACTIVATION_1: string;
    export { SAFETY_PLAN_ACTIVATION_1 as SAFETY_PLAN_ACTIVATION };
    let EMERGENCY_ALERT_1: string;
    export { EMERGENCY_ALERT_1 as EMERGENCY_ALERT };
    let WELLNESS_CHECK_1: string;
    export { WELLNESS_CHECK_1 as WELLNESS_CHECK };
    let MEDICAL_EMERGENCY_3: string;
    export { MEDICAL_EMERGENCY_3 as MEDICAL_EMERGENCY };
    let SELF_HARM_DETECTED_1: string;
    export { SELF_HARM_DETECTED_1 as SELF_HARM_DETECTED };
    let SUICIDE_RISK_1: string;
    export { SUICIDE_RISK_1 as SUICIDE_RISK };
    let PANIC_ATTACK_4: string;
    export { PANIC_ATTACK_4 as PANIC_ATTACK };
    let CUSTOM_ALERT_1: string;
    export { CUSTOM_ALERT_1 as CUSTOM_ALERT };
}
export namespace NotificationStatus {
    let PENDING_7: string;
    export { PENDING_7 as PENDING };
    let SENT_1: string;
    export { SENT_1 as SENT };
    let DELIVERED_1: string;
    export { DELIVERED_1 as DELIVERED };
    let ACKNOWLEDGED_1: string;
    export { ACKNOWLEDGED_1 as ACKNOWLEDGED };
    let FAILED_3: string;
    export { FAILED_3 as FAILED };
    let RETRYING_1: string;
    export { RETRYING_1 as RETRYING };
    let CANCELLED_1: string;
    export { CANCELLED_1 as CANCELLED };
    let EXPIRED_5: string;
    export { EXPIRED_5 as EXPIRED };
}
export namespace JournalType {
    let FREEFORM_1: string;
    export { FREEFORM_1 as FREEFORM };
    let GUIDED_1: string;
    export { GUIDED_1 as GUIDED };
    let GRATITUDE_1: string;
    export { GRATITUDE_1 as GRATITUDE };
    let REFLECTION_1: string;
    export { REFLECTION_1 as REFLECTION };
    let GOAL_SETTING_1: string;
    export { GOAL_SETTING_1 as GOAL_SETTING };
    let MOOD_LOG_3: string;
    export { MOOD_LOG_3 as MOOD_LOG };
    let DREAM_1: string;
    export { DREAM_1 as DREAM };
    let THERAPY_NOTES_1: string;
    export { THERAPY_NOTES_1 as THERAPY_NOTES };
}
export namespace BreathingTechnique {
    let FOUR_SEVEN_EIGHT_1: string;
    export { FOUR_SEVEN_EIGHT_1 as FOUR_SEVEN_EIGHT };
    let BOX_BREATHING_1: string;
    export { BOX_BREATHING_1 as BOX_BREATHING };
    let BELLY_BREATHING_1: string;
    export { BELLY_BREATHING_1 as BELLY_BREATHING };
    let ALTERNATE_NOSTRIL_1: string;
    export { ALTERNATE_NOSTRIL_1 as ALTERNATE_NOSTRIL };
    let COHERENT_1: string;
    export { COHERENT_1 as COHERENT };
    let LION_BREATH_1: string;
    export { LION_BREATH_1 as LION_BREATH };
    let COOLING_BREATH_1: string;
    export { COOLING_BREATH_1 as COOLING_BREATH };
    let FIRE_BREATH_1: string;
    export { FIRE_BREATH_1 as FIRE_BREATH };
}
export namespace GroundingType {
    let SENSORY_1: string;
    export { SENSORY_1 as SENSORY };
    let PHYSICAL_1: string;
    export { PHYSICAL_1 as PHYSICAL };
    let MENTAL_1: string;
    export { MENTAL_1 as MENTAL };
    let SPIRITUAL_1: string;
    export { SPIRITUAL_1 as SPIRITUAL };
    let CREATIVE_2: string;
    export { CREATIVE_2 as CREATIVE };
    let MOVEMENT_1: string;
    export { MOVEMENT_1 as MOVEMENT };
}
export namespace GroundingCategory {
    let PANIC_ATTACK_5: string;
    export { PANIC_ATTACK_5 as PANIC_ATTACK };
    let DISSOCIATION_1: string;
    export { DISSOCIATION_1 as DISSOCIATION };
    let FLASHBACK_1: string;
    export { FLASHBACK_1 as FLASHBACK };
    let ANXIETY_1: string;
    export { ANXIETY_1 as ANXIETY };
    let ANGER_1: string;
    export { ANGER_1 as ANGER };
    let OVERWHELM_1: string;
    export { OVERWHELM_1 as OVERWHELM };
    let TRAUMA_RESPONSE_1: string;
    export { TRAUMA_RESPONSE_1 as TRAUMA_RESPONSE };
}
export namespace ExerciseDifficulty {
    let BEGINNER_1: string;
    export { BEGINNER_1 as BEGINNER };
    let INTERMEDIATE_1: string;
    export { INTERMEDIATE_1 as INTERMEDIATE };
    let ADVANCED_1: string;
    export { ADVANCED_1 as ADVANCED };
    let EXPERT_3: string;
    export { EXPERT_3 as EXPERT };
}
export namespace EvidenceLevel {
    let HIGH_11: string;
    export { HIGH_11 as HIGH };
    let MODERATE_5: string;
    export { MODERATE_5 as MODERATE };
    let LOW_9: string;
    export { LOW_9 as LOW };
    let EMERGING_1: string;
    export { EMERGING_1 as EMERGING };
}
export namespace SelfHelpCategory {
    let MOOD_TRACKING_3: string;
    export { MOOD_TRACKING_3 as MOOD_TRACKING };
    let JOURNALING_1: string;
    export { JOURNALING_1 as JOURNALING };
    let BREATHING_1: string;
    export { BREATHING_1 as BREATHING };
    let GROUNDING_1: string;
    export { GROUNDING_1 as GROUNDING };
    let MEDITATION_1: string;
    export { MEDITATION_1 as MEDITATION };
    let EXERCISE_1: string;
    export { EXERCISE_1 as EXERCISE };
    let SLEEP_1: string;
    export { SLEEP_1 as SLEEP };
    let NUTRITION_1: string;
    export { NUTRITION_1 as NUTRITION };
    let SOCIAL_1: string;
    export { SOCIAL_1 as SOCIAL };
    let CREATIVE_3: string;
    export { CREATIVE_3 as CREATIVE };
    let EDUCATIONAL_1: string;
    export { EDUCATIONAL_1 as EDUCATIONAL };
}
export namespace ResourceType {
    let ARTICLE_1: string;
    export { ARTICLE_1 as ARTICLE };
    let VIDEO_1: string;
    export { VIDEO_1 as VIDEO };
    let AUDIO_1: string;
    export { AUDIO_1 as AUDIO };
    let INTERACTIVE_1: string;
    export { INTERACTIVE_1 as INTERACTIVE };
    let PDF_1: string;
    export { PDF_1 as PDF };
    let WORKSHEET_1: string;
    export { WORKSHEET_1 as WORKSHEET };
    let APP_1: string;
    export { APP_1 as APP };
    let WEBSITE_1: string;
    export { WEBSITE_1 as WEBSITE };
}
export namespace InteractionType {
    let VIEW_1: string;
    export { VIEW_1 as VIEW };
    let START_1: string;
    export { START_1 as START };
    let COMPLETE_1: string;
    export { COMPLETE_1 as COMPLETE };
    let SAVE_1: string;
    export { SAVE_1 as SAVE };
    let SHARE_1: string;
    export { SHARE_1 as SHARE };
    let RATE_1: string;
    export { RATE_1 as RATE };
}
export namespace Prisma {
    export namespace prismaVersion {
        let client: string;
        let engine: string;
    }
    export { PrismaClientKnownRequestError };
    export { PrismaClientUnknownRequestError };
    export { PrismaClientRustPanicError };
    export { PrismaClientInitializationError };
    export { PrismaClientValidationError };
    export { Decimal };
    export { sqltag as sql };
    export { empty };
    export { join };
    export { raw };
    export let validator: any;
    export let getExtensionContext: any;
    export let defineExtension: any;
    let DbNull_2: any;
    export { DbNull_2 as DbNull };
    let JsonNull_3: any;
    export { JsonNull_3 as JsonNull };
    let AnyNull_1: any;
    export { AnyNull_1 as AnyNull };
    export namespace NullTypes {
        let DbNull_3: any;
        export { DbNull_3 as DbNull };
        let JsonNull_4: any;
        export { JsonNull_4 as JsonNull };
        let AnyNull_2: any;
        export { AnyNull_2 as AnyNull };
    }
}
export const PrismaClient: any;
import { PrismaClientKnownRequestError } from "./runtime/library.js";
import { PrismaClientUnknownRequestError } from "./runtime/library.js";
import { PrismaClientRustPanicError } from "./runtime/library.js";
import { PrismaClientInitializationError } from "./runtime/library.js";
import { PrismaClientValidationError } from "./runtime/library.js";
import { Decimal } from "./runtime/library.js";
import { sqltag } from "./runtime/library.js";
import { empty } from "./runtime/library.js";
import { join } from "./runtime/library.js";
import { raw } from "./runtime/library.js";
//# sourceMappingURL=index.d.ts.map