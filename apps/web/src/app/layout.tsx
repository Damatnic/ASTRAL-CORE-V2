import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext';
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

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
        <GlobalErrorBoundary showCrisisResources={true}>
          <SessionProvider>
            <DataPersistenceProvider>
              <OnboardingProvider autoStart={true}>
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
          <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <a href="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700 transition-colors">
                    <h1 className="text-xl font-semibold">
                      ASTRAL CORE
                    </h1>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Safe Space
                    </span>
                  </a>
                </div>
                
                {/* Simplified, Mental Health-Appropriate Navigation */}
                <nav className="flex items-center space-x-2" role="navigation" aria-label="Main navigation">
                  {/* Primary Crisis Action - Always Visible */}
                  <a 
                    href="tel:988" 
                    className="inline-flex items-center bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                    aria-label="Call 988 Crisis Hotline - Available 24/7"
                  >
                    <span className="mr-2">📞</span>
                    Call 988
                  </a>
                  
                  {/* Essential Navigation - Reduced Cognitive Load */}
                  <div className="hidden md:flex items-center space-x-1">
                    <a 
                      href="/crisis" 
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Get Help
                    </a>
                    <a 
                      href="/mood-gamified" 
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Check In
                    </a>
                    <a 
                      href="/safety" 
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Safety Plan
                    </a>
                  </div>
                  
                  {/* More Tools - Progressive Disclosure */}
                  <details className="relative">
                    <summary className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 list-none">
                      More
                      <span className="ml-1">⋯</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <a 
                        href="/wellness" 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Wellness Tools
                      </a>
                      <a 
                        href="/volunteer" 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Volunteer
                      </a>
                      <a 
                        href="/therapist" 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Professional
                      </a>
                      <hr className="my-2 border-slate-200" />
                      <a 
                        href="/admin" 
                        className="block px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        Admin
                      </a>
                    </div>
                  </details>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-slate-500">
                ASTRAL CORE 2.0 - Mental Health Crisis Intervention Platform
                <div className="mt-1">
                  <span className="text-emerald-600 font-medium">24/7 Crisis Support Available</span>
                </div>
              </div>
            </div>
          </footer>
                  {/* Onboarding Flow - Rendered when active */}
                  <OnboardingFlow />
                </div>
              </OnboardingProvider>
            </DataPersistenceProvider>
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
