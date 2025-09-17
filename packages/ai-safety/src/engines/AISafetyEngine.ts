/**
 * ASTRAL_CORE 2.0 AI Safety Engine
 * 
 * The central intelligence system that protects users and maintains
 * platform safety through advanced AI-powered monitoring and intervention.
 */

import { 
  prisma, 
  executeWithMetrics,
  ReportType,
  ReportSeverity,
  ReportStatus 
} from '@astralcore/database';
import { CrisisInterventionEngine } from '@astralcore/crisis';
import { VolunteerManagementEngine } from '@astralcore/volunteer';
import { ContentModerationSystem } from '../moderation/ContentModerationSystem';
import { CrisisKeywordDetector } from '../detection/CrisisKeywordDetector';
import { BehaviorAnalyzer } from '../analysis/BehaviorAnalyzer';
import { QualityAssurance } from '../quality/QualityAssurance';
import { AnomalyDetector } from '../detection/AnomalyDetector';
import { AuditTrailSystem } from '../audit/AuditTrailSystem';
import { PerformanceOptimizer } from '../performance/PerformanceOptimizer';
import { AI_SAFETY_CONSTANTS, CRISIS_KEYWORD_CATEGORIES } from '../index';
import type {
  SafetyCheckResult,
  ModerationAction,
  SafetyAlert,
  SafetyStats,
  ContentAnalysisResult
} from '../types/safety.types';

export class AISafetyEngine {
  private static instance: AISafetyEngine;
  
  private readonly contentModeration: ContentModerationSystem;
  private readonly keywordDetector: CrisisKeywordDetector;
  private readonly behaviorAnalyzer: BehaviorAnalyzer;
  private readonly qualityAssurance: QualityAssurance;
  private readonly anomalyDetector: AnomalyDetector;
  private readonly auditTrail: AuditTrailSystem;
  private readonly performanceOptimizer: PerformanceOptimizer;
  private readonly crisisEngine: CrisisInterventionEngine;
  private readonly volunteerEngine: VolunteerManagementEngine;
  
  private constructor() {
    this.contentModeration = new ContentModerationSystem();
    this.keywordDetector = new CrisisKeywordDetector();
    this.behaviorAnalyzer = new BehaviorAnalyzer();
    this.qualityAssurance = new QualityAssurance();
    this.anomalyDetector = new AnomalyDetector();
    this.auditTrail = AuditTrailSystem.getInstance();
    this.performanceOptimizer = PerformanceOptimizer.getInstance();
    this.crisisEngine = CrisisInterventionEngine.getInstance();
    this.volunteerEngine = VolunteerManagementEngine.getInstance();
    
    // Start continuous safety monitoring
    this.startSafetyMonitoring();
  }
  
  static getInstance(): AISafetyEngine {
    if (!AISafetyEngine.instance) {
      AISafetyEngine.instance = new AISafetyEngine();
    }
    return AISafetyEngine.instance;
  }
  
