/**
 * ASTRAL_CORE 2.0 Anomaly Detection System
 * 
 * PLATFORM SECURITY & ABUSE DETECTION
 * Detects unusual patterns and potential security threats to protect the platform
 * and ensure safe crisis intervention environment.
 */

export interface AnomalyDetectionResult {
  riskScore: number; // 0-1 scale
  anomalies: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  confidence: number;
}

export interface DetectionContext {
  userId?: string;
  sessionId?: string;
  messageType: 'crisis' | 'volunteer' | 'general';
  isAnonymous?: boolean;
  timestamp: Date;
}

export class AnomalyDetector {
  private static instance: AnomalyDetector;
  
  // Anomaly detection thresholds
  private readonly ANOMALY_THRESHOLDS = {
    RAPID_MESSAGING: 0.7,     // Too many messages too quickly
    UNUSUAL_PATTERNS: 0.6,    // Unusual communication patterns
    POTENTIAL_BOT: 0.8,       // Automated/bot-like behavior
    SYSTEM_ABUSE: 0.9,        // Attempting to abuse platform features
    SECURITY_THREAT: 0.95,    // Potential security threat
  };
  
  // Pattern tracking for anomaly detection
  private userPatterns: Map<string, any> = new Map();
  private systemMetrics = {
    averageMessageLength: 150,
    averageResponseTime: 30000,
    typicalSessionDuration: 1800000, // 30 minutes
  };
  
  private constructor() {
    console.log('🔍 Anomaly Detector initialized');
  }
  
