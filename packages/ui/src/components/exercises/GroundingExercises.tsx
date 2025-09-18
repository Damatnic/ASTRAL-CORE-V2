import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Hand, Ear, Coffee, Star, CheckCircle, RotateCcw,
  Play, Pause, Timer, Brain, Heart, Sparkles, Target,
  ArrowRight, ChevronDown, ChevronUp, Volume2, VolumeX
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface GroundingTechnique {
  id: string;
  name: string;
  shortName: string;
  description: string;
  instructions: string[];
  duration: number; // in seconds
  category: 'sensory' | 'cognitive' | 'movement' | 'mindfulness';
  difficulty: 'easy' | 'medium' | 'advanced';
  icon: React.ReactNode;
  color: string;
  benefits: string[];
  steps: GroundingStep[];
}

interface GroundingStep {
  id: string;
  instruction: string;
  duration: number;
  senseType?: 'sight' | 'touch' | 'sound' | 'smell' | 'taste';
  prompt?: string;
  count?: number;
}

interface GroundingExercisesProps {
  onComplete?: (technique: GroundingTechnique) => void;
  autoStart?: boolean;
  className?: string;
}

const GROUNDING_TECHNIQUES: GroundingTechnique[] = [
  {
    id: '54321-technique',
    name: '5-4-3-2-1 Grounding Technique',
    shortName: '5-4-3-2-1',
    description: 'Use all five senses to anchor yourself in the present moment',
    instructions: [
      'Look around and name 5 things you can see',
      'Touch and name 4 things you can feel',
      'Listen and name 3 things you can hear',
      'Smell and name 2 things you can smell',
      'Taste and name 1 thing you can taste'
    ],
    duration: 300, // 5 minutes
    category: 'sensory',
    difficulty: 'easy',
    icon: <Eye className="w-6 h-6" />,
    color: 'bg-blue-500',
    benefits: ['Interrupts anxiety spirals', 'Brings awareness to present', 'Easy to remember'],
    steps: [
      {
        id: 'sight',
        instruction: 'Look around you. Name 5 things you can see.',
        duration: 60,
        senseType: 'sight',
        prompt: 'I can see...',
        count: 5
      },
      {
        id: 'touch',
        instruction: 'Touch and name 4 things you can feel.',
        duration: 60,
        senseType: 'touch',
        prompt: 'I can feel...',
        count: 4
      },
      {
        id: 'sound',
        instruction: 'Listen carefully. Name 3 things you can hear.',
        duration: 60,
        senseType: 'sound',
        prompt: 'I can hear...',
        count: 3
      },
      {
        id: 'smell',
        instruction: 'Notice 2 things you can smell.',
        duration: 60,
        senseType: 'smell',
        prompt: 'I can smell...',
        count: 2
      },
      {
        id: 'taste',
        instruction: 'Notice 1 thing you can taste.',
        duration: 60,
        senseType: 'taste',
        prompt: 'I can taste...',
        count: 1
      }
    ]
  },
  {
    id: 'body-scan',
    name: 'Progressive Body Scan',
    shortName: 'Body Scan',
    description: 'Systematically notice physical sensations throughout your body',
    instructions: [
      'Start at the top of your head',
      'Slowly move attention down through each body part',
      'Notice any sensations without judgment',
      'Release tension as you go'
    ],
    duration: 480, // 8 minutes
    category: 'mindfulness',
    difficulty: 'medium',
    icon: <Hand className="w-6 h-6" />,
    color: 'bg-green-500',
    benefits: ['Reduces physical tension', 'Increases body awareness', 'Promotes relaxation'],
    steps: [
      { id: 'head', instruction: 'Focus on your head and scalp. Notice any sensations.', duration: 60 },
      { id: 'face', instruction: 'Move to your face, jaw, and neck. Release any tension.', duration: 60 },
      { id: 'shoulders', instruction: 'Notice your shoulders and arms. Let them relax.', duration: 60 },
      { id: 'chest', instruction: 'Feel your chest and breathing. Allow natural rhythm.', duration: 60 },
      { id: 'torso', instruction: 'Scan your torso and back. Notice any tension or comfort.', duration: 60 },
      { id: 'hips', instruction: 'Move attention to your hips and pelvis.', duration: 60 },
      { id: 'legs', instruction: 'Scan your legs from thighs to calves.', duration: 60 },
      { id: 'feet', instruction: 'Finally, notice your feet and toes. Ground yourself.', duration: 60 }
    ]
  },
  {
    id: 'category-naming',
    name: 'Category Naming',
    shortName: 'Categories',
    description: 'Name items in specific categories to engage your thinking mind',
    instructions: [
      'Choose a category (animals, colors, foods, etc.)',
      'Name as many items as possible',
      'Switch categories when you run out',
      'Focus on the mental effort required'
    ],
    duration: 180, // 3 minutes
    category: 'cognitive',
    difficulty: 'easy',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-purple-500',
    benefits: ['Engages logical thinking', 'Redirects anxious thoughts', 'Quick and portable'],
    steps: [
      { id: 'animals', instruction: 'Name animals, starting with each letter of the alphabet.', duration: 60 },
      { id: 'colors', instruction: 'List all the colors you can think of, including shades.', duration: 60 },
      { id: 'foods', instruction: 'Name foods from different cuisines or that start with each letter.', duration: 60 }
    ]
  },
  {
    id: 'counting-backwards',
    name: 'Counting Backwards',
    shortName: 'Count Back',
    description: 'Count backwards by 7s from 100 to engage analytical thinking',
    instructions: [
      'Start at 100',
      'Subtract 7 each time',
      'Say each number out loud or in your head',
      'If you make a mistake, start over'
    ],
    duration: 240, // 4 minutes
    category: 'cognitive',
    difficulty: 'medium',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-orange-500',
    benefits: ['Requires mental focus', 'Interrupts rumination', 'Builds concentration'],
    steps: [
      { id: 'count-100', instruction: 'Start at 100. Subtract 7. Say "93" out loud.', duration: 240 }
    ]
  },
  {
    id: 'physical-grounding',
    name: 'Physical Grounding',
    shortName: 'Physical',
    description: 'Use physical sensations and movement to anchor yourself',
    instructions: [
      'Plant feet firmly on the ground',
      'Press palms together',
      'Squeeze and release muscle groups',
      'Focus on the physical sensations'
    ],
    duration: 300, // 5 minutes
    category: 'movement',
    difficulty: 'easy',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-red-500',
    benefits: ['Immediate physical anchor', 'Releases muscle tension', 'Grounds through movement'],
    steps: [
      { id: 'feet', instruction: 'Plant your feet firmly on the ground. Feel the connection.', duration: 60 },
      { id: 'hands', instruction: 'Press your palms together firmly. Hold for 10 seconds.', duration: 60 },
      { id: 'shoulders', instruction: 'Shrug your shoulders up to your ears. Hold, then release.', duration: 60 },
      { id: 'fists', instruction: 'Make fists, squeeze tight for 5 seconds, then release.', duration: 60 },
      { id: 'whole-body', instruction: 'Tense your whole body for 5 seconds, then completely relax.', duration: 60 }
    ]
  }
];

