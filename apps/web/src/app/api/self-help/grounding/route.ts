import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, ActivityType, GroundingType, GroundingCategory } from '@astralcore/database'

const prisma = new PrismaClient()

// Get grounding techniques
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeSessions = searchParams.get('sessions') === 'true'
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    // Build where clause for techniques
    const techniqueWhere: any = {
      isActive: true
    }

    if (type) {
      techniqueWhere.type = type.toUpperCase()
    }

    if (category) {
      techniqueWhere.category = category.toUpperCase()
    }

    // Get grounding techniques
    const techniques = await prisma.groundingTechnique.findMany({
      where: techniqueWhere,
      orderBy: [
        { evidenceLevel: 'desc' },
        { name: 'asc' }
      ]
    })

    let userSessions: any[] = []
    if (includeSessions) {
      // Get user's recent sessions
      userSessions = await prisma.groundingSession.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          technique: {
            select: {
              name: true,
              type: true,
              category: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        take: 20
      })
    }

    // Get user stats
    const stats = await getGroundingStats(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        techniques,
        sessions: userSessions,
        stats
      }
    })

  } catch (error) {
    console.error('Grounding techniques retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve grounding techniques' },
      { status: 500 }
    )
  }
}

// Create grounding session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.techniqueId) {
      return NextResponse.json({ error: 'Technique ID is required' }, { status: 400 })
    }

    // Verify technique exists
    const technique = await prisma.groundingTechnique.findUnique({
      where: { id: data.techniqueId }
    })

    if (!technique) {
      return NextResponse.json({ error: 'Technique not found' }, { status: 404 })
    }

    // Create grounding session
    const groundingSession = await prisma.groundingSession.create({
      data: {
        userId: session.user.id,
        techniqueId: data.techniqueId,
        startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        duration: data.duration,
        triggerType: data.triggerType,
        severityBefore: data.severityBefore,
        severityAfter: data.severityAfter,
        panicBefore: data.panicBefore,
        panicAfter: data.panicAfter,
        dissociationBefore: data.dissociationBefore,
        dissociationAfter: data.dissociationAfter,
        stepsCompleted: data.stepsCompleted || [],
        completionRate: data.completionRate || 0,
        wasHelpful: data.wasHelpful,
        rating: data.rating,
        notes: data.notes,
        wouldUseAgain: data.wouldUseAgain
      }
    })

    // Calculate improvements for analysis
    const severityImprovement = data.severityBefore && data.severityAfter 
      ? data.severityBefore - data.severityAfter 
      : 0
    const panicImprovement = data.panicBefore && data.panicAfter 
      ? data.panicBefore - data.panicAfter 
      : 0
    const dissociationImprovement = data.dissociationBefore && data.dissociationAfter 
      ? data.dissociationBefore - data.dissociationAfter 
      : 0

    // Calculate XP and points based on completion and effectiveness
    let xpEarned = 25 // Base XP for starting grounding technique
    let pointsEarned = 35

    if (data.completedAt) {
      xpEarned += Math.floor(data.completionRate * 25) // Up to 25 XP for completion rate
    }

    if (severityImprovement > 0) {
      xpEarned += Math.floor(severityImprovement * 8)
      pointsEarned += Math.floor(severityImprovement * 5)
    }

    if (panicImprovement > 0) {
      xpEarned += Math.floor(panicImprovement * 6)
      pointsEarned += Math.floor(panicImprovement * 4)
    }

    if (dissociationImprovement > 0) {
      xpEarned += Math.floor(dissociationImprovement * 7)
      pointsEarned += Math.floor(dissociationImprovement * 5)
    }

    // Bonus for high-evidence techniques
    if (technique.evidenceLevel === 'HIGH') {
      xpEarned += 10
      pointsEarned += 15
    }

    // Update user activity for gamification
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: ActivityType.CHALLENGE_COMPLETE,
        description: `Completed ${technique.name} grounding technique`,
        xpEarned,
        pointsEarned,
        metadata: {
          techniqueId: data.techniqueId,
          techniqueName: technique.name,
          type: technique.type,
          category: technique.category,
          duration: data.duration,
          completionRate: data.completionRate,
          triggerType: data.triggerType,
          severityImprovement,
          panicImprovement,
          dissociationImprovement
        }
      }
    })

    // Check for crisis indicators and provide recommendations
    const needsSupport = await assessGroundingOutcome(data, technique)
    
    if (needsSupport.severity >= 8) {
      await createSupportAlert(session.user.id, {
        trigger: 'grounding_session',
        severity: needsSupport.severity,
        technique: technique.name,
        improvements: {
          severity: severityImprovement,
          panic: panicImprovement,
          dissociation: dissociationImprovement
        },
        recommendations: needsSupport.recommendations
      })
    }

    return NextResponse.json({
      success: true,
      data: groundingSession,
      rewards: {
        xpEarned,
        pointsEarned
      },
      support: needsSupport
    })

  } catch (error) {
    console.error('Grounding session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to save grounding session' },
      { status: 500 }
    )
  }
}

