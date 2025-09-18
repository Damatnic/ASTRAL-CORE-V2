import React, { useState, useEffect } from 'react';
import {
  Shield, Heart, Users, Phone, MapPin, Activity, Brain,
  AlertTriangle, CheckCircle, Edit, Save, Download, Share2,
  Lock, Unlock, Plus, X, ChevronRight, Star, LifeBuoy,
  Home, Briefcase, Coffee, Music, Book, Sun
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SafetyPlanData {
  id: string;
  userId?: string;
  createdAt: Date;
  lastUpdated: Date;
  isLocked: boolean;
  
  // Warning Signs
  warningSignSection: {
    thoughts: string[];
    feelings: string[];
    behaviors: string[];
    situations: string[];
  };
  
  // Coping Strategies
  copingStrategies: {
    internal: CopingStrategy[];
    distraction: CopingStrategy[];
    soothing: CopingStrategy[];
  };
  
  // Support Network
  supportNetwork: {
    personal: SupportPerson[];
    professional: SupportPerson[];
    crisis: CrisisContact[];
  };
  
  // Safe Environment
  safeEnvironment: {
    removeItems: string[];
    safeSpaces: SafeSpace[];
    triggers: string[];
  };
  
  // Reasons for Living
  reasonsForLiving: {
    people: string[];
    goals: string[];
    responsibilities: string[];
    beliefs: string[];
  };
  
  // Emergency Plan
  emergencyPlan: {
    immediateActions: string[];
    hospitalPreference?: string;
    medicationList?: string[];
    allergies?: string[];
  };
}

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  icon?: string;
  effectiveness?: number; // 1-5 rating
  lastUsed?: Date;
}

interface SupportPerson {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  availability?: string;
  isEmergencyContact: boolean;
}

interface CrisisContact {
  name: string;
  number: string;
  hours: string;
  type: 'hotline' | 'text' | 'chat' | 'emergency';
}

interface SafeSpace {
  id: string;
  name: string;
  location: string;
  whyItsSafe: string;
  howToGetThere: string;
}

interface SafetyPlanBuilderProps {
  initialPlan?: Partial<SafetyPlanData>;
  onSave?: (plan: SafetyPlanData) => void;
  onShare?: (plan: SafetyPlanData) => void;
  readOnly?: boolean;
  className?: string;
}

