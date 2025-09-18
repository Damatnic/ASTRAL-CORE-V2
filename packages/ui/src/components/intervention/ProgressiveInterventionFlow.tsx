import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Users, Heart, Shield, Phone, MessageSquare,
  BookOpen, Headphones, Video, Siren, ChevronRight, CheckCircle,
  Activity, Brain, Sparkles, LifeBuoy, ArrowUp, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

// FREE intervention levels - no paid tiers
type InterventionLevel = 
  | 'self-help'        // Level 1: Self-guided resources
  | 'peer-support'     // Level 2: Community peer support
  | 'volunteer'        // Level 3: Trained volunteer
  | 'professional'     // Level 4: Professional counselor
  | 'emergency';       // Level 5: Emergency services

interface InterventionStep {
  level: InterventionLevel;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  actions: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: () => void;
    icon?: React.ElementType;
  }>;
  resources: Array<{
    title: string;
    type: 'article' | 'video' | 'audio' | 'tool';
    duration?: string;
    free: boolean; // Always true
  }>;
  timeEstimate: string;
  successRate: number; // Percentage
}

interface ProgressiveInterventionFlowProps {
  initialLevel?: InterventionLevel;
  onLevelChange?: (level: InterventionLevel) => void;
  autoEscalate?: boolean;
  className?: string;
}

