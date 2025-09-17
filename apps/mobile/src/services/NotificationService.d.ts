/**
 * ASTRAL_CORE 2.0 Mobile Notification Service
 *
 * Handles push notifications with emergency alert capabilities
 */
export interface NotificationConfig {
    enableQuietHours: boolean;
    quietStart: string;
    quietEnd: string;
    enableEmergencyBypass: boolean;
}
export declare class NotificationService {
    private static instance;
    private config;
    static getInstance(): NotificationService;
    initialize(): Promise<void>;
    sendEmergencyAlert(message: string): Promise<void>;
    sendCrisisUpdate(message: string): Promise<void>;
    sendVolunteerNotification(message: string): Promise<void>;
    private isQuietHours;
    private parseTime;
    updateConfig(newConfig: Partial<NotificationConfig>): void;
    getConfig(): NotificationConfig;
}
export default NotificationService;
//# sourceMappingURL=NotificationService.d.ts.map