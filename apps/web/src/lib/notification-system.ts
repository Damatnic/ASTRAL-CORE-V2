/**
 * Crisis Alert & Notification System
 * 
 * Handles push notifications, in-app alerts, SMS, and email notifications
 * for crisis situations, reminders, and wellness check-ins
 */

export interface NotificationPreferences {
  userId: string;
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  crisisAlerts: boolean;
  reminderAlerts: boolean;
  moodCheckIns: boolean;
  therapyReminders: boolean;
  supportGroupNotifications: boolean;
  emergencyContactAlerts: boolean;
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    enabled: boolean;
  };
  phoneNumber?: string;
  email?: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    priority: number;
  }>;
}

export interface NotificationAlert {
  id: string;
  type: 'crisis' | 'reminder' | 'check-in' | 'emergency' | 'therapy' | 'support';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  userId: string;
  timestamp: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'dismissed' | 'failed';
  channels: Array<'push' | 'sms' | 'email' | 'in-app'>;
  isEmergency?: boolean;
  requiresAcknowledgment?: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'url' | 'call' | 'chat' | 'dismiss' | 'snooze';
  target: string;
  style: 'primary' | 'secondary' | 'danger';
}

export interface CrisisAlert extends NotificationAlert {
  type: 'crisis' | 'emergency';
  riskLevel: number; // 1-10
  triggerSource: 'ai-detection' | 'user-request' | 'therapist-alert' | 'auto-check-in';
  interventionRequired: boolean;
  escalationLevel: 'immediate' | 'urgent' | 'scheduled';
  supportTeamNotified: boolean;
  emergencyContactsNotified: boolean;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

class NotificationSystem {
  private preferences: Map<string, NotificationPreferences> = new Map();
  private activeAlerts: Map<string, NotificationAlert> = new Map();
  private serviceWorker: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
    this.setupNotificationEventListeners();
  }

