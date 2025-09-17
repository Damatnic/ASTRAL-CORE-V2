/**
 * Push Notification Service
 * Handles crisis alerts and check-in notifications
 * ASTRAL_CORE 2.0
 */
export interface NotificationData {
    type: 'crisis_alert' | 'check_in' | 'message' | 'resource' | 'emergency';
    title: string;
    body: string;
    data?: any;
    priority?: 'high' | 'normal' | 'low';
}
declare class PushNotificationService {
    private static instance;
    private expoPushToken;
    private notificationListener;
    private responseListener;
    private constructor();
    static getInstance(): PushNotificationService;
    initialize(): Promise<void>;
    private registerForPushNotifications;
    private setupNotificationListeners;
    private setupBackgroundTasks;
    sendLocalNotification(notification: NotificationData): Promise<void>;
    sendEmergencyNotification(message: string, location?: any): Promise<void>;
    scheduleCheckInNotifications(): Promise<void>;
    scheduleCrisisFollowUp(delayMinutes?: number): Promise<void>;
    private handleIncomingNotification;
    private handleNotificationResponse;
    private handleEmergencyNotification;
    private handleCrisisAlert;
    private handleCheckInReminder;
    private navigateToEmergency;
    private navigateToCrisis;
    private navigateToCheckIn;
    private navigateToChat;
    private getChannelId;
    private saveTokenToStorage;
    getExpoPushToken(): Promise<string | null>;
    clearBadgeCount(): Promise<void>;
    cleanup(): void;
}
export default PushNotificationService;
//# sourceMappingURL=PushNotificationService.d.ts.map