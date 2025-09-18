/**
 * Emergency Contact Service
 * HIPAA-Compliant Emergency Contact Management for Mental Health Crisis Response
 *
 * Features:
 * - Encrypted contact information storage
 * - Automated crisis notification system
 * - Consent management and verification
 * - Multi-method communication (SMS, call, email)
 * - Response tracking and escalation
 */
import { EmergencyContact, EmergencyNotification } from '../generated/client';
export interface CreateEmergencyContactParams {
    userId: string;
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    priority?: number;
    contactMethod?: string;
    timezone?: string;
    availableHours?: any;
    autoNotify?: boolean;
    crisisOnly?: boolean;
    hasConsent: boolean;
}
export interface EncryptedContactData {
    encryptedName: Buffer;
    encryptedPhone: Buffer;
    encryptedEmail?: Buffer;
    keyDerivationSalt: Buffer;
}
export interface NotifyEmergencyContactParams {
    contactId: string;
    notificationType: EmergencyNotificationType;
    severity: EmergencySeverity;
    message: string;
    sessionId?: string;
    tetherEmergencyId?: string;
    method?: string;
}
/**
 * Encrypts contact information using user-specific encryption
 */
export declare function encryptContactData(name: string, phone: string, userId: string, email?: string): EncryptedContactData;
/**
 * Decrypts contact information for emergency use
 */
export declare function decryptContactData(contact: EmergencyContact, userId: string): {
    name: string;
    phone: string;
    email?: string;
};
/**
 * Creates a new emergency contact with encrypted data
 */
export declare function createEmergencyContact(params: CreateEmergencyContactParams): Promise<EmergencyContact>;
/**
 * Gets all emergency contacts for a user (prioritized)
 */
export declare function getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
/**
 * Gets emergency contacts that should be auto-notified during crisis
 */
export declare function getAutoNotifyContacts(userId: string): Promise<EmergencyContact[]>;
/**
 * Notifies an emergency contact during a crisis
 */
export declare function notifyEmergencyContact(params: NotifyEmergencyContactParams): Promise<EmergencyNotification>;
/**
 * Triggers emergency notifications for all auto-notify contacts
 */
export declare function triggerEmergencyNotifications(userId: string, notificationType: EmergencyNotificationType, severity: EmergencySeverity, message: string, sessionId?: string, tetherEmergencyId?: string): Promise<EmergencyNotification[]>;
/**
 * Updates notification status (for delivery tracking)
 */
export declare function updateNotificationStatus(notificationId: string, status: NotificationStatus, deliveredAt?: Date, acknowledgedAt?: Date, responseReceived?: boolean, errorMessage?: string): Promise<EmergencyNotification>;
/**
 * Verifies an emergency contact (phone/email verification)
 */
export declare function verifyEmergencyContact(contactId: string): Promise<EmergencyContact>;
/**
 * Updates emergency contact consent
 */
export declare function updateContactConsent(contactId: string, hasConsent: boolean, consentDate?: Date): Promise<EmergencyContact>;
/**
 * Gets emergency notification history for analysis
 */
export declare function getEmergencyNotificationHistory(userId: string, timeframe?: 'day' | 'week' | 'month'): Promise<EmergencyNotification[]>;
/**
 * Emergency contact system health check
 */
export declare function checkEmergencyContactHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    totalContacts: number;
    verifiedContacts: number;
    consentedContacts: number;
    recentNotifications: number;
    averageResponseTime: number;
}>;
//# sourceMappingURL=emergency-contact.service.d.ts.map