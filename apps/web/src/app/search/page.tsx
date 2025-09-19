'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  ArrowRight,
  BookOpen,
  Phone,
  MessageCircle,
  Heart,
  Brain,
  Shield,
  AlertCircle,
  Star,
  MapPin,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'crisis' | 'resources' | 'therapy' | 'support' | 'education' | 'tools';
  url: string;
  tags: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'page' | 'external' | 'phone' | 'chat';
  lastUpdated: Date;
  isEmergency?: boolean;
}

const SEARCH_INDEX: SearchResult[] = [
  // Crisis Resources
  {
    id: 'crisis-988',
    title: '988 Suicide & Crisis Lifeline',
    description: 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7',
    category: 'crisis',
    url: 'tel:988',
    tags: ['suicide', 'crisis', 'emergency', 'hotline', '24/7'],
    priority: 'critical',
    type: 'phone',
    lastUpdated: new Date(),
    isEmergency: true
  },
  {
    id: 'crisis-chat',
    title: 'Crisis Chat Support',
    description: 'Immediate chat support with trained crisis counselors available 24/7',
    category: 'crisis',
    url: '/crisis/chat',
    tags: ['crisis', 'chat', 'counselor', '24/7', 'support'],
    priority: 'critical',
    type: 'chat',
    lastUpdated: new Date(),
    isEmergency: true
  },
  {
    id: 'safety-plan',
    title: 'Safety Planning Tool',
    description: 'Create a personalized safety plan for crisis situations and mental health emergencies',
    category: 'crisis',
    url: '/crisis/safety-plan',
    tags: ['safety', 'plan', 'crisis', 'prevention', 'personalized'],
    priority: 'high',
    type: 'page',
    lastUpdated: new Date()
  },

  // AI Therapy
  {
    id: 'ai-therapy-aria',
    title: 'Dr. Aria - AI CBT Therapist',
    description: 'AI therapist specializing in Cognitive Behavioral Therapy and crisis intervention',
    category: 'therapy',
    url: '/ai-therapy/chat?therapist=aria',
    tags: ['cbt', 'therapy', 'ai', 'cognitive', 'behavioral', 'crisis'],
    priority: 'high',
    type: 'page',
    lastUpdated: new Date()
  },
  {
    id: 'ai-therapy-sage',
    title: 'Dr. Sage - AI Trauma Therapist',
    description: 'AI therapist specializing in trauma-informed care and PTSD treatment',
    category: 'therapy',
    url: '/ai-therapy/chat?therapist=sage',
    tags: ['trauma', 'ptsd', 'therapy', 'ai', 'mindfulness'],
    priority: 'high',
    type: 'page',
    lastUpdated: new Date()
  },

  // Self-Help Tools
  {
    id: 'mood-tracking',
    title: 'Mood Tracking & Analytics',
    description: 'Track your mood over time and gain insights into patterns and triggers',
    category: 'tools',
    url: '/mood-gamified',
    tags: ['mood', 'tracking', 'analytics', 'patterns', 'insights'],
    priority: 'medium',
    type: 'page',
    lastUpdated: new Date()
  },
  {
    id: 'breathing-exercises',
    title: 'Breathing & Mindfulness Exercises',
    description: 'Guided breathing exercises and mindfulness techniques for anxiety and stress',
    category: 'tools',
    url: '/wellness/breathing',
    tags: ['breathing', 'mindfulness', 'anxiety', 'stress', 'relaxation'],
    priority: 'medium',
    type: 'page',
    lastUpdated: new Date()
  },

  // Support & Community
  {
    id: 'peer-support',
    title: 'Peer Support Community',
    description: 'Connect with others who understand your experiences in a safe, moderated environment',
    category: 'support',
    url: '/peer-support',
    tags: ['peer', 'support', 'community', 'connection', 'shared experience'],
    priority: 'medium',
    type: 'page',
    lastUpdated: new Date()
  },
  {
    id: 'professional-help',
    title: 'Find Professional Therapists',
    description: 'Connect with licensed therapists and mental health professionals in your area',
    category: 'therapy',
    url: '/therapist',
    tags: ['therapist', 'professional', 'licensed', 'mental health', 'local'],
    priority: 'high',
    type: 'page',
    lastUpdated: new Date()
  },

  // Educational Resources
  {
    id: 'self-help-hub',
    title: 'Self-Help Resource Hub',
    description: 'Comprehensive collection of self-help tools, worksheets, and educational materials',
    category: 'education',
    url: '/self-help',
    tags: ['self-help', 'worksheets', 'education', 'tools', 'coping'],
    priority: 'medium',
    type: 'page',
    lastUpdated: new Date()
  },
  {
    id: 'education-center',
    title: 'Mental Health Education Center',
    description: 'Learn about mental health conditions, treatments, and recovery strategies',
    category: 'education',
    url: '/education',
    tags: ['education', 'mental health', 'conditions', 'treatment', 'recovery'],
    priority: 'medium',
    type: 'page',
    lastUpdated: new Date()
  }
];

