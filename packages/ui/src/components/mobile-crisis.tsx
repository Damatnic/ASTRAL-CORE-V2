import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button, Badge, Alert, Progress } from './base';
import { EmergencyContacts, SafetyPlan, StatusIndicator } from './crisis-intervention';

// Mobile Crisis Quick Access Panel
export interface MobileCrisisQuickAccessProps {
  emergencyContacts?: {
    id: string;
    name: string;
    number: string;
    type: 'crisis_line' | 'emergency' | 'family' | 'friend' | 'therapist';
  }[];
  onEmergencyCall: (contactId: string) => void;
  onStartChat: () => void;
  onAccessSafetyPlan: () => void;
  isInCrisis?: boolean;
  className?: string;
}

export const MobileCrisisQuickAccess: React.FC<MobileCrisisQuickAccessProps> = ({
  emergencyContacts = [],
  onEmergencyCall,
  onStartChat,
  onAccessSafetyPlan,
  isInCrisis = false,
  className
}) => {
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(isInCrisis);
  const [breathingMode, setBreathingMode] = useState(false);
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Breathing exercise timer
  useEffect(() => {
    if (!breathingMode) return;

    const phases = [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 4000 },
      { phase: 'exhale', duration: 6000 }
    ] as const;

    let currentPhaseIndex = 0;
    
    const runPhase = () => {
      const currentPhase = phases[currentPhaseIndex];
      setBreathePhase(currentPhase.phase);
      
      setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        runPhase();
      }, currentPhase.duration);
    };

    runPhase();
  }, [breathingMode]);

  const getBreathingInstruction = () => {
    switch (breathePhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out slowly...';
    }
  };

  const getBreathingCircleScale = () => {
    switch (breathePhase) {
      case 'inhale': return 'scale-125';
      case 'hold': return 'scale-125';
      case 'exhale': return 'scale-100';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Emergency Alert Bar */}
      {isInCrisis && (
        <Alert variant="crisis" className="animate-pulse">
          <div className="flex items-center justify-between">
            <span className="font-medium">🚨 Crisis Mode Active</span>
            <Button
              size="sm"
              variant="crisis"
              onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
            >
              {showEmergencyPanel ? 'Hide' : 'Show'} Help
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Crisis Actions */}
      <div className="grid grid-cols-1 gap-3">
        {/* Emergency Call Button */}
        <Button
          variant="crisis"
          size="xl"
          onClick={() => onEmergencyCall('crisis-line')}
          className="h-16 text-lg font-semibold shadow-crisis-glow"
        >
          <span className="mr-3 text-2xl">🆘</span>
          Call Crisis Hotline Now
        </Button>

        {/* Start Chat Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onStartChat}
          className="h-14 text-base"
        >
          <span className="mr-2 text-xl">💬</span>
          Start Crisis Chat
        </Button>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            size="md"
            onClick={onAccessSafetyPlan}
            className="h-12 text-sm"
          >
            <span className="mr-1">📋</span>
            Safety Plan
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setBreathingMode(!breathingMode)}
            className="h-12 text-sm"
          >
            <span className="mr-1">🧘</span>
            {breathingMode ? 'Stop' : 'Breathe'}
          </Button>
        </div>
      </div>

      {/* Breathing Exercise */}
      {breathingMode && (
        <div className="bg-gradient-to-br from-primary-50 to-success-50 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Breathing Exercise</h3>
            
            <div className="flex justify-center">
              <div
                className={cn(
                  'w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-success-400 transition-transform duration-[4000ms] ease-in-out',
                  getBreathingCircleScale()
                )}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-700">
                {getBreathingInstruction()}
              </p>
              <Badge variant="default" size="sm">
                4-4-6 Breathing Pattern
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBreathingMode(false)}
            >
              Stop Exercise
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Contacts Panel */}
      {(showEmergencyPanel || isInCrisis) && (
        <div className="bg-white border border-crisis-200 rounded-lg p-4">
          <EmergencyContacts
            contacts={emergencyContacts}
            onCall={onEmergencyCall}
          />
        </div>
      )}

      {/* Location-based Emergency Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          📍 Local Emergency Resources
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>Emergency Services: 911</div>
          <div>Crisis Text Line: Text HOME to 741741</div>
          <div>National Suicide Prevention Lifeline: 988</div>
        </div>
      </div>
    </div>
  );
};

// Floating Crisis Action Button (for always-available access)
export interface FloatingCrisisButtonProps {
  onActivate: () => void;
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const FloatingCrisisButton: React.FC<FloatingCrisisButtonProps> = ({
  onActivate,
  isVisible = true,
  position = 'bottom-right',
  className
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  // Emergency hotkey detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + H for help
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        onActivate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);

  // Periodic pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 30000); // Pulse every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={onActivate}
      className={cn(
        'fixed z-50 w-16 h-16 bg-crisis-600 hover:bg-crisis-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-crisis-300 focus:ring-offset-2',
        'flex items-center justify-center text-2xl',
        isPulsing && 'animate-pulse shadow-crisis-glow',
        positionClasses[position],
        className
      )}
      aria-label="Emergency Crisis Help (Ctrl+Shift+H)"
      title="Need immediate help? Click here or press Ctrl+Shift+H"
    >
      🆘
    </button>
  );
};

// Touch-optimized Crisis Navigation
export interface TouchCrisisNavigationProps {
  currentSection: 'chat' | 'safety' | 'contacts' | 'resources';
  onSectionChange: (section: 'chat' | 'safety' | 'contacts' | 'resources') => void;
  hasActiveChat?: boolean;
  emergencyMode?: boolean;
  className?: string;
}

export const TouchCrisisNavigation: React.FC<TouchCrisisNavigationProps> = ({
  currentSection,
  onSectionChange,
  hasActiveChat = false,
  emergencyMode = false,
  className
}) => {
  const navigationItems = [
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: '💬',
      description: 'Crisis support chat',
      badge: hasActiveChat
    },
    {
      id: 'safety' as const,
      label: 'Safety',
      icon: '🛡️',
      description: 'Safety plan & coping tools'
    },
    {
      id: 'contacts' as const,
      label: 'Contacts',
      icon: '📞',
      description: 'Emergency contacts',
      urgent: emergencyMode
    },
    {
      id: 'resources' as const,
      label: 'Resources',
      icon: '📚',
      description: 'Help resources & info'
    }
  ];

  return (
    <nav className={cn('bg-white border-t border-gray-200 safe-area-inset-bottom', className)}>
      <div className="grid grid-cols-4">
        {navigationItems.map((item) => {
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 min-h-[68px] transition-colors duration-200',
                'focus:outline-none focus:bg-gray-100',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                item.urgent && 'animate-pulse'
              )}
              aria-label={item.description}
            >
              <div className="relative mb-1">
                <span className="text-xl">{item.icon}</span>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-crisis-500 rounded-full animate-pulse" />
                )}
                {item.urgent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-crisis-500 rounded-full" />
                )}
              </div>
              <span className={cn(
                'text-xs font-medium leading-tight text-center',
                isActive && 'text-primary-600'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Crisis-specific Touch Gestures Handler
export interface TouchGesturesProps {
  onEmergencySwipe?: () => void;
  onPanicTap?: () => void;
  onCalmingHold?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const TouchGestures: React.FC<TouchGesturesProps> = ({
  onEmergencySwipe,
  onPanicTap,
  onCalmingHold,
  children,
  className
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startTime = Date.now();
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: startTime
    });

    // Start hold timer
    const timer = setTimeout(() => {
      onCalmingHold?.();
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }, 2000);
    
    setHoldTimer(timer);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Emergency swipe detection (fast upward swipe)
    if (deltaY < -100 && Math.abs(deltaX) < 50 && deltaTime < 500) {
      onEmergencySwipe?.();
      // Strong haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      return;
    }

    // Panic tap detection (multiple quick taps)
    if (distance < 20 && deltaTime < 300) {
      setTapCount(prev => {
        const newCount = prev + 1;
        
        // Reset tap count after 2 seconds
        setTimeout(() => setTapCount(0), 2000);
        
        // Trigger panic on 4 quick taps
        if (newCount >= 4) {
          onPanicTap?.();
          // Panic haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50, 30, 50, 30, 50]);
          }
          return 0;
        }
        
        return newCount;
      });
    }

    setTouchStart(null);
  };

  return (
    <div
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {/* Visual feedback for gestures */}
      {tapCount > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Badge variant="warning" size="sm">
            Quick taps: {tapCount}/4 for panic alert
          </Badge>
        </div>
      )}
    </div>
  );
};