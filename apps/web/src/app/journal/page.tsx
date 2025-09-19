'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PenTool,
  Heart,
  Brain,
  Target,
  Lightbulb,
  Calendar,
  Clock,
  Star,
  Bookmark,
  Filter,
  Search,
  Plus,
  Save,
  Share,
  Lock,
  Download,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface JournalPrompt {
  id: string;
  category: 'gratitude' | 'reflection' | 'goals' | 'emotions' | 'coping' | 'growth' | 'relationships';
  title: string;
  prompt: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: number; // minutes
  tags: string[];
  therapeuticBenefit: string;
}

interface JournalEntry {
  id: string;
  promptId?: string;
  title: string;
  content: string;
  mood: number; // 1-10
  emotions: string[];
  insights: string[];
  gratitude: string[];
  goals: string[];
  challenges: string[];
  timestamp: Date;
  isPrivate: boolean;
  wordCount: number;
  category: string;
}

interface JournalInsight {
  type: 'pattern' | 'growth' | 'emotion' | 'goal';
  title: string;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  suggestions: string[];
}

const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Gratitude Prompts
  {
    id: 'gratitude-1',
    category: 'gratitude',
    title: 'Three Good Things',
    prompt: 'Write about three things that went well today and why you think they went well. How did each make you feel?',
    description: 'A research-backed practice for increasing positive emotions and life satisfaction',
    difficulty: 'beginner',
    timeEstimate: 10,
    tags: ['daily', 'positive', 'wellbeing'],
    therapeuticBenefit: 'Increases positive emotions, reduces depression, improves life satisfaction'
  },
  {
    id: 'gratitude-2',
    category: 'gratitude',
    title: 'Gratitude Letter',
    prompt: 'Think of someone who has had a positive impact on your life. Write them a letter expressing your gratitude (you don\'t have to send it).',
    description: 'Express deep appreciation for someone meaningful in your life',
    difficulty: 'intermediate',
    timeEstimate: 20,
    tags: ['relationships', 'appreciation', 'connection'],
    therapeuticBenefit: 'Strengthens relationships, increases happiness, builds social connection'
  },

  // Emotional Processing
  {
    id: 'emotions-1',
    category: 'emotions',
    title: 'Emotion Deep Dive',
    prompt: 'Describe a strong emotion you felt today. Where did you feel it in your body? What thoughts accompanied it? What might have triggered it?',
    description: 'Develop emotional awareness and understanding',
    difficulty: 'intermediate',
    timeEstimate: 15,
    tags: ['awareness', 'processing', 'mindfulness'],
    therapeuticBenefit: 'Improves emotional regulation, increases self-awareness, reduces emotional reactivity'
  },
  {
    id: 'emotions-2',
    category: 'emotions',
    title: 'Difficult Emotions',
    prompt: 'Write about a challenging emotion you\'ve been experiencing. What is this emotion trying to tell you? How might you respond to it with compassion?',
    description: 'Process difficult emotions with self-compassion',
    difficulty: 'advanced',
    timeEstimate: 20,
    tags: ['self-compassion', 'difficult emotions', 'healing'],
    therapeuticBenefit: 'Reduces emotional avoidance, increases self-compassion, promotes emotional healing'
  },

  // Goal Setting & Growth
  {
    id: 'goals-1',
    category: 'goals',
    title: 'Future Self Visualization',
    prompt: 'Imagine yourself one year from now, living your best life. What does that look like? What steps can you take today toward that vision?',
    description: 'Connect with your aspirations and create actionable steps',
    difficulty: 'intermediate',
    timeEstimate: 15,
    tags: ['vision', 'planning', 'motivation'],
    therapeuticBenefit: 'Increases motivation, clarifies values, promotes goal achievement'
  },
  {
    id: 'goals-2',
    category: 'goals',
    title: 'Overcoming Obstacles',
    prompt: 'Think of a goal you\'re working toward. What obstacles are you facing? What strategies could help you overcome them? Who could support you?',
    description: 'Problem-solve challenges and identify support systems',
    difficulty: 'intermediate',
    timeEstimate: 15,
    tags: ['problem-solving', 'support', 'resilience'],
    therapeuticBenefit: 'Improves problem-solving skills, builds resilience, identifies support systems'
  },

  // Reflection & Growth
  {
    id: 'reflection-1',
    category: 'reflection',
    title: 'Lessons Learned',
    prompt: 'Reflect on a recent challenge or mistake. What did you learn from it? How has it contributed to your growth? What would you do differently?',
    description: 'Transform difficulties into learning opportunities',
    difficulty: 'intermediate',
    timeEstimate: 20,
    tags: ['growth', 'learning', 'resilience'],
    therapeuticBenefit: 'Promotes post-traumatic growth, increases resilience, improves coping skills'
  },
  {
    id: 'reflection-2',
    category: 'reflection',
    title: 'Values Exploration',
    prompt: 'What are your core values? How did you live according to these values today? Where might you want to align your actions more closely with your values?',
    description: 'Explore and align with your personal values',
    difficulty: 'advanced',
    timeEstimate: 25,
    tags: ['values', 'authenticity', 'purpose'],
    therapeuticBenefit: 'Increases life satisfaction, promotes authentic living, clarifies purpose'
  },

  // Coping & Stress Management
  {
    id: 'coping-1',
    category: 'coping',
    title: 'Stress Response Reflection',
    prompt: 'Think about a recent stressful situation. How did your body respond? What thoughts went through your mind? What coping strategies did you use? What worked well?',
    description: 'Analyze your stress responses and coping mechanisms',
    difficulty: 'intermediate',
    timeEstimate: 15,
    tags: ['stress', 'coping', 'awareness'],
    therapeuticBenefit: 'Improves stress management, increases self-awareness, builds coping skills'
  },
  {
    id: 'coping-2',
    category: 'coping',
    title: 'Self-Care Planning',
    prompt: 'What does self-care look like for you? List activities that truly nourish you. How can you incorporate more of these into your routine?',
    description: 'Design a personalized self-care practice',
    difficulty: 'beginner',
    timeEstimate: 10,
    tags: ['self-care', 'wellness', 'routine'],
    therapeuticBenefit: 'Promotes self-care, reduces burnout, improves wellbeing'
  },

  // Relationships
  {
    id: 'relationships-1',
    category: 'relationships',
    title: 'Relationship Appreciation',
    prompt: 'Think of an important relationship in your life. What do you appreciate about this person? How do they support you? How do you support them?',
    description: 'Reflect on meaningful connections in your life',
    difficulty: 'beginner',
    timeEstimate: 10,
    tags: ['appreciation', 'connection', 'support'],
    therapeuticBenefit: 'Strengthens relationships, increases gratitude, builds social connection'
  },
  {
    id: 'relationships-2',
    category: 'relationships',
    title: 'Communication Reflection',
    prompt: 'Reflect on a recent conversation that didn\'t go as well as you hoped. What happened? How might you approach similar situations differently in the future?',
    description: 'Improve communication skills through reflection',
    difficulty: 'intermediate',
    timeEstimate: 15,
    tags: ['communication', 'learning', 'relationships'],
    therapeuticBenefit: 'Improves communication skills, builds empathy, strengthens relationships'
  }
];

const CATEGORY_CONFIG = {
  gratitude: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  emotions: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  goals: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  reflection: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  coping: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  growth: { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  relationships: { icon: Sparkles, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
};

export default function TherapeuticJournalPage() {
  const [activeTab, setActiveTab] = useState<'write' | 'prompts' | 'entries' | 'insights'>('write');
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 5,
    emotions: [],
    insights: [],
    gratitude: [],
    goals: [],
    challenges: [],
    isPrivate: true,
    category: 'reflection'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isWriting, setIsWriting] = useState(false);

  const filteredPrompts = JOURNAL_PROMPTS.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleStartWriting = (prompt?: JournalPrompt) => {
    setSelectedPrompt(prompt || null);
    setCurrentEntry({
      ...currentEntry,
      promptId: prompt?.id,
      category: prompt?.category || 'reflection'
    });
    setIsWriting(true);
    setActiveTab('write');
  };

  const handleSaveEntry = () => {
    if (!currentEntry.title || !currentEntry.content) return;

    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      promptId: currentEntry.promptId,
      title: currentEntry.title || 'Untitled Entry',
      content: currentEntry.content || '',
      mood: currentEntry.mood || 5,
      emotions: currentEntry.emotions || [],
      insights: currentEntry.insights || [],
      gratitude: currentEntry.gratitude || [],
      goals: currentEntry.goals || [],
      challenges: currentEntry.challenges || [],
      timestamp: new Date(),
      isPrivate: currentEntry.isPrivate || true,
      wordCount: currentEntry.content?.split(' ').length || 0,
      category: currentEntry.category || 'reflection'
    };

    setJournalEntries(prev => [entry, ...prev]);
    
    // Reset form
    setCurrentEntry({
      title: '',
      content: '',
      mood: 5,
      emotions: [],
      insights: [],
      gratitude: [],
      goals: [],
      challenges: [],
      isPrivate: true,
      category: 'reflection'
    });
    setSelectedPrompt(null);
    setIsWriting(false);
    setActiveTab('entries');
  };

  const generateInsights = (): JournalInsight[] => {
    if (journalEntries.length < 3) return [];

    const insights: JournalInsight[] = [];

    // Mood trend analysis
    const recentMoods = journalEntries.slice(0, 7).map(entry => entry.mood);
    const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    const trend = recentMoods[0] - recentMoods[recentMoods.length - 1];

    if (trend > 1) {
      insights.push({
        type: 'emotion',
        title: 'Positive Mood Trend',
        description: `Your mood has been improving over your recent journal entries (average: ${avgMood.toFixed(1)}/10)`,
        trend: 'positive',
        actionable: true,
        suggestions: [
          'Continue the practices that are supporting your improved mood',
          'Reflect on what activities or thoughts contribute to better days',
          'Consider sharing your progress with someone you trust'
        ]
      });
    } else if (trend < -1) {
      insights.push({
        type: 'emotion',
        title: 'Mood Decline Noticed',
        description: `Your mood has been declining in recent entries. This awareness is the first step toward positive change.`,
        trend: 'negative',
        actionable: true,
        suggestions: [
          'Consider reaching out to a mental health professional',
          'Review your recent entries for potential triggers or stressors',
          'Focus on self-care and coping strategies',
          'Connect with your support network'
        ]
      });
    }

    // Writing frequency analysis
    const entriesThisWeek = journalEntries.filter(entry => 
      new Date(entry.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (entriesThisWeek >= 5) {
      insights.push({
        type: 'pattern',
        title: 'Consistent Journaling Practice',
        description: `You've written ${entriesThisWeek} entries this week. Consistency is key to gaining insights from journaling.`,
        trend: 'positive',
        actionable: true,
        suggestions: [
          'Continue your regular journaling practice',
          'Try exploring new prompts to deepen your insights',
          'Consider setting aside a specific time each day for journaling'
        ]
      });
    }

    // Common themes analysis
    const allContent = journalEntries.map(entry => entry.content.toLowerCase()).join(' ');
    const commonWords = extractCommonThemes(allContent);
    
    if (commonWords.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Recurring Themes',
        description: `Common themes in your writing include: ${commonWords.slice(0, 3).join(', ')}`,
        trend: 'neutral',
        actionable: true,
        suggestions: [
          'Explore these themes more deeply in future entries',
          'Consider how these patterns might be affecting your life',
          'Discuss these themes with a therapist or trusted friend'
        ]
      });
    }

    return insights;
  };

  const extractCommonThemes = (text: string): string[] => {
    // Simple keyword extraction (in a real app, this would be more sophisticated)
    const emotionWords = ['anxious', 'happy', 'sad', 'angry', 'grateful', 'frustrated', 'peaceful', 'stressed'];
    const found = emotionWords.filter(word => text.includes(word));
    return found;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Crisis Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="mr-2">🚨</span>
        In crisis? Call 988 (Suicide & Crisis Lifeline) immediately
        <a href="tel:988" className="ml-3 underline font-bold">Call 988</a>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Glass variant="light" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Therapeutic Journal
                </h1>
                <p className="text-gray-700 dark:text-gray-600">
                  Evidence-based journaling for mental health and personal growth
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                New Entry
              </button>
            </div>
          </div>
        </Glass>

        {/* Navigation Tabs */}
        <Glass variant="light" className="mb-8 p-1">
          <div className="flex space-x-1">
            {(['write', 'prompts', 'entries', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {tab === 'write' && <PenTool className="w-4 h-4" />}
                {tab === 'prompts' && <Lightbulb className="w-4 h-4" />}
                {tab === 'entries' && <BookOpen className="w-4 h-4" />}
                {tab === 'insights' && <TrendingUp className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </Glass>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedPrompt && (
                <Glass variant="light" className="p-6 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedPrompt.title}</h3>
                      <p className="text-gray-700 mb-3">{selectedPrompt.prompt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedPrompt.timeEstimate} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {selectedPrompt.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPrompt(null)}
                      className="text-gray-600 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Therapeutic Benefit:</strong> {selectedPrompt.therapeuticBenefit}
                    </p>
                  </div>
                </Glass>
              )}

              <Glass variant="light" className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entry Title
                    </label>
                    <input
                      type="text"
                      value={currentEntry.title || ''}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Give your entry a title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Thoughts
                    </label>
                    <textarea
                      value={currentEntry.content || ''}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                      placeholder={selectedPrompt ? "Reflect on the prompt above..." : "What's on your mind today?"}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <div className="mt-2 text-sm text-gray-700">
                      Word count: {currentEntry.content?.split(' ').length || 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Mood (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentEntry.mood || 5}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, mood: Number(e.target.value) }))}
                        className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-center mt-2 text-lg font-semibold">
                        {currentEntry.mood}/10
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Privacy
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={currentEntry.isPrivate}
                            onChange={() => setCurrentEntry(prev => ({ ...prev, isPrivate: true }))}
                            className="mr-2"
                          />
                          <Lock className="w-4 h-4 mr-1" />
                          Private
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!currentEntry.isPrivate}
                            onChange={() => setCurrentEntry(prev => ({ ...prev, isPrivate: false }))}
                            className="mr-2"
                          />
                          <Share className="w-4 h-4 mr-1" />
                          Shareable
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveTab('prompts')}
                      className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Browse Prompts
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Auto-save functionality
                          console.log('Auto-saving...');
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={handleSaveEntry}
                        disabled={!currentEntry.title || !currentEntry.content}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Entry
                      </button>
                    </div>
                  </div>
                </div>
              </Glass>
            </motion.div>
          )}

          {activeTab === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <Glass variant="light" className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search prompts..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(CATEGORY_CONFIG).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </Glass>

              {/* Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => {
                  const config = CATEGORY_CONFIG[prompt.category];
                  const Icon = config.icon;

                  return (
                    <Glass
                      key={prompt.id}
                      variant="light"
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg border-l-4 ${config.border}`}
                      onClick={() => handleStartWriting(prompt)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Icon className={`w-6 h-6 ${config.color}`} />
                        <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.color}`}>
                          {prompt.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{prompt.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{prompt.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prompt.timeEstimate} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {prompt.difficulty}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-1">
                          {prompt.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-600" />
                      </div>
                    </Glass>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'entries' && (
            <motion.div
              key="entries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {journalEntries.length === 0 ? (
                <Glass variant="light" className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                  <p className="text-gray-600 mb-6">Start your therapeutic journaling journey today</p>
                  <button
                    onClick={() => setActiveTab('write')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Write Your First Entry
                  </button>
                </Glass>
              ) : (
                <div className="space-y-4">
                  {journalEntries.map((entry) => (
                    <Glass key={entry.id} variant="light" className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                            {entry.isPrivate && <Lock className="w-4 h-4 text-gray-700" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {entry.timestamp.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              Mood: {entry.mood}/10
                            </span>
                            <span>{entry.wordCount} words</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-700 hover:text-purple-600">
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-700 hover:text-purple-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-3 mb-4">{entry.content}</p>
                      
                      {entry.emotions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.emotions.map((emotion, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
                    </Glass>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {insights.length === 0 ? (
                <Glass variant="light" className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No insights yet</h3>
                  <p className="text-gray-600 mb-6">Write a few more entries to unlock personalized insights</p>
                  <button
                    onClick={() => setActiveTab('write')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Continue Journaling
                  </button>
                </Glass>
              ) : (
                <div className="space-y-6">
                  {insights.map((insight, index) => (
                    <Glass key={index} variant="light" className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          insight.trend === 'positive' ? 'bg-green-100' :
                          insight.trend === 'negative' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {insight.type === 'emotion' && <Heart className={`w-5 h-5 ${
                            insight.trend === 'positive' ? 'text-green-600' :
                            insight.trend === 'negative' ? 'text-red-600' : 'text-blue-600'
                          }`} />}
                          {insight.type === 'pattern' && <TrendingUp className={`w-5 h-5 ${
                            insight.trend === 'positive' ? 'text-green-600' :
                            insight.trend === 'negative' ? 'text-red-600' : 'text-blue-600'
                          }`} />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                          <p className="text-gray-700 mb-4">{insight.description}</p>
                          
                          {insight.actionable && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
                              <ul className="space-y-1">
                                {insight.suggestions.map((suggestion, suggestionIndex) => (
                                  <li key={suggestionIndex} className="text-sm text-gray-600 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-purple-500 rounded-full" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Glass>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Resources */}
        <Glass variant="medium" className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Need Support While Journaling?
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                If journaling brings up difficult emotions or thoughts of self-harm:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:988"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Call 988 - Crisis Lifeline
                </a>
                <a
                  href="/crisis/chat"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Crisis Chat Support
                </a>
                <a
                  href="/ai-therapy"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Talk to AI Therapist
                </a>
              </div>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}