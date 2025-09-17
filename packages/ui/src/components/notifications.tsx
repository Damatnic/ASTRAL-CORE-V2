'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Card, Button, Badge, Alert } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { designTokens } from '../design-system';

// Notification Types
interface NotificationBase {
  id: string;
  type: 'crisis_alert' | 'volunteer_request' | 'system_update' | 'emergency' | 'escalation' | 'assignment' | 'resolution';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionable: boolean;
  data?: Record<string, any>;
}

interface CrisisNotification extends NotificationBase {
  type: 'crisis_alert' | 'emergency' | 'escalation';
  crisisId: string;
  clientId: string;
  location?: string;
  category: string;
}

interface VolunteerNotification extends NotificationBase {
  type: 'volunteer_request' | 'assignment';
  volunteerId?: string;
  crisisId?: string;
  requiredSkills?: string[];
}

interface SystemNotification extends NotificationBase {
  type: 'system_update' | 'resolution';
  severity?: 'info' | 'warning' | 'error';
}

type Notification = CrisisNotification | VolunteerNotification | SystemNotification;

// Notification Context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Push Notification API Integration
interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export const usePushNotifications = () => {
  const [permission, setPaermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPaermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPaermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported]);

  const sendNotification = useCallback(async (options: PushNotificationOptions) => {
    if (!supported || permission !== 'granted') return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/crisis-icon-192.png',
        badge: options.badge || '/icons/crisis-badge-72.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions || []
      });
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }, [supported, permission]);

  return {
    supported,
    permission,
    requestPermission,
    sendNotification
  };
};

// Notification Provider Component
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  autoRemoveDelay?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 50,
  autoRemoveDelay = 300000 // 5 minutes
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { sendNotification } = usePushNotifications();

  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    } as Notification;

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      
      // Send push notification for high priority alerts
      if (notification.priority === 'critical' || notification.priority === 'high') {
        sendNotification({
          title: notification.title,
          body: notification.message,
          tag: notification.type,
          requireInteraction: notification.priority === 'critical',
          vibrate: notification.priority === 'critical' ? [300, 100, 300, 100, 300] : [200, 100, 200]
        });
      }

      return updated;
    });

    // Auto-remove notification after delay for non-critical notifications
    if (notification.priority !== 'critical' && autoRemoveDelay > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, autoRemoveDelay);
    }
  }, [maxNotifications, autoRemoveDelay, sendNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const subscribeToUpdates = useCallback(() => {
    // This would typically connect to WebSocket or SSE
    console.log('Subscribing to real-time notification updates');
  }, []);

  const unsubscribeFromUpdates = useCallback(() => {
    // This would typically disconnect from WebSocket or SSE
    console.log('Unsubscribing from real-time notification updates');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component
interface NotificationBellProps {
  className?: string;
  showBadge?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  showBadge = true,
  onNotificationClick
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return designTokens.colors.crisis.critical;
      case 'high': return designTokens.colors.crisis.high;
      case 'medium': return designTokens.colors.crisis.medium;
      default: return designTokens.colors.crisis.low;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'crisis_alert':
      case 'emergency':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'volunteer_request':
      case 'assignment':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'escalation':
        return (
          <div className="p-2 bg-orange-100 rounded-full">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'resolution':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13 3L4 14h7v7l9-11h-7V3z" />
        </svg>
        
        {showBadge && unreadCount > 0 && (
          <Badge
            variant="custom"
            className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: designTokens.colors.crisis.critical }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Notification Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13 3L4 14h7v7l9-11h-7V3z" />
                  </svg>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                        !notification.read ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationClick(notification);
                        }
                      }}
                    >
                      <div className="flex space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            <Badge
                              variant="custom"
                              className="ml-2 text-xs text-white"
                              style={{ backgroundColor: getPriorityColor(notification.priority) }}
                            >
                              {notification.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Notification Toast Component
interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification, action: string) => void;
  autoHide?: boolean;
  hideDelay?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
  autoHide = true,
  hideDelay = 5000
}) => {
  useEffect(() => {
    if (autoHide && notification.priority !== 'critical') {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.priority, autoHide, hideDelay, onDismiss]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Alert
      variant="default"
      className={`mb-4 border-l-4 ${getPriorityColor(notification.priority)} bg-white shadow-lg`}
      role="alert"
      aria-live={notification.priority === 'critical' ? 'assertive' : 'polite'}
    >
      <div className="flex">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(notification.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="ml-4 flex flex-col space-y-2">
          {notification.actionable && onAction && (
            <Button
              size="sm"
              onClick={() => onAction(notification, 'primary')}
              className="text-xs"
            >
              Respond
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );
};

// Notification Toast Container
interface NotificationToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5
}) => {
  const { notifications, removeNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    // Show only high priority notifications as toasts
    const highPriorityNotifications = notifications.filter(
      n => (n.priority === 'critical' || n.priority === 'high') && !n.read
    ).slice(0, maxToasts);
    
    setVisibleToasts(highPriorityNotifications);
  }, [notifications, maxToasts]);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      default: return 'top-4 right-4';
    }
  };

  const handleAction = (notification: Notification, action: string) => {
    console.log('Notification action:', { notification, action });
    // This would handle specific notification actions
    removeNotification(notification.id);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses(position)} z-50 w-96 max-w-full`}>
      <LiveRegion>
        {visibleToasts.length > 0 && `${visibleToasts.length} new high priority notifications`}
      </LiveRegion>
      
      <div className="space-y-2">
        {visibleToasts.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
};

// Permission Request Component
export const NotificationPermissionRequest: React.FC = () => {
  const { supported, permission, requestPermission } = usePushNotifications();
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  if (!supported || permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <Alert variant="destructive" className="mb-4">
        <h4 className="font-medium">Notifications Blocked</h4>
        <p className="text-sm mt-1">
          You have blocked notifications. To receive critical crisis alerts, please enable notifications in your browser settings.
        </p>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="mb-4">
      <h4 className="font-medium">Enable Crisis Notifications</h4>
      <p className="text-sm mt-1 mb-3">
        Stay informed about critical crisis situations and volunteer requests. We'll only send important notifications.
      </p>
      <Button 
        onClick={handleRequest} 
        disabled={requesting}
        size="sm"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        {requesting ? 'Requesting...' : 'Enable Notifications'}
      </Button>
    </Alert>
  );
};

export default NotificationProvider;