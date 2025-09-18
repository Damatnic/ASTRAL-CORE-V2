import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@astralcore/database'

const prisma = new PrismaClient()

// Get AI therapy sessions for user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const therapistId = searchParams.get('therapistId')

    const where: any = {
      userId: session.user.id
    }

    if (therapistId) {
      where.therapistId = therapistId
    }

    const sessions = await prisma.aITherapySession.findMany({
      where,
      orderBy: {
        startTime: 'desc'
      },
      take: limit,
      select: {
        id: true,
        therapistId: true,
        sessionType: true,
        startTime: true,
        endTime: true,
        moodBefore: true,
        moodAfter: true,
        topics: true,
        insights: true,
        recommendations: true,
        nextSessionSuggested: true,
        rating: true
      }
    })

    // Calculate session statistics
    const stats = {
      totalSessions: sessions.length,
      averageRating: sessions.filter((s: any) => s.rating).reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / sessions.filter((s: any) => s.rating).length || 0,
      moodImprovement: sessions.filter((s: any) => s.moodBefore && s.moodAfter).reduce((sum: number, s: any) => sum + ((s.moodAfter || 0) - (s.moodBefore || 0)), 0) / sessions.filter((s: any) => s.moodBefore && s.moodAfter).length || 0,
      preferredTherapist: getPreferredTherapist(sessions),
      commonTopics: getCommonTopics(sessions)
    }

    return NextResponse.json({
      success: true,
      sessions,
      stats
    })

  } catch (error) {
    console.error('AI therapy sessions retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve AI therapy sessions' },
      { status: 500 }
    )
  }
}

// Create new AI therapy session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.therapistId || !data.sessionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create therapy session record
    const therapySession = await prisma.aITherapySession.create({
      data: {
        userId: session.user.id,
        therapistId: data.therapistId,
        sessionType: data.sessionType,
        startTime: new Date(),
        moodBefore: data.moodBefore,
        anxietyBefore: data.anxietyBefore,
        energyBefore: data.energyBefore,
        topics: data.topics || [],
        sessionGoals: data.sessionGoals || [],
        encrypted: true
      }
    })

    // Log session start for analytics
    await logTherapyEvent(session.user.id, 'session_started', {
      therapistId: data.therapistId,
      sessionType: data.sessionType,
      sessionId: therapySession.id
    })

    return NextResponse.json({
      success: true,
      sessionId: therapySession.id,
      startTime: therapySession.startTime
    })

  } catch (error) {
    console.error('AI therapy session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create AI therapy session' },
      { status: 500 }
    )
  }
}

// Update existing AI therapy session
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { sessionId, ...updateData } = data

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Verify session ownership
    const existingSession = await prisma.aITherapySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Update session
    const updatedSession = await prisma.aITherapySession.update({
      where: { id: sessionId },
      data: {
        ...updateData,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        updatedAt: new Date()
      }
    })

    // If session is ending, calculate duration and log completion
    if (updateData.endTime) {
      const duration = new Date(updateData.endTime).getTime() - existingSession.startTime.getTime()
      
      await logTherapyEvent(session.user.id, 'session_completed', {
        therapistId: existingSession.therapistId,
        sessionType: existingSession.sessionType,
        sessionId: sessionId,
        duration: Math.round(duration / 60000), // Duration in minutes
        moodImprovement: (updateData.moodAfter || 0) - (existingSession.moodBefore || 0),
        rating: updateData.rating
      })

      // Update user activity for completed therapy session
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          type: 'THERAPY_SESSION',
          description: `Completed AI therapy session with ${existingSession.therapistId}`,
          xpEarned: Math.min(100, Math.round(duration / 60000) * 2), // 2 XP per minute, max 100
          pointsEarned: 50,
          metadata: {
            therapistId: existingSession.therapistId,
            sessionType: existingSession.sessionType,
            duration: Math.round(duration / 60000),
            moodImprovement: (updateData.moodAfter || 0) - (existingSession.moodBefore || 0)
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession
    })

  } catch (error) {
    console.error('AI therapy session update error:', error)
    return NextResponse.json(
      { error: 'Failed to update AI therapy session' },
      { status: 500 }
    )
  }
}

// Helper function to get preferred therapist
function getPreferredTherapist(sessions: any[]) {
  const therapistCounts = sessions.reduce((acc, session) => {
    acc[session.therapistId] = (acc[session.therapistId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sorted = Object.entries(therapistCounts).sort(([, a], [, b]) => (b as number) - (a as number))
  return sorted[0] ? { therapistId: sorted[0][0], sessionCount: sorted[0][1] } : null
}

// Helper function to get common topics
function getCommonTopics(sessions: any[]) {
  const allTopics = sessions.flatMap(s => s.topics || [])
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }))
}

// Helper function to log therapy events
async function logTherapyEvent(userId: string, eventType: string, eventData: any) {
  try {
    await prisma.therapyEventLog.create({
      data: {
        userId,
        eventType,
        eventData,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log therapy event:', error)
  }
}