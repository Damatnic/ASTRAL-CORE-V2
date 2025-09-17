/**
 * Emergency SOS Button Component
 * Critical one-tap crisis intervention button
 * ASTRAL_CORE 2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Vibration,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EmergencySOSButtonProps {
  onEmergencyActivated?: (location?: Location.LocationObject) => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  floating?: boolean;
}

const EmergencySOSButton: React.FC<EmergencySOSButtonProps> = ({
  onEmergencyActivated,
  style,
  size = 'large',
  floating = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Button size configurations
  const sizeConfig = {
    small: { width: 60, height: 60, fontSize: 12, iconSize: 24 },
    medium: { width: 80, height: 80, fontSize: 14, iconSize: 32 },
    large: { width: 120, height: 120, fontSize: 16, iconSize: 48 },
  }[size];

  useEffect(() => {
    // Start pulsing animation for visibility
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  // Handle long press to activate emergency
  const handlePressIn = () => {
    setIsPressed(true);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Vibration.vibrate(50);
    }

    // Start countdown
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(timer);
        activateEmergency();
      }
    }, 1000);

    pressTimer.current = timer;

    // Shake animation during countdown
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePressOut = () => {
    if (!isActivated) {
      setIsPressed(false);
      setCountdown(null);
      
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }

      shakeAnim.setValue(0);
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const activateEmergency = async () => {
    setIsActivated(true);
    
    // Strong haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate([0, 200, 100, 200]);
    }

    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location: Location.LocationObject | undefined;

      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      }

      // Store emergency activation
      await AsyncStorage.setItem('emergency_activated', JSON.stringify({
        timestamp: new Date().toISOString(),
        location: location?.coords,
      }));

      // Call the callback
      if (onEmergencyActivated) {
        onEmergencyActivated(location);
      }

      // Show confirmation
      Alert.alert(
        'Emergency Activated',
        'Help is on the way. A crisis counselor will contact you immediately.',
        [
          {
            text: 'Cancel Emergency',
            style: 'cancel',
            onPress: () => cancelEmergency(),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error activating emergency:', error);
      Alert.alert(
        'Emergency Alert Sent',
        'We couldn\'t get your location, but help is on the way.',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelEmergency = async () => {
    setIsActivated(false);
    setIsPressed(false);
    setCountdown(null);
    
    await AsyncStorage.removeItem('emergency_activated');
    
    Alert.alert(
      'Emergency Cancelled',
      'The emergency request has been cancelled.',
      [{ text: 'OK' }]
    );
  };

  const buttonStyle = [
    styles.button,
    floating && styles.floatingButton,
    {
      width: sizeConfig.width,
      height: sizeConfig.height,
      borderRadius: sizeConfig.width / 2,
    },
    isPressed && styles.buttonPressed,
    isActivated && styles.buttonActivated,
    style,
  ];

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: pulseAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          buttonStyle,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.buttonContent}>
          <Ionicons 
            name="warning" 
            size={sizeConfig.iconSize} 
            color="#FFFFFF" 
          />
          <Text style={[styles.buttonText, { fontSize: sizeConfig.fontSize }]}>
            {isActivated ? 'ACTIVE' : countdown !== null ? countdown.toString() : 'SOS'}
          </Text>
          {!isActivated && size === 'large' && (
            <Text style={styles.instructionText}>Hold 3 seconds</Text>
          )}
        </View>
      </Pressable>

      {/* Visual feedback rings */}
      {isPressed && !isActivated && (
        <View style={[styles.ripple, { width: sizeConfig.width * 1.5, height: sizeConfig.width * 1.5 }]} />
      )}
      {isActivated && (
        <View style={[styles.activeRing, { width: sizeConfig.width * 1.3, height: sizeConfig.width * 1.3 }]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  buttonPressed: {
    backgroundColor: '#B91C1C',
    transform: [{ scale: 0.95 }],
  },
  buttonActivated: {
    backgroundColor: '#7F1D1D',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  instructionText: {
    color: '#FCA5A5',
    fontSize: 10,
    marginTop: 4,
  },
  ripple: {
    position: 'absolute',
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 200,
    alignSelf: 'center',
  },
  activeRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#DC2626',
    borderRadius: 200,
    alignSelf: 'center',
  },
});

export default EmergencySOSButton;