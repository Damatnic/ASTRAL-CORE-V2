import { CrisisProfile } from './types';
export interface VolunteerMatch {
    volunteerId: string;
    matchScore: number;
    availability: boolean;
    specializations: string[];
    experienceLevel: number;
    currentLoad: number;
    estimatedResponseTime: number;
    matchFactors: {
        skillMatch: number;
        availabilityScore: number;
        workloadScore: number;
        experienceScore: number;
    };
}
export declare class VolunteerMatcher {
    private volunteerPool;
    private availabilityCache;
    private workloadTracker;
    constructor();
    findBestMatches(crisis: CrisisProfile, maxMatches?: number): Promise<VolunteerMatch[]>;
    updateVolunteerAvailability(volunteerId: string, isAvailable: boolean): Promise<void>;
    assignVolunteerToCrisis(volunteerId: string, crisisId: string): Promise<boolean>;
    releaseVolunteerFromCrisis(volunteerId: string, crisisId: string): Promise<void>;
    private getAvailableVolunteers;
    private calculateMatch;
    private calculateSkillMatch;
    private calculateAvailabilityScore;
    private calculateWorkloadScore;
    private calculateExperienceScore;
    private calculateOverallMatchScore;
    private estimateResponseTime;
    private initializeVolunteerPool;
}
//# sourceMappingURL=volunteer-match.d.ts.map