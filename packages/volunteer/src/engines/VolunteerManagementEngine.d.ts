/**
 * ASTRAL_CORE 2.0 Volunteer Management Engine
 *
 * Manages the complete volunteer lifecycle from application to expert responder.
 * Ensures every volunteer is properly trained, supported, and matched effectively.
 */
import { VolunteerStatus } from '@astralcore/database';
import type { VolunteerApplication, VolunteerProfile, VolunteerStats, VolunteerOnboardingResult, VolunteerAssignment } from '../types/volunteer.types';
export declare class VolunteerManagementEngine {
    private static instance;
    private readonly trainingSystem;
    private readonly burnoutPrevention;
    private readonly performanceMonitor;
    private readonly backgroundVerification;
    private constructor();
    static getInstance(): VolunteerManagementEngine;
    /**
     * Process new volunteer application
     * Complete onboarding pipeline from application to active volunteer
     */
    processApplication(application: VolunteerApplication): Promise<VolunteerOnboardingResult>;
    /**
     * Update volunteer status through the pipeline
     */
    updateVolunteerStatus(volunteerId: string, newStatus: VolunteerStatus, reason?: string, metadata?: any): Promise<void>;
    /**
     * Get available volunteers for crisis assignment
     */
    getAvailableVolunteers(criteria?: {
        specializations?: string[];
        languages?: string[];
        maxCurrentLoad?: number;
        emergencyOnly?: boolean;
    }): Promise<VolunteerProfile[]>;
    /**
     * Assign volunteer to crisis session
     */
    assignToCrisisSession(volunteerId: string, sessionId: string, priority?: 'low' | 'normal' | 'high' | 'emergency'): Promise<VolunteerAssignment>;
    /**
     * Complete volunteer session and update performance metrics
     */
    completeSession(volunteerId: string, sessionId: string, outcome: {
        duration: number;
        userSatisfaction?: number;
        notes?: string;
        escalated?: boolean;
    }): Promise<void>;
    /**
     * Get comprehensive volunteer statistics
     */
    getVolunteerStats(): Promise<VolunteerStats>;
    private validateApplication;
    private activateVolunteer;
    private suspendVolunteer;
    private revokeVolunteer;
    private estimateResponseTime;
    private startVolunteerMonitoring;
}
//# sourceMappingURL=VolunteerManagementEngine.d.ts.map