import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain, Heart, Activity, TrendingUp, TrendingDown, AlertCircle,
  Smile, Frown, Meh, CloudRain, Sun, Moon, Zap, Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

interface EmotionData {
  primary: EmotionType;
  confidence: number;
  secondary?: EmotionType;
  triggers: string[];
  timestamp: Date;
}

type EmotionType = 
  | 'happy' | 'sad' | 'anxious' | 'angry' 
  | 'fearful' | 'neutral' | 'hopeful' | 'desperate'
  | 'overwhelmed' | 'numb' | 'confused' | 'calm';

interface EmotionDetectorProps {
  inputText?: string;
  voiceTone?: AudioBuffer;
  facialExpression?: ImageData;
  behavioralPatterns?: BehavioralData;
  onEmotionDetected?: (emotion: EmotionData) => void;
  showVisualFeedback?: boolean;
  className?: string;
}

interface BehavioralData {
  typingSpeed: number; // WPM
  erasureRate: number; // Percentage of text deleted
  pauseDuration: number; // Average pause in ms
  messageFrequency: number; // Messages per minute
  responseLatency: number; // Time to respond in ms
}

// Emotion keyword mappings (simplified AI model)
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love'],
  sad: ['sad', 'depressed', 'down', 'lonely', 'empty', 'worthless', 'hopeless'],
  anxious: ['anxious', 'worried', 'nervous', 'scared', 'panic', 'stressed', 'overwhelmed'],
  angry: ['angry', 'mad', 'furious', 'frustrated', 'annoyed', 'pissed', 'rage'],
  fearful: ['afraid', 'terrified', 'frightened', 'scared', 'fear', 'danger', 'threat'],
  neutral: ['okay', 'fine', 'alright', 'normal', 'usual', 'regular'],
  hopeful: ['hope', 'better', 'improving', 'optimistic', 'positive', 'looking up'],
  desperate: ['desperate', 'cant take', 'end it', 'no way out', 'trapped', 'suffocating'],
  overwhelmed: ['overwhelmed', 'too much', 'cant handle', 'drowning', 'crushing'],
  numb: ['numb', 'nothing', 'empty', 'void', 'disconnected', 'unreal'],
  confused: ['confused', 'lost', 'dont know', 'uncertain', 'unclear', 'mixed'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed'],
};

// Behavioral pattern indicators
const BEHAVIORAL_INDICATORS = {
  crisis: {
    typingSpeed: { min: 0, max: 20 }, // Very slow or erratic
    erasureRate: { min: 0.4, max: 1 }, // High deletion rate
    pauseDuration: { min: 5000, max: Infinity }, // Long pauses
    responseLatency: { min: 10000, max: Infinity }, // Very delayed responses
  },
  anxious: {
    typingSpeed: { min: 80, max: 150 }, // Fast typing
    erasureRate: { min: 0.2, max: 0.4 }, // Moderate corrections
    pauseDuration: { min: 500, max: 2000 }, // Short, erratic pauses
    responseLatency: { min: 100, max: 1000 }, // Quick responses
  },
  calm: {
    typingSpeed: { min: 40, max: 60 }, // Steady pace
    erasureRate: { min: 0, max: 0.1 }, // Few corrections
    pauseDuration: { min: 1000, max: 3000 }, // Regular pauses
    responseLatency: { min: 2000, max: 5000 }, // Thoughtful responses
  },
};

