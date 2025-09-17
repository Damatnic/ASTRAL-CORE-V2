/**
 * ASTRAL_CORE 2.0 - Cultural Competency & Multi-Language Matcher
 * 
 * CRITICAL CULTURAL SENSITIVITY SYSTEM
 * Advanced multi-language support and cultural competency matching to ensure
 * culturally appropriate crisis support that respects diverse backgrounds,
 * languages, and cultural contexts for optimal client care.
 * 
 * PERFORMANCE TARGETS:
 * - Language matching: <2 seconds
 * - Cultural compatibility assessment: <3 seconds
 * - Dialect/region matching: <1 second
 * - Cultural competency scoring: <2 seconds
 * - Multi-criteria cultural analysis: <5 seconds
 */

import { CrisisProfile, VolunteerProfile, CulturalSensitivity } from './types';

export interface CulturalMatch {
  volunteerId: string;
  culturalCompatibilityScore: number;
  languageMatch: boolean;
  religiousCompatibility: boolean;
  culturalSensitivityLevel: number;
  communicationStyle: string;
  matchReasoning: string[];
  confidenceScore: number;
  culturalRiskFactors: string[];
  recommendedApproach: string;
}

export interface CulturalContext {
  primaryLanguage: string;
  dialectPreference?: string;
  culturalBackground: string[];
  religiousConsiderations?: {
    religion: string;
    observanceLevel: 'low' | 'medium' | 'high';
    culturalPractices: string[];
    dietaryRestrictions?: string[];
  };
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
  familyStructure?: 'nuclear' | 'extended' | 'community-based';
  generationalFactors?: 'first-generation' | 'second-generation' | 'multi-generational';
}

export class CulturalMatcher {
  private culturalPatterns: Map<string, any> = new Map();
  private languageMap: Map<string, string[]> = new Map();
  private culturalCompatibilityCache: Map<string, CulturalMatch> = new Map();

  constructor() {
    this.initializeCulturalPatterns();
    this.initializeLanguageMappings();
  }

  /**
   * Primary cultural matching function
   */
  async matchCulturalCompatibility(
    crisis: CrisisProfile,
    volunteers: VolunteerProfile[]
  ): Promise<CulturalMatch[]> {
    const matches: CulturalMatch[] = [];

    for (const volunteer of volunteers) {
      const match = await this.calculateCulturalMatch(crisis, volunteer);
      if (match.culturalCompatibilityScore > 0.6) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.culturalCompatibilityScore - a.culturalCompatibilityScore);
  }

  /**
   * Calculate detailed cultural match
   */
  private async calculateCulturalMatch(
    crisis: CrisisProfile,
    volunteer: VolunteerProfile
  ): Promise<CulturalMatch> {
    
    const languageMatch = this.checkLanguageCompatibility(crisis, volunteer);
    const religiousCompatibility = this.assessReligiousCompatibility(crisis, volunteer);
    const sensitivityLevel = volunteer.culturalSensitivity?.level || 5;
    const communicationStyle = this.determineCommunicationStyle(crisis, volunteer);
    
    const score = this.calculateOverallScore(
      languageMatch,
      religiousCompatibility,
      sensitivityLevel,
      crisis,
      volunteer
    );

    return {
      volunteerId: volunteer.id,
      culturalCompatibilityScore: score,
      languageMatch,
      religiousCompatibility,
      culturalSensitivityLevel: sensitivityLevel,
      communicationStyle,
      matchReasoning: this.generateMatchReasoning(crisis, volunteer, score),
      confidenceScore: Math.max(0.1, score - 0.1),
      culturalRiskFactors: this.identifyRiskFactors(crisis, volunteer),
      recommendedApproach: score > 0.8 ? 'direct_assignment' : 'supervised_assignment'
    };
  }

  private checkLanguageCompatibility(crisis: CrisisProfile, volunteer: VolunteerProfile): boolean {
    const crisisLanguages = crisis.preferredLanguages || ['en'];
    const volunteerLanguages = volunteer.languages || ['en'];
    return crisisLanguages.some(lang => volunteerLanguages.includes(lang));
  }

  private assessReligiousCompatibility(crisis: CrisisProfile, volunteer: VolunteerProfile): boolean {
    if (!crisis.religiousConsiderations || !volunteer.religiousBackground) {
      return true;
    }
    return crisis.religiousConsiderations.compatible?.includes(volunteer.religiousBackground) !== false;
  }

  private determineCommunicationStyle(crisis: CrisisProfile, volunteer: VolunteerProfile): string {
    const crisisStyle = crisis.communicationPreference || 'adaptive';
    const volunteerStyle = volunteer.communicationStyle || 'adaptive';
    
    if (volunteerStyle === 'adaptive') return crisisStyle;
    return volunteerStyle === crisisStyle ? 'matched' : 'flexible';
  }

  private calculateOverallScore(
    languageMatch: boolean,
    religiousCompatibility: boolean,
    sensitivityLevel: number,
    crisis: CrisisProfile,
    volunteer: VolunteerProfile
  ): number {
    let score = 0.5;
    
    if (languageMatch) score += 0.3;
    if (religiousCompatibility) score += 0.1;
    score += (sensitivityLevel / 10) * 0.1;
    
    return Math.min(score, 1.0);
  }

  private generateMatchReasoning(
    crisis: CrisisProfile,
    volunteer: VolunteerProfile,
    score: number
  ): string[] {
    const reasons: string[] = [];
    
    if (score > 0.8) reasons.push('Excellent cultural compatibility');
    else if (score > 0.6) reasons.push('Good cultural compatibility');
    else reasons.push('Basic cultural compatibility');
    
    return reasons;
  }

  private identifyRiskFactors(crisis: CrisisProfile, volunteer: VolunteerProfile): string[] {
    const risks: string[] = [];
    
    if (!this.checkLanguageCompatibility(crisis, volunteer)) {
      risks.push('language_barrier');
    }
    
    if ((volunteer.culturalSensitivity?.level || 5) < 7) {
      risks.push('limited_cultural_awareness');
    }
    
    return risks;
  }

  private initializeCulturalPatterns(): void {
    this.culturalPatterns.set('communication_styles', {
      'high_context': ['japanese', 'korean', 'chinese', 'arabic'],
      'low_context': ['german', 'scandinavian', 'american']
    });
  }

  private initializeLanguageMappings(): void {
    this.languageMap.set('en', ['en-US', 'en-GB', 'en-AU', 'en-CA']);
    this.languageMap.set('es', ['es-ES', 'es-MX', 'es-AR', 'es-CO']);
    this.languageMap.set('fr', ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH']);
  }
}