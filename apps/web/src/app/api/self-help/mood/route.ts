import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, ActivityType } from '@astralcore/database'

const prisma = new PrismaClient()

// Create new mood entry
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.mood || data.mood < 1 || data.mood > 10) {
      return NextResponse.json({ error: 'Invalid mood value' }, { status: 400 })
    }

    // Create mood entry with crisis detection
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        mood: data.mood,
        emotions: data.emotions || [],
        triggers: data.triggers || [],
        activities: data.activities || [],
        sleepHours: data.sleepHours,
        notes: data.notes,
        weather: data.weather,
        medication: data.medication,
        socialInteraction: data.socialInteraction,
        timestamp: new Date()
      }
    })

    // Crisis intervention check
    const shouldTriggerCrisis = await checkCrisisIndicators(session.user.id, data)
    
    if (shouldTriggerCrisis) {
      // Create crisis alert but don't block the mood entry
      await createCrisisAlert(session.user.id, {
        trigger: 'mood_pattern',
        severity: calculateSeverity(data.mood, data.emotions),
        context: {
          mood: data.mood,
          emotions: data.emotions,
          triggers: data.triggers
        }
      })
    }

    // Update user activity for gamification
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: ActivityType.MOOD_LOG,
        description: `Logged mood: ${data.mood}/10`,
        xpEarned: 5,
        pointsEarned: 10,
        metadata: {
          mood: data.mood,
          emotions: data.emotions?.length || 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: moodEntry,
      crisisAlert: shouldTriggerCrisis
    })

  } catch (error) {
    console.error('Mood entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to save mood entry' },
      { status: 500 }
    )
  }
}

// Get mood history and patterns
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const includePatterns = searchParams.get('patterns') === 'true'

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Get mood entries
    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })

    let patterns = null
    if (includePatterns && entries.length > 0) {
      patterns = await analyzeMoodPatterns(entries)
    }

    // Get basic stats
    const stats = {
      totalEntries: entries.length,
      averageMood: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length 
        : 0,
      moodTrend: calculateMoodTrend(entries),
      commonTriggers: getCommonTriggers(entries),
      helpfulActivities: getHelpfulActivities(entries)
    }

    return NextResponse.json({
      success: true,
      data: entries,
      patterns,
      stats
    })

  } catch (error) {
    console.error('Mood data retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve mood data' },
      { status: 500 }
    )
  }
}

// Crisis detection logic
async function checkCrisisIndicators(userId: string, moodData: any): Promise<boolean> {
  // Check for immediate red flags
  if (moodData.mood <= 3) {
    return true
  }

  // Check for crisis-related emotions
  const crisisEmotions = ['hopeless', 'suicidal', 'trapped', 'unbearable', 'rage']
  if (moodData.emotions?.some((emotion: string) => 
    crisisEmotions.some(crisis => emotion.toLowerCase().includes(crisis.toLowerCase()))
  )) {
    return true
  }

  // Check recent mood pattern (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const recentEntries = await prisma.moodEntry.findMany({
    where: {
      userId,
      timestamp: { gte: weekAgo }
    },
    orderBy: { timestamp: 'desc' },
    take: 7
  })

  if (recentEntries.length >= 3) {
    const averageMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length
    const recentMoods = recentEntries.slice(0, 3).map(e => e.mood)
    
    // Trigger if average mood is very low or consistent decline
    if (averageMood <= 4 || (recentMoods.every((mood, i) => i === 0 || mood <= recentMoods[i - 1]))) {
      return true
    }
  }

  return false
}

// Calculate crisis severity
function calculateSeverity(mood: number, emotions: string[]): number {
  let severity = Math.max(1, 11 - mood) // Invert mood (1-10 becomes 10-1)
  
  // Increase severity based on crisis emotions
  const crisisEmotions = ['hopeless', 'suicidal', 'trapped', 'rage']
  const crisisCount = emotions?.filter(emotion => 
    crisisEmotions.some(crisis => emotion.toLowerCase().includes(crisis.toLowerCase()))
  ).length || 0
  
  severity += crisisCount * 2
  
  return Math.min(severity, 10)
}

// Create crisis alert
async function createCrisisAlert(userId: string, alertData: any) {
  try {
    // This would integrate with the existing crisis intervention system
    // For now, we'll create a placeholder entry
    console.log('Crisis alert triggered for user:', userId, alertData)
    
    // In a real implementation, this would:
    // 1. Create a crisis session
    // 2. Notify appropriate responders
    // 3. Trigger safety plan activation
    // 4. Send alerts to emergency contacts if configured
    
  } catch (error) {
    console.error('Failed to create crisis alert:', error)
  }
}

// Analyze mood patterns
async function analyzeMoodPatterns(entries: any[]) {
  if (entries.length < 7) return null

  const moods = entries.map(e => e.mood)
  const recent = moods.slice(0, 7)
  const previous = moods.slice(7, 14)

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const previousAvg = previous.length > 0 
    ? previous.reduce((a, b) => a + b, 0) / previous.length 
    : recentAvg

  // Calculate volatility
  const variance = recent.reduce((sum, mood) => sum + Math.pow(mood - recentAvg, 2), 0) / recent.length
  const volatility = Math.sqrt(variance)

  let type = 'stable'
  let insights: any[] = []
  let recommendations: any[] = []

  if (volatility > 2.5) {
    type = 'volatile'
    insights.push('Your mood has been fluctuating significantly')
    recommendations.push('Consider identifying triggers and using grounding techniques')
  } else if (recentAvg - previousAvg > 1) {
    type = 'improvement'
    insights.push(`Your mood has improved by ${(recentAvg - previousAvg).toFixed(1)} points`)
    recommendations.push('Continue activities that have been helping')
  } else if (previousAvg - recentAvg > 1) {
    type = 'decline'
    insights.push(`Your mood has declined by ${(previousAvg - recentAvg).toFixed(1)} points`)
    recommendations.push('Consider reaching out for support')
  }

  return {
    type,
    confidence: Math.min(0.9, 0.6 + Math.abs(recentAvg - previousAvg) * 0.1),
    insights,
    recommendations,
    volatility,
    trend: recentAvg - previousAvg
  }
}

// Calculate mood trend
function calculateMoodTrend(entries: any[]): 'improving' | 'declining' | 'stable' {
  if (entries.length < 2) return 'stable'
  
  const recent = entries.slice(0, Math.min(5, entries.length))
  const older = entries.slice(Math.min(5, entries.length), Math.min(10, entries.length))
  
  if (older.length === 0) return 'stable'
  
  const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length
  const olderAvg = older.reduce((sum, e) => sum + e.mood, 0) / older.length
  
  const diff = recentAvg - olderAvg
  
  if (diff > 0.5) return 'improving'
  if (diff < -0.5) return 'declining'
  return 'stable'
}

// Get common triggers
function getCommonTriggers(entries: any[]) {
  const allTriggers = entries.flatMap(e => e.triggers || [])
  const triggerCounts = allTriggers.reduce((acc, trigger) => {
    acc[trigger] = (acc[trigger] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(triggerCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }))
}

// Get helpful activities
function getHelpfulActivities(entries: any[]) {
  const goodMoodEntries = entries.filter(e => e.mood >= 7)
  const allActivities = goodMoodEntries.flatMap(e => e.activities || [])
  const activityCounts = allActivities.reduce((acc, activity) => {
    acc[activity] = (acc[activity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(activityCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([activity, count]) => ({ activity, count }))
}