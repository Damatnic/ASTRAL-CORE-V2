'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Progress, Input } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { useNotifications } from './notifications';
import { designTokens } from '../design-system';

// Client Interface Types
interface CrisisResource {
  id: string;
  title: string;
  description: string;
  category: 'immediate_help' | 'mental_health' | 'domestic_violence' | 'substance_abuse' | 'financial_aid' | 'legal_help' | 'housing' | 'other';
  type: 'hotline' | 'website' | 'location' | 'text_service' | 'chat_service';
  contact: {
    phone?: string;
    website?: string;
    address?: string;
    hours?: string;
    languages?: string[];
  };
  availability: '24/7' | 'business_hours' | 'limited' | 'appointment_only';
  isEmergency: boolean;
  rating: number;
  verified: boolean;
}

interface SelfHelpTool {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'grounding' | 'mindfulness' | 'safety_planning' | 'coping_strategies' | 'journaling';
  difficulty: 'easy' | 'moderate' | 'advanced';
  duration: number; // in minutes
  instructions: string[];
  audioGuide?: string;
  completed: boolean;
  timesUsed: number;
  effectiveness?: number; // 1-5 rating from user
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isAvailable24h: boolean;
  notes?: string;
}

interface SafetyPlanItem {
  id: string;
  category: 'warning_signs' | 'coping_strategies' | 'support_people' | 'safe_places' | 'professional_contacts' | 'environment_safety';
  content: string;
  isActive: boolean;
  priority: number;
}

// Crisis Resource Directory Component
interface CrisisResourceDirectoryProps {
  resources: CrisisResource[];
  onResourceContact: (resource: CrisisResource, method: string) => void;
  onResourceRate: (resourceId: string, rating: number) => void;
  className?: string;
}

