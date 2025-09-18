import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import DBTSkillsHub from '../DBTSkillsHub'

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

describe('DBTSkillsHub', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ progress: [] })
      } as Response), 100))
    )

    render(<DBTSkillsHub />)
    expect(screen.getByText('DBT Skills Training')).toBeInTheDocument()
  })

  it('displays DBT skill categories', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    await waitFor(() => {
      expect(screen.getByText('Distress Tolerance')).toBeInTheDocument()
      expect(screen.getByText('Emotion Regulation')).toBeInTheDocument()
      expect(screen.getByText('Interpersonal Effectiveness')).toBeInTheDocument()
      expect(screen.getByText('Mindfulness')).toBeInTheDocument()
    })
  })

  it('shows category description and skill count', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    await waitFor(() => {
      expect(screen.getByText('Skills for surviving crisis situations without making them worse')).toBeInTheDocument()
      expect(screen.getByText('5 skills')).toBeInTheDocument()
    })
  })

  it('navigates to skill category when clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      expect(distressToleranceCard).toBeInTheDocument()
    })

    const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
    if (distressToleranceCard) {
      fireEvent.click(distressToleranceCard)
      
      await waitFor(() => {
        expect(screen.getByText('← Back to Categories')).toBeInTheDocument()
        expect(screen.getByText('Distress Tolerance Skills')).toBeInTheDocument()
      })
    }
  })

  it('displays individual skills with correct information', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Navigate to distress tolerance category
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('TIPP')).toBeInTheDocument()
      expect(screen.getByText('Temperature, Intense Exercise, Paced Breathing, Paired Muscle Relaxation')).toBeInTheDocument()
      expect(screen.getByText('Fast-acting techniques to change body chemistry and reduce intense emotions')).toBeInTheDocument()
      expect(screen.getByText('beginner')).toBeInTheDocument()
      expect(screen.getByText('5-15 minutes')).toBeInTheDocument()
    })
  })

  it('starts skill practice when Practice button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Navigate to distress tolerance category
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    await waitFor(() => {
      const practiceButtons = screen.getAllByText('Practice')
      expect(practiceButtons).toHaveLength(5) // 5 skills in distress tolerance
    })

    // Mock the practice start API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    const practiceButtons = screen.getAllByText('Practice')
    fireEvent.click(practiceButtons[0])

    expect(mockFetch).toHaveBeenCalledWith('/api/self-help/dbt/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillId: 'tipp',
        action: 'start',
        timestamp: expect.any(Date)
      })
    })
  })

  it('displays skill practice interface when skill is selected', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Navigate and start practice
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    await waitFor(() => {
      const practiceButtons = screen.getAllByText('Practice')
      fireEvent.click(practiceButtons[0])
    })

    // Practice interface should appear
    await waitFor(() => {
      expect(screen.getByText('Steps')).toBeInTheDocument()
      expect(screen.getByText('Practice Scenarios')).toBeInTheDocument()
      expect(screen.getByText('Practice Reflection')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(<DBTSkillsHub />)

    // Should still render the component without crashing
    await waitFor(() => {
      expect(screen.getByText('DBT Skills Training')).toBeInTheDocument()
    })
  })

  it('displays progress for completed skills', async () => {
    const mockProgress = [
      {
        skillId: 'tipp',
        practiceCount: 5,
        lastPracticed: new Date('2024-01-15'),
        effectiveness: 8,
        mastery: 'practicing'
      }
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: mockProgress })
    } as Response)

    render(<DBTSkillsHub />)

    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument() // Practice count
      expect(screen.getByText('8/10')).toBeInTheDocument() // Effectiveness
      expect(screen.getByText('Last practiced: 1/15/2024')).toBeInTheDocument()
    })
  })

  it('completes skill practice with effectiveness rating', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Start practice
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    await waitFor(() => {
      const practiceButtons = screen.getAllByText('Practice')
      fireEvent.click(practiceButtons[0])
    })

    // Complete practice
    await waitFor(() => {
      const effectivenessSlider = screen.getByRole('slider')
      fireEvent.change(effectivenessSlider, { target: { value: '8' } })
      
      const notesTextarea = screen.getByPlaceholderText('How did this skill work for you? What did you notice?')
      fireEvent.change(notesTextarea, { target: { value: 'This technique really helped me calm down.' } })
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    const completeButton = screen.getByText('Complete Practice')
    fireEvent.click(completeButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/self-help/dbt/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillId: 'tipp',
        action: 'complete',
        effectiveness: 8,
        notes: 'This technique really helped me calm down.',
        timestamp: expect.any(Date)
      })
    })
  })

  it('shows practice scenarios with guidance', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Start practice
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    await waitFor(() => {
      const practiceButtons = screen.getAllByText('Practice')
      fireEvent.click(practiceButtons[0])
    })

    await waitFor(() => {
      expect(screen.getByText('Scenario 1')).toBeInTheDocument()
      expect(screen.getByText('Feeling overwhelmed before an important meeting')).toBeInTheDocument()
      expect(screen.getByText('Start with cold water on wrists and face, then practice paced breathing')).toBeInTheDocument()
    })
  })

  it('navigates through practice steps', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ progress: [] })
    } as Response)

    render(<DBTSkillsHub />)

    // Start practice
    await waitFor(() => {
      const distressToleranceCard = screen.getByText('Distress Tolerance').closest('div')
      if (distressToleranceCard) {
        fireEvent.click(distressToleranceCard)
      }
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    await waitFor(() => {
      const practiceButtons = screen.getAllByText('Practice')
      fireEvent.click(practiceButtons[0])
    })

    await waitFor(() => {
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      // Should move to next step
      const previousButton = screen.getByText('Previous')
      expect(previousButton).toBeEnabled()
    })
  })
})