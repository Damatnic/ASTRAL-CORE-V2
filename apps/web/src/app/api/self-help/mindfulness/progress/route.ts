import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all mindfulness activities for the user
    const activities: any[] = [] // TODO: Implement selfHelpActivity model
    /*
    const stubActivities = []; if (false) await prisma.selfHelpActivity.findMany({
      where: {
        userId: session.user.id,
        activityType: 'MINDFULNESS'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    */

    // Calculate progress metrics
    const totalSessions = activities.length
    const totalMinutes = activities.reduce((sum, activity) => {
      return sum + (activity.duration || 0)
    }, 0)

    // Calculate streak (consecutive days with sessions)
    let streak = 0
    let longestStreak = 0
    let currentStreak = 0
    
    if (activities.length > 0) {
      const sortedActivities = activities
        .filter(a => a.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

      let lastDate: Date | null = null
      
      for (const activity of sortedActivities) {
        const activityDate = new Date(activity.completedAt!)
        const dateString = activityDate.toDateString()
        
        if (!lastDate) {
          currentStreak = 1
          lastDate = activityDate
        } else {
          const diffTime = lastDate.getTime() - activityDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            currentStreak++
          } else if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, currentStreak)
            currentStreak = 1
          }
          
          lastDate = activityDate
        }
      }
      
      longestStreak = Math.max(longestStreak, currentStreak)
      
      // Check if streak is current (today or yesterday)
      const today = new Date()
      const lastSessionDate = new Date(sortedActivities[0].completedAt!)
      const daysSinceLastSession = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastSession <= 1) {
        streak = currentStreak
      }
    }

    // Get completed session IDs
    const completedSessions = activities
      .filter(a => a.completedAt)
      .map(a => {
        try {
          const details = JSON.parse(a.details || '{}')
          return details.sessionId
        } catch {
          return null
        }
      })
      .filter(Boolean)

    // Calculate favorite types from session details
    const sessionTypes = activities.map(a => {
      try {
        const details = JSON.parse(a.details || '{}')
        return details.sessionType || 'unknown'
      } catch {
        return 'unknown'
      }
    })

    const typeCounts = sessionTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([type]) => type)

    // Get average rating from ratings
    const ratings: any[] = [] // TODO: Implement selfHelpRating model
    /*
    const stubRatings = []; if (false) await prisma.selfHelpRating.findMany({
      where: {
        userId: session.user.id,
        activityType: 'MINDFULNESS'
      }
    })
    */

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    const progress = {
      totalSessions,
      totalMinutes,
      streak,
      longestStreak,
      completedSessions,
      favoriteTypes,
      averageRating,
      lastSessionDate: activities.length > 0 ? activities[0].completedAt : null
    }

    return NextResponse.json({ progress })

  } catch (error) {
    console.error('Error loading mindfulness progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}