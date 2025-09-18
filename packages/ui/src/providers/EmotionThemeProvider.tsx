import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokens } from '../design-tokens/tokens';

// Emotion states that affect UI presentation
export type EmotionalState = 
  | 'crisis' 
  | 'distressed' 
  | 'anxious' 
  | 'depressed' 
  | 'calm' 
  | 'hopeful' 
  | 'neutral';

// Urgency levels for intervention
export type UrgencyLevel = 
  | 'immediate' // Requires immediate professional help
  | 'high'      // Needs quick intervention
  | 'moderate'  // Standard support needed
  | 'low'       // Self-help resources sufficient
  | 'stable';   // No immediate concern

interface EmotionTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    border: string;
  };
  spacing: {
    compact: boolean;
    multiplier: number;
  };
  typography: {
    sizeMultiplier: number;
    lineHeightMultiplier: number;
    contrastMode: 'normal' | 'high';
  };
  animations: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
  };
  layout: {
    simplified: boolean;
    focusMode: boolean;
    largeTargets: boolean;
  };
}

interface EmotionThemeContextType {
  emotionalState: EmotionalState;
  urgencyLevel: UrgencyLevel;
  theme: EmotionTheme;
  updateEmotionalState: (state: EmotionalState) => void;
  updateUrgencyLevel: (level: UrgencyLevel) => void;
  detectEmotionalState: (text: string) => EmotionalState;
  getInterventionRecommendation: () => InterventionRecommendation;
}

interface InterventionRecommendation {
  type: 'self-help' | 'peer-support' | 'volunteer' | 'professional' | 'emergency';
  message: string;
  actions: Array<{
    label: string;
    action: string;
    priority: 'primary' | 'secondary';
  }>;
}

const EmotionThemeContext = createContext<EmotionThemeContextType | undefined>(undefined);

// Crisis keywords for emotion detection
const CRISIS_KEYWORDS = {
  immediate: ['suicide', 'kill myself', 'end it all', 'die', 'overdose', 'harm myself'],
  distressed: ['cant take it', 'overwhelming', 'panic', 'terrified', 'desperate'],
  anxious: ['worried', 'nervous', 'scared', 'anxious', 'stress', 'panic'],
  depressed: ['hopeless', 'worthless', 'empty', 'numb', 'depressed', 'sad'],
  calm: ['better', 'okay', 'fine', 'good', 'calm', 'peaceful'],
  hopeful: ['hopeful', 'optimistic', 'improving', 'grateful', 'thankful'],
};

