import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Mock database for goals
const goalsData = new Map()

const GoalSchema = z.object({
  title: z.string().min(1),
  category: z.enum(['mood', 'activity', 'skills', 'social', 'self-care']),
  target: z.number().min(1),
  deadline: z.string().datetime()
})

const GoalUpdateSchema = z.object({
  progress: z.number().min(0).optional(),
  status: z.enum(['on-track', 'behind', 'at-risk', 'completed']).optional(),
  notes: z.string().optional()
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
    const userGoals = goalsData.get(userId) || []

    // Calculate status for each goal based on deadline and progress
    const goalsWithStatus = userGoals.map((goal: any) => {
      const now = new Date()
      const deadline = new Date(goal.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const progressPercentage = (goal.progress / goal.target) * 100

      let status = goal.status
      if (progressPercentage >= 100) {
        status = 'completed'
      } else if (daysUntilDeadline <= 0 && progressPercentage < 100) {
        status = 'at-risk'
      } else if (daysUntilDeadline <= 3 && progressPercentage < 75) {
        status = 'behind'
      } else {
        status = 'on-track'
      }

      return {
        ...goal,
        status,
        daysUntilDeadline,
        progressPercentage: Math.round(progressPercentage)
      }
    })

    return NextResponse.json({
      success: true,
      goals: goalsWithStatus
    })

  } catch (error) {
    console.error('Error in goals GET:', error)
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
    const validation = GoalSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid goal data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const goalData = validation.data
    const userId = session.user.email

    const newGoal = {
      id: Date.now().toString(),
      ...goalData,
      progress: 0,
      status: 'on-track',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const userGoals = goalsData.get(userId) || []
    userGoals.push(newGoal)
    goalsData.set(userId, userGoals)

    return NextResponse.json({
      success: true,
      goal: newGoal
    })

  } catch (error) {
    console.error('Error in goals POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = GoalUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const updateData = validation.data
    const userId = session.user.email

    const userGoals = goalsData.get(userId) || []
    const goalIndex = userGoals.findIndex((goal: any) => goal.id === goalId)

    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Update the goal
    userGoals[goalIndex] = {
      ...userGoals[goalIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    goalsData.set(userId, userGoals)

    return NextResponse.json({
      success: true,
      goal: userGoals[goalIndex]
    })

  } catch (error) {
    console.error('Error in goals PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}