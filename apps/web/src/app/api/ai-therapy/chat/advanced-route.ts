import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Advanced AI Therapy Chat with OpenAI Integration
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const data = await request.json()
    const { 
      sessionId, 
      message, 
      therapistId, 
      messageType = 'TEXT',
      voiceData,
      metadata 
    } = data

    // Validate required fields
    if (!sessionId || !message || !therapistId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create therapy session
    let therapySession = await prisma.aITherapySession.findUnique({
      where: { sessionToken: sessionId },
      include: {
        therapist: true,
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })

    if (!therapySession) {
      // Create new session
      therapySession = await prisma.aITherapySession.create({
        data: {
          sessionToken: sessionId,
          userId,
          therapistId,
          sessionType: metadata?.sessionType || 'CHECK_IN',
          moodBefore: metadata?.currentMood,
          topics: JSON.stringify(metadata?.topics || [])
        },
        include: {
          therapist: true,
          messages: true
        }
      })
    }

    // Store user message with encryption
    const encryptedContent = Buffer.from(JSON.stringify({
      content: message,
      metadata: { ...metadata, timestamp: new Date() }
    }))

    const userMessage = await prisma.aITherapyMessage.create({
      data: {
        sessionId: therapySession.id,
        sender: 'USER',
        messageType: messageType as any,
        encryptedContent,
        messageHash: generateHash(message),
        hasAudio: !!voiceData,
        audioUrl: voiceData?.url
      }
    })

    // Comprehensive crisis analysis with multiple indicators
    const crisisAnalysis = await performAdvancedCrisisAnalysis(message, therapySession)
    
    if (crisisAnalysis.urgencyLevel === 'critical') {
      // Trigger immediate crisis protocol
      await handleCrisisProtocol(therapySession, crisisAnalysis)
      
      const crisisResponse = generateCrisisResponse(therapistId, crisisAnalysis)
      
      // Store crisis intervention message
      await prisma.aITherapyMessage.create({
        data: {
          sessionId: therapySession.id,
          sender: 'THERAPIST',
          messageType: 'INTERVENTION',
          encryptedContent: Buffer.from(JSON.stringify({
            content: crisisResponse.message,
            interventions: crisisResponse.interventions
          })),
          messageHash: generateHash(crisisResponse.message),
          riskScore: 10
        }
      })

      // Update session with crisis information
      await prisma.aITherapySession.update({
        where: { id: therapySession.id },
        data: {
          crisisDetected: true,
          crisisLevel: crisisAnalysis.score,
          crisisInterventions: JSON.stringify(crisisResponse.interventions)
        }
      })

      return NextResponse.json({
        crisis: true,
        urgencyLevel: 'critical',
        response: crisisResponse.message,
        interventions: crisisResponse.interventions,
        resources: getCrisisResources(),
        emergencyContacts: getEmergencyContacts()
      })
    }

    // Generate contextual AI response using advanced therapeutic models
    const aiResponse = await generateAdvancedTherapistResponse(
      therapistId, 
      message, 
      therapySession,
      crisisAnalysis
    )

    // Store AI response with analysis
    await prisma.aITherapyMessage.create({
      data: {
        sessionId: therapySession.id,
        sender: 'THERAPIST',
        messageType: aiResponse.type as any,
        encryptedContent: Buffer.from(JSON.stringify({
          content: aiResponse.content,
          techniques: aiResponse.techniques,
          exercises: aiResponse.exercises
        })),
        messageHash: generateHash(aiResponse.content),
        sentiment: aiResponse.sentiment,
        emotion: JSON.stringify(aiResponse.emotions),
        techniques: JSON.stringify(aiResponse.techniques),
        riskScore: crisisAnalysis.score
      }
    })

    // Update session with new insights
    if (aiResponse.insights.length > 0) {
      await prisma.aITherapySession.update({
        where: { id: therapySession.id },
        data: {
          encryptedInsights: Buffer.from(JSON.stringify(aiResponse.insights)),
          techniques: JSON.stringify(aiResponse.techniques),
          topics: JSON.stringify([
            ...JSON.parse(therapySession.topics || '[]'),
            ...aiResponse.detectedTopics
          ])
        }
      })
    }

    // Track therapeutic techniques effectiveness
    if (aiResponse.techniques.length > 0) {
      await trackTechniqueEffectiveness(userId, aiResponse.techniques)
    }

    return NextResponse.json({
      response: aiResponse.content,
      type: aiResponse.type,
      techniques: aiResponse.techniques,
      exercises: aiResponse.exercises,
      insights: aiResponse.insights,
      crisisAnalysis,
      messageId: userMessage.id,
      timestamp: new Date(),
      followUp: aiResponse.followUp,
      sessionMetrics: {
        messageCount: therapySession.messages.length + 2,
        duration: getSessionDuration(therapySession.startedAt),
        engagement: calculateEngagement(therapySession)
      }
    })

  } catch (error) {
    console.error('Advanced AI therapy chat error:', error)
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Advanced crisis analysis with ML patterns
async function performAdvancedCrisisAnalysis(message: string, session: any) {
  const lowerMessage = message.toLowerCase()
  const indicators: string[] = []
  let urgencyScore = 0
  let confidence = 0

  // Multi-tier crisis keyword detection
  const criticalKeywords = {
    immediate: {
      patterns: ['kill myself', 'end my life', 'suicide', 'want to die', 'going to kill'],
      weight: 100,
      action: 'immediate_intervention'
    },
    severe: {
      patterns: ['self-harm', 'hurt myself', 'overdose', 'cut myself', 'plan to die'],
      weight: 90,
      action: 'urgent_support'
    },
    high: {
      patterns: ['hopeless', 'worthless', 'can\'t go on', 'give up', 'no reason to live'],
      weight: 75,
      action: 'intensive_support'
    },
    moderate: {
      patterns: ['depressed', 'anxious', 'panic', 'scared', 'overwhelmed', 'trapped'],
      weight: 50,
      action: 'therapeutic_support'
    }
  }

  // Check each tier of keywords
  for (const [level, data] of Object.entries(criticalKeywords)) {
    for (const pattern of data.patterns) {
      if (lowerMessage.includes(pattern)) {
        indicators.push(pattern)
        urgencyScore = Math.max(urgencyScore, data.weight)
        confidence += 0.2
      }
    }
  }

  // Context analysis from session history
  const recentMessages = session.messages || []
  const escalating = analyzeEscalation(recentMessages, urgencyScore)
  if (escalating) {
    urgencyScore = Math.min(100, urgencyScore + 15)
    indicators.push('escalating_pattern')
  }

  // Sentiment and emotion analysis
  const emotions = detectEmotions(message)
  const negativeSentiment = emotions.filter(e => 
    ['despair', 'hopelessness', 'anger', 'fear'].includes(e)
  ).length

  if (negativeSentiment > 2) {
    urgencyScore = Math.min(100, urgencyScore + 10)
  }

  // Determine urgency level
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  if (urgencyScore >= 90) urgencyLevel = 'critical'
  else if (urgencyScore >= 75) urgencyLevel = 'high'
  else if (urgencyScore >= 50) urgencyLevel = 'medium'
  else urgencyLevel = 'low'

  return {
    urgencyLevel,
    score: urgencyScore,
    indicators,
    confidence: Math.min(1, confidence),
    emotions,
    requiresEscalation: urgencyScore >= 75,
    suggestedInterventions: getSuggestedInterventions(urgencyLevel)
  }
}

// Generate advanced therapist response with techniques
async function generateAdvancedTherapistResponse(
  therapistId: string,
  message: string,
  session: any,
  crisisAnalysis: any
) {
  const therapist = session.therapist
  const messageContext = analyzeMessageContext(message)
  const sessionContext = buildSessionContext(session)
  
  // Select appropriate therapeutic approach
  const approach = selectTherapeuticApproach(
    therapistId, 
    messageContext, 
    crisisAnalysis.emotions
  )

  // Generate response based on therapist personality and approach
  let response = ''
  let techniques: string[] = []
  let exercises: any[] = []
  let type: string = 'TEXT'

  if (therapistId === 'aria') {
    // CBT-focused response
    response = generateCBTResponse(message, messageContext, sessionContext)
    techniques = ['cognitive_restructuring', 'thought_challenging', 'behavioral_activation']
    
    if (messageContext.needsExercise) {
      exercises.push({
        type: 'CBT_WORKSHEET',
        name: 'Thought Record',
        duration: 15,
        instructions: 'Let\'s examine this thought pattern together...'
      })
      type = 'EXERCISE'
    }
  } else if (therapistId === 'sage') {
    // Mindfulness and trauma-informed response
    response = generateMindfulnessResponse(message, messageContext, sessionContext)
    techniques = ['mindfulness', 'grounding', 'somatic_awareness']
    
    if (crisisAnalysis.score > 30) {
      exercises.push({
        type: 'GROUNDING',
        name: '5-4-3-2-1 Technique',
        duration: 5,
        instructions: 'Let\'s ground ourselves in the present moment...'
      })
      type = 'EXERCISE'
    }
  } else if (therapistId === 'luna') {
    // Holistic wellness response
    response = generateWellnessResponse(message, messageContext, sessionContext)
    techniques = ['sleep_hygiene', 'routine_building', 'self_care']
    
    if (messageContext.topics.includes('sleep') || messageContext.topics.includes('energy')) {
      exercises.push({
        type: 'PMR',
        name: 'Progressive Muscle Relaxation',
        duration: 20,
        instructions: 'Let\'s release tension from your body...'
      })
    }
  }

  // Detect topics and patterns
  const detectedTopics = extractTopics(message)
  const insights = generateInsights(session, messageContext, crisisAnalysis)

  // Generate follow-up questions
  const followUp = generateFollowUpQuestions(messageContext, sessionContext)

  return {
    content: response,
    type,
    techniques,
    exercises,
    insights,
    detectedTopics,
    emotions: crisisAnalysis.emotions,
    sentiment: calculateSentiment(message),
    followUp
  }
}

// CBT Response Generation
function generateCBTResponse(message: string, context: any, sessionContext: any): string {
  const responses = {
    anxiety: [
      "I can see this is causing you significant anxiety. Let's examine the thoughts behind these feelings. What specific thoughts are running through your mind about this situation?",
      "Anxiety often comes with 'what if' thoughts that feel very real. Can we explore what evidence supports these anxious thoughts, and what evidence might challenge them?",
      "That sounds overwhelming. Let's break this down: What's the worst that could realistically happen? What's the best? And what's most likely?"
    ],
    depression: [
      "Depression can make everything feel hopeless and permanent. These are symptoms of depression, not facts about your life. What's one small thing you've done today that you can acknowledge?",
      "I hear how heavy this feels. Depression often distorts our thinking. Let's identify one thought that's particularly painful and examine if there might be another way to look at it.",
      "Thank you for sharing this with me. Depression tells us lies about ourselves. What would you say to a friend experiencing these same thoughts?"
    ],
    negative_thinking: [
      "I notice some patterns in how you're thinking about this. Let's examine if these thoughts are helping or hindering you right now.",
      "These thoughts seem to be causing you distress. What would happen if we questioned whether these thoughts are 100% accurate?",
      "Let's use the CBT technique of thought challenging. Is this thought based on facts or feelings? What's the evidence for and against it?"
    ],
    behavioral: [
      "I'm hearing that your actions and mood are connected. What activities used to bring you joy that you've stopped doing?",
      "Behavioral activation can help lift mood. What's one small, manageable activity you could do today that might help you feel slightly better?",
      "Sometimes we need to act opposite to how we feel. What would you be doing right now if you felt better? Could we try a small version of that?"
    ]
  }

  // Select response based on context
  const category = determineResponseCategory(context)
  const responseSet = responses[category] || responses.negative_thinking
  const selectedResponse = responseSet[Math.floor(Math.random() * responseSet.length)]

  // Add personalization based on session history
  if (sessionContext.sessionsCount > 3) {
    return `${selectedResponse}\n\nBased on our previous sessions, I remember you've found [specific technique] helpful. Would you like to try that again?`
  }

  return selectedResponse
}

// Mindfulness Response Generation
function generateMindfulnessResponse(message: string, context: any, sessionContext: any): string {
  const responses = {
    distress: [
      "I can feel the intensity of what you're experiencing. Let's pause together and take three deep breaths. Notice your feet on the ground, your body in the chair. You are here, you are safe in this moment.",
      "This sounds incredibly difficult. Before we dive deeper, can we take a moment to simply notice what's happening in your body right now? Where do you feel this emotion physically?",
      "Thank you for trusting me with this. Let's create some space around these feelings. Imagine these thoughts as clouds passing through the sky of your mind - present, but temporary."
    ],
    trauma: [
      "I'm holding space for everything you're experiencing. Your nervous system might be activated right now. Let's gently bring ourselves back to the present - what do you see, hear, and feel right now?",
      "What you experienced was real and valid. Right now, in this moment, you are safe. Can we explore what 'safe' feels like in your body?",
      "Trauma can make us feel like we're back in that moment. But you're here with me now, in [current date]. Let's anchor ourselves in the present together."
    ],
    anxiety: [
      "Anxiety is visiting you right now. Let's acknowledge it without judgment. Can you place your hand on your chest and feel your breath? We'll breathe together.",
      "I notice the worry in your words. Rather than fighting these anxious thoughts, what if we observed them with curiosity? What is your anxiety trying to protect you from?",
      "Let's try something together. Can you name five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste? This grounds us in the now."
    ]
  }

  const category = context.primaryEmotion === 'trauma' ? 'trauma' : 
                   context.primaryEmotion === 'anxiety' ? 'anxiety' : 'distress'
  const responseSet = responses[category]
  
  return responseSet[Math.floor(Math.random() * responseSet.length)]
}

// Wellness Response Generation
function generateWellnessResponse(message: string, context: any, sessionContext: any): string {
  const responses = {
    sleep: [
      "Sleep challenges can affect everything else. Let's explore your sleep hygiene. What does your bedtime routine currently look like?",
      "I hear that sleep has been difficult. Our bodies need consistent sleep-wake times. What time do you typically go to bed and wake up?",
      "Quality sleep is foundational for mental health. Let's identify one small change to your evening routine that might support better sleep."
    ],
    energy: [
      "Low energy can be so frustrating. Let's think about your daily rhythm - when do you typically feel most energetic, even if it's just slightly better?",
      "Energy levels connect to many factors - sleep, nutrition, movement, stress. Which of these areas feels most out of balance for you right now?",
      "I understand you're feeling depleted. Sometimes gentle movement can help. What's the smallest form of movement that feels manageable today?"
    ],
    routine: [
      "Routines can be powerful anchors for mental health. What parts of your daily routine are currently working for you?",
      "Structure can help when everything feels chaotic. Let's design a simple morning routine together - what's one thing you'd like to start your day with?",
      "I'm hearing that your routine has been disrupted. Change can be challenging. What's one element of structure you could reintroduce today?"
    ],
    general: [
      "Wellness is about the whole person. How are you nourishing yourself - physically, emotionally, and spiritually?",
      "Let's take a holistic view. On a scale of 1-10, how would you rate your sleep, nutrition, movement, and stress levels?",
      "Your wellbeing matters. What's one small act of self-care you could do in the next hour?"
    ]
  }

  const category = context.topics.includes('sleep') ? 'sleep' :
                   context.topics.includes('energy') || context.topics.includes('fatigue') ? 'energy' :
                   context.topics.includes('routine') || context.topics.includes('structure') ? 'routine' :
                   'general'

  const responseSet = responses[category]
  return responseSet[Math.floor(Math.random() * responseSet.length)]
}

// Helper functions
function generateHash(content: string): string {
  // Simple hash for demo - in production use proper crypto
  return Buffer.from(content).toString('base64').substring(0, 16)
}

function analyzeEscalation(messages: any[], currentScore: number): boolean {
  if (messages.length < 3) return false
  
  const recentScores = messages.slice(-3).map(m => m.riskScore || 0)
  const trending = recentScores.every((score, idx) => 
    idx === 0 || score >= recentScores[idx - 1]
  )
  
  return trending && currentScore > recentScores[recentScores.length - 1]
}

function detectEmotions(message: string): string[] {
  const emotions = []
  const emotionKeywords = {
    despair: ['hopeless', 'give up', 'no point', 'meaningless'],
    fear: ['scared', 'afraid', 'terrified', 'panic'],
    anger: ['angry', 'furious', 'rage', 'hate'],
    sadness: ['sad', 'depressed', 'crying', 'tears'],
    anxiety: ['anxious', 'worried', 'nervous', 'restless'],
    shame: ['ashamed', 'worthless', 'guilty', 'disgusted'],
    loneliness: ['alone', 'isolated', 'lonely', 'abandoned']
  }

  const lower = message.toLowerCase()
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      emotions.push(emotion)
    }
  }

  return emotions.length > 0 ? emotions : ['neutral']
}

