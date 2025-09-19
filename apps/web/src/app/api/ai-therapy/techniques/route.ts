import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Therapeutic Techniques API
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    const techniques = getTherapeuticTechniques(category, difficulty)

    return NextResponse.json({
      techniques,
      categories: getCategories(),
      personalized: getPersonalizedTechniques(userId)
    })
  } catch (error) {
    console.error('Failed to fetch techniques:', error)
    return NextResponse.json({ error: 'Failed to fetch techniques' }, { status: 500 })
  }
}

// Start a technique session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'demo-user'

    const data = await request.json()
    const { techniqueId, sessionId, type } = data

    const technique = getTechniqueById(techniqueId)
    if (!technique) {
      return NextResponse.json({ error: 'Technique not found' }, { status: 404 })
    }

    // Generate technique-specific content
    const content = generateTechniqueContent(technique, type)

    // Track technique usage
    const tracking = {
      userId,
      techniqueId,
      sessionId,
      startedAt: new Date(),
      type: technique.type,
      category: technique.category
    }

    return NextResponse.json({
      technique,
      content,
      tracking,
      estimatedDuration: technique.duration,
      instructions: technique.instructions
    })
  } catch (error) {
    console.error('Failed to start technique:', error)
    return NextResponse.json({ error: 'Failed to start technique' }, { status: 500 })
  }
}

