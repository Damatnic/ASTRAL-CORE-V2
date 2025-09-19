'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  Shield, Lock, Eye, Heart, UserCheck, AlertTriangle,
  CheckCircle, ExternalLink, Scroll, FileText
} from 'lucide-react';

export default function TermsAcceptanceStep() {
  const { updatePreferences, preferences } = useOnboarding();
  const [acceptances, setAcceptances] = useState({
    privacyPolicy: false,
    termsOfService: false,
    mentalHealthDisclaimer: false,
    dataProcessing: false,
    crisisProtocol: false
  });

  const handleAcceptanceChange = (key: keyof typeof acceptances, value: boolean) => {
    setAcceptances(prev => ({ ...prev, [key]: value }));
    
    // Update global consent state
    const allAccepted = Object.values({ ...acceptances, [key]: value }).every(Boolean);
    updatePreferences({ consentGiven: allAccepted });
  };

  const allAccepted = Object.values(acceptances).every(Boolean);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Scroll className="w-8 h-8 text-white" />
        </div>
        <h1 id="onboarding-title" className="text-3xl font-bold text-gray-900 mb-3">
          Important Information
        </h1>
        <p id="onboarding-description" className="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed">
          Before we begin, please review and accept these important terms to ensure your safety and privacy.
        </p>
      </motion.div>

      {/* Consent Sections */}
      <div className="space-y-6">
        
        {/* Privacy Policy */}
        <motion.div
          className="border-2 border-gray-200 rounded-xl p-6 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Policy</h3>
              <div className="text-gray-800 space-y-2 text-sm mb-4">
                <p>• Your personal information is encrypted and stored securely</p>
                <p>• We never share your data with third parties without consent</p>
                <p>• You can delete your data at any time</p>
                <p>• Anonymous usage statistics help improve our platform</p>
              </div>
              <a 
                href="/privacy" 
                target="_blank"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Read full Privacy Policy
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.privacyPolicy}
                    onChange={(e) => handleAcceptanceChange('privacyPolicy', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">I accept the Privacy Policy</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms of Service */}
        <motion.div
          className="border-2 border-gray-200 rounded-xl p-6 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h3>
              <div className="text-gray-800 space-y-2 text-sm mb-4">
                <p>• Platform is for mental health support and education</p>
                <p>• Users must be 13+ years old (under 18 needs guardian consent)</p>
                <p>• Respectful community interaction is required</p>
                <p>• Platform availability may vary for maintenance</p>
              </div>
              <a 
                href="/terms" 
                target="_blank"
                className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Read full Terms of Service
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.termsOfService}
                    onChange={(e) => handleAcceptanceChange('termsOfService', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-900 font-medium">I accept the Terms of Service</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mental Health Disclaimer */}
        <motion.div
          className="border-2 border-red-200 rounded-xl p-6 bg-red-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Mental Health Disclaimer</h3>
              <div className="text-red-800 space-y-2 text-sm mb-4">
                <p><strong>• This platform does NOT replace professional mental health care</strong></p>
                <p>• In crisis situations, call 988 or your local emergency services</p>
                <p>• AI therapy is supportive, not diagnostic or prescriptive</p>
                <p>• Always consult licensed professionals for serious mental health concerns</p>
              </div>
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.mentalHealthDisclaimer}
                    onChange={(e) => handleAcceptanceChange('mentalHealthDisclaimer', e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-red-900 font-medium">I understand this platform supplements but does not replace professional care</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Processing */}
        <motion.div
          className="border-2 border-gray-200 rounded-xl p-6 bg-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Processing & AI</h3>
              <div className="text-gray-800 space-y-2 text-sm mb-4">
                <p>• Your interactions help improve AI therapy responses</p>
                <p>• All data is anonymized before analysis</p>
                <p>• You can opt out of data sharing at any time</p>
                <p>• AI conversations are encrypted and secure</p>
              </div>
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.dataProcessing}
                    onChange={(e) => handleAcceptanceChange('dataProcessing', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-900 font-medium">I consent to secure data processing for platform improvement</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crisis Protocol */}
        <motion.div
          className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Crisis Safety Protocol</h3>
              <div className="text-orange-800 space-y-2 text-sm mb-4">
                <p>• Crisis support is available 24/7 through multiple channels</p>
                <p>• The platform may detect crisis situations and offer immediate help</p>
                <p>• Emergency services may be contacted if imminent danger is detected</p>
                <p>• Your safety always takes priority over privacy in crisis situations</p>
              </div>
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.crisisProtocol}
                    onChange={(e) => handleAcceptanceChange('crisisProtocol', e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-orange-900 font-medium">I understand the crisis safety protocol</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Acceptance Summary */}
      <motion.div
        className={`mt-8 p-6 rounded-xl border-2 transition-all duration-300 ${
          allAccepted 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-200 bg-gray-50'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className={`rounded-full p-3 ${allAccepted ? 'bg-green-100' : 'bg-gray-100'}`}>
            {allAccepted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <UserCheck className="w-6 h-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {allAccepted ? 'Ready to Begin!' : 'Please Accept All Terms'}
            </h3>
            <p className="text-gray-800">
              {allAccepted 
                ? 'Thank you for reviewing our terms. You can now proceed to personalize your experience.'
                : 'Please review and accept all sections above to continue using ASTRAL CORE.'
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Age Verification */}
      <motion.div
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-sm text-blue-800 text-center">
          <strong>Age Verification:</strong> By proceeding, you confirm that you are 13+ years old. 
          If you are under 18, please ensure you have guardian permission to use this platform.
        </p>
      </motion.div>
    </div>
  );
}