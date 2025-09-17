import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Heart, Wind, Brain,
  Circle, Square, Triangle, Star, Waves, Timer,
  Volume2, VolumeX, Settings, CheckCircle, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  technique: string;
  inhale: number;
  hold1?: number;
  exhale: number;
  hold2?: number;
  cycles: number;
  duration: number; // total duration in seconds
  benefits: string[];
  icon: React.ReactNode;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface BreathingExercisesProps {
  onComplete?: (pattern: BreathingPattern, cycles: number) => void;
  autoStart?: boolean;
  className?: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box-breathing',
    name: '📦 Box Breathing',
    description: 'Equal timing for calm focus',
    technique: 'Used by Navy SEALs for stress management',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 8,
    duration: 128, // 4+4+4+4 = 16 seconds per cycle, 8 cycles
    benefits: ['Reduces anxiety', 'Improves focus', 'Lowers heart rate'],
    icon: <Square className="w-6 h-6" />,
    color: 'bg-blue-500',
    difficulty: 'beginner'
  },
  {
    id: '478-breathing',
    name: '🌙 4-7-8 Breathing',
    description: 'Natural tranquilizer for anxiety',
    technique: 'Dr. Andrew Weil\'s relaxation technique',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    cycles: 4,
    duration: 76, // 4+7+8 = 19 seconds per cycle, 4 cycles
    benefits: ['Rapid anxiety relief', 'Promotes sleep', 'Calms nervous system'],
    icon: <Circle className="w-6 h-6" />,
    color: 'bg-purple-500',
    difficulty: 'intermediate'
  },
  {
    id: 'coherent-breathing',
    name: '🌊 Coherent Breathing',
    description: 'Heart rate variability optimization',
    technique: '5 seconds in, 5 seconds out for balance',
    inhale: 5,
    exhale: 5,
    cycles: 12,
    duration: 120, // 5+5 = 10 seconds per cycle, 12 cycles
    benefits: ['Balances nervous system', 'Improves HRV', 'Enhances emotional regulation'],
    icon: <Waves className="w-6 h-6" />,
    color: 'bg-cyan-500',
    difficulty: 'beginner'
  },
  {
    id: 'triangle-breathing',
    name: '🔺 Triangle Breathing',
    description: 'Simple three-phase breathing',
    technique: 'Equal inhale, hold, exhale pattern',
    inhale: 3,
    hold1: 3,
    exhale: 3,
    cycles: 10,
    duration: 90, // 3+3+3 = 9 seconds per cycle, 10 cycles
    benefits: ['Great for beginners', 'Quick stress relief', 'Easy to remember'],
    icon: <Triangle className="w-6 h-6" />,
    color: 'bg-green-500',
    difficulty: 'beginner'
  },
  {
    id: 'star-breathing',
    name: '⭐ Star Breathing',
    description: 'Extended hold pattern for deep calm',
    technique: 'Longer holds for deeper relaxation',
    inhale: 6,
    hold1: 6,
    exhale: 6,
    hold2: 6,
    cycles: 6,
    duration: 144, // 6+6+6+6 = 24 seconds per cycle, 6 cycles
    benefits: ['Deep relaxation', 'Meditation preparation', 'Stress recovery'],
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-500',
    difficulty: 'advanced'
  }
];

const BreathingVisualizer: React.FC<{
  pattern: BreathingPattern;
  phase: 'inhale' | 'hold1' | 'exhale' | 'hold2';
  progress: number;
  isPlaying: boolean;
}> = ({ pattern, phase, progress, isPlaying }) => {
  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-blue-600';
      case 'hold1': return 'from-purple-400 to-purple-600';
      case 'exhale': return 'from-green-400 to-green-600';
      case 'hold2': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return 'Ready';
    }
  };

  const scale = 0.8 + (progress * 0.4); // Scale from 0.8 to 1.2

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Main breathing circle */}
      <div className="relative">
        <motion.div
          className={cn(
            'w-40 h-40 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center',
            getPhaseColor()
          )}
          animate={{
            scale: isPlaying ? scale : 1,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeInOut'
          }}
        >
          <div className="text-white text-center">
            {pattern.icon}
            <div className="mt-2 text-sm font-medium">{pattern.name.split(' ')[1]}</div>
          </div>
        </motion.div>

        {/* Breathing rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border-2 border-white border-opacity-30"
            animate={{
              scale: isPlaying ? 1 + (ring * 0.2 * progress) : 1,
              opacity: isPlaying ? 0.7 - (ring * 0.2) : 0.3
            }}
            style={{
              top: `-${ring * 10}px`,
              left: `-${ring * 10}px`,
              right: `-${ring * 10}px`,
              bottom: `-${ring * 10}px`,
            }}
          />
        ))}
      </div>

      {/* Phase instruction */}
      <div className="text-center">
        <motion.h2
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          {getPhaseText()}
        </motion.h2>
        <div className="text-lg text-gray-600">
          {phase === 'inhale' && `${pattern.inhale} seconds`}
          {phase === 'hold1' && `${pattern.hold1 || 0} seconds`}
          {phase === 'exhale' && `${pattern.exhale} seconds`}
          {phase === 'hold2' && `${pattern.hold2 || 0} seconds`}
        </div>
      </div>
    </div>
  );
};