export const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  inputText = '',
  voiceTone,
  facialExpression,
  behavioralPatterns,
  onEmotionDetected,
  showVisualFeedback = true,
  className,
}) => {
  const { updateEmotionalState, updateUrgencyLevel } = useEmotionTheme();
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionData | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionTrend, setEmotionTrend] = useState<'improving' | 'stable' | 'declining'>('stable');
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();

  // Analyze text for emotional content
  const analyzeText = useCallback((text: string): EmotionData => {
    const lowerText = text.toLowerCase();
    const emotionScores: Record<EmotionType, number> = {} as any;
    const triggers: string[] = [];

    // Calculate emotion scores based on keyword presence
    Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 1;
          triggers.push(keyword);
        }
      });
      emotionScores[emotion as EmotionType] = score;
    });

    // Find primary emotion
    const primaryEmotion = Object.entries(emotionScores)
      .reduce((a, b) => emotionScores[a[0] as EmotionType] > emotionScores[b[0] as EmotionType] ? a : b)[0] as EmotionType;

    // Calculate confidence
    const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? emotionScores[primaryEmotion] / totalScore : 0.5;

    // Find secondary emotion if exists
    const secondaryEmotion = Object.entries(emotionScores)
      .filter(([emotion]) => emotion !== primaryEmotion)
      .reduce((a, b) => emotionScores[a[0] as EmotionType] > emotionScores[b[0] as EmotionType] ? a : b, null);

    return {
      primary: primaryEmotion,
      confidence: Math.min(confidence, 1),
      secondary: secondaryEmotion ? secondaryEmotion[0] as EmotionType : undefined,
      triggers: [...new Set(triggers)],
      timestamp: new Date(),
    };
  }, []);

  // Analyze behavioral patterns
  const analyzeBehavior = useCallback((data: BehavioralData): EmotionType => {
    if (data.typingSpeed < 20 && data.erasureRate > 0.4) {
      return 'desperate';
    }
    if (data.typingSpeed > 80 && data.pauseDuration < 2000) {
      return 'anxious';
    }
    if (data.typingSpeed >= 40 && data.typingSpeed <= 60 && data.erasureRate < 0.1) {
      return 'calm';
    }
    return 'neutral';
  }, []);

  // Combined analysis
  const performAnalysis = useCallback(() => {
    setIsAnalyzing(true);

    // Simulate analysis delay for UX
    analysisTimeoutRef.current = setTimeout(() => {
      let emotion: EmotionData;

      if (inputText) {
        emotion = analyzeText(inputText);
      } else if (behavioralPatterns) {
        const behaviorEmotion = analyzeBehavior(behavioralPatterns);
        emotion = {
          primary: behaviorEmotion,
          confidence: 0.7,
          triggers: ['behavioral pattern'],
          timestamp: new Date(),
        };
      } else {
        emotion = {
          primary: 'neutral',
          confidence: 0.5,
          triggers: [],
          timestamp: new Date(),
        };
      }

      setDetectedEmotion(emotion);
      setEmotionHistory(prev => [...prev.slice(-9), emotion]);
      
      // Update emotion theme
      const emotionMap: Record<EmotionType, string> = {
        happy: 'hopeful',
        sad: 'depressed',
        anxious: 'anxious',
        angry: 'distressed',
        fearful: 'anxious',
        desperate: 'crisis',
        overwhelmed: 'distressed',
        hopeful: 'hopeful',
        calm: 'calm',
        neutral: 'neutral',
        numb: 'depressed',
        confused: 'anxious',
      };

      updateEmotionalState(emotionMap[emotion.primary] as any);
      
      // Update urgency based on emotion
      if (['desperate', 'overwhelmed'].includes(emotion.primary)) {
        updateUrgencyLevel('immediate');
      } else if (['anxious', 'fearful', 'angry'].includes(emotion.primary)) {
        updateUrgencyLevel('high');
      } else if (['sad', 'confused', 'numb'].includes(emotion.primary)) {
        updateUrgencyLevel('moderate');
      } else {
        updateUrgencyLevel('low');
      }

      if (onEmotionDetected) {
        onEmotionDetected(emotion);
      }

      setIsAnalyzing(false);
    }, 500);
  }, [inputText, behavioralPatterns, analyzeText, analyzeBehavior, updateEmotionalState, updateUrgencyLevel, onEmotionDetected]);

  // Trigger analysis when inputs change
  useEffect(() => {
    if (inputText || behavioralPatterns) {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      performAnalysis();
    }
  }, [inputText, behavioralPatterns, performAnalysis]);

  // Calculate emotion trend
  useEffect(() => {
    if (emotionHistory.length >= 3) {
      const recent = emotionHistory.slice(-3);
      const emotionValues: Record<EmotionType, number> = {
        happy: 10, hopeful: 8, calm: 7, neutral: 5,
        confused: 4, anxious: 3, sad: 2, angry: 2,
        fearful: 2, numb: 1, overwhelmed: 1, desperate: 0,
      };

      const values = recent.map(e => emotionValues[e.primary]);
      const trend = values[2] - values[0];

      if (trend > 2) setEmotionTrend('improving');
      else if (trend < -2) setEmotionTrend('declining');
      else setEmotionTrend('stable');
    }
  }, [emotionHistory]);

  // Get emotion icon
  const getEmotionIcon = (emotion: EmotionType) => {
    const icons: Record<EmotionType, React.ElementType> = {
      happy: Sun,
      sad: CloudRain,
      anxious: Zap,
      angry: Zap,
      fearful: Shield,
      neutral: Meh,
      hopeful: Sun,
      desperate: AlertCircle,
      overwhelmed: Activity,
      numb: Moon,
      confused: Brain,
      calm: Heart,
    };
    return icons[emotion] || Meh;
  };

  // Get emotion color
  const getEmotionColor = (emotion: EmotionType) => {
    const colors: Record<EmotionType, string> = {
      happy: 'text-yellow-500 bg-yellow-100',
      sad: 'text-blue-500 bg-blue-100',
      anxious: 'text-purple-500 bg-purple-100',
      angry: 'text-red-500 bg-red-100',
      fearful: 'text-orange-500 bg-orange-100',
      neutral: 'text-gray-500 bg-gray-100',
      hopeful: 'text-green-500 bg-green-100',
      desperate: 'text-red-600 bg-red-100',
      overwhelmed: 'text-orange-600 bg-orange-100',
      numb: 'text-gray-600 bg-gray-100',
      confused: 'text-indigo-500 bg-indigo-100',
      calm: 'text-teal-500 bg-teal-100',
    };
    return colors[emotion] || 'text-gray-500 bg-gray-100';
  };

  if (!showVisualFeedback) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Emotion Display */}
      {detectedEmotion && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Emotional State</h3>
            <div className="flex items-center space-x-2">
              {emotionTrend === 'improving' && (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
              {emotionTrend === 'declining' && (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              {emotionTrend === 'stable' && (
                <Activity className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-sm text-gray-600 capitalize">{emotionTrend}</span>
            </div>
          </div>

          {/* Primary Emotion */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              getEmotionColor(detectedEmotion.primary)
            )}>
              {React.createElement(getEmotionIcon(detectedEmotion.primary), {
                className: 'w-8 h-8',
              })}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl font-semibold capitalize text-gray-900">
                  {detectedEmotion.primary}
                </span>
                {detectedEmotion.secondary && (
                  <span className="text-sm text-gray-500">
                    with hints of {detectedEmotion.secondary}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${detectedEmotion.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(detectedEmotion.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Triggers */}
          {detectedEmotion.triggers.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">Detected triggers:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {detectedEmotion.triggers.map((trigger, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Crisis Warning */}
          {['desperate', 'overwhelmed'].includes(detectedEmotion.primary) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Crisis indicators detected. Immediate support recommended.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emotion History */}
      {emotionHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Timeline</h3>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {emotionHistory.map((emotion, index) => {
              const Icon = getEmotionIcon(emotion.primary);
              return (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    getEmotionColor(emotion.primary),
                    index === emotionHistory.length - 1 && 'ring-2 ring-blue-500'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(emotion.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyzing Indicator */}
      {isAnalyzing && (
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
          <span className="text-sm">Analyzing emotional state...</span>
        </div>
      )}
    </div>
  );
};

// Emotion Dashboard Component
export const EmotionDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const [behavioralData] = useState<BehavioralData>({
    typingSpeed: 45,
    erasureRate: 0.15,
    pauseDuration: 2000,
    messageFrequency: 3,
    responseLatency: 3000,
  });

  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Emotion Detection System</h2>
        <p className="text-purple-100">
          AI-powered emotional analysis for better crisis support - 100% FREE
        </p>
      </div>

      <EmotionDetector
        inputText="I'm feeling really anxious and overwhelmed today"
        behavioralPatterns={behavioralData}
        onEmotionDetected={(emotion) => {
          console.log('Emotion detected:', emotion);
        }}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            All emotional data is processed locally and never stored or shared.
            Your privacy is protected.
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;