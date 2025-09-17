/**
 * ASTRAL_CORE 2.0 Tether Matching System
 * AI-powered compatibility matching for optimal peer support connections
 */

import type { TetherPreferences, CompatibilityResult } from '../types/tether.types';

export interface UserProfile {
  id: string;
  age?: number;
  timezone: string;
  languages: string[];
  interests: string[];
  supportTopics: string[];
  communicationStyle: 'text' | 'voice' | 'video' | 'mixed';
  availabilityHours: { start: number; end: number };
  experienceLevel: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  specializations: string[];
  personalityTraits?: string[];
  triggerWarnings?: string[];
}

export interface MatchingCriteria {
  seekerProfile: UserProfile;
  supporterProfile: UserProfile;
  preferences?: TetherPreferences;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requireSpecialization?: string[];
}

export class TetherMatchingSystem {
  private compatibilityWeights = {
    timezone: 0.15,
    language: 0.20,
    interests: 0.15,
    supportTopics: 0.25,
    communicationStyle: 0.10,
    availability: 0.10,
    experience: 0.05
  };

  /**
   * Calculate compatibility score between seeker and supporter
   */
  async calculateCompatibility(
    seekerId: string,
    supporterId: string,
    preferences?: TetherPreferences
  ): Promise<CompatibilityResult> {
    try {
      // In a real implementation, this would fetch user profiles from database
      // For now, we'll simulate the compatibility calculation
      
      const seekerProfile = await this.getUserProfile(seekerId);
      const supporterProfile = await this.getUserProfile(supporterId);

      const criteria: MatchingCriteria = {
        seekerProfile,
        supporterProfile,
        preferences
      };

      return this.computeCompatibilityScore(criteria);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return {
        score: 0,
        sharedInterests: [],
        sharedLanguages: [],
        timezoneCompatibility: 0,
        communicationStyleMatch: 0,
        supportTopicOverlap: 0,
        factors: {
          personality: 0,
          availability: 0,
          experience: 0,
          specialization: 0
        }
      };
    }
  }

  /**
   * Find best matching supporters for a seeker
   */
  async findBestMatches(
    seekerId: string,
    availableSupporters: string[],
    preferences?: TetherPreferences,
    limit: number = 5
  ): Promise<{ supporterId: string; compatibility: CompatibilityResult }[]> {
    const matches: { supporterId: string; compatibility: CompatibilityResult }[] = [];

    for (const supporterId of availableSupporters) {
      const compatibility = await this.calculateCompatibility(seekerId, supporterId, preferences);
      matches.push({ supporterId, compatibility });
    }

    // Sort by compatibility score and return top matches
    return matches
      .sort((a, b) => b.compatibility.score - a.compatibility.score)
      .slice(0, limit);
  }

