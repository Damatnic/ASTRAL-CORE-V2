'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { AlertCircle, Check, Info, X } from 'lucide-react';

// WCAG 2.2 Compliant Color System
export const colorSystem = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    500: '#0ea5e9',
    600: '#0284c7', // Main primary - 4.5:1 contrast ratio
    700: '#0369a1',
    900: '#0c4a6e'
  },
  crisis: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626', // Crisis red - high contrast
    700: '#b91c1c',
    900: '#7f1d1d'
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a', // Success green
    700: '#15803d'
  },
  neutral: {
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
  }
};

// WCAG 2.2 Touch Target Sizes (Minimum 44x44px)
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]',
  recommended: 'min-h-[48px] min-w-[48px]',
  comfortable: 'min-h-[56px] min-w-[56px]'
};

// Focus Management System - WCAG 2.2 New Criteria 2.4.11, 2.4.12
export const focusStyles = {
  base: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  primary: 'focus-visible:ring-blue-600 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  crisis: 'focus-visible:ring-red-600 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
  // Enhanced focus for Level AAA compliance
  enhanced: 'focus-visible:ring-4 focus-visible:ring-offset-4',
  // Ensure focus is not obscured
  notObscured: 'focus-visible:z-50 focus-visible:relative'
};

// Production Glass System with Performance Optimization
interface GlassProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'heavy' | 'mixed';
  className?: string;
  as?: React.ElementType;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const Glass = forwardRef<HTMLDivElement, GlassProps>(({
  children,
  variant = 'mixed',
  className = '',
  as: Component = 'div',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  ...props
}, ref) => {
  const variants = {
    light: 'glass',
    medium: 'glass-mixed',
    heavy: 'glass-heavy',
    mixed: 'glass-mixed'
  };

  // Keyboard interaction handler for WCAG 2.1.1
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
    onKeyDown?.(e);
  };

  return (
    <Component
      ref={ref}
      className={`
        ${variants[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${onClick ? touchTargets.minimum : ''}
        ${onClick ? focusStyles.base : ''}
        ${onClick ? focusStyles.primary : ''}
        ${onClick ? focusStyles.notObscured : ''}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Component>
  );
});

Glass.displayName = 'Glass';

// WCAG 2.2 Compliant Button Component
interface ProductionButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'crisis' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  className?: string;
}

export const ProductionButton = forwardRef<HTMLButtonElement, ProductionButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  className = '',
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 
      hover:from-blue-700 hover:to-purple-700
      text-white shadow-lg hover:shadow-xl
      disabled:from-gray-400 disabled:to-gray-500
    `,
    secondary: `
      glass-mixed text-gray-900 dark:text-white
      hover:bg-white/20 dark:hover:bg-gray-800/40
      border border-gray-200 dark:border-gray-700
    `,
    crisis: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      text-white shadow-lg hover:shadow-xl
      disabled:from-gray-400 disabled:to-gray-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      text-white shadow-lg hover:shadow-xl
      disabled:from-gray-400 disabled:to-gray-500
    `,
    ghost: `
      text-gray-700 dark:text-gray-600
      hover:bg-gray-100 dark:hover:bg-gray-800/50
      hover:text-gray-900 dark:hover:text-white
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
    xl: 'px-10 py-5 text-xl min-h-[64px]'
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-busy={loading}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${focusStyles.base}
        ${variant === 'crisis' ? focusStyles.crisis : focusStyles.primary}
        ${focusStyles.notObscured}
        relative overflow-hidden rounded-xl font-semibold
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              aria-label="Loading"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Content */}
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {children}
      </motion.span>

      {/* Pressed State Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      />
    </motion.button>
  );
});

ProductionButton.displayName = 'ProductionButton';

// WCAG 2.2 Compliant Alert Component with Consistent Help (3.2.6)
interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
  role?: 'alert' | 'alertdialog' | 'status';
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export const Alert = ({ 
  children, 
  variant = 'info',
  title,
  onClose,
  className = '',
  role = 'alert',
  'aria-live': ariaLive = 'polite'
}: AlertProps) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-200',
      icon: Check,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role={role}
      aria-live={ariaLive}
      className={`
        ${config.container}
        glass-mixed border rounded-xl p-4
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`
              ${focusStyles.base} ${focusStyles.primary} ${focusStyles.notObscured}
              ${touchTargets.minimum}
              flex-shrink-0 rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5
              transition-colors duration-200
            `}
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Skip Navigation Link for WCAG 2.4.1
export const SkipNavigation = () => (
  <a
    href="#main-content"
    className={`
      sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999]
      ${focusStyles.base} ${focusStyles.primary} ${focusStyles.enhanced}
      px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
      transition-all duration-200
    `}
  >
    Skip to main content
  </a>
);

// Live Region for Dynamic Content Announcements
export const LiveRegion = ({ children, priority = 'polite' }: {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
}) => (
  <div
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
  >
    {children}
  </div>
);

// Export the production-ready system
export const ProductionGlassSystem = {
  Glass,
  ProductionButton,
  Alert,
  SkipNavigation,
  LiveRegion,
  colorSystem,
  touchTargets,
  focusStyles
};