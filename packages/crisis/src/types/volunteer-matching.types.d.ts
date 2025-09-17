/**
 * ASTRAL_CORE 2.0 - Volunteer Matching System Types
 *
 * Comprehensive type definitions for the advanced volunteer matching system
 * including real-time availability, load balancing, and performance tracking.
 */
export interface VolunteerAvailabilityStatus {
    volunteerId: string;
    status: VolunteerOnlineStatus;
    lastHeartbeat: Date;
    currentSessions: number;
    maxConcurrentSessions: number;
    shiftStartTime?: Date;
    shiftEndTime?: Date;
    breakStartTime?: Date;
    breakDuration?: number;
    emergencyAvailable: boolean;
    location?: GeographicLocation;
    metadata?: {
        deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET';
        connectionQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
        batteryLevel?: number;
        pushNotificationsEnabled?: boolean;
    };
}
export type VolunteerOnlineStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK' | 'EMERGENCY_ONLY' | 'TRAINING' | 'MEETING' | 'TECHNICAL_ISSUE';
export interface GeographicLocation {
    country: string;
    countryCode: string;
    region?: string;
    regionCode?: string;
    city?: string;
    timezone: string;
    utcOffset: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    culturalContext?: string[];
    languageRegion?: string;
    emergencyServicesNumber?: string;
}
export interface CulturalCompetency {
    culturalGroups: string[];
    religiousCompetency?: string[];
    ethnicCompetency?: string[];
    socioeconomicCompetency?: string[];
    ageGroupCompetency?: string[];
    genderIdentityCompetency?: string[];
    disabilityCompetency?: string[];
    veteranCompetency?: boolean;
    lgbtqCompetency?: boolean;
    traumaInformedCare?: boolean;
    certifications?: CulturalCertification[];
}
export interface CulturalCertification {
    type: string;
    issuingOrganization: string;
    issuedDate: Date;
    expiryDate?: Date;
    certificateId: string;
    isActive: boolean;
}
export interface CrisisMatchingCriteria {
    sessionId: string;
    urgency: CrisisUrgency;
    severity: number;
    estimatedDuration?: number;
    sessionType: SessionType;
    requiredSpecialties: CrisisSpecialty[];
    requiredLanguages: LanguageRequirement[];
    minimumExperienceLevel?: ExperienceLevel;
    minimumSuccessRate?: number;
    preferredSpecialties?: CrisisSpecialty[];
    preferredLanguages?: LanguageRequirement[];
    preferredExperienceLevel?: ExperienceLevel;
    culturalConsiderations?: string[];
    userLocation?: GeographicLocation;
    requiresSameCulture?: boolean;
    requiresSameTimezone?: boolean;
    requiresSameCountry?: boolean;
    genderPreference?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'NO_PREFERENCE';
    agePreference?: 'PEER' | 'OLDER' | 'YOUNGER' | 'NO_PREFERENCE';
    requiresVideoCapable?: boolean;
    requiresMobileCompatible?: boolean;
    accessibilityRequirements?: string[];
    avoidPreviousVolunteers?: string[];
    preferPreviousVolunteers?: string[];
    allowTraineeVolunteers?: boolean;
    requireSupervisorPresent?: boolean;
    immediateResponse: boolean;
    emergencyServicesAlerted?: boolean;
    suicidalIdeation?: boolean;
    selfHarmRisk?: boolean;
    violenceRisk?: boolean;
    requestTimestamp: Date;
    maxWaitTime?: number;
    fallbackStrategy?: FallbackStrategy;
}
export type CrisisUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type SessionType = 'TEXT_CHAT' | 'VOICE_CALL' | 'VIDEO_CALL' | 'CRISIS_HOTLINE' | 'FOLLOW_UP' | 'GROUP_SUPPORT' | 'FAMILY_SUPPORT' | 'PEER_SUPPORT';
export type ExperienceLevel = 'TRAINEE' | 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'SPECIALIST';
export interface LanguageRequirement {
    languageCode: string;
    minimumProficiency: LanguageProficiency;
    dialectPreference?: string;
    isSignLanguage?: boolean;
    isWrittenOnly?: boolean;
}
export type LanguageProficiency = 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE' | 'PROFESSIONAL';
export type FallbackStrategy = 'WAIT_FOR_OPTIMAL' | 'ACCEPT_GOOD_MATCH' | 'ACCEPT_ANY_MATCH' | 'ESCALATE_TO_EMERGENCY' | 'TRANSFER_TO_PARTNER' | 'AUTO_RESOURCES_ONLY';
export interface VolunteerMatchingResult {
    matchId: string;
    sessionId: string;
    volunteerId: string;
    matchScore: number;
    confidence: MatchConfidence;
    volunteerSummary: VolunteerMatchingSummary;
    matchBreakdown: MatchScoreBreakdown;
    strengthAreas: MatchStrength[];
    weaknessAreas: MatchWeakness[];
    availabilityInfo: VolunteerAvailabilityInfo;
    qualityMetrics: VolunteerQualityMetrics;
    workloadAssessment: WorkloadAssessment;
    geographicAlignment: GeographicAlignment;
    culturalCompatibility: CulturalCompatibility;
    riskAssessment: VolunteerRiskAssessment;
    matchTimestamp: Date;
    responseTimeMs: number;
    algorithmVersion: string;
    fallbackUsed?: boolean;
    alternatives?: VolunteerMatchingResult[];
}
export type MatchConfidence = 'EXCELLENT' | 'HIGH' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
export interface VolunteerMatchingSummary {
    firstName: string;
    preferredName?: string;
    pronouns?: string;
    displayName: string;
    experienceLevel: ExperienceLevel;
    totalHours: number;
    totalSessions: number;
    specialties: CrisisSpecialtyInfo[];
    languages: LanguageInfo[];
    averageRating: number;
    successRate: number;
    responseReliability: number;
    lastActiveDate: Date;
    joinedDate: Date;
    badges?: VolunteerBadge[];
}
export interface CrisisSpecialtyInfo {
    type: CrisisSpecialty;
    level: SpecialtyLevel;
    hours: number;
    sessions: number;
    successRate: number;
    lastUsed: Date;
    certificationDate?: Date;
    refreshedDate?: Date;
    isActive: boolean;
}
export type CrisisSpecialty = 'SUICIDE_PREVENTION' | 'DOMESTIC_VIOLENCE' | 'SUBSTANCE_ABUSE' | 'TEEN_CRISIS' | 'CHILD_ABUSE' | 'ELDER_ABUSE' | 'LGBTQ_SUPPORT' | 'VETERAN_SUPPORT' | 'EATING_DISORDERS' | 'GRIEF_COUNSELING' | 'ANXIETY_PANIC' | 'DEPRESSION' | 'SELF_HARM' | 'TRAUMA_PTSD' | 'ADDICTION_RECOVERY' | 'RELATIONSHIP_CRISIS' | 'FINANCIAL_CRISIS' | 'WORKPLACE_STRESS' | 'ACADEMIC_STRESS' | 'MEDICAL_CRISIS' | 'DISABILITY_SUPPORT' | 'REFUGEE_SUPPORT' | 'DISASTER_RESPONSE' | 'CULTURAL_CRISIS' | 'SPIRITUAL_CRISIS';
export type SpecialtyLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'SPECIALIST';
export interface LanguageInfo {
    code: string;
    name: string;
    proficiency: LanguageProficiency;
    dialect?: string;
    isPreferred: boolean;
    isNative: boolean;
    isSignLanguage: boolean;
    certificationLevel?: string;
    lastUsed?: Date;
}
export interface VolunteerBadge {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    earnedDate: Date;
    iconUrl?: string;
    isPublic: boolean;
}
export type BadgeCategory = 'EXPERIENCE' | 'SPECIALIZATION' | 'PERFORMANCE' | 'DEDICATION' | 'INNOVATION' | 'MENTORSHIP' | 'EMERGENCY' | 'CULTURAL' | 'TRAINING';
export interface MatchScoreBreakdown {
    overall: number;
    components: {
        specialtyMatch: number;
        languageMatch: number;
        experienceMatch: number;
        availabilityMatch: number;
        performanceMatch: number;
        geographicMatch: number;
        culturalMatch: number;
        workloadMatch: number;
        reliabilityMatch: number;
        emergencyMatch?: number;
    };
    weights: {
        specialty: number;
        language: number;
        experience: number;
        availability: number;
        performance: number;
        geographic: number;
        cultural: number;
        workload: number;
        reliability: number;
        emergency?: number;
    };
    adjustments: MatchScoreAdjustment[];
}
export interface MatchScoreAdjustment {
    type: 'BONUS' | 'PENALTY';
    reason: string;
    value: number;
    category: string;
}
export interface MatchStrength {
    category: string;
    description: string;
    score: number;
    importance: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface MatchWeakness {
    category: string;
    description: string;
    score: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation?: string;
}
export interface VolunteerAvailabilityInfo {
    status: VolunteerOnlineStatus;
    estimatedResponseTime: number;
    availability: AvailabilityCategory;
    currentLoad: {
        activeSessions: number;
        maxConcurrent: number;
        utilizationPercentage: number;
    };
    shift: {
        isOnShift: boolean;
        shiftStart?: Date;
        shiftEnd?: Date;
        shiftRemaining?: number;
        isExtendable?: boolean;
    };
    breaks: {
        isOnBreak: boolean;
        breakStart?: Date;
        breakEnd?: Date;
        nextScheduledBreak?: Date;
        timeSinceLastBreak?: number;
    };
    emergencyAvailability: {
        isEmergencyAvailable: boolean;
        emergencyResponseTime?: number;
        emergencyCapacity?: number;
    };
}
export type AvailabilityCategory = 'IMMEDIATE' | 'WITHIN_1MIN' | 'WITHIN_5MIN' | 'WITHIN_15MIN' | 'WITHIN_30MIN' | 'DELAYED';
export interface VolunteerQualityMetrics {
    overall: {
        rating: number;
        confidence: number;
        sampleSize: number;
    };
    performance: {
        sessionQuality: number;
        crisisResolution: number;
        clientSatisfaction: number;
        responseTime: number;
        followThrough: number;
    };
    reliability: {
        attendanceRate: number;
        punctualityScore: number;
        shiftCompletion: number;
        communicationScore: number;
    };
    growth: {
        improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
        skillDevelopment: number;
        trainingCompletion: number;
        goalAchievement: number;
    };
    teamwork: {
        collaborationScore: number;
        mentorshipRating: number;
        feedbackQuality: number;
        knowledgeSharing: number;
    };
    recentTrends: QualityTrend[];
}
export interface QualityTrend {
    metric: string;
    period: 'WEEK' | 'MONTH' | 'QUARTER';
    trend: 'UP' | 'DOWN' | 'STABLE';
    changePercentage: number;
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface WorkloadAssessment {
    current: {
        activeSessions: number;
        hoursWorkedToday: number;
        hoursWorkedThisWeek: number;
        consecutiveSessions: number;
        timeSinceLastBreak: number;
    };
    capacity: {
        maxConcurrentSessions: number;
        maxHoursPerDay: number;
        maxHoursPerWeek: number;
        maxConsecutiveSessions: number;
        requiredBreakFrequency: number;
    };
    utilization: {
        currentUtilization: number;
        weeklyUtilization: number;
        trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
    };
    burnoutRisk: {
        level: BurnoutRiskLevel;
        score: number;
        factors: BurnoutFactor[];
        recommendations: string[];
    };
    wellness: {
        wellnessScore: number;
        stressLevel: number;
        jobSatisfaction: number;
        workLifeBalance: number;
        supportNeeded: boolean;
    };
    recommendations: WorkloadRecommendation[];
}
export type BurnoutRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface BurnoutFactor {
    factor: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    value: number;
}
export interface WorkloadRecommendation {
    type: 'CONTINUE' | 'REDUCE_LOAD' | 'TAKE_BREAK' | 'END_SHIFT' | 'SEEK_SUPPORT';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    actionItems: string[];
    timeframe: string;
}
export interface GeographicAlignment {
    overall: number;
    timezone: {
        match: boolean;
        volunteerTz: string;
        userTz: string;
        hoursDifference: number;
        isBusinessHours: boolean;
    };
    location: {
        sameCountry: boolean;
        sameRegion: boolean;
        distance?: number;
        culturalSimilarity: number;
    };
    emergency: {
        sameEmergencyServices: boolean;
        volunteerEmergencyNumber?: string;
        userEmergencyNumber?: string;
        canAssistWithLocal: boolean;
    };
    legal: {
        sameJurisdiction: boolean;
        reportingRequirements?: string[];
        legalConsiderations?: string[];
    };
}
export interface CulturalCompatibility {
    overall: number;
    language: {
        primaryLanguageMatch: boolean;
        dialectMatch: boolean;
        culturalNuances: number;
        communicationStyle: number;
    };
    cultural: {
        backgroundSimilarity: number;
        religiousCompetency: number;
        ethnicCompetency: number;
        socioeconomicUnderstanding: number;
    };
    specialNeeds: {
        lgbtqCompetency: boolean;
        veteranUnderstanding: boolean;
        disabilityAwareness: boolean;
        traumaInformedCare: boolean;
    };
    considerations: CulturalConsideration[];
}
export interface CulturalConsideration {
    type: string;
    description: string;
    importance: 'HIGH' | 'MEDIUM' | 'LOW';
    addressed: boolean;
    notes?: string;
}
export interface VolunteerRiskAssessment {
    overall: RiskLevel;
    factors: {
        experience: RiskLevel;
        workload: RiskLevel;
        performance: RiskLevel;
        wellness: RiskLevel;
        technical: RiskLevel;
    };
    mitigation: {
        supervision: SupervisionLevel;
        monitoring: MonitoringLevel;
        support: SupportLevel;
        backup: BackupLevel;
    };
    considerations: RiskConsideration[];
    emergencyPlan?: EmergencyPlan;
}
export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type SupervisionLevel = 'NONE' | 'PASSIVE' | 'ACTIVE' | 'CONTINUOUS' | 'MENTORED';
export type MonitoringLevel = 'STANDARD' | 'ENHANCED' | 'CONTINUOUS' | 'FULL';
export type SupportLevel = 'STANDARD' | 'ENHANCED' | 'IMMEDIATE' | 'SPECIALIZED';
export type BackupLevel = 'STANDARD' | 'ENHANCED' | 'IMMEDIATE' | 'SPECIALIST';
export interface RiskConsideration {
    category: string;
    risk: string;
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
}
export interface EmergencyPlan {
    triggers: string[];
    actions: EmergencyAction[];
    contacts: VolunteerEmergencyContact[];
    escalationPath: string[];
    timeframes: {
        [key: string]: number;
    };
}
export interface EmergencyAction {
    trigger: string;
    action: string;
    responsibility: string;
    timeframe: number;
    prerequisites?: string[];
}
export interface VolunteerEmergencyContact {
    role: string;
    name: string;
    phone: string;
    email?: string;
    availability: string;
    priority: number;
}
export interface LoadBalancingConfiguration {
    maxUtilization: number;
    burnoutThreshold: number;
    mandatoryBreakAfter: number;
    maxConsecutiveSessions: number;
    maxDailyHours: number;
    maxWeeklyHours: number;
    wellnessCheckInterval: number;
    emergencyOverride: boolean;
    gradualLoadReduction: boolean;
}
export interface LoadBalancingMetrics {
    volunteerId: string;
    timestamp: Date;
    currentLoad: number;
    current: {
        activeSessions: number;
        utilization: number;
        hoursToday: number;
        hoursThisWeek: number;
        consecutiveSessions: number;
        timeSinceBreak: number;
    };
    wellness: {
        burnoutScore: number;
        stressLevel: number;
        fatigue: number;
        satisfaction: number;
        lastWellnessCheck: Date;
    };
    performance: {
        recentRating: number;
        responseTime: number;
        completionRate: number;
        errorRate: number;
        trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    };
    recommendations: {
        action: LoadBalancingAction;
        priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
        timeframe: string;
    };
    recommendedAction: LoadBalancingAction;
}
export type LoadBalancingAction = 'CONTINUE' | 'REDUCE_LOAD' | 'MANDATORY_BREAK' | 'END_SHIFT' | 'WELLNESS_CHECK' | 'SUPERVISOR_REVIEW' | 'EMERGENCY_ONLY' | 'SUPPORT_ASSIGNMENT';
export interface VolunteerPerformanceMetrics {
    volunteerId: string;
    period: {
        start: Date;
        end: Date;
        type: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    };
    sessions: {
        total: number;
        completed: number;
        abandoned: number;
        escalated: number;
        averageDuration: number;
    };
    quality: {
        averageRating: number;
        clientSatisfaction: number;
        resolutionRate: number;
        followUpRate: number;
        errorRate: number;
    };
    efficiency: {
        averageResponseTime: number;
        utilizationRate: number;
        multitaskingEfficiency: number;
        resourceUsage: number;
    };
    growth: {
        skillImprovement: number;
        trainingHours: number;
        mentorshipHours: number;
        feedbackImplementation: number;
    };
    wellness: {
        burnoutRisk: number;
        jobSatisfaction: number;
        stressLevel: number;
        workLifeBalance: number;
    };
}
export interface EmergencyVolunteerPool {
    id: string;
    name: string;
    description: string;
    lastUpdated: Date;
    nextRotation: Date;
    configuration: EmergencyPoolConfiguration;
    volunteers: {
        critical: EmergencyVolunteerInfo[];
        specialist: EmergencyVolunteerInfo[];
        supervisor: EmergencyVolunteerInfo[];
        backup: EmergencyVolunteerInfo[];
    };
    capacity: {
        current: number;
        maximum: number;
        reserved: number;
    };
    coverage: {
        timezones: TimezoneCoverage[];
        languages: LanguageCoverage[];
        specialties: SpecialtyCoverage[];
    };
}
export interface EmergencyPoolConfiguration {
    rotationInterval: number;
    minimumCritical: number;
    minimumSpecialist: number;
    minimumSupervisor: number;
    autoRotation: boolean;
    overlapPeriod: number;
    qualificationRequirements: QualificationRequirement[];
}
export interface EmergencyVolunteerInfo {
    volunteerId: string;
    name: string;
    role: EmergencyRole;
    specialties: CrisisSpecialty[];
    languages: string[];
    timezone: string;
    availableUntil: Date;
    responseTime: number;
    currentLoad: number;
    maxEmergencyLoad: number;
    experienceLevel: ExperienceLevel;
    emergencyRating: number;
    lastEmergencyResponse?: Date;
    contact: {
        primary: string;
        secondary?: string;
        preferred: 'PHONE' | 'SMS' | 'APP' | 'EMAIL';
    };
}
export type EmergencyRole = 'CRITICAL_RESPONDER' | 'SPECIALIST_BACKUP' | 'SUPERVISOR' | 'COORDINATOR' | 'LIAISON' | 'SUPPORT';
export interface TimezoneCoverage {
    timezone: string;
    coverageHours: CoverageHour[];
    volunteersAvailable: number;
    qualityCoverage: boolean;
}
export interface ShiftSchedule {
    volunteerId: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    type: 'REGULAR' | 'EMERGENCY' | 'BACKUP' | 'TRAINING';
    maxSessions: number;
    breakSchedule: {
        duration: number;
        frequency: number;
    };
}
export interface CoverageHour {
    hour: number;
    coverage: 'NONE' | 'MINIMAL' | 'ADEQUATE' | 'EXCELLENT';
    volunteerCount: number;
    averageExperience: ExperienceLevel;
}
export interface LanguageCoverage {
    language: string;
    proficiency: LanguageProficiency;
    volunteersAvailable: number;
    timezonesCovered: string[];
    specialtiesCovered: CrisisSpecialty[];
}
export interface SpecialtyCoverage {
    specialty: CrisisSpecialty;
    level: SpecialtyLevel;
    volunteersAvailable: number;
    timezonesCovered: string[];
    languagesCovered: string[];
}
export interface QualificationRequirement {
    type: 'EXPERIENCE' | 'CERTIFICATION' | 'SPECIALTY' | 'PERFORMANCE' | 'AVAILABILITY';
    criteria: string;
    required: boolean;
    weight: number;
}
export interface VolunteerMatchingEvent {
    id: string;
    type: MatchingEventType;
    timestamp: Date;
    sessionId?: string;
    volunteerId?: string;
    data: any;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    handled: boolean;
    handledBy?: string;
    handledAt?: Date;
}
export type MatchingEventType = 'VOLUNTEER_MATCHED' | 'VOLUNTEER_UNAVAILABLE' | 'MATCH_TIMEOUT' | 'EMERGENCY_ESCALATION' | 'LOAD_BALANCING_TRIGGERED' | 'BURNOUT_DETECTED' | 'PERFORMANCE_DEGRADATION' | 'TECHNICAL_ISSUE' | 'SYSTEM_OVERLOAD' | 'COVERAGE_GAP';
export interface SystemConfiguration {
    matching: {
        timeouts: {
            normal: number;
            urgent: number;
            emergency: number;
        };
        thresholds: {
            minimumMatch: number;
            goodMatch: number;
            excellentMatch: number;
        };
        weights: MatchingWeights;
    };
    loadBalancing: LoadBalancingConfiguration;
    performance: {
        monitoringInterval: number;
        metricsRetention: number;
        alertThresholds: Record<string, number>;
    };
    emergency: {
        poolSize: number;
        rotationInterval: number;
        responseTimeTarget: number;
    };
}
export interface MatchingWeights {
    default: Record<string, number>;
    emergency: Record<string, number>;
    specialty: Record<CrisisSpecialty, Record<string, number>>;
    urgency: Record<CrisisUrgency, Record<string, number>>;
}
export interface MatchingAnalytics {
    period: {
        start: Date;
        end: Date;
        type: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
    };
    summary: {
        totalMatches: number;
        successfulMatches: number;
        failedMatches: number;
        timeouts: number;
        averageMatchTime: number;
        emergencyMatches: number;
    };
    quality: {
        averageMatchScore: number;
        distributionByScore: {
            [key: string]: number;
        };
        clientSatisfaction: number;
        volunteerSatisfaction: number;
    };
    efficiency: {
        responseTimePercentiles: {
            [key: string]: number;
        };
        utilizationRates: {
            [key: string]: number;
        };
        loadBalancingEffectiveness: number;
    };
    trends: AnalyticsTrend[];
    insights: AnalyticsInsight[];
}
export interface AnalyticsTrend {
    metric: string;
    direction: 'UP' | 'DOWN' | 'STABLE';
    magnitude: number;
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
    timeframe: string;
}
export interface AnalyticsInsight {
    category: string;
    insight: string;
    confidence: number;
    actionable: boolean;
    recommendations?: string[];
}
//# sourceMappingURL=volunteer-matching.types.d.ts.map