'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Heart, Users, Phone, Brain, ChevronRight, ChevronLeft,
  Plus, Trash2, Edit3, Download, Share2, Lock, Save, FileText,
  AlertCircle, CheckCircle, Star, Clock, MapPin, Activity,
  Sparkles, Target, Lightbulb, MessageCircle, UserCheck,
  Calendar, Bell, Zap, Award, TrendingUp, Info, Copy, Mail
} from 'lucide-react';

// Enhanced interfaces for the advanced safety plan
interface ClinicalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'adolescent' | 'elderly' | 'veteran' | 'lgbtq+' | 'trauma';
  sections: TemplateSections;
  evidenceBase: string[];
  recommendations: string[];
}

interface TemplateSections {
  warningSignsPersonal: string[];
  warningSignsCrisis: string[];
  copingStrategies: CopingStrategy[];
  distractionTechniques: string[];
  groundingExercises: GroundingExercise[];
  socialContacts: ContactTemplate[];
  professionalContacts: ContactTemplate[];
  environmentSafety: SafetyMeasure[];
  reasonsToLive: string[];
  selfCareActivities: SelfCareActivity[];
  medicationReminders?: MedicationReminder[];
}

interface CopingStrategy {
  name: string;
  category: 'cognitive' | 'behavioral' | 'emotional' | 'spiritual' | 'physical';
  description: string;
  effectiveness?: number; // 1-5 rating from past usage
  lastUsed?: Date;
}

interface GroundingExercise {
  name: string;
  type: '5-4-3-2-1' | 'breathing' | 'muscle-relaxation' | 'visualization' | 'mindfulness';
  instructions: string[];
  duration: number; // in minutes
}

