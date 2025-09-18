'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Shield, Users, Clock, Star, Zap, Target } from 'lucide-react';

// Personalization Context
interface PersonalizationData {
  userId: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'default' | 'high-contrast' | 'calm' | 'energetic';
    fontSize: 'small' | 'medium' | 'large';
    animations: 'full' | 'reduced' | 'none';
    language: string;
  };
  mentalHealthProfile: {
    primaryConcerns: string[];
    preferredSupport: 'peer' | 'professional' | 'self-help' | 'mixed';
    crisisRiskLevel: 'low' | 'medium' | 'high';
    engagementStyle: 'visual' | 'text' | 'interactive' | 'minimal';
    timeOfDayPreference: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  behaviorData: {
    mostUsedFeatures: string[];
    sessionDuration: number;
    preferredCheckInTime: string;
    responsePatterns: Record<string, number>;
    lastActivity: Date;
  };
  adaptiveSettings: {
    contentPersonalization: boolean;
    smartNotifications: boolean;
    adaptiveLayout: boolean;
    aiRecommendations: boolean;
  };
}

interface PersonalizationContextType {
  data: PersonalizationData | null;
  updatePreferences: (preferences: Partial<PersonalizationData['preferences']>) => void;
  updateProfile: (profile: Partial<PersonalizationData['mentalHealthProfile']>) => void;
  getPersonalizedContent: (contentType: string) => any[];
  getAdaptiveRecommendations: () => Recommendation[];
  isLoading: boolean;
}

const PersonalizationContext = createContext<PersonalizationContextType | null>(null);

