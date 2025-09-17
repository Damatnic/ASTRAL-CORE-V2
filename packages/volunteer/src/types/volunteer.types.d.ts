/**
 * ASTRAL_CORE 2.0 Volunteer Management Types
 * Type definitions for volunteer profiles, scheduling, and performance tracking
 */
import { VolunteerCertification } from '../../../training/src/types/training.types';
export interface VolunteerProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    preferredName?: string;
    pronouns?: string;
    dateOfBirth: Date;
    timezone: string;
    languagesSpoken: Language[];
    status: 'ACTIVE' | 'INACTIVE' | 'ON_BREAK' | 'SUSPENDED' | 'PENDING_APPROVAL';
    joinedAt: Date;
    lastActiveAt?: Date;
    emergencyContact: EmergencyContact;
    backgroundCheckStatus: BackgroundCheckStatus;
    certifications: VolunteerCertification[];
    specialties: CrisisSpecialty[];
    experience: VolunteerExperience;
    availability: VolunteerAvailability;
    preferences: VolunteerPreferences;
    wellnessMetrics: WellnessMetrics;
    performanceMetrics: PerformanceMetrics;
    notes?: string;
}
export interface Language {
    code: string;
    name: string;
    proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
    isPreferred: boolean;
}
export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isLocalContact: boolean;
}
export interface BackgroundCheckStatus {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
    completedAt?: Date;
    expiresAt?: Date;
    provider: string;
    referenceNumber?: string;
    notes?: string;
}
export interface CrisisSpecialty {
    type: 'SUICIDE_PREVENTION' | 'DOMESTIC_VIOLENCE' | 'SUBSTANCE_ABUSE' | 'TEEN_CRISIS' | 'LGBTQ_SUPPORT' | 'VETERAN_SUPPORT' | 'EATING_DISORDERS' | 'GRIEF_COUNSELING';
    level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    certifiedAt: Date;
    lastRefreshedAt?: Date;
    isActive: boolean;
}
export interface VolunteerExperience {
    totalHours: number;
    totalSessions: number;
    successfulInterventions: number;
    averageSessionDuration: number;
    specialtyHours: SpecialtyHours[];
    yearsOfExperience: number;
    previousVolunteerWork?: string[];
    professionalBackground?: string;
}
export interface SpecialtyHours {
    specialty: CrisisSpecialty['type'];
    hours: number;
    sessions: number;
    successRate: number;
}
export interface VolunteerAvailability {
    id: string;
    volunteerId: string;
    schedule: WeeklySchedule;
    timeOffRequests: TimeOffRequest[];
    maximumHoursPerWeek: number;
    maximumSessionsPerDay: number;
    preferredSessionLength: number;
    minimumBreakBetweenSessions: number;
    isAvailableForEmergencies: boolean;
    lastUpdated: Date;
}
export interface WeeklySchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}
export interface DaySchedule {
    isAvailable: boolean;
    timeSlots: TimeSlot[];
    maxHours?: number;
    notes?: string;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    specialties?: CrisisSpecialty['type'][];
}
export interface TimeOffRequest {
    id: string;
    startDate: Date;
    endDate: Date;
    reason: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'TRAINING' | 'EMERGENCY' | 'BURNOUT_PREVENTION';
    status: 'PENDING' | 'APPROVED' | 'DENIED';
    isPartialDay: boolean;
    hoursOff?: number;
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    notes?: string;
}
export interface VolunteerPreferences {
    communicationPreferences: CommunicationPreferences;
    crisisTypePreferences: CrisisTypePreference[];
    sessionPreferences: SessionPreferences;
    mentorshipPreferences: MentorshipPreferences;
    privacySettings: PrivacySettings;
}
export interface CommunicationPreferences {
    preferredContactMethod: 'EMAIL' | 'SMS' | 'PHONE' | 'IN_APP';
    allowEmergencyContact: boolean;
    scheduleChangeNotifications: boolean;
    performanceReportNotifications: boolean;
    trainingReminderNotifications: boolean;
    systemUpdateNotifications: boolean;
    weeklyDigestEnabled: boolean;
}
export interface CrisisTypePreference {
    type: CrisisSpecialty['type'];
    preference: 'PREFERRED' | 'NEUTRAL' | 'AVOID' | 'NEVER';
    reason?: string;
    confidenceLevel: number;
}
export interface SessionPreferences {
    preferredSessionTypes: SessionType[];
    avoidSessionTypes: SessionType[];
    maximumConcurrentSessions: number;
    preferShortSessions: boolean;
    preferLongSessions: boolean;
    willingToMentor: boolean;
    needsMentorship: boolean;
}
export type SessionType = 'TEXT_CHAT' | 'VOICE_CALL' | 'VIDEO_CALL' | 'CRISIS_HOTLINE' | 'FOLLOW_UP' | 'GROUP_SUPPORT';
export interface MentorshipPreferences {
    isMentor: boolean;
    seekingMentor: boolean;
    mentorshipAreas: string[];
    maximumMentees: number;
    preferredMentorshipStyle: 'FORMAL' | 'INFORMAL' | 'PEER_SUPPORT';
}
export interface PrivacySettings {
    sharePerformanceMetrics: boolean;
    shareAvailabilityPublicly: boolean;
    allowDirectContact: boolean;
    shareSpecialties: boolean;
    participateInResearch: boolean;
}
export interface WellnessMetrics {
    currentBurnoutScore: number;
    stressLevel: number;
    jobSatisfaction: number;
    workLifeBalance: number;
    lastWellnessCheck: Date;
    wellnessAlerts: WellnessAlert[];
    supportNeeded: boolean;
    hasActiveSupportPlan: boolean;
}
export interface WellnessAlert {
    id: string;
    type: 'BURNOUT_RISK' | 'EXCESSIVE_HOURS' | 'LOW_SATISFACTION' | 'STRESS_INDICATORS' | 'PERFORMANCE_DECLINE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    triggeredAt: Date;
    actionTaken?: string;
    resolvedAt?: Date;
    isActive: boolean;
}
export interface PerformanceMetrics {
    overallRating: number;
    sessionQualityScore: number;
    responseTimeAverage: number;
    crisisResolutionRate: number;
    clientSatisfactionScore: number;
    professionalDevelopmentScore: number;
    teamworkScore: number;
    reliabilityScore: number;
    lastEvaluationDate: Date;
    strengths: string[];
    areasForImprovement: string[];
    goals: PerformanceGoal[];
    recognitions: Recognition[];
}
export interface PerformanceGoal {
    id: string;
    description: string;
    targetMetric: string;
    targetValue: number;
    currentValue: number;
    deadline: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface Recognition {
    id: string;
    type: 'ACHIEVEMENT' | 'COMMENDATION' | 'MILESTONE' | 'PEER_NOMINATION' | 'CLIENT_FEEDBACK';
    title: string;
    description: string;
    awardedAt: Date;
    awardedBy: string;
    isPublic: boolean;
}
export interface VolunteerShift {
    id: string;
    volunteerId: string;
    startTime: Date;
    endTime: Date;
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'EMERGENCY_COVERAGE';
    actualStartTime?: Date;
    actualEndTime?: Date;
    sessionsHandled: number;
    hoursWorked: number;
    breaksTaken: ShiftBreak[];
    performanceNotes?: string;
    supervisorFeedback?: string;
}
export interface ShiftBreak {
    startTime: Date;
    endTime: Date;
    type: 'SCHEDULED' | 'EMERGENCY' | 'WELLNESS';
    duration: number;
}
export interface VolunteerTrainingRecord {
    volunteerId: string;
    trainingCompletions: TrainingCompletion[];
    skillAssessments: SkillAssessment[];
    continuingEducationHours: number;
    lastTrainingDate: Date;
    nextRequiredTraining?: Date;
    certificationStatus: CertificationStatus[];
}
export interface TrainingCompletion {
    trainingId: string;
    trainingName: string;
    completedAt: Date;
    score: number;
    certificateUrl?: string;
    validUntil?: Date;
    requiresRenewal: boolean;
}
export interface SkillAssessment {
    skillName: string;
    assessmentDate: Date;
    score: number;
    assessorId: string;
    feedback: string;
    nextAssessmentDue?: Date;
}
export interface CertificationStatus {
    certificationId: string;
    certificationName: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' | 'SUSPENDED';
    issuedDate: Date;
    expiryDate: Date;
    renewalDeadline?: Date;
}
export interface VolunteerTeam {
    id: string;
    name: string;
    description: string;
    teamLead: string;
    members: string[];
    specialization?: CrisisSpecialty['type'];
    maxSize: number;
    meetingSchedule?: string;
    communicationChannel?: string;
    performanceMetrics: TeamPerformanceMetrics;
}
export interface TeamPerformanceMetrics {
    totalSessions: number;
    averageResponseTime: number;
    teamSatisfactionScore: number;
    collaborationScore: number;
    knowledgeSharingScore: number;
    lastReviewDate: Date;
}
export interface VolunteerFeedback {
    id: string;
    volunteerId: string;
    sessionId?: string;
    feedbackType: 'PEER_REVIEW' | 'SUPERVISOR_EVALUATION' | 'SELF_ASSESSMENT' | 'CLIENT_FEEDBACK' | 'SYSTEM_GENERATED';
    rating: number;
    comments: string;
    strengths: string[];
    improvementAreas: string[];
    actionItems: string[];
    isAnonymous: boolean;
    submittedAt: Date;
    submittedBy: string;
}
export interface VolunteerSupport {
    id: string;
    volunteerId: string;
    supportType: 'MENTORING' | 'COUNSELING' | 'PEER_SUPPORT' | 'PROFESSIONAL_DEVELOPMENT' | 'BURNOUT_PREVENTION';
    status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assignedSupporterId?: string;
    startDate: Date;
    endDate?: Date;
    sessions: SupportSession[];
    goals: string[];
    outcomes: string[];
    notes?: string;
}
export interface SupportSession {
    id: string;
    sessionDate: Date;
    duration: number;
    type: 'ONE_ON_ONE' | 'GROUP' | 'PHONE' | 'VIDEO' | 'IN_PERSON';
    topics: string[];
    actionItems: string[];
    nextSessionDate?: Date;
    supporterNotes?: string;
    volunteerFeedback?: string;
}
export interface VolunteerStatistics {
    totalVolunteers: number;
    activeVolunteers: number;
    newVolunteersThisMonth: number;
    averageExperienceLevel: number;
    retentionRate: number;
    averageBurnoutScore: number;
    topSpecialties: SpecialtyCount[];
    availabilityByDay: DayAvailability[];
    performanceDistribution: PerformanceDistribution;
    trainingCompletionRates: TrainingCompletionRate[];
}
export interface SpecialtyCount {
    specialty: CrisisSpecialty['type'];
    count: number;
    averageExperience: number;
}
export interface DayAvailability {
    day: string;
    availableVolunteers: number;
    totalHours: number;
    coveragePercentage: number;
}
export interface PerformanceDistribution {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
}
export interface TrainingCompletionRate {
    trainingName: string;
    completionRate: number;
    averageScore: number;
    timeTaken: number;
}
//# sourceMappingURL=volunteer.types.d.ts.map