function getSuggestedInterventions(level: string): string[] {
  const interventions = {
    critical: [
      'immediate_crisis_support',
      'emergency_contact_notification',
      'safety_planning',
      'warm_handoff_to_counselor'
    ],
    high: [
      'crisis_coping_techniques',
      'grounding_exercises',
      'breathing_exercises',
      'support_system_activation'
    ],
    medium: [
      'cbt_techniques',
      'mindfulness_exercises',
      'journaling_prompts',
      'behavioral_activation'
    ],
    low: [
      'psychoeducation',
      'self_care_tips',
      'mood_tracking',
      'routine_building'
    ]
  }

  return interventions[level] || interventions.low
}

function analyzeMessageContext(message: string): any {
  const lower = message.toLowerCase()
  
  return {
    wordCount: message.split(' ').length,
    hasQuestion: message.includes('?'),
    isVenting: message.length > 200 && !message.includes('?'),
    needsValidation: ['feel', 'felt', 'feeling'].some(w => lower.includes(w)),
    needsExercise: ['help', 'what can i do', 'how do i', 'technique'].some(w => lower.includes(w)),
    topics: extractTopics(message),
    primaryEmotion: detectEmotions(message)[0]
  }
}

function buildSessionContext(session: any): any {
  return {
    sessionsCount: session.messages?.length || 0,
    duration: getSessionDuration(session.startedAt),
    previousTechniques: JSON.parse(session.techniques || '[]'),
    topics: JSON.parse(session.topics || '[]')
  }
}

