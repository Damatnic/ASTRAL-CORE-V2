/**
 * ASTRAL_CORE 2.0 Optimized Volunteer Matching System
 *
 * PERFORMANCE-CRITICAL MATCHING ENGINE:
 * - Sub-5-second crisis volunteer assignment
 * - Pre-cached volunteer data for instant lookups
 * - Priority queue for emergency escalation
 * - Load balancing and real-time availability tracking
 *
 * TARGETS:
 * - Emergency matching: <2 seconds
 * - Standard matching: <5 seconds
 * - Success rate: >95%
 */
import type { VolunteerMatchCriteria, VolunteerMatch } from '../types/crisis.types';
export declare class OptimizedVolunteerMatcher {
    private static instance;
    private cache;
    private emergencyQueue;
    private lastCacheUpdate;
    private readonly EMERGENCY_MATCH_TARGET_MS;
    private readonly STANDARD_MATCH_TARGET_MS;
    private readonly CACHE_TTL_MS;
    static getInstance(): OptimizedVolunteerMatcher;
    /**
     * Ultra-fast volunteer matching with emergency prioritization
     * TARGET: <2s for emergency, <5s for standard
     */
    findBestMatch(criteria: VolunteerMatchCriteria, isEmergency?: boolean): Promise<VolunteerMatch | null>;
    private findEmergencyMatch;
    private findOptimalMatch;
    private calculateMatchScore;
    private isVolunteerAvailable;
    private hasRequiredLanguage;
    private reserveVolunteer;
    private createVolunteerMatch;
    private ensureFreshCache;
    private refreshCache;
    getAvailableVolunteerCount(): Promise<number>;
}
//# sourceMappingURL=OptimizedVolunteerMatcher.d.ts.map