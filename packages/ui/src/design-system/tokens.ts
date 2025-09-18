/**
 * Astral Core Design System Tokens
 * Mental Health-Optimized Color Palette and Typography
 * 
 * Design Principles:
 * 1. Calming colors to reduce anxiety
 * 2. High contrast for accessibility (WCAG AAA)
 * 3. Consistent spacing for visual harmony
 * 4. Clear typography hierarchy
 */

export const designTokens = {
  // Color Palette - Carefully chosen for mental health context
  colors: {
    // Primary - Calming blues (trust, stability)
    primary: {
      50: '#EFF6FF',   // Light background
      100: '#DBEAFE',  // Hover states
      200: '#BFDBFE',  // Borders
      300: '#93C5FD',  // Disabled states
      400: '#60A5FA',  // Secondary actions
      500: '#3B82F6',  // Primary actions
      600: '#2563EB',  // Hover primary
      700: '#1D4ED8',  // Active primary
      800: '#1E40AF',  // Dark mode primary
      900: '#1E3A8A',  // Text on light
      main: '#3B82F6', // Main color alias for compatibility
    },
    
    // Secondary - Soft purples (creativity, wisdom)
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },
    
    // Success - Growth greens (hope, renewal)
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    
    // Warning - Gentle ambers (caution without alarm)
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    
    // Crisis - Accessible reds (urgent but not panic-inducing)
    crisis: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      critical: '#DC2626', // Critical state color
    },
    
    // Neutral - Soft grays
    neutral: {
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#52525B',
      700: '#3F3F46',
      800: '#27272A',
      900: '#18181B',
      light: '#F4F4F5',
      medium: '#71717A',
      dark: '#18181B',
    },
    
    // Semantic colors
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F4F4F5',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    text: {
      primary: '#18181B',
      secondary: '#52525B',
      tertiary: '#71717A',
      disabled: '#A1A1AA',
      inverse: '#FFFFFF',
    },
    
    // Status colors for system states
    status: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    
    // Chart colors for data visualization
    chart: [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#22C55E', // Green
      '#F59E0B', // Orange
      '#A855F7', // Purple
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#84CC16', // Lime
    ],
    
    // Semantic colors with aliases
    semantic: {
      destructive: '#EF4444',
      secondary: '#71717A',
      outline: '#D4D4D8',
    },
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  
  // Spacing Scale (4px base)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows (subtle for calm interface)
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index Scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
    notification: 70,
    crisis: 100, // Highest priority for crisis elements
  },
  
  // Accessibility
  accessibility: {
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#3B82F6',
      offset: '2px',
    },
    
    minTouchTarget: {
      width: '44px',
      height: '44px',
    },
    
    contrastRatios: {
      normal: 4.5,  // WCAG AA
      large: 3,     // WCAG AA for large text
      enhanced: 7,  // WCAG AAA
    },
  },
};