  /**
   * Compute detailed compatibility score
   */
  private computeCompatibilityScore(criteria: MatchingCriteria): CompatibilityResult {
    const { seekerProfile, supporterProfile, preferences } = criteria;
    
    // Calculate individual compatibility factors
    const timezoneCompatibility = this.calculateTimezoneCompatibility(
      seekerProfile.timezone,
      supporterProfile.timezone
    );

    const languageCompatibility = this.calculateLanguageCompatibility(
      seekerProfile.languages,
      supporterProfile.languages
    );

    const interestCompatibility = this.calculateInterestCompatibility(
      seekerProfile.interests,
      supporterProfile.interests
    );

    const supportTopicCompatibility = this.calculateSupportTopicCompatibility(
      seekerProfile.supportTopics,
      supporterProfile.specializations
    );

    const communicationStyleCompatibility = this.calculateCommunicationStyleCompatibility(
      seekerProfile.communicationStyle,
      supporterProfile.communicationStyle,
      preferences?.communicationStyle
    );

    const availabilityCompatibility = this.calculateAvailabilityCompatibility(
      seekerProfile.availabilityHours,
      supporterProfile.availabilityHours
    );

    const experienceCompatibility = this.calculateExperienceCompatibility(
      supporterProfile.experienceLevel
    );

    // Calculate weighted overall score
    const overallScore = 
      timezoneCompatibility * this.compatibilityWeights.timezone +
      languageCompatibility * this.compatibilityWeights.language +
      interestCompatibility * this.compatibilityWeights.interests +
      supportTopicCompatibility * this.compatibilityWeights.supportTopics +
      communicationStyleCompatibility * this.compatibilityWeights.communicationStyle +
      availabilityCompatibility * this.compatibilityWeights.availability +
      experienceCompatibility * this.compatibilityWeights.experience;

    // Find shared elements
    const sharedLanguages = seekerProfile.languages.filter(lang => 
      supporterProfile.languages.includes(lang)
    );

    const sharedInterests = seekerProfile.interests.filter(interest => 
      supporterProfile.interests.includes(interest)
    );

    return {
      score: Math.round(overallScore * 100) / 100,
      sharedInterests,
      sharedLanguages,
      timezoneCompatibility,
      communicationStyleMatch: communicationStyleCompatibility,
      supportTopicOverlap: supportTopicCompatibility,
      factors: {
        personality: interestCompatibility,
        availability: availabilityCompatibility,
        experience: experienceCompatibility,
        specialization: supportTopicCompatibility
      }
    };
  }

  /**
   * Calculate timezone compatibility (0-1 scale)
   */
  private calculateTimezoneCompatibility(seekerTz: string, supporterTz: string): number {
    // Simplified timezone compatibility - in reality would use proper timezone library
    if (seekerTz === supporterTz) return 1.0;
    
    // Basic timezone offset calculation (simplified)
    const timezoneMap: Record<string, number> = {
      'UTC': 0, 'EST': -5, 'PST': -8, 'GMT': 0, 'CET': 1, 'JST': 9
    };
    
    const seekerOffset = timezoneMap[seekerTz] || 0;
    const supporterOffset = timezoneMap[supporterTz] || 0;
    const offsetDiff = Math.abs(seekerOffset - supporterOffset);
    
    // Perfect match within 3 hours, declining after that
    return Math.max(0, 1 - (offsetDiff / 12));
  }

  /**
   * Calculate language compatibility (0-1 scale)
   */
  private calculateLanguageCompatibility(seekerLangs: string[], supporterLangs: string[]): number {
    const sharedLanguages = seekerLangs.filter(lang => supporterLangs.includes(lang));
    
    if (sharedLanguages.length === 0) return 0;
    if (sharedLanguages.includes('en')) return 1.0; // English bonus
    
    return Math.min(sharedLanguages.length / seekerLangs.length, 1);
  }

  /**
   * Calculate interest compatibility (0-1 scale)
   */
  private calculateInterestCompatibility(seekerInterests: string[], supporterInterests: string[]): number {
    if (seekerInterests.length === 0 || supporterInterests.length === 0) return 0.5;
    
    const sharedInterests = seekerInterests.filter(interest => 
      supporterInterests.includes(interest)
    );
    
    return sharedInterests.length / Math.max(seekerInterests.length, supporterInterests.length);
  }

  /**
   * Calculate support topic compatibility (0-1 scale)
   */
  private calculateSupportTopicCompatibility(
    seekerTopics: string[], 
    supporterSpecializations: string[]
  ): number {
    if (seekerTopics.length === 0) return 0.8; // General support
    if (supporterSpecializations.length === 0) return 0.6; // No specializations
    
    const matchingTopics = seekerTopics.filter(topic => 
      supporterSpecializations.some(spec => 
        spec.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(spec.toLowerCase())
      )
    );
    
    return matchingTopics.length / seekerTopics.length;
  }

