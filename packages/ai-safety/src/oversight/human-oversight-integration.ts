/**
 * ASTRAL_CORE 2.0 Human Oversight Integration System
 * 
 * INTELLIGENT HUMAN-AI COLLABORATION
 * - Edge case detection and human escalation
 * - AI decision transparency and explainability
 * - Human expertise integration for complex cases
 * - Quality assurance and continuous learning
 * - Real-time expert consultation for ambiguous situations
 * - Performance feedback loop for AI improvement
 * 
 * TARGET PERFORMANCE:
 * - Edge case detection: >95% accuracy
 * - Human response time: <5 minutes for urgent cases
 * - AI-human collaboration efficiency: >90%
 * - Expert availability: 24/7 coverage
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

export interface HumanOversightCase {
  id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  caseType: 'edge_case' | 'ambiguous_content' | 'ai_uncertainty' | 'escalation_review' | 'quality_check' | 'learning_case';
  
  // Original content and context
  originalContent: string;
  contentLanguage: string;
  context: {
    messageType: 'crisis' | 'volunteer' | 'general' | 'emergency';
    sessionId?: string;
    userId?: string;
    timestamp: Date;
    conversationHistory?: Array<{
      content: string;
      speaker: 'user' | 'volunteer';
      timestamp: Date;
    }>;
  };
  
  // AI analysis results
  aiAnalysis: {
    riskScore: number;
    confidenceScore: number;
    crisisLevel: string;
    detectedKeywords: string[];
    sentiment: any;
    processingTime: number;
    modelVersions: string[];
    uncertaintyFactors: string[];
  };
  
  // Human oversight requirements
  oversightRequirements: {
    expertiseNeeded: ('crisis_counseling' | 'cultural_context' | 'language_specialist' | 'psychiatric_evaluation' | 'safety_assessment')[];
    urgency: number; // 0-10 scale
    reasonForEscalation: string;
    suggestedActions: string[];
    timeLimit?: number; // Maximum response time in minutes
  };
  
  // Case status and resolution
  status: 'pending' | 'assigned' | 'in_review' | 'resolved' | 'escalated_further';
  assignedExpert?: {
    id: string;
    name: string;
    expertise: string[];
    assignedAt: Date;
  };
  
  resolution?: {
    humanDecision: 'approve_ai' | 'override_ai' | 'modify_ai' | 'escalate_further';
    finalRiskScore?: number;
    finalAction: 'allow' | 'flag' | 'block' | 'escalate' | 'emergency';
    reasoning: string;
    recommendations: string[];
    resolvedAt: Date;
    resolvedBy: string;
    timeToResolution: number;
  };
  
  // Learning and improvement
  learningData?: {
    aiWasCorrect: boolean;
    humanConfidence: number;
    lessonLearned: string;
    patternIdentified?: string;
    trainingDataCandidate: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpertProfile {
  id: string;
  name: string;
  expertise: string[];
  availability: {
    timezone: string;
    workingHours: { start: number; end: number };
    currentStatus: 'available' | 'busy' | 'offline';
    maxConcurrentCases: number;
    currentCaseLoad: number;
  };
  performance: {
    totalCasesHandled: number;
    averageResponseTime: number;
    accuracyRate: number;
    userSatisfactionScore: number;
    specializations: string[];
  };
  certifications: string[];
  languages: string[];
}

export interface OversightMetrics {
  totalCases: number;
  pendingCases: number;
  averageResponseTime: number;
  humanAiAgreementRate: number;
  falsePositiveReductions: number;
  emergencyCasesHandled: number;
  expertUtilization: number;
  learningCasesGenerated: number;
}

/**
 * Human Oversight Integration System
 * Seamlessly integrates human expertise with AI analysis for complex cases
 */
export class HumanOversightIntegration extends EventEmitter {
  private static instance: HumanOversightIntegration;
  
  // Active cases and expert management
  private activeCases = new Map<string, HumanOversightCase>();
  private availableExperts = new Map<string, ExpertProfile>();
  private caseQueue: string[] = []; // Priority-ordered case IDs
  
