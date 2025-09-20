import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Crisis Detection and Safety Features API
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const data = await request.json()
    const { message, sessionId, action, context } = data

    switch (action) {
      case 'assess':
        return await handleCrisisAssessment(message, sessionId, userId, context)
      case 'escalate':
        return await handleCrisisEscalation(sessionId, userId, data)
      case 'safety_plan':
        return await handleSafetyPlanning(userId, data)
      case 'resources':
        return await handleResourceRequest(data)
      case 'emergency':
        return await handleEmergencyProtocol(userId, sessionId, data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Crisis API error:', error)
    return NextResponse.json({ error: 'Failed to process crisis request' }, { status: 500 })
  }
}

// Get crisis resources and safety information
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const language = searchParams.get('language') || 'en'

    const resources = getCrisisResources(type, location, language)
    const safetyTips = getSafetyTips()
    const emergencyProtocols = getEmergencyProtocols()

    return NextResponse.json({
      resources,
      safetyTips,
      emergencyProtocols,
      immediateActions: getImmediateActions()
    })
  } catch (error) {
    console.error('Failed to fetch crisis resources:', error)
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

async function handleCrisisAssessment(message: string, sessionId: string, userId: string, context: any) {
  const assessment = await performComprehensiveCrisisAssessment(message, context)
  
  // Log assessment for monitoring
  await logCrisisAssessment(userId, sessionId, assessment)

  if (assessment.riskLevel === 'imminent' || assessment.score >= 9) {
    // Trigger immediate protocol
    const emergencyResponse = await activateEmergencyProtocol(userId, sessionId, assessment)
    return NextResponse.json({
      critical: true,
      riskLevel: assessment.riskLevel,
      score: assessment.score,
      assessment,
      emergencyResponse,
      immediateActions: getImmediateActions(),
      hotlines: getEmergencyHotlines(),
      followUp: 'emergency_escalation'
    })
  }

  return NextResponse.json({
    assessment,
    riskLevel: assessment.riskLevel,
    score: assessment.score,
    recommendations: getRecommendationsForRisk(assessment.riskLevel),
    resources: getTargetedResources(assessment),
    safetyPlan: assessment.riskLevel !== 'low' ? generateSafetyPlan(assessment) : null,
    followUp: determineFollowUpAction(assessment)
  })
}

async function performComprehensiveCrisisAssessment(message: string, context: any) {
  const lowerMessage = message.toLowerCase()
  let riskScore = 0
  const indicators: string[] = []
  const riskFactors: string[] = []

  // Immediate danger indicators (10 points each)
  const immediateIndicators = [
    'kill myself today',
    'end my life tonight',
    'going to do it',
    'have a plan',
    'ready to die',
    'goodbye world',
    'this is the end'
  ]

  // Severe risk indicators (8-9 points each)
  const severeIndicators = [
    'kill myself',
    'suicide',
    'want to die',
    'end my life',
    'better off dead',
    'no reason to live',
    'can\'t go on anymore'
  ]

  // High risk indicators (6-7 points each)
  const highRiskIndicators = [
    'self-harm',
    'hurt myself',
    'cut myself',
    'overdose',
    'jump off',
    'hopeless',
    'worthless',
    'trapped',
    'no way out',
    'unbearable pain'
  ]

  // Moderate risk indicators (3-5 points each)
  const moderateRiskIndicators = [
    'depressed',
    'give up',
    'nobody cares',
    'alone forever',
    'hate myself',
    'wish I was dead',
    'can\'t handle this',
    'everything is wrong'
  ]

  // Check for immediate danger
  for (const indicator of immediateIndicators) {
    if (lowerMessage.includes(indicator)) {
      riskScore += 10
      indicators.push(indicator)
      riskFactors.push('immediate_danger')
    }
  }

  // Check for severe risk
  for (const indicator of severeIndicators) {
    if (lowerMessage.includes(indicator)) {
      riskScore += Math.random() > 0.5 ? 9 : 8
      indicators.push(indicator)
      riskFactors.push('severe_ideation')
    }
  }

  // Check for high risk
  for (const indicator of highRiskIndicators) {
    if (lowerMessage.includes(indicator)) {
      riskScore += Math.random() > 0.5 ? 7 : 6
      indicators.push(indicator)
      riskFactors.push('high_distress')
    }
  }

  // Check for moderate risk
  for (const indicator of moderateRiskIndicators) {
    if (lowerMessage.includes(indicator)) {
      riskScore += Math.floor(Math.random() * 3) + 3
      indicators.push(indicator)
      riskFactors.push('emotional_distress')
    }
  }

  // Context-based risk factors
  if (context?.previousRiskScore && context.previousRiskScore > 5) {
    riskScore += 2
    riskFactors.push('escalating_pattern')
  }

  if (context?.timeOfDay === 'late_night') {
    riskScore += 1
    riskFactors.push('vulnerable_time')
  }

  if (context?.recentLoss || context?.majorStressor) {
    riskScore += 2
    riskFactors.push('acute_stressor')
  }

  // Protective factors (reduce risk)
  const protectiveFactors = []
  if (lowerMessage.includes('but') || lowerMessage.includes('however')) {
    riskScore = Math.max(0, riskScore - 1)
    protectiveFactors.push('ambivalence')
  }

  if (lowerMessage.includes('family') || lowerMessage.includes('kids') || lowerMessage.includes('children')) {
    riskScore = Math.max(0, riskScore - 2)
    protectiveFactors.push('family_connection')
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('therapy') || lowerMessage.includes('treatment')) {
    riskScore = Math.max(0, riskScore - 1)
    protectiveFactors.push('help_seeking')
  }

  // Determine risk level
  let riskLevel: string
  if (riskScore >= 9) riskLevel = 'imminent'
  else if (riskScore >= 7) riskLevel = 'high'
  else if (riskScore >= 4) riskLevel = 'moderate'
  else if (riskScore >= 2) riskLevel = 'low'
  else riskLevel = 'minimal'

  // Additional analysis
  const emotionalState = analyzeEmotionalState(message)
  const cognitiveState = analyzeCognitiveState(message)
  const behavioralIndicators = analyzeBehavioralIndicators(message)

  return {
    score: Math.min(10, riskScore),
    riskLevel,
    indicators,
    riskFactors: [...new Set(riskFactors)],
    protectiveFactors,
    emotionalState,
    cognitiveState,
    behavioralIndicators,
    confidence: calculateConfidence(indicators.length, riskScore),
    timestamp: new Date(),
    needsImmediateIntervention: riskScore >= 8,
    recommendedActions: getRecommendedActions(riskLevel, riskFactors)
  }
}

function analyzeEmotionalState(message: string): any {
  const emotions = {
    despair: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    numbness: 0,
    agitation: 0
  }

  const emotionKeywords = {
    despair: ['hopeless', 'meaningless', 'pointless', 'worthless', 'empty'],
    anger: ['angry', 'rage', 'furious', 'hate', 'pissed'],
    fear: ['scared', 'afraid', 'terrified', 'panic', 'anxious'],
    sadness: ['sad', 'depressed', 'crying', 'tears', 'heartbroken'],
    numbness: ['numb', 'empty', 'void', 'disconnected', 'nothing'],
    agitation: ['restless', 'can\'t sit still', 'pacing', 'agitated']
  }

  const lower = message.toLowerCase()
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        emotions[emotion as keyof typeof emotions] += 1
      }
    }
  }

  const dominantEmotion = Object.entries(emotions)
    .sort(([,a], [,b]) => b - a)[0][0]

  return {
    emotions,
    dominantEmotion,
    intensity: Object.values(emotions).reduce((sum, val) => sum + val, 0),
    mixedEmotions: Object.values(emotions).filter(val => val > 0).length > 2
  }
}

