import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@/lib/db'

const prisma = new PrismaClient()

// Handle AI therapy chat messages
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { sessionId, message, therapistId, messageType = 'text' } = data

    // Validate required fields
    if (!sessionId || !message || !therapistId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify session ownership
    const therapySession = await prisma.aITherapySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!therapySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Store user message
    await prisma.therapyMessage.create({
      data: {
        sessionId,
        sender: 'user',
        content: message,
        messageType,
        timestamp: new Date(),
        encrypted: true
      }
    })

    // Analyze message for crisis indicators
    const crisisAnalysis = analyzeCrisisIndicators(message)
    
    // Generate AI response based on therapist
    const aiResponse = await generateAIResponse(therapistId, message, crisisAnalysis, therapySession)

    // Store AI response
    await prisma.therapyMessage.create({
      data: {
        sessionId,
        sender: 'therapist',
        content: aiResponse.content,
        messageType: aiResponse.type,
        metadata: {
          crisisLevel: crisisAnalysis.crisisLevel,
          emotionalAnalysis: crisisAnalysis.emotions,
          techniques: aiResponse.techniques,
          interventions: aiResponse.interventions
        },
        timestamp: new Date(),
        encrypted: true
      }
    })

    // Handle crisis intervention if needed
    if (crisisAnalysis.crisisLevel >= 8) {
      const { log } = await import('@/lib/logger')
      log.crisis('High crisis level detected in AI therapy session', session.user.id, sessionId, {
        crisisLevel: crisisAnalysis.crisisLevel,
        emotions: crisisAnalysis.emotions,
        messageLength: message.length,
        hasUrgencyWords: crisisAnalysis.hasUrgencyWords,
        therapistId
      })
      await handleCrisisIntervention(sessionId, session.user.id, crisisAnalysis)
    }

    // Update session analytics
    await updateSessionAnalytics(sessionId, message, crisisAnalysis)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      crisisLevel: crisisAnalysis.crisisLevel,
      interventionTriggered: crisisAnalysis.crisisLevel >= 8
    })

  } catch (error) {
    // Use structured logging with correlation ID for debugging
    const { log } = await import('@/lib/logger')
    const correlationId = crypto.randomUUID()
    
    log.error('AI therapy chat error', error as Error, {
      component: 'ai-therapy',
      endpoint: 'chat',
      correlationId,
      userId: (await getServerSession(authOptions))?.user?.id,
      method: 'POST'
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to process therapy chat message',
        correlationId // Include for debugging support
      },
      { status: 500 }
    )
  }
}

// Get chat history for a session
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Verify session ownership
    const therapySession = await prisma.aITherapySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!therapySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get messages for session
    const messages = await prisma.therapyMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        sender: true,
        content: true,
        messageType: true,
        timestamp: true,
        metadata: true
      }
    })

    return NextResponse.json({
      success: true,
      messages,
      sessionInfo: {
        therapistId: therapySession.therapistId,
        sessionType: therapySession.sessionType,
        startTime: therapySession.startTime
      }
    })

  } catch (error) {
    // Use structured logging with correlation ID for debugging
    const { log } = await import('@/lib/logger')
    const correlationId = crypto.randomUUID()
    
    log.error('Therapy chat history error', error as Error, {
      component: 'ai-therapy',
      endpoint: 'chat',
      correlationId,
      userId: (await getServerSession(authOptions))?.user?.id,
      method: 'GET'
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat history',
        correlationId // Include for debugging support
      },
      { status: 500 }
    )
  }
}

