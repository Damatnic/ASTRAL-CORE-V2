/**
 * Training Package - Type definitions
 * @module @astralcore/training/types
 */

export interface TrainingModuleType {
  VIDEO: 'VIDEO';
  READING: 'READING';
  INTERACTIVE: 'INTERACTIVE';
  ASSESSMENT: 'ASSESSMENT';
  SIMULATION: 'SIMULATION';
}

export interface TrainingDifficulty {
  BASIC: 'BASIC';
  INTERMEDIATE: 'INTERMEDIATE';
  ADVANCED: 'ADVANCED';
  EXPERT: 'EXPERT';
}

export interface TrainingStatus {
  NOT_STARTED: 'NOT_STARTED';
  IN_PROGRESS: 'IN_PROGRESS';
  COMPLETED: 'COMPLETED';
  PASSED: 'PASSED';
  FAILED: 'FAILED';
}

export interface CertificationLevel {
  BASIC: 'BASIC';
  INTERMEDIATE: 'INTERMEDIATE';
  ADVANCED: 'ADVANCED';
  SPECIALIST: 'SPECIALIST';
}

export interface CertificationStatus {
  ACTIVE: 'ACTIVE';
  EXPIRED: 'EXPIRED';
  REVOKED: 'REVOKED';
  SUSPENDED: 'SUSPENDED';
}

// Re-export main interfaces from the engine
export type {
  TrainingModule,
  TrainingContent,
  AssessmentQuestion,
  CrisisSimulation,
  EvaluationCriteria,
  RubricLevel,
  TrainingProgress,
  Certification,
  VolunteerCertification
} from './VolunteerTrainingEngine';