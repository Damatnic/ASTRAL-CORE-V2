/**
 * ASTRAL_CORE 2.0 - Safety Plan Generator Tests
 * Life-critical testing for evidence-based safety planning
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SafetyPlanGenerator from '../../apps/web/src/components/crisis/SafetyPlanGenerator';
import { mockSafetyPlan, mockEmergencyContact } from '../setup';

// Mock the safety plan service
jest.mock('@astralcore/database', () => ({
  safetyPlanService: {
    createSafetyPlan: jest.fn(),
    updateSafetyPlan: jest.fn(),
    getSafetyPlans: jest.fn(),
    activateSafetyPlan: jest.fn(),
  },
  emergencyContactService: {
    getEmergencyContacts: jest.fn(),
    createEmergencyContact: jest.fn(),
  },
}));

describe('SafetyPlanGenerator', () => {
  const mockProps = {
    userId: 'user-123',
    onPlanCreated: jest.fn(),
    onPlanUpdated: jest.fn(),
    existingPlan: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the safety plan generator with initial step', () => {
      render(<SafetyPlanGenerator {...mockProps} />);
      
      expect(screen.getByText(/Safety Plan Generator/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1:/i)).toBeInTheDocument();
      expect(screen.getByText(/Warning Signs/i)).toBeInTheDocument();
    });

    it('should display progress indicator', () => {
      render(<SafetyPlanGenerator {...mockProps} />);
      
      const progressIndicator = screen.getByRole('progressbar');
      expect(progressIndicator).toBeInTheDocument();
      expect(progressIndicator).toHaveAttribute('aria-valuenow', '0');
    });

    it('should show template selection initially', () => {
      render(<SafetyPlanGenerator {...mockProps} />);
      
      expect(screen.getByText(/Standard Adult Template/i)).toBeInTheDocument();
      expect(screen.getByText(/Adolescent Template/i)).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('should allow template selection', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      const standardTemplate = screen.getByText(/Standard Adult Template/i);
      await user.click(standardTemplate);
      
      expect(screen.getByText(/Selected Template: Standard/i)).toBeInTheDocument();
    });

    it('should load adolescent template with age-appropriate content', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      const adolescentTemplate = screen.getByText(/Adolescent Template/i);
      await user.click(adolescentTemplate);
      
      expect(screen.getByText(/Selected Template: Adolescent/i)).toBeInTheDocument();
      // Should contain teen-specific language
      expect(screen.getByText(/feelings that worry you/i)).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('should navigate through all 11 steps', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      // Select template first
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Navigate through steps
      for (let step = 1; step <= 11; step++) {
        expect(screen.getByText(new RegExp(`Step ${step}`, 'i'))).toBeInTheDocument();
        
        // Fill required fields for each step
        if (step === 1) {
          // Warning signs step
          const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
          await user.type(warningSignInput, 'feeling isolated');
          await user.click(screen.getByText(/Add Sign/i));
        }
        
        // Move to next step if not the last step
        if (step < 11) {
          const nextButton = screen.getByText(/Next Step/i);
          await user.click(nextButton);
        }
      }
      
      // Should be on the final step
      expect(screen.getByText(/Step 11:/i)).toBeInTheDocument();
      expect(screen.getByText(/Complete Safety Plan/i)).toBeInTheDocument();
    });

    it('should allow going back to previous steps', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      // Select template and go to step 2
      await user.click(screen.getByText(/Standard Adult Template/i));
      await user.click(screen.getByText(/Next Step/i));
      
      expect(screen.getByText(/Step 2:/i)).toBeInTheDocument();
      
      // Go back to step 1
      const backButton = screen.getByText(/Previous Step/i);
      await user.click(backButton);
      
      expect(screen.getByText(/Step 1:/i)).toBeInTheDocument();
    });
  });

  describe('Warning Signs Step', () => {
    it('should allow adding personal warning signs', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'feeling isolated');
      await user.click(screen.getByText(/Add Sign/i));
      
      expect(screen.getByText('feeling isolated')).toBeInTheDocument();
    });

    it('should allow removing warning signs', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Add a warning sign
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'sleep problems');
      await user.click(screen.getByText(/Add Sign/i));
      
      // Remove the warning sign
      const removeButton = screen.getByRole('button', { name: /remove.*sleep problems/i });
      await user.click(removeButton);
      
      expect(screen.queryByText('sleep problems')).not.toBeInTheDocument();
    });

    it('should validate minimum warning signs requirement', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Try to proceed without warning signs
      const nextButton = screen.getByText(/Next Step/i);
      await user.click(nextButton);
      
      expect(screen.getByText(/Please add at least one warning sign/i)).toBeInTheDocument();
    });
  });

  describe('Coping Strategies Step', () => {
    it('should distinguish between internal and external coping strategies', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Add warning sign and proceed to step 2
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      await user.click(screen.getByText(/Next Step/i));
      
      expect(screen.getByText(/Internal Coping Strategies/i)).toBeInTheDocument();
      expect(screen.getByText(/External Coping Strategies/i)).toBeInTheDocument();
    });

    it('should provide evidence-based coping strategy suggestions', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Navigate to coping strategies step
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      await user.click(screen.getByText(/Next Step/i));
      
      // Should show evidence-based suggestions
      expect(screen.getByText(/Deep breathing/i)).toBeInTheDocument();
      expect(screen.getByText(/Progressive muscle relaxation/i)).toBeInTheDocument();
      expect(screen.getByText(/Mindfulness meditation/i)).toBeInTheDocument();
    });
  });

  describe('Emergency Contacts Step', () => {
    it('should integrate with emergency contacts service', async () => {
      const mockContacts = [mockEmergencyContact];
      require('@astralcore/database').emergencyContactService.getEmergencyContacts.mockResolvedValue(mockContacts);
      
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      // Navigate to emergency contacts step (step 6)
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Skip to step 6 by completing required fields
      for (let i = 0; i < 5; i++) {
        if (i === 0) {
          const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
          await user.type(warningSignInput, 'anxiety');
          await user.click(screen.getByText(/Add Sign/i));
        }
        await user.click(screen.getByText(/Next Step/i));
      }
      
      await waitFor(() => {
        expect(screen.getByText('Test Emergency Contact')).toBeInTheDocument();
      });
    });

    it('should allow adding new emergency contacts', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      // Navigate to emergency contacts step
      await user.click(screen.getByText(/Standard Adult Template/i));
      for (let i = 0; i < 5; i++) {
        if (i === 0) {
          const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
          await user.type(warningSignInput, 'anxiety');
          await user.click(screen.getByText(/Add Sign/i));
        }
        await user.click(screen.getByText(/Next Step/i));
      }
      
      const addContactButton = screen.getByText(/Add New Contact/i);
      await user.click(addContactButton);
      
      expect(screen.getByPlaceholderText(/Contact Name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Phone Number/i)).toBeInTheDocument();
    });
  });

  describe('Safety Plan Completion', () => {
    it('should save completed safety plan', async () => {
      const mockCreatePlan = require('@astralcore/database').safetyPlanService.createSafetyPlan;
      mockCreatePlan.mockResolvedValue({ id: 'plan-123', ...mockSafetyPlan });
      
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Complete minimal required fields and navigate to final step
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      
      // Skip to final step
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      // Complete the safety plan
      const completePlanButton = screen.getByText(/Complete Safety Plan/i);
      await user.click(completePlanButton);
      
      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user-123',
            templateType: 'standard',
          })
        );
      });
      
      expect(mockProps.onPlanCreated).toHaveBeenCalled();
    });

    it('should show success message after completion', async () => {
      const mockCreatePlan = require('@astralcore/database').safetyPlanService.createSafetyPlan;
      mockCreatePlan.mockResolvedValue({ id: 'plan-123', ...mockSafetyPlan });
      
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      await user.click(screen.getByText(/Complete Safety Plan/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Safety plan created successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Existing Plan Editing', () => {
    it('should load existing plan data', () => {
      const existingPlan = {
        ...mockSafetyPlan,
        steps: {
          warningSignsStep: {
            personalSigns: ['feeling hopeless', 'social isolation'],
            completed: true,
          },
        },
      };
      
      render(<SafetyPlanGenerator {...mockProps} existingPlan={existingPlan} />);
      
      expect(screen.getByDisplayValue('feeling hopeless')).toBeInTheDocument();
      expect(screen.getByDisplayValue('social isolation')).toBeInTheDocument();
    });

    it('should update existing plan instead of creating new one', async () => {
      const mockUpdatePlan = require('@astralcore/database').safetyPlanService.updateSafetyPlan;
      mockUpdatePlan.mockResolvedValue({ ...mockSafetyPlan, version: 2 });
      
      const existingPlan = mockSafetyPlan;
      const user = userEvent.setup();
      
      render(<SafetyPlanGenerator {...mockProps} existingPlan={existingPlan} />);
      
      // Make a change and save
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'new warning sign');
      await user.click(screen.getByText(/Add Sign/i));
      
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      await user.click(screen.getByText(/Update Safety Plan/i));
      
      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith(
          mockSafetyPlan.id,
          expect.objectContaining({
            version: 2,
          })
        );
      });
      
      expect(mockProps.onPlanUpdated).toHaveBeenCalled();
    });
  });

  describe('Professional Endorsement', () => {
    it('should allow professional endorsement request', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Navigate to professional endorsement step
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      
      for (let i = 0; i < 9; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      expect(screen.getByText(/Professional Endorsement/i)).toBeInTheDocument();
      expect(screen.getByText(/Request professional review/i)).toBeInTheDocument();
    });

    it('should show professional contact form', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      
      for (let i = 0; i < 9; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      const requestEndorsementCheckbox = screen.getByLabelText(/Request professional review/i);
      await user.click(requestEndorsementCheckbox);
      
      expect(screen.getByPlaceholderText(/Professional's email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Professional's name/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SafetyPlanGenerator {...mockProps} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText(/Current step/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      // Test tab navigation
      await user.tab();
      expect(screen.getByText(/Standard Adult Template/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText(/Adolescent Template/i)).toHaveFocus();
    });

    it('should announce step changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      await user.click(screen.getByText(/Next Step/i));
      
      expect(screen.getByText(/Step 2 of 11/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/Step 2/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockCreatePlan = require('@astralcore/database').safetyPlanService.createSafetyPlan;
      mockCreatePlan.mockRejectedValue(new Error('Service unavailable'));
      
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      const warningSignInput = screen.getByPlaceholderText(/Add a warning sign/i);
      await user.type(warningSignInput, 'anxiety');
      await user.click(screen.getByText(/Add Sign/i));
      
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByText(/Next Step/i));
      }
      
      await user.click(screen.getByText(/Complete Safety Plan/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Error creating safety plan/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before proceeding', async () => {
      const user = userEvent.setup();
      render(<SafetyPlanGenerator {...mockProps} />);
      
      await user.click(screen.getByText(/Standard Adult Template/i));
      
      // Try to proceed without completing required fields
      const nextButton = screen.getByText(/Next Step/i);
      await user.click(nextButton);
      
      expect(screen.getByText(/Please complete all required fields/i)).toBeInTheDocument();
    });
  });
});