function analyzeCognitiveState(message: string): any {
  const indicators = {
    confusion: 0,
    concentration: 0,
    memory: 0,
    decision_making: 0,
    reality_testing: 0
  }

  const cognitiveKeywords = {
    confusion: ['confused', 'don\'t understand', 'fuzzy', 'unclear'],
    concentration: ['can\'t focus', 'distracted', 'scattered', 'mind racing'],
    memory: ['can\'t remember', 'forget', 'blank', 'memory'],
    decision_making: ['can\'t decide', 'don\'t know what to do', 'stuck'],
    reality_testing: ['not real', 'dreaming', 'surreal', 'detached']
  }

  const lower = message.toLowerCase()
  
  for (const [indicator, keywords] of Object.entries(cognitiveKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        indicators[indicator as keyof typeof indicators] += 1
      }
    }
  }

  return {
    indicators,
    impairment_level: Object.values(indicators).reduce((sum, val) => sum + val, 0),
    areas_affected: Object.entries(indicators)
      .filter(([, value]) => value > 0)
      .map(([key]) => key)
  }
}

function analyzeBehavioralIndicators(message: string): any {
  const behaviors = {
    isolation: 0,
    self_harm: 0,
    substance_use: 0,
    reckless: 0,
    withdrawal: 0
  }

  const behaviorKeywords = {
    isolation: ['alone', 'isolated', 'nobody', 'no friends'],
    self_harm: ['cut', 'burn', 'hurt myself', 'self-harm'],
    substance_use: ['drinking', 'drugs', 'pills', 'alcohol'],
    reckless: ['reckless', 'dangerous', 'don\'t care', 'what\'s the point'],
    withdrawal: ['stayed in bed', 'haven\'t left', 'avoiding', 'hiding']
  }

  const lower = message.toLowerCase()
  
  for (const [behavior, keywords] of Object.entries(behaviorKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        behaviors[behavior as keyof typeof behaviors] += 1
      }
    }
  }

  return {
    behaviors,
    risk_behaviors: Object.entries(behaviors)
      .filter(([, value]) => value > 0)
      .map(([key]) => key),
    severity: Object.values(behaviors).reduce((sum, val) => sum + val, 0)
  }
}