  /**
   * Calculate communication style compatibility (0-1 scale)
   */
  private calculateCommunicationStyleCompatibility(
    seekerStyle: string,
    supporterStyle: string,
    preferredStyle?: string
  ): number {
    const targetStyle = preferredStyle || seekerStyle;
    
    if (supporterStyle === 'mixed') return 0.9; // Mixed supporters are flexible
    if (targetStyle === supporterStyle) return 1.0;
    
    // Partial compatibility for related styles
    const styleCompatibility: Record<string, Record<string, number>> = {
      'text': { 'voice': 0.6, 'video': 0.4, 'mixed': 0.9 },
      'voice': { 'text': 0.6, 'video': 0.8, 'mixed': 0.9 },
      'video': { 'text': 0.4, 'voice': 0.8, 'mixed': 0.9 },
      'mixed': { 'text': 0.9, 'voice': 0.9, 'video': 0.9 }
    };
    
    return styleCompatibility[targetStyle]?.[supporterStyle] || 0.3;
  }

  /**
   * Calculate availability compatibility (0-1 scale)
   */
  private calculateAvailabilityCompatibility(
    seekerHours: { start: number; end: number },
    supporterHours: { start: number; end: number }
  ): number {
    // Calculate overlap in availability hours
    const overlapStart = Math.max(seekerHours.start, supporterHours.start);
    const overlapEnd = Math.min(seekerHours.end, supporterHours.end);
    
    if (overlapStart >= overlapEnd) return 0; // No overlap
    
    const overlapDuration = overlapEnd - overlapStart;
    const seekerDuration = seekerHours.end - seekerHours.start;
    
    return overlapDuration / seekerDuration;
  }

  /**
   * Calculate experience compatibility (0-1 scale)
   */
  private calculateExperienceCompatibility(supporterExperience: string): number {
    const experienceScores: Record<string, number> = {
      'expert': 1.0,
      'experienced': 0.9,
      'intermediate': 0.7,
      'beginner': 0.5
    };
    
    return experienceScores[supporterExperience] || 0.5;
  }

  /**
   * Get user profile (simulated - would fetch from database in real implementation)
   */
  private async getUserProfile(userId: string): Promise<UserProfile> {
    // This would typically fetch from the database
    // For now, return a simulated profile
    return {
      id: userId,
      timezone: 'UTC',
      languages: ['en'],
      interests: ['mental_health', 'wellness'],
      supportTopics: ['anxiety', 'depression', 'stress'],
      communicationStyle: 'mixed',
      availabilityHours: { start: 9, end: 17 },
      experienceLevel: 'intermediate',
      specializations: ['crisis_intervention', 'peer_support']
    };
  }

  /**
   * Validate match quality before creating tether
   */
  validateMatch(compatibility: CompatibilityResult): {
    isValid: boolean;
    concerns: string[];
    recommendations: string[];
  } {
    const concerns: string[] = [];
    const recommendations: string[] = [];

    if (compatibility.score < 0.5) {
      concerns.push('Low overall compatibility score');
      recommendations.push('Consider finding a better match');
    }

    if (compatibility.sharedLanguages.length === 0) {
      concerns.push('No shared languages');
      recommendations.push('Ensure language compatibility before proceeding');
    }

    if (compatibility.supportTopicOverlap < 0.3) {
      concerns.push('Limited support topic overlap');
      recommendations.push('Consider supporter with relevant specializations');
    }

    if (compatibility.timezoneCompatibility < 0.4) {
      concerns.push('Significant timezone difference');
      recommendations.push('Discuss availability expectations');
    }

    return {
      isValid: concerns.length === 0,
      concerns,
      recommendations
    };
  }

  /**
   * Generate matching analytics
   */
  generateMatchingAnalytics(): {
    totalMatches: number;
    averageCompatibilityScore: number;
    successfulTethers: number;
    matchingEfficiency: number;
    topCompatibilityFactors: string[];
  } {
    // This would analyze historical matching data
    // For now, return simulated analytics
    return {
      totalMatches: 0,
      averageCompatibilityScore: 0.75,
      successfulTethers: 0,
      matchingEfficiency: 0.85,
      topCompatibilityFactors: [
        'Support topic specialization',
        'Language compatibility',
        'Communication style match',
        'Timezone alignment',
        'Experience level'
      ]
    };
  }
}