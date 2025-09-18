import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, BreathingTechnique, ExerciseDifficulty } from '@/lib/db'

// Get breathing exercises and sessions
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const difficulty = searchParams.get('difficulty')
    const technique = searchParams.get('technique')
    const includeSessions = searchParams.get('includeSessions') === 'true'

    // Stubbed breathing exercises
    const exercises = [
      {
        id: '1',
        name: 'Box Breathing',
        description: 'A simple technique to reduce stress and improve focus',
        technique: BreathingTechnique.BOX_BREATHING,
        difficulty: ExerciseDifficulty.BEGINNER,
        durationSeconds: 240,
        instructions: ['Inhale for 4 seconds', 'Hold for 4 seconds', 'Exhale for 4 seconds', 'Hold for 4 seconds'],
        benefits: ['Reduces stress', 'Improves focus', 'Calms the nervous system'],
        contraindications: ['Pregnancy', 'Heart conditions']
      },
      {
        id: '2',
        name: '4-7-8 Breathing',
        description: 'A natural tranquilizer for the nervous system',
        technique: BreathingTechnique.FOUR_SEVEN_EIGHT,
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        durationSeconds: 180,
        instructions: ['Inhale for 4 seconds', 'Hold for 7 seconds', 'Exhale for 8 seconds'],
        benefits: ['Helps with sleep', 'Reduces anxiety', 'Lowers blood pressure'],
        contraindications: ['Respiratory issues']
      }
    ]

    // Filter exercises based on query params
    let filteredExercises = exercises
    if (difficulty) {
      filteredExercises = filteredExercises.filter(e => e.difficulty === difficulty)
    }
    if (technique) {
      filteredExercises = filteredExercises.filter(e => e.technique === technique)
    }

    // Stubbed user sessions
    let userSessions: any[] = []
    if (includeSessions && session?.user) {
      userSessions = [
        {
          id: 'session1',
          userId: session.user.id,
          exerciseId: '1',
          startedAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86000000),
          moodBefore: 5,
          moodAfter: 7,
          anxietyBefore: 7,
          anxietyAfter: 4,
          notes: 'Felt much calmer after the session'
        }
      ]
    }

    // Calculate progress analytics if user is authenticated
    let analytics = null
    if (session?.user && includeSessions) {
      analytics = {
        totalSessions: userSessions.length,
        totalMinutes: Math.round(userSessions.length * 4),
        averageMoodImprovement: 2,
        averageAnxietyReduction: 3,
        currentStreak: 3,
        longestStreak: 7,
        favoriteExercise: 'Box Breathing'
      }
    }

    return NextResponse.json({
      exercises: filteredExercises,
      sessions: userSessions,
      analytics,
      techniques: Object.values(BreathingTechnique),
      difficulties: Object.values(ExerciseDifficulty)
    })
  } catch (error) {
    console.error('Error fetching breathing exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breathing exercises' },
      { status: 500 }
    )
  }
}

// Record a breathing session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      exerciseId, 
      moodBefore, 
      moodAfter, 
      anxietyBefore, 
      anxietyAfter, 
      notes,
      durationSeconds 
    } = body

    // Validate required fields
    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      )
    }

    // Create stubbed session
    const newSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      exerciseId,
      startedAt: new Date(Date.now() - (durationSeconds || 240) * 1000),
      completedAt: new Date(),
      durationSeconds: durationSeconds || 240,
      moodBefore: moodBefore || null,
      moodAfter: moodAfter || null,
      anxietyBefore: anxietyBefore || null,
      anxietyAfter: anxietyAfter || null,
      notes: notes || null
    }

    // Calculate improvements
    const moodImprovement = (moodAfter || 0) - (moodBefore || 0)
    const anxietyImprovement = (anxietyBefore || 0) - (anxietyAfter || 0)

    return NextResponse.json({
      session: newSession,
      improvements: {
        mood: moodImprovement,
        anxiety: anxietyImprovement
      },
      message: 'Session recorded successfully'
    })
  } catch (error) {
    console.error('Error recording breathing session:', error)
    return NextResponse.json(
      { error: 'Failed to record session' },
      { status: 500 }
    )
  }
}

// Update a breathing session
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, ...updateData } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Return stubbed updated session
    const updatedSession = {
      id: sessionId,
      ...updateData,
      updatedAt: new Date()
    }

    return NextResponse.json({
      session: updatedSession,
      message: 'Session updated successfully'
    })
  } catch (error) {
    console.error('Error updating breathing session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// Get breathing session analytics
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return stubbed analytics summary
    const analytics = {
      totalSessions: 42,
      totalMinutes: 168,
      averageDuration: 4,
      mostUsedTechnique: BreathingTechnique.BOX_BREATHING,
      averageMoodImprovement: 2.5,
      averageAnxietyReduction: 3.2,
      currentStreak: 5,
      longestStreak: 14,
      lastSessionDate: new Date(Date.now() - 86400000),
      weeklyGoal: 5,
      weeklyProgress: 3
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}