import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { techniqueId, severity, completed, timestamp } = body

    // Validate input
    if (!techniqueId || severity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: techniqueId, severity' },
        { status: 400 }
      )
    }

    // TODO: Implement once crisisEvent and selfHelpActivity models are added to Prisma schema
    // Save crisis technique usage
    const crisisEvent = {
      id: `stub_crisis_${Date.now()}`,
      userId: session.user.id,
      type: 'TECHNIQUE_USED',
      severity: parseInt(severity),
      details: JSON.stringify({
        techniqueId,
        completed: completed || false,
        timestamp: new Date(timestamp)
      }),
      timestamp: new Date(timestamp)
    }

    // Also create a self-help activity record
    // TODO: Uncomment when selfHelpActivity model is implemented
    /*
    await prisma.selfHelpActivity.create({
      data: {
        userId: session.user.id,
        activityType: 'CRISIS_TECHNIQUE',
        details: JSON.stringify({
          techniqueId,
          severity,
          completed
        }),
        duration: null, // Crisis techniques don't have fixed durations
        completedAt: completed ? new Date() : null
      }
    })
    */

    return NextResponse.json({ 
      success: true, 
      crisisEventId: crisisEvent.id 
    })

  } catch (error) {
    console.error('Error saving crisis technique usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    // No need to disconnect when using shared prisma instance
  }
}