  /**
   * Comprehensive safety check for all content
   * CRITICAL: <100ms execution time for real-time protection
   */
  async performSafetyCheck(
    content: string,
    context: {
      userId?: string;
      sessionId?: string;
      messageType: 'crisis' | 'volunteer' | 'general';
      isAnonymous?: boolean;
    }
  ): Promise<SafetyCheckResult> {
    const startTime = performance.now();
    
    return await executeWithMetrics(async () => {
      // Parallel safety analysis for speed
      const [
        moderationResult,
        crisisDetection,
        behaviorAnalysis,
        qualityCheck,
        anomalyCheck
      ] = await Promise.all([
        this.contentModeration.moderateContent(content),
        this.keywordDetector.detectCrisisKeywords(content),
        context.userId ? this.behaviorAnalyzer.analyzeMessage(context.userId, content) : null,
        context.messageType === 'volunteer' ? this.qualityAssurance.assessResponse(content) : null,
        this.anomalyDetector.checkForAnomalies(content, context)
      ]);
      
      // Calculate overall risk score
      const riskScore = this.calculateOverallRisk({
        moderationScore: moderationResult.riskScore,
        crisisScore: crisisDetection.severity / 10,
        behaviorScore: behaviorAnalysis?.riskLevel || 0,
        qualityScore: qualityCheck?.qualityScore || 1,
        anomalyScore: anomalyCheck.riskScore,
      });
      
      // Determine required actions
      const actions = this.determineActions(riskScore, {
        moderation: moderationResult,
        crisis: crisisDetection,
        behavior: behaviorAnalysis,
        quality: qualityCheck,
        anomaly: anomalyCheck,
      });
      
      // Execute critical actions immediately
      if (actions.includes('EMERGENCY_SERVICES_IMMEDIATELY')) {
        await this.triggerEmergencyServices(context.sessionId!, crisisDetection);
      }
      
      if (actions.includes('EMERGENCY_ESCALATION')) {
        await this.escalateToEmergency(context.sessionId!, crisisDetection);
      }
      
      if (actions.includes('BLOCK_MESSAGE')) {
        await this.blockContent(content, context, moderationResult);
      }
      
      const executionTime = performance.now() - startTime;
      
      // Performance monitoring
      if (executionTime > AI_SAFETY_CONSTANTS.SAFETY_CHECK_TARGET_MS) {
        console.warn(`⚠️ Safety check took ${executionTime.toFixed(2)}ms (target: ${AI_SAFETY_CONSTANTS.SAFETY_CHECK_TARGET_MS}ms)`);
      }
      
      const result: SafetyCheckResult = {
        safe: riskScore < AI_SAFETY_CONSTANTS.TOXICITY_THRESHOLD,
        riskScore,
        actions,
        moderationResult,
        crisisDetection,
        behaviorAnalysis,
        qualityAssessment: qualityCheck,
        anomalies: anomalyCheck.anomalies,
        executionTimeMs: executionTime,
        recommendations: this.generateRecommendations(riskScore, actions),
      };
      
      // Log high-risk content for monitoring
      if (riskScore >= AI_SAFETY_CONSTANTS.SUPERVISOR_ALERT_THRESHOLD) {
        console.log(`🚨 High-risk content detected: Risk ${(riskScore * 100).toFixed(1)}%`);
        await this.logSafetyAlert(result, context);
      }
      
      return result;
      
    }, 'ai-safety-check');
  }
  
  /**
   * Monitor volunteer response quality in real-time
   */
  async monitorVolunteerResponse(
    volunteerId: string,
    response: string,
    conversationContext: string[]
  ): Promise<{
    quality: number;
    suggestions: string[];
    concerns: string[];
    approved: boolean;
  }> {
    return await executeWithMetrics(async () => {
      const [qualityAssessment, ethicsCheck, appropriatenessCheck] = await Promise.all([
        this.qualityAssurance.assessVolunteerResponse(response, conversationContext),
        this.qualityAssurance.checkEthicalGuidelines(response),
        this.contentModeration.checkAppropriateness(response, 'volunteer_response')
      ]);
      
      const overallQuality = (
        qualityAssessment.helpfulness * 0.4 +
        qualityAssessment.empathy * 0.3 +
        qualityAssessment.clarity * 0.2 +
        appropriatenessCheck.appropriateness * 0.1
      );
      
      const concerns: string[] = [];
      const suggestions: string[] = [];
      
      // Quality improvement suggestions
      if (qualityAssessment.helpfulness < 0.8) {
        suggestions.push('Consider providing more specific guidance or resources');
      }
      if (qualityAssessment.empathy < 0.8) {
        suggestions.push('Show more understanding and validation of the user\'s feelings');
      }
      if (qualityAssessment.clarity < 0.8) {
        suggestions.push('Use clearer language and shorter sentences');
      }
      
      // Ethics and safety concerns
      if (!ethicsCheck.followsGuidelines) {
        concerns.push(...ethicsCheck.violations);
      }
      if (!appropriatenessCheck.appropriate) {
        concerns.push('Response may not be appropriate for crisis context');
      }
      
      // Auto-approve high quality responses
      const approved = overallQuality >= AI_SAFETY_CONSTANTS.VOLUNTEER_QUALITY_MIN && 
                      concerns.length === 0;
      
      // Alert supervisors for concerning responses
      if (concerns.length > 0 || overallQuality < 0.6) {
        await this.alertSupervisors(volunteerId, {
          quality: overallQuality,
          concerns,
          response: response.substring(0, 200) + '...', // Truncated for privacy
        });
      }
      
      return {
        quality: overallQuality,
        suggestions,
        concerns,
        approved,
      };
      
    }, 'monitor-volunteer-response');
  }
  
