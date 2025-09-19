'use client';

/**
 * Xbox/PlayStation-Style Progress Bar Component
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Gaming console-inspired progress visualization
 * - Smooth animations with shimmer effects
 * - Multiple color themes and styles
 * - Accessibility-compliant design
 * - Mental health appropriate messaging
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Target, Zap } from 'lucide-react';

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  description?: string;
  color?: string;
  variant?: 'default' | 'gaming' | 'gradient' | 'neon';
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showValue?: boolean;
  animated?: boolean;
  showIcon?: boolean;
  icon?: React.ComponentType<any>;
  className?: string;
  'data-testid'?: string;
}

const COLOR_PRESETS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  yellow: '#F59E0B',
  red: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899',
  indigo: '#6366F1',
};

const VARIANT_STYLES = {
  default: {
    background: 'bg-gray-700',
    borderRadius: 'rounded-lg',
    height: 'h-3',
    glowEffect: false,
  },
  gaming: {
    background: 'bg-gray-800',
    borderRadius: 'rounded-xl',
    height: 'h-4',
    glowEffect: true,
  },
  gradient: {
    background: 'bg-gradient-to-r from-gray-700 to-gray-800',
    borderRadius: 'rounded-full',
    height: 'h-2',
    glowEffect: false,
  },
  neon: {
    background: 'bg-black',
    borderRadius: 'rounded-lg',
    height: 'h-4',
    glowEffect: true,
  },
};

const SIZE_CONFIG = {
  small: {
    height: 'h-2',
    textSize: 'text-xs',
    iconSize: 'w-3 h-3',
    padding: 'p-1',
  },
  medium: {
    height: 'h-3',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    padding: 'p-2',
  },
  large: {
    height: 'h-4',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
    padding: 'p-3',
  },
};

function ProgressBar({
  value,
  max,
  label,
  description,
  color = COLOR_PRESETS.blue,
  variant = 'gaming',
  size = 'medium',
  showPercentage = true,
  showValue = false,
  animated = true,
  showIcon = false,
  icon: Icon = Target,
  className = '',
  'data-testid': testId,
}: ProgressBarProps) {
  const [currentValue, setCurrentValue] = useState(animated ? 0 : value);
  const [isComplete, setIsComplete] = useState(false);
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isCompleted = value >= max;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [value, animated]);

  useEffect(() => {
    if (isCompleted && !isComplete) {
      setIsComplete(true);
      const timer = setTimeout(() => setIsComplete(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isCompleted, isComplete]);

  const currentPercentage = Math.min(Math.max((currentValue / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`} data-testid={testId}>
      {/* Header */}
      {(label || showPercentage || showValue) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {showIcon && Icon && (
              <Icon className={`${sizeConfig.iconSize} text-gray-600`} />
            )}
            {label && (
              <span className={`${sizeConfig.textSize} font-medium text-gray-600`}>
                {label}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {showValue && (
              <span className={`${sizeConfig.textSize} text-gray-600`}>
                {Math.round(currentValue)} / {max}
              </span>
            )}
            {showPercentage && (
              <span className={`${sizeConfig.textSize} font-semibold text-white`}>
                {Math.round(currentPercentage)}%
              </span>
            )}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-700 mb-3">{description}</p>
      )}

      {/* Progress Bar Container */}
      <div className={`relative overflow-hidden ${variantStyle.background} ${variantStyle.borderRadius} ${variantStyle.height}`}>
        {/* Progress Fill */}
        <motion.div
          className={`h-full ${variantStyle.borderRadius} relative`}
          style={{ backgroundColor: color }}
          initial={animated ? { width: 0 } : { width: `${currentPercentage}%` }}
          animate={{ width: `${currentPercentage}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: 'easeOut',
            type: 'tween',
          }}
        >
          {/* Shimmer Effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Pulse effect for gaming variant */}
          {variant === 'gaming' && (
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Gradient overlay for gradient variant */}
          {variant === 'gradient' && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"
              style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)` }}
            />
          )}
        </motion.div>

        {/* Glow Effect */}
        {variantStyle.glowEffect && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              boxShadow: `inset 0 0 10px ${color}40, 0 0 20px ${color}20`,
            }}
            animate={{
              boxShadow: [
                `inset 0 0 10px ${color}40, 0 0 20px ${color}20`,
                `inset 0 0 15px ${color}60, 0 0 30px ${color}30`,
                `inset 0 0 10px ${color}40, 0 0 20px ${color}20`,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Neon outline for neon variant */}
        {variant === 'neon' && (
          <div
            className="absolute inset-0 rounded-lg border-2"
            style={{
              borderColor: color,
              boxShadow: `0 0 20px ${color}50, inset 0 0 20px ${color}30`,
            }}
          />
        )}

        {/* Completion Burst Effect */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.8, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                ease: 'easeOut',
              }}
            />
          )}
        </AnimatePresence>

        {/* Progress segments for gaming variant */}
        {variant === 'gaming' && max <= 10 && (
          <div className="absolute inset-0 flex">
            {Array.from({ length: max }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 border-r border-gray-600 last:border-r-0 ${
                  index < value ? 'bg-white/10' : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Steps (for discrete values) */}
      {max <= 7 && variant === 'gaming' && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: max + 1 }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= value ? 'bg-blue-400' : 'bg-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>
      )}

      {/* Achievement milestones */}
      {max > 50 && variant === 'gaming' && (
        <div className="relative mt-1">
          {[25, 50, 75, 100].map((milestone) => {
            const milestonePosition = (milestone / 100) * 100;
            const isReached = percentage >= milestone;
            
            return (
              <motion.div
                key={milestone}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${milestonePosition}%` }}
                initial={{ scale: 0 }}
                animate={{ scale: isReached ? 1 : 0.5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className={`w-1 h-4 ${
                    isReached ? 'bg-yellow-400' : 'bg-gray-600'
                  } rounded-full`}
                />
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
                  <span className="text-xs text-gray-600">{milestone}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;