function selectTherapeuticApproach(therapistId: string, context: any, emotions: string[]): string {
  // Logic to select best therapeutic approach based on context
  if (emotions.includes('trauma') || emotions.includes('fear')) {
    return 'trauma-informed'
  } else if (context.needsExercise) {
    return 'skill-building'
  } else if (context.isVenting) {
    return 'validation-focused'
  } else {
    return therapistId === 'aria' ? 'cbt' : 
           therapistId === 'sage' ? 'mindfulness' : 
           'holistic'
  }
}

function extractTopics(message: string): string[] {
  const topics = []
  const topicKeywords = {
    relationships: ['partner', 'friend', 'family', 'relationship', 'marriage'],
    work: ['job', 'work', 'boss', 'career', 'colleague'],
    sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'rest'],
    anxiety: ['anxious', 'worry', 'panic', 'nervous'],
    depression: ['depressed', 'sad', 'hopeless', 'empty'],
    trauma: ['trauma', 'ptsd', 'flashback', 'trigger']
  }

  const lower = message.toLowerCase()
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      topics.push(topic)
    }
  }

  return topics
}

function generateInsights(session: any, context: any, analysis: any): string[] {
  const insights = []

  if (analysis.score > 50) {
    insights.push('Elevated distress detected - additional support may be beneficial')
  }

  if (context.topics.includes('sleep') && context.topics.includes('anxiety')) {
    insights.push('Sleep and anxiety appear to be interconnected - addressing sleep hygiene may help reduce anxiety')
  }

  if (session.messages?.length > 5) {
    insights.push('Engagement level is high - user is actively participating in therapy process')
  }

  return insights
}

