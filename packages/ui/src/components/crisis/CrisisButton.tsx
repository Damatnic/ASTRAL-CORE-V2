import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Heart, AlertCircle } from 'lucide-react';
import { tokens } from '../../design-tokens/tokens';
import { cn } from '../../lib/utils';

interface CrisisButtonProps {
  variant?: 'emergency' | 'chat' | 'call' | 'help';
  size?: 'small' | 'medium' | 'large' | 'hero';
  pulseAnimation?: boolean;
  hapticFeedback?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export const CrisisButton: React.FC<CrisisButtonProps> = ({
  variant = 'emergency',
  size = 'large',
  pulseAnimation = true,
  hapticFeedback = true,
  children,
  onClick,
  ariaLabel,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  // Trigger haptic feedback
  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Handle click with ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipple({ x, y });
    triggerHaptic();
    
    if (onClick) onClick();
    
    setTimeout(() => setRipple(null), 600);
  };

  // Get variant-specific props
  const getVariantProps = () => {
    switch (variant) {
      case 'emergency':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: 'Emergency Help',
          color: 'bg-gradient-to-r from-red-600 to-red-700',
          hoverColor: 'hover:from-red-700 hover:to-red-800',
          ringColor: 'focus:ring-red-500',
          defaultAriaLabel: 'Get emergency crisis help immediately',
        };
      case 'chat':
        return {
          icon: <MessageCircle className="w-6 h-6" />,
          text: 'Crisis Chat',
          color: 'bg-gradient-to-r from-blue-600 to-blue-700',
          hoverColor: 'hover:from-blue-700 hover:to-blue-800',
          ringColor: 'focus:ring-blue-500',
          defaultAriaLabel: 'Start crisis chat support',
        };
      case 'call':
        return {
          icon: <Phone className="w-6 h-6" />,
          text: 'Call 988',
          color: 'bg-gradient-to-r from-green-600 to-green-700',
          hoverColor: 'hover:from-green-700 hover:to-green-800',
          ringColor: 'focus:ring-green-500',
          defaultAriaLabel: 'Call 988 crisis hotline',
        };
      case 'help':
        return {
          icon: <Heart className="w-6 h-6" />,
          text: 'Get Help',
          color: 'bg-gradient-to-r from-purple-600 to-purple-700',
          hoverColor: 'hover:from-purple-700 hover:to-purple-800',
          ringColor: 'focus:ring-purple-500',
          defaultAriaLabel: 'Access crisis support resources',
        };
      default:
        return {
          icon: <Heart className="w-6 h-6" />,
          text: 'Get Help',
          color: 'bg-gradient-to-r from-red-600 to-red-700',
          hoverColor: 'hover:from-red-700 hover:to-red-800',
          ringColor: 'focus:ring-red-500',
          defaultAriaLabel: 'Get crisis help',
        };
    }
  };

  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm min-h-[44px]';
      case 'medium':
        return 'px-6 py-3 text-base min-h-[48px]';
      case 'large':
        return 'px-8 py-4 text-lg min-h-[56px]';
      case 'hero':
        return 'px-10 py-5 text-xl min-h-[64px]';
      default:
        return 'px-8 py-4 text-lg min-h-[56px]';
    }
  };

  const variantProps = getVariantProps();
  const sizeClasses = getSizeClasses();

  return (
    <button
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center',
        'font-semibold text-white',
        'rounded-full shadow-lg',
        'transition-all duration-200 ease-out',
        'transform active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-offset-2',
        
        // Size classes
        sizeClasses,
        
        // Variant colors
        variantProps.color,
        variantProps.hoverColor,
        variantProps.ringColor,
        
        // Hover elevation
        'hover:shadow-xl hover:-translate-y-0.5',
        
        // Pulse animation
        pulseAnimation && variant === 'emergency' && 'animate-pulse',
        
        // Custom classes
        className
      )}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel || variantProps.defaultAriaLabel}
      role="button"
      tabIndex={0}
    >
      {/* Ripple Effect */}
      {ripple && (
        <span
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            clipPath: 'inset(0)',
          }}
        >
          <span
            className="absolute bg-white/30 rounded-full animate-ripple"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
            }}
          />
        </span>
      )}

      {/* Button Content */}
      <span className="relative flex items-center justify-center space-x-3 z-10">
        {variantProps.icon}
        <span>{children || variantProps.text}</span>
      </span>

      {/* Emergency indicator dot */}
      {variant === 'emergency' && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </span>
      )}
    </button>
  );
};

// Quick Access Crisis Bar
interface CrisisBarProps {
  position?: 'top' | 'bottom';
  alwaysVisible?: boolean;
  className?: string;
}

export const CrisisBar: React.FC<CrisisBarProps> = ({
  position = 'top',
  alwaysVisible = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!alwaysVisible) {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
        setLastScrollY(currentScrollY);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [alwaysVisible, lastScrollY]);

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50',
        'bg-gradient-to-r from-red-600 to-red-700',
        'shadow-lg transition-transform duration-300',
        position === 'top' ? 'top-0' : 'bottom-0',
        !isVisible && (position === 'top' ? '-translate-y-full' : 'translate-y-full'),
        className
      )}
      role="region"
      aria-label="Crisis support quick access bar"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-white">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-sm font-medium">24/7 Crisis Support Available</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <a
              href="tel:988"
              className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              aria-label="Call 988 crisis hotline"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 988
            </a>
            <a
              href="sms:741741"
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              aria-label="Text HOME to 741741"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Text 741741
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisButton;