/**
 * ASTRAL_CORE 2.0 Burnout Prevention System
 * Monitors volunteer wellness and prevents burnout through proactive intervention
 */

import { 
  updateVolunteerStatus, 
  recordVolunteerSession 
} from '../../../database/src/utils/volunteer';

export interface BurnoutRiskFactors {
  sessionCount: number;
  averageSessionDuration: number;
  consecutiveDays: number;
  highStressSessions: number;
  lastBreakDays: number;
  selfReportedStress: number; // 1-10 scale
  responseTime: number; // average response time in ms
  escalationRate: number; // percentage of sessions escalated
}

export interface WellnessMetrics {
  volunteerId: string;
  timestamp: Date;
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  satisfactionLevel: number; // 1-10
  workloadRating: number; // 1-10
  supportNeeded: boolean;
  notes?: string;
}

export interface BurnoutAlert {
  volunteerId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  timestamp: Date;
  actionRequired: boolean;
}

export interface WellnessIntervention {
  type: 'break_reminder' | 'workload_reduction' | 'peer_support' | 'professional_referral' | 'mandatory_break';
  duration?: number; // hours for breaks
  message: string;
  followUpRequired: boolean;
}

export class BurnoutPreventionSystem {
  private riskThresholds = {
    sessionCount: { medium: 15, high: 25, critical: 35 }, // per week
    averageSessionDuration: { medium: 45, high: 60, critical: 90 }, // minutes
    consecutiveDays: { medium: 5, high: 7, critical: 10 },
    highStressSessions: { medium: 30, high: 50, critical: 70 }, // percentage
    lastBreakDays: { medium: 3, high: 5, critical: 7 },
    selfReportedStress: { medium: 6, high: 8, critical: 9 },
    responseTime: { medium: 300, high: 600, critical: 1000 }, // ms
    escalationRate: { medium: 20, high: 35, critical: 50 } // percentage
  };

  private wellnessData: Map<string, WellnessMetrics[]> = new Map();
  private activeAlerts: Map<string, BurnoutAlert[]> = new Map();
  private interventionHistory: Map<string, WellnessIntervention[]> = new Map();