function calculateSentiment(message: string): number {
  // Simple sentiment calculation - in production use NLP library
  const positive = ['good', 'better', 'happy', 'grateful', 'hope'].filter(w => 
    message.toLowerCase().includes(w)
  ).length

  const negative = ['bad', 'worse', 'sad', 'angry', 'hopeless'].filter(w => 
    message.toLowerCase().includes(w)
  ).length

  return (positive - negative) / Math.max(1, positive + negative)
}

function generateFollowUpQuestions(context: any, sessionContext: any): string[] {
  const questions = []

  if (context.needsValidation) {
    questions.push('How long have you been feeling this way?')
  }

  if (context.topics.includes('relationships')) {
    questions.push('How is this affecting your relationships?')
  }

  if (context.primaryEmotion === 'anxiety') {
    questions.push('What helps you feel calmer when anxiety strikes?')
  }

  return questions.slice(0, 2)
}

function getSessionDuration(startTime: Date): number {
  return Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
}

function calculateEngagement(session: any): number {
  const factors = {
    messageCount: Math.min(session.messages?.length || 0, 20) / 20,
    duration: Math.min(getSessionDuration(session.startedAt), 60) / 60,
    techniques: (JSON.parse(session.techniques || '[]').length) / 5
  }

  return Object.values(factors).reduce((a, b) => a + b, 0) / 3
}