function calculateConfidence(indicatorCount: number, riskScore: number): number {
  // Higher confidence with more indicators and consistent scoring
  const indicatorConfidence = Math.min(1, indicatorCount / 5)
  const scoreConfidence = riskScore > 0 ? 0.8 : 0.3
  
  return (indicatorConfidence + scoreConfidence) / 2
}

function getRecommendedActions(riskLevel: string, riskFactors: string[]): string[] {
  const actionMap: Record<string, string[]> = {
    imminent: [
      'immediate_crisis_intervention',
      'emergency_services_contact',
      'safety_plan_activation',
      'remove_means_of_harm',
      'constant_supervision'
    ],
    high: [
      'crisis_hotline_connection',
      'safety_planning',
      'emergency_contact_notification',
      'intensive_support',
      'risk_assessment'
    ],
    moderate: [
      'therapeutic_intervention',
      'coping_skills_activation',
      'support_system_engagement',
      'safety_planning',
      'increased_monitoring'
    ],
    low: [
      'emotional_support',
      'coping_strategies',
      'resource_connection',
      'follow_up_scheduling'
    ],
    minimal: [
      'emotional_validation',
      'preventive_education',
      'wellness_planning'
    ]
  }

  let actions = actionMap[riskLevel] || []

  // Add specific actions based on risk factors
  if (riskFactors.includes('escalating_pattern')) {
    actions.push('pattern_interruption')
  }
  if (riskFactors.includes('acute_stressor')) {
    actions.push('stress_management')
  }

  return [...new Set(actions)]
}

