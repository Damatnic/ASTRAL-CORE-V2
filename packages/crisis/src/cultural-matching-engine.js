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
export class CulturalMatcher {
    culturalPatterns = new Map();
    languageMap = new Map();
    culturalCompatibilityCache = new Map();
    constructor() {
        this.initializeCulturalPatterns();
        this.initializeLanguageMappings();
    }
    /**
     * Primary cultural matching function
     */
    async matchCulturalCompatibility(crisis, volunteers) {
        const matches = [];
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
    async calculateCulturalMatch(crisis, volunteer) {
        const languageMatch = this.checkLanguageCompatibility(crisis, volunteer);
        const religiousCompatibility = this.assessReligiousCompatibility(crisis, volunteer);
        const sensitivityLevel = volunteer.culturalSensitivity?.level || 5;
        const communicationStyle = this.determineCommunicationStyle(crisis, volunteer);
        const score = this.calculateOverallScore(languageMatch, religiousCompatibility, sensitivityLevel, crisis, volunteer);
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
    checkLanguageCompatibility(crisis, volunteer) {
        const crisisLanguages = crisis.preferredLanguages || ['en'];
        const volunteerLanguages = volunteer.languages || ['en'];
        return crisisLanguages.some(lang => volunteerLanguages.includes(lang));
    }
    assessReligiousCompatibility(crisis, volunteer) {
        if (!crisis.religiousConsiderations || !volunteer.religiousBackground) {
            return true;
        }
        return crisis.religiousConsiderations.compatible?.includes(volunteer.religiousBackground) !== false;
    }
    determineCommunicationStyle(crisis, volunteer) {
        const crisisStyle = crisis.communicationPreference || 'adaptive';
        const volunteerStyle = volunteer.communicationStyle || 'adaptive';
        if (volunteerStyle === 'adaptive')
            return crisisStyle;
        return volunteerStyle === crisisStyle ? 'matched' : 'flexible';
    }
    calculateOverallScore(languageMatch, religiousCompatibility, sensitivityLevel, crisis, volunteer) {
        let score = 0.5;
        if (languageMatch)
            score += 0.3;
        if (religiousCompatibility)
            score += 0.1;
        score += (sensitivityLevel / 10) * 0.1;
        return Math.min(score, 1.0);
    }
    generateMatchReasoning(crisis, volunteer, score) {
        const reasons = [];
        if (score > 0.8)
            reasons.push('Excellent cultural compatibility');
        else if (score > 0.6)
            reasons.push('Good cultural compatibility');
        else
            reasons.push('Basic cultural compatibility');
        return reasons;
    }
    identifyRiskFactors(crisis, volunteer) {
        const risks = [];
        if (!this.checkLanguageCompatibility(crisis, volunteer)) {
            risks.push('language_barrier');
        }
        if ((volunteer.culturalSensitivity?.level || 5) < 7) {
            risks.push('limited_cultural_awareness');
        }
        return risks;
    }
    initializeCulturalPatterns() {
        this.culturalPatterns.set('communication_styles', {
            'high_context': ['japanese', 'korean', 'chinese', 'arabic'],
            'low_context': ['german', 'scandinavian', 'american']
        });
    }
    initializeLanguageMappings() {
        this.languageMap.set('en', ['en-US', 'en-GB', 'en-AU', 'en-CA']);
        this.languageMap.set('es', ['es-ES', 'es-MX', 'es-AR', 'es-CO']);
        this.languageMap.set('fr', ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH']);
    }
}
//# sourceMappingURL=cultural-matching-engine.js.map