  static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector();
    }
    return AnomalyDetector.instance;
  }
  
  /**
   * Check for anomalies in content and context
   * TARGET: <100ms detection time
   */
  async checkForAnomalies(
    content: string,
    context: DetectionContext
  ): Promise<AnomalyDetectionResult> {
    const startTime = performance.now();
    
    try {
      const anomalies: string[] = [];
      let riskScore = 0;
      
      // Check for rapid messaging anomaly
      const rapidMessagingRisk = this.detectRapidMessaging(context);
      if (rapidMessagingRisk > this.ANOMALY_THRESHOLDS.RAPID_MESSAGING) {
        anomalies.push('RAPID_MESSAGING');
        riskScore = Math.max(riskScore, rapidMessagingRisk);
      }
      
      // Check for bot-like behavior
      const botRisk = this.detectBotBehavior(content, context);
      if (botRisk > this.ANOMALY_THRESHOLDS.POTENTIAL_BOT) {
        anomalies.push('POTENTIAL_BOT');
        riskScore = Math.max(riskScore, botRisk);
      }
      
      // Check for unusual patterns
      const patternRisk = this.detectUnusualPatterns(content, context);
      if (patternRisk > this.ANOMALY_THRESHOLDS.UNUSUAL_PATTERNS) {
        anomalies.push('UNUSUAL_PATTERNS');
        riskScore = Math.max(riskScore, patternRisk);
      }
      
      // Check for system abuse
      const abuseRisk = this.detectSystemAbuse(content, context);
      if (abuseRisk > this.ANOMALY_THRESHOLDS.SYSTEM_ABUSE) {
        anomalies.push('SYSTEM_ABUSE');
        riskScore = Math.max(riskScore, abuseRisk);
      }
      
      // Check for security threats
      const securityRisk = this.detectSecurityThreats(content, context);
      if (securityRisk > this.ANOMALY_THRESHOLDS.SECURITY_THREAT) {
        anomalies.push('SECURITY_THREAT');
        riskScore = Math.max(riskScore, securityRisk);
      }
      
      // Determine severity and recommended action
      const severity = this.calculateSeverity(riskScore);
      const recommendedAction = this.determineAction(anomalies, severity);
      const confidence = this.calculateConfidence(anomalies, content);
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 100) {
        console.warn(`⚠️ Anomaly detection took ${executionTime.toFixed(2)}ms (target: <100ms)`);
      }
      
      if (anomalies.length > 0) {
        console.log(`🚨 Anomalies detected: ${anomalies.join(', ')} (risk: ${(riskScore * 100).toFixed(1)}%)`);
      }
      
      return {
        riskScore,
        anomalies,
        severity,
        recommendedAction,
        confidence,
      };
      
    } catch (error) {
      console.error('❌ Anomaly detection failed:', error);
      
      return {
        riskScore: 0.5,
        anomalies: ['DETECTION_ERROR'],
        severity: 'MEDIUM',
        recommendedAction: 'MANUAL_REVIEW',
        confidence: 0,
      };
    }
  }
  
  // Private detection methods
  
  private detectRapidMessaging(context: DetectionContext): number {
    if (!context.userId) return 0;
    
    const userPattern = this.userPatterns.get(context.userId) || {
      messageCount: 0,
      lastMessageTime: 0,
      messageTimes: [],
    };
    
    const now = Date.now();
    const timeSinceLastMessage = now - userPattern.lastMessageTime;
    
    // Add current message time
    userPattern.messageTimes.push(now);
    userPattern.messageCount++;
    userPattern.lastMessageTime = now;
    
    // Keep only last 10 minutes of messages
    userPattern.messageTimes = userPattern.messageTimes.filter(
      (time: number) => now - time < 600000
    );
    
    // Update pattern
    this.userPatterns.set(context.userId, userPattern);
    
    // Calculate risk based on message frequency
    const messagesInLastMinute = userPattern.messageTimes.filter(
      (time: number) => now - time < 60000
    ).length;
    
    // Risk increases with frequency (>10 messages/minute = high risk)
    return Math.min(messagesInLastMinute / 10, 1);
  }
  
  private detectBotBehavior(content: string, context: DetectionContext): number {
    let botScore = 0;
    
    // Check for bot-like characteristics
    
    // 1. Perfect grammar/spelling (unusual in crisis context)
    const hasTypos = /\b(teh|recieve|seperate|definately)\b/gi.test(content);
    if (!hasTypos && content.length > 50) {
      botScore += 0.2;
    }
    
    // 2. Repetitive structure
    const sentences = content.split(/[.!?]+/);
    if (sentences.length > 2) {
      const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
      const lengthVariance = sentences.reduce((sum, s) => sum + Math.abs(s.length - avgLength), 0) / sentences.length;
      
      if (lengthVariance < 10) { // Very consistent sentence lengths
        botScore += 0.3;
      }
    }
    
    // 3. Unusual timing patterns
    if (context.userId) {
      const userPattern = this.userPatterns.get(context.userId);
      if (userPattern && userPattern.messageTimes.length > 3) {
        const intervals = [];
        for (let i = 1; i < userPattern.messageTimes.length; i++) {
          intervals.push(userPattern.messageTimes[i] - userPattern.messageTimes[i - 1]);
        }
        
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, interval) => sum + Math.abs(interval - avgInterval), 0) / intervals.length;
        
        // Very consistent timing = bot-like
        if (intervalVariance < 5000) { // Less than 5 second variance
          botScore += 0.3;
        }
      }
    }
    
    // 4. Generic/template responses
    const genericPhrases = [
      'thank you for your message',
      'i understand your concern',
      'please contact support',
      'we appreciate your feedback',
    ];
    
    const hasGenericPhrases = genericPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    );
    
    if (hasGenericPhrases) {
      botScore += 0.2;
    }
    
    return Math.min(botScore, 1);
  }
  
  private detectUnusualPatterns(content: string, context: DetectionContext): number {
    let patternScore = 0;
    
    // Check message length anomalies
    const lengthDeviation = Math.abs(content.length - this.systemMetrics.averageMessageLength) / 
                           this.systemMetrics.averageMessageLength;
    
    if (lengthDeviation > 3) { // More than 3x average length
      patternScore += 0.3;
    }
    
    // Check for unusual character patterns
    const specialCharRatio = (content.match(/[^a-zA-Z0-9\s.,!?]/g) || []).length / content.length;
    if (specialCharRatio > 0.1) { // >10% special characters
      patternScore += 0.2;
    }
    
    // Check for copy-paste indicators
    if (content.includes('\t') || content.includes('  ')) { // Multiple spaces/tabs
      patternScore += 0.1;
    }
    
    // Check for URL/link patterns (potential spam)
    if (/https?:\/\/|www\.|\.com|\.org/gi.test(content)) {
      patternScore += 0.4;
    }
    
    return Math.min(patternScore, 1);
  }
  
  private detectSystemAbuse(content: string, context: DetectionContext): number {
    let abuseScore = 0;
    
    // Check for attempts to manipulate the system
    const systemManipulation = [
      /\b(admin|administrator|root|system)\b/gi,
      /\b(hack|exploit|bypass|override)\b/gi,
      /\b(sql|script|code|inject)\b/gi,
    ];
    
    for (const pattern of systemManipulation) {
      if (pattern.test(content)) {
        abuseScore += 0.3;
      }
    }
    
    // Check for attempts to gather information
    const informationGathering = [
      /\b(database|server|api|endpoint)\b/gi,
      /\b(password|token|key|secret)\b/gi,
      /\b(volunteer|staff|employee) (name|contact|info)/gi,
    ];
    
    for (const pattern of informationGathering) {
      if (pattern.test(content)) {
        abuseScore += 0.4;
      }
    }
    
    return Math.min(abuseScore, 1);
  }
  
  private detectSecurityThreats(content: string, context: DetectionContext): number {
    let threatScore = 0;
    
    // Check for malicious patterns
    const maliciousPatterns = [
      /<script|javascript:|data:/gi,
      /\b(xss|csrf|injection|payload)\b/gi,
      /\b(malware|virus|trojan|phishing)\b/gi,
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        threatScore += 0.5;
      }
    }
    
    // Check for social engineering attempts
    const socialEngineering = [
      /\b(urgent|immediate|verify|confirm|update) (account|password|information)\b/gi,
      /\b(click here|download|install|run)\b/gi,
      /\b(prize|winner|congratulations|selected)\b/gi,
    ];
    
    for (const pattern of socialEngineering) {
      if (pattern.test(content)) {
        threatScore += 0.3;
      }
    }
    
    return Math.min(threatScore, 1);
  }
  
  private calculateSeverity(riskScore: number): AnomalyDetectionResult['severity'] {
    if (riskScore >= 0.9) return 'CRITICAL';
    if (riskScore >= 0.7) return 'HIGH';
    if (riskScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }
  
  private determineAction(anomalies: string[], severity: AnomalyDetectionResult['severity']): string {
    if (anomalies.includes('SECURITY_THREAT')) {
      return 'IMMEDIATE_BLOCK';
    }
    
    if (anomalies.includes('SYSTEM_ABUSE')) {
      return 'ESCALATE_TO_SECURITY';
    }
    
    if (severity === 'CRITICAL') {
      return 'IMMEDIATE_REVIEW';
    }
    
    if (severity === 'HIGH') {
      return 'PRIORITY_REVIEW';
    }
    
    if (anomalies.length > 0) {
      return 'MONITOR_CLOSELY';
    }
    
    return 'NO_ACTION';
  }
  
  private calculateConfidence(anomalies: string[], content: string): number {
    // Base confidence
    let confidence = 0.5;
    
    // Higher confidence with multiple anomalies
    if (anomalies.length > 1) {
      confidence += 0.2;
    }
    
    // Higher confidence with specific threat patterns
    if (anomalies.includes('SECURITY_THREAT') || anomalies.includes('SYSTEM_ABUSE')) {
      confidence += 0.3;
    }
    
    // Lower confidence with very short content
    if (content.length < 20) {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Update system metrics for better anomaly detection
   */
  updateSystemMetrics(metrics: {
    averageMessageLength?: number;
    averageResponseTime?: number;
    typicalSessionDuration?: number;
  }): void {
    if (metrics.averageMessageLength) {
      this.systemMetrics.averageMessageLength = metrics.averageMessageLength;
    }
    if (metrics.averageResponseTime) {
      this.systemMetrics.averageResponseTime = metrics.averageResponseTime;
    }
    if (metrics.typicalSessionDuration) {
      this.systemMetrics.typicalSessionDuration = metrics.typicalSessionDuration;
    }
    
    console.log('📊 System metrics updated for anomaly detection');
  }
  
  /**
   * Get anomaly detection statistics
   */
  getDetectionStats() {
    return {
      trackedUsers: this.userPatterns.size,
      systemMetrics: this.systemMetrics,
      thresholds: this.ANOMALY_THRESHOLDS,
      lastUpdated: new Date(),
    };
  }
  
  /**
   * Clear old user patterns to prevent memory leaks
   */
  cleanupOldPatterns(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [userId, pattern] of this.userPatterns.entries()) {
      if (now - pattern.lastActivity > maxAge) {
        this.userPatterns.delete(userId);
      }
    }
    
    console.log(`🧹 Cleaned up old user patterns: ${this.userPatterns.size} active users`);
  }
}