async function handleCrisisEscalation(sessionId: string, userId: string, data: any) {
  const escalationLevel = data.escalationLevel || 'high'
  const reason = data.reason || 'user_request'
  
  // Log escalation
  await logCrisisEscalation(userId, sessionId, escalationLevel, reason)

  // Generate escalation response
  const response = generateEscalationResponse(escalationLevel)
  
  // Notify crisis team (in production)
  await notifyCrisisTeam(userId, sessionId, escalationLevel, data)

  return NextResponse.json({
    escalated: true,
    level: escalationLevel,
    response: response.message,
    actions: response.actions,
    contacts: getEmergencyContacts(),
    followUp: response.followUp,
    ticketId: generateTicketId()
  })
}

async function handleSafetyPlanning(userId: string, data: any) {
  const existingPlan = await getSafetyPlan(userId)
  const newPlan = data.plan
  
  const safetyPlan = mergeSafetyPlans(existingPlan, newPlan)
  await saveSafetyPlan(userId, safetyPlan)

  return NextResponse.json({
    success: true,
    safetyPlan,
    message: 'Safety plan updated successfully',
    reminders: generateSafetyReminders(safetyPlan)
  })
}

async function handleResourceRequest(data: any) {
  const { category, location, urgency, demographics } = data
  
  const resources = getTargetedResources({
    riskLevel: urgency || 'moderate',
    location,
    demographics,
    category
  })

  return NextResponse.json({
    resources,
    emergency: getEmergencyHotlines(),
    local: getLocalResources(location),
    specialized: getSpecializedResources(demographics)
  })
}

async function handleEmergencyProtocol(userId: string, sessionId: string, data: any) {
  // Activate full emergency protocol
  const protocol = {
    activated: true,
    timestamp: new Date(),
    level: 'emergency',
    actions: [
      'immediate_intervention',
      'emergency_services_notification',
      'crisis_team_activation'
    ]
  }

  // Log emergency activation
  await logEmergencyActivation(userId, sessionId, protocol)

  return NextResponse.json({
    emergency: true,
    protocol,
    contacts: getEmergencyContacts(),
    instructions: getEmergencyInstructions(),
    resources: getEmergencyResources()
  })
}

function getCrisisResources(type: string | null, location: string | null, language: string) {
  const baseResources = {
    hotlines: [
      {
        id: '988',
        name: '988 Suicide & Crisis Lifeline',
        number: '988',
        text: null,
        chat: 'https://988lifeline.org/chat',
        available: '24/7',
        languages: ['en', 'es'],
        priority: 1
      },
      {
        id: 'crisis-text',
        name: 'Crisis Text Line',
        number: '741741',
        text: 'Text HOME to 741741',
        chat: 'https://www.crisistextline.org',
        available: '24/7',
        languages: ['en', 'es'],
        priority: 1
      },
      {
        id: 'samhsa',
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        description: 'Treatment referral and information service',
        available: '24/7',
        languages: ['en', 'es'],
        priority: 2
      },
      {
        id: 'lgbtq',
        name: 'LGBTQ National Hotline',
        number: '1-888-843-4564',
        available: 'Mon-Fri 1pm-9pm PST',
        specialization: 'LGBTQ+ issues',
        priority: 3
      },
      {
        id: 'veterans',
        name: 'Veterans Crisis Line',
        number: '988 then Press 1',
        text: 'Text 838255',
        available: '24/7',
        specialization: 'Veterans',
        priority: 2
      },
      {
        id: 'teen',
        name: 'Teen Line',
        number: '1-800-852-8336',
        text: 'Text TEEN to 839863',
        available: '6pm-10pm PST',
        specialization: 'Teens',
        priority: 3
      }
    ],
    
    apps: [
      {
        name: 'MY3',
        description: 'Safety planning app with crisis resources',
        platforms: ['iOS', 'Android'],
        free: true
      },
      {
        name: 'notOK',
        description: 'Digital panic button to alert support network',
        platforms: ['iOS', 'Android'],
        free: true
      },
      {
        name: 'MindShift',
        description: 'CBT-based anxiety and mood tracking',
        platforms: ['iOS', 'Android'],
        free: true
      },
      {
        name: 'PTSD Coach',
        description: 'Tools for managing PTSD symptoms',
        platforms: ['iOS', 'Android'],
        free: true,
        specialization: 'PTSD'
      }
    ],

    websites: [
      {
        name: 'National Suicide Prevention Lifeline',
        url: 'https://988lifeline.org',
        description: 'Crisis support and resources'
      },
      {
        name: 'Crisis Text Line',
        url: 'https://www.crisistextline.org',
        description: 'Text-based crisis support'
      },
      {
        name: 'NAMI (National Alliance on Mental Illness)',
        url: 'https://www.nami.org/help',
        description: 'Mental health advocacy and support'
      },
      {
        name: 'Mental Health America',
        url: 'https://www.mhanational.org/finding-help',
        description: 'Mental health resources and screening tools'
      }
    ]
  }

  // Filter by type if specified
  if (type) {
    if (type === 'hotlines') return { hotlines: baseResources.hotlines }
    if (type === 'apps') return { apps: baseResources.apps }
    if (type === 'websites') return { websites: baseResources.websites }
  }

  return baseResources
}

