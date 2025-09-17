/**
 * ASTRAL_CORE 2.0 Burnout Prevention System
 * Monitors volunteer wellness and prevents burnout through proactive intervention
 */
export interface BurnoutRiskFactors {
    sessionCount: number;
    averageSessionDuration: number;
    consecutiveDays: number;
    highStressSessions: number;
    lastBreakDays: number;
    selfReportedStress: number;
    responseTime: number;
    escalationRate: number;
}
export interface WellnessMetrics {
    volunteerId: string;
    timestamp: Date;
    stressLevel: number;
    energyLevel: number;
    satisfactionLevel: number;
    workloadRating: number;
    supportNeeded: boolean;
    notes?: string;
}
export interface BurnoutAlert {
    volunteerId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
    timestamp: Date;
    actionRequired: boolean;
}
export interface WellnessIntervention {
    type: 'break_reminder' | 'workload_reduction' | 'peer_support' | 'professional_referral' | 'mandatory_break';
    duration?: number;
    message: string;
    followUpRequired: boolean;
}
export declare class BurnoutPreventionSystem {
    private riskThresholds;
    private wellnessData;
    private activeAlerts;
    private interventionHistory;
    /**
     * Assess burnout risk for a volunteer
     */
    assessBurnoutRisk(volunteerId: string, factors: BurnoutRiskFactors): Promise<BurnoutAlert>;
    /**
     * Record wellness check-in from volunteer
     */
    recordWellnessCheckIn(volunteerId: string, metrics: Omit<WellnessMetrics, 'volunteerId' | 'timestamp'>): Promise<void>;
    /**
     * Analyze wellness trends for early warning signs
     */
    private analyzeWellnessTrends;
    /**
     * Trigger appropriate intervention based on risk level
     */
    private triggerIntervention;
    /**
     * Reduce volunteer's maximum concurrent sessions
     */
    private reduceVolunteerLoad;
    /**
     * Generate personalized recommendations based on risk factors
     */
    private generateRecommendations;
    /**
     * Get wellness summary for a volunteer
     */
    getWellnessSummary(volunteerId: string): {
        currentRiskLevel: string;
        recentMetrics: WellnessMetrics[];
        activeAlerts: BurnoutAlert[];
        interventionHistory: WellnessIntervention[];
    };
    /**
     * Schedule wellness check-in reminder
     */
    scheduleWellnessCheckIn(volunteerId: string): Promise<void>;
    /**
     * Generate system-wide burnout analytics
     */
    generateBurnoutAnalytics(): {
        totalVolunteers: number;
        riskDistribution: Record<string, number>;
        interventionStats: Record<string, number>;
        averageWellnessScores: {
            stress: number;
            energy: number;
            satisfaction: number;
            workload: number;
        };
    };
    /**
     * Clear resolved alerts
     */
    clearResolvedAlerts(volunteerId: string): void;
    /**
     * Get volunteers at risk
     */
    getVolunteersAtRisk(): {
        volunteerId: string;
        riskLevel: string;
        lastAlert: Date;
    }[];
    /**
     * Provide peer support matching for stressed volunteers
     */
    providePeerSupport(volunteerId: string): Promise<{
        success: boolean;
        supportVolunteerId?: string;
    }>;
    /**
     * Generate wellness report for volunteer
     */
    generateWellnessReport(volunteerId: string): {
        overallWellness: 'excellent' | 'good' | 'concerning' | 'critical';
        trends: {
            stress: 'improving' | 'stable' | 'worsening';
            energy: 'improving' | 'stable' | 'worsening';
            satisfaction: 'improving' | 'stable' | 'worsening';
        };
        recommendations: string[];
        nextCheckIn: Date;
    };
    /**
     * Calculate trends from wellness data
     */
    private calculateTrends;
    /**
     * Generate wellness recommendations
     */
    private generateWellnessRecommendations;
}
//# sourceMappingURL=BurnoutPreventionSystem.d.ts.map