  // Performance tracking
  private metrics: OversightMetrics = {
    totalCases: 0,
    pendingCases: 0,
    averageResponseTime: 0,
    humanAiAgreementRate: 0,
    falsePositiveReductions: 0,
    emergencyCasesHandled: 0,
    expertUtilization: 0,
    learningCasesGenerated: 0
  };
  
  // Edge case detection patterns
  private edgeCasePatterns = {
    lowConfidenceThreshold: 0.7,
    highUncertaintyThreshold: 0.8,
    culturalContextFlags: ['cultural', 'religious', 'ethnic', 'tradition'],
    ambiguousLanguagePatterns: [
      /\b(maybe|perhaps|might|could be|not sure|unclear)\b/gi,
      /\b(on one hand|on the other hand|both|neither)\b/gi,
      /\b(depends|it varies|sometimes|occasionally)\b/gi
    ],
    contradictorySignals: [
      { positive: 'getting help', negative: 'nothing works' },
      { positive: 'feel better', negative: 'want to die' },
      { positive: 'have support', negative: 'all alone' }
    ]
  };
  
  // Expert assignment algorithms
  private assignmentStrategies = {
    roundRobin: { enabled: true, lastAssigned: 0 },
    expertise: { enabled: true, weight: 0.7 },
    availability: { enabled: true, weight: 0.8 },
    performance: { enabled: true, weight: 0.6 }
  };
  
  private constructor() {
    super();
    this.initializeExperts();
    this.startPerformanceMonitoring();
    console.log('👥 Human Oversight Integration System initialized');
  }
  
  static getInstance(): HumanOversightIntegration {
    if (!HumanOversightIntegration.instance) {
      HumanOversightIntegration.instance = new HumanOversightIntegration();
    }
    return HumanOversightIntegration.instance;
  }
  
  /**
   * PRIMARY OVERSIGHT FUNCTION
   * Determines if human oversight is needed and creates oversight cases
   */
  async evaluateForOversight(
    content: string,
    aiAnalysis: any,
    context: any
  ): Promise<{
    needsOversight: boolean;
    case?: HumanOversightCase;
    reasoning: string;
    priority: HumanOversightCase['priority'];
  }> {
    
    try {
      // Analyze if case needs human oversight
      const oversightAnalysis = await this.analyzeOversightNeed(content, aiAnalysis, context);
      
      if (!oversightAnalysis.needsOversight) {
        return {
          needsOversight: false,
          reasoning: oversightAnalysis.reasoning,
          priority: 'LOW'
        };
      }
      
      // Create oversight case
      const oversightCase = await this.createOversightCase(
        content,
        aiAnalysis,
        context,
        oversightAnalysis
      );
      
      // Add to queue and assign expert if urgent
      await this.queueCase(oversightCase);
      
      // Immediate assignment for emergency cases
      if (oversightCase.priority === 'EMERGENCY' || oversightCase.priority === 'URGENT') {
        await this.assignExpert(oversightCase.id);
      }
      
      this.metrics.totalCases++;
      this.metrics.pendingCases++;
      
      this.emit('oversight_case_created', oversightCase);
      
      return {
        needsOversight: true,
        case: oversightCase,
        reasoning: oversightAnalysis.reasoning,
        priority: oversightCase.priority
      };
      
    } catch (error) {
      console.error('❌ Oversight evaluation failed:', error);
      
      // Default to requiring oversight on error for safety
      return {
        needsOversight: true,
        reasoning: 'System error - defaulting to human oversight for safety',
        priority: 'HIGH'
      };
    }
  }
  
