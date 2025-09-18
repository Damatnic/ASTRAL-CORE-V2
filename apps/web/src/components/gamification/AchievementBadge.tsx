'use client';

/**
 * Achievement Badge Component with Rarity System
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Xbox/PlayStation-style achievement cards
 * - Rarity-based visual effects and colors
 * - Smooth animations and particle effects
 * - Mental health appropriate messaging
 * - Accessibility-first design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Sparkles,
  Heart,
  Shield,
  Crown,
  Zap,
  Award,
  Lock,
  Clock,
  CheckCircle,
  Target,
  Users,
  Brain,
  Sunrise,
} from 'lucide-react';
import { Achievement, AchievementRarity, AchievementCategory } from '@/lib/db';
import { useGamification } from '../../contexts/GamificationContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showDescription?: boolean;
  animate?: boolean;
  onClick?: () => void;
  className?: string;
}

// Rarity configurations with Xbox/PlayStation-inspired styling
const RARITY_CONFIG = {
  common: {
    name: 'Common',
    color: '#6E7681',
    gradient: 'from-gray-600 to-gray-700',
    borderGradient: 'from-gray-500 to-gray-600',
    glowColor: 'rgba(110, 118, 129, 0.3)',
    particles: 3,
    sparkleSize: 2,
    icon: Star,
  },
  uncommon: {
    name: 'Uncommon',
    color: '#58A6FF',
    gradient: 'from-blue-500 to-blue-600',
    borderGradient: 'from-blue-400 to-blue-500',
    glowColor: 'rgba(88, 166, 255, 0.4)',
    particles: 5,
    sparkleSize: 3,
    icon: Trophy,
  },
  rare: {
    name: 'Rare',
    color: '#A5A5FF',
    gradient: 'from-purple-500 to-purple-600',
    borderGradient: 'from-purple-400 to-purple-500',
    glowColor: 'rgba(165, 165, 255, 0.5)',
    particles: 8,
    sparkleSize: 4,
    icon: Sparkles,
  },
  epic: {
    name: 'Epic',
    color: '#FF7B72',
    gradient: 'from-orange-500 to-red-500',
    borderGradient: 'from-orange-400 to-red-400',
    glowColor: 'rgba(255, 123, 114, 0.6)',
    particles: 12,
    sparkleSize: 5,
    icon: Crown,
  },
  legendary: {
    name: 'Legendary',
    color: '#FFD700',
    gradient: 'from-yellow-400 via-yellow-500 to-orange-500',
    borderGradient: 'from-yellow-300 via-yellow-400 to-orange-400',
    glowColor: 'rgba(255, 215, 0, 0.8)',
    particles: 20,
    sparkleSize: 6,
    icon: Award,
  },
};

// Category icons mapping
const CATEGORY_ICONS = {
  'self-care': Heart,
  'community': Users,
  'growth': Sunrise,
  'crisis-support': Shield,
  'wellness': Brain,
  'milestone': Target,
  'special': Sparkles,
};

// Size configurations
const SIZE_CONFIG = {
  small: {
    containerSize: 'w-20 h-20',
    iconSize: 'w-8 h-8',
    textSize: 'text-xs',
    padding: 'p-2',
  },
  medium: {
    containerSize: 'w-32 h-32',
    iconSize: 'w-12 h-12',
    textSize: 'text-sm',
    padding: 'p-4',
  },
  large: {
    containerSize: 'w-48 h-48',
    iconSize: 'w-16 h-16',
    textSize: 'text-lg',
    padding: 'p-6',
  },
};

// Particle component for rarity effects
function Particle({ delay, rarity }: { delay: number; rarity: AchievementRarity }) {
  const config = RARITY_CONFIG[rarity];
  
  return (
    <motion.div
      className="absolute rounded-full opacity-60"
      style={{
        backgroundColor: config.color,
        width: config.sparkleSize,
        height: config.sparkleSize,
      }}
      initial={{
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
        ease: 'easeInOut',
      }}
    />
  );
}

// Progress ring component
function ProgressRing({ progress, size, color }: { progress: number; size: number; color: string }) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width={size}
      height={size}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="3"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  showProgress = true,
  showDescription = true,
  animate = true,
  onClick,
  className = '',
}: AchievementBadgeProps) {
  const { theme } = useGamification();
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const rarityConfig = RARITY_CONFIG[achievement.rarity];
  const sizeConfig = SIZE_CONFIG[size];
  const CategoryIcon = CATEGORY_ICONS[achievement.category] || Target;
  const isLocked = !achievement.completed && achievement.isHidden;
  const isInProgress = !achievement.completed && !achievement.isHidden;
  
  useEffect(() => {
    if (achievement.completed && animate) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [achievement.completed, animate]);

  const handleClick = () => {
    if (onClick && !isLocked) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={animate ? { scale: 0, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Particle effects for unlocked achievements */}
      <AnimatePresence>
        {showParticles && achievement.completed && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: rarityConfig.particles }).map((_, i) => (
              <Particle
                key={i}
                delay={i * 0.1}
                rarity={achievement.rarity}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main achievement card */}
      <motion.div
        className={`
          relative cursor-pointer group overflow-hidden
          ${sizeConfig.containerSize} ${sizeConfig.padding}
          bg-gradient-to-br ${rarityConfig.gradient}
          rounded-2xl border-2 border-transparent
          ${achievement.completed ? 'shadow-lg' : 'opacity-60'}
          ${isLocked ? 'grayscale' : ''}
        `}
        style={{
          boxShadow: achievement.completed
            ? `0 0 30px ${rarityConfig.glowColor}, 0 4px 20px rgba(0, 0, 0, 0.3)`
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        {/* Border gradient */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rarityConfig.borderGradient} opacity-50`}
          style={{ padding: '2px' }}
        >
          <div className={`w-full h-full rounded-xl bg-gradient-to-br ${rarityConfig.gradient}`} />
        </div>

        {/* Progress ring for in-progress achievements */}
        {isInProgress && showProgress && achievement.progress !== undefined && (
          <ProgressRing
            progress={achievement.progress}
            size={parseInt(sizeConfig.containerSize.split('-')[1]) * 4}
            color={rarityConfig.color}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          {/* Lock icon for hidden achievements */}
          {isLocked ? (
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Lock className={sizeConfig.iconSize} />
            </motion.div>
          ) : (
            <>
              {/* Achievement icon */}
              <motion.div
                className={`${sizeConfig.iconSize} mb-2`}
                animate={achievement.completed ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: achievement.completed ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                <CategoryIcon className="w-full h-full" />
              </motion.div>

              {/* Rarity indicator */}
              <div className="flex items-center space-x-1 mb-1">
                <rarityConfig.icon className="w-3 h-3" />
                <span className="text-xs font-medium">{rarityConfig.name}</span>
              </div>

              {/* Progress indicator for in-progress achievements */}
              {isInProgress && achievement.progress !== undefined && (
                <div className="text-xs opacity-75">
                  {achievement.progress}%
                </div>
              )}

              {/* Completion indicator */}
              {achievement.completed && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Shimmer effect */}
        {achievement.completed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      {/* Tooltip/Description */}
      <AnimatePresence>
        {isHovered && showDescription && !isLocked && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-xl border border-gray-700 shadow-xl max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <CategoryIcon className="w-4 h-4 text-blue-400" />
                <h4 className="font-semibold text-sm">{achievement.title}</h4>
              </div>
              <p className="text-xs text-gray-300 mb-3">{achievement.description}</p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Reward:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">+{achievement.xpReward} XP</span>
                  {achievement.pointsReward > 0 && (
                    <span className="text-yellow-400">+{achievement.pointsReward} pts</span>
                  )}
                </div>
              </div>

              {isInProgress && achievement.progress !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{achievement.progress}%</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {achievement.completed && achievement.unlockedAt && (
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked achievement hint */}
      <AnimatePresence>
        {isHovered && isLocked && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-xl border border-gray-700 shadow-xl">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Hidden Achievement</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Keep progressing to unlock this mystery!
              </p>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}