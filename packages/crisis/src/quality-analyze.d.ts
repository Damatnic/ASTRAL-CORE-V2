import { VolunteerProfile, PerformanceAnalysis } from './types';
export interface QualityAssessment {
    volunteerId: string;
    overallScore: number;
    responseTime: number;
    communicationQuality: number;
    empathyLevel: number;
    professionalismScore: number;
    knowledgeBase: number;
    recommendations: string[];
}
export declare class QualityAnalyzer {
    private qualityMetrics;
    private performanceHistory;
    constructor();
    analyzeVolunteerQuality(volunteer: VolunteerProfile, sessionData: any[]): Promise<QualityAssessment>;
    generatePerformanceReport(volunteerId: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<PerformanceAnalysis>;
    private calculateAverageResponseTime;
    private assessCommunicationQuality;
    private measureEmpathyLevel;
    private evaluateProfessionalism;
    private assessKnowledgeBase;
    private calculateOverallScore;
    private generateRecommendations;
    private calculateTrend;
    private initializeQualityStandards;
}
//# sourceMappingURL=quality-analyze.d.ts.map