import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AccessibilitySettings {
  // Visual settings
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusVisible: boolean;
  
  // Motor accessibility
  largerTargets: boolean;
  stickyFocus: boolean;
  
  // Cognitive accessibility
  simplifiedUI: boolean;
  extendedTimeouts: boolean;
  
  // Audio/Visual
  audioDescriptions: boolean;
  captionsEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
  applyEmergencyAccessibility: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusVisible: true,
  largerTargets: false,
  stickyFocus: false,
  simplifiedUI: false,
  extendedTimeouts: false,
  audioDescriptions: false,
  captionsEnabled: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
  emergencyMode?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  emergencyMode = false,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astral-accessibility-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updateFromSystem = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
      }));
    };

    // Initial check
    updateFromSystem();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateFromSystem);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateFromSystem);
      });
    };
  }, []);

  // Emergency mode override
  useEffect(() => {
    if (emergencyMode) {
      applyEmergencyAccessibility();
    }
  }, [emergencyMode]);

  // Save to localStorage when settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('astral-accessibility-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply CSS custom properties and classes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Remove all accessibility classes first
    body.classList.remove(
      'high-contrast', 'reduced-motion', 'large-text', 'focus-visible',
      'larger-targets', 'sticky-focus', 'simplified-ui'
    );

    // Apply active settings
    if (settings.highContrast) {
      body.classList.add('high-contrast');
      root.style.setProperty('--color-background', '#000000');
      root.style.setProperty('--color-foreground', '#ffffff');
      root.style.setProperty('--color-primary', '#ffff00');
      root.style.setProperty('--color-focus', '#ff0080');
    } else {
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-foreground');
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-focus');
    }

    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    if (settings.largeText) {
      body.classList.add('large-text');
      root.style.setProperty('--font-size-scale', '1.5');
    } else {
      root.style.removeProperty('--font-size-scale');
    }

    if (settings.focusVisible) {
      body.classList.add('focus-visible');
      root.style.setProperty('--focus-ring-width', '3px');
      root.style.setProperty('--focus-ring-offset', '2px');
    }

    if (settings.largerTargets) {
      body.classList.add('larger-targets');
      root.style.setProperty('--touch-target-min', '48px');
    } else {
      root.style.removeProperty('--touch-target-min');
    }

    if (settings.stickyFocus) {
      body.classList.add('sticky-focus');
    }

    if (settings.simplifiedUI) {
      body.classList.add('simplified-ui');
    }

  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const applyEmergencyAccessibility = () => {
    setSettings(prev => ({
      ...prev,
      highContrast: true,
      largeText: true,
      largerTargets: true,
      focusVisible: true,
      simplifiedUI: true,
      extendedTimeouts: true,
      reducedMotion: true,
    }));
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    applyEmergencyAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div className={cn(
        "accessibility-root",
        settings.highContrast && "high-contrast",
        settings.reducedMotion && "reduced-motion",
        settings.largeText && "large-text",
        settings.largerTargets && "larger-targets",
        settings.simplifiedUI && "simplified-ui"
      )}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Accessibility control panel component
interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyMode?: boolean;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isOpen,
  onClose,
  emergencyMode = false,
}) => {
  const { settings, updateSetting, resetSettings, applyEmergencyAccessibility } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close accessibility settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {emergencyMode && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-red-800">Crisis Mode Activated</span>
            </div>
            <p className="text-red-700 text-sm mb-3">
              Emergency accessibility settings are recommended for crisis situations.
            </p>
            <button
              onClick={applyEmergencyAccessibility}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
            >
              Apply Emergency Settings
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Visual Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Visual</h3>
            <div className="space-y-3">
              <AccessibilityToggle
                label="High Contrast"
                description="Increase contrast for better visibility"
                checked={settings.highContrast}
                onChange={(checked) => updateSetting('highContrast', checked)}
              />
              <AccessibilityToggle
                label="Large Text"
                description="Increase text size for easier reading"
                checked={settings.largeText}
                onChange={(checked) => updateSetting('largeText', checked)}
              />
              <AccessibilityToggle
                label="Enhanced Focus"
                description="Make keyboard focus more visible"
                checked={settings.focusVisible}
                onChange={(checked) => updateSetting('focusVisible', checked)}
              />
            </div>
          </div>

          {/* Motor Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Motor</h3>
            <div className="space-y-3">
              <AccessibilityToggle
                label="Larger Touch Targets"
                description="Make buttons and links easier to tap"
                checked={settings.largerTargets}
                onChange={(checked) => updateSetting('largerTargets', checked)}
              />
              <AccessibilityToggle
                label="Sticky Focus"
                description="Keep focus visible longer"
                checked={settings.stickyFocus}
                onChange={(checked) => updateSetting('stickyFocus', checked)}
              />
            </div>
          </div>

          {/* Cognitive Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cognitive</h3>
            <div className="space-y-3">
              <AccessibilityToggle
                label="Simplified Interface"
                description="Reduce visual complexity and distractions"
                checked={settings.simplifiedUI}
                onChange={(checked) => updateSetting('simplifiedUI', checked)}
              />
              <AccessibilityToggle
                label="Extended Timeouts"
                description="Allow more time for interactions"
                checked={settings.extendedTimeouts}
                onChange={(checked) => updateSetting('extendedTimeouts', checked)}
              />
            </div>
          </div>

          {/* Motion Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Motion</h3>
            <div className="space-y-3">
              <AccessibilityToggle
                label="Reduce Motion"
                description="Minimize animations and transitions"
                checked={settings.reducedMotion}
                onChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>
          </div>

          {/* Audio/Visual */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Audio & Captions</h3>
            <div className="space-y-3">
              <AccessibilityToggle
                label="Audio Descriptions"
                description="Enable audio descriptions for visual content"
                checked={settings.audioDescriptions}
                onChange={(checked) => updateSetting('audioDescriptions', checked)}
              />
              <AccessibilityToggle
                label="Captions"
                description="Show captions for audio content"
                checked={settings.captionsEnabled}
                onChange={(checked) => updateSetting('captionsEnabled', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={resetSettings}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

interface AccessibilityToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-300"
        )}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`label-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div
          className={cn(
            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
};

export default AccessibilityProvider;