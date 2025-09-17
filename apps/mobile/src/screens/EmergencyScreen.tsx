/**
 * ASTRAL_CORE 2.0 Mobile Emergency Screen
 * 
 * HIGHEST PRIORITY SCREEN - LIFE OR DEATH
 * This screen handles the most critical crisis situations.
 * Must work flawlessly under extreme stress.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProps } from '../types/navigation';

const EmergencyScreen: React.FC<NavigationProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🆘 EMERGENCY MODE</Text>
      <Text style={styles.subtitle}>Crisis specialist being connected immediately</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#991b1b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#fecaca',
    textAlign: 'center',
  },
});

export default EmergencyScreen;