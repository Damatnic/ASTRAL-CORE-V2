'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronRight, Heart, Shield, Phone } from 'lucide-react';

interface AssessmentData {
  urgency: number;
  feelings: string[];
  supportSystem: boolean;
  immediateRisk: boolean;
  contactInfo?: {
    name: string;
    phone: string;
    preferredContact: 'call' | 'text';
  };
}

export default function CrisisAssessment({ onComplete }: { onComplete: (data: AssessmentData) => void }) {
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState<AssessmentData>({
    urgency: 0,
    feelings: [],
    supportSystem: false,
    immediateRisk: false,
  });

  const feelings = [
    'Overwhelmed', 'Anxious', 'Depressed', 'Hopeless', 
    'Angry', 'Confused', 'Lonely', 'Scared', 'Numb', 'Suicidal'
  ];

  const handleUrgencyChange = (value: number) => {
    setAssessment(prev => ({ ...prev, urgency: value }));
    if (value >= 8) {
      setAssessment(prev => ({ ...prev, immediateRisk: true }));
    }
  };

  const toggleFeeling = (feeling: string) => {
    setAssessment(prev => ({
      ...prev,
      feelings: prev.feelings.includes(feeling)
        ? prev.feelings.filter(f => f !== feeling)
        : [...prev.feelings, feeling]
    }));
  };

  const handleSubmit = () => {
    onComplete(assessment);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">How urgent is your situation right now?</h3>
              <p className="text-sm text-gray-600 mb-4">1 = I need support but I'm safe, 10 = I'm in immediate danger</p>
              
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={assessment.urgency}
                  onChange={(e) => handleUrgencyChange(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm">
                  <span>1</span>
                  <span className="text-2xl font-bold">{assessment.urgency || 5}</span>
                  <span>10</span>
                </div>
              </div>

              {assessment.urgency >= 8 && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-semibold">Immediate Support Available</p>
                      <p className="text-red-700 text-sm mt-1">
                        You don't have to go through this alone. Let's connect you with immediate help.
                      </p>
                      <button
                        onClick={() => window.location.href = 'tel:988'}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Call 988 Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">What are you feeling right now?</h3>
              <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
              
              <div className="grid grid-cols-2 gap-3">
                {feelings.map(feeling => (
                  <button
                    key={feeling}
                    onClick={() => toggleFeeling(feeling)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      assessment.feelings.includes(feeling)
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${feeling === 'Suicidal' ? 'border-red-300' : ''}`}
                  >
                    {feeling}
                  </button>
                ))}
              </div>

              {assessment.feelings.includes('Suicidal') && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Your life matters. Help is available right now.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Support System</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 mb-3">Do you have someone you trust that you can talk to?</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setAssessment(prev => ({ ...prev, supportSystem: true }))}
                      className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                        assessment.supportSystem
                          ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setAssessment(prev => ({ ...prev, supportSystem: false }))}
                      className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                        !assessment.supportSystem
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-700 mb-3">Are you in a safe place right now?</p>
                  <div className="flex space-x-3">
                    <button className="flex-1 py-3 rounded-lg border-2 border-gray-300 hover:border-green-400 transition-all">
                      Yes
                    </button>
                    <button className="flex-1 py-3 rounded-lg border-2 border-gray-300 hover:border-red-400 transition-all">
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                Get Support
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Quick Assessment</h2>
        <p className="text-blue-100">
          This helps us understand how to best support you
        </p>
        <div className="flex justify-between mt-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 flex-1 mx-1 rounded-full ${
                step >= i ? 'bg-white' : 'bg-blue-400 opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        {renderStep()}
      </div>
    </div>
  );
}