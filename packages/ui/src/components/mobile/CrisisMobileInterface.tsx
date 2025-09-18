import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, Shield, Heart, Zap, Navigation, Volume2, Wifi, WifiOff, Battery } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../design-tokens/tokens';

interface CrisisMobileInterfaceProps {
  emergencyMode?: boolean;
  oneHandedMode?: boolean;
  showNetworkStatus?: boolean;
  enableGestures?: boolean;
  onEmergencyCall?: () => void;
  onCrisisChat?: () => void;
  onSafetyPlan?: () => void;
  onLocationShare?: () => void;
  className?: string;
}

export const CrisisMobileInterface: React.FC<CrisisMobileInterfaceProps> = ({
  emergencyMode = false,
  oneHandedMode = false,
  showNetworkStatus = true,
  enableGestures = true,
  onEmergencyCall,
  onCrisisChat,
  onSafetyPlan,
  onLocationShare,
  className,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [gestureStartY, setGestureStartY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor battery level (if supported)
  useEffect(() => {
    if ('navigator' in window && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        const updateBattery = () => setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', updateBattery);
        
        return () => battery.removeEventListener('levelchange', updateBattery);
      });
    }
  }, []);

  // Gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableGestures) return;
    setGestureStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableGestures || gestureStartY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = gestureStartY - currentY;
    
    if (Math.abs(deltaY) > 50) {
      setSwipeDirection(deltaY > 0 ? 'up' : 'down');
    }
  };

  const handleTouchEnd = () => {
    if (!enableGestures) return;
    
    if (swipeDirection === 'up') {
      setShowQuickActions(true);
    } else if (swipeDirection === 'down' && showQuickActions) {
      setShowQuickActions(false);
    }
    
    setGestureStartY(0);
    setSwipeDirection(null);
  };

  // Emergency shake detection
  useEffect(() => {
    if (!enableGestures || !emergencyMode) return undefined;

    let shakeCount = 0;
    let lastShake = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      const acceleration = Math.sqrt(x! * x! + y! * y! + z! * z!);

      if (acceleration > 15) {
        const now = Date.now();
        if (now - lastShake > 100) {
          shakeCount++;
          lastShake = now;

          if (shakeCount >= 3) {
            // Trigger emergency action
            if (onEmergencyCall) onEmergencyCall();
            shakeCount = 0;
          }
        }
      }

      // Reset shake count after timeout
      setTimeout(() => {
        shakeCount = Math.max(0, shakeCount - 1);
      }, 1000);
    };

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => window.removeEventListener('devicemotion', handleDeviceMotion);
    }
    return undefined;
  }, [enableGestures, emergencyMode, onEmergencyCall]);

  const CrisisAction = ({ 
    icon: Icon, 
    label, 
    color, 
    urgency = 'normal',
    onClick,
    disabled = false 
  }: {
    icon: React.ComponentType<any>;
    label: string;
    color: string;
    urgency?: 'normal' | 'high' | 'critical';
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles optimized for mobile touch
        'flex flex-col items-center justify-center space-y-2',
        'rounded-2xl shadow-lg transform transition-all duration-200',
        'min-h-[80px] min-w-[80px] p-4',
        'focus:outline-none focus:ring-4 focus:ring-offset-2',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Color and urgency styling
        color,
        
        // Urgency-specific effects
        urgency === 'critical' && 'animate-pulse ring-4 ring-white ring-opacity-60',
        urgency === 'high' && 'shadow-xl',
        
        // One-handed mode adjustments
        oneHandedMode && 'min-h-[72px] min-w-[72px] p-3',
        
        // Emergency mode styling
        emergencyMode && 'border-2 border-white/30'
      )}
      aria-label={label}
    >
      <Icon className={cn(
        'w-8 h-8 text-white',
        oneHandedMode && 'w-6 h-6'
      )} />
      <span className={cn(
        'text-xs font-medium text-white text-center leading-tight',
        oneHandedMode && 'text-[10px]'
      )}>
        {label}
      </span>
    </button>
  );

  return (
    <div 
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 bg-gradient-to-b',
        emergencyMode 
          ? 'from-red-600 to-red-800' 
          : 'from-blue-600 to-blue-800',
        'flex flex-col',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status Bar */}
      {showNetworkStatus && (
        <div className="flex items-center justify-between px-4 py-2 bg-black/20">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-white" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" />
            )}
            <span className="text-xs text-white/80">
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Battery className={cn(
              'w-4 h-4',
              batteryLevel > 20 ? 'text-white' : 'text-yellow-300'
            )} />
            <span className="text-xs text-white/80">{batteryLevel}%</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-8 text-center">
        <div className={cn(
          'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
          'bg-white/20 backdrop-blur-sm border border-white/30'
        )}>
          <Heart className="w-8 h-8 text-white animate-pulse" />
        </div>
        
        <h1 className={cn(
          'text-2xl font-bold text-white mb-2',
          oneHandedMode && 'text-xl'
        )}>
          {emergencyMode ? 'Emergency Support' : 'Crisis Support'}
        </h1>
        
        <p className={cn(
          'text-white/80 text-sm leading-relaxed max-w-xs mx-auto',
          oneHandedMode && 'text-xs max-w-[200px]'
        )}>
          {emergencyMode 
            ? 'Immediate help is available. Tap any button below or shake your phone.'
            : 'You\'re not alone. Help is here when you need it.'
          }
        </p>

        {/* Gesture hint */}
        {enableGestures && !showQuickActions && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-white/60">
            <div className="w-8 h-1 bg-white/40 rounded-full animate-pulse" />
            <span className="text-xs">Swipe up for more options</span>
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="flex-1 px-6 pb-8">
        <div className={cn(
          'grid gap-4 max-w-sm mx-auto',
          oneHandedMode ? 'grid-cols-2' : 'grid-cols-1 space-y-2'
        )}>
          {/* Emergency Call */}
          <CrisisAction
            icon={Phone}
            label="Call 988"
            color="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            urgency={emergencyMode ? 'critical' : 'high'}
            onClick={onEmergencyCall}
          />

          {/* Crisis Chat */}
          <CrisisAction
            icon={MessageCircle}
            label="Crisis Chat"
            color="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            urgency="high"
            onClick={onCrisisChat}
            disabled={!isOnline}
          />

          {/* Safety Plan */}
          <CrisisAction
            icon={Shield}
            label="Safety Plan"
            color="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            urgency="normal"
            onClick={onSafetyPlan}
          />

          {/* Share Location */}
          <CrisisAction
            icon={Navigation}
            label="Share Location"
            color="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            urgency="normal"
            onClick={onLocationShare}
          />
        </div>

        {/* Quick Emergency Text */}
        {emergencyMode && (
          <div className="mt-8 text-center">
            <a 
              href="sms:741741"
              className={cn(
                'inline-flex items-center space-x-2 px-6 py-4',
                'bg-white/20 backdrop-blur-sm rounded-xl',
                'text-white border border-white/30',
                'transition-all duration-200 hover:bg-white/30',
                'focus:outline-none focus:ring-2 focus:ring-white'
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Text HOME to 741741</span>
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-black/30 backdrop-blur-md',
          'transform transition-transform duration-300',
          'border-t border-white/20 p-4'
        )}>
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 bg-white/40 rounded-full" />
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10">
              <Volume2 className="w-6 h-6 text-white" />
              <span className="text-xs text-white/80">Audio</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10">
              <Zap className="w-6 h-6 text-white" />
              <span className="text-xs text-white/80">Exercises</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10">
              <Heart className="w-6 h-6 text-white" />
              <span className="text-xs text-white/80">Wellness</span>
            </button>
            
            <button 
              onClick={() => setShowQuickActions(false)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white/10"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white rounded transform rotate-45 absolute" />
                <div className="w-4 h-0.5 bg-white rounded transform -rotate-45 absolute" />
              </div>
              <span className="text-xs text-white/80">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="absolute top-20 left-4 right-4 p-3 bg-yellow-600 rounded-lg text-center">
          <p className="text-white text-sm font-medium">
            You're offline. Emergency calls still work.
          </p>
        </div>
      )}

      {/* Low Battery Warning */}
      {batteryLevel <= 20 && (
        <div className="absolute top-32 left-4 right-4 p-3 bg-orange-600 rounded-lg text-center">
          <p className="text-white text-sm font-medium">
            Low battery. Consider conserving power.
          </p>
        </div>
      )}
    </div>
  );
};

export default CrisisMobileInterface;