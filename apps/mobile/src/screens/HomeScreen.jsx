/**
 * ASTRAL_CORE 2.0 Mobile Home Screen
 *
 * THE FIRST SCREEN PEOPLE IN CRISIS SEE
 * This screen must immediately convey safety, accessibility, and hope.
 * Every element is designed to reduce barriers to getting help.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, AccessibilityInfo, Platform, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
// Import custom components
import EmergencySOSButton from '../components/EmergencySOSButton';
import ResponsiveLayout, { useResponsive, ResponsiveGrid } from '../components/ResponsiveLayout';
// Import services
import BiometricAuthService from '../services/BiometricAuthService';
import OfflineStorageService from '../services/OfflineStorageService';
import PushNotificationService from '../services/PushNotificationService';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HomeScreen = ({ navigation }) => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [userName, setUserName] = useState('');
    const [lastCheckIn, setLastCheckIn] = useState(null);
    const { deviceType, isTablet } = useResponsive();
    useEffect(() => {
        initializeScreen();
    }, []);
    const initializeScreen = async () => {
        // Check accessibility settings
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);
        // Listen for accessibility changes
        const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled);
        // Load user preferences
        const offlineService = OfflineStorageService.getInstance();
        const preferences = await offlineService.getUserPreferences();
        setUserName(preferences.name || '');
        // Check last check-in time
        const sessions = await offlineService.getSessions();
        if (sessions.length > 0) {
            setLastCheckIn(new Date(sessions[sessions.length - 1].startTime));
        }
        // Initialize biometric auth if needed
        const biometricService = BiometricAuthService.getInstance();
        await biometricService.loadLastAuthTime();
        return () => subscription?.remove();
    };
    const handleEmergencyActivated = async (location) => {
        setEmergencyMode(true);
        // Send emergency notification
        const notificationService = PushNotificationService.getInstance();
        await notificationService.sendEmergencyNotification('Emergency SOS activated. Help is on the way.', location);
        // Navigate to emergency screen
        navigation.navigate('Emergency', {
            location,
            timestamp: new Date().toISOString(),
        });
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };
    const handleQuickAction = async (action) => {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Check if authentication is required
        if (action.requiresAuth) {
            const biometricService = BiometricAuthService.getInstance();
            const authResult = await biometricService.authenticate();
            if (!authResult.success) {
                Alert.alert('Authentication Required', 'Please authenticate to access this feature.', [{ text: 'OK' }]);
                return;
            }
        }
        action.action();
    };
    const quickActions = [
        {
            id: 'crisis_support',
            title: 'Crisis Support',
            subtitle: 'Get immediate help',
            icon: 'heart',
            color: '#DC2626',
            action: () => navigation.navigate('Crisis'),
        },
        {
            id: 'chat',
            title: 'Chat with Someone',
            subtitle: 'Connect with a volunteer',
            icon: 'chatbubbles',
            color: '#2563EB',
            action: () => navigation.navigate('Chat'),
        },
        {
            id: 'breathing',
            title: 'Breathing Exercise',
            subtitle: 'Calm your mind',
            icon: 'leaf',
            color: '#10B981',
            action: () => navigation.navigate('Resources', { category: 'breathing' }),
        },
        {
            id: 'journal',
            title: 'Quick Journal',
            subtitle: 'Express your feelings',
            icon: 'book',
            color: '#8B5CF6',
            action: () => navigation.navigate('Resources', { category: 'journal' }),
            requiresAuth: true,
        },
        {
            id: 'safety_plan',
            title: 'Safety Plan',
            subtitle: 'Your crisis plan',
            icon: 'shield-checkmark',
            color: '#F59E0B',
            action: () => navigation.navigate('Resources', { category: 'safety_plan' }),
            requiresAuth: true,
        },
        {
            id: 'resources',
            title: 'Resources',
            subtitle: 'Self-help tools',
            icon: 'library',
            color: '#6B7280',
            action: () => navigation.navigate('Resources'),
        },
    ];
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'Good morning';
        if (hour < 18)
            return 'Good afternoon';
        return 'Good evening';
    };
    const getMotivationalMessage = () => {
        const messages = [
            "You're not alone in this journey",
            "Every step forward counts",
            "Your feelings are valid",
            "It's okay to ask for help",
            "You are stronger than you know",
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };
    return (<ResponsiveLayout backgroundColor="#F9FAFB" header={<LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}{userName ? `, ${userName}` : ''}
              </Text>
              <Text style={styles.motivational}>
                {getMotivationalMessage()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton} accessibilityLabel="Settings" accessibilityRole="button">
              <Ionicons name="settings-outline" size={24} color="#FFFFFF"/>
            </TouchableOpacity>
          </View>
        </LinearGradient>}>
      {/* Emergency Button - Always Visible */}
      <View style={styles.emergencyContainer}>
        <EmergencySOSButton onEmergencyActivated={handleEmergencyActivated} size={isTablet ? 'large' : 'medium'}/>
        <Text style={styles.emergencyText}>
          Hold for 3 seconds in case of emergency
        </Text>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How can we help today?</Text>
        <ResponsiveGrid columns={isTablet ? 3 : 2} gap={16}>
          {quickActions.map((action) => (<TouchableOpacity key={action.id} style={[styles.actionCard, { borderLeftColor: action.color }]} onPress={() => handleQuickAction(action)} accessibilityLabel={`${action.title}. ${action.subtitle}`} accessibilityRole="button" accessibilityHint={`Tap to ${action.subtitle.toLowerCase()}`}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={28} color={action.color}/>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              {action.requiresAuth && (<Ionicons name="lock-closed" size={12} color="#9CA3AF" style={styles.lockIcon}/>)}
            </TouchableOpacity>))}
        </ResponsiveGrid>
      </View>

      {/* Recent Activity */}
      {lastCheckIn && (<View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981"/>
            <View style={styles.progressContent}>
              <Text style={styles.progressText}>
                Last check-in: {lastCheckIn.toLocaleDateString()}
              </Text>
              <Text style={styles.progressSubtext}>
                Keep up the great work!
              </Text>
            </View>
          </View>
        </View>)}

      {/* Crisis Resources Footer */}
      <View style={styles.crisisFooter}>
        <Text style={styles.crisisTitle}>24/7 Crisis Support</Text>
        <Text style={styles.crisisNumber}>Call 988</Text>
        <Text style={styles.crisisText}>or text "HELLO" to 741741</Text>
      </View>
    </ResponsiveLayout>);
};
const styles = StyleSheet.create({
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    motivational: {
        fontSize: 16,
        color: '#FCA5A5',
    },
    settingsButton: {
        padding: 8,
    },
    emergencyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emergencyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    lockIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    progressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressContent: {
        marginLeft: 12,
        flex: 1,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    progressSubtext: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    crisisFooter: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    crisisTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: 8,
    },
    crisisNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 4,
    },
    crisisText: {
        fontSize: 14,
        color: '#991B1B',
    },
});
export default HomeScreen;
//# sourceMappingURL=HomeScreen.jsx.map