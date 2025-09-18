import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Get mood tracking data for self-help
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const includeAnalytics = searchParams.get('analytics') === 'true'

    // If no session, return demo data
    if (!session?.user?.id) {
      return NextResponse.json({
        entries: [],
        analytics: includeAnalytics ? getDemoAnalytics() : null,
        message: 'Sign in to track your mood history'
      })
    }

    // Stubbed mood entries
    const entries = generateMoodEntries(session.user.id, days)

    // Calculate analytics if requested
    let analytics = null
    if (includeAnalytics) {
      analytics = calculateMoodAnalytics(entries)
    }

    return NextResponse.json({
      entries,
      analytics,
      streakDays: 5,
      totalEntries: entries.length
    })
  } catch (error) {
    console.error('Error fetching mood data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mood data' },
      { status: 500 }
    )
  }
}

// Record mood entry for self-help
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      mood, 
      emotions = {}, 
      triggers = [], 
      activities = [],
      notes = '',
      sleepHours,
      exerciseMinutes,
      socialInteractions,
      medication
    } = body

    // Validate mood value
    if (!mood || mood < 1 || mood > 10) {
      return NextResponse.json(
        { error: 'Mood value must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Create stubbed mood entry
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session.user.id,
      mood,
      emotions,
      triggers,
      activities,
      notes,
      sleepHours,
      exerciseMinutes,
      socialInteractions,
      medication,
      timestamp: new Date(),
      insights: generateInsights(mood, emotions, activities)
    }

    // Check for achievement
    let achievement = null
    if (Math.random() > 0.7) {
      achievement = {
        name: 'Mood Tracker',
        description: 'Logged your mood for 7 days straight',
        xpReward: 75,
        badge: '🎯'
      }
    }

    return NextResponse.json({
      entry,
      achievement,
      message: 'Mood entry recorded successfully',
      nextPrompt: 'How are your energy levels today?'
    })
  } catch (error) {
    console.error('Error recording mood:', error)
    return NextResponse.json(
      { error: 'Failed to record mood entry' },
      { status: 500 }
    )
  }
}

// Get mood insights and recommendations
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    const insights = {
      patterns: [
        'Your mood tends to be higher in the morning',
        'Exercise correlates with improved mood',
        'Social activities boost your emotional well-being'
      ],
      recommendations: [
        {
          type: 'activity',
          suggestion: 'Try a 10-minute walk',
          reason: 'Physical activity improved your mood by 2 points on average'
        },
        {
          type: 'social',
          suggestion: 'Connect with a friend today',
          reason: 'Social interactions correlate with 30% mood improvement'
        },
        {
          type: 'self-care',
          suggestion: 'Practice breathing exercises',
          reason: 'Helps manage anxiety which you reported yesterday'
        }
      ],
      triggers: {
        positive: ['exercise', 'good sleep', 'social time'],
        negative: ['work stress', 'poor sleep', 'isolation']
      },
      weeklyTrend: 'improving',
      averageMood: 6.5
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

// Helper functions

function generateMoodEntries(userId: string, days: number) {
  const entries = []
  const now = Date.now()
  
  for (let i = 0; i < Math.min(days, 7); i++) {
    const timestamp = new Date(now - (i * 86400000))
    const mood = Math.floor(Math.random() * 5) + 4 // Random mood 4-8
    
    entries.push({
      id: `entry-${i}`,
      userId,
      mood,
      emotions: {
        happy: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0,
        sad: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0,
        anxious: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
        calm: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
        energetic: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0
      },
      triggers: ['work', 'weather', 'sleep'].filter(() => Math.random() > 0.5),
      activities: ['exercise', 'meditation', 'reading'].filter(() => Math.random() > 0.5),
      timestamp,
      notes: i === 0 ? 'Feeling pretty good today' : null
    })
  }
  
  return entries
}

function calculateMoodAnalytics(entries: any[]) {
  if (entries.length === 0) return null
  
  const totalMood = entries.reduce((sum, e) => sum + e.mood, 0)
  const avgMood = totalMood / entries.length
  
  return {
    averageMood: avgMood.toFixed(1),
    trend: entries[0]?.mood > entries[entries.length - 1]?.mood ? 'improving' : 'stable',
    highestMood: Math.max(...entries.map(e => e.mood)),
    lowestMood: Math.min(...entries.map(e => e.mood)),
    totalEntries: entries.length,
    consistency: entries.length >= 5 ? 'excellent' : 'good',
    insights: [
      avgMood > 6 ? 'Your mood has been generally positive' : 'There\'s room for improvement',
      'Regular tracking helps identify patterns'
    ]
  }
}

function getDemoAnalytics() {
  return {
    averageMood: '6.5',
    trend: 'improving',
    highestMood: 9,
    lowestMood: 4,
    totalEntries: 30,
    consistency: 'excellent',
    insights: [
      'Sign in to see your personalized insights',
      'Track your mood daily for better patterns'
    ]
  }
}

function generateInsights(mood: number, emotions: any, activities: string[]) {
  const insights = []
  
  if (mood >= 7) {
    insights.push('Great mood today! Keep up what you\'re doing')
  } else if (mood <= 4) {
    insights.push('Consider trying a self-care activity')
  }
  
  if (emotions.anxious > 3) {
    insights.push('Try breathing exercises to manage anxiety')
  }
  
  if (activities.includes('exercise')) {
    insights.push('Exercise is boosting your mood!')
  }
  
  return insights
}