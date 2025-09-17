'use client';

/**
 * Xbox/PlayStation-Style Level Badge Component
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Gaming console-inspired level display
 * - Animated XP progress ring
 * - Prestige system for high levels
 * - Smooth level-up animations
 * - Mental health appropriate design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Crown,
  Shield,
  Zap,
  Trophy,
  Sparkles,
  Award,
  Target,
  Heart,
  Brain,
} from 'lucide-react';

export interface LevelBadgeProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP?: number;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  variant?: 'default' | 'gaming' | 'prestige' | 'minimal';
  showProgress?: boolean;
  showXPText?: boolean;
  animated?: boolean;
  onLevelUp?: () => void;
  className?: string;
  'data-testid'?: string;
}

// Level tier configuration
const LEVEL_TIERS = {
  1: { name: 'Beginner', color: '#6B7280', icon: Target, prestige: 0 },
  10: { name: 'Novice', color: '#3B82F6', icon: Star, prestige: 0 },
  20: { name: 'Apprentice', color: '#8B5CF6', icon: Shield, prestige: 0 },
  30: { name: 'Practitioner', color: '#10B981', icon: Zap, prestige: 0 },
  40: { name: 'Expert', color: '#F59E0B', icon: Trophy, prestige: 0 },
  50: { name: 'Master', color: '#EF4444', icon: Crown, prestige: 1 },
  75: { name: 'Grandmaster', color: '#EC4899', icon: Sparkles, prestige: 2 },
  100: { name: 'Legend', color: '#FFD700', icon: Award, prestige: 3 },
};

// Size configurations
const SIZE_CONFIG = {
  small: {
    container: 'w-16 h-16',
    ring: 64,
    strokeWidth: 3,
    fontSize: 'text-sm',
    iconSize: 'w-4 h-4',
  },
  medium: {
    container: 'w-24 h-24',
    ring: 96,
    strokeWidth: 4,
    fontSize: 'text-lg',
    iconSize: 'w-6 h-6',
  },
  large: {
    container: 'w-32 h-32',
    ring: 128,
    strokeWidth: 5,
    fontSize: 'text-2xl',
    iconSize: 'w-8 h-8',
  },
  'extra-large': {
    container: 'w-40 h-40',
    ring: 160,
    strokeWidth: 6,
    fontSize: 'text-3xl',
    iconSize: 'w-10 h-10',
  },
};

// Get level tier information
function getLevelTier(level: number) {
  const tierLevels = Object.keys(LEVEL_TIERS).map(Number).sort((a, b) => b - a);
  const tierLevel = tierLevels.find(tier => level >= tier) || 1;
  return LEVEL_TIERS[tierLevel as keyof typeof LEVEL_TIERS];
}

// Progress ring component
function ProgressRing({ 
  progress, 
  size, 
  strokeWidth, 
  color, 
  animated 
}: { 
  progress: number; 
  size: number; 
  strokeWidth: number; 
  color: string; 
  animated: boolean;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width={size}
      height={size}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      
      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
        animate={{ strokeDashoffset }}
        transition={{ duration: animated ? 2 : 0, ease: 'easeOut' }}
      />
      
      {/* Glow effect */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth / 2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        opacity={0.5}
        style={{ filter: `blur(${strokeWidth}px)` }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  );
}

