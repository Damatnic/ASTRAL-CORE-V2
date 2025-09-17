import { NextRequest } from 'next/server'
import { GET, POST } from '../progress/route'
import { jest } from '@jest/globals'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock auth options
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}))

import { getServerSession } from 'next-auth'
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/self-help/dbt/progress', () => {
  beforeEach(() => {
    mockGetServerSession.mockClear()
  })

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Authentication required')
    })

    it('returns empty progress for new user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress).toEqual([])
    })

    it('returns existing progress for user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      // First, add some progress
      const postRequest = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8,
          notes: ['Test note'],
          lastPracticed: new Date().toISOString()
        })
      })

      await POST(postRequest)

      // Then get progress
      const getRequest = new NextRequest('http://localhost/api/self-help/dbt/progress')
      const response = await GET(getRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress).toHaveLength(1)
      expect(data.progress[0].skillId).toBe('tipp')
    })
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Authentication required')
    })

    it('creates new progress entry', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8,
          notes: ['Very helpful technique'],
          lastPracticed: new Date().toISOString(),
          mastery: 'practicing'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress.skillId).toBe('tipp')
      expect(data.progress.effectiveness).toBe(8)
      expect(data.progress.practiceCount).toBe(1)
      expect(data.progress.mastery).toBe('practicing')
    })

    it('updates existing progress entry', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      // Create initial progress
      const initialRequest = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 6,
          notes: ['First try'],
          lastPracticed: new Date().toISOString()
        })
      })

      await POST(initialRequest)

      // Update progress
      const updateRequest = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8,
          notes: ['Much better this time'],
          lastPracticed: new Date().toISOString(),
          mastery: 'proficient'
        })
      })

      const response = await POST(updateRequest)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress.skillId).toBe('tipp')
      expect(data.progress.effectiveness).toBe(8)
      expect(data.progress.practiceCount).toBe(2) // Incremented
      expect(data.progress.mastery).toBe('proficient')
    })

    it('handles missing optional fields', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'wise-mind',
          effectiveness: 7
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress.skillId).toBe('wise-mind')
      expect(data.progress.effectiveness).toBe(7)
      expect(data.progress.practiceCount).toBe(1)
      expect(data.progress.notes).toEqual([])
      expect(data.progress.mastery).toBe('learning')
    })

    it('handles server errors gracefully', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Auth error'))

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('validates effectiveness range', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 15 // Invalid: should be 1-10
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200) // Still succeeds, just clamps the value
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.progress.effectiveness).toBeLessThanOrEqual(10)
    })

    it('handles malformed JSON', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any)

      const request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('stores progress separately for different users', async () => {
      // User 1
      mockGetServerSession.mockResolvedValue({
        user: { email: 'user1@example.com' }
      } as any)

      const user1Request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 8
        })
      })

      await POST(user1Request)

      // User 2
      mockGetServerSession.mockResolvedValue({
        user: { email: 'user2@example.com' }
      } as any)

      const user2Request = new NextRequest('http://localhost/api/self-help/dbt/progress', {
        method: 'POST',
        body: JSON.stringify({
          skillId: 'tipp',
          effectiveness: 6
        })
      })

      await POST(user2Request)

      // Check User 1's progress
      mockGetServerSession.mockResolvedValue({
        user: { email: 'user1@example.com' }
      } as any)

      const getUser1Request = new NextRequest('http://localhost/api/self-help/dbt/progress')
      const user1Response = await GET(getUser1Request)
      const user1Data = await user1Response.json()
      
      expect(user1Data.progress).toHaveLength(1)
      expect(user1Data.progress[0].effectiveness).toBe(8)

      // Check User 2's progress
      mockGetServerSession.mockResolvedValue({
        user: { email: 'user2@example.com' }
      } as any)

      const getUser2Request = new NextRequest('http://localhost/api/self-help/dbt/progress')
      const user2Response = await GET(getUser2Request)
      const user2Data = await user2Response.json()
      
      expect(user2Data.progress).toHaveLength(1)
      expect(user2Data.progress[0].effectiveness).toBe(6)
    })
  })
})