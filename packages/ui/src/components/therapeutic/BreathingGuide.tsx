import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Heart, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../design-tokens/tokens';

interface BreathingGuideProps {
  technique?: '4-7-8' | 'box' | '4-4-4' | 'coherent' | 'custom';
  autoStart?: boolean;
  showInstructions?: boolean;
  enableAudio?: boolean;
  enableHaptics?: boolean;
  cycles?: number;
  onComplete?: () => void;
  className?: string;
}

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause?: number;
  cycles: number;
}

const breathingPatterns: Record<string, BreathingPattern> = {
  '4-7-8': {
    name: '4-7-8 Relaxation',
    description: 'Inhale for 4, hold for 7, exhale for 8. Great for reducing anxiety.',
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    cycles: 4,
  },
  'box': {
    name: 'Box Breathing',
    description: 'Equal timing for all phases. Used by Navy SEALs for stress management.',
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    pause: 4000,
    cycles: 6,
  },
  '4-4-4': {
    name: 'Simple 4-4-4',
    description: 'Inhale 4, hold 4, exhale 4. Perfect for beginners.',
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    cycles: 8,
  },
  'coherent': {
    name: 'Heart Coherence',
    description: 'Equal inhale and exhale for heart rate variability.',
    inhale: 5000,
    hold: 0,
    exhale: 5000,
    cycles: 12,
  },
};

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  technique = '4-7-8',
  autoStart = false,
  showInstructions = true,
  enableAudio = true,
  enableHaptics = true,
  cycles: propCycles,
  onComplete,
  className,
}) => {
  const pattern = breathingPatterns[technique];
  const totalCycles = propCycles || pattern.cycles;

  const [isActive, setIsActive] = useState(autoStart);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(pattern.inhale);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(enableAudio);
  const [hapticsEnabled, setHapticsEnabled] = useState(enableHaptics);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();

  // Initialize audio context
  useEffect(() => {
    if (audioEnabled && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioEnabled]);

  // Main breathing cycle logic
  useEffect(() => {
    if (isActive && cycleCount < totalCycles) {
      const phaseTimings = {
        inhale: pattern.inhale,
        hold: pattern.hold,
        exhale: pattern.exhale,
        pause: pattern.pause || 0,
      };

      const currentDuration = phaseTimings[phase];
      setTimeRemaining(currentDuration);

      if (currentDuration > 0) {
        // Play audio cue
        if (audioEnabled) {
          playAudioCue(phase);
        }

        // Trigger haptic feedback
        if (hapticsEnabled) {
          triggerHaptic(phase);
        }

        // Start countdown
        let elapsed = 0;
        intervalRef.current = setInterval(() => {
          elapsed += 100;
          setTimeRemaining(currentDuration - elapsed);

          if (elapsed >= currentDuration) {
            clearInterval(intervalRef.current!);
            moveToNextPhase();
          }
        }, 100);
      } else {
        // Skip phases with 0 duration
        setTimeout(moveToNextPhase, 0);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, cycleCount, pattern, audioEnabled, hapticsEnabled]);

  // Move to next phase in breathing cycle
  const moveToNextPhase = () => {
    setPhase(currentPhase => {
      if (currentPhase === 'inhale') {
        return pattern.hold > 0 ? 'hold' : 'exhale';
      } else if (currentPhase === 'hold') {
        return 'exhale';
      } else if (currentPhase === 'exhale') {
        if (pattern.pause && pattern.pause > 0) {
          return 'pause';
        } else {
          setCycleCount(prev => prev + 1);
          return 'inhale';
        }
      } else { // pause
        setCycleCount(prev => prev + 1);
        return 'inhale';
      }
    });
  };

  // Complete breathing session
  useEffect(() => {
    if (cycleCount >= totalCycles && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
    }
  }, [cycleCount, totalCycles, isActive, onComplete]);

  // Audio cues
  const playAudioCue = (currentPhase: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different tones for different phases
    const frequencies = {
      inhale: 220,   // Low A
      hold: 330,     // E
      exhale: 165,   // Low E
      pause: 110,    // Very low A
    };

    oscillator.frequency.value = frequencies[currentPhase as keyof typeof frequencies];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // Haptic feedback
  const triggerHaptic = (currentPhase: string) => {
    if (!('vibrate' in navigator)) return;

    const patterns = {
      inhale: [100],
      hold: [50, 50, 50],
      exhale: [200],
      pause: [30],
    };

    navigator.vibrate(patterns[currentPhase as keyof typeof patterns]);
  };

  // Reset session
  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setTimeRemaining(pattern.inhale);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Get phase instructions
  const getPhaseInstruction = () => {
    const instructions = {
      inhale: 'Breathe in slowly through your nose',
      hold: 'Hold your breath gently',
      exhale: 'Breathe out slowly through your mouth',
      pause: 'Rest and prepare for the next breath',
    };
    return instructions[phase];
  };

  // Get breathing circle scale
  const getCircleScale = () => {
    const progress = 1 - (timeRemaining / (
      phase === 'inhale' ? pattern.inhale :
      phase === 'hold' ? pattern.hold :
      phase === 'exhale' ? pattern.exhale :
      pattern.pause || 1000
    ));

    switch (phase) {
      case 'inhale':
        return 1 + (progress * 0.5); // Scale from 1 to 1.5
      case 'exhale':
        return 1.5 - (progress * 0.5); // Scale from 1.5 to 1
      default:
        return 1.5; // Hold or pause
    }
  };

  // Get phase color
  const getPhaseColor = () => {
    const colors = {
      inhale: 'from-blue-400 to-cyan-400',
      hold: 'from-purple-400 to-blue-400',
      exhale: 'from-green-400 to-teal-400',
      pause: 'from-gray-300 to-gray-400',
    };
    return colors[phase];
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{pattern.name}</h2>
        {showInstructions && (
          <p className="text-gray-600 max-w-md">{pattern.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-500">
          Cycle {cycleCount + 1} of {totalCycles}
        </div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(cycleCount / totalCycles) * 100}%` }}
          />
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="relative">
        <div 
          className={cn(
            "w-64 h-64 rounded-full transition-all duration-1000 ease-in-out",
            "bg-gradient-to-br shadow-2xl border-4 border-white/50",
            `${getPhaseColor()}`,
            "flex items-center justify-center"
          )}
          style={{
            transform: `scale(${getCircleScale()})`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), inset 0 0 50px rgba(255,255,255,0.2)',
          }}
        >
          {/* Inner content */}
          <div className="text-center text-white">
            <div className="text-3xl font-bold capitalize mb-2">{phase}</div>
            <div className="text-lg opacity-90">
              {Math.ceil(timeRemaining / 1000)}s
            </div>
          </div>

          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" 
               style={{ animationDuration: '2s' }} />
          <div className="absolute inset-4 rounded-full border border-white/20 animate-pulse" 
               style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-800">
            {getPhaseInstruction()}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Focus on your breath and let your body relax</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={reset}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Reset breathing session"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-900">Settings</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Audio Cues</span>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                audioEnabled ? "bg-blue-500" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                audioEnabled ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Haptic Feedback</span>
            </div>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                hapticsEnabled ? "bg-blue-500" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                hapticsEnabled ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingGuide;