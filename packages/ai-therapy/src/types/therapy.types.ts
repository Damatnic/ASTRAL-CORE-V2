/**
 * Type definitions for AI Therapy System
 */

export interface TherapistProfile {
  id: string;
  name: string;
  title: string;
  specialization: TherapyApproach;
  avatar?: string;
  bio: string;
  credentials: string[];
  experience: string;
  approach: string;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
}

export type TherapyApproach = 'CBT' | 'DBT' | 'EMDR' | 'ACT' | 'Integrative';

export interface TherapeuticIntervention {
  type: InterventionType;
  technique: string;
  rationale: string;
  instructions: string;
  duration?: number;
  resources?: Resource[];
  homework?: HomeworkAssignment;
}

export type InterventionType = 
  | 'cognitive_restructuring'
  | 'behavioral_activation'
  | 'mindfulness_exercise'
  | 'distress_tolerance'
  | 'emotion_regulation'
  | 'trauma_processing'
  | 'values_clarification'
  | 'exposure_therapy'
  | 'grounding_technique'
  | 'breathing_exercise';

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  type: 'worksheet' | 'practice' | 'journal' | 'behavioral' | 'reading';
  dueDate?: Date;
  instructions: string[];
  resources?: Resource[];
  trackingMetrics?: string[];
  completed?: boolean;
  completedAt?: Date;
  feedback?: string;
}

export interface Resource {
  id: string;
  type: 'article' | 'video' | 'audio' | 'worksheet' | 'app' | 'book';
  title: string;
  description?: string;
  url?: string;
  content?: string;
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface TherapeuticGoal {
  id: string;
  category: GoalCategory;
  description: string;
  targetDate?: Date;
  milestones: Milestone[];
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export type GoalCategory = 
  | 'symptom_reduction'
  | 'skill_building'
  | 'behavioral_change'
  | 'cognitive_change'
  | 'emotional_regulation'
  | 'relationship_improvement'
  | 'trauma_recovery'
  | 'personal_growth';

export interface Milestone {
  id: string;
  goalId: string;
  description: string;
  targetDate?: Date;
  completed: boolean;
  completedAt?: Date;
  evidence?: string;
}

export interface TreatmentPlan {
  id: string;
  userId: string;
  therapistId: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  approach: TherapyApproach;
  goals: TherapeuticGoal[];
  interventions: TherapeuticIntervention[];
  assessmentSchedule: AssessmentSchedule[];
  reviewDate: Date;
  status: 'active' | 'completed' | 'modified' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSchedule {
  assessmentType: AssessmentType;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  nextDue: Date;
  lastCompleted?: Date;
}

export type AssessmentType = 
  | 'PHQ-9'
  | 'GAD-7'
  | 'PCL-5'
  | 'MDI'
  | 'BADS'
  | 'ACE'
  | 'DASS-21'
  | 'Custom';

export interface TherapeuticResponse {
  message: string;
  intervention?: TherapeuticIntervention;
  emotionalTone: EmotionalTone;
  followUpQuestions?: string[];
  resources?: Resource[];
  homework?: HomeworkAssignment;
  crisisDetected: boolean;
  handoffRecommended: boolean;
  confidence: number; // 0-1
}

export type EmotionalTone = 
  | 'empathetic'
  | 'supportive'
  | 'encouraging'
  | 'validating'
  | 'challenging'
  | 'directive'
  | 'exploratory'
  | 'psychoeducational';

export interface SessionNote {
  id: string;
  sessionId: string;
  timestamp: Date;
  content: string;
  interventionsUsed: string[];
  clientPresentation: string;
  progressNotes: string;
  homework?: HomeworkAssignment[];
  riskAssessment?: RiskAssessment;
  planForNext: string;
  supervisorReview?: SupervisorReview;
}

export interface RiskAssessment {
  suicidalIdeation: RiskLevel;
  selfHarm: RiskLevel;
  harmToOthers: RiskLevel;
  substanceUse: RiskLevel;
  impulsivity: RiskLevel;
  protectiveFactors: string[];
  riskFactors: string[];
  safetyPlan?: SafetyPlan;
  overallRisk: RiskLevel;
}

export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'imminent';

export interface SafetyPlan {
  warningSignsRecognized: string[];
  copingStrategies: string[];
  distractionActivities: string[];
  supportPeople: ContactPerson[];
  professionalContacts: ContactPerson[];
  safeEnvironmentSteps: string[];
  reasonsForLiving: string[];
  emergencyNumbers: EmergencyContact[];
}

export interface ContactPerson {
  name: string;
  relationship: string;
  phone?: string;
  available: string; // e.g., "Weekdays 9-5"
}

export interface EmergencyContact {
  service: string;
  number: string;
  available: string;
}

export interface SupervisorReview {
  reviewerId: string;
  reviewDate: Date;
  feedback: string;
  recommendations?: string[];
  approved: boolean;
}

export interface TherapeuticAlliance {
  bond: number; // 0-1
  goals: number; // 0-1
  tasks: number; // 0-1
  overall: number; // 0-1
  lastMeasured: Date;
}

export interface ClientInsight {
  pattern: InsightPattern;
  description: string;
  evidence: string[];
  significance: 'low' | 'medium' | 'high';
  suggestedIntervention?: TherapeuticIntervention;
  detectedAt: Date;
}

export type InsightPattern = 
  | 'cognitive_distortion'
  | 'behavioral_pattern'
  | 'emotional_trigger'
  | 'relational_dynamic'
  | 'trauma_response'
  | 'coping_mechanism'
  | 'strength_identified'
  | 'progress_milestone';

export interface TherapyMetrics {
  sessionCount: number;
  totalDuration: number; // minutes
  engagementScore: number; // 0-1
  progressScore: number; // 0-1
  homeworkCompletion: number; // 0-1
  therapeuticAlliance: TherapeuticAlliance;
  symptomImprovement: Map<string, number>; // symptom -> improvement %
  skillsAcquired: string[];
  insightsGained: ClientInsight[];
}