import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useSpring } from 'framer-motion';
import {
  Heart, Sparkles, CheckCircle, AlertCircle, Zap, Shield,
  Sun, Moon, Star, Activity, TrendingUp, Award, Gift
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

// Crisis-aware animations that adapt to emotional state - 100% FREE
interface AnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
}

// Breathing animation for anxiety relief
export const BreathingAnimation: React.FC<{
  isActive?: boolean;
  className?: string;
}> = ({ isActive = false, className }) => {
  const { emotionalState } = useEmotionTheme();
  const controls = useAnimation();
  
  // Adjust breathing pace based on emotional state
  const breathingPace = emotionalState === 'anxious' ? 6 : 
                       emotionalState === 'crisis' ? 8 : 4;

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: breathingPace,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
    }
  }, [isActive, breathingPace, controls]);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        animate={controls}
        className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center"
      >
        <div className="text-white text-center">
          <div className="text-lg font-semibold">Breathe</div>
          <div className="text-sm opacity-80">In and Out</div>
        </div>
      </motion.div>
    </div>
  );
};

// Pulse animation for crisis buttons
export const CrisisPulse: React.FC<{
  children: React.ReactNode;
  isUrgent?: boolean;
  className?: string;
}> = ({ children, isUrgent = false, className }) => {
  return (
    <motion.div
      className={className}
      animate={isUrgent ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(220, 38, 38, 0.4)',
          '0 0 0 10px rgba(220, 38, 38, 0)',
          '0 0 0 0 rgba(220, 38, 38, 0)'
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isUrgent ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Success celebration animation
export const SuccessCelebration: React.FC<{
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}> = ({ isVisible, onComplete, className }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-900"
          />
          
          {/* Success Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Well Done! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              You've taken an important step forward.
            </motion.p>
          </motion.div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -50,
                    rotation: 0,
                    scale: 0
                  }}
                  animate={{
                    y: window.innerHeight + 50,
                    rotation: 360,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className={cn(
                    'absolute w-3 h-3',
                    i % 4 === 0 ? 'bg-yellow-400' :
                    i % 4 === 1 ? 'bg-green-400' :
                    i % 4 === 2 ? 'bg-blue-400' : 'bg-pink-400'
                  )}
                  style={{ borderRadius: Math.random() > 0.5 ? '50%' : '0' }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading animation with emotional awareness
export const EmotionalLoading: React.FC<{
  isLoading: boolean;
  message?: string;
  className?: string;
}> = ({ isLoading, message = "Loading...", className }) => {
  const { emotionalState } = useEmotionTheme();
  
  const getLoadingColor = () => {
    switch (emotionalState) {
      case 'crisis': return 'from-red-500 to-red-600';
      case 'anxious': return 'from-purple-500 to-purple-600';
      case 'depressed': return 'from-blue-500 to-blue-600';
      case 'hopeful': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn('flex flex-col items-center justify-center p-8', className)}
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className={cn(
              'w-12 h-12 rounded-full bg-gradient-to-r',
              getLoadingColor()
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent, currentColor, transparent)`
            }}
          />
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 text-center"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Gentle attention grabber for important messages
export const GentleAttention: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}> = ({ children, isActive = true, className }) => {
  return (
    <motion.div
      animate={isActive ? {
        boxShadow: [
          '0 0 0 0 rgba(59, 130, 246, 0.4)',
          '0 0 0 8px rgba(59, 130, 246, 0)',
          '0 0 0 0 rgba(59, 130, 246, 0)'
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Progress celebration for milestones
export const ProgressCelebration: React.FC<{
  progress: number;
  milestone?: number;
  onMilestoneReached?: () => void;
  className?: string;
}> = ({ progress, milestone = 100, onMilestoneReached, className }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const prevProgress = useRef(0);

  useEffect(() => {
    if (progress >= milestone && prevProgress.current < milestone) {
      setShowCelebration(true);
      if (onMilestoneReached) onMilestoneReached();
      setTimeout(() => setShowCelebration(false), 2000);
    }
    prevProgress.current = progress;
  }, [progress, milestone, onMilestoneReached]);

  return (
    <div className={cn('relative', className)}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
        />
      </div>

      {/* Milestone Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Milestone reached!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Gentle shake for form validation errors
export const ValidationShake: React.FC<{
  children: React.ReactNode;
  hasError: boolean;
  className?: string;
}> = ({ children, hasError, className }) => {
  return (
    <motion.div
      animate={hasError ? {
        x: [-5, 5, -5, 5, 0],
      } : {}}
      transition={{
        duration: 0.4,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Smooth page transitions
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating notification animation
export const FloatingNotification: React.FC<{
  isVisible: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}> = ({ isVisible, type, message, onDismiss, className }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-600', icon: CheckCircle };
      case 'warning':
        return { bg: 'bg-yellow-600', icon: AlertCircle };
      case 'error':
        return { bg: 'bg-red-600', icon: AlertCircle };
      default:
        return { bg: 'bg-blue-600', icon: Activity };
    }
  };

  const { bg, icon: Icon } = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className={cn(
            'fixed top-20 right-4 z-50 max-w-sm',
            className
          )}
        >
          <div className={cn(
            'rounded-lg shadow-xl text-white p-4 flex items-center space-x-3',
            bg
          )}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{message}</span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Heartbeat animation for crisis situations
export const CrisisHeartbeat: React.FC<{
  isActive: boolean;
  className?: string;
}> = ({ isActive, className }) => {
  return (
    <motion.div
      animate={isActive ? {
        scale: [1, 1.2, 1, 1.1, 1],
      } : {}}
      transition={{
        duration: 1,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      className={cn('inline-block', className)}
    >
      <Heart className="w-6 h-6 text-red-500 fill-current" />
    </motion.div>
  );
};

// Typing indicator animation
export const TypingIndicator: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn('flex items-center space-x-1', className)}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [-2, 2, -2],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">typing...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Crisis mode overlay animation
export const CrisisModeOverlay: React.FC<{
  isActive: boolean;
  onEmergencyCall?: () => void;
  className?: string;
}> = ({ isActive, onEmergencyCall, className }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 bg-red-900/80 flex items-center justify-center',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crisis Mode Activated
            </h2>
            
            <p className="text-gray-600 mb-6">
              Immediate help is available. You're not alone.
            </p>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEmergencyCall}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold"
              >
                Call Emergency Services
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = 'tel:988'}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
              >
                Call 988 Crisis Line
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  BreathingAnimation,
  CrisisPulse,
  SuccessCelebration,
  EmotionalLoading,
  GentleAttention,
  ProgressCelebration,
  ValidationShake,
  PageTransition,
  FloatingNotification,
  CrisisHeartbeat,
  TypingIndicator,
  CrisisModeOverlay,
};