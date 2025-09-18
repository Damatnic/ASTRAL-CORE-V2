import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Get journal entries
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const mood = searchParams.get('mood')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true'

    // Stubbed journal entries
    const entries = [
      {
        id: '1',
        userId: session.user.id,
        title: 'Feeling Better Today',
        content: 'Had a good therapy session and practiced breathing exercises.',
        mood: 7,
        emotions: ['hopeful', 'calm'],
        activities: ['therapy', 'breathing'],
        isPrivate: false,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: '2',
        userId: session.user.id,
        title: 'Anxiety at Work',
        content: 'Difficult day with presentations. Used grounding techniques.',
        mood: 4,
        emotions: ['anxious', 'overwhelmed'],
        activities: ['work', 'grounding'],
        isPrivate: true,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000)
      }
    ]

    // Filter entries based on query params
    let filteredEntries = entries
    if (mood) {
      filteredEntries = filteredEntries.filter(e => e.mood === parseInt(mood))
    }
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0)
      const end = endDate ? new Date(endDate) : new Date()
      filteredEntries = filteredEntries.filter(e => 
        e.createdAt >= start && e.createdAt <= end
      )
    }

    // Apply pagination
    const paginatedEntries = filteredEntries.slice(offset, offset + limit)

    // Calculate analytics if requested
    let analytics = null
    if (includeAnalytics) {
      analytics = {
        totalEntries: filteredEntries.length,
        averageMood: 5.5,
        mostCommonEmotions: ['anxious', 'hopeful', 'calm'],
        writingStreak: 3,
        longestEntry: 500,
        insights: [
          'Your mood improves after therapy sessions',
          'Breathing exercises correlate with calmer emotions'
        ]
      }
    }

    return NextResponse.json({
      entries: paginatedEntries,
      total: filteredEntries.length,
      analytics,
      hasMore: offset + limit < filteredEntries.length
    })
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}

// Create journal entry
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title,
      content,
      mood,
      emotions = [],
      activities = [],
      isPrivate = true,
      encrypted = false
    } = body

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Create stubbed entry
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      title: title || `Entry from ${new Date().toLocaleDateString()}`,
      content,
      mood,
      emotions,
      activities,
      isPrivate,
      encrypted,
      wordCount: content.split(' ').length,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Check for achievement
    let achievement = null
    if (Math.random() > 0.8) {
      achievement = {
        name: 'Consistent Journaler',
        description: 'Wrote journal entries for 7 days in a row',
        xpReward: 100
      }
    }

    return NextResponse.json({
      entry,
      achievement,
      message: 'Journal entry created successfully'
    })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}

// Update journal entry
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entryId, ...updateData } = body

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Return stubbed updated entry
    const updatedEntry = {
      id: entryId,
      ...updateData,
      updatedAt: new Date()
    }

    return NextResponse.json({
      entry: updatedEntry,
      message: 'Journal entry updated successfully'
    })
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    )
  }
}

// Delete journal entry
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Return success response
    return NextResponse.json({
      message: 'Journal entry deleted successfully',
      entryId
    })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}

// Get journal prompts and suggestions
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const prompts = {
      daily: [
        "What are three things you're grateful for today?",
        "Describe a moment today when you felt at peace.",
        "What challenged you today and how did you handle it?"
      ],
      emotional: [
        "What emotions are you experiencing right now?",
        "When did you last feel truly happy? Describe that moment.",
        "What fears are holding you back?"
      ],
      growth: [
        "What's one thing you learned about yourself recently?",
        "How have you grown in the past month?",
        "What would you tell your younger self?"
      ],
      crisis: [
        "What support do you need right now?",
        "List three coping strategies that have helped you before.",
        "Who can you reach out to for help?"
      ]
    }

    // Get a random prompt from each category
    const suggestedPrompt = {
      daily: prompts.daily[Math.floor(Math.random() * prompts.daily.length)],
      emotional: prompts.emotional[Math.floor(Math.random() * prompts.emotional.length)],
      growth: prompts.growth[Math.floor(Math.random() * prompts.growth.length)]
    }

    return NextResponse.json({
      prompts,
      suggestedPrompt,
      tips: [
        "Write without judgment - there's no right or wrong",
        "Be honest with yourself",
        "Try to write for at least 5 minutes",
        "Focus on feelings, not just events"
      ]
    })
  } catch (error) {
    console.error('Error fetching journal prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}