// Generate theme based on emotional state
const generateTheme = (state: EmotionalState, urgency: UrgencyLevel): EmotionTheme => {
  const baseTheme: EmotionTheme = {
    colors: {
      primary: tokens.colors.calm[600],
      secondary: tokens.colors.calm[500],
      background: tokens.colors.neutral[50],
      surface: tokens.colors.neutral[0],
      text: tokens.colors.neutral[900],
      accent: tokens.colors.success[600],
      border: tokens.colors.neutral[200],
    },
    spacing: {
      compact: false,
      multiplier: 1,
    },
    typography: {
      sizeMultiplier: 1,
      lineHeightMultiplier: 1,
      contrastMode: 'normal',
    },
    animations: {
      enabled: true,
      speed: 'normal',
    },
    layout: {
      simplified: false,
      focusMode: false,
      largeTargets: false,
    },
  };

  // Adjust theme based on emotional state
  switch (state) {
    case 'crisis':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.crisis[600],
          secondary: tokens.colors.crisis[500],
          background: tokens.colors.crisis[50],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.crisis[900],
          accent: tokens.colors.crisis[600],
          border: tokens.colors.crisis[200],
        },
        spacing: {
          compact: false,
          multiplier: 1.2, // More breathing room
        },
        typography: {
          sizeMultiplier: 1.1, // Larger text for clarity
          lineHeightMultiplier: 1.3, // More line height
          contrastMode: 'high',
        },
        animations: {
          enabled: false, // Reduce distractions
          speed: 'slow',
        },
        layout: {
          simplified: true, // Simplified interface
          focusMode: true, // Focus on essential elements
          largeTargets: true, // Easier to tap/click
        },
      };

    case 'distressed':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.warning[600],
          secondary: tokens.colors.warning[500],
          background: tokens.colors.warning[50],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.neutral[800],
          accent: tokens.colors.warning[600],
          border: tokens.colors.warning[200],
        },
        spacing: {
          compact: false,
          multiplier: 1.1,
        },
        typography: {
          sizeMultiplier: 1.05,
          lineHeightMultiplier: 1.2,
          contrastMode: 'high',
        },
        animations: {
          enabled: true,
          speed: 'slow',
        },
        layout: {
          simplified: true,
          focusMode: false,
          largeTargets: true,
        },
      };

    case 'anxious':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.emotion.anxiety,
          secondary: tokens.colors.calm[500],
          background: tokens.colors.calm[50],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.neutral[800],
          accent: tokens.colors.calm[600],
          border: tokens.colors.calm[200],
        },
        spacing: {
          compact: false,
          multiplier: 1.1,
        },
        typography: {
          sizeMultiplier: 1,
          lineHeightMultiplier: 1.2,
          contrastMode: 'normal',
        },
        animations: {
          enabled: true,
          speed: 'slow', // Slower, calming animations
        },
        layout: {
          simplified: false,
          focusMode: false,
          largeTargets: false,
        },
      };

    case 'depressed':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.emotion.depression,
          secondary: tokens.colors.emotion.hope,
          background: tokens.colors.neutral[100],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.neutral[700],
          accent: tokens.colors.emotion.hope,
          border: tokens.colors.neutral[300],
        },
        spacing: {
          compact: false,
          multiplier: 1,
        },
        typography: {
          sizeMultiplier: 1,
          lineHeightMultiplier: 1.1,
          contrastMode: 'normal',
        },
        animations: {
          enabled: true,
          speed: 'normal',
        },
        layout: {
          simplified: false,
          focusMode: false,
          largeTargets: false,
        },
      };

    case 'hopeful':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.emotion.hope,
          secondary: tokens.colors.success[500],
          background: tokens.colors.success[50],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.neutral[800],
          accent: tokens.colors.success[600],
          border: tokens.colors.success[200],
        },
        animations: {
          ...baseTheme.animations,
          enabled: true,
          speed: 'normal',
        },
      };

    case 'calm':
      return {
        ...baseTheme,
        colors: {
          primary: tokens.colors.emotion.peaceful,
          secondary: tokens.colors.calm[500],
          background: tokens.colors.neutral[50],
          surface: tokens.colors.neutral[0],
          text: tokens.colors.neutral[800],
          accent: tokens.colors.calm[600],
          border: tokens.colors.neutral[200],
        },
      };

    default:
      return baseTheme;
  }
};