export const CrisisResourceDirectory: React.FC<CrisisResourceDirectoryProps> = ({
  resources,
  onResourceContact,
  onResourceRate,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  const categories = [
    { key: 'all', label: 'All Resources', icon: '🔍' },
    { key: 'immediate_help', label: 'Immediate Help', icon: '🚨' },
    { key: 'mental_health', label: 'Mental Health', icon: '🧠' },
    { key: 'domestic_violence', label: 'Domestic Violence', icon: '🛡️' },
    { key: 'substance_abuse', label: 'Substance Abuse', icon: '💊' },
    { key: 'financial_aid', label: 'Financial Aid', icon: '💰' },
    { key: 'legal_help', label: 'Legal Help', icon: '⚖️' },
    { key: 'housing', label: 'Housing', icon: '🏠' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmergency = !showEmergencyOnly || resource.isEmergency;
    
    return matchesCategory && matchesSearch && matchesEmergency;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case '24/7': return 'bg-green-100 text-green-800';
      case 'business_hours': return 'bg-blue-100 text-blue-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactButton = (resource: CrisisResource) => {
    const buttons = [];
    
    if (resource.contact.phone) {
      buttons.push(
        <Button
          key="phone"
          size="sm"
          onClick={() => onResourceContact(resource, 'phone')}
          className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Call</span>
        </Button>
      );
    }
    
    if (resource.contact.website) {
      buttons.push(
        <Button
          key="website"
          variant="outline"
          size="sm"
          onClick={() => onResourceContact(resource, 'website')}
          className="flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Visit</span>
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Crisis Resources</h2>
        <p className="text-sm text-gray-600 mt-1">
          Find immediate help and support resources in your area
        </p>
      </div>

      {/* Emergency Alert */}
      <Alert variant="destructive" className="m-6 mb-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Emergency Situation?</h3>
          <p className="text-sm mt-1">
            If you're in immediate danger, call 911 (US) or your local emergency number.
          </p>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={() => window.open('tel:911')}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Call 911
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('tel:988')}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Crisis Lifeline (988)
            </Button>
          </div>
        </div>
      </Alert>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showEmergencyOnly}
                onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span>Emergency only</span>
            </label>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center space-x-1"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className="p-6">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className={`border rounded-lg p-4 ${
                  resource.isEmergency ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      {resource.isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          Emergency
                        </Badge>
                      )}
                      {resource.verified && (
                        <Badge variant="success" className="text-xs bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <Badge variant="secondary" className={getAvailabilityColor(resource.availability)}>
                        {resource.availability.replace('_', ' ')}
                      </Badge>
                      {resource.contact.languages && (
                        <span>Languages: {resource.contact.languages.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < resource.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {resource.contact.hours && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Hours:</strong> {resource.contact.hours}
                  </p>
                )}
                {resource.contact.address && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Address:</strong> {resource.contact.address}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {getContactButton(resource)}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResourceRate(resource.id, 5)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Rate this resource
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// Self-Help Tools Component
interface SelfHelpToolsProps {
  tools: SelfHelpTool[];
  onToolStart: (toolId: string) => void;
  onToolComplete: (toolId: string, effectiveness: number) => void;
  className?: string;
}

export const SelfHelpTools: React.FC<SelfHelpToolsProps> = ({
  tools,
  onToolStart,
  onToolComplete,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTool, setActiveTool] = useState<SelfHelpTool | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const categories = [
    { key: 'all', label: 'All Tools', icon: '🛠️' },
    { key: 'breathing', label: 'Breathing', icon: '🫁' },
    { key: 'grounding', label: 'Grounding', icon: '🌱' },
    { key: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { key: 'safety_planning', label: 'Safety Planning', icon: '🛡️' },
    { key: 'coping_strategies', label: 'Coping', icon: '💪' },
    { key: 'journaling', label: 'Journaling', icon: '📝' }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const getDifficultyColor = (difficulty: SelfHelpTool['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToolStart = (tool: SelfHelpTool) => {
    setActiveTool(tool);
    setCurrentStep(0);
    onToolStart(tool.id);
  };

  const handleToolComplete = (effectiveness: number) => {
    if (activeTool) {
      onToolComplete(activeTool.id, effectiveness);
      setActiveTool(null);
      setCurrentStep(0);
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Self-Help Tools</h2>
        <p className="text-sm text-gray-600 mt-1">
          Guided exercises and techniques to help manage crisis situations
        </p>
      </div>

      {/* Category Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center space-x-1"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="p-6">
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-gray-500">No tools available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{tool.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" className={getDifficultyColor(tool.difficulty)}>
                        {tool.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{tool.duration} min</span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>Used {tool.timesUsed} times</span>
                  {tool.effectiveness && (
                    <div className="flex items-center space-x-1">
                      <span>Effectiveness:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < tool.effectiveness! ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleToolStart(tool)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  size="sm"
                >
                  {tool.completed ? 'Use Again' : 'Start Tool'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{activeTool.title}</h3>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTool(null)}
                  className="p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {activeTool.instructions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(((currentStep + 1) / activeTool.instructions.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((currentStep + 1) / activeTool.instructions.length) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            <div className="p-6">
              {/* Current Step */}
              <div className="mb-6">
                <p className="text-gray-900 leading-relaxed">
                  {activeTool.instructions[currentStep]}
                </p>
              </div>

              {/* Audio Guide */}
              {activeTool.audioGuide && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 002-2V9a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L10.293 4.293A1 1 0 009.586 4H8a2 2 0 00-2 2v5a2 2 0 002 2z" />
                      </svg>
                      <span>Play Audio Guide</span>
                    </Button>
                    <span className="text-sm text-gray-600">
                      Listen to guided instructions
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                {currentStep < activeTool.instructions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToolComplete(3)}
                    >
                      Not Helpful
                    </Button>
                    <Button
                      onClick={() => handleToolComplete(5)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Very Helpful
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Emergency Contacts Manager Component
interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  onContactAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onContactEdit: (contactId: string, updates: Partial<EmergencyContact>) => void;
  onContactDelete: (contactId: string) => void;
  onContactCall: (contact: EmergencyContact) => void;
  className?: string;
}

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  contacts,
  onContactAdd,
  onContactEdit,
  onContactDelete,
  onContactCall,
  className = ''
}) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
    isAvailable24h: false,
    notes: ''
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      onContactAdd(newContact);
      setNewContact({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        isPrimary: false,
        isAvailable24h: false,
        notes: ''
      });
      setIsAddingContact(false);
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setNewContact(contact);
    setIsAddingContact(true);
  };

  const handleSaveEdit = () => {
    if (editingContact && newContact.name && newContact.phone) {
      onContactEdit(editingContact.id, newContact);
      setEditingContact(null);
      setNewContact({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        isPrimary: false,
        isAvailable24h: false,
        notes: ''
      });
      setIsAddingContact(false);
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your trusted contacts for crisis situations
            </p>
          </div>
          <Button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="p-6">
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No emergency contacts added yet</p>
            <Button
              onClick={() => setIsAddingContact(true)}
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`border rounded-lg p-4 ${
                  contact.isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      {contact.isPrimary && (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      )}
                      {contact.isAvailable24h && (
                        <Badge variant="success" className="text-xs bg-green-100 text-green-800">
                          24/7
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {contact.relationship}
                    </p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{contact.notes}"
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => onContactCall(contact)}
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Call</span>
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContact(contact)}
                        className="p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onContactDelete(contact.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <Input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g., Friend, Family, Therapist"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Additional notes about this contact"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newContact.isPrimary}
                    onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Primary emergency contact</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newContact.isAvailable24h}
                    onChange={(e) => setNewContact({ ...newContact, isAvailable24h: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Available 24/7</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingContact(false);
                  setEditingContact(null);
                  setNewContact({
                    name: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    isPrimary: false,
                    isAvailable24h: false,
                    notes: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingContact ? handleSaveEdit : handleAddContact}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!newContact.name || !newContact.phone}
              >
                {editingContact ? 'Save Changes' : 'Add Contact'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Main Client Interface Component
interface ClientInterfaceProps {
  className?: string;
}

export const ClientInterface: React.FC<ClientInterfaceProps> = ({
  className = ''
}) => {
  const { addNotification } = useNotifications();

  // Mock data - would come from API
  const [resources] = useState<CrisisResource[]>([
    {
      id: 'resource-1',
      title: 'National Crisis Lifeline',
      description: 'Free, confidential crisis support 24/7 for people in distress and their families and friends.',
      category: 'immediate_help',
      type: 'hotline',
      contact: {
        phone: '988',
        website: 'https://988lifeline.org',
        hours: '24/7',
        languages: ['English', 'Spanish']
      },
      availability: '24/7',
      isEmergency: true,
      rating: 5,
      verified: true
    }
  ]);

  const [tools] = useState<SelfHelpTool[]>([
    {
      id: 'tool-1',
      title: '4-7-8 Breathing Exercise',
      description: 'A simple breathing technique to help reduce anxiety and promote calm.',
      category: 'breathing',
      difficulty: 'easy',
      duration: 5,
      instructions: [
        'Find a comfortable seated position and close your eyes.',
        'Inhale through your nose for 4 counts.',
        'Hold your breath for 7 counts.',
        'Exhale through your mouth for 8 counts.',
        'Repeat this cycle 3-4 times.',
        'Notice how your body feels more relaxed.'
      ],
      completed: false,
      timesUsed: 0
    }
  ]);

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const handleResourceContact = (resource: CrisisResource, method: string) => {
    if (method === 'phone' && resource.contact.phone) {
      window.open(`tel:${resource.contact.phone}`);
    } else if (method === 'website' && resource.contact.website) {
      window.open(resource.contact.website, '_blank');
    }
    
    addNotification({
      type: 'system_update',
      title: 'Resource Accessed',
      message: `Connected to ${resource.title}`,
      priority: 'low',
      actionable: false
    });
  };

  const handleToolStart = (toolId: string) => {
    console.log('Starting tool:', toolId);
  };

  const handleToolComplete = (toolId: string, effectiveness: number) => {
    console.log('Tool completed:', { toolId, effectiveness });
    addNotification({
      type: 'system_update',
      title: 'Self-Help Tool Completed',
      message: 'Great job taking care of yourself!',
      priority: 'low',
      actionable: false
    });
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Client Crisis Support Interface">
      <ScreenReaderOnly>
        <h1>Crisis Support Resources and Tools</h1>
      </ScreenReaderOnly>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Not Alone</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access immediate support, helpful resources, and self-care tools whenever you need them.
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help Right Now?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => window.open('tel:911')}
              className="bg-red-600 text-white hover:bg-red-700 h-16 text-lg font-medium"
            >
              🚨 Emergency (911)
            </Button>
            <Button
              onClick={() => window.open('tel:988')}
              className="bg-blue-600 text-white hover:bg-blue-700 h-16 text-lg font-medium"
            >
              📞 Crisis Lifeline (988)
            </Button>
            <Button
              onClick={() => window.open('sms:741741')}
              className="bg-green-600 text-white hover:bg-green-700 h-16 text-lg font-medium"
            >
              💬 Crisis Text (741741)
            </Button>
            <Button
              variant="outline"
              className="h-16 text-lg font-medium border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              🧘 Start Self-Care
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crisis Resources */}
        <CrisisResourceDirectory
          resources={resources}
          onResourceContact={handleResourceContact}
          onResourceRate={(id, rating) => console.log('Rating:', { id, rating })}
        />

        {/* Self-Help Tools */}
        <SelfHelpTools
          tools={tools}
          onToolStart={handleToolStart}
          onToolComplete={handleToolComplete}
        />
      </div>

      {/* Emergency Contacts */}
      <EmergencyContactsManager
        contacts={contacts}
        onContactAdd={(contact) => {
          const newContact = { ...contact, id: `contact-${Date.now()}` };
          setContacts([...contacts, newContact]);
        }}
        onContactEdit={(id, updates) => {
          setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
        }}
        onContactDelete={(id) => {
          setContacts(contacts.filter(c => c.id !== id));
        }}
        onContactCall={(contact) => {
          window.open(`tel:${contact.phone}`);
          addNotification({
            type: 'system_update',
            title: 'Emergency Contact Called',
            message: `Called ${contact.name}`,
            priority: 'medium',
            actionable: false
          });
        }}
      />
    </div>
  );
};

export default ClientInterface;