// Analyze message for crisis indicators
function analyzeCrisisIndicators(message: string) {
  const crisisKeywords = [
    { phrases: ['kill myself', 'suicide', 'end my life', 'take my own life'], weight: 10 },
    { phrases: ['want to die', 'better off dead', 'wish I was dead'], weight: 9 },
    { phrases: ['hurt myself', 'harm myself', 'self harm', 'cut myself'], weight: 8 },
    { phrases: ['hopeless', 'trapped', 'no way out', 'can\'t escape'], weight: 7 },
    { phrases: ['can\'t go on', 'unbearable', 'too much pain'], weight: 6 },
    { phrases: ['no point', 'meaningless', 'worthless', 'burden'], weight: 5 }
  ]

  const emotionKeywords = {
    anxiety: ['anxious', 'worried', 'panic', 'scared', 'nervous', 'afraid'],
    depression: ['sad', 'depressed', 'empty', 'numb', 'hopeless', 'worthless'],
    anger: ['angry', 'furious', 'rage', 'frustrated', 'irritated', 'mad'],
    fear: ['terrified', 'frightened', 'fearful', 'petrified'],
    shame: ['ashamed', 'guilty', 'embarrassed', 'humiliated']
  }

  let crisisLevel = 0
  const messageLower = message.toLowerCase()
  const detectedEmotions: string[] = []

  // Check for crisis indicators
  for (const { phrases, weight } of crisisKeywords) {
    for (const phrase of phrases) {
      if (messageLower.includes(phrase)) {
        crisisLevel = Math.max(crisisLevel, weight)
        break
      }
    }
  }

  // Detect emotions
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedEmotions.push(emotion)
    }
  }

  // Additional analysis
  const wordCount = message.split(/\s+/).length
  const urgencyWords = ['urgent', 'emergency', 'immediate', 'now', 'help']
  const hasUrgencyWords = urgencyWords.some(word => messageLower.includes(word))

  return {
    crisisLevel,
    emotions: detectedEmotions,
    wordCount,
    hasUrgencyWords,
    sentiment: calculateSentiment(message)
  }
}

// Calculate sentiment of message
function calculateSentiment(message: string) {
  const positiveWords = ['good', 'better', 'happy', 'grateful', 'hopeful', 'positive', 'glad', 'thankful']
  const negativeWords = ['bad', 'worse', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'angry']

  const words = message.toLowerCase().split(/\s+/)
  const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length
  const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length

  if (positiveCount + negativeCount === 0) return 0
  return (positiveCount - negativeCount) / (positiveCount + negativeCount)
}

// Generate AI response based on therapist type
async function generateAIResponse(
  therapistId: string, 
  message: string, 
  analysis: any, 
  session: any
) {
  const therapistResponses = {
    aria: {
      style: 'direct, solution-focused, CBT-based',
      crisisResponse: "I hear that you're in significant pain right now. Your safety is my primary concern. Are you in immediate danger of hurting yourself? If so, please call 988 or go to your nearest emergency room immediately.",
      techniques: ['cognitive_restructuring', 'thought_challenging', 'behavioral_activation', 'safety_planning']
    },
    sage: {
      style: 'gentle, mindful, trauma-informed',
      crisisResponse: "I want you to know that I'm here with you in this moment. The pain you're experiencing is real, but you don't have to face it alone. Are you physically safe right now?",
      techniques: ['grounding', 'mindfulness', 'body_awareness', 'emotional_regulation']
    },
    luna: {
      style: 'nurturing, holistic, wellness-focused',
      crisisResponse: "I can hear how much you're struggling. Your life has value and meaning. Let's focus on your immediate safety - are you in a safe space right now?",
      techniques: ['sleep_hygiene', 'wellness_planning', 'routine_building', 'self_care']
    }
  }

  const therapist = therapistResponses[therapistId as keyof typeof therapistResponses] || therapistResponses.aria

  let responseContent = ''
  let responseType = 'text'
  const interventions: string[] = []

  // Handle crisis-level messages
  if (analysis.crisisLevel >= 8) {
    responseContent = therapist.crisisResponse
    responseType = 'crisis_intervention'
    interventions.push('crisis_intervention_triggered')
  } else {
    // Generate therapeutic response based on emotions and content
    responseContent = generateTherapeuticResponse(therapistId, message, analysis)
  }

  return {
    content: responseContent,
    type: responseType,
    techniques: therapist.techniques,
    interventions
  }
}

