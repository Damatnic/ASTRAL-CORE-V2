import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@astralcore/database'

const prisma = new PrismaClient()

// Get breathing exercises
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeSessions = searchParams.get('sessions') === 'true'
    const difficulty = searchParams.get('difficulty')
    const technique = searchParams.get('technique')

    // Build where clause for exercises
    const exerciseWhere: any = {
      isActive: true
    }

    if (difficulty) {
      exerciseWhere.difficulty = difficulty.toUpperCase()
    }

    if (technique) {
      exerciseWhere.technique = technique.toUpperCase()
    }

    // Get breathing exercises
    const exercises = await prisma.breathingExercise.findMany({
      where: exerciseWhere,
      orderBy: [
        { difficulty: 'asc' },
        { name: 'asc' }
      ]
    })

    let userSessions = []
    if (includeSessions) {
      // Get user's recent sessions
      userSessions = await prisma.breathingSession.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          exercise: {
            select: {
              name: true,
              technique: true
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
    const stats = await getBreathingStats(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        exercises,
        sessions: userSessions,
        stats
      }
    })

  } catch (error) {
    console.error('Breathing exercises retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve breathing exercises' },
      { status: 500 }
    )
  }
}

// Create breathing session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 })
    }

    // Verify exercise exists
    const exercise = await prisma.breathingExercise.findUnique({
      where: { id: data.exerciseId }
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Create breathing session
    const breathingSession = await prisma.breathingSession.create({
      data: {
        userId: session.user.id,
        exerciseId: data.exerciseId,
        startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        duration: data.duration,
        cyclesCompleted: data.cyclesCompleted || 0,
        moodBefore: data.moodBefore,
        moodAfter: data.moodAfter,
        anxietyBefore: data.anxietyBefore,
        anxietyAfter: data.anxietyAfter,
        averageBreathRate: data.averageBreathRate,
        heartRateBefore: data.heartRateBefore,
        heartRateAfter: data.heartRateAfter,
        wasHelpful: data.wasHelpful,
        rating: data.rating,
        notes: data.notes
      }
    })

    // Calculate improvement for gamification
    const moodImprovement = data.moodAfter && data.moodBefore 
      ? data.moodAfter - data.moodBefore 
      : 0
    const anxietyImprovement = data.anxietyBefore && data.anxietyAfter 
      ? data.anxietyBefore - data.anxietyAfter 
      : 0

    // Calculate XP and points based on session completion and improvement
    let xpEarned = 20 // Base XP for completing session
    let pointsEarned = 30

    if (data.completedAt) {
      xpEarned += 15 // Bonus for completing full session
    }

    if (moodImprovement > 0) {
      xpEarned += Math.floor(moodImprovement * 5)
      pointsEarned += Math.floor(moodImprovement * 3)
    }

    if (anxietyImprovement > 0) {
      xpEarned += Math.floor(anxietyImprovement * 5)
      pointsEarned += Math.floor(anxietyImprovement * 3)
    }

    // Update user activity for gamification
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'SELF_CARE_ACTIVITY',
        description: `Completed ${exercise.name} breathing exercise`,
        xpEarned,
        pointsEarned,
        metadata: {
          exerciseId: data.exerciseId,
          exerciseName: exercise.name,
          technique: exercise.technique,
          duration: data.duration,
          cyclesCompleted: data.cyclesCompleted,
          moodImprovement,
          anxietyImprovement
        }
      }
    })

    // Check for crisis indicators
    if (data.anxietyBefore >= 8 || data.moodBefore <= 3) {
      // High anxiety or very low mood - suggest additional resources
      await createWellnessAlert(session.user.id, {
        trigger: 'breathing_session',
        severity: calculateWellnessSeverity(data.moodBefore, data.anxietyBefore),
        improvements: {
          mood: moodImprovement,
          anxiety: anxietyImprovement
        },
        recommendations: getRecommendations(data.moodBefore, data.anxietyBefore, moodImprovement, anxietyImprovement)
      })
    }

    return NextResponse.json({
      success: true,
      data: breathingSession,
      rewards: {
        xpEarned,
        pointsEarned
      }
    })

  } catch (error) {
    console.error('Breathing session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to save breathing session' },
      { status: 500 }
    )
  }
}