function getEmergencyHotlines() {
  return [
    {
      name: '911',
      number: '911',
      purpose: 'Immediate life-threatening emergencies',
      when: 'Active suicide attempt or immediate danger'
    },
    {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      purpose: 'Suicide prevention and crisis support',
      when: 'Suicidal thoughts or emotional crisis'
    },
    {
      name: 'Crisis Text Line',
      number: '741741',
      text: 'Text HOME',
      purpose: 'Crisis support via text',
      when: 'Prefer text communication'
    }
  ]
}

function getImmediateActions() {
  return [
    {
      priority: 1,
      action: 'Ensure immediate safety',
      description: 'Remove any means of self-harm from immediate area'
    },
    {
      priority: 2,
      action: 'Contact crisis support',
      description: 'Call 988 or text HOME to 741741'
    },
    {
      priority: 3,
      action: 'Reach out to support person',
      description: 'Contact a trusted friend, family member, or counselor'
    },
    {
      priority: 4,
      action: 'Go to safe location',
      description: 'Be with someone you trust or go to a public place'
    },
    {
      priority: 5,
      action: 'Use coping strategies',
      description: 'Practice breathing, grounding, or other learned techniques'
    }
  ]
}

function getSafetyTips() {
  return {
    immediate: [
      'If you are in immediate danger, call 911',
      'Remove means of self-harm from your environment',
      'Call a crisis hotline (988) for immediate support',
      'Go to your nearest emergency room if needed',
      'Reach out to a trusted person right now'
    ],
    ongoing: [
      'Create and maintain a safety plan',
      'Build a support network of trusted individuals',
      'Learn and practice coping strategies',
      'Keep crisis numbers easily accessible',
      'Attend regular therapy appointments',
      'Take prescribed medications as directed',
      'Avoid alcohol and drugs during crisis',
      'Maintain healthy sleep and eating patterns'
    ],
    environmental: [
      'Remove or secure firearms and other weapons',
      'Lock up medications or give to trusted person',
      'Remove items that could be used for self-harm',
      'Create calming environment with comfort items',
      'Have emergency contacts visible and accessible'
    ]
  }
}

function getEmergencyProtocols() {
  return {
    level_1_imminent: {
      description: 'Immediate danger of self-harm',
      actions: [
        'Call 911 immediately',
        'Do not leave person alone',
        'Remove all means of self-harm',
        'Activate crisis response team',
        'Notify emergency contacts'
      ]
    },
    level_2_high: {
      description: 'High risk but not immediate',
      actions: [
        'Contact crisis hotline (988)',
        'Implement safety plan',
        'Notify support person',
        'Schedule emergency therapy session',
        'Increase supervision and support'
      ]
    },
    level_3_moderate: {
      description: 'Elevated risk requiring intervention',
      actions: [
        'Activate coping strategies',
        'Contact therapist or counselor',
        'Reach out to support network',
        'Review and update safety plan',
        'Schedule follow-up within 24 hours'
      ]
    }
  }
}