  /**
   * Analyze if content needs human oversight
   */
  private async analyzeOversightNeed(
    content: string,
    aiAnalysis: any,
    context: any
  ): Promise<{
    needsOversight: boolean;
    reasoning: string;
    caseType: HumanOversightCase['caseType'];
    priority: HumanOversightCase['priority'];
    expertiseNeeded: string[];
  }> {
    
    const reasons: string[] = [];
    let needsOversight = false;
    let caseType: HumanOversightCase['caseType'] = 'quality_check';
    let priority: HumanOversightCase['priority'] = 'LOW';
    let expertiseNeeded: string[] = [];
    
    // 1. Check AI confidence levels
    if (aiAnalysis.confidenceScore < this.edgeCasePatterns.lowConfidenceThreshold * 100) {
      needsOversight = true;
      reasons.push(`Low AI confidence: ${aiAnalysis.confidenceScore}%`);
      caseType = 'ai_uncertainty';
      priority = this.upgradePriority(priority, 'MEDIUM');
    }
    
    // 2. Check for edge cases
    const edgeCaseResult = this.detectEdgeCase(content, aiAnalysis);
    if (edgeCaseResult.isEdgeCase) {
      needsOversight = true;
      reasons.push(`Edge case detected: ${edgeCaseResult.reason}`);
      caseType = 'edge_case';
      priority = this.upgradePriority(priority, 'HIGH');
      expertiseNeeded.push(...edgeCaseResult.expertiseNeeded);
    }
    
    // 3. Check for ambiguous content
    const ambiguityResult = this.detectAmbiguousContent(content);
    if (ambiguityResult.isAmbiguous) {
      needsOversight = true;
      reasons.push(`Ambiguous content: ${ambiguityResult.reason}`);
      caseType = 'ambiguous_content';
      priority = this.upgradePriority(priority, 'MEDIUM');
    }
    
    // 4. Check for cultural/language context needs
    const culturalResult = this.detectCulturalContext(content, context);
    if (culturalResult.needsCulturalExpertise) {
      needsOversight = true;
      reasons.push(`Cultural context needed: ${culturalResult.reason}`);
      expertiseNeeded.push('cultural_context');
      if (culturalResult.languageSpecialist) {
        expertiseNeeded.push('language_specialist');
      }
    }
    
    // 5. Check for high-stakes situations
    if (aiAnalysis.riskScore >= 80 && context.messageType === 'crisis') {
      needsOversight = true;
      reasons.push('High-stakes crisis situation requires human validation');
      caseType = 'escalation_review';
      priority = this.upgradePriority(priority, 'URGENT');
      expertiseNeeded.push('crisis_counseling');
    }
    
    // 6. Check for contradictory signals
    const contradictionResult = this.detectContradictorySignals(content, aiAnalysis);
    if (contradictionResult.hasContradictions) {
      needsOversight = true;
      reasons.push(`Contradictory signals: ${contradictionResult.contradictions.join(', ')}`);
      caseType = 'ambiguous_content';
      priority = this.upgradePriority(priority, 'HIGH');
      expertiseNeeded.push('psychiatric_evaluation');
    }
    
    // 7. Emergency situations always need immediate human oversight
    if (aiAnalysis.crisisLevel === 'EMERGENCY') {
      needsOversight = true;
      reasons.push('Emergency situation detected - mandatory human oversight');
      priority = 'EMERGENCY';
      expertiseNeeded.push('crisis_counseling', 'safety_assessment');
    }
    
    return {
      needsOversight,
      reasoning: reasons.join('; '),
      caseType,
      priority,
      expertiseNeeded: [...new Set(expertiseNeeded)] // Remove duplicates
    };
  }
  
