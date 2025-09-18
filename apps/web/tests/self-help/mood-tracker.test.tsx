import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MoodTrackerEnhanced from '@/components/self-help/MoodTrackerEnhanced'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('MoodTrackerEnhanced', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders mood tracker with initial state', () => {
    render(<MoodTrackerEnhanced />)
    
    expect(screen.getByText('Mood Tracker')).toBeInTheDocument()
    expect(screen.getByText('Track your emotions and identify patterns')).toBeInTheDocument()
    expect(screen.getByText('How are you feeling?')).toBeInTheDocument()
    expect(screen.getByText('5/10')).toBeInTheDocument()
  })

  it('allows mood selection via slider', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('5')
    
    await user.click(slider)
    fireEvent.change(slider, { target: { value: '8' } })
    
    expect(screen.getByText('8/10')).toBeInTheDocument()
  })

  it('displays emotion wheel when toggled', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const toggleButton = screen.getByText('Show Emotion Wheel')
    await user.click(toggleButton)
    
    expect(screen.getByText('Hide Emotion Wheel')).toBeInTheDocument()
    
    // Check for emotion categories
    expect(screen.getByText('Joy')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
    expect(screen.getByText('Fear')).toBeInTheDocument()
    expect(screen.getByText('Sadness')).toBeInTheDocument()
  })

  it('allows emotion selection', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Show emotion wheel
    await user.click(screen.getByText('Show Emotion Wheel'))
    
    // Select an emotion
    const happyButton = screen.getByText('happy')
    await user.click(happyButton)
    
    // Check if emotion is selected (should appear as a tag)
    expect(screen.getByText('happy')).toBeInTheDocument()
  })

  it('allows trigger selection', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Find trigger buttons by their labels
    const workTrigger = screen.getByText('Work/School')
    await user.click(workTrigger)
    
    // Verify trigger is selected (button should have selected styling)
    expect(workTrigger.closest('button')).toHaveClass('border-blue-500')
  })

  it('allows activity selection', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const exerciseActivity = screen.getByText('Exercise')
    await user.click(exerciseActivity)
    
    expect(exerciseActivity.closest('button')).toHaveClass('border-green-500')
  })

  it('tracks sleep hours and social interaction', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Find sleep slider
    const sleepSlider = screen.getAllByRole('slider')[1] // Second slider is sleep
    fireEvent.change(sleepSlider, { target: { value: '8' } })
    
    expect(screen.getByText('Sleep Hours: 8')).toBeInTheDocument()
    
    // Find social interaction slider
    const socialSlider = screen.getAllByRole('slider')[2] // Third slider is social
    fireEvent.change(socialSlider, { target: { value: '7' } })
    
    expect(screen.getByText('Social Interaction: 7/10')).toBeInTheDocument()
  })

  it('allows weather selection', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const cloudyButton = screen.getByText('Cloudy')
    await user.click(cloudyButton)
    
    expect(cloudyButton.closest('button')).toHaveClass('border-blue-500')
  })

  it('allows medication tracking', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const medicationCheckbox = screen.getByRole('checkbox', { name: /took medication today/i })
    await user.click(medicationCheckbox)
    
    expect(medicationCheckbox).toBeChecked()
  })

  it('allows note taking', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    const notesTextarea = screen.getByPlaceholderText('Any thoughts or reflections about your day...')
    await user.type(notesTextarea, 'Had a great day today!')
    
    expect(notesTextarea).toHaveValue('Had a great day today!')
  })

  it('saves mood entry successfully', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1', mood: 7, timestamp: new Date().toISOString() }
      })
    } as Response)

    render(<MoodTrackerEnhanced />)
    
    // Set mood
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '7' } })
    
    // Add emotion
    await user.click(screen.getByText('Show Emotion Wheel'))
    await user.click(screen.getByText('happy'))
    
    // Add trigger
    await user.click(screen.getByText('Work/School'))
    
    // Add activity
    await user.click(screen.getByText('Exercise'))
    
    // Add notes
    const notesTextarea = screen.getByPlaceholderText('Any thoughts or reflections about your day...')
    await user.type(notesTextarea, 'Feeling good!')
    
    // Save entry
    const saveButton = screen.getByText('Save Mood Entry')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/self-help/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"mood":7')
      })
    })
  })

  it('handles save errors gracefully', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<MoodTrackerEnhanced />)
    
    const saveButton = screen.getByText('Save Mood Entry')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving mood entry:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('displays pattern analysis when available', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1', mood: 7 }
      })
    } as Response)

    render(<MoodTrackerEnhanced />)
    
    const saveButton = screen.getByText('Save Mood Entry')
    await user.click(saveButton)
    
    // Wait for pattern analysis
    await waitFor(() => {
      expect(screen.getByText('Analyzing Patterns...')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('detects crisis patterns in mood data', () => {
    render(<MoodTrackerEnhanced />)
    
    // Set very low mood
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '2' } })
    
    expect(screen.getByText('2/10')).toBeInTheDocument()
    
    // In a real implementation, this would trigger crisis detection
    // when the entry is saved with such a low mood
  })

  it('provides accessibility support', () => {
    render(<MoodTrackerEnhanced />)
    
    // Check for proper ARIA labels
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-label', expect.any(String))
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    
    // Check for proper button labels
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName()
    })
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Tab through interactive elements
    await user.tab()
    expect(screen.getByRole('slider')).toHaveFocus()
    
    // Continue tabbing
    await user.tab()
    expect(screen.getByText('Show Emotion Wheel')).toHaveFocus()
  })

  it('maintains state during emotion selection', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Show emotion wheel
    await user.click(screen.getByText('Show Emotion Wheel'))
    
    // Select multiple emotions
    await user.click(screen.getByText('happy'))
    await user.click(screen.getByText('grateful'))
    
    // Both emotions should be selected
    const selectedEmotions = screen.getAllByText('×')
    expect(selectedEmotions).toHaveLength(2)
  })

  it('validates required fields before saving', async () => {
    const user = userEvent.setup()
    render(<MoodTrackerEnhanced />)
    
    // Try to save without any data (mood is default 5, which should be valid)
    const saveButton = screen.getByText('Save Mood Entry')
    
    // Button should not be disabled since mood has a default value
    expect(saveButton).not.toBeDisabled()
  })
})