export const BreathingExercises: React.FC<BreathingExercisesProps> = ({
  onComplete,
  autoStart = false,
  className
}) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for breathing cues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // You would add actual audio files here
    }
  }, []);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      startExercise();
    }
  }, [autoStart]);

  const startExercise = () => {
    setIsPlaying(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setHasCompleted(false);
    setTimeRemaining(selectedPattern.duration);

    let totalElapsed = 0;
    const cycleTime = (selectedPattern.inhale + (selectedPattern.hold1 || 0) + 
                      selectedPattern.exhale + (selectedPattern.hold2 || 0)) * 1000;

    intervalRef.current = setInterval(() => {
      totalElapsed += 100;
      
      const currentCycleNumber = Math.floor(totalElapsed / cycleTime);
      const cycleElapsed = totalElapsed % cycleTime;
      
      setCurrentCycle(currentCycleNumber);
      setTimeRemaining(selectedPattern.duration - Math.floor(totalElapsed / 1000));

      if (currentCycleNumber >= selectedPattern.cycles) {
        stopExercise(true);
        return;
      }

      // Determine current phase and progress
      let phase: 'inhale' | 'hold1' | 'exhale' | 'hold2' = 'inhale';
      let progress = 0;
      
      const inhaleTime = selectedPattern.inhale * 1000;
      const hold1Time = (selectedPattern.hold1 || 0) * 1000;
      const exhaleTime = selectedPattern.exhale * 1000;
      const hold2Time = (selectedPattern.hold2 || 0) * 1000;

      if (cycleElapsed < inhaleTime) {
        phase = 'inhale';
        progress = cycleElapsed / inhaleTime;
      } else if (cycleElapsed < inhaleTime + hold1Time) {
        phase = 'hold1';
        progress = (cycleElapsed - inhaleTime) / hold1Time;
      } else if (cycleElapsed < inhaleTime + hold1Time + exhaleTime) {
        phase = 'exhale';
        progress = (cycleElapsed - inhaleTime - hold1Time) / exhaleTime;
      } else {
        phase = 'hold2';
        progress = (cycleElapsed - inhaleTime - hold1Time - exhaleTime) / hold2Time;
      }

      // Play sound cue on phase change
      if (phase !== currentPhase && soundEnabled && audioRef.current) {
        // audioRef.current.play(); // Would play breathing cue sounds
      }

      setCurrentPhase(phase);
      setPhaseProgress(progress);
    }, 100);
  };

  const stopExercise = (completed = false) => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (completed) {
      setHasCompleted(true);
      onComplete?.(selectedPattern, currentCycle);
    }
  };

  const resetExercise = () => {
    stopExercise();
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setTimeRemaining(selectedPattern.duration);
    setHasCompleted(false);
  };

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Breathing Exercises</h1>
        <p className="text-lg text-gray-600">
          Guided breathing techniques to reduce anxiety and promote calm
        </p>
      </div>

      {/* Pattern Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {BREATHING_PATTERNS.map((pattern) => (
          <motion.button
            key={pattern.id}
            onClick={() => {
              if (!isPlaying) {
                setSelectedPattern(pattern);
                resetExercise();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPlaying}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              selectedPattern.id === pattern.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
              isPlaying && selectedPattern.id !== pattern.id && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={cn('p-2 rounded-lg text-white', pattern.color)}>
                {pattern.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{pattern.name}</h3>
                <p className="text-sm text-gray-600">{pattern.description}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>{pattern.technique}</div>
              <div className="flex space-x-2">
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs',
                  pattern.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  pattern.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {pattern.difficulty}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {Math.floor(pattern.duration / 60)}:{(pattern.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main Exercise Interface */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        {/* Exercise Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPattern.name}</h2>
          <p className="text-gray-600 mb-4">{selectedPattern.technique}</p>
          
          {/* Progress Info */}
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>Cycle: {currentCycle + 1}/{selectedPattern.cycles}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Breathing Visualizer */}
        <div className="mb-8">
          <BreathingVisualizer
            pattern={selectedPattern}
            phase={currentPhase}
            progress={phaseProgress}
            isPlaying={isPlaying}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={isPlaying ? () => stopExercise() : startExercise}
            className={cn(
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors',
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Pause' : 'Start Exercise'}</span>
          </button>

          <button
            onClick={resetExercise}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'p-3 rounded-xl transition-colors',
              soundEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            )}
            title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">Exercise Complete!</h3>
            <p className="text-green-700 mb-4">
              You completed {currentCycle} cycles of {selectedPattern.name.split(' ')[1]} breathing.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => startExercise()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Do Another Round
              </button>
              <button
                onClick={resetExercise}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Try Different Pattern
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benefits */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-3">Benefits of {selectedPattern.name}:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {selectedPattern.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercises;