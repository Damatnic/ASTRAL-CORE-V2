/**
 * ASTRAL_CORE 2.0 - Volunteer Training & Certification Engine
 * 
 * LIFE-CRITICAL VOLUNTEER PREPARATION SYSTEM
 * This engine manages the training and certification of crisis volunteers.
 * Proper training saves lives - every volunteer must be fully prepared
 * before handling crisis interventions.
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '../../database/generated/client';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'READING' | 'INTERACTIVE' | 'ASSESSMENT' | 'SIMULATION';
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  content: TrainingContent;
  passingScore?: number; // for assessments
  requiredForCertification: string[];
  isRequired: boolean;
  tags: string[];
}

export interface TrainingContent {
  videoUrl?: string;
  documentUrl?: string;
  interactiveContent?: any;
  assessmentQuestions?: AssessmentQuestion[];
  simulationScenarios?: CrisisSimulation[];
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'scenario_response';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation: string;
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
}

export interface CrisisSimulation {
  id: string;
  title: string;
  scenario: string;
  difficultyLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  estimatedDuration: number;
  learningObjectives: string[];
  crisisType: 'SUICIDE' | 'SELF_HARM' | 'PANIC' | 'DEPRESSION' | 'ANXIETY' | 'TRAUMA';
  evaluationCriteria: EvaluationCriteria[];
}

export interface EvaluationCriteria {
  id: string;
  description: string;
  weight: number; // percentage
  passingThreshold: number;
  rubric: RubricLevel[];
}

export interface RubricLevel {
  level: 'POOR' | 'BASIC' | 'PROFICIENT' | 'EXPERT';
  score: number;
  description: string;
}

export interface TrainingProgress {
  volunteerId: string;
  moduleId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  attempts: number;
  passingScore: number;
  moduleTitle: string;
  moduleType: string;
  duration: number; // minutes
  content: any;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'SPECIALIST';
  requiredModules: string[];
  validityPeriod: number; // months
  renewalRequired: boolean;
  specializations?: string[];
  prerequisites?: string[];
}

export interface VolunteerCertification {
  volunteerId: string;
  certificationId: string;
  earnedAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
  score: number;
  specializations: string[];
}

export class VolunteerTrainingEngine extends EventEmitter {
  private static instance: VolunteerTrainingEngine;
  private prisma: PrismaClient;
  private trainingModules: Map<string, TrainingModule> = new Map();
  private certifications: Map<string, Certification> = new Map();

  private constructor() {
    super();
    this.prisma = new PrismaClient();
    this.initialize();
  }

  public static getInstance(): VolunteerTrainingEngine {
    if (!VolunteerTrainingEngine.instance) {
      VolunteerTrainingEngine.instance = new VolunteerTrainingEngine();
    }
    return VolunteerTrainingEngine.instance;
  }

  private async initialize(): Promise<void> {
    console.log('📚 Initializing Volunteer Training Engine...');
    
    await this.loadTrainingModules();
    await this.loadCertifications();
    await this.setupPeriodicRenewalCheck();
    
    console.log('✅ Volunteer Training Engine ready');
    this.emit('ready');
  }

  private async loadTrainingModules(): Promise<void> {
    // Core crisis intervention training modules
    const coreModules: TrainingModule[] = [
      {
        id: 'crisis-basics-001',
        title: 'Crisis Intervention Fundamentals',
        description: 'Essential principles of crisis intervention and suicide prevention',
        type: 'VIDEO',
        difficulty: 'BASIC',
        estimatedDuration: 45,
        prerequisites: [],
        content: {
          videoUrl: '/training/crisis-basics.mp4',
          documentUrl: '/training/crisis-basics-guide.pdf',
        },
        requiredForCertification: ['BASIC_CRISIS', 'SUICIDE_PREVENTION'],
        isRequired: true,
        tags: ['crisis', 'basics', 'suicide-prevention'],
      },
      {
        id: 'active-listening-002',
        title: 'Active Listening & De-escalation',
        description: 'Advanced techniques for active listening and crisis de-escalation',
        type: 'INTERACTIVE',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: 60,
        prerequisites: ['crisis-basics-001'],
        content: {
          interactiveContent: {
            scenarios: 8,
            practiceExercises: 12,
            feedbackMechanism: 'AI_POWERED',
          },
        },
        requiredForCertification: ['BASIC_CRISIS', 'ADVANCED_CRISIS'],
        isRequired: true,
        tags: ['listening', 'de-escalation', 'communication'],
      },
      {
        id: 'suicide-assessment-003',
        title: 'Suicide Risk Assessment',
        description: 'Comprehensive training on assessing suicide risk and protective factors',
        type: 'ASSESSMENT',
        difficulty: 'ADVANCED',
        estimatedDuration: 90,
        prerequisites: ['crisis-basics-001', 'active-listening-002'],
        content: {
          assessmentQuestions: [
            {
              id: 'sa-001',
              type: 'scenario_response',
              question: 'A user says "I have been thinking about ending my life for weeks. I have pills saved up." How do you respond?',
              correctAnswer: [
                'Validate their courage for sharing',
                'Assess immediate safety',
                'Ask about timeline and plan',
                'Connect to professional help',
                'Stay with them until safe'
              ],
              explanation: 'This response demonstrates high-risk indicators requiring immediate assessment and intervention.',
              difficulty: 'ADVANCED',
              tags: ['suicide-risk', 'assessment', 'immediate-danger'],
            }
          ],
        },
        passingScore: 85,
        requiredForCertification: ['SUICIDE_PREVENTION', 'ADVANCED_CRISIS'],
        isRequired: true,
        tags: ['suicide', 'risk-assessment', 'safety'],
      },
      {
        id: 'crisis-simulation-004',
        title: 'Crisis Simulation Practice',
        description: 'Realistic crisis scenarios for hands-on practice',
        type: 'SIMULATION',
        difficulty: 'ADVANCED',
        estimatedDuration: 120,
        prerequisites: ['crisis-basics-001', 'active-listening-002', 'suicide-assessment-003'],
        content: {
          simulationScenarios: [
            {
              id: 'sim-001',
              title: 'Immediate Suicide Risk with Plan',
              scenario: 'Anonymous user: "I have the gun loaded. My family will be better without me. I\'m going to do it tonight."',
              difficultyLevel: 'EXPERT',
              estimatedDuration: 30,
              learningObjectives: [
                'Immediate risk assessment',
                'Emergency escalation',
                'De-escalation techniques',
                'Resource connection',
              ],
              crisisType: 'SUICIDE',
              evaluationCriteria: [
                {
                  id: 'ec-001',
                  description: 'Immediate safety assessment and response',
                  weight: 40,
                  passingThreshold: 80,
                  rubric: [
                    { level: 'EXPERT', score: 90, description: 'Immediately assesses safety, escalates appropriately, maintains connection' },
                    { level: 'PROFICIENT', score: 80, description: 'Good safety assessment, appropriate escalation, good connection' },
                    { level: 'BASIC', score: 70, description: 'Basic safety check, some escalation, maintains conversation' },
                    { level: 'POOR', score: 50, description: 'Misses safety cues, inappropriate response, poor connection' },
                  ],
                },
              ],
            },
          ],
        },
        passingScore: 80,
        requiredForCertification: ['ADVANCED_CRISIS', 'SPECIALIST'],
        isRequired: false,
        tags: ['simulation', 'practice', 'scenarios'],
      },
      {
        id: 'trauma-informed-005',
        title: 'Trauma-Informed Care Principles',
        description: 'Understanding trauma responses and providing trauma-informed support',
        type: 'VIDEO',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: 75,
        prerequisites: ['crisis-basics-001'],
        content: {
          videoUrl: '/training/trauma-informed-care.mp4',
          documentUrl: '/training/trauma-principles.pdf',
        },
        requiredForCertification: ['TRAUMA_SPECIALIST', 'ADVANCED_CRISIS'],
        isRequired: false,
        tags: ['trauma', 'informed-care', 'healing'],
      },
      {
        id: 'self-care-006',
        title: 'Volunteer Self-Care & Burnout Prevention',
        description: 'Essential self-care practices for crisis volunteers',
        type: 'INTERACTIVE',
        difficulty: 'BASIC',
        estimatedDuration: 30,
        prerequisites: [],
        content: {
          interactiveContent: {
            selfAssessmentTools: 5,
            copingStrategies: 15,
            burnoutWarnings: 8,
          },
        },
        requiredForCertification: ['BASIC_CRISIS'],
        isRequired: true,
        tags: ['self-care', 'burnout', 'wellness'],
      },
    ];

    // Load modules into memory
    coreModules.forEach(module => {
      this.trainingModules.set(module.id, module);
    });

    console.log(`📚 Loaded ${coreModules.length} training modules`);
  }

  private async loadCertifications(): Promise<void> {
    const certifications: Certification[] = [
      {
        id: 'BASIC_CRISIS',
        name: 'Basic Crisis Support Certification',
        description: 'Foundational certification for crisis support volunteers',
        level: 'BASIC',
        requiredModules: [
          'crisis-basics-001',
          'active-listening-002',
          'self-care-006'
        ],
        validityPeriod: 12, // 1 year
        renewalRequired: true,
        prerequisites: [],
      },
      {
        id: 'SUICIDE_PREVENTION',
        name: 'Suicide Prevention Specialist Certification',
        description: 'Specialized certification for suicide prevention and intervention',
        level: 'SPECIALIST',
        requiredModules: [
          'crisis-basics-001',
          'active-listening-002',
          'suicide-assessment-003',
          'self-care-006'
        ],
        validityPeriod: 12,
        renewalRequired: true,
        specializations: ['suicide-prevention', 'risk-assessment'],
        prerequisites: ['BASIC_CRISIS'],
      },
      {
        id: 'ADVANCED_CRISIS',
        name: 'Advanced Crisis Intervention Certification',
        description: 'Advanced certification for complex crisis situations',
        level: 'ADVANCED',
        requiredModules: [
          'crisis-basics-001',
          'active-listening-002',
          'suicide-assessment-003',
          'crisis-simulation-004',
          'trauma-informed-005',
          'self-care-006'
        ],
        validityPeriod: 18,
        renewalRequired: true,
        specializations: ['advanced-crisis', 'emergency-response'],
        prerequisites: ['BASIC_CRISIS', 'SUICIDE_PREVENTION'],
      },
      {
        id: 'TRAUMA_SPECIALIST',
        name: 'Trauma-Informed Crisis Support Certification',
        description: 'Specialized certification for trauma-informed crisis support',
        level: 'SPECIALIST',
        requiredModules: [
          'crisis-basics-001',
          'active-listening-002',
          'trauma-informed-005',
          'self-care-006'
        ],
        validityPeriod: 24,
        renewalRequired: true,
        specializations: ['trauma-informed', 'healing-focused'],
        prerequisites: ['BASIC_CRISIS'],
      },
    ];

    certifications.forEach(cert => {
      this.certifications.set(cert.id, cert);
    });

    console.log(`🏆 Loaded ${certifications.length} certifications`);
  }

  public async enrollVolunteer(volunteerId: string, moduleId: string): Promise<void> {
    const module = this.trainingModules.get(moduleId);
    if (!module) {
      throw new Error(`Training module ${moduleId} not found`);
    }

    // Check prerequisites
    for (const prereq of module.prerequisites) {
      const progress = await this.getModuleProgress(volunteerId, prereq);
      if (!progress || progress.status !== 'COMPLETED') {
        throw new Error(`Prerequisite module ${prereq} not completed`);
      }
    }
    
    // Create training progress record
    await this.prisma.volunteerTraining.create({
      data: {
        volunteerId,
        moduleId,
        status: 'NOT_STARTED',
        attempts: 0,
        moduleTitle: module.title,
        moduleType: module.type === 'VIDEO' ? 'CRISIS_INTERVENTION' : 'CRISIS_INTERVENTION', // Map to valid enum
        duration: module.estimatedDuration,
        content: module.content as any,
        passingScore: module.passingScore || 80,
      }
    });

    console.log(`📚 Volunteer ${volunteerId} enrolled in module ${moduleId}`);
    this.emit('volunteer_enrolled', { volunteerId, moduleId });
  }

  public async startModule(volunteerId: string, moduleId: string): Promise<void> {
    await this.prisma.volunteerTraining.update({
      where: {
        volunteerId_moduleId: { volunteerId, moduleId }
      },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    });

    console.log(`▶️ Volunteer ${volunteerId} started module ${moduleId}`);
    this.emit('module_started', { volunteerId, moduleId });
  }

  public async submitAssessment(
    volunteerId: string, 
    moduleId: string, 
    answers: Record<string, any>
  ): Promise<{ passed: boolean; score: number; feedback: string[] }> {
    const module = this.trainingModules.get(moduleId);
    if (!module || module.type !== 'ASSESSMENT') {
      throw new Error('Invalid assessment module');
    }

    const questions = module.content.assessmentQuestions || [];
    let totalScore = 0;
    const feedback: string[] = [];

    // Grade assessment
    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = this.evaluateAnswer(question, userAnswer);
      
      if (isCorrect) {
        totalScore += 1;
        feedback.push(`✅ Question ${question.id}: Correct`);
      } else {
        feedback.push(`❌ Question ${question.id}: ${question.explanation}`);
      }
    }

    const score = Math.round((totalScore / questions.length) * 100);
    const passed = score >= (module.passingScore || 70);

    // Update progress
    await this.updateModuleProgress(volunteerId, moduleId, {
      status: passed ? 'COMPLETED' : 'FAILED', // Use enum value from schema
      score,
      completedAt: new Date(),
      attempts: { increment: 1 },
    });

    console.log(`📝 Assessment ${moduleId} submitted by ${volunteerId}: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);
    
    this.emit('assessment_submitted', { 
      volunteerId, 
      moduleId, 
      score, 
      passed,
      feedback 
    });

    return { passed, score, feedback };
  }

  public async completeSimulation(
    volunteerId: string,
    moduleId: string,
    simulationId: string,
    performance: any
  ): Promise<{ passed: boolean; score: number; feedback: any }> {
    const module = this.trainingModules.get(moduleId);
    if (!module || module.type !== 'SIMULATION') {
      throw new Error('Invalid simulation module');
    }

    const simulation = module.content.simulationScenarios?.find(s => s.id === simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    // Evaluate performance against criteria
    let totalScore = 0;
    const detailedFeedback: any = {};

    for (const criteria of simulation.evaluationCriteria) {
      const score = this.evaluateSimulationCriteria(criteria, performance[criteria.id]);
      totalScore += (score * criteria.weight / 100);
      detailedFeedback[criteria.id] = {
        score,
        threshold: criteria.passingThreshold,
        passed: score >= criteria.passingThreshold,
      };
    }

    const passed = totalScore >= (module.passingScore || 80);

    // Update progress
    await this.updateModuleProgress(volunteerId, moduleId, {
      status: passed ? 'COMPLETED' : 'FAILED', // Use enum value from schema
      score: totalScore,
      completedAt: new Date(),
      attempts: { increment: 1 },
    });

    console.log(`🎭 Simulation ${simulationId} completed by ${volunteerId}: ${totalScore}% (${passed ? 'PASSED' : 'FAILED'})`);

    this.emit('simulation_completed', {
      volunteerId,
      moduleId,
      simulationId,
      score: totalScore,
      passed,
      feedback: detailedFeedback,
    });

    return { passed, score: totalScore, feedback: detailedFeedback };
  }

  public async checkCertificationEligibility(volunteerId: string, certificationId: string): Promise<{
    eligible: boolean;
    completedModules: string[];
    missingModules: string[];
    missingPrerequisites: string[];
  }> {
    const certification = this.certifications.get(certificationId);
    if (!certification) {
      throw new Error('Certification not found');
    }

    // Check prerequisites
    const missingPrerequisites: string[] = [];
    if (certification.prerequisites) {
      for (const prereq of certification.prerequisites) {
        const existing = await this.getVolunteerCertification(volunteerId, prereq);
        if (!existing || existing.status !== 'ACTIVE') {
          missingPrerequisites.push(prereq);
        }
      }
    }

    // Check required modules
    const completedModules: string[] = [];
    const missingModules: string[] = [];

    for (const moduleId of certification.requiredModules) {
      const progress = await this.getModuleProgress(volunteerId, moduleId);
      if (progress && progress.status === 'COMPLETED') {
        completedModules.push(moduleId);
      } else {
        missingModules.push(moduleId);
      }
    }

    const eligible = missingModules.length === 0 && missingPrerequisites.length === 0;

    return {
      eligible,
      completedModules,
      missingModules,
      missingPrerequisites,
    };
  }

  public async awardCertification(volunteerId: string, certificationId: string): Promise<VolunteerCertification> {
    const eligibility = await this.checkCertificationEligibility(volunteerId, certificationId);
    if (!eligibility.eligible) {
      throw new Error('Volunteer not eligible for certification');
    }

    const certification = this.certifications.get(certificationId)!;
    const earnedAt = new Date();
    const expiresAt = new Date(earnedAt);
    expiresAt.setMonth(expiresAt.getMonth() + certification.validityPeriod);

    // Calculate overall score from completed modules
    const moduleScores = await Promise.all(
      certification.requiredModules.map(async moduleId => {
        const progress = await this.getModuleProgress(volunteerId, moduleId);
        return progress?.score || 0;
      })
    );
    const averageScore = Math.round(
      moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length
    );

    // Create certification record - Add to volunteer's certifications JSON field
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId }
    });

    const existingCertifications = (volunteer?.certifications as any[]) || [];
    const newCertification = {
      certificationId,
      earnedAt,
      expiresAt,
      status: 'ACTIVE' as const,
      score: averageScore,
      specializations: certification.specializations || [],
    };

    await this.prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        certifications: [...existingCertifications, newCertification]
      }
    });

    console.log(`🏆 Certification ${certificationId} awarded to volunteer ${volunteerId} (score: ${averageScore}%)`);

    this.emit('certification_awarded', {
      volunteerId,
      certificationId,
      score: averageScore,
      earnedAt,
      expiresAt,
    });

    return {
      ...newCertification,
      volunteerId
    };
  }

  private async getModuleProgress(volunteerId: string, moduleId: string): Promise<any> {
    return await this.prisma.volunteerTraining.findUnique({
      where: { volunteerId_moduleId: { volunteerId, moduleId } }
    });
  }

  private async getVolunteerCertification(volunteerId: string, certificationId: string): Promise<any> {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: { certifications: true }
    });

    if (!volunteer?.certifications) return null;

    const certifications = volunteer.certifications as any[];
    return certifications
      .filter(cert => cert.certificationId === certificationId)
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())[0] || null;
  }

  private async updateModuleProgress(volunteerId: string, moduleId: string, updates: any): Promise<void> {
    await this.prisma.volunteerTraining.update({
      where: { volunteerId_moduleId: { volunteerId, moduleId } },
      data: updates
    });
  }

  private evaluateAnswer(question: AssessmentQuestion, userAnswer: any): boolean {
    // Simple evaluation logic - would be more sophisticated in real system
    if (question.type === 'multiple_choice') {
      return userAnswer === question.correctAnswer;
    }
    
    if (question.type === 'true_false') {
      return userAnswer === question.correctAnswer;
    }
    
    if (question.type === 'scenario_response') {
      // Would use AI to evaluate scenario responses
      const correctAnswers = question.correctAnswer as string[];
      const userText = userAnswer.toLowerCase();
      return correctAnswers.some(answer => 
        userText.includes(answer.toLowerCase())
      );
    }
    
    return false;
  }

  private evaluateSimulationCriteria(criteria: EvaluationCriteria, performance: any): number {
    // Evaluate simulation performance against rubric
    // Would be more sophisticated in real system with AI evaluation
    return performance.score || 0;
  }

  private async setupPeriodicRenewalCheck(): Promise<void> {
    // Check for expiring certifications daily
    setInterval(async () => {
      await this.checkExpiringCertifications();
    }, 24 * 60 * 60 * 1000); // Daily check
  }

  private async checkExpiringCertifications(): Promise<void> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Check expiring certifications from volunteer records
    const volunteers = await this.prisma.volunteer.findMany({
      select: {
        id: true,
        certifications: true
      }
    });

    for (const volunteer of volunteers) {
      if (!volunteer.certifications) continue;
      
      const certifications = volunteer.certifications as any[];
      for (const cert of certifications) {
        if (cert.status === 'ACTIVE' && new Date(cert.expiresAt) <= thirtyDaysFromNow) {
          console.log(`⏰ Certification ${cert.certificationId} for volunteer ${volunteer.id} expires soon`);
          this.emit('certification_expiring', { ...cert, volunteerId: volunteer.id });
        }
      }
    }
  }

  public async getVolunteerTrainingStatus(volunteerId: string): Promise<any> {
    const progress = await this.prisma.volunteerTraining.findMany({
      where: { volunteerId }
    });

    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: { certifications: true }
    });

    const certifications = (volunteer?.certifications as any[]) || [];

    return {
      totalModulesEnrolled: progress.length,
      completedModules: progress.filter((p: any) => p.status === 'COMPLETED').length,
      activeCertifications: certifications.filter(c => c.status === 'ACTIVE').length,
      overallScore: this.calculateOverallScore(progress),
      nextRecommendedModules: await this.getRecommendedModules(volunteerId),
      certificationProgress: await this.getCertificationProgress(volunteerId),
    };
  }

  private calculateOverallScore(progress: any[]): number {
    const completedModules = progress.filter(p => p.status === 'COMPLETED' && p.score);
    if (completedModules.length === 0) return 0;
    
    const totalScore = completedModules.reduce((sum, p) => sum + p.score, 0);
    return Math.round(totalScore / completedModules.length);
  }

  private async getRecommendedModules(volunteerId: string): Promise<string[]> {
    // Logic to recommend next modules based on progress and career path
    // Would be more sophisticated in real system
    return [];
  }

  private async getCertificationProgress(volunteerId: string): Promise<any[]> {
    const certificationProgress = [];
    
    for (const [certId, cert] of this.certifications) {
      const eligibility = await this.checkCertificationEligibility(volunteerId, certId);
      certificationProgress.push({
        certificationId: certId,
        name: cert.name,
        eligible: eligibility.eligible,
        progress: eligibility.completedModules.length / cert.requiredModules.length,
        missingModules: eligibility.missingModules,
      });
    }
    
    return certificationProgress;
  }
}

export default VolunteerTrainingEngine;