function getTherapeuticTechniques(category: string | null, difficulty: string | null) {
  const allTechniques = [
    // CBT Techniques
    {
      id: 'cbt-thought-record',
      name: 'Thought Record',
      type: 'CBT',
      category: 'cognitive',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Identify and challenge negative thought patterns',
      instructions: [
        'Identify the triggering situation',
        'Note your automatic thoughts',
        'Identify emotions and their intensity',
        'Find evidence for and against the thought',
        'Develop a balanced alternative thought',
        'Re-rate your emotions'
      ],
      benefits: ['Reduces cognitive distortions', 'Improves emotional regulation', 'Builds self-awareness'],
      evidenceLevel: 'high'
    },
    {
      id: 'cbt-behavioral-activation',
      name: 'Behavioral Activation',
      type: 'CBT',
      category: 'behavioral',
      difficulty: 'beginner',
      duration: 10,
      description: 'Schedule pleasurable and meaningful activities',
      instructions: [
        'List activities that used to bring joy',
        'Rate each activity by pleasure and mastery',
        'Schedule specific times for activities',
        'Start with small, achievable goals',
        'Track mood before and after activities'
      ],
      benefits: ['Combats depression', 'Increases motivation', 'Improves mood'],
      evidenceLevel: 'high'
    },
    {
      id: 'cbt-cognitive-restructuring',
      name: 'Cognitive Restructuring',
      type: 'CBT',
      category: 'cognitive',
      difficulty: 'advanced',
      duration: 20,
      description: 'Systematically change thinking patterns',
      instructions: [
        'Identify the problematic thought',
        'Examine the evidence',
        'Challenge cognitive distortions',
        'Develop alternative perspectives',
        'Test new beliefs through experiments'
      ],
      benefits: ['Reduces anxiety', 'Improves problem-solving', 'Enhances resilience'],
      evidenceLevel: 'high'
    },

    // DBT Techniques
    {
      id: 'dbt-wise-mind',
      name: 'Wise Mind',
      type: 'DBT',
      category: 'mindfulness',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Balance emotion mind and reasonable mind',
      instructions: [
        'Identify if you\'re in emotion mind or reasonable mind',
        'Take several deep breaths',
        'Ask yourself: What does my wise mind say?',
        'Listen to your intuition',
        'Find the middle path'
      ],
      benefits: ['Improves decision-making', 'Balances emotions and logic', 'Increases self-trust'],
      evidenceLevel: 'moderate'
    },
    {
      id: 'dbt-tipp',
      name: 'TIPP Technique',
      type: 'DBT',
      category: 'distress-tolerance',
      difficulty: 'beginner',
      duration: 5,
      description: 'Rapidly change body chemistry during crisis',
      instructions: [
        'Temperature: Cold water on face or cold shower',
        'Intense exercise: 20 jumping jacks or run in place',
        'Paced breathing: Exhale longer than inhale',
        'Paired muscle relaxation: Tense and release muscles'
      ],
      benefits: ['Immediate crisis relief', 'Reduces emotional intensity', 'Prevents impulsive actions'],
      evidenceLevel: 'moderate'
    },
    {
      id: 'dbt-radical-acceptance',
      name: 'Radical Acceptance',
      type: 'DBT',
      category: 'distress-tolerance',
      difficulty: 'advanced',
      duration: 15,
      description: 'Accept reality without fighting it',
      instructions: [
        'Observe that you are questioning or fighting reality',
        'Remind yourself that reality is what it is',
        'Consider the causes that led to this reality',
        'Practice accepting with your whole self',
        'List behaviors you would do if you accepted',
        'Act as if you have already accepted'
      ],
      benefits: ['Reduces suffering', 'Increases peace', 'Improves coping'],
      evidenceLevel: 'moderate'
    },

    // ACT Techniques
    {
      id: 'act-values-clarification',
      name: 'Values Clarification',
      type: 'ACT',
      category: 'values',
      difficulty: 'intermediate',
      duration: 25,
      description: 'Identify what truly matters to you',
      instructions: [
        'List important life domains',
        'Rate current satisfaction in each domain',
        'Identify core values for each domain',
        'Describe what living by these values looks like',
        'Set value-based goals'
      ],
      benefits: ['Increases life satisfaction', 'Provides direction', 'Enhances meaning'],
      evidenceLevel: 'moderate'
    },
    {
      id: 'act-defusion',
      name: 'Thought Defusion',
      type: 'ACT',
      category: 'mindfulness',
      difficulty: 'beginner',
      duration: 10,
      description: 'Create distance from unhelpful thoughts',
      instructions: [
        'Notice the thought',
        'Say "I\'m having the thought that..."',
        'Repeat the thought in a silly voice',
        'Visualize the thought as clouds passing by',
        'Thank your mind for the thought'
      ],
      benefits: ['Reduces thought impact', 'Increases psychological flexibility', 'Improves perspective'],
      evidenceLevel: 'moderate'
    },

    // Mindfulness Techniques
    {
      id: 'mindfulness-body-scan',
      name: 'Body Scan Meditation',
      type: 'Mindfulness',
      category: 'meditation',
      difficulty: 'beginner',
      duration: 20,
      description: 'Systematically focus on body sensations',
      instructions: [
        'Lie down comfortably',
        'Start with toes, notice sensations',
        'Slowly move attention up through body',
        'Notice without judging',
        'If mind wanders, gently return to body'
      ],
      benefits: ['Reduces tension', 'Increases body awareness', 'Promotes relaxation'],
      evidenceLevel: 'high'
    },
    {
      id: 'mindfulness-54321',
      name: '5-4-3-2-1 Grounding',
      type: 'Mindfulness',
      category: 'grounding',
      difficulty: 'beginner',
      duration: 5,
      description: 'Ground yourself using five senses',
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      benefits: ['Reduces anxiety', 'Stops dissociation', 'Increases present-moment awareness'],
      evidenceLevel: 'moderate'
    },

    // EMDR Preparation
    {
      id: 'emdr-safe-place',
      name: 'Safe Place Visualization',
      type: 'EMDR',
      category: 'preparation',
      difficulty: 'beginner',
      duration: 15,
      description: 'Create internal resource for safety',
      instructions: [
        'Imagine a place where you feel completely safe',
        'Notice all sensory details',
        'Give the place a name',
        'Practice bilateral stimulation (butterfly hug)',
        'Anchor the feeling in your body'
      ],
      benefits: ['Creates internal resource', 'Reduces trauma activation', 'Builds resilience'],
      evidenceLevel: 'moderate'
    },

    // Somatic Techniques
    {
      id: 'somatic-pmr',
      name: 'Progressive Muscle Relaxation',
      type: 'Somatic',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 20,
      description: 'Systematically tense and release muscles',
      instructions: [
        'Start with feet, tense for 5 seconds',
        'Release suddenly, notice relaxation',
        'Move up through muscle groups',
        'End with whole body tension and release',
        'Rest in relaxation'
      ],
      benefits: ['Reduces physical tension', 'Improves sleep', 'Lowers anxiety'],
      evidenceLevel: 'high'
    }
  ]

  let filtered = allTechniques

  if (category) {
    filtered = filtered.filter(t => 
      t.category === category || t.type === category
    )
  }

  if (difficulty) {
    filtered = filtered.filter(t => t.difficulty === difficulty)
  }

  return filtered
}

