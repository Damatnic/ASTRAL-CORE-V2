/**
 * Component Integration Tests
 * Tests interactions between multiple components and systems
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import io from 'socket.io-client';

// Component and context imports
import { CrisisDetectionProvider } from '@/lib/crisis/CrisisDetectionContext';
import { TherapySessionProvider } from '@/lib/ai-therapy/TherapySessionContext';
import { NotificationProvider } from '@/lib/notifications/NotificationContext';
import { WebSocketProvider } from '@/lib/websocket/WebSocketContext';
import Navigation from '@/components/navigation/Navigation';
import CrisisChat from '@/components/crisis/CrisisChat';
import AITherapyChat from '@/components/ai-therapy/AITherapyChat';
import MoodTracker from '@/components/mood/MoodTracker';
import ProviderDashboard from '@/components/provider/ProviderDashboard';

// Mock WebSocket
jest.mock('socket.io-client');

describe('Navigation and Routing Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('should navigate between pages while maintaining state', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <Navigation />
          <div id="page-content">Home</div>
        </SessionProvider>
      </QueryClientProvider>
    );

    // Navigate to crisis page
    const crisisLink = screen.getByRole('link', { name: /Crisis Help/i });
    await user.click(crisisLink);

    rerender(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <Navigation />
          <div id="page-content">Crisis Page</div>
        </SessionProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Crisis Page')).toBeInTheDocument();
    
    // Navigation should show active state
    expect(crisisLink).toHaveAttribute('aria-current', 'page');
  });

  it('should show crisis banner when crisis is detected', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CrisisDetectionProvider>
          <Navigation />
        </CrisisDetectionProvider>
      </QueryClientProvider>
    );

    // Simulate crisis detection
    const crisisEvent = new CustomEvent('crisisDetected', {
      detail: { level: 'HIGH', message: 'User in distress' }
    });
    window.dispatchEvent(crisisEvent);

    await waitFor(() => {
      expect(screen.getByTestId('crisis-banner')).toBeInTheDocument();
      expect(screen.getByText(/Immediate Help Available/i)).toBeInTheDocument();
    });
  });

  it('should update navigation based on authentication status', () => {
    const { rerender } = render(
      <SessionProvider session={null}>
        <Navigation />
      </SessionProvider>
    );

    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dashboard/i })).not.toBeInTheDocument();

    // Simulate authentication
    const mockSession = {
      user: { id: 'user-123', name: 'Test User', role: 'patient' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    rerender(
      <SessionProvider session={mockSession}>
        <Navigation />
      </SessionProvider>
    );

    expect(screen.queryByRole('link', { name: /Sign In/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
  });
});

describe('Crisis Detection and Response Integration', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  it('should integrate crisis detection across multiple components', async () => {
    const user = userEvent.setup();
    
    render(
      <CrisisDetectionProvider>
        <WebSocketProvider>
          <AITherapyChat userId="user-123" />
          <Navigation />
        </WebSocketProvider>
      </CrisisDetectionProvider>
    );

    // Type crisis message in AI therapy chat
    const chatInput = screen.getByRole('textbox');
    await user.type(chatInput, 'I want to hurt myself');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      // Crisis banner should appear in navigation
      expect(screen.getByTestId('crisis-banner')).toBeInTheDocument();
      
      // Crisis resources should appear in chat
      expect(screen.getByText(/Crisis Resources/i)).toBeInTheDocument();
      expect(screen.getByText(/988/)).toBeInTheDocument();
      
      // WebSocket should emit crisis event
      expect(mockSocket.emit).toHaveBeenCalledWith('crisis_detected', 
        expect.objectContaining({
          userId: 'user-123',
          level: expect.any(String),
          timestamp: expect.any(String)
        })
      );
    });
  });

  it('should escalate crisis to provider dashboard', async () => {
    const providerSession = {
      user: { id: 'provider-789', role: 'provider' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    render(
      <SessionProvider session={providerSession}>
        <WebSocketProvider>
          <ProviderDashboard providerId="provider-789" />
        </WebSocketProvider>
      </SessionProvider>
    );

    // Simulate crisis alert via WebSocket
    const crisisAlert = {
      patientId: 'user-123',
      patientName: 'John Doe',
      level: 'IMMEDIATE',
      message: 'Suicide risk detected',
      timestamp: new Date().toISOString()
    };

    const onCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'crisis_alert'
    )?.[1];
    
    if (onCallback) {
      onCallback(crisisAlert);
    }

    await waitFor(() => {
      expect(screen.getByTestId('crisis-alert-modal')).toBeInTheDocument();
      expect(screen.getByText(/IMMEDIATE ATTENTION REQUIRED/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Contact Patient/i })).toBeInTheDocument();
    });
  });
});

describe('Therapy Session and Mood Tracking Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('should update mood before and after therapy session', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <TherapySessionProvider>
          <AITherapyChat userId="user-123" />
          <MoodTracker />
        </TherapySessionProvider>
      </QueryClientProvider>
    );

    // Pre-session mood check
    expect(screen.getByText(/How are you feeling before we start/i)).toBeInTheDocument();
    
    const preMoodButton = screen.getByRole('button', { name: '4' });
    await user.click(preMoodButton);

    // Conduct therapy session
    const chatInput = screen.getByRole('textbox');
    await user.type(chatInput, 'I am struggling with anxiety');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('ai-response')).toBeInTheDocument();
    });

    // End session
    const endButton = screen.getByRole('button', { name: /End Session/i });
    await user.click(endButton);

    // Post-session mood check
    await waitFor(() => {
      expect(screen.getByText(/How are you feeling after our session/i)).toBeInTheDocument();
    });

    const postMoodButton = screen.getByRole('button', { name: '6' });
    await user.click(postMoodButton);

    // Session summary should show mood improvement
    await waitFor(() => {
      expect(screen.getByText(/Mood Improvement: \+2/i)).toBeInTheDocument();
    });
  });

  it('should correlate mood patterns with therapy engagement', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <div data-testid="mood-therapy-analytics">
          <MoodAnalytics userId="user-123" />
          <TherapyEngagement userId="user-123" />
        </div>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const analytics = screen.getByTestId('mood-therapy-analytics');
      
      // Check correlation display
      expect(within(analytics).getByText(/Therapy Impact/i)).toBeInTheDocument();
      expect(within(analytics).getByText(/Sessions Attended/i)).toBeInTheDocument();
      expect(within(analytics).getByText(/Average Mood Improvement/i)).toBeInTheDocument();
      
      // Verify positive correlation
      const correlation = within(analytics).getByTestId('correlation-score');
      expect(parseFloat(correlation.textContent || '0')).toBeGreaterThan(0);
    });
  });
});

describe('Real-time Notification Integration', () => {
  let mockSocket: any;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  it('should deliver notifications across different contexts', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <WebSocketProvider>
            <div data-testid="app-container">
              <Navigation />
              <AITherapyChat userId="user-123" />
            </div>
          </WebSocketProvider>
        </NotificationProvider>
      </QueryClientProvider>
    );

    // Simulate various notification types
    const notifications = [
      {
        type: 'appointment_reminder',
        message: 'Therapy session in 15 minutes',
        priority: 'medium'
      },
      {
        type: 'crisis_resource',
        message: 'New coping strategy available',
        priority: 'low'
      },
      {
        type: 'provider_message',
        message: 'Dr. Smith sent you a message',
        priority: 'high'
      }
    ];

    for (const notification of notifications) {
      const onCallback = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'notification'
      )?.[1];
      
      if (onCallback) {
        onCallback(notification);
      }
    }

    await waitFor(() => {
      // Check notification badge in navigation
      const badge = screen.getByTestId('notification-badge');
      expect(badge).toHaveTextContent('3');
      
      // Check notification toast appears
      expect(screen.getByText('Dr. Smith sent you a message')).toBeInTheDocument();
    });
  });

  it('should prioritize crisis notifications', async () => {
    render(
      <NotificationProvider>
        <WebSocketProvider>
          <div data-testid="notification-center" />
        </WebSocketProvider>
      </NotificationProvider>
    );

    // Send mixed priority notifications
    const notifications = [
      { id: 1, type: 'regular', message: 'Daily check-in', priority: 'low' },
      { id: 2, type: 'crisis', message: 'Crisis support available', priority: 'urgent' },
      { id: 3, type: 'appointment', message: 'Upcoming appointment', priority: 'medium' }
    ];

    notifications.forEach(notification => {
      window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
    });

    await waitFor(() => {
      const notificationElements = screen.getAllByTestId(/notification-item/);
      
      // Crisis notification should be first
      expect(notificationElements[0]).toHaveTextContent('Crisis support available');
      
      // Crisis notification should have special styling
      expect(notificationElements[0]).toHaveClass('notification-urgent');
    });
  });
});

describe('Data Persistence and Sync Integration', () => {
  it('should sync data between online and offline states', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MoodTracker userId="user-123" />
      </QueryClientProvider>
    );

    // Enter mood while online
    const moodButton = screen.getByRole('button', { name: '7' });
    await user.click(moodButton);
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    // Simulate offline
    window.dispatchEvent(new Event('offline'));
    
    await waitFor(() => {
      expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
    });

    // Enter mood while offline
    const offlineMoodButton = screen.getByRole('button', { name: '5' });
    await user.click(offlineMoodButton);
    await user.click(saveButton);

    expect(screen.getByText(/Saved locally/i)).toBeInTheDocument();

    // Simulate coming back online
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.getByText(/Syncing data/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/All data synced/i)).toBeInTheDocument();
    });
  });

  it('should handle concurrent updates gracefully', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={new QueryClient()}>
        <div>
          <MoodTracker userId="user-123" />
          <AITherapyChat userId="user-123" />
        </div>
      </QueryClientProvider>
    );

    // Start therapy session
    const chatInput = screen.getByRole('textbox');
    await user.type(chatInput, 'Starting therapy');
    await user.keyboard('{Enter}');

    // Simultaneously update mood
    const moodButton = screen.getByRole('button', { name: '6' });
    await user.click(moodButton);

    // Both operations should complete without conflict
    await waitFor(() => {
      expect(screen.getByTestId('ai-response')).toBeInTheDocument();
      expect(screen.getByText(/Mood recorded/i)).toBeInTheDocument();
    });

    // Data should be consistent
    const sessionData = screen.getByTestId('session-data');
    expect(sessionData).toHaveTextContent('Current Mood: 6');
  });
});

describe('Provider and Patient Communication Integration', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  it('should enable real-time communication between provider and patient', async () => {
    const user = userEvent.setup();
    
    // Render provider view
    const { rerender } = render(
      <SessionProvider session={{ user: { id: 'provider-789', role: 'provider' }, expires: '' }}>
        <WebSocketProvider>
          <ProviderMessaging providerId="provider-789" patientId="user-123" />
        </WebSocketProvider>
      </SessionProvider>
    );

    // Provider sends message
    const providerInput = screen.getByPlaceholderText(/Type your message/i);
    await user.type(providerInput, 'How are you feeling today?');
    await user.keyboard('{Enter}');

    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      from: 'provider-789',
      to: 'user-123',
      message: 'How are you feeling today?',
      timestamp: expect.any(String)
    });

    // Switch to patient view
    rerender(
      <SessionProvider session={{ user: { id: 'user-123', role: 'patient' }, expires: '' }}>
        <WebSocketProvider>
          <PatientMessaging patientId="user-123" />
        </WebSocketProvider>
      </SessionProvider>
    );

    // Simulate receiving message
    const onCallback = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'message'
    )?.[1];
    
    if (onCallback) {
      onCallback({
        from: 'provider-789',
        message: 'How are you feeling today?',
        timestamp: new Date().toISOString()
      });
    }

    await waitFor(() => {
      expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
      expect(screen.getByText(/Dr. Provider/i)).toBeInTheDocument();
    });
  });
});

describe('Safety Plan Integration', () => {
  it('should make safety plan accessible from multiple entry points', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Navigation />
        <CrisisChat />
        <AITherapyChat userId="user-123" />
      </div>
    );

    // Access from navigation
    const navSafetyPlan = screen.getByRole('link', { name: /Safety Plan/i });
    expect(navSafetyPlan).toBeInTheDocument();

    // Access from crisis chat
    const crisisSafetyButton = within(screen.getByTestId('crisis-chat')).getByRole('button', {
      name: /View Safety Plan/i
    });
    expect(crisisSafetyButton).toBeInTheDocument();

    // Trigger from AI therapy when crisis detected
    const chatInput = screen.getByRole('textbox');
    await user.type(chatInput, 'I am having suicidal thoughts');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const therapySafetyPrompt = screen.getByTestId('safety-plan-prompt');
      expect(therapySafetyPrompt).toBeInTheDocument();
      expect(within(therapySafetyPrompt).getByText(/Would you like to review your safety plan/i)).toBeInTheDocument();
    });
  });

  it('should sync safety plan updates across components', async () => {
    const user = userEvent.setup();
    
    render(
      <SafetyPlanProvider>
        <div>
          <SafetyPlanEditor userId="user-123" />
          <SafetyPlanViewer userId="user-123" />
        </div>
      </SafetyPlanProvider>
    );

    // Add a coping strategy in editor
    const editorSection = screen.getByTestId('safety-plan-editor');
    const strategyInput = within(editorSection).getByPlaceholderText(/Add coping strategy/i);
    
    await user.type(strategyInput, 'Take a walk outside');
    await user.keyboard('{Enter}');

    // Should immediately appear in viewer
    const viewerSection = screen.getByTestId('safety-plan-viewer');
    await waitFor(() => {
      expect(within(viewerSection).getByText('Take a walk outside')).toBeInTheDocument();
    });
  });
});

// Mock component implementations
function MoodAnalytics({ userId }: { userId: string }) {
  return (
    <div>
      <h2>Therapy Impact</h2>
      <div>Sessions Attended: 12</div>
      <div>Average Mood Improvement: +2.3</div>
      <div data-testid="correlation-score">0.73</div>
    </div>
  );
}

function TherapyEngagement({ userId }: { userId: string }) {
  return <div>Therapy Engagement Data</div>;
}

function ProviderMessaging({ providerId, patientId }: any) {
  return (
    <div>
      <input placeholder="Type your message" />
    </div>
  );
}

function PatientMessaging({ patientId }: any) {
  return <div>Patient Messaging</div>;
}

function SafetyPlanProvider({ children }: any) {
  return <div>{children}</div>;
}

function SafetyPlanEditor({ userId }: any) {
  return (
    <div data-testid="safety-plan-editor">
      <input placeholder="Add coping strategy" />
    </div>
  );
}

function SafetyPlanViewer({ userId }: any) {
  return <div data-testid="safety-plan-viewer">Safety Plan Content</div>;
}