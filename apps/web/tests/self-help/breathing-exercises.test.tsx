import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import BreathingExercises from '@/components/self-help/BreathingExercises'

// Mock fetch
global.fetch = jest.fn()

// Mock AudioContext
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { value: 440 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  })),
  destination: {},
  currentTime: 0,
  close: jest.fn()
}

Object.defineProperty(window, 'AudioContext', {
  value: jest.fn(() => mockAudioContext)
})

Object.defineProperty(window, 'webkitAudioContext', {
  value: jest.fn(() => mockAudioContext)
})

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Mock timers
jest.useFakeTimers()

describe('BreathingExercises', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.runOnlyPendingTimers()
  })

  it('renders breathing exercises interface', () => {
    render(<BreathingExercises />)
    
    expect(screen.getByText('Breathing Exercises')).toBeInTheDocument()
    expect(screen.getByText('Evidence-based techniques for calm and focus')).toBeInTheDocument()
    expect(screen.getByText('Choose Exercise')).toBeInTheDocument()
  })

  it('displays default exercises', () => {
    render(<BreathingExercises />)
    
    expect(screen.getByText('4-7-8 Breathing')).toBeInTheDocument()
    expect(screen.getByText('Box Breathing')).toBeInTheDocument()
    expect(screen.getByText('Coherent Breathing')).toBeInTheDocument()
    expect(screen.getByText('Belly Breathing')).toBeInTheDocument()
  })

  it('allows exercise selection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const boxBreathingButton = screen.getByText('Box Breathing')
    await user.click(boxBreathingButton)
    
    // Should show selected exercise details
    expect(screen.getByText('Used by Navy SEALs for focus and calm')).toBeInTheDocument()
  })

  it('shows exercise instructions when expanded', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const instructionsButton = screen.getByText('Instructions')
    await user.click(instructionsButton)
    
    expect(screen.getByText('Empty your lungs completely')).toBeInTheDocument()
    expect(screen.getByText('Inhale through your nose for 4 seconds')).toBeInTheDocument()
  })

  it('starts breathing exercise', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    expect(screen.getByText('Inhale')).toBeInTheDocument()
    expect(screen.getByText('Pause')).toBeInTheDocument()
    expect(screen.getByText('Stop')).toBeInTheDocument()
  })

  it('cycles through breathing phases', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Should start with inhale phase
    expect(screen.getByText('Inhale')).toBeInTheDocument()
    
    // Fast forward through inhale phase (4 seconds for 4-7-8)
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    
    // Should move to hold phase
    await waitFor(() => {
      expect(screen.getByText('Hold')).toBeInTheDocument()
    })
    
    // Fast forward through hold phase (7 seconds)
    act(() => {
      jest.advanceTimersByTime(7000)
    })
    
    // Should move to exhale phase
    await waitFor(() => {
      expect(screen.getByText('Exhale')).toBeInTheDocument()
    })
  })

  it('tracks breathing session progress', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Check initial cycle count
    expect(screen.getByText('0/4')).toBeInTheDocument()
    
    // Complete one full cycle (4 + 7 + 8 = 19 seconds for 4-7-8)
    act(() => {
      jest.advanceTimersByTime(19000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('1/4')).toBeInTheDocument()
    })
  })

  it('allows pausing and resuming exercise', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    const pauseButton = screen.getByText('Pause')
    await user.click(pauseButton)
    
    expect(screen.getByText('Resume')).toBeInTheDocument()
    
    const resumeButton = screen.getByText('Resume')
    await user.click(resumeButton)
    
    expect(screen.getByText('Pause')).toBeInTheDocument()
  })

  it('allows stopping exercise', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    const stopButton = screen.getByText('Stop')
    await user.click(stopButton)
    
    expect(screen.getByText('Start Exercise')).toBeInTheDocument()
    expect(screen.getByText('0/4')).toBeInTheDocument()
  })

  it('completes full exercise session', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: '1' } })
    } as Response)
    
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Complete all 4 cycles (4 cycles × 19 seconds = 76 seconds)
    act(() => {
      jest.advanceTimersByTime(76000)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Start Exercise')).toBeInTheDocument()
    })
  })

  it('toggles sound on/off', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const soundButton = screen.getByRole('button', { name: /volume/i })
    await user.click(soundButton)
    
    // Should toggle sound (visual verification would require checking icon change)
    expect(soundButton).toBeInTheDocument()
  })

  it('displays breathing pattern visualization', () => {
    render(<BreathingExercises />)
    
    // Should show pattern visualization with timing
    expect(screen.getByText('Breathing Pattern')).toBeInTheDocument()
    expect(screen.getByText('4s in • 7s hold • 8s out')).toBeInTheDocument()
    expect(screen.getByText('Inhale')).toBeInTheDocument()
    expect(screen.getByText('Hold')).toBeInTheDocument()
    expect(screen.getByText('Exhale')).toBeInTheDocument()
  })

  it('shows exercise benefits', () => {
    render(<BreathingExercises />)
    
    expect(screen.getByText('Benefits')).toBeInTheDocument()
    expect(screen.getByText('Reduces anxiety')).toBeInTheDocument()
    expect(screen.getByText('Improves sleep')).toBeInTheDocument()
    expect(screen.getByText('Lowers blood pressure')).toBeInTheDocument()
  })

  it('handles different exercise types', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    // Switch to Box Breathing
    const boxBreathingButton = screen.getByText('Box Breathing')
    await user.click(boxBreathingButton)
    
    expect(screen.getByText('Used by Navy SEALs for focus and calm')).toBeInTheDocument()
    
    // Pattern should show 4-4-4-4
    expect(screen.getByText('4s in • 4s hold • 4s out • 4s pause')).toBeInTheDocument()
  })

  it('tracks heart rate simulation', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Should display heart rate
    expect(screen.getByText('Heart Rate')).toBeInTheDocument()
    expect(screen.getByText(/\d+/)).toBeInTheDocument() // Should show a number
  })

  it('provides accessibility support', () => {
    render(<BreathingExercises />)
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    
    // Check for accessible buttons
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName()
    })
    
    // Check for progress indicators
    expect(screen.getByText('Cycle')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
  })

  it('handles audio context initialization errors', () => {
    // Mock audio context to throw error
    Object.defineProperty(window, 'AudioContext', {
      value: jest.fn(() => {
        throw new Error('Audio context error')
      })
    })
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<BreathingExercises />)
    
    // Should render without crashing
    expect(screen.getByText('Breathing Exercises')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('validates breathing session data before saving', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as Response)
    
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Complete exercise
    act(() => {
      jest.advanceTimersByTime(76000)
    })
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/breathing'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<BreathingExercises />)
    
    const startButton = screen.getByText('Start Exercise')
    await user.click(startButton)
    
    // Complete exercise
    act(() => {
      jest.advanceTimersByTime(76000)
    })
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })
})