/**
 * ASTRAL_CORE 2.0 Comprehensive Audit Trail System
 * 
 * COMPLETE MODERATION TRANSPARENCY
 * - Full audit trail for all moderation decisions
 * - Compliance with safety regulations
 * - Detailed decision reasoning and evidence
 * - Performance tracking and accountability
 * - Forensic-level detail for incident investigation
 * - Privacy-preserving audit logs
 * 
 * TARGET PERFORMANCE:
 * - Audit log write latency: <10ms
 * - Data retention: 7 years
 * - Query performance: <100ms
 * - 100% moderation decision coverage
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';

export interface AuditEntry {
  // Basic identification
  id: string;
  timestamp: Date;
  version: string;
  
  // Event classification
  eventType: 'moderation_analysis' | 'crisis_detection' | 'risk_assessment' | 'human_oversight' | 'escalation' | 'system_action';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  category: string;
  subcategory?: string;
  
  // Content and context (privacy-preserving)
  contentHash: string; // SHA-256 hash of content for verification
  contentLength: number;
  contentLanguage: string;
  contextFingerprint: string; // Hash of context without PII
  
  // Session and user tracking (anonymized)
  sessionId?: string;
  userIdHash?: string; // Hashed user ID for privacy
  volunteerIdHash?: string; // Hashed volunteer ID
  
  // AI analysis details
  aiAnalysis: {
    models: Array<{
      name: string;
      version: string;
      processingTime: number;
      confidence: number;
      decision: string;
    }>;
    ensemble?: {
      finalScore: number;
      weightedAverage: number;
      consensusLevel: number;
    };
    flags: Record<string, number>;
    keywords: Array<{
      keyword: string;
      severity: number;
      category: string;
      confidence: number;
    }>;
    sentiment: {
      overall: number;
      emotions: Record<string, number>;
    };
  };
  
  // Human oversight details
  humanOversight?: {
    required: boolean;
    assigned: boolean;
    expertId?: string;
    expertExpertise: string[];
    responseTime?: number;
    decision?: 'approve_ai' | 'override_ai' | 'modify_ai' | 'escalate_further';
    reasoning?: string;
    confidence?: number;
  };
  
  // Risk assessment details
  riskAssessment: {
    originalRisk: number;
    adjustedRisk: number;
    contextFactors: Array<{
      factor: string;
      weight: number;
      impact: 'increase' | 'decrease';
      confidence: number;
    }>;
    falsePositiveProbability: number;
    confidenceLevel: number;
  };
  
  // Final decision and actions
  finalDecision: {
    action: 'ALLOW' | 'FLAG' | 'BLOCK' | 'ESCALATE' | 'EMERGENCY';
    reasoning: string;
    confidence: number;
    overriddenBy?: 'human' | 'system' | 'escalation';
    implementedActions: string[];
  };
  
  // Performance metrics
  performance: {
    totalProcessingTime: number;
    modelProcessingTime: number;
    riskAssessmentTime: number;
    oversightTime?: number;
    queueWaitTime?: number;
  };
  
  // Compliance and legal
  compliance: {
    regulations: string[]; // e.g., ['GDPR', 'HIPAA', 'CCPA']
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPolicy: string;
    privacyLevel: 'anonymized' | 'pseudonymized' | 'encrypted';
  };
  
  // Quality assurance
  qualityMetrics?: {
    accuracyScore?: number;
    appropriatenessScore?: number;
    userSatisfaction?: number;
    followUpRequired: boolean;
    learningOpportunity: boolean;
  };
  
  // Correlation and tracking
  relatedEvents: string[]; // IDs of related audit entries
  parentEventId?: string; // For event chains
  incidentId?: string; // For grouping related events
  
  // System metadata
  systemInfo: {
    version: string;
    environment: 'development' | 'staging' | 'production';
    region: string;
    nodeId: string;
  };
}

export interface AuditQuery {
  // Time range
  startTime?: Date;
  endTime?: Date;
  
  // Filters
  eventTypes?: string[];
  severities?: string[];
  categories?: string[];
  actions?: string[];
  
  // User/session filters (hashed)
  sessionId?: string;
  userIdHash?: string;
  
  // Performance filters
  minProcessingTime?: number;
  maxProcessingTime?: number;
  minConfidence?: number;
  maxConfidence?: number;
  
  // Risk filters
  minRiskScore?: number;
  maxRiskScore?: number;
  falsePositiveOnly?: boolean;
  humanOverrideOnly?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'severity' | 'processing_time' | 'risk_score';
  orderDirection?: 'ASC' | 'DESC';
}

export interface AuditAnalytics {
  // Volume metrics
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsPerHour: Array<{ hour: number; count: number }>;
  
  // Performance metrics
  averageProcessingTime: number;
  processingTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  
  // Accuracy metrics
  humanOverrideRate: number;
  falsePositiveRate: number;
  accuracyByCategory: Record<string, number>;
  
  // Risk metrics
  riskDistribution: Array<{ range: string; count: number }>;
  highRiskEvents: number;
  emergencyEscalations: number;
  
  // Quality metrics
  averageConfidence: number;
  lowConfidenceEvents: number;
  learningOpportunities: number;
}

/**
 * Comprehensive Audit Trail System
 * Provides complete transparency and accountability for all moderation decisions
 */
