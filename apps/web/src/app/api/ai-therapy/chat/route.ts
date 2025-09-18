import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Verify session ownership - stubbed until database is configured
    const therapySession = {
      id: sessionId,
      userId: session.user.id,
      therapistId
    }

    // Store user message - stubbed for now
    const userMessage = {
      sessionId,
      sender: 'user',
      content: message,
      messageType,
      timestamp: new Date(),
      encrypted: true
    }

    // Analyze message for crisis indicators
    const crisisAnalysis = analyzeCrisisIndicators(message)
    
    if (crisisAnalysis.urgencyLevel === 'critical') {
      // Trigger crisis protocol
      return NextResponse.json({
        crisis: true,
        urgencyLevel: 'critical',
        resources: getCrisisResources(),
        message: 'We\'re here to help. Please consider reaching out to crisis support.',
        response: 'I notice you might be going through something really difficult right now. Your safety is my top priority.'
      })
    }

    // Generate AI response based on therapist personality
    const aiResponse = await generateTherapistResponse(therapistId, message, crisisAnalysis)

    // Store AI response - stubbed for now
    const aiMessage = {
      sessionId,
      sender: 'ai',
      content: aiResponse,
      messageType: 'text',
      timestamp: new Date(),
      encrypted: true
    }

    // Update session metrics - stubbed for now
    const updatedMetrics = {
      totalMessages: 2,
      lastActivity: new Date()
    }

    return NextResponse.json({
      response: aiResponse,
      crisisAnalysis,
      messageId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI therapy chat error:', error)
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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

    // Return stubbed chat history
    const messages = [
      {
        id: '1',
        sessionId,
        sender: 'ai',
        content: 'Hello! I\'m here to support you. How are you feeling today?',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        sessionId,
        sender: 'user',
        content: 'I\'ve been feeling anxious lately.',
        timestamp: new Date(Date.now() - 3000000)
      },
      {
        id: '3',
        sessionId,
        sender: 'ai',
        content: 'I understand anxiety can be really challenging. Can you tell me more about what\'s been triggering these feelings?',
        timestamp: new Date(Date.now() - 2400000)
      }
    ]

    return NextResponse.json({
      messages,
      sessionInfo: {
        id: sessionId,
        therapistId: searchParams.get('therapistId') || 'dr-aria',
        startTime: new Date(Date.now() - 7200000),
        messageCount: messages.length
      }
    })

  } catch (error) {
    console.error('Failed to fetch chat history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Crisis indicator analysis
function analyzeCrisisIndicators(message: string): {
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  confidence: number
} {
  const lowerMessage = message.toLowerCase()
  const indicators: string[] = []
  let urgencyScore = 0

  // Critical crisis keywords
  const criticalKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'hurt myself', 'overdose', 'no reason to live'
  ]

  const highKeywords = [
    'hopeless', 'worthless', 'cant go on', 'give up',
    'nobody cares', 'better off without me', 'ending it'
  ]

  const mediumKeywords = [
    'depressed', 'anxious', 'panic', 'scared',
    'alone', 'isolated', 'struggling', 'overwhelmed'
  ]

  // Check for critical indicators
  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) {
      indicators.push(keyword)
      urgencyScore = 100
      break
    }
  }

  // Check for high indicators
  if (urgencyScore < 100) {
    for (const keyword of highKeywords) {
      if (lowerMessage.includes(keyword)) {
        indicators.push(keyword)
        urgencyScore = Math.max(urgencyScore, 75)
      }
    }
  }

  // Check for medium indicators
  for (const keyword of mediumKeywords) {
    if (lowerMessage.includes(keyword)) {
      indicators.push(keyword)
      urgencyScore = Math.max(urgencyScore, 50)
    }
  }

  // Determine urgency level
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  if (urgencyScore >= 100) urgencyLevel = 'critical'
  else if (urgencyScore >= 75) urgencyLevel = 'high'
  else if (urgencyScore >= 50) urgencyLevel = 'medium'
  else urgencyLevel = 'low'

  return {
    urgencyLevel,
    indicators,
    confidence: Math.min(urgencyScore, 100) / 100
  }
}

// Generate therapist-specific responses
async function generateTherapistResponse(
  therapistId: string,
  message: string,
  crisisAnalysis: any
): Promise<string> {
  // Therapist personalities
  const therapists: Record<string, any> = {
    'dr-aria': {
      style: 'empathetic and warm',
      approach: 'cognitive-behavioral',
      tone: 'gentle and understanding'
    },
    'dr-sage': {
      style: 'analytical and structured',
      approach: 'evidence-based and practical',
      tone: 'professional and clear'
    },
    'dr-luna': {
      style: 'holistic and mindful',
      approach: 'mindfulness and acceptance-based',
      tone: 'calming and present-focused'
    }
  }

  const therapist = therapists[therapistId] || therapists['dr-aria']
  
  // Generate contextual response based on urgency
  if (crisisAnalysis.urgencyLevel === 'high' || crisisAnalysis.urgencyLevel === 'critical') {
    return generateCrisisResponse(therapist)
  }

  // Generate supportive response based on message content
  const responses: Record<string, string[]> = {
    'dr-aria': [
      "I hear you, and I want you to know that your feelings are valid. Let's explore this together.",
      "Thank you for sharing this with me. It takes courage to open up about these feelings.",
      "I can sense this is really weighing on you. Would you like to tell me more about what you're experiencing?"
    ],
    'dr-sage': [
      "Let's break this down together. What specific situations trigger these feelings?",
      "I'd like to understand the pattern here. When do you notice these thoughts are strongest?",
      "Based on what you're sharing, let's identify some practical strategies that might help."
    ],
    'dr-luna': [
      "Take a moment to breathe with me. Notice how you're feeling in your body right now.",
      "Let's gently explore what's present for you in this moment, without judgment.",
      "I invite you to observe these thoughts like clouds passing through the sky of your mind."
    ]
  }

  const therapistResponses = responses[therapistId] || responses['dr-aria']
  return therapistResponses[Math.floor(Math.random() * therapistResponses.length)]
}

// Generate crisis-specific response
function generateCrisisResponse(therapist: any): string {
  return `I'm deeply concerned about what you're going through right now. Your safety is my absolute priority. 

I want you to know that you don't have to face this alone. There are people who care and want to help:

📞 Call 988 (Suicide & Crisis Lifeline) - Available 24/7
💬 Text "HELLO" to 741741 (Crisis Text Line)
🆘 If you're in immediate danger, please call 911

These feelings you're experiencing are temporary, even though they feel overwhelming right now. You matter, and there is help available. 

Would you be willing to reach out to one of these resources while we continue talking? I'm here with you.`
}

// Get crisis resources
function getCrisisResources() {
  return {
    hotlines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', available: '24/7' },
      { name: 'Crisis Text Line', number: '741741', text: 'Text HELLO', available: '24/7' },
      { name: 'Emergency Services', number: '911', available: '24/7' }
    ],
    websites: [
      { name: 'National Suicide Prevention Lifeline', url: 'https://988lifeline.org' },
      { name: 'Crisis Text Line', url: 'https://www.crisistextline.org' },
      { name: 'SAMHSA National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' }
    ],
    immediate_actions: [
      'Remove any means of self-harm from your immediate area',
      'Go to a safe place or be with someone you trust',
      'Call a crisis hotline or trusted friend/family member',
      'If in immediate danger, go to the nearest emergency room or call 911'
    ]
  }
}