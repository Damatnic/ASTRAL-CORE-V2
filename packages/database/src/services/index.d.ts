/**
 * Database Services - Central export point for all database services
 * Provides clean access to mood, user, emergency, safety, and verification services
 */
export { MoodService } from './mood.service';
export type { MoodEntryData, MoodAnalytics, MoodInsight } from './mood.service';
export { UserService } from './user.service';
export type { CreateUserData, UserProfileData } from './user.service';
export * from './emergency-contact.service';
export * from './safety-plan.service';
export * from './verification.service';
//# sourceMappingURL=index.d.ts.map