// Seed default grounding techniques
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if techniques already exist
    const existingCount = await prisma.groundingTechnique.count()
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Techniques already exist' })
    }

    // Default grounding techniques with evidence-based configurations
    const defaultTechniques = [
      {
        name: '5-4-3-2-1 Technique',
        description: 'Engage all five senses to return to the present',
        type: GroundingType.SENSORY,
        category: GroundingCategory.PANIC_ATTACK,
        instructions: [
          { step: 1, instruction: 'Look around and name 5 things you can see' },
          { step: 2, instruction: 'Notice 4 things you can touch' },
          { step: 3, instruction: 'Listen for 3 things you can hear' },
          { step: 4, instruction: 'Identify 2 things you can smell' },
          { step: 5, instruction: 'Notice 1 thing you can taste' }
        ],
        duration: 5,
        evidenceLevel: 'HIGH',
        bestFor: ['Panic attacks', 'Dissociation', 'Overwhelming anxiety'],
        contraindications: []
      },
      {
        name: 'TIPP Technique',
        description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation',
        type: GroundingType.PHYSICAL,
        category: GroundingCategory.TRAUMA_RESPONSE,
        instructions: [
          { step: 1, instruction: 'Apply cold water to face or hold ice cubes', duration: 30 },
          { step: 2, instruction: 'Do jumping jacks or run in place', duration: 30 },
          { step: 3, instruction: 'Practice slow, deep breathing', duration: 60 },
          { step: 4, instruction: 'Tense and relax muscle groups progressively', duration: 180 }
        ],
        duration: 10,
        evidenceLevel: 'HIGH',
        bestFor: ['Crisis situations', 'Self-harm urges', 'Intense emotional distress'],
        contraindications: ['Heart conditions', 'Eating disorders (cold water)']
      },
      {
        name: 'Body Scan',
        description: 'Progressive awareness of physical sensations',
        type: GroundingType.MENTAL,
        category: GroundingCategory.ANXIETY,
        instructions: [
          { step: 1, instruction: 'Focus on your toes, notice any sensations' },
          { step: 2, instruction: 'Move attention up your legs, feeling weight and temperature' },
          { step: 3, instruction: 'Notice your breathing, chest rising and falling' },
          { step: 4, instruction: 'Feel your arms resting, hands touching surfaces' },
          { step: 5, instruction: 'Notice tension in jaw, eyes, forehead' }
        ],
        duration: 15,
        evidenceLevel: 'HIGH',
        bestFor: ['General anxiety', 'Stress relief', 'Mindfulness practice'],
        contraindications: []
      },
      {
        name: 'Category Grounding',
        description: 'Mental grounding through categorization',
        type: GroundingType.MENTAL,
        category: GroundingCategory.OVERWHELM,
        instructions: [
          { step: 1, instruction: 'Name animals that start with each letter of the alphabet' },
          { step: 2, instruction: 'List colors you can see around you' },
          { step: 3, instruction: 'Think of countries you\'d like to visit' },
          { step: 4, instruction: 'Recall your favorite foods' },
          { step: 5, instruction: 'Remember movies you\'ve enjoyed' }
        ],
        duration: 8,
        evidenceLevel: 'MODERATE',
        bestFor: ['Racing thoughts', 'Overwhelm', 'Rumination'],
        contraindications: []
      },
      {
        name: 'Physical Grounding',
        description: 'Use physical sensations to anchor yourself',
        type: GroundingType.PHYSICAL,
        category: GroundingCategory.DISSOCIATION,
        instructions: [
          { step: 1, instruction: 'Hold an ice cube in your hand' },
          { step: 2, instruction: 'Feel different textures around you' },
          { step: 3, instruction: 'Press firmly on your palm or thigh' },
          { step: 4, instruction: 'Push against a wall with your palms' },
          { step: 5, instruction: 'Snap a rubber band on your wrist gently' }
        ],
        duration: 5,
        evidenceLevel: 'MODERATE',
        bestFor: ['Dissociation', 'Depersonalization', 'Feeling disconnected'],
        contraindications: []
      },
      {
        name: 'Grounding Breath',
        description: 'Combine breathing with sensory awareness',
        type: GroundingType.MOVEMENT,
        category: GroundingCategory.FLASHBACK,
        instructions: [
          { step: 1, instruction: 'Breathe in for 4 counts while noticing your feet on the ground' },
          { step: 2, instruction: 'Hold for 4 counts while feeling your center' },
          { step: 3, instruction: 'Exhale for 6 counts while releasing tension' },
          { step: 4, instruction: 'Repeat while saying "I am safe in this moment"' }
        ],
        duration: 6,
        evidenceLevel: 'HIGH',
        bestFor: ['Flashbacks', 'Trauma responses', 'Building safety'],
        contraindications: []
      }
    ]

    // Create techniques
    const createdTechniques = await Promise.all(
      defaultTechniques.map(technique =>
        prisma.groundingTechnique.create({
          data: technique
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Created ${createdTechniques.length} grounding techniques`,
      data: createdTechniques
    })

  } catch (error) {
    console.error('Grounding techniques seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to create grounding techniques' },
      { status: 500 }
    )
  }
}

// Get grounding statistics for user
async function getGroundingStats(userId: string) {
  const stats = await prisma.groundingSession.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { 
      duration: true
    },
    _avg: {
      severityBefore: true,
      severityAfter: true,
      panicBefore: true,
      panicAfter: true,
      dissociationBefore: true,
      dissociationAfter: true,
      completionRate: true,
      rating: true
    }
  })

  // Get technique preferences by category
  const categoryUsage = await prisma.groundingSession.groupBy({
    by: ['techniqueId'],
    where: { userId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  // Get trigger analysis
  const triggerCounts = await prisma.groundingSession.groupBy({
    by: ['triggerType'],
    where: { 
      userId,
      triggerType: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })

  // Get effectiveness data
  const recentSessions = await prisma.groundingSession.findMany({
    where: {
      userId,
      severityBefore: { not: null },
      severityAfter: { not: null }
    },
    orderBy: { startedAt: 'desc' },
    take: 10,
    select: {
      severityBefore: true,
      severityAfter: true,
      panicBefore: true,
      panicAfter: true,
      dissociationBefore: true,
      dissociationAfter: true,
      completionRate: true,
      startedAt: true,
      technique: {
        select: {
          name: true,
          type: true,
          category: true
        }
      }
    }
  })

  const effectiveness = recentSessions.map(session => ({
    date: session.startedAt,
    severityImprovement: (session.severityBefore || 0) - (session.severityAfter || 0),
    panicImprovement: (session.panicBefore || 0) - (session.panicAfter || 0),
    dissociationImprovement: (session.dissociationBefore || 0) - (session.dissociationAfter || 0),
    completionRate: session.completionRate || 0,
    technique: session.technique
  }))

  return {
    totalSessions: stats._count.id || 0,
    totalMinutes: Math.round((stats._sum.duration || 0) / 60),
    averageCompletionRate: Math.round((stats._avg.completionRate || 0) * 100),
    averageRating: stats._avg.rating || 0,
    averageSeverityImprovement: recentSessions.length > 0
      ? effectiveness.reduce((sum, e) => sum + e.severityImprovement, 0) / effectiveness.length
      : 0,
    averagePanicImprovement: recentSessions.length > 0
      ? effectiveness.reduce((sum, e) => sum + e.panicImprovement, 0) / effectiveness.length
      : 0,
    averageDissociationImprovement: recentSessions.length > 0
      ? effectiveness.reduce((sum, e) => sum + e.dissociationImprovement, 0) / effectiveness.length
      : 0,
    favoriteTechniques: categoryUsage,
    commonTriggers: triggerCounts,
    recentEffectiveness: effectiveness
  }
}

// Assess grounding session outcome and need for support
async function assessGroundingOutcome(sessionData: any, technique: any) {
  let severity = 1
  const recommendations = []

  // Assess initial severity
  if (sessionData.severityBefore >= 8) {
    severity = Math.max(severity, 8)
  }

  // Check if grounding was effective
  const severityImprovement = sessionData.severityBefore && sessionData.severityAfter 
    ? sessionData.severityBefore - sessionData.severityAfter 
    : 0

  if (severityImprovement <= 0 && sessionData.severityBefore >= 7) {
    severity = Math.max(severity, 7)
    recommendations.push('Consider trying a different grounding technique')
    recommendations.push('You might benefit from speaking with a mental health professional')
  }

  // Check completion rate
  if (sessionData.completionRate < 0.5) {
    recommendations.push('Try breaking the technique into smaller steps')
    recommendations.push('Practice grounding techniques when you\'re calm to build familiarity')
  }

  // Check for dissociation
  if (sessionData.dissociationBefore >= 7) {
    severity = Math.max(severity, 7)
    recommendations.push('Physical grounding techniques may be most helpful for dissociation')
    recommendations.push('Consider the TIPP technique for intense dissociation')
  }

  // Check for panic
  if (sessionData.panicBefore >= 8) {
    severity = Math.max(severity, 7)
    recommendations.push('The 5-4-3-2-1 technique is excellent for panic attacks')
    recommendations.push('Remember that panic attacks will pass - you are safe')
  }

  // Positive reinforcement
  if (severityImprovement > 2) {
    recommendations.push('Excellent work! You\'ve made significant improvement')
    recommendations.push('Consider practicing this technique regularly to build resilience')
  }

  // Technique-specific recommendations
  if (technique.type === 'PHYSICAL' && sessionData.severityAfter > sessionData.severityBefore) {
    recommendations.push('Physical techniques may not be right for you - try sensory or mental grounding')
  }

  if (technique.category === 'TRAUMA_RESPONSE' && sessionData.completionRate > 0.8) {
    recommendations.push('You handled this trauma response well - you\'re building resilience')
  }

  return {
    severity,
    recommendations: recommendations.length > 0 ? recommendations : ['Great job using grounding techniques!']
  }
}

// Create support alert (for persistent distress)
async function createSupportAlert(userId: string, alertData: any) {
  try {
    console.log('Support alert triggered for user:', userId, alertData)
    
    // This would:
    // 1. Log the need for additional support
    // 2. Provide personalized recommendations
    // 3. Suggest other self-help tools
    // 4. If severity is very high, escalate to crisis intervention
    // 5. Send gentle check-in notifications
    
    if (alertData.severity >= 9) {
      console.log('High severity detected - consider crisis intervention')
      // In production, this would trigger crisis protocols
    }
    
  } catch (error) {
    console.error('Failed to create support alert:', error)
  }
}