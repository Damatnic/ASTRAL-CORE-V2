import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import ProgressDashboard from '../ProgressDashboard'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock URL.createObjectURL for report downloads
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

const mockMetrics = {
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
      { name: 'Journaling', count: 32, effectiveness: 7.8 }
    ]
  },
  skills: {
    dbtSkillsUsed: 15,
    cbtSessionsCompleted: 8,
    mostUsedSkill: 'TIPP Technique',
    skillEffectiveness: {
      'TIPP Technique': 8.7,
      'Thought Record': 7.9
    },
    masteryLevels: {
      'TIPP Technique': 'proficient',
      'Thought Record': 'practicing'
    }
  },
  goals: [
    {
      id: '1',
      title: 'Complete 5 breathing exercises per week',
      category: 'activity' as const,
      progress: 4,
      target: 5,
      deadline: new Date('2024-01-20'),
      status: 'on-track' as const
    }
  ],
  insights: [
    {
      id: '1',
      type: 'achievement' as const,
      title: 'Mood Stability Improving',
      description: 'Your mood has been more consistent over the past 2 weeks.',
      actionable: false,
      priority: 'medium' as const
    }
  ],
  milestones: [
    {
      id: '1',
      title: '30-Day Streak',
      description: 'Completed mood tracking for 30 consecutive days',
      achievedDate: new Date('2024-01-10'),
      category: 'consistency',
      impact: 'medium' as const
    }
  ]
}

