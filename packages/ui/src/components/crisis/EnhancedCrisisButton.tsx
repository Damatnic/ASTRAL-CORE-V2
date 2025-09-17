import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, Heart, AlertCircle, Shield, Zap, Users, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../design-tokens/tokens';

interface EnhancedCrisisButtonProps {
  variant?: 'emergency' | 'chat' | 'call' | 'safety' | 'tether' | 'immediate';
  size?: 'small' | 'medium' | 'large' | 'hero' | 'panic';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  pulseAnimation?: boolean;
  hapticFeedback?: boolean;
  confirmationRequired?: boolean;
  countdown?: number; // seconds before auto-action
  children?: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const EnhancedCrisisButton: React.FC<EnhancedCrisisButtonProps> = ({
  variant = 'emergency',
  size = 'large',
  urgency = 'medium',
  pulseAnimation = true,
  hapticFeedback = true,
  confirmationRequired = false,
  countdown = 0,
  children,
  onClick,
  onLongPress,
  ariaLabel,
  className,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(countdown);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout>();
  const countdownTimer = useRef<NodeJS.Timeout>();

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdownActive && timeRemaining > 0) {
      countdownTimer.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCountdownActive(false);
            handleConfirmedAction();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [countdownActive, timeRemaining]);

  // Trigger haptic feedback
  const triggerHaptic = (pattern: number[] = [50]) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = () => {
    triggerHaptic([100, 50, 100]); // Double vibration for confirmation
    if (onClick) onClick();
    setShowConfirmation(false);
    setCountdownActive(false);
    setTimeRemaining(countdown);
  };

  // Handle initial click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipple({ x, y });
    triggerHaptic();
    
    if (confirmationRequired) {
      setShowConfirmation(true);
      if (countdown > 0) {
        setCountdownActive(true);
        setTimeRemaining(countdown);
      }
    } else {
      handleConfirmedAction();
    }
    
    setTimeout(() => setRipple(null), 600);
  };

  // Handle long press
  const handleMouseDown = () => {
    if (disabled || !onLongPress) return;

    longPressTimer.current = setTimeout(() => {
      triggerHaptic([200]); // Longer vibration for long press
      if (onLongPress) onLongPress();
    }, 1000); // 1 second long press
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Get variant-specific props
  const getVariantProps = () => {
    switch (variant) {
      case 'emergency':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: 'Emergency Help',
          baseColor: 'from-red-600 to-red-700',
          hoverColor: 'hover:from-red-700 hover:to-red-800',
          ringColor: 'focus:ring-red-500',
          shadowColor: 'shadow-red-500/25',
          glowColor: 'shadow-red-500/50',
          defaultAriaLabel: 'Get emergency crisis help immediately',
        };
      case 'immediate':
        return {
          icon: <Zap className="w-6 h-6" />,
          text: 'Immediate Help',
          baseColor: 'from-orange-600 to-red-600',
          hoverColor: 'hover:from-orange-700 hover:to-red-700',
          ringColor: 'focus:ring-orange-500',
          shadowColor: 'shadow-orange-500/25',
          glowColor: 'shadow-orange-500/50',
          defaultAriaLabel: 'Get immediate crisis assistance',
        };
      case 'chat':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          text: 'Crisis Chat',
          baseColor: 'from-blue-600 to-blue-700',
          hoverColor: 'hover:from-blue-700 hover:to-blue-800',
          ringColor: 'focus:ring-blue-500',
          shadowColor: 'shadow-blue-500/25',
          glowColor: 'shadow-blue-500/50',
          defaultAriaLabel: 'Start crisis chat support',
        };
      case 'call':
        return {
          icon: <Phone className="w-6 h-6" />,
          text: 'Call 988',
          baseColor: 'from-green-600 to-green-700',
          hoverColor: 'hover:from-green-700 hover:to-green-800',
          ringColor: 'focus:ring-green-500',
          shadowColor: 'shadow-green-500/25',
          glowColor: 'shadow-green-500/50',
          defaultAriaLabel: 'Call 988 crisis hotline',
        };
      case 'safety':
        return {
          icon: <Shield className="w-6 h-6" />,
          text: 'Safety Plan',
          baseColor: 'from-purple-600 to-purple-700',
          hoverColor: 'hover:from-purple-700 hover:to-purple-800',
          ringColor: 'focus:ring-purple-500',
          shadowColor: 'shadow-purple-500/25',
          glowColor: 'shadow-purple-500/50',
          defaultAriaLabel: 'Access your safety plan',
        };
      case 'tether':
        return {
          icon: <Users className="w-6 h-6" />,
          text: 'Connect Tether',
          baseColor: 'from-teal-600 to-teal-700',
          hoverColor: 'hover:from-teal-700 hover:to-teal-800',
          ringColor: 'focus:ring-teal-500',
          shadowColor: 'shadow-teal-500/25',
          glowColor: 'shadow-teal-500/50',
          defaultAriaLabel: 'Connect with peer support',
        };
      default:
        return {
          icon: <Heart className="w-6 h-6" />,
          text: 'Get Help',
          baseColor: 'from-red-600 to-red-700',
          hoverColor: 'hover:from-red-700 hover:to-red-800',
          ringColor: 'focus:ring-red-500',
          shadowColor: 'shadow-red-500/25',
          glowColor: 'shadow-red-500/50',
          defaultAriaLabel: 'Get crisis help',
        };
    }
  };

  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm min-h-[44px] min-w-[120px]';
      case 'medium':
        return 'px-6 py-3 text-base min-h-[48px] min-w-[140px]';
      case 'large':
        return 'px-8 py-4 text-lg min-h-[56px] min-w-[160px]';
      case 'hero':
        return 'px-10 py-5 text-xl min-h-[64px] min-w-[200px]';
      case 'panic':
        return 'px-12 py-6 text-2xl min-h-[80px] min-w-[240px]';
      default:
        return 'px-8 py-4 text-lg min-h-[56px] min-w-[160px]';
    }
  };

  // Get urgency-specific effects
  const getUrgencyEffects = () => {
    switch (urgency) {
      case 'critical':
        return {
          animation: 'animate-pulse',
          glow: 'shadow-2xl',
          border: 'ring-4 ring-white ring-opacity-60',
        };
      case 'high':
        return {
          animation: pulseAnimation ? 'animate-pulse' : '',
          glow: 'shadow-xl',
          border: 'ring-2 ring-white ring-opacity-40',
        };
      case 'medium':
        return {
          animation: '',
          glow: 'shadow-lg',
          border: '',
        };
      default:
        return {
          animation: '',
          glow: 'shadow-md',
          border: '',
        };
    }
  };

  const variantProps = getVariantProps();
  const sizeClasses = getSizeClasses();
  const urgencyEffects = getUrgencyEffects();

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">
              Confirm Crisis Action
            </h3>
            
            <p className="text-gray-600">
              Are you sure you want to {variantProps.text.toLowerCase()}?
            </p>

            {countdownActive && (
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold text-orange-600">
                  Auto-activating in {timeRemaining}s
                </span>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setCountdownActive(false);
                  setTimeRemaining(countdown);
                }}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedAction}
                className={cn(
                  "flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all",
                  `bg-gradient-to-r ${variantProps.baseColor} ${variantProps.hoverColor}`
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center',
        'font-semibold text-white',
        'rounded-2xl transition-all duration-300 ease-out',
        'transform hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-offset-2',
        
        // Size classes
        sizeClasses,
        
        // Variant colors and effects
        `bg-gradient-to-r ${variantProps.baseColor}`,
        variantProps.hoverColor,
        variantProps.ringColor,
        
        // Urgency effects
        urgencyEffects.animation,
        urgencyEffects.glow,
        urgencyEffects.border,
        variantProps.shadowColor,
        
        // Hover effects
        `hover:${variantProps.glowColor}`,
        'hover:-translate-y-1',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed transform-none hover:scale-100',
        
        // Custom classes
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      aria-label={ariaLabel || variantProps.defaultAriaLabel}
      role="button"
      tabIndex={0}
      disabled={disabled}
    >
      {/* Ripple Effect */}
      {ripple && (
        <span
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            clipPath: 'inset(0)',
          }}
        >
          <span
            className="absolute bg-white/30 rounded-full"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
              animation: 'ripple 0.6s linear',
            }}
          />
        </span>
      )}

      {/* Button Content */}
      <span className="relative flex items-center justify-center space-x-3 z-10">
        <span className="flex-shrink-0">
          {variantProps.icon}
        </span>
        <span className="flex-1 text-center">
          {children || variantProps.text}
        </span>
      </span>

      {/* Emergency indicator */}
      {(variant === 'emergency' || variant === 'immediate') && urgency === 'critical' && (
        <span className="absolute -top-1 -right-1">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        </span>
      )}

      {/* Long press indicator */}
      {onLongPress && (
        <span className="absolute bottom-1 right-1 text-xs opacity-75">
          Hold
        </span>
      )}
    </button>
  );
};

export default EnhancedCrisisButton;