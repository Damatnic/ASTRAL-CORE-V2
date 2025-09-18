import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Mock database for thought records
const thoughtRecordsData = new Map()

const ThoughtRecordSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  situation: z.string().min(1),
  automaticThought: z.string().min(1),
  emotion: z.string().min(1),
  emotionIntensity: z.number().min(1).max(10),
  evidence: z.string().min(1),
  alternativeThought: z.string().min(1),
  newEmotion: z.string().min(1),
  newEmotionIntensity: z.number().min(1).max(10),
  cognitiveDistortions: z.array(z.string())
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
    const userRecords = thoughtRecordsData.get(userId) || []

    // Sort by date, most recent first
    const sortedRecords = userRecords.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json({
      success: true,
      records: sortedRecords
    })

  } catch (error) {
    console.error('Error in thought records GET:', error)
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
    const validation = ThoughtRecordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid thought record data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const thoughtRecord = validation.data
    const userId = session.user.email

    // Get user's thought records
    const userRecords = thoughtRecordsData.get(userId) || []
    userRecords.push(thoughtRecord)
    thoughtRecordsData.set(userId, userRecords)

    // Calculate improvement metrics
    const improvement = thoughtRecord.emotionIntensity - thoughtRecord.newEmotionIntensity
    const improvementPercentage = (improvement / thoughtRecord.emotionIntensity) * 100

    return NextResponse.json({
      success: true,
      record: thoughtRecord,
      metrics: {
        improvement,
        improvementPercentage: Math.round(improvementPercentage),
        distortionsIdentified: thoughtRecord.cognitiveDistortions.length
      }
    })

  } catch (error) {
    console.error('Error in thought records POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}