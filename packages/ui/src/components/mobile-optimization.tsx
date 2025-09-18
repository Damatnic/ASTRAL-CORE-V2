import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

// Viewport Detection and Management
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      });
    };

    const updateSafeArea = () => {
      if (typeof CSS !== 'undefined' && CSS.supports('padding: env(safe-area-inset-top)')) {
        const style = getComputedStyle(document.documentElement);
        setSafeArea({
          top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
          bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
          left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
          right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
        });
      }
    };

    updateViewport();
    updateSafeArea();

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => {
      // Delay to allow browser to update dimensions
      setTimeout(updateViewport, 100);
    });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return {
    ...viewport,
    safeArea,
    isMobile: viewport.width < 768,
    isTablet: viewport.width >= 768 && viewport.width < 1024,
    isDesktop: viewport.width >= 1024,
    isPortrait: viewport.orientation === 'portrait',
    isLandscape: viewport.orientation === 'landscape',
    aspectRatio: viewport.width / viewport.height
  };
};

// Touch Gesture Detection Hook
export const useTouchGestures = (
  element: React.RefObject<HTMLElement>,
  options: {
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onPinch?: (scale: number) => void;
    onTap?: () => void;
    onDoubleTap?: () => void;
    onLongPress?: () => void;
    threshold?: number;
    longPressDelay?: number;
  } = {}
) => {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options;

  const [touchState, setTouchState] = useState<{
    startX: number;
    startY: number;
    startTime: number;
    lastTap: number;
    longPressTimer: NodeJS.Timeout | null;
  } | null>(null);

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      
      // Clear any existing long press timer
      if (touchState?.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }

      const newState = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
        lastTap: touchState?.lastTap || 0,
        longPressTimer: null as NodeJS.Timeout | null
      };

      // Set up long press detection
      if (onLongPress) {
        newState.longPressTimer = setTimeout(() => {
          onLongPress();
          // Provide haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
        }, longPressDelay);
      }

      setTouchState(newState);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchState.startX);
      const deltaY = Math.abs(touch.clientY - touchState.startY);

      // Cancel long press if finger moves too much
      if ((deltaX > 10 || deltaY > 10) && touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        setTouchState(prev => prev ? { ...prev, longPressTimer: null } : null);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchState) return;

      // Clear long press timer
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const deltaTime = Date.now() - touchState.startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Detect swipes
      if (distance > threshold && deltaTime < 500) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
      // Detect taps
      else if (distance < 20 && deltaTime < 300) {
        const now = Date.now();
        const timeSinceLastTap = now - touchState.lastTap;

        if (timeSinceLastTap < 300 && onDoubleTap) {
          // Double tap
          onDoubleTap();
          setTouchState(prev => prev ? { ...prev, lastTap: 0 } : null);
        } else {
          // Single tap
          onTap?.();
          setTouchState(prev => prev ? { ...prev, lastTap: now } : null);
        }
      }

      // Reset touch state after a delay
      setTimeout(() => {
        setTouchState(null);
      }, 100);
    };

    // Handle pinch gestures
    const handleTouchStartPinch = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
          Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        
        (el as any)._initialPinchDistance = distance;
      }
    };

    const handleTouchMovePinch = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch && (el as any)._initialPinchDistance) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
          Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        
        const scale = distance / (el as any)._initialPinchDistance;
        onPinch(scale);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    if (onPinch) {
      el.addEventListener('touchstart', handleTouchStartPinch, { passive: false });
      el.addEventListener('touchmove', handleTouchMovePinch, { passive: false });
    }

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      
      if (onPinch) {
        el.removeEventListener('touchstart', handleTouchStartPinch);
        el.removeEventListener('touchmove', handleTouchMovePinch);
      }

      if (touchState?.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }
    };
  }, [element, touchState, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onPinch, onTap, onDoubleTap, onLongPress, threshold, longPressDelay]);

  return touchState;
};

// Mobile-Optimized Input Component
export interface MobileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  variant?: 'default' | 'crisis' | 'success';
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  helperText,
  icon,
  clearable = false,
  onClear,
  variant = 'default',
  className,
  value,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useViewport();

  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    crisis: 'border-crisis-300 focus:border-crisis-500 focus:ring-crisis-500',
    success: 'border-success-300 focus:border-success-500 focus:ring-success-500'
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    onClear?.();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          className={cn(
            'block w-full rounded-lg border px-3 py-3 text-base placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'touch-manipulation',
            icon && 'pl-10',
            clearable && value && 'pr-10',
            error ? 'border-crisis-300 focus:border-crisis-500 focus:ring-crisis-500' : variantClasses[variant],
            isMobile && 'min-h-[44px] text-[16px]', // Prevent zoom on iOS
            className
          )}
          value={value}
          {...props}
        />
        
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label="Clear input"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-crisis-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Pull-to-Refresh Component
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY || containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, refreshThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setStartY(0);
  };

  const pullProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldTriggerRefresh = pullDistance >= refreshThreshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200 bg-primary-50 z-10',
          pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'
        )}
        style={{
          height: `${Math.min(pullDistance, refreshThreshold)}px`,
          transform: `translateY(${pullDistance > 0 ? pullDistance - refreshThreshold : -refreshThreshold}px)`
        }}
      >
        <div className="flex items-center space-x-2 text-primary-600">
          <div
            className={cn(
              'w-6 h-6 border-2 border-primary-600 rounded-full transition-transform duration-200',
              isRefreshing ? 'animate-spin border-t-transparent' : '',
              shouldTriggerRefresh ? 'rotate-180' : `rotate-${Math.floor(pullProgress * 180)}`
            )}
            style={{
              transform: isRefreshing 
                ? 'rotate(0deg)' 
                : `rotate(${Math.floor(pullProgress * 180)}deg)`
            }}
          >
            {!isRefreshing && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[6px] border-l-transparent border-r-transparent border-b-primary-600" />
              </div>
            )}
          </div>
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : shouldTriggerRefresh 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Mobile-Optimized Modal
export interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false,
  className
}) => {
  const { isMobile } = useViewport();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative flex items-end sm:items-center justify-center min-h-full p-0 sm:p-4',
        fullScreen || isMobile ? 'items-stretch' : ''
      )}>
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white shadow-xl transition-all',
            fullScreen || isMobile 
              ? 'h-full rounded-none' 
              : 'max-w-lg rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-hidden',
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 safe-area-inset-top">
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'overflow-y-auto',
            fullScreen || isMobile ? 'flex-1 pb-safe-area' : 'max-h-[calc(90vh-4rem)]'
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};