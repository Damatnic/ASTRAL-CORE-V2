import React, { useState } from 'react';
import { TherapeuticLayout } from '../components/therapeutic/TherapeuticLayout';
import { TherapeuticChat } from '../components/therapeutic/TherapeuticChat';
import { BreathingGuide } from '../components/therapeutic/BreathingGuide';
import { EnhancedCrisisButton } from '../components/crisis/EnhancedCrisisButton';
import { CrisisMobileInterface } from '../components/mobile/CrisisMobileInterface';
import { AccessibilityProvider, AccessibilityControls } from '../components/accessibility/AccessibilityProvider';

/**
 * Demo component showcasing the enhanced therapeutic UI components
 * This demonstrates the new Phase 5 UI/UX enhancements for ASTRAL Core V2
 */
export const TherapeuticUIDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'layout' | 'chat' | 'breathing' | 'crisis' | 'mobile' | 'accessibility'>('layout');
  const [showA11yControls, setShowA11yControls] = useState(false);

  // Sample messages for chat demo
  const sampleMessages = [
    {
      id: '1',
      content: "Hello, I'm Dr. Sarah, your AI therapist. How are you feeling today?",
      sender: 'therapist' as const,
      timestamp: new Date(),
      emotion: 'neutral' as const,
      therapeutic_note: "Opening with empathy and establishing connection",
    },
    {
      id: '2',
      content: "I've been feeling really anxious lately and I'm not sure how to cope.",
      sender: 'user' as const,
      timestamp: new Date(),
      emotion: 'negative' as const,
    },
    {
      id: '3',
      content: "I understand that anxiety can feel overwhelming. Let's work together to find some coping strategies that work for you. Would you like to try a breathing exercise?",
      sender: 'therapist' as const,
      timestamp: new Date(),
      emotion: 'positive' as const,
      therapeutic_note: "Validating feelings and offering practical support",
      exercises: ['4-7-8 Breathing', 'Progressive Muscle Relaxation', 'Grounding Technique'],
    },
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'layout':
        return (
          <TherapeuticLayout 
            mode="calm"
            enableCalmMode={true}
            showSafetyIndicator={true}
            className="h-[600px]"
          >
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Therapeutic Layout Demo
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                This layout provides a calming, stress-reducing environment with contextual 
                controls for breathing exercises, ambient sounds, and safety indicators.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Calming Environment</h3>
                  <p className="text-sm text-purple-700">
                    Therapeutic color palettes and gentle gradients
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Safety Indicators</h3>
                  <p className="text-sm text-purple-700">
                    Always-visible safety status and quick access controls
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Ambient Controls</h3>
                  <p className="text-sm text-purple-700">
                    Customizable environment with breathing guides
                  </p>
                </div>
              </div>
            </div>
          </TherapeuticLayout>
        );

      case 'chat':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Therapeutic Chat Interface</h2>
            <TherapeuticChat
              messages={sampleMessages}
              therapistName="Dr. Sarah"
              enableVoice={true}
              enableEmotionTracking={true}
              showTherapeuticNotes={true}
              onSendMessage={(message) => console.log('Sending message:', message)}
              onMessageFeedback={(id, feedback) => console.log('Feedback:', id, feedback)}
              className="max-w-4xl mx-auto"
            />
          </div>
        );

      case 'breathing':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Breathing Exercise Demo
            </h2>
            <div className="max-w-2xl mx-auto">
              <BreathingGuide
                technique="4-7-8"
                autoStart={false}
                showInstructions={true}
                enableAudio={true}
                enableHaptics={true}
                onComplete={() => console.log('Breathing exercise completed')}
              />
            </div>
          </div>
        );

      case 'crisis':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Enhanced Crisis Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <EnhancedCrisisButton
                variant="emergency"
                size="large"
                urgency="critical"
                confirmationRequired={true}
                onClick={() => console.log('Emergency button clicked')}
              />
              
              <EnhancedCrisisButton
                variant="chat"
                size="large"
                urgency="high"
                onClick={() => console.log('Crisis chat button clicked')}
              />
              
              <EnhancedCrisisButton
                variant="call"
                size="large"
                urgency="high"
                onClick={() => console.log('Call 988 button clicked')}
              />
              
              <EnhancedCrisisButton
                variant="safety"
                size="medium"
                urgency="medium"
                onClick={() => console.log('Safety plan button clicked')}
              />
              
              <EnhancedCrisisButton
                variant="tether"
                size="medium"
                urgency="medium"
                onClick={() => console.log('Tether button clicked')}
              />
              
              <EnhancedCrisisButton
                variant="immediate"
                size="large"
                urgency="critical"
                countdown={5}
                confirmationRequired={true}
                onClick={() => console.log('Immediate help button clicked')}
              />
            </div>
          </div>
        );

      case 'mobile':
        return (
          <div className="relative h-[600px] max-w-sm mx-auto">
            <CrisisMobileInterface
              emergencyMode={false}
              oneHandedMode={false}
              showNetworkStatus={true}
              enableGestures={true}
              onEmergencyCall={() => console.log('Emergency call initiated')}
              onCrisisChat={() => console.log('Crisis chat started')}
              onSafetyPlan={() => console.log('Safety plan opened')}
              onLocationShare={() => console.log('Location shared')}
            />
          </div>
        );

      case 'accessibility':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Accessibility Controls Demo
            </h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-600 mb-4">
                  The accessibility provider offers comprehensive WCAG 2.1 AA compliance
                  with features like high contrast mode, motion reduction, larger touch
                  targets, and cognitive accessibility options.
                </p>
                
                <button
                  onClick={() => setShowA11yControls(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors"
                >
                  Open Accessibility Settings
                </button>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Features Include:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• High contrast mode for visual impairments</li>
                  <li>• Motion reduction for vestibular disorders</li>
                  <li>• Larger touch targets for motor difficulties</li>
                  <li>• Simplified UI for cognitive accessibility</li>
                  <li>• Emergency accessibility mode for crisis situations</li>
                  <li>• Automatic system preference detection</li>
                </ul>
              </div>
            </div>
            
            <AccessibilityControls
              isOpen={showA11yControls}
              onClose={() => setShowA11yControls(false)}
              emergencyMode={false}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">
                ASTRAL Core V2 - Therapeutic UI Demo
              </h1>
              
              <div className="flex space-x-1">
                {[
                  { key: 'layout', label: 'Layout' },
                  { key: 'chat', label: 'Chat' },
                  { key: 'breathing', label: 'Breathing' },
                  { key: 'crisis', label: 'Crisis' },
                  { key: 'mobile', label: 'Mobile' },
                  { key: 'accessibility', label: 'A11y' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveDemo(key as any)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${activeDemo === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Demo Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {renderDemo()}
        </main>
      </div>
    </AccessibilityProvider>
  );
};

export default TherapeuticUIDemo;