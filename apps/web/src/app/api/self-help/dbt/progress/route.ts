import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all DBT practice activities for the user
    const activities: any[] = [] // TODO: Implement selfHelpActivity model
    /*
    const stubActivities = []; if (false) await prisma.selfHelpActivity.findMany({
      where: {
        userId: session.user.id,
        activityType: 'DBT_PRACTICE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    */

    // Get ratings for effectiveness tracking
    const ratings: any[] = [] // TODO: Implement selfHelpRating model
    /*
    const stubRatings = []; if (false) await prisma.selfHelpRating.findMany({
      where: {
        userId: session.user.id,
        activityType: 'DBT_PRACTICE'
      }
    })
    */

    // Process activities to create progress data
    const skillProgress = new Map()

    activities.forEach(activity => {
      try {
        const details = JSON.parse(activity.details || '{}')
        const skillId = details.skillId
        
        if (skillId) {
          if (!skillProgress.has(skillId)) {
            skillProgress.set(skillId, {
              skillId,
              practiceCount: 0,
              lastPracticed: null,
              effectiveness: 0,
              notes: [],
              mastery: 'learning'
            })
          }

          const progress = skillProgress.get(skillId)
          progress.practiceCount++
          
          if (!progress.lastPracticed || new Date(activity.completedAt || activity.createdAt) > progress.lastPracticed) {
            progress.lastPracticed = new Date(activity.completedAt || activity.createdAt)
          }

          if (details.notes) {
            progress.notes.push(details.notes)
          }
        }
      } catch (error) {
        console.error('Error parsing activity details:', error)
      }
    })

    // Add effectiveness data from ratings
    ratings.forEach(rating => {
      try {
        const details = JSON.parse(rating.details || '{}')
        const skillId = details.skillId
        
        if (skillId && skillProgress.has(skillId)) {
          const progress = skillProgress.get(skillId)
          progress.effectiveness = rating.rating
        }
      } catch (error) {
        console.error('Error parsing rating details:', error)
      }
    })

    // Determine mastery levels based on practice count and effectiveness
    skillProgress.forEach(progress => {
      if (progress.practiceCount >= 10 && progress.effectiveness >= 8) {
        progress.mastery = 'teaching'
      } else if (progress.practiceCount >= 5 && progress.effectiveness >= 6) {
        progress.mastery = 'proficient'
      } else if (progress.practiceCount >= 2) {
        progress.mastery = 'practicing'
      }
    })

    const progressArray = Array.from(skillProgress.values())

    return NextResponse.json({ progress: progressArray })

  } catch (error) {
    console.error('Error loading DBT progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    // No need to disconnect when using shared prisma instance
  }
}