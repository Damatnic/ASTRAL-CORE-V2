import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, BellOff, AlertCircle, CheckCircle, Info, X,
  MessageSquare, Phone, Heart, Shield, Zap, Clock,
  Volume2, VolumeX, Vibrate, Smartphone, Monitor,
  Sun, Moon, Star, UserPlus, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

// Notification types - all FREE, no premium features
type NotificationType = 
  | 'crisis'      // Immediate crisis alerts
  | 'support'     // Support messages from volunteers
  | 'check-in'    // Wellness check-ins
  | 'reminder'    // Medication/appointment reminders
  | 'success'     // Positive reinforcement
  | 'info'        // System information
  | 'escalation'; // Escalation notifications

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  actions?: NotificationAction[];
  metadata?: {
    sender?: string;
    sessionId?: string;
    urgencyScore?: number;
  };
  autoDissmiss?: number; // milliseconds
  persistent?: boolean;
}

interface NotificationAction {
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  channels: {
    crisis: boolean;
    support: boolean;
    checkIn: boolean;
    'check-in': boolean;
    reminder: boolean;
    success: boolean;
    info: boolean;
    escalation: boolean;
  };
  urgencyThreshold: 'all' | 'high' | 'urgent';
}

interface NotificationSystemProps {
  userId?: string;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

// Sample notifications for demo
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'check-in',
    title: 'Daily Wellness Check',
    message: 'How are you feeling today? Take a moment to check in with yourself.',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    priority: 'medium',
    actions: [
      { label: 'Check In', action: () => console.log('Check in'), style: 'primary' },
      { label: 'Snooze', action: () => console.log('Snooze'), style: 'secondary' },
    ],
  },
  {
    id: '2',
    type: 'support',
    title: 'Volunteer Sarah is Available',
    message: 'Your matched volunteer is online and ready to chat.',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
    priority: 'high',
    metadata: { sender: 'Sarah Thompson' },
    actions: [
      { label: 'Start Chat', action: () => console.log('Start chat'), style: 'primary' },
    ],
  },
  {
    id: '3',
    type: 'success',
    title: '7-Day Streak! 🎉',
    message: 'You\'ve completed your safety check-ins for 7 days straight!',
    timestamp: new Date(Date.now() - 86400000),
    read: true,
    priority: 'low',
  },
];

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userId,
  onNotificationClick,
  className,
}) => {
  const { emotionalState, urgencyLevel } = useEmotionTheme();
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    vibration: true,
    desktop: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    channels: {
      crisis: true,
      support: true,
      checkIn: true,
      'check-in': true,
      reminder: true,
      success: true,
      info: true,
      escalation: true,
    },
    urgencyThreshold: 'all',
  });
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && preferences.desktop) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [preferences.desktop]);

  // Play notification sound
  const playSound = useCallback((type: NotificationType) => {
    if (!preferences.sound) return;
    
    // Different sounds for different types (using Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different notification types
    const frequencies: Record<NotificationType, number> = {
      crisis: 880,      // High pitch for urgency
      support: 440,     // Medium pitch
      'check-in': 330,  // Lower pitch
      reminder: 392,    // G note
      success: 523,     // C note (pleasant)
      info: 294,        // D note
      escalation: 659,  // E note (attention-grabbing)
    };
    
    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [preferences.sound]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((pattern: number[]) => {
    if (!preferences.vibration) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [preferences.vibration]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (!preferences.desktop) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    const desktopNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png', // App icon
      badge: '/badge-72x72.png',  // Badge icon
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: !preferences.sound,
    });
    
    desktopNotif.onclick = () => {
      window.focus();
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    };
  }, [preferences.desktop, preferences.sound, onNotificationClick]);

  // Check if in quiet hours
  const isQuietHours = useCallback((): boolean => {
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
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [preferences.quietHours]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Check if should alert user
    if (preferences.enabled && preferences.channels[notification.type]) {
      const shouldAlert = 
        (preferences.urgencyThreshold === 'all') ||
        (preferences.urgencyThreshold === 'high' && ['high', 'urgent'].includes(notification.priority)) ||
        (preferences.urgencyThreshold === 'urgent' && notification.priority === 'urgent');
      
      if (shouldAlert && !isQuietHours()) {
        playSound(notification.type);
        
        // Haptic patterns based on priority
        const hapticPatterns: Record<string, number[]> = {
          urgent: [200, 100, 200, 100, 200], // SOS pattern
          high: [200, 100, 200],
          medium: [200],
          low: [100],
        };
        triggerHaptic(hapticPatterns[notification.priority]);
        
        showDesktopNotification(newNotification);
      }
    }
    
    return newNotification;
  }, [preferences, isQuietHours, playSound, triggerHaptic, showDesktopNotification]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Delete specific notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, React.ElementType> = {
      crisis: AlertCircle,
      support: MessageSquare,
      'check-in': Heart,
      reminder: Clock,
      success: CheckCircle,
      info: Info,
      escalation: Zap,
    };
    return icons[type] || Info;
  };

  // Get color for notification type
  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      crisis: 'text-red-600 bg-red-100',
      support: 'text-blue-600 bg-blue-100',
      'check-in': 'text-purple-600 bg-purple-100',
      reminder: 'text-yellow-600 bg-yellow-100',
      success: 'text-green-600 bg-green-100',
      info: 'text-gray-600 bg-gray-100',
      escalation: 'text-orange-600 bg-orange-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  // Simulate incoming notifications based on emotional state
  useEffect(() => {
    if (urgencyLevel === 'immediate') {
      const timer = setTimeout(() => {
        addNotification({
          type: 'crisis',
          title: 'Crisis Support Available',
          message: 'We noticed you might need immediate support. Help is available 24/7.',
          priority: 'urgent',
          actions: [
            { label: 'Get Help Now', action: () => window.location.href = 'tel:988', style: 'danger' },
          ],
          persistent: true,
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [urgencyLevel, addNotification]);

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            showPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          {preferences.enabled ? (
            <Bell className="w-6 h-6" />
          ) : (
            <BellOff className="w-6 h-6" />
          )}
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className={cn(
            'absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50',
            className
          )}>
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    aria-label="Settings"
                  >
                    <Activity className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enabled</span>
                    <input
                      type="checkbox"
                      checked={preferences.enabled}
                      onChange={(e) => setPreferences(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sound</span>
                    <input
                      type="checkbox"
                      checked={preferences.sound}
                      onChange={(e) => setPreferences(prev => ({ ...prev, sound: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vibration</span>
                    <input
                      type="checkbox"
                      checked={preferences.vibration}
                      onChange={(e) => setPreferences(prev => ({ ...prev, vibration: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Desktop Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.desktop}
                      onChange={(e) => setPreferences(prev => ({ ...prev, desktop: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    We'll notify you when something important happens
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                        !notification.read && 'bg-blue-50'
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (onNotificationClick) {
                          onNotificationClick(notification);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          getNotificationColor(notification.type)
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              {notification.metadata?.sender && (
                                <p className="text-xs text-gray-500 mt-1">
                                  From: {notification.metadata.sender}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.action();
                                  }}
                                  className={cn(
                                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                                    action.style === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                                    action.style === 'secondary' && 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                                    action.style === 'danger' && 'bg-red-600 text-white hover:bg-red-700'
                                  )}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Panel Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={clearAll}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear all notifications
                </button>
              </div>
            )}

            {/* Free Platform Reminder */}
            <div className="px-4 py-2 bg-green-50 text-center">
              <p className="text-xs text-green-700">
                All notifications are FREE • No premium features
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications (for urgent ones) */}
      <NotificationToast notifications={notifications.filter(n => n.priority === 'urgent' && !n.read)} />
    </>
  );
};

// Toast notification component for urgent alerts
const NotificationToast: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 3).map((notification) => {
        const Icon = AlertCircle;
        return (
          <div
            key={notification.id}
            className="bg-red-600 text-white rounded-lg shadow-xl p-4 min-w-[300px] animate-pulse"
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-red-100 mt-1">{notification.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;