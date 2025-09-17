/**
 * ASTRAL_CORE 2.0 - Crisis Intervention Dashboard Tests
 * Life-critical testing for crisis management dashboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrisisInterventionDashboard from '../../apps/web/src/components/crisis/CrisisInterventionDashboard';
import { 
  createMockCrisisSession, 
  createMockVolunteer,
  CRISIS_SEVERITY_LEVELS,
  CRISIS_PERFORMANCE_BENCHMARKS 
} from '../crisis/setup';

// Mock the crisis session manager
const mockSessionManager = {
  getActiveSessionsSummary: jest.fn(),
  createSecureSession: jest.fn(),
  addVolunteerToSession: jest.fn(),
  escalateToEmergency: jest.fn(),
  endSecureSession: jest.fn(),
  getSessionData: jest.fn(),
};

jest.mock('@astralcore/crisis', () => ({
  CrisisSessionManager: jest.fn(() => mockSessionManager),
}));

// Mock real-time WebSocket connection
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

describe('CrisisInterventionDashboard', () => {
  const mockProps = {
    volunteerId: 'volunteer-123',
    volunteerRole: 'crisis_responder' as const,
    onSessionJoin: jest.fn(),
    onSessionEnd: jest.fn(),
    onEmergencyEscalation: jest.fn(),
  };

  const mockActiveSessions = {
    total: 5,
    byStatus: {
      active: 3,
      escalated: 1,
      resolved: 1,
    },
    bySeverity: {
      low: 2,
      medium: 2,
      high: 1,
      critical: 0,
    },
    encrypted: 5,
    anonymous: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionManager.getActiveSessionsSummary.mockResolvedValue(mockActiveSessions);
  });

  describe('Dashboard Overview', () => {
    it('should render dashboard with session statistics', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Crisis Intervention Dashboard/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Total Active Sessions: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Critical: 0/i)).toBeInTheDocument();
      expect(screen.getByText(/High: 1/i)).toBeInTheDocument();
    });

    it('should display real-time session updates', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('session-update', expect.any(Function));
      });
      
      // Simulate real-time update
      act(() => {
        const updateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'session-update');
        if (updateHandler) {
          updateHandler[1]({
            ...mockActiveSessions,
            total: 6,
            byStatus: { ...mockActiveSessions.byStatus, active: 4 },
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Total Active Sessions: 6/i)).toBeInTheDocument();
      });
    });

    it('should show performance metrics', () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      expect(screen.getByText(/Response Time/i)).toBeInTheDocument();
      expect(screen.getByText(/Session Queue/i)).toBeInTheDocument();
      expect(screen.getByText(/Volunteer Load/i)).toBeInTheDocument();
    });
  });

  describe('Session List', () => {
    const mockSessions = [
      createMockCrisisSession({
        id: 'session-1',
        severity: 'high',
        status: 'active',
        messageCount: 15,
        participants: [createMockVolunteer()],
      }),
      createMockCrisisSession({
        id: 'session-2',
        severity: 'critical',
        status: 'escalated',
        messageCount: 8,
        emergencyEscalations: 1,
      }),
    ];

    beforeEach(() => {
      mockSessionManager.getSessionData.mockImplementation((sessionId) => 
        mockSessions.find(s => s.id === sessionId)
      );
    });

    it('should display list of active sessions', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      // Simulate sessions being loaded
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1](mockSessions);
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/session-1/i)).toBeInTheDocument();
        expect(screen.getByText(/session-2/i)).toBeInTheDocument();
      });
    });

    it('should highlight critical sessions', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1](mockSessions);
        }
      });
      
      await waitFor(() => {
        const criticalSession = screen.getByTestId('session-session-2');
        expect(criticalSession).toHaveClass('critical-session');
        expect(criticalSession).toHaveAttribute('aria-label', expect.stringContaining('Critical'));
      });
    });

    it('should show session details on expand', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1](mockSessions);
        }
      });
      
      await waitFor(() => screen.getByText(/session-1/i));
      
      const expandButton = screen.getByRole('button', { name: /expand session-1/i });
      await user.click(expandButton);
      
      expect(screen.getByText(/Message Count: 15/i)).toBeInTheDocument();
      expect(screen.getByText(/Session Duration:/i)).toBeInTheDocument();
      expect(screen.getByText(/Participants: 1/i)).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should allow volunteer to join session', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const mockSession = createMockCrisisSession({ id: 'session-1' });
      
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1]([mockSession]);
        }
      });
      
      await waitFor(() => screen.getByText(/session-1/i));
      
      const joinButton = screen.getByRole('button', { name: /join session-1/i });
      await user.click(joinButton);
      
      await waitFor(() => {
        expect(mockSessionManager.addVolunteerToSession).toHaveBeenCalledWith(
          'session-1',
          'volunteer-123',
          'volunteer'
        );
      });
      
      expect(mockProps.onSessionJoin).toHaveBeenCalledWith('session-1');
    });

    it('should prevent joining if volunteer at capacity', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      // Mock volunteer at capacity
      const mockSession = createMockCrisisSession({
        id: 'session-1',
        participants: Array(3).fill(createMockVolunteer()), // Max capacity
      });
      
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1]([mockSession]);
        }
      });
      
      await waitFor(() => screen.getByText(/session-1/i));
      
      const joinButton = screen.getByRole('button', { name: /join session-1/i });
      expect(joinButton).toBeDisabled();
      expect(screen.getByText(/Session at capacity/i)).toBeInTheDocument();
    });

    it('should escalate session to emergency', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const mockSession = createMockCrisisSession({
        id: 'session-1',
        severity: 'high',
      });
      
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1]([mockSession]);
        }
      });
      
      await waitFor(() => screen.getByText(/session-1/i));
      
      const escalateButton = screen.getByRole('button', { name: /escalate session-1/i });
      await user.click(escalateButton);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Confirm Emergency Escalation/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByRole('button', { name: /confirm escalation/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockSessionManager.escalateToEmergency).toHaveBeenCalledWith(
          'session-1',
          'volunteer_escalation',
          'volunteer-123'
        );
      });
      
      expect(mockProps.onEmergencyEscalation).toHaveBeenCalledWith('session-1');
    });
  });

  describe('Queue Management', () => {
    it('should display session queue with wait times', () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      expect(screen.getByText(/Session Queue/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Wait Time/i)).toBeInTheDocument();
    });

    it('should prioritize critical sessions in queue', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const queuedSessions = [
        createMockCrisisSession({ id: 'queue-1', severity: 'medium' }),
        createMockCrisisSession({ id: 'queue-2', severity: 'critical' }),
        createMockCrisisSession({ id: 'queue-3', severity: 'low' }),
      ];
      
      act(() => {
        const queueHandler = mockSocket.on.mock.calls.find(call => call[0] === 'queue-update');
        if (queueHandler) {
          queueHandler[1](queuedSessions);
        }
      });
      
      await waitFor(() => {
        const queueItems = screen.getAllByTestId(/queue-item/);
        expect(queueItems[0]).toHaveTextContent('queue-2'); // Critical first
        expect(queueItems[1]).toHaveTextContent('queue-1'); // Medium second
        expect(queueItems[2]).toHaveTextContent('queue-3'); // Low last
      });
    });

    it('should show estimated response time', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const metricsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'metrics-update');
        if (metricsHandler) {
          metricsHandler[1]({
            averageResponseTime: 45000, // 45 seconds
            queueLength: 3,
            availableVolunteers: 5,
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Average Response: 45s/i)).toBeInTheDocument();
      });
    });
  });

  describe('Volunteer Status', () => {
    it('should show volunteer availability status', () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      expect(screen.getByText(/Volunteer Status/i)).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /volunteer availability/i })).toBeInTheDocument();
    });

    it('should allow volunteer to update availability', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const availabilityToggle = screen.getByRole('switch', { name: /available for sessions/i });
      await user.click(availabilityToggle);
      
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('volunteer-status-update', {
          volunteerId: 'volunteer-123',
          available: false,
        });
      });
    });

    it('should display current session load', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const statusHandler = mockSocket.on.mock.calls.find(call => call[0] === 'volunteer-status');
        if (statusHandler) {
          statusHandler[1]({
            volunteerId: 'volunteer-123',
            activeSessions: 2,
            maxSessions: 3,
            totalSessionsToday: 8,
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Active Sessions: 2/3/i)).toBeInTheDocument();
        expect(screen.getByText(/Today's Sessions: 8/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should display system performance metrics', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const performanceHandler = mockSocket.on.mock.calls.find(call => call[0] === 'performance-metrics');
        if (performanceHandler) {
          performanceHandler[1]({
            messageProcessingTime: 35, // ms
            sessionCreationTime: 150, // ms
            errorRate: 0.02, // 2%
            uptime: 99.98, // %
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Message Processing: 35ms/i)).toBeInTheDocument();
        expect(screen.getByText(/Session Creation: 150ms/i)).toBeInTheDocument();
        expect(screen.getByText(/Error Rate: 2%/i)).toBeInTheDocument();
      });
    });

    it('should warn about performance issues', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const performanceHandler = mockSocket.on.mock.calls.find(call => call[0] === 'performance-metrics');
        if (performanceHandler) {
          performanceHandler[1]({
            messageProcessingTime: CRISIS_PERFORMANCE_BENCHMARKS.MESSAGE_PROCESSING_MS + 50,
            sessionCreationTime: CRISIS_PERFORMANCE_BENCHMARKS.SESSION_CREATION_MS + 100,
            errorRate: 0.15, // 15% - high error rate
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Performance Warning/i)).toBeInTheDocument();
        expect(screen.getByText(/System performance degraded/i)).toBeInTheDocument();
      });
    });
  });

  describe('Emergency Alerts', () => {
    it('should display emergency alerts prominently', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const alertHandler = mockSocket.on.mock.calls.find(call => call[0] === 'emergency-alert');
        if (alertHandler) {
          alertHandler[1]({
            sessionId: 'critical-session-1',
            severity: 'critical',
            message: 'Immediate intervention required',
            timestamp: new Date().toISOString(),
          });
        }
      });
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/Immediate intervention required/i);
        expect(alert).toHaveClass('emergency-alert');
      });
    });

    it('should play audio alert for critical situations', async () => {
      const mockAudio = {
        play: jest.fn(),
        pause: jest.fn(),
        currentTime: 0,
      };
      global.Audio = jest.fn(() => mockAudio) as any;
      
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const alertHandler = mockSocket.on.mock.calls.find(call => call[0] === 'emergency-alert');
        if (alertHandler) {
          alertHandler[1]({
            sessionId: 'critical-session-1',
            severity: 'critical',
            message: 'Critical situation detected',
          });
        }
      });
      
      await waitFor(() => {
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for dashboard elements', () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      expect(screen.getByRole('main', { name: /crisis dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /session statistics/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /active sessions/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      // Should be able to navigate through focusable elements
      await user.tab();
      expect(screen.getByRole('switch', { name: /available for sessions/i })).toHaveFocus();
      
      await user.tab();
      const firstSessionButton = screen.getAllByRole('button')[1];
      expect(firstSessionButton).toHaveFocus();
    });

    it('should announce critical alerts to screen readers', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const alertHandler = mockSocket.on.mock.calls.find(call => call[0] === 'emergency-alert');
        if (alertHandler) {
          alertHandler[1]({
            sessionId: 'critical-session-1',
            severity: 'critical',
            message: 'Critical situation detected',
          });
        }
      });
      
      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { name: /emergency announcements/i });
        expect(liveRegion).toHaveTextContent(/Critical situation detected/i);
      });
    });
  });

  describe('Data Filtering and Search', () => {
    it('should filter sessions by severity', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const severityFilter = screen.getByRole('combobox', { name: /filter by severity/i });
      await user.selectOptions(severityFilter, 'critical');
      
      // Should only show critical sessions
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('filter-sessions', {
          severity: 'critical',
        });
      });
    });

    it('should search sessions by ID or keywords', async () => {
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const searchInput = screen.getByRole('searchbox', { name: /search sessions/i });
      await user.type(searchInput, 'session-1');
      
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('search-sessions', {
          query: 'session-1',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket connection errors', async () => {
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      act(() => {
        const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error');
        if (errorHandler) {
          errorHandler[1]({ message: 'Connection lost' });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Attempting to reconnect/i)).toBeInTheDocument();
      });
    });

    it('should handle session management errors gracefully', async () => {
      mockSessionManager.addVolunteerToSession.mockRejectedValue(
        new Error('Session at capacity')
      );
      
      const user = userEvent.setup();
      render(<CrisisInterventionDashboard {...mockProps} />);
      
      const mockSession = createMockCrisisSession({ id: 'session-1' });
      act(() => {
        const sessionsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'sessions-list');
        if (sessionsHandler) {
          sessionsHandler[1]([mockSession]);
        }
      });
      
      await waitFor(() => screen.getByText(/session-1/i));
      
      const joinButton = screen.getByRole('button', { name: /join session-1/i });
      await user.click(joinButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to join session/i)).toBeInTheDocument();
        expect(screen.getByText(/Session at capacity/i)).toBeInTheDocument();
      });
    });
  });
});