export class ComprehensiveAuditTrail extends EventEmitter {
  private static instance: ComprehensiveAuditTrail;
  
  // Storage backends
  private auditEntries = new Map<string, AuditEntry>(); // In-memory for demo
  private eventIndex = new Map<string, string[]>(); // Event type -> entry IDs
  private timeIndex = new Map<string, string[]>(); // Date -> entry IDs
  
  // Performance optimization
  private writeBuffer: AuditEntry[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  
  // Analytics cache
  private analyticsCache = new Map<string, { data: AuditAnalytics; timestamp: number }>();
  private readonly ANALYTICS_CACHE_TTL = 300000; // 5 minutes
  
  // Metrics
  private metrics = {
    totalEntries: 0,
    writeLatency: 0,
    queryLatency: 0,
    bufferFlushes: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  
  private constructor() {
    super();
    this.startMaintenanceTasks();
    console.log('📋 Comprehensive Audit Trail System initialized');
  }
  
  static getInstance(): ComprehensiveAuditTrail {
    if (!ComprehensiveAuditTrail.instance) {
      ComprehensiveAuditTrail.instance = new ComprehensiveAuditTrail();
    }
    return ComprehensiveAuditTrail.instance;
  }
  
  /**
   * PRIMARY AUDIT FUNCTION
   * Log a moderation decision with complete audit trail
   * TARGET: <10ms write latency
   */
  async logModerationDecision(data: {
    content: string;
    context: any;
    aiAnalysis: any;
    riskAssessment: any;
    humanOversight?: any;
    finalDecision: any;
    performance: any;
  }): Promise<{ auditId: string; writeTime: number }> {
    
    const startTime = performance.now();
    
    try {
      // Create comprehensive audit entry
      const auditEntry = this.createAuditEntry(data);
      
      // Add to write buffer for batch processing
      this.writeBuffer.push(auditEntry);
      
      // Immediate flush for high-severity events
      if (auditEntry.severity === 'CRITICAL' || auditEntry.severity === 'EMERGENCY') {
        await this.flushBuffer();
      } else if (this.writeBuffer.length >= this.BUFFER_SIZE) {
        // Async flush when buffer is full
        this.flushBuffer().catch(error => 
          console.error('❌ Buffer flush failed:', error)
        );
      }
      
      const writeTime = performance.now() - startTime;
      this.updateMetrics('write', writeTime);
      
      // Emit audit event
      this.emit('audit_logged', {
        id: auditEntry.id,
        eventType: auditEntry.eventType,
        severity: auditEntry.severity
      });
      
      // Performance warning
      if (writeTime > 10) {
        console.warn(`⚠️ Audit write exceeded target latency: ${writeTime.toFixed(2)}ms`);
      }
      
      return { auditId: auditEntry.id, writeTime };
      
    } catch (error) {
      console.error('❌ Audit logging failed:', error);
      throw error;
    }
  }
  
  /**
   * Log crisis detection event
   */
  async logCrisisDetection(data: {
    content: string;
    context: any;
    detectionResult: any;
    escalationActions: string[];
  }): Promise<string> {
    
    const auditEntry: AuditEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      version: '2.1.0',
      
      eventType: 'crisis_detection',
      severity: this.mapCrisisLevelToSeverity(data.detectionResult.crisisLevel),
      category: 'crisis_keywords',
      subcategory: data.detectionResult.recommendedAction,
      
      contentHash: this.hashContent(data.content),
      contentLength: data.content.length,
      contentLanguage: data.detectionResult.language,
      contextFingerprint: this.createContextFingerprint(data.context),
      
      sessionId: data.context.sessionId,
      userIdHash: data.context.userId ? this.hashString(data.context.userId) : undefined,
      
      aiAnalysis: {
        models: [{
          name: 'crisis-detector',
          version: '3.0',
          processingTime: data.detectionResult.processingTime,
          confidence: data.detectionResult.confidence,
          decision: data.detectionResult.recommendedAction
        }],
        flags: {
          crisis: data.detectionResult.severity * 100,
          immediate_risk: data.detectionResult.immediateRisk ? 100 : 0
        },
        keywords: data.detectionResult.keywords.map((k: any) => ({
          keyword: k.keyword,
          severity: k.severity,
          category: k.category,
          confidence: 0.9
        })),
        sentiment: { overall: 0, emotions: {} }
      },
      
      riskAssessment: {
        originalRisk: data.detectionResult.severity,
        adjustedRisk: data.detectionResult.severity,
        contextFactors: [],
        falsePositiveProbability: 0.05,
        confidenceLevel: data.detectionResult.confidence * 100
      },
      
      finalDecision: {
        action: this.mapRecommendationToAction(data.detectionResult.recommendedAction),
        reasoning: `Crisis detection: ${data.detectionResult.keywords.length} keywords found`,
        confidence: data.detectionResult.confidence,
        implementedActions: data.escalationActions
      },
      
      performance: {
        totalProcessingTime: data.detectionResult.processingTime,
        modelProcessingTime: data.detectionResult.processingTime,
        riskAssessmentTime: 0,
        queueWaitTime: 0
      },
      
      compliance: {
        regulations: ['GDPR', 'HIPAA'],
        dataClassification: 'restricted',
        retentionPolicy: '7_years',
        privacyLevel: 'anonymized'
      },
      
      relatedEvents: [],
      
      systemInfo: {
        version: '2.1.0',
        environment: 'production',
        region: 'us-east-1',
        nodeId: 'node-001'
      }
    };
    
    this.writeBuffer.push(auditEntry);
    
    if (auditEntry.severity === 'EMERGENCY' || auditEntry.severity === 'CRITICAL') {
      await this.flushBuffer();
    }
    
    return auditEntry.id;
  }
  
  /**
   * Log human oversight event
   */
  async logHumanOversight(data: {
    caseId: string;
    expertId: string;
    decision: any;
    originalAnalysis: any;
  }): Promise<string> {
    
    const auditEntry: AuditEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      version: '2.1.0',
      
      eventType: 'human_oversight',
      severity: data.decision.humanDecision === 'override_ai' ? 'HIGH' : 'MEDIUM',
      category: 'expert_review',
      subcategory: data.decision.humanDecision,
      
      contentHash: 'redacted_for_privacy',
      contentLength: 0,
      contentLanguage: 'unknown',
      contextFingerprint: this.hashString(data.caseId),
      
      humanOversight: {
        required: true,
        assigned: true,
        expertId: this.hashString(data.expertId),
        expertExpertise: [], // Would be filled from expert profile
        responseTime: data.decision.timeToResolution,
        decision: data.decision.humanDecision,
        reasoning: data.decision.reasoning,
        confidence: data.decision.confidence || 0.8
      },
      
      aiAnalysis: {
        models: [],
        flags: {},
        keywords: [],
        sentiment: { overall: 0, emotions: {} }
      },
      
      riskAssessment: {
        originalRisk: data.originalAnalysis.riskScore,
        adjustedRisk: data.decision.finalRiskScore || data.originalAnalysis.riskScore,
        contextFactors: [],
        falsePositiveProbability: 0.05,
        confidenceLevel: 80
      },
      
      finalDecision: {
        action: data.decision.finalAction,
        reasoning: data.decision.reasoning,
        confidence: data.decision.confidence || 0.8,
        overriddenBy: 'human',
        implementedActions: data.decision.recommendations || []
      },
      
      performance: {
        totalProcessingTime: data.decision.timeToResolution,
        modelProcessingTime: 0,
        riskAssessmentTime: 0,
        oversightTime: data.decision.timeToResolution
      },
      
      compliance: {
        regulations: ['GDPR', 'HIPAA'],
        dataClassification: 'restricted',
        retentionPolicy: '7_years',
        privacyLevel: 'anonymized'
      },
      
      qualityMetrics: {
        followUpRequired: false,
        learningOpportunity: data.decision.humanDecision === 'override_ai'
      },
      
      relatedEvents: [data.caseId],
      parentEventId: data.caseId,
      
      systemInfo: {
        version: '2.1.0',
        environment: 'production',
        region: 'us-east-1',
        nodeId: 'node-001'
      }
    };
    
    this.writeBuffer.push(auditEntry);
    await this.flushBuffer(); // Always flush human oversight events immediately
    
    return auditEntry.id;
  }
  
