'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cookie, Shield, Settings, X, Check, ChevronDown, 
  ChevronUp, Info, AlertTriangle, Globe, Lock 
} from 'lucide-react';
import { Glass, ProductionButton, Alert } from '@/components/design-system/ProductionGlassSystem';

// GDPR Consent Categories
export interface ConsentCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  social: boolean;
}

// Cookie Information Interface
export interface CookieInfo {
  name: string;
  purpose: string;
  duration: string;
  provider: string;
  category: keyof ConsentCategories;
}

// Privacy Settings Interface
export interface PrivacySettings {
  consent: ConsentCategories;
  timestamp: number;
  version: string;
  ip?: string;
  userAgent: string;
}

// GDPR Consent Manager Class
export class GDPRConsentManager {
  private static instance: GDPRConsentManager;
  private storageKey = 'gdpr-consent';
  private version = '1.0.0';
  
  static getInstance(): GDPRConsentManager {
    if (!GDPRConsentManager.instance) {
      GDPRConsentManager.instance = new GDPRConsentManager();
    }
    return GDPRConsentManager.instance;
  }

  // Get current consent status
  getConsent(): PrivacySettings | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Set consent preferences
  setConsent(consent: ConsentCategories): void {
    if (typeof window === 'undefined') return;

    const settings: PrivacySettings = {
      consent,
      timestamp: Date.now(),
      version: this.version,
      userAgent: navigator.userAgent
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
      this.applyConsent(consent);
      this.notifyConsentChange(consent);
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
    }
  }

  // Check if consent is required
  isConsentRequired(): boolean {
    const consent = this.getConsent();
    return !consent || consent.version !== this.version;
  }

  // Apply consent settings
  private applyConsent(consent: ConsentCategories): void {
    // Analytics consent
    if (consent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Marketing consent
    if (consent.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }

    // Social media consent
    if (consent.social) {
      this.enableSocialMedia();
    } else {
      this.disableSocialMedia();
    }
  }

  // Enable/disable specific services
  private enableAnalytics(): void {
    // Enable Google Analytics, etc.
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) { (window as any).dataLayer.push(arguments); }
    (window as any).gtag = gtag;
  }

  private disableAnalytics(): void {
    // Disable analytics
    (window as any)['ga-disable-GA_MEASUREMENT_ID'] = true;
  }

  private enableMarketing(): void {
    // Enable marketing cookies
  }

  private disableMarketing(): void {
    // Disable marketing cookies
  }

  private enableSocialMedia(): void {
    // Enable social media widgets
  }

  private disableSocialMedia(): void {
    // Disable social media widgets
  }

  // Notify other components of consent changes
  private notifyConsentChange(consent: ConsentCategories): void {
    window.dispatchEvent(new CustomEvent('gdpr-consent-changed', { 
      detail: consent 
    }));
  }

  // Clear all consent data (for user data deletion)
  clearConsent(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

// Cookie Details Data
const cookieDetails: CookieInfo[] = [
  {
    name: 'session',
    purpose: 'Essential for user authentication and session management',
    duration: 'Session',
    provider: 'Astral Core',
    category: 'necessary'
  },
  {
    name: '_ga',
    purpose: 'Google Analytics - tracks user interactions for improving user experience',
    duration: '2 years',
    provider: 'Google',
    category: 'analytics'
  },
  {
    name: 'marketing_prefs',
    purpose: 'Stores marketing preferences and tracks campaign effectiveness',
    duration: '1 year',
    provider: 'Astral Core',
    category: 'marketing'
  },
  {
    name: 'personalization',
    purpose: 'Remembers user preferences and customization settings',
    duration: '6 months',
    provider: 'Astral Core',
    category: 'personalization'
  }
];

// Main GDPR Consent Banner Component
export const GDPRConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
    social: false
  });

  const consentManager = GDPRConsentManager.getInstance();

  useEffect(() => {
    // Check if consent is required
    setIsVisible(consentManager.isConsentRequired());
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentCategories = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      social: true
    };
    consentManager.setConsent(allConsent);
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: ConsentCategories = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      social: false
    };
    consentManager.setConsent(necessaryOnly);
    setIsVisible(false);
  };

  const handleCustomSave = () => {
    consentManager.setConsent(consent);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
        role="dialog"
        aria-labelledby="gdpr-banner-title"
        aria-describedby="gdpr-banner-description"
      >
        <Glass variant="heavy" className="max-w-6xl mx-auto p-6">
          <div className="flex items-start gap-4">
            <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            
            <div className="flex-1 min-w-0">
              <h2 id="gdpr-banner-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                🍪 Your Privacy Matters
              </h2>
              
              <p id="gdpr-banner-description" className="text-gray-700 dark:text-gray-600 mb-4 leading-relaxed">
                We use cookies and similar technologies to improve your experience, analyze usage, 
                and provide personalized content. You can choose which categories to accept. 
                Your choice is important to us.
              </p>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6"
                >
                  <CookieDetailsPanel consent={consent} setConsent={setConsent} />
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <ProductionButton
                  variant="primary"
                  size="lg"
                  onClick={handleAcceptAll}
                  aria-label="Accept all cookies and personalization features"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Accept All
                </ProductionButton>
                
                <ProductionButton
                  variant="secondary"
                  size="lg"
                  onClick={handleAcceptNecessary}
                  aria-label="Accept only necessary cookies"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Necessary Only
                </ProductionButton>
                
                <ProductionButton
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowDetails(!showDetails)}
                  aria-label={showDetails ? "Hide cookie details" : "Show cookie details"}
                  aria-expanded={showDetails}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Customize
                  {showDetails ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </ProductionButton>
              </div>

              {showDetails && (
                <div className="flex gap-3">
                  <ProductionButton
                    variant="success"
                    size="md"
                    onClick={handleCustomSave}
                    aria-label="Save custom cookie preferences"
                  >
                    Save Preferences
                  </ProductionButton>
                </div>
              )}

              <p className="text-xs text-gray-700 dark:text-gray-600 mt-3">
                By continuing to use our site, you agree to our{' '}
                <a href="/privacy" className="underline hover:text-blue-600">Privacy Policy</a>
                {' '}and{' '}
                <a href="/cookies" className="underline hover:text-blue-600">Cookie Policy</a>.
                You can change your preferences anytime in Settings.
              </p>
            </div>
          </div>
        </Glass>
      </motion.div>
    </AnimatePresence>
  );
};