// Helper functions
async function logCrisisAssessment(userId: string, sessionId: string, assessment: any) {
  console.log('CRISIS ASSESSMENT LOGGED', {
    userId,
    sessionId,
    riskLevel: assessment.riskLevel,
    score: assessment.score,
    timestamp: assessment.timestamp
  })
}

async function logCrisisEscalation(userId: string, sessionId: string, level: string, reason: string) {
  console.log('CRISIS ESCALATION LOGGED', {
    userId,
    sessionId,
    level,
    reason,
    timestamp: new Date()
  })
}

async function logEmergencyActivation(userId: string, sessionId: string, protocol: any) {
  console.log('EMERGENCY PROTOCOL ACTIVATED', {
    userId,
    sessionId,
    protocol,
    timestamp: new Date()
  })
}

async function activateEmergencyProtocol(userId: string, sessionId: string, assessment: any) {
  return {
    activated: true,
    level: 'emergency',
    actions: ['crisis_intervention', 'emergency_notification'],
    contacts: getEmergencyContacts(),
    ticketId: generateTicketId()
  }
}

async function notifyCrisisTeam(userId: string, sessionId: string, level: string, data: any) {
  // In production: notify crisis intervention team
  console.log('CRISIS TEAM NOTIFIED', { userId, sessionId, level, data })
}

function generateEscalationResponse(level: string) {
  const responses = {
    emergency: {
      message: 'Emergency protocol has been activated. Crisis support is being contacted immediately. Please stay on the line.',
      actions: ['emergency_services', 'crisis_team', 'immediate_intervention'],
      followUp: 'immediate_contact'
    },
    high: {
      message: 'High-priority crisis support has been requested. A crisis counselor will contact you within 15 minutes.',
      actions: ['crisis_counselor', 'safety_planning', 'support_activation'],
      followUp: 'crisis_counselor_contact'
    },
    moderate: {
      message: 'Crisis support has been requested. Additional resources and support options are being prepared.',
      actions: ['resource_preparation', 'counselor_notification', 'safety_check'],
      followUp: 'resource_delivery'
    }
  }

  return responses[level as keyof typeof responses] || responses.moderate
}

function generateTicketId(): string {
  return `CRS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
}

function getEmergencyContacts() {
  return {
    primary: '911',
    crisis: '988',
    text: '741741',
    local: 'Contact local emergency services'
  }
}

function getEmergencyInstructions() {
  return [
    'Stay calm and ensure immediate safety',
    'Call 911 if in immediate physical danger',
    'Call 988 for crisis support and counseling',
    'Remove any means of self-harm from area',
    'Contact a trusted person to be with you',
    'Go to nearest emergency room if needed'
  ]
}

function getEmergencyResources() {
  return {
    hotlines: getEmergencyHotlines(),
    immediate_actions: getImmediateActions(),
    safety_tips: getSafetyTips().immediate
  }
}

function getRecommendationsForRisk(riskLevel: string): string[] {
  const recommendations = {
    imminent: [
      'Immediate crisis intervention required',
      'Emergency services contact necessary',
      'Constant supervision recommended',
      'Remove all means of self-harm',
      'Emergency room evaluation'
    ],
    high: [
      'Crisis hotline contact recommended',
      'Safety planning session needed',
      'Increased therapeutic support',
      'Support system activation',
      'Consider psychiatric evaluation'
    ],
    moderate: [
      'Therapeutic intervention recommended',
      'Coping skills practice',
      'Support system engagement',
      'Safety plan review',
      'Regular check-ins'
    ],
    low: [
      'Emotional support and validation',
      'Coping strategy practice',
      'Routine mental health care',
      'Stress management techniques'
    ],
    minimal: [
      'Continued self-care',
      'Preventive mental health practices',
      'Regular wellness check-ins'
    ]
  }

  return recommendations[riskLevel as keyof typeof recommendations] || recommendations.minimal
}

function getTargetedResources(assessment: any) {
  // Return resources based on assessment details
  const base = getCrisisResources(null, null, 'en')
  
  // Add specialized resources based on assessment
  if (assessment.riskLevel === 'high' || assessment.riskLevel === 'imminent') {
    return {
      ...base,
      priority: base.hotlines?.filter(h => h.priority === 1) || [],
      immediate: getImmediateActions()
    }
  }

  return base
}

function generateSafetyPlan(assessment: any) {
  return {
    warningSigns: [
      'Feeling hopeless or trapped',
      'Thinking about death or suicide',
      'Feeling like a burden to others',
      'Increased substance use',
      'Withdrawing from others'
    ],
    copingStrategies: [
      'Deep breathing exercises',
      'Call a trusted friend',
      'Go for a walk',
      'Listen to calming music',
      'Practice mindfulness'
    ],
    supportContacts: [
      { name: 'Crisis Hotline', number: '988' },
      { name: 'Crisis Text Line', number: '741741' },
      { name: 'Emergency Services', number: '911' }
    ],
    professionalContacts: [
      { name: 'Therapist', number: 'To be filled' },
      { name: 'Psychiatrist', number: 'To be filled' },
      { name: 'Primary Care Doctor', number: 'To be filled' }
    ],
    environmentalSafety: [
      'Remove or secure means of self-harm',
      'Ask trusted person to hold medications',
      'Create calming environment',
      'Have comfort items nearby'
    ],
    reasons: [
      'People who care about me',
      'Goals and dreams for the future',
      'Responsibilities to others',
      'Belief that things can improve'
    ]
  }
}

async function getSafetyPlan(userId: string) {
  // In production, fetch from database
  return null
}

function mergeSafetyPlans(existing: any, newPlan: any) {
  if (!existing) return newPlan
  
  return {
    ...existing,
    ...newPlan,
    lastUpdated: new Date()
  }
}

async function saveSafetyPlan(userId: string, plan: any) {
  // In production, save to database
  console.log('Safety plan saved for user:', userId)
}

function generateSafetyReminders(plan: any) {
  return [
    'Review your safety plan regularly',
    'Keep crisis numbers easily accessible',
    'Practice coping strategies when calm',
    'Update contacts as needed',
    'Share plan with trusted support people'
  ]
}

function getLocalResources(location: string | null) {
  // In production, return location-specific resources
  return [
    'Contact your local mental health center',
    'Visit nearest hospital emergency room',
    'Call local emergency services (911)'
  ]
}

function getSpecializedResources(demographics: any) {
  const specialized = []

  if (demographics?.age === 'teen') {
    specialized.push({
      name: 'Teen Line',
      number: '1-800-852-8336',
      description: 'Peer support for teens'
    })
  }

  if (demographics?.identity?.includes('lgbtq')) {
    specialized.push({
      name: 'LGBTQ National Hotline',
      number: '1-888-843-4564',
      description: 'Support for LGBTQ+ individuals'
    })
  }

  if (demographics?.veteran === true) {
    specialized.push({
      name: 'Veterans Crisis Line',
      number: '988 then Press 1',
      description: 'Crisis support for veterans'
    })
  }

  return specialized
}

function determineFollowUpAction(assessment: any): string {
  if (assessment.riskLevel === 'imminent') return 'immediate_intervention'
  if (assessment.riskLevel === 'high') return 'crisis_support'
  if (assessment.riskLevel === 'moderate') return 'therapeutic_support'
  return 'wellness_check'
}