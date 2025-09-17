import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const AnalyzeThoughtSchema = z.object({
  thought: z.string().min(1)
})

// Cognitive distortion patterns and descriptions
const DISTORTION_PATTERNS = {
  'All-or-Nothing Thinking': [
    /always/i, /never/i, /completely/i, /totally/i, /perfect/i, /failure/i,
    /everything/i, /nothing/i, /everyone/i, /no one/i
  ],
  'Overgeneralization': [
    /always happens/i, /never works/i, /every time/i, /all the time/i,
    /typical/i, /just like/i, /pattern/i
  ],
  'Mental Filter': [
    /only/i, /just/i, /except/i, /but/i, /however/i, /worst/i, /terrible/i
  ],
  'Disqualifying the Positive': [
    /doesn't count/i, /fluke/i, /luck/i, /anyone could/i, /not really/i,
    /just because/i, /doesn't mean/i
  ],
  'Jumping to Conclusions': [
    /probably/i, /must be/i, /obviously/i, /clearly/i, /know that/i,
    /thinking/i, /will/i, /going to/i
  ],
  'Magnification/Minimization': [
    /disaster/i, /catastrophe/i, /awful/i, /terrible/i, /horrible/i,
    /worst/i, /tiny/i, /minor/i, /small/i, /little/i
  ],
  'Emotional Reasoning': [
    /feel like/i, /feels/i, /must be true/i, /because I feel/i, /sense that/i
  ],
  'Should Statements': [
    /should/i, /shouldn't/i, /must/i, /ought to/i, /have to/i, /need to/i
  ],
  'Labeling': [
    /I am/i, /I'm a/i, /you are/i, /they are/i, /he is/i, /she is/i,
    /stupid/i, /idiot/i, /loser/i, /failure/i
  ],
  'Personalization': [
    /my fault/i, /because of me/i, /I caused/i, /if only I/i, /I should have/i
  ]
}

// Alternative thought generators
const ALTERNATIVE_GENERATORS = {
  'All-or-Nothing Thinking': [
    'What would be a more balanced way to see this?',
    'Are there any gray areas or middle ground here?',
    'What would I tell a friend in this situation?'
  ],
  'Overgeneralization': [
    'Is this really true every single time?',
    'What are some times when this wasn\'t the case?',
    'What specific evidence do I have for this pattern?'
  ],
  'Mental Filter': [
    'What positive aspects am I overlooking?',
    'What would the complete picture look like?',
    'What would others notice about this situation?'
  ],
  'Jumping to Conclusions': [
    'What other explanations are possible?',
    'What evidence supports this conclusion?',
    'What would I need to know to be certain?'
  ],
  'Should Statements': [
    'What would be more realistic to expect?',
    'What would be a more flexible way to think about this?',
    'How would I reframe this as a preference rather than a demand?'
  ]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = AnalyzeThoughtSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { thought } = validation.data

    // Analyze for cognitive distortions
    const identifiedDistortions: string[] = []
    const alternatives: string[] = []

    for (const [distortion, patterns] of Object.entries(DISTORTION_PATTERNS)) {
      const hasDistortion = patterns.some(pattern => pattern.test(thought))
      
      if (hasDistortion) {
        identifiedDistortions.push(distortion)
        
        // Generate alternative thoughts for this distortion
        const distortionAlternatives = ALTERNATIVE_GENERATORS[distortion as keyof typeof ALTERNATIVE_GENERATORS]
        if (distortionAlternatives) {
          // Pick a random alternative for variety
          const randomAlt = distortionAlternatives[Math.floor(Math.random() * distortionAlternatives.length)]
          alternatives.push(randomAlt)
        }
      }
    }

    // Generate general alternatives if no specific distortions found
    if (identifiedDistortions.length === 0) {
      alternatives.push(
        'What evidence supports and contradicts this thought?',
        'How would I view this situation if it happened to someone else?',
        'What would be a more balanced perspective?'
      )
    }

    // Add some specific reframing based on content analysis
    if (thought.toLowerCase().includes('fail')) {
      alternatives.push('What can I learn from this experience?')
    }
    if (thought.toLowerCase().includes('hate') || thought.toLowerCase().includes('awful')) {
      alternatives.push('What aspects of this situation are manageable?')
    }
    if (thought.toLowerCase().includes('never') || thought.toLowerCase().includes('always')) {
      alternatives.push('When was a time this wasn\'t true?')
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      analysis: {
        originalThought: thought,
        distortions: identifiedDistortions,
        alternatives: alternatives.slice(0, 3), // Limit to 3 alternatives
        confidence: identifiedDistortions.length > 0 ? 0.8 : 0.6,
        suggestions: [
          'Try writing down evidence for and against this thought',
          'Consider what you would tell a friend having this thought',
          'Practice this reframing technique regularly for best results'
        ]
      }
    })

  } catch (error) {
    console.error('Error in analyze thought POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}