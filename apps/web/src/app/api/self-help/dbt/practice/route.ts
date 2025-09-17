import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Mock database for practice sessions
const dbtPracticeData = new Map()

const PracticeSessionSchema = z.object({
  skillId: z.string(),
  action: z.enum(['start', 'complete']),
  effectiveness: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  timestamp: z.string().datetime()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = PracticeSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { skillId, action, effectiveness, notes, timestamp } = validation.data
    const userId = session.user.email

    // Get user's practice sessions
    const userSessions = dbtPracticeData.get(userId) || []

    if (action === 'start') {
      // Record practice session start
      const session = {
        id: Date.now().toString(),
        skillId,
        startedAt: new Date(timestamp),
        status: 'in-progress'
      }

      userSessions.push(session)
      dbtPracticeData.set(userId, userSessions)

      return NextResponse.json({
        success: true,
        session
      })
    }

    if (action === 'complete') {
      // Find and complete the practice session
      const sessionIndex = userSessions.findIndex((s: any) => 
        s.skillId === skillId && s.status === 'in-progress'
      )

      if (sessionIndex >= 0) {
        userSessions[sessionIndex] = {
          ...userSessions[sessionIndex],
          completedAt: new Date(timestamp),
          effectiveness,
          notes,
          status: 'completed'
        }

        dbtPracticeData.set(userId, userSessions)

        // Update progress data
        const progressResponse = await fetch(`${request.nextUrl.origin}/api/self-help/dbt/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            skillId,
            effectiveness,
            notes: notes ? [notes] : [],
            lastPracticed: timestamp
          })
        })

        return NextResponse.json({
          success: true,
          session: userSessions[sessionIndex]
        })
      } else {
        return NextResponse.json(
          { error: 'No active practice session found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in DBT practice POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}