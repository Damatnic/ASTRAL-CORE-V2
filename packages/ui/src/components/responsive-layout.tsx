import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAccessibility } from './accessibility';

// Responsive Container Component
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 py-4 sm:px-6 sm:py-6',
    lg: 'px-4 py-6 sm:px-8 sm:py-8',
    xl: 'px-6 py-8 sm:px-12 sm:py-12'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-First Grid System
export interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  smCols?: 1 | 2 | 3 | 4 | 6 | 12;
  mdCols?: 1 | 2 | 3 | 4 | 6 | 12;
  lgCols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  gap = 'md',
  className
}) => {
  const getColsClass = (colCount: number) => `grid-cols-${colCount}`;
  
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridClasses = cn(
    'grid',
    getColsClass(cols),
    smCols && `sm:${getColsClass(smCols)}`,
    mdCols && `md:${getColsClass(mdCols)}`,
    lgCols && `lg:${getColsClass(lgCols)}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Responsive Stack Component (Vertical Layout)
export interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  className
}) => {
  const spacingClasses = {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing],
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-Optimized Card Component
export interface MobileCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'crisis' | 'success';
  padding?: 'sm' | 'md' | 'lg';
  touchOptimized?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  touchOptimized = true,
  className,
  onClick
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white border border-gray-200 shadow-md',
    crisis: 'bg-white border border-crisis-200 shadow-md ring-1 ring-crisis-200',
    success: 'bg-white border border-success-200 shadow-md ring-1 ring-success-200'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const touchClasses = touchOptimized 
    ? 'touch-manipulation active:bg-gray-50 transition-colors duration-150'
    : '';

  const interactiveClasses = onClick 
    ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
    : '';

  return (
    <div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        paddingClasses[padding],
        touchClasses,
        interactiveClasses,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

// Breakpoint Detection Hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    // Initial check
    updateBreakpoint();

    // Listen for resize events
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint)
  };
};

// Mobile-First Crisis Layout
export interface MobileCrisisLayoutProps {
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  emergencyButton?: React.ReactNode;
  className?: string;
}

export const MobileCrisisLayout: React.FC<MobileCrisisLayoutProps> = ({
  header,
  navigation,
  sidebar,
  children,
  footer,
  emergencyButton,
  className
}) => {
  const { isMobile, isTablet } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Emergency Button - Always Visible */}
      {emergencyButton}

      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset-top">
          <ResponsiveContainer maxWidth="full" padding="sm">
            {header}
          </ResponsiveContainer>
        </header>
      )}

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        {sidebar && !isMobile && !isTablet && (
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-white lg:border-r lg:border-gray-200">
            <div className="flex-1 overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebar && (isMobile || isTablet) && sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-white border-r border-gray-200 overflow-y-auto safe-area-inset-left">
              <div className="p-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="mb-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
                {sidebar}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1',
          sidebar && !isMobile && !isTablet && 'lg:pl-64'
        )}>
          <div className="flex flex-col min-h-full">
            {/* Page Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              <ResponsiveContainer maxWidth="full" padding="none">
                {children}
              </ResponsiveContainer>
            </div>

            {/* Footer */}
            {footer && (
              <footer className="bg-white border-t border-gray-200 safe-area-inset-bottom">
                <ResponsiveContainer maxWidth="full" padding="sm">
                  {footer}
                </ResponsiveContainer>
              </footer>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {navigation && (isMobile || isTablet) && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom lg:hidden">
          {navigation}
        </nav>
      )}

      {/* Sidebar Toggle Button - Mobile */}
      {sidebar && (isMobile || isTablet) && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow-md border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          aria-label="Open sidebar"
        >
          ☰
        </button>
      )}
    </div>
  );
};

// Touch-Optimized Button Stack for Mobile
export interface TouchButtonStackProps {
  buttons: {
    id: string;
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'crisis' | 'success' | 'outline';
    onClick: () => void;
    disabled?: boolean;
  }[];
  orientation?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TouchButtonStack: React.FC<TouchButtonStackProps> = ({
  buttons,
  orientation = 'vertical',
  spacing = 'md',
  className
}) => {
  const { largeText } = useAccessibility();

  const spacingClasses = {
    sm: orientation === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: orientation === 'vertical' ? 'space-y-3' : 'space-x-3',
    lg: orientation === 'vertical' ? 'space-y-4' : 'space-x-4'
  };

  const orientationClasses = orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap';

  return (
    <div className={cn(
      'flex',
      orientationClasses,
      spacingClasses[spacing],
      className
    )}>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={button.onClick}
          disabled={button.disabled}
          className={cn(
            'flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg font-medium transition-all duration-200',
            'touch-manipulation active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            // Button variants
            button.variant === 'crisis' && 'bg-crisis-600 hover:bg-crisis-700 text-white focus:ring-crisis-500',
            button.variant === 'primary' && 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
            button.variant === 'success' && 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500',
            button.variant === 'secondary' && 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
            button.variant === 'outline' && 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500',
            !button.variant && 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
            // Disabled state
            button.disabled && 'opacity-50 cursor-not-allowed hover:bg-current active:scale-100',
            // Large text mode
            largeText && 'text-lg py-4'
          )}
        >
          {button.icon && (
            <span className="mr-2 text-xl" aria-hidden="true">
              {button.icon}
            </span>
          )}
          {button.label}
        </button>
      ))}
    </div>
  );
};

// Responsive Hero Section for Crisis Pages
export interface CrisisHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'crisis' | 'primary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  backgroundVariant?: 'default' | 'crisis' | 'calming';
  className?: string;
}

export const CrisisHero: React.FC<CrisisHeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundVariant = 'default',
  className
}) => {
  const { isMobile } = useBreakpoint();

  const backgroundClasses = {
    default: 'bg-gradient-to-br from-primary-50 to-success-50',
    crisis: 'bg-gradient-to-br from-crisis-50 to-warning-50',
    calming: 'bg-gradient-to-br from-primary-50 via-success-50 to-primary-100'
  };

  return (
    <section className={cn(
      'relative overflow-hidden py-12 sm:py-16 lg:py-20',
      backgroundClasses[backgroundVariant],
      className
    )}>
      <ResponsiveContainer maxWidth="xl" padding="lg">
        <div className="text-center">
          {subtitle && (
            <p className="text-sm sm:text-base font-medium text-primary-600 mb-2 sm:mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className={cn(
            'font-bold text-gray-900 mb-4 sm:mb-6',
            isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl lg:text-5xl'
          )}>
            {title}
          </h1>
          
          {description && (
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className={cn(
                  'w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg',
                  'min-h-[44px] touch-manipulation transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  primaryAction.variant === 'crisis' 
                    ? 'bg-crisis-600 hover:bg-crisis-700 text-white focus:ring-crisis-500 shadow-crisis-glow'
                    : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
                )}
              >
                {primaryAction.label}
              </button>
            )}
            
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 min-h-[44px] touch-manipulation transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};