interface ContactTemplate {
  role: string;
  suggestedTimes?: string;
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SafetyMeasure {
  action: string;
  priority: 'immediate' | 'within-24h' | 'ongoing';
  responsible?: string;
}

interface SelfCareActivity {
  name: string;
  category: 'physical' | 'emotional' | 'social' | 'intellectual' | 'spiritual';
  frequency: 'daily' | 'weekly' | 'as-needed';
}

interface MedicationReminder {
  medication: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  purpose: string;
}

interface AdvancedSafetyPlan {
  id: string;
  title: string;
  templateId?: string;
  createdAt: Date;
  lastUpdated: Date;
  lastReviewed: Date;
  nextReviewDate: Date;
  version: number;
  status: 'draft' | 'active' | 'archived';
  sections: {
    warningSignsPersonal: string[];
    warningSignsCrisis: string[];
    copingStrategies: CopingStrategy[];
    distractionTechniques: string[];
    groundingExercises: GroundingExercise[];
    socialContacts: Contact[];
    professionalContacts: Contact[];
    environmentSafety: SafetyMeasure[];
    reasonsToLive: string[];
    selfCareActivities: SelfCareActivity[];
    medicationReminders: MedicationReminder[];
    emergencyContacts: Contact[];
  };
  sharedWith: SharedContact[];
  professionalEndorsement?: ProfessionalEndorsement;
  analytics: PlanAnalytics;
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  availability?: string;
  isEmergency?: boolean;
  lastContacted?: Date;
  preferredContactMethod?: 'phone' | 'text' | 'email';
}

interface SharedContact {
  id: string;
  name: string;
  email: string;
  relationship: 'therapist' | 'family' | 'friend' | 'caregiver';
  permissions: ('view' | 'edit' | 'notification')[];
  sharedAt: Date;
}

interface ProfessionalEndorsement {
  professionalId: string;
  professionalName: string;
  credentials: string;
  endorsedAt: Date;
  notes?: string;
}

interface PlanAnalytics {
  timesAccessed: number;
  lastAccessed: Date;
  crisisEventsLogged: number;
  successfulInterventions: number;
  mostUsedStrategies: string[];
  averageEffectiveness: number;
}

// Clinical templates based on evidence-based practices
const clinicalTemplates: ClinicalTemplate[] = [
  {
    id: 'template_standard',
    name: 'Standard Safety Plan',
    description: 'Evidence-based template following Stanley & Brown (2012) Safety Planning Intervention',
    category: 'standard',
    evidenceBase: [
      'Stanley & Brown Safety Planning Intervention (2012)',
      'Validated in multiple RCTs',
      'Reduces suicide attempts by 45%'
    ],
    recommendations: [
      'Complete with mental health professional',
      'Review and update regularly',
      'Keep accessible at all times'
    ],
    sections: {
      warningSignsPersonal: [
        'Feeling overwhelmed or anxious',
        'Difficulty sleeping or sleeping too much',
        'Isolating from friends and family',
        'Changes in appetite',
        'Difficulty concentrating',
        'Increased irritability',
        'Feeling hopeless about the future'
      ],
      warningSignsCrisis: [
        'Thoughts of suicide',
        'Thoughts of self-harm',
        'Making plans to end life',
        'Feeling like a burden',
        'Unbearable emotional pain',
        'Feeling trapped',
        'Experiencing command hallucinations'
      ],
      copingStrategies: [
        {
          name: 'Deep Breathing Exercise',
          category: 'physical',
          description: '4-7-8 breathing technique to activate parasympathetic nervous system'
        },
        {
          name: 'Progressive Muscle Relaxation',
          category: 'physical',
          description: 'Systematically tense and relax muscle groups'
        },
        {
          name: 'Cognitive Restructuring',
          category: 'cognitive',
          description: 'Challenge negative thoughts with evidence'
        },
        {
          name: 'Grounding with 5-4-3-2-1',
          category: 'behavioral',
          description: 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste'
        }
      ],
      distractionTechniques: [
        'Listen to uplifting music',
        'Watch a favorite movie or TV show',
        'Go for a walk in nature',
        'Call a friend to chat',
        'Engage in a hobby',
        'Play with a pet',
        'Do a puzzle or brain teaser'
      ],
      groundingExercises: [
        {
          name: '5-4-3-2-1 Sensory Grounding',
          type: '5-4-3-2-1',
          instructions: [
            'Name 5 things you can see',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
          ],
          duration: 5
        },
        {
          name: 'Box Breathing',
          type: 'breathing',
          instructions: [
            'Breathe in for 4 counts',
            'Hold for 4 counts',
            'Breathe out for 4 counts',
            'Hold for 4 counts',
            'Repeat 4-5 times'
          ],
          duration: 3
        }
      ],
      socialContacts: [
        {
          role: 'Close Friend',
          suggestedTimes: 'Evenings and weekends',
          emergencyLevel: 'medium'
        },
        {
          role: 'Family Member',
          suggestedTimes: 'Anytime',
          emergencyLevel: 'high'
        }
      ],
      professionalContacts: [
        {
          role: 'Therapist/Counselor',
          suggestedTimes: 'Business hours',
          emergencyLevel: 'high'
        },
        {
          role: 'Psychiatrist',
          suggestedTimes: 'Business hours',
          emergencyLevel: 'high'
        }
      ],
      environmentSafety: [
        {
          action: 'Remove or secure potentially harmful items',
          priority: 'immediate',
          responsible: 'Self or trusted person'
        },
        {
          action: 'Stay with someone or in public spaces',
          priority: 'immediate',
          responsible: 'Self'
        },
        {
          action: 'Avoid alcohol and substances',
          priority: 'ongoing',
          responsible: 'Self'
        }
      ],
      reasonsToLive: [
        'Family and loved ones',
        'Future goals and dreams',
        'Pets or animals that depend on me',
        'Spiritual or religious beliefs',
        'Desire to help others',
        'Curiosity about the future',
        'Meaningful work or purpose'
      ],
      selfCareActivities: [
        {
          name: 'Regular exercise',
          category: 'physical',
          frequency: 'daily'
        },
        {
          name: 'Journaling',
          category: 'emotional',
          frequency: 'daily'
        },
        {
          name: 'Connect with friends',
          category: 'social',
          frequency: 'weekly'
        }
      ]
    }
  },
  {
    id: 'template_adolescent',
    name: 'Adolescent Safety Plan',
    description: 'Specialized template for teens and young adults with age-appropriate interventions',
    category: 'adolescent',
    evidenceBase: [
      'Adapted from SAFETY-A Study (Asarnow et al., 2021)',
      'Incorporates DBT skills for emotion regulation',
      'Family involvement components'
    ],
    recommendations: [
      'Include trusted adults in planning',
      'Focus on school and peer support',
      'Incorporate technology-based coping'
    ],
    sections: {
      warningSignsPersonal: [
        'Feeling disconnected from friends',
        'Grades dropping',
        'Fighting more with family',
        'Spending too much time online',
        'Changes in eating habits',
        'Feeling different or not fitting in'
      ],
      warningSignsCrisis: [
        'Thoughts of ending life',
        'Self-harm behaviors',
        'Feeling completely alone',
        'Believing everyone would be better off',
        'Making goodbye posts online',
        'Giving away belongings'
      ],
      copingStrategies: [
        {
          name: 'TIPP Skills',
          category: 'behavioral',
          description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation'
        },
        {
          name: 'Opposite Action',
          category: 'emotional',
          description: 'Do opposite of what emotions tell you'
        }
      ],
      distractionTechniques: [
        'Play video games',
        'Listen to music or podcasts',
        'Draw or create art',
        'Text a friend',
        'Watch TikToks or YouTube',
        'Go for a bike ride or skateboard'
      ],
      groundingExercises: [],
      socialContacts: [],
      professionalContacts: [],
      environmentSafety: [],
      reasonsToLive: [],
      selfCareActivities: []
    }
  }
];

export default function SafetyPlanGenerator() {
  const [currentPlan, setCurrentPlan] = useState<AdvancedSafetyPlan | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ClinicalTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRelationship, setShareRelationship] = useState<'therapist' | 'family' | 'friend' | 'caregiver'>('therapist');
  const [sharePermissions, setSharePermissions] = useState<('view' | 'edit' | 'notification')[]>(['view']);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const lastSaveTime = useRef<Date | null>(null);

