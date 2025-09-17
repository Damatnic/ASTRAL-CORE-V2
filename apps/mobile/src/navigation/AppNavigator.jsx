/**
 * App Navigator with Enhanced Crisis Features
 * ASTRAL_CORE 2.0 Mobile Navigation
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
// Import screens
import HomeScreen from '../screens/HomeScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import CrisisScreen from '../screens/CrisisScreen';
import ChatScreen from '../screens/ChatScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import VolunteerScreen from '../screens/VolunteerScreen';
import SettingsScreen from '../screens/SettingsScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// Deep linking configuration
const prefix = Linking.createURL('/');
const linking = {
    prefixes: [prefix, 'astralcore://'],
    config: {
        screens: {
            MainTabs: {
                screens: {
                    Home: 'home',
                    Crisis: 'crisis',
                    Chat: 'chat/:volunteerId?',
                    Resources: 'resources',
                    Volunteer: 'volunteer',
                    Settings: 'settings',
                },
            },
            Emergency: 'emergency',
            CrisisSession: 'crisis-session/:sessionId',
            ChatSession: 'chat-session/:volunteerId',
            ResourceDetail: 'resource/:resourceId',
        },
    },
};
// Tab Navigator
function MainTabs() {
    return (<Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName = 'home';
                switch (route.name) {
                    case 'Home':
                        iconName = focused ? 'home' : 'home-outline';
                        break;
                    case 'Crisis':
                        iconName = 'warning';
                        color = '#DC2626'; // Always red for crisis
                        break;
                    case 'Chat':
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                        break;
                    case 'Resources':
                        iconName = focused ? 'book' : 'book-outline';
                        break;
                    case 'Volunteer':
                        iconName = focused ? 'people' : 'people-outline';
                        break;
                    case 'Settings':
                        iconName = focused ? 'settings' : 'settings-outline';
                        break;
                }
                return <Ionicons name={iconName} size={size} color={color}/>;
            },
            tabBarActiveTintColor: '#DC2626',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
                paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                paddingTop: 10,
                height: Platform.OS === 'ios' ? 90 : 70,
            },
            headerStyle: {
                backgroundColor: route.name === 'Crisis' ? '#B91C1C' : '#DC2626',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{
            title: 'Home',
            headerTitle: 'ASTRAL CORE',
        }}/>
      <Tab.Screen name="Crisis" component={CrisisScreen} options={{
            title: 'Crisis Help',
            headerTitle: 'CRISIS SUPPORT',
            tabBarBadge: undefined, // Can be used for alerts
        }}/>
      <Tab.Screen name="Chat" component={ChatScreen} options={{
            title: 'Support Chat',
            headerTitle: 'Support Chat',
        }}/>
      <Tab.Screen name="Resources" component={ResourcesScreen} options={{
            title: 'Resources',
            headerTitle: 'Crisis Resources',
        }}/>
      <Tab.Screen name="Volunteer" component={VolunteerScreen} options={{
            title: 'Volunteer',
            headerTitle: 'Volunteer Support',
        }}/>
      <Tab.Screen name="Settings" component={SettingsScreen} options={{
            title: 'Settings',
            headerTitle: 'Settings',
        }}/>
    </Tab.Navigator>);
}
// Main App Navigator
export default function AppNavigator() {
    return (<NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
        }}>
        <Stack.Screen name="MainTabs" component={MainTabs}/>
        <Stack.Screen name="Emergency" component={EmergencyScreen} options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#991B1B' },
            headerTintColor: '#FFFFFF',
            headerTitle: 'EMERGENCY',
            presentation: 'modal',
        }}/>
      </Stack.Navigator>
    </NavigationContainer>);
}
//# sourceMappingURL=AppNavigator.jsx.map