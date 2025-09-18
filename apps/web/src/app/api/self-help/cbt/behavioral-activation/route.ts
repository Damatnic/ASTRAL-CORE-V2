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
    const { 
      activity, 
      plannedDate, 
      anticipatedMood, 
      notes 
    } = body

    // Validate input
    if (!activity || !plannedDate) {
      return NextResponse.json(
        { error: 'Missing required fields: activity, plannedDate' },
        { status: 400 }
      )
    }

    // TODO: Implement once selfHelpActivity model is added to Prisma schema
    // Save behavioral activation activity
    const activityRecord = {
      id: `stub_${Date.now()}`,
      userId: session.user.id,
      activityType: 'CBT_BEHAVIORAL_ACTIVATION',
      details: JSON.stringify({
        activity,
        plannedDate: new Date(plannedDate),
        anticipatedMood: parseInt(anticipatedMood || 5),
        notes: notes || '',
        completed: false
      }),
      duration: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({ 
      success: true, 
      activityId: activityRecord.id,
      activity: {
        id: activityRecord.id,
        activity,
        plannedDate: new Date(plannedDate),
        anticipatedMood: parseInt(anticipatedMood || 5),
        notes: notes || '',
        completed: false
      }
    })

  } catch (error) {
    console.error('Error saving behavioral activation activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement once selfHelpActivity model is added to Prisma schema
    // Get all behavioral activation activities for the user
    const activities: any[] = []

    const formattedActivities = activities.map((activity: any) => {
      try {
        const details = JSON.parse(activity.details || '{}')
        return {
          id: activity.id,
          activity: details.activity,
          plannedDate: details.plannedDate,
          anticipatedMood: details.anticipatedMood,
          actualMood: details.actualMood,
          enjoyment: details.enjoyment,
          mastery: details.mastery,
          notes: details.notes,
          completed: details.completed || false,
          actualDate: activity.completedAt
        }
      } catch {
        return null
      }
    }).filter(Boolean)

    return NextResponse.json({ activities: formattedActivities })

  } catch (error) {
    console.error('Error loading behavioral activation activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}