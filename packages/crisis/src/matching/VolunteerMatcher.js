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
import { randomUUID } from 'crypto';
// Mock database for now - will be replaced with actual imports
const prisma = {
    volunteer: {
        findMany: async (query) => [
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
            }
        ],
        count: async (query) => 5,
    },
};
const executeWithMetrics = async (fn, name) => {
    return await fn();
};
export class VolunteerMatcher {
    static instance;
    // Matching algorithm weights
    MATCH_WEIGHTS = {
        SPECIALIZATION: 0.35, // Most important - right expertise
        AVAILABILITY: 0.25, // Current load and capacity
        RESPONSE_RATE: 0.20, // Historical reliability
        RATING: 0.15, // User satisfaction scores
        LANGUAGE: 0.05, // Language compatibility
    };
    // Minimum thresholds
    MIN_THRESHOLDS = {
        MATCH_SCORE: 0.6, // 60% minimum compatibility
        RESPONSE_RATE: 0.8, // 80% response rate minimum
        RATING: 3.5, // 3.5/5 rating minimum
        BURNOUT_THRESHOLD: 0.7, // Exclude if burnout > 70%
    };
    constructor() {
        console.log('🤝 Volunteer Matcher initialized');
    }
    static getInstance() {
        if (!VolunteerMatcher.instance) {
            VolunteerMatcher.instance = new VolunteerMatcher();
        }
        return VolunteerMatcher.instance;
    }
    /**
     * Find the best volunteer match for crisis criteria
     * TARGET: <2s execution time for crisis matching
     */
    async findBestMatch(criteria, options = {}) {
        const startTime = performance.now();
        return await executeWithMetrics(async () => {
            // Get available volunteers
            const volunteers = await this.getAvailableVolunteers(criteria, options);
            if (volunteers.length === 0) {
                console.warn('⚠️ No available volunteers found for criteria');
                return null;
            }
            // Score and rank volunteers
            const scoredVolunteers = volunteers.map(volunteer => ({
                volunteer,
                score: this.calculateMatchScore(volunteer, criteria),
            }));
            // Sort by score (highest first)
            scoredVolunteers.sort((a, b) => b.score - a.score);
            // Filter by minimum score
            const minScore = options.minMatchScore || this.MIN_THRESHOLDS.MATCH_SCORE;
            const qualifiedVolunteers = scoredVolunteers.filter(sv => sv.score >= minScore);
            if (qualifiedVolunteers.length === 0) {
                console.warn(`⚠️ No volunteers meet minimum match score of ${minScore}`);
                return null;
            }
            // Return best match
            const bestMatch = qualifiedVolunteers[0];
            const executionTime = performance.now() - startTime;
            if (executionTime > 2000) {
                console.warn(`⚠️ Volunteer matching took ${executionTime.toFixed(2)}ms (target: <2000ms)`);
            }
            console.log(`✅ Best volunteer match found: ${bestMatch.volunteer.anonymousId} (score: ${(bestMatch.score * 100).toFixed(1)}%)`);
            return {
                id: bestMatch.volunteer.id,
                anonymousId: bestMatch.volunteer.anonymousId,
                matchScore: bestMatch.score,
                specializations: bestMatch.volunteer.specializations,
                languages: bestMatch.volunteer.languages,
                averageRating: bestMatch.volunteer.averageRating,
                responseRate: bestMatch.volunteer.responseRate,
                currentLoad: bestMatch.volunteer.currentLoad,
                maxConcurrent: bestMatch.volunteer.maxConcurrent,
                isEmergencyResponder: bestMatch.volunteer.emergencyResponder,
            };
        }, 'volunteer-matching');
    }
    /**
     * Queue session for next available volunteer
     */
    async queueSession(sessionId, severity) {
        await executeWithMetrics(async () => {
            // In production, would add to volunteer assignment queue
            console.log(`📋 Session ${sessionId} queued for next available volunteer (severity: ${severity})`);
            // Mock queue implementation
            setTimeout(async () => {
                console.log(`🔄 Attempting to assign queued session: ${sessionId}`);
                // Would retry volunteer matching here
            }, 30000); // Retry after 30 seconds
        }, 'queue-session');
    }
    /**
     * Get count of available volunteers
     */
    async getAvailableVolunteerCount() {
        return await executeWithMetrics(async () => {
            return await prisma.volunteer.count({
                where: {
                    status: 'ACTIVE',
                    isActive: true,
                    currentLoad: { lt: 3 }, // Not at capacity
                    burnoutScore: { lt: this.MIN_THRESHOLDS.BURNOUT_THRESHOLD },
                },
            });
        }, 'get-available-volunteer-count');
    }
    /**
     * Get volunteer matching statistics
     */
    async getMatchingStats() {
        return await executeWithMetrics(async () => {
            const [totalVolunteers, availableVolunteers, averageLoad] = await Promise.all([
                prisma.volunteer.count({ where: { status: 'ACTIVE' } }),
                this.getAvailableVolunteerCount(),
                // Would calculate average load from database
                Promise.resolve(1.2),
            ]);
            return {
                totalVolunteers,
                availableVolunteers,
                utilizationRate: availableVolunteers > 0 ? (totalVolunteers - availableVolunteers) / totalVolunteers : 0,
                averageLoad,
                capacity: availableVolunteers > 10 ? 'HIGH' : availableVolunteers > 5 ? 'MEDIUM' : 'LOW',
            };
        }, 'get-matching-stats');
    }
    // Private helper methods
    async getAvailableVolunteers(criteria, options) {
        const whereClause = {
            status: 'ACTIVE',
            isActive: true,
            currentLoad: { lt: 3 }, // Not overloaded
            responseRate: { gte: this.MIN_THRESHOLDS.RESPONSE_RATE },
            averageRating: { gte: this.MIN_THRESHOLDS.RATING },
        };
        // Filter by burnout if requested
        if (options.excludeBurnout !== false) {
            whereClause.burnoutScore = { lt: this.MIN_THRESHOLDS.BURNOUT_THRESHOLD };
        }
        // Filter by emergency responder preference
        if (options.preferEmergencyResponders || criteria.urgency === 'CRITICAL') {
            whereClause.emergencyResponder = true;
        }
        // Filter by specializations
        if (criteria.specializations && criteria.specializations.length > 0) {
            whereClause.specializations = {
                hasSome: criteria.specializations,
            };
        }
        // Filter by languages
        if (criteria.languages && criteria.languages.length > 0) {
            whereClause.languages = {
                hasSome: criteria.languages,
            };
        }
        return await prisma.volunteer.findMany({
            where: whereClause,
            orderBy: [
                { currentLoad: 'asc' },
                { averageRating: 'desc' },
                { responseRate: 'desc' },
            ],
            take: options.maxResults || 20,
        });
    }
    calculateMatchScore(volunteer, criteria) {
        let score = 0;
        // Specialization match
        const specializationMatch = this.calculateSpecializationMatch(volunteer.specializations, criteria.keywords, criteria.specializations);
        score += specializationMatch * this.MATCH_WEIGHTS.SPECIALIZATION;
        // Availability score
        const availabilityScore = this.calculateAvailabilityScore(volunteer);
        score += availabilityScore * this.MATCH_WEIGHTS.AVAILABILITY;
        // Response rate score
        const responseScore = Math.min(volunteer.responseRate, 1);
        score += responseScore * this.MATCH_WEIGHTS.RESPONSE_RATE;
        // Rating score (normalize 5-point scale to 0-1)
        const ratingScore = Math.min(volunteer.averageRating / 5, 1);
        score += ratingScore * this.MATCH_WEIGHTS.RATING;
        // Language match
        const languageMatch = this.calculateLanguageMatch(volunteer.languages, criteria.languages);
        score += languageMatch * this.MATCH_WEIGHTS.LANGUAGE;
        // Urgency bonus for emergency responders
        if (criteria.urgency === 'CRITICAL' && volunteer.emergencyResponder) {
            score += 0.1; // 10% bonus
        }
        return Math.min(score, 1); // Cap at 1.0
    }
    calculateSpecializationMatch(volunteerSpecs, crisisKeywords, requestedSpecs) {
        // Crisis-specific specializations
        const crisisSpecMap = {
            'suicide': ['suicide-prevention', 'crisis-intervention'],
            'self-harm': ['self-harm-support', 'crisis-intervention'],
            'panic': ['anxiety-support', 'panic-disorder'],
            'depression': ['depression-support', 'mood-disorders'],
            'trauma': ['trauma-support', 'ptsd-support'],
            'addiction': ['addiction-support', 'substance-abuse'],
        };
        let matchScore = 0;
        let totalPossible = 0;
        // Check keyword-based specialization matches
        for (const keyword of crisisKeywords) {
            const requiredSpecs = crisisSpecMap[keyword.toLowerCase()] || [];
            for (const spec of requiredSpecs) {
                totalPossible++;
                if (volunteerSpecs.includes(spec)) {
                    matchScore++;
                }
            }
        }
        // Check direct specialization requests
        if (requestedSpecs) {
            for (const spec of requestedSpecs) {
                totalPossible++;
                if (volunteerSpecs.includes(spec)) {
                    matchScore++;
                }
            }
        }
        // General crisis intervention is always valuable
        if (volunteerSpecs.includes('crisis-intervention')) {
            matchScore += 0.5;
            totalPossible += 0.5;
        }
        return totalPossible > 0 ? matchScore / totalPossible : 0.5; // Default 50% if no specific criteria
    }
    calculateAvailabilityScore(volunteer) {
        const loadRatio = volunteer.currentLoad / volunteer.maxConcurrent;
        // Perfect availability = 1.0, full capacity = 0.0
        const availabilityScore = 1 - loadRatio;
        // Bonus for recently active volunteers
        const timeSinceActive = Date.now() - volunteer.lastActive.getTime();
        const recentActivityBonus = timeSinceActive < 300000 ? 0.1 : 0; // 5 minutes
        return Math.min(availabilityScore + recentActivityBonus, 1);
    }
    calculateLanguageMatch(volunteerLanguages, requestedLanguages) {
        if (!requestedLanguages || requestedLanguages.length === 0) {
            // Default to English if no preference
            return volunteerLanguages.includes('en') ? 1 : 0.5;
        }
        const matches = requestedLanguages.filter(lang => volunteerLanguages.includes(lang)).length;
        return matches / requestedLanguages.length;
    }
}
//# sourceMappingURL=VolunteerMatcher.js.map