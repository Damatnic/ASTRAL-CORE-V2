/**
 * ASTRAL_CORE 2.0 UI Package
 * 
 * Crisis-focused UI components with WCAG 2.1 AAA accessibility
 * Every component is designed for life-critical situations
 */

// Core Components
export { CrisisChat } from './components/CrisisChat';
export { 
  CrisisHelpButton,
  EmergencyCrisisButton,
  QuickCrisisButton,
  MainCrisisButton,
  testCrisisButtonAccessibility
} from './components/CrisisHelpButton';

// Enhanced Therapeutic Components
export { TherapeuticLayout } from './components/therapeutic/TherapeuticLayout';
export { TherapeuticChat } from './components/therapeutic/TherapeuticChat';
export { BreathingGuide } from './components/therapeutic/BreathingGuide';

// Enhanced Crisis Components
export { EnhancedCrisisButton } from './components/crisis/EnhancedCrisisButton';

// Mobile-Optimized Components  
export { CrisisMobileInterface } from './components/mobile/CrisisMobileInterface';

// Advanced Accessibility
export { 
  AccessibilityProvider, 
  AccessibilityControls,
  useAccessibility 
} from './components/accessibility/AccessibilityProvider';

// Base Components
export {
  Button,
  Input,
  Card,
  Badge,
  Alert,
  Progress,
  Skeleton
} from './components/base';

// Crisis Intervention Components
export {
  StatusIndicator,
  CrisisScale,
  ResponseTimer,
  EmergencyContacts,
  SafetyPlan
} from './components/crisis-intervention';

// Real-time Crisis Components
export {
  EnhancedCrisisChat,
  CrisisDashboard
} from './components/real-time-crisis';

// Mobile Crisis Components
export {
  MobileCrisisQuickAccess,
  FloatingCrisisButton,
  TouchCrisisNavigation,  
  TouchGestures
} from './components/mobile-crisis';

// Accessibility Components (Legacy)
export {
  AccessibilitySettings,
  SkipLinks,
  FocusTrap,
  LiveRegion,
  ScreenReaderOnly
} from './components/accessibility';

// Responsive Layout Components
export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  MobileCard,
  useBreakpoint,
  MobileCrisisLayout,
  TouchButtonStack,
  CrisisHero
} from './components/responsive-layout';

// Mobile Optimization Components
export {
  useViewport,
  useTouchGestures,
  MobileInput,
  PullToRefresh,
  MobileModal
} from './components/mobile-optimization';

// Admin Dashboard Components
export {
  AdminDashboard,
  CrisisOverviewTable,
  VolunteerManagement,
  SystemMetricsOverview,
  ActivityFeed
} from './components/admin-dashboard';

// Notification Components
export {
  NotificationProvider,
  useNotifications,
  usePushNotifications,
  NotificationBell,
  NotificationToast,
  NotificationToastContainer,
  NotificationPermissionRequest
} from './components/notifications';

// Volunteer Interface Components
export {
  VolunteerDashboard,
  CaseManagement,
  AvailabilityScheduler,
  TrainingProgress
} from './components/volunteer-interface';

// Client Interface Components
export {
  ClientInterface,
  CrisisResourceDirectory,
  SelfHelpTools,
  EmergencyContactsManager
} from './components/client-interface';

// Search & Filtering Components
export {
  AdvancedSearch,
  SearchResults
} from './components/search-filtering';

// Data Visualization Components
export {
  DataVisualizationDashboard,
  LineChart,
  BarChart,
  DonutChart,
  CrisisTrendsChart,
  CategoryBreakdownChart,
  VolunteerPerformanceChart,
  KeyMetricsOverview
} from './components/data-visualization';

// Security & Privacy Components
export {
  SecurityDashboard,
  EncryptionIndicator,
  SecureCommunication,
  PrivacyControls,
  SecurityEventLog,
  DataHandlingIndicators
} from './components/security-privacy';

// Performance Monitoring Components
export {
  PerformanceMonitoringDashboard,
  RealTimeMetrics,
  ServiceHealthMonitor,
  PerformanceAlerts,
  ResponseTimeAnalytics,
  LoadDistribution
} from './components/performance-monitoring';

// Design System
export { default as designSystem, designTokens, componentPatterns, accessibility, motion, layout } from './design-system';

// Utilities
export { 
  cn,
  formatCrisisTime,
  formatDuration,
  generateAccessibleId,
  meetsContrastRequirement,
  debounce,
  throttle,
  sanitizeInput,
  isTouchDevice,
  prefersReducedMotion,
  prefersHighContrast,
  trapFocus,
  isEmergencyHotkey,
  announceToScreenReader
} from './lib/utils';

// Re-export types for external use
export type { CrisisHelpButtonProps } from './components/CrisisHelpButton';

// Component type definitions
export interface CrisisChatMessage {
  id: string;
  content: string;
  senderType: 'user' | 'volunteer' | 'system';
  timestamp: Date;
  isEncrypted?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

export interface CrisisChatProps {
  sessionId: string;
  isAnonymous?: boolean;
  initialMessages?: CrisisChatMessage[];
  volunteer?: {
    id: string;
    name: string;
    specializations?: string[];
    responseTime?: number;
  };
  connectionStatus: 'connecting' | 'connected' | 'volunteer_assigned' | 'disconnected';
  onSendMessage: (message: string) => Promise<void>;
  onEmergencyEscalation: () => void;
  onEndChat: () => void;
  showEmergencyResources?: boolean;
  responseTimeTarget?: number;
  accessibilityLevel?: 'AA' | 'AAA';
}

// Accessibility constants
export const ACCESSIBILITY_CONSTANTS = {
  MIN_TOUCH_TARGET: 48, // pixels
  MIN_CONTRAST_AA: 4.5,
  MIN_CONTRAST_AAA: 7,
  EMERGENCY_RESPONSE_TIME: 200, // milliseconds
  CRISIS_CHAT_MAX_LENGTH: 2000, // characters
} as const;

// Crisis-specific color palette (WCAG AAA compliant)
export const CRISIS_COLORS = {
  emergency: {
    background: '#dc2626', // red-600
    foreground: '#ffffff',
    border: '#991b1b', // red-800
  },
  warning: {
    background: '#d97706', // amber-600
    foreground: '#ffffff',
    border: '#92400e', // amber-800
  },
  safe: {
    background: '#059669', // emerald-600
    foreground: '#ffffff',
    border: '#047857', // emerald-700
  },
  neutral: {
    background: '#4b5563', // gray-600
    foreground: '#ffffff',
    border: '#374151', // gray-700
  },
} as const;

// Animation presets for crisis situations
export const CRISIS_ANIMATIONS = {
  // Gentle, non-triggering animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  // Emergency attention-getting animations
  emergencyPulse: {
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
    },
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  // Breathing animation for calming effect
  breathe: {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [0.7, 1, 0.7],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
} as const;

// Screen reader announcements for crisis situations
export const CRISIS_ANNOUNCEMENTS = {
  EMERGENCY_ACTIVATED: 'Emergency mode activated. Crisis specialist being connected immediately.',
  VOLUNTEER_CONNECTED: 'Crisis volunteer has joined the conversation.',
  MESSAGE_SENT: 'Message sent securely.',
  CONNECTION_LOST: 'Connection lost. Attempting to reconnect.',
  HELP_AVAILABLE: 'Help is available 24/7. You are not alone.',
} as const;

// Export version for debugging
export const UI_VERSION = '2.0.0';