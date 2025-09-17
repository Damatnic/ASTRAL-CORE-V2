/**
 * ASTRAL_CORE 2.0 Volunteer Matching System
 *
 * INTELLIGENT VOLUNTEER ASSIGNMENT
 * Matches crisis users with the most suitable volunteers based on:
 * - Crisis severity and type
 * - Volunteer specializations and availability
 * - Response time requirements
 * - Language and timezone preferences
 */
import type { VolunteerMatchCriteria, VolunteerMatch } from '../types/crisis.types';
export interface VolunteerMatchingOptions {
    /** Minimum match score required (0-1) */
    minMatchScore?: number;
    /** Maximum volunteers to return */
    maxResults?: number;
    /** Prefer emergency responders */
    preferEmergencyResponders?: boolean;
    /** Exclude volunteers with high burnout scores */
    excludeBurnout?: boolean;
}
export declare class VolunteerMatcher {
    private static instance;
    private readonly MATCH_WEIGHTS;
    private readonly MIN_THRESHOLDS;
    private constructor();
    static getInstance(): VolunteerMatcher;
    /**
     * Find the best volunteer match for crisis criteria
     * TARGET: <2s execution time for crisis matching
     */
    findBestMatch(criteria: VolunteerMatchCriteria, options?: VolunteerMatchingOptions): Promise<VolunteerMatch | null>;
    /**
     * Queue session for next available volunteer
     */
    queueSession(sessionId: string, severity: number): Promise<void>;
    /**
     * Get count of available volunteers
     */
    getAvailableVolunteerCount(): Promise<number>;
    /**
     * Get volunteer matching statistics
     */
    getMatchingStats(): Promise<{
        totalVolunteers: number;
        availableVolunteers: number;
        utilizationRate: number;
        averageLoad: number;
        capacity: string;
    }>;
    private getAvailableVolunteers;
    private calculateMatchScore;
    private calculateSpecializationMatch;
    private calculateAvailabilityScore;
    private calculateLanguageMatch;
}
//# sourceMappingURL=VolunteerMatcher.d.ts.map