/**
 * ASTRAL_CORE 2.0 Design System
 * 
 * Comprehensive design tokens, components, and utilities for mental health
 * and crisis intervention platform. Optimized for accessibility, trust,
 * and life-critical user experiences.
 */

export const designTokens = {
  // Color System - Optimized for Crisis Intervention
  colors: {
    // Primary brand colors
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5', 
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main primary
      600: '#059669', // Primary hover
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    
    // Crisis and emergency colors
    crisis: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626', // Main crisis red
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      // Semantic crisis colors
      low: '#f87171',     // 400
      medium: '#ef4444',  // 500
      high: '#dc2626',    // 600
      critical: '#b91c1c' // 700
    },
    
    // Success and safety colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    // Warning and caution colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // Neutral grays
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    
    // Semantic colors
    semantic: {
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      'text-muted': '#64748b',
      border: '#e2e8f0',
      'focus-ring': '#3b82f6'
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }]
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  // Box Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    // Crisis-specific shadows
    'crisis-glow': '0 0 20px rgb(220 38 38 / 0.3)',
    'success-glow': '0 0 20px rgb(16 185 129 / 0.3)',
    'focus-ring': '0 0 0 3px rgb(59 130 246 / 0.3)'
  },

  // Animation Durations
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    // Component-specific z-indices
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
    toast: '1070',
    crisis: '9999' // Highest priority for crisis elements
  }
};

// Component Design Patterns
export const componentPatterns = {
  // Button variants
  button: {
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base'
    },
    
    variants: {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      crisis: 'bg-crisis-600 hover:bg-crisis-700 text-white shadow-crisis-glow',
      success: 'bg-success-600 hover:bg-success-700 text-white',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
      ghost: 'hover:bg-gray-100 text-gray-700'
    }
  },

  // Input field styles
  input: {
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-base'
    },
    
    states: {
      default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      error: 'border-crisis-300 focus:border-crisis-500 focus:ring-crisis-500',
      success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
      disabled: 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
    }
  },

  // Card styles
  card: {
    variants: {
      default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      elevated: 'bg-white border border-gray-200 rounded-lg shadow-md',
      crisis: 'bg-white border border-crisis-200 rounded-lg shadow-md ring-1 ring-crisis-200',
      success: 'bg-white border border-success-200 rounded-lg shadow-md ring-1 ring-success-200'
    }
  },

  // Badge styles
  badge: {
    sizes: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm'
    },
    
    variants: {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary-100 text-primary-800',
      crisis: 'bg-crisis-100 text-crisis-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800'
    }
  }
};

// Accessibility Guidelines
export const accessibility = {
  // Color contrast ratios
  contrast: {
    normal: 4.5, // WCAG AA
    large: 3,    // WCAG AA for large text
    enhanced: 7  // WCAG AAA
  },
  
  // Focus management
  focus: {
    ringWidth: '2px',
    ringColor: 'rgb(59 130 246 / 0.3)',
    ringOffset: '2px'
  },
  
  // Touch targets
  touchTarget: {
    minSize: '44px', // iOS/Android minimum
    recommended: '48px'
  },
  
  // Text sizing
  text: {
    minSize: '16px', // Prevents zoom on mobile
    maxLineLength: '75ch' // Optimal reading length
  }
};

// Motion and Animation Presets
export const motion = {
  // Reduced motion support
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Standard transitions
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out'
  },
  
  // Crisis-specific animations
  crisis: {
    pulse: 'animate-pulse',
    shake: 'animate-bounce',
    urgent: 'animate-ping'
  }
};

// Layout patterns
export const layout = {
  // Container widths
  container: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  },
  
  // Grid patterns
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-2',
    cols3: 'grid-cols-3',
    cols4: 'grid-cols-4',
    cols6: 'grid-cols-6',
    cols12: 'grid-cols-12'
  }
};

export default {
  designTokens,
  componentPatterns,
  accessibility,
  motion,
  layout
};