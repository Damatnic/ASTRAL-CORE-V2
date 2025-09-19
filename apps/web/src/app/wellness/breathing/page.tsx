'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


/**
 * Breathing Exercises Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Interactive breathing exercises for:
 * - Immediate anxiety relief
 * - Stress management
 * - Crisis intervention
 * - Panic attack support
 * - WCAG 2.2 AA compliant
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Play, Pause, RotateCcw, Heart, Timer, Volume2, VolumeX,
  Headphones, Wind, Waves, ArrowLeft, AlertCircle, Star,
  CheckCircle2, Zap, Settings, Info, SkipForward
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  pattern: number[]; // [inhale, hold, exhale, hold] in seconds
  duration: number; // total minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  isForCrisis?: boolean;
  audioGuide?: string;
}

const breathingTechniques: BreathingTechnique[] = [
  {
    id: 'box-breathing',
    name: '4-7-8 Breathing',
    description: 'A powerful technique for immediate anxiety relief and better sleep',
    instructions: [
      'Inhale quietly through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth for 8 counts',
      'Repeat for 4 cycles'
    ],
    pattern: [4, 7, 8, 0],
    duration: 5,
    difficulty: 'beginner',
    benefits: ['Anxiety relief', 'Better sleep', 'Stress reduction'],
    isForCrisis: true
  },
  {
    id: 'box-breathing-navy',
    name: 'Box Breathing (Navy SEALs)',
    description: 'Military-grade technique for performance under pressure',
    instructions: [
      'Inhale through nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale through mouth for 4 counts',
      'Hold empty for 4 counts'
    ],
    pattern: [4, 4, 4, 4],
    duration: 10,
    difficulty: 'intermediate',
    benefits: ['Focus enhancement', 'Stress resilience', 'Performance optimization'],
    isForCrisis: true
  },
  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    description: 'Balances your nervous system for optimal wellbeing',
    instructions: [
      'Breathe in slowly for 5 counts',
      'Breathe out slowly for 5 counts',
      'Continue this rhythm smoothly',
      'No breath holding required'
    ],
    pattern: [5, 0, 5, 0],
    duration: 15,
    difficulty: 'beginner',
    benefits: ['Heart rate variability', 'Nervous system balance', 'Mental clarity']
  },
  {
    id: 'triangle-breathing',
    name: 'Triangle Breathing',
    description: 'Simple three-part breathing for quick relaxation',
    instructions: [
      'Inhale for 3 counts',
      'Hold for 3 counts',
      'Exhale for 3 counts',
      'No pause before next breath'
    ],
    pattern: [3, 3, 3, 0],
    duration: 7,
    difficulty: 'beginner',
    benefits: ['Quick relaxation', 'Focus improvement', 'Stress relief'],
    isForCrisis: true
  }
];

const BreathingVisualizer: React.FC<{
  isActive: boolean;
  phase: 'inhale' | 'hold_in' | 'exhale' | 'hold_out';
  duration: number;
}> = ({ isActive, phase, duration }) => {
  const scale = {
    inhale: 1.5,
    hold_in: 1.5,
    exhale: 1,
    hold_out: 1
  };

  const colors = {
    inhale: 'from-blue-400 to-purple-600',
    hold_in: 'from-purple-600 to-indigo-600',
    exhale: 'from-green-400 to-blue-500',
    hold_out: 'from-gray-400 to-gray-600'
  };

  return (
    <div className="flex items-center justify-center mb-8">
      <motion.div
        animate={isActive ? {
          scale: scale[phase],
          transition: { duration: duration, ease: "easeInOut" }
        } : { scale: 1 }}
        className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${colors[phase]} shadow-2xl flex items-center justify-center`}
      >
        <motion.div
          animate={isActive ? {
            scale: [1, 1.1, 1],
            transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          } : { scale: 1 }}
          className="w-16 h-16 md:w-20 md:h-20 bg-white/30 rounded-full backdrop-blur-sm flex items-center justify-center"
        >
          <Wind className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function BreathingExercisesPage() {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold_in' | 'exhale' | 'hold_out'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(0);

  // Crisis detection - show crisis-relevant techniques first
  const crisisTechniques = breathingTechniques.filter(t => t.isForCrisis);
  const regularTechniques = breathingTechniques.filter(t => !t.isForCrisis);

  useEffect(() => {
    if (selectedTechnique) {
      const totalTime = selectedTechnique.duration * 60; // Convert to seconds
      const cycleTime = selectedTechnique.pattern.reduce((a, b) => a + b, 0);
      setTotalCycles(Math.floor(totalTime / cycleTime));
      setTimeRemaining(totalTime);
    }
  }, [selectedTechnique]);

  const startExercise = () => {
    if (!selectedTechnique) return;
    
    setIsActive(true);
    setCompletedCycles(0);
    phaseRef.current = 0;
    setCurrentPhase('inhale');
    
    const pattern = selectedTechnique.pattern;
    let currentPhaseIndex = 0;
    let phaseTimeLeft = pattern[0];
    
    intervalRef.current = setInterval(() => {
      phaseTimeLeft--;
      setTimeRemaining(prev => prev - 1);
      
      if (phaseTimeLeft <= 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % 4;
        phaseTimeLeft = pattern[currentPhaseIndex];
        
        const phases: ('inhale' | 'hold_in' | 'exhale' | 'hold_out')[] = ['inhale', 'hold_in', 'exhale', 'hold_out'];
        setCurrentPhase(phases[currentPhaseIndex]);
        
        if (currentPhaseIndex === 0) {
          setCompletedCycles(prev => prev + 1);
        }
      }
      
      if (timeRemaining <= 1) {
        stopExercise();
      }
    }, 1000);
  };

  const stopExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetExercise = () => {
    stopExercise();
    if (selectedTechnique) {
      setTimeRemaining(selectedTechnique.duration * 60);
      setCompletedCycles(0);
      setCurrentPhase('inhale');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = (): string => {
    if (!selectedTechnique || !isActive) return 'Press play to begin';
    
    const phaseInstructions = {
      inhale: 'Breathe in slowly...',
      hold_in: 'Hold your breath...',
      exhale: 'Breathe out slowly...',
      hold_out: 'Hold empty...'
    };
    
    return phaseInstructions[currentPhase];
  };

  if (selectedTechnique) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => setSelectedTechnique(null)}
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Techniques
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedTechnique.name}</h1>
              <p className="text-gray-600">{selectedTechnique.description}</p>
            </div>
          </div>

          {/* Crisis Alert */}
          {selectedTechnique.isForCrisis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Glass className="p-4 bg-red-50 border-2 border-red-200">
                <div className="flex items-center text-red-700">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="font-medium">Crisis Relief Technique - Effective for anxiety attacks and panic</span>
                </div>
              </Glass>
            </motion.div>
          )}

          {/* Breathing Visualizer */}
          <Glass className="p-8 mb-8 text-center">
            <BreathingVisualizer
              isActive={isActive}
              phase={currentPhase}
              duration={selectedTechnique.pattern[
                ['inhale', 'hold_in', 'exhale', 'hold_out'].indexOf(currentPhase)
              ]}
            />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getPhaseInstruction()}
              </h2>
              <div className="text-gray-600">
                Cycle {completedCycles} of {totalCycles} • {formatTime(timeRemaining)} remaining
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={isActive ? stopExercise : startExercise}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              
              <button
                onClick={resetExercise}
                className="flex items-center px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((selectedTechnique.duration * 60 - timeRemaining) / (selectedTechnique.duration * 60)) * 100}%`
                }}
              />
            </div>
          </Glass>

          {/* Instructions */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Glass className="p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      How to Practice
                    </h3>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="text-gray-600 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <ol className="space-y-3">
                    {selectedTechnique.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Benefits */}
          <Glass className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Expected Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTechnique.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg"
            >
              <Headphones className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Breathing Exercises
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Harness the power of your breath to find calm, reduce anxiety, and regain control. 
            These evidence-based techniques provide immediate relief when you need it most.
          </p>

          {/* Crisis Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <Glass className="p-4 bg-red-50 border-2 border-red-200">
              <div className="flex items-center justify-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">In crisis? Try our crisis-specific techniques below for immediate relief</span>
              </div>
            </Glass>
          </motion.div>
        </motion.div>

        {/* Crisis Techniques */}
        {crisisTechniques.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-6 h-6 text-red-500 mr-2" />
              Crisis Relief Techniques
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {crisisTechniques.map((technique, index) => (
                <motion.div
                  key={technique.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Glass className="p-6 h-full border-2 border-red-200 bg-red-50/20 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedTechnique(technique)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                          <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {technique.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Timer className="w-4 h-4 mr-1" />
                            {technique.duration} min
                            <span className="mx-2">•</span>
                            <span className="capitalize">{technique.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-red-500" />
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {technique.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {technique.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ x: 4 }}
                      className="text-red-600 font-medium text-sm mt-4"
                    >
                      Start Exercise →
                    </motion.div>
                  </Glass>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Breathing Techniques
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTechniques.map((technique, index) => (
              <motion.div
                key={technique.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Glass className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedTechnique(technique)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <Wind className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {technique.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Timer className="w-4 h-4 mr-1" />
                          {technique.duration} min
                          <span className="mx-2">•</span>
                          <span className="capitalize">{technique.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                    {technique.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {technique.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="text-purple-600 font-medium text-sm"
                  >
                    Start Exercise →
                  </motion.div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Glass className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Feeling Overwhelmed?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If breathing exercises aren't providing enough relief, our crisis support team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/crisis"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Get Crisis Support
              </Link>
              <Link
                href="/crisis/chat"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Start Crisis Chat
              </Link>
              <a
                href="tel:988"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                Call 988 Now
              </a>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}