export const EmotionThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('neutral');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('stable');
  const [theme, setTheme] = useState<EmotionTheme>(generateTheme('neutral', 'stable'));

  // Detect emotional state from text input
  const detectEmotionalState = useCallback((text: string): EmotionalState => {
    const lowerText = text.toLowerCase();

    // Check for crisis keywords first (highest priority)
    if (CRISIS_KEYWORDS.immediate.some(keyword => lowerText.includes(keyword))) {
      return 'crisis';
    }

    // Check other emotional states
    if (CRISIS_KEYWORDS.distressed.some(keyword => lowerText.includes(keyword))) {
      return 'distressed';
    }
    if (CRISIS_KEYWORDS.anxious.some(keyword => lowerText.includes(keyword))) {
      return 'anxious';
    }
    if (CRISIS_KEYWORDS.depressed.some(keyword => lowerText.includes(keyword))) {
      return 'depressed';
    }
    if (CRISIS_KEYWORDS.hopeful.some(keyword => lowerText.includes(keyword))) {
      return 'hopeful';
    }
    if (CRISIS_KEYWORDS.calm.some(keyword => lowerText.includes(keyword))) {
      return 'calm';
    }

    return 'neutral';
  }, []);

  // Get intervention recommendation based on current state
  const getInterventionRecommendation = useCallback((): InterventionRecommendation => {
    if (emotionalState === 'crisis' || urgencyLevel === 'immediate') {
      return {
        type: 'emergency',
        message: 'Immediate help is available. You are not alone.',
        actions: [
          { label: 'Call 988 Now', action: 'tel:988', priority: 'primary' },
          { label: 'Text Crisis Line', action: 'sms:741741', priority: 'primary' },
          { label: 'Call 911', action: 'tel:911', priority: 'secondary' },
        ],
      };
    }

    if (emotionalState === 'distressed' || urgencyLevel === 'high') {
      return {
        type: 'professional',
        message: 'Connect with a trained crisis counselor who can help.',
        actions: [
          { label: 'Chat with Counselor', action: 'chat:professional', priority: 'primary' },
          { label: 'Call Hotline', action: 'tel:988', priority: 'secondary' },
        ],
      };
    }

    if (emotionalState === 'anxious' || emotionalState === 'depressed') {
      return {
        type: 'volunteer',
        message: 'Talk to someone who understands and can provide support.',
        actions: [
          { label: 'Connect with Volunteer', action: 'chat:volunteer', priority: 'primary' },
          { label: 'Join Support Group', action: 'group:join', priority: 'secondary' },
        ],
      };
    }

    if (urgencyLevel === 'moderate') {
      return {
        type: 'peer-support',
        message: 'Connect with peers who have similar experiences.',
        actions: [
          { label: 'Peer Chat', action: 'chat:peer', priority: 'primary' },
          { label: 'Browse Resources', action: 'resources:browse', priority: 'secondary' },
        ],
      };
    }

    return {
      type: 'self-help',
      message: 'Explore self-help resources and coping strategies.',
      actions: [
        { label: 'Self-Assessment', action: 'assessment:start', priority: 'primary' },
        { label: 'Coping Techniques', action: 'resources:coping', priority: 'secondary' },
      ],
    };
  }, [emotionalState, urgencyLevel]);

  // Update theme when emotional state changes
  useEffect(() => {
    setTheme(generateTheme(emotionalState, urgencyLevel));
  }, [emotionalState, urgencyLevel]);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color theme
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--emotion-${key}`, value);
    });

    // Apply spacing multiplier
    root.style.setProperty('--spacing-multiplier', theme.spacing.multiplier.toString());

    // Apply typography settings
    root.style.setProperty('--text-size-multiplier', theme.typography.sizeMultiplier.toString());
    root.style.setProperty('--line-height-multiplier', theme.typography.lineHeightMultiplier.toString());

    // Apply animation speed
    const animationDuration = theme.animations.speed === 'slow' ? '500ms' : 
                             theme.animations.speed === 'fast' ? '150ms' : '250ms';
    root.style.setProperty('--animation-duration', animationDuration);

    // Apply accessibility classes
    if (theme.typography.contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (theme.layout.simplified) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }

    if (theme.layout.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    if (!theme.animations.enabled) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

  }, [theme]);

  const value: EmotionThemeContextType = {
    emotionalState,
    urgencyLevel,
    theme,
    updateEmotionalState: setEmotionalState,
    updateUrgencyLevel: setUrgencyLevel,
    detectEmotionalState,
    getInterventionRecommendation,
  };

  return (
    <EmotionThemeContext.Provider value={value}>
      {children}
    </EmotionThemeContext.Provider>
  );
};

// Custom hook to use emotion theme
export const useEmotionTheme = () => {
  const context = useContext(EmotionThemeContext);
  if (!context) {
    throw new Error('useEmotionTheme must be used within EmotionThemeProvider');
  }
  return context;
};

// Emotion-aware component wrapper
interface EmotionAwareProps {
  children: React.ReactNode;
  detectFromText?: string;
  className?: string;
}

export const EmotionAware: React.FC<EmotionAwareProps> = ({ 
  children, 
  detectFromText,
  className 
}) => {
  const { detectEmotionalState, updateEmotionalState } = useEmotionTheme();

  useEffect(() => {
    if (detectFromText) {
      const detected = detectEmotionalState(detectFromText);
      updateEmotionalState(detected);
    }
  }, [detectFromText, detectEmotionalState, updateEmotionalState]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default EmotionThemeProvider;