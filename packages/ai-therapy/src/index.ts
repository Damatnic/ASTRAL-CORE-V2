/**
 * ASTRAL_CORE 2.0 AI Therapy System
 * 
 * Advanced AI-Powered Therapeutic Intervention System
 * 
 * SPECIALIZED AI THERAPISTS:
 * - Dr. Aria: CBT (Cognitive Behavioral Therapy) Specialist
 * - Dr. Sage: DBT (Dialectical Behavior Therapy) Specialist  
 * - Dr. Luna: Trauma/EMDR Specialist
 * - Dr. River: Mindfulness/ACT Specialist
 * 
 * EVIDENCE-BASED APPROACHES:
 * - Cognitive restructuring and behavioral activation
 * - Distress tolerance and emotion regulation
 * - Trauma-informed care and processing
 * - Acceptance and mindfulness practices
 * 
 * HIPAA COMPLIANT FEATURES:
 * - End-to-end encryption for all therapy sessions
 * - No PII storage in AI models
 * - Secure session transcripts with auto-deletion
 * - Audit trail for all therapeutic interactions
 * 
 * CLINICAL SAFETY:
 * - Real-time crisis detection during sessions
 * - Automatic escalation to human therapists
 * - Evidence-based intervention protocols
 * - Continuous therapeutic alliance monitoring
 */

// Core AI Therapy Engine
export { AITherapyEngine } from './engines/AITherapyEngine';
export { TherapeuticSession } from './sessions/TherapeuticSession';
export { TherapistPersonality } from './personalities/TherapistPersonality';

// Specialized AI Therapists
export { DrAria } from './therapists/DrAria';
export { DrSage } from './therapists/DrSage';
export { DrLuna } from './therapists/DrLuna';
export { DrRiver } from './therapists/DrRiver';

// Therapeutic Approaches
export { CBTModule } from './approaches/CBTModule';
export { DBTModule } from './approaches/DBTModule';
export { EMDRModule } from './approaches/EMDRModule';
export { ACTModule } from './approaches/ACTModule';

// Clinical Tools
export { ThoughtRecordAnalyzer } from './tools/ThoughtRecordAnalyzer';
export { DistressToleranceCoach } from './tools/DistressToleranceCoach';
export { MindfulnessGuide } from './tools/MindfulnessGuide';
export { TraumaProcessor } from './tools/TraumaProcessor';

// Assessment Tools
export { PHQ9Assessment } from './assessments/PHQ9Assessment';
export { GAD7Assessment } from './assessments/GAD7Assessment';
export { PCL5Assessment } from './assessments/PCL5Assessment';
export { MDIAssessment } from './assessments/MDIAssessment';

// Session Management
export { SessionManager } from './sessions/SessionManager';
export { ProgressTracker } from './tracking/ProgressTracker';
export { TreatmentPlanner } from './planning/TreatmentPlanner';
export { HomeworkGenerator } from './homework/HomeworkGenerator';

// Integration Systems
export { CrisisDetectionIntegration } from './integrations/CrisisDetectionIntegration';
export { HumanTherapistHandoff } from './integrations/HumanTherapistHandoff';
export { MetricsCollector } from './metrics/MetricsCollector';

// Types
export * from './types/therapy.types';
export * from './types/session.types';
export * from './types/assessment.types';

// Constants
export const AI_THERAPY_CONSTANTS = {
  // Session parameters
  MAX_SESSION_DURATION_MINUTES: 50,
  MIN_SESSION_DURATION_MINUTES: 15,
  SESSION_WARNING_TIME_MINUTES: 5,
  
  // Therapeutic thresholds
  CRISIS_DETECTION_THRESHOLD: 0.85,
  HANDOFF_RECOMMENDATION_THRESHOLD: 0.75,
  PROGRESS_SIGNIFICANCE_THRESHOLD: 0.6,
  
  // Assessment intervals
  PHQ9_INTERVAL_DAYS: 14,
  GAD7_INTERVAL_DAYS: 14,
  PROGRESS_REVIEW_DAYS: 30,
  
  // Quality metrics
  MIN_THERAPEUTIC_ALLIANCE_SCORE: 0.7,
  MIN_SESSION_ENGAGEMENT_SCORE: 0.6,
  MIN_INTERVENTION_EFFECTIVENESS: 0.65,
  
  // Safety parameters
  MAX_CRISIS_MENTIONS_BEFORE_ESCALATION: 3,
  EMERGENCY_RESPONSE_TIME_SECONDS: 10,
  HUMAN_OVERSIGHT_CHECK_INTERVAL_MINUTES: 15,
  
  // Evidence-based protocol compliance
  CBT_PROTOCOL_ADHERENCE_MIN: 0.8,
  DBT_SKILL_COVERAGE_MIN: 0.75,
  EMDR_PHASE_COMPLETION_REQUIRED: true,
  ACT_VALUES_CLARIFICATION_MIN: 0.7,
} as const;

// Therapeutic approach configurations
export const THERAPY_APPROACHES = {
  CBT: {
    name: 'Cognitive Behavioral Therapy',
    specialist: 'DrAria',
    techniques: [
      'Cognitive restructuring',
      'Behavioral activation',
      'Thought records',
      'Exposure therapy',
      'Problem-solving therapy'
    ],
    suitable_for: [
      'Depression',
      'Anxiety',
      'Phobias',
      'OCD',
      'Insomnia'
    ]
  },
  
  DBT: {
    name: 'Dialectical Behavior Therapy',
    specialist: 'DrSage',
    techniques: [
      'Distress tolerance',
      'Emotion regulation',
      'Interpersonal effectiveness',
      'Mindfulness',
      'Radical acceptance'
    ],
    suitable_for: [
      'Borderline personality',
      'Self-harm',
      'Emotional dysregulation',
      'Suicidal ideation',
      'Impulsivity'
    ]
  },
  
  EMDR: {
    name: 'Eye Movement Desensitization and Reprocessing',
    specialist: 'DrLuna',
    techniques: [
      'Bilateral stimulation',
      'Resource installation',
      'Trauma processing',
      'Somatic awareness',
      'Dual awareness'
    ],
    suitable_for: [
      'PTSD',
      'Trauma',
      'Panic attacks',
      'Complicated grief',
      'Phobias'
    ]
  },
  
  ACT: {
    name: 'Acceptance and Commitment Therapy',
    specialist: 'DrRiver',
    techniques: [
      'Values clarification',
      'Mindfulness practices',
      'Cognitive defusion',
      'Acceptance exercises',
      'Committed action'
    ],
    suitable_for: [
      'Chronic pain',
      'Anxiety disorders',
      'Depression',
      'Stress',
      'Life transitions'
    ]
  }
} as const;

// Crisis intervention protocols
export const CRISIS_PROTOCOLS = {
  IMMEDIATE_DANGER: {
    priority: 1,
    actions: [
      'Activate emergency services',
      'Maintain engagement',
      'Deploy safety planning',
      'Alert crisis team',
      'Document thoroughly'
    ],
    response_time_seconds: 5
  },
  
  HIGH_RISK: {
    priority: 2,
    actions: [
      'Escalate to human therapist',
      'Conduct risk assessment',
      'Create safety plan',
      'Increase check-in frequency',
      'Mobilize support network'
    ],
    response_time_seconds: 30
  },
  
  MODERATE_RISK: {
    priority: 3,
    actions: [
      'Enhanced monitoring',
      'Offer coping strategies',
      'Schedule follow-up',
      'Provide resources',
      'Document concerns'
    ],
    response_time_seconds: 60
  }
} as const;