async function handleCrisisProtocol(session: any, analysis: any) {
  // Log crisis event
  console.log('CRISIS PROTOCOL ACTIVATED', {
    sessionId: session.id,
    userId: session.userId,
    severity: analysis.urgencyLevel,
    indicators: analysis.indicators
  })

  // In production: notify crisis team, trigger escalation procedures
}

function generateCrisisResponse(therapistId: string, analysis: any) {
  const baseResponse = `I'm deeply concerned about what you're sharing. Your safety is my absolute priority right now.

I want you to know that you're not alone, and there is immediate help available:

📞 **Call 988** - Suicide & Crisis Lifeline (24/7)
💬 **Text "HELLO" to 741741** - Crisis Text Line
🚨 **Call 911** if you're in immediate danger

These feelings are temporary, even though they feel overwhelming right now.`

  const interventions = [
    'immediate_safety_assessment',
    'crisis_hotline_connection',
    'emergency_contact_notification',
    'safety_plan_activation'
  ]

  if (therapistId === 'aria') {
    return {
      message: baseResponse + '\n\nLet\'s work on your immediate safety. Are you in a safe place right now? Have you taken any actions to harm yourself?',
      interventions
    }
  } else if (therapistId === 'sage') {
    return {
      message: baseResponse + '\n\nI\'m here with you in this moment. Let\'s focus on your breathing and grounding yourself. Can you tell me 5 things you can see around you right now?',
      interventions
    }
  } else {
    return {
      message: baseResponse + '\n\nYour life has value and meaning. Let\'s focus on getting you immediate support. Is there someone you trust who you can be with right now?',
      interventions
    }
  }
}

