/**
 * ASTRAL_CORE 2.0 Mobile App
 *
 * Mental Health Crisis Intervention Mobile Application
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
// Import screens
import CrisisScreen from './src/screens/CrisisScreen';
import ChatScreen from './src/screens/ChatScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import VolunteerScreen from './src/screens/VolunteerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
// Import services
import CrisisService from './src/services/CrisisService';
import NotificationService from './src/services/NotificationService';
import OfflineService from './src/services/OfflineService';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// Main Tab Navigator for the app
function MainTabs() {
    return (<Tab.Navigator screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#DC2626', // Red for crisis attention
            tabBarInactiveTintColor: '#6B7280',
            headerStyle: styles.header,
            headerTintColor: '#FFFFFF',
            headerTitleStyle: styles.headerTitle,
        }}>
      <Tab.Screen name="Crisis" component={CrisisScreen} options={{
            title: '🆘 Crisis Help',
            headerStyle: [styles.header, styles.crisisHeader],
        }}/>
      <Tab.Screen name="Chat" component={ChatScreen} options={{
            title: '💬 Support Chat',
        }}/>
      <Tab.Screen name="Resources" component={ResourcesScreen} options={{
            title: '📚 Resources',
        }}/>
      <Tab.Screen name="Volunteer" component={VolunteerScreen} options={{
            title: '🤝 Volunteer',
        }}/>
      <Tab.Screen name="Settings" component={SettingsScreen} options={{
            title: '⚙️ Settings',
        }}/>
    </Tab.Navigator>);
}
export default function App() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initializationError, setInitializationError] = useState(null);
    useEffect(() => {
        initializeApp();
    }, []);
    const initializeApp = async () => {
        try {
            console.log('🚀 Initializing ASTRAL_CORE Mobile App...');
            // Initialize core services
            await Promise.all([
                CrisisService.initialize(),
                NotificationService.getInstance().initialize(),
                OfflineService.getInstance().initialize(),
            ]);
            // Enable background processing for crisis situations
            CrisisService.enableBackgroundMode();
            console.log('✅ App initialization complete');
            setIsInitialized(true);
        }
        catch (error) {
            console.error('❌ App initialization failed:', error);
            setInitializationError(error instanceof Error ? error.message : 'Unknown error');
            // Show error to user
            Alert.alert('Initialization Error', 'The app failed to initialize properly. Some features may not work correctly.', [{ text: 'OK' }]);
        }
    };
    // Show loading screen while initializing
    if (!isInitialized) {
        return (<SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" translucent={false}/>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>ASTRAL CORE</Text>
          <Text style={styles.loadingSubtitle}>Mental Health Crisis Support</Text>
          <Text style={styles.loadingText}>
            {initializationError ? '❌ Error loading app' : '🔄 Initializing...'}
          </Text>
          {initializationError && (<Text style={styles.errorText}>{initializationError}</Text>)}
        </View>
      </SafeAreaView>);
    }
    return (<SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" translucent={false}/>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
        }}>
          <Stack.Screen name="MainTabs" component={MainTabs}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#DC2626',
    },
    loadingTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    loadingSubtitle: {
        fontSize: 16,
        color: '#FCA5A5',
        marginBottom: 40,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#FCA5A5',
        textAlign: 'center',
        marginTop: 10,
    },
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        height: Platform.OS === 'ios' ? 90 : 70,
    },
    header: {
        backgroundColor: '#DC2626',
    },
    crisisHeader: {
        backgroundColor: '#B91C1C', // Darker red for crisis header
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
//# sourceMappingURL=App.jsx.map