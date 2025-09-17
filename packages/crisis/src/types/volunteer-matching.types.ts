/**
 * ASTRAL_CORE 2.0 - Volunteer Matching System Types
 * 
 * Comprehensive type definitions for the advanced volunteer matching system
 * including real-time availability, load balancing, and performance tracking.
 */

// ========== CORE VOLUNTEER TYPES ==========

export interface VolunteerAvailabilityStatus {
  volunteerId: string;
  status: VolunteerOnlineStatus;
  lastHeartbeat: Date;
  currentSessions: number;
  maxConcurrentSessions: number;
  shiftStartTime?: Date;
  shiftEndTime?: Date;
  breakStartTime?: Date;
  breakDuration?: number; // minutes
  emergencyAvailable: boolean;
  location?: GeographicLocation;
  metadata?: {
    deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET';
    connectionQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    batteryLevel?: number; // for mobile devices
    pushNotificationsEnabled?: boolean;
  };
}

export type VolunteerOnlineStatus = 
  | 'ONLINE'           // Available and ready to take sessions
  | 'OFFLINE'          // Not available
  | 'BUSY'             // Currently in session(s) but may have capacity
  | 'BREAK'            // On scheduled break
  | 'EMERGENCY_ONLY'   // Only available for emergency situations
  | 'TRAINING'         // In training session
  | 'MEETING'          // In supervisor/team meeting
  | 'TECHNICAL_ISSUE'; // Experiencing technical difficulties

// ========== GEOGRAPHIC AND CULTURAL TYPES ==========

export interface GeographicLocation {
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  region?: string;
  regionCode?: string;
  city?: string;
  timezone: string; // IANA timezone identifier
  utcOffset: number; // in hours
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  culturalContext?: string[];
  languageRegion?: string; // e.g., 'en-US', 'es-MX', 'fr-CA'
  emergencyServicesNumber?: string; // local emergency number
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

// ========== CRISIS MATCHING TYPES ==========

export interface CrisisMatchingCriteria {
  // Crisis Details
  sessionId: string;
  urgency: CrisisUrgency;
  severity: number; // 1-10 scale
  estimatedDuration?: number; // minutes
  sessionType: SessionType;
  
  // Required Qualifications
  requiredSpecialties: CrisisSpecialty[];
  requiredLanguages: LanguageRequirement[];
  minimumExperienceLevel?: ExperienceLevel;
  minimumSuccessRate?: number; // percentage
  
  // Preferred Qualifications
  preferredSpecialties?: CrisisSpecialty[];
  preferredLanguages?: LanguageRequirement[];
  preferredExperienceLevel?: ExperienceLevel;
  
  // Cultural and Geographic
  culturalConsiderations?: string[];
  userLocation?: GeographicLocation;
  requiresSameCulture?: boolean;
  requiresSameTimezone?: boolean;
  requiresSameCountry?: boolean;
  
  // Special Requirements
  genderPreference?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'NO_PREFERENCE';
  agePreference?: 'PEER' | 'OLDER' | 'YOUNGER' | 'NO_PREFERENCE';
  requiresVideoCapable?: boolean;
  requiresMobileCompatible?: boolean;
  accessibilityRequirements?: string[];
  
  // Matching Preferences
  avoidPreviousVolunteers?: string[]; // volunteer IDs to avoid
  preferPreviousVolunteers?: string[]; // volunteer IDs to prefer
  allowTraineeVolunteers?: boolean;
  requireSupervisorPresent?: boolean;
  
  // Emergency Specific
  immediateResponse: boolean;
  emergencyServicesAlerted?: boolean;
  suicidalIdeation?: boolean;
  selfHarmRisk?: boolean;
  violenceRisk?: boolean;
  
