/**
 * ASTRAL_CORE 2.0 - Emergency Contact Service Tests
 * Life-critical testing for emergency contact management
 */

import { EmergencyContactService } from '../../packages/database/src/services/emergency-contact.service';
import { mockEmergencyContact } from '../setup';

// Mock Prisma client
const mockPrisma = {
  emergencyContact: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  emergencyNotification: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('EmergencyContactService', () => {
  let emergencyContactService: EmergencyContactService;

  beforeEach(() => {
    emergencyContactService = new EmergencyContactService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('createEmergencyContact', () => {
    it('should create emergency contact successfully', async () => {
      const contactData = {
        userId: 'user-123',
        name: 'Jane Doe',
        phone: '+1-555-0123',
        email: 'jane@example.com',
        relationship: 'spouse',
        isPrimary: true,
      };

      const expectedContact = {
        id: 'contact-456',
        ...contactData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.emergencyContact.create.mockResolvedValue(expectedContact);

      const result = await emergencyContactService.createEmergencyContact(contactData);

      expect(mockPrisma.emergencyContact.create).toHaveBeenCalledWith({
        data: {
          ...contactData,
          isActive: true,
        },
      });
      expect(result).toEqual(expectedContact);
    });

    it('should validate required fields', async () => {
      const invalidContactData = {
        userId: 'user-123',
        name: '',
        phone: '',
        relationship: '',
      };

      await expect(
        emergencyContactService.createEmergencyContact(invalidContactData as any)
      ).rejects.toThrow('Name is required');
    });

    it('should validate phone number format', async () => {
      const contactData = {
        userId: 'user-123',
        name: 'Jane Doe',
        phone: 'invalid-phone',
        relationship: 'spouse',
      };

      await expect(
        emergencyContactService.createEmergencyContact(contactData)
      ).rejects.toThrow('Invalid phone number format');
    });

    it('should validate email format when provided', async () => {
      const contactData = {
        userId: 'user-123',
        name: 'Jane Doe',
        phone: '+1-555-0123',
        email: 'invalid-email',
        relationship: 'spouse',
      };

      await expect(
        emergencyContactService.createEmergencyContact(contactData)
      ).rejects.toThrow('Invalid email format');
    });

    it('should ensure only one primary contact per user', async () => {
      const contactData = {
        userId: 'user-123',
        name: 'Jane Doe',
        phone: '+1-555-0123',
        relationship: 'spouse',
        isPrimary: true,
      };

      // Mock existing primary contact
      mockPrisma.emergencyContact.findMany.mockResolvedValue([
        { id: 'existing-primary', isPrimary: true },
      ]);

      mockPrisma.emergencyContact.update = jest.fn();
      mockPrisma.emergencyContact.create.mockResolvedValue({
        id: 'new-contact',
        ...contactData,
      });

      await emergencyContactService.createEmergencyContact(contactData);

      // Should update existing primary contact
      expect(mockPrisma.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: 'existing-primary' },
        data: { isPrimary: false },
      });
    });
  });

  describe('getEmergencyContacts', () => {
    it('should retrieve user emergency contacts', async () => {
      const userId = 'user-123';
      const mockContacts = [
        { ...mockEmergencyContact, id: 'contact-1', isPrimary: true },
        { ...mockEmergencyContact, id: 'contact-2', isPrimary: false },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);

      const result = await emergencyContactService.getEmergencyContacts(userId);

      expect(mockPrisma.emergencyContact.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
        },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'asc' },
        ],
      });
      expect(result).toEqual(mockContacts);
    });

    it('should return empty array when no contacts exist', async () => {
      const userId = 'user-123';
      mockPrisma.emergencyContact.findMany.mockResolvedValue([]);

      const result = await emergencyContactService.getEmergencyContacts(userId);

      expect(result).toEqual([]);
    });

    it('should filter out inactive contacts', async () => {
      const userId = 'user-123';
      
      await emergencyContactService.getEmergencyContacts(userId);

      expect(mockPrisma.emergencyContact.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isActive: true,
        },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'asc' },
        ],
      });
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update emergency contact successfully', async () => {
      const contactId = 'contact-123';
      const updateData = {
        name: 'Updated Name',
        phone: '+1-555-9999',
        email: 'updated@example.com',
      };

      const updatedContact = {
        id: contactId,
        ...updateData,
        userId: 'user-123',
        relationship: 'spouse',
        isPrimary: true,
        isActive: true,
        updatedAt: new Date(),
      };

      mockPrisma.emergencyContact.update.mockResolvedValue(updatedContact);

      const result = await emergencyContactService.updateEmergencyContact(contactId, updateData);

      expect(mockPrisma.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: contactId },
        data: updateData,
      });
      expect(result).toEqual(updatedContact);
    });

    it('should validate updated phone number', async () => {
      const contactId = 'contact-123';
      const updateData = {
        phone: 'invalid-phone',
      };

      await expect(
        emergencyContactService.updateEmergencyContact(contactId, updateData)
      ).rejects.toThrow('Invalid phone number format');
    });

    it('should handle primary contact updates', async () => {
      const contactId = 'contact-123';
      const updateData = {
        isPrimary: true,
      };

      mockPrisma.emergencyContact.findUnique.mockResolvedValue({
        id: contactId,
        userId: 'user-123',
      });

      mockPrisma.emergencyContact.findMany.mockResolvedValue([
        { id: 'other-contact', isPrimary: true },
      ]);

      mockPrisma.emergencyContact.update.mockResolvedValue({
        id: contactId,
        isPrimary: true,
      });

      await emergencyContactService.updateEmergencyContact(contactId, updateData);

      // Should demote other primary contacts
      expect(mockPrisma.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: 'other-contact' },
        data: { isPrimary: false },
      });
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should soft delete emergency contact', async () => {
      const contactId = 'contact-123';

      mockPrisma.emergencyContact.update.mockResolvedValue({
        id: contactId,
        isActive: false,
      });

      const result = await emergencyContactService.deleteEmergencyContact(contactId);

      expect(mockPrisma.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: contactId },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });

    it('should promote another contact to primary if deleting primary', async () => {
      const primaryContactId = 'primary-contact';

      mockPrisma.emergencyContact.findUnique.mockResolvedValue({
        id: primaryContactId,
        userId: 'user-123',
        isPrimary: true,
      });

      mockPrisma.emergencyContact.findMany.mockResolvedValue([
        { id: 'secondary-contact', isPrimary: false },
      ]);

      mockPrisma.emergencyContact.update
        .mockResolvedValueOnce({ id: primaryContactId, isActive: false })
        .mockResolvedValueOnce({ id: 'secondary-contact', isPrimary: true });

      await emergencyContactService.deleteEmergencyContact(primaryContactId);

      expect(mockPrisma.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: 'secondary-contact' },
        data: { isPrimary: true },
      });
    });
  });

  describe('triggerEmergencyNotifications', () => {
    it('should send notifications to all active emergency contacts', async () => {
      const notificationData = {
        userId: 'user-123',
        urgency: 'high' as const,
        message: 'Emergency situation detected',
        triggerReason: 'crisis_escalation',
      };

      const mockContacts = [
        {
          id: 'contact-1',
          name: 'Jane Doe',
          phone: '+1-555-0123',
          email: 'jane@example.com',
          isPrimary: true,
        },
        {
          id: 'contact-2',
          name: 'John Smith',
          phone: '+1-555-0456',
          email: 'john@example.com',
          isPrimary: false,
        },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);
      mockPrisma.emergencyNotification.create.mockResolvedValue({
        id: 'notification-123',
      });

      // Mock SMS and email services
      const mockSmsService = jest.fn().mockResolvedValue({ sent: true });
      const mockEmailService = jest.fn().mockResolvedValue({ sent: true });

      emergencyContactService.setSmsService(mockSmsService);
      emergencyContactService.setEmailService(mockEmailService);

      const result = await emergencyContactService.triggerEmergencyNotifications(notificationData);

      expect(result.notificationsSent).toBe(4); // 2 SMS + 2 Email
      expect(result.successfulSms).toBe(2);
      expect(result.successfulEmail).toBe(2);
      expect(result.failedNotifications).toBe(0);

      // Verify notifications were logged
      expect(mockPrisma.emergencyNotification.create).toHaveBeenCalledTimes(4);
    });

    it('should prioritize primary contact for immediate notifications', async () => {
      const notificationData = {
        userId: 'user-123',
        urgency: 'critical' as const,
        message: 'Critical emergency - immediate response needed',
        triggerReason: 'imminent_danger',
      };

      const mockContacts = [
        {
          id: 'primary-contact',
          name: 'Emergency Contact',
          phone: '+1-555-0911',
          email: 'emergency@example.com',
          isPrimary: true,
        },
        {
          id: 'secondary-contact',
          name: 'Secondary Contact',
          phone: '+1-555-0456',
          isPrimary: false,
        },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);
      mockPrisma.emergencyNotification.create.mockResolvedValue({
        id: 'notification-123',
      });

      const mockSmsService = jest.fn().mockResolvedValue({ sent: true });
      emergencyContactService.setSmsService(mockSmsService);

      await emergencyContactService.triggerEmergencyNotifications(notificationData);

      // Primary contact should be notified first
      const smsCallOrder = mockSmsService.mock.calls;
      expect(smsCallOrder[0][0]).toBe('+1-555-0911'); // Primary contact phone
    });

    it('should handle notification failures gracefully', async () => {
      const notificationData = {
        userId: 'user-123',
        urgency: 'medium' as const,
        message: 'Emergency notification',
        triggerReason: 'safety_concern',
      };

      const mockContacts = [
        {
          id: 'contact-1',
          phone: '+1-555-0123',
          email: 'invalid-email',
        },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);

      const mockSmsService = jest.fn().mockRejectedValue(new Error('SMS service unavailable'));
      const mockEmailService = jest.fn().mockRejectedValue(new Error('Invalid email'));

      emergencyContactService.setSmsService(mockSmsService);
      emergencyContactService.setEmailService(mockEmailService);

      const result = await emergencyContactService.triggerEmergencyNotifications(notificationData);

      expect(result.notificationsSent).toBe(0);
      expect(result.failedNotifications).toBe(2);
      expect(result.errors).toHaveLength(2);
    });

    it('should respect notification preferences', async () => {
      const notificationData = {
        userId: 'user-123',
        urgency: 'low' as const,
        message: 'Status update',
        triggerReason: 'status_update',
      };

      const mockContacts = [
        {
          id: 'contact-1',
          phone: '+1-555-0123',
          email: 'contact@example.com',
          notificationPreferences: {
            sms: true,
            email: false,
            lowUrgency: false,
          },
        },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);

      const result = await emergencyContactService.triggerEmergencyNotifications(notificationData);

      // Should not send low urgency notifications if preference is disabled
      expect(result.notificationsSent).toBe(0);
      expect(result.skippedDueToPreferences).toBe(2);
    });

    it('should track notification delivery status', async () => {
      const notificationData = {
        userId: 'user-123',
        urgency: 'high' as const,
        message: 'Emergency alert',
        triggerReason: 'crisis_escalation',
      };

      const mockContacts = [
        {
          id: 'contact-1',
          phone: '+1-555-0123',
          email: 'contact@example.com',
        },
      ];

      mockPrisma.emergencyContact.findMany.mockResolvedValue(mockContacts);
      
      const mockNotificationId = 'notification-123';
      mockPrisma.emergencyNotification.create.mockResolvedValue({
        id: mockNotificationId,
      });

      const mockSmsService = jest.fn().mockResolvedValue({
        sent: true,
        messageId: 'sms-456',
        deliveredAt: new Date(),
      });

      emergencyContactService.setSmsService(mockSmsService);

      await emergencyContactService.triggerEmergencyNotifications(notificationData);

      // Verify notification status is tracked
      expect(mockPrisma.emergencyNotification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contactId: 'contact-1',
          method: 'SMS',
          status: 'SENT',
          messageId: 'sms-456',
        }),
      });
    });
  });

  describe('notifyEmergencyContact', () => {
    it('should send immediate notification to specific contact', async () => {
      const contactId = 'contact-123';
      const message = 'Immediate emergency - please contact user';

      const mockContact = {
        id: contactId,
        name: 'Emergency Contact',
        phone: '+1-555-0911',
        email: 'emergency@example.com',
        user: {
          id: 'user-123',
          name: 'Patient Name',
        },
      };

      mockPrisma.emergencyContact.findUnique.mockResolvedValue(mockContact);

      const mockSmsService = jest.fn().mockResolvedValue({ sent: true });
      emergencyContactService.setSmsService(mockSmsService);

      const result = await emergencyContactService.notifyEmergencyContact(contactId, message);

      expect(result.sent).toBe(true);
      expect(mockSmsService).toHaveBeenCalledWith(
        '+1-555-0911',
        expect.stringContaining(message)
      );
    });

    it('should handle contact not found', async () => {
      const contactId = 'nonexistent-contact';
      const message = 'Test message';

      mockPrisma.emergencyContact.findUnique.mockResolvedValue(null);

      await expect(
        emergencyContactService.notifyEmergencyContact(contactId, message)
      ).rejects.toThrow('Emergency contact not found');
    });
  });

  describe('getNotificationHistory', () => {
    it('should retrieve notification history for user', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notification-1',
          method: 'SMS',
          status: 'DELIVERED',
          sentAt: new Date(),
          contact: { name: 'Jane Doe' },
        },
        {
          id: 'notification-2',
          method: 'EMAIL',
          status: 'SENT',
          sentAt: new Date(),
          contact: { name: 'John Smith' },
        },
      ];

      mockPrisma.emergencyNotification.findMany.mockResolvedValue(mockNotifications);

      const result = await emergencyContactService.getNotificationHistory(userId);

      expect(mockPrisma.emergencyNotification.findMany).toHaveBeenCalledWith({
        where: {
          contact: {
            userId,
          },
        },
        include: {
          contact: {
            select: {
              name: true,
              relationship: true,
            },
          },
        },
        orderBy: {
          sentAt: 'desc',
        },
        take: 50,
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should limit notification history results', async () => {
      const userId = 'user-123';
      const limit = 10;

      await emergencyContactService.getNotificationHistory(userId, limit);

      expect(mockPrisma.emergencyNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: limit,
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete emergency workflow', async () => {
      const userId = 'user-123';

      // 1. Create emergency contacts
      const primaryContact = {
        userId,
        name: 'Primary Contact',
        phone: '+1-555-0911',
        email: 'primary@example.com',
        relationship: 'spouse',
        isPrimary: true,
      };

      const secondaryContact = {
        userId,
        name: 'Secondary Contact',
        phone: '+1-555-0456',
        email: 'secondary@example.com',
        relationship: 'friend',
        isPrimary: false,
      };

      mockPrisma.emergencyContact.create
        .mockResolvedValueOnce({ id: 'primary-id', ...primaryContact })
        .mockResolvedValueOnce({ id: 'secondary-id', ...secondaryContact });

      await emergencyContactService.createEmergencyContact(primaryContact);
      await emergencyContactService.createEmergencyContact(secondaryContact);

      // 2. Trigger emergency notifications
      mockPrisma.emergencyContact.findMany.mockResolvedValue([
        { id: 'primary-id', ...primaryContact },
        { id: 'secondary-id', ...secondaryContact },
      ]);

      const mockSmsService = jest.fn().mockResolvedValue({ sent: true });
      emergencyContactService.setSmsService(mockSmsService);

      const notificationResult = await emergencyContactService.triggerEmergencyNotifications({
        userId,
        urgency: 'critical',
        message: 'Emergency detected',
        triggerReason: 'crisis_escalation',
      });

      expect(notificationResult.notificationsSent).toBeGreaterThan(0);
      expect(mockSmsService).toHaveBeenCalledTimes(2);
    });
  });
});