  /**
   * Query audit trail with advanced filtering
   */
  async queryAuditTrail(query: AuditQuery): Promise<{
    entries: AuditEntry[];
    totalCount: number;
    queryTime: number;
  }> {
    
    const startTime = performance.now();
    
    try {
      // Get all entries (in production, this would be optimized database queries)
      let entries = Array.from(this.auditEntries.values());
      
      // Apply filters
      entries = this.applyFilters(entries, query);
      
      // Sort results
      entries = this.sortEntries(entries, query);
      
      // Apply pagination
      const totalCount = entries.length;
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      entries = entries.slice(offset, offset + limit);
      
      const queryTime = performance.now() - startTime;
      this.updateMetrics('query', queryTime);
      
      return { entries, totalCount, queryTime };
      
    } catch (error) {
      console.error('❌ Audit query failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate analytics from audit trail
   */
  async generateAnalytics(timeRange: { start: Date; end: Date }): Promise<AuditAnalytics> {
    const cacheKey = `${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
    
    // Check cache
    const cached = this.analyticsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.ANALYTICS_CACHE_TTL) {
      this.metrics.cacheHits++;
      return cached.data;
    }
    
    this.metrics.cacheMisses++;
    
    // Query entries in time range
    const { entries } = await this.queryAuditTrail({
      startTime: timeRange.start,
      endTime: timeRange.end,
      limit: 10000 // Large limit for analytics
    });
    
    // Calculate analytics
    const analytics = this.calculateAnalytics(entries);
    
    // Cache result
    this.analyticsCache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now()
    });
    
    return analytics;
  }
  
  /**
   * Get compliance report for audit purposes
   */
  async getComplianceReport(regulation: string, timeRange: { start: Date; end: Date }): Promise<{
    totalDecisions: number;
    humanOversightRate: number;
    averageResponseTime: number;
    highRiskDecisions: number;
    dataRetentionCompliance: number;
    privacyCompliance: number;
    auditTrailCompleteness: number;
  }> {
    
    const { entries } = await this.queryAuditTrail({
      startTime: timeRange.start,
      endTime: timeRange.end,
      limit: 100000
    });
    
    const totalDecisions = entries.length;
    const humanOversightDecisions = entries.filter(e => e.humanOversight?.required).length;
    const highRiskDecisions = entries.filter(e => e.riskAssessment.adjustedRisk >= 7).length;
    
    const avgResponseTime = entries
      .filter(e => e.performance.totalProcessingTime > 0)
      .reduce((sum, e) => sum + e.performance.totalProcessingTime, 0) / totalDecisions;
    
    const complianceEntries = entries.filter(e => 
      e.compliance.regulations.includes(regulation)
    );
    
    return {
      totalDecisions,
      humanOversightRate: humanOversightDecisions / totalDecisions,
      averageResponseTime: avgResponseTime,
      highRiskDecisions,
      dataRetentionCompliance: complianceEntries.length / totalDecisions,
      privacyCompliance: entries.filter(e => e.compliance.privacyLevel === 'anonymized').length / totalDecisions,
      auditTrailCompleteness: entries.filter(e => e.finalDecision.reasoning.length > 0).length / totalDecisions
    };
  }
  
  // Private implementation methods
  
  private createAuditEntry(data: any): AuditEntry {
    const now = new Date();
    
    return {
      id: randomUUID(),
      timestamp: now,
      version: '2.1.0',
      
      eventType: 'moderation_analysis',
      severity: this.determineSeverity(data.aiAnalysis, data.riskAssessment),
      category: 'content_moderation',
      subcategory: data.finalDecision.action,
      
      contentHash: this.hashContent(data.content),
      contentLength: data.content.length,
      contentLanguage: data.context.language || 'en',
      contextFingerprint: this.createContextFingerprint(data.context),
      
      sessionId: data.context.sessionId,
      userIdHash: data.context.userId ? this.hashString(data.context.userId) : undefined,
      volunteerIdHash: data.context.volunteerId ? this.hashString(data.context.volunteerId) : undefined,
      
      aiAnalysis: {
        models: this.extractModelInfo(data.aiAnalysis),
        ensemble: data.aiAnalysis.ensemble,
        flags: data.aiAnalysis.flags || {},
        keywords: data.aiAnalysis.keywords || [],
        sentiment: data.aiAnalysis.sentiment || { overall: 0, emotions: {} }
      },
      
      humanOversight: data.humanOversight ? {
        required: true,
        assigned: !!data.humanOversight.assigned,
        expertId: data.humanOversight.expertId ? this.hashString(data.humanOversight.expertId) : undefined,
        expertExpertise: data.humanOversight.expertExpertise || [],
        responseTime: data.humanOversight.responseTime,
        decision: data.humanOversight.decision,
        reasoning: data.humanOversight.reasoning,
        confidence: data.humanOversight.confidence
      } : undefined,
      
      riskAssessment: {
        originalRisk: data.riskAssessment.originalRiskScore,
        adjustedRisk: data.riskAssessment.adjustedRiskScore,
        contextFactors: data.riskAssessment.riskFactors || [],
        falsePositiveProbability: data.riskAssessment.falsePositiveProbability,
        confidenceLevel: data.riskAssessment.confidenceLevel
      },
      
      finalDecision: {
        action: data.finalDecision.action,
        reasoning: data.finalDecision.reasoning,
        confidence: data.finalDecision.confidence || 0.8,
        overriddenBy: data.finalDecision.overriddenBy,
        implementedActions: data.finalDecision.implementedActions || []
      },
      
      performance: {
        totalProcessingTime: data.performance.totalProcessingTime,
        modelProcessingTime: data.performance.modelProcessingTime,
        riskAssessmentTime: data.performance.riskAssessmentTime,
        oversightTime: data.performance.oversightTime,
        queueWaitTime: data.performance.queueWaitTime
      },
      
      compliance: {
        regulations: ['GDPR', 'HIPAA', 'CCPA'],
        dataClassification: this.classifyData(data.content, data.context),
        retentionPolicy: '7_years',
        privacyLevel: 'anonymized'
      },
      
      qualityMetrics: data.qualityMetrics,
      
      relatedEvents: [],
      
      systemInfo: {
        version: '2.1.0',
        environment: process.env.NODE_ENV as any || 'development',
        region: process.env.AWS_REGION || 'us-east-1',
        nodeId: process.env.NODE_ID || 'node-001'
      }
    };
  }
  
  private async flushBuffer(): Promise<void> {
    if (this.writeBuffer.length === 0) return;
    
    const entries = [...this.writeBuffer];
    this.writeBuffer = [];
    
    // Write entries to storage
    for (const entry of entries) {
      this.auditEntries.set(entry.id, entry);
      
      // Update indices
      this.updateIndices(entry);
    }
    
    this.metrics.totalEntries += entries.length;
    this.metrics.bufferFlushes++;
    
    console.log(`📋 Flushed ${entries.length} audit entries`);
  }
  
  private updateIndices(entry: AuditEntry): void {
    // Event type index
    const typeEntries = this.eventIndex.get(entry.eventType) || [];
    typeEntries.push(entry.id);
    this.eventIndex.set(entry.eventType, typeEntries);
    
    // Time index (by date)
    const dateKey = entry.timestamp.toISOString().split('T')[0];
    const dateEntries = this.timeIndex.get(dateKey) || [];
    dateEntries.push(entry.id);
    this.timeIndex.set(dateKey, dateEntries);
  }
  
  private applyFilters(entries: AuditEntry[], query: AuditQuery): AuditEntry[] {
    return entries.filter(entry => {
      // Time range filter
      if (query.startTime && entry.timestamp < query.startTime) return false;
      if (query.endTime && entry.timestamp > query.endTime) return false;
      
      // Event type filter
      if (query.eventTypes && !query.eventTypes.includes(entry.eventType)) return false;
      
      // Severity filter
      if (query.severities && !query.severities.includes(entry.severity)) return false;
      
      // Category filter
      if (query.categories && !query.categories.includes(entry.category)) return false;
      
      // Action filter
      if (query.actions && !query.actions.includes(entry.finalDecision.action)) return false;
      
      // Session/user filter
      if (query.sessionId && entry.sessionId !== query.sessionId) return false;
      if (query.userIdHash && entry.userIdHash !== query.userIdHash) return false;
      
      // Performance filters
      if (query.minProcessingTime && entry.performance.totalProcessingTime < query.minProcessingTime) return false;
      if (query.maxProcessingTime && entry.performance.totalProcessingTime > query.maxProcessingTime) return false;
      if (query.minConfidence && entry.finalDecision.confidence < query.minConfidence) return false;
      if (query.maxConfidence && entry.finalDecision.confidence > query.maxConfidence) return false;
      
      // Risk filters
      if (query.minRiskScore && entry.riskAssessment.adjustedRisk < query.minRiskScore) return false;
      if (query.maxRiskScore && entry.riskAssessment.adjustedRisk > query.maxRiskScore) return false;
      if (query.falsePositiveOnly && entry.riskAssessment.falsePositiveProbability < 0.1) return false;
      if (query.humanOverrideOnly && !entry.humanOversight?.required) return false;
      
      return true;
    });
  }
  
  private sortEntries(entries: AuditEntry[], query: AuditQuery): AuditEntry[] {
    const orderBy = query.orderBy || 'timestamp';
    const direction = query.orderDirection || 'DESC';
    
    return entries.sort((a, b) => {
      let comparison = 0;
      
      switch (orderBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'severity':
          const severityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'];
          comparison = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
          break;
        case 'processing_time':
          comparison = a.performance.totalProcessingTime - b.performance.totalProcessingTime;
          break;
        case 'risk_score':
          comparison = a.riskAssessment.adjustedRisk - b.riskAssessment.adjustedRisk;
          break;
      }
      
      return direction === 'ASC' ? comparison : -comparison;
    });
  }
  
  private calculateAnalytics(entries: AuditEntry[]): AuditAnalytics {
    const totalEvents = entries.length;
    
    // Event type distribution
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    
    entries.forEach(entry => {
      eventsByType[entry.eventType] = (eventsByType[entry.eventType] || 0) + 1;
      eventsBySeverity[entry.severity] = (eventsBySeverity[entry.severity] || 0) + 1;
    });
    
    // Hourly distribution
    const eventsPerHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: entries.filter(e => e.timestamp.getHours() === hour).length
    }));
    
    // Performance metrics
    const processingTimes = entries.map(e => e.performance.totalProcessingTime).sort((a, b) => a - b);
    const averageProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
    
    const processingTimePercentiles = {
      p50: this.getPercentile(processingTimes, 0.5),
      p90: this.getPercentile(processingTimes, 0.9),
      p95: this.getPercentile(processingTimes, 0.95),
      p99: this.getPercentile(processingTimes, 0.99)
    };
    
    // Accuracy metrics
    const humanOverrides = entries.filter(e => e.humanOversight?.decision === 'override_ai').length;
    const humanOversightRate = entries.filter(e => e.humanOversight?.required).length / totalEvents;
    const falsePositiveRate = entries.filter(e => e.riskAssessment.falsePositiveProbability > 0.1).length / totalEvents;
    
    // Risk distribution
    const riskDistribution = [
      { range: '0-2', count: entries.filter(e => e.riskAssessment.adjustedRisk <= 2).length },
      { range: '3-4', count: entries.filter(e => e.riskAssessment.adjustedRisk > 2 && e.riskAssessment.adjustedRisk <= 4).length },
      { range: '5-6', count: entries.filter(e => e.riskAssessment.adjustedRisk > 4 && e.riskAssessment.adjustedRisk <= 6).length },
      { range: '7-8', count: entries.filter(e => e.riskAssessment.adjustedRisk > 6 && e.riskAssessment.adjustedRisk <= 8).length },
      { range: '9-10', count: entries.filter(e => e.riskAssessment.adjustedRisk > 8).length }
    ];
    
    const highRiskEvents = entries.filter(e => e.riskAssessment.adjustedRisk >= 7).length;
    const emergencyEscalations = entries.filter(e => e.severity === 'EMERGENCY').length;
    
    // Quality metrics
    const confidenceScores = entries.map(e => e.finalDecision.confidence);
    const averageConfidence = confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length;
    const lowConfidenceEvents = entries.filter(e => e.finalDecision.confidence < 0.7).length;
    const learningOpportunities = entries.filter(e => e.qualityMetrics?.learningOpportunity).length;
    
    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      eventsPerHour,
      averageProcessingTime,
      processingTimePercentiles,
      humanOverrideRate,
      falsePositiveRate,
      accuracyByCategory: {}, // Would be calculated based on categories
      riskDistribution,
      highRiskEvents,
      emergencyEscalations,
      averageConfidence,
      lowConfidenceEvents,
      learningOpportunities
    };
  }
  
  // Utility methods
  
  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
  
  private hashString(input: string): string {
    return createHash('sha256').update(input + 'salt_for_privacy').digest('hex').substring(0, 16);
  }
  
  private createContextFingerprint(context: any): string {
    // Create hash of context without PII
    const sanitizedContext = {
      messageType: context.messageType,
      isAnonymous: context.isAnonymous,
      timestamp: context.timestamp
    };
    return this.hashString(JSON.stringify(sanitizedContext));
  }
  
  private determineSeverity(aiAnalysis: any, riskAssessment: any): AuditEntry['severity'] {
    if (riskAssessment.adjustedRiskScore >= 90) return 'EMERGENCY';
    if (riskAssessment.adjustedRiskScore >= 80) return 'CRITICAL';
    if (riskAssessment.adjustedRiskScore >= 60) return 'HIGH';
    if (riskAssessment.adjustedRiskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }
  
  private extractModelInfo(aiAnalysis: any): AuditEntry['aiAnalysis']['models'] {
    if (aiAnalysis.modelVersions?.ensemble) {
      return aiAnalysis.modelVersions.ensemble.map((version: string) => ({
        name: version.split('-')[0],
        version: version.split('-')[1] || '1.0',
        processingTime: aiAnalysis.processingTime / aiAnalysis.modelVersions.ensemble.length,
        confidence: aiAnalysis.confidenceScore / 100,
        decision: aiAnalysis.action
      }));
    }
    
    return [{
      name: aiAnalysis.modelVersions?.primary?.split('-')[0] || 'primary',
      version: aiAnalysis.modelVersions?.primary?.split('-')[1] || '1.0',
      processingTime: aiAnalysis.processingTime,
      confidence: aiAnalysis.confidenceScore / 100,
      decision: aiAnalysis.action
    }];
  }
  
  private classifyData(content: string, context: any): AuditEntry['compliance']['dataClassification'] {
    if (context.messageType === 'crisis' || context.messageType === 'emergency') {
      return 'restricted';
    }
    if (content.length > 1000 || context.isAnonymous === false) {
      return 'confidential';
    }
    return 'internal';
  }
  
  private mapCrisisLevelToSeverity(crisisLevel: string): AuditEntry['severity'] {
    switch (crisisLevel) {
      case 'EMERGENCY': return 'EMERGENCY';
      case 'CRITICAL': return 'CRITICAL';
      case 'HIGH': return 'HIGH';
      case 'MODERATE': return 'MEDIUM';
      default: return 'LOW';
    }
  }
  
  private mapRecommendationToAction(recommendation: string): AuditEntry['finalDecision']['action'] {
    switch (recommendation) {
      case 'IMMEDIATE_INTERVENTION': return 'EMERGENCY';
      case 'EMERGENCY': return 'EMERGENCY';
      case 'ESCALATE': return 'ESCALATE';
      case 'MONITOR': return 'FLAG';
      default: return 'ALLOW';
    }
  }
  
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.floor(sortedArray.length * percentile);
    return sortedArray[index] || 0;
  }
  
  private updateMetrics(operation: 'write' | 'query', latency: number): void {
    if (operation === 'write') {
      this.metrics.writeLatency = (this.metrics.writeLatency + latency) / 2;
    } else {
      this.metrics.queryLatency = (this.metrics.queryLatency + latency) / 2;
    }
  }
  
  private startMaintenanceTasks(): void {
    // Periodic buffer flush
    setInterval(() => {
      if (this.writeBuffer.length > 0) {
        this.flushBuffer().catch(error => 
          console.error('❌ Scheduled buffer flush failed:', error)
        );
      }
    }, this.FLUSH_INTERVAL);
    
    // Periodic cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes
    
    // Metrics logging
    setInterval(() => {
      console.log(`📋 Audit Metrics - Entries: ${this.metrics.totalEntries}, Write: ${this.metrics.writeLatency.toFixed(2)}ms, Query: ${this.metrics.queryLatency.toFixed(2)}ms`);
    }, 60000); // Every minute
  }
  
  private cleanupCache(): void {
    const cutoff = Date.now() - this.ANALYTICS_CACHE_TTL;
    for (const [key, value] of this.analyticsCache.entries()) {
      if (value.timestamp < cutoff) {
        this.analyticsCache.delete(key);
      }
    }
  }
  
  /**
   * Get current audit metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Get audit entry by ID
   */
  getEntry(entryId: string): AuditEntry | undefined {
    return this.auditEntries.get(entryId);
  }
  
  /**
   * Validate audit trail integrity
   */
  async validateIntegrity(timeRange: { start: Date; end: Date }): Promise<{
    valid: boolean;
    issues: string[];
    totalEntries: number;
    validEntries: number;
  }> {
    
    const { entries } = await this.queryAuditTrail({
      startTime: timeRange.start,
      endTime: timeRange.end,
      limit: 100000
    });
    
    const issues: string[] = [];
    let validEntries = 0;
    
    entries.forEach(entry => {
      let entryValid = true;
      
      // Check required fields
      if (!entry.id || !entry.timestamp || !entry.finalDecision.reasoning) {
        issues.push(`Entry ${entry.id}: Missing required fields`);
        entryValid = false;
      }
      
      // Check hash integrity
      if (!entry.contentHash || entry.contentHash.length !== 64) {
        issues.push(`Entry ${entry.id}: Invalid content hash`);
        entryValid = false;
      }
      
      // Check performance metrics
      if (entry.performance.totalProcessingTime < 0 || entry.performance.totalProcessingTime > 300000) {
        issues.push(`Entry ${entry.id}: Suspicious processing time`);
        entryValid = false;
      }
      
      if (entryValid) validEntries++;
    });
    
    return {
      valid: issues.length === 0,
      issues,
      totalEntries: entries.length,
      validEntries
    };
  }
}

// Export singleton instance
export const comprehensiveAuditTrail = ComprehensiveAuditTrail.getInstance();