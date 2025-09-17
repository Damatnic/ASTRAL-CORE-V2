export class VolunteerMatcher {
    volunteerPool = new Map();
    availabilityCache = new Map();
    workloadTracker = new Map();
    constructor() {
        this.initializeVolunteerPool();
    }
    async findBestMatches(crisis, maxMatches = 5) {
        const availableVolunteers = await this.getAvailableVolunteers();
        const matches = [];
        for (const volunteer of availableVolunteers) {
            const match = await this.calculateMatch(crisis, volunteer);
            if (match.matchScore > 0.6) {
                matches.push(match);
            }
        }
        return matches
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, maxMatches);
    }
    async updateVolunteerAvailability(volunteerId, isAvailable) {
        this.availabilityCache.set(volunteerId, isAvailable);
        if (!isAvailable) {
            this.workloadTracker.set(volunteerId, 0);
        }
    }
    async assignVolunteerToCrisis(volunteerId, crisisId) {
        const currentLoad = this.workloadTracker.get(volunteerId) || 0;
        const maxLoad = 3; // Maximum concurrent crisis sessions
        if (currentLoad >= maxLoad) {
            return false;
        }
        this.workloadTracker.set(volunteerId, currentLoad + 1);
        this.availabilityCache.set(volunteerId, currentLoad + 1 < maxLoad);
        return true;
    }
    async releaseVolunteerFromCrisis(volunteerId, crisisId) {
        const currentLoad = this.workloadTracker.get(volunteerId) || 0;
        const newLoad = Math.max(0, currentLoad - 1);
        this.workloadTracker.set(volunteerId, newLoad);
        this.availabilityCache.set(volunteerId, true);
    }
    async getAvailableVolunteers() {
        const available = [];
        this.volunteerPool.forEach((volunteer, id) => {
            if (this.availabilityCache.get(id) !== false &&
                (this.workloadTracker.get(id) || 0) < 3) {
                available.push(volunteer);
            }
        });
        return available;
    }
    async calculateMatch(crisis, volunteer) {
        const skillMatch = this.calculateSkillMatch(crisis, volunteer);
        const availabilityScore = this.calculateAvailabilityScore(volunteer.id);
        const workloadScore = this.calculateWorkloadScore(volunteer.id);
        const experienceScore = this.calculateExperienceScore(volunteer, crisis);
        const matchScore = this.calculateOverallMatchScore({
            skillMatch,
            availabilityScore,
            workloadScore,
            experienceScore
        });
        return {
            volunteerId: volunteer.id,
            matchScore,
            availability: this.availabilityCache.get(volunteer.id) !== false,
            specializations: volunteer.specializations || [],
            experienceLevel: volunteer.experienceLevel || 1,
            currentLoad: this.workloadTracker.get(volunteer.id) || 0,
            estimatedResponseTime: this.estimateResponseTime(volunteer),
            matchFactors: {
                skillMatch,
                availabilityScore,
                workloadScore,
                experienceScore
            }
        };
    }
    calculateSkillMatch(crisis, volunteer) {
        const requiredSkills = crisis.requiredSkills || [];
        const volunteerSkills = volunteer.specializations || [];
        if (requiredSkills.length === 0)
            return 0.5;
        const matchingSkills = requiredSkills.filter(skill => volunteerSkills.includes(skill));
        return matchingSkills.length / requiredSkills.length;
    }
    calculateAvailabilityScore(volunteerId) {
        const isAvailable = this.availabilityCache.get(volunteerId) !== false;
        return isAvailable ? 1.0 : 0.0;
    }
    calculateWorkloadScore(volunteerId) {
        const currentLoad = this.workloadTracker.get(volunteerId) || 0;
        const maxLoad = 3;
        return Math.max(0, (maxLoad - currentLoad) / maxLoad);
    }
    calculateExperienceScore(volunteer, crisis) {
        const experience = volunteer.experienceLevel || 1;
        const crisisComplexity = crisis.complexityLevel || 1;
        // Higher experience is better, but over-qualification isn't penalized much
        const ratio = experience / Math.max(crisisComplexity, 1);
        return Math.min(ratio, 1.0);
    }
    calculateOverallMatchScore(factors) {
        const weights = {
            skillMatch: 0.4,
            availabilityScore: 0.3,
            workloadScore: 0.2,
            experienceScore: 0.1
        };
        return Object.entries(factors).reduce((score, [key, value]) => {
            return score + (value * weights[key]);
        }, 0);
    }
    estimateResponseTime(volunteer) {
        const baseTime = 60; // 1 minute base
        const currentLoad = this.workloadTracker.get(volunteer.id) || 0;
        return baseTime + (currentLoad * 30); // Add 30 seconds per current session
    }
    initializeVolunteerPool() {
        // Initialize with sample volunteers - in real implementation, this would load from database
    }
}
//# sourceMappingURL=volunteer-match.js.map