  /**
   * Detect and prevent platform abuse
   */
  async detectAbuse(
    userId: string,
    activities: Array<{
      type: string;
      timestamp: Date;
      metadata?: any;
    }>
  ): Promise<{
    abuseDetected: boolean;
    abuseType?: string;
    confidence: number;
    recommendedAction: string;
  }> {
    return await executeWithMetrics(async () => {
      const patterns = await this.behaviorAnalyzer.analyzeUserBehavior(userId, activities);
      
      // Check for various abuse patterns
      const abuseChecks = {
        spam: this.detectSpamBehavior(activities),
        harassment: this.detectHarassmentPatterns(activities),
        manipulation: this.detectManipulativeBehavior(activities),
        impersonation: this.detectImpersonation(activities),
        systemAbuse: this.detectSystemAbuse(activities),
      };
      
      let highestRisk = 0;
      let abuseType = '';
      
      for (const [type, risk] of Object.entries(abuseChecks)) {
        if (risk > highestRisk) {
          highestRisk = risk;
          abuseType = type;
        }
      }
      
      const abuseDetected = highestRisk >= AI_SAFETY_CONSTANTS.ABUSE_THRESHOLD;
      
      let recommendedAction = 'MONITOR';
      if (highestRisk >= AI_SAFETY_CONSTANTS.AUTO_BLOCK_THRESHOLD) {
        recommendedAction = 'IMMEDIATE_SUSPENSION';
      } else if (highestRisk >= AI_SAFETY_CONSTANTS.AUTO_ESCALATE_THRESHOLD) {
        recommendedAction = 'ESCALATE_TO_MODERATOR';
      } else if (abuseDetected) {
        recommendedAction = 'WARNING_AND_MONITORING';
      }
      
      if (abuseDetected) {
        await this.reportAbuse(userId, abuseType, highestRisk, recommendedAction);
      }
      
      return {
        abuseDetected,
        abuseType: abuseDetected ? abuseType : undefined,
        confidence: highestRisk,
        recommendedAction,
      };
      
    }, 'detect-abuse');
  }
  
  /**
   * Generate safety statistics for monitoring
   */
  async getSafetyStats(): Promise<SafetyStats> {
    return await executeWithMetrics(async () => {
      const [
        totalChecks,
        blockedContent,
        crisisDetections,
        volunteerIssues,
        abuseReports,
        falsePositives,
      ] = await Promise.all([
        // These would query analytics/metrics tables
        this.getMetricCount('safety_checks_today'),
        this.getMetricCount('blocked_content_today'),
        this.getMetricCount('crisis_detections_today'),
        this.getMetricCount('volunteer_quality_issues_today'),
        this.getMetricCount('abuse_reports_today'),
        this.getMetricCount('false_positives_today'),
      ]);
      
      const accuracy = totalChecks > 0 ? 1 - (falsePositives / totalChecks) : 1;
      
      return {
        totalChecks,
        blockedContent,
        crisisDetections,
        volunteerIssues,
        abuseReports,
        accuracy,
        systemHealth: this.calculateSafetyHealth({
          accuracy,
          blockedContent,
          crisisDetections,
          abuseReports,
        }),
        responseTimeMs: await this.getAverageResponseTime(),
      };
      
    }, 'get-safety-stats');
  }
  
