import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, GroundingType, GroundingCategory, EvidenceLevel } from '@/lib/db'

// Get grounding techniques
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const includeSessions = searchParams.get('includeSessions') === 'true'

    // Stubbed grounding techniques
    const techniques = [
      {
        id: '1',
        name: '5-4-3-2-1 Sensory',
        description: 'Engage your senses to ground yourself in the present moment',
        type: GroundingType.SENSORY,
        category: GroundingCategory.ANXIETY,
        difficulty: 1,
        estimatedMinutes: 5,
        steps: [
          '5 things you can see',
          '4 things you can touch',
          '3 things you can hear',
          '2 things you can smell',
          '1 thing you can taste'
        ],
        benefits: ['Reduces anxiety', 'Brings awareness to present', 'Interrupts panic'],
        evidenceLevel: EvidenceLevel.HIGH,
        contraindications: []
      },
      {
        id: '2',
        name: 'Body Scan',
        description: 'Systematically focus on different parts of your body',
        type: GroundingType.PHYSICAL,
        category: GroundingCategory.DISSOCIATION,
        difficulty: 2,
        estimatedMinutes: 10,
        steps: [
          'Start at your toes',
          'Notice sensations without judgment',
          'Move up through your body slowly',
          'End at the top of your head'
        ],
        benefits: ['Reconnects with body', 'Reduces dissociation', 'Promotes relaxation'],
        evidenceLevel: EvidenceLevel.MODERATE,
        contraindications: ['Recent trauma', 'Body dysmorphia']
      },
      {
        id: '3',
        name: 'Mental Counting',
        description: 'Use counting exercises to focus your mind',
        type: GroundingType.MENTAL,
        category: GroundingCategory.PANIC_ATTACK,
        difficulty: 1,
        estimatedMinutes: 3,
        steps: [
          'Count backwards from 100 by 7s',
          'Or count objects in the room',
          'Or recite times tables',
          'Continue until calm'
        ],
        benefits: ['Distracts from panic', 'Engages logical thinking', 'Quick to implement'],
        evidenceLevel: EvidenceLevel.MODERATE,
        contraindications: []
      }
    ]

    // Filter techniques based on query params
    let filteredTechniques = techniques
    if (type) {
      filteredTechniques = filteredTechniques.filter(t => t.type === type)
    }
    if (category) {
      filteredTechniques = filteredTechniques.filter(t => t.category === category)
    }
    if (difficulty) {
      filteredTechniques = filteredTechniques.filter(t => t.difficulty === parseInt(difficulty))
    }

    // Stubbed user sessions
    let userSessions: any[] = []
    if (includeSessions && session?.user) {
      userSessions = [
        {
          id: 'session1',
          userId: session.user.id,
          techniqueId: '1',
          usedAt: new Date(Date.now() - 3600000),
          effectivenessRating: 4,
          situation: 'Anxiety at work',
          notes: 'Helped me calm down quickly',
          durationMinutes: 5
        }
      ]
    }

    // Calculate user statistics if authenticated
    let userStats = null
    if (session?.user && includeSessions) {
      userStats = {
        totalTechniquesUsed: userSessions.length,
        favoriteType: GroundingType.SENSORY,
        averageEffectiveness: 4.2,
        lastUsed: userSessions[0]?.usedAt || null,
        streakDays: 3
      }
    }

    return NextResponse.json({
      techniques: filteredTechniques,
      sessions: userSessions,
      userStats,
      types: Object.values(GroundingType),
      categories: Object.values(GroundingCategory),
      evidenceLevels: Object.values(EvidenceLevel)
    })
  } catch (error) {
    console.error('Error fetching grounding techniques:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grounding techniques' },
      { status: 500 }
    )
  }
}

// Record using a grounding technique
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      techniqueId,
      effectivenessRating,
      situation,
      notes,
      durationMinutes
    } = body

    // Validate required fields
    if (!techniqueId) {
      return NextResponse.json(
        { error: 'Technique ID is required' },
        { status: 400 }
      )
    }

    // Create stubbed session
    const newSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      techniqueId,
      usedAt: new Date(),
      effectivenessRating: effectivenessRating || null,
      situation: situation || null,
      notes: notes || null,
      durationMinutes: durationMinutes || null
    }

    // Get achievement if milestone reached
    let achievement = null
    if (Math.random() > 0.7) {
      achievement = {
        name: 'Grounding Master',
        description: 'Used grounding techniques 10 times',
        xpReward: 50
      }
    }

    return NextResponse.json({
      session: newSession,
      achievement,
      message: 'Grounding session recorded successfully'
    })
  } catch (error) {
    console.error('Error recording grounding session:', error)
    return NextResponse.json(
      { error: 'Failed to record session' },
      { status: 500 }
    )
  }
}

// Get grounding technique recommendations
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    // Return personalized recommendations
    const recommendations = {
      basedOnTime: {
        morning: ['Body Scan', 'Mindful Breathing'],
        afternoon: ['5-4-3-2-1 Sensory', 'Mental Counting'],
        evening: ['Progressive Muscle Relaxation', 'Visualization']
      },
      basedOnSituation: {
        work: ['Mental Counting', 'Desk Stretches'],
        home: ['Body Scan', '5-4-3-2-1 Sensory'],
        social: ['Breathing Focus', 'Grounding Objects']
      },
      quickTechniques: [
        { id: '1', name: '5-4-3-2-1 Sensory', minutes: 5 },
        { id: '3', name: 'Mental Counting', minutes: 3 }
      ],
      recommended: session?.user ? [
        {
          id: '1',
          name: '5-4-3-2-1 Sensory',
          reason: 'Based on your history with anxiety'
        }
      ] : []
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}