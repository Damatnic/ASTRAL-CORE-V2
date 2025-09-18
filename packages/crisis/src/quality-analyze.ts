import { VolunteerProfile, QualityMetrics, PerformanceAnalysis } from './types';

export interface QualityAssessment {
  volunteerId: string;
  overallScore: number;
  responseTime: number;
  communicationQuality: number;
  empathyLevel: number;
  professionalismScore: number;
  knowledgeBase: number;
  recommendations: string[];
}

export class QualityAnalyzer {
  private qualityMetrics: Map<string, QualityMetrics> = new Map();
  private performanceHistory: Map<string, PerformanceAnalysis[]> = new Map();

  constructor() {
    this.initializeQualityStandards();
  }

  async analyzeVolunteerQuality(
    volunteer: VolunteerProfile,
    sessionData: any[]
  ): Promise<QualityAssessment> {
    const responseTime = this.calculateAverageResponseTime(sessionData);
    const communicationQuality = this.assessCommunicationQuality(sessionData);
    const empathyLevel = this.measureEmpathyLevel(sessionData);
    const professionalismScore = this.evaluateProfessionalism(sessionData);
    const knowledgeBase = this.assessKnowledgeBase(sessionData);

    const overallScore = this.calculateOverallScore({
      responseTime,
      communicationQuality,
      empathyLevel,
      professionalismScore,
      knowledgeBase
    });

    return {
      volunteerId: volunteer.id,
      overallScore,
      responseTime,
      communicationQuality,
      empathyLevel,
      professionalismScore,
      knowledgeBase,
      recommendations: this.generateRecommendations(overallScore, {
        responseTime,
        communicationQuality,
        empathyLevel,
        professionalismScore,
        knowledgeBase
      })
    };
  }

  async generatePerformanceReport(
    volunteerId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<PerformanceAnalysis> {
    const metrics = this.qualityMetrics.get(volunteerId);
    if (!metrics) {
      throw new Error(`No quality metrics found for volunteer ${volunteerId}`);
    }

    return {
      volunteerId,
      period: timeRange,
      averageScore: metrics.averageScore,
      totalSessions: metrics.totalSessions,
      positiveOutcomes: metrics.positiveOutcomes,
      improvementAreas: metrics.improvementAreas,
      strengths: metrics.strengths,
      trend: this.calculateTrend(volunteerId)
    };
  }

  private calculateAverageResponseTime(sessionData: any[]): number {
    if (!sessionData.length) return 0;
    
    const times = sessionData
      .map(session => session.responseTime || 0)
      .filter(time => time > 0);
    
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private assessCommunicationQuality(sessionData: any[]): number {
    // Analyze message clarity, tone, and effectiveness
    let score = 0.8; // Base score
    
    for (const session of sessionData) {
      if (session.communicationMetrics?.clarity) score += 0.1;
      if (session.communicationMetrics?.empathy) score += 0.1;
    }
    
    return Math.min(score / sessionData.length, 1.0);
  }

  private measureEmpathyLevel(sessionData: any[]): number {
    // Analyze empathetic responses and emotional intelligence
    return sessionData.reduce((acc, session) => {
      return acc + (session.empathyScore || 0.7);
    }, 0) / sessionData.length;
  }

  private evaluateProfessionalism(sessionData: any[]): number {
    // Assess professional conduct and boundary management
    return 0.85; // Placeholder implementation
  }

  private assessKnowledgeBase(sessionData: any[]): number {
    // Evaluate crisis intervention knowledge and application
    return 0.8; // Placeholder implementation
  }

  private calculateOverallScore(metrics: {
    responseTime: number;
    communicationQuality: number;
    empathyLevel: number;
    professionalismScore: number;
    knowledgeBase: number;
  }): number {
    const weights = {
      responseTime: 0.15,
      communicationQuality: 0.25,
      empathyLevel: 0.25,
      professionalismScore: 0.20,
      knowledgeBase: 0.15
    };

    return Object.entries(metrics).reduce((score, [key, value]) => {
      return score + (value * weights[key as keyof typeof weights]);
    }, 0);
  }

  private generateRecommendations(
    overallScore: number,
    metrics: any
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 0.7) {
      recommendations.push('Consider additional training in crisis intervention');
    }
    
    if (metrics.communicationQuality < 0.7) {
      recommendations.push('Focus on improving communication clarity and empathy');
    }
    
    if (metrics.responseTime > 120) {
      recommendations.push('Work on reducing response time to improve client experience');
    }

    return recommendations;
  }

  private calculateTrend(volunteerId: string): 'improving' | 'stable' | 'declining' {
    const history = this.performanceHistory.get(volunteerId) || [];
    if (history.length < 2) return 'stable';

    const recent = history[history.length - 1];
    const previous = history[history.length - 2];

    if (recent.averageScore > previous.averageScore + 0.05) return 'improving';
    if (recent.averageScore < previous.averageScore - 0.05) return 'declining';
    return 'stable';
  }

  private initializeQualityStandards(): void {
    // Initialize quality standards and benchmarks
  }
}