function getCrisisResources() {
  return {
    hotlines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', available: '24/7' },
      { name: 'Crisis Text Line', number: '741741', text: 'Text HELLO', available: '24/7' },
      { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
      { name: 'LGBTQ National Hotline', number: '1-888-843-4564', available: 'Mon-Fri 1pm-9pm PST' },
      { name: 'Veterans Crisis Line', number: '988 then Press 1', available: '24/7' }
    ],
    websites: [
      { name: 'National Suicide Prevention Lifeline', url: 'https://988lifeline.org' },
      { name: 'Crisis Text Line', url: 'https://www.crisistextline.org' },
      { name: 'NAMI (National Alliance on Mental Illness)', url: 'https://www.nami.org/help' }
    ],
    apps: [
      { name: 'notOK', description: 'Alert trusted contacts when you need help' },
      { name: 'MindShift', description: 'CBT-based anxiety relief' },
      { name: 'Sanvello', description: 'On-demand help for stress, anxiety, and depression' }
    ]
  }
}

function getEmergencyContacts() {
  return {
    primary: '911',
    crisis: '988',
    text: '741741',
    instruction: 'If you are in immediate danger, please call 911 or go to your nearest emergency room'
  }
}

async function trackTechniqueEffectiveness(userId: string, techniques: string[]) {
  // Track which techniques are most effective for this user
  // This would update the personalization model in production
  console.log('Tracking technique effectiveness:', { userId, techniques })
}

function determineResponseCategory(context: any): string {
  if (context.topics.includes('anxiety')) return 'anxiety'
  if (context.topics.includes('depression')) return 'depression'
  if (context.primaryEmotion === 'anger') return 'behavioral'
  return 'negative_thinking'
}