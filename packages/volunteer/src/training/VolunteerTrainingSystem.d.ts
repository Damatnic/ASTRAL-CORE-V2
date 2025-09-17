/**
 * ASTRAL_CORE 2.0 Volunteer Training System
 * Manages volunteer training, certification, and skill development
 */
export interface TrainingModule {
    id: string;
    name: string;
    description: string;
    duration: number;
    requiredScore: number;
    prerequisites: string[];
    content: TrainingContent[];
}
export interface TrainingContent {
    type: 'video' | 'text' | 'quiz' | 'simulation';
    title: string;
    content: string;
    duration?: number;
    questions?: QuizQuestion[];
}
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}
export interface TrainingProgress {
    volunteerId: string;
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    score?: number;
    completedAt?: Date;
    attempts: number;
    timeSpent: number;
}
export interface CertificationLevel {
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    requiredModules: string[];
    validityPeriod: number;
    renewalRequired: boolean;
}
export declare class VolunteerTrainingSystem {
    private trainingModules;
    private volunteerProgress;
    private certifications;
    constructor();
    /**
     * Initialize core training modules for crisis intervention
     */
    private initializeTrainingModules;
    /**
     * Initialize certification levels and requirements
     */
    private initializeCertificationLevels;
    /**
     * Start training module for a volunteer
     */
    startTraining(volunteerId: string, moduleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Complete training module and record results
     */
    completeTraining(volunteerId: string, moduleId: string, score: number, timeSpent: number): Promise<{
        success: boolean;
        message: string;
        certified?: boolean;
    }>;
    /**
     * Check if volunteer meets prerequisites for a module
     */
    private checkPrerequisites;
    /**
     * Check if volunteer is eligible for certification
     */
    private checkCertificationEligibility;
    /**
     * Award certification to volunteer
     */
    private awardCertification;
    /**
     * Get training progress for a volunteer
     */
    getTrainingProgress(volunteerId: string): TrainingProgress[];
    /**
     * Get available training modules
     */
    getAvailableModules(volunteerId?: string): TrainingModule[];
    /**
     * Get volunteer's current certification level
     */
    getCertificationLevel(volunteerId: string): string | null;
    /**
     * Generate training analytics
     */
    generateTrainingAnalytics(): {
        totalVolunteers: number;
        completionRates: Record<string, number>;
        averageScores: Record<string, number>;
        certificationDistribution: Record<string, number>;
    };
}
//# sourceMappingURL=VolunteerTrainingSystem.d.ts.map