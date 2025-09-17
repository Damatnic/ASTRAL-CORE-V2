'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  MessageCircle, Users, Phone, Shield, Heart, 
  AlertCircle, Activity, Brain, Sparkles
} from 'lucide-react';

// Dynamic imports for better code splitting
const CrisisChat = dynamic(() => import('@/components/CrisisChat'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>
});

const CrisisAssessment = dynamic(() => import('@/components/CrisisAssessment'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>
});

const PeerSupport = dynamic(() => import('@/components/PeerSupport'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>
});

type ViewType = 'home' | 'chat' | 'assessment' | 'peer' | 'resources';

export default function CrisisPage() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [urgencyLevel, setUrgencyLevel] = useState<number>(0);

  const handleAssessmentComplete = (data: any) => {
    setUrgencyLevel(data.urgency);
    if (data.urgency >= 8) {
      setCurrentView('chat');
    } else if (data.urgency >= 5) {
      setCurrentView('peer');
    } else {
      setCurrentView('resources');
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case 'chat':
        return <CrisisChat />;
      
      case 'assessment':
        return <CrisisAssessment onComplete={handleAssessmentComplete} />;
      
      case 'peer':
        return <PeerSupport />;
      
      case 'resources':
        return <ResourcesSection />;
      
      default:
        return <HomeView onSelectView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">24/7 Crisis Support Available</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = 'tel:988'}
              className="bg-white text-red-600 px-4 py-2 rounded-full font-semibold hover:bg-red-50 transition-colors flex items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 988
            </button>
            
            <button
              onClick={() => window.location.href = 'sms:741741'}
              className="bg-red-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-800 transition-colors"
            >
              Text 741741
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {currentView !== 'home' && (
        <div className="bg-white shadow-sm border-b sticky top-12 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to Crisis Hub
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentView === 'chat' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Crisis Chat
                </button>
                <button
                  onClick={() => setCurrentView('peer')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentView === 'peer' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Peer Support
                </button>
                <button
                  onClick={() => setCurrentView('resources')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentView === 'resources' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}

function HomeView({ onSelectView }: { onSelectView: (view: ViewType) => void }) {
  return (
    <div className="space-y-8">
      {/* Calm, Reassuring Hero Section */}
      <div className="text-center py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          You're Safe Here
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          You've taken an important step by reaching out. We're here to support you, 
          and you can choose what feels right for you right now.
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Confidential support available 24/7</span>
        </div>
      </div>

      {/* Immediate vs. Non-Immediate Crisis - Clear Guidance */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Emergency Support */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-3">Need Help Right Now?</h2>
            <p className="text-red-700 mb-6">If you're thinking about hurting yourself or someone else</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = 'tel:988'}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors text-lg"
              >
                Call 988 - Talk to Someone Now
              </button>
              <button
                onClick={() => window.location.href = 'sms:741741'}
                className="w-full bg-red-700 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition-colors"
              >
                Text HOME to 741741
              </button>
            </div>
          </div>
        </div>

        {/* Non-Emergency Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-3">Looking for Support?</h2>
            <p className="text-blue-700 mb-6">When you're struggling but not in immediate danger</p>
            <div className="space-y-3">
              <button
                onClick={() => onSelectView('assessment')}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Find the Right Support
              </button>
              <button
                onClick={() => onSelectView('chat')}
                className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
              >
                Chat with Someone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Support Options - Less Prominent */}
      <details className="bg-gray-50 rounded-2xl p-6">
        <summary className="cursor-pointer text-lg font-semibold text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
          More support options
          <span className="text-sm font-normal text-gray-500 ml-2">(when you're ready)</span>
        </summary>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Peer Support */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Peer Support</h3>
                <p className="text-sm text-gray-600">Connect with others who understand</p>
              </div>
              <button
                onClick={() => onSelectView('peer')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                Join
              </button>
            </div>
          </div>

          {/* Self-Help Resources */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Self-Help Tools</h3>
                <p className="text-sm text-gray-600">Coping techniques and resources</p>
              </div>
              <button
                onClick={() => onSelectView('resources')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Explore
              </button>
            </div>
          </div>

          {/* Safety Planning */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Safety Planning</h3>
                <p className="text-sm text-gray-600">Create your personalized safety plan</p>
              </div>
              <button 
                onClick={() => window.location.href = '/safety'}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>

          {/* Mood Tracker */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Check Your Mood</h3>
                <p className="text-sm text-gray-600">Track how you're feeling</p>
              </div>
              <button 
                onClick={() => window.location.href = '/mood-gamified'}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      </details>

      {/* Simple Trust Indicators - Less Overwhelming */}
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">Trusted by thousands, available whenever you need us</p>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>24/7 Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Confidential</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Professional Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourcesSection() {
  const resources = [
    {
      category: 'Coping Strategies',
      items: [
        'Breathing Exercises',
        'Grounding Techniques',
        'Mindfulness Meditation',
        'Progressive Muscle Relaxation'
      ]
    },
    {
      category: 'Crisis Management',
      items: [
        'Safety Planning Guide',
        'Warning Signs Checklist',
        'Emergency Contacts',
        'De-escalation Techniques'
      ]
    },
    {
      category: 'Mental Health Info',
      items: [
        'Understanding Depression',
        'Managing Anxiety',
        'PTSD Resources',
        'Substance Abuse Help'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Self-Help Resources</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {resources.map((section) => (
          <div key={section.category} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{section.category}</h3>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item}>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <span className="text-gray-700">{item}</span>
                    <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Download Our Crisis Survival Kit</h3>
        <p className="text-blue-100 mb-6">
          A comprehensive guide with tools and techniques to help you through difficult moments
        </p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          Download PDF Guide
        </button>
      </div>
    </div>
  );
}