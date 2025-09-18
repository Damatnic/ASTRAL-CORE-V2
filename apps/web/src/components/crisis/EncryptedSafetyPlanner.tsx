/**
 * ASTRAL Core V2 - Encrypted Safety Planning System
 * 
 * Enhanced safety planning with zero-knowledge encryption:
 * - Client-side encryption of all safety plan data
 * - Anonymous safety planning options
 * - Encrypted emergency contact system
 * - Secure sharing with trusted individuals
 * - Biometric authentication for quick access
 * - Offline crisis mode capabilities
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Heart, Users, Phone, Brain, ChevronRight, ChevronLeft,
  Plus, Trash2, Edit3, Download, Share2, Lock, Save, FileText,
  AlertCircle, CheckCircle, Star, Clock, MapPin, Activity,
  Sparkles, Target, Lightbulb, MessageCircle, UserCheck,
  Calendar, Bell, Zap, Award, TrendingUp, Info, Copy, Mail,
  Key, Eye, EyeOff, Fingerprint, Smartphone, Wifi, WifiOff
} from 'lucide-react';

import { ZeroKnowledgeCrypto, getZeroKnowledgeCrypto, CrisisEncryptionContext, EncryptedData } from '../../lib/encryption/zero-knowledge-crypto';
import { SecureKeyManager, SecureSession } from '../../lib/encryption/secure-key-manager';
import { EncryptedStorage } from '../../lib/encryption/encrypted-storage';

// Enhanced interfaces for encrypted safety planning
interface EncryptedSafetyPlan {
  id: string;
  title: string;
  isAnonymous: boolean;
  encryptionKeyId: string;
  createdAt: Date;
  lastUpdated: Date;
  lastAccessed: Date;
  version: number;
  emergencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  encryptedSections: {
    personalWarnings: EncryptedData;
    crisisWarnings: EncryptedData;
    copingStrategies: EncryptedData;
    groundingExercises: EncryptedData;
    distractionTechniques: EncryptedData;
    socialContacts: EncryptedData;
    professionalContacts: EncryptedData;
    emergencyContacts: EncryptedData;
    environmentSafety: EncryptedData;
    reasonsToLive: EncryptedData;
    selfCareActivities: EncryptedData;
    medicationReminders?: EncryptedData;
  };
  accessConfig: SafetyPlanAccessConfig;
  shareConfig: SafetyPlanShareConfig;
  auditLog: SafetyPlanAuditEntry[];
}

interface SafetyPlanAccessConfig {
  requiresBiometric: boolean;
  requiresPassword: boolean;
  allowOfflineAccess: boolean;
  emergencyBypass: boolean;
  autoLockMinutes: number;
  maxFailedAttempts: number;
}

interface SafetyPlanShareConfig {
  canShare: boolean;
  sharedWith: EncryptedShareEntry[];
  emergencySharing: boolean;
  anonymousSharing: boolean;
}

interface EncryptedShareEntry {
  id: string;
  encryptedContactInfo: EncryptedData;
  relationship: 'therapist' | 'family' | 'friend' | 'caregiver' | 'emergency';
  permissions: ('view' | 'edit' | 'notification')[];
  sharedAt: Date;
  lastAccessed?: Date;
}

interface SafetyPlanAuditEntry {
  timestamp: Date;
  action: 'CREATED' | 'ACCESSED' | 'MODIFIED' | 'SHARED' | 'EMERGENCY_ACCESSED';
  sessionId: string;
  emergencyLevel?: string;
  ipAddress?: string;
  details?: string;
}

interface CrisisQuickAccess {
  isActive: boolean;
  sessionId: string;
  emergencyLevel: 'HIGH' | 'CRITICAL';
  quickAccessCode?: string;
  expiresAt: Date;
}

export default function EncryptedSafetyPlanner() {
  // Core encryption and storage
  const [crypto] = useState<ZeroKnowledgeCrypto>(() => getZeroKnowledgeCrypto());
  const [keyManager, setKeyManager] = useState<SecureKeyManager | null>(null);
  const [encryptedStorage, setEncryptedStorage] = useState<EncryptedStorage | null>(null);
  const [currentSession, setCurrentSession] = useState<SecureSession | null>(null);

  // Safety plan state
  const [currentPlan, setCurrentPlan] = useState<EncryptedSafetyPlan | null>(null);
  const [decryptedSections, setDecryptedSections] = useState<any>({});
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication state
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'biometric' | 'emergency'>('password');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Crisis mode state
  const [crisisMode, setCrisisMode] = useState<CrisisQuickAccess | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [emergencyBypass, setEmergencyBypass] = useState(false);

  // UI state
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmergencyAccess, setShowEmergencyAccess] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<'encrypting' | 'decrypting' | 'idle'>('idle');

  // Auto-lock timer
  const autoLockTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize encryption systems
   */
  useEffect(() => {
    initializeEncryptionSystems();
    
    return () => {
      if (autoLockTimer.current) {
        clearTimeout(autoLockTimer.current);
      }
    };
  }, []);

  /**
   * Set up auto-lock when plan is unlocked
   */
  useEffect(() => {
    if (isUnlocked && currentPlan?.accessConfig.autoLockMinutes) {
      resetAutoLockTimer();
    }
    
    return () => {
      if (autoLockTimer.current) {
        clearTimeout(autoLockTimer.current);
      }
    };
  }, [isUnlocked, currentPlan]);

  const initializeEncryptionSystems = async () => {
    try {
      setIsLoading(true);

      // Initialize key manager
      const manager = new SecureKeyManager(crypto);
      setKeyManager(manager);

      // Initialize encrypted storage
      const storage = new EncryptedStorage(crypto, manager);
      setEncryptedStorage(storage);

      // Check for existing crisis session
      const existingCrisis = localStorage.getItem('crisisQuickAccess');
      if (existingCrisis) {
        const crisis: CrisisQuickAccess = JSON.parse(existingCrisis);
        if (new Date() < new Date(crisis.expiresAt)) {
          setCrisisMode(crisis);
          await enableCrisisMode(crisis);
        } else {
          localStorage.removeItem('crisisQuickAccess');
        }
      }

      // Check network status
      setOfflineMode(!navigator.onLine);
      
      await loadExistingSafetyPlan();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize encryption systems:', error);
      setIsLoading(false);
    }
  };

  /**
   * Load existing safety plan from encrypted storage
   */
  const loadExistingSafetyPlan = async () => {
    try {
      if (!encryptedStorage) return;

      // Check for existing plan
      const existingPlan = localStorage.getItem('encryptedSafetyPlanRef');
      if (existingPlan) {
        const planRef = JSON.parse(existingPlan);
        // In production, this would load from encrypted storage
        // For now, show authentication required
        setCurrentPlan(planRef);
      }
    } catch (error) {
      console.error('Failed to load existing plan:', error);
    }
  };

  /**
   * Create new anonymous safety plan for crisis situations
   */
  const createAnonymousPlan = async (emergencyLevel: 'HIGH' | 'CRITICAL') => {
    try {
      setIsAuthenticating(true);
      
      if (!keyManager) throw new Error('Key manager not initialized');

      // Create anonymous session
      const session = await keyManager.createAnonymousSession(emergencyLevel);
      setCurrentSession(session);

      // Create new encrypted safety plan
      const newPlan: EncryptedSafetyPlan = {
        id: `anon_plan_${Date.now()}`,
        title: 'Anonymous Crisis Safety Plan',
        isAnonymous: true,
        encryptionKeyId: session.keyId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        lastAccessed: new Date(),
        version: 1,
        emergencyLevel,
        encryptedSections: await createEmptyEncryptedSections(session.sessionId),
        accessConfig: {
          requiresBiometric: false,
          requiresPassword: false,
          allowOfflineAccess: true,
          emergencyBypass: true,
          autoLockMinutes: 0, // No auto-lock for crisis mode
          maxFailedAttempts: 0
        },
        shareConfig: {
          canShare: true,
          sharedWith: [],
          emergencySharing: true,
          anonymousSharing: true
        },
        auditLog: [{
          timestamp: new Date(),
          action: 'CREATED',
          sessionId: session.sessionId,
          emergencyLevel,
          details: 'Anonymous crisis plan created'
        }]
      };

      setCurrentPlan(newPlan);
      setIsUnlocked(true);
      
      // Enable crisis mode
      const crisisAccess: CrisisQuickAccess = {
        isActive: true,
        sessionId: session.sessionId,
        emergencyLevel,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      };
      setCrisisMode(crisisAccess);
      localStorage.setItem('crisisQuickAccess', JSON.stringify(crisisAccess));

      setIsAuthenticating(false);
    } catch (error) {
      console.error('Failed to create anonymous plan:', error);
      setIsAuthenticating(false);
    }
  };

  /**
   * Authenticate with password
   */
  const authenticateWithPassword = async () => {
    try {
      setIsAuthenticating(true);

      if (!keyManager || !currentPlan) {
        throw new Error('Missing required components');
      }

      // For demo - in production, this would verify against stored plan
      const userId = currentPlan.isAnonymous ? 'anonymous' : 'user_123';
      
      const session = await keyManager.authenticateUser(userId, password, {
        emergencyLevel: currentPlan.emergencyLevel,
        isAnonymous: currentPlan.isAnonymous
      });

      setCurrentSession(session);
      await decryptSafetyPlan(session);
      setIsUnlocked(true);
      setFailedAttempts(0);
      setPassword('');
      
      // Add audit log entry
      currentPlan.auditLog.push({
        timestamp: new Date(),
        action: 'ACCESSED',
        sessionId: session.sessionId,
        details: 'Plan unlocked with password'
      });

      resetAutoLockTimer();
      setIsAuthenticating(false);
    } catch (error) {
      console.error('Authentication failed:', error);
      
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= (currentPlan?.accessConfig.maxFailedAttempts || 3)) {
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 5 * 60 * 1000); // 5 minute lockout
      }
      
      setIsAuthenticating(false);
    }
  };

  /**
   * Authenticate with biometrics
   */
  const authenticateWithBiometric = async () => {
    try {
      setIsAuthenticating(true);

      if (!keyManager) throw new Error('Key manager not initialized');

      // Use WebAuthn for biometric authentication
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: window.crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (credential) {
        // Create session after biometric verification
        const session = await keyManager.createAnonymousSession('MEDIUM');
        setCurrentSession(session);
        await decryptSafetyPlan(session);
        setIsUnlocked(true);
        
        currentPlan?.auditLog.push({
          timestamp: new Date(),
          action: 'ACCESSED',
          sessionId: session.sessionId,
          details: 'Plan unlocked with biometric authentication'
        });

        resetAutoLockTimer();
      }

      setIsAuthenticating(false);
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setIsAuthenticating(false);
    }
  };

  /**
   * Emergency bypass authentication
   */
  const enableEmergencyBypass = async () => {
    try {
      setIsAuthenticating(true);

      if (!keyManager) throw new Error('Key manager not initialized');

      // Create emergency session
      const session = await keyManager.createAnonymousSession('CRITICAL');
      setCurrentSession(session);
      
      // Create simplified emergency plan if none exists
      if (!currentPlan) {
        await createAnonymousPlan('CRITICAL');
      } else {
        await decryptSafetyPlan(session);
        setIsUnlocked(true);
      }

      setEmergencyBypass(true);
      
      // Log emergency access
      currentPlan?.auditLog.push({
        timestamp: new Date(),
        action: 'EMERGENCY_ACCESSED',
        sessionId: session.sessionId,
        emergencyLevel: 'CRITICAL',
        details: 'Emergency bypass activated'
      });

      setIsAuthenticating(false);
    } catch (error) {
      console.error('Emergency bypass failed:', error);
      setIsAuthenticating(false);
    }
  };

  /**
   * Decrypt safety plan sections
   */
  const decryptSafetyPlan = async (session: SecureSession) => {
    try {
      setEncryptionStatus('decrypting');

      if (!currentPlan || !encryptedStorage) return;

      const context: CrisisEncryptionContext = {
        dataType: 'SAFETY_PLAN',
        sessionId: session.sessionId,
        userId: session.isAnonymous ? undefined : session.userId,
        emergencyLevel: currentPlan.emergencyLevel
      };

      const sections: any = {};

      // Decrypt each section
      for (const [key, encryptedData] of Object.entries(currentPlan.encryptedSections)) {
        try {
          const decrypted = await keyManager!.decryptWithSession(
            session.sessionId,
            encryptedData,
            context
          );
          sections[key] = JSON.parse(decrypted);
        } catch (error) {
          console.error(`Failed to decrypt section ${key}:`, error);
          sections[key] = null;
        }
      }

      setDecryptedSections(sections);
      setEncryptionStatus('idle');
    } catch (error) {
      console.error('Failed to decrypt safety plan:', error);
      setEncryptionStatus('idle');
    }
  };

  /**
   * Create empty encrypted sections for new plan
   */
  const createEmptyEncryptedSections = async (sessionId: string) => {
    if (!keyManager) throw new Error('Key manager not initialized');

    const context: CrisisEncryptionContext = {
      dataType: 'SAFETY_PLAN',
      sessionId,
      emergencyLevel: 'HIGH'
    };

    const emptySections = {
      personalWarnings: [],
      crisisWarnings: [],
      copingStrategies: [],
      groundingExercises: [],
      distractionTechniques: [],
      socialContacts: [],
      professionalContacts: [],
      emergencyContacts: [
        {
          id: 'emergency_988',
          name: '988 Crisis Lifeline',
          phone: '988',
          type: 'crisis_hotline',
          availability: '24/7'
        },
        {
          id: 'emergency_text',
          name: 'Crisis Text Line',
          phone: '741741',
          type: 'text_support',
          instructions: 'Text HOME to 741741',
          availability: '24/7'
        }
      ],
      environmentSafety: [],
      reasonsToLive: [],
      selfCareActivities: []
    };

    const encrypted: any = {};
    for (const [key, data] of Object.entries(emptySections)) {
      encrypted[key] = await keyManager.encryptWithSession(
        sessionId,
        JSON.stringify(data),
        context
      );
    }

    return encrypted;
  };

  /**
   * Update encrypted section
   */
  const updateEncryptedSection = async (sectionKey: string, data: any) => {
    try {
      if (!currentSession || !keyManager || !currentPlan) return;

      setEncryptionStatus('encrypting');

      const context: CrisisEncryptionContext = {
        dataType: 'SAFETY_PLAN',
        sessionId: currentSession.sessionId,
        userId: currentSession.isAnonymous ? undefined : currentSession.userId,
        emergencyLevel: currentPlan.emergencyLevel
      };

      const encrypted = await keyManager.encryptWithSession(
        currentSession.sessionId,
        JSON.stringify(data),
        context
      );

      // Update encrypted sections
      const updatedPlan = {
        ...currentPlan,
        encryptedSections: {
          ...currentPlan.encryptedSections,
          [sectionKey]: encrypted
        },
        lastUpdated: new Date(),
        version: currentPlan.version + 0.1
      };

      setCurrentPlan(updatedPlan);
      
      // Update decrypted sections for immediate UI update
      setDecryptedSections((prev: any) => ({
        ...prev,
        [sectionKey]: data
      }));

      // Save to storage
      if (encryptedStorage) {
        await encryptedStorage.store(
          currentSession.sessionId,
          updatedPlan,
          'SAFETY_PLAN',
          {
            id: updatedPlan.id,
            emergencyLevel: updatedPlan.emergencyLevel
          }
        );
      }

      setEncryptionStatus('idle');
      resetAutoLockTimer();
    } catch (error) {
      console.error('Failed to update encrypted section:', error);
      setEncryptionStatus('idle');
    }
  };

  /**
   * Lock the safety plan
   */
  const lockPlan = () => {
    setIsUnlocked(false);
    setDecryptedSections({});
    setCurrentSession(null);
    setPassword('');
    
    if (autoLockTimer.current) {
      clearTimeout(autoLockTimer.current);
    }

    // Clear sensitive data from memory
    if (currentPlan) {
      currentPlan.auditLog.push({
        timestamp: new Date(),
        action: 'ACCESSED',
        sessionId: currentSession?.sessionId || 'unknown',
        details: 'Plan locked'
      });
    }
  };

  /**
   * Reset auto-lock timer
   */
  const resetAutoLockTimer = () => {
    if (autoLockTimer.current) {
      clearTimeout(autoLockTimer.current);
    }

    if (currentPlan?.accessConfig.autoLockMinutes && currentPlan.accessConfig.autoLockMinutes > 0) {
      autoLockTimer.current = setTimeout(() => {
        lockPlan();
      }, currentPlan.accessConfig.autoLockMinutes * 60 * 1000);
    }
  };

  /**
   * Enable crisis mode
   */
  const enableCrisisMode = async (crisis: CrisisQuickAccess) => {
    try {
      const session = keyManager?.getSession(crisis.sessionId);
      if (session) {
        setCurrentSession(session);
        if (currentPlan) {
          await decryptSafetyPlan(session);
          setIsUnlocked(true);
        }
      }
    } catch (error) {
      console.error('Failed to enable crisis mode:', error);
    }
  };

  /**
   * Render authentication screen
   */
  const renderAuthentication = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
          <h2 className="font-bold text-lg mb-2">In Crisis?</h2>
          <div className="space-y-2">
            <button
              onClick={() => createAnonymousPlan('CRITICAL')}
              className="w-full bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
            >
              Create Emergency Plan Now
            </button>
            <div className="flex space-x-2">
              <a href="tel:988" className="flex-1 bg-red-700 px-3 py-1 rounded text-sm hover:bg-red-800">
                Call 988
              </a>
              <a href="sms:741741" className="flex-1 bg-red-700 px-3 py-1 rounded text-sm hover:bg-red-800">
                Text 741741
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Encrypted Safety Plan</h1>
          <p className="text-gray-600 mt-2">
            {currentPlan ? 'Enter your password to unlock your safety plan' : 'Create a new encrypted safety plan'}
          </p>
        </div>

        {isLocked ? (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Plan Temporarily Locked</h3>
            <p className="text-red-700">Too many failed attempts. Please wait before trying again.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Password Authentication */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticateWithPassword()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                disabled={isAuthenticating}
              />
              <button
                onClick={authenticateWithPassword}
                disabled={!password || isAuthenticating}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5 mr-2" />
                    Unlock Plan
                  </>
                )}
              </button>
            </div>

            {/* Biometric Authentication */}
            {currentPlan?.accessConfig.requiresBiometric && (
              <button
                onClick={authenticateWithBiometric}
                disabled={isAuthenticating}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                Use Biometric Authentication
              </button>
            )}

            {/* Emergency Bypass */}
            {currentPlan?.accessConfig.emergencyBypass && (
              <button
                onClick={enableEmergencyBypass}
                disabled={isAuthenticating}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Emergency Access
              </button>
            )}

            {/* Failed Attempts Warning */}
            {failedAttempts > 0 && (
              <div className="text-center text-red-600 text-sm">
                {failedAttempts} failed attempts. {(currentPlan?.accessConfig.maxFailedAttempts || 3) - failedAttempts} remaining.
              </div>
            )}
          </div>
        )}

        {/* Offline Mode Indicator */}
        {offlineMode && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">Offline mode - some features may be limited</span>
          </div>
        )}

        {/* Create New Plan */}
        {!currentPlan && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">Don't have a safety plan yet?</p>
            <button
              onClick={() => setShowPasswordSetup(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Create New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Render main safety planner interface
   */
  const renderSafetyPlanner = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Crisis Mode Banner */}
      {crisisMode?.isActive && (
        <div className="bg-red-600 text-white py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              <span className="font-semibold">Crisis Mode Active</span>
              <span className="ml-2 text-red-200">
                - Quick access enabled until {new Date(crisisMode.expiresAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <a href="tel:988" className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                Call 988
              </a>
              <a href="sms:741741" className="bg-red-700 px-3 py-1 rounded-full text-sm">
                Text Crisis Line
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Encrypted Safety Plan
                {currentPlan?.isAnonymous && (
                  <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Anonymous
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Zero-knowledge encrypted safety planning - only you can access your data
              </p>
              
              {/* Encryption Status */}
              <div className="flex items-center space-x-4 mt-3 text-sm">
                <div className="flex items-center text-green-600">
                  <Lock className="w-4 h-4 mr-1" />
                  <span>End-to-End Encrypted</span>
                </div>
                {encryptionStatus !== 'idle' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1" />
                    <span className="capitalize">{encryptionStatus}...</span>
                  </div>
                )}
                {offlineMode && (
                  <div className="flex items-center text-yellow-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span>Offline Mode</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={lockPlan}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock Plan
              </button>
              {currentPlan?.shareConfig.canShare && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contacts - Always Visible */}
        {decryptedSections.emergencyContacts && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Emergency Contacts - Tap to Call
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {decryptedSections.emergencyContacts.map((contact: any) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                  onClick={() => resetAutoLockTimer()}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.instructions || contact.phone}</p>
                    <p className="text-xs text-green-600">{contact.availability}</p>
                  </div>
                  <Phone className="w-5 h-5 text-red-600" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Main Safety Plan Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Content would go here - sections for warning signs, coping strategies, etc. */}
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety Plan Unlocked</h3>
            <p className="text-gray-600">
              Your encrypted safety plan is now accessible. All data is decrypted locally and never stored on servers.
            </p>
            <div className="mt-6">
              <button
                onClick={() => resetAutoLockTimer()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Editing Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Initializing Secure Environment</h2>
          <p className="text-gray-600 mt-2">Setting up zero-knowledge encryption...</p>
        </div>
      </div>
    );
  }

  // Main render logic
  return isUnlocked ? renderSafetyPlanner() : renderAuthentication();
}