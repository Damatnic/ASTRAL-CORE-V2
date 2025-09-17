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
import { randomUUID } from 'crypto';
export class OptimizedVolunteerMatcher {
    static instance;
    cache = new Map();
    emergencyQueue = [];
    lastCacheUpdate = 0;
    // Performance targets
    EMERGENCY_MATCH_TARGET_MS = 2000;
    STANDARD_MATCH_TARGET_MS = 5000;
    CACHE_TTL_MS = 30000;
    static getInstance() {
        if (!OptimizedVolunteerMatcher.instance) {
            OptimizedVolunteerMatcher.instance = new OptimizedVolunteerMatcher();
        }
        return OptimizedVolunteerMatcher.instance;
    }
    /**
     * Ultra-fast volunteer matching with emergency prioritization
     * TARGET: <2s for emergency, <5s for standard
     */
    async findBestMatch(criteria, isEmergency = false) {
        const startTime = performance.now();
        const target = isEmergency ? this.EMERGENCY_MATCH_TARGET_MS : this.STANDARD_MATCH_TARGET_MS;
        try {
            // Refresh cache if needed
            await this.ensureFreshCache();
            // Emergency fast-path using pre-sorted queue
            if (isEmergency) {
                const emergencyMatch = this.findEmergencyMatch(criteria);
                if (emergencyMatch) {
                    const executionTime = performance.now() - startTime;
                    console.log(`✅ Emergency volunteer match found in ${executionTime.toFixed(2)}ms`);
                    return emergencyMatch;
                }
            }
            // Standard optimized matching
            const match = await this.findOptimalMatch(criteria);
            const executionTime = performance.now() - startTime;
            if (executionTime > target) {
                console.warn(`⚠️ Volunteer matching exceeded target: ${executionTime.toFixed(2)}ms > ${target}ms`);
            }
            else {
                console.log(`✅ Volunteer match found in ${executionTime.toFixed(2)}ms`);
            }
            return match;
        }
        catch (error) {
            console.error('❌ Volunteer matching failed:', error);
            return null;
        }
    }
    findEmergencyMatch(criteria) {
        // Use pre-sorted emergency queue for fastest response
        for (const volunteer of this.emergencyQueue) {
            if (this.isVolunteerAvailable(volunteer) &&
                this.hasRequiredLanguage(volunteer, criteria.languages)) {
                this.reserveVolunteer(volunteer.id);
                return this.createVolunteerMatch(volunteer, 1.0);
            }
        }
        return null;
    }
    async findOptimalMatch(criteria) {
        const candidates = Array.from(this.cache.values())
            .filter(volunteer => this.isVolunteerAvailable(volunteer))
            .slice(0, 20); // Limit for performance
        if (candidates.length === 0)
            return null;
        // Score candidates efficiently
        const scoredCandidates = candidates.map(volunteer => ({
            volunteer,
            score: this.calculateMatchScore(volunteer, criteria),
        }));
        // Sort by score and return best match
        scoredCandidates.sort((a, b) => b.score - a.score);
        const bestMatch = scoredCandidates[0];
        if (bestMatch.score < 0.6)
            return null;
        this.reserveVolunteer(bestMatch.volunteer.id);
        return this.createVolunteerMatch(bestMatch.volunteer, bestMatch.score);
    }
    calculateMatchScore(volunteer, criteria) {
        let score = 0;
        // Availability (40%)
        const loadRatio = volunteer.currentLoad / volunteer.maxConcurrent;
        score += (1 - loadRatio) * 0.4;
        // Response rate (30%)
        score += volunteer.responseRate * 0.3;
        // Rating (20%)
        score += (volunteer.averageRating / 5) * 0.2;
        // Specialization match (10%)
        if (criteria.specializations) {
            const matches = criteria.specializations.filter(spec => volunteer.specializations.includes(spec)).length;
            score += (matches / criteria.specializations.length) * 0.1;
        }
        return Math.min(score, 1);
    }
    isVolunteerAvailable(volunteer) {
        return volunteer.status === 'ACTIVE' &&
            volunteer.isActive &&
            volunteer.currentLoad < volunteer.maxConcurrent &&
            volunteer.burnoutScore < 0.7;
    }
    hasRequiredLanguage(volunteer, languages) {
        if (!languages || languages.length === 0) {
            return volunteer.languages.includes('en');
        }
        return languages.some(lang => volunteer.languages.includes(lang));
    }
    reserveVolunteer(volunteerId) {
        const volunteer = this.cache.get(volunteerId);
        if (volunteer) {
            volunteer.currentLoad += 1;
        }
    }
    createVolunteerMatch(volunteer, score) {
        return {
            id: volunteer.id,
            anonymousId: volunteer.anonymousId,
            matchScore: score,
            specializations: volunteer.specializations,
            languages: volunteer.languages,
            averageRating: volunteer.averageRating,
            responseRate: volunteer.responseRate,
            currentLoad: volunteer.currentLoad,
            maxConcurrent: volunteer.maxConcurrent,
            isEmergencyResponder: volunteer.emergencyResponder,
        };
    }
    async ensureFreshCache() {
        if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
    }
    async refreshCache() {
        // Mock data for now - replace with actual database query
        const mockVolunteers = [
            {
                id: randomUUID(),
                anonymousId: randomUUID(),
                status: 'ACTIVE',
                isActive: true,
                specializations: ['crisis-intervention', 'suicide-prevention'],
                languages: ['en'],
                currentLoad: 1,
                maxConcurrent: 3,
                averageRating: 4.8,
                responseRate: 0.95,
                emergencyResponder: true,
                lastActive: new Date(),
                burnoutScore: 0.2,
                priorityScore: 0.9,
            },
        ];
        // Update cache
        this.cache.clear();
        this.emergencyQueue = [];
        for (const volunteer of mockVolunteers) {
            this.cache.set(volunteer.id, volunteer);
            if (volunteer.emergencyResponder && this.isVolunteerAvailable(volunteer)) {
                this.emergencyQueue.push(volunteer);
            }
        }
        // Sort emergency queue by priority
        this.emergencyQueue.sort((a, b) => b.priorityScore - a.priorityScore);
        this.lastCacheUpdate = Date.now();
    }
    async getAvailableVolunteerCount() {
        await this.ensureFreshCache();
        return Array.from(this.cache.values())
            .filter(volunteer => this.isVolunteerAvailable(volunteer))
            .length;
    }
}
//# sourceMappingURL=OptimizedVolunteerMatcher.js.map