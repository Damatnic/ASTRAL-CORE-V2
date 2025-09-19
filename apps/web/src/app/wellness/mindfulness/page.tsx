'use client';

/**
 * Mindfulness & Meditation Page
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Comprehensive mindfulness tools including:
 * - Guided meditations
 * - Grounding exercises for crisis
 * - Body scan meditations
 * - Mindful breathing
 * - Crisis-specific mindfulness techniques
 * - WCAG 2.2 AA compliant
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Brain, Play, Pause, RotateCcw, Timer, Volume2, VolumeX,
  ArrowLeft, AlertCircle, Star, Eye, Hand, Headphones,
  Zap, Waves, Wind, Heart, CheckCircle2, Clock, Info
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface MindfulnessExercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'meditation' | 'grounding' | 'body-scan' | 'breathing' | 'crisis';
  benefits: string[];
  isForCrisis?: boolean;
  guidedSteps?: string[];
}

const mindfulnessExercises: MindfulnessExercise[] = [
  {
    id: '5-4-3-2-1-grounding',
    name: '5-4-3-2-1 Grounding',
    description: 'Immediate grounding technique using your five senses to anchor you in the present',
    instructions: [
      'Identify 5 things you can see around you',
      'Notice 4 things you can touch or feel',
      'Listen for 3 different sounds',
      'Find 2 things you can smell',
      'Identify 1 thing you can taste'
    ],
    duration: 5,
    difficulty: 'beginner',
    category: 'grounding',
    benefits: ['Immediate grounding', 'Panic attack relief', 'Present moment awareness'],
    isForCrisis: true,
    guidedSteps: [
      'Take a deep breath and look around you',
      'Name 5 things you can see - really look at them',
      'Notice 4 things you can physically feel - your clothes, the chair, temperature',
      'Listen carefully and identify 3 different sounds',
      'Take a moment to notice 2 scents in your environment',
      'Finally, notice any taste in your mouth'
    ]
  },
  {
    id: 'body-scan-meditation',
    name: 'Progressive Body Scan',
    description: 'Systematic relaxation technique that releases tension throughout your body',
    instructions: [
      'Lie down or sit comfortably',
      'Start by focusing on your toes',
      'Slowly move attention up through your body',
      'Notice any tension and breathe into those areas',
      'Complete the scan from toes to head'
    ],
    duration: 15,
    difficulty: 'beginner',
    category: 'body-scan',
    benefits: ['Deep relaxation', 'Body awareness', 'Stress relief'],
    guidedSteps: [
      'Get comfortable and close your eyes',
      'Focus on your toes - notice any sensations',
      'Move to your feet, ankles, and calves',
      'Continue up through your thighs and hips',
      'Notice your abdomen rising and falling',
      'Feel your hands, arms, and shoulders',
      'Focus on your neck, face, and head',
      'Take a moment to feel your whole body'
    ]
  },
  {
    id: 'loving-kindness',
    name: 'Loving-Kindness Meditation',
    description: 'Cultivate compassion and kindness toward yourself and others',
    instructions: [
      'Begin by sending loving wishes to yourself',
      'Extend kindness to someone you love',
      'Include someone neutral in your life',
      'Send compassion to someone difficult',
      'Extend love to all beings everywhere'
    ],
    duration: 10,
    difficulty: 'intermediate',
    category: 'meditation',
    benefits: ['Self-compassion', 'Emotional healing', 'Reduced judgment'],
    guidedSteps: [
      'Place hand on heart and breathe deeply',
      'Say: "May I be happy, may I be healthy, may I be at peace"',
      'Think of someone you love - send them these wishes',
      'Picture someone neutral - extend the same kindness',
      'Bring to mind someone challenging - offer compassion',
      'Expand to include all living beings',
      'Return to yourself with loving-kindness'
    ]
  },
  {
    id: 'mindful-breathing',
    name: 'Mindful Breathing',
    description: 'Simple yet powerful breathing meditation for present moment awareness',
    instructions: [
      'Find a comfortable position',
      'Focus on your natural breath',
      'Notice the sensation of breathing',
      'When mind wanders, gently return to breath',
      'Continue for the full duration'
    ],
    duration: 8,
    difficulty: 'beginner',
    category: 'breathing',
    benefits: ['Mental clarity', 'Anxiety reduction', 'Focus improvement'],
    guidedSteps: [
      'Sit comfortably with spine straight',
      'Close eyes or soften your gaze',
      'Notice your breath without changing it',
      'Feel the air entering and leaving your nostrils',
      'When thoughts arise, acknowledge them kindly',
      'Gently bring attention back to your breath',
      'End by taking three deeper breaths'
    ]
  },
  {
    id: 'crisis-reset',
    name: 'Crisis Reset Meditation',
    description: 'Quick reset technique for overwhelming emotions and panic',
    instructions: [
      'Place both feet firmly on the ground',
      'Take 3 deep, slow breaths',
      'Notice where you are right now',
      'Remind yourself: "I am safe in this moment"',
      'Feel your body supported by the chair/ground'
    ],
    duration: 3,
    difficulty: 'beginner',
    category: 'crisis',
    benefits: ['Immediate calm', 'Panic interruption', 'Safety awareness'],
    isForCrisis: true,
    guidedSteps: [
      'Place both feet flat on the floor',
      'Take a slow breath in for 4 counts',
      'Hold briefly, then exhale for 6 counts',
      'Repeat this breathing pattern twice more',
      'Look around and notice 3 things in your environment',
      'Say to yourself: "I am here, I am safe, this will pass"',
      'Feel your body being supported where you sit'
    ]
  }
];

const MindfulnessTimer: React.FC<{
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
  onComplete: () => void;
}> = ({ isActive, timeRemaining, totalTime, onComplete }) => {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  
  useEffect(() => {
    if (timeRemaining <= 0 && isActive) {
      onComplete();
    }
  }, [timeRemaining, isActive, onComplete]);
  
  return (
    <div className="text-center mb-8">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={314}
            strokeDashoffset={314 - (314 * progress) / 100}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600">minutes</div>
          </div>
        </div>
      </div>
      
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto"
      />
    </div>
  );
};

export default function MindfulnessPage() {
  const [selectedExercise, setSelectedExercise] = useState<MindfulnessExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Categorize exercises
  const crisisExercises = mindfulnessExercises.filter(e => e.isForCrisis);
  const meditationExercises = mindfulnessExercises.filter(e => e.category === 'meditation');
  const groundingExercises = mindfulnessExercises.filter(e => e.category === 'grounding');
  const bodyScanExercises = mindfulnessExercises.filter(e => e.category === 'body-scan');

  useEffect(() => {
    if (selectedExercise) {
      setTimeRemaining(selectedExercise.duration * 60);
      setCurrentStep(0);
    }
  }, [selectedExercise]);

  const startExercise = () => {
    setIsActive(true);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
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
    if (selectedExercise) {
      setTimeRemaining(selectedExercise.duration * 60);
      setCurrentStep(0);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    // Show completion message or redirect
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      meditation: Brain,
      grounding: Hand,
      'body-scan': Eye,
      breathing: Wind,
      crisis: Zap
    };
    return icons[category as keyof typeof icons] || Brain;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      meditation: 'from-purple-600 to-indigo-600',
      grounding: 'from-green-600 to-emerald-600',
      'body-scan': 'from-blue-600 to-cyan-600',
      breathing: 'from-teal-600 to-blue-600',
      crisis: 'from-red-500 to-red-600'
    };
    return colors[category as keyof typeof colors] || 'from-purple-600 to-blue-600';
  };

  if (selectedExercise) {
    const Icon = getCategoryIcon(selectedExercise.category);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => setSelectedExercise(null)}
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Exercises
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedExercise.name}</h1>
              <p className="text-gray-600">{selectedExercise.description}</p>
            </div>
          </div>

          {/* Crisis Alert */}
          {selectedExercise.isForCrisis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Glass className="p-4 bg-red-50 border-2 border-red-200">
                <div className="flex items-center text-red-700">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="font-medium">Crisis Technique - Designed for immediate relief and grounding</span>
                </div>
              </Glass>
            </motion.div>
          )}

          {/* Meditation Interface */}
          <Glass className="p-8 mb-8 text-center">
            <MindfulnessTimer
              isActive={isActive}
              timeRemaining={timeRemaining}
              totalTime={selectedExercise.duration * 60}
              onComplete={handleComplete}
            />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isActive ? 'Focus on your practice' : 'Ready to begin?'}
              </h2>
              <div className="text-gray-600">
                {selectedExercise.duration} minute {selectedExercise.category} practice
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
                {isActive ? 'Pause' : 'Begin'}
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
          </Glass>

          {/* Guided Steps */}
          {selectedExercise.guidedSteps && (
            <Glass className="p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Guided Steps
              </h3>
              <div className="space-y-3">
                {selectedExercise.guidedSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: currentStep === index ? 1 : 0.5 }}
                    className={`flex items-start p-3 rounded-lg ${
                      currentStep === index ? 'bg-purple-100 border border-purple-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                      currentStep === index ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </motion.div>
                ))}
              </div>
            </Glass>
          )}

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
                    <h3 className="text-lg font-bold text-gray-900">Practice Instructions</h3>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="text-gray-600 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <ol className="space-y-3">
                    {selectedExercise.instructions.map((instruction, index) => (
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Benefits of This Practice</h3>
            <div className="flex flex-wrap gap-2">
              {selectedExercise.benefits.map((benefit, index) => (
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
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
              className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Mindfulness & Meditation
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover the power of present-moment awareness. From crisis grounding to deep meditation, 
            find peace and clarity through mindful practice.
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
                <span className="font-medium">Feeling overwhelmed? Start with our crisis grounding techniques below</span>
              </div>
            </Glass>
          </motion.div>
        </motion.div>

        {/* Crisis Exercises */}
        {crisisExercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-6 h-6 text-red-500 mr-2" />
              Crisis Grounding Techniques
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {crisisExercises.map((exercise, index) => {
                const Icon = getCategoryIcon(exercise.category);
                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Glass 
                      className="p-6 h-full border-2 border-red-200 bg-red-50/20 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {exercise.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {exercise.duration} min
                              <span className="mx-2">•</span>
                              <span className="capitalize">{exercise.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        <Star className="w-5 h-5 text-red-500" />
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {exercise.description}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                          {exercise.benefits.map((benefit, idx) => (
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
                        Start Practice →
                      </motion.div>
                    </Glass>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All Exercises by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Mindfulness Practices
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindfulnessExercises.filter(e => !e.isForCrisis).map((exercise, index) => {
              const Icon = getCategoryIcon(exercise.category);
              const colorClass = getCategoryColor(exercise.category);
              
              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Glass 
                    className="p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`bg-gradient-to-r ${colorClass} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {exercise.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {exercise.duration} min
                            <span className="mx-2">•</span>
                            <span className="capitalize">{exercise.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                      {exercise.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.benefits.map((benefit, idx) => (
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
                      Start Practice →
                    </motion.div>
                  </Glass>
                </motion.div>
              );
            })}
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
              Need Additional Support?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              If mindfulness practices aren't providing enough relief, remember that professional help is available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/crisis"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Crisis Support
              </Link>
              <Link
                href="/crisis/chat"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Crisis Chat
              </Link>
              <a
                href="tel:988"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                Call 988
              </a>
            </div>
          </Glass>
        </motion.div>
      </div>
    </div>
  );
}