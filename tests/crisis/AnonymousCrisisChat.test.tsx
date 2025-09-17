/**
 * ASTRAL_CORE 2.0 - Anonymous Crisis Chat Tests
 * Life-critical testing for anonymous crisis intervention chat
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnonymousCrisisChat from '../../apps/web/src/components/crisis/AnonymousCrisisChat';
import { 
  createMockCrisisSession, 
  createMockCrisisMessage, 
  CRISIS_KEYWORDS,
  CRISIS_PERFORMANCE_BENCHMARKS 
} from '../crisis/setup';

// Mock WebSocket and Socket.IO
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: 'mock-socket-id',
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

// Mock crisis session manager
jest.mock('@astralcore/crisis', () => ({
  CrisisSessionManager: jest.fn().mockImplementation(() => ({
    createSecureSession: jest.fn(),
    processSecureMessage: jest.fn(),
    addVolunteerToSession: jest.fn(),
    escalateToEmergency: jest.fn(),
    endSecureSession: jest.fn(),
    getSessionData: jest.fn(),
  })),
}));

// Mock AI crisis detection
jest.mock('../../apps/web/src/lib/ai/crisis-detection-engine', () => ({
  CrisisDetectionEngine: jest.fn().mockImplementation(() => ({
    analyzeCrisisRisk: jest.fn(),
    getRecommendations: jest.fn(),
  })),
}));

describe('AnonymousCrisisChat', () => {
  const mockProps = {
    onSessionStart: jest.fn(),
    onSessionEnd: jest.fn(),
    onEmergencyEscalation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    
    // Reset performance timing
    jest.spyOn(performance, 'now').mockReturnValue(Date.now());
  });

  describe('Component Initialization', () => {
    it('should render initial state correctly', () => {
      render(<AnonymousCrisisChat {...mockProps} />);
      
      expect(screen.getByText(/Anonymous Crisis Support/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Anonymous Chat/i)).toBeInTheDocument();
      expect(screen.getByText(/Your privacy is protected/i)).toBeInTheDocument();
    });

    it('should show privacy and safety information', () => {
      render(<AnonymousCrisisChat {...mockProps} />);
      
      expect(screen.getByText(/End-to-end encrypted/i)).toBeInTheDocument();
      expect(screen.getByText(/No personal information required/i)).toBeInTheDocument();
      expect(screen.getByText(/Professional crisis counselors available/i)).toBeInTheDocument();
    });

    it('should display crisis severity indicator', () => {
      render(<AnonymousCrisisChat {...mockProps} />);
      
      const severityIndicator = screen.getByRole('status', { name: /crisis severity/i });
      expect(severityIndicator).toBeInTheDocument();
      expect(severityIndicator).toHaveTextContent(/Low/i);
    });
  });

  describe('Session Creation', () => {
    it('should create anonymous session on chat start', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      const startChatButton = screen.getByText(/Start Anonymous Chat/i);
      await user.click(startChatButton);
      
      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith(
          undefined, // anonymous user
          'anonymous_chat',
          expect.objectContaining({
            ip: expect.any(String),
            userAgent: expect.any(String),
          })
        );
      });
      
      expect(mockProps.onSessionStart).toHaveBeenCalled();
    });

    it('should connect to WebSocket on session start', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('join-crisis-session', {
          sessionId: 'crisis-session-test-123',
          type: 'anonymous_user',
        });
      });
    });

    it('should handle session creation errors gracefully', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockRejectedValue(new Error('Service unavailable'));
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to start chat session/i)).toBeInTheDocument();
        expect(screen.getByText(/Please try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
    });

    it('should send messages through secure channel', async () => {
      const mockProcessMessage = require('@astralcore/crisis').CrisisSessionManager().processSecureMessage;
      mockProcessMessage.mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'I need help with my anxiety');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockProcessMessage).toHaveBeenCalledWith(
          'crisis-session-test-123',
          expect.any(String), // anonymous user ID
          'I need help with my anxiety',
          'text'
        );
      });
    });

    it('should perform real-time crisis risk analysis', async () => {
      const mockAnalyzeRisk = require('../../apps/web/src/lib/ai/crisis-detection-engine').CrisisDetectionEngine().analyzeCrisisRisk;
      mockAnalyzeRisk.mockResolvedValue({
        riskLevel: 'medium',
        confidence: 0.7,
        triggers: ['anxiety'],
      });
      
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'I feel hopeless and overwhelmed');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockAnalyzeRisk).toHaveBeenCalledWith('I feel hopeless and overwhelmed');
      });
      
      // Should update crisis severity indicator
      const severityIndicator = screen.getByRole('status', { name: /crisis severity/i });
      await waitFor(() => {
        expect(severityIndicator).toHaveTextContent(/Medium/i);
      });
    });

    it('should trigger automatic escalation for high-risk messages', async () => {
      const mockAnalyzeRisk = require('../../apps/web/src/lib/ai/crisis-detection-engine').CrisisDetectionEngine().analyzeCrisisRisk;
      const mockEscalate = require('@astralcore/crisis').CrisisSessionManager().escalateToEmergency;
      
      mockAnalyzeRisk.mockResolvedValue({
        riskLevel: 'critical',
        confidence: 0.95,
        triggers: ['suicide', 'tonight'],
      });
      mockEscalate.mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'I want to end it all tonight');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(mockEscalate).toHaveBeenCalledWith(
          'crisis-session-test-123',
          'critical_message',
          expect.any(String)
        );
      });
      
      expect(mockProps.onEmergencyEscalation).toHaveBeenCalled();
    });

    it('should display encrypted message indicator', async () => {
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        const encryptionIcon = screen.getByRole('img', { name: /encrypted/i });
        expect(encryptionIcon).toBeInTheDocument();
      });
    });
  });

  describe('Volunteer Matching', () => {
    beforeEach(async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
    });

    it('should show volunteer matching status', async () => {
      expect(screen.getByText(/Looking for available volunteer/i)).toBeInTheDocument();
      
      const volunteerStatus = screen.getByRole('status', { name: /volunteer status/i });
      expect(volunteerStatus).toBeInTheDocument();
    });

    it('should connect volunteer to session', async () => {
      const mockAddVolunteer = require('@astralcore/crisis').CrisisSessionManager().addVolunteerToSession;
      mockAddVolunteer.mockResolvedValue(true);
      
      // Simulate volunteer joining
      act(() => {
        const joinHandler = mockSocket.on.mock.calls.find(call => call[0] === 'volunteer-joined');
        if (joinHandler) {
          joinHandler[1]({
            volunteerId: 'volunteer-123',
            volunteerName: 'Crisis Counselor Sarah',
            specialties: ['anxiety', 'depression'],
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Crisis Counselor Sarah has joined/i)).toBeInTheDocument();
        expect(screen.getByText(/Specializes in: anxiety, depression/i)).toBeInTheDocument();
      });
    });

    it('should handle volunteer unavailability', async () => {
      // Simulate no volunteers available
      act(() => {
        const noVolunteerHandler = mockSocket.on.mock.calls.find(call => call[0] === 'no-volunteers-available');
        if (noVolunteerHandler) {
          noVolunteerHandler[1]({
            reason: 'high_demand',
            estimatedWait: 300, // 5 minutes
          });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/All volunteers are currently busy/i)).toBeInTheDocument();
        expect(screen.getByText(/Estimated wait time: 5 minutes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Performance', () => {
    beforeEach(async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
    });

    it('should process messages within performance benchmarks', async () => {
      const startTime = Date.now();
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + CRISIS_PERFORMANCE_BENCHMARKS.MESSAGE_PROCESSING_MS - 10);
      
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        const performanceIndicator = screen.getByRole('status', { name: /performance/i });
        expect(performanceIndicator).toHaveAttribute('data-performance', 'good');
      });
    });

    it('should warn about slow performance', async () => {
      const startTime = Date.now();
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + CRISIS_PERFORMANCE_BENCHMARKS.MESSAGE_PROCESSING_MS + 100);
      
      const user = userEvent.setup();
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Connection may be slow/i)).toBeInTheDocument();
      });
    });
  });

  describe('Emergency Features', () => {
    beforeEach(async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
    });

    it('should display emergency button', () => {
      const emergencyButton = screen.getByRole('button', { name: /emergency/i });
      expect(emergencyButton).toBeInTheDocument();
      expect(emergencyButton).toHaveClass('emergency-button');
    });

    it('should trigger immediate escalation on emergency button', async () => {
      const mockEscalate = require('@astralcore/crisis').CrisisSessionManager().escalateToEmergency;
      mockEscalate.mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      const emergencyButton = screen.getByRole('button', { name: /emergency/i });
      await user.click(emergencyButton);
      
      // Should show confirmation dialog
      expect(screen.getByText(/This will immediately connect you/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByRole('button', { name: /yes, get help now/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockEscalate).toHaveBeenCalledWith(
          'crisis-session-test-123',
          'user_emergency_request',
          expect.any(String)
        );
      });
    });

    it('should provide crisis hotline numbers', () => {
      expect(screen.getByText(/National Suicide Prevention Lifeline/i)).toBeInTheDocument();
      expect(screen.getByText(/988/i)).toBeInTheDocument();
      expect(screen.getByText(/Crisis Text Line/i)).toBeInTheDocument();
      expect(screen.getByText(/Text HOME to 741741/i)).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
    });

    it('should end session properly', async () => {
      const mockEndSession = require('@astralcore/crisis').CrisisSessionManager().endSecureSession;
      mockEndSession.mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      const endChatButton = screen.getByRole('button', { name: /end chat/i });
      await user.click(endChatButton);
      
      // Should show confirmation
      expect(screen.getByText(/Are you sure you want to end/i)).toBeInTheDocument();
      
      const confirmEndButton = screen.getByRole('button', { name: /yes, end chat/i });
      await user.click(confirmEndButton);
      
      await waitFor(() => {
        expect(mockEndSession).toHaveBeenCalledWith(
          'crisis-session-test-123',
          expect.any(String),
          'user_ended'
        );
      });
      
      expect(mockProps.onSessionEnd).toHaveBeenCalled();
    });

    it('should handle connection drops gracefully', async () => {
      // Simulate connection drop
      act(() => {
        const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
        if (disconnectHandler) {
          disconnectHandler[1]({ reason: 'transport error' });
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Connection lost/i)).toBeInTheDocument();
        expect(screen.getByText(/Attempting to reconnect/i)).toBeInTheDocument();
      });
    });

    it('should save session transcript on end', async () => {
      const mockEndSession = require('@astralcore/crisis').CrisisSessionManager().endSecureSession;
      mockEndSession.mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      // Send a message first
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'Thank you for your help');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // End session
      const endChatButton = screen.getByRole('button', { name: /end chat/i });
      await user.click(endChatButton);
      
      const confirmEndButton = screen.getByRole('button', { name: /yes, end chat/i });
      await user.click(confirmEndButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Session summary has been saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for crisis elements', () => {
      render(<AnonymousCrisisChat {...mockProps} />);
      
      expect(screen.getByRole('region', { name: /crisis chat/i })).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /crisis severity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /emergency/i })).toHaveAttribute('aria-describedby');
    });

    it('should support keyboard navigation in chat', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
      
      const messageInput = screen.getByPlaceholderText(/Type your message/i);
      await user.type(messageInput, 'Test message');
      
      // Should be able to send with Enter key
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should announce important status changes', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession());
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      
      await waitFor(() => {
        const statusAnnouncement = screen.getByRole('status', { name: /session status/i });
        expect(statusAnnouncement).toHaveTextContent(/Chat session started/i);
      });
    });
  });

  describe('Data Privacy', () => {
    it('should not store identifiable information', () => {
      render(<AnonymousCrisisChat {...mockProps} />);
      
      // Should not have any input fields for personal information
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
    });

    it('should use encrypted message transmission', async () => {
      const mockCreateSession = require('@astralcore/crisis').CrisisSessionManager().createSecureSession;
      mockCreateSession.mockResolvedValue(createMockCrisisSession({ encrypted: true }));
      
      const user = userEvent.setup();
      render(<AnonymousCrisisChat {...mockProps} />);
      
      await user.click(screen.getByText(/Start Anonymous Chat/i));
      await waitFor(() => screen.getByRole('textbox'));
      
      // Should show encryption status
      expect(screen.getByText(/End-to-end encrypted/i)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /encryption active/i })).toBeInTheDocument();
    });
  });
});