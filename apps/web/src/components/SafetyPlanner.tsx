'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Heart, Users, Phone, Brain, ChevronRight,
  Plus, Trash2, Edit3, Download, Share2, Lock,
  AlertCircle, CheckCircle, Star, Clock, MapPin
} from 'lucide-react';

interface SafetyPlan {
  id: string;
  title: string;
  lastUpdated: Date;
  sections: {
    warningSignsPersonal: string[];
    warningSignsCrisis: string[];
    copingStrategies: string[];
    socialContacts: Contact[];
    professionalContacts: Contact[];
    environmentSafety: string[];
    reasonsToLive: string[];
    emergencyContacts: Contact[];
  };
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
  isEmergency?: boolean;
}

export default function SafetyPlanner() {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const steps = [
    {
      title: 'Personal Warning Signs',
      description: 'Recognize when you might be heading toward a crisis',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Crisis Warning Signs',
      description: 'Signs that indicate immediate risk',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Coping Strategies',
      description: 'Things you can do to feel better',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Social Support',
      description: 'People who can help and distract you',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Professional Help',
      description: 'Mental health professionals to contact',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Environment Safety',
      description: 'Make your space safer during crisis',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Reasons to Live',
      description: 'What makes life worth living',
      icon: Star,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  useEffect(() => {
    loadSafetyPlan();
  }, []);

  const loadSafetyPlan = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem('safetyPlan');
    if (saved) {
      const plan = JSON.parse(saved);
      plan.lastUpdated = new Date(plan.lastUpdated);
      setSafetyPlan(plan);
    } else {
      // Create new plan
      const newPlan: SafetyPlan = {
        id: 'plan_' + Date.now(),
        title: 'My Safety Plan',
        lastUpdated: new Date(),
        sections: {
          warningSignsPersonal: [],
          warningSignsCrisis: [],
          copingStrategies: [],
          socialContacts: [],
          professionalContacts: [],
          environmentSafety: [],
          reasonsToLive: [],
          emergencyContacts: [
            {
              id: 'emergency_988',
              name: '988 Crisis Lifeline',
              relationship: 'Crisis Support',
              phone: '988',
              isEmergency: true,
            },
            {
              id: 'emergency_911',
              name: '911 Emergency Services',
              relationship: 'Emergency',
              phone: '911',
              isEmergency: true,
            },
            {
              id: 'emergency_text',
              name: 'Crisis Text Line',
              relationship: 'Text Support',
              phone: '741741',
              notes: 'Text HOME to 741741',
              isEmergency: true,
            },
          ],
        },
      };
      setSafetyPlan(newPlan);
      setIsEditing(true);
    }
  };

  const saveSafetyPlan = () => {
    if (safetyPlan) {
      safetyPlan.lastUpdated = new Date();
      localStorage.setItem('safetyPlan', JSON.stringify(safetyPlan));
      setIsEditing(false);
    }
  };

  const addItem = (section: string, item: string) => {
    if (!safetyPlan || !item.trim()) return;
    
    setSafetyPlan({
      ...safetyPlan,
      sections: {
        ...safetyPlan.sections,
        [section]: [...safetyPlan.sections[section as keyof typeof safetyPlan.sections], item.trim()],
      },
    });
  };

  const removeItem = (section: string, index: number) => {
    if (!safetyPlan) return;
    
    const sectionArray = safetyPlan.sections[section as keyof typeof safetyPlan.sections] as string[];
    setSafetyPlan({
      ...safetyPlan,
      sections: {
        ...safetyPlan.sections,
        [section]: sectionArray.filter((_, i) => i !== index),
      },
    });
  };

  const addContact = (section: string, contact: Omit<Contact, 'id'>) => {
    if (!safetyPlan) return;
    
    const newContact: Contact = {
      ...contact,
      id: 'contact_' + Date.now(),
    };
    
    setSafetyPlan({
      ...safetyPlan,
      sections: {
        ...safetyPlan.sections,
        [section]: [...safetyPlan.sections[section as keyof typeof safetyPlan.sections], newContact],
      },
    });
  };

  const exportPlan = () => {
    if (!safetyPlan) return;
    
    const planText = `
MY SAFETY PLAN

Last Updated: ${safetyPlan.lastUpdated.toLocaleDateString()}

1. PERSONAL WARNING SIGNS
${safetyPlan.sections.warningSignsPersonal.map(sign => `• ${sign}`).join('\n')}

2. CRISIS WARNING SIGNS
${safetyPlan.sections.warningSignsCrisis.map(sign => `• ${sign}`).join('\n')}

3. COPING STRATEGIES
${safetyPlan.sections.copingStrategies.map(strategy => `• ${strategy}`).join('\n')}

4. SOCIAL SUPPORT CONTACTS
${safetyPlan.sections.socialContacts.map(contact => `• ${contact.name} (${contact.relationship}) - ${contact.phone}`).join('\n')}

5. PROFESSIONAL CONTACTS
${safetyPlan.sections.professionalContacts.map(contact => `• ${contact.name} (${contact.relationship}) - ${contact.phone}`).join('\n')}

6. ENVIRONMENT SAFETY
${safetyPlan.sections.environmentSafety.map(item => `• ${item}`).join('\n')}

7. REASONS TO LIVE
${safetyPlan.sections.reasonsToLive.map(reason => `• ${reason}`).join('\n')}

EMERGENCY CONTACTS
${safetyPlan.sections.emergencyContacts.map(contact => `• ${contact.name}: ${contact.phone}${contact.notes ? ` (${contact.notes})` : ''}`).join('\n')}

This is a confidential safety plan. If you are in immediate danger, call 911.
    `;
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-safety-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // State for managing new items in editable lists
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const updateNewItem = (section: string, value: string) => {
    setNewItems(prev => ({ ...prev, [section]: value }));
  };

  const clearNewItem = (section: string) => {
    setNewItems(prev => {
      const updated = { ...prev };
      delete updated[section];
      return updated;
    });
  };

  const renderEditableList = (
    section: string,
    items: string[],
    placeholder: string,
    suggestions?: string[]
  ) => {
    const newItem = newItems[section] || '';

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-900">{item}</span>
            {isEditing && (
              <button
                onClick={() => removeItem(section, index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        
        {isEditing && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => updateNewItem(section, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItem(section, newItem);
                    clearNewItem(section);
                  }
                }}
              />
              <button
                onClick={() => {
                  addItem(section, newItem);
                  clearNewItem(section);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {suggestions && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addItem(section, suggestion);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    if (!safetyPlan) return null;
    
    const step = steps[currentStep];
    
    switch (currentStep) {
      case 0: // Personal Warning Signs
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Personal Warning Signs</h3>
            <p className="text-gray-600 mb-6">
              These are thoughts, feelings, or behaviors that happen before you feel like you might be in crisis.
            </p>
            {renderEditableList(
              'warningSignsPersonal',
              safetyPlan.sections.warningSignsPersonal,
              'Add a warning sign...',
              [
                'Feeling overwhelmed',
                'Trouble sleeping',
                'Isolating from others',
                'Increased anxiety',
                'Difficulty concentrating',
                'Loss of appetite',
                'Feeling hopeless',
              ]
            )}
          </div>
        );
        
      case 1: // Crisis Warning Signs
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Crisis Warning Signs</h3>
            <p className="text-gray-600 mb-6">
              These are more serious warning signs that indicate you might be in immediate danger.
            </p>
            {renderEditableList(
              'warningSignsCrisis',
              safetyPlan.sections.warningSignsCrisis,
              'Add a crisis warning sign...',
              [
                'Thoughts of suicide',
                'Thoughts of harming others',
                'Feeling out of control',
                'Severe panic attacks',
                'Hallucinations',
                'Complete loss of hope',
                'Making plans to end life',
              ]
            )}
          </div>
        );
        
      case 2: // Coping Strategies
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Coping Strategies</h3>
            <p className="text-gray-600 mb-6">
              Things you can do on your own to feel better and cope with difficult emotions.
            </p>
            {renderEditableList(
              'copingStrategies',
              safetyPlan.sections.copingStrategies,
              'Add a coping strategy...',
              [
                'Deep breathing exercises',
                'Listen to calming music',
                'Take a warm bath',
                'Go for a walk',
                'Write in a journal',
                'Practice meditation',
                'Call a friend',
                'Watch a funny movie',
                'Pet my dog/cat',
                'Do yoga',
              ]
            )}
          </div>
        );
        
      case 3: // Social Support
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Social Support Contacts</h3>
            <p className="text-gray-600 mb-6">
              People who can help distract you and provide emotional support.
            </p>
            <ContactList
              contacts={safetyPlan.sections.socialContacts}
              isEditing={isEditing}
              onAdd={(contact) => addContact('socialContacts', contact)}
            />
          </div>
        );
        
      case 4: // Professional Help
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Professional Contacts</h3>
            <p className="text-gray-600 mb-6">
              Mental health professionals and agencies you can contact for help.
            </p>
            <ContactList
              contacts={safetyPlan.sections.professionalContacts}
              isEditing={isEditing}
              onAdd={(contact) => addContact('professionalContacts', contact)}
            />
          </div>
        );
        
      case 5: // Environment Safety
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Making Your Environment Safer</h3>
            <p className="text-gray-600 mb-6">
              Steps to make your surroundings safer during a crisis.
            </p>
            {renderEditableList(
              'environmentSafety',
              safetyPlan.sections.environmentSafety,
              'Add a safety measure...',
              [
                'Remove or secure harmful objects',
                'Ask someone to stay with me',
                'Go to a safe location',
                'Remove alcohol/drugs',
                'Give medications to trusted person',
                'Stay in public places',
                'Avoid triggering places',
              ]
            )}
          </div>
        );
        
      case 6: // Reasons to Live
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Reasons to Live</h3>
            <p className="text-gray-600 mb-6">
              Things that are important to you and give your life meaning.
            </p>
            {renderEditableList(
              'reasonsToLive',
              safetyPlan.sections.reasonsToLive,
              'Add a reason to live...',
              [
                'My family',
                'My pets',
                'My dreams and goals',
                'Helping others',
                'Favorite activities',
                'Future experiences',
                'Making a difference',
                'People who depend on me',
              ]
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!safetyPlan) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Emergency Banner */}
      {(safetyPlan.sections.warningSignsCrisis.length > 0 || currentStep === 1) && (
        <div className="bg-red-600 text-white py-3 px-4 text-center">
          <p className="font-semibold">
            🚨 If you're experiencing crisis warning signs, get help immediately
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="tel:988" className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold">
              Call 988
            </a>
            <a href="tel:911" className="bg-red-700 text-white px-4 py-1 rounded-full font-semibold">
              Call 911
            </a>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Plan</h1>
              <p className="text-gray-600">
                A personalized plan to help you stay safe during difficult times
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {safetyPlan.lastUpdated.toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={exportPlan}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </>
              ) : (
                <button
                  onClick={saveSafetyPlan}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Safety Plan Steps</h2>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`p-3 rounded-lg text-center transition-all ${
                  index === currentStep
                    ? `${step.bgColor} ${step.color} border-2 border-current`
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <step.icon className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs font-medium">{step.title.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Emergency Contacts Always Visible */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Emergency Contacts - Always Available
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {safetyPlan.sections.emergencyContacts.map(contact => (
              <a
                key={contact.id}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors"
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
      </div>
    </div>
  );
}

// Contact List Component
function ContactList({ 
  contacts, 
  isEditing, 
  onAdd 
}: { 
  contacts: Contact[]; 
  isEditing: boolean; 
  onAdd: (contact: Omit<Contact, 'id'>) => void; 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleAdd = () => {
    if (newContact.name && newContact.phone) {
      onAdd(newContact);
      setNewContact({ name: '', relationship: '', phone: '', email: '', notes: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-3">
      {contacts.map(contact => (
        <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">{contact.name}</p>
            <p className="text-sm text-gray-600">{contact.relationship}</p>
            <p className="text-sm text-blue-600">{contact.phone}</p>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={`tel:${contact.phone}`}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              <Phone className="w-4 h-4" />
            </a>
            {isEditing && (
              <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {isEditing && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Contact
            </button>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}