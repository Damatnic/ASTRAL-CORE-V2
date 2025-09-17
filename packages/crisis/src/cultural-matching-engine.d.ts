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
import { CrisisProfile, VolunteerProfile } from './types';
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
export declare class CulturalMatcher {
    private culturalPatterns;
    private languageMap;
    private culturalCompatibilityCache;
    constructor();
    /**
     * Primary cultural matching function
     */
    matchCulturalCompatibility(crisis: CrisisProfile, volunteers: VolunteerProfile[]): Promise<CulturalMatch[]>;
    /**
     * Calculate detailed cultural match
     */
    private calculateCulturalMatch;
    private checkLanguageCompatibility;
    private assessReligiousCompatibility;
    private determineCommunicationStyle;
    private calculateOverallScore;
    private generateMatchReasoning;
    private identifyRiskFactors;
    private initializeCulturalPatterns;
    private initializeLanguageMappings;
}
//# sourceMappingURL=cultural-matching-engine.d.ts.map