// Seed default breathing exercises
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if exercises already exist
    const existingCount = await prisma.breathingExercise.count()
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Exercises already exist' })
    }

    // Default breathing exercises with evidence-based configurations
    const defaultExercises = [
      {
        name: '4-7-8 Breathing',
        description: 'Reduces anxiety and helps with sleep',
        technique: 'FOUR_SEVEN_EIGHT',
        difficulty: 'BEGINNER',
        inhaleSeconds: 4,
        holdSeconds: 7,
        exhaleSeconds: 8,
        pauseSeconds: 0,
        cyclesRecommended: 4,
        instructions: [
          'Empty your lungs completely',
          'Inhale through your nose for 4 seconds',
          'Hold your breath for 7 seconds',
          'Exhale through your mouth for 8 seconds',
          'Repeat for 4 cycles'
        ],
        benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers blood pressure'],
        bestFor: ['Anxiety', 'Insomnia', 'Stress relief'],
        contraindications: []
      },
      {
        name: 'Box Breathing',
        description: 'Used by Navy SEALs for focus and calm',
        technique: 'BOX_BREATHING',
        difficulty: 'BEGINNER',
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 4,
        pauseSeconds: 4,
        cyclesRecommended: 5,
        instructions: [
          'Sit comfortably with your back straight',
          'Inhale for 4 seconds',
          'Hold for 4 seconds',
          'Exhale for 4 seconds',
          'Hold empty for 4 seconds',
          'Visualize drawing a box with each phase'
        ],
        benefits: ['Improves focus', 'Reduces stress', 'Enhances performance'],
        bestFor: ['Focus training', 'Performance anxiety', 'Stress management'],
        contraindications: []
      },
      {
        name: 'Coherent Breathing',
        description: 'Balances the nervous system',
        technique: 'COHERENT',
        difficulty: 'BEGINNER',
        inhaleSeconds: 5,
        holdSeconds: 0,
        exhaleSeconds: 5,
        pauseSeconds: 0,
        cyclesRecommended: 10,
        instructions: [
          'Breathe in slowly for 5 seconds',
          'Breathe out slowly for 5 seconds',
          'Maintain a smooth, continuous flow',
          'Focus on your heart center'
        ],
        benefits: ['Heart rate variability', 'Emotional balance', 'Reduces depression'],
        bestFor: ['Heart health', 'Emotional regulation', 'Depression'],
        contraindications: []
      },
      {
        name: 'Belly Breathing',
        description: 'Activates the relaxation response',
        technique: 'BELLY_BREATHING',
        difficulty: 'BEGINNER',
        inhaleSeconds: 4,
        holdSeconds: 2,
        exhaleSeconds: 6,
        pauseSeconds: 0,
        cyclesRecommended: 8,
        instructions: [
          'Place one hand on your chest, one on your belly',
          'Inhale deeply through your nose, expanding your belly',
          'Hold briefly',
          'Exhale slowly, letting your belly fall',
          'Chest should remain relatively still'
        ],
        benefits: ['Activates parasympathetic nervous system', 'Reduces cortisol', 'Improves digestion'],
        bestFor: ['General relaxation', 'Digestive issues', 'Sleep preparation'],
        contraindications: []
      },
      {
        name: 'Alternate Nostril',
        description: 'Balances left and right brain hemispheres',
        technique: 'ALTERNATE_NOSTRIL',
        difficulty: 'INTERMEDIATE',
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 4,
        pauseSeconds: 0,
        cyclesRecommended: 6,
        instructions: [
          'Close right nostril with thumb',
          'Inhale through left nostril',
          'Close both nostrils and hold',
          'Release right nostril and exhale',
          'Inhale through right nostril',
          'Switch and continue alternating'
        ],
        benefits: ['Mental clarity', 'Reduces anxiety', 'Balances energy'],
        bestFor: ['Mental clarity', 'Meditation preparation', 'Energy balance'],
        contraindications: []
      },
      {
        name: 'Fire Breath',
        description: 'Energizing and cleansing',
        technique: 'FIRE_BREATH',
        difficulty: 'ADVANCED',
        inhaleSeconds: 1,
        holdSeconds: 0,
        exhaleSeconds: 1,
        pauseSeconds: 0,
        cyclesRecommended: 30,
        instructions: [
          'Sit with spine straight',
          'Take quick, forceful exhales through nose',
          'Let inhales happen naturally',
          'Focus on rapid belly movements',
          'Stop if you feel dizzy'
        ],
        benefits: ['Increases energy', 'Improves focus', 'Detoxifying'],
        bestFor: ['Low energy', 'Mental fog', 'Morning routine'],
        contraindications: ['Pregnancy', 'High blood pressure', 'Heart conditions']
      }
    ]

    // Create exercises
    const createdExercises = await Promise.all(
      defaultExercises.map(exercise =>
        prisma.breathingExercise.create({
          data: exercise
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Created ${createdExercises.length} breathing exercises`,
      data: createdExercises
    })

  } catch (error) {
    console.error('Breathing exercises seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to create breathing exercises' },
      { status: 500 }
    )
  }
}

// Get breathing statistics for user
async function getBreathingStats(userId: string) {
  const stats = await prisma.breathingSession.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { 
      duration: true,
      cyclesCompleted: true
    },
    _avg: {
      moodBefore: true,
      moodAfter: true,
      anxietyBefore: true,
      anxietyAfter: true,
      rating: true
    }
  })

  // Get technique preferences
  const techniqueCounts = await prisma.breathingSession.groupBy({
    by: ['exerciseId'],
    where: { userId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  // Get improvement trends
  const recentSessions = await prisma.breathingSession.findMany({
    where: {
      userId,
      moodBefore: { not: null },
      moodAfter: { not: null }
    },
    orderBy: { startedAt: 'desc' },
    take: 10,
    select: {
      moodBefore: true,
      moodAfter: true,
      anxietyBefore: true,
      anxietyAfter: true,
      startedAt: true
    }
  })

  const improvements = recentSessions.map(session => ({
    date: session.startedAt,
    moodImprovement: (session.moodAfter || 0) - (session.moodBefore || 0),
    anxietyImprovement: (session.anxietyBefore || 0) - (session.anxietyAfter || 0)
  }))

  return {
    totalSessions: stats._count.id || 0,
    totalMinutes: Math.round((stats._sum.duration || 0) / 60),
    totalCycles: stats._sum.cyclesCompleted || 0,
    averageRating: stats._avg.rating || 0,
    averageMoodImprovement: recentSessions.length > 0
      ? improvements.reduce((sum, i) => sum + i.moodImprovement, 0) / improvements.length
      : 0,
    averageAnxietyImprovement: recentSessions.length > 0
      ? improvements.reduce((sum, i) => sum + i.anxietyImprovement, 0) / improvements.length
      : 0,
    favoriteExercises: techniqueCounts,
    recentImprovements: improvements
  }
}

// Calculate wellness severity
function calculateWellnessSeverity(moodBefore?: number, anxietyBefore?: number): number {
  let severity = 1
  
  if (moodBefore && moodBefore <= 3) {
    severity = Math.max(severity, 8)
  } else if (moodBefore && moodBefore <= 5) {
    severity = Math.max(severity, 6)
  }
  
  if (anxietyBefore && anxietyBefore >= 8) {
    severity = Math.max(severity, 8)
  } else if (anxietyBefore && anxietyBefore >= 6) {
    severity = Math.max(severity, 6)
  }
  
  return severity
}

// Get personalized recommendations
function getRecommendations(moodBefore?: number, anxietyBefore?: number, moodImprovement?: number, anxietyImprovement?: number): string[] {
  const recommendations = []
  
  if (moodImprovement && moodImprovement > 0) {
    recommendations.push('Great job! Your mood improved. Consider making breathing exercises a daily habit.')
  }
  
  if (anxietyImprovement && anxietyImprovement > 0) {
    recommendations.push('Excellent! Your anxiety decreased. Try using breathing exercises before stressful situations.')
  }
  
  if (moodBefore && moodBefore <= 3) {
    recommendations.push('Consider reaching out to a mental health professional for additional support.')
    recommendations.push('Try journaling after breathing exercises to process your emotions.')
  }
  
  if (anxietyBefore && anxietyBefore >= 8) {
    recommendations.push('For high anxiety, try the 4-7-8 technique or grounding exercises.')
    recommendations.push('Consider speaking with a healthcare provider about anxiety management.')
  }
  
  recommendations.push('Practice breathing exercises daily for best results.')
  
  return recommendations
}

// Create wellness alert (non-crisis support)
async function createWellnessAlert(userId: string, alertData: any) {
  try {
    console.log('Wellness alert triggered for user:', userId, alertData)
    // Implementation would provide personalized recommendations and resources
    // Could trigger gentle check-ins or suggest additional self-help tools
  } catch (error) {
    console.error('Failed to create wellness alert:', error)
  }
}