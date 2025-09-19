import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext';
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import { PersonalizationProvider, AdaptiveThemeProvider } from '@/components/personalization/AdaptiveUI';
import { AccessibilityProvider, AccessibilityPanel, SkipNavigation, KeyboardNavigationHelper } from '@/components/accessibility/AccessibilityEnhancer';
import { AccessibilityDashboard, AccessibilityIndicator } from '@/components/accessibility/AccessibilityDashboard';
import { PerformanceDashboard, ResourceHints, registerServiceWorker } from '@/components/performance/PerformanceOptimizer';
import { TestDashboard } from '@/components/testing/TestingUtils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ASTRAL CORE 2.0 - 24/7 Mental Health Crisis Support | Call 988',
  description: 'Immediate crisis intervention and mental health support. Connect with trained volunteers 24/7. Free, confidential, and life-saving. Call 988 or text 741741 for help.',
  keywords: 'crisis hotline, suicide prevention, mental health support, 988 lifeline, crisis text line, emergency mental health, depression help, anxiety support, ASTRAL CORE',
  robots: 'index, follow',
  openGraph: {
    title: 'ASTRAL CORE 2.0 - Crisis Support Platform',
    description: 'Get immediate mental health crisis support. Available 24/7.',
    type: 'website',
    locale: 'en_US'
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=yes',
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Life-critical mental health crisis intervention platform. Get immediate help: Call 988 or Text HOME to 741741" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                  console.log('Service Worker registered:', registration);
                }).catch((error) => {
                  console.error('Service Worker registration failed:', error);
                });
              });
            }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip Navigation Component */}
        <SkipNavigation />
        
        <GlobalErrorBoundary showCrisisResources={true}>
          <SessionProvider>
            <DataPersistenceProvider>
              <AccessibilityProvider>
                <PersonalizationProvider>
                  <AdaptiveThemeProvider>
                    <OnboardingProvider autoStart={true}>
                    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                      {/* Enhanced Navigation */}
                      <EnhancedNavigation />
                      
                      {/* Main Content - Enhanced for skip navigation */}
                      <main 
                        id="main-content" 
                        className="pt-16 focus:outline-none" 
                        role="main"
                        tabIndex={-1}
                        aria-label="Main content area"
                      >
                        {children}
                      </main>
                  
                  {/* Enhanced Footer */}
                  <footer className="bg-white border-t border-slate-200 mt-auto" role="contentinfo">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="col-span-1">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ASTRAL CORE
                          </h3>
                          <p className="text-sm text-gray-600 mt-2">
                            Life-saving mental health crisis intervention platform. Always free, always here.
                          </p>
                          <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                              24/7 Support Available
                            </span>
                          </div>
                        </div>
                        
                        {/* Quick Links */}
                        <div className="col-span-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Get Help</h4>
                          <ul className="space-y-2 text-sm">
                            <li><a href="/crisis" className="text-gray-600 hover:text-purple-600 transition-colors">Crisis Support</a></li>
                            <li><a href="/crisis/chat" className="text-gray-600 hover:text-purple-600 transition-colors">Anonymous Chat</a></li>
                            <li><a href="/safety" className="text-gray-600 hover:text-purple-600 transition-colors">Safety Planning</a></li>
                            <li><a href="/self-help" className="text-gray-600 hover:text-purple-600 transition-colors">Self-Help Tools</a></li>
                          </ul>
                        </div>
                        
                        {/* Resources */}
                        <div className="col-span-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
                          <ul className="space-y-2 text-sm">
                            <li><a href="/wellness" className="text-gray-600 hover:text-purple-600 transition-colors">Wellness Hub</a></li>
                            <li><a href="/education" className="text-gray-600 hover:text-purple-600 transition-colors">Learn</a></li>
                            <li><a href="/community" className="text-gray-600 hover:text-purple-600 transition-colors">Community</a></li>
                            <li><a href="/volunteer" className="text-gray-600 hover:text-purple-600 transition-colors">Volunteer</a></li>
                          </ul>
                        </div>
                        
                        {/* Emergency */}
                        <div className="col-span-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Emergency</h4>
                          <div className="space-y-3">
                            <a href="tel:988" className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                              <span className="mr-2">📞</span>
                              Call 988
                            </a>
                            <a href="sms:741741" className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              <span className="mr-2">💬</span>
                              Text 741741
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-700">
                        <p>© 2025 ASTRAL CORE. Built with love to save lives. 💙</p>
                        <p className="mt-2">
                          If you or someone you know is in immediate danger, please contact emergency services (911) or the 988 Suicide & Crisis Lifeline.
                        </p>
                      </div>
                    </div>
                  </footer>
                  
                      {/* Accessibility Panel */}
                      <AccessibilityPanel />
                      
                      {/* Keyboard Navigation Helper */}
                      <KeyboardNavigationHelper />
                      
                      {/* Accessibility Dashboard (development only) */}
                      <AccessibilityDashboard developmentOnly={true} autoRun={false} />
                      
                      {/* Accessibility Indicator */}
                      <AccessibilityIndicator />
                      
                      {/* Performance Dashboard (development only) */}
                      <PerformanceDashboard />
                      
                      {/* Test Dashboard (development only) */}
                      <TestDashboard />
                      
                      {/* Onboarding Flow - Rendered when active */}
                      <OnboardingFlow />
                    </div>
                    </OnboardingProvider>
                  </AdaptiveThemeProvider>
                </PersonalizationProvider>
              </AccessibilityProvider>
            </DataPersistenceProvider>
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