  /**
   * Assess burnout risk for a volunteer
   */
  async assessBurnoutRisk(volunteerId: string, factors: BurnoutRiskFactors): Promise<BurnoutAlert> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Evaluate each risk factor
    Object.entries(factors).forEach(([factor, value]) => {
      if (factor in this.riskThresholds) {
        const thresholds = this.riskThresholds[factor as keyof typeof this.riskThresholds];
        
        if (value >= thresholds.critical) {
          riskFactors.push(`Critical ${factor}: ${value}`);
          riskScore += 4;
        } else if (value >= thresholds.high) {
          riskFactors.push(`High ${factor}: ${value}`);
          riskScore += 3;
        } else if (value >= thresholds.medium) {
          riskFactors.push(`Medium ${factor}: ${value}`);
          riskScore += 2;
        }
      }
    });

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 12) riskLevel = 'critical';
    else if (riskScore >= 8) riskLevel = 'high';
    else if (riskScore >= 4) riskLevel = 'medium';
    else riskLevel = 'low';

    const recommendations = this.generateRecommendations(riskLevel, riskFactors);
    
    const alert: BurnoutAlert = {
      volunteerId,
      riskLevel,
      factors: riskFactors,
      recommendations,
      timestamp: new Date(),
      actionRequired: riskLevel === 'high' || riskLevel === 'critical'
    };

    // Store alert
    const alerts = this.activeAlerts.get(volunteerId) || [];
    alerts.push(alert);
    this.activeAlerts.set(volunteerId, alerts);

    // Trigger intervention if needed
    if (alert.actionRequired && riskLevel !== 'low') {
      await this.triggerIntervention(volunteerId, riskLevel as 'medium' | 'high' | 'critical');
    }

    return alert;
  }

  /**
   * Record wellness check-in from volunteer
   */
  async recordWellnessCheckIn(volunteerId: string, metrics: Omit<WellnessMetrics, 'volunteerId' | 'timestamp'>): Promise<void> {
    const wellnessEntry: WellnessMetrics = {
      volunteerId,
      timestamp: new Date(),
      ...metrics
    };

    const history = this.wellnessData.get(volunteerId) || [];
    history.push(wellnessEntry);
    
    // Keep only last 30 entries
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }
    
    this.wellnessData.set(volunteerId, history);

    // Check for concerning patterns
    await this.analyzeWellnessTrends(volunteerId);
  }

  /**
   * Analyze wellness trends for early warning signs
   */
  private async analyzeWellnessTrends(volunteerId: string): Promise<void> {
    const history = this.wellnessData.get(volunteerId) || [];
    if (history.length < 3) return; // Need at least 3 data points

    const recent = history.slice(-7); // Last 7 entries
    const avgStress = recent.reduce((sum, entry) => sum + entry.stressLevel, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, entry) => sum + entry.energyLevel, 0) / recent.length;
    const avgSatisfaction = recent.reduce((sum, entry) => sum + entry.satisfactionLevel, 0) / recent.length;

    // Detect concerning trends
    const concerns: string[] = [];
    if (avgStress >= 7) concerns.push('High stress levels');
    if (avgEnergy <= 4) concerns.push('Low energy levels');
    if (avgSatisfaction <= 5) concerns.push('Low satisfaction');

    const supportRequests = recent.filter(entry => entry.supportNeeded).length;
    if (supportRequests >= 3) concerns.push('Frequent support requests');

    if (concerns.length >= 2) {
      await this.triggerIntervention(volunteerId, 'medium');
    }
  }

  /**
   * Trigger appropriate intervention based on risk level
   */
  private async triggerIntervention(volunteerId: string, riskLevel: 'medium' | 'high' | 'critical'): Promise<void> {
    let intervention: WellnessIntervention;

    switch (riskLevel) {
      case 'medium':
        intervention = {
          type: 'break_reminder',
          duration: 4,
          message: 'You\'ve been doing great work! Consider taking a 4-hour break to recharge.',
          followUpRequired: false
        };
        break;

      case 'high':
        intervention = {
          type: 'workload_reduction',
          duration: 24,
          message: 'We\'ve noticed you might be experiencing high stress. We\'re temporarily reducing your session load and recommend a 24-hour break.',
          followUpRequired: true
        };
        // Temporarily reduce volunteer availability
        await this.reduceVolunteerLoad(volunteerId, 0.5); // 50% reduction
        break;

      case 'critical':
        intervention = {
          type: 'mandatory_break',
          duration: 72,
          message: 'For your wellbeing, we\'re requiring a 72-hour break. Please reach out to our volunteer support team.',
          followUpRequired: true
        };
        // Temporarily deactivate volunteer
        await updateVolunteerStatus(volunteerId, 'BREAK');
        break;
    }

    // Record intervention
    const interventions = this.interventionHistory.get(volunteerId) || [];
    interventions.push(intervention);
    this.interventionHistory.set(volunteerId, interventions);

    // Log intervention session
    await recordVolunteerSession({
      volunteerId,
      sessionType: 'WELLNESS_INTERVENTION'
    });

    console.log(`Wellness intervention triggered for volunteer ${volunteerId}: ${intervention.type}`);
  }

  /**
   * Reduce volunteer's maximum concurrent sessions
   */
  private async reduceVolunteerLoad(volunteerId: string, reductionFactor: number): Promise<void> {
    // This would typically update the volunteer's maxConcurrent field in the database
    // For now, we'll just log the action
    console.log(`Reducing volunteer ${volunteerId} load by ${(1 - reductionFactor) * 100}%`);
  }

  /**
   * Generate personalized recommendations based on risk factors
   */
  private generateRecommendations(riskLevel: string, riskFactors: string[]): string[] {
    const recommendations: string[] = [];

    if (riskFactors.some(factor => factor.includes('sessionCount'))) {
      recommendations.push('Consider reducing the number of sessions per week');
      recommendations.push('Take regular breaks between sessions');
    }

    if (riskFactors.some(factor => factor.includes('averageSessionDuration'))) {
      recommendations.push('Try to keep sessions under 45 minutes when possible');
      recommendations.push('Use session handoff techniques for longer cases');
    }

    if (riskFactors.some(factor => factor.includes('consecutiveDays'))) {
      recommendations.push('Take at least one full day off per week');
      recommendations.push('Consider a longer break period');
    }

    if (riskFactors.some(factor => factor.includes('selfReportedStress'))) {
      recommendations.push('Practice stress management techniques');
      recommendations.push('Consider speaking with a peer support volunteer');
      recommendations.push('Review self-care strategies');
    }

    if (riskFactors.some(factor => factor.includes('escalationRate'))) {
      recommendations.push('Review crisis intervention techniques');
      recommendations.push('Consider additional training modules');
      recommendations.push('Don\'t hesitate to escalate when needed');
    }

    // Add general recommendations based on risk level
    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Reach out to volunteer support team');
      recommendations.push('Consider temporary reduction in volunteer activities');
    }

    return recommendations;
  }

  /**
   * Get wellness summary for a volunteer
   */
  getWellnessSummary(volunteerId: string): {
    currentRiskLevel: string;
    recentMetrics: WellnessMetrics[];
    activeAlerts: BurnoutAlert[];
    interventionHistory: WellnessIntervention[];
  } {
    const recentMetrics = this.wellnessData.get(volunteerId) || [];
    const activeAlerts = this.activeAlerts.get(volunteerId) || [];
    const interventionHistory = this.interventionHistory.get(volunteerId) || [];
    
    const currentRiskLevel = activeAlerts.length > 0 
      ? activeAlerts[activeAlerts.length - 1].riskLevel 
      : 'low';

    return {
      currentRiskLevel,
      recentMetrics: recentMetrics.slice(-7), // Last 7 entries
      activeAlerts: activeAlerts.filter(alert => 
        Date.now() - alert.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      ),
      interventionHistory: interventionHistory.slice(-5) // Last 5 interventions
    };
  }

  /**
   * Schedule wellness check-in reminder
   */
  async scheduleWellnessCheckIn(volunteerId: string): Promise<void> {
    // This would typically integrate with a notification system
    console.log(`Wellness check-in scheduled for volunteer ${volunteerId}`);
  }

  /**
   * Generate system-wide burnout analytics
   */
  generateBurnoutAnalytics(): {
    totalVolunteers: number;
    riskDistribution: Record<string, number>;
    interventionStats: Record<string, number>;
    averageWellnessScores: {
      stress: number;
      energy: number;
      satisfaction: number;
      workload: number;
    };
  } {
    const analytics = {
      totalVolunteers: this.wellnessData.size,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      interventionStats: {
        break_reminder: 0,
        workload_reduction: 0,
        peer_support: 0,
        professional_referral: 0,
        mandatory_break: 0
      },
      averageWellnessScores: {
        stress: 0,
        energy: 0,
        satisfaction: 0,
        workload: 0
      }
    };

    // Calculate risk distribution
    for (const volunteerId of this.wellnessData.keys()) {
      const summary = this.getWellnessSummary(volunteerId);
      const riskLevel = summary.currentRiskLevel as keyof typeof analytics.riskDistribution;
      if (riskLevel in analytics.riskDistribution) {
        analytics.riskDistribution[riskLevel]++;
      }
    }

    // Calculate intervention statistics
    for (const interventions of this.interventionHistory.values()) {
      interventions.forEach(intervention => {
        if (intervention.type in analytics.interventionStats) {
          analytics.interventionStats[intervention.type]++;
        }
      });
    }

    // Calculate average wellness scores
    let totalEntries = 0;
    let stressSum = 0, energySum = 0, satisfactionSum = 0, workloadSum = 0;

    for (const metrics of this.wellnessData.values()) {
      metrics.forEach(entry => {
        totalEntries++;
        stressSum += entry.stressLevel;
        energySum += entry.energyLevel;
        satisfactionSum += entry.satisfactionLevel;
        workloadSum += entry.workloadRating;
      });
    }

    if (totalEntries > 0) {
      analytics.averageWellnessScores = {
        stress: stressSum / totalEntries,
        energy: energySum / totalEntries,
        satisfaction: satisfactionSum / totalEntries,
        workload: workloadSum / totalEntries
      };
    }

    return analytics;
  }

  /**
   * Clear resolved alerts
   */
  clearResolvedAlerts(volunteerId: string): void {
    const alerts = this.activeAlerts.get(volunteerId) || [];
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const activeAlerts = alerts.filter(alert => 
      alert.timestamp.getTime() > cutoffTime && 
      (alert.riskLevel === 'high' || alert.riskLevel === 'critical')
    );
    
    this.activeAlerts.set(volunteerId, activeAlerts);
  }

  /**
   * Get volunteers at risk
   */
  getVolunteersAtRisk(): { volunteerId: string; riskLevel: string; lastAlert: Date }[] {
    const atRisk: { volunteerId: string; riskLevel: string; lastAlert: Date }[] = [];

    for (const [volunteerId, alerts] of this.activeAlerts.entries()) {
      const recentAlerts = alerts.filter(alert => 
        Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      );

      if (recentAlerts.length > 0) {
        const latestAlert = recentAlerts[recentAlerts.length - 1];
        if (latestAlert.riskLevel === 'high' || latestAlert.riskLevel === 'critical') {
          atRisk.push({
            volunteerId,
            riskLevel: latestAlert.riskLevel,
            lastAlert: latestAlert.timestamp
          });
        }
      }
    }

    return atRisk.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return riskOrder[b.riskLevel as keyof typeof riskOrder] - riskOrder[a.riskLevel as keyof typeof riskOrder];
    });
  }

  /**
   * Provide peer support matching for stressed volunteers
   */
  async providePeerSupport(volunteerId: string): Promise<{ success: boolean; supportVolunteerId?: string }> {
    try {
      // Find a suitable peer support volunteer
      // This would typically query the database for volunteers with peer support training
      // For now, we'll simulate the process
      
      const intervention: WellnessIntervention = {
        type: 'peer_support',
        message: 'We\'ve connected you with a peer support volunteer who can provide guidance and emotional support.',
        followUpRequired: true
      };

      const interventions = this.interventionHistory.get(volunteerId) || [];
      interventions.push(intervention);
      this.interventionHistory.set(volunteerId, interventions);

      await recordVolunteerSession({
        volunteerId,
        sessionType: 'PEER_SUPPORT'
      });

      return { success: true, supportVolunteerId: 'peer-volunteer-id' };
    } catch (error) {
      console.error('Error providing peer support:', error);
      return { success: false };
    }
  }

  /**
   * Generate wellness report for volunteer
   */
  generateWellnessReport(volunteerId: string): {
    overallWellness: 'excellent' | 'good' | 'concerning' | 'critical';
    trends: {
      stress: 'improving' | 'stable' | 'worsening';
      energy: 'improving' | 'stable' | 'worsening';
      satisfaction: 'improving' | 'stable' | 'worsening';
    };
    recommendations: string[];
    nextCheckIn: Date;
  } {
    const history = this.wellnessData.get(volunteerId) || [];
    const recent = history.slice(-7);
    
    if (recent.length === 0) {
      return {
        overallWellness: 'good',
        trends: { stress: 'stable', energy: 'stable', satisfaction: 'stable' },
        recommendations: ['Complete your first wellness check-in'],
        nextCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    }

    // Calculate averages
    const avgStress = recent.reduce((sum, entry) => sum + entry.stressLevel, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, entry) => sum + entry.energyLevel, 0) / recent.length;
    const avgSatisfaction = recent.reduce((sum, entry) => sum + entry.satisfactionLevel, 0) / recent.length;

    // Determine overall wellness
    let overallWellness: 'excellent' | 'good' | 'concerning' | 'critical';
    if (avgStress <= 4 && avgEnergy >= 7 && avgSatisfaction >= 7) overallWellness = 'excellent';
    else if (avgStress <= 6 && avgEnergy >= 5 && avgSatisfaction >= 6) overallWellness = 'good';
    else if (avgStress <= 8 && avgEnergy >= 3 && avgSatisfaction >= 4) overallWellness = 'concerning';
    else overallWellness = 'critical';

    // Calculate trends
    const trends = this.calculateTrends(recent);

    // Generate recommendations
    const recommendations = this.generateWellnessRecommendations(avgStress, avgEnergy, avgSatisfaction, trends);

    return {
      overallWellness,
      trends,
      recommendations,
      nextCheckIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };
  }

  /**
   * Calculate trends from wellness data
   */
  private calculateTrends(data: WellnessMetrics[]): {
    stress: 'improving' | 'stable' | 'worsening';
    energy: 'improving' | 'stable' | 'worsening';
    satisfaction: 'improving' | 'stable' | 'worsening';
  } {
    if (data.length < 3) {
      return { stress: 'stable', energy: 'stable', satisfaction: 'stable' };
    }

    const first = data.slice(0, Math.floor(data.length / 2));
    const second = data.slice(Math.floor(data.length / 2));

    const firstAvg = {
      stress: first.reduce((sum, entry) => sum + entry.stressLevel, 0) / first.length,
      energy: first.reduce((sum, entry) => sum + entry.energyLevel, 0) / first.length,
      satisfaction: first.reduce((sum, entry) => sum + entry.satisfactionLevel, 0) / first.length
    };

    const secondAvg = {
      stress: second.reduce((sum, entry) => sum + entry.stressLevel, 0) / second.length,
      energy: second.reduce((sum, entry) => sum + entry.energyLevel, 0) / second.length,
      satisfaction: second.reduce((sum, entry) => sum + entry.satisfactionLevel, 0) / second.length
    };

    return {
      stress: secondAvg.stress < firstAvg.stress - 0.5 ? 'improving' : 
              secondAvg.stress > firstAvg.stress + 0.5 ? 'worsening' : 'stable',
      energy: secondAvg.energy > firstAvg.energy + 0.5 ? 'improving' : 
              secondAvg.energy < firstAvg.energy - 0.5 ? 'worsening' : 'stable',
      satisfaction: secondAvg.satisfaction > firstAvg.satisfaction + 0.5 ? 'improving' : 
                   secondAvg.satisfaction < firstAvg.satisfaction - 0.5 ? 'worsening' : 'stable'
    };
  }

  /**
   * Generate wellness recommendations
   */
  private generateWellnessRecommendations(
    avgStress: number, 
    avgEnergy: number, 
    avgSatisfaction: number,
    trends: any
  ): string[] {
    const recommendations: string[] = [];

    if (avgStress > 6) {
      recommendations.push('Practice stress reduction techniques (deep breathing, meditation)');
      recommendations.push('Consider shorter volunteer sessions');
    }

    if (avgEnergy < 5) {
      recommendations.push('Ensure adequate sleep and rest between sessions');
      recommendations.push('Take regular breaks during volunteer work');
    }

    if (avgSatisfaction < 6) {
      recommendations.push('Reflect on what aspects of volunteering bring you joy');
      recommendations.push('Consider trying different types of volunteer activities');
    }

    if (trends.stress === 'worsening') {
      recommendations.push('Monitor stress levels closely and consider reducing workload');
    }

    if (trends.energy === 'worsening') {
      recommendations.push('Focus on energy management and self-care practices');
    }

    if (trends.satisfaction === 'worsening') {
      recommendations.push('Discuss concerns with volunteer coordinator');
    }

    return recommendations;
  }
}