export const ProgressiveInterventionFlow: React.FC<ProgressiveInterventionFlowProps> = ({
  initialLevel = 'self-help',
  onLevelChange,
  autoEscalate = true,
  className,
}) => {
  const { emotionalState, urgencyLevel, getInterventionRecommendation } = useEmotionTheme();
  const [currentLevel, setCurrentLevel] = useState<InterventionLevel>(initialLevel);
  const [escalationTimer, setEscalationTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeInLevel, setTimeInLevel] = useState(0);
  const [userEngagement, setUserEngagement] = useState<'engaged' | 'idle' | 'declining'>('engaged');
  const [showEscalationPrompt, setShowEscalationPrompt] = useState(false);

  // Define intervention steps
  const interventionSteps: Record<InterventionLevel, InterventionStep> = {
    'self-help': {
      level: 'self-help',
      title: 'Self-Help Resources',
      description: 'Explore FREE coping strategies and self-assessment tools',
      icon: BookOpen,
      color: 'bg-green-500',
      actions: [
        {
          label: 'Breathing Exercises',
          type: 'primary',
          action: () => console.log('Open breathing exercises'),
          icon: Brain,
        },
        {
          label: 'Mood Journal',
          type: 'secondary',
          action: () => console.log('Open mood journal'),
          icon: BookOpen,
        },
      ],
      resources: [
        { title: 'Grounding Techniques', type: 'article', duration: '5 min', free: true },
        { title: 'Guided Meditation', type: 'audio', duration: '10 min', free: true },
        { title: 'Crisis Safety Plan', type: 'tool', free: true },
      ],
      timeEstimate: '5-15 minutes',
      successRate: 65,
    },
    'peer-support': {
      level: 'peer-support',
      title: 'Peer Support Community',
      description: 'Connect with others who understand - completely FREE',
      icon: Users,
      color: 'bg-blue-500',
      actions: [
        {
          label: 'Join Support Group',
          type: 'primary',
          action: () => console.log('Join group'),
          icon: Users,
        },
        {
          label: 'Peer Chat',
          type: 'secondary',
          action: () => console.log('Start peer chat'),
          icon: MessageSquare,
        },
      ],
      resources: [
        { title: 'Community Forums', type: 'article', free: true },
        { title: 'Peer Stories', type: 'video', duration: '8 min', free: true },
        { title: 'Support Group Schedule', type: 'tool', free: true },
      ],
      timeEstimate: '15-30 minutes',
      successRate: 72,
    },
    'volunteer': {
      level: 'volunteer',
      title: 'Trained Volunteer Support',
      description: 'FREE one-on-one support from certified crisis volunteers',
      icon: Heart,
      color: 'bg-purple-500',
      actions: [
        {
          label: 'Chat with Volunteer',
          type: 'primary',
          action: () => console.log('Connect to volunteer'),
          icon: MessageSquare,
        },
        {
          label: 'Voice Call',
          type: 'secondary',
          action: () => console.log('Start voice call'),
          icon: Phone,
        },
      ],
      resources: [
        { title: 'What to Expect', type: 'article', duration: '3 min', free: true },
        { title: 'Volunteer Profiles', type: 'tool', free: true },
        { title: 'Crisis Coping Skills', type: 'video', duration: '12 min', free: true },
      ],
      timeEstimate: '30-60 minutes',
      successRate: 85,
    },
    'professional': {
      level: 'professional',
      title: 'Professional Crisis Counselor',
      description: 'FREE access to licensed mental health professionals',
      icon: Shield,
      color: 'bg-orange-500',
      actions: [
        {
          label: 'Crisis Counselor Now',
          type: 'primary',
          action: () => console.log('Connect to counselor'),
          icon: Video,
        },
        {
          label: 'Schedule Session',
          type: 'secondary',
          action: () => console.log('Schedule'),
          icon: Clock,
        },
      ],
      resources: [
        { title: 'Crisis Assessment', type: 'tool', free: true },
        { title: 'Safety Planning', type: 'article', free: true },
        { title: 'Therapeutic Techniques', type: 'video', duration: '15 min', free: true },
      ],
      timeEstimate: '45-90 minutes',
      successRate: 92,
    },
    'emergency': {
      level: 'emergency',
      title: 'Emergency Services',
      description: 'Immediate professional intervention for life-threatening situations',
      icon: Siren,
      color: 'bg-red-600',
      actions: [
        {
          label: 'Call 911',
          type: 'primary',
          action: () => window.location.href = 'tel:911',
          icon: Phone,
        },
        {
          label: 'Crisis Hotline 988',
          type: 'primary',
          action: () => window.location.href = 'tel:988',
          icon: Phone,
        },
      ],
      resources: [
        { title: 'Emergency Contacts', type: 'tool', free: true },
        { title: 'What Happens Next', type: 'article', free: true },
        { title: 'Hospital Resources', type: 'tool', free: true },
      ],
      timeEstimate: 'Immediate',
      successRate: 98,
    },
  };

  // Auto-escalation logic
  useEffect(() => {
    if (autoEscalate && userEngagement === 'declining') {
      const timer = setTimeout(() => {
        suggestEscalation();
      }, 180000); // 3 minutes
      setEscalationTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [autoEscalate, userEngagement]);

  // Monitor urgency changes
  useEffect(() => {
    if (urgencyLevel === 'immediate' && currentLevel !== 'emergency') {
      escalateToLevel('emergency');
    } else if (urgencyLevel === 'high' && currentLevel === 'self-help') {
      escalateToLevel('volunteer');
    }
  }, [urgencyLevel, currentLevel]);

  const escalateToLevel = (level: InterventionLevel) => {
    setCurrentLevel(level);
    setTimeInLevel(0);
    setShowEscalationPrompt(false);
    if (onLevelChange) onLevelChange(level);
  };

  const suggestEscalation = () => {
    setShowEscalationPrompt(true);
  };

  const getNextLevel = (current: InterventionLevel): InterventionLevel | null => {
    const levels: InterventionLevel[] = ['self-help', 'peer-support', 'volunteer', 'professional', 'emergency'];
    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getPreviousLevel = (current: InterventionLevel): InterventionLevel | null => {
    const levels: InterventionLevel[] = ['self-help', 'peer-support', 'volunteer', 'professional', 'emergency'];
    const currentIndex = levels.indexOf(current);
    return currentIndex > 0 ? levels[currentIndex - 1] : null;
  };

  const currentStep = interventionSteps[currentLevel];
  const nextLevel = getNextLevel(currentLevel);
  const previousLevel = getPreviousLevel(currentLevel);

  return (
    <div className={cn('bg-white rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Crisis Support Pathway</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-blue-100">All services are 100% FREE</span>
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5" />
            <span className="text-sm">24/7 Support Available</span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            {Object.keys(interventionSteps).map((level, index) => (
              <div
                key={level}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                  level === currentLevel
                    ? 'bg-white text-blue-600 scale-110'
                    : Object.keys(interventionSteps).indexOf(level) < Object.keys(interventionSteps).indexOf(currentLevel)
                    ? 'bg-white/50 text-white'
                    : 'bg-white/20 text-white/60'
                )}
              >
                {level === currentLevel ? (
                  <Activity className="w-5 h-5" />
                ) : Object.keys(interventionSteps).indexOf(level) < Object.keys(interventionSteps).indexOf(currentLevel) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-white transition-all -z-10"
            style={{
              width: `${(Object.keys(interventionSteps).indexOf(currentLevel) / (Object.keys(interventionSteps).length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Level Labels */}
        <div className="flex justify-between mt-2">
          {Object.entries(interventionSteps).map(([key, step]) => (
            <span
              key={key}
              className={cn(
                'text-xs',
                key === currentLevel ? 'text-white font-semibold' : 'text-blue-100'
              )}
            >
              {key === 'self-help' && 'Self'}
              {key === 'peer-support' && 'Peer'}
              {key === 'volunteer' && 'Volunteer'}
              {key === 'professional' && 'Professional'}
              {key === 'emergency' && 'Emergency'}
            </span>
          ))}
        </div>
      </div>

      {/* Escalation Prompt */}
      {showEscalationPrompt && nextLevel && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  Would you like additional support?
                </p>
                <p className="text-sm text-yellow-700">
                  You can escalate to {interventionSteps[nextLevel].title} for more help
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => escalateToLevel(nextLevel)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Yes, Get More Help
              </button>
              <button
                onClick={() => setShowEscalationPrompt(false)}
                className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
              >
                No, I'm OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Level Content */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={cn('p-3 rounded-lg text-white mr-4', currentStep.color)}>
            <currentStep.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentStep.title}</h3>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
        </div>

        {/* Success Rate & Time Estimate */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-gray-900">{currentStep.successRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${currentStep.successRate}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-600">Time Needed</span>
                <p className="text-sm font-semibold text-gray-900">{currentStep.timeEstimate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {currentStep.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all',
                action.type === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <div className="flex items-center space-x-3">
                {action.icon && <action.icon className="w-5 h-5" />}
                <span className="font-medium">{action.label}</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">FREE Resources Available</h4>
          <div className="space-y-2">
            {currentStep.resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {resource.type === 'article' && <BookOpen className="w-4 h-4 text-gray-400" />}
                  {resource.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                  {resource.type === 'audio' && <Headphones className="w-4 h-4 text-gray-400" />}
                  {resource.type === 'tool' && <Sparkles className="w-4 h-4 text-gray-400" />}
                  <div>
                    <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                    {resource.duration && (
                      <span className="text-xs text-gray-500 ml-2">{resource.duration}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  FREE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          {previousLevel ? (
            <button
              onClick={() => escalateToLevel(previousLevel)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Less intensive support
            </button>
          ) : (
            <div />
          )}
          {nextLevel && (
            <button
              onClick={() => escalateToLevel(nextLevel)}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Need more help</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Emergency Override */}
      {currentLevel !== 'emergency' && (
        <div className="bg-red-50 border-t border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">
                In immediate danger? Skip to emergency help
              </span>
            </div>
            <button
              onClick={() => escalateToLevel('emergency')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Get Emergency Help
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveInterventionFlow;