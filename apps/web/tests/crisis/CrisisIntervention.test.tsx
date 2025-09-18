/**
 * ASTRAL CORE V2 - Crisis Intervention Tests
 * Critical life-saving functionality testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrisisDetectionEngine } from '@/components/crisis/CrisisDetectionEngine';
import { SafetyPlanningWizard } from '@/components/crisis/SafetyPlanningWizard';
import '@testing-library/jest-dom';

describe('Crisis Intervention System', () => {
  describe('Crisis Detection Engine', () => {
    it('should detect critical crisis keywords immediately', async () => {
      const onCrisisDetected = jest.fn();
      render(<CrisisDetectionEngine onCrisisDetected={onCrisisDetected} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'I want to kill myself');
      
      await waitFor(() => {
        expect(onCrisisDetected).toHaveBeenCalledWith(
          expect.objectContaining({
            riskLevel: 'imminent',
            crisisLevel: 10,
            interventionRequired: true
          })
        );
      }, { timeout: 100 }); // Must detect within 100ms
    });

    it('should trigger immediate intervention for imminent risk', async () => {
      const onInterventionTriggered = jest.fn();
      render(
        <CrisisDetectionEngine 
          onInterventionTriggered={onInterventionTriggered}
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'I have a plan to end my life');
      
      await waitFor(() => {
        expect(onInterventionTriggered).toHaveBeenCalled();
        expect(screen.getByText('988')).toBeInTheDocument();
        expect(screen.getByText('Emergency Support')).toBeInTheDocument();
      });
    });

    it('should maintain detection accuracy for subtle indicators', async () => {
      const onCrisisDetected = jest.fn();
      render(<CrisisDetectionEngine onCrisisDetected={onCrisisDetected} />);
      
      const subtleIndicators = [
        "I can't do this anymore",
        'Everyone would be better off without me',
        "I'm a burden to everyone",
        "There's no point in going on"
      ];
      
      for (const indicator of subtleIndicators) {
        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, indicator);
        
        await waitFor(() => {
          expect(onCrisisDetected).toHaveBeenCalledWith(
            expect.objectContaining({
              riskLevel: expect.stringMatching(/high|urgent/),
              interventionRequired: true
            })
          );
        });
      }
    });

    it('should track escalation patterns over time', async () => {
      const onEscalationDetected = jest.fn();
      render(
        <CrisisDetectionEngine 
          onEscalationDetected={onEscalationDetected}
          trackHistory={true}
        />
      );
      
      const messages = [
        "I'm feeling really down",
        'Nothing seems to help',
        "I don't want to be here anymore",
        "I'm thinking about ending it all"
      ];
      
      for (const message of messages) {
        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, message);
        fireEvent.submit(screen.getByRole('form'));
        await waitFor(() => {}, { timeout: 50 });
      }
      
      expect(onEscalationDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          escalationType: 'progressive',
          currentLevel: expect.any(Number),
          trend: 'increasing'
        })
      );
    });
  });

  describe('Safety Planning Wizard', () => {
    it('should render all safety plan steps', () => {
      render(<SafetyPlanningWizard />);
      
      expect(screen.getByText('Warning Signs')).toBeInTheDocument();
      expect(screen.getByText('Coping Strategies')).toBeInTheDocument();
      expect(screen.getByText('Support Network')).toBeInTheDocument();
      expect(screen.getByText('Professional Contacts')).toBeInTheDocument();
      expect(screen.getByText('Safe Environment')).toBeInTheDocument();
      expect(screen.getByText('Reasons to Live')).toBeInTheDocument();
    });

    it('should save safety plan with encryption', async () => {
      const onSave = jest.fn();
      render(<SafetyPlanningWizard onSave={onSave} />);
      
      // Fill out warning signs
      const warningSignInput = screen.getByLabelText(/warning signs/i);
      await userEvent.type(warningSignInput, 'Feeling hopeless, isolated');
      
      // Fill out coping strategies
      fireEvent.click(screen.getByText('Next'));
      const copingInput = screen.getByLabelText(/coping strategies/i);
      await userEvent.type(copingInput, 'Deep breathing, calling a friend');
      
      // Complete the wizard
      fireEvent.click(screen.getByText('Save Safety Plan'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            encrypted: true,
            warningSigns: expect.any(String),
            copingStrategies: expect.any(String)
          })
        );
      });
    });

    it('should provide quick access during crisis', async () => {
      render(<SafetyPlanningWizard quickAccess={true} />);
      
      expect(screen.getByText('Quick Access Mode')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
      expect(screen.getByText('988')).toBeInTheDocument();
      
      const emergencyButton = screen.getByRole('button', { name: /emergency/i });
      expect(emergencyButton).toHaveClass('bg-red-600');
    });
  });

  describe('Crisis Response Time', () => {
    it('should meet response time requirements', async () => {
      const startTime = performance.now();
      
      render(<CrisisDetectionEngine />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'suicide');
      
      await waitFor(() => {
        expect(screen.getByText(/crisis support/i)).toBeInTheDocument();
      });
      
      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(200); // Must respond within 200ms
    });
  });

  describe('Accessibility in Crisis Mode', () => {
    it('should maintain WCAG AAA compliance during crisis', () => {
      const { container } = render(<CrisisDetectionEngine />);
      
      // Check for proper ARIA labels
      const criticalButtons = screen.getAllByRole('button');
      criticalButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
      
      // Check color contrast for crisis alerts
      const alerts = container.querySelectorAll('[role="alert"]');
      alerts.forEach(alert => {
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
      
      // Check keyboard navigation
      const firstButton = criticalButtons[0];
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Emergency Escalation', () => {
    it('should escalate to emergency services when needed', async () => {
      const onEmergencyEscalation = jest.fn();
      render(
        <CrisisDetectionEngine 
          onEmergencyEscalation={onEmergencyEscalation}
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, "I have pills and I'm going to take them all right now");
      
      await waitFor(() => {
        expect(onEmergencyEscalation).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'immediate_danger',
            action: 'contact_emergency_services',
            priority: 'critical'
          })
        );
      });
      
      expect(screen.getByText('Contacting Emergency Services')).toBeInTheDocument();
      expect(screen.getByText('911')).toBeInTheDocument();
    });
  });

  describe('Anonymous Crisis Support', () => {
    it('should maintain complete anonymity', async () => {
      const dataSent = jest.fn();
      
      // Mock fetch to intercept API calls
      global.fetch = jest.fn().mockImplementation((url, options) => {
        dataSent(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });
      
      render(<CrisisDetectionEngine anonymous={true} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'I need help');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(dataSent).toHaveBeenCalled();
        const sentData = JSON.parse(dataSent.mock.calls[0][0]);
        expect(sentData).not.toHaveProperty('userId');
        expect(sentData).not.toHaveProperty('email');
        expect(sentData).not.toHaveProperty('name');
        expect(sentData).toHaveProperty('anonymousId');
      });
    });
  });

  describe('Multi-language Crisis Support', () => {
    it('should detect crisis indicators in multiple languages', async () => {
      const onCrisisDetected = jest.fn();
      render(<CrisisDetectionEngine multilingual={true} onCrisisDetected={onCrisisDetected} />);
      
      const crisisPhrasesMultilingual = [
        'I want to die', // English
        'Quiero morir', // Spanish
        'Je veux mourir', // French
        '我想死', // Chinese
      ];
      
      for (const phrase of crisisPhrasesMultilingual) {
        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, phrase);
        
        await waitFor(() => {
          expect(onCrisisDetected).toHaveBeenCalledWith(
            expect.objectContaining({
              riskLevel: expect.stringMatching(/imminent|high/),
              language: expect.any(String)
            })
          );
        });
      }
    });
  });

  describe('Crisis Data Encryption', () => {
    it('should encrypt all crisis session data', async () => {
      const onDataEncrypted = jest.fn();
      
      render(
        <CrisisDetectionEngine 
          encryptData={true}
          onDataEncrypted={onDataEncrypted}
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Personal crisis information');
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(onDataEncrypted).toHaveBeenCalledWith(
          expect.objectContaining({
            encrypted: true,
            encryptionMethod: 'AES-256-GCM',
            keyDerivation: 'PBKDF2'
          })
        );
      });
    });
  });
});

describe('Crisis Performance Metrics', () => {
  it('should log performance metrics for monitoring', async () => {
    const metrics: any[] = [];
    const originalLog = console.log;
    console.log = jest.fn((message) => {
      if (message.includes('Performance')) {
        metrics.push(message);
      }
    });
    
    render(<CrisisDetectionEngine enableMetrics={true} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'crisis text');
    
    await waitFor(() => {
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toContain('Performance');
    });
    
    console.log = originalLog;
  });
});