// Cookie Details Panel Component
const CookieDetailsPanel: React.FC<{
  consent: ConsentCategories;
  setConsent: (consent: ConsentCategories) => void;
}> = ({ consent, setConsent }) => {
  const handleToggle = (category: keyof ConsentCategories) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    setConsent({
      ...consent,
      [category]: !consent[category]
    });
  };

  const categories = [
    {
      key: 'necessary' as const,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. Cannot be disabled.',
      required: true,
      icon: Shield
    },
    {
      key: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      required: false,
      icon: Globe
    },
    {
      key: 'marketing' as const,
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites for advertising purposes.',
      required: false,
      icon: AlertTriangle
    },
    {
      key: 'personalization' as const,
      title: 'Personalization Cookies',
      description: 'Remember your preferences and provide customized experiences.',
      required: false,
      icon: Settings
    },
    {
      key: 'social' as const,
      title: 'Social Media Cookies',
      description: 'Enable social media features and content sharing.',
      required: false,
      icon: Globe
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cookie Categories
      </h3>
      
      {categories.map((category) => {
        const Icon = category.icon;
        const isEnabled = consent[category.key];
        
        return (
          <Glass key={category.key} variant="light" className="p-4">
            <div className="flex items-start gap-4">
              <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h4>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(category.key)}
                      disabled={category.required}
                      className="sr-only"
                      aria-label={`Toggle ${category.title}`}
                    />
                    <div className={`
                      w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                      ${isEnabled 
                        ? (category.required ? 'bg-gray-400' : 'bg-blue-600') 
                        : 'bg-gray-300 dark:bg-gray-600'}
                      ${category.required ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}>
                      <div className={`
                        w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'}
                        mt-0.5
                      `} />
                    </div>
                  </label>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-600 mb-3">
                  {category.description}
                </p>
                
                {/* Show relevant cookies for this category */}
                <div className="space-y-2">
                  {cookieDetails
                    .filter(cookie => cookie.category === category.key)
                    .map(cookie => (
                      <div key={cookie.name} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <div className="font-medium">{cookie.name}</div>
                        <div className="text-gray-600 dark:text-gray-600">
                          {cookie.purpose} • Duration: {cookie.duration}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </Glass>
        );
      })}
    </div>
  );
};

// Privacy Settings Modal Component
export const PrivacySettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [consent, setConsent] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
    social: false
  });
  
  const consentManager = GDPRConsentManager.getInstance();

  useEffect(() => {
    if (isOpen) {
      const current = consentManager.getConsent();
      if (current) {
        setConsent(current.consent);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    consentManager.setConsent(consent);
    onClose();
  };

  const handleDataDeletion = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      consentManager.clearConsent();
      // In production: trigger data deletion API call
      alert('Your data deletion request has been submitted.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl"
        >
          <Glass variant="heavy" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Privacy Settings
              </h2>
              <ProductionButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close privacy settings"
              >
                <X className="w-5 h-5" />
              </ProductionButton>
            </div>

            <CookieDetailsPanel consent={consent} setConsent={setConsent} />

            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <ProductionButton
                variant="primary"
                size="lg"
                onClick={handleSave}
              >
                Save Preferences
              </ProductionButton>
              
              <ProductionButton
                variant="crisis"
                size="lg"
                onClick={handleDataDeletion}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Delete My Data
              </ProductionButton>
              
              <ProductionButton
                variant="ghost"
                size="lg"
                onClick={onClose}
              >
                Cancel
              </ProductionButton>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
};

// Export the GDPR system
export const GDPRCompliance = {
  ConsentBanner: GDPRConsentBanner,
  SettingsModal: PrivacySettingsModal,
  ConsentManager: GDPRConsentManager,
  cookieDetails
};