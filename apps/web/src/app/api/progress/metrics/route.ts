import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock data - in real implementation, aggregate from various sources
const generateMockMetrics = (timeframe: string) => {
  const now = new Date()
  const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365

  return {
    mood: {
      current: 7.2,
      trend: 'improving' as const,
      weeklyAverage: 6.8,
      monthlyAverage: 6.5,
      lowestPoint: 4.2,
      highestPoint: 8.9,
      consistency: 0.75
    },
    activities: {
      completedToday: 3,
      weeklyGoal: 5,
      streaks: {
        current: 12,
        longest: 18
      },
      favoriteActivities: [
        { name: 'Breathing Exercises', count: 45, effectiveness: 8.2 },
        { name: 'Journaling', count: 32, effectiveness: 7.8 },
        { name: 'Grounding Techniques', count: 28, effectiveness: 8.5 }
      ]
    },
    skills: {
      dbtSkillsUsed: 15,
      cbtSessionsCompleted: 8,
      mostUsedSkill: 'TIPP Technique',
      skillEffectiveness: {
        'TIPP Technique': 8.7,
        'Thought Record': 7.9,
        'Wise Mind': 8.2,
        'DEARMAN': 7.5
      },
      masteryLevels: {
        'TIPP Technique': 'proficient',
        'Thought Record': 'practicing',
        'Wise Mind': 'practicing',
        'DEARMAN': 'learning'
      }
    },
    goals: [
      {
        id: '1',
        title: 'Complete 5 breathing exercises per week',
        category: 'activity' as const,
        progress: 4,
        target: 5,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'on-track' as const
      },
      {
        id: '2',
        title: 'Maintain mood above 6/10',
        category: 'mood' as const,
        progress: 12,
        target: 14,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'on-track' as const
      },
      {
        id: '3',
        title: 'Practice DBT skills daily',
        category: 'skills' as const,
        progress: 8,
        target: 30,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'behind' as const
      }
    ],
    insights: [
      {
        id: '1',
        type: 'achievement' as const,
        title: 'Mood Stability Improving',
        description: 'Your mood has been more consistent over the past 2 weeks, with fewer extreme fluctuations.',
        actionable: false,
        priority: 'medium' as const
      },
      {
        id: '2',
        type: 'suggestion' as const,
        title: 'Try Evening Journaling',
        description: 'Your mood tends to be lower in the evenings. Consider adding a brief journaling session before bed.',
        actionable: true,
        priority: 'high' as const
      },
      {
        id: '3',
        type: 'pattern' as const,
        title: 'Weekend Mood Dips',
        description: 'Pattern detected: mood tends to decline on weekends. This might indicate need for structured activities.',
        actionable: true,
        priority: 'medium' as const
      },
      {
        id: '4',
        type: 'warning' as const,
        title: 'Reduced Tool Usage',
        description: 'Self-help tool usage has decreased by 25% this week. Consider setting daily reminders.',
        actionable: true,
        priority: 'high' as const
      }
    ],
    milestones: [
      {
        id: '1',
        title: '30-Day Streak',
        description: 'Completed mood tracking for 30 consecutive days',
        achievedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'consistency',
        impact: 'medium' as const
      },
      {
        id: '2',
        title: 'First Thought Record',
        description: 'Successfully completed your first CBT thought record',
        achievedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        category: 'skills',
        impact: 'large' as const
      },
      {
        id: '3',
        title: 'Mood Goal Achieved',
        description: 'Maintained mood above 7/10 for one full week',
        achievedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        category: 'mood',
        impact: 'large' as const
      }
    ]
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'

    // Validate timeframe
    if (!['7d', '30d', '90d', '1y'].includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: 7d, 30d, 90d, 1y' },
        { status: 400 }
      )
    }

    // In a real implementation, this would aggregate data from:
    // - Mood tracking data
    // - Activity completion data  
    // - DBT/CBT tool usage
    // - Goal progress
    // - Crisis events
    // - User preferences and settings

    const metrics = generateMockMetrics(timeframe)

    return NextResponse.json({
      success: true,
      metrics,
      timeframe,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in progress metrics GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}