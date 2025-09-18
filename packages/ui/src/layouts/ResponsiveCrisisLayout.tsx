import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Home, MessageSquare, Phone, Heart, Shield, 
  Settings, User, Bell, Search, ChevronLeft, Grid,
  Smartphone, Tablet, Monitor, ArrowUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CrisisBar } from '../components/crisis/CrisisButton';
import { NotificationSystem } from '../components/notifications/NotificationSystem';
import { useEmotionTheme } from '../providers/EmotionThemeProvider';

interface ResponsiveCrisisLayoutProps {
  children: React.ReactNode;
  showCrisisBar?: boolean;
  sidebarCollapsed?: boolean;
  className?: string;
}

// Breakpoint hooks for responsive design
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth < 640) {
        setBreakpoint('mobile');
      } else if (window.innerWidth < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

export const ResponsiveCrisisLayout: React.FC<ResponsiveCrisisLayoutProps> = ({
  children,
  showCrisisBar = true,
  sidebarCollapsed: initialCollapsed = false,
  className,
}) => {
  const { emotionalState, urgencyLevel, theme } = useEmotionTheme();
  const breakpoint = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (breakpoint === 'mobile') {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
    }
  }, [breakpoint]);
  
  // Show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation items - all FREE features
  const navigationItems = [
    { icon: Home, label: 'Home', href: '/', badge: null },
    { icon: MessageSquare, label: 'Crisis Chat', href: '/chat', badge: urgencyLevel === 'immediate' ? 'urgent' : null },
    { icon: Phone, label: 'Hotlines', href: '/hotlines', badge: null },
    { icon: Heart, label: 'Support', href: '/support', badge: null },
    { icon: Shield, label: 'Safety Plan', href: '/safety', badge: null },
    { icon: User, label: 'Profile', href: '/profile', badge: null },
    { icon: Settings, label: 'Settings', href: '/settings', badge: null },
  ];

  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      theme.layout.simplified && 'simplified-layout',
      className
    )}>
      {/* Crisis Bar - Always on top */}
      {showCrisisBar && (
        <CrisisBar position="top" alwaysVisible={urgencyLevel === 'immediate'} />
      )}
      
      {/* Mobile Header */}
      {breakpoint === 'mobile' && (
        <header className="fixed top-12 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">ASTRAL CORE</h1>
            
            <div className="flex items-center space-x-2">
              <NotificationSystem />
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="px-4 py-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        item.badge === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
                
                {/* Free Platform Badge */}
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-green-700 font-medium">
                    ✨ All features 100% FREE forever
                  </p>
                </div>
              </div>
            </nav>
          )}
        </header>
      )}
      
      {/* Desktop/Tablet Layout */}
      <div className={cn(
        'flex',
        breakpoint === 'mobile' && 'pt-24'
      )}>
        {/* Sidebar - Desktop/Tablet */}
        {breakpoint !== 'mobile' && (
          <aside className={cn(
            'fixed left-0 top-12 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <ChevronLeft className={cn(
                    'w-5 h-5 transition-transform',
                    sidebarCollapsed && 'rotate-180'
                  )} />
                </button>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="p-2">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
                          item.badge === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              ))}
            </nav>
            
            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-green-50">
                <p className="text-xs text-green-700 text-center font-medium">
                  💚 Forever FREE Platform
                </p>
              </div>
            )}
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className={cn(
          'flex-1 transition-all duration-300',
          breakpoint === 'desktop' && (sidebarCollapsed ? 'ml-16' : 'ml-64'),
          breakpoint === 'tablet' && (sidebarCollapsed ? 'ml-16' : 'ml-64'),
          breakpoint === 'mobile' && 'ml-0'
        )}>
          {/* Top Bar - Desktop/Tablet */}
          {breakpoint !== 'mobile' && (
            <header className="sticky top-12 bg-white border-b border-gray-200 z-20">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">ASTRAL CORE 2.0</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Crisis Support Platform
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Search className="w-5 h-5" />
                  </button>
                  <NotificationSystem />
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>
          )}
          
          {/* Page Content */}
          <div className={cn(
            'p-4 md:p-6 lg:p-8',
            theme.layout.simplified && 'max-w-3xl mx-auto'
          )}>
            {/* Responsive Grid Container */}
            <div className={cn(
              'grid gap-6',
              breakpoint === 'mobile' && 'grid-cols-1',
              breakpoint === 'tablet' && 'grid-cols-2',
              breakpoint === 'desktop' && 'grid-cols-3 xl:grid-cols-4'
            )}>
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {breakpoint === 'mobile' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 5).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
                {item.badge === 'urgent' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </a>
            ))}
          </div>
        </nav>
      )}
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all',
            breakpoint === 'mobile' ? 'bottom-20 right-4' : 'bottom-8 right-8'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      
      {/* Device Preview Indicator (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-14 right-2 z-50 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
          <div className="flex items-center space-x-2">
            {breakpoint === 'mobile' && <Smartphone className="w-4 h-4" />}
            {breakpoint === 'tablet' && <Tablet className="w-4 h-4" />}
            {breakpoint === 'desktop' && <Monitor className="w-4 h-4" />}
            <span className="capitalize">{breakpoint}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: { mobile: number; tablet: number; desktop: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className 
}) => {
  const breakpoint = useBreakpoint();
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };
  
  const columnClasses = {
    mobile: `grid-cols-${columns.mobile}`,
    tablet: `md:grid-cols-${columns.tablet}`,
    desktop: `lg:grid-cols-${columns.desktop}`,
  };
  
  return (
    <div className={cn(
      'grid',
      gapClasses[gap],
      columnClasses.mobile,
      columnClasses.tablet,
      columnClasses.desktop,
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Card Component
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  fullWidthMobile?: boolean;
  className?: string;
}> = ({ children, fullWidthMobile = true, className }) => {
  const breakpoint = useBreakpoint();
  
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      breakpoint === 'mobile' && fullWidthMobile ? 'w-full' : '',
      breakpoint === 'mobile' ? 'p-4' : 'p-6',
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveCrisisLayout;