'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Volume2, VolumeX, Type, Contrast, 
  Mouse, Keyboard, Focus, Accessibility, Settings
} from 'lucide-react';

// Accessibility Context
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlindFriendly: boolean;
  soundEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  cursorSize: 'normal' | 'large' | 'extra-large';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  announceToScreenReader: (message: string) => void;
  focusElement: (element: HTMLElement) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// Accessibility Provider
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    colorBlindFriendly: false,
    soundEnabled: false,
    fontSize: 'medium',
    cursorSize: 'normal'
  });

  const screenReaderRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('astral_accessibility_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast
      }));
    }
  }, []);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Reduced motion
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    
    // Large text
    root.classList.toggle('large-text', settings.largeText);
    
    // Color blind friendly
    root.classList.toggle('color-blind-friendly', settings.colorBlindFriendly);
    
    // Font size
    root.setAttribute('data-font-size', settings.fontSize);
    
    // Cursor size
    root.setAttribute('data-cursor-size', settings.cursorSize);
    
    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Save settings
    localStorage.setItem('astral_accessibility_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message: string) => {
    if (screenReaderRef.current) {
      screenReaderRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (screenReaderRef.current) {
          screenReaderRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const focusElement = (element: HTMLElement) => {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        announceToScreenReader,
        focusElement
      }}
    >
      {children}
      
      {/* Screen reader announcements */}
      <div
        ref={screenReaderRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
}

// Hook to use accessibility
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Accessibility Control Panel
export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        announceToScreenReader('Accessibility panel closed');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, announceToScreenReader]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    const newValue = !settings[key];
    updateSetting(key, newValue);
    announceToScreenReader(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
  };

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          announceToScreenReader(isOpen ? 'Accessibility panel closed' : 'Accessibility panel opened');
        }}
        className="fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Accessibility className="w-5 h-5" />
      </button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 id="accessibility-title" className="text-xl font-bold text-gray-900 dark:text-white">
                    Accessibility Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close accessibility settings"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Visual Settings */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Visual
                    </h3>
                    
                    <div className="space-y-4">
                      <ToggleSetting
                        label="High Contrast"
                        description="Increase color contrast for better visibility"
                        checked={settings.highContrast}
                        onChange={() => toggleSetting('highContrast')}
                        icon={Contrast}
                      />
                      
                      <ToggleSetting
                        label="Large Text"
                        description="Increase text size throughout the app"
                        checked={settings.largeText}
                        onChange={() => toggleSetting('largeText')}
                        icon={Type}
                      />
                      
                      <ToggleSetting
                        label="Color Blind Friendly"
                        description="Adjust colors for color vision deficiency"
                        checked={settings.colorBlindFriendly}
                        onChange={() => toggleSetting('colorBlindFriendly')}
                        icon={Eye}
                      />

                      {/* Font Size Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Font Size
                        </label>
                        <select
                          value={settings.fontSize}
                          onChange={(e) => updateSetting('fontSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Motion Settings */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                      <Focus className="w-5 h-5 mr-2" />
                      Motion & Focus
                    </h3>
                    
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Reduce Motion"
                        description="Minimize animations and transitions"
                        checked={settings.reducedMotion}
                        onChange={() => toggleSetting('reducedMotion')}
                        icon={Focus}
                      />
                      
                      <ToggleSetting
                        label="Enhanced Focus"
                        description="Show clear focus indicators for navigation"
                        checked={settings.focusVisible}
                        onChange={() => toggleSetting('focusVisible')}
                        icon={Focus}
                      />
                    </div>
                  </section>

                  {/* Input Settings */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                      <Mouse className="w-5 h-5 mr-2" />
                      Input
                    </h3>
                    
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Keyboard Navigation"
                        description="Enable full keyboard navigation support"
                        checked={settings.keyboardNavigation}
                        onChange={() => toggleSetting('keyboardNavigation')}
                        icon={Keyboard}
                      />

                      {/* Cursor Size */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cursor Size
                        </label>
                        <select
                          value={settings.cursorSize}
                          onChange={(e) => updateSetting('cursorSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Audio Settings */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                      <Volume2 className="w-5 h-5 mr-2" />
                      Audio
                    </h3>
                    
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Sound Effects"
                        description="Enable audio feedback for interactions"
                        checked={settings.soundEnabled}
                        onChange={() => toggleSetting('soundEnabled')}
                        icon={settings.soundEnabled ? Volume2 : VolumeX}
                      />
                      
                      <ToggleSetting
                        label="Screen Reader Support"
                        description="Enhanced compatibility with screen readers"
                        checked={settings.screenReader}
                        onChange={() => toggleSetting('screenReader')}
                        icon={Volume2}
                      />
                    </div>
                  </section>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      const defaultSettings: AccessibilitySettings = {
                        highContrast: false,
                        reducedMotion: false,
                        largeText: false,
                        screenReader: false,
                        keyboardNavigation: true,
                        focusVisible: true,
                        colorBlindFriendly: false,
                        soundEnabled: false,
                        fontSize: 'medium',
                        cursorSize: 'normal'
                      };
                      Object.keys(defaultSettings).forEach(key => {
                        updateSetting(key as keyof AccessibilitySettings, defaultSettings[key as keyof AccessibilitySettings]);
                      });
                      announceToScreenReader('Accessibility settings reset to defaults');
                    }}
                    className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ElementType;
}

function ToggleSetting({ label, description, checked, onChange, icon: Icon }: ToggleSettingProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 pt-1">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Skip Navigation Component
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Keyboard Navigation Helper
export function KeyboardNavigationHelper() {
  const [showHelp, setShowHelp] = useState(false);
  const { settings } = useAccessibility();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard help with Ctrl+/
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
      
      // Hide help with Escape
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [settings.keyboardNavigation, showHelp]);

  if (!settings.keyboardNavigation) return null;

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-50 max-w-sm"
        >
          <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Tab</kbd> Navigate forward</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Shift+Tab</kbd> Navigate backward</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Enter</kbd> Activate button/link</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Space</kbd> Toggle checkbox</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Escape</kbd> Close modal/menu</div>
            <div><kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+/</kbd> Toggle this help</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Focus Trap Component
interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
