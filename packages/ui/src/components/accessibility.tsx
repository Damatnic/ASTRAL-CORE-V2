import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { cn } from '../lib/utils';
import { Button } from './base';

// Accessibility Context for global settings
interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  announcements: boolean;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setAnnouncements: (enabled: boolean) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// Accessibility Provider Component
export interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [announcements, setAnnouncements] = useState(true);

  // Detect user preferences on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for system preferences
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setHighContrast(prefersHighContrast);
    setReducedMotion(prefersReducedMotion);

    // Check for stored preferences
    const storedPrefs = localStorage.getItem('astral-accessibility-prefs');
    if (storedPrefs) {
      try {
        const prefs = JSON.parse(storedPrefs);
        setHighContrast(prefs.highContrast ?? prefersHighContrast);
        setReducedMotion(prefs.reducedMotion ?? prefersReducedMotion);
        setLargeText(prefs.largeText ?? false);
        setScreenReaderMode(prefs.screenReaderMode ?? false);
        setKeyboardNavigation(prefs.keyboardNavigation ?? false);
        setAnnouncements(prefs.announcements ?? true);
      } catch (e) {
        console.warn('Failed to parse accessibility preferences');
      }
    }

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefs = {
        highContrast,
        reducedMotion,
        largeText,
        screenReaderMode,
        keyboardNavigation,
        announcements
      };
      localStorage.setItem('astral-accessibility-prefs', JSON.stringify(prefs));
    }
  }, [highContrast, reducedMotion, largeText, screenReaderMode, keyboardNavigation, announcements]);

  // Apply global styles based on preferences
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // High contrast theme
      if (highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      // Large text
      if (largeText) {
        root.classList.add('large-text');
      } else {
        root.classList.remove('large-text');
      }

      // Reduced motion
      if (reducedMotion) {
        root.classList.add('reduced-motion');
      } else {
        root.classList.remove('reduced-motion');
      }

      // Screen reader mode
      if (screenReaderMode) {
        root.classList.add('screen-reader-mode');
      } else {
        root.classList.remove('screen-reader-mode');
      }

      // Keyboard navigation indicators
      if (keyboardNavigation) {
        root.classList.add('keyboard-navigation');
      } else {
        root.classList.remove('keyboard-navigation');
      }
    }
  }, [highContrast, largeText, reducedMotion, screenReaderMode, keyboardNavigation]);

  // Screen reader announcement function
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcements || typeof document === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      announcer.textContent = message;
      
      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }, 100);
  };

  const contextValue: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    largeText,
    screenReaderMode,
    keyboardNavigation,
    announcements,
    setHighContrast,
    setReducedMotion,
    setLargeText,
    setScreenReaderMode,
    setKeyboardNavigation,
    setAnnouncements,
    announce
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Settings Panel
export interface AccessibilitySettingsProps {
  onClose?: () => void;
  className?: string;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  onClose,
  className
}) => {
  const {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    largeText,
    setLargeText,
    screenReaderMode,
    setScreenReaderMode,
    announcements,
    setAnnouncements,
    announce
  } = useAccessibility();

  const handleToggle = (setting: string, currentValue: boolean, setter: (value: boolean) => void) => {
    const newValue = !currentValue;
    setter(newValue);
    announce(`${setting} ${newValue ? 'enabled' : 'disabled'}`, 'polite');
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6 space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Accessibility Settings</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close accessibility settings"
          >
            ✕
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
              High Contrast Mode
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Increases contrast for better visibility
            </p>
          </div>
          <button
            id="high-contrast"
            role="switch"
            aria-checked={highContrast}
            onClick={() => handleToggle('High contrast mode', highContrast, setHighContrast)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              highContrast ? 'bg-primary-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                highContrast ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
              Reduce Motion
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Minimizes animations and transitions
            </p>
          </div>
          <button
            id="reduced-motion"
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => handleToggle('Reduced motion', reducedMotion, setReducedMotion)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              reducedMotion ? 'bg-primary-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="large-text" className="text-sm font-medium text-gray-700">
              Large Text
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Increases text size for better readability
            </p>
          </div>
          <button
            id="large-text"
            role="switch"
            aria-checked={largeText}
            onClick={() => handleToggle('Large text', largeText, setLargeText)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              largeText ? 'bg-primary-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                largeText ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Screen Reader Mode */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="screen-reader-mode" className="text-sm font-medium text-gray-700">
              Screen Reader Optimized
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Optimizes interface for screen readers
            </p>
          </div>
          <button
            id="screen-reader-mode"
            role="switch"
            aria-checked={screenReaderMode}
            onClick={() => handleToggle('Screen reader mode', screenReaderMode, setScreenReaderMode)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              screenReaderMode ? 'bg-primary-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                screenReaderMode ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Announcements */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="announcements" className="text-sm font-medium text-gray-700">
              Screen Reader Announcements
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enables helpful screen reader announcements
            </p>
          </div>
          <button
            id="announcements"
            role="switch"
            aria-checked={announcements}
            onClick={() => handleToggle('Screen reader announcements', announcements, setAnnouncements)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              announcements ? 'bg-primary-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                announcements ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Alt + A</kbd> Open accessibility settings</div>
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl + Shift + H</kbd> Emergency help</div>
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> Navigate between elements</div>
          <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Escape</kbd> Close dialogs</div>
        </div>
      </div>
    </div>
  );
};

// Skip Links for keyboard navigation
export interface SkipLinksProps {
  links?: {
    href: string;
    label: string;
  }[];
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#crisis-help', label: 'Skip to emergency help' }
  ],
  className
}) => {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="absolute top-0 left-0 bg-primary-600 text-white px-4 py-2 rounded-br z-50 focus:block focus:relative"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
              (target as HTMLElement).focus();
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// Focus Trap Component
export interface FocusTrapProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  active,
  children,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Let parent handle escape key
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Live Region for screen reader announcements
export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  className
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
};

// Screen Reader Only Text
export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  className
}) => {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
};