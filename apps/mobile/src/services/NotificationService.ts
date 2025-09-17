/**
 * ASTRAL_CORE 2.0 Mobile Notification Service
 * 
 * Handles push notifications with emergency alert capabilities
 */

export interface NotificationConfig {
  enableQuietHours: boolean;
  quietStart: string; // HH:MM format
  quietEnd: string;   // HH:MM format
  enableEmergencyBypass: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig = {
    enableQuietHours: true,
    quietStart: '22:00',
    quietEnd: '07:00',
    enableEmergencyBypass: true,
  };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    // Request notification permissions
    console.log('📱 Initializing notification permissions');
    // TODO: Implement React Native notification setup
  }

  async sendEmergencyAlert(message: string): Promise<void> {
    // Emergency alerts bypass quiet hours and do not disturb settings
    console.log('🚨 EMERGENCY ALERT:', message);
    
    // TODO: Send high-priority push notification
    // This should work even during quiet hours
  }

  async sendCrisisUpdate(message: string): Promise<void> {
    if (this.isQuietHours() && !this.config.enableEmergencyBypass) {
      // Queue for later delivery
      return;
    }

    console.log('💬 Crisis update:', message);
    // TODO: Send standard priority notification
  }

  async sendVolunteerNotification(message: string): Promise<void> {
    if (this.isQuietHours()) {
      return; // Skip during quiet hours
    }

    console.log('🤝 Volunteer notification:', message);
    // TODO: Send notification to volunteers
  }

  private isQuietHours(): boolean {
    if (!this.config.enableQuietHours) return false;

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

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

export default NotificationService;