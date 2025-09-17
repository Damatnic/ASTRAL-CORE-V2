/**
 * ASTRAL_CORE 2.0 Volunteer Training System
 * Manages volunteer training, certification, and skill development
 */

import {
  updateVolunteerStatus,
  recordVolunteerSession
} from '../../../database/src/utils/volunteer';

export interface TrainingModule {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  requiredScore: number; // percentage
  prerequisites: string[];
  content: TrainingContent[];
}

export interface TrainingContent {
  type: 'video' | 'text' | 'quiz' | 'simulation';
  title: string;
  content: string;
  duration?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TrainingProgress {
  volunteerId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  score?: number;
  completedAt?: Date;
  attempts: number;
  timeSpent: number; // minutes
}

export interface CertificationLevel {
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  requiredModules: string[];
  validityPeriod: number; // months
  renewalRequired: boolean;
}

export class VolunteerTrainingSystem {
  private trainingModules: Map<string, TrainingModule> = new Map();
  private volunteerProgress: Map<string, TrainingProgress[]> = new Map();
  private certifications: Map<string, CertificationLevel> = new Map();

  constructor() {
    this.initializeTrainingModules();
    this.initializeCertificationLevels();
  }

  /**
   * Initialize core training modules for crisis intervention
   */
  private initializeTrainingModules(): void {
    const modules: TrainingModule[] = [
      {
        id: 'crisis-basics',
        name: 'Crisis Intervention Basics',
        description: 'Fundamental principles of crisis intervention and active listening',
        duration: 120,
        requiredScore: 80,
        prerequisites: [],
        content: [
          {
            type: 'text',
            title: 'Understanding Crisis States',
            content: 'Learn to recognize different types of crisis situations and emotional states.',
            duration: 30
          },
          {
            type: 'video',
            title: 'Active Listening Techniques',
            content: 'video-url-active-listening',
            duration: 45
          },
          {
            type: 'quiz',
            title: 'Crisis Recognition Quiz',
            content: '',
            questions: [
              {
                id: 'q1',
                question: 'What is the primary goal in crisis intervention?',
                options: [
                  'Solve the person\'s problems',
                  'Provide immediate safety and stabilization',
                  'Give advice on life decisions',
                  'Refer to professional help immediately'
                ],
                correctAnswer: 1,
                explanation: 'The primary goal is to provide immediate safety and emotional stabilization.'
              }
            ]
          }
        ]
      },
      {
        id: 'suicide-prevention',
        name: 'Suicide Prevention and Risk Assessment',
        description: 'Advanced training in suicide risk assessment and prevention techniques',
        duration: 180,
        requiredScore: 90,
        prerequisites: ['crisis-basics'],
        content: [
          {
            type: 'text',
            title: 'Risk Factors and Warning Signs',
            content: 'Comprehensive guide to identifying suicide risk factors and warning signs.',
            duration: 60
          },
          {
            type: 'simulation',
            title: 'Risk Assessment Simulation',
            content: 'Interactive scenarios for practicing risk assessment skills.',
            duration: 90
          }
        ]
      },
      {
        id: 'trauma-informed-care',
        name: 'Trauma-Informed Care Principles',
        description: 'Understanding trauma responses and providing trauma-informed support',
        duration: 150,
        requiredScore: 85,
        prerequisites: ['crisis-basics'],
        content: [
          {
            type: 'text',
            title: 'Understanding Trauma Responses',
            content: 'Learn about different trauma responses and their impact on behavior.',
            duration: 45
          },
          {
            type: 'video',
            title: 'Trauma-Informed Communication',
            content: 'video-url-trauma-communication',
            duration: 60
          }
        ]
      },
      {
        id: 'de-escalation',
        name: 'De-escalation Techniques',
        description: 'Advanced techniques for de-escalating tense situations',
        duration: 90,
        requiredScore: 85,
        prerequisites: ['crisis-basics'],
        content: [
          {
            type: 'text',
            title: 'De-escalation Strategies',
            content: 'Proven techniques for calming agitated individuals.',
            duration: 30
          },
          {
            type: 'simulation',
            title: 'De-escalation Practice',
            content: 'Role-playing scenarios for practicing de-escalation skills.',
            duration: 45
          }
        ]
      }
    ];

    modules.forEach(module => {
      this.trainingModules.set(module.id, module);
    });
  }

