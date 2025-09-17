/**
 * ASTRAL_CORE 2.0 Mobile Home Screen
 *
 * THE FIRST SCREEN PEOPLE IN CRISIS SEE
 * This screen must immediately convey safety, accessibility, and hope.
 * Every element is designed to reduce barriers to getting help.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, AccessibilityInfo, } from 'react-native';
const { width, height } = Dimensions.get('window');
const HomeScreen = ({ navigation }) => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    useEffect(() => {
        // Check accessibility settings
        AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
        // Listen for accessibility changes
        const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled);
        return () => subscription?.remove();
    }, []);
    const handleGetHelp = () => {
        navigation.navigate('Crisis', { emergencyMode: false });
    };
    const handleEmergency = () => {
        setEmergencyMode(true);
        Alert.alert('🆘 EMERGENCY MODE', 'You will be connected to a crisis specialist immediately. This is confidential and free.', [
            {
                text: 'Continue',
                onPress: () => navigation.navigate('Emergency', {
                    crisisLevel: 'critical'
                }),
                style: 'default',
            },
            {
                text: 'Call 988 Instead',
                onPress: () => {
                    // In a real app, this would initiate a phone call
                    Alert.alert('Calling 988...', 'Crisis hotline');
                },
                style: 'cancel',
            },
        ], { cancelable: false });
    };
    const handleVolunteerPortal = () => {
        navigation.navigate('Volunteer', { mode: 'register' });
    };
    return (<ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          You Are Not Alone
        </Text>
        <Text style={styles.heroSubtitle}>
          Free, confidential crisis support available 24/7
        </Text>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionSection}>
        {/* Primary Help Button */}
        <TouchableOpacity style={[styles.primaryButton, styles.helpButton]} onPress={handleGetHelp} accessibilityRole="button" accessibilityLabel="Get immediate crisis help - free, anonymous, available 24/7" accessibilityHint="Connects you with a trained crisis volunteer">
          <Text style={styles.primaryButtonIcon}>💙</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.primaryButtonText}>I Need Help Right Now</Text>
            <Text style={styles.buttonSubtext}>Anonymous • Encrypted • Free</Text>
          </View>
        </TouchableOpacity>

        {/* Emergency Button */}
        <TouchableOpacity style={[styles.primaryButton, styles.emergencyButton]} onPress={handleEmergency} accessibilityRole="button" accessibilityLabel="EMERGENCY: Get immediate crisis help - this is a mental health emergency" accessibilityHint="Activates emergency crisis intervention protocol">
          <Text style={styles.emergencyButtonIcon}>🆘</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.emergencyButtonText}>Emergency Help</Text>
            <Text style={styles.emergencySubtext}>Immediate Response • &lt; 30 seconds</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Access Section */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Crisis', { sessionId: 'anonymous' })} accessibilityRole="button" accessibilityLabel="Start anonymous chat">
            <Text style={styles.quickAccessIcon}>💬</Text>
            <Text style={styles.quickAccessText}>Anonymous Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={handleVolunteerPortal} accessibilityRole="button" accessibilityLabel="Volunteer to help others">
            <Text style={styles.quickAccessIcon}>🤝</Text>
            <Text style={styles.quickAccessText}>Become Volunteer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Settings')} accessibilityRole="button" accessibilityLabel="App settings and preferences">
            <Text style={styles.quickAccessIcon}>⚙️</Text>
            <Text style={styles.quickAccessText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Resources */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Emergency Resources</Text>
        <Text style={styles.resourcesText}>
          If you're in immediate danger, don't wait:
        </Text>
        
        <View style={styles.emergencyLinks}>
          <TouchableOpacity style={styles.emergencyLink} onPress={() => Alert.alert('Calling 988...', 'Crisis Lifeline')} accessibilityRole="button" accessibilityLabel="Call 988 Crisis Lifeline">
            <Text style={styles.emergencyLinkText}>📞 Call 988</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.emergencyLink} onPress={() => Alert.alert('Texting 741741...', 'Crisis Text Line')} accessibilityRole="button" accessibilityLabel="Text 741741 Crisis Text Line">
            <Text style={styles.emergencyLinkText}>💬 Text 741741</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.emergencyLink} onPress={() => Alert.alert('Calling 911...', 'Emergency Services')} accessibilityRole="button" accessibilityLabel="Call 911 Emergency Services">
            <Text style={styles.emergencyLinkText}>🚨 Call 911</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacySection}>
        <Text style={styles.privacyText}>
          🔒 Your privacy is protected with end-to-end encryption. 
          All conversations are confidential and HIPAA compliant.
        </Text>
      </View>
    </ScrollView>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 40,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    actionSection: {
        marginBottom: 40,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        minHeight: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    helpButton: {
        backgroundColor: '#2563eb',
    },
    emergencyButton: {
        backgroundColor: '#dc2626',
    },
    primaryButtonIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    emergencyButtonIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    buttonTextContainer: {
        flex: 1,
    },
    primaryButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    emergencyButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    buttonSubtext: {
        fontSize: 14,
        color: '#e5e7eb',
    },
    emergencySubtext: {
        fontSize: 14,
        color: '#fecaca',
        fontWeight: '600',
    },
    quickAccessSection: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAccessButton: {
        width: (width - 60) / 3,
        aspectRatio: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    quickAccessIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    quickAccessText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    resourcesSection: {
        marginBottom: 40,
    },
    resourcesText: {
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '600',
        marginBottom: 16,
    },
    emergencyLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emergencyLink: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        minWidth: (width - 60) / 3,
        alignItems: 'center',
    },
    emergencyLinkText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
    },
    privacySection: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    privacyText: {
        fontSize: 14,
        color: '#166534',
        textAlign: 'center',
        lineHeight: 20,
    },
});
export default HomeScreen;
//# sourceMappingURL=HomeScreen.jsx.map