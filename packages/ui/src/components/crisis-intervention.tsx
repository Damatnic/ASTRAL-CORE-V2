import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from './base';
import { Badge } from './base';
import { Progress } from './base';
import { Alert } from './base';

// Status Indicator Component
export interface StatusIndicatorProps {
  status: 'connecting' | 'connected' | 'volunteer_assigned' | 'emergency' | 'disconnected';
  responseTime?: number;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  responseTime,
  className
}) => {
  const statusConfig = {
    connecting: {
      label: 'Connecting...',
      variant: 'warning' as const,
      color: 'bg-warning-500',
      animate: true
    },
    connected: {
      label: 'Connected',
      variant: 'success' as const,
      color: 'bg-success-500',
      animate: false
    },
    volunteer_assigned: {
      label: 'Volunteer Assigned',
      variant: 'primary' as const,
      color: 'bg-primary-500',
      animate: false
    },
    emergency: {
      label: 'Emergency Mode',
      variant: 'crisis' as const,
      color: 'bg-crisis-500',
      animate: true
    },
    disconnected: {
      label: 'Disconnected',
      variant: 'default' as const,
      color: 'bg-gray-400',
      animate: false
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          config.color,
          config.animate && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      <Badge variant={config.variant} size="sm">
        {config.label}
      </Badge>
      {responseTime && (
        <span className="text-xs text-gray-500">
          {responseTime}s response time
        </span>
      )}
    </div>
  );
};

// Crisis Assessment Scale Component
export interface CrisisScaleProps {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  onLevelChange?: (level: 1 | 2 | 3 | 4 | 5) => void;
  readonly?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const CrisisScale: React.FC<CrisisScaleProps> = ({
  currentLevel,
  onLevelChange,
  readonly = false,
  showLabels = true,
  className
}) => {
  const levels = [
    { value: 1, label: 'Low Risk', color: 'bg-success-500', textColor: 'text-success-700' },
    { value: 2, label: 'Moderate', color: 'bg-warning-400', textColor: 'text-warning-700' },
    { value: 3, label: 'High Risk', color: 'bg-warning-500', textColor: 'text-warning-800' },
    { value: 4, label: 'Critical', color: 'bg-crisis-500', textColor: 'text-crisis-700' },
    { value: 5, label: 'Emergency', color: 'bg-crisis-600', textColor: 'text-crisis-800' }
  ] as const;

  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Crisis Level</span>
          <span className={levels[currentLevel - 1].textColor}>
            {levels[currentLevel - 1].label}
          </span>
        </div>
      )}
      
      <div className="flex space-x-1">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => !readonly && onLevelChange?.(level.value)}
            disabled={readonly}
            className={cn(
              'flex-1 h-8 rounded transition-all duration-200',
              currentLevel >= level.value ? level.color : 'bg-gray-200',
              !readonly && 'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              readonly && 'cursor-default'
            )}
            aria-label={`Crisis level ${level.value}: ${level.label}`}
            role="radio"
            aria-checked={currentLevel === level.value}
          />
        ))}
      </div>
    </div>
  );
};

// Real-time Response Timer
export interface ResponseTimerProps {
  startTime: Date;
  targetTime?: number; // seconds
  onTargetExceeded?: () => void;
  className?: string;
}

export const ResponseTimer: React.FC<ResponseTimerProps> = ({
  startTime,
  targetTime = 30,
  onTargetExceeded,
  className
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [hasExceededTarget, setHasExceededTarget] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = startTime.getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      
      setElapsed(elapsedSeconds);
      
      if (elapsedSeconds > targetTime && !hasExceededTarget) {
        setHasExceededTarget(true);
        onTargetExceeded?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, targetTime, hasExceededTarget, onTargetExceeded]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const isOverTarget = elapsed > targetTime;
  const progressPercentage = Math.min((elapsed / targetTime) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Response Time</span>
        <span className={cn(
          'text-sm font-mono',
          isOverTarget ? 'text-crisis-600' : 'text-gray-900'
        )}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      
      <Progress
        value={progressPercentage}
        variant={isOverTarget ? 'crisis' : 'default'}
        size="sm"
      />
      
      {isOverTarget && (
        <Alert variant="crisis" title="Response Time Exceeded">
          Target response time of {targetTime}s has been exceeded.
        </Alert>
      )}
    </div>
  );
};

// Emergency Contact Quick Dial
export interface EmergencyContactsProps {
  contacts?: {
    id: string;
    name: string;
    number: string;
    type: 'crisis_line' | 'emergency' | 'family' | 'friend' | 'therapist';
  }[];
  onCall?: (contactId: string) => void;
  className?: string;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts = [],
  onCall,
  className
}) => {
  const defaultContacts = [
    {
      id: 'crisis-line',
      name: 'Crisis Hotline',
      number: '988',
      type: 'crisis_line' as const
    },
    {
      id: 'emergency',
      name: 'Emergency',
      number: '911',
      type: 'emergency' as const
    }
  ];

  const allContacts = [...defaultContacts, ...contacts];

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'crisis_line':
        return '🆘';
      case 'emergency':
        return '🚨';
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'friend':
        return '👥';
      case 'therapist':
        return '👩‍⚕️';
      default:
        return '📞';
    }
  };

  const getContactVariant = (type: string) => {
    switch (type) {
      case 'crisis_line':
        return 'crisis' as const;
      case 'emergency':
        return 'crisis' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Emergency Contacts
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {allContacts.map((contact) => (
          <Button
            key={contact.id}
            variant={getContactVariant(contact.type)}
            size="sm"
            onClick={() => onCall?.(contact.id)}
            className="justify-start h-auto p-3"
          >
            <span className="mr-2 text-lg" aria-hidden="true">
              {getContactIcon(contact.type)}
            </span>
            <div className="text-left">
              <div className="font-medium">{contact.name}</div>
              <div className="text-xs opacity-75">{contact.number}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

// Safety Plan Quick Access
export interface SafetyPlanProps {
  safetySteps?: string[];
  copingStrategies?: string[];
  onStepComplete?: (stepIndex: number) => void;
  className?: string;
}

export const SafetyPlan: React.FC<SafetyPlanProps> = ({
  safetySteps = [],
  copingStrategies = [],
  onStepComplete,
  className
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const defaultSteps = [
    'Take slow, deep breaths',
    'Find a safe, comfortable space',
    'Contact your support person',
    'Use your coping strategies',
    'Seek professional help if needed'
  ];

  const defaultCoping = [
    'Listen to calming music',
    'Practice mindfulness',
    'Write in a journal',
    'Do light exercise or stretching',
    'Talk to a trusted friend'
  ];

  const steps = safetySteps.length > 0 ? safetySteps : defaultSteps;
  const coping = copingStrategies.length > 0 ? copingStrategies : defaultCoping;

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
      onStepComplete?.(index);
    }
    setCompletedSteps(newCompleted);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Safety Steps
        </h3>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <label
              key={index}
              className="flex items-start space-x-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={completedSteps.has(index)}
                onChange={() => toggleStep(index)}
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className={cn(
                'text-sm flex-1 transition-all duration-200',
                completedSteps.has(index) 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-900 group-hover:text-primary-600'
              )}>
                {step}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Coping Strategies
        </h3>
        <div className="flex flex-wrap gap-2">
          {coping.map((strategy, index) => (
            <Badge
              key={index}
              variant="default"
              className="cursor-pointer hover:bg-primary-100 hover:text-primary-800 transition-colors"
            >
              {strategy}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};