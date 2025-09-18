import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skillId, action, effectiveness, notes, timestamp } = body

    if (!skillId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: skillId, action' },
        { status: 400 }
      )
    }

    if (action === 'start') {
      // Record practice start
      // TODO: Implement selfHelpActivity model
      const activity = {
        id: `stub_${Date.now()}`,
        createdAt: new Date(),
        userId: session.user.id
      }
      /*
      // Stubbed out: await prisma.selfHelpActivity.create({
        data: {
          userId: session.user.id,
          activityType: 'DBT_PRACTICE',
          details: JSON.stringify({
            skillId,
            action: 'start',
            startTime: new Date(timestamp)
          }),
          duration: null,
          completedAt: null
        }
      })
      */

      return NextResponse.json({ 
        success: true, 
        activityId: activity.id 
      })

    } else if (action === 'complete') {
      // Record practice completion
      // TODO: Implement selfHelpActivity model
      const activity = {
        id: `stub_${Date.now()}`,
        createdAt: new Date(),
        userId: session.user.id
      }
      /*
      // Stubbed out: await prisma.selfHelpActivity.create({
        data: {
          userId: session.user.id,
          activityType: 'DBT_PRACTICE',
          details: JSON.stringify({
            skillId,
            action: 'complete',
            effectiveness: effectiveness ? parseInt(effectiveness) : null,
            notes: notes || '',
            completedTime: new Date(timestamp)
          }),
          duration: null, // Could calculate from start time if needed
          completedAt: new Date(timestamp)
        }
      })
      */

      // Also save the effectiveness rating if provided
      if (effectiveness !== undefined) {
        // TODO: Implement selfHelpRating model
        const stubRating = { id: `stub_${Date.now()}`, createdAt: new Date() }
        /*
        // Stubbed out: await prisma.selfHelpRating.create({
          data: {
            userId: session.user.id,
            activityType: 'DBT_PRACTICE',
            activityId: skillId,
            rating: parseInt(effectiveness),
            details: JSON.stringify({
              skillId,
              notes: notes || ''
            }),
            createdAt: new Date(timestamp)
          }
        })
        */
      }

      return NextResponse.json({ 
        success: true, 
        activityId: activity.id 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be "start" or "complete"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error recording DBT practice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}