  // Initialize push notification service worker
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-notifications.js');
        this.serviceWorker = registration;
        console.log('Notification service worker registered');
      } catch (error) {
        console.error('Failed to register notification service worker:', error);
      }
    }
  }

  // Setup event listeners for notification interactions
  private setupNotificationEventListeners(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'notification-action') {
          this.handleNotificationAction(event.data.alertId, event.data.actionId);
        }
      });
    }
  }

  // Request notification permissions
  public async requestPermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Set user notification preferences
  public async setPreferences(preferences: NotificationPreferences): Promise<void> {
    this.preferences.set(preferences.userId, preferences);
    
    // Store in localStorage for persistence
    localStorage.setItem(
      `notification-prefs-${preferences.userId}`,
      JSON.stringify(preferences)
    );

    // If push notifications enabled, subscribe
    if (preferences.pushNotifications) {
      await this.subscribeToPushNotifications(preferences.userId);
    }
  }

  // Get user notification preferences
  public getPreferences(userId: string): NotificationPreferences | null {
    let prefs = this.preferences.get(userId);
    
    if (!prefs) {
      // Try to load from localStorage
      const stored = localStorage.getItem(`notification-prefs-${userId}`);
      if (stored) {
        prefs = JSON.parse(stored);
        if (prefs) {
          this.preferences.set(userId, prefs);
        }
      }
    }
    
    return prefs || null;
  }

  // Subscribe to push notifications
  private async subscribeToPushNotifications(userId: string): Promise<void> {
    if (!this.serviceWorker) return;

    try {
      const subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  // Send crisis alert - highest priority
  public async sendCrisisAlert(alert: Partial<CrisisAlert>): Promise<string> {
    const crisisAlert: CrisisAlert = {
      id: crypto.randomUUID(),
      type: 'crisis',
      priority: 'critical',
      timestamp: new Date(),
      status: 'pending',
      channels: ['push', 'sms', 'in-app'],
      isEmergency: true,
      requiresAcknowledgment: true,
      riskLevel: 8,
      triggerSource: 'ai-detection',
      interventionRequired: true,
      escalationLevel: 'immediate',
      supportTeamNotified: false,
      emergencyContactsNotified: false,
      actions: [
        {
          id: 'call-988',
          label: 'Call 988 Crisis Line',
          type: 'call',
          target: '988',
          style: 'danger'
        },
        {
          id: 'crisis-chat',
          label: 'Start Crisis Chat',
          type: 'chat',
          target: '/crisis/chat',
          style: 'primary'
        },
        {
          id: 'safety-plan',
          label: 'View Safety Plan',
          type: 'url',
          target: '/crisis/safety-plan',
          style: 'secondary'
        }
      ],
      ...alert
    } as CrisisAlert;

    return this.sendAlert(crisisAlert);
  }

  // Send reminder notification
  public async sendReminder(
    userId: string,
    type: 'mood-check' | 'therapy' | 'medication' | 'journal' | 'exercise',
    customMessage?: string
  ): Promise<string> {
    const messages = {
      'mood-check': 'How are you feeling today? Take a moment to check in with yourself.',
      'therapy': 'You have a therapy session coming up soon.',
      'medication': 'Reminder to take your medication.',
      'journal': 'Consider writing in your journal today - it\'s a great way to process your thoughts.',
      'exercise': 'A little movement can boost your mood. How about a walk or some stretching?'
    };

    const alert: NotificationAlert = {
      id: crypto.randomUUID(),
      type: 'reminder',
      priority: 'medium',
      title: `Wellness Reminder - ${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      message: customMessage || messages[type],
      userId,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending',
      channels: ['push', 'in-app'],
      actions: [
        {
          id: 'open-app',
          label: 'Open App',
          type: 'url',
          target: '/',
          style: 'primary'
        },
        {
          id: 'snooze',
          label: 'Remind Later',
          type: 'snooze',
          target: '1h',
          style: 'secondary'
        }
      ]
    };

    return this.sendAlert(alert);
  }

  // Send wellness check-in
  public async sendWellnessCheckIn(
    userId: string,
    moodTrend: 'concerning' | 'stable' | 'improving'
  ): Promise<string> {
    const messages = {
      concerning: 'We noticed you might be going through a tough time. How are you doing today?',
      stable: 'How are you feeling today? Your wellbeing matters to us.',
      improving: 'It looks like things have been going well! How are you feeling today?'
    };

    const alert: NotificationAlert = {
      id: crypto.randomUUID(),
      type: 'check-in',
      priority: moodTrend === 'concerning' ? 'high' : 'medium',
      title: 'Daily Check-in',
      message: messages[moodTrend],
      userId,
      timestamp: new Date(),
      status: 'pending',
      channels: ['push', 'in-app'],
      actions: [
        {
          id: 'mood-tracking',
          label: 'Track Mood',
          type: 'url',
          target: '/mood-gamified',
          style: 'primary'
        },
        {
          id: 'ai-therapy',
          label: 'Talk to AI Therapist',
          type: 'url',
          target: '/ai-therapy',
          style: 'secondary'
        }
      ]
    };

    if (moodTrend === 'concerning') {
      alert.actions?.push({
        id: 'crisis-support',
        label: 'Get Crisis Support',
        type: 'url',
        target: '/crisis',
        style: 'danger'
      });
    }

    return this.sendAlert(alert);
  }

  // Core alert sending function
  private async sendAlert(alert: NotificationAlert): Promise<string> {
    this.activeAlerts.set(alert.id, alert);

    const preferences = this.getPreferences(alert.userId);
    if (!preferences) {
      console.warn('No notification preferences found for user:', alert.userId);
      return alert.id;
    }

    // Check if notifications are enabled for this type
    if (!this.shouldSendNotification(alert, preferences)) {
      alert.status = 'dismissed';
      return alert.id;
    }

    // Check quiet hours (except for critical alerts)
    if (alert.priority !== 'critical' && this.isQuietHours(preferences)) {
      // Schedule for later
      this.scheduleAlert(alert, preferences.quietHours.end);
      return alert.id;
    }

    // Send through enabled channels
    const promises: Promise<void>[] = [];

    if (alert.channels.includes('push') && preferences.pushNotifications) {
      promises.push(this.sendPushNotification(alert));
    }

    if (alert.channels.includes('in-app')) {
      promises.push(this.sendInAppNotification(alert));
    }

    if (alert.channels.includes('sms') && preferences.smsNotifications && preferences.phoneNumber) {
      promises.push(this.sendSMSNotification(alert, preferences.phoneNumber));
    }

    if (alert.channels.includes('email') && preferences.emailNotifications && preferences.email) {
      promises.push(this.sendEmailNotification(alert, preferences.email));
    }

    // For crisis alerts, also notify emergency contacts
    if (alert.type === 'crisis' && preferences.emergencyContactAlerts) {
      promises.push(this.notifyEmergencyContacts(alert as CrisisAlert, preferences));
    }

    try {
      await Promise.all(promises);
      alert.status = 'sent';
    } catch (error) {
      console.error('Failed to send alert:', error);
      alert.status = 'failed';
    }

    return alert.id;
  }

  // Check if notification should be sent based on preferences
  private shouldSendNotification(alert: NotificationAlert, preferences: NotificationPreferences): boolean {
    switch (alert.type) {
      case 'crisis':
      case 'emergency':
        return preferences.crisisAlerts;
      case 'reminder':
        return preferences.reminderAlerts;
      case 'check-in':
        return preferences.moodCheckIns;
      case 'therapy':
        return preferences.therapyReminders;
      case 'support':
        return preferences.supportGroupNotifications;
      default:
        return true;
    }
  }

  // Check if current time is within quiet hours
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Send push notification
  private async sendPushNotification(alert: NotificationAlert): Promise<void> {
    if (!this.serviceWorker) throw new Error('Service worker not available');

    const notificationOptions: NotificationOptions = {
      body: alert.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/notification-badge.png',
      tag: alert.id,
      data: {
        alertId: alert.id,
        actions: alert.actions
      },
      requireInteraction: alert.requiresAcknowledgment
    };

    // Add vibrate pattern if supported
    if ('vibrate' in navigator) {
      (notificationOptions as any).vibrate = alert.priority === 'critical' ? [200, 100, 200, 100, 200] : [200];
    }

    await this.serviceWorker.showNotification(alert.title, notificationOptions);
  }

  // Send in-app notification
  private async sendInAppNotification(alert: NotificationAlert): Promise<void> {
    // Dispatch custom event for in-app notification display
    window.dispatchEvent(new CustomEvent('notification-alert', {
      detail: alert
    }));
  }

  // Send SMS notification
  private async sendSMSNotification(alert: NotificationAlert, phoneNumber: string): Promise<void> {
    await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message: `${alert.title}: ${alert.message}`,
        alertId: alert.id
      })
    });
  }

  // Send email notification
  private async sendEmailNotification(alert: NotificationAlert, email: string): Promise<void> {
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: alert.title,
        message: alert.message,
        alertId: alert.id,
        actions: alert.actions
      })
    });
  }

  // Notify emergency contacts for crisis situations
  private async notifyEmergencyContacts(
    alert: CrisisAlert,
    preferences: NotificationPreferences
  ): Promise<void> {
    const contacts = preferences.emergencyContacts
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3); // Notify top 3 priority contacts

    for (const contact of contacts) {
      const message = `CRISIS ALERT: ${preferences.userId} may need immediate support. They are using the Astral mental health platform and a crisis situation has been detected. Please reach out to them or call 988 if needed.`;

      // Send SMS to emergency contact
      if (contact.phone) {
        await this.sendSMSNotification({
          ...alert,
          message,
          title: 'CRISIS ALERT - Please Check on Your Loved One'
        }, contact.phone);
      }

      // Send email to emergency contact
      if (contact.email) {
        await this.sendEmailNotification({
          ...alert,
          message,
          title: 'CRISIS ALERT - Please Check on Your Loved One'
        }, contact.email);
      }
    }

    (alert as CrisisAlert).emergencyContactsNotified = true;
  }

  // Schedule alert for later (after quiet hours)
  private scheduleAlert(alert: NotificationAlert, time: string): void {
    const [hour, minute] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - Date.now();
    
    setTimeout(() => {
      this.sendAlert(alert);
    }, delay);
  }

  // Handle notification action clicks
  private async handleNotificationAction(alertId: string, actionId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;

    const action = alert.actions?.find(a => a.id === actionId);
    if (!action) return;

    switch (action.type) {
      case 'url':
        window.open(action.target, '_self');
        break;
      case 'call':
        window.location.href = `tel:${action.target}`;
        break;
      case 'chat':
        window.open(action.target, '_self');
        break;
      case 'snooze':
        this.snoozeAlert(alertId, action.target);
        break;
      case 'dismiss':
        this.dismissAlert(alertId);
        break;
    }

    // Mark alert as read
    alert.status = 'read';
  }

  // Snooze alert for specified duration
  private snoozeAlert(alertId: string, duration: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;

    // Parse duration (e.g., "1h", "30m")
    const match = duration.match(/^(\d+)([hm])$/);
    if (!match) return;

    const value = parseInt(match[1]);
    const unit = match[2];
    const minutes = unit === 'h' ? value * 60 : value;

    // Reschedule alert
    setTimeout(() => {
      alert.status = 'pending';
      this.sendAlert(alert);
    }, minutes * 60 * 1000);

    alert.status = 'dismissed';
  }

  // Dismiss alert permanently
  private dismissAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'dismissed';
    }
  }

  // Get active alerts for user
  public getActiveAlerts(userId: string): NotificationAlert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => 
        alert.userId === userId && 
        ['pending', 'sent', 'delivered'].includes(alert.status)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark alert as acknowledged
  public acknowledgeAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'read';
    }
  }

  // Clean up expired alerts
  public cleanupExpiredAlerts(): void {
    const now = new Date();
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (alert.expiresAt && alert.expiresAt < now) {
        this.activeAlerts.delete(id);
      }
    }
  }
}

// Singleton instance
export const notificationSystem = new NotificationSystem();

// Export types and system
export default NotificationSystem;