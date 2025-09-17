/**
 * ASTRAL_CORE 2.0 Real-Time Risk Assessment Scoring System
 *
 * LIFE-CRITICAL RISK SCORING:
 * - Provides 1-10 scale risk assessment with sub-scores
 * - Real-time updates as conversation progresses
 * - Machine learning-enhanced pattern recognition
 * - Sub-20ms execution time for immediate response
 *
 * SCORING METHODOLOGY:
 * - Base Score (40%): Keyword analysis and immediate threats
 * - Sentiment Score (25%): Emotional state and intensity
 * - Behavioral Score (20%): Communication patterns and context
 * - Progression Score (15%): Risk escalation over time
 */
import type { CrisisAssessment } from '../types/assessment.types';
export interface RiskScoreBreakdown {
    /** Overall risk score 1-10 */
    totalScore: number;
    /** Component scores */
    components: {
        baseRisk: number;
        sentimentRisk: number;
        behavioralRisk: number;
        progressionRisk: number;
    };
    /** Risk level classification */
    riskLevel: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
    /** Confidence in assessment */
    confidence: number;
    /** Immediate action required */
    immediateAction: boolean;
    /** Recommended intervention level */
    interventionLevel: 'SELF_HELP' | 'PEER_SUPPORT' | 'PROFESSIONAL' | 'CRISIS_TEAM' | 'EMERGENCY';
    /** Key risk factors identified */
    riskFactors: string[];
    /** Protective factors identified */
    protectiveFactors: string[];
    /** Assessment execution time */
    executionTimeMs: number;
}
export interface RiskProgressionData {
    /** Previous risk scores (last 10 assessments) */
    previousScores: number[];
    /** Time intervals between assessments */
    timeIntervals: number[];
    /** Escalation trend */
    escalationTrend: 'IMPROVING' | 'STABLE' | 'WORSENING' | 'RAPIDLY_ESCALATING';
    /** Average risk over session */
    sessionAverage: number;
    /** Peak risk during session */
    sessionPeak: number;
}
export declare class RealTimeRiskScorer {
    private readonly RISK_THRESHOLDS;
    private readonly COMPONENT_WEIGHTS;
    private readonly sessionProgression;
    /**
     * Calculate comprehensive risk score for a crisis assessment
     * TARGET: <20ms execution time
     */
    calculateRiskScore(assessment: CrisisAssessment, contextData: any, sessionId?: string): Promise<RiskScoreBreakdown>;
    /**
     * Get risk progression data for a session
     */
    getSessionProgression(sessionId: string): RiskProgressionData | null;
    /**
     * Clear session progression data (call when session ends)
     */
    clearSessionProgression(sessionId: string): void;
    private calculateBaseRisk;
    private calculateSentimentRisk;
    private calculateBehavioralRisk;
    private calculateProgressionRisk;
    private calculateWeightedScore;
    private determineRiskLevel;
    private determineInterventionLevel;
    private requiresImmediateAction;
    private identifyRiskFactors;
    private identifyProtectiveFactors;
    private calculateAssessmentConfidence;
    private updateSessionProgression;
    private calculateTrend;
    private calculateEscalationTrend;
}
//# sourceMappingURL=RealTimeRiskScorer.d.ts.map