  // System Metadata
  requestTimestamp: Date;
  maxWaitTime?: number; // seconds
  fallbackStrategy?: FallbackStrategy;
}

export type CrisisUrgency = 
  | 'LOW'       // Can wait for optimal match
  | 'NORMAL'    // Standard priority
  | 'HIGH'      // Needs quick response
  | 'CRITICAL'  // Very urgent, prioritize experience
  | 'EMERGENCY'; // Life-threatening, immediate response needed

export type SessionType = 
  | 'TEXT_CHAT'
  | 'VOICE_CALL'
  | 'VIDEO_CALL'
  | 'CRISIS_HOTLINE'
  | 'FOLLOW_UP'
  | 'GROUP_SUPPORT'
  | 'FAMILY_SUPPORT'
  | 'PEER_SUPPORT';

export type ExperienceLevel = 
  | 'TRAINEE'      // <10 hours
  | 'NOVICE'       // 10-50 hours
  | 'INTERMEDIATE' // 50-200 hours
  | 'ADVANCED'     // 200-500 hours
  | 'EXPERT'       // 500+ hours
  | 'SPECIALIST';  // Expert with specific certifications

export interface LanguageRequirement {
  languageCode: string; // ISO 639-1
  minimumProficiency: LanguageProficiency;
  dialectPreference?: string;
  isSignLanguage?: boolean;
  isWrittenOnly?: boolean;
}

export type LanguageProficiency = 
  | 'BASIC'          // Can handle simple conversations
  | 'CONVERSATIONAL' // Can handle most topics with some difficulty
  | 'FLUENT'         // Comfortable with complex topics
  | 'NATIVE'         // Native or near-native proficiency
  | 'PROFESSIONAL';  // Professional/business level proficiency

export type FallbackStrategy = 
  | 'WAIT_FOR_OPTIMAL'     // Wait for best match within time limit
  | 'ACCEPT_GOOD_MATCH'    // Accept first good match (score > 0.7)
  | 'ACCEPT_ANY_MATCH'     // Accept any viable match (score > 0.4)
  | 'ESCALATE_TO_EMERGENCY' // Escalate to emergency protocols
  | 'TRANSFER_TO_PARTNER'   // Transfer to partner organization
  | 'AUTO_RESOURCES_ONLY';  // Provide automated resources only

// ========== VOLUNTEER MATCHING RESULT TYPES ==========

export interface VolunteerMatchingResult {
  // Match Information
  matchId: string;
  sessionId: string;
  volunteerId: string;
  matchScore: number; // 0-1 scale
  confidence: MatchConfidence;
  
  // Volunteer Profile Summary
  volunteerSummary: VolunteerMatchingSummary;
  
  // Match Analysis
  matchBreakdown: MatchScoreBreakdown;
  strengthAreas: MatchStrength[];
  weaknessAreas: MatchWeakness[];
  
  // Availability Information
  availabilityInfo: VolunteerAvailabilityInfo;
  
  // Quality Metrics
  qualityMetrics: VolunteerQualityMetrics;
  
  // Workload Assessment
  workloadAssessment: WorkloadAssessment;
  
  // Geographic Alignment
  geographicAlignment: GeographicAlignment;
  
  // Cultural Compatibility
  culturalCompatibility: CulturalCompatibility;
  
  // Risk Assessment
  riskAssessment: VolunteerRiskAssessment;
  