const CATEGORY_CONFIG = {
  crisis: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  therapy: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  tools: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  support: { icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  education: { icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  resources: { icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('astral-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // Simulate search delay for UX
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const searchTerms = query.toLowerCase().split(' ');
    
    let filteredResults = SEARCH_INDEX.filter(item => {
      // Check if query matches title, description, or tags
      const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    });

    // Filter by category if selected
    if (selectedCategory) {
      filteredResults = filteredResults.filter(item => item.category === selectedCategory);
    }

    // Sort by priority and relevance
    filteredResults.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Secondary sort by relevance (title matches first)
      const aInTitle = a.title.toLowerCase().includes(query.toLowerCase());
      const bInTitle = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aInTitle && !bInTitle) return -1;
      if (!aInTitle && bInTitle) return 1;
      
      return 0;
    });

    setResults(filteredResults);
    setIsSearching(false);
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('astral-recent-searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Track search result clicks
    if (result.type === 'phone') {
      window.location.href = result.url;
    } else if (result.type === 'external') {
      window.open(result.url, '_blank');
    } else {
      window.location.href = result.url;
    }
  };

  const quickSearches = [
    'crisis help',
    'suicide prevention',
    'anxiety',
    'depression',
    'breathing exercises',
    'therapist',
    'mood tracking',
    'safety plan'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Crisis Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="mr-2">🚨</span>
        In crisis? Call 988 (Suicide & Crisis Lifeline) immediately
        <a href="tel:988" className="ml-3 underline font-bold">Call 988</a>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Glass variant="light" className="mb-8 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Search Resources
            </h1>
          </div>
          <p className="text-gray-700 dark:text-gray-600">
            Find mental health resources, crisis support, therapy tools, and educational content
          </p>
        </Glass>

        {/* Search Form */}
        <Glass variant="light" className="mb-6 p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for crisis support, therapy tools, resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 animate-spin" />
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>
          </form>

          {/* Quick Searches */}
          {!searchQuery && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Searches:</h3>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Recent Searches:
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Glass>

        {/* Search Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({results.length})
                </h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {results.map((result) => {
                const config = CATEGORY_CONFIG[result.category];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                      result.isEmergency
                        ? 'bg-red-50 border-red-500 hover:bg-red-100'
                        : `${config.bg} ${config.border} hover:bg-opacity-80`
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-6 h-6 ${result.isEmergency ? 'text-red-600' : config.color} flex-shrink-0 mt-1`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {result.title}
                              </h3>
                              {result.isEmergency && (
                                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
                                  EMERGENCY
                                </span>
                              )}
                              {result.priority === 'critical' && !result.isEmergency && (
                                <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full font-medium">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3">{result.description}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-white bg-opacity-60 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {result.type === 'phone' && <Phone className="w-4 h-4 text-gray-700" />}
                        {result.type === 'chat' && <MessageCircle className="w-4 h-4 text-gray-700" />}
                        {result.type === 'external' && <ExternalLink className="w-4 h-4 text-gray-700" />}
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {searchQuery && results.length === 0 && !isSearching && (
          <Glass variant="light" className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try different keywords or check out our quick searches above
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Clear search
              </button>
              <a
                href="/crisis"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Crisis Support
              </a>
            </div>
          </Glass>
        )}

        {/* Emergency Notice */}
        <Glass variant="medium" className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Emergency Mental Health Resources
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                If you're in crisis or having thoughts of suicide, please reach out for immediate help:
              </p>
              <div className="space-y-2">
                <a
                  href="tel:988"
                  className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center font-medium"
                >
                  Call 988 - Suicide & Crisis Lifeline
                </a>
                <a
                  href="/crisis/chat"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Crisis Chat Support
                </a>
              </div>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}