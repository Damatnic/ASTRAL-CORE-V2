/**
 * ASTRAL_CORE 2.0 - Workload Capacity Manager
 *
 * CRITICAL VOLUNTEER PROTECTION SYSTEM
 * Manages volunteer workload capacity, shift scheduling integration, and burnout prevention
 * to ensure sustainable volunteer operations while maintaining crisis response quality.
 *
 * PERFORMANCE TARGETS:
 * - Workload calculation: <2 seconds
 * - Shift validation: <1 second
 * - Burnout assessment: <3 seconds
 * - Capacity planning: <5 seconds
 * - Real-time monitoring: <500ms updates
 */
import { EventEmitter } from 'events';
// ========== MAIN WORKLOAD MANAGER CLASS ==========
export class WorkloadCapacityManager extends EventEmitter {
    static instance;
    configuration;
    activeShifts = new Map();
    workloadCache = new Map();
    capacityPlans = new Map();
    // Performance monitoring
    monitoringMetrics = {
        calculationsPerformed: 0,
        averageCalculationTime: 0,
        cacheHitRate: 0,
        violationsDetected: 0,
        interventionsTriggered: 0
    };
    CACHE_TTL = 60000; // 1 minute
    MONITORING_INTERVAL = 30000; // 30 seconds
    WELLNESS_CHECK_INTERVAL = 300000; // 5 minutes
    static getInstance() {
        if (!WorkloadCapacityManager.instance) {
            WorkloadCapacityManager.instance = new WorkloadCapacityManager();
        }
        return WorkloadCapacityManager.instance;
    }
    constructor() {
        super();
        this.configuration = this.getDefaultConfiguration();
        this.initializeSystem();
    }
    async initializeSystem() {
        try {
            console.log('🚀 Initializing Workload Capacity Manager...');
            // Load active shifts
            await this.loadActiveShifts();
            // Start real-time monitoring
            this.startRealTimeMonitoring();
            // Initialize capacity planning
            await this.initializeCapacityPlanning();
            console.log('✅ Workload Capacity Manager initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize Workload Capacity Manager:', error);
            throw error;
        }
    }
    // ========== WORKLOAD CALCULATION AND ASSESSMENT ==========
    /**
     * Calculate comprehensive workload assessment for a volunteer
     * Performance Target: <2 seconds
     */
    async calculateWorkloadAssessment(volunteerId) {
        const startTime = Date.now();
        try {
            // Check cache first
            const cached = this.workloadCache.get(volunteerId);
            if (cached && Date.now() - cached.currentLoad < this.CACHE_TTL) {
                this.monitoringMetrics.cacheHitRate++;
                return this.convertToWorkloadAssessment(cached);
            }
            // Get current workload data
            const [currentSessions, todayHours, weekHours, consecutiveSessions, lastBreakTime, wellnessMetrics, performanceMetrics, activeShift] = await Promise.all([
                this.getCurrentActiveSessions(volunteerId),
                this.getHoursWorkedToday(volunteerId),
                this.getHoursWorkedThisWeek(volunteerId),
                this.getConsecutiveSessionsToday(volunteerId),
                this.getTimeSinceLastBreak(volunteerId),
                this.getVolunteerWellnessMetrics(volunteerId),
                this.getVolunteerPerformanceMetrics(volunteerId),
                this.getActiveShift(volunteerId)
            ]);
            // Calculate burnout risk
            const burnoutRisk = this.calculateBurnoutRisk(wellnessMetrics, todayHours, weekHours, consecutiveSessions, lastBreakTime, performanceMetrics);
            // Calculate capacity utilization
            const dailyCapacity = activeShift?.maxSessions || this.configuration.maxConcurrentSessions;
            const weeklyCapacity = this.configuration.maxWeeklyHours;
            const currentUtilization = currentSessions / dailyCapacity;
            const weeklyUtilization = weekHours / weeklyCapacity;
            // Determine trend direction
            const trendDirection = await this.calculateUtilizationTrend(volunteerId);
            // Generate recommendations
            const recommendations = this.generateWorkloadRecommendations(burnoutRisk, currentUtilization, weeklyUtilization, wellnessMetrics, performanceMetrics);
            // Check for violations
            const violations = this.checkWorkloadViolations(volunteerId, todayHours, weekHours, consecutiveSessions, lastBreakTime, burnoutRisk.score);
            const assessment = {
                current: {
                    activeSessions: currentSessions,
                    hoursWorkedToday: todayHours,
                    hoursWorkedThisWeek: weekHours,
                    consecutiveSessions,
                    timeSinceLastBreak: lastBreakTime
                },
                capacity: {
                    maxConcurrentSessions: dailyCapacity,
                    maxHoursPerDay: this.configuration.maxDailyHours,
                    maxHoursPerWeek: this.configuration.maxWeeklyHours,
                    maxConsecutiveSessions: this.configuration.maxConsecutiveSessions,
                    requiredBreakFrequency: this.configuration.mandatoryBreakAfter
                },
                utilization: {
                    currentUtilization,
                    weeklyUtilization,
                    trendDirection
                },
                burnoutRisk,
                wellness: {
                    wellnessScore: wellnessMetrics.currentBurnoutScore ? (10 - wellnessMetrics.currentBurnoutScore * 10) : 7,
                    stressLevel: wellnessMetrics.stressLevel,
                    jobSatisfaction: wellnessMetrics.jobSatisfaction,
                    workLifeBalance: wellnessMetrics.workLifeBalance,
                    supportNeeded: wellnessMetrics.supportNeeded
                },
                recommendations
            };
            // Cache the result
            const loadMetrics = {
                volunteerId,
                timestamp: new Date(),
                currentLoad: currentSessions,
                current: {
                    activeSessions: currentSessions,
                    utilization: currentUtilization,
                    hoursToday: todayHours,
                    hoursThisWeek: weekHours,
                    consecutiveSessions: consecutiveSessions,
                    timeSinceBreak: 30 // placeholder
                },
                wellness: {
                    burnoutScore: burnoutRisk.score,
                    stressLevel: 5,
                    fatigue: 3,
                    satisfaction: 7,
                    lastWellnessCheck: new Date()
                },
                performance: {
                    recentRating: 8,
                    responseTime: 30,
                    completionRate: 0.95,
                    errorRate: 0.02,
                    trend: 'STABLE'
                },
                recommendations: {
                    action: 'CONTINUE',
                    priority: 'LOW',
                    reason: 'Volunteer performing well within capacity',
                    timeframe: 'current'
                },
                recommendedAction: 'CONTINUE'
            };
            this.workloadCache.set(volunteerId, loadMetrics);
            // Handle violations
            if (violations.length > 0) {
                await this.handleWorkloadViolations(volunteerId, violations);
            }
            const responseTime = Date.now() - startTime;
            this.monitoringMetrics.calculationsPerformed++;
            this.monitoringMetrics.averageCalculationTime =
                (this.monitoringMetrics.averageCalculationTime + responseTime) / this.monitoringMetrics.calculationsPerformed;
            console.log(`⚡ Workload assessment calculated for ${volunteerId} in ${responseTime}ms`);
            // Performance check
            if (responseTime > 2000) {
                console.warn(`⚠️ Workload calculation exceeded target: ${responseTime}ms`);
            }
            return assessment;
        }
        catch (error) {
            console.error(`❌ Failed to calculate workload assessment for ${volunteerId}:`, error);
            throw error;
        }
    }
    // ========== BURNOUT RISK CALCULATION ==========
    calculateBurnoutRisk(wellnessMetrics, hoursToday, hoursWeek, consecutiveSessions, timeSinceBreak, performanceMetrics) {
        let riskScore = 0;
        const factors = [];
        // Base burnout score from wellness metrics
        riskScore += wellnessMetrics.currentBurnoutScore * 0.4;
        if (wellnessMetrics.currentBurnoutScore > 0.5) {
            factors.push({
                factor: 'High baseline burnout score',
                impact: 'HIGH',
                description: `Current burnout score: ${(wellnessMetrics.currentBurnoutScore * 100).toFixed(1)}%`,
                value: wellnessMetrics.currentBurnoutScore
            });
        }
        // Daily hours factor
        const dailyHoursRatio = hoursToday / this.configuration.maxDailyHours;
        if (dailyHoursRatio > 0.8) {
            const factor = Math.min((dailyHoursRatio - 0.8) * 2, 0.3);
            riskScore += factor;
            factors.push({
                factor: 'Excessive daily hours',
                impact: dailyHoursRatio > 1 ? 'HIGH' : 'HIGH',
                description: `${hoursToday.toFixed(1)} hours today (${(dailyHoursRatio * 100).toFixed(1)}% of limit)`,
                value: dailyHoursRatio
            });
        }
        // Weekly hours factor
        const weeklyHoursRatio = hoursWeek / this.configuration.maxWeeklyHours;
        if (weeklyHoursRatio > 0.8) {
            const factor = Math.min((weeklyHoursRatio - 0.8) * 2, 0.2);
            riskScore += factor;
            factors.push({
                factor: 'Excessive weekly hours',
                impact: weeklyHoursRatio > 1 ? 'HIGH' : 'MEDIUM',
                description: `${hoursWeek.toFixed(1)} hours this week (${(weeklyHoursRatio * 100).toFixed(1)}% of limit)`,
                value: weeklyHoursRatio
            });
        }
        // Consecutive sessions factor
        if (consecutiveSessions > this.configuration.maxConsecutiveSessions * 0.8) {
            const factor = Math.min((consecutiveSessions - this.configuration.maxConsecutiveSessions * 0.8) * 0.05, 0.2);
            riskScore += factor;
            factors.push({
                factor: 'Too many consecutive sessions',
                impact: consecutiveSessions > this.configuration.maxConsecutiveSessions ? 'HIGH' : 'MEDIUM',
                description: `${consecutiveSessions} consecutive sessions today`,
                value: consecutiveSessions
            });
        }
        // Break time factor
        if (timeSinceBreak > this.configuration.mandatoryBreakAfter) {
            const factor = Math.min((timeSinceBreak - this.configuration.mandatoryBreakAfter) / 180, 0.2); // 3 hours max
            riskScore += factor;
            factors.push({
                factor: 'Overdue for break',
                impact: timeSinceBreak > this.configuration.mandatoryBreakAfter * 2 ? 'HIGH' : 'MEDIUM',
                description: `${timeSinceBreak} minutes since last break`,
                value: timeSinceBreak
            });
        }
        // Performance decline factor
        if (performanceMetrics.overallRating < this.configuration.minimumPerformanceRating) {
            const performanceDecline = (this.configuration.minimumPerformanceRating - performanceMetrics.overallRating) / 10;
            riskScore += performanceDecline * 0.15;
            factors.push({
                factor: 'Performance decline',
                impact: 'MEDIUM',
                description: `Overall rating: ${performanceMetrics.overallRating}/10`,
                value: performanceMetrics.overallRating
            });
        }
        // Stress level factor
        if (wellnessMetrics.stressLevel > 7) {
            const stressFactor = ((wellnessMetrics.stressLevel - 7) / 3) * 0.1;
            riskScore += stressFactor;
            factors.push({
                factor: 'High stress level',
                impact: wellnessMetrics.stressLevel > 8 ? 'HIGH' : 'MEDIUM',
                description: `Stress level: ${wellnessMetrics.stressLevel}/10`,
                value: wellnessMetrics.stressLevel
            });
        }
        // Determine risk level
        let level;
        if (riskScore >= this.configuration.burnoutThresholds.critical)
            level = 'CRITICAL';
        else if (riskScore >= this.configuration.burnoutThresholds.high)
            level = 'HIGH';
        else if (riskScore >= this.configuration.burnoutThresholds.medium)
            level = 'MEDIUM';
        else
            level = 'LOW';
        // Generate recommendations
        const recommendations = this.generateBurnoutRecommendations(level, factors);
        return {
            level,
            score: Math.min(riskScore, 1),
            factors,
            recommendations
        };
    }
    generateBurnoutRecommendations(level, factors) {
        const recommendations = [];
        switch (level) {
            case 'CRITICAL':
                recommendations.push('Immediate mandatory break required');
                recommendations.push('Consider ending shift early');
                recommendations.push('Schedule wellness check with supervisor');
                recommendations.push('Temporarily reduce maximum concurrent sessions');
                break;
            case 'HIGH':
                recommendations.push('Take break within next 30 minutes');
                recommendations.push('Reduce session load for remainder of shift');
                recommendations.push('Schedule wellness check within 24 hours');
                break;
            case 'MEDIUM':
                recommendations.push('Consider taking a break soon');
                recommendations.push('Monitor wellness closely');
                recommendations.push('Practice stress reduction techniques');
                break;
            case 'LOW':
                recommendations.push('Continue current workload pattern');
                recommendations.push('Maintain regular break schedule');
                break;
        }
        // Add specific recommendations based on factors
        factors.forEach(factor => {
            if (factor.factor.includes('hours') && factor.impact === 'HIGH') {
                recommendations.push('Avoid overtime for the rest of the week');
            }
            if (factor.factor.includes('consecutive') && factor.impact === 'HIGH') {
                recommendations.push('Take longer break between sessions');
            }
            if (factor.factor.includes('break') && factor.impact === 'HIGH') {
                recommendations.push('Take mandatory 15-minute break immediately');
            }
        });
        return [...new Set(recommendations)]; // Remove duplicates
    }
    // ========== SHIFT VALIDATION AND MANAGEMENT ==========
    /**
     * Validate shift assignment against workload constraints
     * Performance Target: <1 second
     */
    async validateShiftAssignment(volunteerId, proposedShift) {
        const startTime = Date.now();
        try {
            const violations = [];
            const recommendations = [];
            // Get current workload assessment
            const workload = await this.calculateWorkloadAssessment(volunteerId);
            // Check daily hours limit
            const shiftDuration = (proposedShift.endTime.getTime() - proposedShift.startTime.getTime()) / (1000 * 60 * 60);
            const totalDailyHours = workload.current.hoursWorkedToday + shiftDuration;
            if (totalDailyHours > this.configuration.maxDailyHours) {
                violations.push({
                    id: crypto.randomUUID(),
                    type: 'DAILY_HOURS_EXCEEDED',
                    severity: 'ERROR',
                    timestamp: new Date(),
                    description: `Proposed shift would exceed daily hours limit`,
                    value: totalDailyHours,
                    threshold: this.configuration.maxDailyHours,
                    riskLevel: 'HIGH'
                });
                recommendations.push(`Reduce shift duration by ${(totalDailyHours - this.configuration.maxDailyHours).toFixed(1)} hours`);
            }
            // Check burnout risk
            if (workload.burnoutRisk.level === 'CRITICAL') {
                violations.push({
                    id: crypto.randomUUID(),
                    type: 'BURNOUT_THRESHOLD_EXCEEDED',
                    severity: 'CRITICAL',
                    timestamp: new Date(),
                    description: 'Volunteer at critical burnout risk',
                    value: workload.burnoutRisk.score,
                    threshold: this.configuration.burnoutThresholds.critical,
                    riskLevel: 'CRITICAL'
                });
                recommendations.push('Cancel shift and provide wellness support');
            }
            else if (workload.burnoutRisk.level === 'HIGH') {
                recommendations.push('Consider reducing shift load or providing additional support');
            }
            // Check minimum rest between shifts
            const lastShift = await this.getLastCompletedShift(volunteerId);
            if (lastShift) {
                const restHours = (proposedShift.startTime.getTime() - lastShift.endTime.getTime()) / (1000 * 60 * 60);
                if (restHours < this.configuration.minimumRestBetweenShifts) {
                    violations.push({
                        id: crypto.randomUUID(),
                        type: 'DAILY_HOURS_EXCEEDED', // Reusing type for rest violation
                        severity: 'WARNING',
                        timestamp: new Date(),
                        description: 'Insufficient rest between shifts',
                        value: restHours,
                        threshold: this.configuration.minimumRestBetweenShifts,
                        riskLevel: 'MEDIUM'
                    });
                    recommendations.push(`Ensure at least ${this.configuration.minimumRestBetweenShifts} hours rest between shifts`);
                }
            }
            // Generate adjusted shift if needed
            let adjustments;
            if (violations.some(v => v.severity === 'ERROR' || v.severity === 'CRITICAL')) {
                adjustments = await this.generateShiftAdjustments(proposedShift, violations);
            }
            const responseTime = Date.now() - startTime;
            console.log(`⚡ Shift validation completed in ${responseTime}ms`);
            return {
                isValid: violations.length === 0,
                violations,
                recommendations,
                adjustments
            };
        }
        catch (error) {
            console.error(`❌ Failed to validate shift assignment for ${volunteerId}:`, error);
            throw error;
        }
    }
    // ========== CAPACITY PLANNING ==========
    /**
     * Generate capacity plan for given period
     * Performance Target: <5 seconds
     */
    async generateCapacityPlan(startDate, endDate, planType) {
        const startTime = Date.now();
        try {
            console.log(`📊 Generating ${planType.toLowerCase()} capacity plan from ${startDate.toISOString()} to ${endDate.toISOString()}`);
            // Generate demand forecast
            const demandForecast = await this.generateDemandForecast(startDate, endDate);
            // Calculate volunteer capacity
            const volunteerCapacity = await this.calculateVolunteerCapacity(startDate, endDate);
            // Identify capacity gaps
            const capacityGaps = this.identifyCapacityGaps(demandForecast, volunteerCapacity);
            // Generate recommendations
            const recommendations = this.generateCapacityRecommendations(capacityGaps, volunteerCapacity);
            // Assess risks
            const riskAssessment = this.assessCapacityRisks(capacityGaps, volunteerCapacity);
            // Create contingency plans
            const contingencyPlans = this.createContingencyPlans(riskAssessment);
            const plan = {
                planId: crypto.randomUUID(),
                planningPeriod: {
                    start: startDate,
                    end: endDate,
                    type: planType
                },
                demandForecast,
                volunteerCapacity,
                capacityGaps,
                recommendations,
                riskAssessment,
                contingencyPlans,
                lastUpdated: new Date(),
                confidence: this.calculatePlanConfidence(demandForecast, volunteerCapacity)
            };
            // Cache the plan
            this.capacityPlans.set(plan.planId, plan);
            const responseTime = Date.now() - startTime;
            console.log(`✅ Capacity plan generated in ${responseTime}ms (confidence: ${(plan.confidence * 100).toFixed(1)}%)`);
            // Performance check
            if (responseTime > 5000) {
                console.warn(`⚠️ Capacity planning exceeded target: ${responseTime}ms`);
            }
            return plan;
        }
        catch (error) {
            console.error('❌ Failed to generate capacity plan:', error);
            throw error;
        }
    }
    // ========== REAL-TIME MONITORING ==========
    startRealTimeMonitoring() {
        // Monitor volunteer workloads
        setInterval(() => {
            this.monitorActiveVolunteers();
        }, this.MONITORING_INTERVAL);
        // Perform wellness checks
        setInterval(() => {
            this.performWellnessChecks();
        }, this.WELLNESS_CHECK_INTERVAL);
        // Clean up cache
        setInterval(() => {
            this.cleanupCache();
        }, this.CACHE_TTL);
    }
    async monitorActiveVolunteers() {
        try {
            const activeVolunteers = await this.getActiveVolunteerIds();
            for (const volunteerId of activeVolunteers) {
                const assessment = await this.calculateWorkloadAssessment(volunteerId);
                // Check for immediate intervention needs
                if (assessment.burnoutRisk.level === 'CRITICAL') {
                    await this.triggerCriticalIntervention(volunteerId, assessment);
                }
                else if (assessment.burnoutRisk.level === 'HIGH') {
                    await this.triggerHighRiskIntervention(volunteerId, assessment);
                }
                // Update real-time metrics
                this.emit('workloadAssessmentUpdated', {
                    volunteerId,
                    assessment,
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            console.error('❌ Error in volunteer monitoring:', error);
        }
    }
    // ========== HELPER METHODS ==========
    getDefaultConfiguration() {
        return {
            maxDailyHours: 8,
            maxConsecutiveSessions: 6,
            maxConcurrentSessions: 3,
            minimumBreakDuration: 15,
            mandatoryBreakAfter: 180, // 3 hours
            maxWeeklyHours: 40,
            maxWeeklyNightShifts: 3,
            minimumRestBetweenShifts: 12,
            maxMonthlyHours: 160,
            maxMonthlyEmergencyShifts: 8,
            burnoutThresholds: {
                low: 0.3,
                medium: 0.6,
                high: 0.8,
                critical: 0.9
            },
            performanceTrackingWindow: 30,
            minimumPerformanceRating: 7,
            performanceDeclineThreshold: 15,
            wellnessCheckInterval: 7,
            mandatoryWellnessThreshold: 0.7,
            supportInterventionThreshold: 0.8
        };
    }
    // ========== PLACEHOLDER METHODS (TO BE IMPLEMENTED) ==========
    // These methods would contain the actual database queries and business logic
    async loadActiveShifts() { }
    async initializeCapacityPlanning() { }
    async getCurrentActiveSessions(volunteerId) { return 0; }
    async getHoursWorkedToday(volunteerId) { return 0; }
    async getHoursWorkedThisWeek(volunteerId) { return 0; }
    async getConsecutiveSessionsToday(volunteerId) { return 0; }
    async getTimeSinceLastBreak(volunteerId) { return 0; }
    async getVolunteerWellnessMetrics(volunteerId) {
        return {
            currentBurnoutScore: 0.3,
            stressLevel: 5,
            jobSatisfaction: 8,
            workLifeBalance: 7,
            lastWellnessCheck: new Date(),
            wellnessAlerts: [],
            supportNeeded: false,
            hasActiveSupportPlan: false
        };
    }
    async getVolunteerPerformanceMetrics(volunteerId) {
        return {
            overallRating: 8,
            sessionQualityScore: 8,
            responseTimeAverage: 45,
            crisisResolutionRate: 85,
            clientSatisfactionScore: 8.5,
            professionalDevelopmentScore: 7,
            teamworkScore: 8,
            reliabilityScore: 9,
            lastEvaluationDate: new Date(),
            strengths: [],
            areasForImprovement: [],
            goals: [],
            recognitions: []
        };
    }
    async getActiveShift(volunteerId) { return null; }
    async calculateUtilizationTrend(volunteerId) { return 'STABLE'; }
    generateWorkloadRecommendations(burnoutRisk, currentUtil, weeklyUtil, wellness, performance) { return []; }
    checkWorkloadViolations(volunteerId, todayHours, weekHours, consecutive, breakTime, burnout) { return []; }
    convertToWorkloadAssessment(metrics) { return {}; }
    async getPerformanceTrend(volunteerId) { return 'STABLE'; }
    getRecommendedAction(recommendations) { return 'CONTINUE'; }
    async handleWorkloadViolations(volunteerId, violations) { }
    async getLastCompletedShift(volunteerId) { return null; }
    async generateShiftAdjustments(shift, violations) { return shift; }
    async generateDemandForecast(start, end) { return []; }
    async calculateVolunteerCapacity(start, end) { return []; }
    identifyCapacityGaps(demand, capacity) { return []; }
    generateCapacityRecommendations(gaps, capacity) { return []; }
    assessCapacityRisks(gaps, capacity) { return {}; }
    createContingencyPlans(risks) { return []; }
    calculatePlanConfidence(demand, capacity) { return 0.85; }
    async getActiveVolunteerIds() { return []; }
    async triggerCriticalIntervention(volunteerId, assessment) { }
    async triggerHighRiskIntervention(volunteerId, assessment) { }
    async performWellnessChecks() { }
    cleanupCache() {
        const now = Date.now();
        for (const [key, metrics] of this.workloadCache) {
            if (now - metrics.currentLoad > this.CACHE_TTL * 2) {
                this.workloadCache.delete(key);
            }
        }
    }
}
// Export singleton instance
export const workloadManager = WorkloadCapacityManager.getInstance();
//# sourceMappingURL=workload-manager.js.map