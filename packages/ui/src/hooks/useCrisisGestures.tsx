import { useEffect, useRef, useState, useCallback } from 'react';

interface GestureConfig {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  onShake?: () => void;
  onDoubleTap?: () => void;
  onPinch?: () => void;
  onSpread?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Crisis-optimized gesture controls for mobile devices
 * Enables quick access to emergency features through intuitive gestures
 */
export const useCrisisGestures = (config: GestureConfig) => {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onLongPress,
    onShake,
    onDoubleTap,
    onPinch,
    onSpread,
    threshold = 50,
    longPressDelay = 500,
  } = config;

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  
  const touchStartRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const lastShakeRef = useRef<number>(0);
  const pinchStartDistanceRef = useRef<number | null>(null);

  // Swipe detection
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        timestamp: Date.now(),
      };

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
          setLastGesture('longPress');
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
        }, longPressDelay);
      }

      // Double tap detection
      const now = Date.now();
      if (onDoubleTap && now - lastTapRef.current < 300) {
        onDoubleTap();
        setLastGesture('doubleTap');
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }

    // Pinch/Spread detection
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistanceRef.current = distance;
    }
  }, [onLongPress, onDoubleTap, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch/spread
    if (e.touches.length === 2 && pinchStartDistanceRef.current) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const delta = currentDistance - pinchStartDistanceRef.current;
      
      if (Math.abs(delta) > threshold) {
        if (delta > 0 && onSpread) {
          onSpread();
          setLastGesture('spread');
        } else if (delta < 0 && onPinch) {
          onPinch();
          setLastGesture('pinch');
        }
        pinchStartDistanceRef.current = currentDistance;
      }
    }
  }, [onPinch, onSpread, threshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Detect swipe
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.timestamp;

      // Quick swipe detection (within 500ms)
      if (deltaTime < 500) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0 && onSwipeRight) {
              onSwipeRight();
              setLastGesture('swipeRight');
            } else if (deltaX < 0 && onSwipeLeft) {
              onSwipeLeft();
              setLastGesture('swipeLeft');
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0 && onSwipeDown) {
              onSwipeDown();
              setLastGesture('swipeDown');
            } else if (deltaY < 0 && onSwipeUp) {
              onSwipeUp();
              setLastGesture('swipeUp');
            }
          }
        }
      }

      touchStartRef.current = null;
    }

    pinchStartDistanceRef.current = null;
  }, [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, threshold]);

  // Shake detection using DeviceMotion API
  useEffect(() => {
    if (!onShake) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x = 0, y = 0, z = 0 } = event.acceleration || {};
      
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      const threshold = 15; // Sensitivity threshold
      const now = Date.now();

      if ((deltaX > threshold || deltaY > threshold || deltaZ > threshold) && 
          now - lastShakeRef.current > 1000) {
        onShake();
        setLastGesture('shake');
        lastShakeRef.current = now;
        
        // Emergency haptic pattern
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [onShake]);

  // Touch event listeners
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isGestureActive,
    lastGesture,
  };
};

/**
 * Crisis Gesture Provider Component
 * Wraps the app to provide gesture controls for crisis features
 */
interface CrisisGestureProviderProps {
  children: React.ReactNode;
  onEmergency?: () => void;
  onQuickHelp?: () => void;
  onPanicMode?: () => void;
}

export const CrisisGestureProvider: React.FC<CrisisGestureProviderProps> = ({
  children,
  onEmergency,
  onQuickHelp,
  onPanicMode,
}) => {
  const [gestureHint, setGestureHint] = useState<string | null>(null);
  const [panicModeActive, setPanicModeActive] = useState(false);

  const { lastGesture } = useCrisisGestures({
    onSwipeUp: () => {
      // Swipe up for quick crisis help
      setGestureHint('Quick Help Activated');
      if (onQuickHelp) onQuickHelp();
      setTimeout(() => setGestureHint(null), 2000);
    },
    onSwipeDown: () => {
      // Swipe down to minimize/calm interface
      setGestureHint('Interface Minimized');
      setTimeout(() => setGestureHint(null), 2000);
    },
    onLongPress: () => {
      // Long press for emergency SOS
      setGestureHint('Emergency SOS Activated');
      if (onEmergency) onEmergency();
      if ('vibrate' in navigator) {
        // SOS pattern: ... --- ...
        navigator.vibrate([100, 100, 100, 100, 100, 300, 200, 100, 200, 100, 200, 300, 100, 100, 100, 100, 100]);
      }
    },
    onShake: () => {
      // Shake for panic mode
      setPanicModeActive(true);
      setGestureHint('Panic Mode Activated');
      if (onPanicMode) onPanicMode();
      setTimeout(() => {
        setPanicModeActive(false);
        setGestureHint(null);
      }, 3000);
    },
    onDoubleTap: () => {
      // Double tap to confirm safety
      setGestureHint('Safety Check');
      setTimeout(() => setGestureHint(null), 2000);
    },
    onPinch: () => {
      // Pinch to reduce text size/simplify
      document.documentElement.style.fontSize = '14px';
      setGestureHint('Text Size Reduced');
      setTimeout(() => setGestureHint(null), 2000);
    },
    onSpread: () => {
      // Spread to increase text size for accessibility
      document.documentElement.style.fontSize = '18px';
      setGestureHint('Text Size Increased');
      setTimeout(() => setGestureHint(null), 2000);
    },
  });

  return (
    <div className="relative min-h-screen">
      {/* Gesture Hint Overlay */}
      {gestureHint && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`
            px-6 py-3 rounded-full shadow-lg text-white font-medium
            animate-pulse transition-all
            ${panicModeActive ? 'bg-red-600' : 'bg-blue-600'}
          `}>
            {gestureHint}
          </div>
        </div>
      )}

      {/* Panic Mode Overlay */}
      {panicModeActive && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl pointer-events-auto">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Emergency Mode Active</h2>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = 'tel:911'}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold"
                >
                  Call 911
                </button>
                <button
                  onClick={() => window.location.href = 'tel:988'}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Call 988 Crisis Line
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {children}

      {/* Gesture Guide (shown once on first visit) */}
      <GestureGuide />
    </div>
  );
};

// Gesture Guide Component
const GestureGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGestureGuide');
    if (!hasSeenGuide && 'ontouchstart' in window) {
      setTimeout(() => setShowGuide(true), 2000);
    }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('hasSeenGestureGuide', 'true');
  };

  if (!showGuide) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Crisis Gesture Controls</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">↑</div>
            <span>Swipe up for quick help</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">👆</div>
            <span>Long press for emergency SOS</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">📱</div>
            <span>Shake for panic mode</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">👆👆</div>
            <span>Double tap for safety check</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">🤏</div>
            <span>Pinch/Spread to adjust text</span>
          </div>
        </div>
        <button
          onClick={dismissGuide}
          className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default useCrisisGestures;