  /**
   * Initialize certification levels and requirements
   */
  private initializeCertificationLevels(): void {
    const levels: CertificationLevel[] = [
      {
        level: 'basic',
        requiredModules: ['crisis-basics'],
        validityPeriod: 12,
        renewalRequired: true
      },
      {
        level: 'intermediate',
        requiredModules: ['crisis-basics', 'de-escalation', 'trauma-informed-care'],
        validityPeriod: 18,
        renewalRequired: true
      },
      {
        level: 'advanced',
        requiredModules: ['crisis-basics', 'de-escalation', 'trauma-informed-care', 'suicide-prevention'],
        validityPeriod: 24,
        renewalRequired: true
      },
      {
        level: 'expert',
        requiredModules: ['crisis-basics', 'de-escalation', 'trauma-informed-care', 'suicide-prevention'],
        validityPeriod: 36,
        renewalRequired: false
      }
    ];

    levels.forEach(level => {
      this.certifications.set(level.level, level);
    });
  }

  /**
   * Start training module for a volunteer
   */
  async startTraining(volunteerId: string, moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const module = this.trainingModules.get(moduleId);
      if (!module) {
        return { success: false, message: 'Training module not found' };
      }

      // Check prerequisites
      const hasPrerequisites = await this.checkPrerequisites(volunteerId, module.prerequisites);
      if (!hasPrerequisites) {
        return { success: false, message: 'Prerequisites not met' };
      }

      // Initialize progress tracking
      const progress: TrainingProgress = {
        volunteerId,
        moduleId,
        status: 'in_progress',
        attempts: 1,
        timeSpent: 0
      };

      const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
      const existingIndex = volunteerProgress.findIndex(p => p.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        volunteerProgress[existingIndex] = progress;
      } else {
        volunteerProgress.push(progress);
      }
      
      this.volunteerProgress.set(volunteerId, volunteerProgress);

      // Record training session start
      await recordVolunteerSession({
        volunteerId,
        sessionType: 'TRAINING'
      });

      return { success: true, message: 'Training started successfully' };
    } catch (error) {
      console.error('Error starting training:', error);
      return { success: false, message: 'Failed to start training' };
    }
  }

  /**
   * Complete training module and record results
   */
  async completeTraining(
    volunteerId: string, 
    moduleId: string, 
    score: number, 
    timeSpent: number
  ): Promise<{ success: boolean; message: string; certified?: boolean }> {
    try {
      const module = this.trainingModules.get(moduleId);
      if (!module) {
        return { success: false, message: 'Training module not found' };
      }

      const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
      const progressIndex = volunteerProgress.findIndex(p => p.moduleId === moduleId);
      
      if (progressIndex === -1) {
        return { success: false, message: 'Training not started' };
      }

      const progress = volunteerProgress[progressIndex];
      const passed = score >= module.requiredScore;

      // Update progress
      progress.score = score;
      progress.timeSpent += timeSpent;
      progress.status = passed ? 'completed' : 'failed';
      progress.completedAt = new Date();

      if (!passed) {
        progress.attempts += 1;
      }

      volunteerProgress[progressIndex] = progress;
      this.volunteerProgress.set(volunteerId, volunteerProgress);

      // Check for certification eligibility
      let certified = false;
      if (passed) {
        certified = await this.checkCertificationEligibility(volunteerId);
        if (certified) {
          await this.awardCertification(volunteerId);
        }
      }

      return { 
        success: true, 
        message: passed ? 'Training completed successfully' : 'Training failed - retake required',
        certified
      };
    } catch (error) {
      console.error('Error completing training:', error);
      return { success: false, message: 'Failed to complete training' };
    }
  }

  /**
   * Check if volunteer meets prerequisites for a module
   */
  private async checkPrerequisites(volunteerId: string, prerequisites: string[]): Promise<boolean> {
    if (prerequisites.length === 0) return true;

    const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
    
    return prerequisites.every(prereq => {
      const progress = volunteerProgress.find(p => p.moduleId === prereq);
      return progress && progress.status === 'completed';
    });
  }