const SENSE_ICONS = {
  sight: <Eye className="w-5 h-5" />,
  touch: <Hand className="w-5 h-5" />,
  sound: <Ear className="w-5 h-5" />,
  smell: <Coffee className="w-5 h-5" />,
  taste: <Sparkles className="w-5 h-5" />
};

const StepComponent: React.FC<{
  step: GroundingStep;
  isActive: boolean;
  isCompleted: boolean;
  timeRemaining: number;
  onComplete: () => void;
}> = ({ step, isActive, isCompleted, timeRemaining, onComplete }) => {
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleAddInput = () => {
    if (currentInput.trim()) {
      const newInputs = [...userInputs, currentInput.trim()];
      setUserInputs(newInputs);
      setCurrentInput('');
      
      if (step.count && newInputs.length >= step.count) {
        setTimeout(onComplete, 500);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
      className={cn(
        'p-6 rounded-xl border-2 transition-all',
        isActive ? 'border-blue-500 bg-blue-50' : 
        isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {step.senseType && SENSE_ICONS[step.senseType]}
          <h3 className="font-medium text-gray-900">{step.instruction}</h3>
        </div>
        
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : isActive ? (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Timer className="w-4 h-4" />
            <span>{Math.ceil(timeRemaining)}s</span>
          </div>
        ) : null}
      </div>

      {isActive && step.count && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddInput()}
              placeholder={step.prompt || 'Type what you notice...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddInput}
              disabled={!currentInput.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          
          {userInputs.length > 0 && (
            <div className="space-y-1">
              {userInputs.map((input, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{input}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            {step.count - userInputs.length} more to go
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const GroundingExercises: React.FC<GroundingExercisesProps> = ({
  onComplete,
  autoStart = false,
  className
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<GroundingTechnique>(GROUNDING_TECHNIQUES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStepTimeRemaining(prev => {
        if (prev <= 1) {
          handleStepComplete();
          return 0;
        }
        return prev - 1;
      });
      
      setTotalTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      startExercise();
    }
  }, [autoStart]);

  const startExercise = () => {
    setIsPlaying(true);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setHasCompleted(false);
    
    const firstStep = selectedTechnique.steps[0];
    setStepTimeRemaining(firstStep.duration);
    setTotalTimeRemaining(selectedTechnique.duration);
  };

  const stopExercise = () => {
    setIsPlaying(false);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setStepTimeRemaining(0);
    setTotalTimeRemaining(selectedTechnique.duration);
    setCompletedSteps(new Set());
    setHasCompleted(false);
  };

  const handleStepComplete = () => {
    const currentStep = selectedTechnique.steps[currentStepIndex];
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);

    if (currentStepIndex < selectedTechnique.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setStepTimeRemaining(selectedTechnique.steps[nextIndex].duration);
    } else {
      // Exercise completed
      setIsPlaying(false);
      setHasCompleted(true);
      onComplete?.(selectedTechnique);
    }
  };

  const currentStep = selectedTechnique.steps[currentStepIndex];

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grounding Exercises</h1>
        <p className="text-lg text-gray-600">
          Techniques to help you stay present and manage overwhelming feelings
        </p>
      </div>

      {/* Technique Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {GROUNDING_TECHNIQUES.map((technique) => (
          <motion.button
            key={technique.id}
            onClick={() => {
              if (!isPlaying) {
                setSelectedTechnique(technique);
                resetExercise();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPlaying}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              selectedTechnique.id === technique.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
              isPlaying && selectedTechnique.id !== technique.id && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={cn('p-2 rounded-lg text-white', technique.color)}>
                {technique.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{technique.name}</h3>
                <p className="text-sm text-gray-600">{technique.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className={cn(
                'px-2 py-1 rounded-full',
                technique.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                technique.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {technique.difficulty}
              </span>
              <span>{Math.floor(technique.duration / 60)} min</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main Exercise Interface */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        {/* Exercise Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedTechnique.name}</h2>
            <p className="text-gray-600">{selectedTechnique.description}</p>
          </div>
          
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-sm">Instructions</span>
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Instructions Panel */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4 mb-6"
            >
              <h3 className="font-medium text-gray-900 mb-2">How to do this exercise:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                {selectedTechnique.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        {isPlaying && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStepIndex + 1} of {selectedTechnique.steps.length}</span>
              <span>Total time: {Math.floor(totalTimeRemaining / 60)}:{(totalTimeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((selectedTechnique.duration - totalTimeRemaining) / selectedTechnique.duration) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Current Step or All Steps */}
        {isPlaying ? (
          <div className="mb-6">
            <StepComponent
              step={currentStep}
              isActive={true}
              isCompleted={false}
              timeRemaining={stepTimeRemaining}
              onComplete={handleStepComplete}
            />
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {selectedTechnique.steps.map((step, index) => (
              <StepComponent
                key={step.id}
                step={step}
                isActive={false}
                isCompleted={completedSteps.has(step.id)}
                timeRemaining={0}
                onComplete={() => {}}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={isPlaying ? stopExercise : startExercise}
            className={cn(
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors',
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Stop' : 'Start Exercise'}</span>
          </button>

          <button
            onClick={resetExercise}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
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
            <h3 className="text-lg font-medium text-green-800 mb-2">Grounding Complete!</h3>
            <p className="text-green-700 mb-4">
              You've completed the {selectedTechnique.shortName} grounding technique.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={startExercise}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Practice Again
              </button>
              <button
                onClick={resetExercise}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Try Different Technique
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benefits */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-3">Benefits of {selectedTechnique.shortName}:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {selectedTechnique.benefits.map((benefit, index) => (
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

export default GroundingExercises;