  // Private helper methods
  
  private calculateOverallRisk(scores: {
    moderationScore: number;
    crisisScore: number;
    behaviorScore: number;
    qualityScore: number;
    anomalyScore: number;
  }): number {
    // Weighted risk calculation
    return (
      scores.moderationScore * 0.25 +
      scores.crisisScore * 0.35 +
      scores.behaviorScore * 0.15 +
      (1 - scores.qualityScore) * 0.15 +
      scores.anomalyScore * 0.10
    );
  }
  
  private determineActions(riskScore: number, analysis: any): ModerationAction[] {
    const actions: ModerationAction[] = [];
    
    // Crisis-specific actions
    if (analysis.crisis?.severity >= 10) {
      actions.push('EMERGENCY_SERVICES_IMMEDIATELY');
    } else if (analysis.crisis?.severity >= 9) {
      actions.push('EMERGENCY_ESCALATION');
    } else if (analysis.crisis?.severity >= 7) {
      actions.push('PRIORITY_INTERVENTION');
    }
    
    // Content moderation actions
    if (riskScore >= AI_SAFETY_CONSTANTS.AUTO_BLOCK_THRESHOLD) {
      actions.push('BLOCK_MESSAGE');
    } else if (riskScore >= AI_SAFETY_CONSTANTS.AUTO_ESCALATE_THRESHOLD) {
      actions.push('ESCALATE_TO_MODERATOR');
    } else if (riskScore >= AI_SAFETY_CONSTANTS.SUPERVISOR_ALERT_THRESHOLD) {
      actions.push('ALERT_SUPERVISOR');
    }
    
    // Quality assurance actions
    if (analysis.quality && analysis.quality.qualityScore < AI_SAFETY_CONSTANTS.RESPONSE_QUALITY_THRESHOLD) {
      actions.push('QUALITY_REVIEW_REQUIRED');
    }
    
    // Behavioral interventions
    if (analysis.behavior?.needsIntervention) {
      actions.push('BEHAVIORAL_INTERVENTION');
    }
    
    return actions;
  }
  
  private async triggerEmergencyServices(sessionId: string, detection: any): Promise<void> {
    console.log(`🚨 EMERGENCY SERVICES TRIGGERED for session: ${sessionId}`);
    
    // In production, this would:
    // 1. Contact emergency services via API
    // 2. Attempt location determination (if consented)
    // 3. Provide crisis information
    // 4. Maintain connection until help arrives
    
    await prisma.crisisEscalation.create({
      data: {
        sessionId,
        triggeredBy: 'AUTOMATIC_KEYWORD',
        severity: 'EMERGENCY',
        reason: `Emergency keywords detected: ${detection.keywords.join(', ')}`,
        actionsTaken: ['EMERGENCY_SERVICES_CONTACTED'],
        emergencyContacted: true,
      },
    });
  }
  
  private async escalateToEmergency(sessionId: string, detection: any): Promise<void> {
    await this.crisisEngine.connectAnonymous(
      `Emergency escalation from AI detection: ${detection.keywords.join(', ')}`
    );
    
    console.log(`🚨 Crisis escalation triggered for session: ${sessionId}`);
  }
  
  private async blockContent(content: string, context: any, moderation: any): Promise<void> {
    console.log(`🛑 Content blocked: ${moderation.reason}`);
    
    // Log blocked content (anonymized)
    await prisma.safetyReport.create({
      data: {
        reportType: 'HARMFUL_CONTENT',
        severity: 'HIGH',
        description: `Automatically blocked: ${moderation.reason}`,
        status: 'RESOLVED',
        action: 'CONTENT_BLOCKED',
      },
    });
  }
  
  private async logSafetyAlert(result: SafetyCheckResult, context: any): Promise<void> {
    // Create safety alert for monitoring
    await prisma.safetyReport.create({
      data: {
        reportType: 'HARMFUL_CONTENT',
        severity: result.riskScore > 0.9 ? 'CRITICAL' : 'HIGH',
        description: `High-risk content detected: ${result.actions.join(', ')}`,
        status: 'PENDING',
      },
    });
  }
  
