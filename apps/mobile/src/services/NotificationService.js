/**
 * ASTRAL_CORE 2.0 Mobile Notification Service
 *
 * Handles push notifications with emergency alert capabilities
 */
export class NotificationService {
    static instance;
    config = {
        enableQuietHours: true,
        quietStart: '22:00',
        quietEnd: '07:00',
        enableEmergencyBypass: true,
    };
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    async initialize() {
        // Request notification permissions
        console.log('📱 Initializing notification permissions');
        // TODO: Implement React Native notification setup
    }
    async sendEmergencyAlert(message) {
        // Emergency alerts bypass quiet hours and do not disturb settings
        console.log('🚨 EMERGENCY ALERT:', message);
        // TODO: Send high-priority push notification
        // This should work even during quiet hours
    }
    async sendCrisisUpdate(message) {
        if (this.isQuietHours() && !this.config.enableEmergencyBypass) {
            // Queue for later delivery
            return;
        }
        console.log('💬 Crisis update:', message);
        // TODO: Send standard priority notification
    }
    async sendVolunteerNotification(message) {
        if (this.isQuietHours()) {
            return; // Skip during quiet hours
        }
        console.log('🤝 Volunteer notification:', message);
        // TODO: Send notification to volunteers
    }
    isQuietHours() {
        if (!this.config.enableQuietHours)
            return false;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const quietStart = this.parseTime(this.config.quietStart);
        const quietEnd = this.parseTime(this.config.quietEnd);
        // Handle quiet hours that span midnight
        if (quietStart > quietEnd) {
            return currentTime >= quietStart || currentTime <= quietEnd;
        }
        return currentTime >= quietStart && currentTime <= quietEnd;
    }
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getConfig() {
        return { ...this.config };
    }
}
export default NotificationService;
//# sourceMappingURL=NotificationService.js.map