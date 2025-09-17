/**
 * Push Notification Service
 * Handles crisis alerts and check-in notifications
 * ASTRAL_CORE 2.0
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKGROUND_NOTIFICATION_TASK = 'ASTRAL_BACKGROUND_NOTIFICATION_TASK';
const CRISIS_CHECK_IN_TASK = 'ASTRAL_CRISIS_CHECK_IN_TASK';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'crisis_alert' | 'check_in' | 'message' | 'resource' | 'emergency';
  title: string;
  body: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return;
      }

      // Register for push notifications
      const token = await this.registerForPushNotifications();
      if (token) {
        this.expoPushToken = token;
        await this.saveTokenToStorage(token);
        console.log('Push token registered:', token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Configure background tasks
      await this.setupBackgroundTasks();

      // Schedule initial check-in if needed
      await this.scheduleCheckInNotifications();

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for notifications');
      return null;
    }

    // Get Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('crisis', {
        name: 'Crisis Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        sound: 'emergency.wav',
      });

      await Notifications.setNotificationChannelAsync('check_in', {
        name: 'Check-in Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#FFA500',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Support Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 50],
        lightColor: '#0000FF',
      });
    }

    return token;
  }

  private setupNotificationListeners(): void {
    // Handle notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleIncomingNotification(notification);
    });

    // Handle notification interactions
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private async setupBackgroundTasks(): Promise<void> {
    // Register background fetch task for periodic check-ins
    try {
      await TaskManager.defineTask(CRISIS_CHECK_IN_TASK, async () => {
        try {
          const lastCheckIn = await AsyncStorage.getItem('last_check_in');
          const now = Date.now();
          
          if (lastCheckIn) {
            const timeSinceLastCheckIn = now - parseInt(lastCheckIn);
            const FOUR_HOURS = 4 * 60 * 60 * 1000;

            if (timeSinceLastCheckIn > FOUR_HOURS) {
              await this.sendLocalNotification({
                type: 'check_in',
                title: 'Wellness Check-In',
                body: 'How are you feeling today? Tap to check in.',
                priority: 'high',
              });
            }
          }

          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background task error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      await BackgroundFetch.registerTaskAsync(CRISIS_CHECK_IN_TASK, {
        minimumInterval: 60 * 60, // 1 hour
        stopOnTerminate: false,
        startOnBoot: true,
      });

    } catch (error) {
      console.error('Error setting up background tasks:', error);
    }
  }

  async sendLocalNotification(notification: NotificationData): Promise<void> {
    const channelId = this.getChannelId(notification.type);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: { ...notification.data, type: notification.type },
        sound: notification.type === 'emergency' ? 'emergency.wav' : 'default',
        priority: notification.priority || 'normal',
      },
      trigger: null, // Immediate
      ...(Platform.OS === 'android' && { channelId }),
    });
  }

  async sendEmergencyNotification(message: string, location?: any): Promise<void> {
    await this.sendLocalNotification({
      type: 'emergency',
      title: '🚨 EMERGENCY ALERT',
      body: message,
      data: { location, timestamp: Date.now() },
      priority: 'high',
    });
  }

  async scheduleCheckInNotifications(): Promise<void> {
    // Cancel existing check-in notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily check-ins at different times
    const checkInTimes = [
      { hour: 9, minute: 0 },   // Morning
      { hour: 14, minute: 0 },  // Afternoon
      { hour: 20, minute: 0 },  // Evening
    ];

    for (const time of checkInTimes) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Check-In',
          body: 'How are you feeling? Take a moment to reflect on your mental health.',
          data: { type: 'check_in' },
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
    }
  }

  async scheduleCrisisFollowUp(delayMinutes: number = 30): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Crisis Follow-Up',
        body: 'We wanted to check in after your crisis session. How are you feeling now?',
        data: { type: 'crisis_alert' },
      },
      trigger: {
        seconds: delayMinutes * 60,
      },
    });
  }

  private handleIncomingNotification(notification: Notifications.Notification): void {
    const { type } = notification.request.content.data;

    switch (type) {
      case 'emergency':
        // Handle emergency notifications with highest priority
        this.handleEmergencyNotification(notification);
        break;
      case 'crisis_alert':
        // Handle crisis alerts
        this.handleCrisisAlert(notification);
        break;
      case 'check_in':
        // Show check-in reminder
        this.handleCheckInReminder(notification);
        break;
      default:
        console.log('Received notification:', type);
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { type } = response.notification.request.content.data;

    // Navigate based on notification type
    switch (type) {
      case 'emergency':
        // Navigate to emergency screen
        this.navigateToEmergency();
        break;
      case 'crisis_alert':
        // Navigate to crisis support
        this.navigateToCrisis();
        break;
      case 'check_in':
        // Navigate to check-in screen
        this.navigateToCheckIn();
        break;
      case 'message':
        // Navigate to chat
        this.navigateToChat(response.notification.request.content.data);
        break;
    }
  }

  private handleEmergencyNotification(notification: Notifications.Notification): void {
    // Trigger emergency protocols
    console.log('Emergency notification received:', notification);
    // Could trigger additional alerts, sounds, or vibrations
  }

  private handleCrisisAlert(notification: Notifications.Notification): void {
    console.log('Crisis alert received:', notification);
  }

  private handleCheckInReminder(notification: Notifications.Notification): void {
    console.log('Check-in reminder received:', notification);
  }

  private navigateToEmergency(): void {
    // This would integrate with navigation
    console.log('Navigate to emergency screen');
  }

  private navigateToCrisis(): void {
    console.log('Navigate to crisis screen');
  }

  private navigateToCheckIn(): void {
    console.log('Navigate to check-in screen');
  }

  private navigateToChat(data: any): void {
    console.log('Navigate to chat with data:', data);
  }

  private getChannelId(type: string): string {
    switch (type) {
      case 'emergency':
      case 'crisis_alert':
        return 'crisis';
      case 'check_in':
        return 'check_in';
      default:
        return 'messages';
    }
  }

  private async saveTokenToStorage(token: string): Promise<void> {
    await AsyncStorage.setItem('expo_push_token', token);
  }

  async getExpoPushToken(): Promise<string | null> {
    return this.expoPushToken;
  }

  async clearBadgeCount(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default PushNotificationService;