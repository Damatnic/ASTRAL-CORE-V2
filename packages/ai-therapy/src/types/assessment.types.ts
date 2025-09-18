/**
 * Clinical assessment type definitions
 */

export interface Assessment {
  id: string;
  type: AssessmentType;
  userId: string;
  administeredBy: string; // therapist ID or 'self'
  administeredAt: Date;
  completedAt?: Date;
  score: number;
  severity: SeverityLevel;
  interpretation: string;
  items: AssessmentItem[];
  recommendations: string[];
  followUpRequired: boolean;
  nextAssessmentDue?: Date;
}

export type AssessmentType = 
  | 'PHQ-9'    // Depression
  | 'GAD-7'    // Anxiety
  | 'PCL-5'    // PTSD
  | 'MDI'      // Major Depression Inventory
  | 'BADS'     // Behavioral Activation for Depression Scale
  | 'ACE'      // Adverse Childhood Experiences
  | 'DASS-21'  // Depression Anxiety Stress Scales
  | 'AUDIT'    // Alcohol Use
  | 'DAST-10'  // Drug Abuse
  | 'ISI'      // Insomnia Severity Index
  | 'PSS'      // Perceived Stress Scale
  | 'SWLS'     // Satisfaction With Life Scale
  | 'Custom';

export type SeverityLevel = 
  | 'none'
  | 'minimal'
  | 'mild'
  | 'moderate'
  | 'moderately_severe'
  | 'severe';

export interface AssessmentItem {
  questionId: string;
  question: string;
  response: number | string;
  score: number;
  flagged?: boolean; // for critical items
}

// PHQ-9 Specific
export interface PHQ9Assessment extends Assessment {
  type: 'PHQ-9';
  suicidalIdeation: boolean;
  functionalImpairment?: 'not_difficult' | 'somewhat_difficult' | 'very_difficult' | 'extremely_difficult';
  symptomDuration?: string;
  interpretation: PHQ9Interpretation;
}

export interface PHQ9Interpretation {
  totalScore: number;
  severity: 'none' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  majorDepressionLikely: boolean;
  otherDepressionLikely: boolean;
  treatmentRecommendation: string;
  monitoringFrequency: string;
}

// GAD-7 Specific
export interface GAD7Assessment extends Assessment {
  type: 'GAD-7';
  functionalImpairment?: 'not_difficult' | 'somewhat_difficult' | 'very_difficult' | 'extremely_difficult';
  panicSymptoms?: boolean;
  interpretation: GAD7Interpretation;
}

export interface GAD7Interpretation {
  totalScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  generalizedAnxietyLikely: boolean;
  panicDisorderScreen: boolean;
  socialAnxietyScreen: boolean;
  treatmentRecommendation: string;
}

// PCL-5 Specific
export interface PCL5Assessment extends Assessment {
  type: 'PCL-5';
  traumaExposure: string;
  traumaDate?: Date;
  interpretation: PCL5Interpretation;
  clusterScores: PCL5ClusterScores;
}

export interface PCL5Interpretation {
  totalScore: number;
  provisionalPTSD: boolean;
  clusterCriteriaMet: {
    B: boolean; // Intrusion
    C: boolean; // Avoidance
    D: boolean; // Negative alterations
    E: boolean; // Hyperarousal
  };
  severity: 'below_threshold' | 'mild' | 'moderate' | 'severe';
  treatmentRecommendation: string;
}

export interface PCL5ClusterScores {
  intrusion: number;
  avoidance: number;
  negativeAlterations: number;
  hyperarousal: number;
}

// Custom Assessment Builder
export interface CustomAssessmentTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  validatedBy?: string;
  questions: CustomQuestion[];
  scoringMethod: ScoringMethod;
  interpretationGuide: InterpretationGuide[];
  normativeData?: NormativeData;
}

export interface CustomQuestion {
  id: string;
  text: string;
  type: 'likert' | 'binary' | 'multiple_choice' | 'text' | 'numeric';
  required: boolean;
  options?: QuestionOption[];
  scoringWeight?: number;
  reverseScored?: boolean;
  criticalItem?: boolean;
}

export interface QuestionOption {
  value: string | number;
  label: string;
  score: number;
}

export type ScoringMethod = 
  | 'sum'
  | 'average'
  | 'weighted_sum'
  | 'custom_algorithm';

export interface InterpretationGuide {
  scoreRange: [number, number];
  severity: SeverityLevel;
  interpretation: string;
  recommendations: string[];
}

export interface NormativeData {
  population: string;
  mean: number;
  standardDeviation: number;
  percentiles: Record<number, number>;
}

// Assessment Battery
export interface AssessmentBattery {
  id: string;
  name: string;
  description: string;
  assessments: AssessmentType[];
  purpose: BatteryPurpose;
  estimatedDuration: number; // minutes
  frequency?: string;
}

export type BatteryPurpose = 
  | 'intake'
  | 'progress_monitoring'
  | 'outcome_measurement'
  | 'diagnostic_clarification'
  | 'treatment_planning';

// Assessment Tracking
export interface AssessmentProgress {
  userId: string;
  assessmentType: AssessmentType;
  scores: AssessmentScore[];
  trend: 'improving' | 'stable' | 'worsening';
  clinicallySignificantChange: boolean;
  reliableChange: boolean;
  lastAssessment: Date;
  nextDue: Date;
}

export interface AssessmentScore {
  date: Date;
  score: number;
  severity: SeverityLevel;
  noteableEvents?: string[];
}

// Clinical Cutoffs and Norms
export interface ClinicalCutoffs {
  assessmentType: AssessmentType;
  cutoffs: CutoffScore[];
  clinicalSignificanceThreshold?: number;
  reliableChangeIndex?: number;
  minimumDetectableChange?: number;
}

export interface CutoffScore {
  score: number;
  severity: SeverityLevel;
  percentile?: number;
  description: string;
}

// Assessment Alerts
export interface AssessmentAlert {
  id: string;
  userId: string;
  assessmentId: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export type AlertType = 
  | 'critical_item_endorsed'
  | 'significant_deterioration'
  | 'suicidal_ideation'
  | 'assessment_overdue'
  | 'inconsistent_responding'
  | 'requires_clinical_review';

// Assessment Report
export interface AssessmentReport {
  userId: string;
  generatedAt: Date;
  period: [Date, Date];
  assessments: Assessment[];
  summary: string;
  progress: ProgressSummary;
  recommendations: string[];
  clinicianNotes?: string;
  nextSteps: string[];
}

export interface ProgressSummary {
  overallTrend: 'improving' | 'stable' | 'worsening' | 'mixed';
  symptomAreas: SymptomProgress[];
  strengthsIdentified: string[];
  areasOfConcern: string[];
  treatmentResponse: 'excellent' | 'good' | 'partial' | 'minimal' | 'none';
}