  /**
   * Check if volunteer is eligible for certification
   */
  private async checkCertificationEligibility(volunteerId: string): Promise<boolean> {
    const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
    const completedModules = volunteerProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);

    // Check for highest certification level achievable
    for (const [level, cert] of this.certifications.entries()) {
      const hasAllRequired = cert.requiredModules.every(module => 
        completedModules.includes(module)
      );
      
      if (hasAllRequired) {
        return true;
      }
    }

    return false;
  }

  /**
   * Award certification to volunteer
   */
  private async awardCertification(volunteerId: string): Promise<void> {
    try {
      const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
      const completedModules = volunteerProgress
        .filter(p => p.status === 'completed')
        .map(p => p.moduleId);

      // Determine highest certification level
      let highestLevel: string = 'basic';
      for (const [level, cert] of this.certifications.entries()) {
        const hasAllRequired = cert.requiredModules.every(module => 
          completedModules.includes(module)
        );
        
        if (hasAllRequired) {
          highestLevel = level;
        }
      }

      // Update volunteer status to active if they achieve basic certification
      if (highestLevel === 'basic' || completedModules.includes('crisis-basics')) {
        await updateVolunteerStatus(volunteerId, 'ACTIVE');
      }

      console.log(`Volunteer ${volunteerId} awarded ${highestLevel} certification`);
    } catch (error) {
      console.error('Error awarding certification:', error);
    }
  }

  /**
   * Get training progress for a volunteer
   */
  getTrainingProgress(volunteerId: string): TrainingProgress[] {
    return this.volunteerProgress.get(volunteerId) || [];
  }

  /**
   * Get available training modules
   */
  getAvailableModules(volunteerId?: string): TrainingModule[] {
    const modules = Array.from(this.trainingModules.values());
    
    if (!volunteerId) {
      return modules;
    }

    // Filter modules based on prerequisites
    const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
    const completedModules = volunteerProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);

    return modules.filter(module => {
      return module.prerequisites.every(prereq => 
        completedModules.includes(prereq)
      );
    });
  }

  /**
   * Get volunteer's current certification level
   */
  getCertificationLevel(volunteerId: string): string | null {
    const volunteerProgress = this.volunteerProgress.get(volunteerId) || [];
    const completedModules = volunteerProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);

    let highestLevel: string | null = null;
    for (const [level, cert] of this.certifications.entries()) {
      const hasAllRequired = cert.requiredModules.every(module => 
        completedModules.includes(module)
      );
      
      if (hasAllRequired) {
        highestLevel = level;
      }
    }

    return highestLevel;
  }

  /**
   * Generate training analytics
   */
  generateTrainingAnalytics(): {
    totalVolunteers: number;
    completionRates: Record<string, number>;
    averageScores: Record<string, number>;
    certificationDistribution: Record<string, number>;
  } {
    const analytics = {
      totalVolunteers: this.volunteerProgress.size,
      completionRates: {} as Record<string, number>,
      averageScores: {} as Record<string, number>,
      certificationDistribution: {} as Record<string, number>
    };

    // Calculate completion rates and average scores per module
    for (const [moduleId, module] of this.trainingModules.entries()) {
      let totalAttempts = 0;
      let completions = 0;
      let totalScore = 0;
      let scoreCount = 0;

      for (const progress of this.volunteerProgress.values()) {
        const moduleProgress = progress.find(p => p.moduleId === moduleId);
        if (moduleProgress) {
          totalAttempts++;
          if (moduleProgress.status === 'completed') {
            completions++;
          }
          if (moduleProgress.score !== undefined) {
            totalScore += moduleProgress.score;
            scoreCount++;
          }
        }
      }

      analytics.completionRates[moduleId] = totalAttempts > 0 ? (completions / totalAttempts) * 100 : 0;
      analytics.averageScores[moduleId] = scoreCount > 0 ? totalScore / scoreCount : 0;
    }

    // Calculate certification distribution
    const certCounts = { basic: 0, intermediate: 0, advanced: 0, expert: 0 };
    for (const volunteerId of this.volunteerProgress.keys()) {
      const level = this.getCertificationLevel(volunteerId);
      if (level && level in certCounts) {
        certCounts[level as keyof typeof certCounts]++;
      }
    }
    analytics.certificationDistribution = certCounts;

    return analytics;
  }
}