  // Advanced step configuration with clinical guidance
  const steps = [
    {
      title: 'Template Selection',
      description: 'Choose an evidence-based template',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      clinicalNote: 'Select a template that best matches your needs and situation'
    },
    {
      title: 'Personal Warning Signs',
      description: 'Early indicators of distress',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      clinicalNote: 'Identifying early warning signs helps you intervene before crisis escalates'
    },
    {
      title: 'Crisis Warning Signs',
      description: 'Immediate risk indicators',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      clinicalNote: 'These signs indicate need for immediate support or intervention'
    },
    {
      title: 'Coping Strategies',
      description: 'Evidence-based techniques',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      clinicalNote: 'Personalized coping strategies based on what has worked for you'
    },
    {
      title: 'Grounding & Distraction',
      description: 'Immediate relief techniques',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      clinicalNote: 'Quick techniques to manage intense emotions and stay present'
    },
    {
      title: 'Social Support',
      description: 'People who can help',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      clinicalNote: 'Building your support network for different levels of need'
    },
    {
      title: 'Professional Help',
      description: 'Clinical support contacts',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      clinicalNote: 'Professional resources for ongoing and crisis support'
    },
    {
      title: 'Environment Safety',
      description: 'Making your space safer',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      clinicalNote: 'Practical steps to reduce access to means of harm'
    },
    {
      title: 'Reasons for Living',
      description: 'Your motivations and values',
      icon: Star,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      clinicalNote: 'Protective factors that give your life meaning and purpose'
    },
    {
      title: 'Self-Care Plan',
      description: 'Ongoing wellness activities',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      clinicalNote: 'Preventive self-care to maintain mental wellness'
    },
    {
      title: 'Review & Share',
      description: 'Finalize and distribute',
      icon: Share2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      clinicalNote: 'Share with trusted individuals for support and accountability'
    }
  ];

  // Initialize with empty plan or load from storage
  useEffect(() => {
    loadSafetyPlan();
    // Set up autosave interval
    if (autosaveEnabled) {
      const interval = setInterval(() => {
        if (currentPlan && isEditing) {
          savePlanToStorage(currentPlan);
          lastSaveTime.current = new Date();
        }
      }, 30000); // Autosave every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autosaveEnabled, currentPlan, isEditing]);

  const loadSafetyPlan = () => {
    const saved = localStorage.getItem('advancedSafetyPlan');
    if (saved) {
      const plan = JSON.parse(saved);
      plan.createdAt = new Date(plan.createdAt);
      plan.lastUpdated = new Date(plan.lastUpdated);
      plan.lastReviewed = new Date(plan.lastReviewed);
      plan.nextReviewDate = new Date(plan.nextReviewDate);
      setCurrentPlan(plan);
      setShowTemplateSelector(false);
      setCurrentStep(1);
    }
  };

  const savePlanToStorage = (plan: AdvancedSafetyPlan) => {
    plan.lastUpdated = new Date();
    plan.version += 0.1;
    localStorage.setItem('advancedSafetyPlan', JSON.stringify(plan));
  };

  const createPlanFromTemplate = (template: ClinicalTemplate) => {
    const newPlan: AdvancedSafetyPlan = {
      id: 'plan_' + Date.now(),
      title: 'My Safety Plan',
      templateId: template.id,
      createdAt: new Date(),
      lastUpdated: new Date(),
      lastReviewed: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      version: 1.0,
      status: 'draft',
      sections: {
        warningSignsPersonal: template.sections.warningSignsPersonal,
        warningSignsCrisis: template.sections.warningSignsCrisis,
        copingStrategies: template.sections.copingStrategies,
        distractionTechniques: template.sections.distractionTechniques,
        groundingExercises: template.sections.groundingExercises,
        socialContacts: [],
        professionalContacts: [],
        environmentSafety: template.sections.environmentSafety,
        reasonsToLive: template.sections.reasonsToLive,
        selfCareActivities: template.sections.selfCareActivities,
        medicationReminders: template.sections.medicationReminders || [],
        emergencyContacts: [
          {
            id: 'emergency_988',
            name: '988 Crisis Lifeline',
            relationship: 'National Crisis Support',
            phone: '988',
            isEmergency: true,
            availability: '24/7',
            preferredContactMethod: 'phone'
          },
          {
            id: 'emergency_text',
            name: 'Crisis Text Line',
            relationship: 'Text Support',
            phone: '741741',
            notes: 'Text HOME to 741741',
            isEmergency: true,
            availability: '24/7',
            preferredContactMethod: 'text'
          }
        ]
      },
      sharedWith: [],
      analytics: {
        timesAccessed: 0,
        lastAccessed: new Date(),
        crisisEventsLogged: 0,
        successfulInterventions: 0,
        mostUsedStrategies: [],
        averageEffectiveness: 0
      }
    };

    setCurrentPlan(newPlan);
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setIsEditing(true);
    setCurrentStep(1);
    savePlanToStorage(newPlan);
  };

  const validatePlan = (): boolean => {
    const errors: string[] = [];
    
    if (!currentPlan) {
      errors.push('No plan created');
      setValidationErrors(errors);
      return false;
    }

    // Check minimum requirements
    if (currentPlan?.sections.warningSignsPersonal.length < 3) {
      errors.push('Add at least 3 personal warning signs');
    }
    if (currentPlan?.sections.copingStrategies.length < 3) {
      errors.push('Add at least 3 coping strategies');
    }
    if (currentPlan?.sections.socialContacts.length < 2) {
      errors.push('Add at least 2 social support contacts');
    }
    if (currentPlan?.sections.reasonsToLive.length < 3) {
      errors.push('Add at least 3 reasons for living');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const finalizePlan = () => {
    if (!validatePlan()) {
      alert('Please complete all required sections before finalizing');
      return;
    }

    if (currentPlan) {
      currentPlan.status = 'active';
      currentPlan.lastReviewed = new Date();
      savePlanToStorage(currentPlan);
      setIsEditing(false);
    }
  };

  const sharePlan = () => {
    if (!shareEmail || !currentPlan) return;

    const newShare: SharedContact = {
      id: 'share_' + Date.now(),
      name: shareEmail.split('@')[0],
      email: shareEmail,
      relationship: shareRelationship,
      permissions: sharePermissions,
      sharedAt: new Date()
    };

    currentPlan.sharedWith.push(newShare);
    savePlanToStorage(currentPlan);
    
    // In production, this would send an email
    console.log('Sharing plan with:', newShare);
    
    setShowShareModal(false);
    setShareEmail('');
    setSharePermissions(['view']);
  };

  const exportPlan = (format: 'pdf' | 'text' | 'json') => {
    if (!currentPlan) return;

    let content = '';
    const filename = `safety-plan-${Date.now()}`;

    switch (format) {
      case 'text':
        content = generateTextExport(currentPlan);
        downloadFile(content, `${filename}.txt`, 'text/plain');
        break;
      case 'json':
        content = JSON.stringify(currentPlan, null, 2);
        downloadFile(content, `${filename}.json`, 'application/json');
        break;
      case 'pdf':
        // In production, use a PDF library
        alert('PDF export would be implemented with a PDF library');
        break;
    }
  };

  const generateTextExport = (plan: AdvancedSafetyPlan): string => {
    const template = selectedTemplate || clinicalTemplates[0];
    return `
ADVANCED SAFETY PLAN
====================
Created: ${plan.createdAt.toLocaleDateString()}
Last Updated: ${plan.lastUpdated.toLocaleDateString()}
Template: ${template.name}
Version: ${plan.version}

EVIDENCE BASE:
${template.evidenceBase.join('\n')}

1. PERSONAL WARNING SIGNS
--------------------------
${plan.sections.warningSignsPersonal.map(sign => `• ${sign}`).join('\n')}

2. CRISIS WARNING SIGNS
-----------------------
${plan.sections.warningSignsCrisis.map(sign => `• ${sign}`).join('\n')}

3. COPING STRATEGIES
--------------------
${plan.sections.copingStrategies.map(strategy => 
  `• ${strategy.name} (${strategy.category})\n  ${strategy.description}`
).join('\n')}

4. GROUNDING EXERCISES
----------------------
${plan.sections.groundingExercises.map(exercise =>
  `• ${exercise.name} (${exercise.duration} min)\n  ${exercise.instructions.join('\n  ')}`
).join('\n\n')}

5. DISTRACTION TECHNIQUES
--------------------------
${plan.sections.distractionTechniques.map(tech => `• ${tech}`).join('\n')}

6. SOCIAL SUPPORT CONTACTS
---------------------------
${plan.sections.socialContacts.map(contact =>
  `• ${contact.name} (${contact.relationship})\n  Phone: ${contact.phone}${contact.availability ? `\n  Available: ${contact.availability}` : ''}`
).join('\n\n')}

7. PROFESSIONAL CONTACTS
------------------------
${plan.sections.professionalContacts.map(contact =>
  `• ${contact.name} (${contact.relationship})\n  Phone: ${contact.phone}`
).join('\n\n')}

8. ENVIRONMENT SAFETY
---------------------
${plan.sections.environmentSafety.map(measure =>
  `• ${measure.action} (Priority: ${measure.priority})`
).join('\n')}

9. REASONS FOR LIVING
---------------------
${plan.sections.reasonsToLive.map(reason => `• ${reason}`).join('\n')}

10. SELF-CARE ACTIVITIES
------------------------
${plan.sections.selfCareActivities.map(activity =>
  `• ${activity.name} (${activity.category}) - ${activity.frequency}`
).join('\n')}

EMERGENCY CONTACTS
------------------
${plan.sections.emergencyContacts.map(contact =>
  `• ${contact.name}: ${contact.phone}${contact.notes ? ` (${contact.notes})` : ''}`
).join('\n')}

SHARED WITH:
------------
${plan.sharedWith.map(share =>
  `• ${share.name} (${share.relationship}) - Permissions: ${share.permissions.join(', ')}`
).join('\n')}

${plan.professionalEndorsement ? `
PROFESSIONAL ENDORSEMENT
------------------------
${plan.professionalEndorsement.professionalName}, ${plan.professionalEndorsement.credentials}
Endorsed: ${plan.professionalEndorsement.endorsedAt.toLocaleDateString()}
${plan.professionalEndorsement.notes || ''}
` : ''}

REMEMBER: This is a living document. Review and update regularly.
If you are in immediate danger, call 911 or go to your nearest emergency room.
`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTemplateSelector = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Select a Clinical Template</h2>
      <div className="grid gap-4">
        {clinicalTemplates.map(template => (
          <div
            key={template.id}
            className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 cursor-pointer transition-all"
            onClick={() => createPlanFromTemplate(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-3">{template.description}</p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-700">Evidence Base:</p>
                      <ul className="text-gray-600">
                        {template.evidenceBase.map((evidence, idx) => (
                          <li key={idx}>• {evidence}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-700">Recommendations:</p>
                      <ul className="text-gray-600">
                        {template.recommendations.map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-700 ml-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (!currentPlan) return null;

    switch (currentStep) {
      case 0:
        return renderTemplateSelector();
      case 1:
        return renderWarningSignsPersonal();
      case 2:
        return renderWarningSignsCrisis();
      case 3:
        return renderCopingStrategies();
      case 4:
        return renderGroundingDistraction();
      case 5:
        return renderSocialSupport();
      case 6:
        return renderProfessionalHelp();
      case 7:
        return renderEnvironmentSafety();
      case 8:
        return renderReasonsToLive();
      case 9:
        return renderSelfCarePlan();
      case 10:
        return renderReviewShare();
      default:
        return null;
    }
  };

  // Component rendering functions for each step
  const renderWarningSignsPersonal = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Personal warning signs are early indicators that you might be heading toward distress. 
            Recognizing these helps you intervene early with coping strategies.
          </p>
        </div>
      </div>
      
      {/* Implementation continues with detailed UI for each section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Your Personal Warning Signs</h3>
        {currentPlan?.sections.warningSignsPersonal.map((sign, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
            <span>{sign}</span>
            {isEditing && (
              <button
                onClick={() => {
                  currentPlan?.sections.warningSignsPersonal.splice(index, 1);
                  setCurrentPlan({...currentPlan});
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWarningSignsCrisis = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
          <p className="text-sm text-red-800">
            Crisis warning signs indicate immediate risk and need for urgent support. 
            If experiencing these, use your emergency contacts immediately.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Crisis Warning Signs</h3>
        {currentPlan?.sections.warningSignsCrisis.map((sign, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
            <span className="text-red-900">{sign}</span>
            {isEditing && (
              <button
                onClick={() => {
                  currentPlan?.sections.warningSignsCrisis.splice(index, 1);
                  setCurrentPlan({...currentPlan});
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCopingStrategies = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Brain className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <p className="text-sm text-blue-800">
            Evidence-based coping strategies help manage difficult emotions and thoughts. 
            Rate their effectiveness to track what works best for you.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Your Coping Strategies</h3>
        {currentPlan?.sections.copingStrategies.map((strategy, index) => (
          <div key={index} className="p-4 bg-white border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{strategy.name}</h4>
                <p className="text-sm text-gray-600">{strategy.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {strategy.category}
                </span>
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    currentPlan?.sections.copingStrategies.splice(index, 1);
                    setCurrentPlan({...currentPlan});
                  }}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGroundingDistraction = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <Activity className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
          <p className="text-sm text-green-800">
            Grounding exercises bring you back to the present moment. 
            Distraction techniques provide temporary relief from overwhelming emotions.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Grounding Exercises</h3>
          {currentPlan?.sections.groundingExercises.map((exercise, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg">
              <h4 className="font-semibold">{exercise.name}</h4>
              <p className="text-sm text-gray-700 mb-2">{exercise.duration} minutes</p>
              <ol className="text-sm text-gray-600 space-y-1">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx}>{idx + 1}. {instruction}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Distraction Techniques</h3>
          {currentPlan?.sections.distractionTechniques.map((technique, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <span>{technique}</span>
              {isEditing && (
                <button
                  onClick={() => {
                    currentPlan?.sections.distractionTechniques.splice(index, 1);
                    setCurrentPlan({...currentPlan});
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSocialSupport = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start">
          <Users className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
          <p className="text-sm text-indigo-800">
            Social connections are protective factors. Include people who can provide 
            different types of support - from casual distraction to crisis intervention.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Social Support Contacts</h3>
        {currentPlan?.sections.socialContacts.map((contact, index) => (
          <div key={index} className="p-4 bg-white border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{contact.name}</h4>
                <p className="text-sm text-gray-600">{contact.relationship}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <a href={`tel:${contact.phone}`} className="text-blue-600 text-sm flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-blue-600 text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </a>
                  )}
                </div>
                {contact.availability && (
                  <p className="text-sm text-gray-700 mt-1">Available: {contact.availability}</p>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    currentPlan?.sections.socialContacts.splice(index, 1);
                    setCurrentPlan({...currentPlan});
                  }}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfessionalHelp = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <UserCheck className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
          <p className="text-sm text-purple-800">
            Professional support provides expert guidance and clinical intervention. 
            Keep this information readily accessible for both routine and crisis situations.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Professional Contacts</h3>
        {currentPlan?.sections.professionalContacts.map((contact, index) => (
          <div key={index} className="p-4 bg-white border border-purple-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{contact.name}</h4>
                <p className="text-sm text-gray-600">{contact.relationship}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <a href={`tel:${contact.phone}`} className="text-purple-600 text-sm flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-purple-600 text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </a>
                  )}
                </div>
                {contact.availability && (
                  <p className="text-sm text-gray-700 mt-1">Available: {contact.availability}</p>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    currentPlan?.sections.professionalContacts.splice(index, 1);
                    setCurrentPlan({...currentPlan});
                  }}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnvironmentSafety = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
          <p className="text-sm text-orange-800">
            Making your environment safer reduces access to means of harm. 
            These are practical steps you can take immediately and ongoing.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Environment Safety Measures</h3>
        {currentPlan?.sections.environmentSafety.map((measure, index) => (
          <div key={index} className="p-4 bg-white border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{measure.action}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    measure.priority === 'immediate' ? 'bg-red-100 text-red-700' :
                    measure.priority === 'within-24h' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {measure.priority}
                  </span>
                  {measure.responsible && (
                    <span className="text-sm text-gray-600">
                      Responsible: {measure.responsible}
                    </span>
                  )}
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    currentPlan?.sections.environmentSafety.splice(index, 1);
                    setCurrentPlan({...currentPlan});
                  }}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReasonsToLive = () => (
    <div className="space-y-4">
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <div className="flex items-start">
          <Star className="w-5 h-5 text-pink-600 mr-2 mt-0.5" />
          <p className="text-sm text-pink-800">
            Reasons for living are protective factors that give your life meaning. 
            These remind you of what matters most during difficult times.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Your Reasons for Living</h3>
        {currentPlan?.sections.reasonsToLive.map((reason, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-white border border-pink-200 rounded-lg">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-pink-500 mr-3" />
              <span className="font-medium">{reason}</span>
            </div>
            {isEditing && (
              <button
                onClick={() => {
                  currentPlan?.sections.reasonsToLive.splice(index, 1);
                  setCurrentPlan({...currentPlan});
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelfCarePlan = () => (
    <div className="space-y-4">
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
        <div className="flex items-start">
          <Heart className="w-5 h-5 text-rose-600 mr-2 mt-0.5" />
          <p className="text-sm text-rose-800">
            Regular self-care prevents crisis by maintaining your mental wellness. 
            Choose activities across different dimensions of health.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Self-Care Activities</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {currentPlan?.sections.selfCareActivities.map((activity, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{activity.name}</h4>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.category === 'physical' ? 'bg-green-100 text-green-700' :
                      activity.category === 'emotional' ? 'bg-blue-100 text-blue-700' :
                      activity.category === 'social' ? 'bg-purple-100 text-purple-700' :
                      activity.category === 'intellectual' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {activity.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {activity.frequency}
                    </span>
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => {
                      currentPlan?.sections.selfCareActivities.splice(index, 1);
                      setCurrentPlan({...currentPlan});
                    }}
                    className="text-red-500 hover:text-red-700 ml-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewShare = () => (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-0.5" />
          <p className="text-sm text-teal-800">
            Review your complete safety plan and share it with trusted individuals 
            who can support you. Regular reviews keep your plan current and effective.
          </p>
        </div>
      </div>

      {/* Validation Status */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3">Plan Validation</h3>
        {validationErrors.length > 0 ? (
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Your safety plan is complete and ready to use!</span>
          </div>
        )}
      </div>

      {/* Share Options */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3">Share Your Plan</h3>
        <div className="space-y-3">
          {currentPlan?.sharedWith.map(share => (
            <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{share.email}</p>
                <p className="text-sm text-gray-600">
                  {share.relationship} - {share.permissions.join(', ')}
                </p>
              </div>
              <span className="text-sm text-gray-700">
                Shared {new Date(share.sharedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share with Someone
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3">Export Your Plan</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => exportPlan('text')}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex flex-col items-center"
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-sm">Text File</span>
          </button>
          <button
            onClick={() => exportPlan('pdf')}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex flex-col items-center"
          >
            <Download className="w-6 h-6 mb-1" />
            <span className="text-sm">PDF</span>
          </button>
          <button
            onClick={() => exportPlan('json')}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex flex-col items-center"
          >
            <Copy className="w-6 h-6 mb-1" />
            <span className="text-sm">JSON</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={finalizePlan}
          disabled={validationErrors.length > 0}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finalize Plan
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Continue Editing
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3 px-4 text-center">
        <p className="font-semibold">
          If you're in crisis, get help immediately
        </p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="tel:988" className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold hover:bg-red-50">
            Call 988
          </a>
          <a href="sms:741741" className="bg-red-700 text-white px-4 py-1 rounded-full font-semibold hover:bg-red-800">
            Text 741741
          </a>
          <a href="tel:911" className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold hover:bg-red-50">
            Call 911
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                Advanced Safety Plan Generator
              </h1>
              <p className="text-gray-600">
                Evidence-based, clinically-informed safety planning with professional templates
              </p>
              {currentPlan && (
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-700">
                  <span>Version {currentPlan.version}</span>
                  <span>•</span>
                  <span>Last updated: {currentPlan.lastUpdated.toLocaleString()}</span>
                  {lastSaveTime.current && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Autosaved {lastSaveTime.current.toLocaleTimeString()}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {currentPlan && !showTemplateSelector && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        savePlanToStorage(currentPlan);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  )}
                  <button
                    onClick={() => exportPlan('text')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {!showTemplateSelector && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Safety Plan Progress</h2>
              <span className="text-sm text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            {/* Step Icons */}
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    index === currentStep ? 'scale-110' : ''
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`p-3 rounded-full ${
                    index === currentStep
                      ? `${step.bgColor} ${step.color} ring-2 ring-offset-2 ring-current`
                      : index < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-center max-w-[80px]">
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Current Step Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
              <p className="text-xs text-gray-700 mt-2 italic">
                <Info className="w-3 h-3 inline mr-1" />
                {steps[currentStep].clinicalNote}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 min-h-[400px]">
          {showTemplateSelector ? renderTemplateSelector() : renderCurrentStep()}
        </div>

        {/* Navigation */}
        {!showTemplateSelector && (
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 w-8'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  validatePlan();
                } else {
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {/* Emergency Contacts Always Visible */}
        {currentPlan && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Emergency Contacts - Always Available
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {currentPlan?.sections.emergencyContacts.map(contact => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.notes || contact.phone}</p>
                  </div>
                  <Phone className="w-5 h-5 text-red-600" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Share Safety Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="trusted@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={shareRelationship}
                  onChange={(e) => setShareRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="therapist">Therapist/Counselor</option>
                  <option value="family">Family Member</option>
                  <option value="friend">Friend</option>
                  <option value="caregiver">Caregiver</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sharePermissions.includes('view')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSharePermissions([...sharePermissions, 'view']);
                        } else {
                          setSharePermissions(sharePermissions.filter(p => p !== 'view'));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">View plan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sharePermissions.includes('edit')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSharePermissions([...sharePermissions, 'edit']);
                        } else {
                          setSharePermissions(sharePermissions.filter(p => p !== 'edit'));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Edit plan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sharePermissions.includes('notification')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSharePermissions([...sharePermissions, 'notification']);
                        } else {
                          setSharePermissions(sharePermissions.filter(p => p !== 'notification'));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Receive crisis notifications</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={sharePlan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareEmail('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}