// Generate therapeutic response based on analysis
function generateTherapeuticResponse(therapistId: string, message: string, analysis: any): string {
  const responses = {
    aria: {
      anxiety: "I can hear the anxiety in what you're sharing. Let's work together to examine these anxious thoughts. What specific thoughts are going through your mind about this situation?",
      depression: "Thank you for sharing something so difficult. When you think about this situation, what specific thoughts come up for you? What evidence supports or challenges these thoughts?",
      anger: "It sounds like you're experiencing significant anger. What thoughts are fueling this anger? Can we explore what might be underneath this feeling?",
      general: "I'm listening carefully to what you're sharing. Can you help me understand how this situation is affecting your thoughts and feelings?"
    },
    sage: {
      anxiety: "I can sense the anxiety you're carrying. Let's take a moment to ground ourselves in this present moment. Can you notice your breath and feel your feet on the floor?",
      depression: "I hold space for this pain you're experiencing. Right now, can you offer yourself the same compassion you would give to a dear friend?",
      anger: "I can feel the intensity of your anger. What does this feeling look like in your body right now? Let's create some breathing room around it.",
      general: "I'm here with you, fully present to whatever you're experiencing. What are you noticing in your body and breath right now?"
    },
    luna: {
      anxiety: "Anxiety can really impact our whole system. How have you been sleeping and caring for your basic needs lately?",
      depression: "Depression can make self-care feel impossible. What's one small thing you've done today to care for yourself?",
      anger: "That's a lot of intensity to carry. How is this affecting your sleep, appetite, or energy levels?",
      general: "I'm interested in your overall wellness. How are you doing with sleep, movement, nutrition, and daily rhythm?"
    }
  }

  const therapistResponses = responses[therapistId as keyof typeof responses] || responses.aria
  const primaryEmotion = analysis.emotions[0] || 'general'
  
  return therapistResponses[primaryEmotion as keyof typeof therapistResponses] || therapistResponses.general
}

// Handle crisis intervention
async function handleCrisisIntervention(sessionId: string, userId: string, analysis: any) {
  try {
    // Create crisis event log
    await prisma.crisisEvent.create({
      data: {
        userId,
        sessionId,
        crisisLevel: analysis.crisisLevel,
        triggerText: 'AI therapy session crisis detection',
        interventionType: 'ai_therapy_crisis',
        timestamp: new Date(),
        resolved: false
      }
    })

    // Update session to mark crisis intervention
    await prisma.aITherapySession.update({
      where: { id: sessionId },
      data: {
        crisisInterventionTriggered: true,
        crisisLevel: analysis.crisisLevel
      }
    })

    const { log } = await import('@/lib/logger')
    log.crisis('Crisis intervention triggered in AI therapy', userId, sessionId, {
      crisisLevel: analysis.crisisLevel,
      interventionType: 'ai_therapy_crisis'
    })
  } catch (error) {
    const { log } = await import('@/lib/logger')
    log.error('Failed to handle crisis intervention', error as Error, {
      component: 'ai-therapy',
      action: 'crisis-intervention',
      userId,
      sessionId
    })
  }
}

// Update session analytics
async function updateSessionAnalytics(sessionId: string, message: string, analysis: any) {
  try {
    const messageCount = await prisma.therapyMessage.count({
      where: { sessionId }
    })

    await prisma.aITherapySession.update({
      where: { id: sessionId },
      data: {
        messageCount,
        lastActivity: new Date(),
        averageSentiment: analysis.sentiment
      }
    })
  } catch (error) {
    const { log } = await import('@/lib/logger')
    log.error('Failed to update session analytics', error as Error, {
      component: 'ai-therapy',
      action: 'session-analytics',
      sessionId
    })
  }
}