// Default crisis contacts - ALWAYS FREE
const DEFAULT_CRISIS_CONTACTS: CrisisContact[] = [
  { name: '988 Suicide & Crisis Lifeline', number: '988', hours: '24/7', type: 'hotline' },
  { name: 'Crisis Text Line', number: '741741', hours: '24/7', type: 'text' },
  { name: 'Emergency Services', number: '911', hours: '24/7', type: 'emergency' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', hours: '24/7', type: 'hotline' },
];

// Suggested coping strategies
const SUGGESTED_STRATEGIES: CopingStrategy[] = [
  { id: '1', title: 'Box Breathing', description: 'Breathe in 4, hold 4, out 4, hold 4', icon: '🫁' },
  { id: '2', title: '5-4-3-2-1 Grounding', description: '5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste', icon: '👁️' },
  { id: '3', title: 'Progressive Muscle Relaxation', description: 'Tense and release muscle groups', icon: '💪' },
  { id: '4', title: 'Cold Water', description: 'Splash cold water on face or hold ice', icon: '🧊' },
  { id: '5', title: 'Listen to Music', description: 'Play calming or uplifting music', icon: '🎵' },
  { id: '6', title: 'Call a Friend', description: 'Reach out to someone you trust', icon: '📞' },
  { id: '7', title: 'Take a Walk', description: 'Get outside and move your body', icon: '🚶' },
  { id: '8', title: 'Journal', description: 'Write down your thoughts and feelings', icon: '📝' },
];

export const SafetyPlanBuilder: React.FC<SafetyPlanBuilderProps> = ({
  initialPlan,
  onSave,
  onShare,
  readOnly = false,
  className,
}) => {
  const [plan, setPlan] = useState<SafetyPlanData>(() => ({
    id: `safety-plan-${Date.now()}`,
    createdAt: new Date(),
    lastUpdated: new Date(),
    isLocked: false,
    warningSignSection: {
      thoughts: [],
      feelings: [],
      behaviors: [],
      situations: [],
    },
    copingStrategies: {
      internal: [],
      distraction: [],
      soothing: [],
    },
    supportNetwork: {
      personal: [],
      professional: [],
      crisis: DEFAULT_CRISIS_CONTACTS,
    },
    safeEnvironment: {
      removeItems: [],
      safeSpaces: [],
      triggers: [],
    },
    reasonsForLiving: {
      people: [],
      goals: [],
      responsibilities: [],
      beliefs: [],
    },
    emergencyPlan: {
      immediateActions: ['Call 988', 'Go to safe space', 'Remove harmful items'],
      hospitalPreference: '',
      medicationList: [],
      allergies: [],
    },
    ...initialPlan,
  }));

  const [activeSection, setActiveSection] = useState<string>('warning-signs');
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  // Calculate completion score
  useEffect(() => {
    let score = 0;
    const sections = 6;
    
    if (plan.warningSignSection.thoughts.length > 0 || 
        plan.warningSignSection.feelings.length > 0 ||
        plan.warningSignSection.behaviors.length > 0) score++;
    
    if (plan.copingStrategies.internal.length > 0 ||
        plan.copingStrategies.distraction.length > 0 ||
        plan.copingStrategies.soothing.length > 0) score++;
    
    if (plan.supportNetwork.personal.length > 0 ||
        plan.supportNetwork.professional.length > 0) score++;
    
    if (plan.safeEnvironment.safeSpaces.length > 0) score++;
    
    if (plan.reasonsForLiving.people.length > 0 ||
        plan.reasonsForLiving.goals.length > 0) score++;
    
    if (plan.emergencyPlan.immediateActions.length > 0) score++;
    
    setCompletionScore(Math.round((score / sections) * 100));
  }, [plan]);

  const handleSave = () => {
    setPlan(prev => ({ ...prev, lastUpdated: new Date() }));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    if (onSave) onSave(plan);
  };

  const handleShare = () => {
    if (onShare) onShare(plan);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `safety-plan-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const addItem = (section: string, subsection: string, item: any) => {
    setPlan(prev => {
      const currentSection = prev[section as keyof SafetyPlanData] as any;
      const currentSubsection = currentSection?.[subsection] || [];
      
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [subsection]: [...currentSubsection, item],
        },
      };
    });
  };

  const removeItem = (section: string, subsection: string, index: number) => {
    setPlan(prev => {
      const currentSection = prev[section as keyof SafetyPlanData] as any;
      const currentSubsection = currentSection?.[subsection] || [];
      
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [subsection]: currentSubsection.filter((_: any, i: number) => i !== index),
        },
      };
    });
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Personal Safety Plan</h2>
              <p className="text-blue-100">Your FREE crisis prevention toolkit</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Completion Score */}
            <div className="text-center">
              <div className="text-2xl font-bold">{completionScore}%</div>
              <div className="text-xs text-blue-100">Complete</div>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-2">
              {!readOnly && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  aria-label={isEditing ? 'Lock editing' : 'Edit plan'}
                >
                  {isEditing ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={handleSave}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Save plan"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Share plan"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Download plan"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${completionScore}%` }}
          />
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Safety plan saved successfully!</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'warning-signs', label: 'Warning Signs', icon: AlertTriangle },
            { id: 'coping', label: 'Coping Strategies', icon: Brain },
            { id: 'support', label: 'Support Network', icon: Users },
            { id: 'environment', label: 'Safe Environment', icon: Home },
            { id: 'reasons', label: 'Reasons for Living', icon: Heart },
            { id: 'emergency', label: 'Emergency Plan', icon: LifeBuoy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                'flex items-center space-x-2 py-3 border-b-2 transition-colors whitespace-nowrap',
                activeSection === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6">
        {/* Warning Signs Section */}
        {activeSection === 'warning-signs' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recognize Your Warning Signs
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Identifying early warning signs helps you take action before a crisis escalates.
              </p>
            </div>

            {['thoughts', 'feelings', 'behaviors', 'situations'].map((category) => (
              <div key={category} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  Warning {category}
                </label>
                <div className="space-y-2">
                  {(plan.warningSignSection[category as keyof typeof plan.warningSignSection] as string[]).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeItem('warningSignSection', category, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const item = prompt(`Add a warning ${category.slice(0, -1)}:`);
                        if (item) addItem('warningSignSection', category, item);
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add {category.slice(0, -1)}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coping Strategies Section */}
        {activeSection === 'coping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Coping Toolkit
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Personal strategies to manage difficult emotions and situations.
              </p>
            </div>

            {/* Suggested Strategies */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Suggested Strategies (FREE Resources)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SUGGESTED_STRATEGIES.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => {
                      if (isEditing) {
                        addItem('copingStrategies', 'internal', strategy);
                      }
                    }}
                    className="flex flex-col items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <span className="text-2xl mb-1">{strategy.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{strategy.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Strategies */}
            {['internal', 'distraction', 'soothing'].map((type) => (
              <div key={type}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">
                  {type} Strategies
                </h4>
                <div className="space-y-2">
                  {(plan.copingStrategies[type as keyof typeof plan.copingStrategies] as CopingStrategy[]).map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{strategy.title}</span>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeItem('copingStrategies', type, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Network Section */}
        {activeSection === 'support' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Support Network
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                People and services you can reach out to for help.
              </p>
            </div>

            {/* Crisis Contacts - Always Available */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3">24/7 Crisis Lines (FREE)</h4>
              <div className="space-y-2">
                {plan.supportNetwork.crisis.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        <p className="text-sm text-gray-600">{contact.number} • {contact.hours}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${contact.number}`}
                      className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
                    >
                      Call Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Contacts */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Personal Contacts</h4>
              {isEditing && (
                <button
                  onClick={() => {
                    const name = prompt('Contact name:');
                    const phone = prompt('Phone number:');
                    const relationship = prompt('Relationship:');
                    if (name && phone) {
                      addItem('supportNetwork', 'personal', {
                        id: Date.now().toString(),
                        name,
                        phone,
                        relationship: relationship || '',
                        isEmergencyContact: false,
                      });
                    }
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm mb-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              )}
              <div className="space-y-2">
                {plan.supportNetwork.personal.map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{person.name}</span>
                      <p className="text-sm text-gray-600">{person.relationship} • {person.phone}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeItem('supportNetwork', 'personal', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional sections would continue in the same pattern... */}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(plan.lastUpdated).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Your plan is 100% private and FREE forever</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlanBuilder;