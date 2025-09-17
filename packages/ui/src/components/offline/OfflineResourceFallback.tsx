import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WifiOff, Phone, MessageCircle, AlertTriangle, Heart,
  Download, CheckCircle, Wind, Brain, Users, Shield,
  Activity, Coffee, Star, LifeBuoy, Home, Book, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface OfflineResource {
  id: string;
  title: string;
  category: 'emergency' | 'breathing' | 'grounding' | 'coping' | 'information';
  priority: 'critical' | 'high' | 'medium' | 'low';
  content: string;
  instructions?: string[];
  duration?: number;
  icon: React.ReactNode;
  color: string;
  isDownloaded?: boolean;
}

interface OfflineResourceFallbackProps {
  isOffline?: boolean;
  onResourceUse?: (resource: OfflineResource) => void;
  className?: string;
}

// Critical offline resources that work without internet
const OFFLINE_RESOURCES: OfflineResource[] = [
  // Emergency Contacts (Critical)
  {
    id: 'emergency-988',
    title: '988 Crisis Lifeline',
    category: 'emergency',
    priority: 'critical',
    content: 'Call 988 for immediate crisis support. Available 24/7, free and confidential.',
    icon: <Phone className="w-6 h-6" />,
    color: 'bg-red-500',
    isDownloaded: true
  },
  {
    id: 'emergency-text',
    title: 'Crisis Text Line',
    category: 'emergency',
    priority: 'critical',
    content: 'Text HOME to 741741 for crisis support via text message. Free and confidential.',
    icon: <MessageCircle className="w-6 h-6" />,
    color: 'bg-blue-500',
    isDownloaded: true
  },
  {
    id: 'emergency-911',
    title: 'Emergency Services',
    category: 'emergency',
    priority: 'critical',
    content: 'Call 911 for immediate life-threatening emergencies requiring police, fire, or medical response.',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'bg-red-600',
    isDownloaded: true
  },

  // Breathing Exercises (High Priority)
  {
    id: 'breathing-box',
    title: 'Box Breathing',
    category: 'breathing',
    priority: 'high',
    content: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 8 times.',
    instructions: [
      'Sit comfortably with your back straight',
      'Exhale completely through your mouth',
      'Breathe in through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 8 times'
    ],
    duration: 128,
    icon: <Wind className="w-6 h-6" />,
    color: 'bg-cyan-500',
    isDownloaded: true
  },
  {
    id: 'breathing-478',
    title: '4-7-8 Breathing',
    category: 'breathing',
    priority: 'high',
    content: 'Breathe in for 4, hold for 7, breathe out for 8. Natural tranquilizer for anxiety.',
    instructions: [
      'Place tongue tip against roof of mouth behind front teeth',
      'Exhale completely through mouth',
      'Close mouth, breathe in through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat 4 times'
    ],
    duration: 76,
    icon: <Wind className="w-6 h-6" />,
    color: 'bg-purple-500',
    isDownloaded: true
  },

  // Grounding Techniques (High Priority)
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    category: 'grounding',
    priority: 'high',
    content: 'Use your 5 senses to ground yourself in the present moment.',
    instructions: [
      'Name 5 things you can see around you',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ],
    duration: 300,
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-purple-500',
    isDownloaded: true
  },
  {
    id: 'grounding-physical',
    title: 'Physical Grounding',
    category: 'grounding',
    priority: 'high',
    content: 'Use physical sensations to anchor yourself when feeling disconnected.',
    instructions: [
      'Plant your feet firmly on the ground',
      'Press your palms together firmly',
      'Squeeze your hands into fists, then release',
      'Tense your shoulders, then let them drop',
      'Feel the weight of your body in the chair'
    ],
    duration: 180,
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-green-500',
    isDownloaded: true
  },

  // Quick Coping Strategies (Medium Priority)
  {
    id: 'coping-ice',
    title: 'Ice Cube Technique',
    category: 'coping',
    priority: 'medium',
    content: 'Hold ice cubes or splash cold water on your face to interrupt intense emotions.',
    instructions: [
      'Get ice cubes from freezer or run cold water',
      'Hold ice in your hands or splash face with cold water',
      'Focus on the intense cold sensation',
      'Notice how the cold interrupts your emotional intensity',
      'Continue for 30-60 seconds'
    ],
    duration: 60,
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-cyan-400',
    isDownloaded: true
  },
  {
    id: 'coping-movement',
    title: 'Emergency Movement',
    category: 'coping',
    priority: 'medium',
    content: 'Quick physical activities to release stress and anxiety.',
    instructions: [
      'Do 10 jumping jacks or run in place',
      'Shake your hands vigorously for 30 seconds',
      'Do 5 deep squats',
      'Take 10 steps forward and backward',
      'Stretch your arms above your head'
    ],
    duration: 120,
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-orange-500',
    isDownloaded: true
  },

  // Self-Care Activities (Medium Priority)
  {
    id: 'selfcare-warm-drink',
    title: 'Warm Drink Ritual',
    category: 'coping',
    priority: 'medium',
    content: 'Make a warm drink mindfully to create comfort and routine.',
    instructions: [
      'Choose tea, coffee, or hot chocolate',
      'Focus on each step of preparation',
      'Notice the steam, smell, and warmth',
      'Hold the warm cup in your hands',
      'Sip slowly and mindfully'
    ],
    duration: 300,
    icon: <Coffee className="w-6 h-6" />,
    color: 'bg-amber-500',
    isDownloaded: true
  },

  // Safety Information (Low Priority)
  {
    id: 'info-safety-plan',
    title: 'Create a Safety Plan',
    category: 'information',
    priority: 'low',
    content: 'Steps to create a personal safety plan for crisis moments.',
    instructions: [
      'Identify your warning signs',
      'List coping strategies that help',
      'Write down supportive people to contact',
      'Remove or secure items that could cause harm',
      'Write down reasons for living',
      'List professional and crisis contacts'
    ],
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-blue-500',
    isDownloaded: true
  },
  {
    id: 'info-self-care',
    title: 'Emergency Self-Care Kit',
    category: 'information',
    priority: 'low',
    content: 'Ideas for immediate self-care when feeling overwhelmed.',
    instructions: [
      'Take a hot shower or bath',
      'Wrap yourself in a soft blanket',
      'Listen to calming music',
      'Look at photos that make you happy',
      'Pet an animal if available',
      'Write in a journal',
      'Do something creative with your hands'
    ],
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500',
    isDownloaded: true
  }
];

const ResourceCard: React.FC<{
  resource: OfflineResource;
  isOffline: boolean;
  onUse: () => void;
}> = ({ resource, isOffline, onUse }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUsing, setIsUsing] = useState(false);

  const handleUse = () => {
    setIsUsing(true);
    onUse();
    
    if (resource.category === 'emergency') {
      // For emergency resources, attempt to make call/text
      if (resource.id === 'emergency-988') {
        window.location.href = 'tel:988';
      } else if (resource.id === 'emergency-text') {
        window.location.href = 'sms:741741?body=HOME';
      } else if (resource.id === 'emergency-911') {
        window.location.href = 'tel:911';
      }
    }
  };

  const getPriorityColor = () => {
    switch (resource.priority) {
      case 'critical': return 'border-red-500 bg-red-50 shadow-red-100';
      case 'high': return 'border-orange-500 bg-orange-50 shadow-orange-100';
      case 'medium': return 'border-blue-500 bg-blue-50 shadow-blue-100';
      case 'low': return 'border-green-500 bg-green-50 shadow-green-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border-2 rounded-xl p-4 shadow-lg transition-all cursor-pointer',
        getPriorityColor()
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg text-white', resource.color)}>
            {resource.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{resource.title}</h3>
            <div className="flex items-center space-x-2">
              {resource.priority === 'critical' && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  CRITICAL
                </span>
              )}
              {isOffline && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✓ Available Offline
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUse();
          }}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            resource.category === 'emergency'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {resource.category === 'emergency' ? 'Call Now' : 'Use Now'}
        </button>
      </div>

      <p className="text-gray-700 mb-3">{resource.content}</p>

      <AnimatePresence>
        {isExpanded && resource.instructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg"
          >
            <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {resource.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
            {resource.duration && (
              <div className="mt-3 text-sm text-gray-600">
                Duration: {Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const OfflineResourceFallback: React.FC<OfflineResourceFallbackProps> = ({
  isOffline: propIsOffline,
  onResourceUse,
  className
}) => {
  const [isOffline, setIsOffline] = useState(propIsOffline || !navigator.onLine);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Force offline mode if prop is passed
  useEffect(() => {
    if (propIsOffline !== undefined) {
      setIsOffline(propIsOffline);
    }
  }, [propIsOffline]);

  const handleResourceUse = (resource: OfflineResource) => {
    onResourceUse?.(resource);
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'breathing', label: 'Breathing', icon: <Wind className="w-4 h-4" /> },
    { id: 'grounding', label: 'Grounding', icon: <Brain className="w-4 h-4" /> },
    { id: 'coping', label: 'Coping', icon: <Activity className="w-4 h-4" /> },
    { id: 'information', label: 'Information', icon: <Book className="w-4 h-4" /> }
  ];

  const filteredResources = selectedCategory === 'all' 
    ? OFFLINE_RESOURCES 
    : OFFLINE_RESOURCES.filter(resource => resource.category === selectedCategory);

  // Sort by priority
  const sortedResources = filteredResources.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          {isOffline && <WifiOff className="w-8 h-8 text-orange-500" />}
          <h1 className="text-3xl font-bold text-gray-900">
            {isOffline ? 'Offline Crisis Resources' : 'Emergency Resource Library'}
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {isOffline 
            ? 'Your internet connection is unavailable, but these critical resources work offline'
            : 'Essential crisis support resources available even without internet connection'
          }
        </p>
      </div>

      {/* Connection Status */}
      {isOffline && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="font-medium text-orange-800">You're currently offline</h3>
              <p className="text-orange-700 text-sm">
                All resources below are available without internet connection. Emergency calls still work.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Emergency Section - Always Visible */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2" />
          Immediate Crisis Support
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OFFLINE_RESOURCES.filter(r => r.category === 'emergency').map(resource => (
            <motion.button
              key={resource.id}
              onClick={() => {
                if (resource.id === 'emergency-988') {
                  window.location.href = 'tel:988';
                } else if (resource.id === 'emergency-text') {
                  window.location.href = 'sms:741741?body=HOME';
                } else if (resource.id === 'emergency-911') {
                  window.location.href = 'tel:911';
                }
                handleResourceUse(resource);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn('p-2 rounded-lg text-white', resource.color)}>
                  {resource.icon}
                </div>
                <h3 className="font-bold text-gray-900">{resource.title}</h3>
              </div>
              <p className="text-sm text-gray-700">{resource.content}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isOffline={isOffline}
            onUse={() => handleResourceUse(resource)}
          />
        ))}
      </div>

      {/* Footer Information */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <CheckCircle className="w-6 h-6 text-blue-500" />
          <h3 className="font-medium text-blue-900">All Resources Work Offline</h3>
        </div>
        <p className="text-blue-800 mb-4">
          These resources are designed to work without an internet connection. Emergency phone numbers 
          will work as long as you have cellular service.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">What works offline:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Emergency phone calls (988, 911)</li>
              <li>• Crisis text messages (741741)</li>
              <li>• All breathing exercises</li>
              <li>• Grounding techniques</li>
              <li>• Self-care instructions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">When you're back online:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Access full crisis chat support</li>
              <li>• Browse complete resource library</li>
              <li>• Connect with peer supporters</li>
              <li>• Use interactive safety planning</li>
              <li>• Track mood and wellness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineResourceFallback;