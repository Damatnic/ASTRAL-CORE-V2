import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import CBTToolsHub from '../CBTToolsHub'

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

describe('CBTToolsHub', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders CBT tools correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      expect(screen.getByText('CBT Therapeutic Tools')).toBeInTheDocument()
      expect(screen.getByText('Cognitive Behavioral Therapy tools for identifying and changing unhelpful thoughts and behaviors')).toBeInTheDocument()
    })
  })

  it('displays all CBT tool cards', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      expect(screen.getByText('Thought Record')).toBeInTheDocument()
      expect(screen.getByText('Cognitive Distortion Identifier')).toBeInTheDocument()
      expect(screen.getByText('Behavioral Activation Scheduler')).toBeInTheDocument()
      expect(screen.getByText('Exposure Therapy Tracker')).toBeInTheDocument()
    })
  })

  it('shows tool descriptions and difficulty levels', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      expect(screen.getByText('Identify and challenge unhelpful thinking patterns')).toBeInTheDocument()
      expect(screen.getByText('AI-assisted identification of thinking errors')).toBeInTheDocument()
      expect(screen.getByText('intermediate')).toBeInTheDocument()
      expect(screen.getByText('beginner')).toBeInTheDocument()
    })
  })

  it('opens thought record interface when clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
      expect(thoughtRecordCard).toBeInTheDocument()
    })

    const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
    if (thoughtRecordCard) {
      fireEvent.click(thoughtRecordCard)
      
      await waitFor(() => {
        expect(screen.getByText('Step 1 of 6: Situation')).toBeInTheDocument()
        expect(screen.getByText('What happened? Describe the situation objectively.')).toBeInTheDocument()
      })
    }
  })

  it('navigates through thought record steps', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    // Open thought record
    await waitFor(() => {
      const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
      if (thoughtRecordCard) {
        fireEvent.click(thoughtRecordCard)
      }
    })

    // Fill out situation and proceed
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter situation...')
      fireEvent.change(textarea, { target: { value: 'Had a difficult meeting at work' } })
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 6: Automatic Thought')).toBeInTheDocument()
      expect(screen.getByText('What thought went through your mind?')).toBeInTheDocument()
    })
  })

  it('completes thought record with all steps', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    // Open thought record and fill all steps
    await waitFor(() => {
      const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
      if (thoughtRecordCard) {
        fireEvent.click(thoughtRecordCard)
      }
    })

    // Step 1: Situation
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter situation...')
      fireEvent.change(textarea, { target: { value: 'Had a difficult meeting at work' } })
      fireEvent.click(screen.getByText('Next'))
    })

    // Step 2: Automatic Thought
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter automatic thought...')
      fireEvent.change(textarea, { target: { value: 'I always mess everything up' } })
      fireEvent.click(screen.getByText('Next'))
    })

    // Step 3: Emotion & Intensity
    await waitFor(() => {
      const emotionInput = screen.getByPlaceholderText('e.g., anxious, sad, angry...')
      fireEvent.change(emotionInput, { target: { value: 'anxious' } })
      
      const intensitySlider = screen.getByRole('slider')
      fireEvent.change(intensitySlider, { target: { value: '8' } })
      
      fireEvent.click(screen.getByText('Next'))
    })

    // Step 4: Evidence
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter evidence...')
      fireEvent.change(textarea, { target: { value: 'Some meetings go well, some don\'t' } })
      fireEvent.click(screen.getByText('Next'))
    })

    // Step 5: Alternative Thought
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter alternative thought...')
      fireEvent.change(textarea, { target: { value: 'This was one difficult meeting, not all meetings' } })
      fireEvent.click(screen.getByText('Next'))
    })

    // Step 6: New Emotion
    await waitFor(() => {
      const emotionInput = screen.getByPlaceholderText('How do you feel now?')
      fireEvent.change(emotionInput, { target: { value: 'calm' } })
      
      const intensitySlider = screen.getByRole('slider')
      fireEvent.change(intensitySlider, { target: { value: '4' } })
    })

    // Mock the save API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response)

    const saveButton = screen.getByText('Save Thought Record')
    fireEvent.click(saveButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/self-help/cbt/thought-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Had a difficult meeting at work')
    })
  })

  it('opens distortion identifier and analyzes thought', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    // Open distortion identifier
    await waitFor(() => {
      const distortionCard = screen.getByText('Cognitive Distortion Identifier').closest('div')
      if (distortionCard) {
        fireEvent.click(distortionCard)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Cognitive Distortion Identifier')).toBeInTheDocument()
      expect(screen.getByText('AI-powered analysis of thinking patterns')).toBeInTheDocument()
    })

    // Enter a thought for analysis
    const textarea = screen.getByPlaceholderText('e.g., \'I always mess everything up\' or \'Nobody likes me\'')
    fireEvent.change(textarea, { target: { value: 'I never do anything right' } })

    // Mock the analysis API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        distortions: ['All-or-Nothing Thinking', 'Overgeneralization'],
        alternatives: [
          'What evidence supports and contradicts this thought?',
          'When was a time this wasn\'t true?'
        ]
      })
    } as Response)

    const analyzeButton = screen.getByText('Analyze Thought')
    fireEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByText('Identified Cognitive Distortions')).toBeInTheDocument()
      expect(screen.getByText('All-or-Nothing Thinking')).toBeInTheDocument()
      expect(screen.getByText('Alternative Thoughts')).toBeInTheDocument()
    })
  })

  it('displays cognitive distortion descriptions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    // Open distortion identifier and analyze
    await waitFor(() => {
      const distortionCard = screen.getByText('Cognitive Distortion Identifier').closest('div')
      if (distortionCard) {
        fireEvent.click(distortionCard)
      }
    })

    const textarea = screen.getByPlaceholderText('e.g., \'I always mess everything up\' or \'Nobody likes me\'')
    fireEvent.change(textarea, { target: { value: 'I always fail at everything' } })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        distortions: ['All-or-Nothing Thinking'],
        alternatives: ['What would be a more balanced way to see this?']
      })
    } as Response)

    fireEvent.click(screen.getByText('Analyze Thought'))

    await waitFor(() => {
      expect(screen.getByText('Seeing things in black and white categories')).toBeInTheDocument()
    })
  })

  it('shows loading state during analysis', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      const distortionCard = screen.getByText('Cognitive Distortion Identifier').closest('div')
      if (distortionCard) {
        fireEvent.click(distortionCard)
      }
    })

    const textarea = screen.getByPlaceholderText('e.g., \'I always mess everything up\' or \'Nobody likes me\'')
    fireEvent.change(textarea, { target: { value: 'I never succeed' } })

    // Mock delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            distortions: ['Overgeneralization'],
            alternatives: ['When was a time this wasn\'t true?']
          })
        } as Response), 1000)
      )
    )

    fireEvent.click(screen.getByText('Analyze Thought'))

    expect(screen.getByText('Analyzing...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Overgeneralization')).toBeInTheDocument()
    })
  })

  it('handles analysis API errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      const distortionCard = screen.getByText('Cognitive Distortion Identifier').closest('div')
      if (distortionCard) {
        fireEvent.click(distortionCard)
      }
    })

    const textarea = screen.getByPlaceholderText('e.g., \'I always mess everything up\' or \'Nobody likes me\'')
    fireEvent.change(textarea, { target: { value: 'Test thought' } })

    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('Analysis failed'))

    fireEvent.click(screen.getByText('Analyze Thought'))

    // Should not crash the component
    await waitFor(() => {
      expect(screen.getByText('Analyze Thought')).toBeInTheDocument()
    })
  })

  it('displays existing thought records', async () => {
    const mockRecords = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        situation: 'Work presentation',
        automaticThought: 'I will embarrass myself',
        emotion: 'anxious',
        emotionIntensity: 8,
        newEmotionIntensity: 4,
        evidence: 'Previous presentations went well'
      }
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: mockRecords, 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
      if (thoughtRecordCard) {
        fireEvent.click(thoughtRecordCard)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Recent Thought Records')).toBeInTheDocument()
      expect(screen.getByText('Work presentation')).toBeInTheDocument()
      expect(screen.getByText('I will embarrass myself')).toBeInTheDocument()
      expect(screen.getByText('anxious: 8/10 → 4/10')).toBeInTheDocument()
    })
  })

  it('validates thought record inputs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        records: [], 
        tasks: [], 
        activities: [] 
      })
    } as Response)

    render(<CBTToolsHub />)

    await waitFor(() => {
      const thoughtRecordCard = screen.getByText('Thought Record').closest('div')
      if (thoughtRecordCard) {
        fireEvent.click(thoughtRecordCard)
      }
    })

    // Try to proceed without filling required field
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Should stay on the same step
    expect(screen.getByText('Step 1 of 6: Situation')).toBeInTheDocument()
  })
})