  /**
   * Create a comprehensive oversight case
   */
  private async createOversightCase(
    content: string,
    aiAnalysis: any,
    context: any,
    oversightAnalysis: any
  ): Promise<HumanOversightCase> {
    
    const caseId = randomUUID();
    const now = new Date();
    
    // Calculate urgency score
    const urgency = this.calculateUrgencyScore(aiAnalysis, context, oversightAnalysis.priority);
    
    // Determine time limit based on priority
    const timeLimit = this.getTimeLimitForPriority(oversightAnalysis.priority);
    
    const oversightCase: HumanOversightCase = {
      id: caseId,
      priority: oversightAnalysis.priority,
      caseType: oversightAnalysis.caseType,
      
      originalContent: content,
      contentLanguage: context.language || 'en',
      context: {
        messageType: context.messageType,
        sessionId: context.sessionId,
        userId: context.userId,
        timestamp: context.timestamp || now,
        conversationHistory: context.conversationHistory
      },
      
      aiAnalysis: {
        riskScore: aiAnalysis.riskScore,
        confidenceScore: aiAnalysis.confidenceScore,
        crisisLevel: aiAnalysis.crisisLevel,
        detectedKeywords: aiAnalysis.keywords?.map((k: any) => k.keyword) || [],
        sentiment: aiAnalysis.sentiment,
        processingTime: aiAnalysis.processingTime,
        modelVersions: aiAnalysis.modelVersions ? Object.values(aiAnalysis.modelVersions) : [],
        uncertaintyFactors: this.identifyUncertaintyFactors(aiAnalysis)
      },
      
      oversightRequirements: {
        expertiseNeeded: oversightAnalysis.expertiseNeeded,
        urgency,
        reasonForEscalation: oversightAnalysis.reasoning,
        suggestedActions: this.generateSuggestedActions(aiAnalysis, oversightAnalysis),
        timeLimit
      },
      
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    // Store the case
    this.activeCases.set(caseId, oversightCase);
    
    return oversightCase;
  }
  
  /**
   * Queue case based on priority
   */
  private async queueCase(oversightCase: HumanOversightCase): Promise<void> {
    // Insert case into queue based on priority
    const priorityOrder = ['EMERGENCY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const casePriorityIndex = priorityOrder.indexOf(oversightCase.priority);
    
    let insertIndex = this.caseQueue.length;
    for (let i = 0; i < this.caseQueue.length; i++) {
      const queuedCase = this.activeCases.get(this.caseQueue[i]);
      if (queuedCase) {
        const queuedPriorityIndex = priorityOrder.indexOf(queuedCase.priority);
        if (casePriorityIndex < queuedPriorityIndex) {
          insertIndex = i;
          break;
        }
      }
    }
    
    this.caseQueue.splice(insertIndex, 0, oversightCase.id);
    
    console.log(`👥 Case ${oversightCase.id} queued with priority ${oversightCase.priority} at position ${insertIndex}`);
  }
  
  /**
   * Assign expert to case using intelligent matching
   */
  async assignExpert(caseId: string): Promise<{ assigned: boolean; expert?: ExpertProfile; reason: string }> {
    const oversightCase = this.activeCases.get(caseId);
    if (!oversightCase) {
      return { assigned: false, reason: 'Case not found' };
    }
    
    // Find best available expert
    const bestExpert = this.findBestExpert(oversightCase);
    if (!bestExpert) {
      return { assigned: false, reason: 'No suitable experts available' };
    }
    
    // Assign expert to case
    oversightCase.assignedExpert = {
      id: bestExpert.id,
      name: bestExpert.name,
      expertise: bestExpert.expertise,
      assignedAt: new Date()
    };
    
    oversightCase.status = 'assigned';
    oversightCase.updatedAt = new Date();
    
    // Update expert availability
    bestExpert.availability.currentCaseLoad++;
    if (bestExpert.availability.currentCaseLoad >= bestExpert.availability.maxConcurrentCases) {
      bestExpert.availability.currentStatus = 'busy';
    }
    
    // Remove from queue
    const queueIndex = this.caseQueue.indexOf(caseId);
    if (queueIndex !== -1) {
      this.caseQueue.splice(queueIndex, 1);
    }
    
    // Emit assignment event
    this.emit('expert_assigned', {
      caseId,
      expertId: bestExpert.id,
      priority: oversightCase.priority
    });
    
    console.log(`👥 Expert ${bestExpert.name} assigned to case ${caseId}`);
    
    return { assigned: true, expert: bestExpert, reason: 'Successfully assigned' };
  }
  
  /**
   * Process expert resolution of oversight case
   */
  async resolveCase(
    caseId: string,
    resolution: HumanOversightCase['resolution'],
    expertId: string
  ): Promise<{ success: boolean; learningData?: any }> {
    
    const oversightCase = this.activeCases.get(caseId);
    if (!oversightCase) {
      return { success: false };
    }
    
    const expert = this.availableExperts.get(expertId);
    if (!expert) {
      return { success: false };
    }
    
    // Complete the resolution
    const resolvedAt = new Date();
    const timeToResolution = resolvedAt.getTime() - oversightCase.createdAt.getTime();
    
    oversightCase.resolution = {
      ...resolution,
      resolvedAt,
      timeToResolution,
      resolvedBy: expertId
    };
    
    oversightCase.status = 'resolved';
    oversightCase.updatedAt = resolvedAt;
    
    // Generate learning data
    const learningData = this.generateLearningData(oversightCase, resolution);
    oversightCase.learningData = learningData;
    
    // Update expert performance
    this.updateExpertPerformance(expert, oversightCase);
    
    // Update metrics
    this.updateOversightMetrics(oversightCase);
    
    // Free up expert capacity
    expert.availability.currentCaseLoad--;
    if (expert.availability.currentCaseLoad < expert.availability.maxConcurrentCases) {
      expert.availability.currentStatus = 'available';
    }
    
    // Emit resolution event
    this.emit('case_resolved', {
      caseId,
      resolution: resolution.humanDecision,
      learningData
    });
    
    console.log(`👥 Case ${caseId} resolved by ${expert.name}: ${resolution.humanDecision}`);
    
    return { success: true, learningData };
  }
  
  // Private helper methods
  
  private detectEdgeCase(content: string, aiAnalysis: any): {
    isEdgeCase: boolean;
    reason: string;
    expertiseNeeded: string[];
  } {
    const expertiseNeeded: string[] = [];
    const reasons: string[] = [];
    
    // Check for unusual patterns
    const unusualPatterns = [
      /\b(quantum|simulation|matrix|reality)\b.*\b(not real|fake|illusion)\b/gi,
      /\b(aliens?|extraterrestrial|ufo)\b.*\b(control|communicate|abduct)\b/gi,
      /\b(government|cia|fbi)\b.*\b(tracking|monitoring|watching)\b/gi
    ];
    
    for (const pattern of unusualPatterns) {
      if (pattern.test(content)) {
        reasons.push('Unusual ideation patterns detected');
        expertiseNeeded.push('psychiatric_evaluation');
        break;
      }
    }
    
    // Check for complex cultural references
    const culturalReferences = [
      'honor killing', 'arranged marriage', 'family shame', 'religious obligation',
      'cultural expectation', 'tradition', 'ancestral spirit', 'karma'
    ];
    
    for (const reference of culturalReferences) {
      if (content.toLowerCase().includes(reference)) {
        reasons.push('Complex cultural context detected');
        expertiseNeeded.push('cultural_context');
        break;
      }
    }
    
    return {
      isEdgeCase: reasons.length > 0,
      reason: reasons.join('; '),
      expertiseNeeded
    };
  }
  
  private detectAmbiguousContent(content: string): {
    isAmbiguous: boolean;
    reason: string;
  } {
    const ambiguityScore = this.edgeCasePatterns.ambiguousLanguagePatterns
      .reduce((score, pattern) => {
        const matches = content.match(pattern);
        return score + (matches ? matches.length : 0);
      }, 0);
    
    const isAmbiguous = ambiguityScore >= 2;
    
    return {
      isAmbiguous,
      reason: isAmbiguous ? `High ambiguity score: ${ambiguityScore}` : ''
    };
  }
  
  private detectCulturalContext(content: string, context: any): {
    needsCulturalExpertise: boolean;
    reason: string;
    languageSpecialist: boolean;
  } {
    const culturalFlags = this.edgeCasePatterns.culturalContextFlags
      .filter(flag => content.toLowerCase().includes(flag));
    
    const needsCulturalExpertise = culturalFlags.length > 0;
    const languageSpecialist = context.language && context.language !== 'en';
    
    return {
      needsCulturalExpertise,
      reason: needsCulturalExpertise ? `Cultural context flags: ${culturalFlags.join(', ')}` : '',
      languageSpecialist
    };
  }
  
  private detectContradictorySignals(content: string, aiAnalysis: any): {
    hasContradictions: boolean;
    contradictions: string[];
  } {
    const contradictions: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const signal of this.edgeCasePatterns.contradictorySignals) {
      if (lowerContent.includes(signal.positive) && lowerContent.includes(signal.negative)) {
        contradictions.push(`${signal.positive} vs ${signal.negative}`);
      }
    }
    
    return {
      hasContradictions: contradictions.length > 0,
      contradictions
    };
  }
  
  private upgradePriority(current: HumanOversightCase['priority'], proposed: HumanOversightCase['priority']): HumanOversightCase['priority'] {
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY'];
    const currentIndex = priorityOrder.indexOf(current);
    const proposedIndex = priorityOrder.indexOf(proposed);
    
    return proposedIndex > currentIndex ? proposed : current;
  }
  
  private calculateUrgencyScore(aiAnalysis: any, context: any, priority: string): number {
    let urgency = 5; // Base urgency
    
    if (priority === 'EMERGENCY') urgency = 10;
    else if (priority === 'URGENT') urgency = 9;
    else if (priority === 'HIGH') urgency = 7;
    else if (priority === 'MEDIUM') urgency = 5;
    else urgency = 3;
    
    // Adjust based on risk score
    urgency += (aiAnalysis.riskScore / 100) * 2;
    
    // Adjust based on context
    if (context.messageType === 'emergency') urgency += 2;
    if (context.messageType === 'crisis') urgency += 1;
    
    return Math.min(10, Math.max(1, urgency));
  }
  
  private getTimeLimitForPriority(priority: HumanOversightCase['priority']): number {
    switch (priority) {
      case 'EMERGENCY': return 5;   // 5 minutes
      case 'URGENT': return 15;     // 15 minutes
      case 'HIGH': return 60;       // 1 hour
      case 'MEDIUM': return 240;    // 4 hours
      case 'LOW': return 1440;      // 24 hours
      default: return 240;
    }
  }
  
  private identifyUncertaintyFactors(aiAnalysis: any): string[] {
    const factors: string[] = [];
    
    if (aiAnalysis.confidenceScore < 70) factors.push('low_confidence');
    if (aiAnalysis.sentiment?.overall === 0) factors.push('neutral_sentiment');
    if (aiAnalysis.flags?.crisis > 50 && aiAnalysis.flags?.hope > 30) factors.push('mixed_signals');
    if (aiAnalysis.processingTime > 100) factors.push('complex_analysis');
    
    return factors;
  }
  
  private generateSuggestedActions(aiAnalysis: any, oversightAnalysis: any): string[] {
    const actions: string[] = [];
    
    if (aiAnalysis.riskScore >= 80) {
      actions.push('Consider immediate safety assessment');
    }
    
    if (oversightAnalysis.expertiseNeeded.includes('crisis_counseling')) {
      actions.push('Engage crisis counselor for specialized evaluation');
    }
    
    if (oversightAnalysis.expertiseNeeded.includes('cultural_context')) {
      actions.push('Consult cultural specialist for context interpretation');
    }
    
    if (aiAnalysis.confidenceScore < 60) {
      actions.push('Request additional context from user if safe to do so');
    }
    
    return actions;
  }
  
  private findBestExpert(oversightCase: HumanOversightCase): ExpertProfile | null {
    const availableExperts = Array.from(this.availableExperts.values())
      .filter(expert => 
        expert.availability.currentStatus === 'available' &&
        expert.availability.currentCaseLoad < expert.availability.maxConcurrentCases
      );
    
    if (availableExperts.length === 0) return null;
    
    // Score experts based on expertise match, availability, and performance
    const scoredExperts = availableExperts.map(expert => {
      let score = 0;
      
      // Expertise match (40% weight)
      const expertiseMatch = oversightCase.oversightRequirements.expertiseNeeded
        .filter(needed => expert.expertise.includes(needed)).length;
      score += (expertiseMatch / oversightCase.oversightRequirements.expertiseNeeded.length) * 40;
      
      // Performance (30% weight)
      score += (expert.performance.accuracyRate / 100) * 30;
      
      // Availability (20% weight)
      const utilizationRate = expert.availability.currentCaseLoad / expert.availability.maxConcurrentCases;
      score += (1 - utilizationRate) * 20;
      
      // Experience (10% weight)
      score += Math.min(expert.performance.totalCasesHandled / 1000, 1) * 10;
      
      return { expert, score };
    });
    
    // Return expert with highest score
    scoredExperts.sort((a, b) => b.score - a.score);
    return scoredExperts[0]?.expert || null;
  }
  
  private generateLearningData(oversightCase: HumanOversightCase, resolution: HumanOversightCase['resolution']): HumanOversightCase['learningData'] {
    const aiWasCorrect = resolution.humanDecision === 'approve_ai';
    
    let lessonLearned = '';
    if (!aiWasCorrect) {
      lessonLearned = `AI ${oversightCase.aiAnalysis.riskScore >= 70 ? 'over' : 'under'}-estimated risk. Human assessment: ${resolution.finalRiskScore}`;
    }
    
    const patternIdentified = this.identifyPattern(oversightCase, resolution);
    
    return {
      aiWasCorrect,
      humanConfidence: resolution.humanDecision === 'approve_ai' ? 0.9 : 0.7,
      lessonLearned,
      patternIdentified,
      trainingDataCandidate: !aiWasCorrect || oversightCase.caseType === 'edge_case'
    };
  }
  
  private identifyPattern(oversightCase: HumanOversightCase, resolution: HumanOversightCase['resolution']): string | undefined {
    // Simple pattern identification - in production would be more sophisticated
    if (oversightCase.caseType === 'cultural_context' && resolution.humanDecision === 'modify_ai') {
      return 'cultural_context_adjustment_needed';
    }
    
    if (oversightCase.aiAnalysis.confidenceScore < 60 && resolution.humanDecision === 'override_ai') {
      return 'low_confidence_prediction_unreliable';
    }
    
    return undefined;
  }
  
  private updateExpertPerformance(expert: ExpertProfile, oversightCase: HumanOversightCase): void {
    expert.performance.totalCasesHandled++;
    
    const responseTime = oversightCase.resolution!.timeToResolution / (1000 * 60); // Convert to minutes
    expert.performance.averageResponseTime = 
      (expert.performance.averageResponseTime * (expert.performance.totalCasesHandled - 1) + responseTime) / 
      expert.performance.totalCasesHandled;
    
    // Update accuracy based on case complexity and outcome
    // This would be more sophisticated in production
    if (oversightCase.learningData?.aiWasCorrect === false) {
      expert.performance.accuracyRate = Math.max(50, expert.performance.accuracyRate * 0.99);
    } else {
      expert.performance.accuracyRate = Math.min(100, expert.performance.accuracyRate * 1.001);
    }
  }
  
  private updateOversightMetrics(oversightCase: HumanOversightCase): void {
    this.metrics.pendingCases--;
    
    const responseTime = oversightCase.resolution!.timeToResolution / (1000 * 60);
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalCases - 1) + responseTime) / 
      this.metrics.totalCases;
    