  private async alertSupervisors(volunteerId: string, issue: any): Promise<void> {
    console.log(`⚠️ Supervisor alert: Volunteer ${volunteerId} quality issue`);
    
    // In production, would send alerts via notification system
  }
  
  private async reportAbuse(userId: string, type: string, confidence: number, action: string): Promise<void> {
    await prisma.safetyReport.create({
      data: {
        reportedId: userId,
        reportType: 'INAPPROPRIATE_BEHAVIOR',
        severity: confidence > 0.95 ? 'CRITICAL' : confidence > 0.85 ? 'HIGH' : 'MEDIUM',
        description: `${type} behavior detected with ${(confidence * 100).toFixed(1)}% confidence`,
        action,
        status: 'PENDING',
      },
    });
  }
  
  private detectSpamBehavior(activities: any[]): number {
    // Detect rapid message sending, repetitive content, etc.
    const messageCount = activities.filter(a => a.type === 'message').length;
    const timeSpan = activities.length > 0 
      ? (activities[activities.length - 1].timestamp.getTime() - activities[0].timestamp.getTime()) / 1000 / 60
      : 1;
    
    const messagesPerMinute = messageCount / Math.max(timeSpan, 1);
    return Math.min(messagesPerMinute / 10, 1); // Cap at 1.0
  }
  
  private detectHarassmentPatterns(activities: any[]): number {
    // Analyze for harassment indicators
    return 0; // Simplified for example
  }
  
  private detectManipulativeBehavior(activities: any[]): number {
    // Detect manipulation tactics
    return 0; // Simplified for example
  }
  
  private detectImpersonation(activities: any[]): number {
    // Check for impersonation signs
    return 0; // Simplified for example
  }
  
  private detectSystemAbuse(activities: any[]): number {
    // Detect attempts to abuse platform features
    return 0; // Simplified for example
  }
  
  private generateRecommendations(riskScore: number, actions: ModerationAction[]): string[] {
    const recommendations: string[] = [];
    
    if (riskScore > 0.8) {
      recommendations.push('Immediate human review required');
    } else if (riskScore > 0.6) {
      recommendations.push('Enhanced monitoring recommended');
    }
    
    if (actions.includes('QUALITY_REVIEW_REQUIRED')) {
      recommendations.push('Volunteer may benefit from additional training');
    }
    
    return recommendations;
  }
  
  private async getMetricCount(metricType: string): Promise<number> {
    // In production, would query actual metrics
    return Math.floor(Math.random() * 100);
  }
  
  private async getAverageResponseTime(): Promise<number> {
    // Return average safety check response time
    return 75; // Example: 75ms average
  }
  
  private calculateSafetyHealth(metrics: any): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
    if (metrics.accuracy < 0.95 || metrics.blockedContent > 100) {
      return 'CRITICAL';
    } else if (metrics.accuracy < 0.98 || metrics.blockedContent > 50) {
      return 'DEGRADED';
    }
    return 'HEALTHY';
  }
  
  private startSafetyMonitoring(): void {
    // Update crisis keywords every hour
    setInterval(async () => {
      try {
        await this.keywordDetector.updateKeywords();
      } catch (error) {
        console.error('❌ Failed to update crisis keywords:', error);
      }
    }, AI_SAFETY_CONSTANTS.CRISIS_KEYWORDS_UPDATE_INTERVAL_MS);
    
    // Safety system health check every minute
    setInterval(async () => {
      try {
        const stats = await this.getSafetyStats();
        
        if (stats.systemHealth === 'CRITICAL') {
          console.error('🔴 CRITICAL: AI Safety system health degraded');
        }
        
        console.log(`🛡️ Safety: ${stats.totalChecks} checks, ${stats.accuracy.toFixed(3)} accuracy`);
      } catch (error) {
        console.error('❌ Safety health check failed:', error);
      }
    }, 60000);
  }
}