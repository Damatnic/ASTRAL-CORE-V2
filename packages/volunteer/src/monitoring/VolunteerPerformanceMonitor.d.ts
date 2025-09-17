/**
 * ASTRAL_CORE 2.0 Volunteer Performance Monitor
 * Tracks and analyzes volunteer performance metrics for quality assurance
 */
export interface PerformanceMetrics {
    volunteerId: string;
    sessionId: string;
    timestamp: Date;
    responseTime: number;
    sessionDuration: number;
    resolutionTime: number;
    escalationRequired: boolean;
    userSatisfactionRating?: number;
    peerReviewScore?: number;
    followUpCompleted: boolean;
    technicalIssues: boolean;
    notes?: string;
}
export interface PerformanceAnalysis {
    volunteerId: string;
    period: 'week' | 'month' | 'quarter';
    metrics: {
        totalSessions: number;
        averageResponseTime: number;
        averageSessionDuration: number;
        averageResolutionTime: number;
        escalationRate: number;
        satisfactionScore: number;
        peerReviewScore: number;
        followUpRate: number;
        technicalIssueRate: number;
    };
    trends: {
        responseTime: 'improving' | 'stable' | 'declining';
        sessionQuality: 'improving' | 'stable' | 'declining';
        userSatisfaction: 'improving' | 'stable' | 'declining';
    };
    strengths: string[];
    improvementAreas: string[];
    recommendations: string[];
}
export interface QualityBenchmarks {
    responseTime: {
        excellent: number;
        good: number;
        acceptable: number;
    };
    sessionDuration: {
        excellent: number;
        good: number;
        acceptable: number;
    };
    escalationRate: {
        excellent: number;
        good: number;
        acceptable: number;
    };
    satisfactionScore: {
        excellent: number;
        good: number;
        acceptable: number;
    };
    followUpRate: {
        excellent: number;
        good: number;
        acceptable: number;
    };
}
export declare class VolunteerPerformanceMonitor {
    private performanceData;
    private benchmarks;
    /**
     * Record performance metrics for a completed session
     */
    recordSessionPerformance(metrics: PerformanceMetrics): Promise<void>;
    /**
     * Generate comprehensive performance analysis
     */
    generatePerformanceAnalysis(volunteerId: string, period: 'week' | 'month' | 'quarter'): PerformanceAnalysis;
    /**
     * Get period cutoff date
     */
    private getPeriodCutoff;
    /**
     * Get default analysis for volunteers with no data
     */
    private getDefaultAnalysis;
    /**
     * Calculate performance trends
     */
    private calculatePerformanceTrends;
    /**
     * Analyze performance areas
     */
    private analyzePerformanceAreas;
    /**
     * Generate performance recommendations
     */
    private generatePerformanceRecommendations;
    /**
     * Get performance ranking among all volunteers
     */
    getPerformanceRanking(volunteerId: string): {
        overallRank: number;
        totalVolunteers: number;
        percentile: number;
        topPerformers: boolean;
    };
    /**
     * Calculate composite performance score
     */
    private calculateCompositeScore;
    /**
     * Get top performing volunteers
     */
    getTopPerformers(limit?: number): {
        volunteerId: string;
        score: number;
        rank: number;
        keyStrengths: string[];
    }[];
    /**
     * Generate system-wide performance analytics
     */
    generateSystemAnalytics(): {
        totalVolunteers: number;
        totalSessions: number;
        averageMetrics: {
            responseTime: number;
            sessionDuration: number;
            escalationRate: number;
            satisfactionScore: number;
            followUpRate: number;
        };
        performanceDistribution: {
            excellent: number;
            good: number;
            acceptable: number;
            needsImprovement: number;
        };
        trends: {
            responseTime: number;
            sessionQuality: number;
            userSatisfaction: number;
        };
    };
    /**
     * Calculate average satisfaction from metrics with ratings
     */
    private calculateAverageSatisfaction;
    /**
     * Calculate performance distribution across volunteers
     */
    private calculatePerformanceDistribution;
    /**
     * Calculate system-wide trends
     */
    private calculateSystemTrends;
    /**
     * Get volunteers needing performance improvement
     */
    getVolunteersNeedingImprovement(): {
        volunteerId: string;
        score: number;
        primaryConcerns: string[];
        urgency: 'low' | 'medium' | 'high';
    }[];
}
//# sourceMappingURL=VolunteerPerformanceMonitor.d.ts.map