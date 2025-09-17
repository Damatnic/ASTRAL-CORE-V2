import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Mock database - in real implementation, use proper database
const dbtProgressData = new Map()

const DBTProgressSchema = z.object({
  skillId: z.string(),
  practiceCount: z.number().min(0),
  lastPracticed: z.date(),
  effectiveness: z.number().min(1).max(10),
  notes: z.array(z.string()),
  mastery: z.enum(['learning', 'practicing', 'proficient', 'teaching'])
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.email
    const userProgress = dbtProgressData.get(userId) || []

    return NextResponse.json({
      success: true,
      progress: userProgress
    })

  } catch (error) {
    console.error('Error in DBT progress GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const userId = session.user.email

    // Validate the request body
    const progressUpdate = {
      skillId: body.skillId,
      practiceCount: body.practiceCount || 1,
      lastPracticed: new Date(body.lastPracticed || Date.now()),
      effectiveness: body.effectiveness,
      notes: body.notes || [],
      mastery: body.mastery || 'learning'
    }

    // Get existing progress
    const userProgress = dbtProgressData.get(userId) || []
    const existingIndex = userProgress.findIndex((p: any) => p.skillId === progressUpdate.skillId)

    if (existingIndex >= 0) {
      // Update existing progress
      userProgress[existingIndex] = {
        ...userProgress[existingIndex],
        ...progressUpdate,
        practiceCount: userProgress[existingIndex].practiceCount + 1
      }
    } else {
      // Add new progress entry
      userProgress.push(progressUpdate)
    }

    dbtProgressData.set(userId, userProgress)

    return NextResponse.json({
      success: true,
      progress: userProgress.find((p: any) => p.skillId === progressUpdate.skillId)
    })

  } catch (error) {
    console.error('Error in DBT progress POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}