  // System Metadata
  matchTimestamp: Date;
  responseTimeMs: number;
  algorithmVersion: string;
  fallbackUsed?: boolean;
  alternatives?: VolunteerMatchingResult[]; // other good matches
}

export type MatchConfidence = 
  | 'EXCELLENT' // Score > 0.9, perfect match
  | 'HIGH'      // Score > 0.8, very good match
  | 'GOOD'      // Score > 0.7, good match
  | 'FAIR'      // Score > 0.6, acceptable match
  | 'POOR'      // Score > 0.4, last resort match
  | 'CRITICAL'; // Score <= 0.4, emergency fallback only

export interface VolunteerMatchingSummary {
  firstName: string;
  preferredName?: string;
  pronouns?: string;
  displayName: string; // computed safe display name
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

export type CrisisSpecialty = 
  | 'SUICIDE_PREVENTION'
  | 'DOMESTIC_VIOLENCE'
  | 'SUBSTANCE_ABUSE'
  | 'TEEN_CRISIS'
  | 'CHILD_ABUSE'
  | 'ELDER_ABUSE'
  | 'LGBTQ_SUPPORT'
  | 'VETERAN_SUPPORT'
  | 'EATING_DISORDERS'
  | 'GRIEF_COUNSELING'
  | 'ANXIETY_PANIC'
  | 'DEPRESSION'
  | 'SELF_HARM'
  | 'TRAUMA_PTSD'
  | 'ADDICTION_RECOVERY'
  | 'RELATIONSHIP_CRISIS'
  | 'FINANCIAL_CRISIS'
  | 'WORKPLACE_STRESS'
  | 'ACADEMIC_STRESS'
  | 'MEDICAL_CRISIS'
  | 'DISABILITY_SUPPORT'
  | 'REFUGEE_SUPPORT'
  | 'DISASTER_RESPONSE'
  | 'CULTURAL_CRISIS'
  | 'SPIRITUAL_CRISIS';

export type SpecialtyLevel = 
  | 'BASIC'        // Initial training completed
  | 'INTERMEDIATE' // Additional training and experience
  | 'ADVANCED'     // Extensive experience and training
  | 'EXPERT'       // Expert level with mentoring capability
  | 'SPECIALIST';  // Specialized certifications and expertise

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

export type BadgeCategory = 
  | 'EXPERIENCE'     // Hours/sessions milestones
  | 'SPECIALIZATION' // Specialty expertise
  | 'PERFORMANCE'    // Quality achievements
  | 'DEDICATION'     // Consistency and reliability
  | 'INNOVATION'     // New techniques or improvements
  | 'MENTORSHIP'     // Teaching and guiding others
  | 'EMERGENCY'      // Emergency response achievements
  | 'CULTURAL'       // Cultural competency achievements
  | 'TRAINING';      // Training and certification achievements

// ========== DETAILED ASSESSMENT TYPES ==========

export interface MatchScoreBreakdown {
  overall: number; // 0-1
  components: {
    specialtyMatch: number;      // 0-1
    languageMatch: number;       // 0-1
    experienceMatch: number;     // 0-1
    availabilityMatch: number;   // 0-1
    performanceMatch: number;    // 0-1
    geographicMatch: number;     // 0-1
    culturalMatch: number;       // 0-1
    workloadMatch: number;       // 0-1
    reliabilityMatch: number;    // 0-1
    emergencyMatch?: number;     // 0-1 (only for emergency cases)
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
  value: number; // adjustment amount
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
  mitigation?: string; // suggested mitigation
}

export interface VolunteerAvailabilityInfo {
  status: VolunteerOnlineStatus;
  estimatedResponseTime: number; // seconds
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
    shiftRemaining?: number; // minutes
    isExtendable?: boolean;
  };
  breaks: {
    isOnBreak: boolean;
    breakStart?: Date;
    breakEnd?: Date;
    nextScheduledBreak?: Date;
    timeSinceLastBreak?: number; // minutes
  };
  emergencyAvailability: {
    isEmergencyAvailable: boolean;
    emergencyResponseTime?: number; // seconds
    emergencyCapacity?: number; // max emergency sessions
  };
}

export type AvailabilityCategory = 
  | 'IMMEDIATE'      // <30 seconds
  | 'WITHIN_1MIN'    // <1 minute
  | 'WITHIN_5MIN'    // <5 minutes
  | 'WITHIN_15MIN'   // <15 minutes
  | 'WITHIN_30MIN'   // <30 minutes
  | 'DELAYED';       // >30 minutes

export interface VolunteerQualityMetrics {
  overall: {
    rating: number; // 1-10
    confidence: number; // 0-1
    sampleSize: number; // number of evaluations
  };
  performance: {
    sessionQuality: number; // 1-10
    crisisResolution: number; // percentage
    clientSatisfaction: number; // 1-10
    responseTime: number; // average seconds
    followThrough: number; // percentage
  };
  reliability: {
    attendanceRate: number; // percentage
    punctualityScore: number; // 1-10
    shiftCompletion: number; // percentage
    communicationScore: number; // 1-10
  };
  growth: {
    improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    skillDevelopment: number; // 1-10
    trainingCompletion: number; // percentage
    goalAchievement: number; // percentage
  };
  teamwork: {
    collaborationScore: number; // 1-10
    mentorshipRating: number; // 1-10
    feedbackQuality: number; // 1-10
    knowledgeSharing: number; // 1-10
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
    timeSinceLastBreak: number; // minutes
  };
  capacity: {
    maxConcurrentSessions: number;
    maxHoursPerDay: number;
    maxHoursPerWeek: number;
    maxConsecutiveSessions: number;
    requiredBreakFrequency: number; // minutes
  };
  utilization: {
    currentUtilization: number; // 0-1
    weeklyUtilization: number; // 0-1
    trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
  burnoutRisk: {
    level: BurnoutRiskLevel;
    score: number; // 0-1
    factors: BurnoutFactor[];
    recommendations: string[];
  };
  wellness: {
    wellnessScore: number; // 1-10
    stressLevel: number; // 1-10
    jobSatisfaction: number; // 1-10
    workLifeBalance: number; // 1-10
    supportNeeded: boolean;
  };
  recommendations: WorkloadRecommendation[];
}

export type BurnoutRiskLevel = 
  | 'LOW'      // 0-0.3
  | 'MEDIUM'   // 0.3-0.6
  | 'HIGH'     // 0.6-0.8
  | 'CRITICAL'; // 0.8-1.0

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
  overall: number; // 0-1 alignment score
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
    distance?: number; // kilometers
    culturalSimilarity: number; // 0-1
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
  overall: number; // 0-1 compatibility score
  language: {
    primaryLanguageMatch: boolean;
    dialectMatch: boolean;
    culturalNuances: number; // 0-1
    communicationStyle: number; // 0-1
  };
  cultural: {
    backgroundSimilarity: number; // 0-1
    religiousCompetency: number; // 0-1
    ethnicCompetency: number; // 0-1
    socioeconomicUnderstanding: number; // 0-1
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

export type RiskLevel = 
  | 'VERY_LOW'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'VERY_HIGH';

export type SupervisionLevel = 
  | 'NONE'           // Independent operation
  | 'PASSIVE'        // Available if needed
  | 'ACTIVE'         // Regular check-ins
  | 'CONTINUOUS'     // Constant supervision
  | 'MENTORED';      // Working with mentor

export type MonitoringLevel = 
  | 'STANDARD'       // Normal monitoring
  | 'ENHANCED'       // Increased monitoring
  | 'CONTINUOUS'     // Real-time monitoring
  | 'FULL';          // Complete session monitoring

export type SupportLevel = 
  | 'STANDARD'       // Normal support availability
  | 'ENHANCED'       // Additional support ready
  | 'IMMEDIATE'      // Immediate support available
  | 'SPECIALIZED';   // Specialized support team

export type BackupLevel = 
  | 'STANDARD'       // Normal backup volunteer available
  | 'ENHANCED'       // Multiple backup volunteers
  | 'IMMEDIATE'      // Immediate backup ready
  | 'SPECIALIST';    // Specialist backup available

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
  timeframes: {[key: string]: number}; // seconds
}

export interface EmergencyAction {
  trigger: string;
  action: string;
  responsibility: string;
  timeframe: number; // seconds
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

// ========== LOAD BALANCING TYPES ==========

export interface LoadBalancingConfiguration {
  maxUtilization: number; // 0-1, maximum allowed utilization
  burnoutThreshold: number; // 0-1, burnout prevention threshold
  mandatoryBreakAfter: number; // minutes of continuous work
  maxConsecutiveSessions: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
  wellnessCheckInterval: number; // minutes
  emergencyOverride: boolean; // allow override for emergencies
  gradualLoadReduction: boolean; // gradually reduce load vs immediate
}

export interface LoadBalancingMetrics {
  volunteerId: string;
  timestamp: Date;
  currentLoad: number; // 0-1 utilization level for workload manager compatibility
  current: {
    activeSessions: number;
    utilization: number; // 0-1
    hoursToday: number;
    hoursThisWeek: number;
    consecutiveSessions: number;
    timeSinceBreak: number; // minutes
  };
  wellness: {
    burnoutScore: number; // 0-1
    stressLevel: number; // 1-10
    fatigue: number; // 1-10
    satisfaction: number; // 1-10
    lastWellnessCheck: Date;
  };
  performance: {
    recentRating: number; // 1-10
    responseTime: number; // seconds
    completionRate: number; // 0-1
    errorRate: number; // 0-1
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  recommendations: {
    action: LoadBalancingAction;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    timeframe: string;
  };
  recommendedAction: LoadBalancingAction; // Direct access for workload manager compatibility
}

export type LoadBalancingAction = 
  | 'CONTINUE'           // Continue current assignment pattern
  | 'REDUCE_LOAD'        // Reduce new assignments
  | 'MANDATORY_BREAK'    // Force break before new assignments
  | 'END_SHIFT'          // End shift early
  | 'WELLNESS_CHECK'     // Perform wellness assessment
  | 'SUPERVISOR_REVIEW'  // Escalate to supervisor
  | 'EMERGENCY_ONLY'     // Only emergency assignments
  | 'SUPPORT_ASSIGNMENT'; // Assign support volunteer

// ========== PERFORMANCE TRACKING TYPES ==========

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
    averageDuration: number; // minutes
  };
  quality: {
    averageRating: number; // 1-10
    clientSatisfaction: number; // 1-10
    resolutionRate: number; // 0-1
    followUpRate: number; // 0-1
    errorRate: number; // 0-1
  };
  efficiency: {
    averageResponseTime: number; // seconds
    utilizationRate: number; // 0-1
    multitaskingEfficiency: number; // 0-1
    resourceUsage: number; // 0-1
  };
  growth: {
    skillImprovement: number; // 0-1
    trainingHours: number;
    mentorshipHours: number;
    feedbackImplementation: number; // 0-1
  };
  wellness: {
    burnoutRisk: number; // 0-1
    jobSatisfaction: number; // 1-10
    stressLevel: number; // 1-10
    workLifeBalance: number; // 1-10
  };
}

// ========== EMERGENCY POOL TYPES ==========

export interface EmergencyVolunteerPool {
  id: string;
  name: string;
  description: string;
  lastUpdated: Date;
  nextRotation: Date;
  configuration: EmergencyPoolConfiguration;
  volunteers: {
    critical: EmergencyVolunteerInfo[];     // Immediate response specialists
    specialist: EmergencyVolunteerInfo[];   // Specialty backup
    supervisor: EmergencyVolunteerInfo[];   // On-call supervisors
    backup: EmergencyVolunteerInfo[];       // Secondary backup
  };
  capacity: {
    current: number;
    maximum: number;
    reserved: number; // reserved for ultra-critical
  };
  coverage: {
    timezones: TimezoneCoverage[];
    languages: LanguageCoverage[];
    specialties: SpecialtyCoverage[];
  };
}

export interface EmergencyPoolConfiguration {
  rotationInterval: number; // hours
  minimumCritical: number;
  minimumSpecialist: number;
  minimumSupervisor: number;
  autoRotation: boolean;
  overlapPeriod: number; // minutes for handoff
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
  responseTime: number; // seconds
  currentLoad: number;
  maxEmergencyLoad: number;
  experienceLevel: ExperienceLevel;
  emergencyRating: number; // 1-10
  lastEmergencyResponse?: Date;
  contact: {
    primary: string;
    secondary?: string;
    preferred: 'PHONE' | 'SMS' | 'APP' | 'EMAIL';
  };
}

export type EmergencyRole = 
  | 'CRITICAL_RESPONDER'  // First line emergency response
  | 'SPECIALIST_BACKUP'   // Specialty crisis backup
  | 'SUPERVISOR'          // On-call supervision
  | 'COORDINATOR'         // Emergency coordination
  | 'LIAISON'             // External agency liaison
  | 'SUPPORT';            // Support and relief

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
    duration: number; // minutes
    frequency: number; // sessions between breaks
  };
}

export interface CoverageHour {
  hour: number; // 0-23
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
  weight: number; // 0-1
}

// ========== SYSTEM EVENTS AND NOTIFICATIONS ==========

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

export type MatchingEventType = 
  | 'VOLUNTEER_MATCHED'
  | 'VOLUNTEER_UNAVAILABLE'
  | 'MATCH_TIMEOUT'
  | 'EMERGENCY_ESCALATION'
  | 'LOAD_BALANCING_TRIGGERED'
  | 'BURNOUT_DETECTED'
  | 'PERFORMANCE_DEGRADATION'
  | 'TECHNICAL_ISSUE'
  | 'SYSTEM_OVERLOAD'
  | 'COVERAGE_GAP';

export interface SystemConfiguration {
  matching: {
    timeouts: {
      normal: number; // ms
      urgent: number; // ms
      emergency: number; // ms
    };
    thresholds: {
      minimumMatch: number; // 0-1
      goodMatch: number; // 0-1
      excellentMatch: number; // 0-1
    };
    weights: MatchingWeights;
  };
  loadBalancing: LoadBalancingConfiguration;
  performance: {
    monitoringInterval: number; // ms
    metricsRetention: number; // days
    alertThresholds: Record<string, number>;
  };
  emergency: {
    poolSize: number;
    rotationInterval: number; // hours
    responseTimeTarget: number; // seconds
  };
}

export interface MatchingWeights {
  default: Record<string, number>;
  emergency: Record<string, number>;
  specialty: Record<CrisisSpecialty, Record<string, number>>;
  urgency: Record<CrisisUrgency, Record<string, number>>;
}

// ========== ANALYTICS AND REPORTING TYPES ==========

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
    averageMatchTime: number; // ms
    emergencyMatches: number;
  };
  quality: {
    averageMatchScore: number;
    distributionByScore: {[key: string]: number};
    clientSatisfaction: number;
    volunteerSatisfaction: number;
  };
  efficiency: {
    responseTimePercentiles: {[key: string]: number};
    utilizationRates: {[key: string]: number};
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
  confidence: number; // 0-1
  actionable: boolean;
  recommendations?: string[];
}