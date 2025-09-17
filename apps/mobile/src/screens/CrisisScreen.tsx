/**
 * ASTRAL_CORE 2.0 Crisis Screen
 * 
 * Emergency crisis intervention interface
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';

import CrisisService from '../services/CrisisService';
import OfflineService, { EmergencyContact, CrisisTip } from '../services/OfflineService';
import NotificationService from '../services/NotificationService';

export default function CrisisScreen() {
  const [isInCrisis, setIsInCrisis] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [criticalTips, setCriticalTips] = useState<CrisisTip[]>([]);

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    const offlineService = OfflineService.getInstance();
    setEmergencyContacts(offlineService.getEmergencyContacts());
    setCriticalTips(offlineService.getCriticalTips());
  };

  const handleStartCrisisSession = async () => {
    try {
      Alert.alert(
        'Crisis Session',
        'How severe is your current situation?',
        [
          {
            text: 'Mild',
            onPress: () => startSession('mild'),
          },
          {
            text: 'Moderate',
            onPress: () => startSession('moderate'),
          },
          {
            text: 'Severe',
            onPress: () => startSession('severe'),
          },
          {
            text: 'Life Threatening',
            onPress: () => startSession('critical'),
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to start crisis session:', error);
      Alert.alert('Error', 'Failed to start crisis session. Please try calling emergency services directly.');
    }
  };

  const startSession = async (severity: 'mild' | 'moderate' | 'severe' | 'critical') => {
    try {
      setIsInCrisis(true);
      
      const session = await CrisisService.startCrisisSession(severity);
      
      // Send emergency notification
      await NotificationService.getInstance().sendEmergencyAlert(
        `Crisis session started with ${severity} severity`
      );

      if (severity === 'critical') {
        Alert.alert(
          'Emergency Services',
          'For life-threatening situations, please call emergency services immediately.',
          [
            {
              text: 'Call 911',
              onPress: () => Linking.openURL('tel:911'),
              style: 'destructive',
            },
            {
              text: 'Continue with Support',
              onPress: () => {},
            },
          ]
        );
      }
    } catch (error) {
      setIsInCrisis(false);
      console.error('Failed to start crisis session:', error);
    }
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    const phoneUrl = `tel:${contact.phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleEndCrisisSession = () => {
    Alert.alert(
      'End Crisis Session',
      'Are you feeling safer now?',
      [
        {
          text: 'Yes, I feel better',
          onPress: () => {
            setIsInCrisis(false);
            // TODO: End session with CrisisService
          },
        },
        {
          text: 'No, I still need help',
          onPress: () => {},
        },
      ]
    );
  };

  const renderEmergencyContacts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚨 Emergency Contacts</Text>
      {emergencyContacts.map((contact) => (
        <TouchableOpacity
          key={contact.id}
          style={[
            styles.contactButton,
            contact.isPrimary && styles.primaryContactButton,
          ]}
          onPress={() => handleEmergencyCall(contact)}
        >
          <Text style={[
            styles.contactName,
            contact.isPrimary && styles.primaryContactName,
          ]}>
            {contact.name}
          </Text>
          <Text style={[
            styles.contactInfo,
            contact.isPrimary && styles.primaryContactInfo,
          ]}>
            {contact.phone} • {contact.relationship}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCriticalTips = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💡 Immediate Help</Text>
      {criticalTips.map((tip) => (
        <View key={tip.id} style={styles.tipCard}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipContent}>{tip.content}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!isInCrisis ? (
        <>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>You Are Not Alone</Text>
            <Text style={styles.heroSubtitle}>
              We're here to help you through this difficult time.
            </Text>
            
            <TouchableOpacity
              style={styles.crisisButton}
              onPress={handleStartCrisisSession}
            >
              <Text style={styles.crisisButtonText}>🆘 I Need Help Now</Text>
            </TouchableOpacity>
          </View>

          {renderEmergencyContacts()}
          {renderCriticalTips()}
        </>
      ) : (
        <View style={styles.activeCrisisContainer}>
          <Text style={styles.activeCrisisTitle}>Crisis Session Active</Text>
          <Text style={styles.activeCrisisText}>
            You are currently in a crisis support session. Help is on the way.
          </Text>
          
          <TouchableOpacity
            style={styles.escalateButton}
            onPress={() => CrisisService.escalateToEmergency()}
          >
            <Text style={styles.escalateButtonText}>🚨 Escalate to Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endSessionButton}
            onPress={handleEndCrisisSession}
          >
            <Text style={styles.endSessionButtonText}>✅ I Feel Safer Now</Text>
          </TouchableOpacity>

          {renderEmergencyContacts()}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  crisisButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  crisisButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryContactButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  primaryContactName: {
    color: '#DC2626',
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  primaryContactInfo: {
    color: '#991B1B',
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  tipContent: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  activeCrisisContainer: {
    backgroundColor: '#FEF2F2',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    marginBottom: 20,
  },
  activeCrisisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  activeCrisisText: {
    fontSize: 16,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  escalateButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  escalateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endSessionButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  endSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});