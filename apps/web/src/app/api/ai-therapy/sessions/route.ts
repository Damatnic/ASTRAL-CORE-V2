import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Create a new AI therapy session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { therapistId, sessionType = 'standard' } = data

    // Create new session - stubbed for now
    const newSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      therapistId: therapistId || 'dr-aria',
      sessionType,
      startTime: new Date(),
      status: 'active',
      encrypted: true
    }

    return NextResponse.json({
      session: newSession,
      message: 'Session created successfully'
    })

  } catch (error) {
    console.error('Failed to create therapy session:', error)
    return NextResponse.json({ 
      error: 'Failed to create session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get user's therapy sessions
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const therapistId = searchParams.get('therapistId')
    const status = searchParams.get('status') || 'all'

    // Return stubbed sessions
    const sessions = [
      {
        id: 'session1',
        userId: session.user.id,
        therapistId: 'dr-aria',
        therapistName: 'Dr. Aria',
        sessionType: 'standard',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 83400000),
        status: 'completed',
        messageCount: 15,
        summary: 'Discussed anxiety management techniques'
      },
      {
        id: 'session2',
        userId: session.user.id,
        therapistId: 'dr-sage',
        therapistName: 'Dr. Sage',
        sessionType: 'crisis',
        startTime: new Date(Date.now() - 172800000),
        endTime: new Date(Date.now() - 169200000),
        status: 'completed',
        messageCount: 23,
        summary: 'Crisis intervention and safety planning'
      },
      {
        id: 'session3',
        userId: session.user.id,
        therapistId: 'dr-luna',
        therapistName: 'Dr. Luna',
        sessionType: 'standard',
        startTime: new Date(Date.now() - 3600000),
        endTime: null,
        status: 'active',
        messageCount: 8,
        summary: 'Ongoing mindfulness session'
      }
    ]

    // Filter by therapist if specified
    let filteredSessions = sessions
    if (therapistId) {
      filteredSessions = sessions.filter(s => s.therapistId === therapistId)
    }

    // Filter by status
    if (status !== 'all') {
      filteredSessions = filteredSessions.filter(s => s.status === status)
    }

    return NextResponse.json({
      sessions: filteredSessions,
      total: filteredSessions.length,
      therapists: getAvailableTherapists()
    })

  } catch (error) {
    console.error('Failed to fetch therapy sessions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// End a therapy session
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { sessionId, action } = data

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update session - stubbed for now
    const updatedSession = {
      id: sessionId,
      userId: session.user.id,
      status: action === 'end' ? 'completed' : 'paused',
      endTime: action === 'end' ? new Date() : null,
      lastActivity: new Date()
    }

    return NextResponse.json({
      session: updatedSession,
      message: `Session ${action === 'end' ? 'ended' : 'paused'} successfully`
    })

  } catch (error) {
    console.error('Failed to update therapy session:', error)
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Delete a therapy session
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // Delete session - stubbed for now
    // In production, would verify ownership and delete from database

    return NextResponse.json({
      message: 'Session deleted successfully',
      sessionId
    })

  } catch (error) {
    console.error('Failed to delete therapy session:', error)
    return NextResponse.json({ 
      error: 'Failed to delete session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get available therapists
function getAvailableTherapists() {
  return [
    {
      id: 'dr-aria',
      name: 'Dr. Aria',
      title: 'Empathetic Guide',
      specialty: 'Anxiety & Depression',
      approach: 'Cognitive-Behavioral Therapy',
      avatar: '👩‍⚕️',
      description: 'Warm and understanding, specializes in helping you navigate emotional challenges with compassion.',
      availability: 'Available Now'
    },
    {
      id: 'dr-sage',
      name: 'Dr. Sage',
      title: 'Analytical Mind',
      specialty: 'Problem-Solving & Stress',
      approach: 'Solution-Focused Therapy',
      avatar: '🧑‍⚕️',
      description: 'Practical and structured, helps you develop concrete strategies for managing life\'s challenges.',
      availability: 'Available Now'
    },
    {
      id: 'dr-luna',
      name: 'Dr. Luna',
      title: 'Mindfulness Expert',
      specialty: 'Trauma & PTSD',
      approach: 'Mindfulness & ACT',
      avatar: '👨‍⚕️',
      description: 'Calming and present-focused, guides you toward healing through mindfulness and acceptance.',
      availability: 'Available Now'
    }
  ]
}