    if (oversightCase.resolution!.humanDecision === 'approve_ai') {
      this.metrics.humanAiAgreementRate = 
        (this.metrics.humanAiAgreementRate * (this.metrics.totalCases - 1) + 1) / 
        this.metrics.totalCases;
    } else {
      this.metrics.humanAiAgreementRate = 
        (this.metrics.humanAiAgreementRate * (this.metrics.totalCases - 1)) / 
        this.metrics.totalCases;
    }
    
    if (oversightCase.priority === 'EMERGENCY') {
      this.metrics.emergencyCasesHandled++;
    }
    
    if (oversightCase.learningData?.trainingDataCandidate) {
      this.metrics.learningCasesGenerated++;
    }
  }
  
  private initializeExperts(): void {
    // Initialize some default experts - in production, this would come from a database
    const experts: ExpertProfile[] = [
      {
        id: 'expert_001',
        name: 'Dr. Sarah Chen',
        expertise: ['crisis_counseling', 'psychiatric_evaluation', 'safety_assessment'],
        availability: {
          timezone: 'UTC-5',
          workingHours: { start: 9, end: 17 },
          currentStatus: 'available',
          maxConcurrentCases: 5,
          currentCaseLoad: 0
        },
        performance: {
          totalCasesHandled: 150,
          averageResponseTime: 8.5,
          accuracyRate: 94.2,
          userSatisfactionScore: 4.7,
          specializations: ['suicide_prevention', 'trauma_counseling']
        },
        certifications: ['Licensed Clinical Social Worker', 'Crisis Intervention Specialist'],
        languages: ['en', 'es', 'zh']
      },
      {
        id: 'expert_002',
        name: 'Dr. Ahmed Hassan',
        expertise: ['cultural_context', 'language_specialist', 'crisis_counseling'],
        availability: {
          timezone: 'UTC+2',
          workingHours: { start: 8, end: 20 },
          currentStatus: 'available',
          maxConcurrentCases: 4,
          currentCaseLoad: 0
        },
        performance: {
          totalCasesHandled: 89,
          averageResponseTime: 12.3,
          accuracyRate: 91.7,
          userSatisfactionScore: 4.8,
          specializations: ['multicultural_counseling', 'religious_trauma']
        },
        certifications: ['Licensed Professional Counselor', 'Cultural Competency Specialist'],
        languages: ['en', 'ar', 'fr', 'ur']
      }
    ];
    
    experts.forEach(expert => {
      this.availableExperts.set(expert.id, expert);
    });
    
    console.log(`👥 ${experts.length} experts initialized for oversight`);
  }
  
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.calculateExpertUtilization();
      console.log(`👥 Oversight Metrics - Cases: ${this.metrics.totalCases}, Pending: ${this.metrics.pendingCases}, Avg Response: ${this.metrics.averageResponseTime.toFixed(1)}min, AI Agreement: ${(this.metrics.humanAiAgreementRate * 100).toFixed(1)}%`);
    }, 300000); // Every 5 minutes
  }
  
  private calculateExpertUtilization(): void {
    const totalCapacity = Array.from(this.availableExperts.values())
      .reduce((sum, expert) => sum + expert.availability.maxConcurrentCases, 0);
    
    const currentLoad = Array.from(this.availableExperts.values())
      .reduce((sum, expert) => sum + expert.availability.currentCaseLoad, 0);
    
    this.metrics.expertUtilization = totalCapacity > 0 ? currentLoad / totalCapacity : 0;
  }
  
  /**
   * Get current oversight metrics
   */
  getMetrics(): OversightMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get case by ID
   */
  getCase(caseId: string): HumanOversightCase | undefined {
    return this.activeCases.get(caseId);
  }
  
  /**
   * Get all pending cases
   */
  getPendingCases(): HumanOversightCase[] {
    return this.caseQueue
      .map(id => this.activeCases.get(id))
      .filter(case_ => case_ !== undefined) as HumanOversightCase[];
  }
  
  /**
   * Get available experts
   */
  getAvailableExperts(): ExpertProfile[] {
    return Array.from(this.availableExperts.values())
      .filter(expert => expert.availability.currentStatus === 'available');
  }
}

// Export singleton instance
export const humanOversightIntegration = HumanOversightIntegration.getInstance();