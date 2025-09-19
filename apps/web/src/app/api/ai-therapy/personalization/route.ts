import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// AI Personalization Engine API
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const personalization = await getPersonalizationProfile(userId)

    return NextResponse.json({
      profile: personalization,
      recommendations: generateRecommendations(personalization),
      adaptiveSettings: getAdaptiveSettings(personalization)
    })
  } catch (error) {
    console.error('Failed to fetch personalization:', error)
    return NextResponse.json({ error: 'Failed to fetch personalization' }, { status: 500 })
  }
}

// Update personalization preferences
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const data = await request.json()
    const { preferences, learningData, feedback } = data

    const updatedProfile = await updatePersonalizationProfile(userId, {
      preferences,
      learningData,
      feedback
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Personalization updated successfully'
    })
  } catch (error) {
    console.error('Failed to update personalization:', error)
    return NextResponse.json({ error: 'Failed to update personalization' }, { status: 500 })
  }
}

async function getPersonalizationProfile(userId: string) {
  // In production, this would fetch from database
  // For now, return a comprehensive personalization profile
  return {
    userId,
    preferences: {
      communicationStyle: {
        empathyLevel: 'high', // low, medium, high
        directness: 'balanced', // gentle, balanced, direct
        responseLength: 'medium', // short, medium, long
        complexity: 'moderate', // simple, moderate, complex
        tone: 'warm' // professional, warm, casual
      },
      therapeuticApproaches: {
        preferred: ['CBT', 'Mindfulness'],
        effective: ['CBT', 'Grounding'],
        avoided: ['Exposure Therapy'],
        curious: ['ACT', 'EMDR']
      },
      topics: {
        comfortable: ['anxiety', 'stress', 'relationships'],
        challenging: ['trauma', 'grief'],
        avoided: ['substance_use'],
        priority: ['anxiety', 'sleep']
      },
      sessionPreferences: {
        preferredLength: 30, // minutes
        preferredTime: 'evening',
        frequency: 'weekly',
        reminderStyle: 'gentle'
      },
      accessibility: {
        screenReaderCompatible: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        audioSupport: true
      },
      cultural: {
        background: null,
        religiousConsiderations: [],
        languagePreference: 'en',
        culturalSensitivity: true
      }
    },
    learning: {
      effectiveTechniques: [
        { technique: 'breathing_exercises', effectiveness: 0.92, usage: 23 },
        { technique: 'thought_record', effectiveness: 0.87, usage: 15 },
        { technique: 'grounding_54321', effectiveness: 0.83, usage: 31 },
        { technique: 'progressive_muscle_relaxation', effectiveness: 0.79, usage: 8 }
      ],
      patterns: {
        triggerPatterns: [
          { pattern: 'work_stress', frequency: 0.65, context: 'weekday_evenings' },
          { pattern: 'social_anxiety', frequency: 0.43, context: 'before_events' },
          { pattern: 'sleep_issues', frequency: 0.38, context: 'sunday_nights' }
        ],
        copingStrategies: [
          { strategy: 'breathing_exercises', success_rate: 0.89 },
          { strategy: 'journaling', success_rate: 0.76 },
          { strategy: 'physical_exercise', success_rate: 0.71 }
        ],
        moodPatterns: {
          weeklyTrend: 'improving',
          bestDays: ['saturday', 'sunday'],
          challengingDays: ['monday', 'wednesday'],
          timeOfDay: 'morning_person'
        }
      },
      adaptations: {
        responseStyle: {
          currentOptimization: 'empathy_focused',
          adjustmentHistory: [
            { change: 'increased_validation', date: '2024-01-15', reason: 'user_feedback' },
            { change: 'shorter_responses', date: '2024-01-08', reason: 'attention_span' }
          ]
        },
        techniqueRecommendations: {
          primary: 'cbt_based',
          secondary: 'mindfulness_based',
          emergency: 'grounding_techniques'
        }
      }
    },
    insights: {
      strengths: [
        'High engagement with therapy process',
        'Consistent session attendance',
        'Effective use of coping strategies',
        'Strong self-awareness'
      ],
      growthAreas: [
        'Implementing techniques between sessions',
        'Addressing avoidance patterns',
        'Building support network'
      ],
      recommendations: [
        'Continue CBT-based approaches',
        'Explore mindfulness practices',
        'Consider trauma-informed techniques when ready',
        'Practice techniques daily, not just during sessions'
      ]
    },
    therapistMatch: {
      bestFit: 'aria',
      compatibility: 0.89,
      reasons: [
        'Preference for direct, solution-focused approach',
        'Responds well to CBT techniques',
        'Appreciates structured sessions'
      ],
      alternatives: [
        { therapist: 'sage', compatibility: 0.72, reason: 'mindfulness_interest' },
        { therapist: 'luna', compatibility: 0.65, reason: 'sleep_focus' }
      ]
    }
  }
}

