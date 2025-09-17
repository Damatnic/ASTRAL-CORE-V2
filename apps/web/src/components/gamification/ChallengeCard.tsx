'use client';

/**
 * Challenge Card Component - Xbox/PlayStation Style
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Gaming console-inspired challenge cards
 * - Difficulty-based visual styling
 * - Progress tracking with animations
 * - Mental health appropriate challenges
 * - Accessibility-compliant design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Clock,
  Trophy,
  Star,
  Zap,
  Calendar,
  Users,
  Heart,
  Brain,
  Shield,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Award,
  Timer,
  Flame,
} from 'lucide-react';
import { Challenge, ChallengeDifficulty, ChallengeStatus, ChallengeType } from '@astralcore/shared/types/gamification';
import ProgressBar from './ProgressBar';

interface ChallengeCardProps {
  challenge: Challenge;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showParticipants?: boolean;
  onActivate?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
  onPause?: (challengeId: string) => void;
  className?: string;
  'data-testid'?: string;
}

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    name: 'Easy',
    color: '#10B981',
    gradient: 'from-green-500 to-green-600',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    icon: Target,
    multiplier: 1,
  },
  medium: {
    name: 'Medium',
    color: '#F59E0B',
    gradient: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    icon: Zap,
    multiplier: 1.5,
  },
  hard: {
    name: 'Hard',
    color: '#EF4444',
    gradient: 'from-red-500 to-red-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/10',
    icon: Flame,
    multiplier: 2,
  },
};

// Challenge type icons
const TYPE_ICONS = {
  daily: Calendar,
  weekly: Clock,
  monthly: Trophy,
  special: Star,
};

// Status configurations
const STATUS_CONFIG = {
  available: {
    name: 'Available',
    color: '#3B82F6',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
  },
  active: {
    name: 'Active',
    color: '#10B981',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
  },
  completed: {
    name: 'Completed',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
  },
  expired: {
    name: 'Expired',
    color: '#6B7280',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
  },
  locked: {
    name: 'Locked',
    color: '#374151',
    bgColor: 'bg-gray-600/20',
    textColor: 'text-gray-500',
  },
};

// Size configurations
const SIZE_CONFIG = {
  small: {
    container: 'w-64 h-32',
    padding: 'p-3',
    titleSize: 'text-sm',
    descSize: 'text-xs',
    iconSize: 'w-4 h-4',
  },
  medium: {
    container: 'w-80 h-40',
    padding: 'p-4',
    titleSize: 'text-base',
    descSize: 'text-sm',
    iconSize: 'w-5 h-5',
  },
  large: {
    container: 'w-96 h-48',
    padding: 'p-6',
    titleSize: 'text-lg',
    descSize: 'text-base',
    iconSize: 'w-6 h-6',
  },
};

function ChallengeCard({
  challenge,
  size = 'medium',
  showProgress = true,
  showParticipants = false,
  onActivate,
  onComplete,
  onPause,
  className = '',
  'data-testid': testId,
}: ChallengeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  const statusConfig = STATUS_CONFIG[challenge.status];
  const sizeConfig = SIZE_CONFIG[size];
  const TypeIcon = TYPE_ICONS[challenge.type];
  const DifficultyIcon = difficultyConfig.icon;
  
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  const isLocked = challenge.status === 'locked';
  const isExpired = challenge.status === 'expired';
  
  const progress = challenge.progress || 0;
  const timeRemaining = challenge.endDate ? Math.max(0, challenge.endDate.getTime() - Date.now()) : 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  const handleAction = () => {
    if (isLocked || isExpired) return;
    
    if (challenge.status === 'available') {
      onActivate?.(challenge.id);
    } else if (challenge.status === 'active' && progress >= 100) {
      onComplete?.(challenge.id);
    } else if (challenge.status === 'active') {
      onPause?.(challenge.id);
    }
  };

  const getActionIcon = () => {
    if (isCompleted) return CheckCircle;
    if (isActive && progress >= 100) return Award;
    if (isActive) return Pause;
    if (challenge.status === 'available') return Play;
    return Target;
  };

  const getActionText = () => {
    if (isCompleted) return 'Completed';
    if (isActive && progress >= 100) return 'Claim Reward';
    if (isActive) return 'Pause';
    if (challenge.status === 'available') return 'Start';
    if (isLocked) return 'Locked';
    if (isExpired) return 'Expired';
    return 'View';
  };

  const ActionIcon = getActionIcon();

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl border-2 
        ${difficultyConfig.borderColor} ${difficultyConfig.bgColor}
        ${sizeConfig.container} ${sizeConfig.padding} ${className}
        ${isLocked || isExpired ? 'opacity-60 grayscale' : ''}
        cursor-pointer group
      `}
      data-testid={testId}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAction}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${difficultyConfig.gradient} opacity-10`}
      />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, ${difficultyConfig.color}40 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, ${difficultyConfig.color}40 0%, transparent 50%)`,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${difficultyConfig.color}20` }}
          >
            <TypeIcon 
              className={`${sizeConfig.iconSize}`}
              style={{ color: difficultyConfig.color }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`${sizeConfig.titleSize} font-bold text-white`}>
                {challenge.title}
              </span>
              <DifficultyIcon 
                className="w-3 h-3"
                style={{ color: difficultyConfig.color }}
              />
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span 
                className={`text-xs px-2 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                {statusConfig.name}
              </span>
              <span className="text-xs text-gray-400">
                {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Time remaining */}
        {timeRemaining > 0 && !isCompleted && (
          <div className="text-right">
            <div className="flex items-center space-x-1 text-gray-400">
              <Timer className="w-3 h-3" />
              <span className="text-xs">
                {daysRemaining}d left
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className={`${sizeConfig.descSize} text-gray-300 mb-3 line-clamp-2`}>
        {challenge.description}
      </p>

      {/* Progress section */}
      {showProgress && isActive && (
        <div className="mb-3">
          <ProgressBar
            value={progress}
            max={100}
            color={difficultyConfig.color}
            variant="gaming"
            size="small"
            showPercentage={true}
            animated={true}
          />
        </div>
      )}

      {/* Requirements */}
      {challenge.requirements && challenge.requirements.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Requirements:</div>
          <div className="space-y-1">
            {challenge.requirements.slice(0, 2).map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    req.completed ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
                <span className="text-gray-300 truncate">{req.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-3">
          {/* Rewards */}
          <div className="flex items-center space-x-2 text-xs">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400">+{challenge.xpReward} XP</span>
            {challenge.pointsReward > 0 && (
              <>
                <Star className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">+{challenge.pointsReward} pts</span>
              </>
            )}
          </div>

          {/* Participants */}
          {showParticipants && challenge.participants && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>{challenge.participants}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <motion.button
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium
            ${isCompleted ? 'bg-green-600 text-white' : 
              isActive && progress >= 100 ? 'bg-yellow-600 text-white' :
              isActive ? 'bg-red-600 text-white' :
              challenge.status === 'available' ? 'bg-blue-600 text-white' :
              'bg-gray-600 text-gray-300'}
            transition-all duration-200
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLocked || isExpired}
        >
          <ActionIcon className="w-3 h-3" />
          <span>{getActionText()}</span>
        </motion.button>
      </div>

      {/* Completion burst effect */}
      <AnimatePresence>
        {isCompleted && isHovered && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  x: `${50 + Math.cos((i * Math.PI * 2) / 6) * 50}%`,
                  y: `${50 + Math.sin((i * Math.PI * 2) / 6) * 50}%`,
                  scale: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Shimmer effect for active challenges */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

export default ChallengeCard;