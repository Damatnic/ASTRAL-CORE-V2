/**
 * ASTRAL_CORE 2.0 Settings Screen
 * 
 * Privacy controls, security settings, biometric locks, and user preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';

interface SettingsSection {
  title: string;
  icon: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  type: 'toggle' | 'button' | 'navigation' | 'info';
  value?: boolean;
  description?: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  disabled?: boolean;
}

interface UserPreferences {
  biometricLock: boolean;
  notifications: boolean;
  emergencyContacts: boolean;
  dataSharing: boolean;
  crashReports: boolean;
  anonymousMode: boolean;
  offlineMode: boolean;
  darkMode: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

const defaultPreferences: UserPreferences = {
  biometricLock: false,
  notifications: true,
  emergencyContacts: true,
  dataSharing: false,
  crashReports: true,
  anonymousMode: false,
  offlineMode: true,
  darkMode: false,
  soundEffects: true,
  hapticFeedback: true,
};

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadUserPreferences();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // In real implementation, check with react-native-biometrics
      setBiometricAvailable(Platform.OS === 'ios' || Platform.OS === 'android');
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      // In real implementation, load from secure storage
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      // In real implementation, save to secure storage
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleToggle = (key: keyof UserPreferences) => (value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      Alert.alert('Biometric Authentication', 'Biometric authentication is not available on this device');
      return;
    }

    if (enabled) {
      Alert.alert(
        'Enable Biometric Lock',
        'This will require biometric authentication to access the app',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => handleToggle('biometricLock')(true),
          },
        ]
      );
    } else {
      handleToggle('biometricLock')(false);
    }
  };

  const handleEmergencyContactsSetup = () => {
    Alert.alert(
      'Emergency Contacts',
      'Set up emergency contacts for crisis situations',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Setup', onPress: () => console.log('Navigate to emergency contacts setup') },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Export your crisis session data and preferences',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export data') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Forever', style: 'destructive', onPress: () => console.log('Delete account') },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    console.log('Navigate to privacy policy');
  };

  const handleTermsOfService = () => {
    console.log('Navigate to terms of service');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Get help with technical issues or crisis support questions',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email Support', onPress: () => console.log('Open email support') },
        { text: 'Live Chat', onPress: () => console.log('Open live chat') },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Security & Privacy',
      icon: '🔒',
      items: [
        {
          id: 'biometric',
          label: 'Biometric Lock',
          type: 'toggle',
          value: preferences.biometricLock,
          description: 'Require biometric authentication to open app',
          onToggle: handleBiometricToggle,
          disabled: !biometricAvailable,
        },
        {
          id: 'anonymous',
          label: 'Anonymous Mode',
          type: 'toggle',
          value: preferences.anonymousMode,
          description: 'Hide personal information during crisis sessions',
          onToggle: handleToggle('anonymousMode'),
        },
        {
          id: 'data_sharing',
          label: 'Data Sharing',
          type: 'toggle',
          value: preferences.dataSharing,
          description: 'Share anonymous usage data to improve services',
          onToggle: handleToggle('dataSharing'),
        },
        {
          id: 'emergency_contacts',
          label: 'Emergency Contacts',
          type: 'button',
          description: 'Manage emergency contacts for crisis situations',
          onPress: handleEmergencyContactsSetup,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: '🔔',
      items: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          type: 'toggle',
          value: preferences.notifications,
          description: 'Receive notifications for crisis alerts and updates',
          onToggle: handleToggle('notifications'),
        },
        {
          id: 'emergency_alerts',
          label: 'Emergency Alerts',
          type: 'toggle',
          value: preferences.emergencyContacts,
          description: 'Allow emergency notifications even when in Do Not Disturb',
          onToggle: handleToggle('emergencyContacts'),
        },
      ],
    },
    {
      title: 'App Preferences',
      icon: '⚙️',
      items: [
        {
          id: 'offline_mode',
          label: 'Offline Mode',
          type: 'toggle',
          value: preferences.offlineMode,
          description: 'Store crisis resources for offline access',
          onToggle: handleToggle('offlineMode'),
        },
        {
          id: 'dark_mode',
          label: 'Dark Mode',
          type: 'toggle',
          value: preferences.darkMode,
          description: 'Use dark theme for better visibility in low light',
          onToggle: handleToggle('darkMode'),
        },
        {
          id: 'sound_effects',
          label: 'Sound Effects',
          type: 'toggle',
          value: preferences.soundEffects,
          description: 'Play sounds for app interactions',
          onToggle: handleToggle('soundEffects'),
        },
        {
          id: 'haptic_feedback',
          label: 'Haptic Feedback',
          type: 'toggle',
          value: preferences.hapticFeedback,
          description: 'Vibrate for button presses and alerts',
          onToggle: handleToggle('hapticFeedback'),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: '💾',
      items: [
        {
          id: 'crash_reports',
          label: 'Crash Reports',
          type: 'toggle',
          value: preferences.crashReports,
          description: 'Send crash reports to help improve app stability',
          onToggle: handleToggle('crashReports'),
        },
        {
          id: 'export_data',
          label: 'Export My Data',
          type: 'button',
          description: 'Download a copy of your data',
          onPress: handleDataExport,
        },
        {
          id: 'delete_account',
          label: 'Delete Account',
          type: 'button',
          description: 'Permanently delete your account and all data',
          onPress: handleDeleteAccount,
          danger: true,
        },
      ],
    },
    {
      title: 'About & Support',
      icon: 'ℹ️',
      items: [
        {
          id: 'version',
          label: 'App Version',
          type: 'info',
          description: '2.0.0 (Build 1)',
        },
        {
          id: 'privacy_policy',
          label: 'Privacy Policy',
          type: 'navigation',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms_of_service',
          label: 'Terms of Service',
          type: 'navigation',
          onPress: handleTermsOfService,
        },
        {
          id: 'contact_support',
          label: 'Contact Support',
          type: 'button',
          description: 'Get help with the app or crisis support',
          onPress: handleContactSupport,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const itemStyle = [
      styles.settingItem,
      item.danger && styles.dangerItem,
      item.disabled && styles.disabledItem,
    ];

    return (
      <View key={item.id} style={itemStyle}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingLabel, item.danger && styles.dangerText]}>
            {item.label}
          </Text>
          {item.description && (
            <Text style={styles.settingDescription}>{item.description}</Text>
          )}
        </View>

        <View style={styles.settingControl}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value || false}
              onValueChange={item.onToggle}
              disabled={item.disabled}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
            />
          )}
          
          {(item.type === 'button' || item.type === 'navigation') && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                item.danger && styles.dangerButton,
                item.disabled && styles.disabledButton,
              ]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <Text style={[
                styles.actionButtonText,
                item.danger && styles.dangerButtonText,
              ]}>
                {item.type === 'navigation' ? 'View' : 'Manage'}
              </Text>
            </TouchableOpacity>
          )}
          
          {item.type === 'info' && (
            <Text style={styles.infoText}>v2.0.0</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSection = (section: SettingsSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>
        {section.icon} {section.title}
      </Text>
      
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your privacy, security, and app preferences
        </Text>
      </View>

      {settingsSections.map(renderSection)}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ASTRAL_CORE 2.0 - Mental Health Crisis Intervention Platform
        </Text>
        <Text style={styles.footerSubtext}>
          Free forever • Privacy-first • HIPAA-compliant
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerItem: {
    backgroundColor: '#FEF2F2',
  },
  dangerText: {
    color: '#DC2626',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});