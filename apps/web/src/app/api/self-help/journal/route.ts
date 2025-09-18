import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, ActivityType } from '@/lib/db'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Create new journal entry
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.content && !data.encryptedContent) {
      return NextResponse.json({ error: 'Entry content is required' }, { status: 400 })
    }

    // Handle encryption
    let encryptedContent: Buffer
    let keyDerivationSalt: Buffer
    let contentHash = ''

    if (data.encryptedContent && data.keyDerivationSalt) {
      // Client-side encrypted content
      encryptedContent = Buffer.from(data.encryptedContent)
      keyDerivationSalt = Buffer.from(data.keyDerivationSalt)
      contentHash = crypto.createHash('sha256').update(encryptedContent).digest('hex')
    } else if (data.content) {
      // Server-side encryption (fallback)
      const { encrypted, salt, hash } = await encryptJournalContent(data.content, session.user.id)
      encryptedContent = encrypted
      keyDerivationSalt = salt
      contentHash = hash
    } else {
      return NextResponse.json({ error: 'No content provided for encryption' }, { status: 400 })
    }

    // Perform sentiment analysis on client-provided data or content
    let sentimentScore = data.sentimentScore
    let emotions = data.emotions

    if (!sentimentScore && data.content) {
      // Simple sentiment analysis (in production, use a proper NLP service)
      sentimentScore = await analyzeSentiment(data.content)
      emotions = await extractEmotions(data.content)
    }

    // Calculate word count
    const wordCount = data.wordCount || (data.content ? data.content.split(/\s+/).filter((w: string) => w.length > 0).length : 0)

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title: data.title,
        promptId: data.promptId,
        promptText: data.promptText,
        entryType: data.entryType || 'FREEFORM',
        encryptedContent,
        contentHash,
        keyDerivationSalt,
        mood: data.mood,
        sentimentScore,
        emotions: emotions || [],
        tags: data.tags || [],
        isPrivate: data.isPrivate !== false, // Default to private
        shareWithTherapist: data.shareWithTherapist || false,
        wordCount
      }
    })

    // Check for crisis indicators in journal content
    if (data.content || data.sentimentScore) {
      const shouldTriggerCrisis = await checkJournalCrisisIndicators(data.content, sentimentScore, emotions)
      
      if (shouldTriggerCrisis) {
        await createCrisisAlert(session.user.id, {
          trigger: 'journal_content',
          severity: calculateCrisisSeverity(sentimentScore, emotions),
          context: {
            entryId: journalEntry.id,
            entryType: data.entryType,
            mood: data.mood
          }
        })
      }
    }

    // Update user activity for gamification
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: ActivityType.MOOD_LOG,
        description: `Created journal entry: ${data.title || 'Untitled'}`,
        xpEarned: Math.min(50, Math.floor(wordCount / 10)), // XP based on word count
        pointsEarned: 25,
        metadata: {
          entryType: data.entryType,
          wordCount,
          hasPrompt: !!data.promptText
        }
      }
    })

    // Return success (without sensitive content)
    return NextResponse.json({
      success: true,
      data: {
        id: journalEntry.id,
        title: journalEntry.title,
        entryType: journalEntry.entryType,
        mood: journalEntry.mood,
        tags: journalEntry.tags,
        wordCount: journalEntry.wordCount,
        createdAt: journalEntry.createdAt,
        isEncrypted: !!encryptedContent
      }
    })

  } catch (error) {
    console.error('Journal entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to save journal entry' },
      { status: 500 }
    )
  }
}

// Get journal entries (metadata only for encrypted entries)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const entryType = searchParams.get('type')
    const tags = searchParams.get('tags')?.split(',')

    const where: any = {
      userId: session.user.id
    }

    if (entryType && entryType !== 'all') {
      where.entryType = entryType.toUpperCase()
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    // Get entries with metadata only
    const entries = await prisma.journalEntry.findMany({
      where,
      select: {
        id: true,
        title: true,
        entryType: true,
        promptText: true,
        mood: true,
        sentimentScore: true,
        emotions: true,
        tags: true,
        isPrivate: true,
        shareWithTherapist: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
        // Don't include encrypted content in list view
        encryptedContent: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.journalEntry.count({ where })

    // Calculate stats
    const stats = {
      totalEntries: totalCount,
      totalWords: entries.reduce((sum: number, e: any) => sum + (e.wordCount || 0), 0),
      averageMood: entries.filter((e: any) => e.mood).length > 0
        ? entries.filter((e: any) => e.mood).reduce((sum: number, e: any) => sum + (e.mood || 0), 0) / entries.filter((e: any) => e.mood).length
        : null,
      entryTypes: getEntryTypeDistribution(entries),
      commonTags: getCommonTags(entries),
      writingStreak: await calculateWritingStreak(session.user.id)
    }

    return NextResponse.json({
      success: true,
      data: entries,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Journal entries retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve journal entries' },
      { status: 500 }
    )
  }
}

// Get single journal entry with content (requires decryption on client)
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Return entry with encrypted content (client will decrypt)
    return NextResponse.json({
      success: true,
      data: {
        ...entry,
        encryptedContent: entry.encryptedContent ? Array.from(entry.encryptedContent) : null,
        keyDerivationSalt: entry.keyDerivationSalt ? Array.from(entry.keyDerivationSalt) : null
      }
    })

  } catch (error) {
    console.error('Journal entry retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve journal entry' },
      { status: 500 }
    )
  }
}

