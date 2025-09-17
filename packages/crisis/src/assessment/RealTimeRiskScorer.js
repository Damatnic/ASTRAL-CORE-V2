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
export class RealTimeRiskScorer {
    // Risk thresholds
    RISK_THRESHOLDS = {
        MINIMAL: 1,
        LOW: 2.5,
        MODERATE: 4.5,
        HIGH: 6.5,
        CRITICAL: 8,
        EMERGENCY: 9,
    };
    // Component weights for final score calculation
    COMPONENT_WEIGHTS = {
        BASE_RISK: 0.40, // 40% - Keywords and immediate threats
        SENTIMENT_RISK: 0.25, // 25% - Emotional state
        BEHAVIORAL_RISK: 0.20, // 20% - Communication patterns
        PROGRESSION_RISK: 0.15, // 15% - Risk escalation over time
    };
    // Session risk progression tracking
    sessionProgression = new Map();
    /**
     * Calculate comprehensive risk score for a crisis assessment
     * TARGET: <20ms execution time
     */
    async calculateRiskScore(assessment, contextData, sessionId) {
        const startTime = performance.now();
        // Calculate component scores in parallel
        const [baseRisk, sentimentRisk, behavioralRisk, progressionRisk] = await Promise.all([
            this.calculateBaseRisk(assessment),
            this.calculateSentimentRisk(assessment, contextData),
            this.calculateBehavioralRisk(contextData),
            sessionId ? this.calculateProgressionRisk(assessment.severity, sessionId) : Promise.resolve(0),
        ]);
        // Calculate weighted total score
        const totalScore = this.calculateWeightedScore({
            baseRisk,
            sentimentRisk,
            behavioralRisk,
            progressionRisk,
        });
        // Determine risk level and intervention requirements
        const riskLevel = this.determineRiskLevel(totalScore);
        const interventionLevel = this.determineInterventionLevel(totalScore, assessment);
        const immediateAction = this.requiresImmediateAction(totalScore, assessment);
        // Identify risk and protective factors
        const riskFactors = this.identifyRiskFactors(assessment, contextData);
        const protectiveFactors = this.identifyProtectiveFactors(assessment, contextData);
        // Calculate confidence based on multiple indicators
        const confidence = this.calculateAssessmentConfidence(assessment, contextData);
        const executionTime = performance.now() - startTime;
        // Log performance warning if needed
        if (executionTime > 20) {
            console.warn(`⚠️ Risk scoring took ${executionTime.toFixed(2)}ms (target: <20ms)`);
        }
        const riskScore = {
            totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal
            components: {
                baseRisk: Math.round(baseRisk * 10) / 10,
                sentimentRisk: Math.round(sentimentRisk * 10) / 10,
                behavioralRisk: Math.round(behavioralRisk * 10) / 10,
                progressionRisk: Math.round(progressionRisk * 10) / 10,
            },
            riskLevel,
            confidence,
            immediateAction,
            interventionLevel,
            riskFactors,
            protectiveFactors,
            executionTimeMs: executionTime,
        };
        // Update session progression if applicable
        if (sessionId) {
            this.updateSessionProgression(sessionId, totalScore);
        }
        // Log high-risk assessments
        if (riskLevel === 'CRITICAL' || riskLevel === 'EMERGENCY') {
            console.log(`🚨 HIGH-RISK ASSESSMENT: ${riskLevel} (Score: ${totalScore.toFixed(1)}) - Factors: ${riskFactors.join(', ')}`);
        }
        return riskScore;
    }
    /**
     * Get risk progression data for a session
     */
    getSessionProgression(sessionId) {
        return this.sessionProgression.get(sessionId) || null;
    }
    /**
     * Clear session progression data (call when session ends)
     */
    clearSessionProgression(sessionId) {
        this.sessionProgression.delete(sessionId);
    }
    // Private calculation methods
    async calculateBaseRisk(assessment) {
        let baseScore = 1; // Minimum baseline
        // Emergency keywords trigger maximum base risk
        if (assessment.emergencyKeywords.length > 0) {
            baseScore = Math.max(baseScore, 9);
            // Multiple emergency keywords increase risk further
            if (assessment.emergencyKeywords.length > 2) {
                baseScore = 10;
            }
        }
        // Keyword density and severity
        const keywordDensity = assessment.keywordsDetected.length;
        baseScore += Math.min(keywordDensity * 0.3, 3);
        // Direct severity mapping
        baseScore = Math.max(baseScore, assessment.severity * 0.8);
        return Math.min(baseScore, 10);
    }
    async calculateSentimentRisk(assessment, contextData) {
        let sentimentScore = 5; // Neutral baseline
        // Convert sentiment score (-1 to 1) to risk score (1 to 10)
        // More negative sentiment = higher risk
        if (assessment.sentimentScore < 0) {
            sentimentScore = 5 + (Math.abs(assessment.sentimentScore) * 5);
        }
        else {
            sentimentScore = 5 - (assessment.sentimentScore * 3); // Positive sentiment reduces risk less aggressively
        }
        // Emotional intensity modifiers
        if (contextData.emotionalIntensity) {
            sentimentScore += Math.min(contextData.emotionalIntensity * 0.3, 2);
        }
        // Cognitive distortions increase sentiment risk
        if (contextData.cognitiveDistortions) {
            const distortionScore = (contextData.cognitiveDistortions.hopelessness * 0.4 +
                contextData.cognitiveDistortions.catastrophizing * 0.3 +
                contextData.cognitiveDistortions.allOrNothing * 0.2 +
                contextData.cognitiveDistortions.personalization * 0.2);
            sentimentScore += Math.min(distortionScore, 2);
        }
        return Math.max(1, Math.min(sentimentScore, 10));
    }
    async calculateBehavioralRisk(contextData) {
        let behavioralScore = 3; // Baseline behavioral risk
        // High-risk behavioral indicators
        if (contextData.hasPlanningLanguage)
            behavioralScore += 3;
        if (contextData.hasFinalityLanguage)
            behavioralScore += 4;
        if (contextData.hasIsolationIndicators)
            behavioralScore += 2;
        if (contextData.hasIncompleteThoughts)
            behavioralScore += 1;
        if (contextData.hasRapidThoughts)
            behavioralScore += 1.5;
        // Communication fragmentation
        if (contextData.fragmentedSentences > 0) {
            const fragmentationRatio = contextData.fragmentedSentences / (contextData.sentenceCount || 1);
            behavioralScore += fragmentationRatio * 2;
        }
        // Risk escalation score integration
        if (contextData.riskEscalationScore) {
            behavioralScore += contextData.riskEscalationScore * 0.4;
        }
        // Protective behavioral factors
        if (contextData.hasFutureWords)
            behavioralScore -= 1;
        if (contextData.hasSupportWords)
            behavioralScore -= 0.5;
        if (contextData.cognitiveDistortions?.hope > 0)
            behavioralScore -= 0.8;
        return Math.max(1, Math.min(behavioralScore, 10));
    }
    async calculateProgressionRisk(currentScore, sessionId) {
        const progression = this.sessionProgression.get(sessionId);
        if (!progression || progression.previousScores.length < 2) {
            return 0; // No progression data available
        }
        const recentScores = progression.previousScores.slice(-5); // Last 5 scores
        const trend = this.calculateTrend(recentScores);
        let progressionScore = 0;
        switch (progression.escalationTrend) {
            case 'RAPIDLY_ESCALATING':
                progressionScore = 4;
                break;
            case 'WORSENING':
                progressionScore = 2;
                break;
            case 'STABLE':
                progressionScore = 0;
                break;
            case 'IMPROVING':
                progressionScore = -1;
                break;
        }
        // Recent peak considerations
        if (progression.sessionPeak > 8 && currentScore > 6) {
            progressionScore += 1; // Previous high risk in session
        }
        return Math.max(-2, Math.min(progressionScore, 5));
    }
    calculateWeightedScore(components) {
        const weightedSum = (components.baseRisk * this.COMPONENT_WEIGHTS.BASE_RISK +
            components.sentimentRisk * this.COMPONENT_WEIGHTS.SENTIMENT_RISK +
            components.behavioralRisk * this.COMPONENT_WEIGHTS.BEHAVIORAL_RISK +
            Math.max(0, components.progressionRisk) * this.COMPONENT_WEIGHTS.PROGRESSION_RISK);
        // Apply progression risk as additive if negative (improvement)
        const finalScore = components.progressionRisk < 0
            ? weightedSum + components.progressionRisk
            : weightedSum;
        return Math.max(1, Math.min(finalScore, 10));
    }
    determineRiskLevel(score) {
        if (score >= this.RISK_THRESHOLDS.EMERGENCY)
            return 'EMERGENCY';
        if (score >= this.RISK_THRESHOLDS.CRITICAL)
            return 'CRITICAL';
        if (score >= this.RISK_THRESHOLDS.HIGH)
            return 'HIGH';
        if (score >= this.RISK_THRESHOLDS.MODERATE)
            return 'MODERATE';
        if (score >= this.RISK_THRESHOLDS.LOW)
            return 'LOW';
        return 'MINIMAL';
    }
    determineInterventionLevel(score, assessment) {
        if (score >= 9 || assessment.emergencyKeywords.length > 0)
            return 'EMERGENCY';
        if (score >= 7)
            return 'CRISIS_TEAM';
        if (score >= 5)
            return 'PROFESSIONAL';
        if (score >= 3)
            return 'PEER_SUPPORT';
        return 'SELF_HELP';
    }
    requiresImmediateAction(score, assessment) {
        return score >= 8 || assessment.emergencyKeywords.length > 0 || assessment.immediateRisk;
    }
    identifyRiskFactors(assessment, contextData) {
        const factors = [];
        if (assessment.emergencyKeywords.length > 0) {
            factors.push(`Emergency keywords detected: ${assessment.emergencyKeywords.join(', ')}`);
        }
        if (contextData.hasPlanningLanguage)
            factors.push('Planning language detected');
        if (contextData.hasFinalityLanguage)
            factors.push('Finality language detected');
        if (contextData.hasIsolationIndicators)
            factors.push('Social isolation indicators');
        if (contextData.hasImmediateTimeWords)
            factors.push('Immediate time references');
        if (contextData.emotionalIntensity > 7)
            factors.push('High emotional intensity');
        if (contextData.hasRapidThoughts)
            factors.push('Rapid thought patterns');
        if (contextData.cognitiveDistortions?.hopelessness > 2)
            factors.push('Hopelessness expressions');
        if (assessment.sentimentScore < -0.5)
            factors.push('Very negative sentiment');
        return factors;
    }
    identifyProtectiveFactors(assessment, contextData) {
        const factors = [];
        if (contextData.hasSupportWords)
            factors.push('Support system mentioned');
        if (contextData.hasFutureWords)
            factors.push('Future-oriented thinking');
        if (contextData.cognitiveDistortions?.hope > 0)
            factors.push('Hope expressions');
        if (assessment.sentimentScore > 0.2)
            factors.push('Positive sentiment detected');
        if (contextData.copingMatches?.length > 0)
            factors.push('Coping strategies mentioned');
        return factors;
    }
    calculateAssessmentConfidence(assessment, contextData) {
        let confidence = assessment.confidence || 0.5;
        // More indicators = higher confidence
        const indicatorCount = assessment.keywordsDetected.length + (contextData.emotionalIntensity || 0);
        confidence += Math.min(indicatorCount * 0.05, 0.3);
        // Emergency keywords provide high confidence
        if (assessment.emergencyKeywords.length > 0) {
            confidence += 0.2;
        }
        // Multiple risk factors increase confidence
        const riskFactorCount = [
            contextData.hasPlanningLanguage,
            contextData.hasFinalityLanguage,
            contextData.hasIsolationIndicators,
            contextData.hasImmediateTimeWords,
        ].filter(Boolean).length;
        confidence += riskFactorCount * 0.1;
        return Math.min(confidence, 1);
    }
    updateSessionProgression(sessionId, newScore) {
        let progression = this.sessionProgression.get(sessionId);
        if (!progression) {
            progression = {
                previousScores: [],
                timeIntervals: [],
                escalationTrend: 'STABLE',
                sessionAverage: newScore,
                sessionPeak: newScore,
            };
        }
        const now = Date.now();
        if (progression.previousScores.length > 0) {
            const lastTimestamp = progression.timeIntervals[progression.timeIntervals.length - 1] || now;
            progression.timeIntervals.push(now - lastTimestamp);
        }
        progression.previousScores.push(newScore);
        progression.sessionPeak = Math.max(progression.sessionPeak, newScore);
        progression.sessionAverage = progression.previousScores.reduce((a, b) => a + b, 0) / progression.previousScores.length;
        // Keep only last 10 scores for performance
        if (progression.previousScores.length > 10) {
            progression.previousScores.shift();
            progression.timeIntervals.shift();
        }
        // Update trend
        progression.escalationTrend = this.calculateEscalationTrend(progression.previousScores);
        this.sessionProgression.set(sessionId, progression);
    }
    calculateTrend(scores) {
        if (scores.length < 2)
            return 0;
        const recent = scores.slice(-3);
        const older = scores.slice(-6, -3);
        if (older.length === 0)
            return 0;
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return recentAvg - olderAvg;
    }
    calculateEscalationTrend(scores) {
        if (scores.length < 3)
            return 'STABLE';
        const trend = this.calculateTrend(scores);
        const recentChange = scores[scores.length - 1] - scores[scores.length - 2];
        if (trend > 1.5 || recentChange > 2)
            return 'RAPIDLY_ESCALATING';
        if (trend > 0.5)
            return 'WORSENING';
        if (trend < -0.5)
            return 'IMPROVING';
        return 'STABLE';
    }
}
//# sourceMappingURL=RealTimeRiskScorer.js.map