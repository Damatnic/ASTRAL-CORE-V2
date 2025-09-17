/**
 * ASTRAL_CORE 2.0 Training System Types
 * Type definitions for volunteer training and certification systems
 */
export interface TrainingModule {
    id: string;
    title: string;
    description: string;
    category: 'CRISIS_INTERVENTION' | 'SUICIDE_PREVENTION' | 'ACTIVE_LISTENING' | 'DE_ESCALATION' | 'MENTAL_HEALTH_FIRST_AID' | 'CULTURAL_COMPETENCY' | 'SAFETY_PROTOCOLS';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    estimatedDuration: number;
    prerequisites: string[];
    content: TrainingModuleContent;
    assessments: Assessment[];
    certificationRequired: boolean;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isActive: boolean;
}
export interface TrainingModuleContent {
    introduction: ContentSection;
    sections: ContentSection[];
    resources: TrainingResource[];
    practicalExercises: PracticalExercise[];
    knowledgeChecks: KnowledgeCheck[];
    summary: ContentSection;
}
export interface ContentSection {
    id: string;
    title: string;
    type: 'TEXT' | 'VIDEO' | 'AUDIO' | 'INTERACTIVE' | 'SIMULATION' | 'CASE_STUDY';
    content: string;
    mediaUrls?: string[];
    duration?: number;
    learningObjectives: string[];
    keyPoints: string[];
    notes?: string;
}
export interface TrainingResource {
    id: string;
    title: string;
    type: 'PDF' | 'VIDEO' | 'ARTICLE' | 'WEBSITE' | 'PODCAST' | 'EBOOK' | 'TOOLKIT';
    url?: string;
    description: string;
    isRequired: boolean;
    estimatedReadTime?: number;
    tags: string[];
}
export interface PracticalExercise {
    id: string;
    title: string;
    description: string;
    type: 'ROLE_PLAY' | 'SCENARIO_SIMULATION' | 'CASE_STUDY_ANALYSIS' | 'PEER_PRACTICE' | 'REAL_TIME_SIMULATION';
    instructions: string[];
    expectedOutcomes: string[];
    evaluationCriteria: EvaluationCriteria[];
    timeLimit?: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
export interface KnowledgeCheck {
    id: string;
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'SCENARIO_RESPONSE';
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    points: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    learningObjective: string;
}
export interface Assessment {
    id: string;
    title: string;
    type: 'QUIZ' | 'PRACTICAL_EXAM' | 'PEER_EVALUATION' | 'SUPERVISOR_REVIEW' | 'COMPETENCY_TEST';
    description: string;
    questions: AssessmentQuestion[];
    passingScore: number;
    maxAttempts: number;
    timeLimit?: number;
    isRequired: boolean;
    weight: number;
}
export interface AssessmentQuestion {
    id: string;
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'SCENARIO_ANALYSIS' | 'VIDEO_RESPONSE';
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    feedback: {
        correct: string;
        incorrect: string;
    };
    tags: string[];
}
export interface EvaluationCriteria {
    id: string;
    criterion: string;
    description: string;
    maxPoints: number;
    rubric: RubricLevel[];
}
export interface RubricLevel {
    level: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
    points: number;
    description: string;
    indicators: string[];
}
export interface TrainingProgress {
    id: string;
    volunteerId: string;
    moduleId: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
    startedAt?: Date;
    completedAt?: Date;
    lastAccessedAt?: Date;
    progressPercentage: number;
    timeSpent: number;
    currentSection?: string;
    sectionsCompleted: string[];
    assessmentResults: AssessmentResult[];
    notes?: string;
}
export interface AssessmentResult {
    assessmentId: string;
    attempt: number;
    score: number;
    passed: boolean;
    completedAt: Date;
    timeSpent: number;
    answers: QuestionAnswer[];
    feedback?: string;
    reviewRequired?: boolean;
}
export interface QuestionAnswer {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent?: number;
}
export interface SkillAssessment {
    id: string;
    skillName: string;
    category: string;
    description: string;
    competencyLevels: CompetencyLevel[];
    assessmentMethods: AssessmentMethod[];
    requiredForCertification: boolean;
    renewalPeriod?: number;
}
export interface CompetencyLevel {
    level: 'NOVICE' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';
    description: string;
    requirements: string[];
    indicators: string[];
}
export interface AssessmentMethod {
    type: 'OBSERVATION' | 'SIMULATION' | 'PEER_REVIEW' | 'SELF_ASSESSMENT' | 'SUPERVISOR_EVALUATION';
    description: string;
    criteria: string[];
    weight: number;
}
export interface Certification {
    id: string;
    name: string;
    description: string;
    requirements: CertificationRequirement[];
    validityPeriod: number;
    renewalRequirements: string[];
    issuingAuthority: string;
    creditsAwarded?: number;
    level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST';
}
export interface CertificationRequirement {
    type: 'MODULE_COMPLETION' | 'ASSESSMENT_PASS' | 'PRACTICAL_HOURS' | 'PEER_EVALUATION' | 'SUPERVISOR_APPROVAL';
    description: string;
    target: string;
    minimumScore?: number;
    requiredHours?: number;
}
export interface VolunteerCertification {
    id: string;
    volunteerId: string;
    certificationId: string;
    issuedAt: Date;
    expiresAt: Date;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
    issuedBy: string;
    certificateUrl?: string;
    renewalNotificationSent?: boolean;
    notes?: string;
}
export interface TrainingPlan {
    id: string;
    volunteerId: string;
    name: string;
    description: string;
    modules: TrainingPlanModule[];
    totalEstimatedHours: number;
    targetCompletionDate: Date;
    createdAt: Date;
    createdBy: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
    progressPercentage: number;
}
export interface TrainingPlanModule {
    moduleId: string;
    order: number;
    isRequired: boolean;
    targetCompletionDate?: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    prerequisites: string[];
}
export interface TrainingStatistics {
    totalModules: number;
    totalAssessments: number;
    averageCompletionTime: number;
    passRate: number;
    popularModules: ModulePopularity[];
    skillDistribution: SkillDistribution[];
    certificationRates: CertificationRate[];
    monthlyProgress: MonthlyProgress[];
}
export interface ModulePopularity {
    moduleId: string;
    moduleName: string;
    enrollments: number;
    completions: number;
    averageRating: number;
}
export interface SkillDistribution {
    skill: string;
    novice: number;
    competent: number;
    proficient: number;
    expert: number;
}
export interface CertificationRate {
    certificationId: string;
    certificationName: string;
    issued: number;
    expired: number;
    renewed: number;
    activeCount: number;
}
export interface MonthlyProgress {
    month: string;
    modulesCompleted: number;
    assessmentsPassed: number;
    certificationsIssued: number;
    averageScore: number;
}
//# sourceMappingURL=training.types.d.ts.map