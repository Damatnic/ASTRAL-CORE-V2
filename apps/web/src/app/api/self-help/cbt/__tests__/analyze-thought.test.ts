import { NextRequest } from 'next/server'
import { POST } from '../analyze-thought/route'
import { jest } from '@jest/globals'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}))

import { getServerSession } from 'next-auth'
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/self-help/cbt/analyze-thought', () => {
  beforeEach(() => {
    mockGetServerSession.mockClear()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I always mess everything up'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Authentication required')
  })

  it('returns 400 for invalid request data', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({}) // Missing thought
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid request data')
    expect(data.details).toBeDefined()
  })

  it('returns 400 for empty thought', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: ''
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid request data')
  })

  it('identifies all-or-nothing thinking', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I always mess everything up and never do anything right'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.analysis.originalThought).toBe('I always mess everything up and never do anything right')
    expect(data.analysis.distortions).toContain('All-or-Nothing Thinking')
    expect(data.analysis.alternatives).toHaveLength(3)
    expect(data.analysis.confidence).toBeGreaterThan(0.6)
  })

  it('identifies overgeneralization', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'This always happens to me, every time I try something it fails'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Overgeneralization')
    expect(data.analysis.alternatives).toContain('Is this really true every single time?')
  })

  it('identifies should statements', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I should be perfect at everything and must never make mistakes'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Should Statements')
    expect(data.analysis.alternatives.some((alt: string) => 
      alt.includes('realistic') || alt.includes('flexible')
    )).toBe(true)
  })

  it('identifies emotional reasoning', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I feel like a failure so I must be one'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Emotional Reasoning')
  })

  it('identifies jumping to conclusions', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'They probably think I\'m stupid and will reject me'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Jumping to Conclusions')
    expect(data.analysis.alternatives.some((alt: string) => 
      alt.includes('evidence') || alt.includes('explanations')
    )).toBe(true)
  })

  it('provides general alternatives when no specific distortions found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'The weather is nice today'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toHaveLength(0)
    expect(data.analysis.alternatives).toHaveLength(3)
    expect(data.analysis.alternatives).toContain('What evidence supports and contradicts this thought?')
    expect(data.analysis.confidence).toBe(0.6)
  })

  it('provides specific alternatives for failure-related thoughts', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I failed the test so I\'m a failure'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.alternatives.some((alt: string) => 
      alt.includes('learn')
    )).toBe(true)
  })

  it('provides specific alternatives for hate/awful thoughts', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'This situation is awful and I hate everything about it'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.alternatives.some((alt: string) => 
      alt.includes('manageable')
    )).toBe(true)
  })

  it('includes helpful suggestions', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I never succeed at anything'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.suggestions).toHaveLength(3)
    expect(data.analysis.suggestions).toContain('Try writing down evidence for and against this thought')
    expect(data.analysis.suggestions).toContain('Consider what you would tell a friend having this thought')
    expect(data.analysis.suggestions).toContain('Practice this reframing technique regularly for best results')
  })

  it('handles multiple distortions in one thought', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I always fail at everything and everyone must think I\'m terrible'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions.length).toBeGreaterThan(1)
    expect(data.analysis.distortions).toContain('All-or-Nothing Thinking')
  })

  it('limits alternatives to 3 items', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I always fail at everything and everyone must think I\'m terrible and I hate this situation'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.alternatives).toHaveLength(3)
  })

  it('handles malformed JSON', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error')
  })

  it('handles server errors gracefully', async () => {
    mockGetServerSession.mockRejectedValue(new Error('Auth error'))

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'Test thought'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error')
  })

  it('simulates processing time', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const startTime = Date.now()

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I always mess up'
      })
    })

    const response = await POST(request)
    const endTime = Date.now()

    expect(response.status).toBe(200)
    expect(endTime - startTime).toBeGreaterThanOrEqual(950) // Should take at least ~1 second
  })

  it('identifies labeling distortion', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'I am such an idiot and a complete loser'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Labeling')
  })

  it('identifies personalization', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any)

    const request = new NextRequest('http://localhost/api/self-help/cbt/analyze-thought', {
      method: 'POST',
      body: JSON.stringify({
        thought: 'It\'s my fault that the meeting went badly'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.analysis.distortions).toContain('Personalization')
  })
})