function generateRecommendations(profile: any) {
  const recommendations = []

  // Technique recommendations
  if (profile.learning.effectiveTechniques.length > 0) {
    const topTechnique = profile.learning.effectiveTechniques[0]
    recommendations.push({
      type: 'technique',
      priority: 'high',
      title: `Continue using ${topTechnique.technique}`,
      description: `This technique has been ${Math.round(topTechnique.effectiveness * 100)}% effective for you`,
      action: 'practice_technique',
      data: { technique: topTechnique.technique }
    })
  }

  // Therapist recommendations
  if (profile.therapistMatch.compatibility < 0.8) {
    recommendations.push({
      type: 'therapist',
      priority: 'medium',
      title: 'Consider trying a different AI therapist',
      description: `You might connect better with ${profile.therapistMatch.alternatives[0].therapist}`,
      action: 'switch_therapist',
      data: { therapist: profile.therapistMatch.alternatives[0].therapist }
    })
  }

  // Pattern-based recommendations
  profile.learning.patterns.triggerPatterns.forEach((pattern: any) => {
    if (pattern.frequency > 0.5) {
      recommendations.push({
        type: 'pattern',
        priority: 'medium',
        title: `Address ${pattern.pattern.replace('_', ' ')} pattern`,
        description: `This triggers difficulties ${Math.round(pattern.frequency * 100)}% of the time`,
        action: 'create_coping_plan',
        data: { pattern: pattern.pattern, context: pattern.context }
      })
    }
  })

  // New technique recommendations
  const unexplored = ['ACT', 'EMDR'].filter(approach => 
    !profile.preferences.therapeuticApproaches.preferred.includes(approach) &&
    !profile.preferences.therapeuticApproaches.avoided.includes(approach)
  )

  if (unexplored.length > 0) {
    recommendations.push({
      type: 'exploration',
      priority: 'low',
      title: `Explore ${unexplored[0]} techniques`,
      description: 'Based on your progress, you might benefit from trying new approaches',
      action: 'explore_technique',
      data: { approach: unexplored[0] }
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

function getAdaptiveSettings(profile: any) {
  return {
    responseParameters: {
      empathyLevel: profile.preferences.communicationStyle.empathyLevel,
      responseLength: calculateOptimalResponseLength(profile),
      complexityLevel: adaptComplexity(profile),
      validationAmount: calculateValidationNeeds(profile)
    },
    sessionParameters: {
      optimalDuration: profile.preferences.sessionPreferences.preferredLength,
      breakFrequency: calculateBreakNeeds(profile),
      exerciseIntegration: shouldIntegrateExercises(profile),
      crisisSensitivity: calculateCrisisSensitivity(profile)
    },
    contentParameters: {
      topicSensitivity: profile.preferences.topics.challenging,
      avoidanceTopics: profile.preferences.topics.avoided,
      focusAreas: profile.preferences.topics.priority,
      culturalAdaptations: profile.preferences.cultural
    }
  }
}

async function updatePersonalizationProfile(userId: string, updates: any) {
  // In production, this would update the database
  const currentProfile = await getPersonalizationProfile(userId)

  // Apply machine learning to update preferences
  if (updates.feedback) {
    currentProfile.learning = updateLearningModel(currentProfile.learning, updates.feedback)
  }

  if (updates.preferences) {
    currentProfile.preferences = { ...currentProfile.preferences, ...updates.preferences }
  }

  if (updates.learningData) {
    currentProfile.learning = updatePatterns(currentProfile.learning, updates.learningData)
  }

  return currentProfile
}

function updateLearningModel(learning: any, feedback: any) {
  // Update technique effectiveness based on feedback
  if (feedback.techniqueRating) {
    const technique = learning.effectiveTechniques.find(
      (t: any) => t.technique === feedback.technique
    )
    if (technique) {
      // Weighted average with new rating
      const newEffectiveness = (technique.effectiveness * technique.usage + feedback.rating) / (technique.usage + 1)
      technique.effectiveness = newEffectiveness
      technique.usage += 1
    }
  }

  // Update response style preferences
  if (feedback.responseStyle) {
    learning.adaptations.responseStyle.currentOptimization = feedback.responseStyle
    learning.adaptations.responseStyle.adjustmentHistory.push({
      change: feedback.responseStyle,
      date: new Date().toISOString(),
      reason: 'user_feedback'
    })
  }

  return learning
}

function updatePatterns(learning: any, learningData: any) {
  // Update mood patterns
  if (learningData.moodData) {
    learning.patterns.moodPatterns = analyzeMoodPatterns(learningData.moodData)
  }

  // Update trigger patterns
  if (learningData.triggerEvents) {
    learning.patterns.triggerPatterns = updateTriggerPatterns(
      learning.patterns.triggerPatterns,
      learningData.triggerEvents
    )
  }

  // Update coping strategy effectiveness
  if (learningData.copingOutcomes) {
    learning.patterns.copingStrategies = updateCopingStrategies(
      learning.patterns.copingStrategies,
      learningData.copingOutcomes
    )
  }

  return learning
}

// Helper functions for adaptive settings
function calculateOptimalResponseLength(profile: any): string {
  const attentionSpan = profile.learning.patterns.moodPatterns?.attentionSpan || 'medium'
  const userPreference = profile.preferences.communicationStyle.responseLength
  
  // Adapt based on effectiveness data
  if (attentionSpan === 'short' && userPreference === 'long') {
    return 'medium' // Compromise
  }
  
  return userPreference
}

function adaptComplexity(profile: any): string {
  const educationLevel = profile.preferences.communicationStyle.complexity
  const comprehensionRating = profile.learning.adaptations?.comprehensionRating || 0.8
  
  if (comprehensionRating < 0.6 && educationLevel === 'complex') {
    return 'moderate'
  }
  
  return educationLevel
}

function calculateValidationNeeds(profile: any): number {
  // Higher validation for trauma history or low self-esteem indicators
  const traumaHistory = profile.preferences.topics.challenging.includes('trauma')
  const selfEsteemIssues = profile.learning.patterns.triggerPatterns.some(
    (p: any) => p.pattern.includes('self_worth')
  )
  
  let validationLevel = 0.5 // baseline
  
  if (traumaHistory) validationLevel += 0.3
  if (selfEsteemIssues) validationLevel += 0.2
  
  return Math.min(1.0, validationLevel)
}

function calculateBreakNeeds(profile: any): number {
  const attentionSpan = profile.learning.patterns.moodPatterns?.attentionSpan
  const sessionLength = profile.preferences.sessionPreferences.preferredLength
  
  if (attentionSpan === 'short' || sessionLength > 45) {
    return 15 // minutes between breaks
  } else if (attentionSpan === 'medium') {
    return 25
  }
  
  return 0 // no breaks needed
}

function shouldIntegrateExercises(profile: any): boolean {
  const exerciseEffectiveness = profile.learning.effectiveTechniques
    .filter((t: any) => t.technique.includes('exercise'))
    .reduce((avg, t) => avg + t.effectiveness, 0) / 
    profile.learning.effectiveTechniques.filter((t: any) => t.technique.includes('exercise')).length
  
  return exerciseEffectiveness > 0.7
}

function calculateCrisisSensitivity(profile: any): number {
  // Higher sensitivity for users with crisis history
  const crisisHistory = profile.learning.patterns.triggerPatterns.some(
    (p: any) => p.pattern.includes('crisis') || p.pattern.includes('suicidal')
  )
  
  return crisisHistory ? 0.9 : 0.7
}

// Pattern analysis helper functions
function analyzeMoodPatterns(moodData: any[]) {
  // Analyze mood data to find patterns
  const dayOfWeekMoods = moodData.reduce((acc, entry) => {
    const day = new Date(entry.timestamp).toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
    if (!acc[day]) acc[day] = []
    acc[day].push(entry.mood)
    return acc
  }, {})

  const bestDays = Object.entries(dayOfWeekMoods)
    .map(([day, moods]: [string, any]) => ({ 
      day, 
      avg: moods.reduce((a: number, b: number) => a + b, 0) / moods.length 
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2)
    .map(d => d.day)

  const challengingDays = Object.entries(dayOfWeekMoods)
    .map(([day, moods]: [string, any]) => ({ 
      day, 
      avg: moods.reduce((a: number, b: number) => a + b, 0) / moods.length 
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2)
    .map(d => d.day)

  return {
    bestDays,
    challengingDays,
    weeklyTrend: calculateTrend(moodData),
    timeOfDay: determineOptimalTime(moodData)
  }
}

function updateTriggerPatterns(currentPatterns: any[], newEvents: any[]) {
  // Update trigger patterns with new events
  const patternMap = new Map(currentPatterns.map(p => [p.pattern, p]))
  
  newEvents.forEach(event => {
    if (patternMap.has(event.pattern)) {
      const pattern = patternMap.get(event.pattern)
      pattern.frequency = (pattern.frequency + (event.triggered ? 1 : 0)) / 2
    } else {
      patternMap.set(event.pattern, {
        pattern: event.pattern,
        frequency: event.triggered ? 1 : 0,
        context: event.context
      })
    }
  })
  
  return Array.from(patternMap.values())
}

function updateCopingStrategies(currentStrategies: any[], outcomes: any[]) {
  // Update coping strategy effectiveness
  const strategyMap = new Map(currentStrategies.map(s => [s.strategy, s]))
  
  outcomes.forEach(outcome => {
    if (strategyMap.has(outcome.strategy)) {
      const strategy = strategyMap.get(outcome.strategy)
      strategy.success_rate = (strategy.success_rate + outcome.effectiveness) / 2
    } else {
      strategyMap.set(outcome.strategy, {
        strategy: outcome.strategy,
        success_rate: outcome.effectiveness
      })
    }
  })
  
  return Array.from(strategyMap.values())
}

function calculateTrend(moodData: any[]): string {
  if (moodData.length < 2) return 'stable'
  
  const recent = moodData.slice(-7).map(d => d.mood)
  const older = moodData.slice(-14, -7).map(d => d.mood)
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  
  if (recentAvg > olderAvg + 0.5) return 'improving'
  if (recentAvg < olderAvg - 0.5) return 'declining'
  return 'stable'
}

function determineOptimalTime(moodData: any[]): string {
  const hourMoods = moodData.reduce((acc, entry) => {
    const hour = new Date(entry.timestamp).getHours()
    if (!acc[hour]) acc[hour] = []
    acc[hour].push(entry.mood)
    return acc
  }, {})

  const avgByHour = Object.entries(hourMoods).map(([hour, moods]: [string, any]) => ({
    hour: parseInt(hour),
    avg: moods.reduce((a: number, b: number) => a + b, 0) / moods.length
  }))

  const bestHour = avgByHour.sort((a, b) => b.avg - a.avg)[0]?.hour

  if (bestHour >= 6 && bestHour < 12) return 'morning_person'
  if (bestHour >= 12 && bestHour < 18) return 'afternoon_person'
  return 'evening_person'
}