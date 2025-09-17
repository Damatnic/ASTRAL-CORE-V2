/**
 * ASTRAL_CORE 2.0 Volunteer Performance Monitor
 * Tracks and analyzes volunteer performance metrics for quality assurance
 */
import { recordVolunteerSession } from '../../../database/src/utils/volunteer';
export class VolunteerPerformanceMonitor {
    performanceData = new Map();
    benchmarks = {
        responseTime: { excellent: 30, good: 60, acceptable: 120 }, // seconds
        sessionDuration: { excellent: 30, good: 45, acceptable: 60 }, // minutes
        escalationRate: { excellent: 10, good: 20, acceptable: 35 }, // percentage
        satisfactionScore: { excellent: 4.5, good: 4.0, acceptable: 3.5 }, // 1-5 scale
        followUpRate: { excellent: 95, good: 85, acceptable: 75 } // percentage
    };
    /**
     * Record performance metrics for a completed session
     */
    async recordSessionPerformance(metrics) {
        try {
            const volunteerMetrics = this.performanceData.get(metrics.volunteerId) || [];
            volunteerMetrics.push(metrics);
            // Keep only last 100 sessions per volunteer
            if (volunteerMetrics.length > 100) {
                volunteerMetrics.splice(0, volunteerMetrics.length - 100);
            }
            this.performanceData.set(metrics.volunteerId, volunteerMetrics);
            // Record performance tracking session
            await recordVolunteerSession({
                volunteerId: metrics.volunteerId,
                sessionType: 'PERFORMANCE_REVIEW',
                crisisSessionId: metrics.sessionId
            });
            console.log(`Performance metrics recorded for volunteer ${metrics.volunteerId}`);
        }
        catch (error) {
            console.error('Error recording performance metrics:', error);
        }
    }
    /**
     * Generate comprehensive performance analysis
     */
    generatePerformanceAnalysis(volunteerId, period) {
        const allMetrics = this.performanceData.get(volunteerId) || [];
        // Filter metrics by period
        const cutoffDate = this.getPeriodCutoff(period);
        const periodMetrics = allMetrics.filter(metric => metric.timestamp >= cutoffDate);
        if (periodMetrics.length === 0) {
            return this.getDefaultAnalysis(volunteerId, period);
        }
        // Calculate metrics
        const totalSessions = periodMetrics.length;
        const averageResponseTime = periodMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalSessions;
        const averageSessionDuration = periodMetrics.reduce((sum, m) => sum + m.sessionDuration, 0) / totalSessions;
        const averageResolutionTime = periodMetrics.reduce((sum, m) => sum + m.resolutionTime, 0) / totalSessions;
        const escalationRate = (periodMetrics.filter(m => m.escalationRequired).length / totalSessions) * 100;
        const satisfactionRatings = periodMetrics.filter(m => m.userSatisfactionRating !== undefined);
        const satisfactionScore = satisfactionRatings.length > 0
            ? satisfactionRatings.reduce((sum, m) => sum + (m.userSatisfactionRating || 0), 0) / satisfactionRatings.length
            : 0;
        const peerReviews = periodMetrics.filter(m => m.peerReviewScore !== undefined);
        const peerReviewScore = peerReviews.length > 0
            ? peerReviews.reduce((sum, m) => sum + (m.peerReviewScore || 0), 0) / peerReviews.length
            : 0;
        const followUpRate = (periodMetrics.filter(m => m.followUpCompleted).length / totalSessions) * 100;
        const technicalIssueRate = (periodMetrics.filter(m => m.technicalIssues).length / totalSessions) * 100;
        // Calculate trends
        const trends = this.calculatePerformanceTrends(periodMetrics);
        // Identify strengths and improvement areas
        const { strengths, improvementAreas } = this.analyzePerformanceAreas({
            averageResponseTime,
            averageSessionDuration,
            escalationRate,
            satisfactionScore,
            followUpRate,
            technicalIssueRate
        });
        // Generate recommendations
        const recommendations = this.generatePerformanceRecommendations(improvementAreas, trends);
        return {
            volunteerId,
            period,
            metrics: {
                totalSessions,
                averageResponseTime,
                averageSessionDuration,
                averageResolutionTime,
                escalationRate,
                satisfactionScore,
                peerReviewScore,
                followUpRate,
                technicalIssueRate
            },
            trends,
            strengths,
            improvementAreas,
            recommendations
        };
    }
    /**
     * Get period cutoff date
     */
    getPeriodCutoff(period) {
        const now = new Date();
        switch (period) {
            case 'week':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case 'quarter':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        }
    }
    /**
     * Get default analysis for volunteers with no data
     */
    getDefaultAnalysis(volunteerId, period) {
        return {
            volunteerId,
            period,
            metrics: {
                totalSessions: 0,
                averageResponseTime: 0,
                averageSessionDuration: 0,
                averageResolutionTime: 0,
                escalationRate: 0,
                satisfactionScore: 0,
                peerReviewScore: 0,
                followUpRate: 0,
                technicalIssueRate: 0
            },
            trends: {
                responseTime: 'stable',
                sessionQuality: 'stable',
                userSatisfaction: 'stable'
            },
            strengths: [],
            improvementAreas: ['Complete first crisis session to establish baseline metrics'],
            recommendations: ['Begin with basic crisis intervention training', 'Shadow experienced volunteers']
        };
    }
    /**
     * Calculate performance trends
     */
    calculatePerformanceTrends(metrics) {
        if (metrics.length < 6) {
            return { responseTime: 'stable', sessionQuality: 'stable', userSatisfaction: 'stable' };
        }
        const midpoint = Math.floor(metrics.length / 2);
        const firstHalf = metrics.slice(0, midpoint);
        const secondHalf = metrics.slice(midpoint);
        // Response time trend
        const firstAvgResponse = firstHalf.reduce((sum, m) => sum + m.responseTime, 0) / firstHalf.length;
        const secondAvgResponse = secondHalf.reduce((sum, m) => sum + m.responseTime, 0) / secondHalf.length;
        const responseTimeTrend = secondAvgResponse < firstAvgResponse * 0.9 ? 'improving' :
            secondAvgResponse > firstAvgResponse * 1.1 ? 'declining' : 'stable';
        // Session quality trend (based on escalation rate and peer reviews)
        const firstEscalationRate = (firstHalf.filter(m => m.escalationRequired).length / firstHalf.length) * 100;
        const secondEscalationRate = (secondHalf.filter(m => m.escalationRequired).length / secondHalf.length) * 100;
        const sessionQualityTrend = secondEscalationRate < firstEscalationRate * 0.8 ? 'improving' :
            secondEscalationRate > firstEscalationRate * 1.2 ? 'declining' : 'stable';
        // User satisfaction trend
        const firstSatisfaction = firstHalf.filter(m => m.userSatisfactionRating !== undefined);
        const secondSatisfaction = secondHalf.filter(m => m.userSatisfactionRating !== undefined);
        let userSatisfactionTrend = 'stable';
        if (firstSatisfaction.length > 0 && secondSatisfaction.length > 0) {
            const firstAvgSat = firstSatisfaction.reduce((sum, m) => sum + (m.userSatisfactionRating || 0), 0) / firstSatisfaction.length;
            const secondAvgSat = secondSatisfaction.reduce((sum, m) => sum + (m.userSatisfactionRating || 0), 0) / secondSatisfaction.length;
            userSatisfactionTrend = secondAvgSat > firstAvgSat + 0.2 ? 'improving' :
                secondAvgSat < firstAvgSat - 0.2 ? 'declining' : 'stable';
        }
        return {
            responseTime: responseTimeTrend,
            sessionQuality: sessionQualityTrend,
            userSatisfaction: userSatisfactionTrend
        };
    }
    /**
     * Analyze performance areas
     */
    analyzePerformanceAreas(metrics) {
        const strengths = [];
        const improvementAreas = [];
        // Response time analysis
        if (metrics.averageResponseTime <= this.benchmarks.responseTime.excellent) {
            strengths.push('Excellent response time');
        }
        else if (metrics.averageResponseTime <= this.benchmarks.responseTime.good) {
            strengths.push('Good response time');
        }
        else if (metrics.averageResponseTime > this.benchmarks.responseTime.acceptable) {
            improvementAreas.push('Response time needs improvement');
        }
        // Session duration analysis
        if (metrics.averageSessionDuration <= this.benchmarks.sessionDuration.excellent) {
            strengths.push('Efficient session management');
        }
        else if (metrics.averageSessionDuration > this.benchmarks.sessionDuration.acceptable) {
            improvementAreas.push('Session duration optimization needed');
        }
        // Escalation rate analysis
        if (metrics.escalationRate <= this.benchmarks.escalationRate.excellent) {
            strengths.push('Excellent crisis resolution skills');
        }
        else if (metrics.escalationRate > this.benchmarks.escalationRate.acceptable) {
            improvementAreas.push('High escalation rate - consider additional training');
        }
        // Satisfaction score analysis
        if (metrics.satisfactionScore >= this.benchmarks.satisfactionScore.excellent) {
            strengths.push('Outstanding user satisfaction');
        }
        else if (metrics.satisfactionScore < this.benchmarks.satisfactionScore.acceptable) {
            improvementAreas.push('User satisfaction below expectations');
        }
        // Follow-up rate analysis
        if (metrics.followUpRate >= this.benchmarks.followUpRate.excellent) {
            strengths.push('Excellent follow-up consistency');
        }
        else if (metrics.followUpRate < this.benchmarks.followUpRate.acceptable) {
            improvementAreas.push('Follow-up completion needs improvement');
        }
        // Technical issues analysis
        if (metrics.technicalIssueRate > 15) {
            improvementAreas.push('Frequent technical issues - may need technical support');
        }
        else if (metrics.technicalIssueRate < 5) {
            strengths.push('Minimal technical difficulties');
        }
        return { strengths, improvementAreas };
    }
    /**
     * Generate performance recommendations
     */
    generatePerformanceRecommendations(improvementAreas, trends) {
        const recommendations = [];
        // Response time recommendations
        if (improvementAreas.some(area => area.includes('Response time'))) {
            recommendations.push('Practice quick assessment techniques');
            recommendations.push('Review crisis intervention protocols');
            recommendations.push('Consider using response templates for common situations');
        }
        // Session duration recommendations
        if (improvementAreas.some(area => area.includes('Session duration'))) {
            recommendations.push('Focus on efficient problem-solving techniques');
            recommendations.push('Practice session closure and handoff procedures');
            recommendations.push('Review time management strategies');
        }
        // Escalation recommendations
        if (improvementAreas.some(area => area.includes('escalation'))) {
            recommendations.push('Review escalation criteria and procedures');
            recommendations.push('Practice de-escalation techniques');
            recommendations.push('Consider advanced crisis intervention training');
        }
        // Satisfaction recommendations
        if (improvementAreas.some(area => area.includes('satisfaction'))) {
            recommendations.push('Focus on active listening and empathy');
            recommendations.push('Review communication best practices');
            recommendations.push('Seek feedback from experienced volunteers');
        }
        // Follow-up recommendations
        if (improvementAreas.some(area => area.includes('follow-up'))) {
            recommendations.push('Set reminders for follow-up activities');
            recommendations.push('Review follow-up protocols and requirements');
            recommendations.push('Practice documentation and case closure procedures');
        }
        // Technical recommendations
        if (improvementAreas.some(area => area.includes('technical'))) {
            recommendations.push('Complete technical training modules');
            recommendations.push('Test equipment and connectivity regularly');
            recommendations.push('Have backup communication methods ready');
        }
        // Trend-based recommendations
        if (trends.responseTime === 'declining') {
            recommendations.push('Focus on improving initial response efficiency');
        }
        if (trends.sessionQuality === 'declining') {
            recommendations.push('Consider refresher training or peer mentoring');
        }
        if (trends.userSatisfaction === 'declining') {
            recommendations.push('Review recent sessions for improvement opportunities');
        }
        return recommendations;
    }
    /**
     * Get performance ranking among all volunteers
     */
    getPerformanceRanking(volunteerId) {
        const allVolunteers = Array.from(this.performanceData.keys());
        const totalVolunteers = allVolunteers.length;
        if (totalVolunteers === 0) {
            return { overallRank: 1, totalVolunteers: 1, percentile: 100, topPerformers: true };
        }
        // Calculate composite scores for all volunteers
        const scores = allVolunteers.map(vId => {
            const analysis = this.generatePerformanceAnalysis(vId, 'month');
            return {
                volunteerId: vId,
                score: this.calculateCompositeScore(analysis.metrics)
            };
        });
        // Sort by score (higher is better)
        scores.sort((a, b) => b.score - a.score);
        const rank = scores.findIndex(s => s.volunteerId === volunteerId) + 1;
        const percentile = ((totalVolunteers - rank + 1) / totalVolunteers) * 100;
        const topPerformers = percentile >= 80; // Top 20%
        return {
            overallRank: rank,
            totalVolunteers,
            percentile: Math.round(percentile),
            topPerformers
        };
    }
    /**
     * Calculate composite performance score
     */
    calculateCompositeScore(metrics) {
        // Weighted scoring system
        const weights = {
            responseTime: 0.2,
            sessionQuality: 0.25, // Based on escalation rate (inverted)
            satisfaction: 0.25,
            followUp: 0.15,
            efficiency: 0.15 // Based on session duration (inverted)
        };
        // Normalize metrics to 0-100 scale
        const responseScore = Math.max(0, 100 - (metrics.averageResponseTime / this.benchmarks.responseTime.acceptable) * 100);
        const sessionQualityScore = Math.max(0, 100 - (metrics.escalationRate / this.benchmarks.escalationRate.acceptable) * 100);
        const satisfactionScore = (metrics.satisfactionScore / 5) * 100;
        const followUpScore = metrics.followUpRate;
        const efficiencyScore = Math.max(0, 100 - (metrics.averageSessionDuration / this.benchmarks.sessionDuration.acceptable) * 100);
        return (responseScore * weights.responseTime +
            sessionQualityScore * weights.sessionQuality +
            satisfactionScore * weights.satisfaction +
            followUpScore * weights.followUp +
            efficiencyScore * weights.efficiency);
    }
    /**
     * Get top performing volunteers
     */
    getTopPerformers(limit = 10) {
        const allVolunteers = Array.from(this.performanceData.keys());
        const performers = allVolunteers.map(volunteerId => {
            const analysis = this.generatePerformanceAnalysis(volunteerId, 'month');
            const score = this.calculateCompositeScore(analysis.metrics);
            return {
                volunteerId,
                score,
                rank: 0, // Will be set after sorting
                keyStrengths: analysis.strengths.slice(0, 3) // Top 3 strengths
            };
        });
        // Sort by score and assign ranks
        performers.sort((a, b) => b.score - a.score);
        performers.forEach((performer, index) => {
            performer.rank = index + 1;
        });
        return performers.slice(0, limit);
    }
    /**
     * Generate system-wide performance analytics
     */
    generateSystemAnalytics() {
        const allMetrics = [];
        for (const metrics of this.performanceData.values()) {
            allMetrics.push(...metrics);
        }
        const totalVolunteers = this.performanceData.size;
        const totalSessions = allMetrics.length;
        // Calculate system averages
        const averageMetrics = {
            responseTime: allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalSessions || 0,
            sessionDuration: allMetrics.reduce((sum, m) => sum + m.sessionDuration, 0) / totalSessions || 0,
            escalationRate: (allMetrics.filter(m => m.escalationRequired).length / totalSessions) * 100 || 0,
            satisfactionScore: this.calculateAverageSatisfaction(allMetrics),
            followUpRate: (allMetrics.filter(m => m.followUpCompleted).length / totalSessions) * 100 || 0
        };
        // Calculate performance distribution
        const performanceDistribution = this.calculatePerformanceDistribution();
        // Calculate system trends (comparing last 30 days to previous 30 days)
        const trends = this.calculateSystemTrends(allMetrics);
        return {
            totalVolunteers,
            totalSessions,
            averageMetrics,
            performanceDistribution,
            trends
        };
    }
    /**
     * Calculate average satisfaction from metrics with ratings
     */
    calculateAverageSatisfaction(metrics) {
        const withRatings = metrics.filter(m => m.userSatisfactionRating !== undefined);
        if (withRatings.length === 0)
            return 0;
        return withRatings.reduce((sum, m) => sum + (m.userSatisfactionRating || 0), 0) / withRatings.length;
    }
    /**
     * Calculate performance distribution across volunteers
     */
    calculatePerformanceDistribution() {
        const distribution = { excellent: 0, good: 0, acceptable: 0, needsImprovement: 0 };
        for (const volunteerId of this.performanceData.keys()) {
            const analysis = this.generatePerformanceAnalysis(volunteerId, 'month');
            const score = this.calculateCompositeScore(analysis.metrics);
            if (score >= 85)
                distribution.excellent++;
            else if (score >= 70)
                distribution.good++;
            else if (score >= 55)
                distribution.acceptable++;
            else
                distribution.needsImprovement++;
        }
        return distribution;
    }
    /**
     * Calculate system-wide trends
     */
    calculateSystemTrends(allMetrics) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const recent = allMetrics.filter(m => m.timestamp >= thirtyDaysAgo);
        const previous = allMetrics.filter(m => m.timestamp >= sixtyDaysAgo && m.timestamp < thirtyDaysAgo);
        if (recent.length === 0 || previous.length === 0) {
            return { responseTime: 0, sessionQuality: 0, userSatisfaction: 0 };
        }
        // Calculate percentage changes
        const recentAvgResponse = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
        const previousAvgResponse = previous.reduce((sum, m) => sum + m.responseTime, 0) / previous.length;
        const responseTimeTrend = ((recentAvgResponse - previousAvgResponse) / previousAvgResponse) * 100;
        const recentEscalationRate = (recent.filter(m => m.escalationRequired).length / recent.length) * 100;
        const previousEscalationRate = (previous.filter(m => m.escalationRequired).length / previous.length) * 100;
        const sessionQualityTrend = ((previousEscalationRate - recentEscalationRate) / previousEscalationRate) * 100; // Inverted
        const recentSatisfaction = this.calculateAverageSatisfaction(recent);
        const previousSatisfaction = this.calculateAverageSatisfaction(previous);
        const userSatisfactionTrend = previousSatisfaction > 0
            ? ((recentSatisfaction - previousSatisfaction) / previousSatisfaction) * 100
            : 0;
        return {
            responseTime: Math.round(responseTimeTrend * 100) / 100,
            sessionQuality: Math.round(sessionQualityTrend * 100) / 100,
            userSatisfaction: Math.round(userSatisfactionTrend * 100) / 100
        };
    }
    /**
     * Get volunteers needing performance improvement
     */
    getVolunteersNeedingImprovement() {
        const needingImprovement = [];
        for (const volunteerId of this.performanceData.keys()) {
            const analysis = this.generatePerformanceAnalysis(volunteerId, 'month');
            const score = this.calculateCompositeScore(analysis.metrics);
            if (score < 55) { // Below acceptable threshold
                let urgency = 'low';
                if (score < 30)
                    urgency = 'high';
                else if (score < 45)
                    urgency = 'medium';
                needingImprovement.push({
                    volunteerId,
                    score: Math.round(score),
                    primaryConcerns: analysis.improvementAreas.slice(0, 3),
                    urgency
                });
            }
        }
        return needingImprovement.sort((a, b) => a.score - b.score); // Lowest scores first
    }
}
//# sourceMappingURL=VolunteerPerformanceMonitor.js.map