// Encrypt journal content server-side (fallback)
async function encryptJournalContent(content: string, userId: string) {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(userId, 'salt', 32) // In production, use proper key derivation
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipher(algorithm, key)
  let encrypted = cipher.update(content, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  const salt = crypto.randomBytes(16)
  
  const encryptedBuffer = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ])
  
  const hash = crypto.createHash('sha256').update(encryptedBuffer).digest('hex')
  
  return {
    encrypted: encryptedBuffer,
    salt,
    hash
  }
}

// Simple sentiment analysis (replace with proper NLP service)
async function analyzeSentiment(content: string): Promise<number> {
  const positiveWords = ['happy', 'joy', 'love', 'grateful', 'excited', 'amazing', 'wonderful', 'great', 'good', 'positive']
  const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'bad', 'negative', 'hopeless']
  
  const words = content.toLowerCase().split(/\s+/)
  const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length
  const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length
  
  const totalSentimentWords = positiveCount + negativeCount
  if (totalSentimentWords === 0) return 0
  
  return (positiveCount - negativeCount) / totalSentimentWords
}

// Extract emotions from content
async function extractEmotions(content: string): Promise<string[]> {
  const emotionKeywords = {
    'joy': ['happy', 'joyful', 'excited', 'elated', 'cheerful'],
    'sadness': ['sad', 'depressed', 'melancholy', 'grief', 'sorrow'],
    'anger': ['angry', 'furious', 'irritated', 'annoyed', 'rage'],
    'fear': ['afraid', 'scared', 'anxious', 'worried', 'terrified'],
    'surprise': ['surprised', 'amazed', 'shocked', 'astonished'],
    'disgust': ['disgusted', 'revolted', 'repulsed'],
    'trust': ['trusting', 'confident', 'secure'],
    'anticipation': ['excited', 'eager', 'hopeful', 'optimistic']
  }
  
  const contentLower = content.toLowerCase()
  const detectedEmotions: string[] = []
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      detectedEmotions.push(emotion)
    }
  }
  
  return detectedEmotions
}

// Check for crisis indicators in journal content
async function checkJournalCrisisIndicators(content: string | null, sentimentScore: number | null, emotions: string[] | null): Promise<boolean> {
  // Check sentiment score
  if (sentimentScore !== null && sentimentScore < -0.7) {
    return true
  }
  
  // Check for crisis emotions
  const crisisEmotions = ['hopeless', 'suicidal', 'trapped', 'desperate']
  if (emotions?.some(emotion => crisisEmotions.includes(emotion))) {
    return true
  }
  
  // Check content for crisis keywords
  if (content) {
    const crisisKeywords = ['kill myself', 'suicide', 'end it all', 'can\'t go on', 'hopeless', 'trapped', 'no way out']
    const contentLower = content.toLowerCase()
    if (crisisKeywords.some(keyword => contentLower.includes(keyword))) {
      return true
    }
  }
  
  return false
}

// Calculate crisis severity from journal
function calculateCrisisSeverity(sentimentScore: number | null, emotions: string[] | null): number {
  let severity = 5 // Base severity
  
  if (sentimentScore !== null) {
    // Convert sentiment score (-1 to 1) to severity (1 to 10)
    severity = Math.round((1 - sentimentScore) * 5)
  }
  
  if (emotions?.includes('hopeless') || emotions?.includes('suicidal')) {
    severity = Math.max(severity, 9)
  }
  
  return Math.min(Math.max(severity, 1), 10)
}

// Create crisis alert
async function createCrisisAlert(userId: string, alertData: any) {
  try {
    console.log('Crisis alert triggered from journal for user:', userId, alertData)
    // Implementation would integrate with crisis intervention system
  } catch (error) {
    console.error('Failed to create crisis alert:', error)
  }
}

// Get entry type distribution
function getEntryTypeDistribution(entries: any[]) {
  const distribution = entries.reduce((acc, entry) => {
    acc[entry.entryType] = (acc[entry.entryType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(distribution).map(([type, count]) => ({ type, count }))
}

// Get common tags
function getCommonTags(entries: any[]) {
  const allTags = entries.flatMap(e => e.tags || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))
}

// Calculate writing streak
async function calculateWritingStreak(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = new Date(today)
  
  while (streak < 365) { // Max 1 year streak
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const entryExists = await prisma.journalEntry.findFirst({
      where: {
        userId,
        createdAt: {
          gte: currentDate,
          lt: nextDate
        }
      }
    })
    
    if (entryExists) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}