// Personalization Provider
export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PersonalizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonalizationData();
  }, []);

  const loadPersonalizationData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would load from API and local storage
      const userId = localStorage.getItem('astral_user_id') || 'anonymous';
      const storedPreferences = localStorage.getItem('astral_preferences');
      const storedProfile = localStorage.getItem('astral_mental_health_profile');
      const storedBehavior = localStorage.getItem('astral_behavior_data');

      const defaultData: PersonalizationData = {
        userId,
        preferences: {
          theme: 'auto',
          colorScheme: 'default',
          fontSize: 'medium',
          animations: 'full',
          language: 'en'
        },
        mentalHealthProfile: {
          primaryConcerns: [],
          preferredSupport: 'mixed',
          crisisRiskLevel: 'low',
          engagementStyle: 'interactive',
          timeOfDayPreference: 'evening'
        },
        behaviorData: {
          mostUsedFeatures: [],
          sessionDuration: 0,
          preferredCheckInTime: '18:00',
          responsePatterns: {},
          lastActivity: new Date()
        },
        adaptiveSettings: {
          contentPersonalization: true,
          smartNotifications: true,
          adaptiveLayout: true,
          aiRecommendations: true
        }
      };

      const personalizedData = {
        ...defaultData,
        preferences: storedPreferences ? { ...defaultData.preferences, ...JSON.parse(storedPreferences) } : defaultData.preferences,
        mentalHealthProfile: storedProfile ? { ...defaultData.mentalHealthProfile, ...JSON.parse(storedProfile) } : defaultData.mentalHealthProfile,
        behaviorData: storedBehavior ? { ...defaultData.behaviorData, ...JSON.parse(storedBehavior) } : defaultData.behaviorData
      };

      setData(personalizedData);
    } catch (error) {
      console.error('Error loading personalization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (newPreferences: Partial<PersonalizationData['preferences']>) => {
    if (!data) return;
    
    const updatedData = {
      ...data,
      preferences: { ...data.preferences, ...newPreferences }
    };
    
    setData(updatedData);
    localStorage.setItem('astral_preferences', JSON.stringify(updatedData.preferences));
  };

  const updateProfile = (newProfile: Partial<PersonalizationData['mentalHealthProfile']>) => {
    if (!data) return;
    
    const updatedData = {
      ...data,
      mentalHealthProfile: { ...data.mentalHealthProfile, ...newProfile }
    };
    
    setData(updatedData);
    localStorage.setItem('astral_mental_health_profile', JSON.stringify(updatedData.mentalHealthProfile));
  };

  const getPersonalizedContent = (contentType: string) => {
    if (!data) return [];
    
    // AI-powered content personalization based on user profile
    const baseContent = getBaseContent(contentType);
    
    return baseContent.filter(content => {
      // Filter based on primary concerns
      if (data.mentalHealthProfile.primaryConcerns.length > 0) {
        return data.mentalHealthProfile.primaryConcerns.some(concern => 
          content.tags?.includes(concern)
        );
      }
      
      // Filter based on engagement style
      if (data.mentalHealthProfile.engagementStyle === 'minimal') {
        return content.complexity === 'low';
      }
      
      return true;
    }).sort((a, b) => {
      // Prioritize based on user behavior
      const aScore = data.behaviorData.mostUsedFeatures.includes(a.category) ? 1 : 0;
      const bScore = data.behaviorData.mostUsedFeatures.includes(b.category) ? 1 : 0;
      return bScore - aScore;
    });
  };

  const getAdaptiveRecommendations = (): Recommendation[] => {
    if (!data) return [];
    
    const recommendations: Recommendation[] = [];
    const currentHour = new Date().getHours();
    
    // Time-based recommendations
    if (currentHour >= 18 && currentHour <= 22) {
      recommendations.push({
        id: 'evening_routine',
        type: 'routine',
        title: 'Evening Wind-Down',
        description: 'Based on your activity pattern, this is a good time for reflection',
        action: 'Start Evening Routine',
        priority: 'high',
        icon: Moon
      });
    }
    
    // Behavior-based recommendations
    if (data.behaviorData.mostUsedFeatures.includes('mood-tracking')) {
      recommendations.push({
        id: 'mood_insight',
        type: 'insight',
        title: 'Mood Pattern Insight',
        description: 'We noticed patterns in your mood data. Would you like to explore them?',
        action: 'View Insights',
        priority: 'medium',
        icon: Brain
      });
    }
    
    // Crisis prevention recommendations
    if (data.mentalHealthProfile.crisisRiskLevel === 'medium' || data.mentalHealthProfile.crisisRiskLevel === 'high') {
      recommendations.push({
        id: 'safety_plan_update',
        type: 'safety',
        title: 'Update Safety Plan',
        description: 'Keep your safety plan current with your latest preferences',
        action: 'Update Plan',
        priority: 'high',
        icon: Shield
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  return (
    <PersonalizationContext.Provider
      value={{
        data,
        updatePreferences,
        updateProfile,
        getPersonalizedContent,
        getAdaptiveRecommendations,
        isLoading
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

// Hook to use personalization
export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

// Adaptive Theme Provider
export function AdaptiveThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = usePersonalization();
  
  useEffect(() => {
    if (!data) return;
    
    const root = document.documentElement;
    
    // Apply theme
    if (data.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (data.preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on time or system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', data.preferences.colorScheme);
    
    // Apply font size
    root.setAttribute('data-font-size', data.preferences.fontSize);
    
    // Apply animation preference
    if (data.preferences.animations === 'none') {
      root.style.setProperty('--animation-duration', '0s');
    } else if (data.preferences.animations === 'reduced') {
      root.style.setProperty('--animation-duration', '0.1s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
    }
  }, [data]);

  return <>{children}</>;
}

// Smart Recommendations Component
interface Recommendation {
  id: string;
  type: 'routine' | 'insight' | 'safety' | 'wellness' | 'social';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ElementType;
}

export function SmartRecommendations() {
  const { getAdaptiveRecommendations, data } = usePersonalization();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data?.adaptiveSettings.aiRecommendations) {
      const recs = getAdaptiveRecommendations().filter(rec => !dismissedIds.has(rec.id));
      setRecommendations(recs);
    }
  }, [data, getAdaptiveRecommendations, dismissedIds]);

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  if (!data?.adaptiveSettings.aiRecommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-600" />
        Personalized for You
      </h3>
      
      <AnimatePresence>
        {recommendations.slice(0, 3).map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`p-4 rounded-xl border-l-4 ${
              rec.priority === 'high' 
                ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500'
                : rec.priority === 'medium'
                ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500'
                : 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  rec.priority === 'high' 
                    ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-300'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                }`}>
                  <rec.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {rec.description}
                  </p>
                  <button className={`mt-2 text-sm font-medium ${
                    rec.priority === 'high' 
                      ? 'text-red-600 hover:text-red-700 dark:text-red-400'
                      : rec.priority === 'medium'
                      ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400'
                      : 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
                  }`}>
                    {rec.action} →
                  </button>
                </div>
              </div>
              <button
                onClick={() => dismissRecommendation(rec.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Adaptive Dashboard Layout
export function AdaptiveDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data } = usePersonalization();
  
  if (!data) return <>{children}</>;
  
  const getLayoutClasses = () => {
    if (!data.adaptiveSettings.adaptiveLayout) {
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    }
    
    // Adapt layout based on engagement style
    switch (data.mentalHealthProfile.engagementStyle) {
      case 'minimal':
        return 'max-w-4xl mx-auto px-6 sm:px-8';
      case 'visual':
        return 'max-w-full px-2 sm:px-4';
      case 'text':
        return 'max-w-3xl mx-auto px-8 sm:px-12';
      default:
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {children}
    </div>
  );
}

// Personalized Content Feed
export function PersonalizedContentFeed() {
  const { getPersonalizedContent, data } = usePersonalization();
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    if (data?.adaptiveSettings.contentPersonalization) {
      const personalizedContent = getPersonalizedContent('wellness-tips');
      setContent(personalizedContent);
    }
  }, [data, getPersonalizedContent]);

  if (!data?.adaptiveSettings.contentPersonalization || content.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <Heart className="w-5 h-5 mr-2 text-pink-600" />
        Curated for Your Journey
      </h3>
      
      <div className="grid gap-4">
        {content.slice(0, 3).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.description}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.readTime} min read
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get base content (would be replaced with real API)
function getBaseContent(contentType: string) {
  const baseContent = {
    'wellness-tips': [
      {
        id: 'tip-1',
        title: 'Morning Mindfulness Practice',
        description: 'Start your day with 5 minutes of mindful breathing',
        category: 'mindfulness',
        complexity: 'low',
        tags: ['anxiety', 'stress'],
        readTime: 3,
        icon: Brain
      },
      {
        id: 'tip-2',
        title: 'Building Support Networks',
        description: 'How to cultivate meaningful connections for mental wellness',
        category: 'social',
        complexity: 'medium',
        tags: ['depression', 'isolation'],
        readTime: 7,
        icon: Users
      },
      {
        id: 'tip-3',
        title: 'Crisis Planning Essentials',
        description: 'Creating an effective personal safety plan',
        category: 'safety',
        complexity: 'high',
        tags: ['crisis', 'safety'],
        readTime: 10,
        icon: Shield
      }
    ]
  };
  
  return baseContent[contentType as keyof typeof baseContent] || [];
}