function getCategories() {
  return {
    types: ['CBT', 'DBT', 'ACT', 'Mindfulness', 'EMDR', 'Somatic'],
    categories: [
      'cognitive',
      'behavioral', 
      'mindfulness',
      'distress-tolerance',
      'values',
      'meditation',
      'grounding',
      'relaxation',
      'preparation'
    ],
    difficulties: ['beginner', 'intermediate', 'advanced']
  }
}

function getPersonalizedTechniques(userId: string) {
  // In production, this would fetch from user's history and preferences
  return [
    {
      techniqueId: 'cbt-thought-record',
      reason: 'Based on your focus on managing negative thoughts',
      effectiveness: 0.82
    },
    {
      techniqueId: 'mindfulness-54321',
      reason: 'Helpful for your reported anxiety symptoms',
      effectiveness: 0.75
    },
    {
      techniqueId: 'dbt-tipp',
      reason: 'Quick relief for high distress moments',
      effectiveness: 0.88
    }
  ]
}

function getTechniqueById(id: string) {
  const techniques = getTherapeuticTechniques(null, null)
  return techniques.find(t => t.id === id)
}

function generateTechniqueContent(technique: any, type: string) {
  const content: any = {
    introduction: `Let's practice ${technique.name} together. This ${technique.type} technique helps with ${technique.description.toLowerCase()}.`,
    steps: technique.instructions.map((instruction: string, index: number) => ({
      step: index + 1,
      instruction,
      duration: Math.floor(technique.duration / technique.instructions.length),
      prompts: generateStepPrompts(technique.type, index)
    })),
    conclusion: `Great work completing ${technique.name}! Remember, this technique becomes more effective with practice.`
  }

  // Add technique-specific content
  if (technique.type === 'CBT' && technique.id === 'cbt-thought-record') {
    content.worksheet = {
      situation: '',
      thoughts: [],
      emotions: [],
      evidenceFor: [],
      evidenceAgainst: [],
      balancedThought: '',
      emotionsAfter: []
    }
  }

  if (technique.category === 'meditation') {
    content.audio = {
      available: true,
      url: `/audio/techniques/${technique.id}.mp3`,
      transcript: true
    }
  }

  return content
}

function generateStepPrompts(type: string, stepIndex: number): string[] {
  const prompts: Record<string, string[][]> = {
    CBT: [
      ['What situation triggered these feelings?', 'Be specific about when and where'],
      ['What thoughts went through your mind?', 'Write them exactly as they occurred'],
      ['How did these thoughts make you feel?', 'Rate the intensity 0-100%'],
      ['What evidence supports this thought?', 'List factual observations'],
      ['What evidence contradicts this thought?', 'Consider alternative explanations'],
      ['What\'s a more balanced perspective?', 'Combine the evidence fairly']
    ],
    DBT: [
      ['Notice your current emotional state', 'Are you in emotion mind or reasonable mind?'],
      ['Take a moment to center yourself', 'Focus on your breath'],
      ['What would wise mind say?', 'Find the middle path'],
      ['How can you apply this wisdom?', 'What action feels right?']
    ],
    Mindfulness: [
      ['Find a comfortable position', 'Close your eyes or soften your gaze'],
      ['Bring attention to your breath', 'Notice without changing it'],
      ['Scan through your body', 'Notice sensations without judgment'],
      ['When thoughts arise, acknowledge them', 'Gently return to the present'],
      ['End with gratitude', 'Thank yourself for this practice']
    ]
  }

  return prompts[type]?.[stepIndex] || ['Continue with this step', 'Take your time']
}