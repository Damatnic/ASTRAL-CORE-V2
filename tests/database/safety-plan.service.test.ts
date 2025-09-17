/**
 * ASTRAL_CORE 2.0 - Safety Plan Service Tests
 * Life-critical testing for safety plan management
 */

import { SafetyPlanService } from '../../packages/database/src/services/safety-plan.service';
import { mockSafetyPlan } from '../setup';

// Mock Prisma client
const mockPrisma = {
  safetyPlan: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  safetyPlanVersion: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('SafetyPlanService', () => {
  let safetyPlanService: SafetyPlanService;

  beforeEach(() => {
    safetyPlanService = new SafetyPlanService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('createSafetyPlan', () => {
    it('should create safety plan successfully', async () => {
      const planData = {
        userId: 'user-123',
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: ['feeling isolated', 'sleep changes'],
            completed: true,
          },
          copingStrategiesStep: {
            internalStrategies: ['deep breathing', 'meditation'],
            externalStrategies: ['call friend', 'go for walk'],
            completed: true,
          },
          emergencyContactsStep: {
            contacts: [
              { name: 'Jane Doe', phone: '+1-555-0123', relationship: 'spouse' },
              { name: 'Crisis Hotline', phone: '988', relationship: 'professional' },
            ],
            completed: true,
          },
        },
      };

      const expectedPlan = {
        id: 'plan-456',
        ...planData,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.safetyPlan.create.mockResolvedValue(expectedPlan);
      mockPrisma.safetyPlanVersion.create.mockResolvedValue({
        id: 'version-1',
        planId: 'plan-456',
        version: 1,
      });

      const result = await safetyPlanService.createSafetyPlan(planData);

      expect(mockPrisma.safetyPlan.create).toHaveBeenCalledWith({
        data: {
          ...planData,
          version: 1,
          isActive: true,
        },
      });
      expect(result).toEqual(expectedPlan);
    });

    it('should validate required steps completion', async () => {
      const incompletePlanData = {
        userId: 'user-123',
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: [],
            completed: false,
          },
        },
      };

      await expect(
        safetyPlanService.createSafetyPlan(incompletePlanData)
      ).rejects.toThrow('Warning signs step must be completed');
    });

    it('should validate warning signs are provided', async () => {
      const planData = {
        userId: 'user-123',
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: [],
            completed: true,
          },
        },
      };

      await expect(
        safetyPlanService.createSafetyPlan(planData)
      ).rejects.toThrow('At least one warning sign is required');
    });

    it('should validate coping strategies are provided', async () => {
      const planData = {
        userId: 'user-123',
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: ['feeling sad'],
            completed: true,
          },
          copingStrategiesStep: {
            internalStrategies: [],
            externalStrategies: [],
            completed: true,
          },
        },
      };

      await expect(
        safetyPlanService.createSafetyPlan(planData)
      ).rejects.toThrow('At least one coping strategy is required');
    });

    it('should deactivate existing active plan when creating new one', async () => {
      const planData = {
        userId: 'user-123',
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: ['feeling hopeless'],
            completed: true,
          },
        },
      };

      // Mock existing active plan
      mockPrisma.safetyPlan.findMany.mockResolvedValue([
        { id: 'existing-plan', isActive: true },
      ]);

      mockPrisma.safetyPlan.update = jest.fn();
      mockPrisma.safetyPlan.create.mockResolvedValue({
        id: 'new-plan',
        ...planData,
      });

      await safetyPlanService.createSafetyPlan(planData);

      // Should deactivate existing plan
      expect(mockPrisma.safetyPlan.update).toHaveBeenCalledWith({
        where: { id: 'existing-plan' },
        data: { isActive: false },
      });
    });
  });

  describe('getSafetyPlans', () => {
    it('should retrieve user safety plans', async () => {
      const userId = 'user-123';
      const mockPlans = [
        { ...mockSafetyPlan, id: 'plan-1', version: 2, isActive: true },
        { ...mockSafetyPlan, id: 'plan-2', version: 1, isActive: false },
      ];

      mockPrisma.safetyPlan.findMany.mockResolvedValue(mockPlans);

      const result = await safetyPlanService.getSafetyPlans(userId);

      expect(mockPrisma.safetyPlan.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [
          { isActive: 'desc' },
          { version: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      expect(result).toEqual(mockPlans);
    });

    it('should return only active plan when requested', async () => {
      const userId = 'user-123';

      await safetyPlanService.getSafetyPlans(userId, true);

      expect(mockPrisma.safetyPlan.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
        },
        orderBy: [
          { isActive: 'desc' },
          { version: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    });
  });

  describe('updateSafetyPlan', () => {
    it('should update safety plan and create new version', async () => {
      const planId = 'plan-123';
      const updateData = {
        steps: {
          warningSignsStep: {
            personalSigns: ['updated warning sign'],
            completed: true,
          },
        },
        changeReason: 'added new warning signs',
      };

      const existingPlan = {
        id: planId,
        userId: 'user-123',
        version: 1,
        steps: {
          warningSignsStep: {
            personalSigns: ['old warning sign'],
            completed: true,
          },
        },
      };

      const updatedPlan = {
        ...existingPlan,
        version: 2,
        steps: updateData.steps,
        updatedAt: new Date(),
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue(existingPlan);
      mockPrisma.safetyPlan.update.mockResolvedValue(updatedPlan);
      mockPrisma.safetyPlanVersion.create.mockResolvedValue({
        id: 'version-2',
        planId,
        version: 2,
      });

      const result = await safetyPlanService.updateSafetyPlan(planId, updateData);

      expect(mockPrisma.safetyPlan.update).toHaveBeenCalledWith({
        where: { id: planId },
        data: {
          steps: updateData.steps,
          version: 2,
        },
      });

      expect(mockPrisma.safetyPlanVersion.create).toHaveBeenCalledWith({
        data: {
          planId,
          version: 2,
          previousSteps: existingPlan.steps,
          newSteps: updateData.steps,
          changeReason: updateData.changeReason,
          changedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(updatedPlan);
    });

    it('should validate plan exists before updating', async () => {
      const planId = 'nonexistent-plan';
      const updateData = {
        steps: {
          warningSignsStep: {
            personalSigns: ['test'],
            completed: true,
          },
        },
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue(null);

      await expect(
        safetyPlanService.updateSafetyPlan(planId, updateData)
      ).rejects.toThrow('Safety plan not found');
    });

    it('should validate updated steps', async () => {
      const planId = 'plan-123';
      const invalidUpdateData = {
        steps: {
          warningSignsStep: {
            personalSigns: [],
            completed: true,
          },
        },
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue({
        id: planId,
        version: 1,
      });

      await expect(
        safetyPlanService.updateSafetyPlan(planId, invalidUpdateData)
      ).rejects.toThrow('At least one warning sign is required');
    });
  });

  describe('activateSafetyPlan', () => {
    it('should activate safety plan and deactivate others', async () => {
      const planId = 'plan-123';
      const userId = 'user-123';

      const targetPlan = {
        id: planId,
        userId,
        isActive: false,
      };

      const otherActivePlan = {
        id: 'other-plan',
        userId,
        isActive: true,
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue(targetPlan);
      mockPrisma.safetyPlan.findMany.mockResolvedValue([otherActivePlan]);
      mockPrisma.safetyPlan.update
        .mockResolvedValueOnce({ ...otherActivePlan, isActive: false })
        .mockResolvedValueOnce({ ...targetPlan, isActive: true });

      const result = await safetyPlanService.activateSafetyPlan(planId);

      // Should deactivate other active plans
      expect(mockPrisma.safetyPlan.update).toHaveBeenCalledWith({
        where: { id: 'other-plan' },
        data: { isActive: false },
      });

      // Should activate target plan
      expect(mockPrisma.safetyPlan.update).toHaveBeenCalledWith({
        where: { id: planId },
        data: { isActive: true },
      });

      expect(result.isActive).toBe(true);
    });

    it('should handle plan not found', async () => {
      const planId = 'nonexistent-plan';
      mockPrisma.safetyPlan.findUnique.mockResolvedValue(null);

      await expect(
        safetyPlanService.activateSafetyPlan(planId)
      ).rejects.toThrow('Safety plan not found');
    });
  });

  describe('deleteSafetyPlan', () => {
    it('should soft delete safety plan', async () => {
      const planId = 'plan-123';

      mockPrisma.safetyPlan.update.mockResolvedValue({
        id: planId,
        isActive: false,
        deletedAt: new Date(),
      });

      const result = await safetyPlanService.deleteSafetyPlan(planId);

      expect(mockPrisma.safetyPlan.update).toHaveBeenCalledWith({
        where: { id: planId },
        data: {
          isActive: false,
          deletedAt: expect.any(Date),
        },
      });

      expect(result.isActive).toBe(false);
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('getSafetyPlanVersionHistory', () => {
    it('should retrieve version history for safety plan', async () => {
      const planId = 'plan-123';
      const mockVersions = [
        {
          id: 'version-2',
          version: 2,
          changeReason: 'Updated emergency contacts',
          changedAt: new Date(),
        },
        {
          id: 'version-1',
          version: 1,
          changeReason: 'Initial creation',
          changedAt: new Date(),
        },
      ];

      mockPrisma.safetyPlanVersion.findMany.mockResolvedValue(mockVersions);

      const result = await safetyPlanService.getSafetyPlanVersionHistory(planId);

      expect(mockPrisma.safetyPlanVersion.findMany).toHaveBeenCalledWith({
        where: { planId },
        orderBy: { version: 'desc' },
      });
      expect(result).toEqual(mockVersions);
    });
  });

  describe('validateSafetyPlanSteps', () => {
    it('should validate complete safety plan steps', () => {
      const validSteps = {
        warningSignsStep: {
          personalSigns: ['feeling hopeless', 'social isolation'],
          completed: true,
        },
        copingStrategiesStep: {
          internalStrategies: ['deep breathing', 'mindfulness'],
          externalStrategies: ['call friend', 'exercise'],
          completed: true,
        },
        emergencyContactsStep: {
          contacts: [
            { name: 'Jane Doe', phone: '+1-555-0123', relationship: 'spouse' },
          ],
          completed: true,
        },
        professionalContactsStep: {
          therapist: { name: 'Dr. Smith', phone: '+1-555-0456' },
          completed: true,
        },
        reasonsForLivingStep: {
          reasons: ['My family', 'My goals', 'My pets'],
          completed: true,
        },
      };

      const validation = safetyPlanService.validateSafetyPlanSteps(validSteps);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.completionPercentage).toBe(100);
    });

    it('should identify incomplete steps', () => {
      const incompleteSteps = {
        warningSignsStep: {
          personalSigns: ['feeling sad'],
          completed: true,
        },
        copingStrategiesStep: {
          internalStrategies: [],
          externalStrategies: [],
          completed: false,
        },
      };

      const validation = safetyPlanService.validateSafetyPlanSteps(incompleteSteps);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('At least one coping strategy is required');
      expect(validation.completionPercentage).toBeLessThan(100);
    });

    it('should validate emergency contact format', () => {
      const stepsWithInvalidContact = {
        warningSignsStep: {
          personalSigns: ['test'],
          completed: true,
        },
        emergencyContactsStep: {
          contacts: [
            { name: '', phone: 'invalid', relationship: 'spouse' },
          ],
          completed: true,
        },
      };

      const validation = safetyPlanService.validateSafetyPlanSteps(stepsWithInvalidContact);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Emergency contact name is required');
      expect(validation.errors).toContain('Invalid emergency contact phone number');
    });
  });

  describe('generateSafetyPlanSummary', () => {
    it('should generate comprehensive safety plan summary', async () => {
      const planId = 'plan-123';
      const mockPlan = {
        id: planId,
        userId: 'user-123',
        templateType: 'standard',
        version: 2,
        steps: {
          warningSignsStep: {
            personalSigns: ['isolation', 'hopelessness'],
            completed: true,
          },
          copingStrategiesStep: {
            internalStrategies: ['breathing', 'meditation'],
            externalStrategies: ['call friend', 'exercise'],
            completed: true,
          },
          emergencyContactsStep: {
            contacts: [
              { name: 'Jane', phone: '+1-555-0123', relationship: 'spouse' },
            ],
            completed: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue(mockPlan);

      const summary = await safetyPlanService.generateSafetyPlanSummary(planId);

      expect(summary.planId).toBe(planId);
      expect(summary.templateType).toBe('standard');
      expect(summary.version).toBe(2);
      expect(summary.completionPercentage).toBeGreaterThan(0);
      expect(summary.warningSignsCount).toBe(2);
      expect(summary.internalCopingCount).toBe(2);
      expect(summary.externalCopingCount).toBe(2);
      expect(summary.emergencyContactsCount).toBe(1);
      expect(summary.lastUpdated).toBeDefined();
    });

    it('should handle missing safety plan', async () => {
      const planId = 'nonexistent-plan';
      mockPrisma.safetyPlan.findUnique.mockResolvedValue(null);

      await expect(
        safetyPlanService.generateSafetyPlanSummary(planId)
      ).rejects.toThrow('Safety plan not found');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete safety plan lifecycle', async () => {
      const userId = 'user-123';

      // 1. Create initial safety plan
      const initialPlanData = {
        userId,
        templateType: 'standard' as const,
        steps: {
          warningSignsStep: {
            personalSigns: ['feeling overwhelmed'],
            completed: true,
          },
          copingStrategiesStep: {
            internalStrategies: ['deep breathing'],
            externalStrategies: ['call therapist'],
            completed: true,
          },
        },
      };

      mockPrisma.safetyPlan.create.mockResolvedValue({
        id: 'plan-123',
        ...initialPlanData,
        version: 1,
      });

      const createdPlan = await safetyPlanService.createSafetyPlan(initialPlanData);
      expect(createdPlan.version).toBe(1);

      // 2. Update safety plan
      const updateData = {
        steps: {
          ...initialPlanData.steps,
          emergencyContactsStep: {
            contacts: [
              { name: 'Emergency Contact', phone: '+1-555-0911', relationship: 'friend' },
            ],
            completed: true,
          },
        },
        changeReason: 'Added emergency contact',
      };

      mockPrisma.safetyPlan.findUnique.mockResolvedValue(createdPlan);
      mockPrisma.safetyPlan.update.mockResolvedValue({
        ...createdPlan,
        version: 2,
        steps: updateData.steps,
      });

      const updatedPlan = await safetyPlanService.updateSafetyPlan('plan-123', updateData);
      expect(updatedPlan.version).toBe(2);

      // 3. Retrieve plan with version history
      mockPrisma.safetyPlan.findMany.mockResolvedValue([updatedPlan]);
      
      const userPlans = await safetyPlanService.getSafetyPlans(userId);
      expect(userPlans).toHaveLength(1);
      expect(userPlans[0].version).toBe(2);

      // 4. Generate summary
      mockPrisma.safetyPlan.findUnique.mockResolvedValue(updatedPlan);
      
      const summary = await safetyPlanService.generateSafetyPlanSummary('plan-123');
      expect(summary.version).toBe(2);
      expect(summary.emergencyContactsCount).toBe(1);
    });

    it('should enforce business rules throughout lifecycle', async () => {
      const userId = 'user-123';

      // 1. Cannot create plan without required steps
      const incompletePlan = {
        userId,
        templateType: 'standard' as const,
        steps: {},
      };

      await expect(
        safetyPlanService.createSafetyPlan(incompletePlan)
      ).rejects.toThrow();

      // 2. Cannot update non-existent plan
      mockPrisma.safetyPlan.findUnique.mockResolvedValue(null);

      await expect(
        safetyPlanService.updateSafetyPlan('nonexistent', { steps: {} })
      ).rejects.toThrow('Safety plan not found');

      // 3. Cannot activate non-existent plan
      await expect(
        safetyPlanService.activateSafetyPlan('nonexistent')
      ).rejects.toThrow('Safety plan not found');
    });
  });
});