describe('ProgressDashboard', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders dashboard header and navigation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Track your mental health journey and celebrate wins')).toBeInTheDocument()
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Mood')).toBeInTheDocument()
      expect(screen.getByText('Activities')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Goals')).toBeInTheDocument()
    })
  })

  it('displays key metrics cards in overview', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Current Mood')).toBeInTheDocument()
      expect(screen.getByText('7.2/10')).toBeInTheDocument()
      expect(screen.getByText('Activities Today')).toBeInTheDocument()
      expect(screen.getByText('3/5')).toBeInTheDocument()
      expect(screen.getByText('Skills Practiced')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument() // 15 + 8
      expect(screen.getByText('Goals Progress')).toBeInTheDocument()
      expect(screen.getByText('0/1')).toBeInTheDocument()
    })
  })

  it('shows mood trend indicators', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      // Should show improvement trend for mood
      const moodCard = screen.getByText('Current Mood').closest('div')
      expect(moodCard).toBeInTheDocument()
      // TrendingUp icon should be present (tested via data-testid or class)
    })
  })

  it('displays AI insights section', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeInTheDocument()
      expect(screen.getByText('Mood Stability Improving')).toBeInTheDocument()
      expect(screen.getByText('Your mood has been more consistent over the past 2 weeks.')).toBeInTheDocument()
    })
  })

  it('shows recent milestones', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Recent Milestones')).toBeInTheDocument()
      expect(screen.getByText('30-Day Streak')).toBeInTheDocument()
      expect(screen.getByText('Completed mood tracking for 30 consecutive days')).toBeInTheDocument()
    })
  })

  it('switches between different views', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      const moodTab = screen.getByText('Mood')
      fireEvent.click(moodTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Mood Trends')).toBeInTheDocument()
    })

    // Switch to Goals view
    const goalsTab = screen.getByText('Goals')
    fireEvent.click(goalsTab)

    await waitFor(() => {
      expect(screen.getByText('Complete 5 breathing exercises per week')).toBeInTheDocument()
      expect(screen.getByText('on-track')).toBeInTheDocument()
    })
  })

  it('changes timeframe and reloads data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      const timeframeSelect = screen.getByDisplayValue('Last 30 days')
      fireEvent.change(timeframeSelect, { target: { value: '7d' } })
    })

    // Should make new API call with different timeframe
    expect(mockFetch).toHaveBeenCalledWith('/api/progress/metrics?timeframe=7d')
  })

  it('generates and downloads progress report', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    // Mock the download blob response
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    } as Response)

    // Mock document.createElement for download
    const mockElement = {
      href: '',
      download: '',
      click: jest.fn()
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockElement as any)

    render(<ProgressDashboard />)

    await waitFor(() => {
      const exportButton = screen.getByText('Export Report')
      fireEvent.click(exportButton)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/progress/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeframe: '30d',
        includeGraphs: true,
        format: 'pdf'
      })
    })

    await waitFor(() => {
      expect(mockElement.click).toHaveBeenCalled()
    })
  })

  it('opens goal creation modal', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      const newGoalButton = screen.getByText('New Goal')
      fireEvent.click(newGoalButton)
    })

    expect(screen.getByText('Create New Goal')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Complete 5 breathing exercises per week')).toBeInTheDocument()
  })

  it('creates a new goal', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    // Open goal creation modal
    await waitFor(() => {
      const newGoalButton = screen.getByText('New Goal')
      fireEvent.click(newGoalButton)
    })

    // Fill out goal form
    const titleInput = screen.getByPlaceholderText('e.g., Complete 5 breathing exercises per week')
    fireEvent.change(titleInput, { target: { value: 'Practice mindfulness daily' } })

    const categorySelect = screen.getByDisplayValue('Mood')
    fireEvent.change(categorySelect, { target: { value: 'skills' } })

    const targetInput = screen.getByDisplayValue('1')
    fireEvent.change(targetInput, { target: { value: '7' } })

    // Mock goal creation API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ goal: { id: '2', title: 'Practice mindfulness daily' } })
    } as Response)

    // Create goal
    const createButton = screen.getByText('Create Goal')
    fireEvent.click(createButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/progress/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Practice mindfulness daily')
    })
  })

  it('displays goal progress bars and status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: mockMetrics })
    } as Response)

    render(<ProgressDashboard />)

    // Switch to Goals view
    await waitFor(() => {
      const goalsTab = screen.getByText('Goals')
      fireEvent.click(goalsTab)
    })

    await waitFor(() => {
      expect(screen.getByText('Complete 5 breathing exercises per week')).toBeInTheDocument()
      expect(screen.getByText('4/5')).toBeInTheDocument() // Progress
      expect(screen.getByText('on-track')).toBeInTheDocument() // Status
      
      // Progress bar should be at 80% (4/5)
      const progressBar = screen.getByRole('progressbar') || screen.querySelector('[style*="width: 80%"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  it('handles no data state', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: null })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No Progress Data Yet')).toBeInTheDocument()
      expect(screen.getByText('Start using self-help tools to see your progress')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(<ProgressDashboard />)

    await waitFor(() => {
      // Should render without crashing
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()
    })
  })

  it('shows different insight types with appropriate styling', async () => {
    const metricsWithDifferentInsights = {
      ...mockMetrics,
      insights: [
        {
          id: '1',
          type: 'achievement' as const,
          title: 'Achievement Insight',
          description: 'You achieved something great.',
          actionable: false,
          priority: 'medium' as const
        },
        {
          id: '2',
          type: 'warning' as const,
          title: 'Warning Insight',
          description: 'Something needs attention.',
          actionable: true,
          priority: 'high' as const
        },
        {
          id: '3',
          type: 'suggestion' as const,
          title: 'Suggestion Insight',
          description: 'Here is a helpful suggestion.',
          actionable: true,
          priority: 'low' as const
        }
      ]
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: metricsWithDifferentInsights })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Achievement Insight')).toBeInTheDocument()
      expect(screen.getByText('Warning Insight')).toBeInTheDocument()
      expect(screen.getByText('Suggestion Insight')).toBeInTheDocument()
      
      // Check for actionable insights having action buttons
      const actionButtons = screen.getAllByText('Take Action')
      expect(actionButtons).toHaveLength(2) // warning and suggestion insights
    })
  })

  it('displays milestone impacts with different styling', async () => {
    const metricsWithDifferentMilestones = {
      ...mockMetrics,
      milestones: [
        {
          id: '1',
          title: 'Small Milestone',
          description: 'A small achievement',
          achievedDate: new Date('2024-01-10'),
          category: 'consistency',
          impact: 'small' as const
        },
        {
          id: '2',
          title: 'Large Milestone',
          description: 'A major achievement',
          achievedDate: new Date('2024-01-12'),
          category: 'mood',
          impact: 'large' as const
        }
      ]
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ metrics: metricsWithDifferentMilestones })
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Small Milestone')).toBeInTheDocument()
      expect(screen.getByText('Large Milestone')).toBeInTheDocument()
      
      // Different impact levels should have different visual indicators
      const milestoneCards = screen.getAllByText(/Milestone/).map(el => el.closest('div'))
      expect(milestoneCards).toHaveLength(2)
    })
  })
})