// Prestige stars
function PrestigeStars({ prestige, size }: { prestige: number; size: string }) {
  if (prestige === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 flex space-x-1">
      {Array.from({ length: prestige }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: index * 0.2, 
            type: 'spring', 
            stiffness: 200 
          }}
        >
          <Star 
            className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400 fill-current`} 
          />
        </motion.div>
      ))}
    </div>
  );
}

function LevelBadge({
  level,
  currentXP,
  nextLevelXP,
  totalXP,
  size = 'medium',
  variant = 'gaming',
  showProgress = true,
  showXPText = true,
  animated = true,
  onLevelUp,
  className = '',
  'data-testid': testId,
}: LevelBadgeProps) {
  const [prevLevel, setPrevLevel] = useState(level);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  
  const sizeConfig = SIZE_CONFIG[size];
  const tierInfo = getLevelTier(level);
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100;

  useEffect(() => {
    if (level > prevLevel) {
      setIsLevelingUp(true);
      onLevelUp?.();
      
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
        setPrevLevel(level);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [level, prevLevel, onLevelUp]);

  const renderDefault = () => (
    <div className={`relative ${sizeConfig.container} ${className}`} data-testid={testId}>
      <div className="relative w-full h-full">
        {showProgress && (
          <ProgressRing
            progress={progress}
            size={sizeConfig.ring}
            strokeWidth={sizeConfig.strokeWidth}
            color={tierInfo.color}
            animated={animated}
          />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`${sizeConfig.fontSize} font-bold text-white`}
            style={{ color: tierInfo.color }}
            initial={animated ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {level}
          </motion.span>
        </div>
      </div>
      
      {showXPText && (
        <div className="text-center mt-2">
          <div className="text-xs text-gray-400">
            {currentXP} / {nextLevelXP} XP
          </div>
        </div>
      )}
    </div>
  );

  const renderGaming = () => (
    <motion.div 
      className={`relative ${sizeConfig.container} ${className}`}
      data-testid={testId}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-50"
        style={{ 
          background: `radial-gradient(circle, ${tierInfo.color}40 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main container */}
      <div 
        className="relative w-full h-full rounded-full border-4 bg-gradient-to-br from-gray-800 to-gray-900"
        style={{ borderColor: tierInfo.color }}
      >
        {showProgress && (
          <ProgressRing
            progress={progress}
            size={sizeConfig.ring}
            strokeWidth={sizeConfig.strokeWidth}
            color={tierInfo.color}
            animated={animated}
          />
        )}
        
        {/* Level number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={animated ? { scale: 0, opacity: 0 } : undefined}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          >
            <span
              className={`${sizeConfig.fontSize} font-bold`}
              style={{ color: tierInfo.color }}
            >
              {level}
            </span>
            {variant === 'gaming' && size !== 'small' && (
              <div className="text-xs text-gray-400 mt-1">
                {tierInfo.name}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tier icon */}
        <div className="absolute bottom-1 right-1">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
          >
            <tierInfo.icon
              className={`${sizeConfig.iconSize} opacity-70`}
              style={{ color: tierInfo.color }}
            />
          </motion.div>
        </div>

        {/* Prestige stars */}
        <PrestigeStars prestige={tierInfo.prestige} size={size} />
      </div>

      {/* XP text */}
      {showXPText && (
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="text-xs text-gray-300 font-medium">
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </div>
          {totalXP && (
            <div className="text-xs text-gray-500 mt-1">
              Total: {totalXP.toLocaleString()} XP
            </div>
          )}
        </motion.div>
      )}

      {/* Level up animation */}
      <AnimatePresence>
        {isLevelingUp && (
          <>
            {/* Burst effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: tierInfo.color }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            
            {/* Particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: tierInfo.color }}
                initial={{
                  x: sizeConfig.ring / 2,
                  y: sizeConfig.ring / 2,
                  scale: 0,
                }}
                animate={{
                  x: sizeConfig.ring / 2 + Math.cos((i * Math.PI * 2) / 8) * 100,
                  y: sizeConfig.ring / 2 + Math.sin((i * Math.PI * 2) / 8) * 100,
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Level up text */}
            <motion.div
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-lg font-bold text-sm whitespace-nowrap"
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Level Up!
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderPrestige = () => (
    <div className={`relative ${sizeConfig.container} ${className}`} data-testid={testId}>
      <div className="relative w-full h-full">
        {/* Prestige glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${tierInfo.color}, #FFD700, ${tierInfo.color})`,
            filter: 'blur(15px)',
            opacity: 0.6,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        
        <div className="relative w-full h-full rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-900 to-orange-900">
          {showProgress && (
            <ProgressRing
              progress={progress}
              size={sizeConfig.ring}
              strokeWidth={sizeConfig.strokeWidth}
              color="#FFD700"
              animated={animated}
            />
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <Crown
              className={`${sizeConfig.iconSize} text-yellow-400`}
              style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
            />
          </div>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-bold text-yellow-400">{level}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className={`flex items-center space-x-2 ${className}`} data-testid={testId}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: tierInfo.color }}
      >
        {level}
      </div>
      {showXPText && (
        <div className="text-sm text-gray-400">
          {currentXP} / {nextLevelXP} XP
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'prestige':
      return renderPrestige();
    case 'minimal':
      return renderMinimal();
    case 'gaming':
      return renderGaming();
    default:
      return renderDefault();
  }
}

export default LevelBadge;