/**
 * ASTRAL_CORE 2.0 Crisis Severity Assessment System
 *
 * AI-POWERED LIFE-SAVING ANALYSIS:
 * - Real-time keyword detection
 * - Sentiment analysis for emotional state
 * - Risk scoring with immediate escalation triggers
 * - Context-aware severity assessment
 * - Multi-language support for global reach
 *
 * PERFORMANCE TARGETS:
 * - Assessment time: <20ms
 * - Accuracy: >95% for emergency detection
 * - False positive rate: <2% for emergency escalation
 */
import type { CrisisAssessment } from '../types/assessment.types';
export declare class CrisisSeverityAssessment {
    private readonly emergencyKeywords;
    private readonly highRiskKeywords;
    private readonly moderateRiskKeywords;
    private readonly positiveKeywords;
    private readonly copingKeywords;
    /**
     * Assesses crisis severity of a message
     * TARGET: <20ms execution time
     */
    assessMessage(message: string): Promise<CrisisAssessment>;
    /**
     * Checks if a keyword triggers emergency protocol
     */
    isEmergencyKeyword(keyword: string): boolean;
    /**
     * Gets severity threshold for emergency escalation
     */
    getEmergencyThreshold(): number;
    private analyzeKeywords;
    private analyzeSentiment;
    private analyzeContext;
    private calculateBaseSeverity;
    private adjustForSentiment;
    private applyContextualAdjustments;
    private calculateConfidence;
    private getRecommendedActions;
}
//# sourceMappingURL=CrisisSeverityAssessment.d.ts.map