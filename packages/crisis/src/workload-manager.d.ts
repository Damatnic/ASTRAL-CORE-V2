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
interface ShiftBreak {
    id: string;
}
export interface ShiftWorkload {
    maxSessions?: number;
}
import type { WorkloadAssessment, BurnoutRiskLevel } from './types/volunteer-matching.types';
export interface WorkloadConfiguration {
    maxDailyHours: number;
    maxConsecutiveSessions: number;
    maxConcurrentSessions: number;
    minimumBreakDuration: number;
    mandatoryBreakAfter: number;
    maxWeeklyHours: number;
    maxWeeklyNightShifts: number;
    minimumRestBetweenShifts: number;
    maxMonthlyHours: number;
    maxMonthlyEmergencyShifts: number;
    burnoutThresholds: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    performanceTrackingWindow: number;
    minimumPerformanceRating: number;
    performanceDeclineThreshold: number;
    wellnessCheckInterval: number;
    mandatoryWellnessThreshold: number;
    supportInterventionThreshold: number;
}
export interface ShiftWorkload {
    shiftId: string;
    volunteerId: string;
    startTime: Date;
    endTime: Date;
    plannedSessions: number;
    actualSessions: number;
    plannedLoad: number;
    actualLoad: number;
    breaksTaken: ShiftBreak[];
    breaksScheduled: ScheduledBreak[];
    emergencyExtensions: ShiftExtension[];
    wellnessChecks: WellnessCheck[];
    performanceSnapshot: ShiftPerformanceSnapshot;
    workloadViolations: WorkloadViolation[];
}
export interface ScheduledBreak {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    type: 'SCHEDULED' | 'WELLNESS' | 'MANDATORY' | 'EMERGENCY';
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'SKIPPED' | 'POSTPONED';
    reason?: string;
    wellnessImpact?: number;
}
export interface ShiftExtension {
    id: string;
    originalEndTime: Date;
    newEndTime: Date;
    reason: 'EMERGENCY' | 'COVERAGE_GAP' | 'VOLUNTARY' | 'SYSTEM_OVERLOAD';
    approvedBy: string;
    impactAssessment: WorkloadImpactAssessment;
    compensationOffered?: CompensationOffer;
}
export interface WorkloadImpactAssessment {
    burnoutRiskIncrease: number;
    performanceImpactPrediction: number;
    wellnessScoreImpact: number;
    recommendedRecoveryTime: number;
    additionalSupportNeeded: boolean;
    risks: string[];
    mitigations: string[];
}
export interface CompensationOffer {
    type: 'TIME_OFF' | 'REDUCED_LOAD' | 'WELLNESS_SUPPORT' | 'RECOGNITION' | 'TRAINING';
    description: string;
    value: number;
    expiryDate: Date;
    status: 'OFFERED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}
export interface WellnessCheck {
    id: string;
    timestamp: Date;
    type: 'SCHEDULED' | 'TRIGGERED' | 'VOLUNTARY' | 'MANDATORY';
    trigger?: string;
    metrics: {
        stressLevel: number;
        energyLevel: number;
        jobSatisfaction: number;
        workLifeBalance: number;
        burnoutIndicators: BurnoutIndicator[];
    };
    assessment: {
        overallWellness: number;
        riskLevel: BurnoutRiskLevel;
        recommendations: string[];
        actionRequired: boolean;
        followUpDate?: Date;
    };
    conductedBy: string;
    notes?: string;
}
export interface BurnoutIndicator {
    indicator: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    since?: Date;
    trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
}
export interface ShiftPerformanceSnapshot {
    timestamp: Date;
    sessionQuality: number;
    responseTime: number;
    clientSatisfaction: number;
    errorCount: number;
    escalationRate: number;
    multitaskingEfficiency: number;
    communicationQuality: number;
    problemSolvingEffectiveness: number;
    stressManagement: number;
}
export interface WorkloadViolation {
    id: string;
    type: WorkloadViolationType;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    timestamp: Date;
    description: string;
    value: number;
    threshold: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    actionTaken?: string;
    resolvedAt?: Date;
    impact?: string;
}
export type WorkloadViolationType = 'DAILY_HOURS_EXCEEDED' | 'CONSECUTIVE_SESSIONS_EXCEEDED' | 'BREAK_SKIPPED' | 'BURNOUT_THRESHOLD_EXCEEDED' | 'PERFORMANCE_DECLINE' | 'WELLNESS_SCORE_LOW' | 'MANDATORY_BREAK_OVERDUE' | 'WEEKLY_HOURS_EXCEEDED' | 'EMERGENCY_EXTENSION_EXCESSIVE' | 'CONCURRENT_SESSIONS_EXCEEDED';
export interface CapacityPlan {
    planId: string;
    planningPeriod: {
        start: Date;
        end: Date;
        type: 'DAY' | 'WEEK' | 'MONTH';
    };
    demandForecast: DemandForecast[];
    volunteerCapacity: VolunteerCapacityPlan[];
    capacityGaps: CapacityGap[];
    recommendations: CapacityRecommendation[];
    riskAssessment: CapacityRiskAssessment;
    contingencyPlans: ContingencyPlan[];
    lastUpdated: Date;
    confidence: number;
}
export interface DemandForecast {
    timeSlot: Date;
    duration: number;
    expectedSessions: number;
    urgencyDistribution: {
        low: number;
        normal: number;
        high: number;
        critical: number;
        emergency: number;
    };
    specialtyDemand: {
        [specialty: string]: number;
    };
    languageDemand: {
        [language: string]: number;
    };
    confidence: number;
}
export interface VolunteerCapacityPlan {
    volunteerId: string;
    availableHours: number;
    scheduledShifts: ScheduledShift[];
    projectedUtilization: number;
    burnoutRisk: BurnoutRiskLevel;
    wellnessProjection: number;
    performanceProjection: number;
    constraints: CapacityConstraint[];
    flexibilityScore: number;
}
export interface ScheduledShift {
    shiftId: string;
    startTime: Date;
    endTime: Date;
    role: string;
    estimatedLoad: number;
    specialtyFocus?: string[];
    languageFocus?: string[];
    emergencyAvailable: boolean;
    trainingRequired?: string[];
}
export interface CapacityConstraint {
    type: 'AVAILABILITY' | 'WELLNESS' | 'PERFORMANCE' | 'TRAINING' | 'PREFERENCE';
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    startDate?: Date;
    endDate?: Date;
    flexibility: number;
}
export interface CapacityGap {
    timeSlot: Date;
    duration: number;
    shortfall: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedSpecialties: string[];
    affectedLanguages: string[];
    impactAssessment: string;
    mitigation: string[];
}
export interface CapacityRecommendation {
    type: 'RECRUITMENT' | 'TRAINING' | 'SCHEDULING' | 'WORKLOAD_ADJUSTMENT' | 'PROCESS_IMPROVEMENT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    description: string;
    expectedImpact: string;
    timeframe: string;
    resources: string[];
    cost?: number;
    feasibility: number;
}
export interface CapacityRiskAssessment {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: CapacityRiskFactor[];
    impactAreas: string[];
    probabilityOfShortfall: number;
    expectedShortfallDuration: number;
    businessImpact: string;
    mitigationStrategies: string[];
}
export interface CapacityRiskFactor {
    factor: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    mitigation: string;
}
export interface ContingencyPlan {
    id: string;
    name: string;
    trigger: string;
    actions: ContingencyAction[];
    responsibleParties: string[];
    activationThreshold: string;
    estimatedEffectiveness: number;
}
export interface ContingencyAction {
    action: string;
    timeframe: string;
    responsibility: string;
    prerequisites: string[];
    successMetrics: string[];
}
export declare class WorkloadCapacityManager extends EventEmitter {
    private static instance;
    private configuration;
    private activeShifts;
    private workloadCache;
    private capacityPlans;
    private monitoringMetrics;
    private readonly CACHE_TTL;
    private readonly MONITORING_INTERVAL;
    private readonly WELLNESS_CHECK_INTERVAL;
    static getInstance(): WorkloadCapacityManager;
    constructor();
    private initializeSystem;
    /**
     * Calculate comprehensive workload assessment for a volunteer
     * Performance Target: <2 seconds
     */
    calculateWorkloadAssessment(volunteerId: string): Promise<WorkloadAssessment>;
    private calculateBurnoutRisk;
    private generateBurnoutRecommendations;
    /**
     * Validate shift assignment against workload constraints
     * Performance Target: <1 second
     */
    validateShiftAssignment(volunteerId: string, proposedShift: ScheduledShift): Promise<{
        isValid: boolean;
        violations: WorkloadViolation[];
        recommendations: string[];
        adjustments?: ScheduledShift;
    }>;
    /**
     * Generate capacity plan for given period
     * Performance Target: <5 seconds
     */
    generateCapacityPlan(startDate: Date, endDate: Date, planType: 'DAY' | 'WEEK' | 'MONTH'): Promise<CapacityPlan>;
    private startRealTimeMonitoring;
    private monitorActiveVolunteers;
    private getDefaultConfiguration;
    private loadActiveShifts;
    private initializeCapacityPlanning;
    private getCurrentActiveSessions;
    private getHoursWorkedToday;
    private getHoursWorkedThisWeek;
    private getConsecutiveSessionsToday;
    private getTimeSinceLastBreak;
    private getVolunteerWellnessMetrics;
    private getVolunteerPerformanceMetrics;
    private getActiveShift;
    private calculateUtilizationTrend;
    private generateWorkloadRecommendations;
    private checkWorkloadViolations;
    private convertToWorkloadAssessment;
    private getPerformanceTrend;
    private getRecommendedAction;
    private handleWorkloadViolations;
    private getLastCompletedShift;
    private generateShiftAdjustments;
    private generateDemandForecast;
    private calculateVolunteerCapacity;
    private identifyCapacityGaps;
    private generateCapacityRecommendations;
    private assessCapacityRisks;
    private createContingencyPlans;
    private calculatePlanConfidence;
    private getActiveVolunteerIds;
    private triggerCriticalIntervention;
    private triggerHighRiskIntervention;
    private performWellnessChecks;
    private cleanupCache;
}
export declare const workloadManager: WorkloadCapacityManager;
export {};
//# sourceMappingURL=workload-manager.d.ts.map