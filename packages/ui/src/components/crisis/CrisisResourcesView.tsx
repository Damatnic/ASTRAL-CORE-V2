import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Heart, Phone, MessageCircle, Brain,
  Shield, Home, User, Star, ExternalLink, AlertTriangle,
  Activity, Coffee, Music, BookOpen, Headphones, Wind
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CrisisResource {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  contact?: string;
  link?: string;
  tags: string[];
  isHotline: boolean;
  available24_7: boolean;
  type: 'emergency' | 'support' | 'information' | 'exercise';
  icon?: React.ReactNode;
}

interface CrisisResourcesViewProps {
  onResourceClick?: (resource: CrisisResource) => void;
  className?: string;
}

const RESOURCE_CATEGORIES = [
  'All',
  'Crisis Support', 
  'Anxiety',
  'Depression', 
  'Coping Strategies',
  'Grief',
  'Breathing Exercises',
  'Grounding Techniques'
];

// Comprehensive fallback crisis resources with life-saving focus
const FALLBACK_RESOURCES: CrisisResource[] = [
  // Emergency Crisis Support (Priority 1)
  {
    id: 'crisis-988',
    title: '🆘 988 Suicide & Crisis Lifeline',
    description: 'Free, confidential, 24/7 crisis support for people in distress and prevention resources.',
    category: 'Crisis Support',
    priority: 'urgent',
    contact: '988',
    link: 'https://988lifeline.org',
    tags: ['suicide', 'crisis', 'emergency', 'immediate'],
    isHotline: true,
    available24_7: true,
    type: 'emergency',
    icon: <Phone className="w-5 h-5 text-red-500" />
  },
  {
    id: 'crisis-text',
    title: '📱 Crisis Text Line',
    description: 'Free, 24/7 crisis support via text. Trained counselors available immediately.',
    category: 'Crisis Support',
    priority: 'urgent',
    contact: 'Text HOME to 741741',
    link: 'https://crisistextline.org',
    tags: ['text', 'crisis', 'immediate', 'anonymous'],
    isHotline: true,
    available24_7: true,
    type: 'emergency',
    icon: <MessageCircle className="w-5 h-5 text-blue-500" />
  },
  {
    id: 'emergency-911',
    title: '🚨 Emergency Services',
    description: 'For immediate life-threatening emergencies requiring police, fire, or medical response.',
    category: 'Crisis Support',
    priority: 'urgent',
    contact: '911',
    tags: ['emergency', 'immediate', 'life-threatening'],
    isHotline: true,
    available24_7: true,
    type: 'emergency',
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />
  },
  {
    id: 'samhsa-helpline',
    title: '🏥 SAMHSA National Helpline',
    description: 'Treatment referral and information service for mental health and substance use disorders.',
    category: 'Crisis Support',
    priority: 'high',
    contact: '1-800-662-4357',
    link: 'https://samhsa.gov/find-help/national-helpline',
    tags: ['treatment', 'referral', 'substance abuse', 'mental health'],
    isHotline: true,
    available24_7: true,
    type: 'support',
    icon: <Shield className="w-5 h-5 text-green-500" />
  },

  // Breathing & Grounding Exercises (Immediate Relief)
  {
    id: 'breathing-478',
    title: '🌬️ 4-7-8 Breathing Technique',
    description: 'Breathe in for 4, hold for 7, exhale for 8. Repeat 4 times. Reduces anxiety quickly.',
    category: 'Breathing Exercises',
    priority: 'high',
    tags: ['breathing', 'anxiety', 'immediate', 'calm'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Wind className="w-5 h-5 text-cyan-500" />
  },
  {
    id: 'box-breathing',
    title: '📦 Box Breathing',
    description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Creates instant calm.',
    category: 'Breathing Exercises',
    priority: 'high',
    tags: ['breathing', 'anxiety', 'focus', 'immediate'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Wind className="w-5 h-5 text-blue-400" />
  },
  {
    id: 'grounding-54321',
    title: '🧘 5-4-3-2-1 Grounding',
    description: '5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. Grounds you in reality.',
    category: 'Grounding Techniques',
    priority: 'high',
    tags: ['grounding', 'anxiety', 'panic', 'present moment'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Brain className="w-5 h-5 text-purple-500" />
  },

  // Anxiety Support
  {
    id: 'anxiety-ice',
    title: '🧊 Ice Cube Technique',
    description: 'Hold ice cubes or splash cold water on face to interrupt panic attacks.',
    category: 'Anxiety',
    priority: 'high',
    tags: ['panic', 'immediate', 'physical', 'interrupt'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Activity className="w-5 h-5 text-cyan-400" />
  },
  {
    id: 'anxiety-movement',
    title: '🚶 Movement for Anxiety',
    description: 'Even 5 minutes of movement can reduce anxiety. Walk, stretch, or dance.',
    category: 'Anxiety',
    priority: 'medium',
    tags: ['movement', 'exercise', 'natural relief'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Activity className="w-5 h-5 text-green-400" />
  },

  // Depression Support
  {
    id: 'depression-sunlight',
    title: '☀️ Sunlight & Fresh Air',
    description: 'Go outside for 10 minutes. Natural light and fresh air improve mood immediately.',
    category: 'Depression',
    priority: 'medium',
    tags: ['sunlight', 'nature', 'mood', 'vitamin d'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Home className="w-5 h-5 text-yellow-500" />
  },
  {
    id: 'depression-connection',
    title: '💙 Reach Out to Someone',
    description: 'Send a text, make a call, or message someone you trust. Connection heals.',
    category: 'Depression',
    priority: 'high',
    tags: ['connection', 'social', 'support', 'isolation'],
    isHotline: false,
    available24_7: true,
    type: 'support',
    icon: <Heart className="w-5 h-5 text-pink-500" />
  },

  // Coping Strategies
  {
    id: 'coping-music',
    title: '🎵 Music Therapy',
    description: 'Listen to calming music or songs that make you feel safe. Music heals.',
    category: 'Coping Strategies',
    priority: 'medium',
    tags: ['music', 'therapy', 'emotional regulation'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Headphones className="w-5 h-5 text-purple-400" />
  },
  {
    id: 'coping-journal',
    title: '📝 Crisis Journal',
    description: 'Write down exactly what you\'re feeling. Getting it out helps process emotions.',
    category: 'Coping Strategies',
    priority: 'medium',
    tags: ['journaling', 'emotional processing', 'writing'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <BookOpen className="w-5 h-5 text-indigo-400" />
  },
  {
    id: 'coping-warm-drink',
    title: '☕ Warm Drink Ritual',
    description: 'Make tea, coffee, or hot chocolate. The ritual and warmth provide comfort.',
    category: 'Coping Strategies',
    priority: 'low',
    tags: ['comfort', 'ritual', 'warmth', 'self-care'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Coffee className="w-5 h-5 text-amber-500" />
  },

  // Grief Support
  {
    id: 'grief-memory',
    title: '💭 Honor the Memory',
    description: 'Light a candle, look at photos, or share a story about your loved one.',
    category: 'Grief',
    priority: 'medium',
    tags: ['grief', 'memory', 'honor', 'loss'],
    isHotline: false,
    available24_7: true,
    type: 'exercise',
    icon: <Star className="w-5 h-5 text-yellow-400" />
  },
  {
    id: 'grief-community',
    title: '🤝 Grief Support Groups',
    description: 'Connect with others who understand your loss. You\'re not alone in grief.',
    category: 'Grief',
    priority: 'medium',
    tags: ['grief', 'support group', 'community', 'shared experience'],
    isHotline: false,
    available24_7: false,
    type: 'support',
    icon: <User className="w-5 h-5 text-blue-400" />
  }
];

const ResourceCard: React.FC<{ 
  resource: CrisisResource;
  onClick?: () => void;
}> = ({ resource, onClick }) => {
  const priorityColors = {
    urgent: 'border-red-500 bg-red-50 shadow-red-100',
    high: 'border-orange-500 bg-orange-50 shadow-orange-100',
    medium: 'border-blue-500 bg-blue-50 shadow-blue-100',
    low: 'border-green-500 bg-green-50 shadow-green-100'
  };

  const handleAction = () => {
    if (resource.contact && resource.isHotline) {
      if (resource.contact.includes('Text')) {
        window.open('sms:741741?body=HOME', '_blank');
      } else {
        window.open(`tel:${resource.contact.replace(/[^\d]/g, '')}`, '_blank');
      }
    } else if (resource.link) {
      window.open(resource.link, '_blank');
    }
    onClick?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'p-6 border-2 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105',
        priorityColors[resource.priority]
      )}
      onClick={handleAction}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {resource.icon}
          <div>
            <h3 className="font-bold text-lg text-gray-900">{resource.title}</h3>
            {resource.available24_7 && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                24/7 Available
              </span>
            )}
          </div>
        </div>
        {resource.priority === 'urgent' && (
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            URGENT
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">{resource.description}</p>

      {/* Contact/Action */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {resource.contact ? (
            <div className="font-bold text-lg">
              {resource.isHotline ? (
                <span className="text-red-600">{resource.contact}</span>
              ) : (
                <span className="text-blue-600">{resource.contact}</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Click for more information
            </div>
          )}
        </div>
        
        {(resource.contact || resource.link) && (
          <div className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            resource.isHotline 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}>
            {resource.isHotline ? 'Call Now' : 'Learn More'}
            <ExternalLink className="w-4 h-4 ml-2 inline" />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {resource.tags.slice(0, 3).map((tag) => (
          <span 
            key={tag}
            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export const CrisisResourcesView: React.FC<CrisisResourcesViewProps> = ({
  onResourceClick,
  className
}) => {
  const [resources, setResources] = useState<CrisisResource[]>(FALLBACK_RESOURCES);
  const [filteredResources, setFilteredResources] = useState<CrisisResource[]>(FALLBACK_RESOURCES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Filter resources based on category, search, and urgency
  useEffect(() => {
    let results = resources;

    // Filter by urgency first (crisis mode)
    if (showUrgentOnly) {
      results = results.filter(r => r.priority === 'urgent' || r.priority === 'high');
    }

    // Filter by category
    if (activeCategory !== 'All') {
      results = results.filter(r => r.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        r.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        r.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // Sort by priority (urgent first)
    results.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setFilteredResources(results);
  }, [activeCategory, searchTerm, resources, showUrgentOnly]);

  const emergencyResources = filteredResources.filter(r => r.priority === 'urgent');
  const otherResources = filteredResources.filter(r => r.priority !== 'urgent');

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Crisis Resources & Support
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Free, immediate crisis support and coping strategies available 24/7. 
          All resources are completely free and confidential.
        </p>
      </div>

      {/* Emergency Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowUrgentOnly(!showUrgentOnly)}
          className={cn(
            'px-6 py-3 rounded-full font-medium text-lg transition-all',
            showUrgentOnly
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          )}
        >
          {showUrgentOnly ? '🆘 Crisis Mode Active' : '🆘 Crisis Mode'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RESOURCE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {RESOURCE_CATEGORIES.slice(1).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-3 py-1 rounded-full text-sm transition-colors',
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Resources (Always Visible) */}
      {emergencyResources.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Immediate Crisis Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {emergencyResources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onClick={() => onResourceClick?.(resource)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Other Resources */}
      {otherResources.length > 0 && !showUrgentOnly && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2" />
            Support & Coping Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {otherResources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onClick={() => onResourceClick?.(resource)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('All');
              setShowUrgentOnly(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center text-blue-800">
          <Shield className="w-5 h-5 mr-2" />
          <p className="text-sm font-medium">
            All resources are completely FREE and confidential. No registration required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisResourcesView;