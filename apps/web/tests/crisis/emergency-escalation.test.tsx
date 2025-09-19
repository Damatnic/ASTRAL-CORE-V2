/**
 * Emergency Escalation Workflow Tests
 * Critical: Validates life-saving emergency response systems
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmergencyEscalationService } from '@/lib/crisis/emergency-escalation';
import { HotlineIntegration } from '@/lib/crisis/hotline-integration';
import { CrisisChat } from '@/components/crisis/CrisisChat';

describe('Emergency Escalation Workflows', () => {
  let escalationService: EmergencyEscalationService;
  let hotlineIntegration: HotlineIntegration;
  
  beforeEach(() => {
    escalationService = new EmergencyEscalationService();
    hotlineIntegration = new HotlineIntegration();
    
    // Mock external services
    global.fetch = jest.fn();
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('988 Suicide & Crisis Lifeline Integration', () => {
    it('should connect to 988 immediately for suicide risk', async () => {
      const mockConnect988 = jest.spyOn(hotlineIntegration, 'connect988');
      mockConnect988.mockResolvedValue({
        connected: true,
        sessionId: '988-session-123',
        counselorId: 'counselor-456',
        waitTime: 0
      });

      const result = await escalationService.handleCrisisEscalation({
        severity: 'IMMEDIATE',
        type: 'suicide_risk',
        userId: 'user-123',
        location: { lat: 40.7128, lng: -74.0060 }
      });

      expect(mockConnect988).toHaveBeenCalledWith({
        priority: 'IMMEDIATE',
        userId: 'user-123',
        riskIndicators: expect.arrayContaining(['suicide_risk'])
      });
      
      expect(result.connected).toBe(true);
      expect(result.responseTime).toBeLessThan(1000);
    });

    it('should handle 988 connection failures with fallback', async () => {
      const mockConnect988 = jest.spyOn(hotlineIntegration, 'connect988');
      mockConnect988.mockRejectedValue(new Error('Service unavailable'));

      const mockFallback = jest.spyOn(hotlineIntegration, 'connectLocalCrisisLine');
      mockFallback.mockResolvedValue({
        connected: true,
        provider: 'Local Crisis Center',
        phoneNumber: '1-800-XXX-XXXX'
      });

      const result = await escalationService.handleCrisisEscalation({
        severity: 'IMMEDIATE',
        type: 'suicide_risk',
        userId: 'user-123'
      });

      expect(mockConnect988).toHaveBeenCalled();
      expect(mockFallback).toHaveBeenCalled();
      expect(result.fallbackUsed).toBe(true);
      expect(result.connected).toBe(true);
    });

    it('should maintain connection quality monitoring', async () => {
      const connection = await hotlineIntegration.connect988({
        priority: 'HIGH',
        userId: 'user-123'
      });

      const qualityMetrics = await hotlineIntegration.monitorConnectionQuality(
        connection.sessionId
      );

      expect(qualityMetrics).toMatchObject({
        audioQuality: expect.any(String),
        latency: expect.any(Number),
        packetLoss: expect.any(Number),
        isStable: expect.any(Boolean)
      });

      expect(qualityMetrics.latency).toBeLessThan(200);
      expect(qualityMetrics.packetLoss).toBeLessThan(0.01);
    });
  });

  describe('Emergency Services (911) Integration', () => {
    it('should contact 911 for immediate physical danger', async () => {
      const mock911 = jest.spyOn(escalationService, 'contact911');
      mock911.mockResolvedValue({
        dispatched: true,
        responseCode: 'EMRG-2024-001',
        estimatedArrival: 8 // minutes
      });

      const result = await escalationService.handleCrisisEscalation({
        severity: 'IMMEDIATE',
        type: 'active_harm',
        userId: 'user-123',
        location: { lat: 40.7128, lng: -74.0060 },
        userConsent: true
      });

      expect(mock911).toHaveBeenCalledWith({
        location: expect.objectContaining({
          lat: 40.7128,
          lng: -74.0060
        }),
        situation: 'active_harm',
        hasConsent: true
      });

      expect(result.emergencyServicesContacted).toBe(true);
      expect(result.responseCode).toBeTruthy();
    });

    it('should handle location permission denied gracefully', async () => {
      const mockGetLocation = navigator.geolocation.getCurrentPosition as jest.Mock;
      mockGetLocation.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      const result = await escalationService.getEmergencyLocation();

      expect(result).toMatchObject({
        locationAvailable: false,
        fallbackMethod: 'user_provided',
        requiresManualInput: true
      });
    });

    it('should verify emergency contact before dispatch', async () => {
      const verificationResult = await escalationService.verifyEmergencyNeed({
        userId: 'user-123',
        indicators: ['suicide_plan', 'means_available', 'intent_stated'],
        lastAssessment: {
          score: 9,
          timestamp: new Date()
        }
      });

      expect(verificationResult.requiresEmergencyResponse).toBe(true);
      expect(verificationResult.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('Provider Notification System', () => {
    it('should notify assigned provider immediately for high-risk cases', async () => {
      const mockNotifyProvider = jest.fn().mockResolvedValue({
        notified: true,
        method: 'push_and_sms',
        acknowledged: false
      });

      escalationService.setProviderNotification(mockNotifyProvider);

      await escalationService.handleCrisisEscalation({
        severity: 'HIGH',
        type: 'self_harm',
        userId: 'user-123',
        assignedProvider: 'provider-789'
      });

      expect(mockNotifyProvider).toHaveBeenCalledWith({
        providerId: 'provider-789',
        urgency: 'IMMEDIATE',
        patientId: 'user-123',
        situation: expect.objectContaining({
          type: 'self_harm',
          severity: 'HIGH'
        }),
        actionRequired: true
      });
    });

    it('should escalate to on-call provider if primary unavailable', async () => {
      const mockNotifyProvider = jest.fn()
        .mockRejectedValueOnce(new Error('Provider unavailable'))
        .mockResolvedValueOnce({
          notified: true,
          provider: 'on-call-provider',
          method: 'direct_call'
        });

      escalationService.setProviderNotification(mockNotifyProvider);

      const result = await escalationService.handleCrisisEscalation({
        severity: 'HIGH',
        type: 'anxiety_attack',
        userId: 'user-123',
        assignedProvider: 'provider-789'
      });

      expect(mockNotifyProvider).toHaveBeenCalledTimes(2);
      expect(result.providerNotified).toBe(true);
      expect(result.escalatedToOnCall).toBe(true);
    });
  });

  describe('Anonymous Crisis Chat', () => {
    it('should allow anonymous access without authentication', async () => {
      render(<CrisisChat anonymous={true} />);

      expect(screen.getByText(/Anonymous Crisis Support/i)).toBeInTheDocument();
      expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
      
      const chatInput = screen.getByPlaceholderText(/Type your message/i);
      expect(chatInput).toBeEnabled();
    });

    it('should maintain anonymity throughout session', async () => {
      const { getByRole, getByText } = render(<CrisisChat anonymous={true} />);
      
      const chatInput = getByRole('textbox');
      const sendButton = getByRole('button', { name: /send/i });

      fireEvent.change(chatInput, { target: { value: 'I need help' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(getByText(/Anonymous User/i)).toBeInTheDocument();
      });

      // Verify no identifying information is sent
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.not.stringContaining('userId'),
        })
      );
    });

    it('should offer to save session for follow-up without breaking anonymity', async () => {
      const { getByRole, getByText } = render(<CrisisChat anonymous={true} />);
      
      // Simulate crisis conversation
      const endButton = getByRole('button', { name: /end chat/i });
      fireEvent.click(endButton);

      await waitFor(() => {
        expect(getByText(/Save this session/i)).toBeInTheDocument();
        expect(getByText(/Recovery code/i)).toBeInTheDocument();
      });

      const recoveryCode = screen.getByTestId('recovery-code').textContent;
      expect(recoveryCode).toMatch(/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });
  });

  describe('Safety Planning Tools', () => {
    it('should create comprehensive safety plan', async () => {
      const safetyPlan = await escalationService.createSafetyPlan({
        userId: 'user-123',
        triggers: ['work stress', 'isolation', 'conflict'],
        warningSigns: ['negative thoughts', 'sleep issues', 'withdrawal'],
        copingStrategies: ['breathing exercises', 'calling friend', 'walking'],
        supportContacts: [
          { name: 'Mom', phone: '555-0001', relationship: 'family' },
          { name: 'Dr. Smith', phone: '555-0002', relationship: 'therapist' }
        ],
        safeEnvironment: ['remove sharp objects', 'stay with others'],
        reasonsToLive: ['family', 'pet', 'future goals']
      });

      expect(safetyPlan).toMatchObject({
        id: expect.any(String),
        createdAt: expect.any(Date),
        isComplete: true,
        shareableLink: expect.stringMatching(/^https:\/\//),
        emergencyAccess: true
      });
    });

    it('should validate safety plan completeness', () => {
      const incompletePlan = {
        triggers: ['stress'],
        warningSigns: [],
        copingStrategies: ['breathing'],
        supportContacts: [],
        safeEnvironment: [],
        reasonsToLive: []
      };

      const validation = escalationService.validateSafetyPlan(incompletePlan);
      
      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('warningSigns');
      expect(validation.missingFields).toContain('supportContacts');
      expect(validation.completeness).toBeLessThan(0.5);
    });

    it('should make safety plan accessible during crisis', async () => {
      const mockPlan = {
        id: 'plan-123',
        userId: 'user-123',
        supportContacts: [
          { name: 'Crisis Line', phone: '988', available247: true }
        ]
      };

      const accessiblePlan = await escalationService.getCrisisAccessiblePlan('user-123');
      
      expect(accessiblePlan.quickAccess).toBe(true);
      expect(accessiblePlan.simplifiedView).toBe(true);
      expect(accessiblePlan.prioritizedContacts[0].available247).toBe(true);
    });
  });

  describe('Multi-Channel Alert System', () => {
    it('should send alerts through multiple channels simultaneously', async () => {
      const mockChannels = {
        sms: jest.fn().mockResolvedValue({ sent: true }),
        email: jest.fn().mockResolvedValue({ sent: true }),
        push: jest.fn().mockResolvedValue({ sent: true }),
        inApp: jest.fn().mockResolvedValue({ sent: true })
      };

      escalationService.configureAlertChannels(mockChannels);

      await escalationService.sendMultiChannelAlert({
        severity: 'HIGH',
        userId: 'user-123',
        message: 'Crisis detected - immediate attention needed',
        contacts: ['provider-789', 'emergency-contact-1']
      });

      expect(mockChannels.sms).toHaveBeenCalled();
      expect(mockChannels.email).toHaveBeenCalled();
      expect(mockChannels.push).toHaveBeenCalled();
      expect(mockChannels.inApp).toHaveBeenCalled();
    });

    it('should handle partial channel failures gracefully', async () => {
      const mockChannels = {
        sms: jest.fn().mockRejectedValue(new Error('SMS failed')),
        email: jest.fn().mockResolvedValue({ sent: true }),
        push: jest.fn().mockResolvedValue({ sent: true })
      };

      escalationService.configureAlertChannels(mockChannels);

      const result = await escalationService.sendMultiChannelAlert({
        severity: 'MODERATE',
        userId: 'user-123',
        message: 'Check-in needed'
      });

      expect(result.successfulChannels).toContain('email');
      expect(result.successfulChannels).toContain('push');
      expect(result.failedChannels).toContain('sms');
      expect(result.overallSuccess).toBe(true); // At least one channel succeeded
    });
  });

  describe('Crisis Response Performance', () => {
    it('should meet response time SLAs for different severity levels', async () => {
      const testCases = [
        { severity: 'IMMEDIATE', maxResponseTime: 100 },
        { severity: 'HIGH', maxResponseTime: 500 },
        { severity: 'MODERATE', maxResponseTime: 2000 },
        { severity: 'LOW', maxResponseTime: 5000 }
      ];

      for (const testCase of testCases) {
        const startTime = Date.now();
        
        await escalationService.handleCrisisEscalation({
          severity: testCase.severity as any,
          type: 'general',
          userId: 'user-123'
        });
        
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThanOrEqual(testCase.maxResponseTime);
      }
    });

    it('should handle concurrent crisis escalations', async () => {
      const escalations = Array.from({ length: 10 }, (_, i) => ({
        severity: i < 3 ? 'IMMEDIATE' : 'HIGH',
        type: 'various',
        userId: `user-${i}`
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        escalations.map(e => escalationService.handleCrisisEscalation(e as any))
      );
      const totalTime = Date.now() - startTime;

      expect(results.every(r => r.handled)).toBe(true);
      expect(totalTime).toBeLessThan(2000); // Handle 10 concurrent crises in under 2 seconds
      
      // Verify IMMEDIATE cases were prioritized
      const immediateCases = results.slice(0, 3);
      expect(immediateCases.every(r => r.priorityHandled)).toBe(true);
    });
  });
});